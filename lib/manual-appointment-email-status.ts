import {database} from "./db";
import {sendManualAppointmentConfirmationEmail} from "./appointment-email";
import type {Appointment} from "./appointment-types";

export type ManualEmailStatus="sent"|"failed"|"unknown"|"skipped";

export async function manualEmailStatus(appointmentId:string):Promise<ManualEmailStatus>{
  const sql=database();
  const rows=await sql.query(
    "SELECT action FROM appointment_history WHERE appointment_id=$1 AND action IN ('manual_confirmation_email_sent','manual_confirmation_email_failed') ORDER BY id DESC LIMIT 1",
    [appointmentId]
  ) as Array<{action:string}>;
  if(rows[0]?.action==="manual_confirmation_email_sent")return "sent";
  if(rows[0]?.action==="manual_confirmation_email_failed")return "failed";
  return "unknown";
}

/** Reuse the existing Resend confirmation and its appointment-scoped idempotency key.
 * Preview mode never emails actual clients. History tracks provider acceptance, not inbox delivery.
 */
export async function sendTrackedManualConfirmation(appointment:Appointment):Promise<ManualEmailStatus>{
  if(process.env.VERCEL_ENV==="preview")return "skipped";
  try{
    await sendManualAppointmentConfirmationEmail(appointment);
  }catch(error){
    console.error("Manual confirmation email failed",error);
    try{
      const sql=database();
      await sql.query(
        "INSERT INTO appointment_history (appointment_id,action,actor,details) VALUES ($1,'manual_confirmation_email_failed','system',$2::jsonb)",
        [appointment.id,JSON.stringify({})]
      );
    }catch(logError){console.error("Could not log failed confirmation",logError)}
    return "failed";
  }
  try{
    const sql=database();
    await sql.query(
      "INSERT INTO appointment_history (appointment_id,action,actor,details) VALUES ($1,'manual_confirmation_email_sent','system',$2::jsonb)",
      [appointment.id,JSON.stringify({})]
    );
  }catch(logError){console.error("Confirmation accepted but could not be logged",logError)}
  return "sent";
}
