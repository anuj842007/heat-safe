// Heat index uses the standard Rothfusz formula. The risk cutoffs and the work/shade adjustments are our own demo values, to be set with the authorities before a pilot.
function heatIndexC(t,rh){const T=t*9/5+32;let h;
 if(T<80)h=.5*(T+61+(T-68)*1.2+rh*.094);
 else h=-42.379+2.04901523*T+10.14333127*rh-.22475541*T*rh-.00683783*T*T-.05481717*rh*rh+.00122874*T*T*rh+.00085282*T*rh*rh-.00000199*T*T*rh*rh;
 return(h-32)*5/9}
function riskLevel(t,rh,it,sh){const a={light:-3,medium:0,heavy:3},hi=heatIndexC(t,rh),e=hi+a[it]+(sh?-2:2),level=e<32?"green":e<39?"yellow":e<45?"orange":"red";
 return{level,eff:Math.round(e*10)/10,why:t+"°C with "+rh+"% humidity feels like "+Math.round(hi)+"°C. "+it+" work "+(a[it]>=0?"+":"")+a[it]+", "+(sh?"shade -2":"open sun +2")+" = "+Math.round(e)+"°C. Rule (placeholder): under 32 low, 32-38 moderate, 39-44 high, 45+ extreme."}}
async function getWeather(s){const k="hs_w"+s.id,u=`https://api.open-meteo.com/v1/forecast?latitude=${s.lat}&longitude=${s.lon}&hourly=temperature_2m,relative_humidity_2m&timezone=Asia%2FKolkata&forecast_days=2`;
 try{const d=await(await fetch(u)).json(),w={t:d.hourly.temperature_2m,h:d.hourly.relative_humidity_2m};localStorage[k]=JSON.stringify(w);return w}
 catch(x){if(localStorage[k]){const w=JSON.parse(localStorage[k]);w.cached=1;return w}throw x}}
const LVL={mr:{green:"कमी धोका",yellow:"मध्यम धोका",orange:"जास्त धोका",red:"अतिधोका"},hi:{green:"कम खतरा",yellow:"मध्यम खतरा",orange:"ज़्यादा खतरा",red:"अति खतरा"},en:{green:"Low risk",yellow:"Moderate risk",orange:"High risk",red:"Extreme risk"}};
const MSG={mr:{green:"सामान्य काम सुरू ठेवा.",yellow:"सावधान! दर ३० मिनिटांनी पाणी प्या.",orange:"धोका! ४५ मिनिटे काम, १५ मिनिटे सावलीत विश्रांती.",red:"अतिधोका! काम थांबवा, सावलीत विश्रांती घ्या."},
hi:{green:"सामान्य काम जारी रखें।",yellow:"सावधान! हर 30 मिनट में पानी पिएं।",orange:"खतरा! 45 मिनट काम, 15 मिनट छाँव में आराम।",red:"अति खतरा! काम रोकें, छाँव में आराम करें।"},
en:{green:"Work as normal.",yellow:"Be careful. Drink water every 30 minutes.",orange:"Danger. Work 45 minutes, rest 15 in shade.",red:"Extreme. Stop work, rest in shade."}};
const ACT={mr:{off:"सुट्टी",brk:"विश्रांती (१२-४)",brkR:"विश्रांती (धोका)",o:"४५ मिनिटे काम, १५ विश्रांती",y:"काम, दर ३० मिनिटांनी पाणी",g:"सामान्य काम"},
hi:{off:"छुट्टी",brk:"आराम (12-4)",brkR:"आराम (खतरा)",o:"45 मिनट काम, 15 आराम",y:"काम, हर 30 मिनट पानी",g:"सामान्य काम"},
en:{off:"Off hours",brk:"BREAK (SOP 12-4)",brkR:"BREAK (high risk)",o:"Work 45, rest 15",y:"Work, water every 30 min",g:"Normal work"}};
function hourAction(h,l,lg="en"){const a=ACT[lg];
 if(h<6||h>19)return a.off;if(h>=12&&h<16&&(l==="orange"||l==="red"))return a.brk;
 return l==="red"?a.brkR:l==="orange"?a.o:l==="yellow"?a.y:a.g}
