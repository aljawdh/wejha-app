'use client'
import dynamic from 'next/dynamic'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getRole } from '@/lib/auth'

const AdminApp = dynamic(() => import('@/components/AdminApp'), { ssr: false })

export default function AdminPage() {
  const router = useRouter()
  useEffect(() => {
    const role = getRole()
    if (!['admin','merchant_manager','support','content'].includes(role || ''))
      router.replace('/admin/login')
  }, [router])
  return <AdminApp />
}
