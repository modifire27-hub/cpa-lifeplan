'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.5, ease: [0, 0, 0.58, 1] as const },
  }),
}

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 상단 헤더 */}
      <header className="px-6 py-4 flex items-center gap-3">
        <div className="w-9 h-9 bg-[#3182F6] rounded-xl flex items-center justify-center">
          <span className="text-white text-sm font-bold">LP</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[18px] font-bold text-[#1B2A4A] leading-tight">LifePlan</span>
          <span className="text-[11px] text-[#8B95A1] leading-tight">CPA 이흥준 회계사</span>
        </div>
      </header>

      {/* 히어로 섹션 */}
      <main className="flex-1 px-6">
        <section className="pt-10 pb-16">
          <motion.p
            custom={0}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-[15px] text-[#3182F6] font-semibold mb-3"
          >
            회계사가 만든 AI 재무설계 진단
          </motion.p>

          <motion.h1
            custom={1}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-[32px] leading-[1.3] font-bold text-[#1B2A4A] mb-4"
          >
            내 재무 건강,<br />
            몇 등급인지<br />
            궁금하지 않으세요?
          </motion.h1>

          <motion.p
            custom={2}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-[16px] leading-[1.6] text-[#6B7684] mb-10"
          >
            3분이면 충분합니다.<br />
            같은 나이대 상위 몇 %인지 바로 확인하세요.
          </motion.p>

          {/* 미리보기 카드 */}
          <motion.div
            custom={3}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="bg-[#F9FAFB] rounded-[20px] p-6 mb-10"
          >
            <div className="flex items-center justify-between mb-6">
              <span className="text-[14px] text-[#8B95A1]">재무설계 진단 리포트 미리보기</span>
              <span className="text-[12px] text-[#B0B8C1]">샘플</span>
            </div>

            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-[#3182F6] rounded-full mb-3">
                <span className="text-[36px] font-bold text-white">A</span>
              </div>
              <p className="text-[20px] font-semibold text-[#1B2A4A]">상위 15%</p>
              <p className="text-[14px] text-[#8B95A1]">같은 40대 중</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: '순자산', value: '상위 20%' },
                { label: '저축률', value: '상위 12%' },
                { label: '부채관리', value: '양호' },
              ].map((item) => (
                <div key={item.label} className="bg-white rounded-[12px] p-3 text-center shadow-sm">
                  <p className="text-[12px] text-[#8B95A1] mb-1">{item.label}</p>
                  <p className="text-[14px] font-semibold text-[#3182F6]">{item.value}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* 진단 항목 소개 */}
          <motion.div
            custom={4}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mb-10"
          >
            <p className="text-[13px] text-[#8B95A1] font-semibold mb-4">진단 항목</p>
            <div className="space-y-5">
              {[
                {
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" />
                    </svg>
                  ),
                  title: '동일 연령대 비교 분석',
                  desc: '통계청 데이터 기반, 내 위치를 정확히 알려드려요',
                },
                {
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                    </svg>
                  ),
                  title: '자산·부채·현금흐름 진단',
                  desc: '순자산, 저축률, 부채비율을 종합 분석합니다',
                },
                {
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  ),
                  title: '목표 달성 시뮬레이션',
                  desc: '결혼, 교육, 은퇴 — 목표까지 얼마나 남았는지',
                },
                {
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  ),
                  title: 'CPA·CFP가 설계한 진단 로직',
                  desc: '회계사·국제공인재무설계사 이흥준이 직접 설계',
                },
              ].map((feature) => (
                <div key={feature.title} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#1B2A4A] rounded-xl flex items-center justify-center shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <p className="text-[16px] font-semibold text-[#1B2A4A]">{feature.title}</p>
                    <p className="text-[14px] text-[#8B95A1] mt-0.5">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* 전문가 소개 */}
          <motion.div
            custom={5}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="bg-[#F9FAFB] rounded-[16px] p-5 mb-8"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-[#1B2A4A] rounded-full flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div>
                <p className="text-[16px] font-semibold text-[#1B2A4A]">이흥준 회계사</p>
                <p className="text-[12px] text-[#8B95A1]">CPA · CTA · CFP 국제공인재무설계사</p>
              </div>
            </div>
            <p className="text-[14px] text-[#6B7684] leading-[1.6]">
              &ldquo;열심히 번 돈이 정작 필요한 시점에 부족하여 인생의 행복을 놓치는 분들을 너무 많이 보았습니다.
              지금 시작하십시오.&rdquo;
            </p>
          </motion.div>

        </section>
      </main>

      {/* 하단 CTA 버튼 */}
      <div className="sticky bottom-0 px-6 py-4 bg-white border-t border-[#F2F4F6] safe-area-bottom">
        <motion.button
          custom={6}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push('/diagnosis')}
          className="w-full py-4 bg-[#3182F6] text-white text-[17px] font-semibold rounded-[16px]
                     hover:bg-[#1B64DA] active:bg-[#0A4ABF] transition-colors"
        >
          무료 재무설계 진단 시작하기
        </motion.button>
        <p className="text-center text-[12px] text-[#B0B8C1] mt-2">
          약 3~5분 소요 · 비용 없음 · 개인정보 안전 보호
        </p>
      </div>
    </div>
  )
}
