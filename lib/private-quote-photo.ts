/**
 * Small Vercel Blob private-storage adapter using the documented Blob API wire protocol.
 * No public URLs are exposed. Only server-side credentials may read objects.
 * Requires a PRIVATE Blob store and BLOB_READ_WRITE_TOKEN in the deployment.
 */
const api="https://vercel.com/api/blob";
function auth(){
  const token=process.env.BLOB_READ_WRITE_TOKEN;
  if(!token)throw new Error("Stockage privé non configuré : BLOB_READ_WRITE_TOKEN manquant.");
  const storeId=token.split("_")[3];
  if(!storeId||!/^[a-zA-Z0-9]+$/.test(storeId))throw new Error("Token de stockage invalide.");
  return {token,storeId};
}
export async function putPrivateQuotePhoto(pathname:string,body:ArrayBuffer,contentType:string){
  const {token,storeId}=auth();
  const response=await fetch(`${api}/?pathname=${encodeURIComponent(pathname)}`,{
    method:"PUT",headers:{
      "authorization":`Bearer ${token}`,
      "x-vercel-blob-store-id":storeId,
      "x-api-version":"12",
      "x-api-blob-request-id":`${storeId}:${Date.now()}:${crypto.randomUUID()}`,
      "x-api-blob-request-attempt":"0",
      "x-vercel-blob-access":"private",
      "x-content-type":contentType,
      "x-add-random-suffix":"0"
    },body,cache:"no-store"
  });
  if(!response.ok)throw new Error(`Téléversement privé impossible (HTTP ${response.status})`);
  const result=await response.json() as {url:string;pathname:string};
  if(!result.url||!new URL(result.url).hostname.endsWith(".private.blob.vercel-storage.com"))throw new Error("Stockage non privé : transfert rejeté.");
  return result;
}
export async function readPrivateQuotePhoto(url:string){
  const {token,storeId}=auth();
  const parsed=new URL(url);
  if(parsed.protocol!=="https:"||parsed.hostname!==`${storeId}.private.blob.vercel-storage.com`)throw new Error("Adresse de photo non autorisée.");
  const res=await fetch(parsed.toString(),{headers:{authorization:`Bearer ${token}`},cache:"no-store"});
  if(!res.ok)throw new Error(`Photo indisponible (HTTP ${res.status})`);
  return res;
}
