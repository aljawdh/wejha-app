'use client'
import { useState, useEffect } from "react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

if (!document.getElementById("wf-sty")) {
  const l = document.createElement("link"); l.rel="stylesheet";
  l.href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500;600;700&display=swap";
  document.head.appendChild(l);
  const s=document.createElement("style"); s.id="wf-sty";
  s.textContent=`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{font-family:'DM Sans',sans-serif;direction:rtl;background:#060C14;color:#D8E8F4;min-height:100vh}
input,button,select,textarea{font-family:inherit}
.mono{font-family:'JetBrains Mono',monospace!important}
::-webkit-scrollbar{width:3px;height:3px}::-webkit-scrollbar-thumb{background:#1A2A3A;border-radius:99px}
@keyframes fu{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes fi{from{opacity:0}to{opacity:1}}
@keyframes pi{0%{opacity:0;transform:scale(.92)}70%{transform:scale(1.01)}100%{opacity:1;transform:scale(1)}}
@keyframes sp{to{transform:rotate(360deg)}}
@keyframes pu{0%,100%{opacity:1}50%{opacity:.3}}
@keyframes ticker{0%{transform:translateY(0)}100%{transform:translateY(-50%)}}
.fu{animation:fu .32s cubic-bezier(.22,1,.36,1) both}
.fi{animation:fi .2s ease both}
.pi{animation:pi .36s cubic-bezier(.34,1.56,.64,1) both}
.tap:active{transform:scale(.95)!important;transition:transform .08s!important}
.rh:hover{background:#0C1A26!important}
.foc:focus{outline:none!important;border-color:#00E564!important;box-shadow:0 0 0 3px #00E56415!important}
.glow:hover{box-shadow:0 0 24px #00E56418!important;border-color:#00E56433!important;transition:all .2s}`;
  document.head.appendChild(s);
}

const G={
  bg:"#060C14",s1:"#0B1520",s2:"#0F1C2A",s3:"#142030",bo:"#182A3C",boH:"#203448",
  gr:"#00E564",grD:"#00A848",grG:"#00E56414",
  go:"#F0C040",red:"#F04858",bl:"#3AA8F8",or:"#F08030",tl:"#20C8A0",pu:"#A060F8",
  tx:"#D8E8F4",mi:"#5A7898",di:"#253545",
};
const fmt=n=>Number(n||0).toLocaleString("ar-QA");
const fmtD=n=>`${Number(n||0).toFixed(2)}`;
const pct=(a,b)=>b?((a/b)*100).toFixed(1):0;

