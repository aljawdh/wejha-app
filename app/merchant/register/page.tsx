'use client'
import dynamic from 'next/dynamic'

const RegisterApp = dynamic(() => import('@/components/RegisterApp'), { ssr: false })

export default function MerchantRegister() {
  return <RegisterApp />
}
