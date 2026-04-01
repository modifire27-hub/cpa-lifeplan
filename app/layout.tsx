import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CPA LifePlan | AI 재무 건강검진',
  description: '회계사가 직접 설계한 AI 재무진단. 3분 만에 나의 재무 건강 등급을 확인하세요.',
  openGraph: {
    title: 'CPA LifePlan | AI 재무 건강검진',
    description: '회계사가 직접 설계한 AI 재무진단. 3분 만에 나의 재무 건강 등급을 확인하세요.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#FFFFFF" />
      </head>
      <body className="min-h-screen">
        <div className="mx-auto max-w-lg min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
}
