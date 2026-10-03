import {NextResponse} from "next/server";
import {stripeTestEnabled} from "@/lib/stripe-config";
import {verifyOrderToken} from "@/lib/order-token";
import {findOrder,orderView,refreshCartonOrder} from "@/lib/carton-orders";
export const dynamic="force-dynamic";
export async function GET(_:Request,{params}:{params:Promise<{token:string}>}){
  const headers={"Cache-Control":"no-store","Referrer-Policy":"no-referrer"};
  if(!stripeTestEnabled())return NextResponse.json({error:"Désactivé"},{status:404,headers});
  try {const {token}=await params;const id=verifyOrderToken(token),order=id?await findOrder(id):null;
    if(!order)return NextResponse.json({error:"Commande introuvable"},{status:404,headers});
    return NextResponse.json(orderView(await refreshCartonOrder(order)),{headers});
  }catch{return NextResponse.json({error:"Statut temporairement indisponible"},{status:503,headers});}
}
