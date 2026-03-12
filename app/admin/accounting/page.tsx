'use client'
import dynamic from 'next/dynamic'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getRole } from '@/lib/auth'

const AccountingApp = dynamic(() => import('@/components/AccountingApp'), { ssr: false })

export default function AccountingPage() {
  const router = useRouter()
  useEffect(() => {
    const role = getRole()
    if (!['admin','accounting'].includes(role || '')) router.replace('/admin/login')
  }, [router])
  return <AccountingApp />
}
