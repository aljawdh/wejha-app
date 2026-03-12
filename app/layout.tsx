import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'قريب - Qreeb | اكتشف العروض القريبة منك',
  description: 'منصة كوبونات وخصومات حصرية في المتاجر والمطاعم والمقاهي - دولة قطر',
  keywords: 'قطر، كوبونات، عروض، خصومات، مطاعم، مقاهي، Qatar, coupons, deals, discounts',
  authors: [{ name: 'قريب - Qreeb', url: 'https://qreeb.qa' }],
  viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
  robots: 'index, follow',
  openGraph: {
    title: 'قريب - Qreeb | اكتشف العروض القريبة منك',
    description: 'منصة كوبونات وخصومات حصرية في دولة قطر',
    url: 'https://qreeb.qa',
    siteName: 'قريب - Qreeb',
    locale: 'ar_QA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'قريب - Qreeb',
    description: 'اكتشف العروض القريبة منك',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&family=Cairo:wght@300;400;600;700;900&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#8B1F24" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
