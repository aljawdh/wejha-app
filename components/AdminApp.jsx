'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// Admin Dashboard Configuration & Constants
// ============================================================================

const ADMIN_CONFIG = {
  roles: {
    super_admin: { name: 'مدير عام', nameEn: 'Super Admin', permissions: ['all'] },
    admin: { name: 'مدير', nameEn: 'Admin', permissions: ['merchants', 'deals', 'users', 'reports'] },
    merchant_manager: { name: 'مدير التجار', nameEn: 'Merchant Manager', permissions: ['merchants'] },
    finance_manager: { name: 'مدير مالي', nameEn: 'Finance Manager', permissions: ['payouts', 'reports'] },
    support: { name: 'دعم فني', nameEn: 'Support', permissions: ['complaints', 'users'] }
  },
  defaultCurrency: 'QAR',
  dashboardRefreshInterval: 30000, // 30 seconds
  maxItemsPerPage: 20
}

const THEME = {
  colors: {
    primary: '#8B1F24',
    primaryLight: '#A62028',
    secondary: '#D4A843',
    background: '#080608',
    surface: '#111015',
    card: '#18141F',
    border: '#374151',
    text: '#F0EDE8',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6'
  },
  gradients: {
    primary: 'linear-gradient(135deg, #8B1F24, #A62028)',
    surface: 'linear-gradient(180deg, #111015, #18141F)'
  },
  shadows: {
    sm: '0 2px 4px rgba(0,0,0,0.1)',
    md: '0 4px 16px rgba(0,0,0,0.2)',
    lg: '0 8px 32px rgba(0,0,0,0.3)',
    glow: '0 0 20px #8B1F2440'
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

function formatCurrency(amount) {
  return new Intl.NumberFormat('ar-QA', {
    style: 'currency',
    currency: 'QAR',
    minimumFractionDigits: 2
  }).format(amount).replace('QAR', 'ر.ق')
}

function formatDate(date, language = 'ar') {
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
  
  return new Intl.DateTimeFormat(language === 'ar' ? 'ar-QA' : 'en-US', options).format(new Date(date))
}

function formatNumber(number) {
  return new Intl.NumberFormat('ar-QA').format(number)
}

function getStatusColor(status) {
  const statusColors = {
    active: THEME.colors.success,
    pending: THEME.colors.warning,
    suspended: THEME.colors.error,
    rejected: THEME.colors.error,
    inactive: THEME.colors.textMuted,
    verified: THEME.colors.success,
    unverified: THEME.colors.warning,
    used: THEME.colors.success,
    expired: THEME.colors.textMuted,
    cancelled: THEME.colors.error
  }
  
  return statusColors[status] || THEME.colors.textSecondary
}

function getStatusText(status, language = 'ar') {
  const statusTexts = {
    active: { ar: 'نشط', en: 'Active' },
    pending: { ar: 'معلق', en: 'Pending' },
    suspended: { ar: 'معلق', en: 'Suspended' },
    rejected: { ar: 'مرفوض', en: 'Rejected' },
    inactive: { ar: 'غير نشط', en: 'Inactive' },
    verified: { ar: 'محقق', en: 'Verified' },
    unverified: { ar: 'غير محقق', en: 'Unverified' },
    used: { ar: 'مستخدم', en: 'Used' },
    expired: { ar: 'منتهي', en: 'Expired' },
    cancelled: { ar: 'ملغي', en: 'Cancelled' }
  }
  
  return statusTexts[status]?.[language] || status
}

// ============================================================================
// Mock API Functions (replace with actual API calls)
// ============================================================================

async function fetchDashboardStats() {
  // Simulate API call
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        merchants: { total: 156, active: 142, pending: 14 },
        deals: { total: 89, active: 67 },
        coupons: { total: 1247, used: 834, usageRate: 66.9 },
        revenue: { total: 45678.50, commission: 4567.85, merchant: 41110.65 }
      })
    }, 1000)
  })
}

