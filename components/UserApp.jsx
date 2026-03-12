'use client'
import { useState, useEffect, useRef, useMemo, useCallback } from "react";

/* ─── Inject libs + styles ─────────────────────────────────────────────────── */
// Load JsBarcode synchronously via script tag
if (!window.__wejhaLibsLoaded) {
  const _s = document.createElement("script");
  _s.src = "https://cdnjs.cloudflare.com/ajax/libs/jsbarcode/3.11.5/JsBarcode.all.min.js";
  document.head.appendChild(_s);
  window.__wejhaLibsLoaded = true;
}

if (!document.getElementById("wj6-style")) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&family=JetBrains+Mono:wght@700&display=swap";
  document.head.appendChild(link);
  const s = document.createElement("style");
  s.id = "wj6-style";
  s.textContent = `
    html,body{margin:0;padding:0;font-family:'Tajawal',sans-serif;direction:rtl;background:#080608;}
    *{box-sizing:border-box;}
    input,button,select,textarea{font-family:'Tajawal',sans-serif;}
    input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;}
    ::-webkit-scrollbar{width:3px;height:3px;}::-webkit-scrollbar-thumb{background:#2a2a2a;border-radius:99px;}
    @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes popIn{0%{opacity:0;transform:scale(.82)}65%{transform:scale(1.04)}100%{opacity:1;transform:scale(1)}}
    @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.45;transform:scale(.93)}}
    @keyframes scanLine{0%{top:6px}100%{top:calc(100% - 6px)}}
    @keyframes checkPop{0%{transform:scale(0)}70%{transform:scale(1.25)}100%{transform:scale(1)}}
    @keyframes savingsPop{0%{opacity:0;transform:scale(.8) translateY(10px)}100%{opacity:1;transform:scale(1) translateY(0)}}
    @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
    .fu{animation:fadeUp .38s cubic-bezier(.22,1,.36,1) both}
    .fi{animation:fadeIn .28s ease both}
    .pi{animation:popIn .42s cubic-bezier(.34,1.56,.64,1) both}
    .su{animation:slideUp .32s cubic-bezier(.22,1,.36,1) both}
    .pu{animation:pulse 1.7s ease infinite}
    .cp{animation:checkPop .4s cubic-bezier(.34,1.56,.64,1) both}
    .sp{animation:savingsPop .5s cubic-bezier(.34,1.56,.64,1) both}
    .tap:active{transform:scale(.95)!important;transition:transform .08s!important}
    .lift{transition:transform .18s,box-shadow .18s;}.lift:hover{transform:translateY(-2px);}
    .fi-inp:focus{border-color:#8B1F24!important;box-shadow:0 0 0 3px #8B1F2420!important;outline:none!important}
    .otp:focus{border-color:#8B1F24!important;background:#1c0e11!important;outline:none!important}
    .barcode-wrap svg{max-width:100%;height:auto;}
  `;
  document.head.appendChild(s);
}

/* ─── Design tokens ────────────────────────────────────────────────────────── */
const T = {
  bg:"#080608", surf:"#110F15", card:"#1A1720", cardHi:"#201D28",
  border:"#26232E", borderHi:"#353048",
  maroon:"#8B1F24", m2:"#6A171B", mGlow:"#8B1F2430",
  gold:"#C9A84C", gDim:"#9A7E38",
  text:"#EEE9F5", mid:"#887E98", dim:"#413C52",
  green:"#2ECA88", greenBg:"#091D13",
  red:"#E04848", redBg:"#1C0808",
  blue:"#4A9EDD",
};

const LANGS = [
  {code:"ar",name:"العربية",flag:"🇶🇦"},{code:"en",name:"English",flag:"🇬🇧"},
  {code:"ur",name:"اُردو",flag:"🇵🇰"},{code:"hi",name:"हिन्दी",flag:"🇮🇳"},
];

/* ─── Helpers ──────────────────────────────────────────────────────────────── */
function haversine(la1,lo1,la2,lo2){
  const R=6371000,dL=(la2-la1)*Math.PI/180,dl=(lo2-lo1)*Math.PI/180;
  const a=Math.sin(dL/2)**2+Math.cos(la1*Math.PI/180)*Math.cos(la2*Math.PI/180)*Math.sin(dl/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}
const fmtD=m=>m<1000?`${Math.round(m)} م`:`${(m/1000).toFixed(1)} كم`;
function fmtClock(ms){
  if(ms<=0)return"00:00";
  const m=Math.floor(ms/60000),s=Math.floor((ms%60000)/1000);
  return`${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}
function makeCode(phone,dealId,qty){
  const A="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let h=0,src=`${phone}::${dealId}::${qty}::${Math.floor(Date.now()/86400000)}`;
  for(let i=0;i<src.length;i++)h=Math.imul(31,h)+src.charCodeAt(i)|0;
  let seed=Math.abs(h),out="";
  for(let i=0;i<8;i++){out+=A[seed%A.length];seed=Math.abs(Math.imul(seed,16807)+i*31|0)%999983;}
  return out.slice(0,4)+"-"+out.slice(4);
}
function openMaps(lat,lng,name){
  window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(name)}`,"_blank");
}
function sendWA(phone,code,store,lat,lng,endsAt,qtySummary){
  const mapUrl=`https://maps.google.com/?q=${lat},${lng}`;
  const until=new Date(endsAt).toLocaleTimeString("ar-QA",{hour:"2-digit",minute:"2-digit"});
  const msg=`🏷️ *وِجهة قطر*\n\n🏪 ${store}\n🎫 الكود: *${code}*${qtySummary?`\n📦 ${qtySummary}`:""}\n📍 ${mapUrl}\n⏰ صالح حتى: *${until}*\n\n🔒 للاستخدام مرة واحدة — أبرز الباركود عند الكاشير`;
  window.open(`https://wa.me/${phone.replace(/\D/g,"")}?text=${encodeURIComponent(msg)}`,"_blank");
}

/* ─── Barcode component ────────────────────────────────────────────────────── */
function Barcode({code,color="#fff",bg="transparent",height=70,used=false}){
  const svgRef=useRef(null);
  useEffect(()=>{
    if(!svgRef.current) return;
    function render(){
      if(!window.JsBarcode){setTimeout(render,200);return;}
      try{
        JsBarcode(svgRef.current, code.replace("-",""), {
          format:"CODE128", displayValue:false,
          lineColor:used?"#555":color,
          background:bg, height, margin:0,
          width:1.8,
        });
      }catch(e){console.warn("barcode",e);}
    }
    render();
  },[code,color,used]);
  return(
    <div className="barcode-wrap" style={{opacity:used?.4:1,transition:"opacity .3s"}}>
      <svg ref={svgRef}/>
    </div>
  );
}

