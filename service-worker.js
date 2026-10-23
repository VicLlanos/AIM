const CACHE='emberfall-v2',FONT='emberfall-fonts-v1',SHELL=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png','./icon-512-maskable.png'];
const ok=r=>r&&(r.ok||r.type==='opaque');
const first=(r,name)=>caches.match(r).then(h=>h||fetch(r).then(res=>{if(ok(res)){const cp=res.clone();caches.open(name).then(c=>c.put(r,cp))}return res}));
const swr=(r,name)=>caches.open(name).then(c=>c.match(r).then(h=>{const n=fetch(r).then(res=>{if(ok(res))c.put(r,res.clone());return res}).catch(()=>h);return h||n}));
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.allSettled(SHELL.map(u=>c.add(u)))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE&&x!==FONT).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET')return;
  // Versioned libraries (Firebase SDK, Three.js): cache-first so the game starts offline
  if(u.hostname==='www.gstatic.com'||u.hostname==='cdnjs.cloudflare.com'){e.respondWith(first(r,CACHE));return}
  // Google Fonts: files never change, stylesheet refreshes in the background
  if(u.hostname==='fonts.gstatic.com'){e.respondWith(first(r,FONT));return}
  if(u.hostname==='fonts.googleapis.com'){e.respondWith(swr(r,FONT));return}
  if(u.origin!==location.origin)return; // never touch Firebase database/auth traffic
  // Own files: network first (fresh when online), cache fallback offline
  e.respondWith(fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}return res}).catch(()=>caches.match(r).then(h=>h||(r.mode==='navigate'?caches.match('./index.html'):Response.error()))));
});
