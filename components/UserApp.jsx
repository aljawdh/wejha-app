'use client'
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'

// Load external libraries
if (typeof window !== 'undefined' && !window.__qreebLibsLoaded) {
  const script = document.createElement("script")
  script.src = "https://cdnjs.cloudflare.com/ajax/libs/jsbarcode/3.11.6/JsBarcode.all.min.js"
  script.async = true
  document.head.appendChild(script)
  window.__qreebLibsLoaded = true
}

// ============================================================================
// Constants & Configuration
// ============================================================================

const APP_CONFIG = {
  name: 'قريب',
  nameEn: 'Qreeb',
  tagline: 'اكتشف العروض القريبة منك',
  taglineEn: 'Discover deals near you',
  version: '1.0.0',
  supportedLanguages: ['ar', 'en'],
  defaultLocation: { lat: 25.276987, lng: 51.520008 }, // Doha, Qatar
  maxCouponsPerUser: 10,
  otpLength: 6,
  otpExpiryMinutes: 5
}

// Enhanced color palette with accessibility support
const THEME = {
  colors: {
    primary: '#8B1F24',
    primaryLight: '#A62028', 
    primaryDark: '#6B1519',
    secondary: '#D4A843',
    secondaryLight: '#E5B854',
    accent: '#F0EDE8',
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
    surface: 'linear-gradient(180deg, #111015, #18141F)',
    hero: 'radial-gradient(ellipse 70% 40% at 50% 0%, #8B1F2422, transparent)'
  },
  shadows: {
    sm: '0 2px 4px rgba(0,0,0,0.1)',
    md: '0 4px 16px rgba(0,0,0,0.2)',
    lg: '0 8px 32px rgba(0,0,0,0.3)',
    xl: '0 16px 64px rgba(0,0,0,0.4)',
    glow: '0 0 20px #8B1F2440'
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24
  }
}

// Arab & Gulf Countries with enhanced data
const COUNTRIES = [
  {
    code: '+974',
    name: 'قطر',
    nameEn: 'Qatar',
    flag: '🇶🇦',
    currency: 'QAR',
    timezone: 'Asia/Qatar',
    featured: true,
    region: 'Gulf'
  },
  {
    code: '+966', 
    name: 'السعودية',
    nameEn: 'Saudi Arabia',
    flag: '🇸🇦',
    currency: 'SAR',
    timezone: 'Asia/Riyadh',
    featured: true,
    region: 'Gulf'
  },
  {
    code: '+971',
    name: 'الإمارات', 
    nameEn: 'UAE',
    flag: '🇦🇪',
    currency: 'AED',
    timezone: 'Asia/Dubai',
    featured: true,
    region: 'Gulf'
  },
  {
    code: '+965',
    name: 'الكويت',
    nameEn: 'Kuwait', 
    flag: '🇰🇼',
    currency: 'KWD',
    timezone: 'Asia/Kuwait',
    featured: true,
    region: 'Gulf'
  },
  {
    code: '+973',
    name: 'البحرين',
    nameEn: 'Bahrain',
    flag: '🇧🇭', 
    currency: 'BHD',
    timezone: 'Asia/Bahrain',
    featured: true,
    region: 'Gulf'
  },
  {
    code: '+968',
    name: 'عُمان',
    nameEn: 'Oman',
    flag: '🇴🇲',
    currency: 'OMR', 
    timezone: 'Asia/Muscat',
    featured: true,
    region: 'Gulf'
  },
  {
    code: '+962',
    name: 'الأردن',
    nameEn: 'Jordan',
    flag: '🇯🇴',
    currency: 'JOD',
    timezone: 'Asia/Amman',
    featured: false,
    region: 'Levant'
  },
  {
    code: '+961',
    name: 'لبنان', 
    nameEn: 'Lebanon',
    flag: '🇱🇧',
    currency: 'LBP',
    timezone: 'Asia/Beirut',
    featured: false,
    region: 'Levant'
  },
  {
    code: '+963',
    name: 'سوريا',
    nameEn: 'Syria', 
    flag: '🇸🇾',
    currency: 'SYP',
    timezone: 'Asia/Damascus',
    featured: false,
    region: 'Levant'
  },
  {
    code: '+964',
    name: 'العراق',
    nameEn: 'Iraq',
    flag: '🇮🇶', 
    currency: 'IQD',
    timezone: 'Asia/Baghdad',
    featured: false,
    region: 'Mesopotamia'
  },
  {
    code: '+20',
    name: 'مصر',
    nameEn: 'Egypt',
    flag: '🇪🇬',
    currency: 'EGP',
    timezone: 'Africa/Cairo', 
    featured: false,
    region: 'North Africa'
  },
  {
    code: '+218',
    name: 'ليبيا',
    nameEn: 'Libya',
    flag: '🇱🇾',
    currency: 'LYD',
    timezone: 'Africa/Tripoli',
    featured: false, 
    region: 'North Africa'
  },
  {
    code: '+216', 
    name: 'تونس',
    nameEn: 'Tunisia',
    flag: '🇹🇳',
    currency: 'TND',
    timezone: 'Africa/Tunis',
    featured: false,
    region: 'North Africa'
  },
  {
    code: '+213',
    name: 'الجزائر',
    nameEn: 'Algeria', 
    flag: '🇩🇿',
    currency: 'DZD',
    timezone: 'Africa/Algiers',
    featured: false,
    region: 'North Africa'
  },
  {
    code: '+212',
    name: 'المغرب',
    nameEn: 'Morocco',
    flag: '🇲🇦',
    currency: 'MAD',
    timezone: 'Africa/Casablanca',
    featured: false,
    region: 'North Africa'
  },
  {
    code: '+249', 
    name: 'السودان',
    nameEn: 'Sudan',
    flag: '🇸🇩',
    currency: 'SDG',
    timezone: 'Africa/Khartoum',
    featured: false,
    region: 'North Africa'
  },
  {
    code: '+967',
    name: 'اليمن',
    nameEn: 'Yemen',
    flag: '🇾🇪',
    currency: 'YER',
    timezone: 'Asia/Aden',
    featured: false,
    region: 'Arabia'
  }
]

