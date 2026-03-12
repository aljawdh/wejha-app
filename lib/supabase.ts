import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type UserRole = 'customer' | 'merchant' | 'admin' | 'finance' | 'accounting'

export interface Merchant {
  id: string; name: string; phone: string; email: string
  city: string; category: string; iban: string; bank: string
  status: 'pending' | 'active' | 'suspended'; cr_number: string
  logo_url?: string; created_at: string
}

export interface Deal {
  id: string; merchant_id: string; title: string; desc: string
  type: 'product' | 'invoice_paid' | 'bogo'; disc: number
  original_price: number; min_spend: number; max_codes: number
  used: number; bogo: boolean; active: boolean
  expires_hours: number | null; start_time: string
  end_time: string; img?: string; created_at: string
}

export interface ClaimedCoupon {
  id: string; deal_id: string; user_phone: string; code: string
  qty: number; used_at: string | null; ends_at: string | null; created_at: string
}