/* ─── Stores data ──────────────────────────────────────────────────────────── */
const STORES=[
  {id:"s1",name:"مطعم الدوحة الملكي",emoji:"🍖",cat:"مطاعم",
   desc:"مشاوٍ فاخرة وأجواء قطرية أصيلة في قلب الدوحة",
   lat:25.2854,lng:51.5310,radius:500,ac:"#8B1F24",rating:4.8,reviews:312,
   img:"https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=70",
   deals:[
     {id:"d1",type:"invoice_paid",title:"خصم 30% على الفاتورة",disc:30,minSpend:150,
      priceQAR:30,originalPrice:150,maxCodes:60,expiresHours:null,products:[],bogo:false,
      savedValue:60, // estimated saving per use
      desc:"ادفع 30 ر.ق • أبرز الباركود للكاشير • خصم 30% من فاتورتك"},
     {id:"d2",type:"product",title:"طبق لحم مشوي فاخر",disc:0,minSpend:0,
      priceQAR:55,originalPrice:90,maxCodes:25,expiresHours:3,
      products:[{name:"طبق لحم",max:10}],bogo:false,savedValue:35,
      desc:"طبق لحم مشوي فاخر بسعر مخفض حصري"},
   ]},
  {id:"s2",name:"برجر هاوس الدوحة",emoji:"🍔",cat:"مطاعم",
   desc:"أشهى البرجر الأمريكي الأصيل — وجبات يومية",
   lat:25.2870,lng:51.5295,radius:400,ac:"#D94040",rating:4.6,reviews:508,
   img:"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=70",
   deals:[
     {id:"d3",type:"bogo",title:"اشترِ برجر واحصل على آخر مجاناً",disc:50,minSpend:0,
      priceQAR:0,originalPrice:50,maxCodes:40,expiresHours:null,
      products:[{name:"أي برجر",max:4}],bogo:true,savedValue:25,
      desc:"ادفع ثمن برجر والثاني هدية"},
     {id:"d4",type:"invoice_paid",title:"خصم 20% على الوجبة الكاملة",disc:20,minSpend:80,
      priceQAR:15,originalPrice:80,maxCodes:80,expiresHours:null,products:[],bogo:false,savedValue:20,
      desc:"وجبة كاملة بخصم 20%"},
   ]},
  {id:"s3",name:"كافيه لؤلؤة الخليج",emoji:"☕",cat:"مقاهي",
   desc:"قهوة مختصة بإطلالة على الخليج العربي",
   lat:25.2890,lng:51.5280,radius:350,ac:"#C9A84C",rating:4.9,reviews:245,
   img:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=70",
   deals:[
     {id:"d5",type:"product",title:"قهوة عربية أو إسبريسو",disc:0,minSpend:0,
      priceQAR:12,originalPrice:30,maxCodes:50,expiresHours:2,
      products:[{name:"قهوة عربية",max:50},{name:"إسبريسو",max:50},{name:"كابتشينو",max:50}],
      bogo:false,savedValue:18,
      desc:"اختر نوع قهوتك وعدد الأكواب — حتى 50 كوب"},
     {id:"d6",type:"bogo",title:"قهوتك الثانية مجاناً",disc:50,minSpend:0,
      priceQAR:0,originalPrice:30,maxCodes:35,expiresHours:null,
      products:[{name:"أي مشروب",max:2}],bogo:true,savedValue:15,
      desc:"صالح على جميع المشروبات الساخنة"},
   ]},
  {id:"s4",name:"ستارباكس ويست باي",emoji:"⭐",cat:"مقاهي",
   desc:"مشروباتك المفضلة في غرب الدوحة",
   lat:25.2910,lng:51.5260,radius:600,ac:"#00704A",rating:4.5,reviews:890,
   img:"https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?w=600&q=70",
   deals:[
     {id:"d7",type:"invoice_paid",title:"خصم 25% على الفاتورة",disc:25,minSpend:50,
      priceQAR:20,originalPrice:50,maxCodes:100,expiresHours:null,products:[],bogo:false,savedValue:30,
      desc:"ادفع 20 ر.ق • احضر للمتجر • وفّر 25%"},
   ]},
  {id:"s5",name:"بوتيك وردة قطر",emoji:"👗",cat:"تسوق",
   desc:"أزياء قطرية فاخرة وعبايات مصممة يدوياً",
   lat:25.2820,lng:51.5340,radius:500,ac:"#9B6FD4",rating:4.7,reviews:178,
   img:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=70",
   deals:[
     {id:"d8",type:"invoice_paid",title:"خصم 40% على العبايات",disc:40,minSpend:300,
      priceQAR:40,originalPrice:300,maxCodes:25,expiresHours:null,products:[],bogo:false,savedValue:120,
      desc:"ادفع 40 ر.ق • وفّر 40% من فاتورتك"},
   ]},
  {id:"s6",name:"الأمين هايبر ماركت",emoji:"🛒",cat:"تسوق",
   desc:"أكبر تشكيلة منتجات طازجة وعروض يومية",
   lat:25.2800,lng:51.5290,radius:700,ac:"#2ECA88",rating:4.4,reviews:621,
   img:"https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&q=70",
   deals:[
     {id:"d10",type:"invoice_paid",title:"خصم 15% على فاتورة التسوق",disc:15,minSpend:100,
      priceQAR:10,originalPrice:100,maxCodes:200,expiresHours:null,products:[],bogo:false,savedValue:15,
      desc:"ادفع 10 ر.ق • وفّر 15% من مشترياتك"},
   ]},
  {id:"s7",name:"صيدلية الرفاء",emoji:"💊",cat:"صيدليات",
   desc:"صيدلية متكاملة 24/7",
   lat:25.2840,lng:51.5270,radius:400,ac:"#4A9EDD",rating:4.8,reviews:203,
   img:"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=70",
   deals:[
     {id:"d12",type:"invoice_paid",title:"خصم 20% على منتجات العناية",disc:20,minSpend:80,
      priceQAR:15,originalPrice:80,maxCodes:60,expiresHours:null,products:[],bogo:false,savedValue:16,
      desc:"ادفع 15 ر.ق • وفّر 20%"},
   ]},
  {id:"s8",name:"سبا لوتس",emoji:"🧖",cat:"سبا",
   desc:"جلسات استرخاء فاخرة",
   lat:25.2865,lng:51.5325,radius:600,ac:"#C080A8",rating:4.9,reviews:156,
   img:"https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=70",
   deals:[
     {id:"d13",type:"invoice_paid",title:"خصم 35% على جلسة سبا",disc:35,minSpend:200,
      priceQAR:50,originalPrice:200,maxCodes:20,expiresHours:null,products:[],bogo:false,savedValue:70,
      desc:"ادفع 50 ر.ق • وفّر 35%"},
     {id:"d14",type:"bogo",title:"جلستان بسعر جلسة",disc:50,minSpend:0,
      priceQAR:0,originalPrice:160,maxCodes:15,expiresHours:null,
      products:[{name:"جلسة مساج",max:2}],bogo:true,savedValue:80,
      desc:"احضر مع صديقك وادفعا جلسة واحدة"},
   ]},
  {id:"s9",name:"نادي الدوحة الرياضي",emoji:"🏋️",cat:"رياضة",
   desc:"مرافق رياضية حديثة",
   lat:25.2835,lng:51.5350,radius:800,ac:"#FF7A3C",rating:4.6,reviews:412,
   img:"https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=70",
   deals:[
     {id:"d15",type:"invoice_paid",title:"خصم 30% على اشتراك شهري",disc:30,minSpend:0,
      priceQAR:60,originalPrice:150,maxCodes:30,expiresHours:null,products:[],bogo:false,savedValue:90,
      desc:"ادفع 60 ر.ق • وفّر 30% من الاشتراك"},
   ]},
];

const CATS=["الكل","مطاعم","مقاهي","تسوق","صيدليات","سبا","رياضة"];

/* ─── Atoms ────────────────────────────────────────────────────────────────── */
const Tag=({bg,color,children,sx={}})=>(
  <span style={{background:bg,color,borderRadius:99,padding:"3px 10px",fontSize:11,fontWeight:700,lineHeight:1.7,...sx}}>{children}</span>
);
const Spin=({size=17,color="#fff"})=>(
  <div style={{width:size,height:size,border:`2.5px solid ${color}33`,borderTopColor:color,borderRadius:"50%",animation:"spin .75s linear infinite",flexShrink:0}}/>
);

/* ─── Countdown ring ───────────────────────────────────────────────────────── */
function Ring({endsAt,color,totalMs}){
  const[rem,setRem]=useState(Math.max(0,endsAt-Date.now()));
  useEffect(()=>{const id=setInterval(()=>setRem(Math.max(0,endsAt-Date.now())),1000);return()=>clearInterval(id);},[endsAt]);
  const C=2*Math.PI*26,dash=C*(rem/Math.max(totalMs,1)),hot=rem<5*60000;
  return(
    <div style={{position:"relative",width:62,height:62,flexShrink:0}}>
      <svg width={62} height={62} style={{transform:"rotate(-90deg)"}}>
        <circle cx={31} cy={31} r={26} fill="none" stroke={T.border} strokeWidth={5}/>
        <circle cx={31} cy={31} r={26} fill="none" stroke={hot?T.red:color} strokeWidth={5}
          strokeLinecap="round" strokeDasharray={`${dash} ${C}`} style={{transition:"stroke-dasharray 1s linear"}}/>
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        <span style={{fontSize:10,fontWeight:800,color:hot?T.red:T.text,fontFamily:"monospace"}}>{fmtClock(rem)}</span>
        <span style={{fontSize:8,color:T.dim}}>متبقي</span>
      </div>
    </div>
  );
}

