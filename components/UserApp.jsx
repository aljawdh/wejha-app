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

/* ─── Color Palette ─────────────────────────────────────────────────────── */
const T = {
  bg: '#080608', surf: '#111015', card: '#18141F',
  maroon: '#8B1F24', m2: '#A62028', mGlow: '#8B1F2440',
  gold: '#D4A843', text: '#F0EDE8', mid: '#9CA3AF',
  dim: '#6B7280', border: '#374151', green: '#10B981',
  red: '#EF4444', blue: '#3B82F6'
};

/* ─── Mock Data ─────────────────────────────────────────────────────────── */
const MOCK_DEALS = [
  {
    id: "D001",
    title: "برجر شيف + بطاطس + مشروب",
    subtitle: "وجبة كاملة للغداء",
    merchant: "مطعم الدوحة الملكي",
    category: "مطاعم",
    originalPrice: 45,
    discountPercent: 30,
    finalPrice: 31.50,
    image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400",
    distance: 0.8,
    rating: 4.7,
    remaining: 12,
    type: "product", // product, bill, buy1get1
    validUntil: "2026-03-15T23:59:59",
    location: { lat: 25.276987, lng: 51.520008 },
    description: "برجر لحم فريش + بطاطس مقلية + مشروب غازي"
  },
  {
    id: "D002",
    title: "خصم 25% على الفاتورة",
    subtitle: "جميع المشروبات والحلويات",
    merchant: "كافيه لؤلؤة الخليج",
    category: "مقاهي",
    originalPrice: 100,
    discountPercent: 25,
    finalPrice: 75,
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400",
    distance: 1.2,
    rating: 4.9,
    remaining: 8,
    type: "bill",
    validUntil: "2026-03-14T23:59:59",
    location: { lat: 25.285447, lng: 51.531040 },
    description: "خصم على إجمالي الفاتورة - ساري على جميع العناصر"
  },
  {
    id: "D003",
    title: "اشتري واحد واحصل على آخر مجاناً",
    subtitle: "عطور فرنسية أصلية",
    merchant: "بوتيك وردة قطر",
    category: "عطور",
    originalPrice: 280,
    discountPercent: 50,
    finalPrice: 140,
    image: "https://images.unsplash.com/photo-1588405748880-12d1d2a59d32?w=400",
    distance: 2.1,
    rating: 4.6,
    remaining: 5,
    type: "buy1get1",
    validUntil: "2026-03-16T23:59:59",
    location: { lat: 25.267788, lng: 51.534423 },
    description: "عطور أصلية مستوردة من باريس"
  }
];

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

/* ─── Utility Functions ─────────────────────────────────────────────────────── */
function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('ar-QA', {
    style: 'currency',
    currency: 'QAR',
    minimumFractionDigits: 2
  }).format(amount).replace('QAR', 'ر.ق');
}

/* ─── Components ─────────────────────────────────────────────────────────── */
const Spin = ({ size = 16, color = T.text }) => (
  <div style={{ 
    width: size, height: size, border: `2px solid ${color}33`,
    borderTopColor: color, borderRadius: '50%',
    animation: 'spin 0.7s linear infinite'
  }} />
);