// ============================================================================
// Utility Functions
// ============================================================================

function formatCurrency(amount, currency = 'QAR') {
  const symbols = {
    QAR: 'ر.ق',
    SAR: 'ر.س', 
    AED: 'د.إ',
    KWD: 'د.ك',
    BHD: 'د.ب',
    OMR: 'ر.ع'
  }
  
  return `${Number(amount).toFixed(2)} ${symbols[currency] || currency}`
}

function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function generateCouponCode() {
  return `QR${Math.random().toString(36).substr(2, 6).toUpperCase()}`
}

function validatePhoneNumber(phone, countryCode) {
  const cleanPhone = phone.replace(/\D/g, '')
  const minLength = countryCode === '+974' ? 8 : 7
  return cleanPhone.length >= minLength
}

function formatTimeRemaining(expiresAt) {
  const now = new Date()
  const expiry = new Date(expiresAt)
  const diff = expiry - now
  
  if (diff <= 0) return 'منتهي'
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  
  if (days > 0) return `${days} يوم`
  if (hours > 0) return `${hours} ساعة`
  return 'أقل من ساعة'
}

// ============================================================================
// Enhanced Login Screen with Country Selection
// ============================================================================

function LoginScreen({ onLogin, language = 'ar' }) {
  const [step, setStep] = useState('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0])
  const [showCountries, setShowCountries] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [otpHint, setOtpHint] = useState('')
  const [resendTimer, setResendTimer] = useState(0)
  const otpRefs = useRef([])

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(prev => prev - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const sendOTP = async () => {
    if (!validatePhoneNumber(phone, selectedCountry.code)) {
      setError(language === 'ar' ? 'رقم الهاتف غير صحيح' : 'Invalid phone number')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      // Simulate OTP sending
      const mockOTP = '123456' // For demo purposes
      setOtpHint(mockOTP)
      setStep('otp')
      setResendTimer(300) // 5 minutes
    } catch (err) {
      setError(language === 'ar' ? 'فشل في إرسال الرمز' : 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const verifyOTP = async () => {
    const enteredOTP = otp.join('')
    
    if (enteredOTP.length !== APP_CONFIG.otpLength) {
      setError(language === 'ar' ? 'أدخل الرمز كاملاً' : 'Enter complete OTP')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Simulate OTP verification
      if (enteredOTP === otpHint) {
        const fullPhone = selectedCountry.code + phone.replace(/\D/g, '')
        
        // Save login state
        localStorage.setItem('qreeb_user_phone', fullPhone)
        localStorage.setItem('qreeb_user_country', JSON.stringify(selectedCountry))
        localStorage.setItem('qreeb_user_language', language)
        
        onLogin(fullPhone, selectedCountry)
      } else {
        setError(language === 'ar' ? 'رمز التحقق غير صحيح' : 'Invalid OTP')
        setOtp(['', '', '', '', '', ''])
        otpRefs.current[0]?.focus()
      }
    } catch (err) {
      setError(language === 'ar' ? 'فشل في التحقق' : 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpInput = (index, value) => {
    if (!/^\d*$/.test(value)) return
    
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    
    if (value && index < APP_CONFIG.otpLength - 1) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const featuredCountries = COUNTRIES.filter(c => c.featured)
  const otherCountries = COUNTRIES.filter(c => !c.featured)

  return (
    <div style={{
      minHeight: '100vh',
      minHeight: '100dvh',
      background: THEME.gradients.surface,
      backgroundImage: THEME.gradients.hero,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative'
    }}>
      {/* App Logo */}
      <div className="pop-in" style={{
        textAlign: 'center',
        marginBottom: 40
      }}>
        <div style={{
          display: 'flex',
          gap: 8,
          justifyContent: 'center',
          marginBottom: 16
        }}>
          <div style={{
            width: 28,
            height: 48,
            background: THEME.gradients.primary,
            borderRadius: '8px 0 0 8px',
            animation: 'pulse 2s ease-in-out infinite'
          }} />
          <div style={{
            width: 10,
            height: 48,
            background: `linear-gradient(135deg, ${THEME.colors.accent}, ${THEME.colors.secondary})`,
            clipPath: 'polygon(0 0, 100% 15%, 100% 85%, 0 100%)',
            animation: 'pulse 2s ease-in-out infinite 0.2s'
          }} />
          <div style={{
            width: 56,
            height: 48,
            background: THEME.colors.surface,
            borderRadius: '0 12px 12px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            animation: 'pulse 2s ease-in-out infinite 0.4s'
          }}>
            🏷️
          </div>
        </div>
        
        <h1 style={{
          fontSize: 'clamp(24px, 6vw, 32px)',
          fontWeight: 900,
          color: THEME.colors.text,
          marginBottom: 4,
          fontFamily: "'Tajawal', sans-serif"
        }}>
          {APP_CONFIG.name}
        </h1>
        
        <p style={{
          color: THEME.colors.textSecondary,
          fontSize: 'clamp(12px, 3vw, 14px)'
        }}>
          {APP_CONFIG.tagline}
        </p>
      </div>

      {/* Login Form */}
      <div className="fade-up" style={{
        width: '100%',
        maxWidth: 400,
        background: THEME.colors.surface,
        borderRadius: THEME.radius.xl,
        padding: '24px 20px',
        border: `1px solid ${THEME.colors.border}`,
        boxShadow: THEME.shadows.xl
      }}>
        {step === 'phone' ? (
          <>
            <h2 style={{
              fontSize: 18,
              fontWeight: 800,
              color: THEME.colors.text,
              marginBottom: 6,
              textAlign: 'center'
            }}>
              {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
            </h2>
            
            <p style={{
              color: THEME.colors.textSecondary,
              fontSize: 13,
              textAlign: 'center',
              marginBottom: 20,
              lineHeight: 1.5
            }}>
              {language === 'ar' 
                ? 'سنرسل لك رمز التحقق عبر واتساب' 
                : 'We\'ll send you a verification code via WhatsApp'
              }
            </p>

            {/* Country Selector */}
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <button
                className="tap"
                onClick={() => setShowCountries(!showCountries)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: THEME.colors.card,
                  border: `1.5px solid ${THEME.colors.border}`,
                  borderRadius: THEME.radius.md,
                  padding: '12px 14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18 }}>{selectedCountry.flag}</span>
                  <span style={{ 
                    color: THEME.colors.text, 
                    fontWeight: 700, 
                    fontSize: 14 
                  }}>
                    {language === 'ar' ? selectedCountry.name : selectedCountry.nameEn}
                  </span>
                  <span style={{ 
                    color: THEME.colors.textSecondary, 
                    fontSize: 13 
                  }}>
                    {selectedCountry.code}
                  </span>
                </div>
                <span style={{ 
                  color: THEME.colors.textSecondary,
                  fontSize: 16,
                  transform: showCountries ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s'
                }}>
                  ▼
                </span>
              </button>

              {/* Countries Dropdown */}
              {showCountries && (
                <div className="fade-in" style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  zIndex: 50,
                  background: THEME.colors.surface,
                  borderRadius: THEME.radius.md,
                  border: `1px solid ${THEME.colors.border}`,
                  maxHeight: 280,
                  overflowY: 'auto',
                  boxShadow: THEME.shadows.lg,
                  marginTop: 4
                }}>
                  {/* Featured Countries */}
                  {featuredCountries.map(country => (
                    <button
                      key={country.code}
                      className="tap"
                      onClick={() => {
                        setSelectedCountry(country)
                        setShowCountries(false)
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '12px 14px',
                        cursor: 'pointer',
                        background: 'none',
                        border: 'none',
                        borderBottom: `1px solid ${THEME.colors.border}`,
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = THEME.colors.card}
                      onMouseLeave={(e) => e.target.style.background = 'none'}
                    >
                      <span style={{ fontSize: 16 }}>{country.flag}</span>
                      <span style={{ 
                        color: THEME.colors.text, 
                        fontSize: 13, 
                        flex: 1, 
                        textAlign: 'right' 
                      }}>
                        {language === 'ar' ? country.name : country.nameEn}
                      </span>
                      <span style={{ 
                        color: THEME.colors.textSecondary, 
                        fontSize: 12 
                      }}>
                        {country.code}
                      </span>
                    </button>
                  ))}
                  
                  {/* Separator */}
                  <div style={{
                    padding: '8px 14px',
                    borderBottom: `1px solid ${THEME.colors.border}`,
                    background: THEME.colors.card
                  }}>
                    <span style={{
                      color: THEME.colors.textSecondary,
                      fontSize: 11,
                      fontWeight: 600
                    }}>
                      {language === 'ar' ? 'دول أخرى' : 'Other Countries'}
                    </span>
                  </div>
                  
                  {/* Other Countries */}
                  {otherCountries.map(country => (
                    <button
                      key={country.code}
                      className="tap"
                      onClick={() => {
                        setSelectedCountry(country)
                        setShowCountries(false)
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 14px',
                        cursor: 'pointer',
                        background: 'none',
                        border: 'none',
                        borderBottom: `1px solid ${THEME.colors.border}`,
                        opacity: 0.8,
                        transition: 'all 0.15s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = THEME.colors.card
                        e.target.style.opacity = 1
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'none'
                        e.target.style.opacity = 0.8
                      }}
                    >
                      <span style={{ fontSize: 14 }}>{country.flag}</span>
                      <span style={{ 
                        color: THEME.colors.text, 
                        fontSize: 12, 
                        flex: 1, 
                        textAlign: 'right' 
                      }}>
                        {language === 'ar' ? country.name : country.nameEn}
                      </span>
                      <span style={{ 
                        color: THEME.colors.textSecondary, 
                        fontSize: 11 
                      }}>
                        {country.code}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Phone Input */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: THEME.colors.card,
              border: `1.5px solid ${THEME.colors.border}`,
              borderRadius: THEME.radius.md,
              overflow: 'hidden',
              marginBottom: 12,
              transition: 'border-color 0.2s'
            }}>
              <div style={{
                padding: '12px 14px',
                borderLeft: `1px solid ${THEME.colors.border}`,
                color: THEME.colors.textSecondary,
                fontSize: 13,
                fontWeight: 600,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <span style={{ fontSize: 14 }}>{selectedCountry.flag}</span>
                <span>{selectedCountry.code}</span>
              </div>
              
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value)
                  setError('')
                }}
                onKeyDown={(e) => e.key === 'Enter' && sendOTP()}
                placeholder={language === 'ar' ? 'رقم الهاتف' : 'Phone number'}
                maxLength={15}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: 15,
                  color: THEME.colors.text,
                  direction: 'ltr',
                  textAlign: 'left'
                }}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="fade-in" style={{
                color: THEME.colors.error,
                fontSize: 12,
                marginBottom: 12,
                padding: '8px 12px',
                background: `${THEME.colors.error}15`,
                borderRadius: THEME.radius.sm,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Send OTP Button */}
            <button
              className="tap"
              onClick={sendOTP}
              disabled={loading || !validatePhoneNumber(phone, selectedCountry.code)}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: THEME.radius.md,
                border: 'none',
                background: validatePhoneNumber(phone, selectedCountry.code) && !loading
                  ? THEME.gradients.primary
                  : THEME.colors.card,
                color: validatePhoneNumber(phone, selectedCountry.code) && !loading
                  ? '#fff'
                  : THEME.colors.textMuted,
                fontWeight: 900,
                fontSize: 15,
                cursor: validatePhoneNumber(phone, selectedCountry.code) && !loading
                  ? 'pointer'
                  : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: validatePhoneNumber(phone, selectedCountry.code) && !loading
                  ? THEME.shadows.glow
                  : 'none',
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
                  <span>{language === 'ar' ? 'جاري الإرسال...' : 'Sending...'}</span>
                </>
              ) : (
                <>
                  <span>📲</span>
                  <span>
                    {language === 'ar' 
                      ? 'إرسال رمز واتساب' 
                      : 'Send WhatsApp Code'
                    }
                  </span>
                </>
              )}
            </button>
          </>
        ) : (
          <>
            {/* OTP Verification Screen */}
            <button
              onClick={() => {
                setStep('phone')
                setError('')
                setOtp(['', '', '', '', '', ''])
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: THEME.colors.textSecondary,
                fontSize: 20,
                marginBottom: 12,
                padding: 0
              }}
            >
              ←
            </button>
            
            <h2 style={{
              fontSize: 18,
              fontWeight: 800,
              color: THEME.colors.text,
              marginBottom: 4,
              textAlign: 'center'
            }}>
              {language === 'ar' ? 'رمز التحقق' : 'Verification Code'}
            </h2>

            {/* Demo OTP Display */}
            <div style={{
              background: '#0D1E13',
              border: '1px solid #25D36633',
              borderRadius: THEME.radius.md,
              padding: '12px 14px',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}>
              <span style={{ fontSize: 18 }}>💬</span>
              <p style={{ fontSize: 12, color: '#4CAF82' }}>
                {language === 'ar' ? 'رمز التجربة: ' : 'Demo Code: '}
                <strong style={{
                  fontFamily: 'monospace',
                  letterSpacing: 2,
                  fontSize: 14,
                  color: '#fff'
                }}>
                  {otpHint}
                </strong>
              </p>
            </div>

            {/* OTP Input */}
            <div style={{
              display: 'flex',
              gap: 8,
              justifyContent: 'center',
              marginBottom: 16,
              direction: 'ltr'
            }}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={el => otpRefs.current[index] = el}
                  type="tel"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpInput(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  style={{
                    width: 44,
                    height: 52,
                    borderRadius: THEME.radius.md,
                    border: `2px solid ${digit ? THEME.colors.primary : THEME.colors.border}`,
                    background: digit ? `${THEME.colors.primary}15` : THEME.colors.card,
                    fontSize: 20,
                    fontWeight: 900,
                    textAlign: 'center',
                    color: THEME.colors.primary,
                    outline: 'none',
                    transition: 'all 0.15s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = THEME.colors.primary}
                  onBlur={(e) => e.target.style.borderColor = digit ? THEME.colors.primary : THEME.colors.border}
                />
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div className="fade-in" style={{
                color: THEME.colors.error,
                fontSize: 12,
                marginBottom: 12,
                textAlign: 'center',
                padding: '8px 12px',
                background: `${THEME.colors.error}15`,
                borderRadius: THEME.radius.sm
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* Verify Button */}
            <button
              className="tap"
              onClick={verifyOTP}
              disabled={loading || otp.join('').length < APP_CONFIG.otpLength}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: THEME.radius.md,
                border: 'none',
                background: otp.join('').length >= APP_CONFIG.otpLength && !loading
                  ? THEME.gradients.primary
                  : THEME.colors.card,
                color: otp.join('').length >= APP_CONFIG.otpLength && !loading
                  ? '#fff'
                  : THEME.colors.textMuted,
                fontWeight: 900,
                fontSize: 15,
                cursor: otp.join('').length >= APP_CONFIG.otpLength && !loading
                  ? 'pointer'
                  : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: otp.join('').length >= APP_CONFIG.otpLength && !loading
                  ? THEME.shadows.glow
                  : 'none',
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
                  <span>{language === 'ar' ? 'جاري التحقق...' : 'Verifying...'}</span>
                </>
              ) : (
                <>
                  <span>✅</span>
                  <span>
                    {language === 'ar' ? 'تأكيد' : 'Verify'}
                  </span>
                </>
              )}
            </button>

            {/* Resend Timer */}
            {resendTimer > 0 && (
              <p style={{
                fontSize: 11,
                color: THEME.colors.textMuted,
                textAlign: 'center',
                marginTop: 16
              }}>
                {language === 'ar' 
                  ? `يمكنك إعادة الإرسال خلال ${Math.floor(resendTimer / 60)}:${(resendTimer % 60).toString().padStart(2, '0')}`
                  : `Resend in ${Math.floor(resendTimer / 60)}:${(resendTimer % 60).toString().padStart(2, '0')}`
                }
              </p>
            )}
          </>
        )}
      </div>

      {/* App Info Footer */}
      <div style={{
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        textAlign: 'center'
      }}>
        <p style={{
          fontSize: 10,
          color: THEME.colors.textMuted,
          opacity: 0.7
        }}>
          {APP_CONFIG.name} - {APP_CONFIG.nameEn} © 2026 • v{APP_CONFIG.version}
        </p>
      </div>
    </div>
  )
}

// ============================================================================
// Main App Export
// ============================================================================

export default function UserApp() {
  const [screen, setScreen] = useState('login')
  const [user, setUser] = useState(null)
  const [userCountry, setUserCountry] = useState(null)
  const [language, setLanguage] = useState('ar')

  // Check for existing login on app load
  useEffect(() => {
    const savedPhone = localStorage.getItem('qreeb_user_phone')
    const savedCountry = localStorage.getItem('qreeb_user_country')
    const savedLanguage = localStorage.getItem('qreeb_user_language')
    
    if (savedPhone && savedCountry) {
      setUser(savedPhone)
      setUserCountry(JSON.parse(savedCountry))
      setLanguage(savedLanguage || 'ar')
      setScreen('location')
    }
  }, [])

  const handleLogin = (phone, country) => {
    setUser(phone)
    setUserCountry(country)
    setScreen('location')
  }

  const handleLogout = () => {
    localStorage.removeItem('qreeb_user_phone')
    localStorage.removeItem('qreeb_user_country') 
    localStorage.removeItem('qreeb_user_language')
    setUser(null)
    setUserCountry(null)
    setScreen('login')
  }

  return (
    <>
      {screen === 'login' && (
        <LoginScreen onLogin={handleLogin} language={language} />
      )}
      
      {screen === 'location' && (
        <div style={{
          minHeight: '100vh',
          background: THEME.colors.background,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: THEME.colors.text
        }}>
          <div style={{ textAlign: 'center' }}>
            <h1>مرحباً في قريب!</h1>
            <p>رقم الهاتف: {user}</p>
            <p>الدولة: {userCountry?.name}</p>
            <button
              onClick={handleLogout}
              style={{
                marginTop: 20,
                padding: '10px 20px',
                background: THEME.colors.error,
                color: 'white',
                border: 'none',
                borderRadius: THEME.radius.md,
                cursor: 'pointer'
              }}
            >
              تسجيل خروج
            </button>
          </div>
        </div>
      )}
    </>
  )
}
