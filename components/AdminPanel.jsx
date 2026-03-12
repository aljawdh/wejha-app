import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// Enhanced Theme & Configuration
// ============================================================================

const ADMIN_THEME = {
  colors: {
    primary: '#8B1F24',
    primaryLight: '#A62028',
    secondary: '#D4A843',
    background: '#080608',
    surface: '#111015',
    card: '#18141F',
    cardHover: '#1F1B26',
    border: '#374151',
    borderLight: '#4B5563',
    text: '#F0EDE8',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    purple: '#8B5CF6',
    pink: '#EC4899'
  },
  gradients: {
    primary: 'linear-gradient(135deg, #8B1F24, #A62028)',
    secondary: 'linear-gradient(135deg, #D4A843, #E5B854)',
    success: 'linear-gradient(135deg, #10B981, #059669)',
    info: 'linear-gradient(135deg, #3B82F6, #2563EB)',
    surface: 'linear-gradient(145deg, #111015, #18141F)',
    hero: 'radial-gradient(ellipse 60% 30% at 50% 0%, #8B1F2420, transparent)'
  },
  shadows: {
    sm: '0 2px 4px rgba(0,0,0,0.1)',
    md: '0 4px 16px rgba(0,0,0,0.2)',
    lg: '0 8px 32px rgba(0,0,0,0.3)',
    xl: '0 16px 64px rgba(0,0,0,0.4)',
    glow: '0 0 20px #8B1F2440',
    card: '0 4px 20px rgba(0,0,0,0.5)'
  },
  radius: {
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 20
  }
}

const ADMIN_ROUTES = {
  dashboard: '/admin',
  merchants: '/admin/merchants', 
  deals: '/admin/deals',
  categories: '/admin/categories',
  coupons: '/admin/coupons',
  finance: '/admin/finance',
  accounting: '/admin/accounting',
  users: '/admin/users',
  analytics: '/admin/analytics',
  settings: '/admin/settings'
}

// ============================================================================
// Utility Functions
// ============================================================================

function formatCurrency(amount, showSymbol = true) {
  const formatted = new Intl.NumberFormat('ar-QA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(amount) || 0)
  
  return showSymbol ? `${formatted} ر.ق` : formatted
}

function formatNumber(num) {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}م`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}ك`
  return num?.toString() || '0'
}

function formatPercentage(value, total) {
  if (!total || total === 0) return '0%'
  return `${((value / total) * 100).toFixed(1)}%`
}

