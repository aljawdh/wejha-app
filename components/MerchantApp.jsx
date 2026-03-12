'use client'
import { useState, useMemo, useRef, useEffect } from "react";

/* ─── Inject libs + styles ─────────────────────────────────────────────────── */
if (!window.__wejhaMLibs) {
  const _s = document.createElement("script");
  _s.src = "https://cdnjs.cloudflare.com/ajax/libs/jsbarcode/3.11.5/JsBarcode.all.min.js";
  document.head.appendChild(_s);
  window.__wejhaMLibs = true;
}

if (!document.getElementById("wm3-style")) {
  const l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&family=JetBrains+Mono:wght@700&display=swap";
  document.head.appendChild(l);
  const s = document.createElement("style");
  s.id = "wm3-style";
  s.textContent = `
    html,body{margin:0;padding:0;font-family:'Tajawal',sans-serif;direction:rtl;background:#09080C;}
    *{box-sizing:border-box;}
    input,button,select,textarea{font-family:'Tajawal',sans-serif;}
    input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;}
    input[type=range]{accent-color:#8B1F24;}
    ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-thumb{background:#2a2a2a;border-radius:99px;}
    @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes popIn{0%{opacity:0;transform:scale(.86)}65%{transform:scale(1.04)}100%{opacity:1;transform:scale(1)}}
    @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes scanLine{0%,100%{top:12px;opacity:.8}50%{top:calc(100% - 12px);opacity:1}}
    @keyframes flashGreen{0%,100%{background:#091D13}40%,60%{background:#0D2A18}}
    @keyframes flashRed{0%,100%{background:#1C0808}40%,60%{background:#2A0E0E}}
    @keyframes checkIn{0%{transform:scale(0) rotate(-20deg)}70%{transform:scale(1.2) rotate(5deg)}100%{transform:scale(1) rotate(0deg)}}
    @keyframes countDown{from{stroke-dashoffset:0}to{stroke-dashoffset:157}}
    .fu{animation:fadeUp .38s cubic-bezier(.22,1,.36,1) both}
    .fi{animation:fadeIn .28s ease both}
    .pi{animation:popIn .4s cubic-bezier(.34,1.56,.64,1) both}
    .su{animation:slideUp .32s cubic-bezier(.22,1,.36,1) both}
    .validFlash{animation:flashGreen .5s ease 3}
    .invalidFlash{animation:flashRed .4s ease 2}
    .checkAnim{animation:checkIn .4s cubic-bezier(.34,1.56,.64,1) both}
    .tap:active{transform:scale(.95)!important;transition:transform .08s!important}
    .inp:focus{border-color:#8B1F24!important;box-shadow:0 0 0 3px #8B1F2418!important;outline:none!important}
    .barcode-wrap svg{max-width:100%;height:auto;}
    .scan-line{animation:scanLine 1.8s ease-in-out infinite;}
    video{border-radius:16px;}
  `;
  document.head.appendChild(s);
}

/* ─── Design tokens ────────────────────────────────────────────────────────── */
const T = {
  bg: "#09080C", surf: "#120F18", card: "#1B1823", cardHi: "#211E2A",
  border: "#272430",
  maroon: "#8B1F24", m2: "#6A171B", mGlow: "#8B1F2430",
  gold: "#C9A84C", gDim: "#9A7E38",
  text: "#EEE9F5", mid: "#887E98", dim: "#413C52",
  green: "#2ECA88", greenBg: "#091D13",
  red: "#E04848", redBg: "#1C0808",
  blue: "#4A9EDD",
};

const WEJHA_PCT = 0.10;

/* ─── Image processing ─────────────────────────────────────────────────────── */
const IMG_MAX = 400 * 1024, IMG_W = 900, IMG_Q = 0.78;
function processImage(file) {
  return new Promise((resolve, reject) => {
    if (file.size > 5 * 1024 * 1024) { reject("حجم الملف يتجاوز 5 MB"); return; }
    const r = new FileReader();
    r.onerror = () => reject("خطأ في قراءة الملف");
    r.onload = e => {
      const img = new Image();
      img.onerror = () => reject("الملف ليس صورة");
      img.onload = () => {
        let w = img.width, h = img.height;
        if (w > IMG_W || h > IMG_W) { const ratio = Math.min(IMG_W / w, IMG_W / h); w = Math.round(w * ratio); h = Math.round(h * ratio); }
        const cv = document.createElement("canvas");
        cv.width = w; cv.height = h;
        cv.getContext("2d").drawImage(img, 0, 0, w, h);
        let q = IMG_Q, b64 = cv.toDataURL("image/jpeg", q);
        while (b64.length * .75 > IMG_MAX && q > 0.3) { q -= 0.08; b64 = cv.toDataURL("image/jpeg", q); }
        resolve({ b64, kb: Math.round(b64.length * .75 / 1024), w, h });
      };
      img.src = e.target.result;
    };
    r.readAsDataURL(file);
  });
}

/* ─── Helpers ──────────────────────────────────────────────────────────────── */
function fmt(n) { return Number(n).toFixed(2); }
const Tag = ({ bg, color, children, sx = {} }) => (
  <span style={{ background: bg, color, borderRadius: 99, padding: "3px 10px", fontSize: 11, fontWeight: 700, lineHeight: 1.7, ...sx }}>{children}</span>
);
const Spin = ({ size = 17, color = "#fff" }) => (
  <div style={{ width: size, height: size, border: `2.5px solid ${color}33`, borderTopColor: color, borderRadius: "50%", animation: "spin .75s linear infinite", flexShrink: 0 }} />
);

function Field({ label, required, hint, children }) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 700, color: T.mid, display: "block", marginBottom: 5 }}>
        {label}{required && <span style={{ color: T.maroon }}> *</span>}
        {hint && <span style={{ color: T.dim, fontWeight: 400, marginRight: 4 }}>({hint})</span>}
      </label>
      {children}
    </div>
  );
}
const inp = { width: "100%", padding: "11px 14px", borderRadius: 13, border: `1.5px solid ${T.border}`, background: T.card, fontSize: 14, color: T.text, transition: "border-color .2s" };

/* ─── Barcode display ──────────────────────────────────────────────────────── */
function Barcode({ code, color = "#fff", bg = "transparent", height = 60 }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    function render(){
      if(!window.JsBarcode){setTimeout(render,200);return;}
      try {
        JsBarcode(ref.current, code.replace("-", ""), { format: "CODE128", displayValue: false, lineColor: color, background: bg, height, margin: 0, width: 1.8 });
      } catch (e) { }
    }
    render();
  }, [code, color, bg, height]);
  return <div className="barcode-wrap"><svg ref={ref} /></div>;
}

/* ─── Mock data ────────────────────────────────────────────────────────────── */
const INIT_DEALS = [
  {
    id: "d1", type: "invoice_paid", title: "خصم 30% على الفاتورة", disc: 30, minSpend: 150,
    priceQAR: 105, originalPrice: 150, maxCodes: 60, used: 31, startTime: "08:00", endTime: "22:00",
    radiusM: 400, products: [], bogo: false, expiresHours: null, active: true, savedValue: 60,
    desc: "مشوي فاخر • أجواء عائلية • ادفع الكوبون واحصل على خصم 30%",
    img: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=70",
    codes: [
      { code: "ABCD-1234", qty: 1, phone: "97455001111", paidAt: "2026-03-08 12:30", paid: true, usedAt: "2026-03-08 13:05" },
      { code: "EFGH-5678", qty: 1, phone: "97455002222", paidAt: "2026-03-09 09:15", paid: true, usedAt: null },
    ]
  },
  {
    id: "d2", type: "product", title: "قهوة عربية", disc: 0, minSpend: 0,
    priceQAR: 30, originalPrice: 30, maxCodes: 50, used: 14, startTime: "07:00", endTime: "12:00",
    radiusM: 350, products: [{ name: "قهوة عربية", max: 50 }, { name: "كابتشينو", max: 50 }],
    bogo: false, expiresHours: 2, active: true, savedValue: 18,
    desc: "قهوة عربية أو كابتشينو • قهوة الصباح • خدمة سريعة",
    img: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=70",
    codes: [
      { code: "WXYZ-9012", qty: 3, phone: "97455003333", paidAt: "2026-03-09 08:40", paid: true, usedAt: null },
    ]
  },
  {
    id: "d3", type: "bogo", title: "واحد + واحد مجاناً", disc: 50, minSpend: 0,
    priceQAR: 25, originalPrice: 50, maxCodes: 40, used: 8, startTime: "18:00", endTime: "23:59",
    radiusM: 300, products: [{ name: "أي مشروب", max: 2 }], bogo: true, expiresHours: null,
    active: false, savedValue: 15, desc: "للأزواج • جلسة مريحة • ادفع مشروباً واحصل على الثاني", img: "", codes: []
  },
];

/* ─── Stats ────────────────────────────────────────────────────────────────── */
function StatsRow({ deals }) {
  const total = deals.reduce((s, d) => s + d.used, 0);
  const rev = deals.reduce((s, d) => {
    const afterDisc = d.bogo
      ? d.originalPrice / 2
      : d.originalPrice * (1 - d.disc / 100);
    return s + (afterDisc > 0 ? d.used * afterDisc : 0);
  }, 0);
  const fee = rev * WEJHA_PCT, net = rev - fee;
  const active = deals.filter(d => d.active).length;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
      {[
        { icon: "🎫", label: "أكواد مُستخدمة", val: total, c: T.maroon },
        { icon: "✅", label: "عروض نشطة", val: active, c: T.green },
        { icon: "💰", label: "إجمالي المبيعات", val: `${fmt(rev)} ر.ق`, c: T.gold },
        { icon: "💵", label: "صافي الربح", val: `${fmt(net)} ر.ق`, c: T.blue },
      ].map(s => (
        <div key={s.label} style={{ background: T.card, borderRadius: 14, padding: "13px", border: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 20, marginBottom: 5 }}>{s.icon}</div>
          <p style={{ fontWeight: 900, fontSize: 18, color: s.c, lineHeight: 1 }}>{s.val}</p>
          <p style={{ fontSize: 11, color: T.dim, marginTop: 3 }}>{s.label}</p>
        </div>
      ))}
      <div style={{ gridColumn: "1/-1", background: T.surf, borderRadius: 12, padding: "10px 13px", border: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, color: T.mid }}>نسبة وِجهة (10%)</span>
        <span style={{ fontWeight: 800, color: T.gold }}>{fmt(fee)} ر.ق</span>
      </div>
    </div>
  );
}

