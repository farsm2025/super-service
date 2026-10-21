"use client";
import {useRef,useState} from "react";
import {cartAmount,cartonCatalog,chf,type CartonQuantities} from "@/lib/carton-catalog";
export function CartonCheckout(){
  const [quantities,setQuantities]=useState<CartonQuantities>({standard:0,grand:0});
  const [busy,setBusy]=useState(false),[error,setError]=useState("");
  const locked=useRef(false);
  const amount=cartAmount(quantities);
  function reset(){sessionStorage.removeItem("super-service-carton-checkout");setQuantities({standard:0,grand:0});setError("");}
  async function checkout(event:React.FormEvent){
    event.preventDefault();if(locked.current || !amount)return;
    locked.current=true;setBusy(true);setError("");
    try {
      const cart=JSON.stringify(quantities),saved=sessionStorage.getItem("super-service-carton-checkout");
      const previous=saved?JSON.parse(saved):null;
      const requestId=previous?.cart===cart?previous.requestId:crypto.randomUUID();
      sessionStorage.setItem("super-service-carton-checkout",JSON.stringify({cart,requestId}));
      const response=await fetch("/api/paiement/cartons",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({quantities,requestId})});
      const data=await response.json();if(!response.ok)throw new Error(data.error);
      window.location.assign(data.url);
    }catch(error){setError(error instanceof Error?error.message:"Paiement indisponible.");locked.current=false;setBusy(false);}
  }
  return <section className="cartons-contact" aria-labelledby="carton-checkout-title"><form onSubmit={checkout} style={{width:"100%"}}>
    <h2 id="carton-checkout-title">Commander des cartons — Test</h2>
    <p><strong>Environnement de test — aucune carte réelle.</strong> Cette commande sert uniquement à tester le paiement. Aucun carton ne sera livré.</p>
    <div className="cartons-grid">{cartonCatalog.map(item=><label key={item.id} style={{display:"grid",gap:"8px"}}><strong>{item.name}</strong><span>{item.size} · {chf(item.price)} / pièce</span><span>Quantité (0 à 99)</span><input type="number" min="0" max="99" step="1" value={quantities[item.id]} disabled={busy} onChange={event=>setQuantities(previous=>({...previous,[item.id]:Number(event.target.value)}))} required style={{padding:"12px",maxWidth:"160px"}}/></label>)}</div>
    <p><strong>Total : {chf(amount)}</strong></p>
    <div className="hero-actions"><button className="button" type="submit" disabled={busy || !amount}>{busy?"Ouverture du paiement…":"Payer en mode test"}</button><button className="button button-outline" type="button" disabled={busy} onClick={reset}>Nouveau panier</button></div>
    {error && <p role="alert">{error}</p>}
  </form></section>;
}
