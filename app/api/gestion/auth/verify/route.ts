import {NextResponse} from "next/server";
import {exchangeMagicLink,sessionCookieName} from "@/lib/admin-auth";
import {absoluteUrl,safeSiteOrigin} from "@/lib/site";
export const dynamic="force-dynamic";
export async function GET(request:Request){const url=new URL(request.url);const token=url.searchParams.get("token")||"";const requestedId=url.searchParams.get("demande")||"";const appointmentId=/^[0-9a-f-]{36}$/i.test(requestedId)?requestedId:undefined;const session=token?await exchangeMagicLink(token):null;const origin=safeSiteOrigin(request.url);if(!session)return NextResponse.redirect(absoluteUrl(`/gestion/connexion?erreur=lien${appointmentId?`&demande=${appointmentId}`:""}`,origin));const response=NextResponse.redirect(absoluteUrl(`/gestion${appointmentId?`?demande=${appointmentId}`:""}`,origin));response.cookies.set(sessionCookieName,session,{httpOnly:true,secure:true,sameSite:"lax",path:"/",maxAge:60*60*24*30});return response}
