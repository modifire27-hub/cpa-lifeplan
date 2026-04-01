import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const scriptUrl = process.env.GOOGLE_SCRIPT_URL
    if (!scriptUrl) {
      return NextResponse.json(
        { error: 'Google Script URL이 설정되지 않았습니다.' },
        { status: 500 }
      )
    }

    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    return NextResponse.json(result)
  } catch (error) {
    console.error('리포트 전송 오류:', error)
    return NextResponse.json(
      { error: '전송 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}