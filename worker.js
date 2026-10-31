const $=id=>document.getElementById(id);let lang=localStorage.hs_lang||"mr",cur=null,tm={},map=null;
SITES.forEach(s=>$("site").add(new Option(s.name,s.id)));$("site").value=localStorage.hs_site||1;
const tabs=document.querySelectorAll("[data-tab]");
tabs.forEach(b=>b.onclick=()=>{document.querySelectorAll(".pane").forEach(p=>p.hidden=p.id!=="p-"+b.dataset.tab);tabs.forEach(x=>x.classList.toggle("on",x===b));if(b.dataset.tab==="map")showMap()});
$("lang").value=lang;applyLang(lang);$("lang").onchange=()=>{lang=$("lang").value;localStorage.hs_lang=lang;applyLang(lang);render()};
const tile=()=>L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap"});
async function load(){const s=SITES.find(x=>x.id==$("site").value);localStorage.hs_site=s.id;$("panel").textContent="…";
 try{const w=await getWeather(s),n=new Date().getHours(),it=$("it").value,sh=$("shade").checked,r=riskLevel(w.t[n],w.h[n],it,sh),old=cur&&cur.s.id==s.id?cur.r.level:null;
  cur={s,w,n,it,sh,r};render();if(old&&old!==r.level&&RK[r.level]>=2)pushNote()}catch(e){$("panel").textContent=T[lang].err}}
function render(){if(!cur)return;const{s,w,n,r,it,sh}=cur,l=r.level,tb=dayRisk(w,it,sh,24);
 $("panel").innerHTML=`<div class="lvl ${l}">${LVL[lang][l]}</div><div class="scale">${["green","yellow","orange","red"].map(c=>`<i class="${c}${c===l?" on":""}"></i>`).join("")}</div><p class="msg">${MSG[lang][l]}</p>
<p>${w.t[n]}°C, ${w.h[n]}% humidity, feels like ${r.eff}°C ${w.cached?"(saved data, offline)":""}</p>
<div class="cmp"><span>IMD district alert</span><span class="badge s ${s.imd}">${LVL.en[s.imd]}</span><span>Your site</span><span class="badge s ${l}">${LVL.en[l]}</span></div>
<div class="cmp"><span>Tomorrow (forecast)</span>${tb?`<span class="badge s ${tb.level}">${LVL.en[tb.level]}</span><span>peak ${tb.t}°C around ${tb.h}:00</span>`:"<span>not available offline</span>"}</div>${tb&&RK[tb.level]>=2?"<p class='warn'>Tomorrow looks "+LVL.en[tb.level].toLowerCase()+". Start early and plan the 12-4 PM break.</p>":""}${RK[l]>RK[s.imd]?"<p class='warn'>Humidity and work type make your site riskier than the district alert.</p>":""}<details><summary>Why this level?</summary><p>${r.why}</p></details>`;
 let h="";for(let i=6;i<=19;i++){const x=riskLevel(w.t[i],w.h[i],it,sh).level;h+=`<li><span class="badge s ${x}">${i}:00</span> ${w.t[i]}°C, ${hourAction(i,x,lang)}</li>`}
 $("tt").innerHTML=h;$("wa").href="https://wa.me/?text="+encodeURIComponent(alertText(s.name,l,lang));
 $("board").innerHTML=`<h1 style="font-size:48px">${s.name}</h1><div class="lvl ${l}" style="font-size:90px">${LVL.mr[l]}</div><p style="font-size:34px">${MSG.mr[l]}</p><p style="font-size:30px">${T.mr.em}</p>`}
["site","it","shade"].forEach(i=>$(i).onchange=load);load();setInterval(load,6e5);
function pushNote(){if("Notification"in window&&Notification.permission==="granted"&&localStorage.hs_n&&cur)new Notification("HeatSetu: "+cur.s.name,{body:LVL[lang][cur.r.level]+". "+MSG[lang][cur.r.level]})}
$("nt").onclick=async()=>{if(!("Notification"in window))return alert("Alerts not supported in this browser.");if(await Notification.requestPermission()==="granted"){localStorage.hs_n=1;pushNote();$("nt").textContent="Alerts on ✓"}};
$("say").onclick=()=>{if(!cur)return;const u=new SpeechSynthesisUtterance(MSG[lang][cur.r.level]);u.lang=T[lang].vc;speechSynthesis.speak(u)};
let ml=null;
async function drawMap(){const when=+$("when").value,n=new Date().getHours();ml.clearLayers();
 await Promise.all(SITES.map(async s=>{let w=null,r={level:"n/a",why:"No data"};try{w=await getWeather(s)}catch(e){}try{r=siteLevel(s,w,n,when)}catch(e){}
  L.circleMarker([s.lat,s.lon],{radius:15,color:"#10243a",weight:1,fillColor:COL[r.level]||"#888",fillOpacity:.9}).addTo(ml).bindPopup(`<b>${s.name}</b><br>${when?"Tomorrow":"Today"}: ${LVL.en[r.level]||"No data"}<br><small>${r.why}</small><br>IMD: ${LVL.en[s.imd]}`)}))}
