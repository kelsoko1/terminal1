import { NextRequest, NextResponse } from 'next/server'

let auditLogs: any[] = []

export async function POST(req: NextRequest) {
  const data = await req.json()
  auditLogs.push({ ...data, timestamp: new Date().toISOString() })
  return NextResponse.json({ success: true })
}

export async function GET() {
  return NextResponse.json({ auditLogs })
} 