/* ─── Qty selector ─────────────────────────────────────────────────────────── */
function QtyBox({label,max=50,val,onChange,color}){
  return(
    <div style={{background:T.surf,borderRadius:14,padding:"10px 14px",border:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
      <span style={{fontSize:13,color:T.mid,fontWeight:600,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{label}</span>
      <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
        <button className="tap" onClick={()=>onChange(Math.max(1,val-1))} style={{width:32,height:32,borderRadius:9,border:`1px solid ${T.border}`,background:T.card,color:T.text,fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
        <input type="number" min={1} max={max} value={val}
          onChange={e=>onChange(Math.min(max,Math.max(1,Number(e.target.value)||1)))}
          style={{width:50,textAlign:"center",padding:"5px 2px",borderRadius:9,border:`1.5px solid ${color}`,background:T.card,color,fontWeight:900,fontSize:15,outline:"none"}}/>
        <button className="tap" onClick={()=>onChange(Math.min(max,val+1))} style={{width:32,height:32,borderRadius:9,border:`1px solid ${color}`,background:`${color}22`,color,fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
      </div>
    </div>
  );
}

/* ─── Apple Pay sheet ──────────────────────────────────────────────────────── */
function PaySheet({deal,store,qty,onPaid,onClose}){
  const[st,setSt]=useState("idle");
  const isInv=deal.type==="invoice_paid";
  const total=(deal.priceQAR*(isInv?1:qty)).toFixed(2);
  function pay(){setSt("proc");setTimeout(()=>{setSt("done");setTimeout(onPaid,1100);},2000);}
  return(
    <div className="fi" onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",zIndex:90,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div className="su" onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:480,background:T.surf,borderRadius:"26px 26px 0 0",padding:"26px 22px 42px",border:`1px solid ${T.border}`}}>
        <div style={{width:36,height:4,background:T.border,borderRadius:99,margin:"0 auto 20px"}}/>
        <div style={{textAlign:"center",marginBottom:18}}>
          <div style={{fontSize:44,marginBottom:10}}>{st==="done"?"✅":"🍎"}</div>
          <h3 style={{fontWeight:900,fontSize:20,color:T.text,marginBottom:4}}>{st==="done"?"تم الدفع!":"Apple Pay"}</h3>
          <p style={{color:T.mid,fontSize:13}}>{store.name}</p>
        </div>
        {st!=="done"&&(
          <>
            <div style={{background:T.card,borderRadius:16,padding:16,marginBottom:16,border:`1px solid ${T.border}`}}>
              {isInv&&(
                <div style={{background:`${T.green}14`,borderRadius:12,padding:"10px 13px",marginBottom:12,border:`1px solid ${T.green}33`}}>
                  <p style={{fontSize:12,color:T.green,fontWeight:700,marginBottom:3}}>💡 كيف يعمل هذا الكوبون؟</p>
                  <p style={{fontSize:11,color:T.mid,lineHeight:1.7}}>① ادفع الآن ② احضر للمتجر ③ أبرز الباركود ④ احصل على {deal.disc}% خصم</p>
                </div>
              )}
              <div style={{display:"flex",justifyContent:"space-between",paddingTop:8,borderTop:`1px solid ${T.border}`}}>
                <span style={{color:T.text,fontWeight:800}}>تدفع الآن</span>
                <span style={{color:T.gold,fontWeight:900,fontSize:20}}>{total} ر.ق</span>
              </div>
            </div>
            <button className="tap" onClick={pay} disabled={st==="proc"} style={{width:"100%",padding:"15px",borderRadius:16,border:"none",background:st==="proc"?T.border:"#000",color:"#fff",fontWeight:900,fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
              {st==="proc"?<><Spin/><span>جاري المعالجة...</span></>:<><span style={{fontSize:22}}>🍎</span><span>ادفع {total} ر.ق</span></>}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Barcode Modal (full screen) ──────────────────────────────────────────── */
function BarcodeModal({code,store,deal,endsAt,totalMs,qty,qtySummary,onClose}){
  return(
    <div className="fi" onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.95)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div className="pi" onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:360,background:"#fff",borderRadius:28,padding:"28px 20px 24px",textAlign:"center"}}>
        <p style={{fontWeight:900,fontSize:16,color:"#111",marginBottom:4}}>{store.name}</p>
        <p style={{fontSize:13,color:"#666",marginBottom:18}}>{deal.title}</p>
        
        <div style={{background:"#fafafa",borderRadius:16,padding:"16px 8px 8px",marginBottom:12,border:"1px solid #eee"}}>
          <Barcode code={code} color="#111" bg="#fafafa" height={80}/>
          <p style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,fontSize:20,color:"#111",letterSpacing:3,marginTop:8}}>{code}</p>
        </div>

        {qty>1&&<p style={{fontSize:12,color:"#888",marginBottom:8}}>{qtySummary}</p>}

        <div style={{display:"flex",justifyContent:"center",gap:10,marginBottom:18}}>
          <Ring endsAt={endsAt} color={store.ac} totalMs={totalMs}/>
        </div>

        <div style={{background:`${store.ac}15`,borderRadius:14,padding:"10px 14px",marginBottom:18,border:`1px solid ${store.ac}33`}}>
          <p style={{fontSize:12,color:store.ac,fontWeight:700}}>
            📍 أبرز هذا الباركود للكاشير في {store.name}
          </p>
        </div>

        <button className="tap" onClick={onClose} style={{width:"100%",padding:"12px",borderRadius:14,border:"none",background:"#111",color:"#fff",fontWeight:800,fontSize:14,cursor:"pointer"}}>
          إغلاق ✕
        </button>
      </div>
    </div>
  );
}

/* ─── Deal Card ────────────────────────────────────────────────────────────── */
function DealCard({deal,store,phone,claimedMap,onClaim,globalUsed,onUseCode}){
  const initQtys=()=>deal.products.reduce((a,p)=>({...a,[p.name]:1}),{});
  const[showQty,setShowQty]=useState(false);
  const[qtys,setQtys]=useState(initQtys);
  const[showPay,setShowPay]=useState(false);
  const[loading,setLoading]=useState(false);
  const[copied,setCopied]=useState(false);
  const[showBC,setShowBC]=useState(false);

  const claimed=claimedMap[deal.id];
  const expired=claimed?.endsAt&&Date.now()>claimed.endsAt;
  const isUsed=claimed?.usedAt!=null;
  const totalQty=Object.values(qtys).reduce((a,v)=>a+v,0);
  const isInv=deal.type==="invoice_paid";
  const isPaid=isInv||deal.priceQAR>0;
  const needsQty=deal.products.length>0;
  // remaining codes (global shared state)
  const remaining=(globalUsed[deal.id]!=null)?(deal.maxCodes-globalUsed[deal.id]):deal.maxCodes;

  function discLabel(){
    if(deal.bogo)return"1+1";
    if(isInv)return`${deal.disc}%`;
    if(deal.priceQAR>0)return`${deal.priceQAR}ر.ق`;
    return"مجاناً";
  }

  function doGenerate(paid=false){
    setLoading(true);
    const mins=deal.expiresHours?deal.expiresHours*60:30;
    const endsAt=Date.now()+mins*60000;
    const code=makeCode(phone,deal.id,totalQty);
    const qtySummary=needsQty?Object.entries(qtys).map(([k,v])=>`${k}: ${v}`).join(" • "):null;
    setTimeout(()=>{
      onClaim(deal.id,{code,qtys:{...qtys},totalQty,endsAt,paid,totalMs:mins*60000,qtySummary,
        storeName:store.name,storeLat:store.lat,storeLng:store.lng,dealTitle:deal.title,storeAc:store.ac,
        savedValue:deal.savedValue||0,usedAt:null});
      setLoading(false);setShowQty(false);
    },900);
  }

  function copyAndWA(){
    navigator.clipboard?.writeText(claimed.code).catch(()=>{});
    setCopied(true);setTimeout(()=>setCopied(false),2500);
    sendWA(phone,claimed.code,store.name,store.lat,store.lng,claimed.endsAt,claimed.qtySummary);
  }

  return(
    <div className="lift" style={{background:T.card,borderRadius:20,overflow:"hidden",
      border:`1px solid ${isUsed?"#2ECA8833":claimed&&!expired?store.ac+"44":T.border}`,
      boxShadow:claimed&&!expired&&!isUsed?`0 4px 20px ${store.ac}22`:"none"}}>
      <div style={{height:3,background:isUsed?`linear-gradient(90deg,${T.green},${T.green}55)`:`linear-gradient(90deg,${store.ac},${store.ac}55)`}}/>
      <div style={{padding:"14px 16px 16px"}}>
        {/* header */}
        <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:10}}>
          <div style={{flex:1,minWidth:0}}>
            <p style={{fontWeight:800,fontSize:14,color:T.text,marginBottom:3,lineHeight:1.3}}>{deal.title}</p>
            <p style={{fontSize:12,color:T.dim,lineHeight:1.5}}>{deal.desc}</p>
          </div>
          <div style={{background:isUsed?T.green:store.ac,color:"#fff",borderRadius:11,flexShrink:0,padding:deal.bogo?"7px 9px":"7px 12px",textAlign:"center",minWidth:56}}>
            <p style={{fontWeight:900,fontSize:deal.bogo?13:18,lineHeight:1}}>{isUsed?"✓":discLabel()}</p>
            {isUsed&&<p style={{fontSize:9,color:"rgba(255,255,255,.75)",marginTop:1}}>مُستخدم</p>}
          </div>
        </div>

        {/* chips */}
        <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:12}}>
          {deal.bogo&&<Tag bg={`${store.ac}22`} color={store.ac}>🎁 واحد+واحد</Tag>}
          {isInv&&<Tag bg={`${T.gold}18`} color={T.gold}>💳 كوبون مدفوع</Tag>}
          {deal.minSpend>0&&<Tag bg={T.surf} color={T.mid}>🧾 حد أدنى {deal.minSpend} ر.ق</Tag>}
          {/* Remaining count */}
          <Tag bg={remaining<10?`${T.red}18`:`${T.green}18`} color={remaining<10?T.red:T.green}>
            🎫 {remaining} متبقي
          </Tag>
          {deal.expiresHours&&<Tag bg={`${T.maroon}18`} color={T.maroon}>⏱ {deal.expiresHours}ساعة</Tag>}
        </div>

        {/* ── Price Breakdown ── */}
        {deal.originalPrice>0&&(
          <div style={{
            background:`${store.ac}08`,borderRadius:14,padding:"10px 14px",
            border:`1px solid ${store.ac}22`,marginBottom:10,
            display:"flex",flexDirection:"column",gap:6,
          }}>
            {/* Row header */}
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
              <span style={{fontSize:13}}>💡</span>
              <p style={{fontSize:11,fontWeight:800,color:store.ac,letterSpacing:.5}}>
                {isInv?"تفاصيل الخصم على الفاتورة":"تفاصيل السعر"}
              </p>
            </div>

            {isInv?(
              /* Invoice-paid layout */
              <>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:12,color:T.mid}}>💳 تكلفة الكوبون</span>
                  <span style={{fontWeight:900,fontSize:14,color:store.ac,direction:"ltr"}}>{deal.priceQAR} ر.ق</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:12,color:T.mid}}>🧾 الحد الأدنى للفاتورة</span>
                  <span style={{fontWeight:700,fontSize:13,color:T.text,direction:"ltr"}}>{deal.originalPrice} ر.ق</span>
                </div>
                <div style={{height:1,background:T.border}}/>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:12,color:T.mid}}>💸 الخصم المتوقع ({deal.disc}%)</span>
                  <span style={{fontWeight:700,fontSize:13,color:T.green,direction:"ltr"}}>
                    −{(deal.originalPrice*deal.disc/100).toFixed(0)} ر.ق
                  </span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:`${T.green}12`,borderRadius:9,padding:"7px 10px"}}>
                  <span style={{fontSize:12,fontWeight:800,color:T.text}}>✅ تدفع بعد الخصم</span>
                  <span style={{fontWeight:900,fontSize:16,color:T.green,direction:"ltr"}}>
                    {(deal.originalPrice-(deal.originalPrice*deal.disc/100)).toFixed(0)} ر.ق
                  </span>
                </div>
              </>
            ):deal.bogo?(
              /* BOGO layout */
              <>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:12,color:T.mid}}>🏷️ سعر القطعة الواحدة</span>
                  <span style={{fontWeight:700,fontSize:13,color:T.text,direction:"ltr"}}>{deal.originalPrice/2} ر.ق</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:12,color:T.mid}}>🏷️🏷️ سعر قطعتين بدون كوبون</span>
                  <span style={{fontWeight:700,fontSize:13,color:T.dim,textDecoration:"line-through",direction:"ltr"}}>{deal.originalPrice} ر.ق</span>
                </div>
                <div style={{height:1,background:T.border}}/>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:`${T.green}12`,borderRadius:9,padding:"7px 10px"}}>
                  <span style={{fontSize:12,fontWeight:800,color:T.text}}>✅ تدفع بكوبون 1+1</span>
                  <span style={{fontWeight:900,fontSize:16,color:T.green,direction:"ltr"}}>{deal.originalPrice/2} ر.ق</span>
                </div>
              </>
            ):(
              /* Product/fixed price layout */
              <>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:12,color:T.mid}}>🏷️ السعر الأصلي</span>
                  <span style={{fontWeight:700,fontSize:13,color:T.dim,textDecoration:"line-through",direction:"ltr"}}>{deal.originalPrice} ر.ق</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:12,color:T.mid}}>💰 توفّر بالكوبون</span>
                  <span style={{fontWeight:700,fontSize:13,color:T.green,direction:"ltr"}}>−{deal.savedValue} ر.ق</span>
                </div>
                <div style={{height:1,background:T.border}}/>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:`${T.green}12`,borderRadius:9,padding:"7px 10px"}}>
                  <span style={{fontSize:12,fontWeight:800,color:T.text}}>✅ تدفع بعد الخصم</span>
                  <span style={{fontWeight:900,fontSize:16,color:T.green,direction:"ltr"}}>{deal.priceQAR} ر.ق</span>
                </div>
              </>
            )}

            {/* Savings badge */}
            <div style={{display:"flex",justifyContent:"flex-end"}}>
              <span style={{
                background:`${T.green}20`,color:T.green,
                borderRadius:99,padding:"3px 10px",fontSize:11,fontWeight:800,
              }}>
                🎉 توفير {deal.bogo
                  ? `${deal.originalPrice/2} ر.ق (50%)`
                  : isInv
                    ? `${(deal.originalPrice*deal.disc/100).toFixed(0)} ر.ق (${deal.disc}%)`
                    : `${deal.savedValue} ر.ق`
                }
              </span>
            </div>
          </div>
        )}

        {/* qty picker */}
        {showQty&&needsQty&&(
          <div className="fu" style={{display:"flex",flexDirection:"column",gap:8,marginBottom:10}}>
            {deal.products.map(p=>(
              <QtyBox key={p.name} label={p.name} max={p.max||50} val={qtys[p.name]||1}
                onChange={v=>setQtys(q=>({...q,[p.name]:v}))} color={store.ac}/>
            ))}
            {isPaid&&(
              <div style={{background:`${T.gold}15`,borderRadius:12,padding:"10px 14px",border:`1px solid ${T.gold}33`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:13,color:T.mid}}>تدفع</span>
                <span style={{fontWeight:900,fontSize:18,color:T.gold}}>{isInv?deal.priceQAR:(deal.priceQAR*totalQty).toFixed(2)} ر.ق</span>
              </div>
            )}
            <div style={{display:"flex",gap:8}}>
              <button className="tap" onClick={()=>setShowQty(false)} style={{flex:1,padding:"11px",borderRadius:13,border:`1px solid ${T.border}`,background:T.card,color:T.mid,fontWeight:700,fontSize:13,cursor:"pointer"}}>إلغاء</button>
              <button className="tap" onClick={()=>{if(isPaid)setShowPay(true);else doGenerate(false);}} style={{flex:2,padding:"11px",borderRadius:13,border:"none",background:`linear-gradient(135deg,${store.ac},${store.ac}99)`,color:"#fff",fontWeight:800,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
                {isPaid?<><span>🍎</span><span>ادفع {isInv?deal.priceQAR:(deal.priceQAR*totalQty).toFixed(2)} ر.ق</span></>:<><span>🎫</span><span>احصل على الكود</span></>}
              </button>
            </div>
          </div>
        )}

        {/* CLAIMED — show barcode */}
        {claimed&&!expired&&!showQty&&!isUsed?(
          <div>
            {/* Barcode display */}
            <div style={{background:"#fff",borderRadius:16,padding:"14px 12px 8px",marginBottom:10,cursor:"pointer",border:`2px solid ${store.ac}33`}}
              onClick={()=>setShowBC(true)}>
              <Barcode code={claimed.code} color="#111" bg="#fff" height={65}/>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:6,paddingTop:6,borderTop:"1px solid #eee"}}>
                <p style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,fontSize:16,color:"#111",letterSpacing:2}}>{claimed.code}</p>
                <Tag bg={`${store.ac}22`} color={store.ac} sx={{fontSize:10}}>🔍 تكبير</Tag>
              </div>
              {claimed.totalQty>1&&<p style={{fontSize:11,color:"#888",marginTop:4}}>{claimed.qtySummary}</p>}
            </div>

            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
              <Ring endsAt={claimed.endsAt} color={store.ac} totalMs={claimed.totalMs}/>
              <div style={{flex:1}}>
                {claimed.paid&&<Tag bg={`${T.green}18`} color={T.green} sx={{fontSize:10,marginBottom:4,display:"block"}}>✅ مدفوع</Tag>}
                <p style={{fontSize:11,color:T.mid}}>اضغط على الباركود للتكبير • أبرزه للكاشير</p>
              </div>
            </div>

            <div style={{display:"flex",gap:8}}>
              <button className="tap" onClick={()=>setShowBC(true)} style={{flex:1,padding:"10px",borderRadius:12,border:`1px solid ${store.ac}44`,background:`${store.ac}18`,color:store.ac,fontWeight:800,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                📱 عرض كامل
              </button>
              <button className="tap" onClick={copyAndWA} style={{flex:1,padding:"10px",borderRadius:12,border:`1px solid ${T.border}`,background:T.surf,color:T.mid,fontWeight:700,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                {copied?"✅ تم":"💬 واتساب"}
              </button>
            </div>
          </div>
        ):isUsed?(
          <div style={{background:`${T.green}12`,border:`1px solid ${T.green}33`,borderRadius:14,padding:"14px 16px"}}>
            <div className="cp" style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:40,height:40,borderRadius:"50%",background:T.green,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>✓</div>
              <div>
                <p style={{fontWeight:800,fontSize:14,color:T.green}}>تم استخدام الكود ✅</p>
                <p style={{fontSize:12,color:T.dim,marginTop:2}}>
                  وفّرت <strong style={{color:T.gold}}>{deal.savedValue||0} ر.ق</strong> من هذا الكوبون
                </p>
                <p style={{fontSize:11,color:T.dim,marginTop:2}}>في {new Date(claimed.usedAt).toLocaleString("ar-QA",{dateStyle:"short",timeStyle:"short"})}</p>
              </div>
            </div>
          </div>
        ):expired?(
          <div style={{background:T.redBg,border:`1px solid ${T.red}33`,borderRadius:13,padding:12,textAlign:"center"}}>
            <p style={{color:T.red,fontWeight:700,fontSize:13}}>⏰ انتهت صلاحية الكود</p>
          </div>
        ):!showQty?(
          <button className="tap"
            onClick={()=>{if(needsQty)setShowQty(true);else if(isPaid)setShowPay(true);else doGenerate(false);}}
            disabled={loading||remaining<=0}
            style={{width:"100%",padding:"13px",borderRadius:13,border:`1px solid ${remaining<=0?T.border:store.ac+"44"}`,
              background:remaining<=0?T.card:`${store.ac}18`,
              color:remaining<=0?T.dim:store.ac,fontWeight:800,fontSize:14,cursor:"pointer",
              display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"background .2s"}}
            onMouseEnter={e=>{if(remaining>0)e.currentTarget.style.background=`${store.ac}2a`;}}
            onMouseLeave={e=>{if(remaining>0)e.currentTarget.style.background=`${store.ac}18`;}}
          >
            {loading?<><Spin color={store.ac}/><span>جاري التوليد...</span></>
              :remaining<=0?<><span>❌</span><span>نفدت الأكواد</span></>
              :isInv?<><span>🍎</span><span>ادفع {deal.priceQAR} ر.ق واحصل على الكود</span></>
              :isPaid?<><span>🍎</span><span>ادفع واحصل على كودك</span></>
              :<><span>🎫</span><span>احصل على كودك المجاني</span></>}
          </button>
        ):null}
      </div>

      {showPay&&(
        <PaySheet deal={deal} store={store} qty={totalQty}
          onPaid={()=>{setShowPay(false);doGenerate(true);}}
          onClose={()=>setShowPay(false)}/>
      )}
      {showBC&&claimed&&(
        <BarcodeModal code={claimed.code} store={store} deal={deal}
          endsAt={claimed.endsAt} totalMs={claimed.totalMs}
          qty={claimed.totalQty} qtySummary={claimed.qtySummary}
          onClose={()=>setShowBC(false)}/>
      )}
    </div>
  );
}