/* ─── Login Screen ─────────────────────────────────────────────────────────── */
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
        const fullPhone = selectedCountry.code + phone.replace(/\D/g,"");
        localStorage.setItem('wejha_user_phone', fullPhone);
        localStorage.setItem('wejha_user_country', JSON.stringify(selectedCountry));
        onLogin(fullPhone);
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
              {loading?<><Spin/><span>جاري التحقق...</span></>:<><span>✅</span><span>تأكيد</span></>}
            </button>
            {timer>0&&<p style={{fontSize:11,color:T.dim,textAlign:"center",marginTop:14}}>يمكنك إعادة الإرسال خلال <strong>{timer}</strong> ثانية</p>}
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Location Screen ─────────────────────────────────────────────────────── */
function LocationScreen({onGrant}){
  const[requesting,setRequesting]=useState(false);
  
  const requestLocation = () => {
    setRequesting(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onGrant({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          onGrant({ lat: 25.276987, lng: 51.520008 }); // Fallback to Doha
        },
        { timeout: 10000 }
      );
    } else {
      onGrant({ lat: 25.276987, lng: 51.520008 });
    }
  };
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!requesting) requestLocation();
    }, 2000);
    return () => clearTimeout(timer);
  }, [requesting]);
  
  return(
    <div style={{minHeight:"100svh",background:T.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px",backgroundImage:`radial-gradient(ellipse 60% 30% at 50% 0%,${T.blue}15,transparent)`}}>
      <div className="pi" style={{textAlign:"center"}}>
        <div style={{fontSize:80,marginBottom:20,animation:"pulse 2s ease infinite"}}>📍</div>
        <h2 style={{fontWeight:800,fontSize:22,color:T.text,marginBottom:8}}>تحديد موقعك</h2>
        <p style={{color:T.mid,fontSize:14,lineHeight:1.6,marginBottom:24,maxWidth:300}}>نحتاج إلى موقعك للعثور على أفضل العروض والكوبونات القريبة منك</p>
        <button className="tap" onClick={requestLocation} disabled={requesting} style={{
          padding:"14px 24px",borderRadius:14,border:"none",
          background:requesting?T.dim:`linear-gradient(135deg,${T.blue},${T.green})`,
          color:"#fff",fontWeight:800,fontSize:15,cursor:requesting?"default":"pointer",
          display:"flex",alignItems:"center",justifyContent:"center",gap:8,
          minWidth:180
        }}>
          {requesting?<><Spin color="#fff"/><span>جاري التحديد...</span></>:<><span>🎯</span><span>السماح بالموقع</span></>}
        </button>
      </div>
    </div>
  );
}

/* ─── Home Screen Components ─────────────────────────────────────────────── */
function DealCard({ deal, userLocation, onGetCoupon }) {
  const distance = userLocation ? getDistance(
    userLocation.lat, userLocation.lng,
    deal.location.lat, deal.location.lng
  ).toFixed(1) : "0.0";
  
  const savings = deal.originalPrice - deal.finalPrice;
  
  const getPriceDisplay = () => {
    switch(deal.type) {
      case "product":
        return {
          original: formatCurrency(deal.originalPrice),
          final: formatCurrency(deal.finalPrice),
          label: "السعر بعد الخصم"
        };
      case "bill":
        return {
          original: `${deal.discountPercent}%`,
          final: "خصم على الفاتورة",
          label: "خصم على إجمالي الفاتورة"
        };
      case "buy1get1":
        return {
          original: "2×",
          final: "بسعر واحد",
          label: "اشتري واحد واحصل على آخر"
        };
      default:
        return {
          original: formatCurrency(deal.originalPrice),
          final: formatCurrency(deal.finalPrice),
          label: "السعر"
        };
    }
  };
  
  const priceInfo = getPriceDisplay();
  const isExpiringSoon = new Date(deal.validUntil) - new Date() < 24 * 60 * 60 * 1000;
  
  return (
    <div className="fu lift" style={{
      background: T.surf,
      borderRadius: 18,
      overflow: 'hidden',
      border: `1px solid ${T.border}`,
      marginBottom: 16,
      position: 'relative'
    }}>
      {/* Image */}
      <div style={{
        height: 180,
        background: `linear-gradient(45deg, ${T.maroon}22, ${T.gold}22)`,
        backgroundImage: `url(${deal.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative'
      }}>
        {/* Discount Badge */}
        <div style={{
          position: 'absolute',
          top: 12,
          right: 12,
          background: `linear-gradient(135deg, ${T.maroon}, ${T.red})`,
          color: '#fff',
          padding: '6px 12px',
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 900,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          {deal.discountPercent}% خصم
        </div>
        
        {/* Distance */}
        <div style={{
          position: 'absolute',
          top: 12,
          left: 12,
          background: 'rgba(0,0,0,0.7)',
          color: '#fff',
          padding: '4px 10px',
          borderRadius: 12,
          fontSize: 11,
          fontWeight: 600
        }}>
          📍 {distance} كم
        </div>
        
        {/* Remaining */}
        <div style={{
          position: 'absolute',
          bottom: 12,
          left: 12,
          background: deal.remaining <= 5 ? T.red : T.green,
          color: '#fff',
          padding: '4px 10px',
          borderRadius: 12,
          fontSize: 11,
          fontWeight: 700,
          animation: deal.remaining <= 5 ? 'pulse 1s ease infinite' : 'none'
        }}>
          متبقي {deal.remaining}
        </div>
      </div>
      
      {/* Content */}
      <div style={{ padding: '16px 18px' }}>
        {/* Title & Merchant */}
        <h3 style={{
          fontSize: 16,
          fontWeight: 800,
          color: T.text,
          marginBottom: 4,
          lineHeight: 1.3
        }}>{deal.title}</h3>
        
        <p style={{
          fontSize: 13,
          color: T.mid,
          marginBottom: 2
        }}>{deal.subtitle}</p>
        
        <p style={{
          fontSize: 12,
          color: T.dim,
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          <span>🏪</span>
          <span>{deal.merchant}</span>
          <span style={{ color: T.gold }}>⭐ {deal.rating}</span>
        </p>
        
        {/* Price Display */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14
        }}>
          <div>
            <p style={{ fontSize: 11, color: T.dim, marginBottom: 2 }}>{priceInfo.label}</p>
            {deal.type === "product" && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  fontSize: 12,
                  color: T.red,
                  textDecoration: 'line-through'
                }}>{priceInfo.original}</span>
                <span style={{
                  fontSize: 16,
                  fontWeight: 900,
                  color: T.green
                }}>{priceInfo.final}</span>
              </div>
            )}
            {deal.type === "bill" && (
              <div style={{
                fontSize: 16,
                fontWeight: 900,
                color: T.green
              }}>خصم {deal.discountPercent}%</div>
            )}
            {deal.type === "buy1get1" && (
              <div style={{
                fontSize: 14,
                fontWeight: 800,
                color: T.blue
              }}>2 × 1</div>
            )}
          </div>
          
          {deal.type === "product" && (
            <div className="sp" style={{
              background: `${T.green}18`,
              color: T.green,
              padding: '4px 10px',
              borderRadius: 8,
              fontSize: 11,
              fontWeight: 700
            }}>
              وفر {formatCurrency(savings)}
            </div>
          )}
        </div>
        
        {/* Expiry Warning */}
        {isExpiringSoon && (
          <div style={{
            background: `${T.red}15`,
            color: T.red,
            padding: '6px 12px',
            borderRadius: 8,
            fontSize: 11,
            fontWeight: 600,
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <span>⏰</span>
            <span>ينتهي قريباً!</span>
          </div>
        )}
        
        {/* Get Coupon Button */}
        <button 
          className="tap" 
          onClick={() => onGetCoupon(deal)}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: 12,
            border: 'none',
            background: `linear-gradient(135deg, ${T.maroon}, ${T.m2})`,
            color: '#fff',
            fontWeight: 900,
            fontSize: 14,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            boxShadow: `0 4px 16px ${T.mGlow}`
          }}
        >
          <span>🎫</span>
          <span>احصل على الكوبون</span>
        </button>
      </div>
    </div>
  );
}

function HomeScreen({ userLocation, userCoupons, setUserCoupons }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  const categories = [
    { id: "all", name: "الكل", emoji: "🗂️" },
    { id: "restaurants", name: "مطاعم", emoji: "🍽️" },
    { id: "cafes", name: "مقاهي", emoji: "☕" },
    { id: "perfumes", name: "عطور", emoji: "🌸" }
  ];
  
  const filteredDeals = useMemo(() => {
    let deals = MOCK_DEALS;
    
    if (selectedCategory !== "all") {
      deals = deals.filter(deal => 
        deal.category.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }
    
    if (searchQuery.trim()) {
      deals = deals.filter(deal =>
        deal.title.includes(searchQuery) ||
        deal.merchant.includes(searchQuery) ||
        deal.description.includes(searchQuery)
      );
    }
    
    // Sort by distance if location available
    if (userLocation) {
      deals.sort((a, b) => {
        const distA = getDistance(userLocation.lat, userLocation.lng, a.location.lat, a.location.lng);
        const distB = getDistance(userLocation.lat, userLocation.lng, b.location.lat, b.location.lng);
        return distA - distB;
      });
    }
    
    return deals;
  }, [searchQuery, selectedCategory, userLocation]);
  
  const handleGetCoupon = useCallback((deal) => {
    const couponId = `C${Date.now()}`;
    const expiresAt = new Date(deal.validUntil).getTime();
    
    const newCoupon = {
      id: couponId,
      dealId: deal.id,
      title: deal.title,
      merchant: deal.merchant,
      originalPrice: deal.originalPrice,
      finalPrice: deal.finalPrice,
      discountPercent: deal.discountPercent,
      type: deal.type,
      description: deal.description,
      code: `WJ${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      expiresAt: expiresAt,
      usedAt: null,
      createdAt: Date.now(),
      quantity: 1
    };
    
    setUserCoupons(prev => [...prev, newCoupon]);
  }, [setUserCoupons]);
  
  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(180deg, ${T.maroon}22, transparent)`,
        padding: '20px 18px 24px',
        marginBottom: 16
      }}>
        <div style={{ marginBottom: 16 }}>
          <h1 style={{
            fontSize: 24,
            fontWeight: 900,
            color: T.text,
            marginBottom: 4
          }}>مرحباً بك في وِجهة</h1>
          <p style={{ fontSize: 14, color: T.mid }}>
            اكتشف أفضل العروض والكوبونات حولك
          </p>
        </div>
        
        {/* Search */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: T.surf,
          borderRadius: 14,
          border: `1px solid ${T.border}`,
          padding: '0 14px'
        }}>
          <span style={{ fontSize: 18, marginLeft: 10 }}>🔍</span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن عرض أو متجر..."
            style={{
              flex: 1,
              padding: '14px 0',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: 15,
              color: T.text
            }}
          />
        </div>
      </div>
      
      {/* Categories */}
      <div style={{ padding: '0 18px', marginBottom: 20 }}>
        <div style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 4
        }}>
          {categories.map(cat => (
            <button
              key={cat.id}
              className="tap"
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '8px 16px',
                borderRadius: 20,
                border: `1px solid ${selectedCategory === cat.id ? T.maroon : T.border}`,
                background: selectedCategory === cat.id ? `${T.maroon}18` : T.surf,
                color: selectedCategory === cat.id ? T.maroon : T.mid,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <span>{cat.emoji}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Deals List */}
      <div style={{ padding: '0 18px' }}>
        {filteredDeals.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: T.mid
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <p>لم نجد عروض مطابقة للبحث</p>
          </div>
        ) : (
          filteredDeals.map(deal => (
            <DealCard
              key={deal.id}
              deal={deal}
              userLocation={userLocation}
              onGetCoupon={handleGetCoupon}
            />
          ))
        )}
      </div>
    </div>
  );
}

/* ─── Wallet Screen ─────────────────────────────────────────────────────── */
function WalletScreen({ userCoupons, setUserCoupons }) {
  const [activeFilter, setActiveFilter] = useState("all");
  
  const now = Date.now();
  const categorizedCoupons = useMemo(() => {
    const active = userCoupons.filter(c => !c.usedAt && c.expiresAt > now);
    const used = userCoupons.filter(c => c.usedAt);
    const expired = userCoupons.filter(c => !c.usedAt && c.expiresAt <= now);
    
    return { active, used, expired };
  }, [userCoupons, now]);
  
  const totalSavings = useMemo(() => {
    return userCoupons
      .filter(c => c.usedAt)
      .reduce((sum, c) => sum + (c.originalPrice - c.finalPrice) * c.quantity, 0);
  }, [userCoupons]);
  
  const getFilteredCoupons = () => {
    switch (activeFilter) {
      case "active": return categorizedCoupons.active;
      case "used": return categorizedCoupons.used;
      case "expired": return categorizedCoupons.expired;
      default: return userCoupons;
    }
  };
  
  const generateBarcode = (code) => {
    if (typeof window !== 'undefined' && window.JsBarcode) {
      const canvas = document.createElement('canvas');
      window.JsBarcode(canvas, code, {
        format: "CODE128",
        width: 2,
        height: 60,
        displayValue: false,
        margin: 0
      });
      return canvas.toDataURL();
    }
    return null;
  };
  
  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(180deg, ${T.gold}22, transparent)`,
        padding: '20px 18px 24px',
        marginBottom: 16
      }}>
        <h1 style={{
          fontSize: 24,
          fontWeight: 900,
          color: T.text,
          marginBottom: 16
        }}>محفظة الكوبونات</h1>
        
        {/* Total Savings */}
        <div className="sp" style={{
          background: `linear-gradient(135deg, ${T.gold}, ${T.green})`,
          borderRadius: 16,
          padding: '16px 20px',
          color: '#fff',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: 13, opacity: 0.9, marginBottom: 4 }}>إجمالي توفيرك</p>
          <p style={{ fontSize: 28, fontWeight: 900 }}>{formatCurrency(totalSavings)}</p>
        </div>
      </div>
      
      {/* Filters */}
      <div style={{ padding: '0 18px', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
          {[
            ["all", "الكل", userCoupons.length],
            ["active", "نشط", categorizedCoupons.active.length],
            ["used", "مستخدم", categorizedCoupons.used.length],
            ["expired", "منتهي", categorizedCoupons.expired.length]
          ].map(([key, label, count]) => (
            <button
              key={key}
              className="tap"
              onClick={() => setActiveFilter(key)}
              style={{
                padding: '8px 16px',
                borderRadius: 12,
                border: `1px solid ${activeFilter === key ? T.gold : T.border}`,
                background: activeFilter === key ? `${T.gold}18` : T.surf,
                color: activeFilter === key ? T.gold : T.mid,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {label} ({count})
            </button>
          ))}
        </div>
      </div>
      
      {/* Coupons List */}
      <div style={{ padding: '0 18px' }}>
        {getFilteredCoupons().map(coupon => {
          const isExpired = coupon.expiresAt <= now;
          const isUsed = coupon.usedAt;
          const barcode = generateBarcode(coupon.code);
          
          return (
            <div key={coupon.id} className="fu" style={{
              background: T.surf,
              borderRadius: 16,
              border: `1px solid ${T.border}`,
              marginBottom: 16,
              overflow: 'hidden',
              opacity: isExpired || isUsed ? 0.7 : 1
            }}>
              {/* Header */}
              <div style={{
                padding: '16px 18px 12px',
                borderBottom: `1px solid ${T.border}`,
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between'
              }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: T.text,
                    marginBottom: 4
                  }}>{coupon.title}</h3>
                  <p style={{
                    fontSize: 13,
                    color: T.mid,
                    marginBottom: 8
                  }}>{coupon.merchant}</p>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12
                  }}>
                    <span style={{
                      background: `${T.green}18`,
                      color: T.green,
                      padding: '2px 8px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 700
                    }}>
                      {coupon.discountPercent}% خصم
                    </span>
                    <span style={{ fontSize: 12, color: T.dim }}>
                      الكمية: {coupon.quantity}
                    </span>
                  </div>
                </div>
                
                <div style={{
                  background: isUsed ? T.green : isExpired ? T.red : T.blue,
                  color: '#fff',
                  padding: '4px 10px',
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: 700
                }}>
                  {isUsed ? "مستخدم ✓" : isExpired ? "منتهي ✕" : "نشط"}
                </div>
              </div>
              
              {/* Barcode */}
              {!isExpired && !isUsed && (
                <div style={{
                  padding: '16px 18px',
                  background: '#fff',
                  textAlign: 'center'
                }}>
                  {barcode && (
                    <img 
                      src={barcode} 
                      alt="Barcode"
                      style={{ maxWidth: '100%', height: 'auto' }}
                    />
                  )}
                  <p style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#000',
                    marginTop: 8,
                    letterSpacing: 2
                  }}>{coupon.code}</p>
                </div>
              )}
              
              {/* Footer */}
              <div style={{
                padding: '12px 18px',
                background: T.card,
                fontSize: 11,
                color: T.dim,
                textAlign: 'center'
              }}>
                {isUsed ? (
                  `استُخدم في ${new Date(coupon.usedAt).toLocaleDateString('ar-QA')}`
                ) : isExpired ? (
                  "انتهت صلاحية هذا الكوبون"
                ) : (
                  `صالح حتى ${new Date(coupon.expiresAt).toLocaleDateString('ar-QA')}`
                )}
              </div>
            </div>
          );
        })}
        
        {getFilteredCoupons().length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: T.mid
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎫</div>
            <p>لا توجد كوبونات في هذه الفئة</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Profile Screen ─────────────────────────────────────────────────────── */
function ProfileScreen({ phone, profile, setProfile, onLogout }) {
  const [editing, setEditing] = useState({ email: false });
  const [tempEmail, setTempEmail] = useState(profile.email || "");
  
  const saveEmail = () => {
    setProfile(prev => ({ ...prev, email: tempEmail }));
    setEditing(prev => ({ ...prev, email: false }));
  };
  
  const stats = {
    totalCoupons: 12,
    usedCoupons: 7,
    savings: 245.50,
    memberSince: "2026-01-15"
  };
  
  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(180deg, ${T.blue}22, transparent)`,
        padding: '20px 18px 24px',
        marginBottom: 20
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginBottom: 16
        }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${T.maroon}, ${T.gold})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            fontWeight: 900,
            color: '#fff'
          }}>👤</div>
          
          <div>
            <h1 style={{
              fontSize: 20,
              fontWeight: 800,
              color: T.text,
              marginBottom: 4
            }}>مستخدم وِجهة</h1>
            <p style={{ fontSize: 13, color: T.mid }}>
              عضو منذ {new Date(stats.memberSince).toLocaleDateString('ar-QA')}
            </p>
          </div>
        </div>
        
        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          marginTop: 20
        }}>
          {[
            ["🎫", stats.totalCoupons, "كوبون"],
            ["✅", stats.usedCoupons, "مستخدم"],
            ["💰", formatCurrency(stats.savings), "توفير"]
          ].map(([emoji, value, label]) => (
            <div key={label} style={{
              background: T.surf,
              borderRadius: 12,
              padding: '12px 8px',
              textAlign: 'center',
              border: `1px solid ${T.border}`
            }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{emoji}</div>
              <div style={{
                fontSize: 16,
                fontWeight: 800,
                color: T.text,
                marginBottom: 2
              }}>{value}</div>
              <div style={{
                fontSize: 11,
                color: T.mid
              }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Personal Info */}
      <div style={{ padding: '0 18px', marginBottom: 24 }}>
        <h2 style={{
          fontSize: 18,
          fontWeight: 800,
          color: T.text,
          marginBottom: 16
        }}>المعلومات الشخصية</h2>
        
        <div style={{
          background: T.surf,
          borderRadius: 16,
          border: `1px solid ${T.border}`,
          overflow: 'hidden'
        }}>
          {/* Phone */}
          <div style={{
            padding: '16px 18px',
            borderBottom: `1px solid ${T.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 18 }}>📱</span>
              <div>
                <p style={{ fontSize: 13, color: T.mid, marginBottom: 2 }}>رقم الجوال</p>
                <p style={{ fontSize: 15, fontWeight: 600, color: T.text, direction: 'ltr' }}>
                  {phone}
                </p>
              </div>
            </div>
            <span style={{
              background: `${T.green}18`,
              color: T.green,
              padding: '2px 8px',
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 700
            }}>
              مُحقق ✓
            </span>
          </div>
          
          {/* Email */}
          <div style={{
            padding: '16px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
              <span style={{ fontSize: 18 }}>📧</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, color: T.mid, marginBottom: 4 }}>البريد الإلكتروني</p>
                {editing.email ? (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      value={tempEmail}
                      onChange={(e) => setTempEmail(e.target.value)}
                      placeholder="أدخل بريدك الإلكتروني"
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: `1px solid ${T.border}`,
                        background: T.card,
                        fontSize: 14,
                        color: T.text,
                        direction: 'ltr'
                      }}
                    />
                    <button
                      className="tap"
                      onClick={saveEmail}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: 'none',
                        background: T.green,
                        color: '#fff',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      حفظ
                    </button>
                  </div>
                ) : (
                  <p style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: profile.email ? T.text : T.dim,
                    direction: 'ltr'
                  }}>
                    {profile.email || "لم يتم إضافة بريد إلكتروني"}
                  </p>
                )}
              </div>
            </div>
            {!editing.email && (
              <button
                className="tap"
                onClick={() => {
                  setTempEmail(profile.email || "");
                  setEditing(prev => ({ ...prev, email: true }));
                }}
                style={{
                  padding: '6px 10px',
                  borderRadius: 8,
                  border: `1px solid ${T.border}`,
                  background: T.card,
                  color: T.mid,
                  fontSize: 12,
                  cursor: 'pointer'
                }}
              >
                تعديل
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Settings */}
      <div style={{ padding: '0 18px', marginBottom: 24 }}>
        <h2 style={{
          fontSize: 18,
          fontWeight: 800,
          color: T.text,
          marginBottom: 16
        }}>الإعدادات</h2>
        
        <div style={{
          background: T.surf,
          borderRadius: 16,
          border: `1px solid ${T.border}`,
          overflow: 'hidden'
        }}>
          {[
            ["🌐", "اللغة", "العربية"],
            ["🔔", "الإشعارات", "مُفعلة"],
            ["📍", "المشاركة الموقع", "مُفعلة"],
          ].map(([emoji, title, status], index, array) => (
            <div
              key={title}
              style={{
                padding: '16px 18px',
                borderBottom: index < array.length - 1 ? `1px solid ${T.border}` : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 18 }}>{emoji}</span>
                <span style={{ fontSize: 15, fontWeight: 600, color: T.text }}>{title}</span>
              </div>
              <span style={{ fontSize: 13, color: T.mid }}>{status}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Logout */}
      <div style={{ padding: '0 18px' }}>
        <button
          className="tap"
          onClick={onLogout}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: 14,
            border: `1px solid ${T.red}44`,
            background: `${T.red}15`,
            color: T.red,
            fontSize: 15,
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8
          }}
        >
          <span>🚪</span>
          <span>تسجيل خروج</span>
        </button>
      </div>
    </div>
  );
}

