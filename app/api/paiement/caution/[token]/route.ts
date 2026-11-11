import {NextResponse} from "next/server";
import {customerDeposit,depositView,prepareDepositIntent,refreshDeposit,syncDeposit} from "@/lib/deposits";
import {stripeTestEnabled} from "@/lib/stripe-config";
export const dynamic="force-dynamic";
const headers={"Cache-Control":"no-store","Referrer-Policy":"no-referrer"};
type Context={params:Promise<{token:string}>};
export async function GET(_:Request,{params}:Context) {
  if(!stripeTestEnabled()) return NextResponse.json({error:"Indisponible"},{status:404,headers});
  try {const {token}=await params;const row=await customerDeposit(token);if(!row)return NextResponse.json({error:"Lien invalide"},{status:404,headers});return NextResponse.json({deposit:depositView(await refreshDeposit(row))},{headers});}
  catch {return NextResponse.json({error:"Statut indisponible"},{status:503,headers});}
}
export async function POST(request:Request,{params}:Context) {
  if(!stripeTestEnabled()) return NextResponse.json({error:"Indisponible"},{status:404,headers});
  if(request.headers.get("origin")!==new URL(request.url).origin)return NextResponse.json({error:"Origine refusée"},{status:403,headers});
  try {const {token}=await params;const row=await customerDeposit(token);if(!row)return NextResponse.json({error:"Lien invalide"},{status:404,headers});const intent=await prepareDepositIntent(row);await syncDeposit(intent);return NextResponse.json({clientSecret:["requires_payment_method","requires_confirmation","requires_action"].includes(intent.status)?intent.client_secret:null,deposit:depositView(await refreshDeposit(row))},{headers});}
  catch {return NextResponse.json({error:"Lien expiré ou caution indisponible. Contactez Super Service."},{status:409,headers});}
}
