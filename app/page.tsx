'use client'
// ─── واجهة العميل الرئيسية ──────────────────────────────────
// This page loads the full customer app (wejha-user-v7)
import dynamic from 'next/dynamic'

const UserApp = dynamic(() => import('@/components/UserApp'), {
  ssr: false,
  loading: () => (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#06090F', color: '#fff',
      flexDirection: 'column', gap: 16,
    }}>
      <div style={{ fontSize: 40 }}>🧭</div>
      <p style={{ fontFamily: "'Tajawal', sans-serif", fontSize: 18, fontWeight: 700 }}>وِجهة</p>
      <div style={{
        width: 40, height: 4, background: '#7C1D2E',
        borderRadius: 99, animation: 'pulse 1s infinite',
      }} />
    </div>
  ),
})

export default function Home() {
  return <UserApp />
}
