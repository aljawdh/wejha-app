import { supabase } from './supabase'

export async function sendOTP(phone: string) {
  const formatted = phone.startsWith('+') ? phone : `+974${phone}`
  const { error } = await supabase.auth.signInWithOtp({ phone: formatted })
  return { error }
}

export async function verifyOTP(phone: string, token: string) {
  const formatted = phone.startsWith('+') ? phone : `+974${phone}`
  const { data, error } = await supabase.auth.verifyOtp({
    phone: formatted, token, type: 'sms',
  })
  if (typeof window !== 'undefined' && data.session) {
    localStorage.setItem('wejha_role', 'customer')
    localStorage.setItem('wejha_phone', formatted)
  }
  return { data, error }
}

export async function merchantLogin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (typeof window !== 'undefined' && data.session) {
    const { data: merchant } = await supabase
      .from('merchants').select('id, status').eq('email', email).single()
    if (merchant) {
      localStorage.setItem('wejha_role', 'merchant')
      localStorage.setItem('wejha_merchant_id', merchant.id)
      localStorage.setItem('wejha_merchant_status', merchant.status)
    }
  }
  return { data, error }
}

export async function adminLogin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (typeof window !== 'undefined' && data.session) {
    const { data: adminUser } = await supabase
      .from('admin_users').select('role, name').eq('email', email).single()
    if (adminUser) {
      localStorage.setItem('wejha_role', adminUser.role)
      localStorage.setItem('wejha_admin_name', adminUser.name)
    }
  }
  return { data, error }
}

export async function logout() {
  await supabase.auth.signOut()
  if (typeof window !== 'undefined') {
    ['wejha_role','wejha_phone','wejha_merchant_id','wejha_merchant_status','wejha_admin_name']
      .forEach(k => localStorage.removeItem(k))
  }
}

export function getRole(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('wejha_role')
}

export function getMerchantId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('wejha_merchant_id')
}
