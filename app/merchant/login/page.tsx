'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { merchantLogin } from '@/lib/auth'

const T = {
  bg: '#06090F', card: '#0D1117', maroon: '#7C1D2E',
  gold: '#C9A84C', text: '#F0EDE8', mid: '#9CA3AF',
  dim: '#4B5563', border: '#1F2937', green: '#2ECA88',
  red: '#EF4444', surf: '#111827',
}

export default function MerchantLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    if (!email || !password) return
    setLoading(true); setError('')
    const { error: err } = await merchantLogin(email, password)
    if (err) {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة')
      setLoading(false)
    } else {
      router.push('/merchant/dashboard')
    }
  }

  const inp = {
    width: '100%', padding: '13px 14px', borderRadius: 12,
    border: `1px solid ${T.border}`, background: T.surf,
    color: T.text, fontSize: 14, fontFamily: "'Tajawal', sans-serif",
    outline: 'none', boxSizing: 'border-box' as const,
    direction: 'rtl' as const,
  }

  return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🧭</div>
          <p style={{ fontSize: 24, fontWeight: 900, color: T.text, margin: 0 }}>وِجهة</p>
          <p style={{ fontSize: 13, color: T.mid, marginTop: 4 }}>لوحة تحكم التاجر</p>
        </div>

        {/* Card */}
        <div style={{ background: T.card, borderRadius: 20, padding: 24, border: `1px solid ${T.border}` }}>
          <p style={{ fontSize: 16, fontWeight: 800, color: T.text, marginBottom: 20, textAlign: 'center' }}>
            تسجيل دخول التاجر
          </p>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: T.mid, display: 'block', marginBottom: 6 }}>البريد الإلكتروني</label>
            <input style={inp} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="merchant@example.com" />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, color: T.mid, display: 'block', marginBottom: 6 }}>كلمة المرور</label>
            <input style={inp} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
              onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          </div>

          {error && (
            <div style={{ background: `${T.red}15`, borderRadius: 10, padding: '10px 14px', marginBottom: 14, border: `1px solid ${T.red}33` }}>
              <p style={{ fontSize: 13, color: T.red, margin: 0 }}>⚠️ {error}</p>
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: '100%', padding: 14, borderRadius: 13, border: 'none',
              background: loading ? T.dim : `linear-gradient(135deg,${T.maroon},${T.maroon}99)`,
              color: '#fff', fontSize: 15, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: "'Tajawal', sans-serif",
            }}
          >
            {loading ? '⏳ جاري الدخول...' : '🔐 دخول'}
          </button>

          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <a href="/merchant/register" style={{ fontSize: 13, color: T.gold, textDecoration: 'none' }}>
              تاجر جديد؟ سجّل متجرك ←
            </a>
          </div>
        </div>

        {/* Back to app */}
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <a href="/" style={{ fontSize: 12, color: T.dim, textDecoration: 'none' }}>← العودة لتطبيق العملاء</a>
        </div>
      </div>
    </div>
  )
}
