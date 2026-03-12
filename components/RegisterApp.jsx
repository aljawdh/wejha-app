'use client'
import { useState, useRef, useEffect } from "react";

/* ─── Inject fonts + styles ─────────────────────────────────── */
if (!document.getElementById("wreg-style")) {
  const l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap";
  document.head.appendChild(l);
  const s = document.createElement("style");
  s.id = "wreg-style";
  s.textContent = `
    html,body{margin:0;padding:0;font-family:'Tajawal',sans-serif;direction:rtl;background:#09080C;}
    *{box-sizing:border-box;}
    input,button,select,textarea{font-family:'Tajawal',sans-serif;}
    input[type=number]::-webkit-outer-spin-button,
    input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;}
    ::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:#2a2a2a;border-radius:99px;}
    @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
    @keyframes popIn{0%{opacity:0;transform:scale(.88)}65%{transform:scale(1.04)}100%{opacity:1;transform:scale(1)}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
    @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
    .fu{animation:fadeUp .38s cubic-bezier(.22,1,.36,1) both}
    .pi{animation:popIn .45s cubic-bezier(.34,1.56,.64,1) both}
    .sd{animation:slideDown .22s ease both}
    .tap:active{transform:scale(.96)!important;transition:transform .08s!important}
    .inp:focus{border-color:#8B1F24!important;box-shadow:0 0 0 3px #8B1F2420!important;outline:none!important}
    .sec-anchor{scroll-margin-top:80px;}
  `;
  document.head.appendChild(s);
}

/* ─── Tokens ─────────────────────────────────────────────────── */
const T = {
  bg: "#09080C", surf: "#120F18", card: "#1B1823",
  border: "#272430",
  maroon: "#8B1F24", m2: "#6A171B", mGlow: "#8B1F2430",
  gold: "#C9A84C",
  text: "#EEE9F5", mid: "#887E98", dim: "#413C52",
  green: "#2ECA88", red: "#E04848", blue: "#4A9EDD",
};

/* ─── Helpers ─────────────────────────────────────────────────── */
const Spin = ({ size = 17, color = "#fff" }) => (
  <div style={{ width: size, height: size, border: `2.5px solid ${color}33`, borderTopColor: color, borderRadius: "50%", animation: "spin .75s linear infinite", flexShrink: 0 }} />
);

function Field({ label, required, hint, children, error }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: error ? T.red : T.mid, display: "block", marginBottom: 5 }}>
        {label}
        {required && <span style={{ color: T.maroon }}> *</span>}
        {hint && <span style={{ color: T.dim, fontWeight: 400, marginRight: 5 }}>— {hint}</span>}
      </label>
      {children}
      {error && <p style={{ fontSize: 11, color: T.red, marginTop: 4, fontWeight: 700 }}>⚠ {error}</p>}
    </div>
  );
}

const inp = {
  width: "100%", padding: "12px 14px", borderRadius: 13,
  border: `1.5px solid ${T.border}`, background: T.card,
  fontSize: 14, color: T.text, transition: "border-color .2s",
};

function SectionCard({ id, icon, title, subtitle, children, done }) {
  return (
    <div id={id} className="sec-anchor fu" style={{
      background: T.surf, borderRadius: 22, border: `1px solid ${done ? T.green + "44" : T.border}`,
      overflow: "hidden", marginBottom: 16,
      boxShadow: done ? `0 0 0 1px ${T.green}22` : "none",
      transition: "border .3s, box-shadow .3s",
    }}>
      {/* Card header */}
      <div style={{
        padding: "18px 20px 14px",
        borderBottom: `1px solid ${T.border}`,
        display: "flex", alignItems: "center", gap: 12,
        background: done ? `${T.green}08` : "transparent",
      }}>
        <div style={{
          width: 42, height: 42, borderRadius: 13, flexShrink: 0,
          background: done ? `${T.green}18` : `${T.maroon}18`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
        }}>{done ? "✅" : icon}</div>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 900, fontSize: 15, color: T.text, lineHeight: 1.2 }}>{title}</p>
          <p style={{ fontSize: 11, color: T.mid, marginTop: 3 }}>{subtitle}</p>
        </div>
        {done && <span style={{ fontSize: 11, color: T.green, fontWeight: 800, background: `${T.green}18`, padding: "3px 10px", borderRadius: 99 }}>مكتمل ✓</span>}
      </div>
      <div style={{ padding: "18px 20px" }}>{children}</div>
    </div>
  );
}