/* ─ Micro-components ─ */
const Spin=({s=14,c=G.gr})=><div style={{width:s,height:s,border:`2px solid ${c}22`,borderTopColor:c,borderRadius:"50%",animation:"sp .7s linear infinite",flexShrink:0}}/>;
function Btn({children,onClick,color=G.gr,small,outline,disabled,loading,style:st={}}){
  return <button className="tap" onClick={onClick} disabled={disabled||loading}
    style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,
      padding:small?"6px 12px":"9px 16px",borderRadius:small?8:10,
      border:outline?`1px solid ${color}55`:"none",
      background:outline?"transparent":disabled?G.s3:color,
      color:outline?color:G.bg,fontWeight:700,fontSize:small?11:13,
      cursor:disabled?"default":"pointer",opacity:disabled?.5:1,fontFamily:"inherit",...st}}>
    {loading&&<Spin s={12} c={outline?color:G.bg}/>}{children}
  </button>;
}
function Tag({label,color=G.gr}){
  return <span style={{background:`${color}18`,color,borderRadius:99,padding:"2px 9px",fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>{label}</span>;
}
const inp={width:"100%",padding:"9px 13px",borderRadius:9,border:`1px solid ${G.bo}`,background:G.s2,fontSize:13,color:G.tx};
function Card({children,style={},className="fu",delay=0}){
  return <div className={`${className} glow`} style={{background:G.s2,borderRadius:16,border:`1px solid ${G.bo}`,padding:"18px 20px",animationDelay:`${delay}s`,...style}}>{children}</div>;
}
function SHead({icon,title,sub,action}){
  return <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      <span style={{fontSize:18}}>{icon}</span>
      <div><p style={{fontWeight:700,fontSize:15,color:G.tx}}>{title}</p>{sub&&<p style={{fontSize:11,color:G.mi,marginTop:1}}>{sub}</p>}</div>
    </div>
    {action}
  </div>;
}

/* ─ Custom tooltip ─ */
const CTip=({active,payload,label,unit="ر.ق"})=>{
  if(!active||!payload?.length)return null;
  return <div style={{background:G.s3,border:`1px solid ${G.boH}`,borderRadius:10,padding:"10px 14px",fontSize:12}}>
    <p style={{color:G.mi,marginBottom:6,fontWeight:600}}>{label}</p>
    {payload.map((p,i)=><p key={i} className="mono" style={{color:p.color,fontWeight:700}}>{p.name}: {Number(p.value).toLocaleString("ar-QA")} {unit}</p>)}
  </div>;
};

/* ─ Data ─ */
const MONTHLY=[
  {m:"أكتوبر",  sales:18200,wejha:1820,tax:910, payouts:16380,coupons:312,merchants:12,vatIncome:182 },
  {m:"نوفمبر",  sales:24500,wejha:2450,tax:1225,payouts:22050,coupons:428,merchants:15,vatIncome:245 },
  {m:"ديسمبر",  sales:38700,wejha:3870,tax:1935,payouts:34830,coupons:691,merchants:18,vatIncome:387 },
  {m:"يناير",   sales:31200,wejha:3120,tax:1560,payouts:28080,coupons:544,merchants:20,vatIncome:312 },
  {m:"فبراير",  sales:42800,wejha:4280,tax:2140,payouts:38520,coupons:748,merchants:24,vatIncome:428 },
  {m:"مارس",    sales:21420,wejha:2142,tax:1071,payouts:19278,coupons:380,merchants:11,vatIncome:214 },
];
const TOTAL_SALES=MONTHLY.reduce((s,m)=>s+m.sales,0);
const TOTAL_WEJHA=MONTHLY.reduce((s,m)=>s+m.wejha,0);
const TOTAL_TAX  =MONTHLY.reduce((s,m)=>s+m.tax,0);
const TOTAL_PAY  =MONTHLY.reduce((s,m)=>s+m.payouts,0);

const DAILY=Array.from({length:31},(_,i)=>({
  d:`${i+1}`,
  sales:Math.floor(500+Math.random()*900+Math.sin(i/4)*150),
  wejha:0,tax:0,coupons:Math.floor(8+Math.random()*35),
})).map(d=>({...d,wejha:Math.round(d.sales*.1),tax:Math.round(d.sales*.05)}));

const QUARTERLY=[
  {q:"Q2 2025",sales:58000,wejha:5800,tax:2900,payouts:52200,coupons:1100,vatFiled:true },
  {q:"Q3 2025",sales:74200,wejha:7420,tax:3710,payouts:66780,coupons:1380,vatFiled:true },
  {q:"Q4 2025",sales:81400,wejha:8140,tax:4070,payouts:73260,coupons:1431,vatFiled:false},
  {q:"Q1 2026",sales:21420,wejha:2142,tax:1071,payouts:19278,coupons:380, vatFiled:false},
];

const MERCHANTS=[
  {id:"M002",name:"كافيه لؤلؤة الخليج", cat:"☕",revenue:4820,coupons:142,wejha:482,  tax:241,  status:"paid",    iban:"QA57QIB001",bank:"QIB",      next:"2026-04-01"},
  {id:"M003",name:"بوتيك وردة قطر",     cat:"👗",revenue:9100,coupons:318,wejha:910,  tax:455,  status:"pending", iban:"QA57DOH002",bank:"Doha Bank",next:"2026-04-01"},
  {id:"M006",name:"سبا لوتس الملكي",    cat:"🧖",revenue:6300,coupons:201,wejha:630,  tax:315,  status:"pending", iban:"QA57QNB003",bank:"QNB",      next:"2026-04-01"},
  {id:"M004",name:"الأمين هايبر ماركت", cat:"🛒",revenue:1200,coupons:55, wejha:120,  tax:60,   status:"hold",    iban:"QA57CBQ004",bank:"CBQ",      next:"2026-04-01"},
];

const CAT_PIE=[
  {name:"بوتيك وعطور",value:9100, color:"#A060F8",pct:42},
  {name:"سبا ورياضة", value:6300, color:"#F04858",pct:29},
  {name:"مقاهي",      value:4820, color:"#F0C040",pct:22},
  {name:"سوبر ماركت", value:1200, color:"#00E564",pct:6 },
];

const TRANSFERS=[
  {id:"T001",merchant:"كافيه لؤلؤة الخليج",amount:4338,wejha:482,  tax:241,  net:3856,bank:"QIB",      date:"2026-03-01",status:"paid",    ref:"WJ-2026-001"},
  {id:"T002",merchant:"بوتيك وردة قطر",    amount:8190,wejha:910,  tax:455,  net:7280,bank:"Doha Bank",date:"2026-04-01",status:"pending", ref:"WJ-2026-002"},
  {id:"T003",merchant:"سبا لوتس الملكي",   amount:5670,wejha:630,  tax:315,  net:5040,bank:"QNB",      date:"2026-04-01",status:"pending", ref:"WJ-2026-003"},
  {id:"T004",merchant:"الأمين هايبر ماركت",amount:1080,wejha:120,  tax:60,   net:960, bank:"CBQ",      date:"2026-04-01",status:"hold",    ref:"WJ-2026-004"},
];

/* ═══════════════════════════════════════════
   OVERVIEW TAB
═══════════════════════════════════════════ */
function TabOverview({liveCount}){
  const [activeBar,setActiveBar]=useState(null);
  const kpis=[
    {icon:"💵",label:"إجمالي مبيعات التجار",      value:`${fmt(TOTAL_SALES)} ر.ق`,  sub:"+18%",  color:G.bl,  mono:true},
    {icon:"🏷️",label:"عائد وِجهة (10%)",          value:`${fmt(TOTAL_WEJHA)} ر.ق`,  sub:"+18%",  color:G.gr,  mono:true},
    {icon:"📊",label:"ضريبة القيمة المضافة (5%)",  value:`${fmt(TOTAL_TAX)} ر.ق`,   sub:"مستحقة",color:G.go,  mono:true},
    {icon:"💸",label:"إجمالي المدفوع للتجار",      value:`${fmt(TOTAL_PAY)} ر.ق`,   sub:"صافي",  color:G.tl,  mono:true},
    {icon:"⏳",label:"بانتظار التحويل",             value:"2,831 ر.ق",               sub:"3 تجار",color:G.or,  mono:true},
    {icon:"👥",label:"مستخدمون نشطون الآن",         value:liveCount.toLocaleString(), sub:"🟢 مباشر",color:G.pu, mono:true},
  ];
  return <div>
    <div style={{marginBottom:22}}>
      <p style={{fontSize:13,color:G.gr,fontWeight:700,letterSpacing:2,marginBottom:4}}>FINANCIAL OVERVIEW</p>
      <h1 style={{fontWeight:700,fontSize:22,color:G.tx,marginBottom:2}}>لوحة المراقبة المالية</h1>
      <p style={{fontSize:13,color:G.mi}}>مارس 2026 — تحديث فوري</p>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:12,marginBottom:24}}>
      {kpis.map((k,i)=>(
        <div key={k.label} className="fu glow" style={{animationDelay:`${i*.05}s`,background:G.s2,borderRadius:16,padding:"18px",border:`1px solid ${G.bo}`,position:"relative",overflow:"hidden",cursor:"default"}}>
          <div style={{position:"absolute",top:-18,left:-18,width:70,height:70,borderRadius:"50%",background:`${k.color}0A`}}/>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <span style={{fontSize:22}}>{k.icon}</span>
            <span style={{fontSize:10,color:k.sub.startsWith("+")?G.gr:k.sub==="مباشر"?G.gr:G.go,fontWeight:700,background:k.sub.startsWith("+")?`${G.gr}14`:`${k.color}14`,padding:"2px 8px",borderRadius:99}}>{k.sub}</span>
          </div>
          <p className={k.mono?"mono":""}style={{fontSize:22,fontWeight:700,color:k.color,lineHeight:1,marginBottom:6}}>{k.value}</p>
          <p style={{fontSize:11,color:G.mi}}>{k.label}</p>
        </div>
      ))}
    </div>

    {/* Revenue + Wejha Line Chart */}
    <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:14,marginBottom:14}}>
      <Card delay={.1}>
        <SHead icon="📈" title="الإيرادات الشهرية" sub="6 أشهر الماضية"/>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={MONTHLY} margin={{top:4,right:4,left:-20,bottom:0}}>
            <defs>
              <linearGradient id="gSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={G.bl}  stopOpacity={.25}/>
                <stop offset="95%" stopColor={G.bl}  stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="gWejha" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={G.gr}  stopOpacity={.3}/>
                <stop offset="95%" stopColor={G.gr}  stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={G.di} vertical={false}/>
            <XAxis dataKey="m" tick={{fontSize:11,fill:G.mi}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fontSize:10,fill:G.mi,fontFamily:"JetBrains Mono"}} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}K`}/>
            <Tooltip content={<CTip/>}/>
            <Area type="monotone" dataKey="sales" name="المبيعات" stroke={G.bl} strokeWidth={2} fill="url(#gSales)"/>
            <Area type="monotone" dataKey="wejha" name="عائد وِجهة" stroke={G.gr} strokeWidth={2} fill="url(#gWejha)"/>
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Pie */}
      <Card delay={.15}>
        <SHead icon="🥧" title="توزيع الإيرادات" sub="حسب القسم"/>
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie data={CAT_PIE} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
              {CAT_PIE.map((e,i)=><Cell key={i} fill={e.color}/>)}
            </Pie>
            <Tooltip formatter={(v)=>[`${fmt(v)} ر.ق`,"الإيراد"]}/>
          </PieChart>
        </ResponsiveContainer>
        <div style={{display:"flex",flexDirection:"column",gap:5}}>
          {CAT_PIE.map(c=>(
            <div key={c.name} style={{display:"flex",alignItems:"center",gap:7}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:c.color,flexShrink:0}}/>
              <span style={{fontSize:11,color:G.mi,flex:1}}>{c.name}</span>
              <span className="mono" style={{fontSize:11,color:G.tx,fontWeight:700}}>{c.pct}%</span>
              <span className="mono" style={{fontSize:10,color:G.mi}}>{fmt(c.value)}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>

    {/* Daily + Tax bars */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      <Card delay={.2}>
        <SHead icon="📅" title="المبيعات اليومية — مارس" sub="آخر 31 يوم"/>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={DAILY} margin={{top:4,right:4,left:-25,bottom:0}} barSize={6}>
            <CartesianGrid strokeDasharray="3 3" stroke={G.di} vertical={false}/>
            <XAxis dataKey="d" tick={{fontSize:9,fill:G.mi}} axisLine={false} tickLine={false} interval={4}/>
            <YAxis tick={{fontSize:9,fill:G.mi,fontFamily:"JetBrains Mono"}} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}K`}/>
            <Tooltip content={<CTip/>}/>
            <Bar dataKey="sales" name="المبيعات" fill={G.bl} radius={[3,3,0,0]}/>
            <Bar dataKey="wejha" name="عائد وِجهة" fill={G.gr} radius={[3,3,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card delay={.24}>
        <SHead icon="🏦" title="الضريبة الشهرية (5% VAT)" sub="عائد وِجهة بعد الضريبة"/>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={MONTHLY} margin={{top:4,right:4,left:-25,bottom:0}} barSize={14}>
            <CartesianGrid strokeDasharray="3 3" stroke={G.di} vertical={false}/>
            <XAxis dataKey="m" tick={{fontSize:10,fill:G.mi}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fontSize:9,fill:G.mi,fontFamily:"JetBrains Mono"}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}`}/>
            <Tooltip content={<CTip/>}/>
            <Bar dataKey="wejha" name="عائد وِجهة" fill={G.gr} radius={[4,4,0,0]}/>
            <Bar dataKey="tax"   name="ضريبة VAT"  fill={G.go} radius={[4,4,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  </div>;
}

/* ═══════════════════════════════════════════
   TRANSFERS TAB
═══════════════════════════════════════════ */
function TabTransfers(){
  const [transfers,setTransfers]=useState(TRANSFERS);
  const [confirm,setConfirm]=useState(null);
  const [saving,setSaving]=useState(null);

  const pay=id=>{
    setSaving(id);
    setTimeout(()=>{setTransfers(p=>p.map(t=>t.id===id?{...t,status:"paid"}:t));setSaving(null);setConfirm(null);},1000);
  };
  const statusStyle={
    paid:   {bg:`${G.gr}14`,  color:G.gr,  label:"مدفوع ✓"},
    pending:{bg:`${G.go}14`,  color:G.go,  label:"معلق ⏳"},
    hold:   {bg:`${G.or}14`,  color:G.or,  label:"محجوز ⚠"},
  };
  const totPending=transfers.filter(t=>t.status==="pending").reduce((s,t)=>s+t.net,0);

  return <div>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
      <div><p style={{fontSize:12,color:G.gr,fontWeight:700,letterSpacing:2,marginBottom:2}}>PAYOUTS</p>
        <h1 style={{fontWeight:700,fontSize:20,color:G.tx}}>إدارة التحويلات البنكية</h1></div>
      <Btn color={G.gr} onClick={()=>{}}>📤 تنفيذ كل التحويلات المعلقة</Btn>
    </div>

    {/* Stats row */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:11,marginBottom:20}}>
      {[
        {icon:"✅",label:"مدفوع",         value:`${fmt(transfers.filter(t=>t.status==="paid").reduce((s,t)=>s+t.net,0))} ر.ق`,color:G.gr},
        {icon:"⏳",label:"معلق",          value:`${fmt(totPending)} ر.ق`,color:G.go},
        {icon:"⚠️",label:"محجوز",         value:`${fmt(transfers.filter(t=>t.status==="hold").reduce((s,t)=>s+t.net,0))} ر.ق`,color:G.or},
        {icon:"🏷️",label:"عائد وِجهة",    value:`${fmt(transfers.reduce((s,t)=>s+t.wejha,0))} ر.ق`,color:G.pu},
      ].map((s,i)=>(
        <div key={s.label} className="fu glow" style={{animationDelay:`${i*.04}s`,background:G.s2,borderRadius:14,padding:"14px 16px",border:`1px solid ${G.bo}`}}>
          <span style={{fontSize:20}}>{s.icon}</span>
          <p className="mono" style={{fontSize:20,fontWeight:700,color:s.color,marginTop:8,marginBottom:3}}>{s.value}</p>
          <p style={{fontSize:11,color:G.mi}}>{s.label}</p>
        </div>
      ))}
    </div>

    {/* Transfers table */}
    <Card style={{padding:0,overflow:"hidden"}} delay={.1}>
      <div style={{padding:"14px 18px",borderBottom:`1px solid ${G.bo}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <p style={{fontWeight:700,fontSize:14,color:G.tx}}>سجل التحويلات</p>
        <Btn small outline color={G.bl}>📥 تصدير Excel</Btn>
      </div>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead><tr style={{background:G.s3,borderBottom:`1px solid ${G.bo}`}}>
            {["المرجع","التاجر","الإجمالي","عائد وِجهة","ضريبة VAT","صافي التاجر","البنك","IBAN","الموعد","الحالة","إجراء"].map(h=>(
              <th key={h} style={{padding:"10px 14px",textAlign:"right",color:G.mi,fontWeight:600,whiteSpace:"nowrap",fontSize:12}}>{h}</th>
            ))}
          </tr></thead>
          <tbody>{transfers.map(t=>{
            const ss=statusStyle[t.status]||statusStyle.pending;
            return <tr key={t.id} className="rh" style={{borderBottom:`1px solid ${G.bo}`}}>
              <td className="mono" style={{padding:"12px 14px",fontSize:11,color:G.pu,fontWeight:600}}>{t.ref}</td>
              <td style={{padding:"12px 14px",color:G.tx,fontWeight:600}}>{t.merchant}</td>
              <td className="mono" style={{padding:"12px 14px",fontWeight:700,color:G.tx}}>{fmt(t.amount)} ر.ق</td>
              <td className="mono" style={{padding:"12px 14px",color:G.gr}}>−{fmt(t.wejha)} ر.ق</td>
              <td className="mono" style={{padding:"12px 14px",color:G.go}}>−{fmt(t.tax)} ر.ق</td>
              <td className="mono" style={{padding:"12px 14px",fontWeight:700,color:G.gr}}>{fmt(t.net)} ر.ق</td>
              <td style={{padding:"12px 14px",color:G.mi,fontSize:12}}>{t.bank}</td>
              <td className="mono" style={{padding:"12px 14px",fontSize:10,color:G.di}}>{t.iban}</td>
              <td style={{padding:"12px 14px",color:G.mi,fontSize:11}}>{t.date}</td>
              <td style={{padding:"12px 14px"}}><span style={{background:ss.bg,color:ss.color,borderRadius:99,padding:"3px 10px",fontSize:11,fontWeight:700}}>{ss.label}</span></td>
              <td style={{padding:"12px 14px"}}>
                {t.status==="pending"&&<Btn small color={G.gr} loading={saving===t.id} onClick={()=>setConfirm(t)}>💸 تحويل</Btn>}
                {t.status==="hold"   &&<Btn small color={G.or} outline>🔍 مراجعة</Btn>}
                {t.status==="paid"   &&<Btn small outline color={G.mi}>📄 إيصال</Btn>}
              </td>
            </tr>;
          })}</tbody>
        </table>
      </div>
    </Card>

    {/* Confirm modal */}
    {confirm&&(
      <div className="fi" onClick={()=>setConfirm(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.8)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
        <div className="pi" onClick={e=>e.stopPropagation()} style={{background:G.s2,borderRadius:20,padding:"28px",border:`1px solid ${G.gr}44`,maxWidth:400,width:"100%",textAlign:"center"}}>
          <p style={{fontSize:38,marginBottom:12}}>💸</p>
          <p style={{fontWeight:700,fontSize:17,color:G.tx,marginBottom:6}}>تأكيد التحويل</p>
          <p style={{fontSize:13,color:G.mi,marginBottom:4}}>{confirm.merchant}</p>
          <p className="mono" style={{fontSize:26,fontWeight:700,color:G.gr,marginBottom:4}}>{fmt(confirm.net)} ر.ق</p>
          <p style={{fontSize:11,color:G.mi,marginBottom:20,direction:"ltr"}}>{confirm.bank} — {confirm.iban}</p>
          <div style={{background:G.s3,borderRadius:10,padding:"10px 14px",marginBottom:20,textAlign:"right"}}>
            {[["الإجمالي",confirm.amount,G.tx],["عائد وِجهة",confirm.wejha,G.gr],["ضريبة VAT",confirm.tax,G.go],["صافي التاجر",confirm.net,G.gr]].map(([k,v,c])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"4px 0"}}>
                <span style={{fontSize:12,color:G.mi}}>{k}</span>
                <span className="mono" style={{fontSize:12,fontWeight:700,color:c}}>{fmt(v)} ر.ق</span>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:10}}>
            <Btn outline color={G.mi} onClick={()=>setConfirm(null)} style={{flex:1}}>إلغاء</Btn>
            <Btn color={G.gr} loading={!!saving} onClick={()=>pay(confirm.id)} style={{flex:1}}>✓ تأكيد التحويل</Btn>
          </div>
        </div>
      </div>
    )}
  </div>;
}

