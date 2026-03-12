import { NextResponse } from 'next/server'
import { getMerchants, getMerchantById, createMerchant, updateMerchant, updateMerchantStatus } from '@/lib/supabase-admin'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const merchantId = searchParams.get('id')
    
    if (merchantId) {
      const merchant = await getMerchantById(merchantId)
      if (!merchant) {
        return NextResponse.json({ success: false, error: 'Merchant not found' }, { status: 404 })
      }
      return NextResponse.json({ success: true, data: merchant })
    }

    const filters = {
      status: searchParams.get('status'),
      city: searchParams.get('city'),
      categoryId: searchParams.get('categoryId'),
      verified: searchParams.get('verified') === 'true' ? true : searchParams.get('verified') === 'false' ? false : undefined
    }

    Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key])
    const merchants = await getMerchants(filters)

    return NextResponse.json({ success: true, data: merchants, count: merchants.length })
  } catch (error) {
    console.error('Merchants GET error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch merchants' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const merchant = await request.json()
    
    const requiredFields = ['name', 'email', 'phone', 'ownerName']
    const missingFields = requiredFields.filter(field => !merchant[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json({ success: false, error: 'Missing required fields', missingFields }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(merchant.email)) {
      return NextResponse.json({ success: false, error: 'Invalid email format' }, { status: 400 })
    }

    const newMerchant = await createMerchant(merchant)
    return NextResponse.json({ success: true, data: newMerchant }, { status: 201 })
  } catch (error) {
    console.error('Merchants POST error:', error)
    if (error.message.includes('duplicate key')) {
      return NextResponse.json({ success: false, error: 'Email already exists' }, { status: 409 })
    }
    return NextResponse.json({ success: false, error: 'Failed to create merchant' }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const data = await request.json()
    
    if (!data.id) {
      return NextResponse.json({ success: false, error: 'Merchant ID required' }, { status: 400 })
    }

    // Handle status updates specifically
    if (data.status && Object.keys(data).length <= 3) { // id, status, verificationStatus
      const updatedMerchant = await updateMerchantStatus(data.id, data.status, data.verificationStatus)
      return NextResponse.json({
        success: true,
        data: updatedMerchant,
        message: `Merchant status updated to ${data.status}`
      })
    }

    // Handle full merchant updates
    const { id, ...merchant } = data
    const updatedMerchant = await updateMerchant(id, merchant)
    
    return NextResponse.json({
      success: true,
      data: updatedMerchant,
      message: 'Merchant updated successfully'
    })
  } catch (error) {
    console.error('Merchants PUT error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update merchant' }, { status: 500 })
  }
}
