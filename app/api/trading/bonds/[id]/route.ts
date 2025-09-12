import { NextRequest, NextResponse } from 'next/server'

// Import the bonds array from the main route
// In a real application, this would be a database
let bonds: any[] = [
  {
    id: '1',
    bondNumber: 'TZB001',
    name: 'Tanzania Government Bond 2025',
    issuer: 'Government of Tanzania',
    couponRate: 12.5,
    maturityDate: '2025-12-31',
    faceValue: 1000000,
    price: 985000,
    yieldToMaturity: 13.2,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    bondNumber: 'TZB002',
    name: 'Tanzania Government Bond 2027',
    issuer: 'Government of Tanzania',
    couponRate: 15.0,
    maturityDate: '2027-06-30',
    faceValue: 1000000,
    price: 1020000,
    yieldToMaturity: 14.1,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    bondNumber: 'TZB003',
    name: 'Infrastructure Development Bond',
    issuer: 'Tanzania Investment Bank',
    couponRate: 11.8,
    maturityDate: '2026-03-15',
    faceValue: 500000,
    price: 492500,
    yieldToMaturity: 12.5,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    bondNumber: 'TZB004',
    name: 'Corporate Bond - NMB Bank',
    issuer: 'NMB Bank',
    couponRate: 13.5,
    maturityDate: '2024-12-31',
    faceValue: 1000000,
    price: 995000,
    yieldToMaturity: 14.2,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '5',
    bondNumber: 'TZB005',
    name: 'Energy Sector Bond',
    issuer: 'Tanzania Electric Supply Company',
    couponRate: 14.2,
    maturityDate: '2028-09-30',
    faceValue: 2000000,
    price: 1980000,
    yieldToMaturity: 14.8,
    isActive: true,
    createdAt: new Date().toISOString()
  }
]

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    
    const bond = bonds.find(b => b.id === id && b.isActive)
    
    if (!bond) {
      return NextResponse.json({ error: 'Bond not found' }, { status: 404 })
    }
    
    return NextResponse.json(bond, { status: 200 })
  } catch (error) {
    console.error('Error fetching bond:', error)
    return NextResponse.json({ error: 'Failed to fetch bond' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const bondData = await req.json()
    
    const bondIndex = bonds.findIndex(b => b.id === id)
    
    if (bondIndex === -1) {
      return NextResponse.json({ error: 'Bond not found' }, { status: 404 })
    }
    
    // Update bond
    bonds[bondIndex] = {
      ...bonds[bondIndex],
      ...bondData,
      id, // Preserve the original ID
      updatedAt: new Date().toISOString()
    }
    
    return NextResponse.json(bonds[bondIndex], { status: 200 })
  } catch (error) {
    console.error('Error updating bond:', error)
    return NextResponse.json({ error: 'Failed to update bond' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    
    const bondIndex = bonds.findIndex(b => b.id === id)
    
    if (bondIndex === -1) {
      return NextResponse.json({ error: 'Bond not found' }, { status: 404 })
    }
    
    // Soft delete by setting isActive to false
    bonds[bondIndex].isActive = false
    bonds[bondIndex].deletedAt = new Date().toISOString()
    
    return NextResponse.json({ message: 'Bond deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting bond:', error)
    return NextResponse.json({ error: 'Failed to delete bond' }, { status: 500 })
  }
}
