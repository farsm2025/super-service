import {database} from "./db";

import {quoteStatuses,type QuoteNote,type QuoteStatus} from "./quote-types";
type QuoteRow={id:string;first_name:string;last_name:string;phone:string;email:string;address:string;
 service:string;description:string;status:QuoteStatus;appointment_id:string|null;reminder_at:string|null;
 created_at:string;updated_at:string};
type PhotoRow={id:string;quote_id:string;filename:string;caption:string;created_at:string;pathname:string};
function mapped(row:QuoteRow,photos:PhotoRow[]):QuoteNote{
  return {id:row.id,firstName:row.first_name,lastName:row.last_name,phone:row.phone,
    email:row.email,address:row.address,service:row.service,description:row.description,
    status:row.status,appointmentId:row.appointment_id,reminderAt:row.reminder_at,
    createdAt:row.created_at,updatedAt:row.updated_at,
    photos:photos.filter(p=>p.quote_id===row.id).map(p=>({
      id:p.id,filename:p.filename,caption:p.caption,createdAt:p.created_at
    }))};
}
const columns="id,first_name,last_name,phone,email,address,service,description,status,appointment_id,reminder_at,created_at,updated_at";
export async function listQuoteNotes():Promise<QuoteNote[]>{
  const sql=database();
  const notes=await sql.query(`SELECT ${columns} FROM quote_notes ORDER BY updated_at DESC LIMIT 500`,[]) as QuoteRow[];
  const photos=await sql.query("SELECT id,quote_id,filename,caption,created_at,pathname FROM quote_photos ORDER BY created_at",[]) as PhotoRow[];
  return notes.map(row=>mapped(row,photos));
}
export async function getQuoteNote(id:string):Promise<QuoteNote|null>{
  const sql=database();
  const notes=await sql.query(`SELECT ${columns} FROM quote_notes WHERE id=$1`,[id]) as QuoteRow[];
  if(!notes.length)return null;
  const photos=await sql.query("SELECT id,quote_id,filename,caption,created_at,pathname FROM quote_photos WHERE quote_id=$1 ORDER BY created_at",[id]) as PhotoRow[];
  return mapped(notes[0],photos);
}
export function noteInput(body:Record<string,unknown>){
  const field=(key:string,max:number)=>typeof body[key]==="string"?(body[key] as string).trim().slice(0,max):"";
  const status=field("status",30);
  const rawReminder=field("reminderAt",40);
  const parsedReminder=rawReminder?new Date(rawReminder):null;
  const reminderAt=parsedReminder&&!Number.isNaN(parsedReminder.getTime())?parsedReminder.toISOString():null;
  return {firstName:field("firstName",100),lastName:field("lastName",100),
    phone:field("phone",50),email:field("email",180),address:field("address",300),
    service:field("service",100),description:field("description",12000),
    status:quoteStatuses.includes(status as QuoteStatus)?status as QuoteStatus:"a_traiter" as QuoteStatus,
    appointmentId:field("appointmentId",40)||null,reminderAt};
}
export async function createQuoteNote(input:ReturnType<typeof noteInput>){
  const sql=database();
  const rows=await sql.query(
    `INSERT INTO quote_notes(first_name,last_name,phone,email,address,service,description,status,reminder_at)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
    [input.firstName,input.lastName,input.phone,input.email,input.address,input.service,input.description,input.status,input.reminderAt]);
  return getQuoteNote(String(rows[0].id));
}
export async function updateQuoteNote(id:string,input:ReturnType<typeof noteInput>){
  const sql=database();
  const rows=await sql.query(
    `UPDATE quote_notes SET first_name=$2,last_name=$3,phone=$4,email=$5,address=$6,
     service=$7,description=$8,status=$9,reminder_at=$10,updated_at=now()
     WHERE id=$1 RETURNING id`,
     [id,input.firstName,input.lastName,input.phone,input.email,input.address,input.service,
      input.description,input.status,input.reminderAt]);
  return rows.length?getQuoteNote(id):null;
}
export async function linkQuoteAppointment(id:string,appointmentId:string|null){
  const sql=database();
  const rows=await sql.query("UPDATE quote_notes SET appointment_id=$2,updated_at=now() WHERE id=$1 RETURNING id",[id,appointmentId]);
  return rows.length?getQuoteNote(id):null;
}
export async function getPhotoRecord(photoId:string){
  const sql=database();
  const rows=await sql.query("SELECT id,quote_id,pathname,filename,caption FROM quote_photos WHERE id=$1",[photoId]) as PhotoRow[];
  return rows[0]||null;
}
export async function addQuotePhoto(quoteId:string,pathname:string,filename:string){
  const sql=database();
  const rows=await sql.query("INSERT INTO quote_photos(quote_id,pathname,filename) VALUES($1,$2,$3) RETURNING id",[quoteId,pathname,filename]);
  return String(rows[0].id);
}
export async function updateQuotePhotoCaption(id:string,caption:string){
  const sql=database();
  const rows=await sql.query("UPDATE quote_photos SET caption=$2 WHERE id=$1 RETURNING id",[id,caption.slice(0,200)]);
  return rows.length>0;
}
