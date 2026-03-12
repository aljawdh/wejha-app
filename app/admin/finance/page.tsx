'use client'
import dynamic from 'next/dynamic'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getRole } from '@/lib/auth'

const FinanceApp = dynamic(() => import('@/components/FinanceApp'), { ssr: false })

export default function FinancePage() {
  const router = useRouter()
  useEffect(() => {
    const role = getRole()
    if (!['admin','finance'].includes(role || '')) router.replace('/admin/login')
  }, [router])
  return <FinanceApp />
}
