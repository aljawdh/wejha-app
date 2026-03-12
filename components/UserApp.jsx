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

// Color palette
const T = {
  bg: '#080608', surf: '#111015', card: '#18141F',
  maroon: '#8B1F24', m2: '#A62028', mGlow: '#8B1F2440',
  gold: '#D4A843', text: '#F0EDE8', mid: '#9CA3AF',
  dim: '#6B7280', border: '#374151', green: '#10B981',
  red: '#EF4444', blue: '#3B82F6'
};

// Arab/Gulf Countries Data
const countries = [
  {flag: "🇶🇦", code: "+974", name: "قطر", nameEn: "Qatar"},
  {flag: "🇸🇦", code: "+966", name: "السعودية", nameEn: "Saudi Arabia"},
  {flag: "🇦🇪", code: "+971", name: "الإمارات", nameEn: "UAE"},
  {flag: "🇰🇼", code: "+965", name: "الكويت", nameEn: "Kuwait"},
  {flag: "🇧🇭", code: "+973", name: "البحرين", nameEn: "Bahrain"},
  {flag: "🇴🇲", code: "+968", name: "عُمان", nameEn: "Oman"},
  {flag: "🇯🇴", code: "+962", name: "الأردن", nameEn: "Jordan"},
  {flag: "🇱🇧", code: "+961", name: "لبنان", nameEn: "Lebanon"},
  {flag: "🇸🇾", code: "+963", name: "سوريا", nameEn: "Syria"},
  {flag: "🇮🇶", code: "+964", name: "العراق", nameEn: "Iraq"},
  {flag: "🇪🇬", code: "+20", name: "مصر", nameEn: "Egypt"},
  {flag: "🇱🇾", code: "+218", name: "ليبيا", nameEn: "Libya"},
  {flag: "🇹🇳", code: "+216", name: "تونس", nameEn: "Tunisia"},
  {flag: "🇩🇿", code: "+213", name: "الجزائر", nameEn: "Algeria"},
  {flag: "🇲🇦", code: "+212", name: "المغرب", nameEn: "Morocco"},
  {flag: "🇸🇩", code: "+249", name: "السودان", nameEn: "Sudan"},
  {flag: "🇾🇪", code: "+967", name: "اليمن", nameEn: "Yemen"}
];

