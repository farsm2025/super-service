const CACHE="super-service-pwa-v3";
self.addEventListener("install",()=>self.skipWaiting());
self.addEventListener("activate",event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=="GET"||url.origin!==self.location.origin||url.pathname.startsWith("/api/")||url.pathname.startsWith("/gestion"))return;
  if(["style","script"].includes(event.request.destination)){
    event.respondWith(fetch(event.request).then(response=>{
      if(response.ok)caches.open(CACHE).then(cache=>cache.put(event.request,response.clone()));
      return response;
    }).catch(()=>caches.match(event.request)));
    return;
  }
  if(["image","font"].includes(event.request.destination)){
    event.respondWith(caches.open(CACHE).then(async cache=>{
      const hit=await cache.match(event.request);
      if(hit)return hit;
      const response=await fetch(event.request);
      if(response.ok)cache.put(event.request,response.clone());
      return response;
    }));
  }
});
self.addEventListener("push",event=>{
  let data={};
  try{data=event.data?event.data.json():{}}catch{data={}}
  event.waitUntil(self.registration.showNotification(data.title||"Rappel Super-Service",{
    body:data.body||"Un rendez-vous approche.",
    icon:"/logo-super-service.jpg",
    tag:data.tag||"super-service-reminder",
    renotify:true,
    data:{url:data.url||"/gestion"},
  }));
});
self.addEventListener("notificationclick",event=>{
  event.notification.close();
  const target=new URL(event.notification.data?.url||"/gestion",self.location.origin).toString();
  event.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(windows=>{
    const existing=windows.find(client=>client.url.startsWith(self.location.origin));
    if(existing){existing.navigate(target);return existing.focus()}
    return clients.openWindow(target);
  }));
});
