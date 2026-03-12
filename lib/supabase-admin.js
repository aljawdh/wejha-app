import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// ============================================================================
// Utility Functions
// ============================================================================

export function handleSupabaseError(error, context = '') {
  console.error(`Supabase error in ${context}:`, error)
  throw new Error(error.message || 'Database operation failed')
}

export function transformTimestamp(timestamp) {
  return timestamp ? new Date(timestamp).toISOString() : null
}

// Categories API functions
export async function getCategories() {
  try {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .order('order_index', { ascending: true })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

export async function createCategory(category) {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .insert({
      name: category.name,
      name_en: category.nameEn || category.name,
      emoji: category.emoji,
      description: category.desc || category.description,
      color: category.color || '#7C3AED',
      is_visible: category.visible !== false,
      order_index: category.order || 0,
      created_at: new Date().toISOString()
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateCategory(id, category) {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .update({
      name: category.name,
      name_en: category.nameEn || category.name,
      emoji: category.emoji,
      description: category.desc || category.description,
      color: category.color,
      is_visible: category.visible,
      order_index: category.order,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteCategory(id) {
  const { error } = await supabaseAdmin
    .from('categories')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return { success: true }
}

// Merchants API functions
export async function getMerchants() {
  try {
    const { data, error } = await supabaseAdmin
      .from('merchants')
      .select(`
        *,
        categories (
          name,
          emoji,
          color
        )
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching merchants:', error)
    return []
  }
}

export async function updateMerchantStatus(id, status) {
  const { data, error } = await supabaseAdmin
    .from('merchants')
    .update({ 
      status: status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function createMerchant(merchant) {
  const { data, error } = await supabaseAdmin
    .from('merchants')
    .insert({
      name: merchant.name,
      owner_name: merchant.ownerName,
      email: merchant.email,
      phone: merchant.phone,
      category_id: merchant.categoryId,
      city: merchant.city || 'الدوحة',
      commercial_register: merchant.commercialRegister,
      cr_expiry_date: merchant.crExpiryDate,
      bank_name: merchant.bankName,
      iban: merchant.iban,
      status: 'pending',
      created_at: new Date().toISOString()
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getMerchantById(id) {
  const { data, error } = await supabaseAdmin
    .from('merchants')
    .select(`
      *,
      categories (
        name,
        emoji,
        color
      )
    `)
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

export async function getMerchantByEmail(email) {
  const { data, error } = await supabaseAdmin
    .from('merchants')
    .select('*')
    .eq('email', email)
    .single()
  
  if (error) return null
  return data
}

// Deals API functions
export async function getDeals(merchantId = null, isPublic = false) {
  try {
    let query = supabaseAdmin
      .from('deals')
      .select(`
        *,
        merchants (
          name,
          status,
          city,
          categories (
            name,
            emoji
          )
        )
      `)
    
    if (merchantId) {
      query = query.eq('merchant_id', merchantId)
    }
    
    if (isPublic) {
      query = query
        .eq('is_active', true)
        .gte('expires_at', new Date().toISOString())
        .gt('remaining_coupons', 0)
        .eq('merchants.status', 'active')
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching deals:', error)
    return []
  }
}

export async function createDeal(deal) {
  const { data, error } = await supabaseAdmin
    .from('deals')
    .insert({
      merchant_id: deal.merchantId,
      title: deal.title,
      description: deal.description,
      category: deal.category,
      deal_type: deal.type || 'product',
      original_price: Number(deal.originalPrice),
      discount_percent: Number(deal.discountPercent),
      final_price: Number(deal.finalPrice),
      max_coupons: Number(deal.maxCoupons) || 100,
      remaining_coupons: Number(deal.maxCoupons) || 100,
      image_url: deal.imageUrl,
      location_lat: deal.location?.lat,
      location_lng: deal.location?.lng,
      expires_at: deal.expiresAt,
      is_active: true,
      created_at: new Date().toISOString()
    })
    .select()
    .single()
  
  if (error) throw error
  
  // Update merchant deals count
  await supabaseAdmin.rpc('increment_merchant_deals', {
    merchant_id: deal.merchantId
  })
  
  return data
}

export async function updateDeal(id, deal) {
  const { data, error } = await supabaseAdmin
    .from('deals')
    .update({
      title: deal.title,
      description: deal.description,
      category: deal.category,
      deal_type: deal.type,
      original_price: Number(deal.originalPrice),
      discount_percent: Number(deal.discountPercent),
      final_price: Number(deal.finalPrice),
      max_coupons: Number(deal.maxCoupons),
      image_url: deal.imageUrl,
      location_lat: deal.location?.lat,
      location_lng: deal.location?.lng,
      expires_at: deal.expiresAt,
      is_active: deal.isActive !== false,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteDeal(id) {
  const { error } = await supabaseAdmin
    .from('deals')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return { success: true }
}

// Coupons API functions
export async function createCoupon(coupon) {
  const { data, error } = await supabaseAdmin
    .from('claimed_coupons')
    .insert({
      deal_id: coupon.dealId,
      user_phone: coupon.userPhone,
      coupon_code: coupon.code,
      original_price: coupon.originalPrice,
      final_price: coupon.finalPrice,
      discount_percent: coupon.discountPercent,
      quantity: coupon.quantity || 1,
      expires_at: new Date(coupon.expiresAt).toISOString(),
      status: 'active',
      created_at: new Date().toISOString()
    })
    .select()
    .single()
  
  if (error) throw error
  
  // Update remaining coupons in deals table
  await supabaseAdmin.rpc('decrement_remaining_coupons', {
    deal_id: coupon.dealId,
    quantity: coupon.quantity || 1
  })
  
  return data
}

export async function getUserCoupons(userPhone) {
  try {
    const { data, error } = await supabaseAdmin
      .from('claimed_coupons')
      .select(`
        *,
        deals (
          title,
          description,
          deal_type,
          image_url,
          merchants (
            name,
            city
          )
        )
      `)
      .eq('user_phone', userPhone)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching user coupons:', error)
    return []
  }
}

export async function updateCouponStatus(id, status, usedAt = null) {
  const updateData = {
    status: status,
    updated_at: new Date().toISOString()
  }
  
  if (usedAt) {
    updateData.used_at = usedAt
  }
  
  const { data, error } = await supabaseAdmin
    .from('claimed_coupons')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getCouponByCode(code) {
  const { data, error } = await supabaseAdmin
    .from('claimed_coupons')
    .select(`
      *,
      deals (
        title,
        merchants (
          name
        )
      )
    `)
    .eq('coupon_code', code)
    .single()
  
  if (error) return null
  return data
}

// Admin users functions
export async function getAdminUser(email) {
  const { data, error } = await supabaseAdmin
    .from('admin_users')
    .select('*')
    .eq('email', email)
    .eq('is_active', true)
    .single()
  
  if (error) return null
  return data
}

export async function updateAdminLastLogin(id) {
  const { error } = await supabaseAdmin
    .from('admin_users')
    .update({ last_login: new Date().toISOString() })
    .eq('id', id)
  
  if (error) console.error('Error updating admin last login:', error)
}

// Statistics functions
export async function getAdminStats() {
  try {
    const [
      { count: totalMerchants },
      { count: activeMerchants }, 
      { count: pendingMerchants },
      { count: totalDeals },
      { count: activeDeals },
      { count: totalCoupons },
      { count: usedCoupons }
    ] = await Promise.all([
      supabaseAdmin.from('merchants').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('merchants').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabaseAdmin.from('merchants').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabaseAdmin.from('deals').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('deals').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabaseAdmin.from('claimed_coupons').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('claimed_coupons').select('*', { count: 'exact', head: true }).eq('status', 'used')
    ])
    
    // Get revenue data
    const { data: revenueData } = await supabaseAdmin
      .from('claimed_coupons')
      .select('original_price, final_price')
      .eq('status', 'used')
    
    const totalRevenue = revenueData?.reduce((sum, coupon) => {
      return sum + (coupon.original_price - coupon.final_price) * 0.1 // 10% commission
    }, 0) || 0
    
    return {
      totalMerchants: totalMerchants || 0,
      activeMerchants: activeMerchants || 0,
      pendingMerchants: pendingMerchants || 0,
      totalDeals: totalDeals || 0,
      activeDeals: activeDeals || 0,
      totalCoupons: totalCoupons || 0,
      usedCoupons: usedCoupons || 0,
      totalRevenue: totalRevenue
    }
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return {
      totalMerchants: 0,
      activeMerchants: 0,
      pendingMerchants: 0,
      totalDeals: 0,
      activeDeals: 0,
      totalCoupons: 0,
      usedCoupons: 0,
      totalRevenue: 0
    }
  }
}

export async function getMerchantStats(merchantId) {
  try {
    const [
      { count: totalDeals },
      { count: activeDeals },
      { count: totalCoupons },
      { count: usedCoupons }
    ] = await Promise.all([
      supabaseAdmin.from('deals').select('*', { count: 'exact', head: true }).eq('merchant_id', merchantId),
      supabaseAdmin.from('deals').select('*', { count: 'exact', head: true }).eq('merchant_id', merchantId).eq('is_active', true),
      supabaseAdmin.from('claimed_coupons').select('*, deals!inner(merchant_id)', { count: 'exact', head: true }).eq('deals.merchant_id', merchantId),
      supabaseAdmin.from('claimed_coupons').select('*, deals!inner(merchant_id)', { count: 'exact', head: true }).eq('deals.merchant_id', merchantId).eq('status', 'used')
    ])
    
    // Get earnings data
    const { data: earningsData } = await supabaseAdmin
      .from('claimed_coupons')
      .select(`
        original_price,
        final_price,
        deals!inner(merchant_id)
      `)
      .eq('deals.merchant_id', merchantId)
      .eq('status', 'used')
    
    const totalEarnings = earningsData?.reduce((sum, coupon) => {
      return sum + (coupon.final_price * 0.9) // 90% to merchant (10% to Qreeb)
    }, 0) || 0
    
    return {
      totalDeals: totalDeals || 0,
      activeDeals: activeDeals || 0,
      totalCoupons: totalCoupons || 0,
      usedCoupons: usedCoupons || 0,
      totalEarnings: totalEarnings,
      conversionRate: totalCoupons > 0 ? (usedCoupons / totalCoupons * 100) : 0
    }
  } catch (error) {
    console.error('Error fetching merchant stats:', error)
    return {
      totalDeals: 0,
      activeDeals: 0,
      totalCoupons: 0,
      usedCoupons: 0,
      totalEarnings: 0,
      conversionRate: 0
    }
  }
}

// Payouts functions
export async function createPayout(payout) {
  const { data, error } = await supabaseAdmin
    .from('payouts')
    .insert({
      merchant_id: payout.merchantId,
      amount: payout.amount,
      wejha_commission: payout.wejhaCommission,
      net_amount: payout.netAmount,
      bank_name: payout.bankName,
      iban: payout.iban,
      scheduled_date: payout.scheduledDate,
      status: 'pending',
      created_at: new Date().toISOString()
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getPayouts(merchantId = null) {
  let query = supabaseAdmin
    .from('payouts')
    .select(`
      *,
      merchants (
        name,
        bank_name,
        iban
      )
    `)
  
  if (merchantId) {
    query = query.eq('merchant_id', merchantId)
  }
  
  const { data, error } = await query.order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function updatePayoutStatus(id, status, paidDate = null) {
  const updateData = {
    status: status,
    updated_at: new Date().toISOString()
  }
  
  if (paidDate) {
    updateData.paid_date = paidDate
  }
  
  const { data, error } = await supabaseAdmin
    .from('payouts')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Complaints functions
export async function createComplaint(complaint) {
  const { data, error } = await supabaseAdmin
    .from('complaints')
    .insert({
      type: complaint.type,
      title: complaint.title,
      description: complaint.description,
      reporter_phone: complaint.reporterPhone,
      reporter_name: complaint.reporterName,
      target_merchant_id: complaint.targetMerchantId,
      target_coupon_id: complaint.targetCouponId,
      priority: complaint.priority || 'medium',
      status: 'open',
      created_at: new Date().toISOString()
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getComplaints() {
  const { data, error } = await supabaseAdmin
    .from('complaints')
    .select(`
      *,
      merchants (name),
      claimed_coupons (coupon_code),
      admin_users (name)
    `)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function updateComplaint(id, updates) {
  const { data, error } = await supabaseAdmin
    .from('complaints')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Database Functions (to be created in Supabase)
export const createDatabaseFunctions = () => `
-- Function to decrement remaining coupons
CREATE OR REPLACE FUNCTION decrement_remaining_coupons(deal_id UUID, quantity INTEGER DEFAULT 1)
RETURNS VOID AS $$
BEGIN
  UPDATE deals 
  SET remaining_coupons = GREATEST(0, remaining_coupons - quantity)
  WHERE id = deal_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment merchant deals count
CREATE OR REPLACE FUNCTION increment_merchant_deals(merchant_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE merchants 
  SET deals_count = deals_count + 1
  WHERE id = merchant_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update category counts
CREATE OR REPLACE FUNCTION update_category_counts()
RETURNS VOID AS $$
BEGIN
  UPDATE categories 
  SET 
    merchants_count = (
      SELECT COUNT(*) 
      FROM merchants 
      WHERE category_id = categories.id AND status = 'active'
    ),
    deals_count = (
      SELECT COUNT(*) 
      FROM deals d
      JOIN merchants m ON d.merchant_id = m.id
      WHERE m.category_id = categories.id AND d.is_active = true
    );
END;
$$ LANGUAGE plpgsql;
`
// ============================================================================
// Real Database Functions - إدارة قاعدة البيانات الحقيقية
// ============================================================================

// إضافة فئة جديدة
export async function createCategory(categoryData) {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert([{
        name: categoryData.name,
        name_ar: categoryData.name_ar || categoryData.name,
        name_en: categoryData.name_en || categoryData.name,
        description: categoryData.description || '',
        icon_url: categoryData.icon_url || '',
        is_featured: categoryData.is_featured || false
      }])
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error creating category:', error)
    return { data: null, error: error.message }
  }
}

// تحديث فئة
export async function updateCategory(categoryId, categoryData) {
  try {
    const { data, error } = await supabase
      .from('categories')
      .update(categoryData)
      .eq('id', categoryId)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error updating category:', error)
    return { data: null, error: error.message }
  }
}

// حذف فئة
export async function deleteCategory(categoryId) {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId)

    if (error) throw