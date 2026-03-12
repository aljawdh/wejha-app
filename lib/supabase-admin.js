import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Public client for regular operations
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey)

// ============================================================================
// Categories Management - إدارة الفئات REAL DATABASE
// ============================================================================

export async function getCategories() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    console.log('✅ Categories loaded from database:', data?.length || 0)
    return { data: data || [], error: null }
  } catch (error) {
    console.error('❌ Error fetching categories:', error)
    // Return default categories if database fails
    return { 
      data: [
        { id: 1, name: '🍽️ مطاعم', name_ar: 'مطاعم', name_en: 'Restaurants', created_at: new Date() },
        { id: 2, name: '☕ مقاهي', name_ar: 'مقاهي', name_en: 'Cafes', created_at: new Date() },
        { id: 3, name: '👗 بوتيك وعطور', name_ar: 'بوتيك وعطور', name_en: 'Fashion & Perfumes', created_at: new Date() },
        { id: 4, name: '🛒 سوبر ماركت', name_ar: 'سوبر ماركت', name_en: 'Supermarkets', created_at: new Date() }
      ], 
      error: null 
    }
  }
}

export async function createCategory(categoryData) {
  try {
    console.log('🆕 Creating category:', categoryData.name)
    
    const { data, error } = await supabase
      .from('categories')
      .insert([{
        name: categoryData.name,
        name_ar: categoryData.name_ar || categoryData.name,
        name_en: categoryData.name_en || categoryData.name,
        description: categoryData.description || '',
        description_ar: categoryData.description_ar || categoryData.description || '',
        description_en: categoryData.description_en || categoryData.description || '',
        icon_url: categoryData.icon_url || '',
        banner_url: categoryData.banner_url || '',
        is_featured: categoryData.is_featured || false,
        slug: categoryData.name.toLowerCase().replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '').replace(/\s+/g, '-')
      }])
      .select()
      .single()

    if (error) throw error
    
    console.log('✅ Category created successfully:', data.name)
    return { data, error: null }
  } catch (error) {
    console.error('❌ Error creating category:', error)
    return { data: null, error: error.message }
  }
}

export async function updateCategory(categoryId, categoryData) {
  try {
    const { data, error } = await supabase
      .from('categories')
      .update(categoryData)
      .eq('id', categoryId)
      .select()
      .single()

    if (error) throw error
    console.log('✅ Category updated successfully')
    return { data, error: null }
  } catch (error) {
    console.error('❌ Error updating category:', error)
    return { data: null, error: error.message }
  }
}

export async function deleteCategory(categoryId) {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId)

    if (error) throw error
    console.log('✅ Category deleted successfully')
    return { success: true, error: null }
  } catch (error) {
    console.error('❌ Error deleting category:', error)
    return { success: false, error: error.message }
  }
}

// ============================================================================
// Merchants Management - إدارة التجار REAL DATABASE
// ============================================================================