async function fetchMerchants(filters = {}) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          name: 'مطعم الدوحة الملكي',
          nameEn: 'Royal Doha Restaurant',
          email: 'royal@qreeb.qa',
          phone: '+97450000001',
          status: 'active',
          verificationStatus: 'verified',
          city: 'الدوحة',
          category: 'مطاعم',
          rating: 4.7,
          dealsCount: 5,
          revenue: 12456.78,
          joinedDate: '2024-01-15',
          lastActive: '2024-03-10T14:30:00Z'
        },
        {
          id: 2,
          name: 'مقهى الكورنيش',
          nameEn: 'Corniche Cafe',
          email: 'corniche@qreeb.qa',
          phone: '+97450000002',
          status: 'pending',
          verificationStatus: 'pending',
          city: 'الدوحة',
          category: 'مقاهي',
          rating: 0,
          dealsCount: 0,
          revenue: 0,
          joinedDate: '2024-03-12',
          lastActive: '2024-03-12T09:15:00Z'
        }
      ])
    }, 800)
  })
}

async function fetchDeals(filters = {}) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          title: 'برجر شيف + بطاطس + مشروب',
          titleEn: 'Chef Burger + Fries + Drink',
          merchant: 'مطعم الدوحة الملكي',
          category: 'مطاعم',
          originalPrice: 45.00,
          finalPrice: 31.50,
          discountPercent: 30,
          maxCoupons: 100,
          remainingCoupons: 73,
          claimsCount: 27,
          isActive: true,
          isFeatured: true,
          expiresAt: '2024-04-15T23:59:59Z',
          createdAt: '2024-03-01T10:00:00Z'
        },
        {
          id: 2,
          title: 'قهوة تركية + حلويات',
          titleEn: 'Turkish Coffee + Sweets',
          merchant: 'مقهى الكورنيش',
          category: 'مقاهي',
          originalPrice: 25.00,
          finalPrice: 18.75,
          discountPercent: 25,
          maxCoupons: 50,
          remainingCoupons: 50,
          claimsCount: 0,
          isActive: false,
          isFeatured: false,
          expiresAt: '2024-04-30T23:59:59Z',
          createdAt: '2024-03-12T14:20:00Z'
        }
      ])
    }, 600)
  })
}

async function updateMerchantStatus(merchantId, status, verificationStatus) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ success: true, message: 'تم تحديث حالة التاجر بنجاح' })
    }, 500)
  })
}

// ============================================================================
// Components
// ============================================================================

