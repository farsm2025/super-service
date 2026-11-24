import {database} from "@/lib/db";
import {generateHoursPdf,type HourPdfLine} from "@/lib/hours-pdf";
const validEmail=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const today=()=>new Date().toLocaleDateString("en-CA",{timeZone:"Europe/Zurich"});
const clean=(s:string)=>s.replace(/[&<>"]/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[x]||x));
type StatementRow={id:string;first_name:string;last_name:string;email:string;cutoff_date:string;email_status:string;email_to:string;email_error:string|null;deleted_at:string|null};
function attachment(report:StatementRow,version:number,lines:HourPdfLine[]){
  return generateHoursPdf({name:report.first_name+" "+report.last_name,cutoffDate:report.cutoff_date,version,lines,generatedDate:today()});
}
export async function sendHoursReport(reportId:string):Promise<{status:string;message:string}>{
  const sql=database();
  // Idempotency: one sender claims one report; sent reports cannot be sent again.
  const claimed=await sql.query(`UPDATE work_statements s SET email_status='sending',email_claimed_at=now(),email_error=NULL
    FROM work_people p WHERE s.id=$1 AND s.person_id=p.id AND s.deleted_at IS NULL
      AND s.email_status IN ('pending','failed','skipped')
    RETURNING s.id,p.first_name,p.last_name,p.email,to_char(s.cutoff_date,'YYYY-MM-DD') AS cutoff_date,s.deleted_at,s.email_status,s.email_to,s.email_error`,[reportId]);
  if(!claimed.length)return {status:"already",message:"Décompte déjà envoyé ou en cours d’envoi."};
  const report=claimed[0] as StatementRow;
  const destination=String(report.email||"").trim().toLowerCase();
  if(!validEmail.test(destination)){
    await sql.query("UPDATE work_statements SET email_status='skipped',email_to='',email_error='Adresse e-mail absente ou invalide' WHERE id=$1",[reportId]);
    return {status:"skipped",message:"Décompte clôturé. Renseignez une adresse e-mail valide pour l'envoyer."};
  }
  if(process.env.VERCEL_ENV==="preview"){
    await sql.query("UPDATE work_statements SET email_status='skipped',email_to=$2,email_error='Envoi désactivé sur les prévisualisations' WHERE id=$1",[reportId,destination]);
    return {status:"skipped",message:"Prévisualisation : e-mail non envoyé."};
  }
  try{
    const resendKey=process.env.RESEND_API_KEY;
    if(!resendKey)throw Error("RESEND_API_KEY manquante");
    const versions=await sql.query("SELECT version,lines FROM work_statement_versions WHERE statement_id=$1 ORDER BY version DESC LIMIT 1",[reportId]);
    if(!versions.length)throw Error("Version de décompte introuvable");
    const ver=Number(versions[0].version);const lines=versions[0].lines as HourPdfLine[];
    const file=attachment(report,ver,lines);
    const from=process.env.EMAIL_FROM||"Super-Service <devis@mail.super-service.ch>";
    const response=await fetch("https://api.resend.com/emails",{
      method:"POST",
      headers:{"content-type":"application/json",authorization:"Bearer "+resendKey,"Idempotency-Key":"hours-report-"+reportId+"-v"+ver},
      body:JSON.stringify({from,to:[destination],reply_to:process.env.ADMIN_EMAIL||"info@super-service.ch",
        subject:"Super-Service – Décompte de vos heures",
        html:"<p>Bonjour "+clean(report.first_name)+" "+clean(report.last_name)+",</p><p>Veuillez trouver en pièce jointe votre décompte des heures et prestations effectuées.</p><p>Ce document détaille les dates, les travaux réalisés, les heures et les montants en CHF.</p><p>Cordialement,<br><strong>L’équipe Super-Service</strong></p>",
        attachments:[{filename:"decompte-heures-"+report.cutoff_date+"-v"+ver+".pdf",content:file.toString("base64")}]})
    });
    if(!response.ok)throw Error("Envoi Resend refusé (HTTP "+response.status+")");
    await sql.query("UPDATE work_statements SET email_status='sent',email_to=$2,emailed_at=now(),email_error=NULL WHERE id=$1",[reportId,destination]);
    return {status:"sent",message:"Décompte PDF envoyé à "+destination+"."};
  }catch(e){
    console.error("Work report email failed",e);
    await sql.query("UPDATE work_statements SET email_status='failed',email_to=$2,email_error=$3 WHERE id=$1",[reportId,destination,e instanceof Error?e.message.slice(0,400):"Erreur de transmission"]);
    return {status:"failed",message:"Décompte clôturé et archivé, mais l'envoi de l'e-mail a échoué. Vous pouvez réessayer."};
  }
}
