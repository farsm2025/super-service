const attempts=new Map<string,{count:number;reset:number}>();
export function rateLimit(request:Request,scope:string,limit:number,windowMs:number){
  const ip=request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()||request.headers.get("x-real-ip")||"unknown";const key=`${scope}:${ip}`;const now=Date.now();const current=attempts.get(key);if(!current||current.reset<now){attempts.set(key,{count:1,reset:now+windowMs});return true}if(current.count>=limit)return false;current.count+=1;return true;
}