/* image uploader */
function DocUploader({ label, hint, value, onChange, uploading, onUpload }) {
  const ref = useRef();
  return (
    <Field label={label} hint={hint}>
      <div
        onClick={() => !uploading && ref.current?.click()}
        style={{
          height: value ? 130 : 88, borderRadius: 14,
          border: `2px dashed ${value ? T.green + "66" : T.border}`,
          background: T.card, cursor: "pointer", overflow: "hidden",
          position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
          transition: "border .2s",
        }}
      >
        {value
          ? <img src={value} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", background: "#fff" }} />
          : uploading
            ? <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <Spin color={T.maroon} size={22} />
                <p style={{ fontSize: 11, color: T.mid }}>جاري الرفع...</p>
              </div>
            : <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 28, marginBottom: 5 }}>📄</p>
                <p style={{ fontSize: 12, color: T.mid, fontWeight: 700 }}>اضغط لرفع صورة الوثيقة</p>
                <p style={{ fontSize: 10, color: T.dim, marginTop: 2 }}>JPG · PNG · PDF · أقصى 5 MB</p>
              </div>
        }
        {value && (
          <button onClick={e => { e.stopPropagation(); onChange(null); }}
            style={{ position: "absolute", top: 8, left: 8, background: "#1C0808", border: `1px solid ${T.red}44`, borderRadius: 8, width: 28, height: 28, cursor: "pointer", color: T.red, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*,application/pdf" onChange={e => onUpload(e.target.files?.[0])} style={{ display: "none" }} />
    </Field>
  );
}

/* IBAN validator */
function ibanValid(v) { return v && v.toUpperCase().startsWith("QA") && v.replace(/\s/g,"").length === 29; }

/* password strength */
function pwStrength(pw) {
  if (!pw) return 0;
  if (pw.length < 6) return 1;
  if (pw.length < 10 || !/[A-Z]/.test(pw)) return 2;
  if (/[A-Z]/.test(pw) && /[0-9]/.test(pw) && pw.length >= 10) return 4;
  return 3;
}
const PW_LABELS = ["", "ضعيفة 🔴", "متوسطة 🟡", "جيدة 🟢", "قوية ✅"];
const PW_COLORS = [T.dim, T.red, T.gold, T.green, T.green];

const CATS = [
  "🍽️ مطاعم", "☕ مقاهي", "👗 بوتيك وعطور",
  "🛒 سوبر ماركت", "💊 صيدليات", "🧖 سبا ورياضة",
];
const CITIES = ["الدوحة", "الريان", "لوسيل", "الوكرة", "الخور", "الشمال", "الزلفى", "أم صلال"];
const BANKS = [
  "Qatar National Bank (QNB)", "Commercial Bank of Qatar", "Doha Bank",
  "Al Ahli Bank of Qatar", "Qatar Islamic Bank (QIB)", "Masraf Al Rayan",
  "Qatar International Islamic Bank", "Arab Bank — Qatar", "HSBC Qatar", "Dukhan Bank",
];
const DAYS = ["السبت","الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة"];

/* ═══════════════════════════════════════════════════════════════
   PENDING DASHBOARD — locked state after submission
═══════════════════════════════════════════════════════════════ */
function PendingDashboard({ data, onApprove }) {
  const [status, setStatus] = useState("pending");
  useEffect(() => {
    // Simulate approval after 7s for demo
    const t = setTimeout(() => setStatus("approved"), 7000);
    return () => clearTimeout(t);
  }, []);

  const LOCKED_TABS = ["🏷️ العروض", "🔍 التحقق", "📊 الإحصائيات"];

  return (
    <div style={{ minHeight: "100svh", background: T.bg, fontFamily: "'Tajawal',sans-serif", direction: "rtl" }}>
      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 40, background: `${T.bg}EE`, backdropFilter: "blur(20px)", borderBottom: `1px solid ${T.border}`, padding: "12px 16px" }}>
        <div style={{ maxWidth: 540, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", gap: 2 }}>
              <div style={{ width: 5, height: 28, background: T.maroon, borderRadius: "4px 0 0 4px" }} />
              <div style={{ width: 28, height: 28, background: T.surf, borderRadius: "0 8px 8px 0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>🏷️</div>
            </div>
            <div>
              <p style={{ fontWeight: 900, fontSize: 15, color: T.text, lineHeight: 1 }}>وِجهة</p>
              <p style={{ fontSize: 9, color: T.maroon, fontWeight: 700 }}>لوحة التاجر</p>
            </div>
          </div>
          <span style={{ background: status === "approved" ? `${T.green}18` : `${T.gold}18`, color: status === "approved" ? T.green : T.gold, borderRadius: 99, padding: "4px 12px", fontSize: 11, fontWeight: 800 }}>
            {status === "approved" ? "✅ معتمد" : "🟡 قيد المراجعة"}
          </span>
        </div>
      </header>

      <div style={{ maxWidth: 540, margin: "0 auto", padding: "20px 16px 100px" }}>

        {status === "approved" ? (
          /* ── Approved ── */
          <div className="pi" style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontWeight: 900, fontSize: 24, color: T.green, marginBottom: 8 }}>تم اعتمادك!</h2>
            <p style={{ fontSize: 14, color: T.mid, lineHeight: 1.8, marginBottom: 28 }}>
              مرحباً بك في وِجهة 🇶🇦<br />حسابك نشط الآن — ابدأ بإضافة عروضك
            </p>
            <button className="tap" onClick={onApprove} style={{
              width: "100%", maxWidth: 340, padding: "16px", borderRadius: 16, border: "none",
              background: `linear-gradient(135deg,${T.green},#1A9A60)`,
              color: "#fff", fontWeight: 900, fontSize: 17, cursor: "pointer",
              boxShadow: `0 8px 28px ${T.green}44`,
            }}>
              🚀 ابدأ الآن — لوح التحكم
            </button>
          </div>

        ) : (
          /* ── Pending ── */
          <>
            {/* Status banner */}
            <div className="fu" style={{ background: `${T.gold}10`, borderRadius: 20, padding: "20px", border: `1px solid ${T.gold}33`, marginBottom: 16, textAlign: "center" }}>
              <div style={{ fontSize: 44, marginBottom: 10, animation: "pulse 2s ease infinite" }}>⏳</div>
              <p style={{ fontWeight: 900, fontSize: 17, color: T.text, marginBottom: 6 }}>طلبك قيد المراجعة</p>
              <p style={{ fontSize: 13, color: T.mid, lineHeight: 1.8 }}>
                فريق وِجهة يراجع بياناتك خلال <strong style={{ color: T.gold }}>24–48 ساعة</strong><br />
                سيصلك إشعار واتساب على <strong style={{ color: T.text, direction: "ltr" }}>+974 {data.phone}</strong>
              </p>
            </div>

            {/* Submission summary */}
            <div className="fu" style={{ background: T.surf, borderRadius: 20, padding: "18px 20px", border: `1px solid ${T.border}`, marginBottom: 16, animationDelay: ".05s" }}>
              <p style={{ fontWeight: 800, fontSize: 13, color: T.mid, marginBottom: 14 }}>📋 ملخص طلبك</p>
              {[
                ["🏪 المتجر", data.storeName],
                ["👤 المالك", data.ownerName],
                ["📱 الجوال", `+974 ${data.phone}`],
                ["🏷️ النشاط", data.cat],
                ["🏙️ المدينة", data.city],
                ["📄 السجل", data.crNumber],
                ["🏦 البنك", data.bankName],
                ["📊 الحالة", "🟡 قيد المراجعة"],
              ].filter(([,v]) => v).map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${T.border}` }}>
                  <span style={{ fontSize: 12, color: T.dim }}>{k}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Locked tabs preview */}
            <div className="fu" style={{ background: T.surf, borderRadius: 20, padding: "18px 20px", border: `1px solid ${T.border}`, animationDelay: ".1s" }}>
              <p style={{ fontWeight: 800, fontSize: 13, color: T.mid, marginBottom: 14 }}>🔒 الميزات المتاحة بعد الاعتماد</p>
              {LOCKED_TABS.map(tab => (
                <div key={tab} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 13, background: T.card, border: `1px solid ${T.border}`, marginBottom: 8, opacity: .5 }}>
                  <span style={{ fontSize: 18 }}>{tab.split(" ")[0]}</span>
                  <span style={{ fontSize: 13, color: T.mid, flex: 1 }}>{tab.split(" ").slice(1).join(" ")}</span>
                  <span style={{ fontSize: 16 }}>🔒</span>
                </div>
              ))}
              <div style={{ marginTop: 10, background: `${T.gold}10`, borderRadius: 11, padding: "9px 13px" }}>
                <p style={{ fontSize: 11, color: T.gold }}>⏱️ Demo: سيتم الاعتماد تلقائياً بعد 7 ثوانٍ...</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom nav (locked) */}
      <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: `${T.surf}F2`, backdropFilter: "blur(20px)", borderTop: `1px solid ${T.border}`, display: "flex" }}>
        {[["🏷️","العروض"],["🔍","التحقق"],["📊","الإحصائيات"],["👤","حسابي"]].map(([ic, lb]) => (
          <div key={lb} style={{ flex: 1, padding: "12px 4px 10px", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, opacity: .35 }}>
            <span style={{ fontSize: 20, filter: "grayscale(1)" }}>{ic}</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: T.dim }}>{lb}</span>
          </div>
        ))}
      </nav>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN REGISTRATION PAGE — single long scroll
═══════════════════════════════════════════════════════════════ */
export default function WejhaRegister({ onDone }) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [uploadingKey, setUploadingKey] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [agreed2, setAgreed2] = useState(false);
  const [agreed3, setAgreed3] = useState(false);
  const [ibanRaw, setIbanRaw] = useState("");

  /* Active days multi-select */
  const [activeDays, setActiveDays] = useState(["السبت","الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس"]);

  const [d, setD] = useState({
    /* §1 store info */
    storeName: "", ownerName: "", phone: "", email: "", cat: "", city: "",
    storeDesc: "", openTime: "08:00", closeTime: "22:00", branches: "1",
    storeImg: null,
    /* §2 commercial */
    crNumber: "", crExpiry: "", licNumber: "", licExpiry: "",
    crImg: null, licImg: null, address: "", mapsUrl: "",
    /* §3 bank */
    bankName: "", accountName: "", iban: "", accountNumber: "",
    /* §4 security */
    password: "", password2: "",
  });
  const set = (k, v) => setD(p => ({ ...p, [k]: v }));

  /* ── Image upload ── */
  async function handleUpload(file, key) {
    if (!file) return;
    setUploadingKey(key);
    try {
      const { b64 } = await processImage(file);
      set(key, b64);
    } catch (e) { alert(e); }
    finally { setUploadingKey(null); }
  }

  /* processImage inline (no import) */
  function processImage(file) {
    return new Promise((resolve, reject) => {
      if (file.size > 5 * 1024 * 1024) { reject("الحجم يتجاوز 5 MB"); return; }
      const r = new FileReader();
      r.onerror = () => reject("خطأ في القراءة");
      r.onload = e => {
        const img = new Image();
        img.onerror = () => reject("الملف ليس صورة");
        img.onload = () => {
          let w = img.width, h = img.height;
          const MAX = 900;
          if (w > MAX || h > MAX) { const ratio = Math.min(MAX/w, MAX/h); w = Math.round(w*ratio); h = Math.round(h*ratio); }
          const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
          cv.getContext("2d").drawImage(img, 0, 0, w, h);
          let q = 0.78, b64 = cv.toDataURL("image/jpeg", q);
          while (b64.length * .75 > 400*1024 && q > 0.3) { q -= 0.08; b64 = cv.toDataURL("image/jpeg", q); }
          resolve({ b64 });
        };
        img.src = e.target.result;
      };
      r.readAsDataURL(file);
    });
  }

  /* ── Validation ── */
  function validate() {
    const e = {};
    if (!d.storeName.trim()) e.storeName = "مطلوب";
    if (!d.ownerName.trim()) e.ownerName = "مطلوب";
    if (!d.phone || d.phone.length < 8) e.phone = "رقم غير صحيح";
    if (!d.email || !d.email.includes("@")) e.email = "بريد غير صحيح";
    if (!d.cat) e.cat = "اختر النشاط";
    if (!d.city) e.city = "اختر المدينة";
    if (!d.crNumber.trim()) e.crNumber = "مطلوب";
    if (!d.crExpiry) e.crExpiry = "مطلوب";
    if (!d.licNumber.trim()) e.licNumber = "مطلوب";
    if (!d.bankName) e.bankName = "اختر البنك";
    if (!d.accountName.trim()) e.accountName = "مطلوب";
    if (!ibanValid(ibanRaw)) e.iban = "IBAN غير صحيح — يجب أن يبدأ بـ QA ويكون 29 حرفاً";
    if (!d.password || d.password.length < 8) e.password = "8 أحرف على الأقل";
    if (d.password !== d.password2) e.password2 = "كلمتا المرور غير متطابقتين";
    if (!agreed)  e.agreed  = "يجب الموافقة على اتفاقية الشراكة (البند الأول)";
    if (!agreed2) e.agreed2 = "يجب التأكيد على صحة البيانات (البند الثاني)";
    if (!agreed3) e.agreed3 = "يجب الموافقة على استلام نسخة الاتفاقية (البند الثالث)";
    setErrors(e);
    if (Object.keys(e).length > 0) {
      // scroll to first error
      const firstKey = Object.keys(e)[0];
      document.getElementById(`field-${firstKey}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return Object.keys(e).length === 0;
  }

  function submit() {
    if (!validate()) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1800);
  }

  /* section completion badges */
  const sec1Done = d.storeName && d.ownerName && d.phone && d.email && d.cat && d.city;
  const sec2Done = d.crNumber && d.crExpiry && d.licNumber;
  const sec3Done = d.bankName && d.accountName && ibanValid(ibanRaw);
  const sec4Done = d.password?.length >= 8 && d.password === d.password2;
  const allDone = sec1Done && sec2Done && sec3Done && sec4Done && agreed && agreed2 && agreed3;

  /* ── Post-submit ── */
  if (submitted) {
    return <PendingDashboard data={{ ...d, iban: ibanRaw, activeDays }} onApprove={() => onDone && onDone({ ...d, iban: ibanRaw, activeDays })} />;
  }

  const pw = d.password || "";
  const strength = pwStrength(pw);

  return (
    <div style={{ minHeight: "100svh", background: T.bg }}>

      {/* ── Sticky Header ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: `${T.bg}F0`, backdropFilter: "blur(24px)",
        borderBottom: `1px solid ${T.border}`,
      }}>
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
          {/* Logo mark */}
          <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
            <div style={{ width: 5, height: 32, background: T.maroon, borderRadius: "4px 0 0 4px" }} />
            <div style={{ width: 2, height: 32, background: "#2a2a2a" }} />
            <div style={{ width: 32, height: 32, background: T.surf, borderRadius: "0 10px 10px 0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🏷️</div>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 900, fontSize: 16, color: T.text, lineHeight: 1 }}>وِجهة</p>
            <p style={{ fontSize: 10, color: T.maroon, fontWeight: 700, marginTop: 1 }}>تسجيل شريك جديد</p>
          </div>
          {/* Progress dots */}
          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            {[sec1Done, sec2Done, sec3Done, sec4Done].map((done, i) => (
              <div key={i} style={{ width: done ? 18 : 8, height: 8, borderRadius: 99, background: done ? T.green : T.border, transition: "all .4s cubic-bezier(.34,1.56,.64,1)" }} />
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, background: T.border }}>
          <div style={{
            height: "100%", borderRadius: 99, transition: "width .6s cubic-bezier(.22,1,.36,1)",
            background: `linear-gradient(90deg, ${T.maroon}, ${T.gold})`,
            width: `${([sec1Done, sec2Done, sec3Done, sec4Done].filter(Boolean).length / 4) * 100}%`,
          }} />
        </div>
      </header>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "24px 16px 120px" }}>

        {/* ── Hero ── */}
        <div className="fu" style={{ textAlign: "center", marginBottom: 28, padding: "10px 0" }}>
          <p style={{ fontSize: 42, marginBottom: 8 }}>🇶🇦</p>
          <h1 style={{ fontWeight: 900, fontSize: 24, color: T.text, marginBottom: 6 }}>انضم إلى وِجهة</h1>
          <p style={{ fontSize: 14, color: T.mid, lineHeight: 1.8, maxWidth: 340, margin: "0 auto" }}>
            أضف متجرك وابدأ في جذب العملاء الفعليين بكوبونات حصرية<br />
            <strong style={{ color: T.gold }}>10% فقط</strong> على الكوبونات المدفوعة — بدون رسوم مخفية
          </p>
          {/* Quick stats */}
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 16 }}>
            {[["🏪","500+","متجر شريك"],["🎫","50K+","كوبون شهرياً"],["⭐","4.9","تقييم التجار"]].map(([ic,n,l]) => (
              <div key={l} style={{ background: T.surf, borderRadius: 14, padding: "10px 14px", border: `1px solid ${T.border}`, flex: 1 }}>
                <p style={{ fontSize: 20 }}>{ic}</p>
                <p style={{ fontWeight: 900, fontSize: 16, color: T.text }}>{n}</p>
                <p style={{ fontSize: 10, color: T.dim }}>{l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════
            § 1 — معلومات المتجر
        ══════════════════════════════════════════ */}
        <SectionCard id="sec1" icon="🏪" title="معلومات المتجر" subtitle="ما يظهر للعملاء في التطبيق" done={!!sec1Done}>

          {/* Store photo */}
          <DocUploader
            label="صورة المتجر / الشعار"
            hint="اختياري — تزيد ثقة العملاء"
            value={d.storeImg}
            onChange={v => set("storeImg", v)}
            uploading={uploadingKey === "storeImg"}
            onUpload={f => handleUpload(f, "storeImg")}
          />

          <div id="field-storeName">
            <Field label="اسم المتجر" required error={errors.storeName}>
              <input className="inp" value={d.storeName} onChange={e => set("storeName", e.target.value)}
                placeholder="مطعم الدوحة الملكي" style={inp} />
            </Field>
          </div>

          <div id="field-ownerName">
            <Field label="اسم المالك / المدير" required error={errors.ownerName}>
              <input className="inp" value={d.ownerName} onChange={e => set("ownerName", e.target.value)}
                placeholder="الاسم الكامل" style={inp} />
            </Field>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div id="field-phone">
              <Field label="رقم الجوال" required error={errors.phone}>
                <div style={{ display: "flex", background: T.card, borderRadius: 13, border: `1.5px solid ${errors.phone ? T.red : T.border}`, overflow: "hidden" }}>
                  <span style={{ padding: "12px 10px", color: T.mid, fontSize: 12, fontWeight: 700, borderLeft: `1px solid ${T.border}`, flexShrink: 0, whiteSpace: "nowrap" }}>🇶🇦 +974</span>
                  <input className="inp" type="tel" value={d.phone} maxLength={8}
                    onChange={e => set("phone", e.target.value.replace(/\D/g,""))}
                    placeholder="5xxx xxxx"
                    style={{ ...inp, border: "none", borderRadius: 0, paddingRight: 10 }} />
                </div>
              </Field>
            </div>
            <div id="field-city">
              <Field label="المدينة" required error={errors.city}>
                <select className="inp" value={d.city} onChange={e => set("city", e.target.value)}
                  style={{ ...inp, appearance: "none" }}>
                  <option value="">اختر...</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
            </div>
          </div>

          <div id="field-email">
            <Field label="البريد الإلكتروني" required error={errors.email}>
              <input className="inp" type="email" value={d.email} onChange={e => set("email", e.target.value)}
                placeholder="store@example.com" style={{ ...inp, direction: "ltr" }} />
            </Field>
          </div>

          <div id="field-cat">
            <Field label="نشاط المتجر" required error={errors.cat}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {CATS.map(cat => (
                  <button key={cat} className="tap" onClick={() => { set("cat", cat); setErrors(e => ({ ...e, cat: null })); }}
                    style={{
                      padding: "11px 12px", borderRadius: 13, textAlign: "right",
                      border: `1.5px solid ${d.cat === cat ? T.maroon : T.border}`,
                      background: d.cat === cat ? `${T.maroon}18` : T.card,
                      color: d.cat === cat ? T.maroon : T.mid,
                      fontWeight: d.cat === cat ? 800 : 600, fontSize: 13, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 8, transition: "all .15s",
                    }}>
                    <span style={{ fontSize: 20 }}>{cat.split(" ")[0]}</span>
                    <span style={{ flex: 1 }}>{cat.split(" ").slice(1).join(" ")}</span>
                    {d.cat === cat && <span style={{ fontSize: 14 }}>✓</span>}
                  </button>
                ))}
              </div>
              {errors.cat && <p style={{ fontSize: 11, color: T.red, marginTop: 5, fontWeight: 700 }}>⚠ {errors.cat}</p>}
            </Field>
          </div>

          <Field label="وصف المتجر" hint="يظهر للعملاء (اختياري)">
            <textarea className="inp" value={d.storeDesc}
              onChange={e => set("storeDesc", e.target.value.slice(0, 120))}
              placeholder="وصف قصير يشرح تميّز متجرك وما تقدمه..." rows={3}
              style={{ ...inp, resize: "none", lineHeight: 1.7 }} />
            <p style={{ fontSize: 10, color: T.dim, textAlign: "left", marginTop: 3 }}>{(d.storeDesc||"").length}/120</p>
          </Field>

          {/* Working hours */}
          <Field label="ساعات العمل">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 11, color: T.dim, display: "block", marginBottom: 5 }}>يفتح</label>
                <input className="inp" type="time" value={d.openTime} onChange={e => set("openTime", e.target.value)} style={inp} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: T.dim, display: "block", marginBottom: 5 }}>يغلق</label>
                <input className="inp" type="time" value={d.closeTime} onChange={e => set("closeTime", e.target.value)} style={inp} />
              </div>
            </div>
            {/* Active days */}
            <label style={{ fontSize: 11, color: T.dim, display: "block", marginBottom: 7 }}>أيام العمل</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {DAYS.map(day => {
                const on = activeDays.includes(day);
                return (
                  <button key={day} className="tap" onClick={() => setActiveDays(p => on ? p.filter(d => d !== day) : [...p, day])}
                    style={{
                      padding: "7px 12px", borderRadius: 99, fontSize: 12, cursor: "pointer",
                      border: `1.5px solid ${on ? T.maroon : T.border}`,
                      background: on ? `${T.maroon}18` : T.card,
                      color: on ? T.maroon : T.mid, fontWeight: on ? 800 : 600,
                      transition: "all .15s",
                    }}>{day}</button>
                );
              })}
            </div>
          </Field>

          {/* Number of branches */}
          <Field label="عدد الفروع">
            <div style={{ display: "flex", gap: 8 }}>
              {["1", "2", "3", "4+"].map(n => (
                <button key={n} className="tap" onClick={() => set("branches", n)} style={{
                  flex: 1, padding: "11px", borderRadius: 13,
                  border: `1.5px solid ${d.branches === n ? T.maroon : T.border}`,
                  background: d.branches === n ? `${T.maroon}18` : T.card,
                  color: d.branches === n ? T.maroon : T.mid,
                  fontWeight: 800, fontSize: 15, cursor: "pointer", transition: "all .15s",
                }}>{n}</button>
              ))}
            </div>
          </Field>

          <Field label="رابط الموقع على الخريطة" hint="Google Maps — اختياري">
            <input className="inp" value={d.mapsUrl} onChange={e => set("mapsUrl", e.target.value)}
              placeholder="https://maps.google.com/..." style={{ ...inp, direction: "ltr", fontSize: 12 }} />
          </Field>

          <Field label="العنوان التفصيلي" hint="اختياري">
            <input className="inp" value={d.address} onChange={e => set("address", e.target.value)}
              placeholder="اسم الشارع — المنطقة — المبنى — الطابق" style={inp} />
          </Field>

          <Field label="قنوات التواصل الاجتماعي" hint="اختياري">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[["instagram","📸 Instagram","@username"],["tiktok","🎵 TikTok","@username"],["whatsapp","📱 واتساب تجاري","974xxxxxxxx"]].map(([k, label, ph]) => (
                <div key={k} style={{ display: "flex", gap: 0, alignItems: "center", background: T.card, borderRadius: 13, border: `1.5px solid ${T.border}`, overflow: "hidden" }}>
                  <span style={{ padding: "11px 12px", fontSize: 13, color: T.mid, fontWeight: 700, borderLeft: `1px solid ${T.border}`, flexShrink: 0 }}>{label}</span>
                  <input className="inp" value={d[k] || ""} onChange={e => set(k, e.target.value)}
                    placeholder={ph} style={{ ...inp, border: "none", borderRadius: 0, direction: "ltr" }} />
                </div>
              ))}
            </div>
          </Field>
        </SectionCard>

        {/* ══════════════════════════════════════════
            § 2 — السجل التجاري
        ══════════════════════════════════════════ */}
        <SectionCard id="sec2" icon="📋" title="السجل التجاري والرخصة" subtitle="للتحقق من هوية المتجر — مطلوب" done={!!sec2Done}>

          <div style={{ background: `${T.gold}12`, borderRadius: 13, padding: "10px 14px", border: `1px solid ${T.gold}33`, marginBottom: 16 }}>
            <p style={{ fontSize: 11, color: T.gold, fontWeight: 700 }}>🔒 بياناتك آمنة — تُستخدم للتحقق فقط ولا تُشارك مع أي طرف ثالث</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div id="field-crNumber">
              <Field label="رقم السجل التجاري" required error={errors.crNumber}>
                <input className="inp" value={d.crNumber} onChange={e => set("crNumber", e.target.value)}
                  placeholder="XXXXXXXXXX" style={{ ...inp, direction: "ltr", letterSpacing: 1.5 }} />
              </Field>
            </div>
            <div id="field-crExpiry">
              <Field label="تاريخ انتهاء السجل" required error={errors.crExpiry}>
                <input className="inp" type="date" value={d.crExpiry} onChange={e => set("crExpiry", e.target.value)} style={inp} />
              </Field>
            </div>
          </div>

          <DocUploader
            label="📸 صورة السجل التجاري"
            hint="يُسرّع عملية المراجعة"
            value={d.crImg}
            onChange={v => set("crImg", v)}
            uploading={uploadingKey === "crImg"}
            onUpload={f => handleUpload(f, "crImg")}
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div id="field-licNumber">
              <Field label="رقم رخصة البلدية" required error={errors.licNumber}>
                <input className="inp" value={d.licNumber} onChange={e => set("licNumber", e.target.value)}
                  placeholder="LIC-XXXXXX" style={{ ...inp, direction: "ltr" }} />
              </Field>
            </div>
            <Field label="تاريخ انتهاء الرخصة">
              <input className="inp" type="date" value={d.licExpiry} onChange={e => set("licExpiry", e.target.value)} style={inp} />
            </Field>
          </div>

          <DocUploader
            label="📸 صورة رخصة البلدية"
            hint="اختياري"
            value={d.licImg}
            onChange={v => set("licImg", v)}
            uploading={uploadingKey === "licImg"}
            onUpload={f => handleUpload(f, "licImg")}
          />

          {/* Tax number - Qatar specific */}
          <Field label="الرقم الضريبي (TIN)" hint="إن وُجد">
            <input className="inp" value={d.taxNumber || ""} onChange={e => set("taxNumber", e.target.value)}
              placeholder="رقم التسجيل الضريبي" style={{ ...inp, direction: "ltr" }} />
          </Field>
        </SectionCard>

        {/* ══════════════════════════════════════════
            § 3 — الحساب البنكي
        ══════════════════════════════════════════ */}
        <SectionCard id="sec3" icon="🏦" title="الحساب البنكي" subtitle="لاستلام تحويلاتك الشهرية من وِجهة" done={!!sec3Done}>

          <div style={{ background: `${T.green}10`, borderRadius: 13, padding: "12px 14px", border: `1px solid ${T.green}22`, marginBottom: 16 }}>
            <p style={{ fontSize: 12, color: T.green, fontWeight: 800, marginBottom: 5 }}>💰 كيف يتم التحويل؟</p>
            <p style={{ fontSize: 12, color: T.mid, lineHeight: 1.8 }}>
              • وِجهة تحتجز <strong style={{ color: T.gold }}>10%</strong> من كل كوبون (مدفوع أو مجاني)<br />
              • التحويل <strong style={{ color: T.text }}>بطلب منك</strong> عبر لوحة التحكم — On Demand<br />
              • الحد الأدنى للسحب: <strong style={{ color: T.text }}>20 ر.ق</strong> · الطلب قبل منتصف الليل<br />
              • التحويل للـ IBAN المسجّل خلال <strong style={{ color: T.text }}>يوم عمل واحد</strong>
            </p>
          </div>

          <div id="field-bankName">
            <Field label="البنك" required error={errors.bankName}>
              <select className="inp" value={d.bankName} onChange={e => { set("bankName", e.target.value); setErrors(err => ({ ...err, bankName: null })); }}
                style={{ ...inp, appearance: "none" }}>
                <option value="">اختر البنك...</option>
                {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </Field>
          </div>

          <div id="field-accountName">
            <Field label="اسم صاحب الحساب" required hint="كما في البطاقة المصرفية" error={errors.accountName}>
              <input className="inp" value={d.accountName} onChange={e => set("accountName", e.target.value)}
                placeholder="Full Name / الاسم الكامل" style={inp} />
            </Field>
          </div>

          <div id="field-iban">
            <Field label="رقم IBAN" required hint="QA + 27 رقم = 29 حرفاً" error={errors.iban}>
              <div style={{ position: "relative" }}>
                <input className="inp" value={ibanRaw}
                  onChange={e => {
                    const v = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
                    setIbanRaw(v);
                    set("iban", v);
                    setErrors(err => ({ ...err, iban: null }));
                  }}
                  placeholder="QA57CITI00001077711110111111" maxLength={29}
                  style={{
                    ...inp, direction: "ltr", letterSpacing: 2,
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 13,
                    paddingLeft: 46,
                    borderColor: ibanRaw ? (ibanValid(ibanRaw) ? T.green : T.red + "88") : T.border,
                  }} />
                <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 15 }}>
                  {ibanRaw ? (ibanValid(ibanRaw) ? "✅" : "❌") : "🏦"}
                </div>
              </div>
              {ibanRaw && (
                <p style={{ fontSize: 11, marginTop: 5, direction: "ltr", fontFamily: "monospace", fontWeight: 700, color: ibanValid(ibanRaw) ? T.green : T.gold }}>
                  {ibanValid(ibanRaw) ? "✓ IBAN صالح" : `${ibanRaw.length}/29 — ${29 - ibanRaw.length} حرف متبقٍ`}
                </p>
              )}
            </Field>
          </div>

          <Field label="رقم الحساب البنكي" hint="اختياري">
            <input className="inp" value={d.accountNumber} onChange={e => set("accountNumber", e.target.value)}
              placeholder="رقم الحساب" style={{ ...inp, direction: "ltr" }} />
          </Field>

          <div style={{ background: `${T.maroon}10`, borderRadius: 13, padding: "10px 14px", border: `1px solid ${T.maroon}22`, marginTop: 4 }}>
            <p style={{ fontSize: 11, color: T.maroon, fontWeight: 700 }}>
              🔐 IBAN مشفّر بـ AES-256 • لا يمكن تعديله بعد الاعتماد إلا بطلب رسمي
            </p>
          </div>
        </SectionCard>

        {/* ══════════════════════════════════════════
            § 4 — كلمة المرور
        ══════════════════════════════════════════ */}
        <SectionCard id="sec4" icon="🔐" title="كلمة المرور والأمان" subtitle="لتأمين حساب متجرك على وِجهة" done={!!sec4Done}>

          <div id="field-password">
            <Field label="كلمة المرور" required hint="8 أحرف على الأقل" error={errors.password}>
              <div style={{ position: "relative" }}>
                <input className="inp" type={showPw ? "text" : "password"} value={pw}
                  onChange={e => { set("password", e.target.value); setErrors(err => ({ ...err, password: null })); }}
                  placeholder="أدخل كلمة المرور" style={{ ...inp, paddingLeft: 48, direction: "ltr" }} />
                <button type="button" onClick={() => setShowPw(s => !s)}
                  style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: T.mid, fontSize: 18 }}>
                  {showPw ? "🙈" : "👁️"}
                </button>
              </div>
              {pw && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{ flex: 1, height: 4, borderRadius: 99, transition: "background .3s", background: i <= strength ? PW_COLORS[strength] : T.border }} />
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
                    <span style={{ fontSize: 11, color: PW_COLORS[strength], fontWeight: 700 }}>{PW_LABELS[strength]}</span>
                    <span style={{ fontSize: 10, color: T.dim }}>
                      {!/[A-Z]/.test(pw) && "أضف حرفاً كبيراً • "}
                      {!/[0-9]/.test(pw) && "أضف رقماً"}
                    </span>
                  </div>
                </div>
              )}
            </Field>
          </div>

          <div id="field-password2">
            <Field label="تأكيد كلمة المرور" required error={errors.password2}>
              <div style={{ position: "relative" }}>
                <input className="inp" type={showPw2 ? "text" : "password"} value={d.password2 || ""}
                  onChange={e => { set("password2", e.target.value); setErrors(err => ({ ...err, password2: null })); }}
                  placeholder="أعد كتابة كلمة المرور" style={{
                    ...inp, paddingLeft: 48, direction: "ltr",
                    borderColor: d.password2 ? (pw === d.password2 ? T.green : T.red + "88") : T.border,
                  }} />
                <button type="button" onClick={() => setShowPw2(s => !s)}
                  style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: T.mid, fontSize: 18 }}>
                  {showPw2 ? "🙈" : "👁️"}
                </button>
              </div>
              {d.password2 && (
                <p style={{ fontSize: 11, marginTop: 5, fontWeight: 700, color: pw === d.password2 ? T.green : T.red }}>
                  {pw === d.password2 ? "✓ كلمتا المرور متطابقتان" : "✕ غير متطابقتين"}
                </p>
              )}
            </Field>
          </div>
        </SectionCard>

        {/* ══════════════════════════════════════════
            § 5 — الشروط والأحكام القانونية
        ══════════════════════════════════════════ */}
        <div className="fu" style={{ background: T.surf, borderRadius: 22, border: `1px solid ${T.border}`, overflow: "hidden", marginBottom: 16 }}>
          {/* Header */}
          <div style={{ padding: "18px 20px 14px", borderBottom: `1px solid ${T.border}`, background: `${T.maroon}10`, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 13, background: `${T.maroon}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>📜</div>
            <div>
              <p style={{ fontWeight: 900, fontSize: 15, color: T.text }}>اتفاقية شراكة التاجر</p>
              <p style={{ fontSize: 11, color: T.mid, marginTop: 2 }}>يُرجى القراءة الكاملة والموافقة قبل الإرسال — ملزمة قانونياً</p>
            </div>
            <span style={{ fontSize: 10, background: `${T.gold}18`, color: T.gold, borderRadius: 99, padding: "3px 10px", fontWeight: 800, flexShrink: 0 }}>إصدار 2.1 — 2026</span>
          </div>

          {/* T&C Scrollable Box */}
          <div style={{ padding: "18px 20px" }}>
            <div style={{
              background: T.card, borderRadius: 16, border: `1px solid ${T.border}`,
              padding: "18px 20px", maxHeight: 420, overflowY: "auto",
              fontSize: 12.5, color: T.mid, lineHeight: 2,
            }}>

              {/* Title */}
              <p style={{ fontWeight: 900, fontSize: 14, color: T.text, textAlign: "center", marginBottom: 4 }}>اتفاقية تقديم خدمات ومبيعات إلكترونية</p>
              <div style={{ height: 1, background: T.border, margin: "10px 0 14px" }} />

              {/* Preamble */}
              <p style={{ fontWeight: 900, fontSize: 13, color: T.text, marginBottom: 6 }}>مقدمة وتعريفات</p>
              <p style={{ marginBottom: 6 }}>
                أُبرمت هذه الاتفاقية <strong style={{ color: T.text }}>("الاتفاقية")</strong> في دولة قطر بين كل من:
              </p>
              <div style={{ background: `${T.maroon}10`, borderRadius: 10, padding: "10px 14px", border: `1px solid ${T.maroon}22`, marginBottom: 10 }}>
                <p style={{ marginBottom: 6 }}>
                  <strong style={{ color: T.text }}>1. شركة وِجهة القطرية للتقنية ذ.م.م</strong> <span style={{ color: T.gold }}>("وِجهة")</span>، مسجلة بالسجل التجاري رقم <strong style={{ color: T.text }}>QA-2024-00777</strong>، ومقرها مدينة لوسيل – الدوحة. <span style={{ color: T.dim }}>(طرف أول)</span>
                </p>
                <p>
                  <strong style={{ color: T.text }}>2. التاجر المسجل</strong> <span style={{ color: T.gold }}>("التاجر")</span>، وهو الكيان التجاري الذي تمت الموافقة على طلب انضمامه للمنصة. <span style={{ color: T.dim }}>(طرف ثاني)</span>
                </p>
              </div>
              <p style={{ marginBottom: 14 }}>
                <strong style={{ color: T.gold }}>تمهيد:</strong> حيث أن "وِجهة" تمتلك منصة إلكترونية لتسويق وبيع الكوبونات والعروض، ورغب التاجر في عرض خدماته عبرها، فقد اتفق الطرفان على ما يلي:
              </p>

              {/* Article 1 - Commission */}
              <p style={{ fontWeight: 900, fontSize: 13, color: T.maroon, marginBottom: 6 }}>المادة الأولى: العمولة والنسب المالية</p>
              <div style={{ background: `${T.maroon}14`, borderRadius: 12, padding: "14px 16px", border: `1.5px solid ${T.maroon}44`, marginBottom: 14 }}>
                <p style={{ fontWeight: 900, color: T.text, fontSize: 12, marginBottom: 10 }}>⚖️ آلية احتساب عمولة وِجهة</p>
                <p style={{ marginBottom: 8 }}>
                  <strong style={{ color: T.gold }}>1.1 العمولة الثابتة:</strong> يوافق التاجر على منح "وِجهة" عمولة قدرها <strong style={{ color: T.gold, fontSize: 14 }}>10% (عشرة بالمئة)</strong> من القيمة الإجمالية لكل كوبون يتم بيعه أو استخدامه عبر المنصة.
                </p>
                <p style={{ marginBottom: 8, background: `${T.red}12`, borderRadius: 8, padding: "8px 10px" }}>
                  <strong style={{ color: T.red }}>1.2 الكوبونات المجانية (بند خاص):</strong> تخضع الكوبونات المجانية (بقيمة صفر ريال) لذات نسبة العمولة <strong style={{ color: T.gold }}>(10%)</strong>، وتُحتسب بناءً على القيمة السوقية الفعلية للخدمة كما هي محددة في <strong style={{ color: T.text }}>"قائمة أسعار التاجر"</strong> المعتمدة لدى وِجهة وقت إصدار الكوبون.
                </p>
                <p>
                  <strong style={{ color: T.green }}>1.3 الضرائب:</strong> تخضع هذه الاتفاقية للتشريعات الضريبية النافذة في دولة قطر. وفي حال تطبيق ضريبة القيمة المضافة (VAT) أو أي ضرائب/رسوم حكومية مستقبلاً، تضاف قيمة الضريبة إلى عمولة "وِجهة" المستحقة، ويتم تحصيلها وفقاً للقانون.
                </p>
              </div>

              {/* Article 2 - Settlement */}
              <p style={{ fontWeight: 900, fontSize: 13, color: T.maroon, marginBottom: 6 }}>المادة الثانية: آلية التسوية والتحويل المالي (نظام الموازنة)</p>
              <div style={{ background: `${T.green}0C`, borderRadius: 12, padding: "14px 16px", border: `1px solid ${T.green}22`, marginBottom: 14 }}>
                <p style={{ fontWeight: 900, color: T.text, fontSize: 12, marginBottom: 10 }}>💳 آلية دفع مستحقات التاجر</p>
                {[
                  ["🏦 2.1 آلية الطلب", "تتم تسوية المبالغ المستحقة للتاجر (صافي المبيعات بعد خصم العمولة) بناءً على طلبه عبر لوحة تحكم التاجر."],
                  ["⏰ 2.2 دورة المعالجة", "يلتزم التاجر بـ \"رفع الموازنة\" وطلب التحويل عبر لوحة التحكم قبل الساعة 12:00 مساءً (منتصف الليل) لضمان معالجة الطلب وإدراجه ضمن حوالات يوم العمل التالي."],
                  ["💰 2.3 الحد الأدنى", "يجب أن يبلغ رصيد التاجر القابل للسحب 20 ريال قطري كحد أدنى؛ وما دون ذلك يظل رصيداً مدوراً في حسابه."],
                  ["⚠️ 2.4 بيانات التحويل", "يتحمل التاجر المسؤولية القانونية الكاملة عن صحة رقم الـ IBAN المزود؛ وفي حال فشل التحويل لخطأ في البيانات، يُعلّق الرصيد 7 أيام عمل للتصحيح، ولا تتحمل وِجهة أي رسوم ناتجة عن ذلك."],
                  ["🏛️ 2.5 الرسوم البنكية", "يتحمل التاجر أي رسوم تحويل تفرضها البنوك (Inter-bank fees) عند التحويل من حساب وِجهة إلى بنك التاجر."],
                ].map(([t, desc]) => (
                  <div key={t} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: `1px solid ${T.border}` }}>
                    <p style={{ fontWeight: 800, color: T.text, fontSize: 12, marginBottom: 3 }}>{t}</p>
                    <p style={{ fontSize: 12, color: T.mid }}>{desc}</p>
                  </div>
                ))}
                <div style={{ background: `${T.gold}10`, borderRadius: 9, padding: "9px 12px", marginTop: 4 }}>
                  <p style={{ fontSize: 11.5, color: T.mid, lineHeight: 1.8 }}>
                    🔁 <strong style={{ color: T.gold }}>طرق التحويل المعتمدة:</strong> IBAN بنكي مباشر · QPAY القطرية · حوالة QNB/CBQ · رصيد منصة وِجهة<br />
                    📄 تصدر كشوف حساب تفصيلية إلكترونياً مع كل عملية دفع
                  </p>
                </div>
              </div>

              {/* Article 3 - Obligations */}
              <p style={{ fontWeight: 900, fontSize: 13, color: T.maroon, marginBottom: 6 }}>المادة الثالثة: الالتزامات التشغيلية وحماية المستهلك</p>
              <p style={{ marginBottom: 6 }}>
                <strong style={{ color: T.text }}>3.1</strong> يلتزم التاجر بقبول الكوبونات الصادرة عن المنصة وتقديم الخدمة/المنتج للعملاء بأفضل جودة ودون أي تمييز أو اشتراطات إضافية غير مذكورة في العرض.
              </p>
              <p style={{ marginBottom: 6 }}>
                <strong style={{ color: T.text }}>3.2</strong> <strong style={{ color: T.red }}>المسؤولية القانونية:</strong> يقر التاجر بأنه المسؤول الوحيد عن جودة السلع أو الخدمات ومطابقتها للمواصفات والقوانين القطرية (بما فيها قوانين حماية المستهلك والبلدية). وتخلي "وِجهة" مسؤوليتها من أي مطالبات تعويض يرفعها العملاء نتيجة سوء الخدمة.
              </p>
              <p style={{ marginBottom: 14 }}>
                <strong style={{ color: T.text }}>3.3</strong> يحق لـ "وِجهة" إيقاف حساب التاجر فوراً في حال تكرار شكاوى العملاء أو الإساءة لسمعة المنصة.
              </p>

              {/* Article 4 - Amendment & Termination */}
              <p style={{ fontWeight: 900, fontSize: 13, color: T.maroon, marginBottom: 6 }}>المادة الرابعة: التعديل والإنهاء</p>
              <p style={{ marginBottom: 6 }}>
                <strong style={{ color: T.text }}>4.1</strong> يحق لـ "وِجهة" تعديل نسبة العمولة أو شروط الاتفاقية بإخطار التاجر قبل <strong style={{ color: T.text }}>30 يوماً</strong> عبر الوسائل الإلكترونية المعتمدة (واتساب/بريد إلكتروني).
              </p>
              <p style={{ marginBottom: 6 }}>
                <strong style={{ color: T.text }}>4.2</strong> يحق لأي من الطرفين إنهاء الاتفاقية بإخطار خطي مدته <strong style={{ color: T.text }}>14 يوماً</strong>.
              </p>
              <p style={{ marginBottom: 14 }}>
                <strong style={{ color: T.text }}>4.3</strong> عند الإنهاء، تلتزم الأطراف بالوفاء بالكوبونات التي تم بيعها للعملاء قبل تاريخ الإنهاء، وتتم التسوية المالية النهائية خلال <strong style={{ color: T.text }}>30 يوماً</strong> من تاريخ الإغلاق الفعلي للحساب.
              </p>

              {/* Article 5 - Confidentiality */}
              <p style={{ fontWeight: 900, fontSize: 13, color: T.maroon, marginBottom: 6 }}>المادة الخامسة: السرية والقانون الواجب التطبيق</p>
              <p style={{ marginBottom: 6 }}>
                <strong style={{ color: T.text }}>5.1</strong> تلتزم "وِجهة" بحماية بيانات التاجر وفق <strong style={{ color: T.text }}>قانون حماية البيانات الشخصية القطري رقم (13) لسنة 2016</strong>.
              </p>
              <p style={{ marginBottom: 14 }}>
                <strong style={{ color: T.text }}>5.2</strong> تخضع هذه الاتفاقية للقوانين والأنظمة المعمول بها في دولة قطر، وتختص <strong style={{ color: T.text }}>محاكم الدوحة</strong> بالفصل في أي نزاع ينشأ عنها.
              </p>

              {/* Article 6 - Electronic Signature */}
              <p style={{ fontWeight: 900, fontSize: 13, color: T.maroon, marginBottom: 6 }}>المادة السادسة: الحجية القانونية للتوقيع الإلكتروني</p>
              <p style={{ marginBottom: 6 }}>
                <strong style={{ color: T.text }}>6.1</strong> تُعد هذه الاتفاقية عقداً إلكترونياً ملزماً بموجب <strong style={{ color: T.text }}>قانون المعاملات الإلكترونية القطري رقم (16) لسنة 2010</strong>.
              </p>
              <p style={{ marginBottom: 6 }}>
                <strong style={{ color: T.text }}>6.2</strong> يعتبر ضغط التاجر على زر <strong style={{ color: T.gold }}>"إرسال طلب التسجيل"</strong> أو <strong style={{ color: T.gold }}>"موافق"</strong> بمثابة <strong style={{ color: T.text }}>توقيع إلكتروني نهائي</strong> وقبول بكافة البنود الواردة أعلاه، وتقوم مقام التوقيع الخطي. <strong style={{ color: T.text }}>تُرسل نسخة من هذه الاتفاقية الموقّعة إلى عنوان البريد الإلكتروني ورقم واتساب المسجّلَين فور اعتماد الطلب.</strong>
              </p>

              <div style={{ background: T.border, height: 1, margin: "14px 0" }} />
              <p style={{ fontSize: 11, color: T.dim, textAlign: "center" }}>
                شركة وِجهة القطرية للتقنية ذ.م.م · CR: QA-2024-00777 · لوسيل، الدوحة، قطر<br />
                البريد القانوني: legal@wejha.qa · هاتف: 4000 4474 974+
              </p>
            </div>
          </div>

          {/* Payment Methods Summary Card */}
          <div style={{ padding: "0 20px 18px" }}>
            <div style={{ background: `${T.green}08`, borderRadius: 14, padding: "14px 16px", border: `1px solid ${T.green}22` }}>
              <p style={{ fontWeight: 900, fontSize: 12, color: T.green, marginBottom: 10 }}>💰 ملخص المستحقات المالية</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  ["العمولة على الكوبون المدفوع",   "10% من قيمة الكوبون",     T.gold],
                  ["العمولة على الكوبون المجاني",   "10% من القيمة السوقية",   T.gold],
                  ["آلية الدفع",                    "بطلب من التاجر (On-demand)", T.green],
                  ["الحد الأدنى للسحب",             "20 ريال قطري",            T.green],
                  ["طريقة التحويل الافتراضية",      "IBAN البنك المسجّل",       T.blue],
                  ["الضريبة (VAT) إن طُبّقت",       "تُضاف على العمولة وفق القانون", T.mid],
                ].map(([k, v, c]) => (
                  <div key={k} style={{ background: T.card, borderRadius: 10, padding: "9px 11px" }}>
                    <p style={{ fontSize: 10, color: T.dim, marginBottom: 3 }}>{k}</p>
                    <p style={{ fontSize: 12, fontWeight: 800, color: c }}>{v}</p>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 10, color: T.dim, marginTop: 10 }}>
                * القيمة السوقية: محددة في "قائمة أسعار التاجر" المعتمدة لدى وِجهة وقت إصدار الكوبون
              </p>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            § 6 — الموافقة الإلزامية والإرسال
        ══════════════════════════════════════════ */}
        {/* ══════════════════════════════════════════
            § 6b — اتفاقية الشراكة القانونية الكاملة
        ══════════════════════════════════════════ */}
        <div className="fu" style={{ background: T.surf, borderRadius: 22, border: `1.5px solid ${T.gold}44`, padding: "22px 20px", marginBottom: 14 }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, paddingBottom: 14, borderBottom: `1px solid ${T.border}` }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${T.gold}18`, border: `1.5px solid ${T.gold}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>⚖️</div>
            <div>
              <p style={{ fontWeight: 900, fontSize: 16, color: T.text }}>اتفاقية شراكة التاجر — وِجهة</p>
              <p style={{ fontSize: 11, color: T.dim, marginTop: 2 }}>يُرجى قراءة الاتفاقية كاملةً قبل الإرسال · الإصدار 2.0 — مارس 2026 · دولة قطر</p>
            </div>
          </div>

          {/* Scrollable terms box */}
          <div style={{ background: T.card, borderRadius: 14, border: `1px solid ${T.border}`, padding: "18px 16px", maxHeight: 420, overflowY: "auto", fontSize: 12, lineHeight: 1.9, color: T.mid, marginBottom: 18 }}>

            {/* Intro */}
            <p style={{ fontSize: 13, fontWeight: 800, color: T.text, marginBottom: 6 }}>مقدمة وتعريفات</p>
            <p style={{ marginBottom: 12 }}>
              هذه الاتفاقية ("الاتفاقية") مُبرمة بين <strong style={{ color: T.text }}>شركة وِجهة القطرية للتقنية ذ.م.م</strong> ("وِجهة")، المسجّلة في دولة قطر تحت السجل التجاري رقم QA-2024-00777، ومقرها الدوحة — مدينة لوسيل، من جهة أولى، وبين التاجر المسجّل ("التاجر") من جهة ثانية. تسري هذه الاتفاقية اعتباراً من تاريخ اعتماد طلب التسجيل.
            </p>

            {/* Article 1 */}
            <p style={{ fontSize: 13, fontWeight: 800, color: T.maroon, marginBottom: 4 }}>المادة الأولى — العمولة والنسب المالية</p>
            <div style={{ background: `${T.maroon}08`, borderRadius: 10, padding: "12px 14px", border: `1px solid ${T.maroon}22`, marginBottom: 12 }}>
              <p style={{ marginBottom: 6 }}>
                <strong style={{ color: T.text }}>1.1</strong> يوافق التاجر على منح وِجهة عمولةً قدرها <strong style={{ color: T.maroon, fontSize: 14 }}>10% (عشرة بالمئة)</strong> محسوبةً على القيمة الإجمالية لكل كوبون يُستخدم عبر المنصة، شاملةً الكوبونات المدفوعة والكوبونات المجانية على حدٍّ سواء، دون استثناء.
              </p>
              <p style={{ marginBottom: 6 }}>
                <strong style={{ color: T.text }}>1.2</strong> يُقرّ التاجر صراحةً بأن <strong style={{ color: T.gold }}>الكوبونات المجانية (صفر ريال)</strong> تخضع لنسبة العمولة ذاتها (10%) محسوبةً على القيمة السوقية الفعلية للكوبون أو الخدمة المُقدَّمة كما تُحدّدها وِجهة باتفاق مسبق مع التاجر.
              </p>
              <p style={{ marginBottom: 6 }}>
                <strong style={{ color: T.text }}>1.3</strong> في حال اختلاف التاجر على قيمة الكوبون المجاني، يُحتكم إلى سعر قائمة التاجر المعتمدة لدى وِجهة، وتكون قرارات وِجهة في هذا الشأن نهائيةً وملزمة.
              </p>
              <p>
                <strong style={{ color: T.text }}>1.4</strong> تُحتسب العمولة شاملةً ضريبة القيمة المضافة (VAT) بنسبة 5% المفروضة بموجب القانون القطري، وتكون العمولة المستحقة لوِجهة هي 10% من صافي قيمة الكوبون شاملاً الضريبة.
              </p>
            </div>

            {/* Article 2 */}
            <p style={{ fontSize: 13, fontWeight: 800, color: T.blue, marginBottom: 4 }}>المادة الثانية — آلية التحويل المالي وسداد العمولات</p>
            <div style={{ background: `${T.blue}08`, borderRadius: 10, padding: "12px 14px", border: `1px solid ${T.blue}22`, marginBottom: 12 }}>
              <p style={{ marginBottom: 6 }}>
                <strong style={{ color: T.text }}>2.1 دورة التحويل الشهري:</strong> تُحوّل وِجهة إلى التاجر صافي المبيعات (بعد خصم العمولة 10%) مرةً واحدة شهرياً، في الفترة بين اليوم الأول والخامس من كل شهر ميلادي، عن الشهر السابق.
              </p>
              <p style={{ marginBottom: 6 }}>
                <strong style={{ color: T.text }}>2.2 الحد الأدنى للتحويل:</strong> يُشترط أن يبلغ رصيد التاجر المستحق <strong style={{ color: T.gold }}>20 ريال قطري</strong> على الأقل لإتمام التحويل؛ وإلا يُرحَّل الرصيد للشهر التالي.
              </p>
              <p style={{ marginBottom: 6 }}>
                <strong style={{ color: T.text }}>2.3 قنوات التحويل:</strong> يتم التحويل عبر حصر البنوك القطرية المدعومة:
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 6 }}>
                {[["QNB","بنك قطر الوطني"],["QIB","بنك قطر الإسلامي"],["Doha Bank","بنك الدوحة"],["CBQ","البنك التجاري القطري"],["Masraf Al Rayan","مصرف الريّان"],["HSBC Qatar","HSBC قطر"],["Al Ahli Bank","البنك الأهلي"],["Barwa Bank","بنك بروة"],["Arab Bank Qatar","البنك العربي"],["QIIB","بنك قطر الدولي الإسلامي"]].map(([code,name]) => (
                  <div key={code} style={{ background: T.surf, borderRadius: 7, padding: "5px 9px", display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ fontSize: 10, color: T.blue, fontWeight: 800 }}>{code}</span>
                    <span style={{ fontSize: 10, color: T.dim }}>{name}</span>
                  </div>
                ))}
              </div>
              <p style={{ marginBottom: 6 }}>
                <strong style={{ color: T.text }}>2.4 IBAN:</strong> يتحمل التاجر مسؤولية صحة رقم الـ IBAN المُقدَّم؛ وفي حال فشل التحويل بسبب بيانات خاطئة، يُعلَّق الرصيد لمدة 7 أيام عمل ريثما يُصحَّح الخطأ، ولا تتحمل وِجهة أي رسوم بنكية ناجمة عن ذلك.
              </p>
              <p>
                <strong style={{ color: T.text }}>2.5 كشف الحساب:</strong> يتلقى التاجر كشف حساب تفصيلياً شهرياً عبر واتساب والبريد الإلكتروني يتضمن: قائمة الكوبونات المستخدمة، قيمة كل كوبون، العمولة المحتسبة، وصافي المبلغ المحوَّل.
              </p>
            </div>

            {/* Article 3 */}
            <p style={{ fontSize: 13, fontWeight: 800, color: T.green, marginBottom: 4 }}>المادة الثالثة — الالتزامات والحقوق</p>
            <div style={{ marginBottom: 12 }}>
              <p style={{ marginBottom: 5 }}><strong style={{ color: T.text }}>3.1</strong> يلتزم التاجر بقبول الكوبونات الصادرة عبر منصة وِجهة ومنح الخصم المُعلَن للعملاء دون تحفظ أو اشتراطات إضافية.</p>
              <p style={{ marginBottom: 5 }}><strong style={{ color: T.text }}>3.2</strong> يحق لوِجهة إزالة أي كوبون أو إيقاف حساب التاجر مؤقتاً في حال وجود شكاوى موثَّقة من العملاء أو مخالفة لشروط الاستخدام.</p>
              <p style={{ marginBottom: 5 }}><strong style={{ color: T.text }}>3.3</strong> يحق للتاجر تعديل قيمة الكوبون أو إيقافه في أي وقت من لوحة التحكم، على أن يُطبَّق التعديل خلال 24 ساعة.</p>
              <p style={{ marginBottom: 5 }}><strong style={{ color: T.text }}>3.4</strong> تحتفظ وِجهة بحق تعديل نسبة العمولة أو الشروط بإشعار مسبق للتاجر لا يقل عن <strong style={{ color: T.gold }}>30 يوماً</strong> عبر واتساب والبريد الإلكتروني.</p>
              <p><strong style={{ color: T.text }}>3.5</strong> في حال عدم قبول التاجر لأي تعديل، يحق له إنهاء الاتفاقية قبل سريان التعديل دون أي غرامة.</p>
            </div>

            {/* Article 4 */}
            <p style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 4 }}>المادة الرابعة — السرية وحماية البيانات</p>
            <div style={{ marginBottom: 12 }}>
              <p style={{ marginBottom: 5 }}><strong style={{ color: T.text }}>4.1</strong> تلتزم وِجهة بحماية البيانات الشخصية للتاجر وفق أحكام قانون حماية البيانات الشخصية القطري رقم (13) لسنة 2016.</p>
              <p style={{ marginBottom: 5 }}><strong style={{ color: T.text }}>4.2</strong> لن تُشارَك البيانات البنكية وبيانات السجل التجاري مع أي طرف ثالث إلا بموجب أمر قضائي أو طلب رسمي من الجهات الحكومية.</p>
              <p><strong style={{ color: T.text }}>4.3</strong> يوافق التاجر على استخدام وِجهة لاسم المتجر وشعاره وعروضه لأغراض الترويج داخل التطبيق وعلى وسائل التواصل الاجتماعي.</p>
            </div>

            {/* Article 5 */}
            <p style={{ fontSize: 13, fontWeight: 800, color: T.maroon, marginBottom: 4 }}>المادة الخامسة — الإنهاء والتسوية</p>
            <div style={{ marginBottom: 12 }}>
              <p style={{ marginBottom: 5 }}><strong style={{ color: T.text }}>5.1</strong> يحق لأي طرف إنهاء هذه الاتفاقية بإشعار خطي مسبق مدته <strong style={{ color: T.gold }}>14 يوماً</strong>.</p>
              <p style={{ marginBottom: 5 }}><strong style={{ color: T.text }}>5.2</strong> عند الإنهاء، تُسوَّى جميع المبالغ المستحقة خلال 30 يوماً، وتُلغى الكوبونات النشطة فوراً.</p>
              <p><strong style={{ color: T.text }}>5.3</strong> تخضع أي نزاعات للقضاء القطري، وتكون محاكم الدوحة الابتدائية هي الجهة المختصة للفصل في النزاعات.</p>
            </div>

            {/* Article 6 */}
            <p style={{ fontSize: 13, fontWeight: 800, color: T.blue, marginBottom: 4 }}>المادة السادسة — الاتفاقية الإلكترونية وتسليم النسخ</p>
            <div style={{ marginBottom: 4 }}>
              <p style={{ marginBottom: 5 }}><strong style={{ color: T.text }}>6.1</strong> تُعدّ هذه الاتفاقية الإلكترونية سارية المفعول وملزمة قانونياً بموجب قانون المعاملات الإلكترونية القطري رقم (16) لسنة 2010.</p>
              <p style={{ marginBottom: 5 }}><strong style={{ color: T.text }}>6.2</strong> فور اعتماد طلب التسجيل، تُرسَل نسخة PDF موقَّعة رقمياً من هذه الاتفاقية عبر:
                <br />&nbsp;&nbsp;• <strong style={{ color: T.green }}>واتساب:</strong> الرقم المسجّل +974 XXXXXXXX
                <br />&nbsp;&nbsp;• <strong style={{ color: T.gold }}>البريد الإلكتروني:</strong> العنوان المسجّل في الطلب
              </p>
              <p><strong style={{ color: T.text }}>6.3</strong> يُعدّ الضغط على زر "إرسال طلب التسجيل" توقيعاً إلكترونياً ملزماً على هذه الاتفاقية، ويقوم مقام التوقيع الخطي وفق القانون القطري المذكور.</p>
            </div>
          </div>

          {/* Terms footer note */}
          <div style={{ background: `${T.gold}10`, borderRadius: 10, padding: "10px 13px", border: `1px solid ${T.gold}33`, marginBottom: 16, display: "flex", alignItems: "flex-start", gap: 8 }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>📜</span>
            <p style={{ fontSize: 11, color: T.gold, fontWeight: 700, lineHeight: 1.7 }}>
              بموجب قانون المعاملات الإلكترونية القطري رقم (16) لسنة 2010، يُعدّ إرسال هذا الطلب وتحديد مربعات الموافقة أدناه توقيعاً إلكترونياً ملزماً قانونياً يُعادل التوقيع الخطي ويُنتج آثاره القانونية الكاملة.
            </p>
          </div>
        </div>

        <div className="fu" style={{ background: T.surf, borderRadius: 22, border: `1px solid ${T.border}`, padding: "22px 20px", marginBottom: 16 }}>
          <p style={{ fontWeight: 900, fontSize: 15, color: T.text, marginBottom: 16 }}>✅ الموافقة الإلزامية والإرسال</p>

          {/* Checkbox 1 — Terms */}
          <div id="field-agreed" style={{ marginBottom: 10 }}>
            <button onClick={() => { setAgreed(a => !a); setErrors(e => ({ ...e, agreed: null })); }}
              style={{ width: "100%", display: "flex", alignItems: "flex-start", gap: 12, background: agreed ? `${T.green}10` : T.card, border: `1.5px solid ${agreed ? T.green + "55" : errors.agreed ? T.red + "66" : T.border}`, borderRadius: 14, padding: "13px 14px", cursor: "pointer", textAlign: "right", transition: "all .2s" }}>
              <div style={{ width: 26, height: 26, borderRadius: 8, border: `2.5px solid ${agreed ? T.green : T.border}`, background: agreed ? T.green : "transparent", flexShrink: 0, marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s", boxShadow: agreed ? `0 0 12px ${T.green}44` : "none" }}>
                {agreed && <span style={{ color: "#fff", fontSize: 16, fontWeight: 900, lineHeight: 1 }}>✓</span>}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, color: agreed ? T.text : T.mid, lineHeight: 1.8, fontWeight: agreed ? 700 : 400 }}>
                  أقرّ بأنني قرأت <strong style={{ color: T.maroon }}>اتفاقية شراكة التاجر — وِجهة (الإصدار 2.0)</strong> كاملةً وأوافق على جميع بنودها، بما فيها <strong style={{ color: T.maroon }}>عمولة 10% على جميع الكوبونات المدفوعة والمجانية</strong>، وآلية التحويل المالي الشهري عبر البنوك القطرية المعتمدة، وأحكام الإنهاء والتسوية.
                </p>
                {!agreed && <p style={{ fontSize: 11, color: T.dim, marginTop: 3 }}>⬆ اضغط للموافقة — إلزامي</p>}
                {agreed && <p style={{ fontSize: 11, color: T.green, marginTop: 3, fontWeight: 700 }}>✅ تمت الموافقة على اتفاقية الشراكة</p>}
              </div>
            </button>
            {errors.agreed && <p style={{ fontSize: 11, color: T.red, marginTop: 6, fontWeight: 700 }}>⚠ {errors.agreed}</p>}
          </div>

          {/* Checkbox 2 — Data accuracy */}
          <div id="field-agreed2" style={{ marginBottom: 10 }}>
            <button onClick={() => { setAgreed2(a => !a); setErrors(e => ({ ...e, agreed2: null })); }}
              style={{ width: "100%", display: "flex", alignItems: "flex-start", gap: 12, background: agreed2 ? `${T.green}10` : T.card, border: `1.5px solid ${agreed2 ? T.green + "55" : errors.agreed2 ? T.red + "66" : T.border}`, borderRadius: 14, padding: "13px 14px", cursor: "pointer", textAlign: "right", transition: "all .2s" }}>
              <div style={{ width: 26, height: 26, borderRadius: 8, border: `2.5px solid ${agreed2 ? T.green : T.border}`, background: agreed2 ? T.green : "transparent", flexShrink: 0, marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s", boxShadow: agreed2 ? `0 0 12px ${T.green}44` : "none" }}>
                {agreed2 && <span style={{ color: "#fff", fontSize: 16, fontWeight: 900, lineHeight: 1 }}>✓</span>}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, color: agreed2 ? T.text : T.mid, lineHeight: 1.8, fontWeight: agreed2 ? 700 : 400 }}>
                  أتعهد بصحة جميع البيانات المقدمة وأفهم أن <strong style={{ color: T.text }}>البيانات البنكية وبيانات السجل التجاري لا يمكن تعديلها</strong> بعد الاعتماد إلا بطلب رسمي موثّق.
                </p>
                {!agreed2 && <p style={{ fontSize: 11, color: T.dim, marginTop: 3 }}>⬆ اضغط للتأكيد — إلزامي</p>}
                {agreed2 && <p style={{ fontSize: 11, color: T.green, marginTop: 3, fontWeight: 700 }}>✅ تم التأكيد على صحة البيانات</p>}
              </div>
            </button>
            {errors.agreed2 && <p style={{ fontSize: 11, color: T.red, marginTop: 6, fontWeight: 700 }}>⚠ {errors.agreed2}</p>}
          </div>

          {/* Checkbox 3 — Agreement delivery */}
          <div id="field-agreed3" style={{ marginBottom: 16 }}>
            <button onClick={() => { setAgreed3(a => !a); setErrors(e => ({ ...e, agreed3: null })); }}
              style={{ width: "100%", display: "flex", alignItems: "flex-start", gap: 12, background: agreed3 ? `${T.blue}10` : T.card, border: `1.5px solid ${agreed3 ? T.blue + "55" : errors.agreed3 ? T.red + "66" : T.border}`, borderRadius: 14, padding: "13px 14px", cursor: "pointer", textAlign: "right", transition: "all .2s" }}>
              <div style={{ width: 26, height: 26, borderRadius: 8, border: `2.5px solid ${agreed3 ? T.blue : T.border}`, background: agreed3 ? T.blue : "transparent", flexShrink: 0, marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s", boxShadow: agreed3 ? `0 0 12px ${T.blue}44` : "none" }}>
                {agreed3 && <span style={{ color: "#fff", fontSize: 16, fontWeight: 900, lineHeight: 1 }}>✓</span>}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, color: agreed3 ? T.text : T.mid, lineHeight: 1.8, fontWeight: agreed3 ? 700 : 400 }}>
                  أوافق على استلام <strong style={{ color: T.blue }}>نسخة الاتفاقية الموقّعة وكشوف الحساب</strong> عبر{" "}
                  <strong style={{ color: T.green }}>واتساب</strong> ورقم <span style={{ direction: "ltr", display: "inline-block" }}>+974 {d.phone || "XXXXXXXX"}</span>{" "}
                  و<strong style={{ color: T.gold }}>البريد الإلكتروني</strong> {d.email || "your@email.com"}
                </p>
                {!agreed3 && <p style={{ fontSize: 11, color: T.dim, marginTop: 3 }}>⬆ اضغط للتأكيد — إلزامي</p>}
                {agreed3 && <p style={{ fontSize: 11, color: T.blue, marginTop: 3, fontWeight: 700 }}>✅ سيصلك كل شيء على واتساب والبريد</p>}
              </div>
            </button>
            {errors.agreed3 && <p style={{ fontSize: 11, color: T.red, marginTop: 6, fontWeight: 700 }}>⚠ {errors.agreed3}</p>}
          </div>

          {/* Delivery notice */}
          {agreed && agreed2 && agreed3 && (
            <div className="sd" style={{ background: `${T.green}10`, borderRadius: 13, padding: "12px 14px", border: `1px solid ${T.green}22`, marginBottom: 14 }}>
              <p style={{ fontSize: 12, color: T.green, fontWeight: 800, marginBottom: 6 }}>📨 بعد اعتماد طلبك ستستلم:</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {[
                  ["📱 واتساب", `+974 ${d.phone || "XXXXXXXX"}`, "نسخة PDF من الاتفاقية الموقّعة رقمياً"],
                  ["📧 بريد إلكتروني", d.email || "your@email.com", "نسخة الاتفاقية + رابط لوحة التحكم"],
                ].map(([ch, dest, desc]) => (
                  <div key={ch} style={{ display: "flex", alignItems: "center", gap: 10, background: T.card, borderRadius: 10, padding: "8px 12px" }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{ch.split(" ")[0]}</span>
                    <div>
                      <p style={{ fontSize: 11, color: T.text, fontWeight: 700 }}>{ch} — <span style={{ direction: "ltr", display: "inline" }}>{dest}</span></p>
                      <p style={{ fontSize: 10, color: T.dim }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section completion summary */}
          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            {[
              [sec1Done, "معلومات المتجر"],
              [sec2Done, "السجل التجاري"],
              [sec3Done, "الحساب البنكي"],
              [sec4Done, "كلمة المرور"],
              [agreed && agreed2 && agreed3, "الموافقة"],
            ].map(([done, label]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 5, background: done ? `${T.green}12` : T.card, borderRadius: 99, padding: "5px 12px", border: `1px solid ${done ? T.green + "33" : T.border}` }}>
                <span style={{ fontSize: 12 }}>{done ? "✅" : "⭕"}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: done ? T.green : T.dim }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Errors summary */}
          {Object.keys(errors).filter(k => errors[k]).length > 0 && !submitting && (
            <div className="sd" style={{ background: `${T.red}12`, borderRadius: 13, padding: "11px 14px", border: `1px solid ${T.red}33`, marginBottom: 14 }}>
              <p style={{ fontSize: 12, color: T.red, fontWeight: 800, marginBottom: 5 }}>⚠ يرجى تصحيح الحقول التالية:</p>
              {Object.entries(errors).filter(([,v]) => v).map(([k, msg]) => (
                <p key={k} style={{ fontSize: 11, color: T.red, marginBottom: 3 }}>• {msg}</p>
              ))}
            </div>
          )}

          {/* Submit button */}
          <button className="tap" onClick={submit} disabled={submitting}
            style={{
              width: "100%", padding: "16px", borderRadius: 16, border: "none",
              background: submitting ? T.card : (allDone && agreed && agreed2 && agreed3)
                ? `linear-gradient(135deg, ${T.maroon}, ${T.m2})`
                : `linear-gradient(135deg, ${T.maroon}55, ${T.m2}55)`,
              color: "#fff", fontWeight: 900, fontSize: 17, cursor: submitting ? "default" : "pointer",
              boxShadow: (allDone && agreed && agreed2 && agreed3) ? `0 8px 28px ${T.mGlow}` : "none",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              transition: "all .3s",
            }}>
            {submitting
              ? <><Spin /><span>جاري إرسال الطلب...</span></>
              : <><span>📤</span><span>إرسال طلب التسجيل</span></>
            }
          </button>

          {!(agreed && agreed2 && agreed3) && (
            <p style={{ fontSize: 11, color: T.red, textAlign: "center", marginTop: 8, fontWeight: 700 }}>
              ⚠ يجب الموافقة على جميع البنود الثلاثة قبل الإرسال
            </p>
          )}

          <p style={{ fontSize: 11, color: T.dim, textAlign: "center", marginTop: 8, lineHeight: 1.7 }}>
            🔒 بياناتك مشفّرة بـ TLS 1.3 — سيصلك إشعار واتساب خلال 24–48 ساعة 🇶🇦
          </p>
        </div>

      </div>{/* end main content */}
    </div>
  );
}
