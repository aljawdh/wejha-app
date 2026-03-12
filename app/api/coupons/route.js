import { NextResponse } from 'next/server'
import { claimCoupon, getUserCoupons, updateCouponStatus, getCouponByCode } from '@/lib/supabase-admin'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userPhone = searchParams.get('userPhone')
    const couponCode = searchParams.get('code')
    const status = searchParams.get('status')
    
    // Get coupon by code (for merchant verification)
    if (couponCode) {
      const coupon = await getCouponByCode(couponCode)
      if (!coupon) {
        return NextResponse.json({ success: false, error: 'Coupon not found' }, { status: 404 })
      }
      return NextResponse.json({ success: true, data: coupon })
    }

    // Get user coupons
    if (!userPhone) {
      return NextResponse.json({ success: false, error: 'User phone required' }, { status: 400 })
    }
    
    const coupons = await getUserCoupons(userPhone, status)
    
    // Transform coupons for frontend
    const transformedCoupons = coupons.map(coupon => ({
      id: coupon.id,
      dealId: coupon.deal_id,
      title: coupon.deals?.title || 'عرض خاص',
      titleEn: coupon.deals?.title_en,
      merchant: coupon.merchants?.name || 'متجر',
      merchantEn: coupon.merchants?.name_en,
      originalPrice: coupon.original_price,
      finalPrice: coupon.final_price,
      discountPercent: coupon.discount_percent,
      savingsAmount: coupon.savings_amount,
      quantity: coupon.quantity,
      code: coupon.coupon_code,
      status: coupon.status,
      expiresAt: coupon.expires_at,
      claimedAt: coupon.claimed_at,
      usedAt: coupon.used_at,
      qrCodeData: coupon.qr_code_data,
      barcodeData: coupon.barcode_data,
      merchantLogo: coupon.merchants?.logo_url,
      dealType: coupon.deals?.deal_type
    }))

    return NextResponse.json({
      success: true,
      data: transformedCoupons,
      count: transformedCoupons.length
    })
  } catch (error) {
    console.error('Coupons GET error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch coupons' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const couponData = await request.json()
    
    const requiredFields = ['dealId', 'userPhone', 'merchantId', 'originalPrice', 'finalPrice', 'discountPercent', 'expiresAt']
    const missingFields = requiredFields.filter(field => !couponData[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        missingFields: missingFields
      }, { status: 400 })
    }

    // Validate expiry date
    if (new Date(couponData.expiresAt) <= new Date()) {
      return NextResponse.json({
        success: false,
        error: 'Cannot claim expired deal'
      }, { status: 400 })
    }

    const newCoupon = await claimCoupon(couponData)
    
    // Transform for frontend
    const transformedCoupon = {
      id: newCoupon.id,
      dealId: newCoupon.deal_id,
      code: newCoupon.coupon_code,
      originalPrice: newCoupon.original_price,
      finalPrice: newCoupon.final_price,
      discountPercent: newCoupon.discount_percent,
      savingsAmount: newCoupon.savings_amount,
      quantity: newCoupon.quantity,
      status: newCoupon.status,
      expiresAt: newCoupon.expires_at,
      claimedAt: newCoupon.claimed_at,
      qrCodeData: newCoupon.qr_code_data,
      barcodeData: newCoupon.barcode_data
    }
    
    return NextResponse.json({
      success: true,
      data: transformedCoupon,
      message: 'Coupon claimed successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Coupons POST error:', error)
    
    if (error.message.includes('remaining_coupons')) {
      return NextResponse.json({
        success: false,
        error: 'No more coupons available for this deal'
      }, { status: 409 })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to claim coupon',
      message: error.message
    }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const { id, status, usedAt, staffId, notes } = await request.json()
    
    if (!id || !status) {
      return NextResponse.json({
        success: false,
        error: 'Coupon ID and status required'
      }, { status: 400 })
    }

    // Validate status
    const validStatuses = ['active', 'used', 'expired', 'cancelled', 'refunded']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid status',
        validStatuses: validStatuses
      }, { status: 400 })
    }
    
    const updatedCoupon = await updateCouponStatus(id, status, usedAt, staffId, notes)
    
    return NextResponse.json({
      success: true,
      data: updatedCoupon,
      message: `Coupon ${status} successfully`
    })
  } catch (error) {
    console.error('Coupons PUT error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update coupon',
      message: error.message
    }, { status: 500 })
  }
}
