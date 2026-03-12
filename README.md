# قريب - Qreeb 🏷️

**منصة كوبونات وخصومات شاملة لدولة قطر**

<div dir="rtl">

قريب هي منصة متكاملة لإدارة الكوبونات والخصومات، تربط بين التجار والعملاء في دولة قطر. تتيح للتجار إنشاء عروض جذابة وللعملاء الاستفادة من خصومات حصرية.

</div>

---

## 🌟 **المميزات الرئيسية**

### 📱 **للعملاء**
- تصفح العروض القريبة حسب الموقع
- دعم 17 دولة عربية وخليجية
- كوبونات QR و Barcode  
- محفظة كوبونات ذكية
- إشعارات فورية للعروض الجديدة
- تطبيق PWA للموبايل

### 🏪 **للتجار**
- لوحة تحكم شاملة لإدارة العروض
- تتبع الأداء والإحصائيات
- إدارة الكوبونات المستخدمة
- نظام دفعات آمن
- تقارير مالية مفصلة

### 👑 **للإدارة**
- لوحة تحكم إدارية متقدمة
- إدارة التجار والموافقات
- نظام مالي ومحاسبي كامل
- تحليلات وتقارير شاملة
- إدارة الشكاوى والدعم

---

## 🛠 **التقنيات المستخدمة**

### **Frontend**
- **Next.js 14** - إطار React متقدم
- **TypeScript** - للأمان والموثوقية
- **PWA** - تطبيق ويب تقدمي
- **Responsive Design** - متوافق مع جميع الأجهزة

### **Backend**
- **Supabase** - قاعدة بيانات وAPI
- **PostgreSQL** - قاعدة بيانات قوية
- **Row Level Security** - حماية البيانات
- **Real-time** - تحديثات فورية

### **المكونات**
- **React Hooks** - إدارة الحالة
- **Custom UI Components** - واجهات مخصصة
- **Arabic/English** - دعم ثنائي اللغة
- **Dark Theme** - تصميم عصري

---

## 🚀 **التثبيت والتشغيل**

### **المتطلبات الأساسية**
```bash
Node.js >= 18.0.0
npm >= 9.0.0
Git
```

### **1. استنساخ المشروع**
```bash
git clone https://github.com/qreeb-qatar/qreeb-app.git
cd qreeb-app
```

### **2. تثبيت التبعيات**
```bash
npm install
```

### **3. إعداد المتغيرات البيئية**
```bash
cp .env.example .env.local
```

قم بتحرير `.env.local` وإضافة بياناتك:
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-key

# Additional configurations...
```

### **4. إعداد قاعدة البيانات**
```bash
# استيراد schema إلى Supabase
# افتح Supabase Dashboard → SQL Editor
# انسخ محتوى supabase-schema-complete.sql وشغله
```

### **5. تشغيل المشروع**
```bash
# للتطوير
npm run dev

# للإنتاج
npm run build
npm start
```

### **6. الوصول للتطبيق**
- **العملاء:** http://localhost:3000
- **التجار:** http://localhost:3000/merchant/login
- **الإدارة:** http://localhost:3000/admin/login

---

## 🗄 **هيكل المشروع**

```
qreeb/
├── 📁 app/                     # Next.js App Router
│   ├── 📁 admin/              # صفحات الإدارة
│   ├── 📁 merchant/           # صفحات التجار  
│   ├── 📁 api/                # API Routes
│   ├── 📄 layout.tsx          # Layout رئيسي
│   ├── 📄 page.tsx            # الصفحة الرئيسية
│   └── 📄 globals.css         # التنسيقات الشاملة
├── 📁 components/             # مكونات React
│   ├── 📄 UserApp.jsx         # تطبيق العميل
│   ├── 📄 AdminPanel.jsx      # لوحة الإدارة
│   ├── 📄 MerchantDashboard.jsx # لوح التاجر
│   └── 📄 LoadingScreen.tsx   # شاشة التحميل
├── 📁 lib/                    # مكتبات مساعدة
│   ├── 📄 supabase-admin.js   # وظائف Supabase
│   └── 📄 api-client.js       # عميل API
├── 📁 public/                 # ملفات ثابتة
│   ├── 📄 manifest.json       # PWA Manifest
│   └── 📁 icons/             # أيقونات التطبيق
├── 📄 supabase-schema-complete.sql # قاعدة البيانات
├── 📄 package.json            # تبعيات المشروع
├── 📄 next.config.js          # إعدادات Next.js
├── 📄 .env.example            # متغيرات بيئية نموذجية
└── 📄 README.md              # هذا الملف
```

---

## 📊 **قاعدة البيانات**

### **الجداول الرئيسية**

#### **Categories** - فئات المتاجر
- دعم عربي/إنجليزي
- أيقونات ملونة
- ترتيب مخصص

#### **Merchants** - بيانات التجار
- معلومات كاملة للتاجر
- بيانات مصرفية
- حالة التوثيق

#### **Deals** - العروض والخصومات
- تفاصيل العرض
- أسعار وخصومات
- تواريخ صلاحية

#### **Claimed_Coupons** - الكوبونات المطلوبة
- رموز QR وBarcode
- حالة الاستخدام
- تتبع العمولات

#### **User_Profiles** - ملفات العملاء
- تفضيلات شخصية
- إعدادات الإشعارات
- سجل النقاط

---

## 🔐 **الحماية والأمان**

### **مصادقة متقدمة**
- OTP عبر واتساب
- JWT Tokens آمنة
- Row Level Security

### **حماية البيانات**
- تشفير البيانات الحساسة
- تدقيق العمليات
- نسخ احتياطية تلقائية

### **الصلاحيات**
```sql
-- العملاء: قراءة العروض العامة فقط
-- التجار: إدارة بياناتهم وعروضهم
-- الإدارة: وصول كامل مع تسجيل
```

---

## 🌍 **النشر على الإنتاج**

### **Vercel (موصى به)**
```bash
# ربط GitHub
vercel --prod

