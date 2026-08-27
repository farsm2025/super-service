import {database} from "./db";
import {appointmentStatuses,type Appointment,type AppointmentStatus} from "./appointment-types";

type DbAppointment={
  id:string; customer_name:string; customer_email:string; customer_phone:string; customer_address:string;
  request_type:string; reason:string; customer_notes:string|null; preferred_date:string; preferred_time_start:string|null;
  preferred_time_end:string|null; alternate_date:string|null; alternate_time_start:string|null; alternate_time_end:string|null;
  starts_at:string|null; ends_at:string|null; timezone:string; status:AppointmentStatus; source:"client"|"manual";
  admin_notes:string|null; google_event_id:string|null; created_at:string; updated_at:string;
};

function dateOnly(value:string){return String(value).match(/\d{4}-\d{2}-\d{2}/)?.[0]||String(value)}
function timeOnly(value:string|null){return value?.match(/\d{2}:\d{2}/)?.[0]||null}

function mapAppointment(row:DbAppointment):Appointment{return{
  id:row.id,customerName:row.customer_name,customerEmail:row.customer_email,customerPhone:row.customer_phone,
  customerAddress:row.customer_address,requestType:row.request_type,reason:row.reason,customerNotes:row.customer_notes,
  preferredDate:dateOnly(row.preferred_date),preferredTimeStart:timeOnly(row.preferred_time_start),preferredTimeEnd:timeOnly(row.preferred_time_end),
  alternateDate:row.alternate_date?dateOnly(row.alternate_date):null,alternateTimeStart:timeOnly(row.alternate_time_start),
  alternateTimeEnd:timeOnly(row.alternate_time_end),startsAt:row.starts_at?new Date(row.starts_at).toISOString():null,
  endsAt:row.ends_at?new Date(row.ends_at).toISOString():null,timezone:row.timezone,status:row.status,source:row.source,
  adminNotes:row.admin_notes,googleEventId:row.google_event_id,createdAt:new Date(row.created_at).toISOString(),updatedAt:new Date(row.updated_at).toISOString(),
}}

const fields=`id,customer_name,customer_email,customer_phone,customer_address,request_type,reason,customer_notes,preferred_date,preferred_time_start,preferred_time_end,alternate_date,alternate_time_start,alternate_time_end,starts_at,ends_at,timezone,status,source,admin_notes,google_event_id,created_at,updated_at`;

export async function createAppointment(input:Record<string,string>,source:"client"|"manual"="client"){
  const sql=database();
  const rows=await sql.query(`INSERT INTO appointments (customer_name,customer_email,customer_phone,customer_address,request_type,reason,customer_notes,preferred_date,preferred_time_start,preferred_time_end,alternate_date,alternate_time_start,alternate_time_end,status,source,consent_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,now()) RETURNING ${fields}`,[input.name.trim(),input.email.trim().toLowerCase(),input.phone.trim(),input.address.trim(),input.requestType.trim(),input.reason.trim(),input.notes?.trim()||null,input.preferredDate,input.preferredTimeStart||null,input.preferredTimeEnd||null,input.alternateDate||null,input.alternateTimeStart||null,input.alternateTimeEnd||null,source==="manual"?"confirmed":"new_request",source]);
  const appointment=mapAppointment(rows[0] as DbAppointment);
  await sql`INSERT INTO appointment_history (appointment_id,action,actor,new_status,details) VALUES (${appointment.id},${source==="client"?"request_created":"appointment_created"},${source},${appointment.status},${JSON.stringify({})}::jsonb)`;
  return appointment;
}

export async function listAppointments(){
  const sql=database();
  const rows=await sql.query(`SELECT ${fields} FROM appointments ORDER BY COALESCE(starts_at,preferred_date::timestamptz),created_at DESC`,[]);
  return (rows as DbAppointment[]).map(mapAppointment);
}

export async function getAppointment(id:string){
  const sql=database();
  const rows=await sql.query(`SELECT ${fields} FROM appointments WHERE id=$1 LIMIT 1`,[id]);
  return rows[0]?mapAppointment(rows[0] as DbAppointment):null;
}

export async function updateAppointment(id:string,input:{action:string;startsAt?:string;endsAt?:string;adminNotes?:string;customerName?:string;customerEmail?:string;customerPhone?:string;customerAddress?:string;requestType?:string;reason?:string}){
  const sql=database();
  const current=await getAppointment(id);
  if(!current)throw new Error("Appointment not found");
  const statusMap:Record<string,AppointmentStatus>={accept:"confirmed",propose:["confirmed","modified"].includes(current.status)?"modified":"awaiting_customer",complete:"completed",cancel:"cancelled",reject:"rejected",notes:current.status,save:current.status};
  const nextStatus=statusMap[input.action];
  if(!nextStatus||!appointmentStatuses.includes(nextStatus))throw new Error("Invalid action");
  const startsAt=input.startsAt||current.startsAt;
  const endsAt=input.endsAt||(input.startsAt&&!current.startsAt?new Date(new Date(input.startsAt).getTime()+60*60*1000).toISOString():current.endsAt);
  if((input.action==="accept"||input.action==="propose")&&!startsAt)throw new Error("Date required");
  const rows=await sql.query(`UPDATE appointments SET status=$2,starts_at=$3,ends_at=$4,admin_notes=$5,customer_name=$6,customer_email=$7,customer_phone=$8,customer_address=$9,request_type=$10,reason=$11,updated_at=now() WHERE id=$1 RETURNING ${fields}`,[id,nextStatus,startsAt||null,endsAt||null,input.adminNotes??current.adminNotes,input.customerName?.trim()||current.customerName,input.customerEmail?.trim().toLowerCase()||current.customerEmail,input.customerPhone?.trim()||current.customerPhone,input.customerAddress?.trim()||current.customerAddress,input.requestType?.trim()||current.requestType,input.reason?.trim()||current.reason]);
  const updated=mapAppointment(rows[0] as DbAppointment);
  await sql`INSERT INTO appointment_history (appointment_id,action,actor,previous_status,new_status,details) VALUES (${id},${input.action},'admin',${current.status},${updated.status},${JSON.stringify({startsAt:updated.startsAt,endsAt:updated.endsAt})}::jsonb)`;
  return updated;
}

export async function deleteAppointment(id:string){
  const sql=database();
  const rows=await sql.query("DELETE FROM appointments WHERE id=$1 RETURNING id",[id]);
  if(!rows[0])throw new Error("Appointment not found");
}
