const emailPattern=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function requiredText(value:unknown,max=500){if(typeof value!=="string")return "";return value.trim().slice(0,max)}
export function isValidEmail(value:string){return emailPattern.test(value)}
export function isIsoDate(value:string){return /^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(`${value}T12:00:00Z`))}
export function zurichDateTimeToIso(value:string){
  const match=value.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:?\d{2})?$/);
  if(!match)throw new Error("Date invalide");
  const [year,month,day]=match[1].split("-").map(Number);const hour=Number(match[2]);const minute=Number(match[3]);
  if(hour>23||minute>59||!isIsoDate(match[1]))throw new Error("Date invalide");
  const wanted=Date.UTC(year,month-1,day,hour,minute);let guess=wanted;
  for(let index=0;index<2;index++){const parts=new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Zurich",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(new Date(guess));const get=(type:string)=>Number(parts.find(part=>part.type===type)?.value);const shown=Date.UTC(get("year"),get("month")-1,get("day"),get("hour"),get("minute"));guess+=wanted-shown}
  return new Date(guess).toISOString();
}
