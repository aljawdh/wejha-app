import { NextResponse } from 'next/server'
import { getDeals, getDealById, createDeal, updateDeal, deleteDeal } from '@/lib/supabase-admin'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const dealId = searchParams.get('id')
    
    if (dealId) {
      const deal = await getDealById(dealId)
      if (!deal) {
        return NextResponse.json({ success: false, error: 'Deal not found' }, { status: 404 })
      }
      return NextResponse.json({ success: true, data: deal })
    }

    const filters = {
      merchantId: searchParams.get('merchantId'),
      isPublic: searchParams.get('public') === 'true',
      category: searchParams.get('category'),
      featured: searchParams.get('featured') === 'true' ? true : searchParams.get('featured') === 'false' ? false : undefined,
      city: searchParams.get('city')
    }

    Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key])
    const deals = await getDeals(filters)

    return NextResponse.json({ success: true, data: deals, count: deals.length })
  } catch (error) {
    console.error('Deals GET error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch deals' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const deal = await request.json()
    
    const requiredFields = ['merchantId', 'title', 'originalPrice', 'discountPercent', 'finalPrice', 'expiresAt']
    const missingFields = requiredFields.filter(field => !deal[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json({ success: false, error: 'Missing required fields', missingFields }, { status: 400 })
    }

    if (Number(deal.finalPrice) >= Number(deal.originalPrice)) {
      return NextResponse.json({ success: false, error: 'Final price must be less than original price' }, { status: 400 })
    }

    const newDeal = await createDeal(deal)
    return NextResponse.json({ success: true, data: newDeal }, { status: 201 })
  } catch (error) {
    console.error('Deals POST error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create deal' }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const { id, ...deal } = await request.json()
    if (!id) return NextResponse.json({ success: false, error: 'Deal ID required' }, { status: 400 })
    
    const updatedDeal = await updateDeal(id, deal)
    return NextResponse.json({ success: true, data: updatedDeal })
  } catch (error) {
    console.error('Deals PUT error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update deal' }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, error: 'Deal ID required' }, { status: 400 })
    
    await deleteDeal(id)
    return NextResponse.json({ success: true, message: 'Deal deleted successfully' })
  } catch (error) {
    console.error('Deals DELETE error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete deal' }, { status: 500 })
  }
}
