import { useState, useEffect, createContext, useContext } from 'react'

// Language Context
const LanguageContext = createContext()

// Translation dictionaries
const translations = {
  ar: {
    // App Brand
    appName: "قريب",
    appSlogan: "اكتشف العروض القريبة منك",
    appDescription: "كوبونات وخصومات حصرية • قطر 🇶🇦",
    
    // Navigation
    home: "الرئيسية",
    deals: "العروض", 
    wallet: "محفظتي",
    profile: "حسابي",
    
    // Login & Auth
    login: "تسجيل الدخول",
    logout: "تسجيل خروج",
    phoneNumber: "رقم الجوال",
    enterPhone: "أدخل رقم جوالك",
    verificationCode: "رمز التحقق",
    enterCode: "أدخل الرمز",
    sendCode: "إرسال الرمز",
    verify: "تحقق",
    resendCode: "إعادة الإرسال",
    incorrectCode: "رمز غير صحيح",
    invalidPhone: "أدخل رقماً صحيحاً",
    whatsappVerification: "رمز التحقق عبر واتساب",
    
    // Countries
    selectCountry: "اختر دولتك",
    qatar: "قطر",
    saudi: "السعودية", 
    uae: "الإمارات",
    kuwait: "الكويت",
    bahrain: "البحرين",
    oman: "عُمان",
    jordan: "الأردن",
    lebanon: "لبنان",
    syria: "سوريا",
    iraq: "العراق",
    egypt: "مصر",
    libya: "ليبيا",
    tunisia: "تونس",
    algeria: "الجزائر",
    morocco: "المغرب",
    sudan: "السودان",
    yemen: "اليمن",
    
    // Location
    allowLocation: "السماح بالموقع",
    detectingLocation: "تحديد الموقع...",
    locationDescription: "نحتاج إلى موقعك للعثور على أفضل العروض والكوبونات القريبة منك",
    
    // Deals & Offers
    todaysDeals: "عروض اليوم",
    hotDeals: "العروض الساخنة", 
    nearbyOffers: "العروض القريبة",
    discount: "خصم",
    originalPrice: "السعر الأصلي",
    afterDiscount: "بعد الخصم", 
    save: "وفر",
    getCoupon: "احصل على الكوبون",
    dealExpires: "ينتهي في",
    remaining: "متبقي",
    limited: "محدود",
    exclusive: "حصري",
    
    // Categories
    restaurants: "مطاعم",
    cafes: "مقاهي", 
    shopping: "تسوق",
    beauty: "تجميل",
    health: "صحة",
    sports: "رياضة",
    education: "تعليم",
    travel: "سفر",
    
    // Coupons & Wallet
    myCoupons: "كوبوناتي",
    activeCoupons: "نشط",
    usedCoupons: "مستخدم", 
    expiredCoupons: "منتهي",
    totalSavings: "إجمالي توفيرك",
    couponCode: "رمز الكوبون",
    validUntil: "صالح حتى",
    useCoupon: "استخدام الكوبون",
    
    // Profile & Settings
    personalInfo: "المعلومات الشخصية",
    email: "البريد الإلكتروني",
    language: "اللغة",
    notifications: "الإشعارات",
    privacy: "الخصوصية",
    terms: "الشروط والأحكام",
    support: "الدعم",
    about: "حول التطبيق",
    
    // Common Actions
    save: "حفظ",
    cancel: "إلغاء",
    confirm: "تأكيد",
    edit: "تعديل",
    delete: "حذف",
    share: "مشاركة",
    copy: "نسخ",
    close: "إغلاق",
    back: "رجوع",
    next: "التالي",
    loading: "جاري التحميل...",
    error: "خطأ",
    success: "تم بنجاح",
    
    // Merchant Dashboard
    merchantDashboard: "لوحة التاجر",
    addDeal: "إضافة عرض",
    myDeals: "عروضي",
    analytics: "التحليلات",
    earnings: "الأرباح",
    
    // Admin Dashboard  
    adminDashboard: "لوحة الإدارة",
    merchants: "التجار",
    approvals: "الموافقات",
    finance: "المالية",
    accounting: "المحاسبة",
    reports: "التقارير"
  },
  
  en: {
    // App Brand
    appName: "Qreeb",
    appSlogan: "Discover deals near you",
    appDescription: "Exclusive coupons & discounts • Qatar 🇶🇦",
    
    // Navigation
    home: "Home",
    deals: "Deals",
    wallet: "Wallet", 
    profile: "Profile",
    
    // Login & Auth
    login: "Sign In",
    logout: "Sign Out",
    phoneNumber: "Phone Number",
    enterPhone: "Enter your phone number",
    verificationCode: "Verification Code", 
    enterCode: "Enter the code",
    sendCode: "Send Code",
    verify: "Verify",
    resendCode: "Resend",
    incorrectCode: "Incorrect code",
    invalidPhone: "Enter a valid number",
    whatsappVerification: "WhatsApp verification code",
    
    // Countries
    selectCountry: "Select Country",
    qatar: "Qatar",
    saudi: "Saudi Arabia",
    uae: "UAE", 
    kuwait: "Kuwait",
    bahrain: "Bahrain",
    oman: "Oman",
    jordan: "Jordan",
    lebanon: "Lebanon",
    syria: "Syria",
    iraq: "Iraq", 
    egypt: "Egypt",
    libya: "Libya",
    tunisia: "Tunisia",
    algeria: "Algeria",
    morocco: "Morocco",
    sudan: "Sudan", 
    yemen: "Yemen",
    
    // Location
    allowLocation: "Allow Location",
    detectingLocation: "Detecting location...",
    locationDescription: "We need your location to find the best deals and coupons near you",
    
    // Deals & Offers
    todaysDeals: "Today's Deals",
    hotDeals: "Hot Deals",
    nearbyOffers: "Nearby Offers", 
    discount: "OFF",
    originalPrice: "Original Price",
    afterDiscount: "After Discount",
    save: "Save",
    getCoupon: "Get Coupon",
    dealExpires: "Expires in",
    remaining: "remaining",
    limited: "Limited",
    exclusive: "Exclusive",
    
    // Categories
    restaurants: "Restaurants",
    cafes: "Cafes",
    shopping: "Shopping",
    beauty: "Beauty",
    health: "Health", 
    sports: "Sports",
    education: "Education",
    travel: "Travel",
    
    // Coupons & Wallet
    myCoupons: "My Coupons",
    activeCoupons: "Active",
    usedCoupons: "Used",
    expiredCoupons: "Expired",
    totalSavings: "Total Savings",
    couponCode: "Coupon Code",
    validUntil: "Valid until",
    useCoupon: "Use Coupon",
    
    // Profile & Settings
    personalInfo: "Personal Information",
    email: "Email",
    language: "Language",
    notifications: "Notifications", 
    privacy: "Privacy",
    terms: "Terms & Conditions",
    support: "Support",
    about: "About App",
    
    // Common Actions
    save: "Save",
    cancel: "Cancel",
    confirm: "Confirm",
    edit: "Edit",
    delete: "Delete",
    share: "Share",
    copy: "Copy",
    close: "Close",
    back: "Back", 
    next: "Next",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    
    // Merchant Dashboard
    merchantDashboard: "Merchant Dashboard",
    addDeal: "Add Deal",
    myDeals: "My Deals",
    analytics: "Analytics",
    earnings: "Earnings",
    
    // Admin Dashboard
    adminDashboard: "Admin Dashboard", 
    merchants: "Merchants",
    approvals: "Approvals",
    finance: "Finance",
    accounting: "Accounting",
    reports: "Reports"
  }
}

