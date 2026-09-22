import {NextResponse} from "next/server";

export function GET(){
  return NextResponse.json({
    name:"Super-Service Studio",
    short_name:"SS Studio",
    description:"Gestion des photos et du contenu du site Super-Service.",
    start_url:"/studio",
    scope:"/studio",
    display:"standalone",
    background_color:"#f5f7f8",
    theme_color:"#10263b",
    icons:[
      {
        src:"/studio-icon.svg",
        sizes:"any",
        type:"image/svg+xml",
        purpose:"any"
      }
    ]
  },{
    headers:{
      "Content-Type":"application/manifest+json",
      "Cache-Control":"public, max-age=3600"
    }
  });
}
