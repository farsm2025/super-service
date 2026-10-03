import {NextResponse} from "next/server";
import {getAdminSession} from "@/lib/admin-auth";
import {getAppointment} from "@/lib/appointments";
import {stripeTestEnabled} from "@/lib/stripe-config";
import {actOnDeposit,createDeposit,depositLink,depositView,findAppointmentDeposit,refreshDeposit} from "@/lib/deposits";
export const dynamic="force-dynamic";
const headers={"Cache-Control":"no-store"};
type Context={params:Promise<{id:string}>};
export async function GET(_:Request,{params}:Context) {
  if (!stripeTestEnabled()) return NextResponse.json({enabled:false},{headers});
  if (!await getAdminSession()) return NextResponse.json({error:"Non autorisé"},{status:401,headers});
  try {const {id}=await params;const row=await findAppointmentDeposit(id);const fresh=row?await refreshDeposit(row):null;return NextResponse.json({enabled:true,deposit:fresh?depositView(fresh):null,link:fresh?depositLink(fresh):null},{headers});}
  catch {return NextResponse.json({error:"Configuration Stripe test ou base de test indisponible."},{status:503,headers});}
}
export async function POST(request:Request,{params}:Context) {
  if (!stripeTestEnabled()) return NextResponse.json({error:"Paiements de test désactivés."},{status:404,headers});
  // Cookie authentication plus strict same-origin protection for financial actions.
  if (request.headers.get("origin")!==new URL(request.url).origin) return NextResponse.json({error:"Origine refusée"},{status:403,headers});
  if (!await getAdminSession()) return NextResponse.json({error:"Non autorisé"},{status:401,headers});
  try {
    const {id}=await params;const {action,confirmed}=await request.json();
    if (!["create","capture","release"].includes(action)) return NextResponse.json({error:"Action invalide"},{status:400,headers});
    let row=await findAppointmentDeposit(id);
    if (action==="create") {
      const appointment=await getAppointment(id);
      if (!appointment || ["cancelled","rejected","completed"].includes(appointment.status)) return NextResponse.json({error:"Rendez-vous indisponible."},{status:409,headers});
      row=await createDeposit(id);
    } else {
      if (!row) return NextResponse.json({error:"Caution introuvable"},{status:404,headers});
      if (action==="capture" && confirmed!==true) return NextResponse.json({error:"Confirmation requise"},{status:400,headers});
      row=await actOnDeposit(row,action);
    }
    return NextResponse.json({deposit:depositView(row),link:depositLink(row)},{headers});
  } catch {return NextResponse.json({error:"Action impossible. Actualisez le statut avant de réessayer la même action."},{status:409,headers});}
}
