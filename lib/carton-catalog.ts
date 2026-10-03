export const cartonCatalog = [
  {id:"standard",name:"Carton standard",size:"40 × 30 × 30 cm",price:490},
  {id:"grand",name:"Grand carton",size:"60 × 40 × 40 cm",price:690},
] as const;
export type CartonQuantities={standard:number;grand:number};
export function validateCart(value:unknown):CartonQuantities {
  if(!value || typeof value!=="object" || Array.isArray(value))throw new Error("Panier invalide");
  const cart=value as Record<string,unknown>;
  if(Object.keys(cart).sort().join(",")!=="grand,standard")throw new Error("Panier invalide");
  for(const id of ["standard","grand"])if(!Number.isInteger(cart[id]) || Number(cart[id])<0 || Number(cart[id])>99)throw new Error("Quantité invalide");
  if(Number(cart.standard)+Number(cart.grand)===0)throw new Error("Choisissez au moins un carton");
  return {standard:Number(cart.standard),grand:Number(cart.grand)};
}
export function cartAmount(cart:CartonQuantities){return cartonCatalog.reduce((sum,item)=>sum+item.price*cart[item.id],0);}
export function chf(amount:number){return `${(amount/100).toFixed(2)} CHF`;}
