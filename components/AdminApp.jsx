'use client'
import { useState, useEffect } from "react";
if (!document.getElementById("wa3s")) {
  const l = document.createElement("link"); l.rel="stylesheet";
  l.href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap";
  document.head.appendChild(l);
  const s = document.createElement("style"); s.id="wa3s";
  s.textContent=`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{font-family:'IBM Plex Sans Arabic',sans-serif;direction:rtl;background:#060608;color:#E8E4F2;min-height:100vh}
input,button,select,textarea{font-family:inherit}
::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-thumb{background:#2A2535;border-radius:99px}
@keyframes fu{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes fi{from{opacity:0}to{opacity:1}}
@keyframes pi{0%{opacity:0;transform:scale(.9)}70%{transform:scale(1.02)}100%{opacity:1;transform:scale(1)}}
@keyframes sp{to{transform:rotate(360deg)}}
@keyframes pu{0%,100%{opacity:1}50%{opacity:.4}}
@keyframes bl{0%,100%{background:#E04848}50%{background:#C03030}}
.fu{animation:fu .3s cubic-bezier(.22,1,.36,1) both}
.fi{animation:fi .22s ease both}
.pi{animation:pi .35s cubic-bezier(.34,1.56,.64,1) both}
.tap:active{transform:scale(.95)!important;transition:transform .08s!important}
.ih:focus{outline:none!important;border-color:#7C3AED!important;box-shadow:0 0 0 3px #7C3AED18!important}
.rh:hover{background:#16121F!important}
.bl{animation:bl 1.4s ease infinite}`;
  document.head.appendChild(s);
}
const C={bg:"#060608",sf:"#0E0B16",ca:"#13101C",hi:"#1A1526",bo:"#1E1A2A",
  pu:"#7C3AED",go:"#D4A843",gr:"#22C985",re:"#E04848",bl:"#3B9EDD",or:"#F08030",
  tx:"#E8E4F2",mi:"#7A7090",di:"#3A3448"};
const fmt=n=>Number(n).toLocaleString("ar-QA");
const inp={width:"100%",padding:"10px 14px",borderRadius:10,border:`1px solid ${C.bo}`,background:C.ca,fontSize:13,color:C.tx,transition:"border .15s"};
const Sp=({s=14,c=C.pu})=><div style={{width:s,height:s,border:`2px solid ${c}33`,borderTopColor:c,borderRadius:"50%",animation:"sp .7s linear infinite",flexShrink:0}}/>;

function Btn({children,onClick,color=C.pu,small,outline,disabled,loading,style:st={}}){
  return <button className="tap" onClick={onClick} disabled={disabled||loading}
    style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,
      padding:small?"7px 13px":"10px 18px",borderRadius:small?9:11,
      border:outline?`1px solid ${color}66`:"none",
      background:outline?"transparent":disabled?C.hi:color,
      color:outline?color:"#fff",fontWeight:700,fontSize:small?12:13,
      cursor:disabled?"default":"pointer",opacity:disabled?.5:1,fontFamily:"inherit",...st}}>
    {loading&&<Sp s={13} c={outline?color:"#fff"}/>}{children}
  </button>;
}
function Bdg({s}){
  const M={active:{bg:`${C.gr}18`,c:C.gr,t:"نشط ✅"},pending:{bg:`${C.go}18`,c:C.go,t:"قيد المراجعة"},
    pending_p:{bg:`${C.go}18`,c:C.go,t:"قيد الدفع"},suspended:{bg:`${C.re}18`,c:C.re,t:"موقوف ⛔"},
    rejected:{bg:`${C.re}14`,c:C.re,t:"مرفوض ✕"},paid:{bg:`${C.gr}18`,c:C.gr,t:"مدفوع ✓"},
    hold:{bg:`${C.or}18`,c:C.or,t:"محجوز ⚠"},used:{bg:`${C.bl}18`,c:C.bl,t:"مستخدم"},
    active_c:{bg:`${C.gr}18`,c:C.gr,t:"نشط"},expired:{bg:C.ca,c:C.mi,t:"منتهي"},
    open:{bg:`${C.re}14`,c:C.re,t:"مفتوح 🔴"},resolved:{bg:`${C.gr}18`,c:C.gr,t:"محلول ✓"},
    critical:{bg:`${C.re}22`,c:C.re,t:"حرج 🚨"},high:{bg:`${C.or}18`,c:C.or,t:"عالي ⚠"},
    medium:{bg:`${C.go}18`,c:C.go,t:"متوسط"},inactive:{bg:C.ca,c:C.mi,t:"غير نشط"}};
  const m=M[s]||M.inactive;
  return <span style={{background:m.bg,color:m.c,borderRadius:99,padding:"3px 10px",fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>{m.t}</span>;
}
function SC({icon,label,value,sub,color=C.pu,delay=0}){
  return <div className="fu" style={{animationDelay:`${delay}s`,background:C.ca,borderRadius:16,padding:"16px 18px",border:`1px solid ${C.bo}`,position:"relative",overflow:"hidden"}}>
    <div style={{position:"absolute",top:-20,left:-20,width:80,height:80,borderRadius:"50%",background:`${color}0E`}}/>
    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:10}}>
      <span style={{fontSize:22}}>{icon}</span>
      {sub&&<span style={{fontSize:10,color:sub.startsWith("+")?C.gr:C.re,fontWeight:700,background:sub.startsWith("+")?`${C.gr}14`:`${C.re}14`,padding:"2px 7px",borderRadius:99}}>{sub}</span>}
    </div>
    <p style={{fontSize:24,fontWeight:700,color:C.tx,lineHeight:1,marginBottom:5}}>{value}</p>
    <p style={{fontSize:12,color:C.mi}}>{label}</p>
  </div>;
}
function PT({title,sub,action}){
  return <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22}}>
    <div><h1 style={{fontWeight:700,fontSize:20,color:C.tx,marginBottom:3}}>{title}</h1><p style={{fontSize:13,color:C.mi}}>{sub}</p></div>
    {action}
  </div>;
}
function ST({icon,title,action}){
  return <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
    <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:17}}>{icon}</span><h2 style={{fontWeight:700,fontSize:15,color:C.tx}}>{title}</h2></div>
    {action}
  </div>;
}

