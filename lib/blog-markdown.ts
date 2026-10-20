type BlogListItem={text:string;checklist:boolean};
export type BlogBlock=
 |{type:"h2"|"h3"|"paragraph";text:string}
 |{type:"list";items:BlogListItem[];ordered:boolean}
 |{type:"table";headers:string[];rows:string[][]};

export function sectionId(value:string){
 return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
}
function cells(line:string){
 return line.replace(/^\|/,"").replace(/\|$/,"").split("|").map(part=>part.trim());
}
function tableSeparator(line:string){
 return /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(line);
}
export function parseBlogMarkdown(markdown:string):BlogBlock[]{
 const blocks:BlogBlock[]=[];
 let paragraphs:string[]=[];
 let list:BlogListItem[]=[];
 let ordered=false;
 let table:string[][]=[];
 const flushParagraph=()=>{
   if(paragraphs.length){blocks.push({type:"paragraph",text:paragraphs.join(" ")});paragraphs=[]}
 };
 const flushList=()=>{
   if(list.length){blocks.push({type:"list",items:list,ordered});list=[];ordered=false}
 };
 const flushTable=()=>{
   if(table.length>=2){blocks.push({type:"table",headers:table[0],rows:table.slice(1)})}
   else if(table.length===1){blocks.push({type:"paragraph",text:table[0].join(" — ")})}
   table=[];
 };
 for(const rawLine of markdown.split(/\r?\n/)){
   const line=rawLine.trim();
   if(!line){flushParagraph();flushList();flushTable();continue}
   if(tableSeparator(line)){continue}
   if(line.startsWith("|") && line.endsWith("|")){
     flushParagraph();flushList();table.push(cells(line));continue
   }
   flushTable();
   const heading=line.match(/^(##|###)\s+(.+)$/);
   if(heading){flushParagraph();flushList();blocks.push({type:heading[1]==="##"?"h2":"h3",text:heading[2]});continue}
   const item=line.match(/^-\s+(\[\s\]\s+)?(.+)$/);
   const numbered=line.match(/^\d+\.\s+(.+)$/);
   if(item||numbered){
     flushParagraph();
     const nextOrdered=Boolean(numbered);
     if(list.length && ordered!==nextOrdered)flushList();
     ordered=nextOrdered;
     list.push({text:numbered?numbered[1]:item![2],checklist:Boolean(item?.[1])});
     continue;
   }
   flushList();paragraphs.push(line);
 }
 flushParagraph();flushList();flushTable();
 return blocks;
}
