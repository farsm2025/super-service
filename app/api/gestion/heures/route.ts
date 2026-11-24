import {NextResponse} from "next/server";
import {getAdminSession} from "@/lib/admin-auth";
import {database} from "@/lib/db";

export const dynamic="force-dynamic";
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const datePattern=/^\d{4}-\d{2}-\d{2}$/;
function error(message:string,status=400){return NextResponse.json({error:message},{status})}
function validDate(value:unknown):value is string{
  if(typeof value!=="string"||!datePattern.test(value))return false;
  const d=new Date(value+"T00:00:00Z");
  return !Number.isNaN(d.valueOf())&&d.toISOString().slice(0,10)===value;
}
function validUuid(v:unknown):v is string{return typeof v==="string"&&uuid.test(v)}
function entryInput(body:Record<string,unknown>){
  const date=body.date,description=typeof body.description==="string"?body.description.trim():"";
  const hours=Number(body.hours),amount=Number(body.amount);
  if(!validDate(date)||!description||description.length>1000||!Number.isFinite(hours)||hours<=0||hours>24||Math.round(hours*100)!==hours*100||!Number.isFinite(amount)||amount<0||amount>1000000||Math.abs(amount*100-Math.round(amount*100))>0.00001)throw Error("Vérifiez la date, la description, les heures (max. 24) et le montant en CHF.");
  return {date,description,hours,amountCents:Math.round(amount*100)};
}
export async function GET(){
  if(!await getAdminSession())return error("Non autorisé",401);
  try{
    const sql=database();
    const people=await sql.query("SELECT id,first_name AS \"firstName\",last_name AS \"lastName\" FROM work_people ORDER BY last_name,first_name",[]);
    const entries=await sql.query("SELECT id,person_id AS \"personId\",to_char(work_date,'YYYY-MM-DD') AS date,description,hours::float8 AS hours,amount_cents AS \"amountCents\" FROM work_entries WHERE statement_id IS NULL ORDER BY work_date DESC,created_at DESC",[]);
    const reports=await sql.query(`SELECT r.id,r.person_id AS "personId",to_char(r.cutoff_date,'YYYY-MM-DD') AS "cutoffDate",r.created_at AS "createdAt",v.version,v.lines FROM work_statements r JOIN LATERAL (SELECT version,lines FROM work_statement_versions WHERE statement_id=r.id ORDER BY version DESC LIMIT 1) v ON true ORDER BY r.created_at DESC`,[]);
    return NextResponse.json({people,entries,reports},{headers:{"Cache-Control":"no-store"}});
  }catch(err){console.error("Hour register read failed",err);return error("Impossible de charger les décomptes. Vérifiez la migration Neon.",500)}
}
export async function POST(request:Request){
  if(!await getAdminSession())return error("Non autorisé",401);
  let body:Record<string,unknown>;
  try{body=await request.json()}catch{return error("Données invalides")}
  try{
    const sql=database();
    if(body.action==="person"){
      const firstName=typeof body.firstName==="string"?body.firstName.trim():"";
      const lastName=typeof body.lastName==="string"?body.lastName.trim():"";
      if(!firstName||!lastName||firstName.length>100||lastName.length>100)return error("Prénom et nom requis.");
      const rows=await sql.query('INSERT INTO work_people(first_name,last_name) VALUES($1,$2) RETURNING id',[firstName,lastName]);
      return NextResponse.json({id:rows[0].id},{status:201});
    }
    if(body.action==="entry"){
      if(!validUuid(body.personId))return error("Choisissez une personne.");
      const e=entryInput(body);
      if(body.id!==undefined){
        if(!validUuid(body.id))return error("Intervention invalide.");
        const rows=await sql.query("UPDATE work_entries SET work_date=$1,description=$2,hours=$3,amount_cents=$4,updated_at=now() WHERE id=$5 AND person_id=$6 AND statement_id IS NULL RETURNING id",[e.date,e.description,e.hours,e.amountCents,body.id,body.personId]);
        if(!rows.length)return error("Impossible de modifier une intervention clôturée.",409);
      }else{
        await sql.query("INSERT INTO work_entries(person_id,work_date,description,hours,amount_cents) VALUES ($1,$2,$3,$4,$5)",[body.personId,e.date,e.description,e.hours,e.amountCents]);
      }
      return NextResponse.json({ok:true});
    }
    if(body.action==="delete"){
      if(!validUuid(body.id)||!validUuid(body.personId))return error("Intervention invalide.");
      const rows=await sql.query("DELETE FROM work_entries WHERE id=$1 AND person_id=$2 AND statement_id IS NULL RETURNING id",[body.id,body.personId]);
      return rows.length?NextResponse.json({ok:true}):error("Intervention clôturée ou introuvable.",409);
    }
    if(body.action==="close"){
      if(!validUuid(body.personId)||!validDate(body.cutoffDate))return error("Choisissez une personne et une date valide.");
      // Une seule requête SQL atomique : attribution, photographie des lignes et clôture.
      const rows=await sql.query(`WITH available AS (
        SELECT id FROM work_entries WHERE person_id=$1::uuid AND statement_id IS NULL AND work_date<=$2::date FOR UPDATE
      ), report AS (
        INSERT INTO work_statements(person_id,cutoff_date)
        SELECT $1::uuid,$2::date WHERE EXISTS(SELECT 1 FROM available) RETURNING id
      ), assigned AS (
        UPDATE work_entries SET statement_id=(SELECT id FROM report),updated_at=now()
        WHERE id IN (SELECT id FROM available) AND EXISTS(SELECT 1 FROM report)
        RETURNING id,work_date,description,hours,amount_cents
      ), version AS (
        INSERT INTO work_statement_versions(statement_id,version,lines)
        SELECT (SELECT id FROM report),1,jsonb_agg(jsonb_build_object('id',id,'date',to_char(work_date,'YYYY-MM-DD'),'description',description,'hours',hours::float8,'amountCents',amount_cents) ORDER BY work_date,id)
        FROM assigned HAVING count(*)>0 RETURNING statement_id
      )
      SELECT statement_id AS id FROM version`,[body.personId,body.cutoffDate]);
      return rows.length?NextResponse.json({id:rows[0].id}):error("Aucune intervention non clôturée jusqu'à cette date.",409);
    }
    if(body.action==="revise"){
      if(!validUuid(body.reportId)||!Array.isArray(body.lines)||body.lines.length<1||body.lines.length>1000)return error("Décompte incorrect.");
      const previous=await sql.query("SELECT lines FROM work_statement_versions WHERE statement_id=$1 ORDER BY version DESC LIMIT 1",[body.reportId]);
      if(!previous.length)return error("Décompte introuvable.",404);
      const prev=previous[0].lines as Array<{id:string}>;
      const oldIds=new Set(prev.map(l=>l.id));
      if(body.lines.length!==oldIds.size)return error("Le nombre de lignes doit rester identique. Pour une modification de structure, contactez l'administrateur.");
      const lines=body.lines.map(raw=>{
        const line=raw as Record<string,unknown>;
        if(!validUuid(line.id)||!oldIds.has(line.id))throw Error("Une intervention ne correspond pas à ce décompte.");
        const validated=entryInput(line);
        return {id:line.id,...validated};
      });
      if(new Set(lines.map(l=>l.id)).size!==lines.length)return error("Lignes en double.");
      const rows=await sql.query(`INSERT INTO work_statement_versions(statement_id,version,lines)
        SELECT $1::uuid,COALESCE(MAX(version),0)+1,$2::jsonb FROM work_statement_versions WHERE statement_id=$1::uuid
        RETURNING version`,[body.reportId,JSON.stringify(lines)]);
      return NextResponse.json({version:rows[0].version});
    }
    return error("Action inconnue.");
  }catch(err){console.error("Hour register write failed",err);return error(err instanceof Error&&err.message.startsWith("Vérifiez")?err.message:"Opération impossible. Réessayez.",400)}
}
