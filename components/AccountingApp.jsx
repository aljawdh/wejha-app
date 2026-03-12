'use client'
import { useState, useEffect, useMemo } from "react";
import { AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

/* ── Fonts ── */
if (!document.getElementById("wa4s")) {
  const lnk = document.createElement("link");
  lnk.rel = "stylesheet";
  lnk.href = "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap";
  document.head.appendChild(lnk);
  const sty = document.createElement("style");
  sty.id = "wa4s";
  sty.textContent = `
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html,body{font-family:'Syne',sans-serif;direction:rtl;background:#06090F;color:#C4D4E4;min-height:100vh}
    input,button,select,textarea,th,td{font-family:'Syne',sans-serif}
    .mn{font-family:'JetBrains Mono',monospace!important}
    ::-webkit-scrollbar{width:3px;height:3px}
    ::-webkit-scrollbar-thumb{background:#141E2C;border-radius:99px}
    input[type=date]{color-scheme:dark}
    @keyframes fu{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
    @keyframes fi{from{opacity:0}to{opacity:1}}
    @keyframes pi{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:scale(1)}}
    @keyframes sp{to{transform:rotate(360deg)}}
    @keyframes pu{0%,100%{opacity:1}50%{opacity:.25}}
    .fu{animation:fu .3s cubic-bezier(.22,1,.36,1) both}
    .fi{animation:fi .18s ease both}
    .pi{animation:pi .26s ease both}
    .rh:hover{background:#0C1620!important;cursor:pointer}
    .foc:focus{outline:none!important;border-color:#0FD090!important;box-shadow:0 0 0 2px #0FD09016!important}
  `;
  document.head.appendChild(sty);
}

const G = {
  bg:"#06090F", s1:"#0A1018", s2:"#0E1520", s3:"#121D2A", bo:"#162030", bh:"#1C2C3E",
  ac:"#0FD090", go:"#F0B83A", re:"#EF4560", bl:"#3898F8", pu:"#9268F8", or:"#F07A30",
  tx:"#C4D4E4", mi:"#4A6880", di:"#18283A",
};

const fmt = (n) => Number(n || 0).toLocaleString("ar-QA");

function Spin({ size = 12, color = G.ac }) {
  return (
    <div style={{
      width: size, height: size, flexShrink: 0,
      border: `2px solid ${color}22`, borderTopColor: color,
      borderRadius: "50%", animation: "sp .7s linear infinite"
    }} />
  );
}

function Btn({ children, onClick, color = G.ac, small, outline, disabled, loading, style = {} }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
        padding: small ? "5px 11px" : "9px 16px",
        borderRadius: small ? 7 : 10,
        border: outline ? `1px solid ${color}44` : "none",
        background: outline ? "transparent" : disabled ? G.s3 : color,
        color: outline ? color : G.bg,
        fontWeight: 700, fontSize: small ? 11 : 13,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.45 : 1,
        fontFamily: "'Syne',sans-serif", ...style
      }}
    >
      {loading && <Spin size={11} color={outline ? color : G.bg} />}
      {children}
    </button>
  );
}

function Chip({ label, active, onClick, color = G.ac }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "5px 13px", borderRadius: 99,
        border: `1px solid ${active ? color + "55" : G.bo}`,
        background: active ? `${color}14` : G.s2,
        color: active ? color : G.mi,
        fontWeight: 600, fontSize: 12, cursor: "pointer",
        whiteSpace: "nowrap", fontFamily: "'Syne',sans-serif"
      }}
    >
      {label}
    </button>
  );
}

function Card({ children, style = {}, delay = 0, noPad }) {
  return (
    <div
      className="fu"
      style={{
        background: G.s2, borderRadius: 14, border: `1px solid ${G.bo}`,
        ...(noPad ? {} : { padding: "16px 18px" }),
        animationDelay: `${delay}s`, ...style
      }}
    >
      {children}
    </div>
  );
}

function Badge({ status, label }) {
  const map = {
    paid:      { c: G.ac, t: "مدفوع ✓" },
    pending:   { c: G.go, t: "معلق ⏳" },
    hold:      { c: G.or, t: "محجوز ⚠" },
    overdue:   { c: G.re, t: "متأخر 🔴" },
    active:    { c: G.ac, t: "نشط" },
    suspended: { c: G.re, t: "موقوف" },
    posted:    { c: G.ac, t: "مرحّل ✓" },
    draft:     { c: G.mi, t: "مسودة" },
    credit:    { c: G.pu, t: "دائن" },
    debit:     { c: G.bl, t: "مدين" },
  };
  const m = map[status] || { c: G.mi, t: label || status };
  return (
    <span style={{
      background: `${m.c}18`, color: m.c,
      borderRadius: 99, padding: "2px 9px",
      fontSize: 11, fontWeight: 700, whiteSpace: "nowrap"
    }}>
      {m.t}
    </span>
  );
}

function SectionHead({ icon, title, sub, action, color = G.ac }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: `${color}18`, display: "flex",
          alignItems: "center", justifyContent: "center",
          fontSize: 15, flexShrink: 0
        }}>{icon}</div>
        <div>
          <p style={{ fontWeight: 700, fontSize: 14, color: G.tx }}>{title}</p>
          {sub && <p style={{ fontSize: 11, color: G.mi, marginTop: 1 }}>{sub}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

const ChartTip = ({ active, payload, label, unit = "ر.ق" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: G.s3, border: `1px solid ${G.bh}`, borderRadius: 9, padding: "8px 12px", fontSize: 11 }}>
      <p style={{ color: G.mi, marginBottom: 4, fontWeight: 600 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="mn" style={{ color: p.color, fontWeight: 700 }}>
          {p.name}: {Number(p.value).toLocaleString("ar-QA")} {unit}
        </p>
      ))}
    </div>
  );
};

/* ── Data ── */
const MONTHS = ["أكتوبر", "نوفمبر", "ديسمبر", "يناير", "فبراير", "مارس"];

function genMonthly(seed) {
  return MONTHS.map((m, i) => {
    const sales    = Math.round(seed * (0.65 + i * 0.09 + Math.sin(i + seed * 0.01) * 0.12));
    const purchases = Math.round(sales * 0.08);
    const wejha    = Math.round(sales * 0.1);
    const vat      = Math.round(wejha * 0.05);
    const refunds  = Math.round(sales * 0.018);
    const net      = wejha - vat - refunds;
    const budget   = Math.round(seed * (0.8 + i * 0.08));
    return { m, sales, purchases, wejha, vat, refunds, net, budget, variance: wejha - budget, coupons: Math.round(sales / 38) };
  });
}

const ALL_MERCHANTS = [
  { id: "M001", name: "مطعم الدوحة الملكي",   cat: "🍽️", city: "الدوحة",  status: "active",    bank: "QNB",       iban: "QA57QNB0001", owner: "أحمد محمد",    joined: "2025-10-01", vatNo: "QA-VAT-001", cr: "1234567890", crExp: "2027-01-01", seed: 6200 },
  { id: "M002", name: "كافيه لؤلؤة الخليج",   cat: "☕",  city: "لوسيل",   status: "active",    bank: "QIB",       iban: "QA57QIB0002", owner: "سارة علي",     joined: "2025-11-15", vatNo: "QA-VAT-002", cr: "9876543210", crExp: "2027-05-15", seed: 4820 },
  { id: "M003", name: "بوتيك وردة قطر",       cat: "👗",  city: "الريان",  status: "active",    bank: "Doha Bank", iban: "QA57DOH0003", owner: "نورة خالد",    joined: "2025-09-20", vatNo: "QA-VAT-003", cr: "1122334455", crExp: "2026-08-20", seed: 9100 },
  { id: "M004", name: "الأمين هايبر ماركت",   cat: "🛒",  city: "الدوحة",  status: "hold",      bank: "CBQ",       iban: "QA57CBQ0004", owner: "طارق سالم",    joined: "2025-08-05", vatNo: "QA-VAT-004", cr: "5566778899", crExp: "2025-01-01", seed: 1200 },
  { id: "M005", name: "صيدلية الرفاء",        cat: "💊",  city: "الوكرة",  status: "active",    bank: "Masraf",    iban: "QA57MAS0005", owner: "محمد الرفاعي", joined: "2026-01-10", vatNo: "QA-VAT-005", cr: "3344556677", crExp: "2027-02-10", seed: 3400 },
  { id: "M006", name: "سبا لوتس الملكي",      cat: "🧖",  city: "الدوحة",  status: "active",    bank: "QNB",       iban: "QA57QNB0006", owner: "لمى القحطاني", joined: "2025-10-01", vatNo: "QA-VAT-006", cr: "6677889900", crExp: "2027-09-30", seed: 6300 },
  { id: "M007", name: "نادي الدوحة الرياضي",  cat: "🏋️", city: "الدوحة",  status: "suspended", bank: "HSBC",      iban: "QA57HSB0007", owner: "عمر الجاسم",   joined: "2025-12-01", vatNo: "QA-VAT-007", cr: "7788990011", crExp: "2026-03-15", seed: 800  },
];

