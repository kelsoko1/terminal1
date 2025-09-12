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

export async function GET() {
  try {
    // Return all active funds
    const activeFunds = funds.filter(fund => fund.isActive)
    return NextResponse.json(activeFunds, { status: 200 })
  } catch (error) {
    console.error('Error fetching funds:', error)
    return NextResponse.json({ error: 'Failed to fetch funds' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const fundData = await req.json()
    
    // Validate required fields
    if (!fundData.name || !fundData.manager) {
      return NextResponse.json({ error: 'Missing required fields: name and manager' }, { status: 400 })
    }
    
    // Create new fund
    const newFund = {
      id: (funds.length + 1).toString(),
      ...fundData,
      isActive: true,
      createdAt: new Date().toISOString()
    }
    
    funds.push(newFund)
    
    return NextResponse.json(newFund, { status: 201 })
  } catch (error) {
    console.error('Error creating fund:', error)
    return NextResponse.json({ error: 'Failed to create fund' }, { status: 500 })
  }
}