/* ─── Savings Banner ───────────────────────────────────────────────────────── */
function SavingsBanner({totalSaved,codesUsed}){
  if(totalSaved===0)return null;
  return(
    <div className="sp" style={{
      background:`linear-gradient(135deg,${T.gold}22,${T.gold}08)`,
      borderRadius:20,padding:"18px 20px",
      border:`1px solid ${T.gold}44`,
      position:"relative",overflow:"hidden",
    }}>
      <div style={{position:"absolute",top:-20,left:-20,width:100,height:100,borderRadius:"50%",
        background:`radial-gradient(circle,${T.gold}18,transparent)`,pointerEvents:"none"}}/>
      <p style={{fontSize:11,color:T.gDim,fontWeight:700,marginBottom:4}}>🏆 إجمالي ما وفّرته عبر وِجهة</p>
      <p style={{fontWeight:900,fontSize:32,color:T.gold,lineHeight:1,marginBottom:4}}>
        {totalSaved} <span style={{fontSize:16,fontWeight:400}}>ر.ق</span>
      </p>
      <p style={{fontSize:11,color:T.mid}}>من خلال {codesUsed} كوبون مستخدم</p>
    </div>
  );
}

/* ─── Wallet (Codes tab) ───────────────────────────────────────────────────── */
function WalletView({claimed,phone,onUseCode,setTab}){
  const entries=Object.entries(claimed);
  const used=entries.filter(([,d])=>d.usedAt);
  const active=entries.filter(([,d])=>!d.usedAt&&d.endsAt&&Date.now()<d.endsAt);
  const expired=entries.filter(([,d])=>!d.usedAt&&d.endsAt&&Date.now()>d.endsAt);
  const totalSaved=used.reduce((s,[,d])=>s+(d.savedValue||0),0);

  function CodeCard({dealId,data,isUsed,isExpired}){
    const[showBC,setShowBC]=useState(false);
    const store=STORES.find(s=>s.deals.some(d=>d.id===dealId));
    const deal=STORES.flatMap(s=>s.deals).find(d=>d.id===dealId);
    if(!store||!deal)return null;
    return(
      <div style={{background:T.card,borderRadius:17,padding:"14px 16px",
        border:`1px solid ${isUsed?T.green+"44":isExpired?T.border:data.storeAc+"44"}`,
        opacity:isExpired?.5:1}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
          <img src={store.img} alt="" style={{width:40,height:40,borderRadius:10,objectFit:"cover",flexShrink:0}}/>
          <div style={{flex:1,minWidth:0}}>
            <p style={{fontWeight:800,fontSize:13,color:T.text}}>{store.name}</p>
            <p style={{fontSize:11,color:T.mid}}>{data.dealTitle}</p>
            {data.qtySummary&&<p style={{fontSize:10,color:T.dim,marginTop:2}}>{data.qtySummary}</p>}
          </div>
          {!isUsed&&!isExpired&&data.endsAt&&<Ring endsAt={data.endsAt} color={data.storeAc} totalMs={data.totalMs}/>}
          {isUsed&&<div className="cp" style={{width:36,height:36,borderRadius:"50%",background:T.green,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>✓</div>}
          {isExpired&&<Tag bg={T.redBg} color={T.red}>منتهي</Tag>}
        </div>

        {/* Barcode */}
        {!isExpired&&(
          <div style={{background:"#fff",borderRadius:12,padding:"12px 10px 6px",marginBottom:8,
            opacity:isUsed?.5:1,cursor:isUsed?"default":"pointer",border:`1.5px solid ${isUsed?T.green+"44":data.storeAc+"33"}`}}
            onClick={()=>!isUsed&&setShowBC(true)}>
            <Barcode code={data.code} color="#111" bg="#fff" height={55} used={isUsed}/>
            <p style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,fontSize:15,color:isUsed?"#aaa":"#111",letterSpacing:2,marginTop:6,textAlign:"center"}}>{data.code}</p>
          </div>
        )}

        {isUsed?(
          <div style={{background:`${T.green}12`,borderRadius:12,padding:"10px 13px",border:`1px solid ${T.green}22`}}>
            <p style={{fontSize:12,color:T.green,fontWeight:700}}>
              ✅ تم الاستخدام — وفّرت <strong style={{color:T.gold}}>{data.savedValue||0} ر.ق</strong>
            </p>
            <p style={{fontSize:11,color:T.dim,marginTop:3}}>
              {new Date(data.usedAt).toLocaleString("ar-QA",{dateStyle:"short",timeStyle:"short"})}
            </p>
          </div>
        ):!isExpired?(
          <div style={{display:"flex",gap:8}}>
            <button className="tap" onClick={()=>setShowBC(true)} style={{flex:1,padding:"9px",borderRadius:11,border:`1px solid ${data.storeAc}44`,background:`${data.storeAc}18`,color:data.storeAc,fontWeight:800,fontSize:12,cursor:"pointer"}}>📱 تكبير</button>
            <button className="tap" onClick={()=>{
              navigator.clipboard?.writeText(data.code).catch(()=>{});
              sendWA(phone,data.code,data.storeName,data.storeLat,data.storeLng,data.endsAt,data.qtySummary);
            }} style={{flex:1,padding:"9px",borderRadius:11,border:`1px solid ${T.border}`,background:T.surf,color:T.mid,fontWeight:700,fontSize:12,cursor:"pointer"}}>💬 واتساب</button>
          </div>
        ):null}

        {showBC&&store&&deal&&(
          <BarcodeModal code={data.code} store={store} deal={deal}
            endsAt={data.endsAt} totalMs={data.totalMs}
            qty={data.totalQty} qtySummary={data.qtySummary}
            onClose={()=>setShowBC(false)}/>
        )}
      </div>
    );
  }

  if(entries.length===0)return(
    <div style={{textAlign:"center",padding:"56px 0"}}>
      <div style={{fontSize:46,marginBottom:10}}>🎫</div>
      <p style={{color:T.mid,fontWeight:700}}>لا توجد أكواد بعد</p>
      <button className="tap" onClick={()=>setTab("home")} style={{marginTop:14,background:"none",border:`1px solid ${T.maroon}`,borderRadius:10,padding:"8px 18px",cursor:"pointer",color:T.maroon,fontWeight:700,fontSize:13}}>تصفح العروض</button>
    </div>
  );

  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      {/* Savings banner */}
      <SavingsBanner totalSaved={totalSaved} codesUsed={used.length}/>

      {/* Active */}
      {active.length>0&&(
        <>
          <p style={{fontWeight:800,fontSize:13,color:T.text}}>🟢 نشطة ({active.length})</p>
          {active.map(([id,d])=><CodeCard key={id} dealId={id} data={d} isUsed={false} isExpired={false}/>)}
        </>
      )}

      {/* Used */}
      {used.length>0&&(
        <>
          <p style={{fontWeight:800,fontSize:13,color:T.green,marginTop:4}}>✅ مستخدمة ({used.length})</p>
          {used.map(([id,d])=><CodeCard key={id} dealId={id} data={d} isUsed={true} isExpired={false}/>)}
        </>
      )}

      {/* Expired */}
      {expired.length>0&&(
        <>
          <p style={{fontWeight:800,fontSize:13,color:T.dim,marginTop:4}}>⏰ منتهية ({expired.length})</p>
          {expired.map(([id,d])=><CodeCard key={id} dealId={id} data={d} isUsed={false} isExpired={true}/>)}
        </>
      )}
    </div>
  );
}

