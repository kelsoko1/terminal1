import { NextRequest, NextResponse } from 'next/server'

// In-memory store for demonstration - replace with actual database
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

export async function GET() {
  try {
    // Return all active bonds
    const activeBonds = bonds.filter(bond => bond.isActive)
    return NextResponse.json(activeBonds, { status: 200 })
  } catch (error) {
    console.error('Error fetching bonds:', error)
    return NextResponse.json({ error: 'Failed to fetch bonds' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const bondData = await req.json()
    
    // Validate required fields
    if (!bondData.name || !bondData.issuer || !bondData.bondNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Create new bond
    const newBond = {
      id: (bonds.length + 1).toString(),
      ...bondData,
      isActive: true,
      createdAt: new Date().toISOString()
    }
    
    bonds.push(newBond)
    
    return NextResponse.json(newBond, { status: 201 })
  } catch (error) {
    console.error('Error creating bond:', error)
    return NextResponse.json({ error: 'Failed to create bond' }, { status: 500 })
  }
}
