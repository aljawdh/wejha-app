# 🧭 وِجهة — دليل الإعداد والنشر الكامل

## 📁 هيكل الملفات النهائي

```
wejha-app/
├── app/
│   ├── layout.tsx              ← الـ layout الرئيسي
│   ├── page.tsx                ← واجهة العميل  /
│   ├── merchant/
│   │   ├── login/page.tsx      ←  /merchant/login
│   │   ├── register/page.tsx   ←  /merchant/register
│   │   └── dashboard/page.tsx  ←  /merchant/dashboard
│   └── admin/
│       ├── login/page.tsx      ←  /admin/login
│       ├── page.tsx            ←  /admin
│       ├── finance/page.tsx    ←  /admin/finance
│       └── accounting/page.tsx ←  /admin/accounting
├── components/               ← ضع ملفات JSX هنا
│   ├── UserApp.jsx            ← من wejha-user-v7.jsx
│   ├── MerchantApp.jsx        ← من wejha-merchant-v7.jsx
│   ├── RegisterApp.jsx        ← من wejha-register.jsx
│   ├── AdminApp.jsx           ← من wejha-admin-v4.jsx
│   ├── FinanceApp.jsx         ← من wejha-finance-dashboard.jsx
│   └── AccountingApp.jsx      ← من wejha-accounting-v4.jsx
├── lib/
│   ├── supabase.ts
│   └── auth.ts
├── public/
│   └── manifest.json
├── supabase-schema.sql        ← شغّله في Supabase
├── .env.example               ← انسخه لـ .env.local
└── package.json
```

---

## ⚡ خطوة 1 — تحضير الملفات

### 1.1 انسخ ملفات JSX إلى /components

```bash
# من مجلد التنزيل:
cp wejha-user-v7.jsx        components/UserApp.jsx
cp wejha-merchant-v7.jsx    components/MerchantApp.jsx
cp wejha-register.jsx       components/RegisterApp.jsx
cp wejha-admin-v4.jsx       components/AdminApp.jsx
cp wejha-finance-dashboard.jsx  components/FinanceApp.jsx
cp wejha-accounting-v4.jsx  components/AccountingApp.jsx
```

### 1.2 أضف 'use client' لكل ملف JSX

في أول سطر من كل ملف أضف:
```jsx
'use client'
```

### 1.3 تأكد من اسم الدالة الرئيسية

كل ملف JSX يجب أن ينتهي بـ:
```jsx
export default function App() { ... }
// أو
export default App
```

---

## 🗄️ خطوة 2 — إعداد Supabase

### 2.1 أنشئ مشروع Supabase
1. اذهب إلى [supabase.com](https://supabase.com) وسجّل
2. أنشئ مشروع جديد (اسمه: wejha)
3. انتظر دقيقتين حتى يجهز

### 2.2 شغّل الـ Schema
1. افتح **SQL Editor** في Supabase
2. الصق محتوى `supabase-schema.sql`
3. اضغط **Run**

### 2.3 فعّل Phone Auth (للـ OTP)
1. Authentication → Providers → Phone
2. فعّله واختر Twilio أو أي مزود

---

## 🔧 خطوة 3 — إعداد المشروع محلياً

```bash
# 1. ثبّت الـ dependencies
npm install

# 2. انسخ ملف البيئة
cp .env.example .env.local

# 3. افتح .env.local وعبّي:
#    NEXT_PUBLIC_SUPABASE_URL=...
#    NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# 4. شغّل محلياً
npm run dev
# افتح: http://localhost:3000
```

---

## 🚀 خطوة 4 — النشر على Vercel

```bash
# 1. ثبّت Vercel CLI
npm install -g vercel

# 2. انشر
vercel deploy

# 3. أضف متغيرات البيئة في Vercel Dashboard:
#    Settings → Environment Variables
#    أضف نفس قيم .env.local
```

### أو عبر GitHub (الأسهل):
1. ارفع المشروع على GitHub
2. اذهب إلى [vercel.com](https://vercel.com)
3. New Project → Import من GitHub
4. أضف Environment Variables
5. اضغط Deploy ✅

---

## 📱 خطوة 5 — تحويل لتطبيق موبايل (Capacitor)

```bash
# 1. ثبّت Capacitor
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android

# 2. ابنِ التطبيق
npm run build

# 3. أضف الـ platforms
npx cap add ios
npx cap add android

# 4. انسخ الملفات
npx cap copy

# 5. افتح في Xcode (للـ iOS)
npx cap open ios

# 6. افتح في Android Studio
npx cap open android
```

### في next.config.js افتح هذا السطر للموبايل:
```js
output: 'export',  // ← أزل التعليق
```

---

## 🔗 روابط التطبيق

| الصفحة | الرابط |
|--------|--------|
| تطبيق العميل | `https://wejha.qa/` |
| دخول التاجر | `https://wejha.qa/merchant/login` |
| تسجيل تاجر جديد | `https://wejha.qa/merchant/register` |
| لوحة التاجر | `https://wejha.qa/merchant/dashboard` |
| لوحة الإدارة | `https://wejha.qa/admin` |
| لوحة المالية | `https://wejha.qa/admin/finance` |
| لوحة المحاسبة | `https://wejha.qa/admin/accounting` |

---

## 💡 ملاحظات مهمة

- **متغيرات البيئة** لا ترفعها على GitHub — استخدم .gitignore
- **Supabase Service Role Key** لا تستخدمها في الـ frontend
- **OTP واتساب** يحتاج Twilio Business أو Meta Business API
- **Apple Pay** يحتاج Apple Developer Account ($99/year)
- **Android** يحتاج Google Play Console ($25 مرة واحدة)

---

## 📞 الدعم

في حال أي مشكلة:
- legal@wejha.qa
- [Supabase Docs](https://supabase.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Capacitor Docs](https://capacitorjs.com/docs)