function StatCard({ title, value, subtitle, icon, color = THEME.colors.primary, trend }) {
  return (
    <div className="fade-up" style={{
      background: THEME.colors.surface,
      borderRadius: THEME.radius.lg,
      padding: '20px',
      border: `1px solid ${THEME.colors.border}`,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: -10,
        right: -10,
        fontSize: 60,
        opacity: 0.1,
        color: color
      }}>
        {icon}
      </div>
      
      <div style={{ position: 'relative', zIndex: 2 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8
        }}>
          <span style={{
            fontSize: 12,
            color: THEME.colors.textSecondary,
            fontWeight: 600
          }}>
            {title}
          </span>
          <span style={{ fontSize: 20, color: color }}>
            {icon}
          </span>
        </div>
        
        <div style={{
          fontSize: 28,
          fontWeight: 900,
          color: THEME.colors.text,
          marginBottom: 4,
          fontFamily: "'Tajawal', sans-serif"
        }}>
          {value}
        </div>
        
        {subtitle && (
          <div style={{
            fontSize: 11,
            color: THEME.colors.textMuted
          }}>
            {subtitle}
          </div>
        )}
        
        {trend && (
          <div style={{
            fontSize: 11,
            color: trend.isPositive ? THEME.colors.success : THEME.colors.error,
            marginTop: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}>
            <span>{trend.isPositive ? '↗️' : '↘️'}</span>
            <span>{trend.value}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function DataTable({ columns, data, loading, onAction, language = 'ar' }) {
  if (loading) {
    return (
      <div style={{
        background: THEME.colors.surface,
        borderRadius: THEME.radius.lg,
        border: `1px solid ${THEME.colors.border}`,
        padding: '40px',
        textAlign: 'center'
      }}>
        <div style={{
          width: 40,
          height: 40,
          border: `4px solid ${THEME.colors.primary}30`,
          borderTopColor: THEME.colors.primary,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px'
        }} />
        <p style={{ color: THEME.colors.textSecondary }}>
          {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
        </p>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div style={{
        background: THEME.colors.surface,
        borderRadius: THEME.radius.lg,
        border: `1px solid ${THEME.colors.border}`,
        padding: '40px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}>📭</div>
        <p style={{ color: THEME.colors.textSecondary }}>
          {language === 'ar' ? 'لا توجد بيانات' : 'No data available'}
        </p>
      </div>
    )
  }

  return (
    <div style={{
      background: THEME.colors.surface,
      borderRadius: THEME.radius.lg,
      border: `1px solid ${THEME.colors.border}`,
      overflow: 'hidden'
    }}>
      {/* Table Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: columns.map(col => col.width || '1fr').join(' '),
        gap: '16px',
        padding: '16px 20px',
        background: THEME.colors.card,
        borderBottom: `1px solid ${THEME.colors.border}`,
        fontWeight: 700,
        fontSize: 12,
        color: THEME.colors.textSecondary
      }}>
        {columns.map(column => (
          <div key={column.key} style={{ textAlign: column.align || 'right' }}>
            {column.title}
          </div>
        ))}
      </div>

      {/* Table Body */}
      <div>
        {data.map((row, index) => (
          <div
            key={row.id || index}
            className="fade-up"
            style={{
              display: 'grid',
              gridTemplateColumns: columns.map(col => col.width || '1fr').join(' '),
              gap: '16px',
              padding: '16px 20px',
              borderBottom: index < data.length - 1 ? `1px solid ${THEME.colors.border}` : 'none',
              transition: 'background 0.2s',
              animationDelay: `${index * 50}ms`
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = THEME.colors.card}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            {columns.map(column => (
              <div 
                key={column.key} 
                style={{ 
                  textAlign: column.align || 'right',
                  fontSize: 13,
                  color: THEME.colors.text
                }}
              >
                {column.render ? column.render(row[column.key], row) : row[column.key]}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function StatusBadge({ status, language = 'ar' }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '4px 8px',
      borderRadius: THEME.radius.sm,
      fontSize: 11,
      fontWeight: 600,
      background: `${getStatusColor(status)}20`,
      color: getStatusColor(status),
      border: `1px solid ${getStatusColor(status)}40`
    }}>
      <div style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: getStatusColor(status)
      }} />
      {getStatusText(status, language)}
    </span>
  )
}

// ============================================================================
// Main Admin Dashboard Component
// ============================================================================

function AdminDashboard({ language = 'ar' }) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState(null)
  const [merchants, setMerchants] = useState([])
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState({
    stats: true,
    merchants: false,
    deals: false
  })

  // Load dashboard stats
  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(prev => ({ ...prev, stats: true }))
        const data = await fetchDashboardStats()
        setStats(data)
      } catch (error) {
        console.error('Failed to load stats:', error)
      } finally {
        setLoading(prev => ({ ...prev, stats: false }))
      }
    }

    loadStats()
  }, [])

  // Load merchants when tab is active
  useEffect(() => {
    if (activeTab === 'merchants') {
      loadMerchants()
    }
  }, [activeTab])

  // Load deals when tab is active
  useEffect(() => {
    if (activeTab === 'deals') {
      loadDeals()
    }
  }, [activeTab])

  const loadMerchants = async () => {
    try {
      setLoading(prev => ({ ...prev, merchants: true }))
      const data = await fetchMerchants()
      setMerchants(data)
    } catch (error) {
      console.error('Failed to load merchants:', error)
    } finally {
      setLoading(prev => ({ ...prev, merchants: false }))
    }
  }

  const loadDeals = async () => {
    try {
      setLoading(prev => ({ ...prev, deals: true }))
      const data = await fetchDeals()
      setDeals(data)
    } catch (error) {
      console.error('Failed to load deals:', error)
    } finally {
      setLoading(prev => ({ ...prev, deals: false }))
    }
  }

  const handleMerchantAction = async (merchantId, action) => {
    try {
      await updateMerchantStatus(merchantId, action)
      loadMerchants() // Refresh data
    } catch (error) {
      console.error('Failed to update merchant:', error)
    }
  }

  // Merchants table columns
  const merchantColumns = [
    {
      key: 'name',
      title: language === 'ar' ? 'اسم التاجر' : 'Merchant Name',
      render: (value, row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{language === 'ar' ? row.name : row.nameEn}</div>
          <div style={{ fontSize: 11, color: THEME.colors.textMuted }}>{row.email}</div>
        </div>
      )
    },
    {
      key: 'category',
      title: language === 'ar' ? 'الفئة' : 'Category',
      width: '120px'
    },
    {
      key: 'status',
      title: language === 'ar' ? 'الحالة' : 'Status',
      width: '100px',
      render: (value) => <StatusBadge status={value} language={language} />
    },
    {
      key: 'verification',
      title: language === 'ar' ? 'التحقق' : 'Verification',
      width: '100px',
      render: (value, row) => <StatusBadge status={row.verificationStatus} language={language} />
    },
    {
      key: 'revenue',
      title: language === 'ar' ? 'الإيرادات' : 'Revenue',
      width: '120px',
      render: (value) => formatCurrency(value),
      align: 'center'
    },
    {
      key: 'actions',
      title: language === 'ar' ? 'إجراءات' : 'Actions',
      width: '140px',
      render: (value, row) => (
        <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
          {row.status === 'pending' && (
            <>
              <button
                className="tap"
                onClick={() => handleMerchantAction(row.id, 'active')}
                style={{
                  padding: '4px 8px',
                  borderRadius: THEME.radius.sm,
                  border: 'none',
                  background: THEME.colors.success,
                  color: 'white',
                  fontSize: 10,
                  cursor: 'pointer'
                }}
              >
                ✓ {language === 'ar' ? 'قبول' : 'Approve'}
              </button>
              <button
                className="tap"
                onClick={() => handleMerchantAction(row.id, 'rejected')}
                style={{
                  padding: '4px 8px',
                  borderRadius: THEME.radius.sm,
                  border: 'none',
                  background: THEME.colors.error,
                  color: 'white',
                  fontSize: 10,
                  cursor: 'pointer'
                }}
              >
                ✗ {language === 'ar' ? 'رفض' : 'Reject'}
              </button>
            </>
          )}
          {row.status === 'active' && (
            <button
              className="tap"
              onClick={() => handleMerchantAction(row.id, 'suspended')}
              style={{
                padding: '4px 8px',
                borderRadius: THEME.radius.sm,
                border: 'none',
                background: THEME.colors.warning,
                color: 'white',
                fontSize: 10,
                cursor: 'pointer'
              }}
            >
              ⏸️ {language === 'ar' ? 'تعليق' : 'Suspend'}
            </button>
          )}
        </div>
      )
    }
  ]

  // Deals table columns
  const dealColumns = [
    {
      key: 'title',
      title: language === 'ar' ? 'العرض' : 'Deal',
      render: (value, row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{language === 'ar' ? row.title : row.titleEn}</div>
          <div style={{ fontSize: 11, color: THEME.colors.textMuted }}>{row.merchant}</div>
        </div>
      )
    },
    {
      key: 'price',
      title: language === 'ar' ? 'السعر' : 'Price',
      width: '140px',
      render: (value, row) => (
        <div style={{ textAlign: 'center' }}>
          <div style={{ textDecoration: 'line-through', color: THEME.colors.textMuted, fontSize: 11 }}>
            {formatCurrency(row.originalPrice)}
          </div>
          <div style={{ fontWeight: 700, color: THEME.colors.success }}>
            {formatCurrency(row.finalPrice)}
          </div>
          <div style={{ fontSize: 10, color: THEME.colors.primary }}>
            {row.discountPercent}% {language === 'ar' ? 'خصم' : 'off'}
          </div>
        </div>
      ),
      align: 'center'
    },
    {
      key: 'availability',
      title: language === 'ar' ? 'التوفر' : 'Availability',
      width: '120px',
      render: (value, row) => (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 600 }}>{row.remainingCoupons}/{row.maxCoupons}</div>
          <div style={{ fontSize: 10, color: THEME.colors.textMuted }}>
            {language === 'ar' ? 'كوبون متبقي' : 'remaining'}
          </div>
        </div>
      ),
      align: 'center'
    },
    {
      key: 'status',
      title: language === 'ar' ? 'الحالة' : 'Status',
      width: '100px',
      render: (value, row) => <StatusBadge status={row.isActive ? 'active' : 'inactive'} language={language} />
    },
    {
      key: 'expires',
      title: language === 'ar' ? 'ينتهي في' : 'Expires',
      width: '120px',
      render: (value, row) => (
        <div style={{ fontSize: 11, color: THEME.colors.textMuted }}>
          {formatDate(row.expiresAt, language)}
        </div>
      )
    }
  ]

  const navigationTabs = [
    { id: 'dashboard', label: language === 'ar' ? 'لوحة التحكم' : 'Dashboard', icon: '📊' },
    { id: 'merchants', label: language === 'ar' ? 'التجار' : 'Merchants', icon: '🏪' },
    { id: 'deals', label: language === 'ar' ? 'العروض' : 'Deals', icon: '🎯' },
    { id: 'coupons', label: language === 'ar' ? 'الكوبونات' : 'Coupons', icon: '🎫' },
    { id: 'finance', label: language === 'ar' ? 'المالية' : 'Finance', icon: '💰' },
    { id: 'settings', label: language === 'ar' ? 'الإعدادات' : 'Settings', icon: '⚙️' }
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: THEME.colors.background,
      color: THEME.colors.text
    }}>
      {/* Header */}
      <div style={{
        background: THEME.colors.surface,
        borderBottom: `1px solid ${THEME.colors.border}`,
        padding: '16px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36,
              height: 36,
              background: THEME.gradients.primary,
              borderRadius: THEME.radius.md,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18
            }}>
              👑
            </div>
            <div>
              <h1 style={{
                fontSize: 18,
                fontWeight: 900,
                margin: 0,
                fontFamily: "'Tajawal', sans-serif"
              }}>
                {language === 'ar' ? 'لوحة تحكم قريب' : 'Qreeb Admin'}
              </h1>
              <p style={{
                fontSize: 11,
                color: THEME.colors.textSecondary,
                margin: 0
              }}>
                {language === 'ar' ? 'إدارة شاملة للمنصة' : 'Complete platform management'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              style={{
                padding: '8px 16px',
                borderRadius: THEME.radius.md,
                border: `1px solid ${THEME.colors.border}`,
                background: 'none',
                color: THEME.colors.text,
                cursor: 'pointer',
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              🔄 {language === 'ar' ? 'تحديث' : 'Refresh'}
            </button>
            
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: THEME.gradients.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: 12
            }}>
              ق
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex' }}>
        {/* Sidebar Navigation */}
        <div style={{
          width: 240,
          background: THEME.colors.surface,
          borderLeft: `1px solid ${THEME.colors.border}`,
          padding: '20px 0',
          height: 'calc(100vh - 69px)',
          position: 'sticky',
          top: 69
        }}>
          {navigationTabs.map(tab => (
            <button
              key={tab.id}
              className="tap"
              onClick={() => setActiveTab(tab.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 20px',
                border: 'none',
                background: activeTab === tab.id ? `${THEME.colors.primary}20` : 'none',
                borderRight: activeTab === tab.id ? `3px solid ${THEME.colors.primary}` : '3px solid transparent',
                color: activeTab === tab.id ? THEME.colors.primary : THEME.colors.textSecondary,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: activeTab === tab.id ? 700 : 500,
                textAlign: 'right',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  e.target.style.background = THEME.colors.card
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  e.target.style.background = 'none'
                }
              }}
            >
              <span style={{ fontSize: 16 }}>{tab.icon}</span>
              <span style={{ flex: 1 }}>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: '20px 24px' }}>
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div>
              <h2 style={{
                fontSize: 20,
                fontWeight: 800,
                marginBottom: 20,
                fontFamily: "'Tajawal', sans-serif"
              }}>
                {language === 'ar' ? 'نظرة عامة' : 'Overview'}
              </h2>

              {/* Stats Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '20px',
                marginBottom: 32
              }}>
                <StatCard
                  title={language === 'ar' ? 'إجمالي التجار' : 'Total Merchants'}
                  value={stats ? formatNumber(stats.merchants.total) : '--'}
                  subtitle={stats ? `${stats.merchants.active} ${language === 'ar' ? 'نشط' : 'active'}` : ''}
                  icon="🏪"
                  color={THEME.colors.info}
                  trend={{ value: '+12%', isPositive: true }}
                />

                <StatCard
                  title={language === 'ar' ? 'العروض النشطة' : 'Active Deals'}
                  value={stats ? formatNumber(stats.deals.active) : '--'}
                  subtitle={stats ? `من ${stats.deals.total} ${language === 'ar' ? 'عرض' : 'deals'}` : ''}
                  icon="🎯"
                  color={THEME.colors.success}
                  trend={{ value: '+8%', isPositive: true }}
                />

                <StatCard
                  title={language === 'ar' ? 'الكوبونات المستخدمة' : 'Used Coupons'}
                  value={stats ? formatNumber(stats.coupons.used) : '--'}
                  subtitle={stats ? `${stats.coupons.usageRate}% ${language === 'ar' ? 'معدل الاستخدام' : 'usage rate'}` : ''}
                  icon="🎫"
                  color={THEME.colors.warning}
                  trend={{ value: '+15%', isPositive: true }}
                />

                <StatCard
                  title={language === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue'}
                  value={stats ? formatCurrency(stats.revenue.total) : '--'}
                  subtitle={stats ? `${formatCurrency(stats.revenue.commission)} ${language === 'ar' ? 'عمولة' : 'commission'}` : ''}
                  icon="💰"
                  color={THEME.colors.primary}
                  trend={{ value: '+22%', isPositive: true }}
                />
              </div>

              {/* Quick Actions */}
              <div style={{
                background: THEME.colors.surface,
                borderRadius: THEME.radius.lg,
                padding: '20px',
                border: `1px solid ${THEME.colors.border}`
              }}>
                <h3 style={{
                  fontSize: 16,
                  fontWeight: 700,
                  marginBottom: 16,
                  color: THEME.colors.text
                }}>
                  {language === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}
                </h3>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '12px'
                }}>
                  {[
                    { label: language === 'ar' ? 'موافقة على التجار' : 'Approve Merchants', icon: '✅', badge: '14' },
                    { label: language === 'ar' ? 'مراجعة العروض' : 'Review Deals', icon: '📋', badge: '7' },
                    { label: language === 'ar' ? 'معالجة المدفوعات' : 'Process Payments', icon: '💳', badge: '23' },
                    { label: language === 'ar' ? 'دعم العملاء' : 'Customer Support', icon: '💬', badge: '5' }
                  ].map((action, index) => (
                    <button
                      key={index}
                      className="tap lift"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        borderRadius: THEME.radius.md,
                        border: `1px solid ${THEME.colors.border}`,
                        background: THEME.colors.card,
                        color: THEME.colors.text,
                        cursor: 'pointer',
                        fontSize: 12,
                        fontWeight: 600,
                        transition: 'all 0.18s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 16 }}>{action.icon}</span>
                        <span>{action.label}</span>
                      </div>
                      <div style={{
                        background: THEME.colors.primary,
                        color: 'white',
                        borderRadius: '12px',
                        padding: '2px 6px',
                        fontSize: 10,
                        fontWeight: 700,
                        minWidth: '20px',
                        textAlign: 'center'
                      }}>
                        {action.badge}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Merchants Tab */}
          {activeTab === 'merchants' && (
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 20
              }}>
                <h2 style={{
                  fontSize: 20,
                  fontWeight: 800,
                  margin: 0,
                  fontFamily: "'Tajawal', sans-serif"
                }}>
                  {language === 'ar' ? 'إدارة التجار' : 'Merchant Management'}
                </h2>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    className="tap"
                    style={{
                      padding: '8px 16px',
                      borderRadius: THEME.radius.md,
                      border: `1px solid ${THEME.colors.border}`,
                      background: 'none',
                      color: THEME.colors.text,
                      cursor: 'pointer',
                      fontSize: 12
                    }}
                  >
                    🔍 {language === 'ar' ? 'بحث' : 'Search'}
                  </button>
                  
                  <button
                    className="tap"
                    style={{
                      padding: '8px 16px',
                      borderRadius: THEME.radius.md,
                      border: 'none',
                      background: THEME.gradients.primary,
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: 600
                    }}
                  >
                    + {language === 'ar' ? 'تاجر جديد' : 'New Merchant'}
                  </button>
                </div>
              </div>

              <DataTable
                columns={merchantColumns}
                data={merchants}
                loading={loading.merchants}
                onAction={handleMerchantAction}
                language={language}
              />
            </div>
          )}

          {/* Deals Tab */}
          {activeTab === 'deals' && (
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 20
              }}>
                <h2 style={{
                  fontSize: 20,
                  fontWeight: 800,
                  margin: 0,
                  fontFamily: "'Tajawal', sans-serif"
                }}>
                  {language === 'ar' ? 'إدارة العروض' : 'Deal Management'}
                </h2>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    className="tap"
                    style={{
                      padding: '8px 16px',
                      borderRadius: THEME.radius.md,
                      border: `1px solid ${THEME.colors.border}`,
                      background: 'none',
                      color: THEME.colors.text,
                      cursor: 'pointer',
                      fontSize: 12
                    }}
                  >
                    📊 {language === 'ar' ? 'إحصائيات' : 'Analytics'}
                  </button>
                </div>
              </div>

              <DataTable
                columns={dealColumns}
                data={deals}
                loading={loading.deals}
                language={language}
              />
            </div>
          )}

          {/* Other tabs placeholder */}
          {!['dashboard', 'merchants', 'deals'].includes(activeTab) && (
            <div style={{
              background: THEME.colors.surface,
              borderRadius: THEME.radius.lg,
              border: `1px solid ${THEME.colors.border}`,
              padding: '40px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🚧</div>
              <h3 style={{ color: THEME.colors.text, marginBottom: 8 }}>
                {language === 'ar' ? 'قيد التطوير' : 'Under Development'}
              </h3>
              <p style={{ color: THEME.colors.textSecondary }}>
                {language === 'ar' 
                  ? 'هذا القسم قيد التطوير وسيكون متاحاً قريباً'
                  : 'This section is under development and will be available soon'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Admin Login Component
// ============================================================================

function AdminLogin({ onLogin, language = 'ar' }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Simulate login
      if (email === 'admin@qreeb.qa' && password === '123456') {
        localStorage.setItem('qreeb_admin_session', JSON.stringify({
          email,
          role: 'super_admin',
          name: 'مشرف قريب',
          loginTime: new Date().toISOString()
        }))
        onLogin({ email, role: 'super_admin', name: 'مشرف قريب' })
      } else {
        setError(language === 'ar' ? 'بيانات الدخول غير صحيحة' : 'Invalid credentials')
      }
    } catch (err) {
      setError(language === 'ar' ? 'فشل تسجيل الدخول' : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: THEME.gradients.surface,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <form onSubmit={handleLogin} style={{
        width: '100%',
        maxWidth: 400,
        background: THEME.colors.surface,
        borderRadius: THEME.radius.xl,
        padding: '32px 24px',
        border: `1px solid ${THEME.colors.border}`,
        boxShadow: THEME.shadows.lg
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64,
            height: 64,
            background: THEME.gradients.primary,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            margin: '0 auto 16px'
          }}>
            👑
          </div>
          
          <h1 style={{
            fontSize: 24,
            fontWeight: 900,
            color: THEME.colors.text,
            marginBottom: 8,
            fontFamily: "'Tajawal', sans-serif"
          }}>
            {language === 'ar' ? 'لوحة تحكم قريب' : 'Qreeb Admin'}
          </h1>
          
          <p style={{
            color: THEME.colors.textSecondary,
            fontSize: 14
          }}>
            {language === 'ar' ? 'تسجيل دخول المدير' : 'Admin Login'}
          </p>
        </div>

        {/* Demo Credentials */}
        <div style={{
          background: `${THEME.colors.info}15`,
          border: `1px solid ${THEME.colors.info}30`,
          borderRadius: THEME.radius.md,
          padding: '12px',
          marginBottom: 20
        }}>
          <div style={{ fontSize: 12, color: THEME.colors.info, marginBottom: 4, fontWeight: 600 }}>
            {language === 'ar' ? 'بيانات التجربة:' : 'Demo Credentials:'}
          </div>
          <div style={{ fontSize: 11, color: THEME.colors.text, fontFamily: 'monospace' }}>
            admin@qreeb.qa / 123456
          </div>
        </div>

        {/* Email Input */}
        <div style={{ marginBottom: 16 }}>
          <label style={{
            display: 'block',
            fontSize: 12,
            color: THEME.colors.textSecondary,
            marginBottom: 6,
            fontWeight: 600
          }}>
            {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: THEME.radius.md,
              border: `1.5px solid ${THEME.colors.border}`,
              background: THEME.colors.card,
              color: THEME.colors.text,
              fontSize: 14,
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = THEME.colors.primary}
            onBlur={(e) => e.target.style.borderColor = THEME.colors.border}
          />
        </div>

        {/* Password Input */}
        <div style={{ marginBottom: 20 }}>
          <label style={{
            display: 'block',
            fontSize: 12,
            color: THEME.colors.textSecondary,
            marginBottom: 6,
            fontWeight: 600
          }}>
            {language === 'ar' ? 'كلمة المرور' : 'Password'}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: THEME.radius.md,
              border: `1.5px solid ${THEME.colors.border}`,
              background: THEME.colors.card,
              color: THEME.colors.text,
              fontSize: 14,
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = THEME.colors.primary}
            onBlur={(e) => e.target.style.borderColor = THEME.colors.border}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            color: THEME.colors.error,
            fontSize: 12,
            marginBottom: 16,
            padding: '8px 12px',
            background: `${THEME.colors.error}15`,
            borderRadius: THEME.radius.sm,
            border: `1px solid ${THEME.colors.error}30`
          }}>
            {error}
          </div>
        )}

        {/* Login Button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: THEME.radius.md,
            border: 'none',
            background: loading ? THEME.colors.textMuted : THEME.gradients.primary,
            color: 'white',
            fontSize: 15,
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'all 0.2s'
          }}
        >
          {loading ? (
            <>
              <div style={{
                width: 16,
                height: 16,
                border: '2px solid #ffffff33',
                borderTopColor: '#ffffff',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }} />
              <span>{language === 'ar' ? 'جاري الدخول...' : 'Logging in...'}</span>
            </>
          ) : (
            <>
              <span>🔑</span>
              <span>{language === 'ar' ? 'دخول' : 'Login'}</span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}

// ============================================================================
// Main Admin App Export
// ============================================================================

export default function AdminApp({ language = 'ar' }) {
  const [user, setUser] = useState(null)

  // Check for existing admin session
  useEffect(() => {
    const savedSession = localStorage.getItem('qreeb_admin_session')
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession)
        setUser(session)
      } catch (error) {
        console.error('Invalid admin session:', error)
        localStorage.removeItem('qreeb_admin_session')
      }
    }
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('qreeb_admin_session')
    setUser(null)
  }

  if (!user) {
    return <AdminLogin onLogin={handleLogin} language={language} />
  }

  return <AdminDashboard user={user} language={language} />
}