/* ═══════════════════════════════════════════
   TAX REPORTS TAB
═══════════════════════════════════════════ */
function TabTax(){
  const [period,setPeriod]=useState("monthly");
  const [selMonth,setSelMonth]=useState(5); // مارس
  const [selQ,setSelQ]=useState(3);
  const [filing,setFiling]=useState(null);
  const [filed,setFiled]=useState({});
  const [exportLoading,setExportLoading]=useState(false);

  /* helpers */
  const doExport=()=>{setExportLoading(true);setTimeout(()=>setExportLoading(false),1500);};
  const doFile=(key)=>{setFiling(key);setTimeout(()=>{setFiled(p=>({...p,[key]:true}));setFiling(null);},1200);};

  /* ── Daily Tax ── */
  const todaySales=DAILY[30].sales;
  const todayWejha=DAILY[30].wejha;
  const todayTax  =DAILY[30].tax;

  /* ── Monthly Tax ── */
  const mData=MONTHLY[selMonth];

  /* ── Quarterly ── */
  const qData=QUARTERLY[selQ];
  const qMonths=MONTHLY.slice(selQ*3,selQ*3+3);

  /* ── Annual ── */
  const annualSales=MONTHLY.reduce((s,m)=>s+m.sales,0);
  const annualWejha=MONTHLY.reduce((s,m)=>s+m.wejha,0);
  const annualTax  =MONTHLY.reduce((s,m)=>s+m.tax,0);
  const annualNet  =annualWejha-annualTax;

  const TaxBox=({label,value,color=G.tx,sub})=>(
    <div style={{background:G.s3,borderRadius:12,padding:"13px 15px",border:`1px solid ${G.bo}`}}>
      <p style={{fontSize:11,color:G.mi,marginBottom:6}}>{label}</p>
      <p className="mono" style={{fontSize:20,fontWeight:700,color,marginBottom:sub?2:0}}>{value}</p>
      {sub&&<p style={{fontSize:10,color:G.mi}}>{sub}</p>}
    </div>
  );

  const FiledBadge=({k})=>filed[k]
    ?<span style={{background:`${G.gr}14`,color:G.gr,borderRadius:99,padding:"3px 10px",fontSize:11,fontWeight:700}}>✓ تم التقديم</span>
    :<Btn small color={G.go} loading={filing===k} onClick={()=>doFile(k)}>📋 تقديم إقرار</Btn>;

  return <div>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
      <div><p style={{fontSize:12,color:G.go,fontWeight:700,letterSpacing:2,marginBottom:2}}>TAX REPORTS</p>
        <h1 style={{fontWeight:700,fontSize:20,color:G.tx}}>الإقرارات الضريبية</h1>
        <p style={{fontSize:12,color:G.mi}}>ضريبة القيمة المضافة 5% — هيئة الزكاة والضريبة والجمارك</p>
      </div>
      <Btn color={G.go} loading={exportLoading} onClick={doExport}>📥 تصدير الكل PDF</Btn>
    </div>

    {/* Period selector */}
    <div style={{display:"flex",gap:8,marginBottom:22}}>
      {[["daily","يومي"],["monthly","شهري"],["quarterly","ربع سنوي"],["annual","سنوي"]].map(([v,l])=>(
        <button key={v} className="tap" onClick={()=>setPeriod(v)}
          style={{padding:"8px 18px",borderRadius:10,border:`1.5px solid ${period===v?G.go:G.bo}`,background:period===v?`${G.go}14`:G.s2,color:period===v?G.go:G.mi,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
          {l}
        </button>
      ))}
    </div>

    {/* ── DAILY ── */}
    {period==="daily"&&(
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div style={{background:`${G.go}0A`,borderRadius:14,padding:"12px 16px",border:`1px solid ${G.go}22`,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:20}}>📅</span>
          <p style={{fontSize:13,color:G.go,fontWeight:700}}>الإقرار اليومي — 31 مارس 2026</p>
          <div style={{flex:1}}/>
          <FiledBadge k="daily-2026-03-31"/>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
          <TaxBox label="مبيعات اليوم"    value={`${fmt(todaySales)} ر.ق`} color={G.bl}/>
          <TaxBox label="عائد وِجهة"      value={`${fmt(todayWejha)} ر.ق`} color={G.gr}/>
          <TaxBox label="ضريبة VAT 5%"   value={`${fmt(todayTax)} ر.ق`}  color={G.go} sub="مستحقة للهيئة"/>
          <TaxBox label="صافي وِجهة"      value={`${fmt(todayWejha-todayTax)} ر.ق`} color={G.tl}/>
        </div>

        {/* Daily line chart */}
        <Card delay={.1}>
          <SHead icon="📈" title="حركة VAT اليومي — مارس" sub="الضريبة المستحقة يومياً"/>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={DAILY} margin={{top:4,right:4,left:-20,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke={G.di} vertical={false}/>
              <XAxis dataKey="d" tick={{fontSize:9,fill:G.mi}} axisLine={false} tickLine={false} interval={4}/>
              <YAxis tick={{fontSize:9,fill:G.mi,fontFamily:"JetBrains Mono"}} axisLine={false} tickLine={false}/>
              <Tooltip content={<CTip/>}/>
              <Line type="monotone" dataKey="wejha" name="عائد وِجهة" stroke={G.gr} strokeWidth={2} dot={false}/>
              <Line type="monotone" dataKey="tax"   name="ضريبة VAT"  stroke={G.go} strokeWidth={2} dot={false} strokeDasharray="5 3"/>
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Daily VAT table */}
        <Card style={{padding:0,overflow:"hidden"}} delay={.14}>
          <div style={{padding:"13px 17px",borderBottom:`1px solid ${G.bo}`}}>
            <p style={{fontWeight:700,fontSize:13,color:G.tx}}>جدول VAT اليومي — مارس 2026</p>
          </div>
          <div style={{overflowX:"auto",maxHeight:260,overflowY:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
              <thead style={{position:"sticky",top:0,zIndex:2}}><tr style={{background:G.s3,borderBottom:`1px solid ${G.bo}`}}>
                {["اليوم","المبيعات","عائد وِجهة","VAT 5%","الصافي","الكوبونات"].map(h=>(
                  <th key={h} style={{padding:"9px 13px",textAlign:"right",color:G.mi,fontWeight:600}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>{DAILY.map((d,i)=>(
                <tr key={i} className="rh" style={{borderBottom:`1px solid ${G.bo}`}}>
                  <td className="mono" style={{padding:"8px 13px",color:G.mi}}>2026-03-{d.d.padStart(2,"0")}</td>
                  <td className="mono" style={{padding:"8px 13px",fontWeight:700,color:G.tx}}>{fmt(d.sales)} ر.ق</td>
                  <td className="mono" style={{padding:"8px 13px",color:G.gr}}>{fmt(d.wejha)} ر.ق</td>
                  <td className="mono" style={{padding:"8px 13px",color:G.go}}>{fmt(d.tax)} ر.ق</td>
                  <td className="mono" style={{padding:"8px 13px",color:G.tl,fontWeight:700}}>{fmt(d.wejha-d.tax)} ر.ق</td>
                  <td className="mono" style={{padding:"8px 13px",color:G.mi}}>{d.coupons}</td>
                </tr>
              ))}</tbody>
              <tfoot><tr style={{background:G.s3,borderTop:`2px solid ${G.boH}`}}>
                <td style={{padding:"10px 13px",fontWeight:700,color:G.tx}}>الإجمالي</td>
                <td className="mono" style={{padding:"10px 13px",fontWeight:700,color:G.bl}}>{fmt(DAILY.reduce((s,d)=>s+d.sales,0))} ر.ق</td>
                <td className="mono" style={{padding:"10px 13px",fontWeight:700,color:G.gr}}>{fmt(DAILY.reduce((s,d)=>s+d.wejha,0))} ر.ق</td>
                <td className="mono" style={{padding:"10px 13px",fontWeight:700,color:G.go}}>{fmt(DAILY.reduce((s,d)=>s+d.tax,0))} ر.ق</td>
                <td className="mono" style={{padding:"10px 13px",fontWeight:700,color:G.tl}}>{fmt(DAILY.reduce((s,d)=>s+d.wejha-d.tax,0))} ر.ق</td>
                <td className="mono" style={{padding:"10px 13px",fontWeight:700,color:G.mi}}>{DAILY.reduce((s,d)=>s+d.coupons,0)}</td>
              </tr></tfoot>
            </table>
          </div>
        </Card>
      </div>
    )}

    {/* ── MONTHLY ── */}
    {period==="monthly"&&(
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div style={{display:"flex",gap:8,marginBottom:4,flexWrap:"wrap"}}>
          {MONTHLY.map((m,i)=>(
            <button key={i} className="tap" onClick={()=>setSelMonth(i)}
              style={{padding:"6px 14px",borderRadius:9,border:`1.5px solid ${selMonth===i?G.go:G.bo}`,background:selMonth===i?`${G.go}14`:G.s2,color:selMonth===i?G.go:G.mi,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
              {m.m}
            </button>
          ))}
        </div>

        <div style={{background:`${G.go}0A`,borderRadius:14,padding:"12px 16px",border:`1px solid ${G.go}22`,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:20}}>🗓️</span>
          <p style={{fontSize:13,color:G.go,fontWeight:700}}>الإقرار الشهري — {mData.m} 2025/2026</p>
          <div style={{flex:1}}/>
          <FiledBadge k={`monthly-${mData.m}`}/>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:10}}>
          <TaxBox label="إجمالي المبيعات"   value={`${fmt(mData.sales)} ر.ق`}                color={G.bl}/>
          <TaxBox label="عائد وِجهة (10%)"  value={`${fmt(mData.wejha)} ر.ق`}                color={G.gr}/>
          <TaxBox label="ضريبة VAT (5%)"    value={`${fmt(mData.tax)} ر.ق`}                  color={G.go} sub="مستحقة دفعها"/>
          <TaxBox label="صافي بعد الضريبة"  value={`${fmt(mData.wejha-mData.tax)} ر.ق`}     color={G.tl}/>
          <TaxBox label="معدل الوعاء الضريبي" value={`${pct(mData.wejha,mData.sales)}%`}    color={G.pu} sub="من إجمالي المبيعات"/>
          <TaxBox label="الكوبونات المعالجة" value={mData.coupons}                            color={G.mi}/>
        </div>

        {/* Receipt */}
        <Card delay={.1} style={{border:`1px solid ${G.go}33`}}>
          <SHead icon="🧾" title="نموذج الإقرار الضريبي الشهري" sub="يمكن طباعته وتقديمه لهيئة الزكاة والضريبة والجمارك"/>
          <div style={{background:G.s3,borderRadius:12,padding:"20px",border:`1px solid ${G.bo}`,fontFamily:"'JetBrains Mono',monospace",fontSize:12}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:14,paddingBottom:10,borderBottom:`1px dashed ${G.boH}`}}>
              <div><p style={{fontWeight:700,fontSize:15,color:G.tx,fontFamily:"DM Sans"}}>شركة وِجهة القطرية</p><p style={{color:G.mi,fontSize:11}}>الرقم الضريبي: QA-VAT-2024-00123</p></div>
              <div style={{textAlign:"left"}}><p style={{color:G.go,fontWeight:700}}>إقرار VAT شهري</p><p style={{color:G.mi,fontSize:11}}>{mData.m} 2025/2026</p></div>
            </div>
            {[
              ["الوعاء الضريبي (إيرادات وِجهة)",`${fmt(mData.wejha)} ر.ق`,G.tx],
              ["نسبة الضريبة","5%",G.mi],
              ["الضريبة المستحقة",`${fmt(mData.tax)} ر.ق`,G.go],
              ["ضريبة المدخلات (المشتريات)","0.00 ر.ق",G.mi],
              ["صافي الضريبة المستحقة",`${fmt(mData.tax)} ر.ق`,G.red],
            ].map(([k,v,c])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${G.di}`}}>
                <span style={{color:G.mi,fontFamily:"DM Sans"}}>{k}</span>
                <span style={{color:c,fontWeight:700}}>{v}</span>
              </div>
            ))}
            <div style={{display:"flex",justifyContent:"space-between",padding:"12px 0 4px",borderTop:`2px solid ${G.boH}`,marginTop:4}}>
              <span style={{color:G.tx,fontWeight:700,fontFamily:"DM Sans",fontSize:14}}>المبلغ الواجب سداده</span>
              <span style={{color:G.go,fontWeight:700,fontSize:18}}>{fmt(mData.tax)} ر.ق</span>
            </div>
          </div>
          <div style={{display:"flex",gap:9,marginTop:14}}>
            <Btn outline color={G.bl} small>🖨️ طباعة</Btn>
            <Btn outline color={G.bl} small>📧 إرسال للمحاسب</Btn>
            <div style={{flex:1}}/>
            <FiledBadge k={`monthly-receipt-${mData.m}`}/>
          </div>
        </Card>
      </div>
    )}

    {/* ── QUARTERLY ── */}
    {period==="quarterly"&&(
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div style={{display:"flex",gap:8,marginBottom:4}}>
          {QUARTERLY.map((q,i)=>(
            <button key={i} className="tap" onClick={()=>setSelQ(i)}
              style={{padding:"7px 16px",borderRadius:9,border:`1.5px solid ${selQ===i?G.go:G.bo}`,background:selQ===i?`${G.go}14`:G.s2,color:selQ===i?G.go:G.mi,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:6}}>
              {q.q}
              {q.vatFiled?<span style={{fontSize:9,background:`${G.gr}18`,color:G.gr,borderRadius:99,padding:"1px 5px"}}>مُقدَّم</span>:<span style={{fontSize:9,background:`${G.red}18`,color:G.red,borderRadius:99,padding:"1px 5px"}}>معلق</span>}
            </button>
          ))}
        </div>

        <div style={{background:`${G.go}0A`,borderRadius:14,padding:"12px 16px",border:`1px solid ${G.go}22`,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:20}}>📊</span>
          <p style={{fontSize:13,color:G.go,fontWeight:700}}>الإقرار ربع السنوي — {qData.q}</p>
          <div style={{flex:1}}/>
          <FiledBadge k={`q-${qData.q}`}/>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:10}}>
          <TaxBox label="إجمالي المبيعات"    value={`${fmt(qData.sales)} ر.ق`}             color={G.bl}/>
          <TaxBox label="عائد وِجهة"         value={`${fmt(qData.wejha)} ر.ق`}             color={G.gr}/>
          <TaxBox label="ضريبة VAT الإجمالية" value={`${fmt(qData.tax)} ر.ق`}              color={G.go} sub="5% من عائد وِجهة"/>
          <TaxBox label="صافي بعد الضريبة"   value={`${fmt(qData.wejha-qData.tax)} ر.ق`}  color={G.tl}/>
          <TaxBox label="الكوبونات الإجمالية" value={qData.coupons}                          color={G.mi}/>
          <TaxBox label="حالة الإقرار"        value={qData.vatFiled?"مُقدَّم ✓":"لم يُقدَّم بعد"} color={qData.vatFiled?G.gr:G.red}/>
        </div>

        {/* Monthly breakdown */}
        <Card delay={.08}>
          <SHead icon="📋" title={`تفصيل الأشهر — ${qData.q}`}/>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead><tr style={{background:G.s3,borderBottom:`1px solid ${G.bo}`}}>
                {["الشهر","المبيعات","عائد وِجهة","VAT 5%","صافي","الكوبونات"].map(h=>(
                  <th key={h} style={{padding:"9px 13px",textAlign:"right",color:G.mi,fontWeight:600}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>{qMonths.map((m,i)=>(
                <tr key={i} className="rh" style={{borderBottom:`1px solid ${G.bo}`}}>
                  <td style={{padding:"10px 13px",fontWeight:700,color:G.tx}}>{m.m}</td>
                  <td className="mono" style={{padding:"10px 13px",color:G.bl,fontWeight:700}}>{fmt(m.sales)} ر.ق</td>
                  <td className="mono" style={{padding:"10px 13px",color:G.gr}}>{fmt(m.wejha)} ر.ق</td>
                  <td className="mono" style={{padding:"10px 13px",color:G.go,fontWeight:700}}>{fmt(m.tax)} ر.ق</td>
                  <td className="mono" style={{padding:"10px 13px",color:G.tl,fontWeight:700}}>{fmt(m.wejha-m.tax)} ر.ق</td>
                  <td className="mono" style={{padding:"10px 13px",color:G.mi}}>{m.coupons}</td>
                </tr>
              ))}
              </tbody>
              <tfoot><tr style={{background:G.s3,borderTop:`2px solid ${G.boH}`}}>
                <td style={{padding:"10px 13px",fontWeight:700,color:G.tx}}>الإجمالي</td>
                {["sales","wejha","tax"].map(k=>(
                  <td key={k} className="mono" style={{padding:"10px 13px",fontWeight:700,color:k==="tax"?G.go:k==="wejha"?G.gr:G.bl}}>{fmt(qMonths.reduce((s,m)=>s+m[k],0))} ر.ق</td>
                ))}
                <td className="mono" style={{padding:"10px 13px",fontWeight:700,color:G.tl}}>{fmt(qMonths.reduce((s,m)=>s+m.wejha-m.tax,0))} ر.ق</td>
                <td className="mono" style={{padding:"10px 13px",fontWeight:700,color:G.mi}}>{qMonths.reduce((s,m)=>s+m.coupons,0)}</td>
              </tr></tfoot>
            </table>
          </div>
        </Card>

        {/* Chart */}
        <Card delay={.12}>
          <SHead icon="📊" title={`مقارنة VAT ربع سنوي`}/>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={QUARTERLY} margin={{top:4,right:4,left:-20,bottom:0}} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke={G.di} vertical={false}/>
              <XAxis dataKey="q" tick={{fontSize:10,fill:G.mi}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:9,fill:G.mi,fontFamily:"JetBrains Mono"}} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}K`}/>
              <Tooltip content={<CTip/>}/>
              <Bar dataKey="wejha" name="عائد وِجهة" fill={G.gr} radius={[4,4,0,0]}/>
              <Bar dataKey="tax"   name="VAT"         fill={G.go} radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    )}

    {/* ── ANNUAL ── */}
    {period==="annual"&&(
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div style={{background:`${G.go}0A`,borderRadius:14,padding:"12px 16px",border:`1px solid ${G.go}22`,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:20}}>📆</span>
          <p style={{fontSize:13,color:G.go,fontWeight:700}}>الإقرار الضريبي السنوي — 2025/2026</p>
          <div style={{flex:1}}/>
          <FiledBadge k="annual-2026"/>
        </div>

        {/* KPI grid */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:10}}>
          {[
            {label:"إجمالي المبيعات السنوية",  value:`${fmt(annualSales)} ر.ق`,  color:G.bl},
            {label:"إجمالي عائد وِجهة",         value:`${fmt(annualWejha)} ر.ق`,  color:G.gr},
            {label:"إجمالي ضريبة VAT المستحقة", value:`${fmt(annualTax)} ر.ق`,   color:G.go},
            {label:"صافي وِجهة بعد الضريبة",    value:`${fmt(annualNet)} ر.ق`,   color:G.tl},
            {label:"نسبة الضريبة الفعلية",       value:`${pct(annualTax,annualSales)}%`, color:G.pu},
            {label:"إجمالي الكوبونات",            value:fmt(MONTHLY.reduce((s,m)=>s+m.coupons,0)), color:G.mi},
          ].map((s,i)=><TaxBox key={s.label} label={s.label} value={s.value} color={s.color}/>)}
        </div>

        {/* Area chart annual */}
        <Card delay={.1}>
          <SHead icon="📈" title="الأداء المالي السنوي" sub="مبيعات — عائد وِجهة — VAT شهرياً"/>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={MONTHLY} margin={{top:4,right:4,left:-15,bottom:0}}>
              <defs>
                <linearGradient id="gS" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={G.bl} stopOpacity={.2}/><stop offset="95%" stopColor={G.bl} stopOpacity={0}/></linearGradient>
                <linearGradient id="gW" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={G.gr} stopOpacity={.25}/><stop offset="95%" stopColor={G.gr} stopOpacity={0}/></linearGradient>
                <linearGradient id="gT" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={G.go} stopOpacity={.3}/><stop offset="95%" stopColor={G.go} stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={G.di} vertical={false}/>
              <XAxis dataKey="m" tick={{fontSize:10,fill:G.mi}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:9,fill:G.mi,fontFamily:"JetBrains Mono"}} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}K`}/>
              <Tooltip content={<CTip/>}/>
              <Legend wrapperStyle={{fontSize:11,color:G.mi}}/>
              <Area type="monotone" dataKey="sales" name="المبيعات"    stroke={G.bl} strokeWidth={2} fill="url(#gS)"/>
              <Area type="monotone" dataKey="wejha" name="عائد وِجهة" stroke={G.gr} strokeWidth={2} fill="url(#gW)"/>
              <Area type="monotone" dataKey="tax"   name="VAT"         stroke={G.go} strokeWidth={1.5} fill="url(#gT)" strokeDasharray="4 2"/>
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Annual summary table */}
        <Card style={{padding:0,overflow:"hidden"}} delay={.14}>
          <div style={{padding:"13px 17px",borderBottom:`1px solid ${G.bo}`}}>
            <p style={{fontWeight:700,fontSize:13,color:G.tx}}>ملخص الأشهر السنوية</p>
          </div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead><tr style={{background:G.s3,borderBottom:`1px solid ${G.bo}`}}>
                {["الشهر","المبيعات","عائد وِجهة","VAT 5%","صافي وِجهة","الكوبونات","التجار"].map(h=>(
                  <th key={h} style={{padding:"9px 13px",textAlign:"right",color:G.mi,fontWeight:600}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>{MONTHLY.map((m,i)=>(
                <tr key={i} className="rh" style={{borderBottom:`1px solid ${G.bo}`}}>
                  <td style={{padding:"10px 13px",fontWeight:700,color:G.tx}}>{m.m}</td>
                  <td className="mono" style={{padding:"10px 13px",color:G.bl,fontWeight:700}}>{fmt(m.sales)} ر.ق</td>
                  <td className="mono" style={{padding:"10px 13px",color:G.gr}}>{fmt(m.wejha)} ر.ق</td>
                  <td className="mono" style={{padding:"10px 13px",color:G.go,fontWeight:700}}>{fmt(m.tax)} ر.ق</td>
                  <td className="mono" style={{padding:"10px 13px",color:G.tl,fontWeight:700}}>{fmt(m.wejha-m.tax)} ر.ق</td>
                  <td className="mono" style={{padding:"10px 13px",color:G.mi}}>{m.coupons}</td>
                  <td className="mono" style={{padding:"10px 13px",color:G.mi}}>{m.merchants}</td>
                </tr>
              ))}</tbody>
              <tfoot><tr style={{background:G.s3,borderTop:`2px solid ${G.boH}`}}>
                <td style={{padding:"10px 13px",fontWeight:700,color:G.tx}}>الإجمالي السنوي</td>
                <td className="mono" style={{padding:"10px 13px",fontWeight:700,color:G.bl}}>{fmt(annualSales)} ر.ق</td>
                <td className="mono" style={{padding:"10px 13px",fontWeight:700,color:G.gr}}>{fmt(annualWejha)} ر.ق</td>
                <td className="mono" style={{padding:"10px 13px",fontWeight:700,color:G.go}}>{fmt(annualTax)} ر.ق</td>
                <td className="mono" style={{padding:"10px 13px",fontWeight:700,color:G.tl}}>{fmt(annualNet)} ر.ق</td>
                <td className="mono" style={{padding:"10px 13px",fontWeight:700,color:G.mi}}>{MONTHLY.reduce((s,m)=>s+m.coupons,0)}</td>
                <td className="mono" style={{padding:"10px 13px",fontWeight:700,color:G.mi}}>{Math.max(...MONTHLY.map(m=>m.merchants))}</td>
              </tr></tfoot>
            </table>
          </div>
        </Card>

        {/* Full year tax receipt */}
        <Card delay={.18} style={{border:`1px solid ${G.go}33`}}>
          <SHead icon="🧾" title="ملخص الإقرار الضريبي السنوي" sub="2025 / 2026"/>
          <div style={{background:G.s3,borderRadius:12,padding:"20px",border:`1px solid ${G.bo}`,fontFamily:"'JetBrains Mono',monospace",fontSize:12}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:14,paddingBottom:10,borderBottom:`1px dashed ${G.boH}`}}>
              <div><p style={{fontWeight:700,fontSize:15,color:G.tx,fontFamily:"DM Sans"}}>شركة وِجهة القطرية ذ.م.م</p><p style={{color:G.mi,fontSize:10}}>الرقم الضريبي: QA-VAT-2024-00123 | السجل التجاري: 123456789</p></div>
              <div style={{textAlign:"left"}}><p style={{color:G.go,fontWeight:700}}>إقرار VAT سنوي</p><p style={{color:G.mi,fontSize:10}}>الفترة: أكتوبر 2025 — مارس 2026</p></div>
            </div>
            {[
              ["الإيرادات الخاضعة للضريبة",  `${fmt(annualWejha)} ر.ق`, G.tx],
              ["VAT المحصّلة (5%)",           `${fmt(annualTax)} ر.ق`,   G.go],
              ["VAT على المشتريات (input)",   "0.00 ر.ق",                G.mi],
              ["صافي VAT الواجبة السداد",      `${fmt(annualTax)} ر.ق`,   G.red],
              ["تاريخ الاستحقاق",              "30 أبريل 2026",           G.mi],
            ].map(([k,v,c])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${G.di}`}}>
                <span style={{color:G.mi,fontFamily:"DM Sans"}}>{k}</span>
                <span style={{color:c,fontWeight:700}}>{v}</span>
              </div>
            ))}
            <div style={{display:"flex",justifyContent:"space-between",padding:"14px 0 4px",borderTop:`2px solid ${G.boH}`,marginTop:6}}>
              <span style={{color:G.tx,fontWeight:700,fontFamily:"DM Sans",fontSize:15}}>الإجمالي المستحق للهيئة</span>
              <span style={{color:G.go,fontWeight:700,fontSize:22,fontFamily:"JetBrains Mono"}}>{fmt(annualTax)} ر.ق</span>
            </div>
          </div>
          <div style={{display:"flex",gap:9,marginTop:14}}>
            <Btn outline color={G.bl} small>🖨️ طباعة</Btn>
            <Btn outline color={G.bl} small>📧 إرسال للمحاسب</Btn>
            <Btn outline color={G.go} small>📤 رفع لبوابة ZATCA</Btn>
            <div style={{flex:1}}/>
            <FiledBadge k="annual-receipt-2026"/>
          </div>
        </Card>
      </div>
    )}
  </div>;
}

/* ═══════════════════════════════════════════
   ANALYTICS TAB
═══════════════════════════════════════════ */
function TabAnalytics(){
  return <div>
    <div style={{marginBottom:20}}>
      <p style={{fontSize:12,color:G.bl,fontWeight:700,letterSpacing:2,marginBottom:2}}>ANALYTICS</p>
      <h1 style={{fontWeight:700,fontSize:20,color:G.tx}}>التحليلات المتقدمة</h1>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
      {/* MoM growth */}
      <Card delay={0}>
        <SHead icon="📊" title="نمو الإيرادات شهرياً" sub="نسبة التغيير"/>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={MONTHLY.slice(1).map((m,i)=>({m:m.m,growth:Math.round(((m.sales-MONTHLY[i].sales)/MONTHLY[i].sales)*100)}))} margin={{top:4,right:4,left:-25,bottom:0}} barSize={22}>
            <CartesianGrid strokeDasharray="3 3" stroke={G.di} vertical={false}/>
            <XAxis dataKey="m" tick={{fontSize:10,fill:G.mi}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fontSize:9,fill:G.mi}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`}/>
            <Tooltip content={<CTip unit="%"/>}/>
            <Bar dataKey="growth" name="النمو" radius={[4,4,0,0]}>
              {MONTHLY.slice(1).map((m,i)=>{
                const v=Math.round(((m.sales-MONTHLY[i].sales)/MONTHLY[i].sales)*100);
                return <Cell key={i} fill={v>=0?G.gr:G.red}/>;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Merchants revenue */}
      <Card delay={.05}>
        <SHead icon="🏪" title="أداء التجار — الإيرادات" sub="مقارنة نسبة الكوبونات"/>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={MERCHANTS} layout="vertical" margin={{top:4,right:4,left:0,bottom:0}} barSize={12}>
            <CartesianGrid strokeDasharray="3 3" stroke={G.di} horizontal={false}/>
            <XAxis type="number" tick={{fontSize:9,fill:G.mi,fontFamily:"JetBrains Mono"}} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}K`}/>
            <YAxis type="category" dataKey="name" tick={{fontSize:10,fill:G.mi}} axisLine={false} tickLine={false} width={120}/>
            <Tooltip content={<CTip/>}/>
            <Bar dataKey="revenue" name="الإيراد" fill={G.gr} radius={[0,4,4,0]}/>
            <Bar dataKey="wejha"   name="عائد وِجهة" fill={G.pu} radius={[0,4,4,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
      {/* Coupons trend */}
      <Card delay={.08}>
        <SHead icon="🎫" title="حجم الكوبونات الشهري"/>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={MONTHLY} margin={{top:4,right:4,left:-25,bottom:0}}>
            <CartesianGrid strokeDasharray="3 3" stroke={G.di} vertical={false}/>
            <XAxis dataKey="m" tick={{fontSize:10,fill:G.mi}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fontSize:9,fill:G.mi}} axisLine={false} tickLine={false}/>
            <Tooltip content={<CTip unit="كوبون"/>}/>
            <Line type="monotone" dataKey="coupons" name="الكوبونات" stroke={G.tl} strokeWidth={2.5} dot={{r:3,fill:G.tl}}/>
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Tax vs net */}
      <Card delay={.11}>
        <SHead icon="📉" title="الضريبة مقابل صافي الدخل"/>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={MONTHLY} margin={{top:4,right:4,left:-20,bottom:0}}>
            <defs>
              <linearGradient id="gNet" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={G.tl} stopOpacity={.3}/><stop offset="95%" stopColor={G.tl} stopOpacity={0}/></linearGradient>
              <linearGradient id="gTax" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={G.go} stopOpacity={.25}/><stop offset="95%" stopColor={G.go} stopOpacity={0}/></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={G.di} vertical={false}/>
            <XAxis dataKey="m" tick={{fontSize:10,fill:G.mi}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fontSize:9,fill:G.mi}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}`}/>
            <Tooltip content={<CTip/>}/>
            <Area type="monotone" dataKey="wejha" name="عائد وِجهة" stroke={G.tl} strokeWidth={2} fill="url(#gNet)"/>
            <Area type="monotone" dataKey="tax"   name="VAT"         stroke={G.go} strokeWidth={1.5} fill="url(#gTax)" strokeDasharray="4 2"/>
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>

    {/* Merchants table */}
    <Card style={{padding:0,overflow:"hidden"}} delay={.15}>
      <div style={{padding:"14px 18px",borderBottom:`1px solid ${G.bo}`}}>
        <p style={{fontWeight:700,fontSize:13,color:G.tx}}>📋 جدول أداء التجار التفصيلي</p>
      </div>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead><tr style={{background:G.s3,borderBottom:`1px solid ${G.bo}`}}>
            {["التاجر","الإيراد","الكوبونات","عائد وِجهة","ضريبة VAT","صافي الدفع","التقييم","الحالة"].map(h=>(
              <th key={h} style={{padding:"10px 14px",textAlign:"right",color:G.mi,fontWeight:600,whiteSpace:"nowrap"}}>{h}</th>
            ))}
          </tr></thead>
          <tbody>{MERCHANTS.map(m=>{
            const ss={paid:{bg:`${G.gr}14`,c:G.gr,t:"مدفوع ✓"},pending:{bg:`${G.go}14`,c:G.go,t:"معلق"},hold:{bg:`${G.or}14`,c:G.or,t:"محجوز"}};
            const st=ss[m.status]||ss.pending;
            return <tr key={m.id} className="rh" style={{borderBottom:`1px solid ${G.bo}`}}>
              <td style={{padding:"12px 14px"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:18}}>{m.cat}</span>
                  <p style={{fontWeight:600,color:G.tx,fontSize:13}}>{m.name}</p>
                </div>
              </td>
              <td className="mono" style={{padding:"12px 14px",fontWeight:700,color:G.bl}}>{fmt(m.revenue)} ر.ق</td>
              <td className="mono" style={{padding:"12px 14px",color:G.mi}}>{m.coupons}</td>
              <td className="mono" style={{padding:"12px 14px",color:G.gr}}>{fmt(m.wejha)} ر.ق</td>
              <td className="mono" style={{padding:"12px 14px",color:G.go}}>{fmt(m.tax)} ر.ق</td>
              <td className="mono" style={{padding:"12px 14px",fontWeight:700,color:G.tl}}>{fmt(m.payout)} ر.ق</td>
              <td style={{padding:"12px 14px"}}>
                <div style={{display:"flex",alignItems:"center",gap:5}}>
                  <span style={{fontSize:12,color:G.go,fontWeight:700}}>{m.rate}</span>
                  <span style={{fontSize:10,color:G.go}}>★</span>
                </div>
              </td>
              <td style={{padding:"12px 14px"}}><span style={{background:st.bg,color:st.c,borderRadius:99,padding:"3px 10px",fontSize:11,fontWeight:700}}>{st.t}</span></td>
            </tr>;
          })}</tbody>
        </table>
      </div>
    </Card>
  </div>;
}

/* ═══════════════════════════════════════════
   REPORTS TAB
═══════════════════════════════════════════ */
function TabReports(){
  const [type,setType]=useState("monthly");
  const [generating,setGenerating]=useState(false);
  const gen=()=>{setGenerating(true);setTimeout(()=>setGenerating(false),1500);};
  const reports=[
    {icon:"📅",title:"تقرير يومي",     desc:"مبيعات وVAT ليوم 31 مارس 2026",           type:"daily",  date:"2026-03-31"},
    {icon:"🗓️",title:"تقرير شهري",     desc:"ملخص مارس 2026 المالي والضريبي",            type:"monthly",date:"2026-03-01"},
    {icon:"📊",title:"تقرير ربع سنوي", desc:"Q1 2026 — يناير حتى مارس",                type:"q",      date:"2026-03-31"},
    {icon:"📆",title:"تقرير سنوي",      desc:"العام المالي 2025/2026",                   type:"annual", date:"2026-03-31"},
    {icon:"🏦",title:"تقرير التحويلات", desc:"جميع التحويلات البنكية للتجار",             type:"payouts",date:"2026-03-31"},
    {icon:"🏷️",title:"تقرير عائد وِجهة",desc:"تفصيل عائد وِجهة من جميع الكوبونات",       type:"wejha",  date:"2026-03-31"},
  ];
  return <div>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
      <div><p style={{fontSize:12,color:G.tl,fontWeight:700,letterSpacing:2,marginBottom:2}}>REPORTS</p>
        <h1 style={{fontWeight:700,fontSize:20,color:G.tx}}>مركز التقارير المالية</h1></div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:12}}>
      {reports.map((r,i)=>(
        <div key={r.type} className="fu glow" style={{animationDelay:`${i*.04}s`,background:G.s2,borderRadius:16,padding:"18px 20px",border:`1px solid ${G.bo}`,display:"flex",flexDirection:"column",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:44,height:44,borderRadius:12,background:`${G.gr}14`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{r.icon}</div>
            <div style={{flex:1}}>
              <p style={{fontWeight:700,fontSize:14,color:G.tx}}>{r.title}</p>
              <p style={{fontSize:11,color:G.mi,marginTop:2}}>{r.desc}</p>
              <p className="mono" style={{fontSize:10,color:G.di,marginTop:2}}>{r.date}</p>
            </div>
          </div>
          <div style={{display:"flex",gap:7}}>
            <Btn small outline color={G.bl} style={{flex:1}} onClick={gen}>📊 Excel</Btn>
            <Btn small outline color={G.red} style={{flex:1}} onClick={gen}>📄 PDF</Btn>
            <Btn small color={G.gr} loading={generating} style={{flex:1}} onClick={gen}>⬇️ تحميل</Btn>
          </div>
        </div>
      ))}
    </div>
  </div>;
}

/* ═══════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════ */
export default function FinanceDashboard(){
  const [tab,setTab]=useState("overview");
  const [live,setLive]=useState(1247);
  const [now,setNow]=useState(new Date());
  useEffect(()=>{
    const t1=setInterval(()=>setLive(n=>n+Math.floor(Math.random()*3-1)),4000);
    const t2=setInterval(()=>setNow(new Date()),1000);
    return()=>{clearInterval(t1);clearInterval(t2);};
  },[]);

  const TABS=[
    {id:"overview",  icon:"📊", label:"المراقبة"},
    {id:"transfers", icon:"💸", label:"التحويلات"},
    {id:"tax",       icon:"🧾", label:"الإقرار الضريبي"},
    {id:"analytics", icon:"📈", label:"التحليلات"},
    {id:"reports",   icon:"📁", label:"التقارير"},
  ];

  return <div style={{minHeight:"100vh",background:G.bg,display:"flex",flexDirection:"column"}}>
    {/* ── Header ── */}
    <header style={{position:"sticky",top:0,zIndex:50,background:`${G.s1}F2`,backdropFilter:"blur(24px)",borderBottom:`1px solid ${G.bo}`}}>
      <div style={{maxWidth:1400,margin:"0 auto",padding:"0 20px",display:"flex",alignItems:"center",gap:0}}>
        {/* Brand */}
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"11px 0",marginLeft:24,flexShrink:0}}>
          <div style={{width:32,height:32,borderRadius:9,background:`${G.gr}18`,border:`1px solid ${G.gr}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>💰</div>
          <div><p style={{fontWeight:700,fontSize:14,color:G.tx,lineHeight:1}}>وِجهة — المالية</p><p style={{fontSize:9,color:G.gr,fontWeight:700,fontFamily:"JetBrains Mono",letterSpacing:1}}>FINANCE OFFICER</p></div>
        </div>
        {/* Nav */}
        <nav style={{display:"flex",flex:1,overflowX:"auto",gap:1,padding:"4px 0"}}>
          {TABS.map(({id,icon,label})=>(
            <button key={id} className="tap" onClick={()=>setTab(id)}
              style={{display:"flex",alignItems:"center",gap:5,padding:"7px 13px",borderRadius:8,border:"none",background:tab===id?`${G.gr}14`:"transparent",color:tab===id?G.gr:G.mi,fontWeight:tab===id?700:500,fontSize:12,cursor:"pointer",flexShrink:0,fontFamily:"inherit",whiteSpace:"nowrap",transition:"all .15s",borderBottom:tab===id?`2px solid ${G.gr}`:"2px solid transparent"}}>
              <span style={{fontSize:14}}>{icon}</span><span>{label}</span>
            </button>
          ))}
        </nav>
        {/* Right */}
        <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
          <div className="mono" style={{display:"flex",alignItems:"center",gap:6,background:G.s2,borderRadius:9,padding:"6px 11px",border:`1px solid ${G.bo}`,fontSize:11,color:G.mi}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:G.gr,animation:"pu 2s ease infinite"}}/>
            <span style={{color:G.gr,fontWeight:700}}>{live.toLocaleString()}</span> نشط
          </div>
          <div className="mono" style={{background:G.s2,borderRadius:9,padding:"6px 11px",border:`1px solid ${G.bo}`,fontSize:11,color:G.mi,direction:"ltr"}}>
            {now.toLocaleTimeString("en-GB")} <span style={{color:G.di}}>AST</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:7,background:`${G.gr}12`,borderRadius:9,padding:"6px 11px",border:`1px solid ${G.gr}33`}}>
            <span style={{fontSize:14}}>💰</span>
            <div><p style={{fontSize:11,fontWeight:700,color:G.tx,lineHeight:1}}>فيصل العنزي</p><p style={{fontSize:9,color:G.gr,fontWeight:700}}>مشرف مالي</p></div>
          </div>
        </div>
      </div>
    </header>

    {/* ── Main ── */}
    <main style={{flex:1,maxWidth:1400,margin:"0 auto",width:"100%",padding:"24px 20px 56px"}}>
      {tab==="overview"  &&<TabOverview  liveCount={live}/>}
      {tab==="transfers" &&<TabTransfers/>}
      {tab==="tax"       &&<TabTax/>}
      {tab==="analytics" &&<TabAnalytics/>}
      {tab==="reports"   &&<TabReports/>}
    </main>
  </div>;
}
