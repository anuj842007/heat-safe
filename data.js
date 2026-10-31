const WAGE=700; // assumed daily wage (Rs) for the simulated payout
const SITES=[{id:1,name:"Pune Metro Site",district:"Pune",lat:18.5204,lon:73.8567,imd:"yellow",demo:"green",demoT:"yellow"},{id:2,name:"Mumbai Tower Site",district:"Mumbai",lat:19.076,lon:72.8777,imd:"yellow",demo:"yellow",demoT:"orange"},{id:3,name:"Nagpur Road Work",district:"Nagpur",lat:21.1458,lon:79.0882,imd:"orange",demo:"orange",demoT:"red"},{id:4,name:"Latur Bridge Site",district:"Latur",lat:18.4088,lon:76.5604,imd:"orange",demo:"green",demoT:"orange"},{id:5,name:"Amravati Drain Work",district:"Amravati",lat:20.9374,lon:77.7796,imd:"red",demo:"red",demoT:"red"}]; // imd = demo district alert, enter manually from IMD
const POINTS=[[18.53,73.85,"water","Water point, Pune"],[19.08,72.88,"shade","Shade shelter, Mumbai"],[21.15,79.09,"water","Water booth, Nagpur"],[18.41,76.56,"shade","Shade shelter, Latur"],[20.94,77.78,"water","Water point, Amravati"]]; // demo points
// demo break records: [site, daysAgo, workers, breakHours, water, shade]
const SAMPLE=[[1,0,40,4,1,1],[1,1,38,4,1,1],[1,2,40,4,1,0],[2,0,60,4,1,0],[2,1,55,4,1,1],[3,1,30,3,0,0],[3,2,28,4,1,1],[4,1,25,4,1,1],[5,0,20,4,1,1],[5,2,22,4,1,1]];
const SC=[[3,"No drinking water",0],[3,"Not allowed to rest",1],[2,"No shade",0],[4,"Forced to work 12-4 PM",1]]; // demo worker complaints
const day=n=>Date.now()-n*864e5;
const get=k=>{try{return JSON.parse(localStorage.getItem(k)||"[]")}catch(e){return[]}};
const put=(k,r)=>localStorage.setItem(k,JSON.stringify([...get(k),r]));
const allLogs=()=>[...SAMPLE.map(a=>({site:a[0],ts:day(a[1]),workers:a[2],hrs:a[3],water:!!a[4],shade:!!a[5]})),...get("hs_logs")];
const allComplaints=()=>[...SC.map(a=>({site:a[0],type:a[1],ts:day(a[2])})),...get("hs_c")];
const allIncidents=()=>get("hs_i");