const T={mr:{today:"आज",tools:"साधने",help:"मदत",report:"तक्रार",sup:"पर्यवेक्षक",site:"कामाचे ठिकाण",work:"कामाचा प्रकार",shade:"सावली आहे",voice:"आवाज ऐका",share:"WhatsApp वर पाठवा",water:"पाणी आठवण",brk:"विश्रांती टायमर",start:"सुरू करा",call:"१०८ ला कॉल करा",ors:"ओआरएस घरी बनवा",err:"हवामान मिळाले नाही. इंटरनेट तपासा.",head:"उष्णता सूचना",em:"चक्कर आल्यास १०८ ला कॉल करा.",vc:"mr-IN"},
hi:{today:"आज",tools:"साधन",help:"मदद",report:"शिकायत",sup:"पर्यवेक्षक",site:"काम की जगह",work:"काम का प्रकार",shade:"छाँव है",voice:"आवाज़ सुनें",share:"WhatsApp पर भेजें",water:"पानी याद दिलाएं",brk:"आराम टाइमर",start:"शुरू करें",call:"108 पर कॉल करें",ors:"घर पर ओआरएस बनाएं",err:"मौसम नहीं मिला। इंटरनेट जांचें।",head:"गर्मी सूचना",em:"चक्कर आने पर 108 पर कॉल करें।",vc:"hi-IN"},
en:{today:"Today",tools:"Tools",help:"Help",report:"Report",sup:"Supervisor",site:"Work site",work:"Type of work",shade:"Shade available",voice:"Play voice",share:"Share on WhatsApp",water:"Water reminder",brk:"Rest timer",start:"Start",call:"Call 108",ors:"Make ORS at home",err:"Could not load weather. Check internet.",head:"Heat alert",em:"If dizzy or faint, call 108.",vc:"en-IN"}};
const alertText=(n,l,g)=>`${T[g].head} - ${n}\n${LVL[g][l]}\n${MSG[g][l]}\n${T[g].em}`;
function applyLang(g){document.querySelectorAll("[data-t]").forEach(e=>e.textContent=T[g][e.dataset.t])}
function siteStats(id){const L=allLogs().filter(l=>l.site==id),d=new Date().toDateString(),td=L.filter(l=>new Date(l.ts).toDateString()===d),ok=l=>l.water&&l.shade;
 return{status:!td.length?"Missed":td.some(ok)?"Followed":"Partly",stars:L.length?Math.max(1,Math.round(5*L.filter(ok).length/L.length)):0,pay:Math.round(L.reduce((a,l)=>a+l.workers*l.hrs*WAGE/8,0))}}

const RK={green:0,yellow:1,orange:2,red:3},COL={green:"#2e9e5b",yellow:"#e5a400",orange:"#ee6c1a",red:"#d62839"};
Object.assign(T.mr,{map:"नकाशा",alerts:"सूचना चालू करा",glass:"आजचे पाणी (ग्लास)",rights:"माझे हक्क"});
Object.assign(T.hi,{map:"नक्शा",alerts:"सूचना चालू करें",glass:"आज का पानी (गिलास)",rights:"मेरे अधिकार"});
Object.assign(T.en,{map:"Map",alerts:"Turn on alerts",glass:"Water glasses today",rights:"My rights"});
const km=(a,b,c,d)=>{const r=Math.PI/180,x=Math.sin((c-a)*r/2)**2+Math.cos(a*r)*Math.cos(c*r)*Math.sin((d-b)*r/2)**2;return 12742*Math.asin(Math.sqrt(x))};

const DEMO=()=>localStorage.hs_demo!=="0"; // demo colours ON by default; untick to use live weather
function dayRisk(w,it,sh,off){let b={level:"green",eff:-99};for(let h=6;h<=19;h++){const i=off+h;if(!w||w.t[i]==null)return null;const r=riskLevel(w.t[i],w.h[i],it,sh);if(r.eff>b.eff)b={level:r.level,eff:r.eff,h,t:w.t[i]}}return b}
function siteLevel(s,w,n,when,it="medium",sh=false){if(DEMO())return{level:when?s.demoT:s.demo,why:"Demo colour (sample data)"};
 if(when){const b=dayRisk(w,it,sh,24);return b?{level:b.level,why:"Tomorrow peak "+b.t+"°C around "+b.h+":00"}:{level:"n/a",why:"No forecast"}}
 const r=riskLevel(w.t[n],w.h[n],it,sh);return{level:r.level,why:r.why}}