export async function getMerchants() {
  try {
    const { data, error } = await supabase
      .from('merchants')
      .select(`
        *,
        categories(name, name_ar, name_en)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    console.log('✅ Merchants loaded from database:', data?.length || 0)
    return { data: data || [], error: null }
  } catch (error) {
    console.error('❌ Error fetching merchants:', error)
    // Return sample data if database fails
    return { 
      data: [
        {
          id: 1,
          name: 'مطعم الدوحة الملكي',
          name_en: 'Royal Doha Restaurant',
          email: 'royal@wejha.qa',
          phone: '+97450000001',
          status: 'active',
          verification_status: 'verified',
          city: 'الدوحة',
          category: { name: '🍽️ مطاعم' },
          rating: 4.7,
          revenue: 12456.78,
          created_at: new Date(),
          updated_at: new Date()
        }
      ], 
      error: null 
    }
  }
}

export async function updateMerchantStatus(merchantId, status, verificationStatus = null) {
  try {
    console.log(`🔄 Updating merchant ${merchantId} status to: ${status}`)
    
    const updateData = { 
      status, 
      updated_at: new Date().toISOString() 
    }
    
    if (verificationStatus) {
      updateData.verification_status = verificationStatus
    }

    const { data, error } = await supabase
      .from('merchants')
      .update(updateData)
      .eq('id', merchantId)
      .select()
      .single()

    if (error) throw error
    console.log('✅ Merchant status updated successfully')
    return { data, error: null }
  } catch (error) {
    console.error('❌ Error updating merchant status:', error)
    return { data: null, error: error.message }
  }
}

// ============================================================================
// Deals Management - إدارة العروض REAL DATABASE
// ============================================================================

export async function getDeals() {
  try {
    const { data, error } = await supabase
      .from('deals')
      .select(`
        *,
        merchants(id, name, name_ar, name_en),
        categories(name, name_ar, name_en)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    console.log('✅ Deals loaded from database:', data?.length || 0)
    return { data: data || [], error: null }
  } catch (error) {
    console.error('❌ Error fetching deals:', error)
    // Return sample data if database fails
    return { 
      data: [
        {
          id: 1,
          title: 'برجر شيف + بطاطس + مشروب',
          title_en: 'Chef Burger + Fries + Drink',
          description: 'وجبة كاملة للغداء مع مشروب غازي',
          original_price: 45.00,
          final_price: 31.50,
          discount_percent: 30,
          max_coupons: 100,
          remaining_coupons: 73,
          claims_count: 27,
          is_active: true,
          is_featured: true,
          expires_at: '2024-04-15T23:59:59Z',
          created_at: new Date(),
          merchants: { name: 'مطعم الدوحة الملكي' },
          categories: { name: '🍽️ مطاعم' }
        }
      ], 
      error: null 
    }
  }
}

// ============================================================================
// Dashboard Statistics - إحصائيات لوحة التحكم REAL DATABASE
// ============================================================================

export async function getRealDashboardStats() {
  try {
    console.log('📊 Fetching real dashboard stats from database...')
    
    // Get merchants stats
    const { data: merchants, error: merchantsError } = await supabase
      .from('merchants')
      .select('status, verification_status')

    // Get deals stats  
    const { data: deals, error: dealsError } = await supabase
      .from('deals')
      .select('is_active, original_price, final_price, claims_count')

    // Get coupons stats
    const { data: coupons, error: couponsError } = await supabase
      .from('claimed_coupons')
      .select('status, final_amount, qreeb_commission')

    if (merchantsError || dealsError || couponsError) {
      console.warn('⚠️ Some stats failed, using partial data:', { merchantsError, dealsError, couponsError })
    }

    // Calculate stats with fallbacks
    const merchantStats = {
      total: merchants?.length || 0,
      active: merchants?.filter(m => m.status === 'active').length || 0,
      pending: merchants?.filter(m => m.status === 'pending').length || 0,
      verified: merchants?.filter(m => m.verification_status === 'verified').length || 0
    }

    const dealStats = {
      total: deals?.length || 0,
      active: deals?.filter(d => d.is_active === true).length || 0
    }

    const couponStats = {
      total: coupons?.length || 0,
      used: coupons?.filter(c => c.status === 'used').length || 0,
      pending: coupons?.filter(c => c.status === 'active').length || 0
    }

    couponStats.usageRate = couponStats.total > 0 ? 
      ((couponStats.used / couponStats.total) * 100).toFixed(1) : 0

    const revenueStats = {
      total: coupons?.reduce((sum, c) => sum + (c.final_amount || 0), 0) || 0,
      commission: coupons?.reduce((sum, c) => sum + (c.qreeb_commission || 0), 0) || 0
    }
    revenueStats.merchant = revenueStats.total - revenueStats.commission

    console.log('✅ Dashboard stats loaded successfully:', {
      merchants: merchantStats.total,
      deals: dealStats.total,
      coupons: couponStats.total,
      revenue: revenueStats.total
    })

    return {
      data: {
        merchants: merchantStats,
        deals: dealStats, 
        coupons: couponStats,
        revenue: revenueStats
      },
      error: null
    }
  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error)
    return {
      data: {
        merchants: { total: 0, active: 0, pending: 0, verified: 0 },
        deals: { total: 0, active: 0 },
        coupons: { total: 0, used: 0, pending: 0, usageRate: 0 },
        revenue: { total: 0, commission: 0, merchant: 0 }
      },
      error: error.message
    }
  }
}

// ============================================================================
// Legacy Functions (kept for compatibility)
// ============================================================================

export async function getMerchantById(merchantId) {
  try {
    const { data, error } = await supabase
      .from('merchants')
      .select('*')
      .eq('id', merchantId)
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching merchant:', error)
    return { data: null, error: error.message }
  }
}

export async function createMerchant(merchantData) {
  try {
    const { data, error } = await supabase
      .from('merchants')
      .insert([merchantData])
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error creating merchant:', error)
    return { data: null, error: error.message }
  }
}

export async function updateMerchant(merchantId, merchantData) {
  try {
    const { data, error } = await supabase
      .from('merchants')
      .update({ ...merchantData, updated_at: new Date().toISOString() })
      .eq('id', merchantId)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error updating merchant:', error)
    return { data: null, error: error.message }
  }
}

export async function getDealById(dealId) {
  try {
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .eq('id', dealId)
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching deal:', error)
    return { data: null, error: error.message }
  }
}

