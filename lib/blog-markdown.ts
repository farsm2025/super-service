type BlogListItem={text:string;checklist:boolean};
export type BlogBlock=
 |{type:"h2"|"h3"|"paragraph";text:string}
 |{type:"list";items:BlogListItem[]};

export function sectionId(value:string){
 return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
}
export function parseBlogMarkdown(markdown:string):BlogBlock[]{
 const blocks:BlogBlock[]=[];
 let paragraphs:string[]=[];
 let list:BlogListItem[]=[];
 const flushParagraph=()=>{
   if(paragraphs.length){blocks.push({type:"paragraph",text:paragraphs.join(" ")});paragraphs=[]}
 };
 const flushList=()=>{
   if(list.length){blocks.push({type:"list",items:list});list=[]}
 };
 for(const rawLine of markdown.split(/\r?\n/)){
   const line=rawLine.trim();
   if(!line){flushParagraph();flushList();continue}
   const heading=line.match(/^(##|###)\s+(.+)$/);
   if(heading){flushParagraph();flushList();blocks.push({type:heading[1]==="##"?"h2":"h3",text:heading[2]});continue}
   const item=line.match(/^-\s+(\[\s\]\s+)?(.+)$/);
   if(item){flushParagraph();list.push({text:item[2],checklist:Boolean(item[1])});continue}
   flushList();paragraphs.push(line);
 }
 flushParagraph();flushList();
 return blocks;
}
