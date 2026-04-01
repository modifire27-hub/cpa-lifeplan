import { NextRequest, NextResponse } from 'next/server'
import { analyzeFinancial } from '@/lib/gemini'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const scriptUrl = process.env.GOOGLE_SCRIPT_URL

    if (!scriptUrl) {
      return NextResponse.json({ error: 'Google Script URL 미설정' }, { status: 500 })
    }

    // AI 분석 실행
    const result = await analyzeFinancial(data)

    // Apps Script로 AI 결과 전송 → 관리자 이메일 발송
    await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'analyze_result',
        diagData: data,
        contact: {
          name: data.contactName,
          phone: data.contactPhone,
          email: data.contactEmail,
        },
        result: result,
      }),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('분석 오류:', error)
    return NextResponse.json({ error: '분석 실패' }, { status: 500 })
  }
}