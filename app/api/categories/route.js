import { NextResponse } from 'next/server'
import { 
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '@/lib/supabase-admin'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const includeHidden = searchParams.get('includeHidden') === 'true'
    const featured = searchParams.get('featured')
    
    let categories = await getCategories(includeHidden)

    if (featured !== null) {
      categories = categories.filter(cat => cat.is_featured === (featured === 'true'))
    }

    return NextResponse.json({
      success: true,
      data: categories,
      count: categories.length
    })
  } catch (error) {
    console.error('Categories GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories', message: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const category = await request.json()
    
    if (!category.name || !category.emoji) {
      return NextResponse.json(
        { success: false, error: 'Name and emoji are required' },
        { status: 400 }
      )
    }

    const newCategory = await createCategory(category)
    
    return NextResponse.json({
      success: true,
      data: newCategory,
      message: 'Category created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Categories POST error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create category', message: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request) {
  try {
    const { id, ...category } = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Category ID required' },
        { status: 400 }
      )
    }
    
    const updatedCategory = await updateCategory(id, category)
    
    return NextResponse.json({
      success: true,
      data: updatedCategory,
      message: 'Category updated successfully'
    })
  } catch (error) {
    console.error('Categories PUT error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update category', message: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Category ID required' },
        { status: 400 }
      )
    }
    
    await deleteCategory(id)
    
    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    })
  } catch (error) {
    console.error('Categories DELETE error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete category', message: error.message },
      { status: 500 }
    )
  }
}
