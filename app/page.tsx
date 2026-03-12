import { Suspense } from 'react'
import UserApp from '@/components/UserApp'
import LoadingScreen from '@/components/LoadingScreen'

export const metadata = {
  title: 'قريب - اكتشف العروض القريبة منك',
  description: 'كوبونات وخصومات حصرية في المتاجر والمطاعم والمقاهي - دولة قطر',
  keywords: 'قطر، كوبونات، عروض، خصومات، مطاعم، مقاهي، Qatar, coupons, deals',
  openGraph: {
    title: 'قريب - اكتشف العروض القريبة منك',
    description: 'منصة كوبونات وخصومات حصرية في دولة قطر',
    images: ['/og-image.jpg'],
  },
}

export default function HomePage() {
  return (
    <main>
      <Suspense fallback={<LoadingScreen />}>
        <UserApp />
      </Suspense>
    </main>
  )
}