const MONTHLY_AGG = MONTHS.map((m, i) => {
  const sales    = [18200, 24500, 38700, 31200, 42800, 21420][i];
  const wejha    = Math.round(sales * 0.1);
  const vat      = Math.round(wejha * 0.05);
  const purchases = Math.round(sales * 0.08);
  const refunds  = Math.round(sales * 0.018);
  const budget   = Math.round(sales * 0.95);
  const payouts  = Math.round(sales * 0.87);
  return {
    m, sales, wejha, vat, purchases, refunds, budget, payouts,
    net: wejha - vat - refunds,
    variance: wejha - budget,
    cashIn: wejha, cashOut: payouts + vat,
    coupons: [312, 428, 691, 544, 748, 380][i]
  };
});

const JOURNAL_ENTRIES = [
  { id: "JE-041", date: "2026-03-31", type: "revenue",    desc: "تحصيل عائد وِجهة — مارس",        dr: 2142, cr: 0,    acc: "1100-حسابات القبض",   ref: "INV-041",  status: "posted" },
  { id: "JE-040", date: "2026-03-31", type: "tax",        desc: "ضريبة VAT مستحقة — مارس",        dr: 0,    cr: 1071, acc: "2200-ضريبة VAT",       ref: "VAT-MAR",  status: "posted" },
  { id: "JE-039", date: "2026-03-30", type: "payout",     desc: "تحويل — بوتيك وردة قطر",         dr: 0,    cr: 8190, acc: "1000-النقدية",         ref: "PAY-M003", status: "posted" },
  { id: "JE-038", date: "2026-03-29", type: "refund",     desc: "استرداد كوبون ملغى — M002",      dr: 48,   cr: 0,    acc: "5100-استردادات",       ref: "REF-009",  status: "posted" },
  { id: "JE-037", date: "2026-03-28", type: "revenue",    desc: "تحصيل عائد وِجهة — دوري",        dr: 890,  cr: 0,    acc: "1100-حسابات القبض",   ref: "INV-040",  status: "posted" },
  { id: "JE-036", date: "2026-03-25", type: "expense",    desc: "رسوم بنكية — QNB",               dr: 0,    cr: 45,   acc: "5200-مصاريف بنكية",    ref: "BANK-25",  status: "posted" },
  { id: "JE-035", date: "2026-03-22", type: "payout",     desc: "تحويل — سبا لوتس الملكي",       dr: 0,    cr: 5670, acc: "1000-النقدية",         ref: "PAY-M006", status: "posted" },
  { id: "JE-034", date: "2026-03-20", type: "adjustment", desc: "تسوية فرق تقريب — فبراير",       dr: 3,    cr: 0,    acc: "5300-تعديلات",         ref: "ADJ-FEB",  status: "posted" },
  { id: "JE-033", date: "2026-03-18", type: "tax",        desc: "دفع VAT — فبراير للهيئة",       dr: 0,    cr: 2140, acc: "2200-ضريبة VAT",       ref: "VAT-FEB",  status: "posted" },
  { id: "JE-032", date: "2026-03-15", type: "revenue",    desc: "تحصيل عائد وِجهة — دوري",        dr: 1240, cr: 0,    acc: "1100-حسابات القبض",   ref: "INV-038",  status: "posted" },
  { id: "JE-031", date: "2026-03-10", type: "payout",     desc: "تحويل — كافيه لؤلؤة الخليج",   dr: 0,    cr: 4338, acc: "1000-النقدية",         ref: "PAY-M002", status: "posted" },
  { id: "JE-030", date: "2026-03-05", type: "expense",    desc: "مصاريف تشغيلية — خدمات سحابية", dr: 0,    cr: 800,  acc: "5400-مصاريف تشغيل",   ref: "EXP-MAR",  status: "draft"  },
];

