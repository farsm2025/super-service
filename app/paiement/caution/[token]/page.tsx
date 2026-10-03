import {notFound} from "next/navigation";
import {stripeTestEnabled} from "@/lib/stripe-config";
import {DepositForm} from "./deposit-form";
export const dynamic="force-dynamic";
export const metadata={title:"Caution camion – Super Service",robots:{index:false,follow:false},referrer:"no-referrer"};
export default async function Page({params}:{params:Promise<{token:string}>}) {
  if(!stripeTestEnabled())notFound();
  const key=process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if(!key?.startsWith("pk_test_"))notFound();
  const {token}=await params;
  return <main style={{maxWidth:540,margin:"48px auto",padding:24}}><h1>Caution camion : 100 CHF</h1><p><strong>Environnement de test — aucune carte réelle.</strong></p><p>La somme est réservée sur la carte, sans encaissement immédiat. Après restitution du camion, Super Service peut libérer la caution ou la retenir selon les conditions de location.</p><DepositForm token={token} publishableKey={key}/></main>;
}
