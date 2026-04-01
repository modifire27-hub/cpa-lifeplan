import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const scriptUrl = process.env.GOOGLE_SCRIPT_URL

    console.log('=== SUBMIT API ===')
    console.log('Script URL:', scriptUrl ? '있음' : '없음')

    if (!scriptUrl) {
      console.log('ERROR: Google Script URL 미설정')
      return NextResponse.json({ error: 'Google Script URL 미설정' }, { status: 500 })
    }

    const payload = {
      type: 'save_only',
      diagData: data,
      contact: {
        name: data.contactName,
        phone: data.contactPhone,
        email: data.contactEmail,
      },
    }

    console.log('전송 데이터:', JSON.stringify(payload).substring(0, 200))

    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const responseText = await response.text()
    console.log('Apps Script 응답:', responseText)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('접수 오류:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
