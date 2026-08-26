import {createClient} from "@sanity/client";
export const sanityClient=createClient({
  projectId:process.env.NEXT_PUBLIC_SANITY_PROJECT_ID||"hk158c3c",
  dataset:process.env.NEXT_PUBLIC_SANITY_DATASET||"production",
  apiVersion:"2026-03-01",
  useCdn:false,
  token:process.env.SANITY_API_TOKEN,
  perspective:"published",
});
export type Realization={_id:string;title:string;service:string;featured?:boolean;city?:string;description?:string;imageUrl?:string;imageAlt?:string};
export type PublicTestimonial={_id:string;name:string;text:string;date:string;service:string;rating:number};
export type RentalVehicle={vehicleId?:"iveco"|"citroen";name?:string;volume?:string;feature?:string;halfDayPrice?:string;fullDayPrice?:string};
export type ServiceContent={title?:string;description?:string;seoTitle?:string;seoDescription?:string;rentalVehicles?:RentalVehicle[];driverHalfDaySupplement?:string;driverFullDaySupplement?:string;licenseRequired?:string;includedMileage?:string;deposit?:string;pickupLocation?:string;rentalConditions?:string};
const serviceAliases:Record<string,string>={
  demenagement:"demenagement",
  nettoyage:"nettoyage",
  "location-camion":"location-camion",
  transport:"transport-et-livraison",
  "transport-livraison":"transport-et-livraison",
  "transport-et-livraison":"transport-et-livraison",
  "montage-meubles":"montage-de-meubles",
  "montage-de-meubles":"montage-de-meubles",
  debarras:"debarras",
  "petits-travaux":"petits-travaux-jardinage",
  jardinage:"petits-travaux-jardinage",
  multiservices:"petits-travaux-jardinage",
  "petits-travaux-et-jardinage":"petits-travaux-jardinage",
  "petits-travaux-jardinage":"petits-travaux-jardinage",
};

function normalizeService(value:string){
  const normalized=value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/&/g," et ").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  return serviceAliases[normalized]||normalized;
}

export async function getRealizations(service?:string,featuredOnly=false):Promise<Realization[]>{
  try{
    const items=await sanityClient.fetch<Realization[]>(
      `*[_type=="realization" && defined(title) && defined(mainImage.asset)]|order(coalesce(order,10) asc,completedAt desc,_createdAt desc){_id,title,"service":coalesce(service->slug.current,service.slug.current,service),featured,city,description,"imageUrl":mainImage.asset->url,"imageAlt":coalesce(mainImage.alt,title)}`,
      {},
      {cache:"no-store"},
    );
    const requestedService=service?normalizeService(service):undefined;
    return items.filter((item)=>{
      if(featuredOnly&&item.featured!==true)return false;
      if(!requestedService)return true;
      return typeof item.service==="string"&&normalizeService(item.service)===requestedService;
    });
  }catch(error){
    console.error("Unable to load Sanity service photos",error);
    return[];
  }
}

export async function getPublishedTestimonials():Promise<PublicTestimonial[]>{
  try{
    const items=await sanityClient.fetch<Array<{_id:string;name:string;comment:string;service:string;rating?:number;publishedAt?:string;verifiedAt?:string;submittedAt?:string}>>(
      `*[_type=="testimonial" && status=="published" && defined(name) && defined(comment)]|order(coalesce(publishedAt,verifiedAt,submittedAt,_createdAt) desc){_id,name,comment,service,rating,publishedAt,verifiedAt,submittedAt}`,
      {},
      {cache:"no-store"},
    );
    const formatter=new Intl.DateTimeFormat("fr-CH",{day:"numeric",month:"long",year:"numeric"});
    return items.map((item)=>{
      const rawDate=item.publishedAt||item.verifiedAt||item.submittedAt;
      const parsedDate=rawDate?new Date(rawDate):null;
      return{_id:item._id,name:item.name,text:item.comment,service:item.service||"Multiservices",rating:Math.max(1,Math.min(5,item.rating||5)),date:parsedDate&&!Number.isNaN(parsedDate.getTime())?formatter.format(parsedDate):"Avis récent"};
    });
  }catch(error){
    console.error("Unable to load published Sanity reviews",error);
    return[];
  }
}

export async function getServiceBySlug(slug:string):Promise<ServiceContent|null>{try{return await sanityClient.fetch(`*[_type=="service"&&slug.current==$slug][0]{title,description,seoTitle,seoDescription,rentalVehicles[]{vehicleId,name,volume,feature,halfDayPrice,fullDayPrice},driverHalfDaySupplement,driverFullDaySupplement,licenseRequired,includedMileage,deposit,pickupLocation,rentalConditions}`,{slug},{next:{revalidate:60}})}catch{return null}}
