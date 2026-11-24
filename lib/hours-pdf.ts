// Générateur PDF autonome : aucune dépendance ni service payant supplémentaire.
// PDF A4, typographie Helvetica WinAnsi, retour à la ligne et pagination.
export type HourPdfLine={date:string;description:string;hours:number;amountCents:number};
function encode(value:string){
  const normalized=value.replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/[–—]/g,"-").replace(/\u202f|\u00a0/g," ").replace(/€/g,"EUR").replace(/[^\x20-\x7e\u00a1-\u00ff]/g,"?");
  const binary=Buffer.from(normalized,"latin1").toString("latin1");
  return "("+binary.replace(/\\/g,"\\\\").replace(/\(/g,"\\(").replace(/\)/g,"\\)")+")";
}
const dateFr=(d:string)=>d.split("-").reverse().join(".");
const amount=(c:number)=>(c/100).toFixed(2).replace(".",",")+" CHF";
const hours=(v:number)=>Number(v).toLocaleString("fr-CH",{maximumFractionDigits:2}).replace(/\u202f/g," ")+" h";
function wrap(text:string,max:number){
  const words=text.trim().split(/\s+/);const result:string[]=[];let line="";
  for(const word of words){if(!word)continue;
    if((line+" "+word).trim().length>max&&line){result.push(line);line="";}
    if(word.length>max){if(line){result.push(line);line=""}for(let n=0;n<word.length;n+=max)result.push(word.slice(n,n+max));}
    else line=line?line+" "+word:word;
  }
  if(line)result.push(line);return result.length?result:[""];
}
export function generateHoursPdf(args:{name:string;cutoffDate:string;version:number;lines:HourPdfLine[];generatedDate:string}):Buffer{
  const pages:string[]=[];let commands:string[]=[];let y=0;
  const tx=(x:number,yy:number,text:string,size=10,bold=false)=>commands.push("BT /"+(bold?"F2":"F1")+" "+size+" Tf 1 0 0 1 "+x+" "+yy+" Tm "+encode(text)+" Tj ET");
  const line=(yy:number)=>commands.push("0.82 G 0.55 w 44 "+yy+" m 550 "+yy+" l S 0 G");
  function page(){if(commands.length)pages.push(commands.join("\n"));commands=[];y=785;
    tx(44,y,"SUPER-SERVICE",18,true);y-=26;tx(44,y,"Décompte des heures et des prestations",13,true);y-=25;
    tx(44,y,"Nom : "+args.name,12,true);y-=19;
    tx(44,y,"Décompte arrêté au : "+dateFr(args.cutoffDate)+"  |  Version : "+args.version,9);y-=25;
    line(y+9);tx(44,y,"Date",9,true);tx(122,y,"Travail effectué",9,true);tx(450,y,"Heures",9,true);tx(505,y,"CHF",9,true);y-=11;line(y);y-=20;
  }
  page();
  for(const row of args.lines){
    const parts=wrap(row.description,54);const h=Math.max(1,parts.length)*13+9;
    if(y-h<95)page();
    tx(44,y,dateFr(row.date),9);
    for(let i=0;i<parts.length;i++)tx(122,y-i*13,parts[i],9);
    tx(450,y,hours(Number(row.hours)),9);tx(505,y,amount(Number(row.amountCents)).replace(" CHF",""),9);
    y-=h;line(y+7);y-=5;
  }
  if(y<110)page();
  const totalH=args.lines.reduce((s,r)=>s+Number(r.hours),0);
  const totalCHF=args.lines.reduce((s,r)=>s+Number(r.amountCents),0);
  y-=9;tx(122,y,"GRAND TOTAL",11,true);tx(450,y,hours(totalH),10,true);tx(505,y,amount(totalCHF).replace(" CHF",""),10,true);
  y-=32;tx(44,y,"Établi le "+dateFr(args.generatedDate),10);
  y-=20;tx(44,y,"Décompte des interventions - ne constitue pas une fiche de salaire.",8);
  pages.push(commands.join("\n"));
  const objects:string[]=[];
  const push=(content:string)=>{objects.push(content);return objects.length};
  const catalog=push("");const pageTree=push("");
  const normal=push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
  const bold=push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
  const refs:number[]=[];
  for(const pageContents of pages){
    const stream=Buffer.from(pageContents,"latin1");
    const streamId=push("<< /Length "+stream.length+" >>\nstream\n"+pageContents+"\nendstream");
    const pageId=push("<< /Type /Page /Parent "+pageTree+" 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 "+normal+" 0 R /F2 "+bold+" 0 R >> >> /Contents "+streamId+" 0 R >>");
    refs.push(pageId);
  }
  objects[pageTree-1]="<< /Type /Pages /Kids ["+refs.map(id=>id+" 0 R").join(" ")+"] /Count "+refs.length+" >>";
  objects[catalog-1]="<< /Type /Catalog /Pages "+pageTree+" 0 R >>";
  const parts:Buffer[]=[Buffer.from("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n","latin1")];const offsets=[0];
  let offset=parts[0].length;
  for(let i=0;i<objects.length;i++){
    offsets.push(offset);
    const chunk=Buffer.from((i+1)+" 0 obj\n"+objects[i]+"\nendobj\n","latin1");
    parts.push(chunk);offset+=chunk.length;
  }
  const xref=offset;
  const trailer="xref\n0 "+(objects.length+1)+"\n0000000000 65535 f \n"+offsets.slice(1).map(n=>String(n).padStart(10,"0")+" 00000 n \n").join("")+"trailer\n<< /Size "+(objects.length+1)+" /Root "+catalog+" 0 R >>\nstartxref\n"+xref+"\n%%EOF";
  parts.push(Buffer.from(trailer,"latin1"));
  return Buffer.concat(parts);
}
