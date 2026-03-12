'use client'
import dynamic from 'next/dynamic'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getRole } from '@/lib/auth'

const MerchantApp = dynamic(() => import('@/components/MerchantApp'), { ssr: false })

export default function MerchantDashboard() {
  const router = useRouter()

  useEffect(() => {
    const role = getRole()
    if (role !== 'merchant') router.replace('/merchant/login')
  }, [router])

  return <MerchantApp />
}