/* ─── Main App Screen ─────────────────────────────────────────────────────── */
function AppScreen({ phone, location, onLogout }) {
  const [tab, setTab] = useState("home");
  const [userCoupons, setUserCoupons] = useState([]);
  const [profile, setProfile] = useState({ email: "" });
  
  const TABS = [
    { id: "home", icon: "🏠", label: "الرئيسية" },
    { id: "wallet", icon: "💼", label: "محفظتي" },
    { id: "profile", icon: "👤", label: "حسابي" }
  ];
  
  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text }}>
      {/* Main Content */}
      <main>
        {tab === "home" && (
          <HomeScreen 
            userLocation={location}
            userCoupons={userCoupons}
            setUserCoupons={setUserCoupons}
          />
        )}
        {tab === "wallet" && (
          <WalletScreen 
            userCoupons={userCoupons}
            setUserCoupons={setUserCoupons}
          />
        )}
        {tab === "profile" && (
          <ProfileScreen 
            phone={phone}
            profile={profile}
            setProfile={setProfile}
            onLogout={onLogout}
          />
        )}
      </main>
      
      {/* Bottom Navigation */}
      <nav style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        background: `${T.surf}F2`,
        backdropFilter: "blur(20px)",
        borderTop: `1px solid ${T.border}`,
        display: "flex"
      }}>
        {TABS.map(({ id, icon, label }) => (
          <button 
            key={id} 
            className="tap" 
            onClick={() => setTab(id)}
            style={{
              flex: 1,
              padding: "12px 4px 10px",
              border: "none",
              cursor: "pointer",
              background: "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3
            }}
          >
            <span style={{
              fontSize: 22,
              filter: tab === id ? "none" : "grayscale(1) opacity(.4)"
            }}>{icon}</span>
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              color: tab === id ? T.maroon : T.dim
            }}>{label}</span>
            {tab === id && (
              <div style={{
                width: 18,
                height: 2,
                background: T.maroon,
                borderRadius: 99
              }} />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}

/* ─── Main App ─────────────────────────────────────────────────────────── */
export default function App() {
  const [screen, setScreen] = useState("login");
  const [phone, setPhone] = useState(null);
  const [loc, setLoc] = useState(null);
  
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
  
  return (
    <>
      {screen === "login" && (
        <LoginScreen onLogin={p => { setPhone(p); setScreen("location"); }} />
      )}
      {screen === "location" && (
        <LocationScreen onGrant={l => { setLoc(l); setScreen("app"); }} />
      )}
      {screen === "app" && (
        <AppScreen phone={phone} location={loc} onLogout={handleLogout} />
      )}
    </>
  );
}