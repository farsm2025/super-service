"use client";

import {useEffect,useState} from "react";

type ChecklistProps={items:string[];storageKey:string};

// La progression est locale au navigateur : aucun compte ni appel serveur.
export function InteractiveChecklist({items,storageKey}:ChecklistProps){
 const [completed,setCompleted]=useState<string[]>([]);
 const [loaded,setLoaded]=useState(false);

 useEffect(()=>{
   try{
     const saved=window.localStorage.getItem(storageKey);
     if(saved){
       const parsed:unknown=JSON.parse(saved);
       if(Array.isArray(parsed)){
         setCompleted(parsed.filter((item):item is string=>typeof item==="string"&&items.includes(item)));
       }
     }
   }catch{/* Stockage indisponible : les cases restent utilisables pendant la visite. */}
   setLoaded(true);
 },[storageKey,items]);

 function toggle(item:string,checked:boolean){
   const updated=checked?[...completed.filter(value=>value!==item),item]:completed.filter(value=>value!==item);
   setCompleted(updated);
   try{window.localStorage.setItem(storageKey,JSON.stringify(updated));}
   catch{/* Le navigateur peut refuser le stockage ; la progression reste en mémoire. */}
 }

 return <>
   <p className="blog-checklist-progress" aria-live="polite">
     {loaded?`${completed.length} / ${items.length} étapes cochées`:"Cochez les étapes réalisées"}
   </p>
   <ul className="blog-checklist blog-checklist-interactive">
     {items.map((item,index)=>{
       const checked=completed.includes(item);
       return <li key={index} className={checked?"is-complete":undefined}>
         <label><input type="checkbox" checked={checked} onChange={event=>toggle(item,event.target.checked)}/><span>{item}</span></label>
       </li>;
     })}
   </ul>
 </>;
}

export function PrintChecklistButton(){
 return <button className="blog-checklist-print" type="button" onClick={()=>window.print()}>
   Imprimer la checklist / enregistrer en PDF
 </button>;
}