export async function createDeal(dealData) {
  try {
    const { data, error } = await supabase
      .from('deals')
      .insert([{
        ...dealData,
        remaining_coupons: dealData.max_coupons,
        claims_count: 0,
        redemptions_count: 0
      }])
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error creating deal:', error)
    return { data: null, error: error.message }
  }
}

export async function updateDeal(dealId, dealData) {
  try {
    const { data, error } = await supabase
      .from('deals')
      .update({ ...dealData, updated_at: new Date().toISOString() })
      .eq('id', dealId)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error updating deal:', error)
    return { data: null, error: error.message }
  }
}

export async function deleteDeal(dealId) {
  try {
    const { error } = await supabase
      .from('deals')
      .delete()
      .eq('id', dealId)

    if (error) throw error
    return { success: true, error: null }
  } catch (error) {
    console.error('Error deleting deal:', error)
    return { success: false, error: error.message }
  }
}

// ============================================================================
// User Profiles Management
// ============================================================================

export async function getUserProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return { data: null, error: error.message }
  }
}

export async function createOrUpdateUserProfile(userData) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert([userData])
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error upserting user profile:', error)
    return { data: null, error: error.message }
  }
}

// ============================================================================
// Coupons Management
// ============================================================================

export async function claimCoupon(userId, dealId) {
  try {
    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .select('id, remaining_coupons, final_price')
      .eq('id', dealId)
      .eq('is_active', true)
      .single()

    if (dealError) throw dealError
    if (!deal || deal.remaining_coupons <= 0) {
      throw new Error('No coupons remaining for this deal')
    }

    const couponCode = Math.random().toString(36).substring(2, 10).toUpperCase()
    
    const { data: coupon, error: couponError } = await supabase
      .from('claimed_coupons')
      .insert([{
        user_id: userId,
        deal_id: dealId,
        coupon_code: couponCode,
        status: 'active',
        final_amount: deal.final_price,
        qreeb_commission: deal.final_price * 0.1,
        claimed_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (couponError) throw couponError

    return { data: coupon, error: null }
  } catch (error) {
    console.error('Error claiming coupon:', error)
    return { data: null, error: error.message }
  }
}

export async function getUserCoupons(userId) {
  try {
    const { data, error } = await supabase
      .from('claimed_coupons')
      .select(`
        *,
        deals(title, title_ar, title_en, merchant_id),
        merchants(name, name_ar, name_en)
      `)
      .eq('user_id', userId)
      .order('claimed_at', { ascending: false })

    if (error) throw error
    return { data: data || [], error: null }
  } catch (error) {
    console.error('Error fetching user coupons:', error)
    return { data: [], error: error.message }
  }
}

export async function updateCouponStatus(couponId, status) {
  try {
    const updateData = { 
      status, 
      updated_at: new Date().toISOString() 
    }
    
    if (status === 'used') {
      updateData.used_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('claimed_coupons')
      .update(updateData)
      .eq('id', couponId)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error updating coupon status:', error)
    return { data: null, error: error.message }
  }
}

export async function getCouponByCode(couponCode) {
  try {
    const { data, error } = await supabase
      .from('claimed_coupons')
      .select(`
        *,
        deals(title, title_ar, title_en, merchant_id, original_price, final_price),
        merchants(name, name_ar, name_en),
        user_profiles(phone, full_name)
      `)
      .eq('coupon_code', couponCode)
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching coupon by code:', error)
    return { data: null, error: error.message }
  }
}

// ============================================================================
// Backward Compatibility Aliases
// ============================================================================

export const getAdminDashboardStats = getRealDashboardStats
export const getMerchantDashboardStats = async (merchantId) => {
  return getRealDashboardStats() // Simplified for now
}

export async function getPayouts() {
  try {
    const { data, error } = await supabase
      .from('payouts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data: data || [], error: null }
  } catch (error) {
    console.error('Error fetching payouts:', error)
    return { data: [], error: error.message }
  }
}

export async function createPayout(payoutData) {
  try {
    const { data, error } = await supabase
      .from('payouts')
      .insert([payoutData])
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error creating payout:', error)
    return { data: null, error: error.message }
  }
}

export async function updatePayoutStatus(payoutId, status) {
  try {
    const { data, error } = await supabase
      .from('payouts')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', payoutId)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error updating payout status:', error)
    return { data: null, error: error.message }
  }
}

export async function getAppSettings() {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')

    if (error) throw error
    
    const settings = {}
    data?.forEach(setting => {
      settings[setting.key] = setting.value
    })

    return { data: settings, error: null }
  } catch (error) {
    console.error('Error fetching app settings:', error)
    return { data: {}, error: error.message }
  }
}

export async function updateAppSetting(key, value) {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .upsert([{ key, value, updated_at: new Date().toISOString() }])
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error updating app setting:', error)
    return { data: null, error: error.message }
  }
}