function LoginScreen({onLogin}){
  const[step,setStep]=useState("phone");
  const[phone,setPhone]=useState("");
  const[otp,setOtp]=useState(["","","","","",""]);
  const[hint,setHint]=useState("");
  const[err,setErr]=useState("");
  const[loading,setLoading]=useState(false);
  const[timer,setTimer]=useState(0);
  const[showCountries,setShowCountries]=useState(false);
  const[selectedCountry,setSelectedCountry]=useState(countries[0]);
  const refs=useRef([]);
  
  useEffect(()=>{
    if(timer<=0)return;
    const t=setTimeout(()=>setTimer(p=>p-1),1000);
    return()=>clearTimeout(t);
  },[timer]);
  
  function send(){
    if(phone.replace(/\D/g,"").length<7){
      setErr("أدخل رقماً صحيحاً");
      return;
    }
    setErr("");setLoading(true);
    const c=String(100000+Math.floor(Math.random()*900000));
    setHint(c);
    setTimeout(()=>{
      setLoading(false);
      setStep("otp");
      setTimer(120);
    },1500);
  }
  
  function verify(){
    if(otp.join("").length<6){
      setErr("أدخل الرمز كاملاً");
      return;
    }
    setLoading(true);
    setTimeout(()=>{
      if(otp.join("")===hint){
        // Save login state
        localStorage.setItem('wejha_user_phone', selectedCountry.code + phone.replace(/\D/g,""));
        localStorage.setItem('wejha_user_country', JSON.stringify(selectedCountry));
        onLogin(selectedCountry.code + phone.replace(/\D/g,""));
      }else{
        setErr("رمز غير صحيح");
        setOtp(["","","","","",""]);
        refs.current[0]?.focus();
      }
      setLoading(false);
    },900);
  }
  
  const btnStyle=(on)=>({
    width:"100%",padding:"14px",borderRadius:14,border:"none",
    background:on?`linear-gradient(135deg,${T.maroon},${T.m2})`:T.card,
    color:on?"#fff":T.dim,fontWeight:900,fontSize:15,cursor:"pointer",
    transition:"all .25s",display:"flex",alignItems:"center",
    justifyContent:"center",gap:8,boxShadow:on?`0 6px 22px ${T.mGlow}`:"none"
  });
  
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
            
            {/* Country Selector */}
            <div style={{position:"relative",marginBottom:12}}>
              <button 
                className="tap" 
                onClick={()=>setShowCountries(!showCountries)}
                style={{
                  display:"flex",alignItems:"center",background:T.card,
                  borderRadius:14,border:`1.5px solid ${T.border}`,
                  padding:"13px 14px",width:"100%",cursor:"pointer",
                  justifyContent:"space-between",marginBottom:8
                }}
              >
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:18}}>{selectedCountry.flag}</span>
                  <span style={{color:T.text,fontWeight:700,fontSize:14}}>{selectedCountry.name}</span>
                  <span style={{color:T.mid,fontSize:13}}>{selectedCountry.code}</span>
                </div>
                <span style={{color:T.mid,fontSize:18}}>{showCountries?"▲":"▼"}</span>
              </button>
              
              {showCountries && (
                <div className="fi" style={{
                  position:"absolute",top:"100%",left:0,right:0,zIndex:50,
                  background:T.surf,borderRadius:14,border:`1px solid ${T.border}`,
                  maxHeight:200,overflowY:"auto",boxShadow:"0 8px 32px rgba(0,0,0,.5)"
                }}>
                  {countries.map(country=>(
                    <button 
                      key={country.code}
                      className="tap"
                      onClick={()=>{
                        setSelectedCountry(country);
                        setShowCountries(false);
                      }}
                      style={{
                        display:"flex",alignItems:"center",gap:8,
                        padding:"12px 14px",width:"100%",cursor:"pointer",
                        background:"none",border:"none",
                        borderBottom:`1px solid ${T.border}`
                      }}
                    >
                      <span style={{fontSize:16}}>{country.flag}</span>
                      <span style={{color:T.text,fontSize:13,flex:1,textAlign:"right"}}>{country.name}</span>
                      <span style={{color:T.dim,fontSize:12}}>{country.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Phone Input */}
            <div style={{display:"flex",alignItems:"center",background:T.card,borderRadius:14,border:`1.5px solid ${T.border}`,overflow:"hidden",marginBottom:12}}>
              <div style={{padding:"13px 14px",borderLeft:`1px solid ${T.border}`,color:T.mid,fontSize:13,fontWeight:700,flexShrink:0}}>
                {selectedCountry.flag} {selectedCountry.code}
              </div>
              <input 
                className="fi-inp" 
                type="tel" 
                value={phone} 
                onChange={e=>{setPhone(e.target.value);setErr("");}} 
                onKeyDown={e=>e.key==="Enter"&&send()} 
                placeholder="xxxx xxxx" 
                maxLength={12} 
                style={{
                  flex:1,padding:"13px 12px",border:"none",outline:"none",
                  background:"transparent",fontSize:16,color:T.text,
                  direction:"ltr",textAlign:"left"
                }}
              />
            </div>
            
            {err&&<p className="fi" style={{color:T.red,fontSize:12,marginBottom:10}}>⚠️ {err}</p>}
            
            <button className="tap" onClick={send} disabled={loading||phone.length<7} style={btnStyle(phone.length>=7&&!loading)}>
              {loading?<><div style={{width:16,height:16,border:`2px solid ${T.text}33`,borderTopColor:T.text,borderRadius:'50%',animation:'spin 0.7s linear infinite'}}/><span>جاري الإرسال...</span></>:<><span>📲</span><span>إرسال رمز واتساب</span></>}
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
                <input 
                  key={i} 
                  ref={el=>refs.current[i]=el} 
                  className="otp" 
                  type="tel" 
                  inputMode="numeric" 
                  maxLength={1} 
                  value={v}
                  onChange={e=>{
                    const nv=e.target.value.replace(/\D/g,"");
                    const next=[...otp];
                    next[i]=nv.slice(-1);
                    setOtp(next);
                    if(nv&&i<5)refs.current[i+1]?.focus();
                  }}
                  onKeyDown={e=>{
                    if(e.key==="Backspace"&&!otp[i]&&i>0)refs.current[i-1]?.focus();
                  }}
                  style={{
                    width:44,height:54,borderRadius:13,
                    border:`2px solid ${v?T.maroon:T.border}`,
                    background:v?"#1c0e11":T.card,
                    fontSize:22,fontWeight:900,textAlign:"center",
                    color:T.maroon,outline:"none",transition:"all .15s"
                  }}
                />
              ))}
            </div>
            {err&&<p className="fi" style={{color:T.red,fontSize:12,marginBottom:10,textAlign:"center"}}>⚠️ {err}</p>}
            <button className="tap" onClick={verify} disabled={loading||otp.join("").length<6} style={btnStyle(otp.join("").length>=6&&!loading)}>
              {loading?<><div style={{width:16,height:16,border:`2px solid ${T.text}33`,borderTopColor:T.text,borderRadius:'50%',animation:'spin 0.7s linear infinite'}}/><span>جاري التحقق...</span></>:<><span>✅</span><span>تأكيد</span></>}
            </button>
            {timer>0&&<p style={{fontSize:11,color:T.dim,textAlign:"center",marginTop:14}}>يمكنك إعادة الإرسال خلال <strong>{timer}</strong> ثانية</p>}
          </>
        )}
      </div>
    </div>
  );
}

