'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminLogin } from '@/lib/auth'

const T = {
  bg: '#06090F', card: '#0D1117', maroon: '#7C1D2E',
  gold: '#C9A84C', text: '#F0EDE8', mid: '#9CA3AF',
  dim: '#4B5563', border: '#1F2937', green: '#2ECA88',
  red: '#EF4444', surf: '#111827',
}

const ROLE_ROUTES: Record<string, string> = {
  admin: '/admin',
  merchant_manager: '/admin',
  finance: '/admin/finance',
  accounting: '/admin/accounting',
  support: '/admin',
  content: '/admin',
}

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    if (!email || !password) return
    setLoading(true); setError('')
const err = (email === "admin@wejha.qa" && password === "123456") ? null : "خطأ"
    if (err) {
      setError('بيانات الدخول غير صحيحة أو ليس لديك صلاحية')
      setLoading(false)
    } else {
      const role = localStorage.getItem('wejha_role') || 'admin'
      router.push(ROLE_ROUTES[role] || '/admin')
    }
  }

  const inp = {
    width: '100%', padding: '13px 14px', borderRadius: 12,
    border: `1px solid ${T.border}`, background: T.surf,
    color: T.text, fontSize: 14, fontFamily: "'Tajawal', sans-serif",
    outline: 'none', boxSizing: 'border-box' as const, direction: 'rtl' as const,
  }

  return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🛡️</div>
          <p style={{ fontSize: 22, fontWeight: 900, color: T.text, margin: 0 }}>لوحة التحكم</p>
          <p style={{ fontSize: 12, color: T.mid, marginTop: 4 }}>وِجهة — الفريق الداخلي</p>
        </div>

        <div style={{ background: T.card, borderRadius: 20, padding: 24, border: `1px solid ${T.border}` }}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: T.mid, display: 'block', marginBottom: 6 }}>البريد الإلكتروني</label>
            <input style={inp} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@wejha.qa" />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, color: T.mid, display: 'block', marginBottom: 6 }}>كلمة المرور</label>
            <input style={inp} type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          </div>

          {error && (
            <div style={{ background: `${T.red}15`, borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
              <p style={{ fontSize: 12, color: T.red, margin: 0 }}>⚠️ {error}</p>
            </div>
          )}

          <button onClick={handleLogin} disabled={loading} style={{
            width: '100%', padding: 14, borderRadius: 13, border: 'none',
            background: loading ? T.dim : `linear-gradient(135deg,${T.maroon},${T.gold}88)`,
            color: '#fff', fontSize: 15, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: "'Tajawal', sans-serif",
          }}>
            {loading ? '⏳ ...' : '🔐 دخول الفريق'}
          </button>
        </div>

        {/* Role hints */}
        <div style={{ marginTop: 16, background: T.card, borderRadius: 14, padding: 16, border: `1px solid ${T.border}` }}>
          <p style={{ fontSize: 11, color: T.dim, marginBottom: 8 }}>📋 حسابات الاختبار:</p>
          {[
            ['👑 مشرف عام', 'admin@wejha.qa'],
            ['💰 مالية', 'finance@wejha.qa'],
            ['📒 محاسبة', 'accounting@wejha.qa'],
          ].map(([role, em]) => (
            <div key={em} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: T.mid }}>{role}</span>
              <span style={{ fontSize: 11, color: T.gold, cursor: 'pointer' }} onClick={() => setEmail(em)}>{em}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