function showMap(){if(!map){map=L.map("wmap").setView([19.6,76.5],6);tile().addTo(map);ml=L.layerGroup().addTo(map);
 POINTS.forEach(p=>L.circleMarker([p[0],p[1]],{radius:7,color:"#fff",weight:2,fillColor:p[2]==="water"?"#1c7ed6":"#7048e8",fillOpacity:1}).addTo(map).bindPopup(p[3]+" (demo)"));drawMap()}
 setTimeout(()=>map.invalidateSize(),50)}
$("dm").checked=DEMO();$("dm").onchange=()=>{localStorage.hs_demo=$("dm").checked?"1":"0";if(ml)drawMap()};$("when").onchange=()=>{if(ml)drawMap()};
$("loc").onclick=()=>navigator.geolocation?navigator.geolocation.getCurrentPosition(p=>{const a=SITES.map(s=>[km(p.coords.latitude,p.coords.longitude,s.lat,s.lon),s]).sort((x,y)=>x[0]-y[0])[0];
 $("nr").textContent="Nearest site: "+a[1].name+", "+Math.round(a[0])+" km";$("site").value=a[1].id;load();L.marker([p.coords.latitude,p.coords.longitude]).addTo(map).bindPopup("You are here")},()=>$("nr").textContent="Location not shared."):0;
function ping(m){navigator.vibrate&&navigator.vibrate([300,150,300]);try{const a=new AudioContext(),o=a.createOscillator();o.connect(a.destination);o.frequency.value=880;o.start();setTimeout(()=>o.stop(),500)}catch(e){}alert(m)}
function timer(id,sec,msg,loop){clearInterval(tm[id]);const e=Date.now()+sec*1e3;
 tm[id]=setInterval(()=>{const r=Math.round((e-Date.now())/1e3);
  if(r<=0){clearInterval(tm[id]);$(id).textContent="00:00";ping(msg);if(loop)timer(id,sec,msg,loop)}else $(id).textContent=String(Math.floor(r/60)).padStart(2,"0")+":"+String(r%60).padStart(2,"0")},500)}
$("ws").onclick=()=>timer("wc",+$("wi").value,{mr:"पाणी प्या!",hi:"पानी पिएं!",en:"Drink water!"}[lang],1);
$("bs").onclick=()=>timer("bc",900,{mr:"विश्रांती संपली",hi:"आराम खत्म",en:"Rest over"}[lang]);
const gk="hs_g"+new Date().toDateString();let g=+localStorage[gk]||0;$("gc").textContent=g;$("gp").onclick=()=>{g++;localStorage[gk]=g;$("gc").textContent=g};
$("chk").onclick=()=>{const a=$("q1").checked,b=$("q2").checked||$("q3").checked;
 $("sc").innerHTML=b?"<span class='badge red'>Emergency</span> Call 108 now. Shade, loosen clothes, cool with water. / तात्काळ १०८ ला कॉल करा.":a?"Rest in shade, drink water or ORS. Not better in 15 min: call 108. / सावलीत विश्रांती घ्या, पाणी प्या.":"No warning signs. Keep drinking water. / पाणी पीत रहा.";$("inc").hidden=!(a||b)};
$("inc").onclick=()=>{put("hs_i",{site:$("site").value,ts:Date.now(),severe:$("q2").checked||$("q3").checked});$("inc").textContent="Logged"};
$("rp").onclick=()=>{put("hs_c",{site:$("site").value,type:$("ct").value,ts:Date.now()});$("rm").textContent="Sent to officers. Thank you. / पाठवले, धन्यवाद."};
$("log").onclick=()=>{const s=SITES.find(x=>x.id==$("site").value),r={site:s.id,ts:Date.now(),workers:+$("wk").value||0,hrs:+$("hr").value||0,water:$("wt").checked,shade:$("sd").checked,photo:$("ph").files[0]?$("ph").files[0].name:""};
 const d=p=>{let m="Location not shared.";if(p){const k=km(p.coords.latitude,p.coords.longitude,s.lat,s.lon);r.gps=p.coords.latitude.toFixed(4)+","+p.coords.longitude.toFixed(4);r.near=k<2;m=r.near?"Location matches site.":"Warning: "+k.toFixed(1)+" km from site."}
  put("hs_logs",r);$("lm").textContent="Saved "+new Date(r.ts).toLocaleTimeString()+". "+m+(r.photo?" Photo attached.":"")};
 navigator.geolocation?navigator.geolocation.getCurrentPosition(d,()=>d(null)):d(null)};
$("print").onclick=()=>{document.body.classList.add("pb");$("board").style.display="block";window.print();$("board").style.display="none";document.body.classList.remove("pb")};
$("bds").onclick=()=>timer("bd",3600,{mr:"सोबत्याला विचारा: चक्कर आहे का? पाणी प्या.",hi:"साथी से पूछें: चक्कर तो नहीं? पानी पिएं।",en:"Check your partner: dizzy? Drink water."}[lang],1);
$("sos").onclick=()=>{const n=SITES.find(x=>x.id==$("site").value).name,go=p=>window.open("https://wa.me/?text="+encodeURIComponent("Heat emergency. I need help at "+n+"."+(p?" https://maps.google.com/?q="+p.coords.latitude+","+p.coords.longitude:"")),"_blank");navigator.geolocation?navigator.geolocation.getCurrentPosition(go,()=>go(null)):go(null)};