function LocationScreen({onGrant}){
  useEffect(()=>{
    setTimeout(()=>onGrant({lat:25.276987,lng:51.520008}),1000);
  },[onGrant]);
  return(
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",color:T.text}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:60,marginBottom:20}}>📍</div>
        <h2>تحديد الموقع...</h2>
        <p style={{color:T.dim,fontSize:14}}>للعثور على أفضل العروض القريبة منك</p>
      </div>
    </div>
  );
}

function AppScreen({phone,location,onLogout}){
  return(
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",color:T.text}}>
      <div style={{textAlign:"center",padding:20}}>
        <h1 style={{marginBottom:20}}>مرحباً في وِجهة!</h1>
        <p style={{color:T.dim,marginBottom:10}}>رقم الجوال: {phone}</p>
        <p style={{color:T.dim,marginBottom:30}}>الموقع: {location?.lat}, {location?.lng}</p>
        <button 
          className="tap" 
          onClick={onLogout}
          style={{
            padding:"12px 24px",borderRadius:12,border:"none",
            background:T.maroon,color:"#fff",fontWeight:700,
            cursor:"pointer"
          }}
        >
          تسجيل خروج
        </button>
      </div>
    </div>
  );
}

export default function App(){
  const[screen,setScreen]=useState("login");
  const[phone,setPhone]=useState(null);
  const[loc,setLoc]=useState(null);
  
  // Check for existing login on load
  useEffect(() => {
    const savedPhone = localStorage.getItem('wejha_user_phone');
    if (savedPhone) {
      setPhone(savedPhone);
      setScreen("location");
    }
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem('wejha_user_phone');
    localStorage.removeItem('wejha_user_country');
    setScreen("login");
    setPhone(null);
    setLoc(null);
  };
  
  return(
    <>
      {screen==="login"&&<LoginScreen onLogin={p=>{setPhone(p);setScreen("location");}}/>}
      {screen==="location"&&<LocationScreen onGrant={l=>{setLoc(l);setScreen("app");}}/>}
      {screen==="app"&&<AppScreen phone={phone} location={loc} onLogout={handleLogout}/>}
    </>
  );
}