function formatDate(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('ar-QA', {
    year: 'numeric',
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

function getStatusColor(status) {
  const colors = {
    active: ADMIN_THEME.colors.success,
    pending: ADMIN_THEME.colors.warning,
    suspended: ADMIN_THEME.colors.error,
    rejected: ADMIN_THEME.colors.error,
    inactive: ADMIN_THEME.colors.textMuted,
    paid: ADMIN_THEME.colors.success,
    processing: ADMIN_THEME.colors.info,
    failed: ADMIN_THEME.colors.error,
    used: ADMIN_THEME.colors.success,
    expired: ADMIN_THEME.colors.textMuted,
    cancelled: ADMIN_THEME.colors.error
  }
  return colors[status] || ADMIN_THEME.colors.textMuted
}

function getStatusText(status, type = 'merchant') {
  const statusTexts = {
    merchant: {
      active: 'نشط',
      pending: 'قيد المراجعة', 
      suspended: 'موقوف',
      rejected: 'مرفوض',
      inactive: 'غير نشط'
    },
    deal: {
      active: 'نشط',
      inactive: 'غير نشط',
      expired: 'منتهي',
      draft: 'مسودة'
    },
    coupon: {
      active: 'نشط',
      used: 'مستخدم',
      expired: 'منتهي',
      cancelled: 'ملغي'
    },
    payout: {
      pending: 'قيد الانتظار',
      processing: 'قيد المعالجة',
      paid: 'مدفوع',
      failed: 'فشل',
      cancelled: 'ملغي'
    }
  }
  return statusTexts[type]?.[status] || status
}

// ============================================================================
// Reusable Components
// ============================================================================

function LoadingSpinner({ size = 20, color = ADMIN_THEME.colors.primary }) {
  return (
    <div style={{
      width: size,
      height: size,
      border: `2px solid ${color}30`,
      borderTopColor: color,
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }} />
  )
}

function StatCard({ title, value, subtitle, icon, color = ADMIN_THEME.colors.primary, trend, loading = false }) {
  return (
    <div className="lift" style={{
      background: ADMIN_THEME.gradients.surface,
      borderRadius: ADMIN_THEME.radius.lg,
      padding: '20px',
      border: `1px solid ${ADMIN_THEME.colors.border}`,
      boxShadow: ADMIN_THEME.shadows.card,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: 60,
        height: 60,
        background: `${color}15`,
        borderRadius: '50%',
        transform: 'translate(30%, -30%)'
      }} />
      
      <div style={{ position: 'relative', zIndex: 2 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12
        }}>
          <h3 style={{
            fontSize: 13,
            fontWeight: 600,
            color: ADMIN_THEME.colors.textSecondary,
            margin: 0
          }}>
            {title}
          </h3>
          
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: `${color}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16
          }}>
            {icon}
          </div>
        </div>
        
        <div style={{
          fontSize: 28,
          fontWeight: 900,
          color: ADMIN_THEME.colors.text,
          marginBottom: 4,
          fontFamily: "'JetBrains Mono', monospace"
        }}>
          {loading ? <LoadingSpinner size={24} /> : value}
        </div>
        
        {subtitle && (
          <div style={{
            fontSize: 11,
            color: ADMIN_THEME.colors.textMuted,
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}>
            {trend && (
              <span style={{
                color: trend.positive ? ADMIN_THEME.colors.success : ADMIN_THEME.colors.error
              }}>
                {trend.positive ? '↗' : '↘'} {trend.value}
              </span>
            )}
            <span>{subtitle}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function ActionButton({ 
  onClick, 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  loading = false,
  icon,
  ...props 
}) {
  const variants = {
    primary: {
      background: ADMIN_THEME.gradients.primary,
      color: '#fff',
      boxShadow: ADMIN_THEME.shadows.glow
    },
    secondary: {
      background: ADMIN_THEME.colors.card,
      color: ADMIN_THEME.colors.text,
      border: `1px solid ${ADMIN_THEME.colors.border}`
    },
    success: {
      background: ADMIN_THEME.gradients.success,
      color: '#fff'
    },
    danger: {
      background: `linear-gradient(135deg, ${ADMIN_THEME.colors.error}, #DC2626)`,
      color: '#fff'
    },
    ghost: {
      background: 'transparent',
      color: ADMIN_THEME.colors.textSecondary,
      border: `1px solid ${ADMIN_THEME.colors.border}`
    }
  }
  
  const sizes = {
    sm: { padding: '6px 12px', fontSize: 12 },
    md: { padding: '8px 16px', fontSize: 14 },
    lg: { padding: '12px 24px', fontSize: 16 }
  }
  
  const style = {
    ...variants[variant],
    ...sizes[size],
    borderRadius: ADMIN_THEME.radius.md,
    border: variants[variant].border || 'none',
    fontWeight: 600,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    transition: 'all 0.2s',
    opacity: disabled ? 0.5 : 1,
    ...props.style
  }
  
  return (
    <button
      className="tap"
      onClick={disabled || loading ? undefined : onClick}
      style={style}
      {...props}
    >
      {loading ? (
        <LoadingSpinner size={14} color="currentColor" />
      ) : (
        <>
          {icon && <span>{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </button>
  )
}

function DataTable({ 
  columns, 
  data, 
  loading = false, 
  onRowClick, 
  emptyMessage = 'لا توجد بيانات',
  actions
}) {
  return (
    <div style={{
      background: ADMIN_THEME.colors.surface,
      borderRadius: ADMIN_THEME.radius.lg,
      border: `1px solid ${ADMIN_THEME.colors.border}`,
      overflow: 'hidden'
    }}>
      {/* Table Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns.length}, 1fr)`,
        padding: '16px 20px',
        background: ADMIN_THEME.colors.card,
        borderBottom: `1px solid ${ADMIN_THEME.colors.border}`,
        fontSize: 12,
        fontWeight: 700,
        color: ADMIN_THEME.colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        {columns.map((column, index) => (
          <div key={index} style={{ textAlign: column.align || 'right' }}>
            {column.title}
          </div>
        ))}
      </div>
      
      {/* Table Body */}
      <div style={{ maxHeight: 600, overflowY: 'auto' }}>
        {loading ? (
          <div style={{
            padding: '40px 20px',
            textAlign: 'center',
            color: ADMIN_THEME.colors.textMuted
          }}>
            <LoadingSpinner size={32} />
            <p style={{ marginTop: 12, fontSize: 14 }}>جاري التحميل...</p>
          </div>
        ) : data.length === 0 ? (
          <div style={{
            padding: '40px 20px',
            textAlign: 'center',
            color: ADMIN_THEME.colors.textMuted
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
            <p>{emptyMessage}</p>
          </div>
        ) : (
          data.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="lift"
              onClick={() => onRowClick?.(row)}
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${columns.length}, 1fr)`,
                padding: '16px 20px',
                borderBottom: `1px solid ${ADMIN_THEME.colors.border}`,
                cursor: onRowClick ? 'pointer' : 'default',
                transition: 'background 0.15s'
              }}
              onMouseEnter={(e) => {
                if (onRowClick) e.target.style.background = ADMIN_THEME.colors.cardHover
              }}
              onMouseLeave={(e) => {
                if (onRowClick) e.target.style.background = 'transparent'
              }}
            >
              {columns.map((column, colIndex) => (
                <div 
                  key={colIndex} 
                  style={{ 
                    textAlign: column.align || 'right',
                    fontSize: 14,
                    color: ADMIN_THEME.colors.text
                  }}
                >
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
      
      {/* Table Actions */}
      {actions && (
        <div style={{
          padding: '12px 20px',
          background: ADMIN_THEME.colors.card,
          borderTop: `1px solid ${ADMIN_THEME.colors.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            fontSize: 12,
            color: ADMIN_THEME.colors.textMuted
          }}>
            {data.length} عنصر
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {actions}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Dashboard Overview Component
// ============================================================================

function DashboardOverview({ stats, recentActivity, onRefresh }) {
  const [refreshing, setRefreshing] = useState(false)
  
  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await onRefresh?.()
    } finally {
      setRefreshing(false)
    }
  }
  
  return (
    <div className="fade-up" style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24
      }}>
        <div>
          <h1 style={{
            fontSize: 24,
            fontWeight: 900,
            color: ADMIN_THEME.colors.text,
            margin: 0,
            marginBottom: 4
          }}>
            لوحة تحكم قريب
          </h1>
          <p style={{
            color: ADMIN_THEME.colors.textSecondary,
            fontSize: 14,
            margin: 0
          }}>
            نظرة شاملة على أداء المنصة
          </p>
        </div>
        
        <ActionButton
          onClick={handleRefresh}
          loading={refreshing}
          variant="secondary"
          icon="🔄"
        >
          تحديث البيانات
        </ActionButton>
      </div>
      
      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 20,
        marginBottom: 32
      }}>
        <StatCard
          title="إجمالي التجار"
          value={formatNumber(stats?.merchants?.total)}
          subtitle={`${stats?.merchants?.active || 0} نشط`}
          icon="🏪"
          color={ADMIN_THEME.colors.info}
          trend={{ positive: true, value: '+12%' }}
        />
        
        <StatCard
          title="العروض النشطة"
          value={formatNumber(stats?.deals?.active)}
          subtitle={`من أصل ${stats?.deals?.total || 0}`}
          icon="🎯"
          color={ADMIN_THEME.colors.success}
        />
        
        <StatCard
          title="الكوبونات المستخدمة"
          value={formatNumber(stats?.coupons?.used)}
          subtitle={`معدل الاستخدام: ${stats?.coupons?.usageRate || 0}%`}
          icon="🎫"
          color={ADMIN_THEME.colors.purple}
        />
        
        <StatCard
          title="إجمالي الإيرادات"
          value={formatCurrency(stats?.revenue?.total, false)}
          subtitle="ر.ق"
          icon="💰"
          color={ADMIN_THEME.colors.secondary}
          trend={{ positive: true, value: '+8.5%' }}
        />
      </div>
      
      {/* Revenue Breakdown */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 32
      }}>
        <StatCard
          title="عمولة قريب"
          value={formatCurrency(stats?.revenue?.commission, false)}
          subtitle="ر.ق"
          icon="📊"
          color={ADMIN_THEME.colors.primary}
        />
        
        <StatCard
          title="أرباح التجار"
          value={formatCurrency(stats?.revenue?.merchant, false)}
          subtitle="ر.ق"
          icon="🏪"
          color={ADMIN_THEME.colors.success}
        />
        
        <StatCard
          title="التجار قيد المراجعة"
          value={stats?.merchants?.pending || 0}
          subtitle="يحتاج مراجعة"
          icon="⏳"
          color={ADMIN_THEME.colors.warning}
        />
      </div>
      
      {/* Quick Actions */}
      <div style={{
        background: ADMIN_THEME.gradients.surface,
        borderRadius: ADMIN_THEME.radius.lg,
        padding: '20px',
        border: `1px solid ${ADMIN_THEME.colors.border}`,
        boxShadow: ADMIN_THEME.shadows.card
      }}>
        <h3 style={{
          fontSize: 16,
          fontWeight: 700,
          color: ADMIN_THEME.colors.text,
          marginBottom: 16
        }}>
          إجراءات سريعة
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 12
        }}>
          <ActionButton variant="primary" icon="➕">
            إضافة تاجر جديد
          </ActionButton>
          
          <ActionButton variant="secondary" icon="📊">
            عرض التقارير
          </ActionButton>
          
          <ActionButton variant="secondary" icon="⚙️">
            إعدادات النظام
          </ActionButton>
          
          <ActionButton variant="secondary" icon="📧">
            إرسال إشعارات
          </ActionButton>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Merchants Management Component
// ============================================================================

function MerchantsManagement({ merchants, onUpdateStatus, onViewMerchant, loading }) {
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  const filteredMerchants = useMemo(() => {
    let filtered = merchants || []
    
    if (filter !== 'all') {
      filtered = filtered.filter(merchant => merchant.status === filter)
    }
    
    if (searchQuery.trim()) {
      filtered = filtered.filter(merchant => 
        merchant.name.includes(searchQuery) || 
        merchant.email?.includes(searchQuery) ||
        merchant.phone?.includes(searchQuery)
      )
    }
    
    return filtered
  }, [merchants, filter, searchQuery])
  
  const statusCounts = useMemo(() => {
    const counts = { all: 0, pending: 0, active: 0, suspended: 0 }
    merchants?.forEach(merchant => {
      counts.all++
      counts[merchant.status] = (counts[merchant.status] || 0) + 1
    })
    return counts
  }, [merchants])
  
  const columns = [
    {
      key: 'name',
      title: 'التاجر',
      render: (name, merchant) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {merchant.logo_url ? (
            <img 
              src={merchant.logo_url}
              alt=""
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: ADMIN_THEME.gradients.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 12,
              fontWeight: 700
            }}>
              {name?.[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <div style={{ fontWeight: 600, color: ADMIN_THEME.colors.text }}>
              {name}
            </div>
            <div style={{ fontSize: 12, color: ADMIN_THEME.colors.textMuted }}>
              {merchant.email}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'category',
      title: 'الفئة',
      render: (_, merchant) => merchant.categories ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 16 }}>{merchant.categories.emoji}</span>
          <span style={{ fontSize: 12 }}>{merchant.categories.name}</span>
        </div>
      ) : '-'
    },
    {
      key: 'city',
      title: 'المدينة',
      render: (city) => city || '-'
    },
    {
      key: 'deals_count',
      title: 'العروض',
      align: 'center',
      render: (count) => (
        <div style={{
          background: ADMIN_THEME.colors.card,
          color: ADMIN_THEME.colors.text,
          padding: '4px 8px',
          borderRadius: ADMIN_THEME.radius.sm,
          fontSize: 12,
          fontWeight: 600,
          display: 'inline-block'
        }}>
          {count || 0}
        </div>
      )
    },
    {
      key: 'revenue',
      title: 'الإيرادات',
      align: 'center',
      render: (revenue) => (
        <span style={{ 
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 12,
          color: ADMIN_THEME.colors.success
        }}>
          {formatCurrency(revenue || 0, false)}
        </span>
      )
    },
    {
      key: 'status',
      title: 'الحالة',
      align: 'center',
      render: (status) => (
        <span style={{
          background: `${getStatusColor(status)}20`,
          color: getStatusColor(status),
          padding: '4px 12px',
          borderRadius: 12,
          fontSize: 11,
          fontWeight: 600,
          display: 'inline-block'
        }}>
          {getStatusText(status, 'merchant')}
        </span>
      )
    },
    {
      key: 'created_at',
      title: 'تاريخ الانضمام',
      render: (date) => (
        <span style={{ fontSize: 12, color: ADMIN_THEME.colors.textMuted }}>
          {formatDate(date)}
        </span>
      )
    }
  ]
  
  return (
    <div className="fade-up" style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24
      }}>
        <h1 style={{
          fontSize: 24,
          fontWeight: 900,
          color: ADMIN_THEME.colors.text,
          margin: 0
        }}>
          إدارة التجار
        </h1>
        
        <ActionButton variant="primary" icon="➕">
          إضافة تاجر جديد
        </ActionButton>
      </div>
      
      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: 16,
        alignItems: 'center',
        marginBottom: 24,
        flexWrap: 'wrap'
      }}>
        {/* Status Filter */}
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { key: 'all', label: 'الكل', count: statusCounts.all },
            { key: 'pending', label: 'قيد المراجعة', count: statusCounts.pending },
            { key: 'active', label: 'نشط', count: statusCounts.active },
            { key: 'suspended', label: 'موقوف', count: statusCounts.suspended }
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={{
                padding: '8px 16px',
                borderRadius: ADMIN_THEME.radius.md,
                border: `1px solid ${filter === key ? ADMIN_THEME.colors.primary : ADMIN_THEME.colors.border}`,
                background: filter === key ? `${ADMIN_THEME.colors.primary}20` : ADMIN_THEME.colors.card,
                color: filter === key ? ADMIN_THEME.colors.primary : ADMIN_THEME.colors.text,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.2s'
              }}
            >
              <span>{label}</span>
              <span style={{
                background: filter === key ? ADMIN_THEME.colors.primary : ADMIN_THEME.colors.textMuted,
                color: filter === key ? 'white' : ADMIN_THEME.colors.card,
                padding: '2px 6px',
                borderRadius: 8,
                fontSize: 10,
                fontWeight: 700
              }}>
                {count}
              </span>
            </button>
          ))}
        </div>
        
        {/* Search */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: ADMIN_THEME.colors.card,
          border: `1px solid ${ADMIN_THEME.colors.border}`,
          borderRadius: ADMIN_THEME.radius.md,
          padding: '8px 12px',
          minWidth: 250,
          maxWidth: 350
        }}>
          <span style={{ fontSize: 16, marginLeft: 8 }}>🔍</span>
          <input
            type="text"
            placeholder="البحث في التجار..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              color: ADMIN_THEME.colors.text,
              fontSize: 14
            }}
          />
        </div>
      </div>
      
      {/* Merchants Table */}
      <DataTable
        columns={columns}
        data={filteredMerchants}
        loading={loading}
        onRowClick={onViewMerchant}
        emptyMessage="لا توجد تجار متطابقة مع الفلتر"
        actions={[
          <ActionButton key="export" variant="secondary" size="sm" icon="📤">
            تصدير
          </ActionButton>
        ]}
      />
    </div>
  )
}

