import {NextResponse} from "next/server";
import {stripeTestEnabled} from "@/lib/stripe-config";
import {createCartonCheckout} from "@/lib/carton-orders";
export const dynamic="force-dynamic";
export async function POST(request:Request){
  const headers={"Cache-Control":"no-store"};
  if(!stripeTestEnabled())return NextResponse.json({error:"Désactivé"},{status:404,headers});
  if(request.headers.get("origin")!==new URL(request.url).origin)return NextResponse.json({error:"Origine refusée"},{status:403,headers});
  try {
    const body=await request.text();if(body.length>2048)return NextResponse.json({error:"Panier invalide"},{status:400,headers});
    const {requestId,quantities}=JSON.parse(body);
    return NextResponse.json(await createCartonCheckout(requestId,quantities),{headers});
  }catch{return NextResponse.json({error:"Paiement indisponible. Réessayez avec le même panier ou commencez un nouveau panier."},{status:409,headers});}
}
