import {createHmac,timingSafeEqual} from "node:crypto";
function signature(id:string){
  const key=process.env.STRIPE_LINK_SECRET;
  if(!key || key.length<32)throw new Error("STRIPE_LINK_SECRET must have at least 32 characters");
  return createHmac("sha256",key).update(`super-service-order:${id}`).digest("base64url");
}
export function orderToken(id:string){return `${id}.${signature(id)}`;}
export function verifyOrderToken(token:string){
  const match=token.match(/^([0-9a-f-]{36})\.([A-Za-z0-9_-]{43})$/i);
  if(!match)return null;
  const expected=Buffer.from(signature(match[1])),actual=Buffer.from(match[2]);
  return expected.length===actual.length && timingSafeEqual(expected,actual)?match[1]:null;
}
