'use client'
import { useState, useEffect } from 'react'

export default function MerchantDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [merchant, setMerchant] = useState(null)
  const [loading, setLoading] = useState(true)

  const THEME = {
    colors: {
      primary: '#8B1F24',
      background: '#080608',
      surface: '#111015',
      card: '#18141F',
      border: '#374151',
      text: '#F0EDE8',
      textSecondary: '#9CA3AF',
      success: '#10B981',
      warning: '#F59E0B'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #8B1F24, #A62028)',
      surface: 'linear-gradient(180deg, #111015, #18141F)'
    }
  }

  useEffect(() => {
    // Mock login
    setTimeout(() => {
      setMerchant({
        name: 'مطعم الدوحة الملكي',
        email: 'royal@qreeb.qa',
        status: 'active',
        rating: 4.7
      })
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: THEME.colors.background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: THEME.colors.text
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48,
            height: 48,
            border: `4px solid ${THEME.colors.primary}30`,
            borderTopColor: THEME.colors.primary,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <h2>قريب | التاجر</h2>
          <p>جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: THEME.colors.background,
      color: THEME.colors.text,
      fontFamily: "'Tajawal', sans-serif"
    }}>
      <header style={{
        background: THEME.gradients.surface,
        padding: '16px 20px',
        borderBottom: `1px solid ${THEME.colors.border}`
      }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>
          🏪 قريب | التاجر
        </h1>
        <p style={{ margin: '4px 0 0 0', fontSize: 12, color: THEME.colors.textSecondary }}>
          {merchant?.name}
        </p>
      </header>

      <main style={{ padding: 20, maxWidth: 1200, margin: '0 auto' }}>
        <div style={{
          background: THEME.gradients.surface,
          borderRadius: 16,
          padding: 24,
          border: `1px solid ${THEME.colors.border}`
        }}>
          <h2 style={{ marginBottom: 16 }}>لوحة تحكم التاجر</h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16
          }}>
            <div style={{
              background: THEME.colors.card,
              padding: 16,
              borderRadius: 12,
              border: `1px solid ${THEME.colors.border}`
            }}>
              <h3 style={{ fontSize: 14, margin: '0 0 8px 0' }}>العروض النشطة</h3>
              <p style={{ fontSize: 24, fontWeight: 900, color: THEME.colors.primary, margin: 0 }}>6</p>
            </div>
            
            <div style={{
              background: THEME.colors.card,
              padding: 16,
              borderRadius: 12,
              border: `1px solid ${THEME.colors.border}`
            }}>
              <h3 style={{ fontSize: 14, margin: '0 0 8px 0' }}>الكوبونات المستخدمة</h3>
              <p style={{ fontSize: 24, fontWeight: 900, color: THEME.colors.success, margin: 0 }}>145</p>
            </div>
            
            <div style={{
              background: THEME.colors.card,
              padding: 16,
              borderRadius: 12,
              border: `1px solid ${THEME.colors.border}`
            }}>
              <h3 style={{ fontSize: 14, margin: '0 0 8px 0' }}>التقييم</h3>
              <p style={{ fontSize: 24, fontWeight: 900, color: THEME.colors.warning, margin: 0 }}>
                ⭐ {merchant?.rating}
              </p>
            </div>
          </div>

          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <p style={{ color: THEME.colors.textSecondary }}>
              مرحباً بك في لوحة تحكم التاجر المطورة
            </p>
            <p style={{ fontSize: 12, color: THEME.colors.textSecondary }}>
              إدارة العروض والكوبونات والتقارير قريباً...
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