/* ─── Map ──────────────────────────────────────────────────────────────────── */
function MapView({stores,loc,onPick}){
  const[zoom,setZoom]=useState(1);
  const[sel,setSel]=useState(null);
  const ranges={1:500,2:5000,3:40000};
  const visible=stores.filter(s=>s.distM<=ranges[zoom]).sort((a,b)=>a.distM-b.distM);
  const best=visible.length?[...visible].sort((a,b)=>Math.max(...b.deals.map(d=>d.disc||0))-Math.max(...a.deals.map(d=>d.disc||0)))[0]:null;
  function pos(s){const sc=zoom===1?.004:zoom===2?.025:.18;return{x:50+(s.lng-loc.lng)/sc*25,y:50-(s.lat-loc.lat)/sc*25};}
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{position:"relative",height:320,background:"#0C1118",borderRadius:20,border:`1px solid ${T.border}`,overflow:"hidden"}}>
        <svg width="100%" height="100%" style={{position:"absolute",inset:0,opacity:.15}}>
          {[1,2,3,4].map(i=><circle key={i} cx="50%" cy="50%" r={`${i*13}%`} fill="none" stroke={T.border} strokeWidth="1"/>)}
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke={T.border} strokeWidth="1"/>
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke={T.border} strokeWidth="1"/>
        </svg>
        <div style={{position:"absolute",left:"50%",top:"50%",transform:"translate(-50%,-50%)",width:13,height:13,borderRadius:"50%",background:T.blue,boxShadow:`0 0 0 4px ${T.blue}44,0 0 0 8px ${T.blue}22`}}/>
        {visible.map(s=>{
          const p=pos(s);
          if(p.x<4||p.x>96||p.y<4||p.y>96)return null;
          const bd=Math.max(...s.deals.map(d=>d.disc||0));
          return(
            <button key={s.id} onClick={()=>setSel(sel===s.id?null:s.id)} style={{position:"absolute",left:`${p.x}%`,top:`${p.y}%`,transform:"translate(-50%,-100%)",background:"none",border:"none",cursor:"pointer",padding:0}}>
              <div style={{background:s.ac,color:"#fff",borderRadius:"11px 11px 11px 2px",padding:"4px 9px",fontWeight:900,fontSize:12,boxShadow:`0 3px 12px ${s.ac}77`,border:`2px solid ${sel===s.id?"#fff":"transparent"}`,transform:sel===s.id?"scale(1.12)":"scale(1)",transition:"transform .15s",whiteSpace:"nowrap"}}>
                {s.emoji} {bd>0?`${bd}%`:s.name.slice(0,4)}
              </div>
            </button>
          );
        })}
        <div style={{position:"absolute",top:10,right:10,display:"flex",flexDirection:"column",gap:4}}>
          {[{z:1,l:"500م"},{z:2,l:"5كم"},{z:3,l:"40كم"}].map(({z,l})=>(
            <button key={z} className="tap" onClick={()=>setZoom(z)} style={{padding:"5px 9px",borderRadius:8,border:`1px solid ${T.border}`,background:zoom===z?T.maroon:T.card,color:zoom===z?"#fff":T.mid,fontWeight:700,fontSize:11,cursor:"pointer"}}>{l}</button>
          ))}
        </div>
        {zoom===3&&best&&(
          <div style={{position:"absolute",top:10,left:10,right:70,background:`${T.surf}EE`,borderRadius:13,padding:"9px 12px",border:`1px solid ${best.ac}44`}}>
            <p style={{fontSize:9,color:T.mid,marginBottom:2}}>🔥 أقوى عرض</p>
            <p style={{fontSize:13,fontWeight:800,color:T.text}}>{best.name}</p>
          </div>
        )}
        <div style={{position:"absolute",bottom:10,left:10}}>
          <Tag bg={`${T.surf}CC`} color={T.mid}>نطاق {zoom===1?"500م":zoom===2?"5كم":"40كم"}</Tag>
        </div>
      </div>
      {sel&&(()=>{
        const s=visible.find(x=>x.id===sel);if(!s)return null;
        return(
          <div className="fu" style={{background:T.card,borderRadius:16,padding:"14px 16px",border:`1px solid ${s.ac}44`}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
              <img src={s.img} alt="" style={{width:44,height:44,borderRadius:11,objectFit:"cover",flexShrink:0}}/>
              <div style={{flex:1}}>
                <p style={{fontWeight:800,fontSize:14,color:T.text}}>{s.name}</p>
                <Tag bg={`${s.ac}18`} color={s.ac} sx={{fontSize:10}}>📍 {fmtD(s.distM)}</Tag>
              </div>
              <button onClick={()=>setSel(null)} style={{background:"none",border:"none",cursor:"pointer",color:T.dim,fontSize:22}}>×</button>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button className="tap" onClick={()=>openMaps(s.lat,s.lng,s.name)} style={{flex:1,padding:"10px",borderRadius:11,border:`1px solid ${T.blue}44`,background:`${T.blue}15`,color:T.blue,fontWeight:800,fontSize:12,cursor:"pointer"}}>🗺️ المسار</button>
              <button className="tap" onClick={()=>onPick(s)} style={{flex:2,padding:"10px",borderRadius:11,border:"none",background:s.ac,color:"#fff",fontWeight:800,fontSize:12,cursor:"pointer"}}>عروض المتجر ←</button>
            </div>
          </div>
        );
      })()}
      {visible.map(s=>(
        <button key={s.id} className="tap" onClick={()=>onPick(s)} style={{width:"100%",display:"flex",alignItems:"center",gap:10,background:T.card,borderRadius:13,padding:"10px 14px",border:`1px solid ${T.border}`,cursor:"pointer",textAlign:"right",marginBottom:4}}>
          <img src={s.img} alt="" style={{width:36,height:36,borderRadius:9,objectFit:"cover",flexShrink:0}}/>
          <div style={{flex:1,minWidth:0}}>
            <p style={{fontWeight:700,fontSize:13,color:T.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.name}</p>
            <p style={{fontSize:11,color:T.dim}}>{fmtD(s.distM)} · {Math.max(...s.deals.map(d=>d.disc||0))}% خصم</p>
          </div>
          <span style={{color:T.dim}}>←</span>
        </button>
      ))}
    </div>
  );
}