/* ════════════════════════════════════
   FILTER BAR
════════════════════════════════════ */
function FilterBar({ schema, filters, setFilters }) {
  const activeCount = Object.values(filters).filter(v => Array.isArray(v) ? v.length > 0 : !!v).length;

  function toggleChip(key, val) {
    setFilters(prev => {
      const cur = prev[key] || [];
      return { ...prev, [key]: cur.includes(val) ? cur.filter(x => x !== val) : [...cur, val] };
    });
  }

  return (
    <div style={{ background: G.s1, borderRadius: 14, padding: "14px 16px", border: `1px solid ${G.bo}`, marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 14 }}>🎛️</span>
        <p style={{ fontSize: 12, fontWeight: 700, color: G.ac }}>الفلاتر والتخصيص</p>
        {activeCount > 0 && (
          <span style={{ background: `${G.ac}18`, color: G.ac, borderRadius: 99, padding: "1px 8px", fontSize: 11, fontWeight: 700 }}>
            {activeCount} نشط
          </span>
        )}
        <div style={{ flex: 1 }} />
        <button
          onClick={() => setFilters({})}
          style={{ fontSize: 11, color: G.mi, background: "none", border: `1px solid ${G.bo}`, borderRadius: 7, padding: "3px 10px", cursor: "pointer", fontFamily: "'Syne',sans-serif" }}
        >
          مسح الكل
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {schema.map(f => (
          <div key={f.key} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <p style={{ fontSize: 11, color: G.mi, fontWeight: 700, minWidth: 88, paddingTop: 5, flexShrink: 0 }}>{f.label}</p>
            {f.type === "chips" && (
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {f.options.map(o => (
                  <Chip
                    key={o.value}
                    label={o.label}
                    color={o.color || G.ac}
                    active={(filters[f.key] || []).includes(o.value)}
                    onClick={() => toggleChip(f.key, o.value)}
                  />
                ))}
              </div>
            )}
            {f.type === "range" && (
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input
                  className="foc"
                  type="number"
                  placeholder="من"
                  value={filters[f.key + "_from"] || ""}
                  onChange={e => setFilters(p => ({ ...p, [f.key + "_from"]: e.target.value }))}
                  style={{ width: 100, padding: "5px 10px", borderRadius: 8, border: `1px solid ${G.bo}`, background: G.s2, fontSize: 12, color: G.tx }}
                />
                <span style={{ color: G.mi }}>—</span>
                <input
                  className="foc"
                  type="number"
                  placeholder="إلى"
                  value={filters[f.key + "_to"] || ""}
                  onChange={e => setFilters(p => ({ ...p, [f.key + "_to"]: e.target.value }))}
                  style={{ width: 100, padding: "5px 10px", borderRadius: 8, border: `1px solid ${G.bo}`, background: G.s2, fontSize: 12, color: G.tx }}
                />
                <span style={{ fontSize: 11, color: G.mi }}>ر.ق</span>
              </div>
            )}
            {f.type === "date" && (
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input className="foc" type="date" value={filters[f.key + "_from"] || ""}
                  onChange={e => setFilters(p => ({ ...p, [f.key + "_from"]: e.target.value }))}
                  style={{ padding: "5px 10px", borderRadius: 8, border: `1px solid ${G.bo}`, background: G.s2, fontSize: 12, color: G.tx }} />
                <span style={{ color: G.mi, fontSize: 11 }}>إلى</span>
                <input className="foc" type="date" value={filters[f.key + "_to"] || ""}
                  onChange={e => setFilters(p => ({ ...p, [f.key + "_to"]: e.target.value }))}
                  style={{ padding: "5px 10px", borderRadius: 8, border: `1px solid ${G.bo}`, background: G.s2, fontSize: 12, color: G.tx }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════
   MERCHANT MODAL
════════════════════════════════════ */
function MerchantModal({ merchant, onClose }) {
  const [dtab, setDtab] = useState("ledger");
  const monthly = useMemo(() => genMonthly(merchant.seed), [merchant.seed]);
  const totals = {
    sales:     monthly.reduce((s, x) => s + x.sales, 0),
    wejha:     monthly.reduce((s, x) => s + x.wejha, 0),
    vat:       monthly.reduce((s, x) => s + x.vat, 0),
    purchases: monthly.reduce((s, x) => s + x.purchases, 0),
    refunds:   monthly.reduce((s, x) => s + x.refunds, 0),
    net:       monthly.reduce((s, x) => s + x.net, 0),
  };
  const overdue = merchant.status === "hold" ? Math.round(totals.wejha * 0.15) : 0;
  const crExpired = new Date(merchant.crExp) < new Date();

  const DTABS = [["ledger", "📒 دفتر الحساب"], ["aging", "⏰ تقادم الديون"], ["vat", "🧾 ضريبة VAT"], ["info", "📋 بيانات"]];

  return (
    <div
      className="fi"
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.88)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }}
    >
      <div
        className="pi"
        onClick={e => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 860, background: G.s1, borderRadius: 20, border: `1px solid ${G.bh}`, maxHeight: "92vh", display: "flex", flexDirection: "column", overflow: "hidden" }}
      >
        {/* Header */}
        <div style={{ padding: "16px 22px 12px", borderBottom: `1px solid ${G.bo}`, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 13, background: `${G.ac}12`, border: `1px solid ${G.ac}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
              {merchant.cat}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3, flexWrap: "wrap" }}>
                <p style={{ fontWeight: 800, fontSize: 17, color: G.tx }}>{merchant.name}</p>
                <Badge status={merchant.status} />
                {overdue > 0 && <span style={{ background: `${G.re}18`, color: G.re, borderRadius: 99, padding: "2px 9px", fontSize: 11, fontWeight: 700 }}>متأخر {fmt(overdue)} ر.ق</span>}
                {crExpired && <span style={{ background: `${G.re}18`, color: G.re, borderRadius: 99, padding: "2px 9px", fontSize: 11, fontWeight: 700 }}>⚠ سجل منتهي!</span>}
              </div>
              <p className="mn" style={{ fontSize: 11, color: G.mi }}>{merchant.id} · {merchant.vatNo} · {merchant.bank} — {merchant.iban}</p>
            </div>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 9, background: G.s2, border: `1px solid ${G.bo}`, cursor: "pointer", color: G.mi, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
          </div>
          {/* KPI strip */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 8 }}>
            {[["المبيعات", totals.sales, G.bl], ["المشتريات", totals.purchases, G.pu], ["عائد وِجهة", totals.wejha, G.ac], ["VAT", totals.vat, G.go], ["استردادات", totals.refunds, G.or], ["صافي", totals.net, G.ac]].map(([l, v, c]) => (
              <div key={l} style={{ background: G.s2, borderRadius: 9, padding: "9px 11px", border: `1px solid ${G.bo}` }}>
                <p className="mn" style={{ fontSize: 14, fontWeight: 700, color: c, marginBottom: 2 }}>{fmt(v)}</p>
                <p style={{ fontSize: 9, color: G.mi }}>{l} ر.ق</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sub-tabs */}
        <div style={{ display: "flex", borderBottom: `1px solid ${G.bo}`, flexShrink: 0 }}>
          {DTABS.map(([t, l]) => (
            <button key={t} onClick={() => setDtab(t)} style={{ padding: "10px 16px", border: "none", background: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, color: dtab === t ? G.ac : G.mi, fontFamily: "'Syne',sans-serif", borderBottom: dtab === t ? `2px solid ${G.ac}` : "2px solid transparent" }}>
              {l}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ overflowY: "auto", flex: 1, padding: "18px 22px" }}>

          {/* LEDGER */}
          {dtab === "ledger" && (
            <div style={{ background: G.s3, borderRadius: 11, overflow: "hidden" }}>
              <div style={{ padding: "11px 14px", borderBottom: `1px solid ${G.bo}` }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: G.tx }}>دفتر الأستاذ — المبيعات والمشتريات</p>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: G.s1 }}>
                      {["الشهر", "المبيعات", "المشتريات", "عائد وِجهة", "VAT", "استردادات", "الصافي", "الحالة"].map(h => (
                        <th key={h} style={{ padding: "9px 12px", textAlign: "right", color: G.mi, fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {monthly.map((x, i) => (
                      <tr key={i} className="rh" style={{ borderBottom: `1px solid ${G.bo}` }}>
                        <td style={{ padding: "9px 12px", fontWeight: 700, color: G.tx }}>{x.m}</td>
                        <td className="mn" style={{ padding: "9px 12px", color: G.bl, fontWeight: 700 }}>{fmt(x.sales)} ر.ق</td>
                        <td className="mn" style={{ padding: "9px 12px", color: G.pu }}>{fmt(x.purchases)} ر.ق</td>
                        <td className="mn" style={{ padding: "9px 12px", color: G.ac }}>{fmt(x.wejha)} ر.ق</td>
                        <td className="mn" style={{ padding: "9px 12px", color: G.go }}>{fmt(x.vat)} ر.ق</td>
                        <td className="mn" style={{ padding: "9px 12px", color: G.or }}>{x.refunds > 0 ? `−${fmt(x.refunds)} ر.ق` : "—"}</td>
                        <td className="mn" style={{ padding: "9px 12px", fontWeight: 700, color: G.ac }}>{fmt(x.net)} ر.ق</td>
                        <td style={{ padding: "9px 12px" }}><Badge status={i < 4 ? "paid" : "pending"} /></td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: G.s1, borderTop: `2px solid ${G.bh}` }}>
                      <td style={{ padding: "9px 12px", fontWeight: 700, color: G.tx }}>الإجمالي</td>
                      <td className="mn" style={{ padding: "9px 12px", fontWeight: 700, color: G.bl }}>{fmt(totals.sales)} ر.ق</td>
                      <td className="mn" style={{ padding: "9px 12px", fontWeight: 700, color: G.pu }}>{fmt(totals.purchases)} ر.ق</td>
                      <td className="mn" style={{ padding: "9px 12px", fontWeight: 700, color: G.ac }}>{fmt(totals.wejha)} ر.ق</td>
                      <td className="mn" style={{ padding: "9px 12px", fontWeight: 700, color: G.go }}>{fmt(totals.vat)} ر.ق</td>
                      <td className="mn" style={{ padding: "9px 12px", fontWeight: 700, color: G.or }}>−{fmt(totals.refunds)} ر.ق</td>
                      <td className="mn" style={{ padding: "9px 12px", fontWeight: 700, color: G.ac }}>{fmt(totals.net)} ر.ق</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* AGING */}
          {dtab === "aging" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 14 }}>
                {[
                  { range: "0–30 يوم",  amt: Math.round(totals.wejha * 0.18), color: G.ac, status: "pending" },
                  { range: "31–60 يوم", amt: Math.round(totals.wejha * 0.12), color: G.go, status: merchant.status === "hold" ? "hold" : "paid" },
                  { range: "61–90 يوم", amt: Math.round(totals.wejha * 0.05), color: G.or, status: merchant.status === "hold" ? "overdue" : "paid" },
                  { range: "+90 يوم",   amt: merchant.status === "hold" ? overdue : 0, color: G.re, status: "overdue" },
                ].map((a, i) => (
                  <div key={i} style={{ background: G.s3, borderRadius: 11, padding: "13px", border: `1px solid ${a.status === "overdue" && a.amt > 0 ? G.re + "44" : G.bo}`, textAlign: "center" }}>
                    <p style={{ fontSize: 10, color: G.mi, marginBottom: 5 }}>{a.range}</p>
                    <p className="mn" style={{ fontSize: 18, fontWeight: 700, color: a.color, marginBottom: 4 }}>{fmt(a.amt)} ر.ق</p>
                    <Badge status={a.status} />
                  </div>
                ))}
              </div>
              {overdue > 0 && (
                <div style={{ background: `${G.re}0A`, borderRadius: 10, padding: "11px 14px", border: `1px solid ${G.re}33` }}>
                  <p style={{ fontSize: 12, color: G.re, fontWeight: 700 }}>⚠️ تنبيه: {fmt(overdue)} ر.ق متأخرة تجاوزت 90 يوم — يستوجب الإجراء الفوري</p>
                </div>
              )}
            </div>
          )}

          {/* VAT */}
          {dtab === "vat" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {monthly.map((x, i) => (
                <div key={i} style={{ background: G.s3, borderRadius: 11, padding: "13px 15px", border: `1px solid ${G.bo}`, display: "flex", alignItems: "center", gap: 12 }}>
                  <p style={{ fontWeight: 700, color: G.tx, minWidth: 70 }}>{x.m}</p>
                  <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                    {[["الوعاء", x.wejha, G.tx], ["VAT 5%", x.vat, G.go], ["صافي", x.wejha - x.vat, G.ac]].map(([l, v, c]) => (
                      <div key={l}>
                        <p className="mn" style={{ fontSize: 13, fontWeight: 700, color: c }}>{fmt(v)} ر.ق</p>
                        <p style={{ fontSize: 10, color: G.mi }}>{l}</p>
                      </div>
                    ))}
                  </div>
                  <Btn small outline color={G.go} onClick={() => {}}>📋 إقرار</Btn>
                </div>
              ))}
            </div>
          )}

          {/* INFO */}
          {dtab === "info" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ background: G.s3, borderRadius: 11, padding: "14px" }}>
                <p style={{ fontSize: 11, color: G.ac, fontWeight: 700, marginBottom: 10 }}>📋 بيانات التاجر</p>
                {[["المالك", merchant.owner], ["الجوال", merchant.phone || "—"], ["البريد", merchant.email || "—"], ["المدينة", merchant.city], ["الانضمام", merchant.joined], ["الرقم الضريبي", merchant.vatNo], ["السجل التجاري", merchant.cr], ["صلاحية السجل", merchant.crExp]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${G.di}` }}>
                    <span style={{ fontSize: 11, color: G.mi }}>{k}</span>
                    <span className="mn" style={{ fontSize: 11, color: G.tx, fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: G.s3, borderRadius: 11, padding: "14px" }}>
                <p style={{ fontSize: 11, color: G.go, fontWeight: 700, marginBottom: 10 }}>🏦 المعلومات البنكية</p>
                {[["البنك", merchant.bank], ["IBAN", merchant.iban], ["معدل التحصيل", "88%"], ["متوسط الدورة", "28 يوم"], ["آخر تحويل", "2026-03-01"], ["الصافي السنوي", `${fmt(totals.net)} ر.ق`]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${G.di}` }}>
                    <span style={{ fontSize: 11, color: G.mi }}>{k}</span>
                    <span className="mn" style={{ fontSize: 11, color: G.tx, fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════
   TAB 1: DASHBOARD
════════════════════════════════════ */
function TabDashboard() {
  const [filters, setFilters] = useState({});

  const totSales  = MONTHLY_AGG.reduce((s, m) => s + m.sales, 0);
  const totWejha  = MONTHLY_AGG.reduce((s, m) => s + m.wejha, 0);
  const totVat    = MONTHLY_AGG.reduce((s, m) => s + m.vat, 0);
  const totRef    = MONTHLY_AGG.reduce((s, m) => s + m.refunds, 0);
  const totPurch  = MONTHLY_AGG.reduce((s, m) => s + m.purchases, 0);
  const totNet    = MONTHLY_AGG.reduce((s, m) => s + m.net, 0);

  const SCHEMA = [
    { key: "period", label: "الفترة", type: "chips", options: [{ value: "monthly", label: "شهري" }, { value: "quarterly", label: "ربع سنوي" }, { value: "annual", label: "سنوي" }] },
    { key: "metric", label: "المقياس", type: "chips", options: [{ value: "sales", label: "المبيعات", color: G.bl }, { value: "wejha", label: "عائد وِجهة", color: G.ac }, { value: "vat", label: "VAT", color: G.go }, { value: "net", label: "الصافي" }] },
  ];

  const kpis = [
    { icon: "💵", label: "إجمالي المبيعات",    value: `${fmt(totSales)} ر.ق`,  color: G.bl },
    { icon: "🏷️", label: "عائد وِجهة",          value: `${fmt(totWejha)} ر.ق`, color: G.ac },
    { icon: "🛒", label: "إجمالي المشتريات",   value: `${fmt(totPurch)} ر.ق`,  color: G.pu },
    { icon: "🧾", label: "ضريبة VAT المستحقة", value: `${fmt(totVat)} ر.ق`,   color: G.go },
    { icon: "↩️", label: "الاستردادات",         value: `${fmt(totRef)} ر.ق`,   color: G.or },
    { icon: "✅", label: "صافي وِجهة",          value: `${fmt(totNet)} ر.ق`,   color: G.ac },
  ];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 11, color: G.ac, fontWeight: 700, letterSpacing: 3, marginBottom: 3 }}>ACCOUNTING OVERVIEW</p>
        <h1 style={{ fontWeight: 800, fontSize: 22, color: G.tx }}>لوحة المحاسبة الرئيسية</h1>
      </div>

      <FilterBar schema={SCHEMA} filters={filters} setFilters={setFilters} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 11, marginBottom: 22 }}>
        {kpis.map((k, i) => (
          <div key={k.label} className="fu" style={{ animationDelay: `${i * 0.05}s`, background: G.s2, borderRadius: 14, padding: "16px 18px", border: `1px solid ${G.bo}`, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(140deg,${k.color}07,transparent 55%)` }} />
            <div style={{ position: "relative" }}>
              <span style={{ fontSize: 21 }}>{k.icon}</span>
              <p className="mn" style={{ fontSize: 20, fontWeight: 700, color: k.color, lineHeight: 1.1, margin: "8px 0 4px" }}>{k.value}</p>
              <p style={{ fontSize: 11, color: G.mi }}>{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14, marginBottom: 14 }}>
        <Card delay={0.1}>
          <SectionHead icon="📈" title="الأداء المالي الشهري" sub="مبيعات — وِجهة — مشتريات — VAT" />
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={MONTHLY_AGG} margin={{ top: 4, right: 4, left: -14, bottom: 0 }}>
              <defs>
                <linearGradient id="gS" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={G.bl} stopOpacity={0.17} /><stop offset="95%" stopColor={G.bl} stopOpacity={0} /></linearGradient>
                <linearGradient id="gW" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={G.ac} stopOpacity={0.22} /><stop offset="95%" stopColor={G.ac} stopOpacity={0} /></linearGradient>
                <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={G.pu} stopOpacity={0.15} /><stop offset="95%" stopColor={G.pu} stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={G.di} vertical={false} />
              <XAxis dataKey="m" tick={{ fontSize: 10, fill: G.mi }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: G.mi, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip content={<ChartTip />} />
              <Area type="monotone" dataKey="sales"     name="المبيعات"    stroke={G.bl} strokeWidth={2} fill="url(#gS)" />
              <Area type="monotone" dataKey="wejha"     name="عائد وِجهة"  stroke={G.ac} strokeWidth={2} fill="url(#gW)" />
              <Area type="monotone" dataKey="purchases" name="المشتريات"   stroke={G.pu} strokeWidth={1.5} fill="url(#gP)" strokeDasharray="4 2" />
              <Line type="monotone" dataKey="vat"       name="VAT"          stroke={G.go} strokeWidth={1.5} dot={false} strokeDasharray="3 3" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          <Card delay={0.12}>
            <SectionHead icon="⚠️" title="تنبيهات محاسبية" color={G.re} />
            {[
              { icon: "🔴", text: "متأخرات M004 تجاوزت 90 يوم", c: G.re },
              { icon: "🧾", text: "VAT مارس — يستحق 30 أبريل", c: G.go },
              { icon: "📄", text: "سجل M003 ينتهي أغسطس 2026", c: G.or },
              { icon: "🔄", text: "تسوية فبراير لم تُعتمد بعد", c: G.pu },
              { icon: "💸", text: "تحويلان معلقان للموافقة", c: G.go },
            ].map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 9px", background: G.s3, borderRadius: 8, marginBottom: 5 }}>
                <span style={{ fontSize: 13 }}>{a.icon}</span>
                <p style={{ fontSize: 11, color: a.c, fontWeight: 600 }}>{a.text}</p>
              </div>
            ))}
          </Card>
        </div>
      </div>

      {/* P&L + Cash Flow */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <Card delay={0.15}>
          <SectionHead icon="📊" title="قائمة الأرباح والخسائر" sub="P&L Summary" />
          {[
            ["الإيرادات",          totWejha,                          G.ac, false],
            ["المشتريات",          totPurch,                          G.pu, true ],
            ["الاستردادات",        totRef,                            G.or, true ],
            ["ضريبة VAT",          totVat,                            G.go, true ],
            ["المصاريف التشغيلية", Math.round(totWejha * 0.08),       G.re, true ],
            ["صافي الربح",         Math.round(totNet * 0.82),         G.ac, false],
          ].map(([l, v, c, minus], i) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: i < 5 ? `1px solid ${G.di}` : "none", fontWeight: i === 5 ? 700 : 400 }}>
              <span style={{ fontSize: 12, color: i === 5 ? G.tx : G.mi }}>{i === 5 ? "💰 " : ""}{l}</span>
              <span className="mn" style={{ fontSize: 12, fontWeight: 700, color: c }}>{minus ? "−" : ""}{fmt(v)} ر.ق</span>
            </div>
          ))}
        </Card>

        <Card delay={0.18}>
          <SectionHead icon="💧" title="التدفق النقدي" sub="Cash Flow شهري" />
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={MONTHLY_AGG} margin={{ top: 4, right: 4, left: -22, bottom: 0 }} barSize={10}>
              <CartesianGrid strokeDasharray="3 3" stroke={G.di} vertical={false} />
              <XAxis dataKey="m" tick={{ fontSize: 9, fill: G.mi }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 8, fill: G.mi }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip content={<ChartTip />} />
              <Bar dataKey="cashIn"  name="تدفق داخل" fill={G.ac} radius={[3, 3, 0, 0]} />
              <Bar dataKey="cashOut" name="تدفق خارج" fill={G.re} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Monthly table */}
      <Card noPad delay={0.22}>
        <div style={{ padding: "13px 16px", borderBottom: `1px solid ${G.bo}` }}>
          <p style={{ fontWeight: 700, fontSize: 13, color: G.tx }}>📋 جدول الأداء الشهري المفصّل</p>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: G.s3 }}>
                {["الشهر", "المبيعات", "المشتريات", "عائد وِجهة", "VAT", "استردادات", "مدفوع", "صافي", "الميزانية", "الانحراف", "الكوبونات", "نمو"].map(h => (
                  <th key={h} style={{ padding: "9px 11px", textAlign: "right", color: G.mi, fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MONTHLY_AGG.map((m, i) => {
                const prev = MONTHLY_AGG[i - 1];
                const gr = prev ? Math.round(((m.sales - prev.sales) / prev.sales) * 100) : null;
                return (
                  <tr key={i} className="rh" style={{ borderBottom: `1px solid ${G.bo}` }}>
                    <td style={{ padding: "8px 11px", fontWeight: 700, color: G.tx }}>{m.m}</td>
                    <td className="mn" style={{ padding: "8px 11px", color: G.bl, fontWeight: 700 }}>{fmt(m.sales)}</td>
                    <td className="mn" style={{ padding: "8px 11px", color: G.pu }}>{fmt(m.purchases)}</td>
                    <td className="mn" style={{ padding: "8px 11px", color: G.ac }}>{fmt(m.wejha)}</td>
                    <td className="mn" style={{ padding: "8px 11px", color: G.go, fontWeight: 700 }}>{fmt(m.vat)}</td>
                    <td className="mn" style={{ padding: "8px 11px", color: G.or }}>{fmt(m.refunds)}</td>
                    <td className="mn" style={{ padding: "8px 11px", color: G.ac }}>{fmt(m.payouts)}</td>
                    <td className="mn" style={{ padding: "8px 11px", color: G.ac, fontWeight: 700 }}>{fmt(m.net)}</td>
                    <td className="mn" style={{ padding: "8px 11px", color: G.di }}>{fmt(m.budget)}</td>
                    <td style={{ padding: "8px 11px" }}>
                      <span className="mn" style={{ fontSize: 11, color: m.variance >= 0 ? G.ac : G.re, fontWeight: 700 }}>
                        {m.variance >= 0 ? "+" : ""}{fmt(m.variance)}
                      </span>
                    </td>
                    <td className="mn" style={{ padding: "8px 11px", color: G.mi }}>{m.coupons}</td>
                    <td style={{ padding: "8px 11px" }}>
                      {gr !== null ? <span style={{ fontSize: 11, fontWeight: 700, color: gr >= 0 ? G.ac : G.re }}>{gr >= 0 ? "+" : ""}{gr}%</span> : <span style={{ color: G.di }}>—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ background: G.s3, borderTop: `2px solid ${G.bh}` }}>
                <td style={{ padding: "9px 11px", fontWeight: 700, color: G.tx }}>الإجمالي</td>
                <td className="mn" style={{ padding: "9px 11px", fontWeight: 700, color: G.bl }}>{fmt(totSales)}</td>
                <td className="mn" style={{ padding: "9px 11px", fontWeight: 700, color: G.pu }}>{fmt(totPurch)}</td>
                <td className="mn" style={{ padding: "9px 11px", fontWeight: 700, color: G.ac }}>{fmt(totWejha)}</td>
                <td className="mn" style={{ padding: "9px 11px", fontWeight: 700, color: G.go }}>{fmt(totVat)}</td>
                <td className="mn" style={{ padding: "9px 11px", fontWeight: 700, color: G.or }}>{fmt(totRef)}</td>
                <td className="mn" style={{ padding: "9px 11px", fontWeight: 700, color: G.ac }}>{fmt(MONTHLY_AGG.reduce((s, m) => s + m.payouts, 0))}</td>
                <td className="mn" style={{ padding: "9px 11px", fontWeight: 700, color: G.ac }}>{fmt(totNet)}</td>
                <td className="mn" style={{ padding: "9px 11px", color: G.di }}>{fmt(MONTHLY_AGG.reduce((s, m) => s + m.budget, 0))}</td>
                <td /><td className="mn" style={{ padding: "9px 11px", color: G.mi }}>{MONTHLY_AGG.reduce((s, m) => s + m.coupons, 0)}</td><td />
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ════════════════════════════════════
   TAB 2: MERCHANTS
════════════════════════════════════ */
function TabMerchants() {
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState("revenue");
  const [selected, setSelected] = useState(null);

  const SCHEMA = [
    { key: "status", label: "الحالة",   type: "chips", options: [{ value: "active", label: "نشط", color: G.ac }, { value: "hold", label: "محجوز", color: G.or }, { value: "suspended", label: "موقوف", color: G.re }] },
    { key: "city",   label: "المدينة",  type: "chips", options: ["الدوحة", "لوسيل", "الريان", "الوكرة"].map(c => ({ value: c, label: c })) },
    { key: "bank",   label: "البنك",    type: "chips", options: ["QNB", "QIB", "Doha Bank", "CBQ", "Masraf", "HSBC"].map(b => ({ value: b, label: b })) },
    { key: "revenue", label: "الإيراد", type: "range" },
  ];

  const enriched = useMemo(() => ALL_MERCHANTS.map(m => {
    const md = genMonthly(m.seed);
    return {
      ...m,
      revenue:   md.reduce((s, x) => s + x.sales, 0),
      wejha:     md.reduce((s, x) => s + x.wejha, 0),
      vat:       md.reduce((s, x) => s + x.vat, 0),
      purchases: md.reduce((s, x) => s + x.purchases, 0),
      refunds:   md.reduce((s, x) => s + x.refunds, 0),
      overdue:   m.status === "hold" ? Math.round(md.reduce((s, x) => s + x.wejha, 0) * 0.15) : 0,
    };
  }), []);

  const list = useMemo(() => enriched.filter(m => {
    if (q && !m.name.includes(q) && !m.id.includes(q) && !m.owner.includes(q) && !m.vatNo.includes(q)) return false;
    if ((filters.status || []).length && !filters.status.includes(m.status)) return false;
    if ((filters.city   || []).length && !filters.city.includes(m.city)) return false;
    if ((filters.bank   || []).length && !filters.bank.includes(m.bank)) return false;
    if (filters.revenue_from && m.revenue < Number(filters.revenue_from)) return false;
    if (filters.revenue_to   && m.revenue > Number(filters.revenue_to))   return false;
    return true;
  }).sort((a, b) => (b[sort] || 0) - (a[sort] || 0)), [enriched, q, filters, sort]);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          <p style={{ fontSize: 11, color: G.ac, fontWeight: 700, letterSpacing: 3, marginBottom: 2 }}>MERCHANT ACCOUNTS</p>
          <h1 style={{ fontWeight: 800, fontSize: 20, color: G.tx }}>حسابات التجار — مبيعات ومشتريات</h1>
        </div>
        <Btn small color={G.ac} onClick={() => {}}>📥 تصدير Excel</Btn>
      </div>

      <div style={{ position: "relative", marginBottom: 14 }}>
        <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>🔍</span>
        <input
          className="foc"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="بحث بالاسم · الرقم · المالك · الرقم الضريبي..."
          style={{ width: "100%", padding: "10px 38px 10px 14px", borderRadius: 11, border: `1px solid ${G.bo}`, background: G.s2, fontSize: 13, color: G.tx }}
        />
      </div>

      <FilterBar schema={SCHEMA} filters={filters} setFilters={setFilters} />

      <div style={{ display: "flex", gap: 7, marginBottom: 12, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, color: G.mi, fontWeight: 700 }}>ترتيب:</span>
        {[["revenue", "الإيراد"], ["wejha", "عائد وِجهة"], ["vat", "VAT"], ["overdue", "متأخرات"], ["purchases", "المشتريات"]].map(([k, l]) => (
          <Chip key={k} label={l} active={sort === k} onClick={() => setSort(k)} />
        ))}
        <span style={{ marginRight: "auto", fontSize: 11, color: G.mi }}>{list.length} تاجر</span>
      </div>

      {/* Summary bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 9, marginBottom: 14 }}>
        {[["💵 الإيرادات", list.reduce((s, m) => s + m.revenue, 0), G.bl], ["🏷️ عائد وِجهة", list.reduce((s, m) => s + m.wejha, 0), G.ac], ["🛒 مشتريات", list.reduce((s, m) => s + m.purchases, 0), G.pu], ["🧾 VAT", list.reduce((s, m) => s + m.vat, 0), G.go], ["⚠️ متأخرات", list.reduce((s, m) => s + m.overdue, 0), G.re]].map(([l, v, c]) => (
          <div key={l} style={{ background: G.s2, borderRadius: 11, padding: "11px 13px", border: `1px solid ${G.bo}` }}>
            <p className="mn" style={{ fontSize: 16, fontWeight: 700, color: c, marginBottom: 2 }}>{fmt(v)}</p>
            <p style={{ fontSize: 10, color: G.mi }}>{l} ر.ق</p>
          </div>
        ))}
      </div>

      <Card noPad>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: G.s3 }}>
                {["التاجر", "المدينة", "البنك", "الإيرادات", "المشتريات", "عائد وِجهة", "VAT", "متأخرات", "الحالة", "تفاصيل"].map(h => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "right", color: G.mi, fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map(m => (
                <tr key={m.id} className="rh" style={{ borderBottom: `1px solid ${G.bo}` }} onClick={() => setSelected(m)}>
                  <td style={{ padding: "11px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 9, background: `${G.ac}10`, border: `1px solid ${G.bo}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>{m.cat}</div>
                      <div>
                        <p style={{ fontWeight: 700, color: G.tx, fontSize: 13 }}>{m.name}</p>
                        <p className="mn" style={{ fontSize: 10, color: G.mi }}>{m.id} · {m.owner}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "11px 12px", color: G.mi, fontSize: 12 }}>{m.city}</td>
                  <td style={{ padding: "11px 12px", color: G.mi, fontSize: 12 }}>{m.bank}</td>
                  <td className="mn" style={{ padding: "11px 12px", fontWeight: 700, color: G.bl }}>{fmt(m.revenue)} ر.ق</td>
                  <td className="mn" style={{ padding: "11px 12px", color: G.pu }}>{fmt(m.purchases)} ر.ق</td>
                  <td className="mn" style={{ padding: "11px 12px", color: G.ac }}>{fmt(m.wejha)} ر.ق</td>
                  <td className="mn" style={{ padding: "11px 12px", color: G.go }}>{fmt(m.vat)} ر.ق</td>
                  <td style={{ padding: "11px 12px" }}>{m.overdue > 0 ? <span className="mn" style={{ color: G.re, fontWeight: 700 }}>{fmt(m.overdue)} ⚠</span> : <span style={{ color: G.di }}>—</span>}</td>
                  <td style={{ padding: "11px 12px" }}><Badge status={m.status} /></td>
                  <td style={{ padding: "11px 12px" }} onClick={e => e.stopPropagation()}>
                    <Btn small outline color={G.ac} onClick={() => setSelected(m)}>📂 فتح</Btn>
                  </td>
                </tr>
              ))}
              {!list.length && <tr><td colSpan={10} style={{ padding: "28px", textAlign: "center", color: G.mi }}>لا توجد نتائج</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      {selected && <MerchantModal merchant={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

/* ════════════════════════════════════
   TAB 3: JOURNAL
════════════════════════════════════ */
function TabJournal() {
  const [filters, setFilters] = useState({});
  const [q, setQ] = useState("");

  const TC = { revenue: G.ac, payout: G.bl, tax: G.go, refund: G.or, expense: G.re, adjustment: G.pu, draft: G.mi };
  const TL = { revenue: "إيراد", payout: "صرف", tax: "ضريبة", refund: "استرداد", expense: "مصروف", adjustment: "تسوية", draft: "مسودة" };

  const SCHEMA = [
    { key: "type",   label: "النوع",    type: "chips", options: Object.entries(TL).map(([v, label]) => ({ value: v, label, color: TC[v] })) },
    { key: "status", label: "الحالة",  type: "chips", options: [{ value: "posted", label: "مرحّل", color: G.ac }, { value: "draft", label: "مسودة", color: G.mi }] },
    { key: "date",   label: "التاريخ", type: "date" },
    { key: "amount", label: "المبلغ",  type: "range" },
  ];

  const list = useMemo(() => JOURNAL_ENTRIES.filter(e => {
    if (q && !e.desc.includes(q) && !e.id.includes(q) && !e.ref.includes(q)) return false;
    if ((filters.type   || []).length && !filters.type.includes(e.type)) return false;
    if ((filters.status || []).length && !filters.status.includes(e.status)) return false;
    if (filters.date_from && e.date < filters.date_from) return false;
    if (filters.date_to   && e.date > filters.date_to)   return false;
    const maxAmt = Math.max(e.dr, e.cr);
    if (filters.amount_from && maxAmt < Number(filters.amount_from)) return false;
    if (filters.amount_to   && maxAmt > Number(filters.amount_to))   return false;
    return true;
  }), [q, filters]);

  const totDr = list.reduce((s, e) => s + e.dr, 0);
  const totCr = list.reduce((s, e) => s + e.cr, 0);
  const balanced = Math.abs(totDr - totCr) < 10;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          <p style={{ fontSize: 11, color: G.pu, fontWeight: 700, letterSpacing: 3, marginBottom: 2 }}>JOURNAL ENTRIES</p>
          <h1 style={{ fontWeight: 800, fontSize: 20, color: G.tx }}>دفتر اليومية — القيود المحاسبية</h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn small outline color={G.pu} onClick={() => {}}>+ قيد يدوي</Btn>
          <Btn small color={G.ac} onClick={() => {}}>📥 تصدير</Btn>
        </div>
      </div>

      <div style={{ position: "relative", marginBottom: 14 }}>
        <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>🔍</span>
        <input className="foc" value={q} onChange={e => setQ(e.target.value)} placeholder="بحث في القيود..."
          style={{ width: "100%", padding: "10px 38px 10px 14px", borderRadius: 11, border: `1px solid ${G.bo}`, background: G.s2, fontSize: 13, color: G.tx }} />
      </div>

      <FilterBar schema={SCHEMA} filters={filters} setFilters={setFilters} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 14 }}>
        {[
          { l: "إجمالي المدين",  v: `${fmt(totDr)} ر.ق`, c: G.ac },
          { l: "إجمالي الدائن", v: `${fmt(totCr)} ر.ق`, c: G.bl },
          { l: "الميزان",        v: `${fmt(Math.abs(totDr - totCr))} ر.ق`, c: balanced ? G.ac : G.re },
          { l: "عدد القيود",     v: list.length, c: G.mi },
        ].map(s => (
          <div key={s.l} style={{ background: G.s2, borderRadius: 11, padding: "12px 14px", border: `1px solid ${G.bo}` }}>
            <p className="mn" style={{ fontSize: 17, fontWeight: 700, color: s.c, marginBottom: 3 }}>{s.v}</p>
            <p style={{ fontSize: 11, color: G.mi }}>{s.l}</p>
            {s.l === "الميزان" && <p style={{ fontSize: 10, color: balanced ? G.ac : G.re, marginTop: 2, fontWeight: 700 }}>{balanced ? "✓ متوازن" : "⚠ غير متوازن"}</p>}
          </div>
        ))}
      </div>

      <Card noPad>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: G.s3 }}>
                {["رقم القيد", "التاريخ", "النوع", "البيان", "الحساب", "مدين", "دائن", "المرجع", "الحالة"].map(h => (
                  <th key={h} style={{ padding: "9px 11px", textAlign: "right", color: G.mi, fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((e, i) => (
                <tr key={i} className="rh" style={{ borderBottom: `1px solid ${G.bo}` }}>
                  <td className="mn" style={{ padding: "9px 11px", color: G.pu, fontWeight: 600, fontSize: 11 }}>{e.id}</td>
                  <td className="mn" style={{ padding: "9px 11px", color: G.mi, fontSize: 10 }}>{e.date}</td>
                  <td style={{ padding: "9px 11px" }}>
                    <span style={{ background: `${TC[e.type] || G.mi}18`, color: TC[e.type] || G.mi, borderRadius: 99, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>
                      {TL[e.type] || e.type}
                    </span>
                  </td>
                  <td style={{ padding: "9px 11px", color: G.tx, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.desc}</td>
                  <td className="mn" style={{ padding: "9px 11px", color: G.mi, fontSize: 10, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.acc}</td>
                  <td className="mn" style={{ padding: "9px 11px", color: e.dr > 0 ? G.ac : G.di, fontWeight: e.dr > 0 ? 700 : 400 }}>{e.dr > 0 ? `${fmt(e.dr)} ر.ق` : "—"}</td>
                  <td className="mn" style={{ padding: "9px 11px", color: e.cr > 0 ? G.bl : G.di, fontWeight: e.cr > 0 ? 700 : 400 }}>{e.cr > 0 ? `${fmt(e.cr)} ر.ق` : "—"}</td>
                  <td className="mn" style={{ padding: "9px 11px", color: G.di, fontSize: 10 }}>{e.ref}</td>
                  <td style={{ padding: "9px 11px" }}><Badge status={e.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ════════════════════════════════════
   TAB 4: TAX
════════════════════════════════════ */
function TabTax() {
  const [period, setPeriod] = useState("monthly");
  const [selM, setSelM] = useState(5);
  const [filed, setFiled] = useState({});

  const m = MONTHLY_AGG[selM];
  const annW = MONTHLY_AGG.reduce((s, x) => s + x.wejha, 0);
  const annV = MONTHLY_AGG.reduce((s, x) => s + x.vat, 0);

  const FILTER_SCHEMA = [
    { key: "period", label: "الفترة", type: "chips", options: [{ value: "monthly", label: "شهري 🗓️" }, { value: "quarterly", label: "ربع سنوي 📊" }, { value: "annual", label: "سنوي 📆" }] },
  ];

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <p style={{ fontSize: 11, color: G.go, fontWeight: 700, letterSpacing: 3, marginBottom: 2 }}>TAX COMPLIANCE</p>
        <h1 style={{ fontWeight: 800, fontSize: 20, color: G.tx }}>الإقرارات الضريبية — VAT 5%</h1>
      </div>

      <FilterBar
        schema={FILTER_SCHEMA}
        filters={{ period: [period] }}
        setFilters={f => { if ((f.period || []).length) setPeriod(f.period[f.period.length - 1]); }}
      />

      <div style={{ display: "flex", gap: 7, marginBottom: 20, flexWrap: "wrap" }}>
        {[["monthly", "شهري 🗓️"], ["quarterly", "ربع سنوي 📊"], ["annual", "سنوي 📆"]].map(([v, l]) => (
          <button key={v} onClick={() => setPeriod(v)} style={{ padding: "8px 16px", borderRadius: 10, border: `1.5px solid ${period === v ? G.go : G.bo}`, background: period === v ? `${G.go}14` : G.s2, color: period === v ? G.go : G.mi, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'Syne',sans-serif" }}>{l}</button>
        ))}
      </div>

      {period === "monthly" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            {MONTHLY_AGG.map((x, i) => (
              <button key={i} onClick={() => setSelM(i)} style={{ padding: "6px 13px", borderRadius: 9, border: `1.5px solid ${selM === i ? G.go : G.bo}`, background: selM === i ? `${G.go}14` : G.s2, color: selM === i ? G.go : G.mi, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "'Syne',sans-serif" }}>{x.m}</button>
            ))}
          </div>
          <div style={{ background: `${G.go}08`, borderRadius: 13, padding: "12px 16px", border: `1px solid ${G.go}22`, display: "flex", alignItems: "center", gap: 10 }}>
            <p style={{ fontSize: 13, color: G.go, fontWeight: 700, flex: 1 }}>🗓️ الإقرار الشهري — {m.m} 2025/2026</p>
            {filed[`m-${m.m}`]
              ? <span style={{ background: `${G.ac}14`, color: G.ac, borderRadius: 99, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>✓ مُقدَّم</span>
              : <Btn small color={G.go} onClick={() => setFiled(p => ({ ...p, [`m-${m.m}`]: true }))}>📋 تقديم إقرار</Btn>}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
            {[["الوعاء الضريبي", m.wejha, G.tx], ["VAT 5%", m.vat, G.go], ["صافي وِجهة", m.wejha - m.vat, G.ac], ["الاستردادات", m.refunds, G.or]].map(([l, v, c]) => (
              <div key={l} style={{ background: G.s3, borderRadius: 11, padding: "13px" }}>
                <p className="mn" style={{ fontSize: 18, fontWeight: 700, color: c, marginBottom: 4 }}>{fmt(v)} ر.ق</p>
                <p style={{ fontSize: 11, color: G.mi }}>{l}</p>
              </div>
            ))}
          </div>
          <Card style={{ border: `1px solid ${G.go}33` }}>
            <SectionHead icon="🧾" title="نموذج الإقرار الضريبي" sub={`${m.m} — هيئة الزكاة والضريبة والجمارك`} color={G.go} />
            <div style={{ background: G.s3, borderRadius: 11, padding: "18px", fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, paddingBottom: 10, borderBottom: `1px dashed ${G.bh}` }}>
                <div>
                  <p style={{ fontWeight: 800, fontSize: 14, color: G.tx, fontFamily: "'Syne',sans-serif" }}>شركة وِجهة القطرية ذ.م.م</p>
                  <p style={{ color: G.mi, fontSize: 10 }}>الرقم الضريبي: QA-VAT-2024-00123</p>
                </div>
                <p style={{ color: G.go, fontWeight: 700 }}>VAT Return — {m.m}</p>
              </div>
              {[
                ["الإيرادات الخاضعة للضريبة", `${fmt(m.wejha)} ر.ق`,   G.tx],
                ["نسبة الضريبة",               "5%",                    G.mi],
                ["الضريبة المستحقة",            `${fmt(m.vat)} ر.ق`,    G.go],
                ["ضريبة المدخلات (input)",      "0.00 ر.ق",             G.mi],
                ["صافي VAT الواجبة",            `${fmt(m.vat)} ر.ق`,    G.re],
              ].map(([k, v, c]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${G.di}` }}>
                  <span style={{ color: G.mi, fontFamily: "'Syne',sans-serif" }}>{k}</span>
                  <span style={{ color: c, fontWeight: 700 }}>{v}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0 0", borderTop: `2px solid ${G.bh}`, marginTop: 4 }}>
                <span style={{ color: G.tx, fontWeight: 700, fontFamily: "'Syne',sans-serif", fontSize: 14 }}>المبلغ الواجب سداده</span>
                <span style={{ color: G.go, fontWeight: 700, fontSize: 20 }}>{fmt(m.vat)} ر.ق</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <Btn small outline color={G.bl} onClick={() => {}}>🖨️ طباعة</Btn>
              <Btn small outline color={G.bl} onClick={() => {}}>📧 للمحاسب</Btn>
              <Btn small outline color={G.go} onClick={() => {}}>📤 ZATCA</Btn>
            </div>
          </Card>
        </div>
      )}

      {period === "annual" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: `${G.go}08`, borderRadius: 13, padding: "12px 16px", border: `1px solid ${G.go}22`, display: "flex", alignItems: "center", gap: 10 }}>
            <p style={{ fontSize: 13, color: G.go, fontWeight: 700, flex: 1 }}>📆 الإقرار السنوي — 2025/2026</p>
            {filed.annual
              ? <span style={{ background: `${G.ac}14`, color: G.ac, borderRadius: 99, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>✓ مُقدَّم</span>
              : <Btn small color={G.go} onClick={() => setFiled(p => ({ ...p, annual: true }))}>📋 تقديم إقرار</Btn>}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
            {[["إجمالي عائد وِجهة", annW, G.ac], ["إجمالي VAT المستحق", annV, G.go], ["صافي بعد الضريبة", annW - annV, G.ac]].map(([l, v, c]) => (
              <div key={l} style={{ background: G.s3, borderRadius: 11, padding: "14px" }}>
                <p className="mn" style={{ fontSize: 18, fontWeight: 700, color: c, marginBottom: 4 }}>{fmt(v)} ر.ق</p>
                <p style={{ fontSize: 11, color: G.mi }}>{l}</p>
              </div>
            ))}
          </div>
          <Card>
            <SectionHead icon="📊" title="VAT الشهري — السنة الكاملة" />
            <ResponsiveContainer width="100%" height={175}>
              <BarChart data={MONTHLY_AGG} barSize={18} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={G.di} vertical={false} />
                <XAxis dataKey="m" tick={{ fontSize: 10, fill: G.mi }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: G.mi }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTip />} />
                <Bar dataKey="wejha" name="عائد وِجهة" fill={G.ac} radius={[4, 4, 0, 0]} />
                <Bar dataKey="vat"   name="VAT"         fill={G.go} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {period === "quarterly" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[["Q2 2025", 58000, 5800, 2900, true], ["Q3 2025", 74200, 7420, 3710, true], ["Q4 2025", 81400, 8140, 4070, false], ["Q1 2026", 21420, 2142, 1071, false]].map(([label, s, w, v, isDone]) => (
            <Card key={label} style={{ border: `1px solid ${isDone ? G.bo : G.go + "33"}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <p style={{ fontWeight: 700, fontSize: 14, color: G.tx, flex: 1 }}>{label}</p>
                {isDone
                  ? <span style={{ background: `${G.ac}14`, color: G.ac, borderRadius: 99, padding: "2px 9px", fontSize: 11, fontWeight: 700 }}>مُقدَّم ✓</span>
                  : <span style={{ background: `${G.go}14`, color: G.go, borderRadius: 99, padding: "2px 9px", fontSize: 11, fontWeight: 700 }}>معلق</span>}
                {!isDone && (
                  filed[`q-${label}`]
                    ? <span style={{ background: `${G.ac}14`, color: G.ac, borderRadius: 99, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>✓ مُقدَّم</span>
                    : <Btn small color={G.go} onClick={() => setFiled(p => ({ ...p, [`q-${label}`]: true }))}>📋 تقديم</Btn>
                )}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                {[["المبيعات", s, G.bl], ["عائد وِجهة", w, G.ac], ["VAT", v, G.go], ["صافي", w - v, G.ac]].map(([l, val, c]) => (
                  <div key={l} style={{ background: G.s3, borderRadius: 9, padding: "9px 11px" }}>
                    <p className="mn" style={{ fontSize: 14, fontWeight: 700, color: c, marginBottom: 2 }}>{fmt(val)} ر.ق</p>
                    <p style={{ fontSize: 10, color: G.mi }}>{l}</p>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════
   TAB 5: REPORTS
════════════════════════════════════ */
function TabReports() {
  const [filters, setFilters] = useState({});
  const [generating, setGenerating] = useState(null);

  const SCHEMA = [
    { key: "cat",    label: "التصنيف", type: "chips", options: [{ value: "financial", label: "مالي", color: G.ac }, { value: "tax", label: "ضريبي", color: G.go }, { value: "operational", label: "تشغيلي", color: G.bl }, { value: "compliance", label: "امتثال", color: G.pu }] },
    { key: "format", label: "الصيغة",  type: "chips", options: [{ value: "pdf", label: "PDF", color: G.re }, { value: "excel", label: "Excel", color: G.ac }, { value: "csv", label: "CSV", color: G.bl }] },
    { key: "date",   label: "التاريخ", type: "date" },
  ];

  const REPORTS = [
    { id: "pnl",   icon: "📊", title: "قائمة الأرباح والخسائر",      desc: "P&L — إيرادات ومصاريف وصافي الربح",                  cat: "financial" },
    { id: "bs",    icon: "🏛️", title: "الميزانية العمومية",            desc: "Balance Sheet — الأصول والخصوم وحقوق الملكية",       cat: "financial" },
    { id: "cf",    icon: "💧", title: "قائمة التدفقات النقدية",        desc: "Cash Flow — داخل وخارج النقد التشغيلي",               cat: "financial" },
    { id: "bv",    icon: "🎯", title: "انحراف الميزانية",               desc: "Budget Variance — فعلي vs مخطط",                     cat: "financial" },
    { id: "ar",    icon: "📥", title: "تقرير الذمم المدينة",           desc: "Accounts Receivable — مستحقات التجار",                cat: "financial" },
    { id: "aging", icon: "⏰", title: "تقرير تقادم الديون",             desc: "Aging Report — تصنيف المستحقات بعمر الدين",           cat: "financial" },
    { id: "vat_m", icon: "🧾", title: "إقرار VAT الشهري",             desc: "الضريبة على الإيرادات مع خصم ضريبة المدخلات",        cat: "tax" },
    { id: "vat_a", icon: "📆", title: "الإقرار الضريبي السنوي",        desc: "ملخص VAT السنة الكاملة لتقديم ZATCA",                cat: "tax" },
    { id: "rec",   icon: "🔄", title: "تسوية بنكية",                   desc: "Bank Reconciliation — مطابقة الدفاتر مع البنك",       cat: "compliance" },
    { id: "audit", icon: "🔍", title: "تقرير المراجعة والتدقيق",       desc: "Audit Trail — سجل كامل بجميع العمليات",              cat: "compliance" },
    { id: "mer",   icon: "🏪", title: "أداء التجار التفصيلي",          desc: "مبيعات ومشتريات وعائد وِجهة لكل تاجر",               cat: "operational" },
    { id: "coup",  icon: "🎫", title: "تقرير الكوبونات",               desc: "معدل الاستخدام والقيمة والعائد المالي",               cat: "operational" },
  ];

  const filtered = REPORTS.filter(r => !(filters.cat || []).length || (filters.cat || []).includes(r.cat));

  function generate(id, fmt) {
    const key = id + fmt;
    setGenerating(key);
    setTimeout(() => setGenerating(null), 1400);
  }

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <p style={{ fontSize: 11, color: G.bl, fontWeight: 700, letterSpacing: 3, marginBottom: 2 }}>REPORTS CENTER</p>
        <h1 style={{ fontWeight: 800, fontSize: 20, color: G.tx }}>مركز التقارير المالية</h1>
      </div>

      <FilterBar schema={SCHEMA} filters={filters} setFilters={setFilters} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(285px,1fr))", gap: 11 }}>
        {filtered.map((r, i) => (
          <div key={r.id} className="fu" style={{ animationDelay: `${i * 0.04}s`, background: G.s2, borderRadius: 14, padding: "17px 18px", border: `1px solid ${G.bo}`, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <div style={{ width: 42, height: 42, borderRadius: 11, background: `${G.ac}12`, border: `1px solid ${G.ac}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{r.icon}</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: 13, color: G.tx, marginBottom: 3 }}>{r.title}</p>
                <p style={{ fontSize: 11, color: G.mi }}>{r.desc}</p>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
              <Btn small outline color={G.re}  loading={generating === r.id + "p"}  onClick={() => generate(r.id, "p")}>📄 PDF</Btn>
              <Btn small outline color={G.ac}  loading={generating === r.id + "e"}  onClick={() => generate(r.id, "e")}>📊 Excel</Btn>
              <Btn small         color={G.bl}  loading={generating === r.id + "c"}  onClick={() => generate(r.id, "c")}>⬇ CSV</Btn>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════
   MAIN APP
════════════════════════════════════ */
export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [liveCount, setLiveCount] = useState(1247);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t1 = setInterval(() => setLiveCount(n => Math.max(900, n + Math.floor(Math.random() * 5) - 2)), 4000);
    const t2 = setInterval(() => setNow(new Date()), 1000);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, []);

  const TABS = [
    { id: "dashboard", icon: "📊", label: "اللوحة الرئيسية" },
    { id: "merchants", icon: "🏪", label: "حسابات التجار" },
    { id: "journal",   icon: "📒", label: "دفتر اليومية" },
    { id: "tax",       icon: "🧾", label: "الإقرار الضريبي" },
    { id: "reports",   icon: "📁", label: "مركز التقارير" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: G.bg, display: "flex", flexDirection: "column" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: `${G.s1}F6`, backdropFilter: "blur(22px)", borderBottom: `1px solid ${G.bo}` }}>
        <div style={{ maxWidth: 1440, margin: "0 auto", padding: "0 18px", display: "flex", alignItems: "center", gap: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 0", marginLeft: 20, flexShrink: 0 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: `${G.ac}14`, border: `1px solid ${G.ac}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🧮</div>
            <div>
              <p style={{ fontWeight: 800, fontSize: 13, color: G.tx, lineHeight: 1 }}>وِجهة — المحاسبة</p>
              <p className="mn" style={{ fontSize: 9, color: G.ac, fontWeight: 600, letterSpacing: 2 }}>CFO DASHBOARD</p>
            </div>
          </div>

          <nav style={{ display: "flex", flex: 1, overflowX: "auto", gap: 1, padding: "4px 0" }}>
            {TABS.map(({ id, icon, label }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "8px 13px", borderRadius: 9,
                  border: "none",
                  background: tab === id ? `${G.ac}12` : "transparent",
                  color: tab === id ? G.ac : G.mi,
                  fontWeight: tab === id ? 700 : 500,
                  fontSize: 12, cursor: "pointer",
                  flexShrink: 0, fontFamily: "'Syne',sans-serif",
                  whiteSpace: "nowrap",
                  borderBottom: tab === id ? `2px solid ${G.ac}` : "2px solid transparent",
                  transition: "all .15s"
                }}
              >
                <span style={{ fontSize: 13 }}>{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: 7, flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, background: G.s2, borderRadius: 9, padding: "5px 10px", border: `1px solid ${G.bo}` }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: G.ac, animation: "pu 2s ease infinite" }} />
              <span className="mn" style={{ fontSize: 11, color: G.ac, fontWeight: 700 }}>{liveCount.toLocaleString()}</span>
              <span style={{ fontSize: 10, color: G.mi }}>نشط</span>
            </div>
            <div className="mn" style={{ background: G.s2, borderRadius: 9, padding: "5px 10px", border: `1px solid ${G.bo}`, fontSize: 10, color: G.mi, direction: "ltr" }}>
              {now.toLocaleTimeString("en-GB")}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: `${G.ac}0C`, borderRadius: 9, padding: "5px 10px", border: `1px solid ${G.ac}22` }}>
              <span style={{ fontSize: 14 }}>🧮</span>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: G.tx, lineHeight: 1 }}>فيصل العنزي</p>
                <p className="mn" style={{ fontSize: 8, color: G.ac, fontWeight: 700, letterSpacing: 1 }}>FINANCE OFFICER</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, maxWidth: 1440, margin: "0 auto", width: "100%", padding: "22px 18px 56px" }}>
        {tab === "dashboard" && <TabDashboard />}
        {tab === "merchants" && <TabMerchants />}
        {tab === "journal"   && <TabJournal />}
        {tab === "tax"       && <TabTax />}
        {tab === "reports"   && <TabReports />}
      </main>
    </div>
  );
}
