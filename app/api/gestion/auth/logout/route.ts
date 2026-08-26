import {NextResponse} from "next/server";
import {cookies} from "next/headers";
import {deleteAdminSession,sessionCookieName} from "@/lib/admin-auth";
import {absoluteUrl} from "@/lib/site";
export async function POST(){const store=await cookies();const token=store.get(sessionCookieName)?.value;if(token)await deleteAdminSession(token);const response=NextResponse.redirect(absoluteUrl("/gestion/connexion"),303);response.cookies.delete(sessionCookieName);return response}