/* ─── Camera Barcode Scanner ───────────────────────────────────────────────── */
function CameraScanner({ onResult, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState("starting");
  const [manualCode, setManualCode] = useState("");

  useEffect(() => {
    let interval;
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setStatus("scanning");
        // Real barcode scanning would use BarcodeDetector API or ZXing
        // Simulate by detecting after 3 seconds if BarcodeDetector available
        if ("BarcodeDetector" in window) {
          const detector = new BarcodeDetector({ formats: ["code_128", "code_39"] });
          interval = setInterval(async () => {
            if (!videoRef.current) return;
            try {
              const codes = await detector.detect(videoRef.current);
              if (codes.length > 0) {
                const rawVal = codes[0].rawValue;
                // Format as XXXX-XXXX if needed
                const cleaned = rawVal.replace(/[^A-Z0-9]/g, "").toUpperCase();
                const formatted = cleaned.length >= 8 ? cleaned.slice(0, 4) + "-" + cleaned.slice(4, 8) : rawVal;
                onResult(formatted);
              }
            } catch (e) { }
          }, 500);
        } else {
          // Demo fallback: simulate scan after 4s
          setTimeout(() => setStatus("demo"), 4000);
        }
      } catch (e) {
        setStatus("denied");
      }
    }
    start();
    return () => {
      clearInterval(interval);
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  return (
    <div className="fi" onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.92)", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div className="su" onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 480, background: T.surf, borderRadius: "26px 26px 0 0", padding: "24px 20px 40px", border: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <h3 style={{ fontWeight: 900, fontSize: 17, color: T.text }}>📷 مسح باركود العميل</h3>
          <button onClick={onClose} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 9, width: 30, height: 30, cursor: "pointer", fontSize: 17, color: T.mid, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>

        {/* Camera view */}
        <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", background: "#000", marginBottom: 16, height: 220 }}>
          <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />

          {/* Scan overlay */}
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 200, height: 80, position: "relative" }}>
              {/* Corner marks */}
              {[["0,0","8px 0 0 8px","top:0;right:0"],["0,0","0 8px 0 0","top:0;left:0"],["0,0","0 0 8px 0","bottom:0;left:0"],["0,0","0 0 0 8px","bottom:0;right:0"]].map(([_,br,pos],i)=>(
                <div key={i} style={{position:"absolute",...Object.fromEntries(pos.split(";").map(p=>{const[k,v]=p.split(":");return[k.trim(),v];})),width:20,height:20,border:`2.5px solid ${T.maroon}`,borderRadius:br,pointerEvents:"none"}}/>
              ))}
              {/* Scan line */}
              {status === "scanning" && (
                <div className="scan-line" style={{ position: "absolute", left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${T.maroon},transparent)`, boxShadow: `0 0 6px ${T.maroon}` }} />
              )}
            </div>
          </div>

          {/* Status overlay */}
          {status === "denied" && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.8)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <p style={{ fontSize: 28, marginBottom: 8 }}>📵</p>
              <p style={{ color: T.red, fontWeight: 700, fontSize: 13 }}>تعذّر الوصول للكاميرا</p>
            </div>
          )}
          {status === "demo" && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <p style={{ color: T.gold, fontSize: 12, textAlign: "center", padding: "0 20px" }}>الكاميرا تعمل — أدخل الكود يدوياً في هذه البيئة</p>
            </div>
          )}
        </div>

        <p style={{ fontSize: 11, color: T.dim, textAlign: "center", marginBottom: 14 }}>
          {status === "scanning" ? "🔍 جاري المسح... وجّه الكاميرا نحو الباركود" : "أو أدخل الكود يدوياً"}
        </p>

        {/* Manual fallback */}
        <div style={{ display: "flex", gap: 8 }}>
          <input className="inp" value={manualCode} onChange={e => setManualCode(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === "Enter" && manualCode.trim() && onResult(manualCode.trim())}
            placeholder="XXXX-XXXX"
            style={{ ...inp, flex: 1, fontFamily: "'JetBrains Mono',monospace", letterSpacing: 2, fontSize: 16, textAlign: "center" }} />
          <button className="tap" onClick={() => manualCode.trim() && onResult(manualCode.trim())} style={{ padding: "11px 16px", borderRadius: 12, border: "none", background: T.maroon, color: "#fff", fontWeight: 800, cursor: "pointer", flexShrink: 0 }}>تحقق</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Validate Panel ───────────────────────────────────────────────────────── */
function ValidatePanel({ deals, onUseCode }) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const allCodes = deals.flatMap(d =>
    d.codes.map(c => ({ ...c, dealId: d.id, dealTitle: d.title, dealDisc: d.disc, dealType: d.type, savedValue: d.savedValue || 0, maxCodes: d.maxCodes, used: d.used }))
  );

  function validate(code) {
    const q = (code || input).trim().toUpperCase();
    if (!q) return;
    setInput(q); setLoading(true); setConfirmed(false);
    setTimeout(() => {
      const found = allCodes.find(c => c.code.toUpperCase() === q);
      if (found) {
        if (found.usedAt) setResult({ ok: false, reason: "الكود مستخدم مسبقاً", alreadyUsed: true });
        else setResult({ ok: true, ...found });
      } else {
        setResult({ ok: false, reason: "كود غير صالح أو غير موجود" });
      }
      setLoading(false);
    }, 700);
  }

  function confirmUse() {
    if (!result?.ok) return;
    onUseCode(result.dealId, result.code);
    setConfirmed(true);
  }

  function handleScan(code) {
    setShowScanner(false);
    setInput(code);
    validate(code);
  }

  const remaining = result?.ok ? result.maxCodes - result.used - 1 : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="fu" style={{ background: T.card, borderRadius: 20, padding: 20, border: `1px solid ${T.border}` }}>
        <h3 style={{ fontWeight: 900, fontSize: 16, color: T.text, marginBottom: 4 }}>🔍 التحقق من كود العميل</h3>
        <p style={{ fontSize: 12, color: T.mid, marginBottom: 16 }}>امسح الباركود أو أدخل الكود للتحقق الفوري</p>

        {/* Scan button */}
        <button className="tap" onClick={() => setShowScanner(true)} style={{
          width: "100%", padding: "13px", borderRadius: 14, border: `1px solid ${T.maroon}44`,
          background: `${T.maroon}15`, color: T.maroon, fontWeight: 800, fontSize: 14,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12
        }}>
          <span style={{ fontSize: 20 }}>📷</span>
          <span>مسح الباركود بالكاميرا</span>
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <div style={{ flex: 1, height: 1, background: T.border }} />
          <span style={{ fontSize: 11, color: T.dim }}>أو أدخل يدوياً</span>
          <div style={{ flex: 1, height: 1, background: T.border }} />
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <input className="inp" value={input} onChange={e => setInput(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === "Enter" && validate()}
            placeholder="XXXX-XXXX"
            style={{ ...inp, flex: 1, fontFamily: "'JetBrains Mono',monospace", letterSpacing: 2, fontSize: 16, textAlign: "center" }} />
          <button className="tap" onClick={() => validate()} disabled={loading} style={{ padding: "11px 18px", borderRadius: 12, border: "none", background: T.maroon, color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            {loading ? <Spin size={15} /> : <span>تحقق</span>}
          </button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className={`fu ${result.ok ? "validFlash" : "invalidFlash"}`} style={{
          borderRadius: 18, padding: 18,
          background: result.ok ? T.greenBg : T.redBg,
          border: `1.5px solid ${result.ok ? T.green : T.red}44`
        }}>
          {result.ok && !confirmed ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div className="checkAnim" style={{ width: 48, height: 48, borderRadius: "50%", background: T.green, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>✓</div>
                <div>
                  <p style={{ fontWeight: 900, fontSize: 18, color: T.green }}>كود صالح! ✅</p>
                  <p style={{ fontSize: 12, color: T.mid }}>📱 {result.phone}</p>
                </div>
              </div>

              {/* Show barcode */}
              <div style={{ background: "#fff", borderRadius: 14, padding: "12px 10px 8px", marginBottom: 14, border: `1px solid ${T.green}44` }}>
                <Barcode code={result.code} color="#111" bg="#fff" height={55} />
                <p style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 16, color: "#111", letterSpacing: 2, textAlign: "center", marginTop: 6 }}>{result.code}</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginBottom: 14 }}>
                {[
                  ["العرض", result.dealTitle],
                  ["الكمية", `× ${result.qty}`],
                  ["الدفع", result.paid ? "✅ مدفوع" : "مجاني"],
                  ["التوقيت", result.paidAt || "الآن"],
                  ["وفّر العميل", `${result.savedValue} ر.ق`],
                  ["المتبقي بعد الخصم", `${remaining} من ${result.maxCodes}`],
                ].map(([k, v]) => (
                  <div key={k} style={{ background: "rgba(0,0,0,.2)", borderRadius: 10, padding: "8px 10px" }}>
                    <p style={{ fontSize: 10, color: T.dim, marginBottom: 2 }}>{k}</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{v}</p>
                  </div>
                ))}
              </div>

              {/* Remaining bar */}
              <div style={{ background: "rgba(0,0,0,.2)", borderRadius: 10, padding: "10px 12px", marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: T.mid }}>الأكواد المتبقية بعد هذا الخصم</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: remaining < 5 ? T.red : T.green }}>{remaining} / {result.maxCodes}</span>
                </div>
                <div style={{ height: 5, background: T.border, borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ width: `${(remaining / result.maxCodes) * 100}%`, height: "100%", background: remaining < 5 ? T.red : T.green, borderRadius: 99, transition: "width .5s" }} />
                </div>
              </div>

              <button className="tap" onClick={confirmUse} style={{ width: "100%", padding: "14px", borderRadius: 13, border: "none", background: `linear-gradient(135deg,${T.green},#1A9A60)`, color: "#fff", fontWeight: 900, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: `0 6px 22px ${T.green}44` }}>
                <span style={{ fontSize: 20 }}>✓</span>
                <span>تأكيد الخصم ونقص الرصيد</span>
              </button>
            </>
          ) : confirmed ? (
            <div className="checkAnim" style={{ textAlign: "center", padding: "10px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 10 }}>✅</div>
              <p style={{ fontWeight: 900, fontSize: 18, color: T.green }}>تم تأكيد الخصم!</p>
              <p style={{ fontSize: 13, color: T.mid, marginTop: 6 }}>تم نقص رصيد الأكواد تلقائياً</p>
              <p style={{ fontSize: 12, color: T.dim, marginTop: 4 }}>المتبقي: {remaining} كود</p>
              <button className="tap" onClick={() => { setResult(null); setInput(""); setConfirmed(false); }} style={{ marginTop: 14, padding: "10px 24px", borderRadius: 11, border: `1px solid ${T.border}`, background: T.card, color: T.mid, fontWeight: 700, cursor: "pointer", fontSize: 13 }}>تحقق من كود آخر</button>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "6px 0" }}>
              <span style={{ fontSize: 30 }}>❌</span>
              <p style={{ fontWeight: 800, fontSize: 15, color: T.red, marginTop: 8 }}>{result.reason}</p>
              {result.alreadyUsed && <p style={{ fontSize: 12, color: T.dim, marginTop: 4 }}>هذا الكود استُخدم بالفعل</p>}
            </div>
          )}
        </div>
      )}

      {showScanner && <CameraScanner onResult={handleScan} onClose={() => setShowScanner(false)} />}
    </div>
  );
}

/* ─── Image Uploader ───────────────────────────────────────────────────────── */
function ImageUploader({ value, onChange }) {
  const fileRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState(null);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErr(""); setUploading(true); setInfo(null);
    try {
      const { b64, kb, w, h } = await processImage(file);
      setInfo({ kb, w, h });
      onChange(b64);
    } catch (ex) {
      setErr(typeof ex === "string" ? ex : "خطأ في المعالجة");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div>
      <div onClick={() => !uploading && fileRef.current?.click()} style={{ width: "100%", height: value ? 130 : 90, borderRadius: 14, border: `2px dashed ${value ? T.maroon + "66" : T.border}`, background: T.card, cursor: uploading ? "wait" : "pointer", overflow: "hidden", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {value ? (
          <img src={value} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : uploading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <Spin color={T.maroon} size={20} />
            <p style={{ fontSize: 11, color: T.mid }}>جاري المعالجة...</p>
          </div>
        ) : (
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 24, marginBottom: 4 }}>📷</p>
            <p style={{ fontSize: 12, color: T.mid }}>اضغط لرفع صورة</p>
            <p style={{ fontSize: 10, color: T.dim, marginTop: 2 }}>أقصى 400 KB · 900px</p>
          </div>
        )}
      </div>
      {info && <p className="fi" style={{ fontSize: 11, color: T.green, marginTop: 6 }}>✅ {info.kb} KB · {info.w}×{info.h}</p>}
      {err && <p className="fi" style={{ fontSize: 12, color: T.red, marginTop: 6 }}>⚠️ {err}</p>}
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "8px 0" }}>
        <div style={{ flex: 1, height: 1, background: T.border }} />
        <span style={{ fontSize: 10, color: T.dim }}>أو</span>
        <div style={{ flex: 1, height: 1, background: T.border }} />
      </div>
      <input className="inp" type="url" placeholder="رابط صورة https://..." value={value?.startsWith("http") ? value : ""} onChange={e => { onChange(e.target.value); setInfo(null); }} style={{ ...inp, fontSize: 12 }} />
      <p style={{ fontSize: 10, color: T.dim, marginTop: 4 }}>💡 أقصى 400 KB · JPEG · 900×600 موصى به</p>
    </div>
  );
}

/* ─── Keyword dictionary for description ───────────────────────────────────── */
const KEYWORDS = {
  "🍽️ مطاعم": [
    "مشوي فاخر","طازج يومياً","نكهة أصيلة","وجبة متكاملة","شيف متميز",
    "أجواء عائلية","مكونات طبيعية","طبق رئيسي","مشروب مجاني",
    "بدون إضافات","حلال 100%","عروض الغداء","خدمة سريعة","أكل بيتي",
    "مطبخ قطري","مطبخ لبناني","مطبخ هندي","مطبخ آسيوي",
  ],
  "☕ مقاهي": [
    "قهوة مختصة","حبوب مستوردة","إسبريسو غني","لاتيه كريمي","كابتشينو ناعم",
    "أجواء هادئة","جلسة مريحة","قهوة الصباح","مشروب بارد","عصير طازج",
    "كيك يومي","ديكور أنيق","واي فاي مجاني","قهوة عربية","شاي بالنعناع",
    "كولد بريو","ماتشا","موكا فاخر",
  ],
  "👗 بوتيك وعطور": [
    "تصميم حصري","خامة فاخرة","عباية يدوية","عطر فرنسي","توقيع مميز",
    "ألوان موسمية","قياسات مخصصة","هدية مجانية","تغليف فاخر","ماركة عالمية",
    "كوليكشن جديد","أقمشة إيطالية","رائحة راقية","بخور فاخر","دهن عود",
    "عطر شرقي","مسك فاخر","تصميم قطري",
  ],
  "🛒 سوبر ماركت": [
    "منتجات طازجة","خضار يومي","فواكه موسمية","لحوم مبردة","أسعار مخفضة",
    "منتجات عضوية","واردات مميزة","منتجات محلية","مشتريات يومية","تشكيلة واسعة",
    "بقالة متكاملة","منتجات مجمدة","مخبوزات طازجة","ألبان وأجبان","حبوب ومعلبات",
    "منتجات قطرية","بدون حافظات",
  ],
  "💊 صيدليات": [
    "أدوية أصلية","منتجات طبية","فيتامينات يومية","عناية بالبشرة","منتجات الأم",
    "أطفال وحضانة","مكملات غذائية","ضغط ودم","أدوية مزمنة","عناية بالشعر",
    "كريمات طبية","علاج طبيعي","منتجات ديرما","حماية الشمس","فحص مجاني",
    "استشارة صيدلي","توصيف سريع",
  ],
  "🧖 سبا ورياضة": [
    "جلسة استرخاء","مساج تايلاندي","مساج عميق","حمام مغربي","علاج بالطين",
    "جلسة بخار","تنظيف البشرة","تدريب شخصي","كوتش معتمد","لياقة بدنية",
    "تمارين يوغا","بيلاتيس","رياضة صباحية","تخسيس طبي","تغذية رياضية",
    "باقة شهرية","حصة تجريبية",
  ],
  "✨ عام": [
    "عرض محدود","حصري عبر وِجهة","لفترة محدودة","أبرز الباركود","وفّر الآن",
    "للزيارة فقط","يومي","أسبوعي","للعائلة","للأزواج","للأفراد",
    "عرض اليوم","كمية محدودة","لا تفوّته",
  ],
};