# متغيرات البيئة
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
# ... باقي المتغيرات
```

### **Docker**
```bash
# بناء الصورة
docker build -t qreeb-app .

# تشغيل الحاوية
docker run -p 3000:3000 qreeb-app
```

### **إعدادات الإنتاج**
- SSL Certificate مطلوب
- CDN للملفات الثابتة
- Monitoring والتنبيهات
- قاعدة بيانات إنتاج منفصلة

---

## 🔧 **التطوير والمساهمة**

### **متطلبات التطوير**
```bash
# تثبيت أدوات التطوير
npm install --dev

# فحص الكود
npm run lint

# اختبار الأنواع
npm run type-check
```

### **إرشادات المساهمة**
1. Fork المشروع
2. إنشاء فرع جديد للميزة
3. اتبع معايير الترميز
4. اختبر التغييرات جيداً
5. أرسل Pull Request

### **معايير الترميز**
- التعليقات بالعربية والإنجليزية
- أسماء متغيرات واضحة
- توثيق الدوال المعقدة
- اختبار الميزات الجديدة

---

## 🎯 **الميزات المستقبلية**

### **المرحلة القادمة**
- [ ] تطبيق موبايل أصلي (React Native)
- [ ] نظام نقاط الولاء
- [ ] تكامل مع Apple Pay / Google Pay
- [ ] تقييمات وآراء العملاء
- [ ] نظام الإحالة والعمولات

### **التحسينات المطلوبة**
- [ ] تحسين الأداء (Performance)
- [ ] اختبارات تلقائية (Unit Tests)
- [ ] توطين كامل (i18n)
- [ ] تحليلات متقدمة (Analytics)
- [ ] دعم العملات المتعددة

---

## 📞 **الدعم والتواصل**

### **معلومات الدعم**
- **البريد الإلكتروني:** support@qreeb.qa
- **هاتف:** +974 4400 0000
- **واتساب:** +974 5500 0000

### **الشبكات الاجتماعية**
- **تويتر:** [@QreebQatar](https://twitter.com/QreebQatar)
- **إنستغرام:** [@QreebQA](https://instagram.com/QreebQA)
- **LinkedIn:** [Qreeb Qatar](https://linkedin.com/company/qreeb-qatar)

### **الوثائق التقنية**
- **API Documentation:** [docs.qreeb.qa](https://docs.qreeb.qa)
- **Developer Portal:** [developers.qreeb.qa](https://developers.qreeb.qa)

---

## 📋 **الترخيص**

```
MIT License

Copyright (c) 2026 Qreeb - Qatar

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 📈 **إحصائيات المشروع**

![GitHub Stars](https://img.shields.io/github/stars/qreeb-qatar/qreeb-app?style=social)
![GitHub Forks](https://img.shields.io/github/forks/qreeb-qatar/qreeb-app?style=social)
![GitHub Issues](https://img.shields.io/github/issues/qreeb-qatar/qreeb-app)
![GitHub License](https://img.shields.io/github/license/qreeb-qatar/qreeb-app)

**مبني بـ ❤️ في قطر** 🇶🇦

---

<div align="center">
  <h3>قريب - اكتشف العروض القريبة منك</h3>
  <p>Qreeb - Discover deals near you</p>
</div>