/* ── Data ── */
const MX=[
  {id:"M001",name:"مطعم الدوحة الملكي",  cat:"🍽️ مطاعم",     city:"الدوحة", status:"pending",  phone:"55001234",cr:"1234567890",cr_exp:"2026-12-01",bank:"QNB",      revenue:0,   deals:0,coupons:0,  joined:"2026-03-10",email:"royal@mail.com", owner:"أحمد محمد"   },
  {id:"M002",name:"كافيه لؤلؤة الخليج",  cat:"☕ مقاهي",     city:"لوسيل",  status:"active",   phone:"55009876",cr:"9876543210",cr_exp:"2027-05-15",bank:"QIB",      revenue:4820,deals:3,coupons:142,joined:"2026-01-15",email:"pearl@mail.com", owner:"سارة علي"    },
  {id:"M003",name:"بوتيك وردة قطر",      cat:"👗 بوتيك",     city:"الريان", status:"active",   phone:"55001122",cr:"1122334455",cr_exp:"2026-08-20",bank:"Doha Bank",revenue:9100,deals:5,coupons:318,joined:"2025-11-20",email:"warda@mail.com", owner:"نورة خالد"   },
  {id:"M004",name:"الأمين هايبر ماركت",  cat:"🛒 سوبر ماركت",city:"الدوحة", status:"suspended",phone:"55007788",cr:"5566778899",cr_exp:"2025-01-01",bank:"CBQ",      revenue:1200,deals:2,coupons:55, joined:"2025-09-05",email:"ameen@mail.com", owner:"طارق سالم"   },
  {id:"M005",name:"صيدلية الرفاء الطبية",cat:"💊 صيدليات",   city:"الوكرة", status:"pending",  phone:"55003344",cr:"3344556677",cr_exp:"2027-02-10",bank:"Masraf",   revenue:0,   deals:0,coupons:0,  joined:"2026-03-11",email:"rifa@mail.com",  owner:"محمد الرفاعي"},
  {id:"M006",name:"سبا لوتس الملكي",     cat:"🧖 سبا",       city:"الدوحة", status:"active",   phone:"55005566",cr:"6677889900",cr_exp:"2027-09-30",bank:"QNB",      revenue:6300,deals:4,coupons:201,joined:"2025-12-01",email:"lotus@mail.com", owner:"لمى القحطاني"},
  {id:"M007",name:"نادي الدوحة الرياضي", cat:"🏋️ رياضة",    city:"الدوحة", status:"rejected", phone:"55006677",cr:"7788990011",cr_exp:"2026-03-15",bank:"HSBC",     revenue:0,   deals:0,coupons:0,  joined:"2026-02-28",email:"sports@mail.com",owner:"عمر الجاسم"  },
];
const CX=[
  {id:"C001",code:"ROYA-8A3F",merchant:"مطعم الدوحة الملكي", user:"+97455000001",amount:30, disc:20,status:"active_c",time:"09:15",date:"2026-03-11"},
  {id:"C002",code:"PERL-CC21",merchant:"كافيه لؤلؤة الخليج",user:"+97455000012",amount:15, disc:15,status:"used",    time:"10:42",date:"2026-03-11"},
  {id:"C003",code:"WARD-F1B0",merchant:"بوتيك وردة قطر",    user:"+97455000033",amount:80, disc:30,status:"used",    time:"11:05",date:"2026-03-11"},
  {id:"C004",code:"LOTZ-9E44",merchant:"سبا لوتس الملكي",   user:"+97455000044",amount:55, disc:25,status:"expired", time:"08:00",date:"2026-03-10"},
  {id:"C005",code:"ROYA-AA10",merchant:"مطعم الدوحة الملكي",user:"+97455000055",amount:30, disc:20,status:"active_c",time:"12:30",date:"2026-03-11"},
  {id:"C006",code:"WARD-B92C",merchant:"بوتيك وردة قطر",    user:"+97455000066",amount:120,disc:25,status:"used",    time:"13:10",date:"2026-03-11"},
];
const PX=[
  {id:"P001",merchant:"كافيه لؤلؤة الخليج",bank:"QIB",      iban:"QA57QIB000001",amount:434,wejha:48,net:386,status:"paid",   date:"2026-03-01"},
  {id:"P002",merchant:"بوتيك وردة قطر",    bank:"Doha Bank",iban:"QA57DOH000002",amount:819,wejha:91,net:728,status:"paid",   date:"2026-03-01"},
  {id:"P003",merchant:"سبا لوتس الملكي",   bank:"QNB",      iban:"QA57QNB000003",amount:567,wejha:63,net:504,status:"pending",date:"2026-04-01"},
  {id:"P004",merchant:"الأمين هايبر ماركت",bank:"CBQ",      iban:"QA57CBQ000004",amount:108,wejha:12,net:96, status:"hold",   date:"2026-04-01"},
  {id:"P005",merchant:"بوتيك وردة قطر",    bank:"Doha Bank",iban:"QA57DOH000002",amount:210,wejha:23,net:187,status:"pending",date:"2026-04-01"},
];
const RX=[
  {id:"R001",type:"merchant", title:"محتوى صورة غير مناسب",   from:"+97455000099",target:"مطعم الدوحة الملكي", date:"2026-03-10",status:"open",    priority:"high"},
  {id:"R002",type:"coupon",   title:"كوبون لم يُقبل في المتجر",from:"+97455000088",target:"كافيه لؤلؤة الخليج",date:"2026-03-09",status:"resolved",priority:"medium"},
  {id:"R003",type:"technical",title:"لوح التاجر لا يستجيب",    from:"فيصل العنزي", target:"سبا لوتس الملكي",   date:"2026-03-11",status:"open",    priority:"critical"},
  {id:"R004",type:"merchant", title:"عرض مضلل — خصم وهمي",    from:"+97455000077",target:"بوتيك وردة قطر",    date:"2026-03-11",status:"open",    priority:"high"},
];
const AX=[
  {id:"A001",name:"عبدالله القحطاني",role:"super_admin",     email:"abdullah@wejha.qa",phone:"55000001",status:"active",  last:"منذ 5 دقائق", avatar:"👑",joined:"2025-09-01",actions:142},
  {id:"A002",name:"مريم الدوسري",   role:"merchant_manager", email:"mariam@wejha.qa",  phone:"55000002",status:"active",  last:"منذ 20 دقيقة",avatar:"👩‍💼",joined:"2025-10-15",actions:87 },
  {id:"A003",name:"فيصل العنزي",    role:"finance",          email:"faisal@wejha.qa",  phone:"55000003",status:"active",  last:"منذ 2 ساعة",  avatar:"👨‍💼",joined:"2025-11-01",actions:53 },
  {id:"A004",name:"نوف الشمري",     role:"support",          email:"nouf@wejha.qa",    phone:"55000004",status:"inactive",last:"منذ 3 أيام",  avatar:"👩‍💻",joined:"2026-01-10",actions:31 },
  {id:"A005",name:"خالد المطيري",   role:"moderator",        email:"khaled@wejha.qa",  phone:"55000005",status:"active",  last:"منذ 1 ساعة",  avatar:"🧑‍💻",joined:"2026-02-01",actions:19 },
];
const AUDIT=[
  {id:1,admin:"مريم الدوسري",   action:"اعتمدت تاجر", target:"كافيه لؤلؤة الخليج",time:"10:32",date:"2026-03-11",type:"approve"},
  {id:2,admin:"عبدالله القحطاني",action:"علّق تاجر",  target:"الأمين هايبر ماركت",time:"09:18",date:"2026-03-11",type:"suspend"},
  {id:3,admin:"فيصل العنزي",    action:"نفّذ تحويل", target:"بوتيك وردة قطر",    time:"08:45",date:"2026-03-11",type:"payout" },
  {id:4,admin:"خالد المطيري",   action:"أغلق بلاغ",  target:"R002",              time:"07:30",date:"2026-03-11",type:"resolve"},
  {id:5,admin:"مريم الدوسري",   action:"رفضت تاجر",  target:"نادي الدوحة الرياضي",time:"23:10",date:"2026-03-10",type:"reject"},
];
const ROLES={
  super_admin:     {label:"مشرف عام",      color:C.go,icon:"👑",perms:["all"]},
  merchant_manager:{label:"مدير التجار",   color:C.pu,icon:"🏪",perms:["merchants.view","merchants.approve","merchants.suspend","merchants.edit"]},
  finance:         {label:"المالية",        color:C.gr,icon:"💰",perms:["finance.view","finance.payout","finance.reports","finance.export"]},
  support:         {label:"دعم العملاء",    color:C.bl,icon:"🎧",perms:["reports.view","reports.resolve","merchants.view","coupons.view"]},
  moderator:       {label:"مشرف المحتوى",  color:C.or,icon:"🔍",perms:["merchants.view","coupons.view","reports.view","reports.resolve"]},
};
const PGROUPS=[
  {g:"التجار",  i:"🏪",p:["merchants.view","merchants.approve","merchants.suspend","merchants.edit","merchants.delete"]},
  {g:"الكوبونات",i:"🎫",p:["coupons.view","coupons.cancel","coupons.export"]},
  {g:"المالية", i:"💰",p:["finance.view","finance.payout","finance.reports","finance.export"]},
  {g:"البلاغات",i:"🚨",p:["reports.view","reports.resolve","reports.escalate"]},
  {g:"الأقسام", i:"🗂️",p:["categories.view","categories.edit","categories.toggle"]},
  {g:"الإدارة", i:"👥",p:["admins.view","admins.create","admins.edit","admins.delete","settings.edit","audit.view"]},
];
const PL={"merchants.view":"عرض التجار","merchants.approve":"اعتماد التجار","merchants.suspend":"تعليق التجار","merchants.edit":"تعديل التاجر","merchants.delete":"حذف تاجر","coupons.view":"عرض الكوبونات","coupons.cancel":"إلغاء كوبون","coupons.export":"تصدير","finance.view":"عرض المالية","finance.payout":"تنفيذ تحويل","finance.reports":"تقارير","finance.export":"تصدير مالية","reports.view":"عرض البلاغات","reports.resolve":"إغلاق بلاغ","reports.escalate":"تصعيد","categories.view":"عرض الأقسام","categories.edit":"تعديل أقسام","categories.toggle":"إخفاء/إظهار","admins.view":"عرض الفريق","admins.create":"إضافة مشرف","admins.edit":"تعديل مشرف","admins.delete":"حذف مشرف","settings.edit":"الإعدادات","audit.view":"سجل التدقيق"};
const CATS0=[
  {id:"cat1",emoji:"🍽️",name:"مطاعم",      desc:"مطاعم ووجبات جاهزة",   visible:true, order:1,color:"#E85C3A",merchants:3,coupons:142},
  {id:"cat2",emoji:"☕", name:"مقاهي",      desc:"مقاهي ومشروبات",        visible:true, order:2,color:"#C9A84C",merchants:2,coupons:89 },
  {id:"cat3",emoji:"👗", name:"بوتيك وعطور",desc:"ملابس وأزياء وعطور",    visible:true, order:3,color:"#C45AE0",merchants:2,coupons:318},
  {id:"cat4",emoji:"🛒", name:"سوبر ماركت", desc:"بقالة ومواد غذائية",    visible:false,order:4,color:"#3BAF6E",merchants:1,coupons:55 },
  {id:"cat5",emoji:"💊", name:"صيدليات",    desc:"أدوية ومنتجات طبية",    visible:false,order:5,color:"#3B9EDD",merchants:1,coupons:0  },
  {id:"cat6",emoji:"🧖", name:"سبا ورياضة", desc:"تجميل ولياقة بدنية",    visible:false,order:6,color:"#E85CA0",merchants:2,coupons:201},
];

