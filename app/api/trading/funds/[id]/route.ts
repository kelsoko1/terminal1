import { NextRequest, NextResponse } from 'next/server'

// In-memory store for demonstration - replace with actual database
let funds: any[] = [
  {
    id: '1',
    name: 'Tanzania Equity Fund',
    manager: 'CRDB Asset Management',
    nav: 1250.75,
    aum: 25000000000, // 25 billion TZS
    minInvestment: 100000, // 100,000 TZS
    oneMonthReturn: 2.5,
    threeMonthReturn: 7.8,
    oneYearReturn: 15.2,
    inceptionDate: '2020-01-15',
    isActive: true,
    description: 'Invests primarily in DSE-listed equities with focus on large-cap stocks',
    riskLevel: 'High',
    managementFee: 2.5,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Tanzania Bond Fund',
    manager: 'NMB Capital',
    nav: 1150.40,
    aum: 18500000000, // 18.5 billion TZS
    minInvestment: 50000, // 50,000 TZS
    oneMonthReturn: 1.2,
    threeMonthReturn: 3.5,
    oneYearReturn: 11.8,
    inceptionDate: '2019-06-01',
    isActive: true,
    description: 'Invests in government and corporate bonds with focus on capital preservation',
    riskLevel: 'Medium',
    managementFee: 1.8,
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Tanzania Money Market Fund',
    manager: 'Stanbic Asset Management',
    nav: 1085.25,
    aum: 12000000000, // 12 billion TZS
    minInvestment: 25000, // 25,000 TZS
    oneMonthReturn: 0.8,
    threeMonthReturn: 2.4,
    oneYearReturn: 9.5,
    inceptionDate: '2021-03-01',
    isActive: true,
    description: 'Invests in short-term money market instruments and treasury bills',
    riskLevel: 'Low',
    managementFee: 1.0,
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'East Africa Growth Fund',
    manager: 'Orbit Securities',
    nav: 1380.90,
    aum: 8500000000, // 8.5 billion TZS
    minInvestment: 200000, // 200,000 TZS
    oneMonthReturn: 3.2,
    threeMonthReturn: 9.1,
    oneYearReturn: 18.5,
    inceptionDate: '2018-09-15',
    isActive: true,
    description: 'Regional fund investing in growth companies across East Africa',
    riskLevel: 'High',
    managementFee: 3.0,
    createdAt: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Tanzania Balanced Fund',
    manager: 'CRDB Asset Management',
    nav: 1195.60,
    aum: 15200000000, // 15.2 billion TZS
    minInvestment: 75000, // 75,000 TZS
    oneMonthReturn: 1.8,
    threeMonthReturn: 5.2,
    oneYearReturn: 13.1,
    inceptionDate: '2020-11-01',
    isActive: true,
    description: 'Balanced portfolio of equities, bonds, and money market instruments',
    riskLevel: 'Medium',
    managementFee: 2.0,
    createdAt: new Date().toISOString()
  },
  {
    id: '6',
    name: 'Tanzania Islamic Fund',
    manager: 'Amana Bank Asset Management',
    nav: 1125.35,
    aum: 6800000000, // 6.8 billion TZS
    minInvestment: 100000, // 100,000 TZS
    oneMonthReturn: 1.5,
    threeMonthReturn: 4.8,
    oneYearReturn: 12.3,
    inceptionDate: '2021-07-01',
    isActive: true,
    description: 'Sharia-compliant investments in halal stocks and sukuk bonds',
    riskLevel: 'Medium',
    managementFee: 2.2,
    createdAt: new Date().toISOString()
  }
]

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    
    const fund = funds.find(f => f.id === id && f.isActive)
    
    if (!fund) {
      return NextResponse.json({ error: 'Fund not found' }, { status: 404 })
    }
    
    return NextResponse.json(fund, { status: 200 })
  } catch (error) {
    console.error('Error fetching fund:', error)
    return NextResponse.json({ error: 'Failed to fetch fund' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const fundData = await req.json()
    
    const fundIndex = funds.findIndex(f => f.id === id)
    
    if (fundIndex === -1) {
      return NextResponse.json({ error: 'Fund not found' }, { status: 404 })
    }
    
    // Update fund
    funds[fundIndex] = {
      ...funds[fundIndex],
      ...fundData,
      id, // Preserve the original ID
      updatedAt: new Date().toISOString()
    }
    
    return NextResponse.json(funds[fundIndex], { status: 200 })
  } catch (error) {
    console.error('Error updating fund:', error)
    return NextResponse.json({ error: 'Failed to update fund' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    
    const fundIndex = funds.findIndex(f => f.id === id)
    
    if (fundIndex === -1) {
      return NextResponse.json({ error: 'Fund not found' }, { status: 404 })
    }
    
    // Soft delete by setting isActive to false
    funds[fundIndex].isActive = false
    funds[fundIndex].deletedAt = new Date().toISOString()
    
    return NextResponse.json({ message: 'Fund deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting fund:', error)
    return NextResponse.json({ error: 'Failed to delete fund' }, { status: 500 })
  }
}