/* ─── Profile ──────────────────────────────────────────────────────────────── */
function ProfileScreen({phone,profile,setProfile,onLogout,lang,setLang}){
  const[editEmail,setEditEmail]=useState(false);
  const[email,setEmail]=useState(profile.email||"");
  const[saved,setSaved]=useState(false);
  function saveEmail(){setProfile(p=>({...p,email}));setSaved(true);setEditEmail(false);setTimeout(()=>setSaved(false),2000);}
  return(
    <div style={{maxWidth:480,margin:"0 auto",padding:"20px 14px 48px",display:"flex",flexDirection:"column",gap:12}}>
      <div className="fu" style={{background:`linear-gradient(160deg,${T.maroon}30,${T.surf})`,borderRadius:24,padding:"28px 20px",textAlign:"center",border:`1px solid ${T.maroon}33`}}>
        <div style={{width:78,height:78,borderRadius:"50%",margin:"0 auto 14px",background:`linear-gradient(135deg,${T.maroon},${T.m2})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:34,boxShadow:`0 6px 24px ${T.mGlow}`}}>👤</div>
        <p style={{fontWeight:900,fontSize:20,color:T.text}}>{profile.name||"مستخدم وِجهة"}</p>
        <p style={{color:T.mid,fontSize:13,marginTop:4}}>عضو منذ 2026</p>
        <Tag bg={`${T.gold}22`} color={T.gold} sx={{marginTop:8}}>🇶🇦 الدوحة — قطر</Tag>
      </div>
      <div className="fu" style={{background:T.card,borderRadius:20,padding:20,border:`1px solid ${T.border}`}}>
        <p style={{fontWeight:800,fontSize:15,color:T.text,marginBottom:14}}>📋 معلوماتي</p>
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",background:T.surf,borderRadius:13,marginBottom:10,border:`1px solid ${T.border}`}}>
          <span style={{fontSize:20}}>📱</span>
          <div style={{flex:1}}>
            <p style={{fontSize:11,color:T.dim,marginBottom:2}}>رقم الجوال</p>
            <p style={{fontWeight:700,fontSize:14,color:T.text,direction:"ltr"}}>+974 {phone}</p>
          </div>
          <Tag bg={`${T.green}18`} color={T.green} sx={{fontSize:10}}>✓ محقق</Tag>
        </div>
        <div style={{padding:"12px 14px",background:T.surf,borderRadius:13,border:`1px solid ${T.border}`}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:editEmail?10:0}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:20}}>📧</span>
              <div>
                <p style={{fontSize:11,color:T.dim,marginBottom:2}}>البريد الإلكتروني</p>
                <p style={{fontWeight:700,fontSize:14,color:email?T.text:T.dim}}>{email||"لم يُضف بعد"}</p>
              </div>
            </div>
            <button className="tap" onClick={()=>setEditEmail(e=>!e)} style={{background:`${T.maroon}18`,border:`1px solid ${T.maroon}44`,borderRadius:8,padding:"5px 10px",cursor:"pointer",fontSize:12,color:T.maroon,fontWeight:700}}>{editEmail?"إلغاء":"تعديل"}</button>
          </div>
          {editEmail&&(<div className="fu" style={{display:"flex",gap:8}}><input className="fi-inp" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="example@email.com" style={{flex:1,padding:"10px 12px",borderRadius:11,border:`1.5px solid ${T.border}`,background:T.card,fontSize:13,color:T.text,direction:"ltr",outline:"none"}}/><button className="tap" onClick={saveEmail} style={{padding:"10px 14px",borderRadius:11,border:"none",background:T.maroon,color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer",flexShrink:0}}>حفظ</button></div>)}
          {saved&&<p className="fi" style={{fontSize:12,color:T.green,marginTop:8}}>✅ تم الحفظ</p>}
        </div>
      </div>
      <div className="fu" style={{background:T.card,borderRadius:20,padding:20,border:`1px solid ${T.border}`}}>
        <p style={{fontWeight:800,fontSize:15,color:T.text,marginBottom:14}}>🌐 اللغة</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {LANGS.map(l=>(
            <button key={l.code} className="tap" onClick={()=>setLang(l.code)} style={{padding:"12px 10px",borderRadius:13,border:`1.5px solid ${lang===l.code?T.maroon:T.border}`,background:lang===l.code?`${T.maroon}18`:T.surf,cursor:"pointer",display:"flex",alignItems:"center",gap:9}}>
              <span style={{fontSize:20}}>{l.flag}</span>
              <div style={{textAlign:"right",flex:1}}>
                <p style={{fontWeight:800,fontSize:13,color:lang===l.code?T.maroon:T.text}}>{l.name}</p>
              </div>
              {lang===l.code&&<span style={{color:T.maroon,fontSize:14}}>✓</span>}
            </button>
          ))}
        </div>
      </div>
      <button className="tap" onClick={onLogout} style={{width:"100%",padding:"14px",borderRadius:16,border:`1px solid ${T.red}44`,background:`${T.red}12`,color:T.red,fontWeight:800,fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
        <span>🚪</span><span>تسجيل الخروج</span>
      </button>
    </div>
  );
}

/* ══ SCREENS ═══════════════════════════════════════════════════════════════ */
function LoginScreen({onLogin}){
  const[step,setStep]=useState("phone");
  const[phone,setPhone]=useState("");
  const[otp,setOtp]=useState(["","","","","",""]);
  const[hint,setHint]=useState("");
  const[err,setErr]=useState("");
  const[loading,setLoading]=useState(false);
  const[timer,setTimer]=useState(0);
  const refs=useRef([]);
  useEffect(()=>{if(timer<=0)return;const t=setTimeout(()=>setTimer(p=>p-1),1000);return()=>clearTimeout(t);},[timer]);
  function send(){if(phone.replace(/\D/g,"").length<7){setErr("أدخل رقماً قطرياً صحيحاً");return;}setErr("");setLoading(true);const c=String(100000+Math.floor(Math.random()*900000));setHint(c);setTimeout(()=>{setLoading(false);setStep("otp");setTimer(120);},1500);}
  function verify(){if(otp.join("").length<6){setErr("أدخل الرمز كاملاً");return;}setLoading(true);setTimeout(()=>{if(otp.join("")===hint)onLogin(phone.replace(/\D/g,""));else{setErr("رمز غير صحيح");setOtp(["","","","","",""]);refs.current[0]?.focus();}setLoading(false);},900);}
  const btnStyle=(on)=>({width:"100%",padding:"14px",borderRadius:14,border:"none",background:on?`linear-gradient(135deg,${T.maroon},${T.m2})`:T.card,color:on?"#fff":T.dim,fontWeight:900,fontSize:15,cursor:"pointer",transition:"all .25s",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:on?`0 6px 22px ${T.mGlow}`:"none"});
  return(
    <div style={{minHeight:"100svh",background:T.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 20px",backgroundImage:`radial-gradient(ellipse 70% 40% at 50% 0%,${T.maroon}22,transparent)`}}>
      <div className="pi" style={{textAlign:"center",marginBottom:34}}>
        <div style={{display:"flex",gap:3,justifyContent:"center",marginBottom:14}}>
          <div style={{width:20,height:38,background:T.maroon,borderRadius:"6px 0 0 6px"}}/>
          <div style={{width:7,height:38,background:"#eee",clipPath:"polygon(0 0,100% 10%,100% 90%,0 100%)"}}/>
          <div style={{width:44,height:38,background:T.surf,borderRadius:"0 8px 8px 0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>🏷️</div>
        </div>
        <h1 style={{fontWeight:900,fontSize:28,color:T.text}}>وِجهة</h1>
        <p style={{color:T.dim,fontSize:12,marginTop:3}}>كوبونات حصرية • قطر 🇶🇦</p>
      </div>
      <div className="fu" style={{width:"100%",maxWidth:400,background:T.surf,borderRadius:26,padding:"26px 22px",border:`1px solid ${T.border}`,boxShadow:"0 24px 60px rgba(0,0,0,.6)"}}>
        {step==="phone"?(
          <>
            <h2 style={{fontWeight:800,fontSize:19,color:T.text,marginBottom:6}}>تسجيل الدخول</h2>
            <p style={{color:T.mid,fontSize:13,lineHeight:1.7,marginBottom:18}}>رمز التحقق عبر <strong style={{color:"#25D366"}}>واتساب</strong></p>
            <div style={{display:"flex",alignItems:"center",background:T.card,borderRadius:14,border:`1.5px solid ${T.border}`,overflow:"hidden",marginBottom:12}}>
              <div style={{padding:"13px 14px",borderLeft:`1px solid ${T.border}`,color:T.mid,fontSize:13,fontWeight:700,flexShrink:0}}>🇶🇦 +974</div>
              <input className="fi-inp" type="tel" value={phone} onChange={e=>{setPhone(e.target.value);setErr("");}} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="xxxx xxxx" maxLength={12} style={{flex:1,padding:"13px 12px",border:"none",outline:"none",background:"transparent",fontSize:16,color:T.text,direction:"ltr",textAlign:"left"}}/>
            </div>
            {err&&<p className="fi" style={{color:T.red,fontSize:12,marginBottom:10}}>⚠️ {err}</p>}
            <button className="tap" onClick={send} disabled={loading||phone.length<7} style={btnStyle(phone.length>=7&&!loading)}>
              {loading?<><Spin/><span>جاري الإرسال...</span></>:<><span>📲</span><span>إرسال رمز واتساب</span></>}
            </button>
          </>
        ):(
          <>
            <button onClick={()=>{setStep("phone");setErr("");setOtp(["","","","","",""]);}} style={{background:"none",border:"none",cursor:"pointer",color:T.dim,fontSize:22,marginBottom:12,padding:0}}>←</button>
            <h2 style={{fontWeight:800,fontSize:19,color:T.text,marginBottom:4}}>رمز التحقق</h2>
            <div style={{background:"#0D1E13",border:"1px solid #25D36633",borderRadius:14,padding:"12px 14px",marginBottom:18,display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:20}}>💬</span>
              <p style={{fontSize:13,color:"#4CAF82"}}>رمزك: <strong style={{fontFamily:"monospace",letterSpacing:2,fontSize:16,color:"#fff"}}>{hint}</strong></p>
            </div>
            <div style={{display:"flex",gap:7,justifyContent:"center",marginBottom:12,direction:"ltr"}}>
              {otp.map((v,i)=>(
                <input key={i} ref={el=>refs.current[i]=el} className="otp" type="tel" inputMode="numeric" maxLength={1} value={v}
                  onChange={e=>{const nv=e.target.value.replace(/\D/g,"");const next=[...otp];next[i]=nv.slice(-1);setOtp(next);if(nv&&i<5)refs.current[i+1]?.focus();}}
                  onKeyDown={e=>{if(e.key==="Backspace"&&!otp[i]&&i>0)refs.current[i-1]?.focus();}}
                  style={{width:44,height:54,borderRadius:13,border:`2px solid ${v?T.maroon:T.border}`,background:v?"#1c0e11":T.card,fontSize:22,fontWeight:900,textAlign:"center",color:T.maroon,outline:"none",transition:"all .15s"}}/>
              ))}
            </div>
            {err&&<p className="fi" style={{color:T.red,fontSize:12,marginBottom:10,textAlign:"center"}}>⚠️ {err}</p>}
            <button className="tap" onClick={verify} disabled={otp.join("").length<6||loading} style={btnStyle(otp.join("").length===6&&!loading)}>
              {loading?<><Spin/><span>جاري التحقق...</span></>:<><span>✅</span><span>دخول</span></>}
            </button>
            <p style={{textAlign:"center",marginTop:12,fontSize:12,color:T.dim}}>
              {timer>0?<>إعادة الإرسال بعد <strong style={{color:T.maroon}}>{timer}</strong> ث</>
                :<button onClick={()=>{const c=String(100000+Math.floor(Math.random()*900000));setHint(c);setOtp(["","","","","",""]);setTimer(120);}} style={{background:"none",border:"none",cursor:"pointer",color:T.maroon,fontWeight:700,fontSize:12,textDecoration:"underline"}}>إعادة الإرسال 🔄</button>}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function LocationScreen({onGrant}){
  const[st,setSt]=useState("idle");
  function req(){setSt("loading");if(navigator.geolocation)navigator.geolocation.getCurrentPosition(p=>{setSt("done");setTimeout(()=>onGrant({lat:p.coords.latitude,lng:p.coords.longitude}),600);},()=>{setSt("done");setTimeout(()=>onGrant({lat:25.2854,lng:51.5310}),600);},{timeout:8000});else{setSt("done");setTimeout(()=>onGrant({lat:25.2854,lng:51.5310}),700);}}
  return(
    <div style={{minHeight:"100svh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:"24px 20px"}}>
      <div className="pi" style={{width:"100%",maxWidth:380,background:T.surf,borderRadius:30,padding:"36px 26px",border:`1px solid ${T.border}`,textAlign:"center"}}>
        <div className={st==="loading"?"pu":""} style={{width:86,height:86,margin:"0 auto 22px",background:T.greenBg,borderRadius:26,display:"flex",alignItems:"center",justifyContent:"center",fontSize:40,border:`1px solid ${T.green}22`,boxShadow:st==="done"?`0 0 0 10px ${T.green}22`:"none",transition:"box-shadow .4s"}}>
          {st==="done"?"✅":"📍"}
        </div>
        <h2 style={{fontWeight:900,fontSize:21,color:T.text,marginBottom:8}}>حدّد موقعك</h2>
        <p style={{color:T.mid,fontSize:13,lineHeight:1.8,marginBottom:24}}>نعرض لك العروض في نطاق كل متجر</p>
        <button className="tap" onClick={req} disabled={st!=="idle"} style={{width:"100%",padding:"15px",borderRadius:16,border:"none",background:`linear-gradient(135deg,${T.green},#1A9A60)`,color:"#fff",fontWeight:900,fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10,boxShadow:`0 6px 22px ${T.green}44`}}>
          {st==="loading"?<><Spin/><span>جاري التحديد...</span></>:st==="done"?<>✓ تم!</>:<><span>📍</span><span>تحديد موقعي</span></>}
        </button>
      </div>
    </div>
  );
}

function AppScreen({phone,location,onLogout}){
  const[tab,setTab]=useState("home");
  const[cat,setCat]=useState("الكل");
  const[search,setSearch]=useState("");
  const[selStore,setSelStore]=useState(null);
  const[claimed,setClaimed]=useState({});
  // globalUsed: dealId -> count used (shared across sessions in real app, here simulated)
  const[globalUsed,setGlobalUsed]=useState({});
  const[lang,setLang]=useState("ar");
  const[profile,setProfile]=useState({email:"",name:"",notifDeals:true,notifExpiry:true,notifWA:true});

  const withDist=useMemo(()=>STORES.map(s=>({...s,distM:haversine(location.lat,location.lng,s.lat,s.lng)})).sort((a,b)=>a.distM-b.distM),[location]);
  const nearby=useMemo(()=>withDist.filter(s=>s.distM<=s.radius),[withDist]);
  const filtered=useMemo(()=>nearby.filter(s=>{
    if(cat!=="الكل"&&s.cat!==cat)return false;
    const q=search.trim().toLowerCase();
    return!q||s.name.includes(q)||s.deals.some(d=>d.title.includes(q));
  }),[nearby,cat,search]);

  function handleClaim(dealId,data){
    setClaimed(p=>({...p,[dealId]:data}));
    setGlobalUsed(p=>({...p,[dealId]:(p[dealId]||0)+1}));
  }

  // Called from merchant dashboard simulation or barcode scan
  function handleUseCode(dealId){
    setClaimed(p=>({...p,[dealId]:{...p[dealId],usedAt:Date.now()}}));
  }

  const claimedN=Object.keys(claimed).length;
  const totalSaved=Object.entries(claimed).filter(([,d])=>d.usedAt).reduce((s,[,d])=>s+(d.savedValue||0),0);

  const TABS=[
    {id:"home",icon:"🏠",label:"الرئيسية"},
    {id:"map",icon:"🗺️",label:"الخريطة"},
    {id:"codes",icon:"🎫",label:"أكوادي"},
    {id:"profile",icon:"👤",label:"حسابي"},
  ];

  return(
    <div style={{minHeight:"100svh",background:T.bg}}>
      <header style={{position:"sticky",top:0,zIndex:40,background:`${T.bg}EE`,backdropFilter:"blur(20px)",borderBottom:`1px solid ${T.border}`}}>
        <div style={{maxWidth:480,margin:"0 auto",padding:"11px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:9}}>
            <div style={{display:"flex",gap:2}}>
              <div style={{width:5,height:30,background:T.maroon,borderRadius:"4px 0 0 4px"}}/>
              <div style={{width:3,height:30,background:"#ddd",clipPath:"polygon(0 0,100% 5%,100% 95%,0 100%)"}}/>
              <div style={{width:30,height:30,background:T.surf,borderRadius:"0 9px 9px 0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🏷️</div>
            </div>
            <div>
              <p style={{fontWeight:900,fontSize:17,color:T.text,lineHeight:1}}>وِجهة</p>
              <p style={{fontSize:9,color:T.maroon,fontWeight:700,lineHeight:1,marginTop:2}}>قطر 🇶🇦</p>
            </div>
          </div>
          <div style={{display:"flex",gap:7,alignItems:"center"}}>
            {totalSaved>0&&<Tag bg={`${T.gold}22`} color={T.gold} sx={{fontSize:11}}>💰 وفّرت {totalSaved} ر.ق</Tag>}
            {claimedN>0&&<button className="tap" onClick={()=>setTab("codes")} style={{border:`1px solid ${T.maroon}44`,background:`${T.maroon}15`,borderRadius:9,padding:"5px 11px",cursor:"pointer",fontSize:12,fontWeight:800,color:T.maroon}}>🎫 {claimedN}</button>}
          </div>
        </div>
      </header>

      {/* Store detail */}
      {selStore&&(
        <div className="fi" style={{position:"fixed",inset:0,background:T.bg,zIndex:50,overflowY:"auto"}}>
          <div style={{maxWidth:480,margin:"0 auto",paddingBottom:40}}>
            <div style={{position:"relative",height:210,overflow:"hidden"}}>
              <img src={selStore.img} alt="" style={{width:"100%",height:"100%",objectFit:"cover",opacity:.48}}/>
              <div style={{position:"absolute",inset:0,background:`linear-gradient(to bottom,transparent,${T.bg})`}}/>
              <button onClick={()=>setSelStore(null)} style={{position:"absolute",top:14,right:14,background:`${T.bg}99`,border:`1px solid ${T.border}`,borderRadius:11,width:36,height:36,cursor:"pointer",color:T.text,fontSize:20,display:"flex",alignItems:"center",justifyContent:"center"}}>←</button>
              <div style={{position:"absolute",bottom:14,right:14,left:14}}>
                <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",gap:8}}>
                  <div>
                    <p style={{fontWeight:900,fontSize:20,color:T.text,marginBottom:5}}>{selStore.name}</p>
                    <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                      <Tag bg={`${selStore.ac}22`} color={selStore.ac}>📍 {fmtD(selStore.distM)}</Tag>
                      <Tag bg={T.surf} color={T.mid}>⭐ {selStore.rating}</Tag>
                    </div>
                  </div>
                  <button className="tap" onClick={()=>openMaps(selStore.lat,selStore.lng,selStore.name)} style={{border:"none",borderRadius:13,padding:"9px 13px",cursor:"pointer",background:`linear-gradient(135deg,${T.blue},#3A8ECC)`,color:"#fff",fontWeight:800,fontSize:13,flexShrink:0,display:"flex",alignItems:"center",gap:5,boxShadow:`0 4px 16px ${T.blue}44`}}>🗺️ المسار</button>
                </div>
              </div>
            </div>
            <div style={{padding:"16px 14px"}}>
              <p style={{color:T.mid,fontSize:13,marginBottom:18,lineHeight:1.6}}>{selStore.desc}</p>
              <p style={{fontWeight:800,fontSize:15,color:T.text,marginBottom:12}}>العروض ({selStore.deals.length})</p>
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {selStore.deals.map(d=>(
                  <DealCard key={d.id} deal={d} store={selStore} phone={phone}
                    claimedMap={claimed} onClaim={handleClaim}
                    globalUsed={globalUsed} onUseCode={handleUseCode}/>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <main style={{maxWidth:480,margin:"0 auto",padding:"14px 14px 82px",display:"flex",flexDirection:"column",gap:14}}>
        {tab==="home"&&(
          <>
            <div className="fu" style={{background:"linear-gradient(150deg,#1A0D10,#1E1020)",borderRadius:24,padding:"22px 20px",border:`1px solid ${T.maroon}33`,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:-30,left:-20,width:140,height:140,borderRadius:"50%",background:`radial-gradient(circle,${T.maroon}18,transparent)`,pointerEvents:"none"}}/>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                    <div className="pu" style={{width:7,height:7,borderRadius:"50%",background:T.green,boxShadow:`0 0 6px ${T.green}`}}/>
                    <span style={{fontSize:12,color:T.mid}}>{nearby.length} متجر قريب</span>
                  </div>
                  <p style={{color:T.text,fontWeight:900,fontSize:30,lineHeight:1,marginBottom:10}}>
                    {nearby.reduce((s,st)=>s+st.deals.length,0)}<span style={{fontWeight:400,fontSize:16,marginRight:6}}>عرض</span>
                  </p>
                  <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                    <Tag bg={`${T.maroon}22`} color={T.maroon}>🏪 {nearby.length} متجر</Tag>
                    {totalSaved>0&&<Tag bg={`${T.gold}22`} color={T.gold}>💰 وفّرت {totalSaved} ر.ق</Tag>}
                  </div>
                </div>
                <div style={{background:`${T.maroon}18`,borderRadius:14,padding:"10px 11px",textAlign:"center",border:`1px solid ${T.maroon}22`}}>
                  <p style={{fontSize:22,marginBottom:2}}>🇶🇦</p>
                  <p style={{fontSize:9,color:T.maroon,fontWeight:700}}>الدوحة</p>
                </div>
              </div>
            </div>

            <div className="fu" style={{animationDelay:"40ms",position:"relative"}}>
              <span style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",fontSize:17,color:T.dim,pointerEvents:"none"}}>🔍</span>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="ابحث عن متجر أو عرض..."
                style={{width:"100%",padding:"13px 44px 13px 14px",borderRadius:14,border:`1.5px solid ${T.border}`,background:T.surf,fontSize:14,color:T.text,outline:"none",transition:"border-color .2s"}}
                onFocus={e=>e.target.style.borderColor=T.maroon} onBlur={e=>e.target.style.borderColor=T.border}/>
              {search&&<button onClick={()=>setSearch("")} style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:18,color:T.dim}}>×</button>}
            </div>

            <div className="fu" style={{animationDelay:"70ms",display:"flex",gap:7,overflowX:"auto",paddingBottom:2}}>
              {CATS.map(c=>{
                const emo={الكل:"✨",مطاعم:"🍽️",مقاهي:"☕",تسوق:"🛍️",صيدليات:"💊",سبا:"🧖",رياضة:"🏋️"}[c];
                const on=cat===c;
                return(<button key={c} className="tap" onClick={()=>setCat(c)} style={{flexShrink:0,border:`1.5px solid ${on?T.maroon:T.border}`,background:on?T.maroon:T.card,color:on?"#fff":T.mid,borderRadius:99,padding:"7px 15px",fontSize:12,fontWeight:800,cursor:"pointer",boxShadow:on?`0 4px 14px ${T.mGlow}`:"none",transition:"all .2s"}}><span style={{marginLeft:4}}>{emo}</span>{c}</button>);
              })}
            </div>

            {filtered.length===0?(
              <div style={{textAlign:"center",padding:"56px 0"}}>
                <div style={{fontSize:46,marginBottom:10}}>🏙️</div>
                <p style={{color:T.text,fontWeight:700,fontSize:16}}>لا توجد متاجر قريبة</p>
              </div>
            ):(
              filtered.map((store,gi)=>(
                <div key={store.id} className="fu" style={{animationDelay:`${gi*50}ms`}}>
                  <button onClick={()=>setSelStore(store)} style={{width:"100%",display:"flex",alignItems:"center",gap:12,background:T.card,borderRadius:18,padding:"14px 16px",border:`1px solid ${T.border}`,cursor:"pointer",textAlign:"right",transition:"border-color .2s"}}
                    onMouseEnter={e=>e.currentTarget.style.borderColor=store.ac}
                    onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>
                    <img src={store.img} alt="" style={{width:54,height:54,borderRadius:14,objectFit:"cover",flexShrink:0}}/>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{fontWeight:800,fontSize:14,color:T.text,marginBottom:3}}>{store.name}</p>
                      <p style={{fontSize:12,color:T.dim,marginBottom:5,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{store.desc}</p>
                      <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                        <Tag bg={`${store.ac}18`} color={store.ac} sx={{fontSize:10}}>📍 {fmtD(store.distM)}</Tag>
                        <Tag bg={T.surf} color={T.mid} sx={{fontSize:10}}>⭐ {store.rating}</Tag>
                        <Tag bg={T.surf} color={T.mid} sx={{fontSize:10}}>{store.deals.length} عروض</Tag>
                      </div>
                    </div>
                    <div style={{flexShrink:0,background:`linear-gradient(135deg,${store.ac},${store.ac}88)`,color:"#fff",borderRadius:11,padding:"8px 11px",textAlign:"center"}}>
                      <p style={{fontWeight:900,fontSize:18,lineHeight:1}}>{Math.max(...store.deals.map(d=>d.disc||0))}%</p>
                      <p style={{fontSize:9,color:"rgba(255,255,255,.65)"}}>أقصى</p>
                    </div>
                  </button>
                </div>
              ))
            )}
          </>
        )}

        {tab==="map"&&<MapView stores={withDist} loc={location} onPick={s=>{setSelStore(s);setTab("home");}}/>}

        {tab==="codes"&&<WalletView claimed={claimed} phone={phone} onUseCode={handleUseCode} setTab={setTab}/>}

        {tab==="profile"&&<ProfileScreen phone={phone} profile={profile} setProfile={setProfile} onLogout={onLogout} lang={lang} setLang={setLang}/>}
      </main>

      <nav style={{position:"fixed",bottom:0,left:0,right:0,zIndex:40,background:`${T.surf}F2`,backdropFilter:"blur(20px)",borderTop:`1px solid ${T.border}`,display:"flex"}}>
        {TABS.map(({id,icon,label})=>(
          <button key={id} className="tap" onClick={()=>setTab(id)} style={{flex:1,padding:"12px 4px 10px",border:"none",cursor:"pointer",background:"none",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
            <span style={{fontSize:22,filter:tab===id?"none":"grayscale(1) opacity(.4)"}}>{icon}</span>
            <span style={{fontSize:10,fontWeight:700,color:tab===id?T.maroon:T.dim}}>{label}</span>
            {tab===id&&<div style={{width:18,height:2,background:T.maroon,borderRadius:99}}/>}
          </button>
        ))}
      </nav>
    </div>
  );
}

export default function App(){
  const[screen,setScreen]=useState("login");
  const[phone,setPhone]=useState(null);
  const[loc,setLoc]=useState(null);
  return(
    <>
      {screen==="login"&&<LoginScreen onLogin={p=>{setPhone(p);setScreen("location");}}/>}
      {screen==="location"&&<LocationScreen onGrant={l=>{setLoc(l);setScreen("app");}}/>}
      {screen==="app"&&<AppScreen phone={phone} location={loc} onLogout={()=>{setScreen("login");setPhone(null);setLoc(null);}}/>}
    </>
  );
}