const DESC_MAX = 60; // max characters

/* ─── Smart Description Field ──────────────────────────────────────────────── */
function DescField({ value, onChange }) {
  const [cat, setCat] = useState("✨ عام");
  const cats = Object.keys(KEYWORDS);
  const count = value.length;
  const overLimit = count > DESC_MAX;
  const pct = Math.min(count / DESC_MAX, 1);

  function addKeyword(kw) {
    if (count >= DESC_MAX) return;
    const sep = value.trim() ? " • " : "";
    const next = (value + sep + kw).slice(0, DESC_MAX);
    onChange(next);
  }

  function clearDesc() { onChange(""); }

  return (
    <div>
      {/* Category tabs — scrollable row */}
      <div style={{ display: "flex", gap: 6, marginBottom: 10, overflowX: "auto", paddingBottom: 2 }}>
        {cats.map(c => (
          <button key={c} className="tap" onClick={() => setCat(c)} style={{
            flexShrink: 0,
            padding: "6px 13px", borderRadius: 99,
            border: `1.5px solid ${cat === c ? T.maroon : T.border}`,
            background: cat === c ? T.maroon : T.card,
            color: cat === c ? "#fff" : T.mid,
            fontWeight: 700, fontSize: 11, cursor: "pointer",
            boxShadow: cat === c ? `0 3px 12px ${T.mGlow}` : "none",
            transition: "all .15s",
          }}>{c}</button>
        ))}
      </div>

      {/* Keyword chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10,
        background: T.card, borderRadius: 14, padding: "10px 12px", border: `1px solid ${T.border}` }}>
        {KEYWORDS[cat].map(kw => (
          <button key={kw} className="tap" onClick={() => addKeyword(kw)} style={{
            padding: "4px 10px", borderRadius: 99,
            border: `1px solid ${value.includes(kw) ? T.green + "55" : T.border}`,
            background: value.includes(kw) ? `${T.green}15` : T.surf,
            color: value.includes(kw) ? T.green : T.mid,
            fontSize: 11, fontWeight: 600, cursor: count >= DESC_MAX ? "not-allowed" : "pointer",
            opacity: count >= DESC_MAX && !value.includes(kw) ? 0.4 : 1,
            transition: "all .15s",
          }}>{kw}</button>
        ))}
      </div>

      {/* Textarea */}
      <div style={{ position: "relative" }}>
        <textarea
          className="inp"
          value={value}
          onChange={e => onChange(e.target.value.slice(0, DESC_MAX))}
          placeholder="اكتب وصفاً قصيراً للعرض أو اضغط على الكلمات أعلاه..."
          rows={2}
          style={{
            ...inp, resize: "none", lineHeight: 1.7, paddingLeft: 44,
            borderColor: overLimit ? T.red : undefined,
          }}
        />
        {value && (
          <button onClick={clearDesc} style={{
            position: "absolute", left: 12, top: 11,
            background: "none", border: "none", cursor: "pointer",
            color: T.dim, fontSize: 16, lineHeight: 1,
          }}>✕</button>
        )}
      </div>

      {/* Progress bar + counter */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
        <div style={{ flex: 1, height: 3, background: T.border, borderRadius: 99, overflow: "hidden" }}>
          <div style={{
            width: `${pct * 100}%`, height: "100%", borderRadius: 99, transition: "width .2s",
            background: pct < 0.75 ? T.green : pct < 1 ? T.gold : T.red,
          }} />
        </div>
        <span style={{
          fontSize: 11, fontWeight: 700, flexShrink: 0,
          color: overLimit ? T.red : count > DESC_MAX * 0.75 ? T.gold : T.dim,
        }}>{count} / {DESC_MAX}</span>
      </div>

      {/* Preview as it appears to customer */}
      {value.trim() && (
        <div style={{ marginTop: 8, background: `${T.blue}10`, borderRadius: 11, padding: "8px 12px", border: `1px solid ${T.blue}22` }}>
          <p style={{ fontSize: 9, color: T.blue, fontWeight: 700, marginBottom: 3 }}>👁️ معاينة كما يراه العميل</p>
          <p style={{ fontSize: 12, color: T.mid, lineHeight: 1.6 }}>{value}</p>
        </div>
      )}
    </div>
  );
}

/* ─── Title Suggestions ────────────────────────────────────────────────────── */
// structure: { category: { dealType: [titles] } }
const TITLE_SUGGESTIONS = {
  "🍽️ مطاعم": {
    invoice_paid: [
      "خصم {disc}% على فاتورتك كاملة",
      "وجبتك بـ {disc}% أقل — الليلة فقط",
      "ادفع أقل، استمتع أكثر — خصم {disc}%",
      "فاتورة عشاء العائلة بخصم {disc}%",
      "غداء فاخر بخصم {disc}% على الفاتورة",
      "عرض الغداء — {disc}% خصم على كل شيء",
    ],
    product: [
      "طبق مشوي فاخر بسعر خاص",
      "وجبة كاملة + مشروب بسعر واحد",
      "طبق اليوم بنصف السعر",
      "ستيك + شوربة + مشروب",
      "بيتزا عائلية كبيرة",
      "منيو خاص للاثنين",
    ],
    bogo: [
      "اطلب وجبة واحصل على الثانية مجاناً",
      "شارك صديقك — وجبتان بسعر واحدة",
      "ادفع لواحد وكُلا معاً",
      "اشترِ وجبة اهدِ الثانية",
    ],
  },
  "☕ مقاهي": {
    invoice_paid: [
      "خصم {disc}% على مشترياتك كاملة",
      "جلستك المفضلة بـ {disc}% أقل",
      "فنجانك + كيكتك بخصم {disc}%",
      "عرض الصباح — {disc}% من الفاتورة",
    ],
    product: [
      "قهوة عربية أصيلة",
      "لاتيه كريمي + كيكة",
      "كولد بريو + بروني",
      "كابتشينو + معجنة طازجة",
      "ماتشا لاتيه خاص",
      "قهوتك المفضلة بسعر مخفض",
      "مشروب الموسم الجديد",
    ],
    bogo: [
      "قهوتان بسعر قهوة واحدة",
      "احضر صديقك — المشروب الثاني مجاناً",
      "شارك لحظتك — 1+1 على جميع المشروبات",
    ],
  },
  "👗 بوتيك وعطور": {
    invoice_paid: [
      "خصم {disc}% على مجموعتنا الجديدة",
      "تسوّقي بـ {disc}% أقل — كوليكشن 2026",
      "خصم {disc}% على العبايات الفاخرة",
      "فاتورة تسوقك بخصم {disc}% خاص",
      "{disc}% خصم على جميع العطور",
    ],
    product: [
      "عباية حصرية بسعر مخفض",
      "عطر فرنسي أصيل",
      "دهن عود فاخر بسعر خاص",
      "بخور فاخر هدية أنيقة",
      "إيشارب أنيق من تشكيلتنا",
      "حقيبة يد بتصميم حصري",
    ],
    bogo: [
      "اشترِ عطراً واحصل على الثاني بنصف السعر",
      "منتجان من تشكيلتنا بسعر واحد",
    ],
  },
  "🛒 سوبر ماركت": {
    invoice_paid: [
      "خصم {disc}% على مشترياتك اليومية",
      "تسوق أكثر وادفع أقل — {disc}% خصم",
      "فاتورة بقالتك بخصم {disc}%",
      "عرض نهاية الأسبوع — {disc}% على كل شيء",
    ],
    product: [
      "سلة خضار طازجة يومية",
      "منتجات الألبان المميزة",
      "عرض اللحوم الطازجة",
      "فاكهة موسمية طازجة",
      "منتجات عضوية مختارة",
      "سلة البقالة الأسبوعية",
    ],
    bogo: [
      "اشترِ كيلو واحصل على كيلو مجاناً",
      "علبتان بسعر علبة واحدة",
      "منتجان من نفس الصنف بسعر واحد",
    ],
  },
  "💊 صيدليات": {
    invoice_paid: [
      "خصم {disc}% على منتجات العناية",
      "فاتورة صيدليتك بخصم {disc}%",
      "خصم {disc}% على المكملات الغذائية",
      "{disc}% على منتجات الأطفال",
    ],
    product: [
      "فيتامينات يومية بسعر خاص",
      "كريم عناية بالبشرة مميز",
      "مجموعة عناية بالشعر",
      "منتجات الأم والطفل",
      "واقي الشمس الطبي",
      "مكملات الرياضة",
    ],
    bogo: [
      "علبتان من فيتاميناتك بسعر علبة",
      "منتجي عناية بسعر واحد",
    ],
  },
  "🧖 سبا ورياضة": {
    invoice_paid: [
      "خصم {disc}% على جلستك القادمة",
      "اشتراك الشهر بخصم {disc}%",
      "باقة الاسترخاء بـ {disc}% أقل",
      "خصم {disc}% على برنامج التخسيس",
    ],
    product: [
      "جلسة مساج تايلاندي فاخرة",
      "حمام مغربي كامل",
      "جلسة تنظيف البشرة العميقة",
      "حصة تدريبية مع كوتش معتمد",
      "جلسة يوغا للمبتدئين",
      "حصة تجريبية مجانية",
    ],
    bogo: [
      "جلستان بسعر جلسة واحدة",
      "احضر صديقتك — الجلسة الثانية مجاناً",
      "باقة الأزواج — اثنان بسعر واحد",
    ],
  },
};

const TITLE_MAX = 35;

/* ─── TitleField with keyword suggestions ─────────────────────────────────── */
function TitleField({ value, onChange, dealType, storeCat }) {
  const [showSugg, setShowSugg] = useState(false);

  // Find the right category key — direct match or partial
  const catKey = TITLE_SUGGESTIONS[storeCat]
    ? storeCat
    : Object.keys(TITLE_SUGGESTIONS).find(k => storeCat && k.includes(storeCat.replace(/^[^\s]+\s/, ""))) || null;
  const suggestions = catKey ? (TITLE_SUGGESTIONS[catKey][dealType] || TITLE_SUGGESTIONS[catKey]["invoice_paid"] || []) : [];

  // Replace {disc} placeholder with a smart default
  function applyTemplate(tpl) {
    return tpl.replace("{disc}", "٪");
  }

  const count = value.length;
  const overMax = count > TITLE_MAX;

  return (
    <div>
      <div style={{ position: "relative" }}>
        <input
          className="inp"
          value={value}
          onChange={e => onChange(e.target.value.slice(0, TITLE_MAX))}
          placeholder="اكتب عنواناً أو اختر من الاقتراحات ↓"
          style={{
            ...inp,
            paddingLeft: 44,
            borderColor: overMax ? T.red : value ? T.maroon + "66" : undefined,
          }}
        />
        {/* Toggle suggestions btn */}
        <button
          type="button"
          onClick={() => setShowSugg(s => !s)}
          style={{
            position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
            background: showSugg ? T.maroon : T.surf,
            border: `1px solid ${showSugg ? T.maroon : T.border}`,
            borderRadius: 8, padding: "3px 7px",
            cursor: "pointer", fontSize: 13, color: showSugg ? "#fff" : T.mid,
            transition: "all .15s", lineHeight: 1.4,
          }}
          title="اقتراحات"
        >✦</button>
      </div>

      {/* Character counter */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5, alignItems: "center" }}>
        {value.trim()
          ? <p style={{ fontSize: 10, color: T.blue, fontWeight: 700 }}>👁️ يظهر للعميل: "{value}"</p>
          : <span />}
        <span style={{ fontSize: 11, fontWeight: 700, color: overMax ? T.red : count > TITLE_MAX * 0.8 ? T.gold : T.dim }}>
          {count}/{TITLE_MAX}
        </span>
      </div>

      {/* Suggestions panel */}
      {showSugg && (
        <div className="fu" style={{
          marginTop: 8,
          background: T.card,
          borderRadius: 14,
          border: `1.5px solid ${T.maroon}44`,
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            background: `linear-gradient(135deg,${T.maroon},${T.m2})`,
            padding: "9px 14px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <p style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>
              ✦ عناوين جاهزة — اضغط لاختيار
            </p>
            <Tag bg="rgba(255,255,255,.2)" color="#fff" sx={{ fontSize: 9 }}>
              {catKey || "عام"}
            </Tag>
          </div>

          {suggestions.length > 0 ? (
            <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
              {suggestions.map((tpl, i) => {
                const title = applyTemplate(tpl);
                const isSelected = value === title;
                return (
                  <button
                    key={i}
                    className="tap"
                    onClick={() => { onChange(title); setShowSugg(false); }}
                    style={{
                      width: "100%", textAlign: "right",
                      padding: "9px 13px",
                      borderRadius: 11,
                      border: `1.5px solid ${isSelected ? T.green : T.border}`,
                      background: isSelected ? `${T.green}18` : T.surf,
                      color: isSelected ? T.green : T.text,
                      fontWeight: isSelected ? 800 : 600,
                      fontSize: 13, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      gap: 8, transition: "all .12s",
                    }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = T.maroon; e.currentTarget.style.background = isSelected ? `${T.green}18` : `${T.maroon}12`; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = isSelected ? T.green : T.border; e.currentTarget.style.background = isSelected ? `${T.green}18` : T.surf; }}
                  >
                    <span>{title}</span>
                    {isSelected
                      ? <span style={{ fontSize: 15 }}>✓</span>
                      : <span style={{ fontSize: 12, color: T.dim }}>←</span>}
                  </button>
                );
              })}
            </div>
          ) : (
            <div style={{ padding: "16px", textAlign: "center" }}>
              <p style={{ fontSize: 12, color: T.dim }}>اختر فئة المتجر في الإعدادات لرؤية الاقتراحات</p>
            </div>
          )}

          {/* Tip */}
          <div style={{ padding: "8px 14px 12px", borderTop: `1px solid ${T.border}` }}>
            <p style={{ fontSize: 10, color: T.dim }}>
              💡 بعد الاختيار يمكنك تعديل العنوان بحرية
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Deal Form ─────────────────────────────────────────────────────────────── */
function DealForm({ initial, onSave, onClose, storeCat }) {
  const blank = { type: "invoice_paid", title: "", desc: "", disc: 20, minSpend: 0, priceQAR: 0, maxCodes: 50, radiusM: 400, startTime: "08:00", endTime: "22:00", expiresHours: null, products: [], bogo: false, img: "", active: true, savedValue: 0, originalPrice: 0 };
  const [f, setF] = useState(initial || blank);
  const [prod, setProd] = useState("");
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  function addProd() { if (!prod.trim()) return; set("products", [...f.products, { name: prod.trim(), max: 50 }]); setProd(""); }
  function save() {
    if (!f.title.trim()) return;
    setSaving(true);
    setTimeout(() => { onSave({ ...f, id: initial?.id || "d" + Date.now(), used: initial?.used || 0, codes: initial?.codes || [] }); setSaving(false); onClose(); }, 800);
  }
  return (
    <div className="fi" onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.82)", zIndex: 80, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div className="su" onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 540, background: T.surf, borderRadius: "26px 26px 0 0", padding: "24px 20px 44px", border: `1px solid ${T.border}`, maxHeight: "92svh", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <h2 style={{ fontWeight: 900, fontSize: 18, color: T.text }}>{initial ? "تعديل العرض ✏️" : "إضافة عرض جديد 🎁"}</h2>
          <button onClick={onClose} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 9, width: 30, height: 30, cursor: "pointer", fontSize: 17, color: T.mid, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="نوع العرض" required>
            <div style={{ display: "flex", gap: 6 }}>
              {[["invoice_paid", "خصم من الفاتورة"], ["product", "منتج محدد"], ["bogo", "1+1 مجاناً"]].map(([v, l]) => (
                <button key={v} className="tap" onClick={() => { set("type", v); set("bogo", v === "bogo"); }} style={{ flex: 1, padding: "10px 4px", borderRadius: 12, border: `1.5px solid ${f.type === v ? T.maroon : T.border}`, background: f.type === v ? `${T.maroon}22` : T.card, color: f.type === v ? T.maroon : T.mid, fontWeight: 800, fontSize: 11, cursor: "pointer" }}>{l}</button>
              ))}
            </div>
            {f.type === "invoice_paid" && (
              <div className="fu" style={{ marginTop: 8, background: `${T.gold}14`, borderRadius: 11, padding: "10px 12px", border: `1px solid ${T.gold}33` }}>
                <p style={{ fontSize: 11, color: T.gold, lineHeight: 1.7 }}>💡 العميل يدفع قيمة الكوبون • يأتي للمتجر • يمسح الباركود • يحصل على الخصم</p>
              </div>
            )}
          </Field>

          <Field label="عنوان العرض" required hint={`أقصى ${TITLE_MAX} حرف`}>
            <TitleField
              value={f.title}
              onChange={v => set("title", v)}
              dealType={f.type}
              storeCat={storeCat}
            />
          </Field>

          <Field label="وصف العرض" hint={`أقصى ${DESC_MAX} حرف`}>
            <DescField value={f.desc || ""} onChange={v => set("desc", v)} />
          </Field>

          <Field label="صورة العرض" hint="أقصى 400 KB">
            <ImageUploader value={f.img} onChange={v => set("img", v)} />
          </Field>

          {f.type !== "bogo" && (
            <Field label={`نسبة الخصم: ${f.disc}%`}>
              <input type="range" min={5} max={80} step={5} value={f.disc} onChange={e => set("disc", Number(e.target.value))} style={{ width: "100%", margin: "4px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 10, color: T.dim }}>5%</span>
                <Tag bg={`${T.maroon}22`} color={T.maroon}>{f.disc}% خصم</Tag>
                <span style={{ fontSize: 10, color: T.dim }}>80%</span>
              </div>
            </Field>
          )}

          {/* ── السعر بعد الخصم — محسوب تلقائياً ── */}
          {f.originalPrice > 0 && (
            <div style={{ background: `${T.green}10`, borderRadius: 13, padding: "12px 14px", border: `1px solid ${T.green}33`, marginBottom: 14 }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: T.green, marginBottom: 10 }}>🧮 الحساب التلقائي</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: T.mid }}>السعر الأصلي</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: T.dim, textDecoration: "line-through" }}>{f.originalPrice} ر.ق</span>
                </div>
                {!f.bogo && f.disc > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, color: T.mid }}>الخصم ({f.disc}%)</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: T.red }}>−{(f.originalPrice * f.disc / 100).toFixed(2)} ر.ق</span>
                  </div>
                )}
                {f.bogo && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, color: T.mid }}>خصم 1+1 (50%)</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: T.red }}>−{(f.originalPrice / 2).toFixed(2)} ر.ق</span>
                  </div>
                )}
                <div style={{ height: 1, background: T.border }} />
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: T.text }}>✅ يدفع العميل</span>
                  <span style={{ fontSize: 16, fontWeight: 900, color: T.green }}>
                    {f.bogo
                      ? (f.originalPrice / 2).toFixed(2)
                      : (f.originalPrice * (1 - f.disc / 100)).toFixed(2)
                    } ر.ق
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", background: `${T.maroon}12`, borderRadius: 9, padding: "7px 10px" }}>
                  <span style={{ fontSize: 12, color: T.mid }}>عمولة وِجهة (10%)</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: T.maroon }}>
                    {f.bogo
                      ? ((f.originalPrice / 2) * WEJHA_PCT).toFixed(2)
                      : (f.originalPrice * (1 - f.disc / 100) * WEJHA_PCT).toFixed(2)
                    } ر.ق / كوبون
                  </span>
                </div>
              </div>
            </div>
          )}

          {f.type === "invoice_paid" && (
            <Field label="الحد الأدنى للفاتورة (ر.ق)" hint="0 = بلا حد">
              <input className="inp" type="number" value={f.minSpend || ""} onChange={e => set("minSpend", Number(e.target.value))} placeholder="0" style={inp} />
            </Field>
          )}

          {/* ── السعر الأصلي قبل الخصم ── */}
          {f.type !== "bogo" && (
            <Field label="السعر الأصلي قبل الخصم (ر.ق)" hint="لإظهاره للعميل — يُظهر التوفير الحقيقي">
              <input
                className="inp"
                type="number"
                value={f.originalPrice || ""}
                onChange={e => set("originalPrice", Number(e.target.value))}
                placeholder={f.type === "invoice_paid" ? "مثال: قيمة الفاتورة الكاملة" : "السعر الكامل قبل الخصم"}
                style={inp}
              />
              {f.originalPrice > 0 && f.disc > 0 && (
                <div style={{ marginTop: 8, background: `${T.green}12`, borderRadius: 11, padding: "10px 13px", border: `1px solid ${T.green}22` }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: T.green, marginBottom: 6 }}>💡 معاينة الشفافية — ما سيراه العميل:</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 11, color: T.mid }}>السعر الأصلي</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: T.dim, textDecoration: "line-through" }}>{f.originalPrice} ر.ق</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 11, color: T.mid }}>سعر بعد الخصم ({f.disc}%)</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: T.gold }}>{(f.originalPrice * (1 - f.disc / 100)).toFixed(2)} ر.ق</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 11, color: T.mid }}>توفير العميل</span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: T.green }}>−{(f.originalPrice * f.disc / 100).toFixed(2)} ر.ق ({f.disc}%)</span>
                    </div>
                  </div>
                </div>
              )}
            </Field>
          )}

          {f.type === "bogo" && (
            <Field label="سعر القطعة الواحدة (ر.ق)" hint="لحساب التوفير في 1+1">
              <input
                className="inp"
                type="number"
                value={f.originalPrice ? f.originalPrice / 2 : ""}
                onChange={e => set("originalPrice", Number(e.target.value) * 2)}
                placeholder="سعر قطعة واحدة"
                style={inp}
              />
              {f.originalPrice > 0 && (
                <div style={{ marginTop: 8, background: `${T.green}12`, borderRadius: 11, padding: "10px 13px", border: `1px solid ${T.green}22` }}>
                  <p style={{ fontSize: 11, color: T.green, fontWeight: 700 }}>
                    🎁 العميل يدفع {f.originalPrice / 2} ر.ق — ويوفّر {f.originalPrice / 2} ر.ق (50%)
                  </p>
                </div>
              )}
            </Field>
          )}

          {(f.type === "product" || f.type === "bogo") && (
            <Field label="المنتجات">
              <div style={{ display: "flex", gap: 7, marginBottom: 8 }}>
                <input className="inp" value={prod} onChange={e => setProd(e.target.value)} onKeyDown={e => e.key === "Enter" && addProd()} placeholder="اسم المنتج" style={{ ...inp, flex: 1 }} />
                <button className="tap" onClick={addProd} style={{ padding: "11px 15px", borderRadius: 12, border: "none", background: T.maroon, color: "#fff", fontWeight: 800, cursor: "pointer", fontSize: 14, flexShrink: 0 }}>+</button>
              </div>
              {f.products.map((p, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, background: T.card, borderRadius: 10, padding: "8px 12px", marginBottom: 6, border: `1px solid ${T.border}` }}>
                  <span style={{ flex: 1, fontSize: 13, color: T.text }}>{p.name}</span>
                  <span style={{ fontSize: 11, color: T.dim }}>حد أقصى:</span>
                  <input type="number" value={p.max} min={1} max={50} onChange={e => set("products", f.products.map((pp, ii) => ii === i ? { ...pp, max: Math.min(50, Math.max(1, Number(e.target.value))) } : pp))} style={{ width: 54, padding: "4px 6px", borderRadius: 8, border: `1px solid ${T.border}`, background: T.surf, color: T.text, fontSize: 12, textAlign: "center", outline: "none" }} />
                  <button onClick={() => set("products", f.products.filter((_, ii) => ii !== i))} style={{ background: "none", border: "none", cursor: "pointer", color: T.red, fontSize: 16 }}>×</button>
                </div>
              ))}
            </Field>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="وقت البداية"><input className="inp" type="time" value={f.startTime} onChange={e => set("startTime", e.target.value)} style={inp} /></Field>
            <Field label="وقت الانتهاء"><input className="inp" type="time" value={f.endTime} onChange={e => set("endTime", e.target.value)} style={inp} /></Field>
          </div>

          <Field label="صلاحية الكود (ساعات)" hint="فارغ = 30 دقيقة">
            <input className="inp" type="number" value={f.expiresHours || ""} onChange={e => set("expiresHours", Number(e.target.value) || null)} placeholder="2 = ساعتان بعد الشراء" style={inp} />
          </Field>

          <Field label={`نطاق الظهور: ${f.radiusM} م`}>
            <input type="range" min={100} max={5000} step={100} value={f.radiusM} onChange={e => set("radiusM", Number(e.target.value))} style={{ width: "100%", margin: "4px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 10, color: T.dim }}>100م</span>
              <Tag bg={`${T.blue}18`} color={T.blue}>{f.radiusM} م</Tag>
              <span style={{ fontSize: 10, color: T.dim }}>5كم</span>
            </div>
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="عدد الأكواد المتاحة">
              <input className="inp" type="number" value={f.maxCodes} onChange={e => set("maxCodes", Number(e.target.value))} style={inp} />
            </Field>
            <Field label="قيمة التوفير للعميل (ر.ق)" hint="للإحصائيات">
              <input className="inp" type="number" value={f.savedValue || ""} onChange={e => set("savedValue", Number(e.target.value))} placeholder="0" style={inp} />
            </Field>
          </div>

          <Field label="حالة العرض">
            <div style={{ display: "flex", gap: 8 }}>
              {[[true, "نشط ✅"], [false, "متوقف ⏸"]].map(([v, l]) => (
                <button key={String(v)} className="tap" onClick={() => set("active", v)} style={{ flex: 1, padding: "10px", borderRadius: 12, border: `1.5px solid ${f.active === v ? (v ? T.green : T.red) : T.border}`, background: f.active === v ? (v ? `${T.green}18` : `${T.red}18`) : T.card, color: f.active === v ? (v ? T.green : T.red) : T.mid, fontWeight: 800, fontSize: 13, cursor: "pointer" }}>{l}</button>
              ))}
            </div>
          </Field>

          <button className="tap" onClick={save} disabled={!f.title.trim() || saving} style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", background: f.title.trim() && !saving ? `linear-gradient(135deg,${T.maroon},${T.m2})` : T.card, color: f.title.trim() && !saving ? "#fff" : T.dim, fontWeight: 900, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: f.title.trim() ? `0 6px 22px ${T.mGlow}` : "none", marginTop: 4 }}>
            {saving ? <><Spin /><span>جاري الحفظ...</span></> : <><span>💾</span><span>{initial ? "حفظ التعديلات" : "نشر العرض"}</span></>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Deal Row ─────────────────────────────────────────────────────────────── */
function DealRow({ deal, onEdit, onToggle, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const usedPct = deal.maxCodes ? (deal.used / deal.maxCodes) * 100 : 0;
  const priceAfterDisc = deal.bogo
    ? deal.originalPrice / 2
    : deal.originalPrice * (1 - deal.disc / 100);
  const rev = priceAfterDisc > 0 ? deal.used * priceAfterDisc : 0;
  const net = rev * (1 - WEJHA_PCT);
  const remaining = deal.maxCodes - deal.used;

  return (
    <div className="fu" style={{ background: T.card, borderRadius: 18, border: `1px solid ${deal.active ? T.maroon + "33" : T.border}`, overflow: "hidden", marginBottom: 10 }}>
      <div style={{ height: 3, background: deal.active ? `linear-gradient(90deg,${T.maroon},${T.gold})` : T.border }} />
      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          {deal.img && <img src={deal.img} alt="" style={{ width: 48, height: 48, borderRadius: 11, objectFit: "cover", flexShrink: 0 }} />}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 800, fontSize: 14, color: T.text, marginBottom: 2 }}>{deal.title}</p>
            {deal.desc && <p style={{ fontSize: 12, color: T.mid, marginBottom: 5, lineHeight: 1.5 }}>{deal.desc}</p>}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {deal.type === "invoice_paid" && <Tag bg={`${T.gold}18`} color={T.gold}>💳 مدفوع</Tag>}
              <Tag bg={`${T.maroon}18`} color={T.maroon}>{deal.bogo ? "1+1" : `${deal.disc}%`}</Tag>
              <Tag bg={T.surf} color={T.mid}>⏰ {deal.startTime}–{deal.endTime}</Tag>
              <Tag bg={remaining < 5 ? `${T.red}18` : `${T.green}18`} color={remaining < 5 ? T.red : T.green}>
                🎫 {remaining} متبقي
              </Tag>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end", flexShrink: 0 }}>
            <Tag bg={deal.active ? `${T.green}18` : T.surf} color={deal.active ? T.green : T.dim}>{deal.active ? "🟢 نشط" : "⏸ متوقف"}</Tag>
            <div style={{ display: "flex", gap: 5 }}>
              <button className="tap" onClick={() => onEdit(deal)} style={{ background: T.surf, border: `1px solid ${T.border}`, borderRadius: 8, padding: "5px 9px", cursor: "pointer", fontSize: 12, color: T.mid }}>✏️</button>
              <button className="tap" onClick={() => onToggle(deal.id)} style={{ background: T.surf, border: `1px solid ${T.border}`, borderRadius: 8, padding: "5px 9px", cursor: "pointer", fontSize: 12, color: T.mid }}>{deal.active ? "⏸" : "▶️"}</button>
              <button className="tap" onClick={() => onDelete(deal.id)} style={{ background: T.redBg, border: `1px solid ${T.red}33`, borderRadius: 8, padding: "5px 9px", cursor: "pointer", fontSize: 12, color: T.red }}>🗑️</button>
            </div>
          </div>
        </div>

        {/* Progress with count */}
        <div style={{ marginTop: 12 }}>
          <div style={{ height: 6, background: T.border, borderRadius: 99, overflow: "hidden" }}>
            <div style={{ width: `${Math.min(usedPct, 100)}%`, height: "100%", background: usedPct > 80 ? `linear-gradient(90deg,${T.red},#FF4400)` : T.maroon, borderRadius: 99, transition: "width .5s" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            <span style={{ fontSize: 10, color: T.dim }}>{deal.used} مُستخدم</span>
            <span style={{ fontSize: 10, color: remaining < 5 ? T.red : T.dim }}>{remaining} متبقي / {deal.maxCodes}</span>
          </div>
        </div>

        {/* ── Price Breakdown — شفافية الأسعار ── */}
        {deal.originalPrice > 0 && (
          <div style={{ background: `${T.surf}`, borderRadius: 13, padding: "11px 13px", border: `1px solid ${T.border}`, marginTop: 10, marginBottom: 2 }}>
            <p style={{ fontSize: 11, fontWeight: 800, color: T.mid, marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
              <span>💡</span> شفافية الأسعار — ما يراه العميل
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 7 }}>
              {deal.bogo ? (
                <>
                  <div style={{ background: T.card, borderRadius: 9, padding: "8px 10px" }}>
                    <p style={{ fontSize: 9, color: T.dim, marginBottom: 2 }}>سعر القطعة</p>
                    <p style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{deal.originalPrice / 2} ر.ق</p>
                  </div>
                  <div style={{ background: T.card, borderRadius: 9, padding: "8px 10px" }}>
                    <p style={{ fontSize: 9, color: T.dim, marginBottom: 2 }}>يدفع العميل</p>
                    <p style={{ fontSize: 13, fontWeight: 800, color: T.gold }}>{deal.originalPrice / 2} ر.ق</p>
                  </div>
                  <div style={{ background: `${T.green}14`, borderRadius: 9, padding: "8px 10px" }}>
                    <p style={{ fontSize: 9, color: T.dim, marginBottom: 2 }}>يوفّر</p>
                    <p style={{ fontSize: 13, fontWeight: 800, color: T.green }}>−{deal.originalPrice / 2} ر.ق</p>
                  </div>
                </>
              ) : deal.type === "invoice_paid" ? (
                <>
                  <div style={{ background: T.card, borderRadius: 9, padding: "8px 10px" }}>
                    <p style={{ fontSize: 9, color: T.dim, marginBottom: 2 }}>الفاتورة الأصلية</p>
                    <p style={{ fontSize: 13, fontWeight: 800, color: T.dim, textDecoration: "line-through" }}>{deal.originalPrice} ر.ق</p>
                  </div>
                  <div style={{ background: T.card, borderRadius: 9, padding: "8px 10px" }}>
                    <p style={{ fontSize: 9, color: T.dim, marginBottom: 2 }}>خصم {deal.disc}%</p>
                    <p style={{ fontSize: 13, fontWeight: 800, color: T.red }}>−{(deal.originalPrice * deal.disc / 100).toFixed(0)} ر.ق</p>
                  </div>
                  <div style={{ background: `${T.green}14`, borderRadius: 9, padding: "8px 10px" }}>
                    <p style={{ fontSize: 9, color: T.dim, marginBottom: 2 }}>يدفع بعد الخصم</p>
                    <p style={{ fontSize: 13, fontWeight: 800, color: T.green }}>{priceAfterDisc.toFixed(0)} ر.ق</p>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ background: T.card, borderRadius: 9, padding: "8px 10px" }}>
                    <p style={{ fontSize: 9, color: T.dim, marginBottom: 2 }}>السعر الأصلي</p>
                    <p style={{ fontSize: 13, fontWeight: 800, color: T.dim, textDecoration: "line-through" }}>{deal.originalPrice} ر.ق</p>
                  </div>
                  <div style={{ background: T.card, borderRadius: 9, padding: "8px 10px" }}>
                    <p style={{ fontSize: 9, color: T.dim, marginBottom: 2 }}>خصم {deal.disc}%</p>
                    <p style={{ fontSize: 13, fontWeight: 800, color: T.red }}>−{(deal.originalPrice * deal.disc / 100).toFixed(0)} ر.ق</p>
                  </div>
                  <div style={{ background: `${T.green}14`, borderRadius: 9, padding: "8px 10px" }}>
                    <p style={{ fontSize: 9, color: T.dim, marginBottom: 2 }}>يدفع العميل</p>
                    <p style={{ fontSize: 13, fontWeight: 800, color: T.green }}>{priceAfterDisc.toFixed(0)} ر.ق</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Revenue */}
        {priceAfterDisc > 0 && (
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            {[["الإيرادات", `${fmt(rev)} ر.ق`, T.gold], ["صافي الربح", `${fmt(net)} ر.ق`, T.green], ["نسبة وِجهة", `${fmt(rev * WEJHA_PCT)} ر.ق`, T.mid]].map(([l, v, c]) => (
              <div key={l} style={{ flex: 1, background: T.surf, borderRadius: 10, padding: "7px 9px" }}>
                <p style={{ fontSize: 9, color: T.dim, marginBottom: 2 }}>{l}</p>
                <p style={{ fontWeight: 800, fontSize: 13, color: c }}>{v}</p>
              </div>
            ))}
          </div>
        )}

        {/* Expand codes */}
        <button onClick={() => setExpanded(e => !e)} style={{ width: "100%", marginTop: 10, padding: "8px", borderRadius: 10, border: `1px solid ${T.border}`, background: "none", color: T.mid, fontSize: 12, cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <span style={{ transform: expanded ? "rotate(180deg)" : "", transition: "transform .2s", display: "inline-block" }}>⌄</span>
          {deal.codes.length} كود {expanded ? "— إخفاء" : "— عرض"}
        </button>

        {expanded && deal.codes.length > 0 && (
          <div className="fu" style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
            {deal.codes.map((c, i) => (
              <div key={i} style={{ background: T.surf, borderRadius: 12, padding: "10px 12px", border: `1px solid ${c.usedAt ? T.green + "33" : T.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <code style={{ flex: 1, fontSize: 13, fontFamily: "'JetBrains Mono',monospace", color: c.usedAt ? T.green : T.maroon, letterSpacing: 1 }}>{c.code}</code>
                  <Tag bg={T.card} color={T.dim} sx={{ fontSize: 10 }}>× {c.qty}</Tag>
                  {c.paid && <Tag bg={`${T.green}18`} color={T.green} sx={{ fontSize: 10 }}>💳 مدفوع</Tag>}
                  {c.usedAt && <Tag bg={`${T.green}18`} color={T.green} sx={{ fontSize: 10 }}>✓ مُستخدم</Tag>}
                </div>
                <div style={{ background: "#fff", borderRadius: 8, padding: "8px 6px 4px", opacity: c.usedAt ? .4 : 1 }}>
                  <Barcode code={c.code} color="#111" bg="#fff" height={35} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                  <span style={{ fontSize: 10, color: T.dim }}>📱 {c.phone}</span>
                  <span style={{ fontSize: 10, color: T.dim }}>{c.usedAt ? `✓ ${c.usedAt}` : c.paidAt}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Analytics ────────────────────────────────────────────────────────────── */
function Analytics({ deals }) {
  const days = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
  const usage = [12, 8, 22, 31, 18, 27, 15];
  const mx = Math.max(...usage);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
      <div style={{ background: T.card, borderRadius: 20, padding: 18, border: `1px solid ${T.border}` }}>
        <p style={{ fontWeight: 800, fontSize: 14, color: T.text, marginBottom: 14 }}>📊 استخدام الأكواد الأسبوعي</p>
        <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 100 }}>
          {days.map((d, i) => (
            <div key={d} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 10, color: T.dim }}>{usage[i]}</span>
              <div style={{ width: "100%", borderRadius: "4px 4px 0 0", height: `${(usage[i] / mx) * 70}px`, background: i === 3 ? `linear-gradient(to top,${T.maroon},${T.gold})` : `${T.maroon}55` }} />
              <span style={{ fontSize: 9, color: T.dim }}>{d.slice(0, 3)}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: T.card, borderRadius: 20, padding: 18, border: `1px solid ${T.border}` }}>
        <p style={{ fontWeight: 800, fontSize: 14, color: T.text, marginBottom: 14 }}>🏆 أفضل العروض</p>
        {[...deals].sort((a, b) => b.used - a.used).map((d, i) => (
          <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 26, height: 26, borderRadius: 7, flexShrink: 0, background: i === 0 ? `${T.gold}22` : T.surf, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: i === 0 ? T.gold : T.dim, fontSize: 13 }}>{i + 1}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.title}</p>
              <div style={{ height: 4, background: T.border, borderRadius: 99, marginTop: 4, overflow: "hidden" }}>
                <div style={{ width: `${deals[0].used ? (d.used / deals[0].used) * 100 : 0}%`, height: "100%", background: i === 0 ? T.gold : T.maroon, borderRadius: 99 }} />
              </div>
            </div>
            <div style={{ textAlign: "left" }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: T.maroon }}>{d.used}</span>
              <p style={{ fontSize: 9, color: T.dim }}>{d.maxCodes - d.used} متبقي</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Dashboard ───────────────────────────────────────────────────────── */
/* ══════════════════════════════════════════════════════════════
   REGISTRATION FLOW
══════════════════════════════════════════════════════════════ */

const CATS_LIST = Object.keys(TITLE_SUGGESTIONS);

const BANKS_QA = [
  "Qatar National Bank (QNB)","Commercial Bank of Qatar","Doha Bank",
  "Al Ahli Bank of Qatar","Qatar Islamic Bank (QIB)","Masraf Al Rayan",
  "Qatar International Islamic Bank","Arab Bank — Qatar","HSBC Qatar",
  "Dukhan Bank",
];

/* progress bar */
function StepBar({ step, total = 4 }) {
  const labels = ["المعلومات الأساسية","السجل التجاري","الحساب البنكي","كلمة المرور"];
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
        {Array.from({ length: total }, (_, i) => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 99,
            background: i < step ? T.maroon : i === step ? `${T.maroon}55` : T.border,
            transition: "background .3s",
          }} />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {labels.map((l, i) => (
          <span key={i} style={{ fontSize: 9, color: i <= step ? T.maroon : T.dim, fontWeight: i === step ? 800 : 400, flex: 1, textAlign: i === 0 ? "right" : i === total-1 ? "left" : "center" }}>{l}</span>
        ))}
      </div>
    </div>
  );
}

/* ── Step 1: Basic Info ─────────────────────────────────────── */
function Step1({ data, onChange, onNext }) {
  const ok = data.storeName && data.ownerName && data.phone && data.email && data.cat && data.city;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ textAlign: "center", marginBottom: 4 }}>
        <div style={{ fontSize: 36, marginBottom: 6 }}>🏪</div>
        <h3 style={{ fontWeight: 900, fontSize: 17, color: T.text, marginBottom: 3 }}>المعلومات الأساسية</h3>
        <p style={{ fontSize: 12, color: T.mid }}>معلومات متجرك كما ستظهر للعملاء</p>
      </div>

      <Field label="اسم المتجر" required>
        <input className="inp" value={data.storeName} onChange={e => onChange("storeName", e.target.value)}
          placeholder="مثال: مطعم الدوحة الملكي" style={inp} />
      </Field>

      <Field label="اسم المالك / المدير" required>
        <input className="inp" value={data.ownerName} onChange={e => onChange("ownerName", e.target.value)}
          placeholder="الاسم الكامل" style={inp} />
      </Field>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field label="رقم الجوال" required>
          <div style={{ display: "flex", background: T.card, borderRadius: 13, border: `1.5px solid ${T.border}`, overflow: "hidden" }}>
            <span style={{ padding: "11px 10px", color: T.mid, fontSize: 12, fontWeight: 700, borderLeft: `1px solid ${T.border}`, flexShrink: 0 }}>🇶🇦 +974</span>
            <input className="inp" type="tel" value={data.phone} onChange={e => onChange("phone", e.target.value.replace(/\D/g,""))}
              placeholder="5xxx xxxx" maxLength={8}
              style={{ ...inp, border: "none", borderRadius: 0, flex: 1, paddingRight: 10 }} />
          </div>
        </Field>
        <Field label="المدينة" required>
          <select className="inp" value={data.city} onChange={e => onChange("city", e.target.value)}
            style={{ ...inp, appearance: "none" }}>
            <option value="">اختر...</option>
            {["الدوحة","الريان","لوسيل","الوكرة","الخور","الشمال","الزلفى","أم صلال"].map(c =>
              <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
      </div>

      <Field label="البريد الإلكتروني" required>
        <input className="inp" type="email" value={data.email} onChange={e => onChange("email", e.target.value)}
          placeholder="store@example.com" style={{ ...inp, direction: "ltr" }} />
      </Field>

      <Field label="نشاط المتجر" required>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
          {CATS_LIST.map(cat => (
            <button key={cat} className="tap" onClick={() => onChange("cat", cat)} style={{
              padding: "10px 12px", borderRadius: 12, textAlign: "right",
              border: `1.5px solid ${data.cat === cat ? T.maroon : T.border}`,
              background: data.cat === cat ? `${T.maroon}18` : T.card,
              color: data.cat === cat ? T.maroon : T.mid,
              fontWeight: data.cat === cat ? 800 : 600, fontSize: 12, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 7,
            }}>
              <span style={{ fontSize: 18 }}>{cat.split(" ")[0]}</span>
              <span style={{ flex: 1 }}>{cat.split(" ").slice(1).join(" ")}</span>
              {data.cat === cat && <span>✓</span>}
            </button>
          ))}
        </div>
      </Field>

      <Field label="وصف المتجر" hint="يظهر للعملاء في التطبيق (اختياري)">
        <textarea className="inp" value={data.storeDesc} onChange={e => onChange("storeDesc", e.target.value.slice(0,100))}
          placeholder="وصف قصير عن متجرك ونشاطك..." rows={2}
          style={{ ...inp, resize: "none", lineHeight: 1.7 }} />
        <p style={{ fontSize: 10, color: T.dim, marginTop: 4, textAlign: "left" }}>{(data.storeDesc||"").length}/100</p>
      </Field>

      <Field label="ساعات العمل" hint="اختياري">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={{ fontSize: 11, color: T.dim, display: "block", marginBottom: 4 }}>يفتح</label>
            <input className="inp" type="time" value={data.openTime} onChange={e => onChange("openTime", e.target.value)} style={inp} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: T.dim, display: "block", marginBottom: 4 }}>يغلق</label>
            <input className="inp" type="time" value={data.closeTime} onChange={e => onChange("closeTime", e.target.value)} style={inp} />
          </div>
        </div>
      </Field>

      <Field label="عدد الفروع" hint="اختياري">
        <div style={{ display: "flex", gap: 7 }}>
          {[1,2,3,"4+"].map(n => (
            <button key={n} className="tap" onClick={() => onChange("branches", String(n))} style={{
              flex: 1, padding: "10px", borderRadius: 12,
              border: `1.5px solid ${data.branches === String(n) ? T.maroon : T.border}`,
              background: data.branches === String(n) ? `${T.maroon}18` : T.card,
              color: data.branches === String(n) ? T.maroon : T.mid,
              fontWeight: 700, fontSize: 13, cursor: "pointer",
            }}>{n}</button>
          ))}
        </div>
      </Field>

      <button className="tap" onClick={onNext} disabled={!ok} style={{
        width: "100%", padding: "14px", borderRadius: 14, border: "none",
        background: ok ? `linear-gradient(135deg,${T.maroon},${T.m2})` : T.card,
        color: ok ? "#fff" : T.dim, fontWeight: 900, fontSize: 15, cursor: ok ? "pointer" : "default",
        boxShadow: ok ? `0 6px 22px ${T.mGlow}` : "none",
      }}>
        التالي — السجل التجاري ←
      </button>
    </div>
  );
}

/* ── Step 2: Commercial License ─────────────────────────────── */
function Step2({ data, onChange, onNext, onBack }) {
  const [crImg, setCrImg] = useState(data.crImg || null);
  const [licImg, setLicImg] = useState(data.licImg || null);
  const [uploading, setUploading] = useState(null);
  const crRef = useRef(); const licRef = useRef();

  async function handleUpload(file, key, setter) {
    if (!file) return;
    setUploading(key);
    try {
      const { b64, kb, w, h } = await processImage(file);
      onChange(key, b64);
      setter(b64);
    } catch (e) { alert(e); }
    finally { setUploading(null); }
  }

  const ok = data.crNumber && data.crExpiry && data.licNumber;

  function DocUploader({ label, hint, value, fileKey, setter, fileRef }) {
    return (
      <Field label={label} hint={hint}>
        <div onClick={() => !uploading && fileRef.current?.click()}
          style={{ height: value ? 120 : 80, borderRadius: 14, border: `2px dashed ${value ? T.maroon+"66" : T.border}`,
            background: T.card, cursor: "pointer", overflow: "hidden", position: "relative",
            display: "flex", alignItems: "center", justifyContent: "center" }}>
          {value
            ? <img src={value} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", background: "#fff" }} />
            : uploading === fileKey
              ? <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}><Spin color={T.maroon} size={20}/><p style={{ fontSize: 11, color: T.mid }}>جاري الرفع...</p></div>
              : <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 26, marginBottom: 4 }}>📄</p>
                  <p style={{ fontSize: 12, color: T.mid }}>اضغط لرفع صورة الوثيقة</p>
                  <p style={{ fontSize: 10, color: T.dim, marginTop: 2 }}>JPG · PNG · أقصى 400 KB</p>
                </div>}
          {value && (
            <button onClick={e => { e.stopPropagation(); onChange(fileKey, null); setter(null); }}
              style={{ position: "absolute", top: 8, left: 8, background: T.redBg, border: `1px solid ${T.red}44`,
                borderRadius: 7, width: 26, height: 26, cursor: "pointer", color: T.red, fontSize: 14,
                display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={e => handleUpload(e.target.files?.[0], fileKey, setter)} style={{ display: "none" }} />
      </Field>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ textAlign: "center", marginBottom: 4 }}>
        <div style={{ fontSize: 36, marginBottom: 6 }}>📋</div>
        <h3 style={{ fontWeight: 900, fontSize: 17, color: T.text, marginBottom: 3 }}>السجل التجاري والرخصة</h3>
        <p style={{ fontSize: 12, color: T.mid }}>مطلوبة للتحقق من هوية المتجر</p>
      </div>

      <div style={{ background: `${T.gold}14`, borderRadius: 13, padding: "10px 14px", border: `1px solid ${T.gold}33` }}>
        <p style={{ fontSize: 11, color: T.gold, fontWeight: 700 }}>🔒 بياناتك آمنة — تُستخدم للتحقق فقط ولا تُشارك مع أطراف ثالثة</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field label="رقم السجل التجاري" required>
          <input className="inp" value={data.crNumber} onChange={e => onChange("crNumber", e.target.value)}
            placeholder="XXXXXXXXXX" style={{ ...inp, direction: "ltr", letterSpacing: 1 }} />
        </Field>
        <Field label="تاريخ الانتهاء" required>
          <input className="inp" type="date" value={data.crExpiry} onChange={e => onChange("crExpiry", e.target.value)} style={inp} />
        </Field>
      </div>

      <DocUploader label="صورة السجل التجاري" hint="اختياري — يُسرّع المراجعة"
        value={crImg} fileKey="crImg" setter={setCrImg} fileRef={crRef} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field label="رقم رخصة البلدية" required>
          <input className="inp" value={data.licNumber} onChange={e => onChange("licNumber", e.target.value)}
            placeholder="رقم الرخصة" style={{ ...inp, direction: "ltr" }} />
        </Field>
        <Field label="تاريخ انتهاء الرخصة">
          <input className="inp" type="date" value={data.licExpiry} onChange={e => onChange("licExpiry", e.target.value)} style={inp} />
        </Field>
      </div>

      <DocUploader label="صورة رخصة البلدية" hint="اختياري"
        value={licImg} fileKey="licImg" setter={setLicImg} fileRef={licRef} />

      <Field label="العنوان التفصيلي">
        <input className="inp" value={data.address} onChange={e => onChange("address", e.target.value)}
          placeholder="اسم الشارع — المنطقة — المبنى" style={inp} />
      </Field>

      <Field label="إحداثيات الموقع (Google Maps)" hint="اختياري — ألصق الرابط">
        <input className="inp" value={data.mapsUrl} onChange={e => onChange("mapsUrl", e.target.value)}
          placeholder="https://maps.google.com/..." style={{ ...inp, direction: "ltr", fontSize: 12 }} />
      </Field>

      <div style={{ display: "flex", gap: 8 }}>
        <button className="tap" onClick={onBack} style={{ flex: 1, padding: "13px", borderRadius: 14, border: `1px solid ${T.border}`, background: T.card, color: T.mid, fontWeight: 700, cursor: "pointer" }}>← رجوع</button>
        <button className="tap" onClick={onNext} disabled={!ok} style={{ flex: 2, padding: "13px", borderRadius: 14, border: "none", background: ok ? `linear-gradient(135deg,${T.maroon},${T.m2})` : T.card, color: ok ? "#fff" : T.dim, fontWeight: 900, cursor: ok ? "pointer" : "default" }}>
          التالي — الحساب البنكي ←
        </button>
      </div>
    </div>
  );
}

/* ── Step 3: Bank Account ────────────────────────────────────── */
function Step3({ data, onChange, onNext, onBack }) {
  const [showIBAN, setShowIBAN] = useState(false);
  const ibanFull = data.iban ? "QA" + "XX" + "X".repeat(data.iban.replace(/\s/g,"").length > 0 ? Math.min(data.iban.replace(/\s/g,"").length, 22) : 22) : "";
  const ok = data.bankName && data.accountName && data.iban;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ textAlign: "center", marginBottom: 4 }}>
        <div style={{ fontSize: 36, marginBottom: 6 }}>🏦</div>
        <h3 style={{ fontWeight: 900, fontSize: 17, color: T.text, marginBottom: 3 }}>الحساب البنكي</h3>
        <p style={{ fontSize: 12, color: T.mid }}>لتحويل نسبتك من المبيعات شهرياً</p>
      </div>

      <div style={{ background: `${T.green}12`, borderRadius: 13, padding: "10px 14px", border: `1px solid ${T.green}22` }}>
        <p style={{ fontSize: 11, color: T.green, fontWeight: 700, marginBottom: 3 }}>💰 كيف يعمل التحويل؟</p>
        <p style={{ fontSize: 11, color: T.mid, lineHeight: 1.7 }}>وِجهة تحتجز 10% من كل كوبون مدفوع • تحويل شهري تلقائي في أول كل شهر • الحد الأدنى للتحويل 50 ر.ق</p>
      </div>

      <Field label="البنك" required>
        <select className="inp" value={data.bankName} onChange={e => onChange("bankName", e.target.value)}
          style={{ ...inp, appearance: "none" }}>
          <option value="">اختر البنك...</option>
          {BANKS_QA.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </Field>

      <Field label="اسم صاحب الحساب" required hint="كما في البطاقة المصرفية">
        <input className="inp" value={data.accountName} onChange={e => onChange("accountName", e.target.value)}
          placeholder="الاسم الكامل بالعربي أو الإنجليزي" style={inp} />
      </Field>

      <Field label="رقم IBAN" required hint="QA + 26 رقم">
        <div style={{ position: "relative" }}>
          <input className="inp" value={data.iban}
            onChange={e => {
              let v = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,"");
              onChange("iban", v);
            }}
            placeholder="QA57CITI00001077711110111111" maxLength={29}
            style={{ ...inp, direction: "ltr", letterSpacing: 1.5, fontFamily: "'JetBrains Mono',monospace",
              paddingLeft: 44 }} />
          <button type="button" onClick={() => setShowIBAN(s=>!s)}
            style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer", color: T.mid, fontSize: 16 }}>
            {showIBAN ? "🙈" : "👁️"}
          </button>
        </div>
        {data.iban && (
          <p style={{ fontSize: 11, marginTop: 5, direction: "ltr", fontFamily: "monospace",
            color: data.iban.startsWith("QA") && data.iban.length === 29 ? T.green : T.gold }}>
            {data.iban.startsWith("QA") && data.iban.length === 29 ? "✓ صالح" : `${data.iban.length}/29 حرف`}
          </p>
        )}
      </Field>

      <Field label="رقم الحساب" hint="اختياري — إضافي للتوثيق">
        <input className="inp" value={data.accountNumber} onChange={e => onChange("accountNumber", e.target.value)}
          placeholder="رقم الحساب البنكي" style={{ ...inp, direction: "ltr" }} />
      </Field>

      <div style={{ background: `${T.maroon}12`, borderRadius: 13, padding: "11px 14px", border: `1px solid ${T.maroon}22` }}>
        <p style={{ fontSize: 11, color: T.maroon, fontWeight: 700, marginBottom: 3 }}>🔐 أمان البيانات البنكية</p>
        <p style={{ fontSize: 11, color: T.mid, lineHeight: 1.7 }}>لا تُخزّن بيانات بطاقتك • IBAN مشفّر بـ AES-256 • لا يمكن تعديله بعد الاعتماد إلا بطلب رسمي</p>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button className="tap" onClick={onBack} style={{ flex: 1, padding: "13px", borderRadius: 14, border: `1px solid ${T.border}`, background: T.card, color: T.mid, fontWeight: 700, cursor: "pointer" }}>← رجوع</button>
        <button className="tap" onClick={onNext} disabled={!ok} style={{ flex: 2, padding: "13px", borderRadius: 14, border: "none", background: ok ? `linear-gradient(135deg,${T.maroon},${T.m2})` : T.card, color: ok ? "#fff" : T.dim, fontWeight: 900, cursor: ok ? "pointer" : "default" }}>
          التالي — كلمة المرور ←
        </button>
      </div>
    </div>
  );
}

/* ── Step 4: Password + Confirm ─────────────────────────────── */
function Step4({ data, onChange, onSubmit, onBack, submitting }) {
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const pw = data.password || "";
  const pw2 = data.password2 || "";
  const strength = pw.length === 0 ? 0 : pw.length < 6 ? 1 : pw.length < 10 || !/[A-Z]/.test(pw) ? 2 : pw.length >= 10 && /[A-Z]/.test(pw) && /[0-9]/.test(pw) ? 4 : 3;
  const strengthLabel = ["","ضعيفة 🔴","متوسطة 🟡","جيدة 🟢","قوية ✅"][strength];
  const strengthColor = [T.dim, T.red, T.gold, T.green, T.green][strength];
  const ok = pw.length >= 8 && pw === pw2 && agreed;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ textAlign: "center", marginBottom: 4 }}>
        <div style={{ fontSize: 36, marginBottom: 6 }}>🔐</div>
        <h3 style={{ fontWeight: 900, fontSize: 17, color: T.text, marginBottom: 3 }}>كلمة المرور</h3>
        <p style={{ fontSize: 12, color: T.mid }}>لتأمين حساب متجرك</p>
      </div>

      <Field label="كلمة المرور" required hint="8 أحرف على الأقل">
        <div style={{ position: "relative" }}>
          <input className="inp" type={showPw ? "text" : "password"} value={pw}
            onChange={e => onChange("password", e.target.value)}
            placeholder="أدخل كلمة المرور" style={{ ...inp, paddingLeft: 44, direction: "ltr" }} />
          <button type="button" onClick={() => setShowPw(s=>!s)} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: T.mid, fontSize: 16 }}>
            {showPw ? "🙈" : "👁️"}
          </button>
        </div>
        {pw && (
          <div style={{ marginTop: 6 }}>
            <div style={{ display: "flex", gap: 3 }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i <= strength ? strengthColor : T.border, transition: "background .3s" }} />
              ))}
            </div>
            <p style={{ fontSize: 10, color: strengthColor, marginTop: 4, fontWeight: 700 }}>{strengthLabel}</p>
          </div>
        )}
      </Field>

      <Field label="تأكيد كلمة المرور" required>
        <div style={{ position: "relative" }}>
          <input className="inp" type={showPw2 ? "text" : "password"} value={pw2}
            onChange={e => onChange("password2", e.target.value)}
            placeholder="أعد كتابة كلمة المرور" style={{ ...inp, paddingLeft: 44, direction: "ltr",
              borderColor: pw2 && pw !== pw2 ? T.red : pw2 && pw === pw2 ? T.green : undefined }} />
          <button type="button" onClick={() => setShowPw2(s=>!s)} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: T.mid, fontSize: 16 }}>
            {showPw2 ? "🙈" : "👁️"}
          </button>
        </div>
        {pw2 && <p style={{ fontSize: 11, marginTop: 4, color: pw === pw2 ? T.green : T.red, fontWeight: 700 }}>
          {pw === pw2 ? "✓ كلمتا المرور متطابقتان" : "✕ كلمتا المرور غير متطابقتين"}
        </p>}
      </Field>

      {/* Terms */}
      <div style={{ background: T.card, borderRadius: 13, padding: "13px 14px", border: `1px solid ${T.border}` }}>
        <button onClick={() => setAgreed(a=>!a)} style={{ width: "100%", display: "flex", alignItems: "flex-start", gap: 10, background: "none", border: "none", cursor: "pointer", textAlign: "right" }}>
          <div style={{ width: 22, height: 22, borderRadius: 7, border: `2px solid ${agreed ? T.maroon : T.border}`, background: agreed ? T.maroon : "transparent", flexShrink: 0, marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s" }}>
            {agreed && <span style={{ color: "#fff", fontSize: 13, fontWeight: 900 }}>✓</span>}
          </div>
          <p style={{ fontSize: 12, color: T.mid, lineHeight: 1.7, flex: 1 }}>
            أوافق على <span style={{ color: T.maroon, fontWeight: 700, textDecoration: "underline" }}>شروط الاستخدام</span> و<span style={{ color: T.maroon, fontWeight: 700, textDecoration: "underline" }}>سياسة الخصوصية</span> وأتعهد بصحة جميع البيانات المقدمة
          </p>
        </button>
      </div>

      {/* Summary */}
      <div style={{ background: T.surf, borderRadius: 13, padding: "12px 14px", border: `1px solid ${T.border}` }}>
        <p style={{ fontSize: 11, color: T.mid, fontWeight: 700, marginBottom: 8 }}>📋 ملخص الطلب</p>
        {[
          ["المتجر", data.storeName],
          ["النشاط", data.cat],
          ["المدينة", data.city],
          ["البنك", data.bankName],
        ].filter(([,v]) => v).map(([k,v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontSize: 11, color: T.dim }}>{k}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: T.text }}>{v}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button className="tap" onClick={onBack} style={{ flex: 1, padding: "13px", borderRadius: 14, border: `1px solid ${T.border}`, background: T.card, color: T.mid, fontWeight: 700, cursor: "pointer" }}>← رجوع</button>
        <button className="tap" onClick={onSubmit} disabled={!ok || submitting} style={{ flex: 2, padding: "13px", borderRadius: 14, border: "none", background: ok && !submitting ? `linear-gradient(135deg,${T.maroon},${T.m2})` : T.card, color: ok && !submitting ? "#fff" : T.dim, fontWeight: 900, cursor: ok && !submitting ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {submitting ? <><Spin /><span>جاري الإرسال...</span></> : <><span>📤</span><span>إرسال الطلب</span></>}
        </button>
      </div>
    </div>
  );
}

/* ── Pending Screen ──────────────────────────────────────────── */
function PendingScreen({ data, onApprove }) {
  const [status, setStatus] = useState("pending"); // pending | approved | rejected
  // Simulate approval for demo
  useEffect(() => {
    const t = setTimeout(() => setStatus("approved"), 6000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ minHeight: "100svh", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 20px" }}>
      <div className="pi" style={{ width: "100%", maxWidth: 420, background: T.surf, borderRadius: 28, padding: "36px 24px", border: `1px solid ${T.border}`, textAlign: "center" }}>
        {status === "pending" && (
          <>
            <div className="pu" style={{ fontSize: 54, marginBottom: 16 }}>⏳</div>
            <h2 style={{ fontWeight: 900, fontSize: 21, color: T.text, marginBottom: 8 }}>طلبك قيد المراجعة</h2>
            <p style={{ fontSize: 13, color: T.mid, lineHeight: 1.8, marginBottom: 20 }}>
              تلقينا طلبك بنجاح! فريق وِجهة يراجع بياناتك خلال <strong style={{ color: T.gold }}>24–48 ساعة</strong>
            </p>
            <div style={{ background: T.card, borderRadius: 14, padding: "14px 16px", marginBottom: 16, textAlign: "right" }}>
              {[
                ["المتجر", data.storeName],
                ["النشاط", data.cat],
                ["البريد", data.email],
                ["الحالة", "🟡 قيد المراجعة"],
              ].map(([k,v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                  <span style={{ fontSize: 12, color: T.dim }}>{k}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{v}</span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 11, color: T.dim }}>سيصلك إشعار واتساب عند الموافقة على<br/><strong style={{ color: T.text, direction: "ltr" }}>+974 {data.phone}</strong></p>
            <div style={{ marginTop: 16, background: `${T.gold}14`, borderRadius: 11, padding: "9px 12px" }}>
              <p style={{ fontSize: 10, color: T.gold }}>Demo: سيتم الاعتماد تلقائياً خلال 6 ثوانٍ...</p>
            </div>
          </>
        )}
        {status === "approved" && (
          <>
            <div style={{ fontSize: 58, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontWeight: 900, fontSize: 22, color: T.green, marginBottom: 8 }}>تم اعتمادك!</h2>
            <p style={{ fontSize: 13, color: T.mid, lineHeight: 1.8, marginBottom: 20 }}>
              مرحباً بك في وِجهة! حسابك نشط الآن ويمكنك البدء بإضافة عروضك
            </p>
            <button className="tap" onClick={onApprove} style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", background: `linear-gradient(135deg,${T.green},#1A9A60)`, color: "#fff", fontWeight: 900, fontSize: 16, cursor: "pointer", boxShadow: `0 6px 22px ${T.green}44` }}>
              ابدأ الآن — لوح التحكم 🚀
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Registration Shell ─────────────────────────────────────── */
function RegisterScreen({ onDone }) {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [data, setData] = useState({
    // step1
    storeName:"", ownerName:"", phone:"", email:"", cat:"", city:"",
    storeDesc:"", openTime:"08:00", closeTime:"22:00", branches:"1",
    // step2
    crNumber:"", crExpiry:"", licNumber:"", licExpiry:"",
    crImg: null, licImg: null, address:"", mapsUrl:"",
    // step3
    bankName:"", accountName:"", iban:"", accountNumber:"",
    // step4
    password:"", password2:"",
  });
  function set(k, v) { setData(p => ({ ...p, [k]: v })); }

  function submit() {
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); setSubmitted(true); }, 1800);
  }

  if (submitted) return <PendingScreen data={data} onApprove={() => onDone(data)} />;

  return (
    <div style={{ minHeight: "100svh", background: T.bg }}>
      {/* Header */}
      <div style={{ position: "sticky", top: 0, zIndex: 40, background: `${T.bg}EE`, backdropFilter: "blur(20px)", borderBottom: `1px solid ${T.border}`, padding: "12px 16px" }}>
        <div style={{ maxWidth: 480, margin: "0 auto", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", gap: 2 }}>
            <div style={{ width: 5, height: 28, background: T.maroon, borderRadius: "4px 0 0 4px" }} />
            <div style={{ width: 2, height: 28, background: "#ddd" }} />
            <div style={{ width: 28, height: 28, background: T.surf, borderRadius: "0 8px 8px 0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🏷️</div>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 900, fontSize: 15, color: T.text, lineHeight: 1 }}>وِجهة</p>
            <p style={{ fontSize: 9, color: T.maroon, fontWeight: 700 }}>تسجيل التاجر</p>
          </div>
          <Tag bg={`${T.maroon}18`} color={T.maroon} sx={{ fontSize: 10 }}>الخطوة {step+1}/4</Tag>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "20px 16px 60px" }}>
        <StepBar step={step} />
        {step === 0 && <Step1 data={data} onChange={set} onNext={() => setStep(1)} />}
        {step === 1 && <Step2 data={data} onChange={set} onNext={() => setStep(2)} onBack={() => setStep(0)} />}
        {step === 2 && <Step3 data={data} onChange={set} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
        {step === 3 && <Step4 data={data} onChange={set} onSubmit={submit} onBack={() => setStep(2)} submitting={submitting} />}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ACCOUNT PAGE (inside dashboard)
══════════════════════════════════════════════════════════════ */
function AccountPage({ merchantData, onLogout }) {
  const isApproved = true; // after approval
  const [email, setEmail] = useState(merchantData.email || "");
  const [showPw, setShowPw] = useState(false);
  const [pw, setPw] = useState({ old:"", new1:"", new2:"" });
  const [pwSaved, setPwSaved] = useState(false);
  const [emailSaved, setEmailSaved] = useState(false);

  function saveEmail() { setEmailSaved(true); setTimeout(() => setEmailSaved(false), 2500); }
  function savePw() {
    if (!pw.old || pw.new1.length < 8 || pw.new1 !== pw.new2) return;
    setPwSaved(true); setPw({ old:"", new1:"", new2:"" });
    setTimeout(() => setPwSaved(false), 2500);
  }

  const LOCKED_FIELDS = [
    { icon:"🏪", label:"اسم المتجر", value: merchantData.storeName },
    { icon:"👤", label:"اسم المالك", value: merchantData.ownerName },
    { icon:"📱", label:"رقم الجوال", value: `+974 ${merchantData.phone}` },
    { icon:"🗂️", label:"السجل التجاري", value: merchantData.crNumber },
    { icon:"📋", label:"رقم الرخصة", value: merchantData.licNumber },
    { icon:"🏦", label:"البنك", value: merchantData.bankName },
    { icon:"💳", label:"IBAN", value: merchantData.iban ? "QA••••••••••••••••••••••" : "—" },
    { icon:"🏙️", label:"المدينة", value: merchantData.city },
    { icon:"🏷️", label:"نشاط المتجر", value: merchantData.cat },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
      {/* Profile card */}
      <div className="fu" style={{ background: `linear-gradient(150deg,#1A0D10,#1E1020)`, borderRadius: 22, padding: "22px 18px", border: `1px solid ${T.maroon}33`, textAlign: "center" }}>
        <div style={{ width: 70, height: 70, borderRadius: "50%", margin: "0 auto 12px", background: `linear-gradient(135deg,${T.maroon},${T.m2})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30 }}>🏪</div>
        <p style={{ fontWeight: 900, fontSize: 18, color: T.text, marginBottom: 4 }}>{merchantData.storeName}</p>
        <div style={{ display: "flex", gap: 7, justifyContent: "center", flexWrap: "wrap" }}>
          <Tag bg={`${T.green}18`} color={T.green}>✅ معتمد</Tag>
          <Tag bg={`${T.gold}18`} color={T.gold}>{merchantData.cat}</Tag>
          <Tag bg={`${T.maroon}18`} color={T.maroon}>🇶🇦 {merchantData.city}</Tag>
        </div>
      </div>

      {/* Locked fields */}
      <div className="fu" style={{ background: T.card, borderRadius: 20, padding: "16px 18px", border: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <p style={{ fontWeight: 800, fontSize: 14, color: T.text, flex: 1 }}>🔒 البيانات المؤمّنة</p>
          <Tag bg={`${T.red}18`} color={T.red} sx={{ fontSize: 10 }}>لا يمكن تعديلها بعد الاعتماد</Tag>
        </div>
        {LOCKED_FIELDS.map(({ icon, label, value }) => value ? (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 10, color: T.dim, marginBottom: 2 }}>{label}</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: T.mid }}>{value}</p>
            </div>
            <span style={{ fontSize: 13, color: T.dim }}>🔒</span>
          </div>
        ) : null)}
        <div style={{ marginTop: 10, background: `${T.gold}14`, borderRadius: 11, padding: "9px 12px" }}>
          <p style={{ fontSize: 11, color: T.gold }}>📞 لتعديل هذه البيانات تواصل مع فريق وِجهة عبر واتساب</p>
        </div>
      </div>

      {/* Editable: email */}
      <div className="fu" style={{ background: T.card, borderRadius: 20, padding: "16px 18px", border: `1px solid ${T.border}` }}>
        <p style={{ fontWeight: 800, fontSize: 14, color: T.text, marginBottom: 14 }}>✏️ يمكن تعديلها</p>
        <Field label="البريد الإلكتروني">
          <div style={{ display: "flex", gap: 8 }}>
            <input className="inp" type="email" value={email} onChange={e => setEmail(e.target.value)}
              style={{ ...inp, flex: 1, direction: "ltr" }} />
            <button className="tap" onClick={saveEmail} style={{ padding: "11px 14px", borderRadius: 12, border: "none", background: emailSaved ? T.green : T.maroon, color: "#fff", fontWeight: 800, cursor: "pointer", fontSize: 13, flexShrink: 0, transition: "background .3s" }}>
              {emailSaved ? "✓" : "حفظ"}
            </button>
          </div>
        </Field>
      </div>

      {/* Change password */}
      <div className="fu" style={{ background: T.card, borderRadius: 20, padding: "16px 18px", border: `1px solid ${T.border}` }}>
        <button onClick={() => setShowPw(s => !s)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", cursor: "pointer", marginBottom: showPw ? 14 : 0 }}>
          <p style={{ fontWeight: 800, fontSize: 14, color: T.text }}>🔑 تغيير كلمة المرور</p>
          <span style={{ color: T.dim, transform: showPw ? "rotate(180deg)" : "", transition: "transform .2s", fontSize: 18 }}>⌄</span>
        </button>
        {showPw && (
          <div className="fu" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[["old","كلمة المرور الحالية"],["new1","كلمة المرور الجديدة"],["new2","تأكيد كلمة المرور الجديدة"]].map(([k,label]) => (
              <Field key={k} label={label}>
                <input className="inp" type="password" value={pw[k]} onChange={e => setPw(p => ({...p,[k]:e.target.value}))}
                  placeholder="••••••••" style={{ ...inp, direction: "ltr" }} />
              </Field>
            ))}
            {pw.new1 && pw.new2 && pw.new1 !== pw.new2 && (
              <p style={{ fontSize: 11, color: T.red, fontWeight: 700 }}>✕ كلمتا المرور غير متطابقتين</p>
            )}
            <button className="tap" onClick={savePw}
              disabled={!pw.old || pw.new1.length < 8 || pw.new1 !== pw.new2}
              style={{ width: "100%", padding: "12px", borderRadius: 13, border: "none",
                background: pwSaved ? T.green : T.maroon, color: "#fff", fontWeight: 800, cursor: "pointer", transition: "background .3s" }}>
              {pwSaved ? "✅ تم التغيير" : "حفظ كلمة المرور الجديدة"}
            </button>
          </div>
        )}
      </div>

      {/* Logout */}
      <button className="tap" onClick={onLogout} style={{ width: "100%", padding: "14px", borderRadius: 16, border: `1px solid ${T.red}44`, background: `${T.red}12`, color: T.red, fontWeight: 800, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <span>🚪</span><span>تسجيل الخروج</span>
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN APP SHELL
══════════════════════════════════════════════════════════════ */
export default function App() {
  const [screen, setScreen] = useState("register"); // register | dashboard
  const [merchantData, setMerchantData] = useState(null);

  if (screen === "register") {
    return <RegisterScreen onDone={data => { setMerchantData(data); setScreen("dashboard"); }} />;
  }
  return <MerchantDashboard merchantData={merchantData} onLogout={() => { setMerchantData(null); setScreen("register"); }} />;
}

function MerchantDashboard({ merchantData, onLogout }) {
  const md = merchantData || { storeName:"مطعم الدوحة الملكي", cat:"🍽️ مطاعم", city:"الدوحة", phone:"55001234", email:"store@example.com", ownerName:"المدير", crNumber:"1234567890", licNumber:"LIC-001", bankName:"QNB", iban:"QA57CITI00001077711110111111" };
  const [deals, setDeals] = useState(INIT_DEALS);
  const [tab, setTab] = useState("deals");
  const [formDeal, setFormDeal] = useState(null);
  const [storeName, setStoreName] = useState(md.storeName);
  const [storePhone, setStorePhone] = useState(md.phone);
  const [storeCat, setStoreCat] = useState(md.cat || "🍽️ مطاعم");
  const [savedSettings, setSavedSettings] = useState(false);

  function handleSaveDeal(deal) {
    setDeals(p => p.find(d => d.id === deal.id) ? p.map(d => d.id === deal.id ? deal : d) : [...p, deal]);
  }
  function toggleDeal(id) { setDeals(p => p.map(d => d.id === id ? { ...d, active: !d.active } : d)); }
  function deleteDeal(id) { if (window.confirm("حذف هذا العرض؟")) setDeals(p => p.filter(d => d.id !== id)); }

  // Use code: decrement count + mark code as used
  function handleUseCode(dealId, code) {
    setDeals(p => p.map(d => {
      if (d.id !== dealId) return d;
      return {
        ...d,
        used: d.used + 1,
        codes: d.codes.map(c => c.code === code ? { ...c, usedAt: new Date().toLocaleString("ar-QA") } : c),
      };
    }));
  }

  const TABS = [
    { id: "deals", icon: "🏷️", label: "العروض" },
    { id: "validate", icon: "🔍", label: "التحقق" },
    { id: "analytics", icon: "📊", label: "الإحصائيات" },
    { id: "account", icon: "👤", label: "حسابي" },
  ];

  return (
    <div style={{ minHeight: "100svh", background: T.bg }}>
      <header style={{ position: "sticky", top: 0, zIndex: 40, background: `${T.bg}EE`, backdropFilter: "blur(20px)", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 540, margin: "0 auto", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ display: "flex", gap: 2 }}>
              <div style={{ width: 5, height: 32, background: T.maroon, borderRadius: "4px 0 0 4px" }} />
              <div style={{ width: 3, height: 32, background: "#ddd", clipPath: "polygon(0 0,100% 5%,100% 95%,0 100%)" }} />
              <div style={{ width: 32, height: 32, background: T.surf, borderRadius: "0 9px 9px 0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🏪</div>
            </div>
            <div>
              <p style={{ fontWeight: 900, fontSize: 15, color: T.text, lineHeight: 1 }}>{storeName}</p>
              <p style={{ fontSize: 9, color: T.maroon, fontWeight: 700, lineHeight: 1, marginTop: 2 }}>لوحة التاجر 🇶🇦</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {storeCat && <Tag bg={`${T.maroon}18`} color={T.maroon} sx={{ fontSize: 10 }}>{storeCat.split(" ")[0]} {storeCat.split(" ").slice(1).join(" ")}</Tag>}
            <Tag bg={`${T.green}18`} color={T.green} sx={{ fontSize: 11 }}>🟢 نشط</Tag>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 540, margin: "0 auto", padding: "16px 14px 82px", display: "flex", flexDirection: "column", gap: 13 }}>
        <StatsRow deals={deals} />

        {tab === "deals" && (
          <>
            <button className="tap" onClick={() => setFormDeal("new")} style={{ width: "100%", padding: "13px", borderRadius: 16, border: "none", background: `linear-gradient(135deg,${T.maroon},${T.m2})`, color: "#fff", fontWeight: 900, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: `0 6px 22px ${T.mGlow}` }}>
              <span style={{ fontSize: 18 }}>+</span> إضافة عرض جديد
            </button>
            {deals.map(d => (
              <DealRow key={d.id} deal={d} onEdit={d => setFormDeal(d)} onToggle={toggleDeal} onDelete={deleteDeal} />
            ))}
          </>
        )}

        {tab === "validate" && <ValidatePanel deals={deals} onUseCode={handleUseCode} />}

        {tab === "analytics" && <Analytics deals={deals} />}

        {tab === "account" && (
          <AccountPage merchantData={md} onLogout={onLogout} />
        )}
      </main>

      <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 40, background: `${T.surf}F2`, backdropFilter: "blur(20px)", borderTop: `1px solid ${T.border}`, display: "flex" }}>
        {TABS.map(({ id, icon, label }) => (
          <button key={id} className="tap" onClick={() => setTab(id)} style={{ flex: 1, padding: "12px 4px 10px", border: "none", cursor: "pointer", background: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <span style={{ fontSize: 20, filter: tab === id ? "none" : "grayscale(1) opacity(.4)" }}>{icon}</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: tab === id ? T.maroon : T.dim }}>{label}</span>
            {tab === id && <div style={{ width: 18, height: 2, background: T.maroon, borderRadius: 99 }} />}
          </button>
        ))}
      </nav>

      {formDeal && (
        <DealForm initial={formDeal === "new" ? null : formDeal} onSave={handleSaveDeal} onClose={() => setFormDeal(null)} storeCat={storeCat} />
      )}
    </div>
  );
}