/* ── Modals ── */
function Overlay({children,onClose}){
  return <div className="fi" onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.82)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
    <div className="pi" onClick={e=>e.stopPropagation()}>{children}</div>
  </div>;
}
const mBox={background:C.sf,borderRadius:22,border:`1px solid ${C.bo}`,width:"100%",maxHeight:"92vh",overflowY:"auto"};
const mHdr=(title,onClose)=><div style={{padding:"16px 20px 12px",borderBottom:`1px solid ${C.bo}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
  <p style={{fontWeight:700,fontSize:15,color:C.tx}}>{title}</p>
  <button onClick={onClose} style={{background:C.ca,border:`1px solid ${C.bo}`,borderRadius:9,width:32,height:32,cursor:"pointer",color:C.mi,fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
</div>;

function MerchantModal({m,onClose,onAction}){
  const [tab,setTab]=useState("info");
  const [note,setNote]=useState("");
  const [acting,setActing]=useState(null);
  const act=a=>{setActing(a);setTimeout(()=>{onAction(m.id,a);setActing(null);onClose();},800);};
  return <Overlay onClose={onClose}>
    <div style={{...mBox,maxWidth:580,display:"flex",flexDirection:"column"}}>
      <div style={{padding:"16px 20px 12px",borderBottom:`1px solid ${C.bo}`,display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:42,height:42,borderRadius:12,background:`${C.pu}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{m.cat.split(" ")[0]}</div>
        <div style={{flex:1}}><p style={{fontWeight:700,fontSize:15,color:C.tx}}>{m.name}</p><p style={{fontSize:11,color:C.mi}}>{m.id} · {m.owner} · {m.city}</p></div>
        <Bdg s={m.status}/>
        <button onClick={onClose} style={{background:C.ca,border:`1px solid ${C.bo}`,borderRadius:9,width:30,height:30,cursor:"pointer",color:C.mi,fontSize:17,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
      </div>
      <div style={{display:"flex",borderBottom:`1px solid ${C.bo}`,flexShrink:0}}>
        {[["info","📋 المعلومات"],["docs","📄 الوثائق"],["finance","💰 المالية"],["notes","📝 ملاحظات"]].map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:"10px 6px",border:"none",background:"none",cursor:"pointer",fontSize:12,fontWeight:700,color:tab===t?C.pu:C.mi,borderBottom:tab===t?`2px solid ${C.pu}`:"2px solid transparent",fontFamily:"inherit"}}>{l}</button>
        ))}
      </div>
      <div style={{overflowY:"auto",flex:1,padding:"16px 20px"}}>
        {tab==="info"&&<>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:14}}>
            {[["🎫",m.coupons,"كوبون"],["🏷️",m.deals,"عرض"],["💵",`${fmt(m.revenue)} ر.ق`,"إيرادات"]].map(([ic,v,l])=>(
              <div key={l} style={{background:C.ca,borderRadius:12,padding:"12px",textAlign:"center",border:`1px solid ${C.bo}`}}>
                <p style={{fontSize:20}}>{ic}</p><p style={{fontWeight:700,fontSize:15,color:C.tx,marginTop:4}}>{v}</p><p style={{fontSize:11,color:C.mi}}>{l}</p>
              </div>
            ))}
          </div>
          {[["📱 الجوال",m.phone],["📧 البريد",m.email],["🏷️ النشاط",m.cat],["📅 الانضمام",m.joined],["🏦 البنك",m.bank]].map(([k,v])=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.bo}`}}>
              <span style={{fontSize:12,color:C.mi}}>{k}</span><span style={{fontSize:13,fontWeight:600,color:C.tx}}>{v}</span>
            </div>
          ))}
        </>}
        {tab==="docs"&&<div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{background:C.ca,borderRadius:12,padding:"14px",border:`1px solid ${C.bo}`}}>
            <p style={{fontSize:11,color:C.mi,marginBottom:4}}>📄 السجل التجاري</p>
            <p style={{fontWeight:700,color:C.tx,fontFamily:"'JetBrains Mono',monospace"}}>{m.cr}</p>
            <p style={{fontSize:11,marginTop:4,color:new Date(m.cr_exp)<new Date()?C.re:C.mi}}>ينتهي: {m.cr_exp} {new Date(m.cr_exp)<new Date()?"⚠️ منتهي!":""}</p>
          </div>
          <div style={{background:`${C.go}10`,borderRadius:12,padding:"11px 14px",border:`1px solid ${C.go}22`}}>
            <p style={{fontSize:11,color:C.go}}>📎 صور الوثائق تظهر هنا بعد ربط Storage</p>
          </div>
        </div>}
        {tab==="finance"&&<div style={{display:"flex",flexDirection:"column",gap:8}}>
          {[["إجمالي المبيعات",`${fmt(m.revenue)} ر.ق`,C.tx],["نسبة وِجهة 10%",`${fmt(m.revenue*.1)} ر.ق`,C.re],["صافي التاجر",`${fmt(m.revenue*.9)} ر.ق`,C.gr]].map(([k,v,col])=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"11px 14px",background:C.ca,borderRadius:11,border:`1px solid ${C.bo}`}}>
              <span style={{fontSize:12,color:C.mi}}>{k}</span><span style={{fontWeight:700,fontSize:14,color:col}}>{v}</span>
            </div>
          ))}
        </div>}
        {tab==="notes"&&<div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{background:C.ca,borderRadius:12,padding:"16px",border:`1px solid ${C.bo}`,minHeight:70,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <p style={{fontSize:12,color:C.di}}>لا توجد ملاحظات بعد</p>
          </div>
          <textarea value={note} onChange={e=>setNote(e.target.value)} rows={3} placeholder="أضف ملاحظة داخلية..." style={{...inp,resize:"none",lineHeight:1.7}}/>
          <Btn small onClick={()=>setNote("")}>💾 حفظ</Btn>
        </div>}
      </div>
      <div style={{padding:"12px 20px",borderTop:`1px solid ${C.bo}`,display:"flex",gap:8,flexWrap:"wrap",flexShrink:0}}>
        {m.status==="pending"   &&<><Btn color={C.gr} loading={acting==="active"}    onClick={()=>act("active")}>✅ اعتماد</Btn><Btn color={C.re} outline loading={acting==="rejected"} onClick={()=>act("rejected")}>✕ رفض</Btn></>}
        {m.status==="active"    &&<Btn color={C.or} outline loading={acting==="suspended"} onClick={()=>act("suspended")}>⛔ تعليق</Btn>}
        {m.status==="suspended" &&<Btn color={C.gr} loading={acting==="active"} onClick={()=>act("active")}>↩ تفعيل</Btn>}
        {m.status==="rejected"  &&<Btn color={C.go} outline loading={acting==="pending"} onClick={()=>act("pending")}>↩ إعادة</Btn>}
        <div style={{flex:1}}/><Btn outline color={C.mi} small onClick={onClose}>إغلاق</Btn>
      </div>
    </div>
  </Overlay>;
}

function AdminModal({admin:ex,onClose,onSave}){
  const [form,setForm]=useState(ex||{name:"",email:"",phone:"",role:"support"});
  const [cp,setCp]=useState(ex?.customPerms||[]);
  const [uc,setUc]=useState(!!ex?.customPerms);
  const [saving,setSaving]=useState(false);
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));
  const save=()=>{
    if(!form.name||!form.email)return;
    setSaving(true);
    setTimeout(()=>{onSave({...form,id:ex?.id||"A"+Date.now(),status:ex?.status||"active",last:"الآن",avatar:ex?.avatar||"🧑‍💼",actions:ex?.actions||0,joined:ex?.joined||"2026-03-11",...(uc?{customPerms:cp}:{})});setSaving(false);onClose();},800);
  };
  return <Overlay onClose={onClose}>
    <div style={{...mBox,maxWidth:500}}>
      {mHdr(ex?"✏️ تعديل مشرف":"➕ إضافة مشرف",onClose)}
      <div style={{padding:"18px 20px",display:"flex",flexDirection:"column",gap:12}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div><label style={{fontSize:11,color:C.mi,display:"block",marginBottom:4,fontWeight:700}}>الاسم *</label><input className="ih" value={form.name} onChange={e=>set("name",e.target.value)} placeholder="اسم المشرف" style={inp}/></div>
          <div><label style={{fontSize:11,color:C.mi,display:"block",marginBottom:4,fontWeight:700}}>الجوال</label><input className="ih" value={form.phone||""} onChange={e=>set("phone",e.target.value)} style={inp}/></div>
        </div>
        <div><label style={{fontSize:11,color:C.mi,display:"block",marginBottom:4,fontWeight:700}}>البريد *</label><input className="ih" type="email" value={form.email} onChange={e=>set("email",e.target.value)} style={{...inp,direction:"ltr"}}/></div>
        <div>
          <label style={{fontSize:11,color:C.mi,display:"block",marginBottom:7,fontWeight:700}}>الدور</label>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:6}}>
            {Object.entries(ROLES).map(([key,role])=>(
              <button key={key} className="tap" onClick={()=>{set("role",key);setUc(false);}}
                style={{padding:"9px 11px",borderRadius:10,border:`1.5px solid ${form.role===key&&!uc?role.color:C.bo}`,background:form.role===key&&!uc?`${role.color}14`:C.ca,color:form.role===key&&!uc?role.color:C.mi,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:6}}>
                <span>{role.icon}</span><span style={{flex:1}}>{role.label}</span>{form.role===key&&!uc&&<span>✓</span>}
              </button>
            ))}
            <button className="tap" onClick={()=>setUc(true)} style={{padding:"9px 11px",borderRadius:10,border:`1.5px solid ${uc?C.bl:C.bo}`,background:uc?`${C.bl}14`:C.ca,color:uc?C.bl:C.mi,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>🔧 مخصص</button>
          </div>
        </div>
        <div style={{background:C.ca,borderRadius:12,padding:"13px 15px",border:`1px solid ${C.bo}`}}>
          <p style={{fontSize:11,color:C.mi,fontWeight:700,marginBottom:10}}>{uc?"🔧 اختر الصلاحيات":`📋 صلاحيات: ${ROLES[form.role]?.label}`}</p>
          {PGROUPS.map(group=>(
            <div key={group.g} style={{marginBottom:10}}>
              <p style={{fontSize:10,color:C.di,marginBottom:5,fontWeight:700}}>{group.i} {group.g}</p>
              <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                {group.p.map(perm=>{
                  const on=uc?cp.includes(perm):(ROLES[form.role]?.perms[0]==="all"||ROLES[form.role]?.perms.includes(perm));
                  return <button key={perm} className="tap" onClick={()=>uc&&setCp(p=>p.includes(perm)?p.filter(x=>x!==perm):[...p,perm])}
                    style={{padding:"3px 9px",borderRadius:99,fontSize:10,fontWeight:600,fontFamily:"inherit",border:`1px solid ${on?C.pu+"55":C.bo}`,background:on?`${C.pu}14`:"transparent",color:on?C.pu:C.di,cursor:uc?"pointer":"default"}}>
                    {on&&"✓ "}{PL[perm]||perm}
                  </button>;
                })}
              </div>
            </div>
          ))}
        </div>
        <Btn color={C.pu} loading={saving} onClick={save} disabled={!form.name||!form.email}>{ex?"✓ حفظ التعديلات":"✓ إضافة المشرف"}</Btn>
      </div>
    </div>
  </Overlay>;
}

function CatModal({cat,onClose,onSave}){
  const [form,setForm]=useState(cat?{...cat}:{emoji:"",name:"",desc:"",color:C.pu,visible:false,order:99});
  const [saving,setSaving]=useState(false);
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));
  const EMOJIS=["🍽️","☕","👗","🛒","💊","🧖","🏋️","📚","✈️","🎮","🏥","🏦","🌿","🎨","🚗","💍","🐾","🎭"];
  const COLORS=["#E85C3A","#C9A84C","#C45AE0","#3BAF6E","#3B9EDD","#E85CA0","#7C3AED","#F08030","#22C985","#E04848"];
  const save=()=>{if(!form.name.trim()||!form.emoji)return;setSaving(true);setTimeout(()=>{onSave({...form,id:cat?.id||"cat_"+Date.now(),merchants:cat?.merchants||0,coupons:cat?.coupons||0});setSaving(false);onClose();},700);};
  return <Overlay onClose={onClose}>
    <div style={{...mBox,maxWidth:440}}>
      {mHdr(!cat?"➕ إضافة قسم":"✏️ تعديل القسم",onClose)}
      <div style={{padding:"16px 18px",display:"flex",flexDirection:"column",gap:12}}>
        <div style={{background:C.ca,borderRadius:12,padding:"12px 14px",border:`1px solid ${C.bo}`,display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:46,height:46,borderRadius:12,background:`${form.color}20`,border:`2px solid ${form.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:23,flexShrink:0}}>{form.emoji||"?"}</div>
          <div><p style={{fontWeight:700,fontSize:14,color:C.tx}}>{form.name||"اسم القسم"}</p><p style={{fontSize:11,color:C.mi}}>{form.desc||"وصف القسم"}</p><p style={{fontSize:10,marginTop:2,color:form.visible?C.gr:C.mi,fontWeight:700}}>{form.visible?"🟢 ظاهر":"⚫ مخفي"}</p></div>
        </div>
        <div><label style={{fontSize:11,color:C.mi,display:"block",marginBottom:6,fontWeight:700}}>الأيقونة</label>
          <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:5}}>
            {EMOJIS.map(e=><button key={e} className="tap" onClick={()=>set("emoji",e)} style={{width:34,height:34,borderRadius:9,border:`1.5px solid ${form.emoji===e?form.color:C.bo}`,background:form.emoji===e?`${form.color}20`:C.ca,fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{e}</button>)}
            <input value={form.emoji} onChange={e=>set("emoji",e.target.value)} maxLength={2} placeholder="أو اكتب" style={{...inp,width:58,textAlign:"center",fontSize:17,padding:"4px"}}/>
          </div>
        </div>
        <div><label style={{fontSize:11,color:C.mi,display:"block",marginBottom:5,fontWeight:700}}>اسم القسم *</label><input className="ih" value={form.name} onChange={e=>set("name",e.target.value)} placeholder="مثال: مطاعم" style={inp}/></div>
        <div><label style={{fontSize:11,color:C.mi,display:"block",marginBottom:5,fontWeight:700}}>الوصف</label><input className="ih" value={form.desc} onChange={e=>set("desc",e.target.value)} placeholder="وصف يظهر للتجار عند التسجيل..." style={inp}/></div>
        <div><label style={{fontSize:11,color:C.mi,display:"block",marginBottom:6,fontWeight:700}}>اللون</label>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
            {COLORS.map(col=><button key={col} className="tap" onClick={()=>set("color",col)} style={{width:26,height:26,borderRadius:"50%",background:col,border:form.color===col?"3px solid #fff":"2px solid transparent",cursor:"pointer",boxShadow:form.color===col?`0 0 0 2px ${col}`:""}}/>)}
            <input type="color" value={form.color} onChange={e=>set("color",e.target.value)} style={{width:30,height:30,borderRadius:7,border:`1px solid ${C.bo}`,cursor:"pointer",padding:2,background:C.ca}}/>
          </div>
        </div>
        <div style={{display:"flex",gap:10,alignItems:"flex-end"}}>
          <div><label style={{fontSize:11,color:C.mi,display:"block",marginBottom:5,fontWeight:700}}>الترتيب</label><input className="ih" type="number" min={1} max={20} value={form.order} onChange={e=>set("order",Number(e.target.value))} style={{...inp,width:70,textAlign:"center"}}/></div>
          <button className="tap" onClick={()=>set("visible",!form.visible)} style={{flex:1,padding:"10px",borderRadius:10,border:`1.5px solid ${form.visible?C.gr:C.bo}`,background:form.visible?`${C.gr}14`:C.ca,color:form.visible?C.gr:C.mi,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
            {form.visible?"🟢 ظاهر للعملاء":"⚫ مخفي"}
          </button>
        </div>
        <Btn color={C.pu} loading={saving} onClick={save} disabled={!form.name.trim()||!form.emoji}>{!cat?"✓ إضافة القسم":"✓ حفظ التعديلات"}</Btn>
      </div>
    </div>
  </Overlay>;
}

function Confirm({title,desc,onConfirm,onClose,confirmColor=C.re,confirmLabel="حذف"}){
  const [loading,setLoading]=useState(false);
  return <Overlay onClose={onClose}>
    <div style={{background:C.sf,borderRadius:20,padding:"26px 22px",border:`1px solid ${confirmColor}44`,maxWidth:360,width:"100%",textAlign:"center"}}>
      <p style={{fontSize:36,marginBottom:10}}>⚠️</p>
      <p style={{fontWeight:700,fontSize:16,color:C.tx,marginBottom:7}}>{title}</p>
      <p style={{fontSize:13,color:C.mi,lineHeight:1.7,marginBottom:20}}>{desc}</p>
      <div style={{display:"flex",gap:10}}>
        <Btn outline color={C.mi} onClick={onClose} style={{flex:1}}>إلغاء</Btn>
        <Btn color={confirmColor} loading={loading} onClick={()=>{setLoading(true);setTimeout(()=>{onConfirm();setLoading(false);},600);}} style={{flex:1}}>{confirmLabel}</Btn>
      </div>
    </div>
  </Overlay>;
}

function EditSetting({s,onClose,onSave}){
  const [val,setVal]=useState(s.value);
  return <Overlay onClose={onClose}>
    <div style={{background:C.sf,borderRadius:18,padding:"22px",border:`1px solid ${C.bo}`,maxWidth:360,width:"100%"}}>
      <p style={{fontWeight:700,fontSize:14,color:C.tx,marginBottom:4}}>✏️ تعديل الإعداد</p>
      <p style={{fontSize:11,color:C.mi,marginBottom:14}}>{s.label}</p>
      <input className="ih" value={val} onChange={e=>setVal(e.target.value)} style={{...inp,marginBottom:14}}/>
      <div style={{display:"flex",gap:8}}><Btn outline color={C.mi} onClick={onClose} style={{flex:1}}>إلغاء</Btn><Btn color={C.pu} onClick={()=>{onSave(val);onClose();}} style={{flex:1}}>حفظ</Btn></div>
    </div>
  </Overlay>;
}

/* ── Tab: Overview ── */
function TabOverview({merchants,categories,setTab,liveCount}){
  const stats={active:merchants.filter(m=>m.status==="active").length,pending:merchants.filter(m=>m.status==="pending").length,totalRev:merchants.reduce((s,m)=>s+m.revenue,0),wejhaRev:merchants.reduce((s,m)=>s+m.revenue*.1,0),coupons:merchants.reduce((s,m)=>s+m.coupons,0)};
  return <div>
    <div style={{marginBottom:18}}><h1 style={{fontWeight:700,fontSize:21,color:C.tx,marginBottom:3}}>لوحة المراقبة</h1><p style={{fontSize:13,color:C.mi}}>نظرة عامة — تحديث مباشر</p></div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:11,marginBottom:22}}>
      <SC icon="🏪" label="تجار نشطون"      value={stats.active}               sub="+2 هذا الشهر" color={C.gr} delay={0}  />
      <SC icon="⏳" label="بانتظار المراجعة" value={stats.pending}               color={C.go}      delay={.04}/>
      <SC icon="🎫" label="كوبونات الإجمالي" value={fmt(stats.coupons)}          sub="+142 اليوم"  color={C.pu} delay={.08}/>
      <SC icon="💵" label="إيرادات التجار"   value={`${fmt(stats.totalRev)} ر.ق`} sub="+18%"      color={C.bl} delay={.12}/>
      <SC icon="🏷️" label="عائد وِجهة"       value={`${fmt(stats.wejhaRev)} ر.ق`} sub="+18%"     color={C.pu} delay={.16}/>
      <SC icon="👥" label="مستخدمون مباشرون" value={liveCount.toLocaleString()}  sub="🟢 الآن"     color={C.gr} delay={.20}/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
      <div className="fu" style={{background:C.ca,borderRadius:16,padding:"16px",border:`1px solid ${C.bo}`}}>
        <ST icon="⏳" title="انتظار الموافقة" action={<Btn small outline color={C.go} onClick={()=>setTab("merchants")}>الكل</Btn>}/>
        {merchants.filter(m=>m.status==="pending").length===0?<p style={{fontSize:12,color:C.mi,textAlign:"center",padding:"16px 0"}}>لا يوجد طلبات ✅</p>:
          merchants.filter(m=>m.status==="pending").map(m=>(
            <div key={m.id} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 5px"}}>
              <div style={{width:32,height:32,borderRadius:9,background:`${C.pu}14`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>{m.cat.split(" ")[0]}</div>
              <div style={{flex:1}}><p style={{fontSize:12,fontWeight:600,color:C.tx}}>{m.name}</p><p style={{fontSize:10,color:C.mi}}>{m.city} · {m.joined}</p></div>
            </div>
          ))
        }
      </div>
      <div className="fu" style={{background:C.ca,borderRadius:16,padding:"16px",border:`1px solid ${C.bo}`,animationDelay:".05s"}}>
        <ST icon="🚨" title="بلاغات مفتوحة" action={<Btn small outline color={C.re} onClick={()=>setTab("reports")}>الكل</Btn>}/>
        {RX.filter(r=>r.status==="open").map(r=>(
          <div key={r.id} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 5px"}}>
            <div style={{width:32,height:32,borderRadius:9,background:`${C.re}14`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{r.priority==="critical"?"🚨":r.priority==="high"?"⚠️":"📋"}</div>
            <div style={{flex:1}}><p style={{fontSize:12,fontWeight:600,color:C.tx}}>{r.title}</p><p style={{fontSize:10,color:C.mi}}>{r.target}</p></div>
            <Bdg s={r.priority}/>
          </div>
        ))}
      </div>
    </div>
    <div className="fu" style={{background:C.ca,borderRadius:16,padding:"16px",border:`1px solid ${C.bo}`,marginBottom:14,animationDelay:".08s"}}>
      <ST icon="🗂️" title="حالة الأقسام" action={<Btn small outline color={C.pu} onClick={()=>setTab("categories")}>إدارة</Btn>}/>
      <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
        {[...categories].sort((a,b)=>a.order-b.order).map(cat=>(
          <div key={cat.id} onClick={()=>setTab("categories")} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 12px",borderRadius:10,border:`1.5px solid ${cat.visible?cat.color+"55":C.bo}`,background:cat.visible?`${cat.color}0E`:C.hi,cursor:"pointer",opacity:cat.visible?1:.55}}>
            <span style={{fontSize:16,filter:cat.visible?"none":"grayscale(1)"}}>{cat.emoji}</span>
            <span style={{fontSize:12,fontWeight:700,color:cat.visible?C.tx:C.mi}}>{cat.name}</span>
            <span style={{fontSize:9}}>{cat.visible?"🟢":"⚫"}</span>
          </div>
        ))}
      </div>
    </div>
    <div className="fu" style={{background:C.ca,borderRadius:16,padding:"16px",border:`1px solid ${C.bo}`,animationDelay:".11s"}}>
      <ST icon="🎫" title="آخر الكوبونات" action={<Btn small outline color={C.pu} onClick={()=>setTab("coupons")}>الكل</Btn>}/>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead><tr style={{borderBottom:`1px solid ${C.bo}`}}>{["الكود","المتجر","القيمة","الخصم","الحالة","الوقت"].map(h=><th key={h} style={{padding:"7px 10px",textAlign:"right",color:C.mi,fontWeight:600}}>{h}</th>)}</tr></thead>
          <tbody>{CX.slice(0,4).map(c=>(
            <tr key={c.id} className="rh" style={{borderBottom:`1px solid ${C.bo}`}}>
              <td style={{padding:"8px 10px",fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:C.pu,fontWeight:600}}>{c.code}</td>
              <td style={{padding:"8px 10px",color:C.tx}}>{c.merchant}</td>
              <td style={{padding:"8px 10px",fontWeight:700,color:C.tx}}>{c.amount} ر.ق</td>
              <td style={{padding:"8px 10px",color:C.gr}}>{c.disc}%</td>
              <td style={{padding:"8px 10px"}}><Bdg s={c.status}/></td>
              <td style={{padding:"8px 10px",color:C.mi,direction:"ltr"}}>{c.time}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  </div>;
}

/* ── Tab: Merchants ── */
function TabMerchants({merchants,setMerchants}){
  const [filter,setFilter]=useState("all");
  const [q,setQ]=useState("");
  const [sel,setSel]=useState(null);
  const act=(id,a)=>setMerchants(p=>p.map(m=>m.id===id?{...m,status:a}:m));
  const list=merchants.filter(m=>(filter==="all"||m.status===filter)&&(!q||m.name.includes(q)||m.owner.includes(q)));
  return <div>
    <PT title="إدارة التجار" sub={`${merchants.length} تاجر مسجل`} action={<Btn color={C.pu}>+ تاجر يدوي</Btn>}/>
    <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
      <input className="ih" value={q} onChange={e=>setQ(e.target.value)} placeholder="🔍 بحث..." style={{...inp,maxWidth:250}}/>
      <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
        {[["all","الكل"],["active","نشط"],["pending","معلق"],["suspended","موقوف"],["rejected","مرفوض"]].map(([v,l])=>(
          <button key={v} className="tap" onClick={()=>setFilter(v)} style={{padding:"7px 12px",borderRadius:9,border:`1px solid ${filter===v?C.pu:C.bo}`,background:filter===v?`${C.pu}14`:C.ca,color:filter===v?C.pu:C.mi,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
            {l} {v!=="all"&&`(${merchants.filter(m=>m.status===v).length})`}
          </button>
        ))}
      </div>
    </div>
    <div style={{background:C.ca,borderRadius:16,border:`1px solid ${C.bo}`,overflow:"hidden"}}>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead><tr style={{background:C.hi,borderBottom:`1px solid ${C.bo}`}}>{["المتجر","النشاط","المدينة","السجل","الكوبونات","الإيرادات","الحالة","الإجراءات"].map(h=><th key={h} style={{padding:"11px 15px",textAlign:"right",color:C.mi,fontWeight:600,whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
          <tbody>{list.map(m=>(
            <tr key={m.id} className="rh" style={{borderBottom:`1px solid ${C.bo}`,cursor:"pointer"}} onClick={()=>setSel(m)}>
              <td style={{padding:"12px 15px"}}>
                <div style={{display:"flex",alignItems:"center",gap:9}}>
                  <div style={{width:34,height:34,borderRadius:9,background:`${C.pu}10`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>{m.cat.split(" ")[0]}</div>
                  <div><p style={{fontWeight:600,color:C.tx}}>{m.name}</p><p style={{fontSize:11,color:C.mi}}>{m.owner}</p></div>
                </div>
              </td>
              <td style={{padding:"12px 15px",color:C.mi,fontSize:12}}>{m.cat.split(" ").slice(1).join(" ")}</td>
              <td style={{padding:"12px 15px",color:C.mi}}>{m.city}</td>
              <td style={{padding:"12px 15px",fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:new Date(m.cr_exp)<new Date()?C.re:C.mi}}>{m.cr}<br/><span style={{fontSize:10}}>{m.cr_exp}</span></td>
              <td style={{padding:"12px 15px",fontWeight:700,color:C.tx}}>{fmt(m.coupons)}</td>
              <td style={{padding:"12px 15px",fontWeight:700,color:C.gr}}>{fmt(m.revenue)} ر.ق</td>
              <td style={{padding:"12px 15px"}}><Bdg s={m.status}/></td>
              <td style={{padding:"12px 15px"}} onClick={e=>e.stopPropagation()}>
                <div style={{display:"flex",gap:5}}>
                  {m.status==="pending"   &&<><Btn small color={C.gr} onClick={()=>act(m.id,"active")}>✓</Btn><Btn small color={C.re} outline onClick={()=>act(m.id,"rejected")}>✕</Btn></>}
                  {m.status==="active"    &&<Btn small color={C.or} outline onClick={()=>act(m.id,"suspended")}>⛔</Btn>}
                  {m.status==="suspended" &&<Btn small color={C.gr} onClick={()=>act(m.id,"active")}>↩</Btn>}
                  <Btn small outline color={C.pu} onClick={()=>setSel(m)}>تفاصيل</Btn>
                </div>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      {list.length===0&&<p style={{fontSize:13,color:C.mi,textAlign:"center",padding:"28px 0"}}>لا توجد نتائج</p>}
    </div>
    {sel&&<MerchantModal m={sel} onClose={()=>setSel(null)} onAction={(id,a)=>{act(id,a);setSel(null);}}/>}
  </div>;
}

/* ── Tab: Coupons ── */
function TabCoupons(){
  const [coupons,setCoupons]=useState(CX);
  const [fs,setFs]=useState("all");
  const [q,setQ]=useState("");
  const list=coupons.filter(c=>(fs==="all"||c.status===fs)&&(!q||c.code.includes(q)||c.merchant.includes(q)));
  const ac=coupons.filter(c=>c.status==="active_c").length;
  return <div>
    <PT title="مراقبة الكوبونات" sub="تتبع في الوقت الفعلي" action={<Btn outline color={C.pu}>📥 تصدير</Btn>}/>
    <div style={{background:`${C.gr}0E`,borderRadius:12,padding:"9px 15px",border:`1px solid ${C.gr}22`,marginBottom:14,display:"flex",alignItems:"center",gap:9}}>
      <div style={{width:8,height:8,borderRadius:"50%",background:C.gr,animation:"pu 2s ease infinite"}}/><p style={{fontSize:12,fontWeight:700,color:C.gr}}>مباشر — {ac} كوبون نشط</p>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(155px,1fr))",gap:9,marginBottom:18}}>
      <SC icon="🎫" label="الإجمالي"    value={coupons.length}                             color={C.pu} delay={0}  />
      <SC icon="🟢" label="نشط"         value={ac}                                          color={C.gr} delay={.04}/>
      <SC icon="✅" label="مستخدم"      value={coupons.filter(c=>c.status==="used").length}    color={C.bl} delay={.08}/>
      <SC icon="⏰" label="منتهي"       value={coupons.filter(c=>c.status==="expired").length} color={C.mi} delay={.12}/>
    </div>
    <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
      <input className="ih" value={q} onChange={e=>setQ(e.target.value)} placeholder="🔍 بحث..." style={{...inp,maxWidth:250}}/>
      <div style={{display:"flex",gap:5}}>
        {[["all","الكل"],["active_c","نشط"],["used","مستخدم"],["expired","منتهي"]].map(([v,l])=>(
          <button key={v} className="tap" onClick={()=>setFs(v)} style={{padding:"7px 12px",borderRadius:9,border:`1px solid ${fs===v?C.pu:C.bo}`,background:fs===v?`${C.pu}14`:C.ca,color:fs===v?C.pu:C.mi,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>{l}</button>
        ))}
      </div>
    </div>
    <div style={{background:C.ca,borderRadius:16,border:`1px solid ${C.bo}`,overflow:"hidden"}}>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead><tr style={{background:C.hi,borderBottom:`1px solid ${C.bo}`}}>{["الكود","المتجر","المستخدم","القيمة","الخصم","الحالة","التاريخ","إجراء"].map(h=><th key={h} style={{padding:"10px 13px",textAlign:"right",color:C.mi,fontWeight:600,whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
          <tbody>{list.map(c=>(
            <tr key={c.id} className="rh" style={{borderBottom:`1px solid ${C.bo}`}}>
              <td style={{padding:"10px 13px",fontFamily:"'JetBrains Mono',monospace",color:C.pu,fontWeight:700,fontSize:11}}>{c.code}</td>
              <td style={{padding:"10px 13px",color:C.tx}}>{c.merchant}</td>
              <td style={{padding:"10px 13px",color:C.mi,direction:"ltr",fontSize:11}}>{c.user}</td>
              <td style={{padding:"10px 13px",fontWeight:700,color:C.tx}}>{c.amount} ر.ق</td>
              <td style={{padding:"10px 13px",color:C.gr}}>{c.disc}%</td>
              <td style={{padding:"10px 13px"}}><Bdg s={c.status}/></td>
              <td style={{padding:"10px 13px",color:C.mi,direction:"ltr",fontSize:11}}>{c.date} {c.time}</td>
              <td style={{padding:"10px 13px"}}>{c.status==="active_c"&&<Btn small color={C.re} outline onClick={()=>setCoupons(p=>p.map(x=>x.id===c.id?{...x,status:"expired"}:x))}>إلغاء</Btn>}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  </div>;
}

/* ── Tab: Finance ── */
function TabFinance({merchants}){
  const [payouts,setPayouts]=useState(PX);
  const [confirmPay,setConfirmPay]=useState(null);
  const totalRev=merchants.reduce((s,m)=>s+m.revenue,0);
  const wejhaRev=merchants.reduce((s,m)=>s+m.revenue*.1,0);
  const paidTotal=payouts.filter(p=>p.status==="paid").reduce((s,p)=>s+p.net,0);
  const pendTotal=payouts.filter(p=>p.status==="pending").reduce((s,p)=>s+p.net,0);
  const BARS=[["نوفمبر",2100],["ديسمبر",3400],["يناير",4200],["فبراير",5800],["مارس",totalRev]];
  const maxBar=Math.max(...BARS.map(b=>b[1]));
  return <div>
    <PT title="إدارة المالية" sub="التحويلات البنكية ونسب وِجهة" action={<Btn color={C.gr}>📤 تنفيذ كل التحويلات</Btn>}/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:10,marginBottom:20}}>
      <SC icon="💵" label="إجمالي مبيعات التجار" value={`${fmt(totalRev)} ر.ق`}  color={C.bl} delay={0}  />
      <SC icon="🏷️" label="عائد وِجهة (10%)"      value={`${fmt(wejhaRev)} ر.ق`}  color={C.pu} delay={.04}/>
      <SC icon="✅" label="مدفوع إجمالي"           value={`${fmt(paidTotal)} ر.ق`} color={C.gr} delay={.08}/>
      <SC icon="⏳" label="بانتظار الدفع"          value={`${fmt(pendTotal)} ر.ق`} color={C.go} delay={.12}/>
    </div>
    <div className="fu" style={{background:C.ca,borderRadius:16,padding:"16px 18px",border:`1px solid ${C.bo}`,marginBottom:16}}>
      <p style={{fontWeight:700,fontSize:13,color:C.tx,marginBottom:14}}>📈 الإيرادات الشهرية (ر.ق)</p>
      <div style={{display:"flex",gap:8,alignItems:"flex-end",height:90}}>
        {BARS.map(([month,val])=>{const pct=(val/maxBar)*100;return(
          <div key={month} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
            <span style={{fontSize:10,color:C.mi,fontWeight:700}}>{fmt(val)}</span>
            <div style={{width:"100%",background:C.hi,borderRadius:"5px 5px 0 0",height:70,display:"flex",alignItems:"flex-end",overflow:"hidden"}}>
              <div style={{width:"100%",height:`${pct}%`,background:`linear-gradient(0deg,${C.pu},${C.bl})`,borderRadius:"4px 4px 0 0",transition:"height .8s ease"}}/>
            </div>
            <span style={{fontSize:9,color:C.di}}>{month}</span>
          </div>
        );})}
      </div>
    </div>
    <div className="fu" style={{background:C.ca,borderRadius:16,border:`1px solid ${C.bo}`,overflow:"hidden",animationDelay:".06s"}}>
      <div style={{padding:"14px 18px",borderBottom:`1px solid ${C.bo}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <p style={{fontWeight:700,fontSize:14,color:C.tx}}>سجل التحويلات</p>
        <Btn small outline color={C.pu}>📥 تصدير</Btn>
      </div>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead><tr style={{background:C.hi,borderBottom:`1px solid ${C.bo}`}}>{["#","التاجر","البنك","IBAN","الإجمالي","نسبة وِجهة","صافي التاجر","موعد الدفع","الحالة","إجراء"].map(h=><th key={h} style={{padding:"10px 13px",textAlign:"right",color:C.mi,fontWeight:600,whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
          <tbody>{payouts.map(p=>(
            <tr key={p.id} className="rh" style={{borderBottom:`1px solid ${C.bo}`}}>
              <td style={{padding:"10px 13px",color:C.di,fontFamily:"'JetBrains Mono',monospace",fontSize:11}}>{p.id}</td>
              <td style={{padding:"10px 13px",color:C.tx,fontWeight:600}}>{p.merchant}</td>
              <td style={{padding:"10px 13px",color:C.mi,fontSize:12}}>{p.bank}</td>
              <td style={{padding:"10px 13px",fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:C.di}}>{p.iban}</td>
              <td style={{padding:"10px 13px",fontWeight:700,color:C.tx}}>{p.amount} ر.ق</td>
              <td style={{padding:"10px 13px",color:C.re}}>−{p.wejha} ر.ق</td>
              <td style={{padding:"10px 13px",fontWeight:700,color:C.gr}}>{p.net} ر.ق</td>
              <td style={{padding:"10px 13px",color:C.mi,direction:"ltr",fontSize:11}}>{p.date}</td>
              <td style={{padding:"10px 13px"}}><Bdg s={p.status==="pending"?"pending_p":p.status}/></td>
              <td style={{padding:"10px 13px"}}>
                {p.status==="pending"&&<Btn small color={C.gr} onClick={()=>setConfirmPay(p)}>💸 تحويل</Btn>}
                {p.status==="hold"   &&<Btn small color={C.or} outline>🔍 مراجعة</Btn>}
                {p.status==="paid"   &&<Btn small outline color={C.mi}>📄 إيصال</Btn>}
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
    {confirmPay&&<Confirm title={`تحويل لـ ${confirmPay.merchant}؟`} desc={`${confirmPay.net} ر.ق → ${confirmPay.bank} — ${confirmPay.iban}`} confirmLabel="💸 تأكيد التحويل" confirmColor={C.gr} onConfirm={()=>{setPayouts(p=>p.map(x=>x.id===confirmPay.id?{...x,status:"paid"}:x));setConfirmPay(null);}} onClose={()=>setConfirmPay(null)}/>}
  </div>;
}

/* ── Tab: Reports ── */
function TabReports(){
  const [reports,setReports]=useState(RX);
  const [filter,setFilter]=useState("all");
  const resolve=id=>setReports(p=>p.map(r=>r.id===id?{...r,status:"resolved"}:r));
  const list=reports.filter(r=>filter==="all"||r.status===filter||r.priority===filter);
  return <div>
    <PT title="البلاغات والشكاوى" sub={`${reports.filter(r=>r.status==="open").length} بلاغ مفتوح`}/>
    <div style={{display:"flex",gap:5,marginBottom:14,flexWrap:"wrap"}}>
      {[["all","الكل"],["open","مفتوح"],["resolved","محلول"],["critical","حرج"],["high","عالي"]].map(([v,l])=>(
        <button key={v} className="tap" onClick={()=>setFilter(v)} style={{padding:"7px 12px",borderRadius:9,border:`1px solid ${filter===v?C.pu:C.bo}`,background:filter===v?`${C.pu}14`:C.ca,color:filter===v?C.pu:C.mi,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>{l}</button>
      ))}
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {list.map(r=>(
        <div key={r.id} className="fu" style={{background:C.ca,borderRadius:16,padding:"16px 18px",border:`1px solid ${r.priority==="critical"?C.re+"44":C.bo}`,display:"flex",gap:12,alignItems:"flex-start"}}>
          <div style={{width:40,height:40,borderRadius:11,background:r.priority==="critical"?`${C.re}18`:r.priority==="high"?`${C.or}18`:`${C.go}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,flexShrink:0}}>{r.priority==="critical"?"🚨":r.priority==="high"?"⚠️":"📋"}</div>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:4,flexWrap:"wrap"}}>
              <p style={{fontWeight:700,fontSize:13,color:C.tx}}>{r.title}</p><Bdg s={r.priority}/><Bdg s={r.status}/>
            </div>
            <p style={{fontSize:12,color:C.mi,marginBottom:2}}>الهدف: <strong style={{color:C.tx}}>{r.target}</strong> · من: <span style={{direction:"ltr"}}>{r.from}</span></p>
            <p style={{fontSize:11,color:C.di}}>{r.date} · نوع: {r.type}</p>
          </div>
          <div style={{display:"flex",gap:6,flexShrink:0}}>
            {r.status==="open"&&<><Btn small color={C.gr} onClick={()=>resolve(r.id)}>✓ إغلاق</Btn><Btn small outline color={C.re}>تصعيد</Btn></>}
            {r.status==="resolved"&&<Btn small outline color={C.mi}>تفاصيل</Btn>}
          </div>
        </div>
      ))}
      {list.length===0&&<p style={{fontSize:13,color:C.mi,textAlign:"center",padding:"28px 0"}}>لا توجد بلاغات</p>}
    </div>
  </div>;
}

/* ── Tab: Categories ── */
function TabCategories({categories,setCategories}){
  const [showM,setShowM]=useState(false);
  const [editC,setEditC]=useState(null);
  const [confirmDel,setConfirmDel]=useState(null);
  const sorted=[...categories].sort((a,b)=>a.order-b.order);
  const visible=sorted.filter(c=>c.visible);
  const hidden=sorted.filter(c=>!c.visible);
  const toggle=id=>setCategories(p=>p.map(c=>c.id===id?{...c,visible:!c.visible}:c));
  const save=cat=>setCategories(p=>{const e=p.find(c=>c.id===cat.id);return e?p.map(c=>c.id===cat.id?cat:c):[...p,cat];});
  const del=id=>{setCategories(p=>p.filter(c=>c.id!==id));setConfirmDel(null);};
  const moveUp=id=>{const s=[...categories].sort((a,b)=>a.order-b.order);const idx=s.findIndex(c=>c.id===id);if(idx===0)return;setCategories(p=>p.map(c=>{if(c.id===s[idx].id)return{...c,order:s[idx-1].order};if(c.id===s[idx-1].id)return{...c,order:s[idx].order};return c;}));};
  const moveDn=id=>{const s=[...categories].sort((a,b)=>a.order-b.order);const v=s.filter(c=>c.visible);const idx=v.findIndex(c=>c.id===id);if(idx<0||idx===v.length-1)return;setCategories(p=>p.map(c=>{if(c.id===v[idx].id)return{...c,order:v[idx+1].order};if(c.id===v[idx+1].id)return{...c,order:v[idx].order};return c;}));};
  const Row=({cat,idx,arr,isHidden})=>(
    <div style={{background:C.ca,borderRadius:14,border:`1px solid ${C.bo}`,display:"flex",alignItems:"center",gap:9,padding:"12px 14px",borderRight:`4px solid ${isHidden?C.di:cat.color}`,opacity:isHidden?.6:1,transition:"all .2s"}}>
      {!isHidden&&<div style={{display:"flex",flexDirection:"column",gap:2,flexShrink:0}}>
        <button className="tap" onClick={()=>moveUp(cat.id)} disabled={idx===0} style={{background:C.hi,border:`1px solid ${C.bo}`,borderRadius:5,width:22,height:20,cursor:idx===0?"default":"pointer",color:idx===0?C.di:C.mi,fontSize:10,display:"flex",alignItems:"center",justifyContent:"center",opacity:idx===0?.35:1}}>▲</button>
        <button className="tap" onClick={()=>moveDn(cat.id)} disabled={idx===arr.length-1} style={{background:C.hi,border:`1px solid ${C.bo}`,borderRadius:5,width:22,height:20,cursor:idx===arr.length-1?"default":"pointer",color:idx===arr.length-1?C.di:C.mi,fontSize:10,display:"flex",alignItems:"center",justifyContent:"center",opacity:idx===arr.length-1?.35:1}}>▼</button>
      </div>}
      {!isHidden&&<div style={{width:24,height:24,borderRadius:7,background:`${cat.color}18`,border:`1px solid ${cat.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:cat.color,flexShrink:0}}>{idx+1}</div>}
      <div style={{width:40,height:40,borderRadius:11,background:isHidden?C.hi:`${cat.color}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:21,flexShrink:0,filter:isHidden?"grayscale(1)":"none"}}>{cat.emoji}</div>
      <div style={{flex:1}}>
        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:2}}>
          <p style={{fontWeight:700,fontSize:14,color:isHidden?C.mi:C.tx}}>{cat.name}</p>
          <span style={{background:isHidden?C.hi:`${cat.color}18`,color:isHidden?C.di:cat.color,borderRadius:99,padding:"1px 7px",fontSize:10,fontWeight:700}}>{isHidden?"مخفي ⚫":"ظاهر 🟢"}</span>
        </div>
        <p style={{fontSize:11,color:C.di,marginBottom:2}}>{cat.desc}</p>
        <div style={{display:"flex",gap:10}}><span style={{fontSize:10,color:C.di}}>🏪 {cat.merchants}</span><span style={{fontSize:10,color:C.di}}>🎫 {cat.coupons}</span></div>
      </div>
      <div style={{display:"flex",gap:5,flexShrink:0}}>
        {isHidden?<button className="tap" onClick={()=>toggle(cat.id)} style={{padding:"6px 11px",borderRadius:9,border:`1px solid ${C.gr}44`,background:`${C.gr}10`,color:C.gr,fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:5}}><span>👁️</span><span>إظهار</span></button>
          :<button className="tap" onClick={()=>toggle(cat.id)} style={{padding:"6px 11px",borderRadius:9,border:`1px solid ${C.bo}`,background:C.hi,color:C.mi,fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:5}}><span>🙈</span><span>إخفاء</span></button>}
        <button className="tap" onClick={()=>{setEditC(cat);setShowM(true);}} style={{padding:"6px 9px",borderRadius:9,border:`1px solid ${C.bo}`,background:C.hi,color:C.mi,fontSize:12,cursor:"pointer"}}>✏️</button>
        <button className="tap" onClick={()=>setConfirmDel(cat.id)} style={{padding:"6px 9px",borderRadius:9,border:`1px solid ${C.re}33`,background:`${C.re}0A`,color:C.re,fontSize:12,cursor:"pointer"}}>🗑</button>
      </div>
    </div>
  );
  return <div>
    <PT title="إدارة أقسام التطبيق" sub="يؤثر على تطبيق العميل وصفحة تسجيل التجار معاً" action={<Btn color={C.pu} onClick={()=>{setEditC(null);setShowM(true);}}>+ إضافة قسم</Btn>}/>
    <div className="fu" style={{background:`${C.pu}0A`,borderRadius:13,padding:"12px 16px",border:`1px solid ${C.pu}22`,marginBottom:18,display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}>
      <span style={{fontSize:22}}>🔗</span>
      {[["📱","تطبيق العميل","فلاتر الصفحة الرئيسية"],["📝","تسجيل التاجر","قائمة اختيار النشاط"],["🏷️","اقتراحات العنوان","تتوافق مع الأقسام المفعّلة"]].map(([ic,l,d])=>(
        <div key={l} style={{display:"flex",gap:6,alignItems:"flex-start"}}><span style={{fontSize:14}}>{ic}</span><div><p style={{fontSize:11,fontWeight:700,color:C.pu}}>{l}</p><p style={{fontSize:10,color:C.mi}}>{d}</p></div></div>
      ))}
    </div>
    <div style={{display:"flex",gap:9,marginBottom:18}}>
      {[["🟢",visible.length,"ظاهر",C.gr],["⚫",hidden.length,"مخفي",C.mi],["📦",categories.length,"الإجمالي",C.pu]].map(([ic,v,l,col])=>(
        <div key={l} style={{background:C.ca,borderRadius:11,padding:"10px 14px",border:`1px solid ${C.bo}`,display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:17}}>{ic}</span><div><p style={{fontWeight:700,fontSize:17,color:col}}>{v}</p><p style={{fontSize:10,color:C.mi}}>{l}</p></div>
        </div>
      ))}
    </div>
    <div style={{marginBottom:14}}>
      <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:9}}><div style={{width:8,height:8,borderRadius:"50%",background:C.gr}}/><p style={{fontWeight:700,fontSize:13,color:C.tx}}>ظاهرة ({visible.length})</p></div>
      <div style={{display:"flex",flexDirection:"column",gap:7}}>
        {visible.map((cat,i)=><Row key={cat.id} cat={cat} idx={i} arr={visible} isHidden={false}/>)}
        {visible.length===0&&<div style={{background:C.ca,borderRadius:13,border:`2px dashed ${C.bo}`,padding:"22px",textAlign:"center"}}><p style={{fontSize:13,color:C.mi}}>لا توجد أقسام ظاهرة — أضف قسماً أو فعّل أحد المخفية ⬇️</p></div>}
      </div>
    </div>
    {hidden.length>0&&<div style={{marginBottom:18}}>
      <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:9}}><div style={{width:8,height:8,borderRadius:"50%",background:C.di}}/><p style={{fontWeight:700,fontSize:13,color:C.mi}}>مخفية ({hidden.length})</p></div>
      <div style={{display:"flex",flexDirection:"column",gap:7}}>
        {hidden.map((cat,i)=><Row key={cat.id} cat={cat} idx={i} arr={hidden} isHidden={true}/>)}
      </div>
    </div>}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11}}>
      <div style={{background:C.ca,borderRadius:13,padding:"13px 15px",border:`1px solid ${C.bo}`}}>
        <p style={{fontSize:11,color:C.mi,fontWeight:700,marginBottom:10}}>📱 معاينة فلاتر العميل</p>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          <div style={{background:`${C.pu}18`,borderRadius:99,padding:"5px 12px",border:`1.5px solid ${C.pu}`,flexShrink:0}}><span style={{fontSize:11,fontWeight:700,color:C.pu}}>🗺️ الكل</span></div>
          {visible.map(cat=><div key={cat.id} style={{background:C.hi,borderRadius:99,padding:"5px 11px",border:`1px solid ${C.bo}`,display:"flex",alignItems:"center",gap:5,flexShrink:0}}><span style={{fontSize:13}}>{cat.emoji}</span><span style={{fontSize:11,fontWeight:600,color:C.mi}}>{cat.name}</span></div>)}
        </div>
      </div>
      <div style={{background:C.ca,borderRadius:13,padding:"13px 15px",border:`1px solid ${C.bo}`}}>
        <p style={{fontSize:11,color:C.mi,fontWeight:700,marginBottom:10}}>🏪 معاينة تسجيل التاجر</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
          {visible.map(cat=><div key={cat.id} style={{background:C.hi,borderRadius:9,padding:"7px 9px",border:`1px solid ${C.bo}`,display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:15}}>{cat.emoji}</span><span style={{fontSize:11,fontWeight:600,color:C.mi}}>{cat.name}</span></div>)}
          {visible.length===0&&<p style={{fontSize:11,color:C.re,gridColumn:"1/-1"}}>⚠️ لا توجد أقسام!</p>}
        </div>
      </div>
    </div>
    {showM&&<CatModal cat={editC} onClose={()=>{setShowM(false);setEditC(null);}} onSave={save}/>}
    {confirmDel&&<Confirm title="حذف هذا القسم؟" desc="لن يظهر في التطبيق لكن التجار المرتبطون لن يُحذفوا." confirmLabel="حذف القسم" onConfirm={()=>del(confirmDel)} onClose={()=>setConfirmDel(null)}/>}
  </div>;
}

/* ── Tab: Admins ── */
function TabAdmins({admins,setAdmins}){
  const [showM,setShowM]=useState(false);
  const [editA,setEditA]=useState(null);
  const [confirmDis,setConfirmDis]=useState(null);
  const [auditOpen,setAuditOpen]=useState(false);
  const [roleFilter,setRoleFilter]=useState("all");
  const save=a=>setAdmins(p=>{const e=p.find(x=>x.id===a.id);return e?p.map(x=>x.id===a.id?a:x):[...p,a];});
  const list=admins.filter(a=>roleFilter==="all"||a.role===roleFilter);
  const AIC={approve:"✅",suspend:"⛔",payout:"💸",resolve:"✓",reject:"✕",admin:"👥"};
  const ACC={approve:C.gr,suspend:C.or,payout:C.bl,resolve:C.gr,reject:C.re,admin:C.pu};
  return <div>
    <PT title="إدارة الفريق والصلاحيات" sub={`${admins.length} مشرف · ${admins.filter(a=>a.status==="active").length} نشط`} action={<Btn color={C.pu} onClick={()=>{setEditA(null);setShowM(true);}}>+ إضافة مشرف</Btn>}/>
    <div className="fu" style={{background:C.ca,borderRadius:16,padding:"16px 18px",border:`1px solid ${C.bo}`,marginBottom:18}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:13}}>
        <p style={{fontWeight:700,fontSize:14,color:C.tx}}>🔐 هيكل الصلاحيات</p>
        <Btn small outline color={C.bl} onClick={()=>setAuditOpen(true)}>📋 سجل التدقيق</Btn>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(175px,1fr))",gap:9}}>
        {Object.entries(ROLES).map(([key,role])=>{
          const cnt=admins.filter(a=>a.role===key).length;
          const on=roleFilter===key;
          return <div key={key} onClick={()=>setRoleFilter(on?"all":key)} style={{background:on?`${role.color}12`:C.hi,borderRadius:12,padding:"13px",border:`1.5px solid ${on?role.color:C.bo}`,cursor:"pointer",transition:"all .2s"}}>
            <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:7}}>
              <span style={{fontSize:19}}>{role.icon}</span>
              <p style={{fontWeight:700,fontSize:12,color:role.color,flex:1}}>{role.label}</p>
              <span style={{background:`${role.color}18`,color:role.color,borderRadius:99,padding:"1px 7px",fontSize:11,fontWeight:700}}>{cnt}</span>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
              {(role.perms[0]==="all"?["كل الصلاحيات 👑"]:role.perms.slice(0,3).map(p=>PL[p]||p)).map(p=>(
                <span key={p} style={{background:`${role.color}12`,color:role.color,borderRadius:99,padding:"2px 7px",fontSize:9,fontWeight:600}}>{p}</span>
              ))}
              {role.perms[0]!=="all"&&role.perms.length>3&&<span style={{fontSize:9,color:C.di}}>+{role.perms.length-3}</span>}
            </div>
          </div>;
        })}
      </div>
      {roleFilter!=="all"&&<p style={{fontSize:11,color:C.mi,marginTop:9,textAlign:"center"}}>تصفية: {ROLES[roleFilter]?.label} — اضغط مرة أخرى للإلغاء</p>}
    </div>
    <div className="fu" style={{background:C.ca,borderRadius:16,border:`1px solid ${C.bo}`,overflow:"hidden",animationDelay:".06s"}}>
      {list.map((a,i)=>{
        const role=ROLES[a.role];
        return <div key={a.id} className="rh" style={{display:"flex",alignItems:"center",gap:12,padding:"14px 18px",borderBottom:i<list.length-1?`1px solid ${C.bo}`:"none"}}>
          <div style={{width:44,height:44,borderRadius:13,background:`${role?.color||C.pu}14`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:21,flexShrink:0,border:`1px solid ${a.status==="active"?role?.color+"33":C.bo}`}}>{a.avatar}</div>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3,flexWrap:"wrap"}}>
              <p style={{fontWeight:700,fontSize:14,color:C.tx}}>{a.name}</p>
              <span style={{background:`${role?.color||C.pu}14`,color:role?.color||C.pu,borderRadius:99,padding:"2px 8px",fontSize:11,fontWeight:700}}>{role?.icon} {role?.label}</span>
              <Bdg s={a.status}/>
            </div>
            <p style={{fontSize:12,color:C.mi,direction:"ltr"}}>{a.email} · {a.phone}</p>
            <div style={{display:"flex",gap:12,marginTop:2}}>
              <span style={{fontSize:10,color:C.di}}>آخر نشاط: {a.last}</span>
              <span style={{fontSize:10,color:C.di}}>إجراءات: {a.actions}</span>
              <span style={{fontSize:10,color:C.di}}>انضم: {a.joined}</span>
            </div>
          </div>
          <div style={{display:"flex",gap:6,flexShrink:0}}>
            <Btn small outline color={C.pu} onClick={()=>{setEditA(a);setShowM(true);}}>✏️ تعديل</Btn>
            {a.role!=="super_admin"&&a.status==="active"&&<Btn small outline color={C.re} onClick={()=>setConfirmDis(a)}>تعطيل</Btn>}
            {a.status==="inactive"&&<Btn small color={C.gr} onClick={()=>setAdmins(p=>p.map(x=>x.id===a.id?{...x,status:"active"}:x))}>تفعيل</Btn>}
          </div>
        </div>;
      })}
      {list.length===0&&<p style={{fontSize:13,color:C.mi,textAlign:"center",padding:"26px 0"}}>لا يوجد مشرفون في هذا الدور</p>}
    </div>
    {auditOpen&&<Overlay onClose={()=>setAuditOpen(false)}>
      <div style={{...mBox,maxWidth:520,display:"flex",flexDirection:"column"}}>
        {mHdr("📋 سجل التدقيق (Audit Log)",()=>setAuditOpen(false))}
        <div style={{overflowY:"auto",flex:1,padding:"14px 18px"}}>
          {AUDIT.map(e=>(
            <div key={e.id} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"10px 0",borderBottom:`1px solid ${C.bo}`}}>
              <div style={{width:30,height:30,borderRadius:8,background:`${ACC[e.type]||C.pu}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{AIC[e.type]||"📌"}</div>
              <div style={{flex:1}}>
                <p style={{fontSize:12,color:C.tx,marginBottom:2}}><strong style={{color:C.pu}}>{e.admin}</strong> {e.action} <strong style={{color:C.tx}}>{e.target}</strong></p>
                <p style={{fontSize:10,color:C.di,direction:"ltr"}}>{e.date} · {e.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Overlay>}
    {showM&&<AdminModal admin={editA} onClose={()=>{setShowM(false);setEditA(null);}} onSave={save}/>}
    {confirmDis&&<Confirm title={`تعطيل ${confirmDis.name}؟`} desc="لن يتمكن من الوصول للوح الإدارة. يمكنك إعادة تفعيله لاحقاً." confirmLabel="تعطيل" onConfirm={()=>{setAdmins(p=>p.map(a=>a.id===confirmDis.id?{...a,status:"inactive"}:a));setConfirmDis(null);}} onClose={()=>setConfirmDis(null)}/>}
  </div>;
}

/* ── Tab: Settings ── */
function TabSettings(){
  const [settings,setSettings]=useState({
    wejhaPct:     {label:"نسبة وِجهة من الكوبونات المدفوعة",value:"10%",       group:"finance", editable:true },
    minPayout:    {label:"الحد الأدنى للتحويل",            value:"50 ر.ق",     group:"finance", editable:true },
    payoutDay:    {label:"يوم التحويل الشهري",              value:"أول كل شهر",group:"finance", editable:true },
    holdPeriod:   {label:"فترة الاحتجاز للتحويلات",         value:"7 أيام",     group:"finance", editable:true },
    couponTTL:    {label:"صلاحية الكوبون الافتراضية",       value:"72 ساعة",    group:"coupons", editable:true },
    maxCoupons:   {label:"الحد الأقصى للكوبونات لكل عرض",  value:"500 كوبون",  group:"coupons", editable:true },
    maxRadius:    {label:"نطاق الظهور الأقصى",              value:"5 كم",       group:"coupons", editable:true },
    maxDeals:     {label:"عدد العروض الأقصى للتاجر",        value:"20 عرض",     group:"coupons", editable:true },
    welcomeMsg:   {label:"رسالة الترحيب",                   value:"مفعّلة ✅",  group:"app",     editable:true },
    pushNotif:    {label:"إشعارات Push",                    value:"مفعّلة ✅",  group:"app",     editable:true },
    languages:    {label:"اللغات المدعومة",                 value:"ع / EN / اردو / हिन्दी",group:"app",editable:false},
    otpWA:        {label:"OTP عبر واتساب",                  value:"مفعّل ✅",   group:"app",     editable:false},
    manualReview: {label:"مراجعة التجار يدوياً",            value:"مفعّلة ✅",  group:"security",editable:true },
    dupCoupon:    {label:"حظر الكوبونات المكررة",            value:"مفعّل ✅",   group:"security",editable:false},
    auditLog:     {label:"سجل التدقيق (Audit Log)",         value:"مفعّل ✅",   group:"security",editable:false},
    ibanEncrypt:  {label:"تشفير IBAN",                      value:"AES-256 ✅", group:"security",editable:false},
    maintenance:  {label:"وضع الصيانة",                     value:"معطّل",     group:"security",editable:true },
  });
  const [editKey,setEditKey]=useState(null);
  const [msg,setMsg]=useState("");
  const [confirmFrz,setConfirmFrz]=useState(false);
  const GRPS=[
    {key:"finance", title:"💰 السياسة المالية",  color:C.gr},
    {key:"coupons", title:"🎫 سياسة الكوبونات",  color:C.pu},
    {key:"app",     title:"📱 إعدادات التطبيق",  color:C.bl},
    {key:"security",title:"🛡️ الأمان والاعتدال", color:C.or},
  ];
  return <div>
    <PT title="إعدادات النظام" sub="إعدادات وِجهة — تؤثر على جميع المستخدمين"/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
      {GRPS.map(g=>(
        <div key={g.key} className="fu" style={{background:C.ca,borderRadius:16,padding:"16px 18px",border:`1px solid ${C.bo}`}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12,paddingBottom:9,borderBottom:`1px solid ${C.bo}`}}>
            <div style={{width:28,height:28,borderRadius:8,background:`${g.color}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>{g.title.split(" ")[0]}</div>
            <p style={{fontWeight:700,fontSize:13,color:C.tx}}>{g.title.split(" ").slice(1).join(" ")}</p>
          </div>
          {Object.entries(settings).filter(([,s])=>s.group===g.key).map(([key,s])=>(
            <div key={key} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.bo}`}}>
              <span style={{fontSize:12,color:C.mi,flex:1,paddingLeft:8}}>{s.label}</span>
              <div style={{display:"flex",alignItems:"center",gap:7,flexShrink:0}}>
                <span style={{fontSize:12,fontWeight:700,color:C.tx}}>{s.value}</span>
                {s.editable&&<Btn small outline color={C.pu} onClick={()=>setEditKey(key)}>تعديل</Btn>}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
    <div className="fu" style={{background:C.ca,borderRadius:16,padding:"16px 18px",border:`1px solid ${C.bo}`,marginBottom:12,animationDelay:".07s"}}>
      <p style={{fontWeight:700,fontSize:13,color:C.tx,marginBottom:12}}>📢 إشعار جماعي للتجار (واتساب)</p>
      <textarea value={msg} onChange={e=>setMsg(e.target.value)} rows={3} placeholder="اكتب الرسالة هنا — تصل لجميع التجار المعتمدين..." style={{...inp,resize:"none",lineHeight:1.7,marginBottom:10}}/>
      <div style={{display:"flex",gap:9}}><Btn outline color={C.bl}>👁️ معاينة</Btn><Btn color={C.pu} disabled={!msg.trim()}>📤 إرسال للجميع</Btn></div>
    </div>
    <div className="fu" style={{background:`${C.re}07`,borderRadius:16,padding:"16px 18px",border:`1px solid ${C.re}33`,animationDelay:".1s"}}>
      <p style={{fontWeight:700,fontSize:13,color:C.re,marginBottom:12}}>⚠️ منطقة الخطر</p>
      <div style={{display:"flex",gap:9,flexWrap:"wrap"}}>
        <Btn outline color={C.re}>🗃️ تصدير كامل البيانات</Btn>
        <Btn outline color={C.re} onClick={()=>setConfirmFrz(true)}>🔒 تجميد النظام</Btn>
        <Btn outline color={C.re}>🗑️ حذف بيانات اختبارية</Btn>
      </div>
    </div>
    {editKey&&<EditSetting s={settings[editKey]} onClose={()=>setEditKey(null)} onSave={v=>setSettings(p=>({...p,[editKey]:{...p[editKey],value:v}}))}/>}
    {confirmFrz&&<Confirm title="تجميد النظام؟" desc="سيتوقف التطبيق عن العمل للعملاء والتجار. استخدم فقط في الصيانة الطارئة." confirmLabel="🔒 تجميد" confirmColor={C.re} onConfirm={()=>setConfirmFrz(false)} onClose={()=>setConfirmFrz(false)}/>}
  </div>;
}

/* ══ MAIN ══ */
export default function App(){
  const [tab,setTab]=useState("overview");
  const [merchants,setMerchants]=useState(MX);
  const [admins,setAdmins]=useState(AX);
  const [categories,setCategories]=useState(CATS0);
  const [live,setLive]=useState(1243);
  const [notifs,setNotifs]=useState(3);
  useEffect(()=>{const t=setInterval(()=>setLive(n=>n+Math.floor(Math.random()*3-1)),4000);return()=>clearInterval(t);},[]);
  const TABS=[
    {id:"overview",  icon:"📊",label:"المراقبة"},
    {id:"merchants", icon:"🏪",label:"التجار"},
    {id:"coupons",   icon:"🎫",label:"الكوبونات"},
    {id:"finance",   icon:"💰",label:"المالية"},
    {id:"reports",   icon:"🚨",label:"البلاغات"},
    {id:"categories",icon:"🗂️",label:"الأقسام"},
    {id:"admins",    icon:"👥",label:"الفريق"},
    {id:"settings",  icon:"⚙️",label:"الإعدادات"},
  ];
  const openR=RX.filter(r=>r.status==="open").length;
  const pendM=merchants.filter(m=>m.status==="pending").length;
  return <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column"}}>
    <header style={{position:"sticky",top:0,zIndex:50,background:`${C.sf}F4`,backdropFilter:"blur(20px)",borderBottom:`1px solid ${C.bo}`}}>
      <div style={{maxWidth:1300,margin:"0 auto",padding:"0 18px",display:"flex",alignItems:"center",gap:0}}>
        <div style={{display:"flex",alignItems:"center",gap:9,padding:"12px 0",marginLeft:20,flexShrink:0}}>
          <div style={{display:"flex",gap:2}}>
            <div style={{width:4,height:28,background:C.pu,borderRadius:"3px 0 0 3px"}}/>
            <div style={{width:2,height:28,background:C.bo}}/>
            <div style={{width:28,height:28,background:C.ca,borderRadius:"0 8px 8px 0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>🏷️</div>
          </div>
          <div><p style={{fontWeight:700,fontSize:14,color:C.tx,lineHeight:1}}>وِجهة</p><p style={{fontSize:8,color:C.pu,fontWeight:700}}>لوحة الإدارة</p></div>
        </div>
        <nav style={{display:"flex",flex:1,overflowX:"auto",gap:1,padding:"5px 0"}}>
          {TABS.map(({id,icon,label})=>(
            <button key={id} className="tap" onClick={()=>setTab(id)}
              style={{display:"flex",alignItems:"center",gap:5,padding:"7px 11px",borderRadius:8,border:"none",background:tab===id?`${C.pu}18`:"transparent",color:tab===id?C.pu:C.mi,fontWeight:tab===id?700:500,fontSize:12,cursor:"pointer",flexShrink:0,fontFamily:"inherit",whiteSpace:"nowrap",transition:"all .15s"}}>
              <span style={{fontSize:13}}>{icon}</span><span>{label}</span>
              {id==="reports"  &&openR>0&&<span className="bl" style={{background:C.re,color:"#fff",borderRadius:99,fontSize:9,fontWeight:900,padding:"1px 5px"}}>{openR}</span>}
              {id==="categories"&&<span style={{background:`${C.gr}22`,color:C.gr,borderRadius:99,fontSize:9,fontWeight:900,padding:"1px 6px"}}>{categories.filter(c=>c.visible).length}🟢</span>}
              {id==="merchants" &&pendM>0&&<span style={{background:`${C.go}22`,color:C.go,borderRadius:99,fontSize:9,fontWeight:900,padding:"1px 5px"}}>{pendM}</span>}
            </button>
          ))}
        </nav>
        <div style={{display:"flex",alignItems:"center",gap:7,flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:5,background:C.ca,borderRadius:99,padding:"5px 10px",border:`1px solid ${C.bo}`}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:C.gr,animation:"pu 2s ease infinite"}}/>
            <span style={{fontSize:11,fontWeight:700,color:C.tx,fontFamily:"'JetBrains Mono',monospace"}}>{live.toLocaleString()}</span>
            <span style={{fontSize:9,color:C.mi}}>مستخدم</span>
          </div>
          <button className="tap" onClick={()=>setNotifs(0)} style={{position:"relative",width:32,height:32,borderRadius:9,border:`1px solid ${C.bo}`,background:C.ca,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>
            🔔{notifs>0&&<span style={{position:"absolute",top:3,left:3,background:C.re,color:"#fff",borderRadius:99,fontSize:8,fontWeight:900,padding:"1px 4px",lineHeight:"12px"}}>{notifs}</span>}
          </button>
          <div style={{display:"flex",alignItems:"center",gap:6,background:C.ca,borderRadius:9,padding:"5px 9px",border:`1px solid ${C.bo}`}}>
            <span style={{fontSize:14}}>👑</span>
            <div><p style={{fontSize:11,fontWeight:700,color:C.tx,lineHeight:1}}>عبدالله</p><p style={{fontSize:8,color:C.pu}}>مشرف عام</p></div>
          </div>
        </div>
      </div>
    </header>
    <main style={{flex:1,maxWidth:1300,margin:"0 auto",width:"100%",padding:"22px 18px 48px"}}>
      {tab==="overview"   &&<TabOverview   merchants={merchants} categories={categories} setTab={setTab} liveCount={live}/>}
      {tab==="merchants"  &&<TabMerchants  merchants={merchants} setMerchants={setMerchants}/>}
      {tab==="coupons"    &&<TabCoupons/>}
      {tab==="finance"    &&<TabFinance    merchants={merchants}/>}
      {tab==="reports"    &&<TabReports/>}
      {tab==="categories" &&<TabCategories categories={categories} setCategories={setCategories}/>}
      {tab==="admins"     &&<TabAdmins     admins={admins} setAdmins={setAdmins}/>}
      {tab==="settings"   &&<TabSettings/>}
    </main>
  </div>;
}
