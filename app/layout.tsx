import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'وِجهة — عروض وكوبونات قطر',
  description: 'اكتشف أفضل عروض وخصومات المطاعم والمقاهي والمتاجر في قطر',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'وِجهة',
  },
}

export const viewport: Viewport = {
  themeColor: '#7C1D2E',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: "'Tajawal', sans-serif", background: '#06090F' }}>
        {children}
      </body>
    </html>
  )
}
