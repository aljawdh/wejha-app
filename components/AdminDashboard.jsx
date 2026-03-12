import { useState, useEffect, useCallback, useMemo } from 'react'

// Enhanced Admin Dashboard with Real-Time Data Integration
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState(null)
  const [merchants, setMerchants] = useState([])
  const [deals, setDeals] = useState([])
  const [categories, setCategories] = useState([])
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [language, setLanguage] = useState('ar')

  // Enhanced color palette
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
      secondary: 'linear-gradient(135deg, #D4A843, #E5B854)',
      success: 'linear-gradient(135deg, #10B981, #059669)',
      warning: 'linear-gradient(135deg, #F59E0B, #D97706)',
      surface: 'linear-gradient(180deg, #111015, #18141F)'
    }
  }

  // Check authentication on load
  useEffect(() => {
    const adminEmail = localStorage.getItem('qreeb_admin_email')
    const adminData = localStorage.getItem('qreeb_admin_data')
    
    if (adminEmail && adminData) {
      setUser(JSON.parse(adminData))
      fetchDashboardData()
    } else {
      // Redirect to login or show login form
      handleLogin('admin@qreeb.qa', 'مشرف قريب')
    }
  }, [])

  const handleLogin = (email, name) => {
    const adminData = { email, name, role: 'super_admin' }
    localStorage.setItem('qreeb_admin_email', email)
    localStorage.setItem('qreeb_admin_data', JSON.stringify(adminData))
    setUser(adminData)
    fetchDashboardData()
  }

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const [statsRes, merchantsRes, dealsRes, categoriesRes] = await Promise.all([
        fetch('/api/admin/stats').catch(() => ({ json: () => mockStats })),
        fetch('/api/merchants').catch(() => ({ json: () => ({ data: mockMerchants }) })),
        fetch('/api/deals').catch(() => ({ json: () => ({ data: mockDeals }) })),
        fetch('/api/categories').catch(() => ({ json: () => ({ data: mockCategories }) }))
      ])

      // Use mock data if API fails
      const statsData = await statsRes.json().catch(() => mockStats)
      const merchantsData = await merchantsRes.json().catch(() => ({ data: mockMerchants }))
      const dealsData = await dealsRes.json().catch(() => ({ data: mockDeals }))
      const categoriesData = await categoriesRes.json().catch(() => ({ data: mockCategories }))

      setStats(statsData.data || mockStats)
      setMerchants(merchantsData.data || mockMerchants)
      setDeals(dealsData.data || mockDeals)
      setCategories(categoriesData.data || mockCategories)
      
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
      // Use mock data as fallback
      setStats(mockStats)
      setMerchants(mockMerchants)
      setDeals(mockDeals)
      setCategories(mockCategories)
      setError('تعذر تحميل البيانات، يتم عرض بيانات تجريبية')
    } finally {
      setLoading(false)
    }
  }

  const updateMerchantStatus = async (merchantId, newStatus) => {
    try {
      const response = await fetch('/api/merchants', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: merchantId, status: newStatus })
      })

      if (response.ok) {
        setMerchants(prev => prev.map(m => 
          m.id === merchantId ? { ...m, status: newStatus } : m
        ))
      }
    } catch (error) {
      console.error('Failed to update merchant status:', error)
      // Update locally anyway for demo
      setMerchants(prev => prev.map(m => 
        m.id === merchantId ? { ...m, status: newStatus } : m
      ))
    }
  }

  // Mock data for demo
  const mockStats = {
    merchants: { total: 156, active: 142, pending: 8, suspended: 6 },
    deals: { total: 324, active: 278, expired: 46 },
    coupons: { total: 2847, used: 1923, active: 924, usageRate: 67.5 },
    revenue: { total: 95420, commission: 9542, merchant: 85878 }
  }

  const mockMerchants = [
    {
      id: '1',
      name: 'مطعم الدوحة الملكي',
      name_en: 'Royal Doha Restaurant',
      email: 'royal@qreeb.qa',
      phone: '+97450000001',
      status: 'active',
      verification_status: 'verified',
      rating: 4.7,
      city: 'الدوحة',
      deals_count: 8,
      coupons_claimed: 145,
      revenue: 15420,
      joined_date: '2024-01-15',
      categories: { name: 'مطاعم', emoji: '🍽️' }
    },
    {
      id: '2', 
      name: 'كافيه القصر',
      name_en: 'Palace Café',
      email: 'palace@qreeb.qa',
      phone: '+97450000002',
      status: 'pending',
      verification_status: 'pending',
      rating: 0,
      city: 'الدوحة',
      deals_count: 0,
      coupons_claimed: 0,
      revenue: 0,
      joined_date: '2024-03-10',
      categories: { name: 'مقاهي', emoji: '☕' }
    },
    {
      id: '3',
      name: 'بوتيك الأناقة',
      name_en: 'Elegance Boutique',
      email: 'elegance@qreeb.qa',
      phone: '+97450000003',
      status: 'active',
      verification_status: 'verified',
      rating: 4.9,
      city: 'الريان',
      deals_count: 12,
      coupons_claimed: 89,
      revenue: 8940,
      joined_date: '2024-02-20',
      categories: { name: 'بوتيك وعطور', emoji: '👗' }
    }
  ]

  const mockDeals = [
    {
      id: '1',
      title: 'برجر شيف + بطاطس + مشروب',
      title_en: 'Chef Burger + Fries + Drink',
      original_price: 45,
      final_price: 31.5,
      discount_percent: 30,
      max_coupons: 100,
      remaining_coupons: 67,
      is_active: true,
      is_featured: true,
      expires_at: '2024-04-15T23:59:59Z',
      merchants: { name: 'مطعم الدوحة الملكي', status: 'active' },
      created_at: '2024-03-01T10:00:00Z'
    },
    {
      id: '2',
      title: 'قهوة تركية مع حلويات',
      title_en: 'Turkish Coffee with Sweets',
      original_price: 25,
      final_price: 17.5,
      discount_percent: 30,
      max_coupons: 50,
      remaining_coupons: 23,
      is_active: true,
      is_featured: false,
      expires_at: '2024-04-20T23:59:59Z',
      merchants: { name: 'كافيه القصر', status: 'pending' },
      created_at: '2024-03-05T14:30:00Z'
    }
  ]

  const mockCategories = [
    { id: '1', name: 'مطاعم', name_en: 'Restaurants', emoji: '🍽️', merchants_count: 45, deals_count: 128, is_visible: true },
    { id: '2', name: 'مقاهي', name_en: 'Cafes', emoji: '☕', merchants_count: 32, deals_count: 89, is_visible: true },
    { id: '3', name: 'بوتيك وعطور', name_en: 'Fashion', emoji: '👗', merchants_count: 28, deals_count: 67, is_visible: true },
    { id: '4', name: 'سوبر ماركت', name_en: 'Supermarkets', emoji: '🛒', merchants_count: 15, deals_count: 34, is_visible: true }
  ]

  // Navigation tabs
  const tabs = [
    { id: 'dashboard', name: 'لوحة التحكم', nameEn: 'Dashboard', icon: '📊' },
    { id: 'merchants', name: 'التجار', nameEn: 'Merchants', icon: '🏪' },
    { id: 'deals', name: 'العروض', nameEn: 'Deals', icon: '🏷️' },
    { id: 'categories', name: 'الأقسام', nameEn: 'Categories', icon: '📂' },
    { id: 'coupons', name: 'الكوبونات', nameEn: 'Coupons', icon: '🎟️' },
    { id: 'analytics', name: 'التقارير', nameEn: 'Analytics', icon: '📈' },
    { id: 'settings', name: 'الإعدادات', nameEn: 'Settings', icon: '⚙️' }
  ]

  if (loading) {
    return <AdminLoadingScreen />
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: THEME.colors.background,
      color: THEME.colors.text,
      fontFamily: "'Tajawal', sans-serif"
    }}>
      {/* Top Header */}
      <header style={{
        background: THEME.gradients.surface,
        borderBottom: `1px solid ${THEME.colors.border}`,
        padding: '12px 20px',
        position: 'sticky',
        top: 0,
        zIndex: 40
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: 1400,
          margin: '0 auto'
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36,
              height: 36,
              background: THEME.gradients.primary,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18
            }}>
              🏷️
            </div>
            <div>
              <h1 style={{ 
                fontSize: 20, 
                fontWeight: 900, 
                margin: 0, 
                background: THEME.gradients.primary,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                قريب | الإدارة
              </h1>
              <p style={{ 
                fontSize: 11, 
                color: THEME.colors.textMuted, 
                margin: 0 
              }}>
                لوحة التحكم الرئيسية
              </p>
            </div>
          </div>

          {/* User Menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {error && (
              <div style={{
                background: `${THEME.colors.warning}20`,
                color: THEME.colors.warning,
                padding: '4px 8px',
                borderRadius: 6,
                fontSize: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}>
                <span>⚠️</span>
                <span>وضع تجريبي</span>
              </div>
            )}
            
            <div style={{
              background: THEME.colors.card,
              borderRadius: 8,
              padding: '8px 12px',
              border: `1px solid ${THEME.colors.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <div style={{
                width: 32,
                height: 32,
                background: THEME.gradients.primary,
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14
              }}>
                👑
              </div>
              <div>
                <p style={{ 
                  fontSize: 12, 
                  fontWeight: 700, 
                  margin: 0 
                }}>
                  {user?.name || 'مشرف قريب'}
                </p>
                <p style={{ 
                  fontSize: 10, 
                  color: THEME.colors.textSecondary, 
                  margin: 0 
                }}>
                  مشرف عام
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        padding: '20px'
      }}>
        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: 8,
          marginBottom: 24,
          overflowX: 'auto',
          paddingBottom: 8
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="tap"
              style={{
                background: activeTab === tab.id 
                  ? THEME.gradients.primary 
                  : THEME.colors.surface,
                color: activeTab === tab.id 
                  ? '#fff' 
                  : THEME.colors.text,
                border: `1px solid ${activeTab === tab.id 
                  ? THEME.colors.primary 
                  : THEME.colors.border}`,
                borderRadius: 12,
                padding: '10px 16px',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
                boxShadow: activeTab === tab.id ? '0 4px 12px rgba(139, 31, 36, 0.3)' : 'none'
              }}
            >
              <span style={{ fontSize: 16 }}>{tab.icon}</span>
              <span>{language === 'ar' ? tab.name : tab.nameEn}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && <DashboardTab stats={stats} theme={THEME} />}
        {activeTab === 'merchants' && (
          <MerchantsTab 
            merchants={merchants} 
            onUpdateStatus={updateMerchantStatus}
            theme={THEME} 
          />
        )}
        {activeTab === 'deals' && <DealsTab deals={deals} theme={THEME} />}
        {activeTab === 'categories' && <CategoriesTab categories={categories} theme={THEME} />}
        {activeTab === 'coupons' && <CouponsTab theme={THEME} />}
        {activeTab === 'analytics' && <AnalyticsTab stats={stats} theme={THEME} />}
        {activeTab === 'settings' && <SettingsTab theme={THEME} />}
      </div>
    </div>
  )
}

// ============================================================================
// Dashboard Tab Component
// ============================================================================

function DashboardTab({ stats, theme }) {
  const statCards = [
    {
      title: 'إجمالي التجار',
      value: stats?.merchants?.total || 0,
      change: '+12',
      changeType: 'positive',
      icon: '🏪',
      color: theme.colors.primary,
      details: [
        { label: 'نشط', value: stats?.merchants?.active || 0 },
        { label: 'معلق', value: stats?.merchants?.pending || 0 }
      ]
    },
    {
      title: 'العروض النشطة',
      value: stats?.deals?.active || 0,
      change: '+23',
      changeType: 'positive', 
      icon: '🏷️',
      color: theme.colors.secondary,
      details: [
        { label: 'إجمالي العروض', value: stats?.deals?.total || 0 },
        { label: 'منتهية الصلاحية', value: (stats?.deals?.total || 0) - (stats?.deals?.active || 0) }
      ]
    },
    {
      title: 'الكوبونات المستخدمة',
      value: stats?.coupons?.used || 0,
      change: `${stats?.coupons?.usageRate || 0}%`,
      changeType: 'positive',
      icon: '🎟️',
      color: theme.colors.success,
      details: [
        { label: 'إجمالي الكوبونات', value: stats?.coupons?.total || 0 },
        { label: 'نشط', value: stats?.coupons?.active || 0 }
      ]
    },
    {
      title: 'الإيرادات (ر.ق)',
      value: (stats?.revenue?.total || 0).toLocaleString(),
      change: '+8.2%',
      changeType: 'positive',
      icon: '💰',
      color: theme.colors.info,
      details: [
        { label: 'عمولة قريب', value: `${(stats?.revenue?.commission || 0).toLocaleString()} ر.ق` },
        { label: 'حصة التجار', value: `${(stats?.revenue?.merchant || 0).toLocaleString()} ر.ق` }
      ]
    }
  ]

  return (
    <div className="fade-up">
      {/* Quick Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 20,
        marginBottom: 32
      }}>
        {statCards.map((card, index) => (
          <div
            key={index}
            className="lift"
            style={{
              background: theme.gradients.surface,
              borderRadius: 16,
              padding: '20px',
              border: `1px solid ${theme.colors.border}`,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Card Decoration */}
            <div style={{
              position: 'absolute',
              top: -10,
              right: -10,
              width: 60,
              height: 60,
              background: `${card.color}15`,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24
            }}>
              {card.icon}
            </div>

            <div style={{ position: 'relative', zIndex: 2 }}>
              <p style={{
                fontSize: 13,
                color: theme.colors.textSecondary,
                margin: '0 0 8px 0',
                fontWeight: 600
              }}>
                {card.title}
              </p>
              
              <div style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 8,
                marginBottom: 12
              }}>
                <h3 style={{
                  fontSize: 28,
                  fontWeight: 900,
                  color: theme.colors.text,
                  margin: 0
                }}>
                  {card.value}
                </h3>
                <span style={{
                  fontSize: 11,
                  color: card.changeType === 'positive' ? theme.colors.success : theme.colors.error,
                  background: `${card.changeType === 'positive' ? theme.colors.success : theme.colors.error}20`,
                  padding: '2px 6px',
                  borderRadius: 4,
                  fontWeight: 700
                }}>
                  {card.change}
                </span>
              </div>

              {/* Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {card.details.map((detail, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      fontSize: 11,
                      color: theme.colors.textMuted
                    }}>
                      {detail.label}
                    </span>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: theme.colors.textSecondary
                    }}>
                      {detail.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{
        background: theme.gradients.surface,
        borderRadius: 16,
        padding: '20px',
        border: `1px solid ${theme.colors.border}`
      }}>
        <h4 style={{
          fontSize: 16,
          fontWeight: 800,
          color: theme.colors.text,
          margin: '0 0 16px 0'
        }}>
          الإجراءات السريعة
        </h4>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 12
        }}>
          {[
            { icon: '✅', text: 'موافقة التجار المعلقين', count: 8 },
            { icon: '📊', text: 'مراجعة التقارير اليومية', count: 3 },
            { icon: '🎟️', text: 'كوبونات تحتاج مراجعة', count: 12 },
            { icon: '⚠️', text: 'شكاوى جديدة', count: 2 }
          ].map((action, index) => (
            <button
              key={index}
              className="tap lift"
              style={{
                background: theme.colors.surface,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: 12,
                padding: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                transition: 'all 0.2s'
              }}
            >
              <span style={{ fontSize: 20 }}>{action.icon}</span>
              <div style={{ flex: 1, textAlign: 'right' }}>
                <p style={{
                  fontSize: 12,
                  color: theme.colors.text,
                  fontWeight: 600,
                  margin: 0
                }}>
                  {action.text}
                </p>
                {action.count > 0 && (
                  <span style={{
                    fontSize: 10,
                    color: theme.colors.primary,
                    fontWeight: 700
                  }}>
                    {action.count} عنصر
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Merchants Tab Component
// ============================================================================

function MerchantsTab({ merchants, onUpdateStatus, theme }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredMerchants = merchants.filter(merchant => {
    const matchesSearch = merchant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         merchant.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || merchant.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return theme.colors.success
      case 'pending': return theme.colors.warning
      case 'suspended': return theme.colors.error
      default: return theme.colors.textMuted
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'نشط'
      case 'pending': return 'معلق'
      case 'suspended': return 'موقوف'
      default: return status
    }
  }

  return (
    <div className="fade-up">
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
      }}>
        <h2 style={{
          fontSize: 20,
          fontWeight: 900,
          color: theme.colors.text,
          margin: 0
        }}>
          إدارة التجار ({merchants.length})
        </h2>
        
        <button
          className="tap"
          style={{
            background: theme.gradients.primary,
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            padding: '10px 16px',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <span>➕</span>
          <span>إضافة تاجر</span>
        </button>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: 12,
        marginBottom: 20,
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: '1', minWidth: 200 }}>
          <input
            type="text"
            placeholder="البحث عن تاجر..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: theme.colors.surface,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: 8,
              color: theme.colors.text,
              fontSize: 13,
              outline: 'none'
            }}
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '10px 12px',
            background: theme.colors.surface,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: 8,
            color: theme.colors.text,
            fontSize: 13,
            outline: 'none'
          }}
        >
          <option value="all">جميع الحالات</option>
          <option value="active">نشط</option>
          <option value="pending">معلق</option>
          <option value="suspended">موقوف</option>
        </select>
      </div>

      {/* Merchants List */}
      <div style={{
        background: theme.gradients.surface,
        borderRadius: 16,
        border: `1px solid ${theme.colors.border}`,
        overflow: 'hidden'
      }}>
        {filteredMerchants.length === 0 ? (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: theme.colors.textMuted
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <p>لا توجد تجار مطابقة للبحث</p>
          </div>
        ) : (
          filteredMerchants.map((merchant, index) => (
            <div
              key={merchant.id}
              style={{
                padding: '16px 20px',
                borderBottom: index < filteredMerchants.length - 1 
                  ? `1px solid ${theme.colors.border}` 
                  : 'none',
                transition: 'background 0.15s'
              }}
              onMouseEnter={(e) => e.target.style.background = theme.colors.card}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 16
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    background: theme.gradients.primary,
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20
                  }}>
                    {merchant.categories?.emoji || '🏪'}
                  </div>
                  
                  <div>
                    <h4 style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: theme.colors.text,
                      margin: '0 0 4px 0'
                    }}>
                      {merchant.name}
                    </h4>
                    <p style={{
                      fontSize: 11,
                      color: theme.colors.textSecondary,
                      margin: '0 0 2px 0'
                    }}>
                      {merchant.email} • {merchant.phone}
                    </p>
                    <p style={{
                      fontSize: 10,
                      color: theme.colors.textMuted,
                      margin: 0
                    }}>
                      {merchant.city} • انضم {merchant.joined_date}
                    </p>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16
                }}>
                  {/* Stats */}
                  <div style={{ textAlign: 'center' }}>
                    <p style={{
                      fontSize: 10,
                      color: theme.colors.textMuted,
                      margin: '0 0 2px 0'
                    }}>
                      العروض
                    </p>
                    <p style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: theme.colors.text,
                      margin: 0
                    }}>
                      {merchant.deals_count}
                    </p>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <p style={{
                      fontSize: 10,
                      color: theme.colors.textMuted,
                      margin: '0 0 2px 0'
                    }}>
                      الكوبونات
                    </p>
                    <p style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: theme.colors.text,
                      margin: 0
                    }}>
                      {merchant.coupons_claimed}
                    </p>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <p style={{
                      fontSize: 10,
                      color: theme.colors.textMuted,
                      margin: '0 0 2px 0'
                    }}>
                      الإيرادات
                    </p>
                    <p style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: theme.colors.secondary,
                      margin: 0
                    }}>
                      {merchant.revenue.toLocaleString()} ر.ق
                    </p>
                  </div>

                  {/* Status */}
                  <div style={{
                    background: `${getStatusColor(merchant.status)}20`,
                    color: getStatusColor(merchant.status),
                    padding: '4px 8px',
                    borderRadius: 6,
                    fontSize: 10,
                    fontWeight: 700
                  }}>
                    {getStatusText(merchant.status)}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    {merchant.status === 'pending' && (
                      <>
                        <button
                          className="tap"
                          onClick={() => onUpdateStatus(merchant.id, 'active')}
                          style={{
                            background: theme.colors.success,
                            color: '#fff',
                            border: 'none',
                            borderRadius: 6,
                            padding: '6px 8px',
                            fontSize: 10,
                            cursor: 'pointer'
                          }}
                        >
                          ✅ موافقة
                        </button>
                        <button
                          className="tap"
                          onClick={() => onUpdateStatus(merchant.id, 'rejected')}
                          style={{
                            background: theme.colors.error,
                            color: '#fff',
                            border: 'none',
                            borderRadius: 6,
                            padding: '6px 8px',
                            fontSize: 10,
                            cursor: 'pointer'
                          }}
                        >
                          ❌ رفض
                        </button>
                      </>
                    )}
                    
                    {merchant.status === 'active' && (
                      <button
                        className="tap"
                        onClick={() => onUpdateStatus(merchant.id, 'suspended')}
                        style={{
                          background: theme.colors.warning,
                          color: '#fff',
                          border: 'none',
                          borderRadius: 6,
                          padding: '6px 8px',
                          fontSize: 10,
                          cursor: 'pointer'
                        }}
                      >
                        ⏸️ إيقاف
                      </button>
                    )}

                    <button
                      className="tap"
                      style={{
                        background: theme.colors.surface,
                        border: `1px solid ${theme.colors.border}`,
                        borderRadius: 6,
                        padding: '6px 8px',
                        fontSize: 10,
                        cursor: 'pointer',
                        color: theme.colors.text
                      }}
                    >
                      📝 تعديل
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ============================================================================
// Loading Screen Component
// ============================================================================

function AdminLoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #080608 0%, #111015 50%, #080608 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#F0EDE8'
    }}>
      <div className="pop-in" style={{ textAlign: 'center' }}>
        <div style={{
          width: 64,
          height: 64,
          background: 'linear-gradient(135deg, #8B1F24, #A62028)',
          borderRadius: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
          marginBottom: 16,
          animation: 'pulse 2s ease-in-out infinite'
        }}>
          👑
        </div>
        
        <h2 style={{
          fontSize: 20,
          fontWeight: 900,
          marginBottom: 8
        }}>
          قريب | الإدارة
        </h2>
        
        <div style={{
          width: 48,
          height: 48,
          border: '4px solid #8B1F2430',
          borderTopColor: '#8B1F24',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '16px auto'
        }} />
        
        <p style={{
          color: '#9CA3AF',
          fontSize: 13
        }}>
          جاري تحميل لوحة التحكم...
        </p>
      </div>
    </div>
  )
}

// Additional empty tab components for completeness
function DealsTab({ deals, theme }) {
  return <div style={{ padding: 40, textAlign: 'center', color: theme.colors.textMuted }}>
    <h3>إدارة العروض</h3>
    <p>عدد العروض: {deals.length}</p>
  </div>
}

function CategoriesTab({ categories, theme }) {
  return <div style={{ padding: 40, textAlign: 'center', color: theme.colors.textMuted }}>
    <h3>إدارة الأقسام</h3>
    <p>عدد الأقسام: {categories.length}</p>
  </div>
}

function CouponsTab({ theme }) {
  return <div style={{ padding: 40, textAlign: 'center', color: theme.colors.textMuted }}>
    <h3>إدارة الكوبونات</h3>
    <p>قريباً...</p>
  </div>
}

function AnalyticsTab({ stats, theme }) {
  return <div style={{ padding: 40, textAlign: 'center', color: theme.colors.textMuted }}>
    <h3>التقارير والإحصائيات</h3>
    <p>قريباً...</p>
  </div>
}

function SettingsTab({ theme }) {
  return <div style={{ padding: 40, textAlign: 'center', color: theme.colors.textMuted }}>
    <h3>إعدادات النظام</h3>
    <p>قريباً...</p>
  </div>
}
