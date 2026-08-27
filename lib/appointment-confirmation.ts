import {createHmac,timingSafeEqual} from "node:crypto";
import {getAppointment} from "./appointments";

type ConfirmationPayload={id:string;startsAt:string;version:string;expires:number};

function secret(){
  const value=process.env.CUSTOMER_CONFIRMATION_SECRET||process.env.CRON_SECRET||process.env.RESEND_API_KEY;
  if(!value)throw new Error("Customer confirmation secret is missing");
  return value;
}

function signature(payload:string){return createHmac("sha256",secret()).update(payload).digest("base64url")}

export function createCustomerConfirmationToken(appointment:{id:string;startsAt:string|null;updatedAt:string}){
  if(!appointment.startsAt)throw new Error("Appointment date is missing");
  const payload=Buffer.from(JSON.stringify({id:appointment.id,startsAt:appointment.startsAt,version:appointment.updatedAt,expires:Date.now()+7*24*60*60*1000} satisfies ConfirmationPayload)).toString("base64url");
  return `${payload}.${signature(payload)}`;
}

function readToken(token:string):ConfirmationPayload|null{
  const [payload,provided]=token.split(".");
  if(!payload||!provided)return null;
  const expected=signature(payload);
  const suppliedBuffer=Buffer.from(provided);
  const expectedBuffer=Buffer.from(expected);
  if(suppliedBuffer.length!==expectedBuffer.length||!timingSafeEqual(suppliedBuffer,expectedBuffer))return null;
  try{
    const value=JSON.parse(Buffer.from(payload,"base64url").toString("utf8")) as ConfirmationPayload;
    return value.id&&value.startsAt&&value.version&&value.expires>Date.now()?value:null;
  }catch{return null}
}

export async function getPendingCustomerProposal(token:string){
  const payload=readToken(token);
  if(!payload)return null;
  const appointment=await getAppointment(payload.id);
  if(!appointment||appointment.status!=="awaiting_customer"||appointment.startsAt!==payload.startsAt||appointment.updatedAt!==payload.version)return null;
  return {appointment,payload};
}
