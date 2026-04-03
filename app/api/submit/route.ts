// app/api/submit/route.ts
import { NextRequest, NextResponse } from 'next/server'

const GAS_URL = process.env.GOOGLE_SCRIPT_URL || ''


export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (!GAS_URL) {
      return NextResponse.json({ success: false, error: 'GAS URL 미설정' }, { status: 500 })
    }

    const res = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'save_only', ...body }),
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ success: false, error: text }, { status: 500 })
    }

    const result = await res.json()
    return NextResponse.json({ success: true, result })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