// ============================================================================
// Main Admin Panel Component
// ============================================================================

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [adminUser] = useState({
    name: 'مشرف قريب',
    email: 'admin@qreeb.qa',
    role: 'super_admin',
    avatar: null
  })
  
  // Mock data - replace with real API calls
  const [dashboardStats] = useState({
    merchants: { total: 127, active: 89, pending: 12 },
    deals: { total: 234, active: 189 },
    coupons: { total: 1547, used: 923, usageRate: 59.6 },
    revenue: { total: 45670.50, commission: 4567.05, merchant: 41103.45 }
  })
  
  const [merchants] = useState([
    {
      id: 1,
      name: 'مطعم الدوحة الملكي',
      email: 'royal@doha.qa',
      phone: '+97450000001',
      city: 'الدوحة',
      status: 'active',
      deals_count: 5,
      revenue: 12450.75,
      created_at: '2026-01-15T10:30:00Z',
      categories: { name: 'مطاعم', emoji: '🍽️' },
      logo_url: null
    },
    {
      id: 2,
      name: 'كافيه الخليج',
      email: 'gulf@cafe.qa',
      phone: '+97450000002',
      city: 'الدوحة',
      status: 'pending',
      deals_count: 2,
      revenue: 3200.00,
      created_at: '2026-02-20T14:15:00Z',
      categories: { name: 'مقاهي', emoji: '☕' },
      logo_url: null
    }
  ])
  
  const navigationItems = [
    { key: 'dashboard', label: 'الرئيسية', icon: '📊' },
    { key: 'merchants', label: 'التجار', icon: '🏪' },
    { key: 'deals', label: 'العروض', icon: '🎯' },
    { key: 'categories', label: 'الفئات', icon: '📂' },
    { key: 'coupons', label: 'الكوبونات', icon: '🎫' },
    { key: 'finance', label: 'المالية', icon: '💰' },
    { key: 'analytics', label: 'التحليلات', icon: '📈' },
    { key: 'settings', label: 'الإعدادات', icon: '⚙️' }
  ]
  
  const handleLogout = () => {
    localStorage.removeItem('qreeb_admin_session')
    window.location.href = '/admin/login'
  }
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardOverview
            stats={dashboardStats}
            onRefresh={() => console.log('Refreshing dashboard...')}
          />
        )
      case 'merchants':
        return (
          <MerchantsManagement
            merchants={merchants}
            loading={false}
            onViewMerchant={(merchant) => console.log('View merchant:', merchant)}
            onUpdateStatus={(id, status) => console.log('Update status:', id, status)}
          />
        )
      default:
        return (
          <div style={{
            padding: '60px 20px',
            textAlign: 'center',
            color: ADMIN_THEME.colors.textMuted
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🚧</div>
            <h3 style={{ 
              fontSize: 18,
              fontWeight: 600,
              color: ADMIN_THEME.colors.text,
              marginBottom: 8
            }}>
              قيد التطوير
            </h3>
            <p>هذا القسم قيد التطوير وسيكون متاحاً قريباً</p>
          </div>
        )
    }
  }
  
  return (
    <div style={{
      minHeight: '100vh',
      background: ADMIN_THEME.colors.background,
      color: ADMIN_THEME.colors.text,
      display: 'flex'
    }}>
      {/* Sidebar Navigation */}
      <nav style={{
        width: 280,
        background: ADMIN_THEME.gradients.surface,
        borderLeft: `1px solid ${ADMIN_THEME.colors.border}`,
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto'
      }}>
        {/* Logo */}
        <div style={{
          padding: '24px 20px',
          borderBottom: `1px solid ${ADMIN_THEME.colors.border}`,
          textAlign: 'center'
        }}>
          <div style={{
            display: 'flex',
            gap: 6,
            justifyContent: 'center',
            marginBottom: 12
          }}>
            <div style={{
              width: 20,
              height: 32,
              background: ADMIN_THEME.gradients.primary,
              borderRadius: '4px 0 0 4px'
            }} />
            <div style={{
              width: 6,
              height: 32,
              background: `linear-gradient(135deg, ${ADMIN_THEME.colors.text}, ${ADMIN_THEME.colors.secondary})`,
              clipPath: 'polygon(0 0, 100% 15%, 100% 85%, 0 100%)'
            }} />
            <div style={{
              width: 28,
              height: 32,
              background: ADMIN_THEME.colors.card,
              borderRadius: '0 6px 6px 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16
            }}>
              🏷️
            </div>
          </div>
          
          <h2 style={{
            fontSize: 18,
            fontWeight: 900,
            color: ADMIN_THEME.colors.text,
            margin: 0,
            marginBottom: 4
          }}>
            قريب - الإدارة
          </h2>
          
          <p style={{
            fontSize: 11,
            color: ADMIN_THEME.colors.textMuted,
            margin: 0
          }}>
            لوحة التحكم الإدارية
          </p>
        </div>
        
        {/* Navigation Items */}
        <div style={{ flex: 1, padding: '20px 0' }}>
          {navigationItems.map(item => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 20px',
                margin: '0 12px 4px',
                borderRadius: ADMIN_THEME.radius.md,
                border: 'none',
                background: activeTab === item.key 
                  ? `${ADMIN_THEME.colors.primary}20` 
                  : 'transparent',
                color: activeTab === item.key 
                  ? ADMIN_THEME.colors.primary 
                  : ADMIN_THEME.colors.textSecondary,
                fontSize: 14,
                fontWeight: activeTab === item.key ? 600 : 500,
                cursor: 'pointer',
                textAlign: 'right',
                transition: 'all 0.2s'
              }}
              className="tap"
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {activeTab === item.key && (
                <div style={{
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  background: ADMIN_THEME.colors.primary
                }} />
              )}
            </button>
          ))}
        </div>
        
        {/* Admin Profile */}
        <div style={{
          padding: '20px',
          borderTop: `1px solid ${ADMIN_THEME.colors.border}`,
          background: ADMIN_THEME.colors.card
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 12
          }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: ADMIN_THEME.gradients.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 14,
              fontWeight: 700
            }}>
              {adminUser.name[0]}
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 13,
                fontWeight: 600,
                color: ADMIN_THEME.colors.text,
                marginBottom: 2
              }}>
                {adminUser.name}
              </div>
              <div style={{
                fontSize: 11,
                color: ADMIN_THEME.colors.textMuted
              }}>
                {adminUser.role === 'super_admin' ? 'مدير عام' : 'مشرف'}
              </div>
            </div>
          </div>
          
          <ActionButton
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            icon="🚪"
            style={{ width: '100%' }}
          >
            تسجيل خروج
          </ActionButton>
        </div>
      </nav>
      
      {/* Main Content */}
      <main style={{
        flex: 1,
        background: ADMIN_THEME.colors.background,
        minHeight: '100vh'
      }}>
        {renderTabContent()}
      </main>
    </div>
  )
}
