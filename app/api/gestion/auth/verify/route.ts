import {NextResponse} from "next/server";
import {exchangeMagicLink,sessionCookieName} from "@/lib/admin-auth";
import {absoluteUrl,safeSiteOrigin} from "@/lib/site";
export const dynamic="force-dynamic";
export async function GET(request:Request){const token=new URL(request.url).searchParams.get("token")||"";const session=token?await exchangeMagicLink(token):null;const origin=safeSiteOrigin(request.url);if(!session)return NextResponse.redirect(absoluteUrl("/gestion/connexion?erreur=lien",origin));const response=NextResponse.redirect(absoluteUrl("/gestion",origin));response.cookies.set(sessionCookieName,session,{httpOnly:true,secure:true,sameSite:"lax",path:"/",maxAge:60*60*24*30});return response}
