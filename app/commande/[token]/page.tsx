import {notFound} from "next/navigation";
import type {Metadata} from "next";
import {PageShell} from "@/app/ui/page-shell";
import {stripeTestEnabled} from "@/lib/stripe-config";
import {verifyOrderToken} from "@/lib/order-token";
import {OrderStatus} from "./order-status";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Commande de cartons — Test",robots:{index:false,follow:false}};
export default async function OrderPage({params}:{params:Promise<{token:string}>}){const {token}=await params;if(!stripeTestEnabled() || !verifyOrderToken(token))notFound();return <PageShell title="Commande de cartons — Test" eyebrow="Super Service" intro="Suivez le statut de votre paiement de test."><OrderStatus token={token}/></PageShell>;}
