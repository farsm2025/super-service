import {createHash,randomBytes} from "node:crypto";
import {cookies} from "next/headers";
import {database} from "./db";

export const sessionCookieName="super_service_admin_session";
const adminEmail=(process.env.ADMIN_EMAIL||process.env.EMAIL_TO||"info@super-service.ch").toLowerCase();
const hash=(value:string)=>createHash("sha256").update(value).digest("hex");

export function createSecret(){return randomBytes(32).toString("base64url")}

export async function createMagicLink(){
  const token=createSecret();
  const sql=database();
  await sql`DELETE FROM admin_magic_links WHERE expires_at<now() OR used_at IS NOT NULL`;
  await sql`INSERT INTO admin_magic_links (email,token_hash,expires_at) VALUES (${adminEmail},${hash(token)},now()+interval '15 minutes')`;
  return token;
}

export async function exchangeMagicLink(token:string){
  const sql=database();
  const rows=await sql`SELECT id,email FROM admin_magic_links WHERE token_hash=${hash(token)} AND used_at IS NULL AND expires_at>now() LIMIT 1`;
  if(!rows[0])return null;
  await sql`UPDATE admin_magic_links SET used_at=now() WHERE id=${rows[0].id}`;
  const sessionToken=createSecret();
  await sql`INSERT INTO admin_sessions (email,token_hash,expires_at) VALUES (${String(rows[0].email)},${hash(sessionToken)},now()+interval '30 days')`;
  return sessionToken;
}

export async function getAdminSession(){
  const store=await cookies();
  const token=store.get(sessionCookieName)?.value;
  if(!token)return null;
  const sql=database();
  const rows=await sql`SELECT id,email,expires_at FROM admin_sessions WHERE token_hash=${hash(token)} AND expires_at>now() LIMIT 1`;
  if(!rows[0])return null;
  return {id:String(rows[0].id),email:String(rows[0].email)};
}

export async function deleteAdminSession(token:string){
  const sql=database();
  await sql`DELETE FROM admin_sessions WHERE token_hash=${hash(token)}`;
}