// Language Provider Component
export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('ar')
  const [isRTL, setIsRTL] = useState(true)

  useEffect(() => {
    const savedLang = localStorage.getItem('qreeb_language') || 'ar'
    setLanguage(savedLang)
    setIsRTL(savedLang === 'ar')
    
    // Update document direction and lang
    document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = savedLang
  }, [])

  const changeLanguage = (lang) => {
    setLanguage(lang)
    setIsRTL(lang === 'ar')
    localStorage.setItem('qreeb_language', lang)
    
    // Update document direction and lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
  }

  const t = (key) => {
    return translations[language][key] || key
  }

  const value = {
    language,
    isRTL,
    changeLanguage,
    t
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

// Hook to use language context
export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

// Helper function to get translated text
export function useTranslation() {
  const { t } = useLanguage()
  return { t }
}

// Language Switcher Component
export function LanguageSwitcher({ className = "" }) {
  const { language, changeLanguage, isRTL } = useLanguage()
  
  return (
    <button
      className={`tap ${className}`}
      onClick={() => changeLanguage(language === 'ar' ? 'en' : 'ar')}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 12px',
        borderRadius: 20,
        border: '1px solid #374151',
        background: '#18141F',
        color: '#F0EDE8',
        fontSize: 12,
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}
    >
      <span>{language === 'ar' ? '🇶🇦' : '🇺🇸'}</span>
      <span>{language === 'ar' ? 'العربية' : 'English'}</span>
    </button>
  )
}

export default useLanguage
