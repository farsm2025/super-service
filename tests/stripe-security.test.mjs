import test from "node:test";
import assert from "node:assert/strict";
import {mkdtemp,readFile,writeFile,rm} from "node:fs/promises";
import {resolve} from "node:path";
import ts from "typescript";

const dir=await mkdtemp(resolve(".stripe-test-"));
async function compile(name){const text=await readFile(`lib/${name}.ts`,"utf8");const output=ts.transpileModule(text,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;const file=resolve(dir,`${name}.mjs`);await writeFile(file,output);return import(file);}
const tokens=await compile("deposit-token");const config=await compile("stripe-config");
const checkout=await compile("carton-session");
const cart=await compile("carton-catalog");
const orderTokens=await compile("order-token");
const keys=["STRIPE_PAYMENTS_ENABLED","VERCEL_ENV","STRIPE_SECRET_KEY","STRIPE_DATABASE_URL","DATABASE_URL","STRIPE_LINK_SECRET","STRIPE_APP_URL"];
const old=Object.fromEntries(keys.map(key=>[key,process.env[key]]));
test.after(async()=>{for(const key of keys){if(old[key]===undefined)delete process.env[key];else process.env[key]=old[key];}await rm(dir,{recursive:true,force:true});});

test("a payment link cannot be forged or reused for a different payment",()=>{
  process.env.STRIPE_LINK_SECRET="a".repeat(64);
  const id="12345678-1234-1234-1234-123456789abc";
  const token=tokens.depositToken(id);
  assert.equal(tokens.verifyDepositToken(token),id);
  assert.equal(tokens.verifyDepositToken(token.replace(id,"22345678-1234-1234-1234-123456789abc")),null);
  assert.equal(tokens.verifyDepositToken(token.slice(0,-1)+"!"),null);
  assert.equal(tokens.verifyDepositToken("invalid"),null);
  process.env.STRIPE_LINK_SECRET="b".repeat(64);
  assert.equal(tokens.verifyDepositToken(token),null);
  delete process.env.STRIPE_LINK_SECRET;
  assert.throws(()=>tokens.depositToken(id),/STRIPE_LINK_SECRET/);
});
test("live keys and production are refused even with the feature enabled",()=>{
  process.env.STRIPE_PAYMENTS_ENABLED="true";
  process.env.VERCEL_ENV="production";
  process.env.STRIPE_SECRET_KEY="sk_test_dummy";
  assert.throws(()=>config.stripeClient(),/disabled/);
  process.env.VERCEL_ENV="preview";
  process.env.STRIPE_SECRET_KEY="sk_live_dummy";
  assert.throws(()=>config.stripeClient(),/test secret/);
  process.env.STRIPE_SECRET_KEY="sk_test_dummy";
  assert.ok(config.stripeClient());
  process.env.STRIPE_PAYMENTS_ENABLED="false";
  assert.throws(()=>config.stripeClient(),/disabled/);
});
test("test writes never fall back to the existing calendar database",()=>{
  process.env.STRIPE_PAYMENTS_ENABLED="true";process.env.VERCEL_ENV="preview";process.env.STRIPE_SECRET_KEY="sk_test_dummy";
  process.env.DATABASE_URL="postgresql://calendar.invalid/db";delete process.env.STRIPE_DATABASE_URL;
  assert.throws(()=>config.paymentDatabase(),/STRIPE_DATABASE_URL/);
});
test("payment links require an explicit secure origin",()=>{
  delete process.env.STRIPE_APP_URL;assert.throws(()=>config.paymentOrigin(),/STRIPE_APP_URL/);
  process.env.STRIPE_APP_URL="http://untrusted.example";assert.throws(()=>config.paymentOrigin(),/Invalid payment origin/);
  process.env.STRIPE_APP_URL="https://preview.example/somewhere";assert.equal(config.paymentOrigin(),"https://preview.example");
  process.env.STRIPE_APP_URL="http://localhost:3000";assert.equal(config.paymentOrigin(),"http://localhost:3000");
});

test("cart prices are calculated from the server catalog and malformed quantities are refused",()=>{
  assert.equal(cart.cartAmount(cart.validateCart({standard:2,grand:3})),3050);
  assert.equal(cart.cartAmount(cart.validateCart({standard:99,grand:99})),116820);
  for(const value of [null,[],{}, {standard:0,grand:0},{standard:-1,grand:1},{standard:1.5,grand:1},{standard:100,grand:0},{standard:"2",grand:1},{standard:1,grand:1,price:1}])assert.throws(()=>cart.validateCart(value));
});
test("order links cannot be substituted for deposit links",()=>{
  process.env.STRIPE_LINK_SECRET="c".repeat(64);
  const id="12345678-1234-1234-1234-123456789abc";
  assert.equal(orderTokens.verifyOrderToken(orderTokens.orderToken(id)),id);
  assert.equal(orderTokens.verifyOrderToken(tokens.depositToken(id)),null);
  assert.equal(tokens.verifyDepositToken(orderTokens.orderToken(id)),null);
});

test("Checkout confirmation rejects live sessions, wrong orders, currencies, amounts and session replacements",()=>{
  const order={id:"order-a",amount:3050,stripe_session_id:"cs_test_a"};
  const session={id:"cs_test_a",livemode:false,mode:"payment",metadata:{application:"super-service",kind:"cartons",order_id:"order-a"},currency:"chf",amount_total:3050,payment_status:"paid",status:"complete"};
  assert.doesNotThrow(()=>checkout.verifyCartonSession(session,order));
  for(const change of [{livemode:true},{mode:"subscription"},{currency:"eur"},{amount_total:1},{id:"cs_test_b"},{status:"open"},{metadata:{...session.metadata,order_id:"order-b"}},{metadata:{...session.metadata,kind:"truck_deposit"}}])assert.throws(()=>checkout.verifyCartonSession({...session,...change},order));
});
