'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

// ──────────────────────────────────────
// 애니메이션
// ──────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.5, ease: [0, 0, 0.58, 1] as const },
  }),
}

// ──────────────────────────────────────
// 등급별 색상
// ──────────────────────────────────────
function gradeColor(grade: string) {
  if (grade.startsWith('A')) return '#3182F6'
  if (grade.startsWith('B')) return '#34C759'
  if (grade.startsWith('C')) return '#FF9500'
  return '#E5503C'
}

function gradeEmoji(grade: string) {
  if (grade === 'A+') return '최우수'
  if (grade === 'A') return '우수'
  if (grade === 'B+') return '양호'
  if (grade === 'B') return '보통 이상'
  if (grade === 'C+') return '보통'
  if (grade === 'C') return '개선 필요'
  return '관리 시급'
}

// ──────────────────────────────────────
// 점수 바 컴포넌트
// ──────────────────────────────────────
function ScoreBar({ label, score, comment, color }: { label: string; score: number; comment: string; color: string }) {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const timer = setTimeout(() => setWidth(score), 300)
    return () => clearTimeout(timer)
  }, [score])

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-[14px] font-medium text-[#1B2A4A]">{label}</span>
        <span className="text-[14px] font-bold" style={{ color }}>{score}점</span>
      </div>
      <div className="h-2 bg-[#F2F4F6] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${width}%`, backgroundColor: color }}
        />
      </div>
      <p className="text-[12px] text-[#8B95A1]">{comment}</p>
    </div>
  )
}

// ──────────────────────────────────────
// 도넛 차트 (SVG)
// ──────────────────────────────────────
function DonutChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  if (total === 0) return null

  let cumulative = 0
  const size = 160
  const strokeWidth = 28
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {data.filter(d => d.value > 0).map((d, i) => {
          const ratio = d.value / total
          const dashArray = `${circumference * ratio} ${circumference * (1 - ratio)}`
          const rotation = -90 + (cumulative / total) * 360
          cumulative += d.value
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={d.color}
              strokeWidth={strokeWidth}
              strokeDasharray={dashArray}
              transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
            />
          )
        })}
        <text x={size / 2} y={size / 2 - 6} textAnchor="middle" className="text-[12px] fill-[#8B95A1]">총액</text>
        <text x={size / 2} y={size / 2 + 14} textAnchor="middle" className="text-[16px] font-bold fill-[#1B2A4A]">{total.toLocaleString()}</text>
      </svg>
      <div className="flex flex-wrap justify-center gap-3 mt-3">
        {data.filter(d => d.value > 0).map((d, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="text-[12px] text-[#6B7684]">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ──────────────────────────────────────
// 목표 달성도 바
// ──────────────────────────────────────
function GoalBar({ goal }: { goal: any }) {
  const progress = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentSaved / goal.targetAmount) * 100)) : 0
  const achieveColor = goal.achievability === '달성가능' ? '#34C759' : goal.achievability === '노력필요' ? '#FF9500' : '#E5503C'

  return (
    <div className="bg-[#F9FAFB] rounded-[16px] p-4 space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-[15px] font-semibold text-[#1B2A4A]">{goal.goalType}</span>
        <span className="text-[13px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: achieveColor + '20', color: achieveColor }}>
          {goal.achievability}
        </span>
      </div>
      <div className="flex justify-between text-[13px] text-[#8B95A1]">
        <span>현재 {goal.currentSaved?.toLocaleString() || 0}만원</span>
        <span>목표 {goal.targetAmount?.toLocaleString() || 0}만원</span>
      </div>
      <div className="h-2.5 bg-[#E5E8EB] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${progress}%`, backgroundColor: achieveColor }} />
      </div>
      <div className="flex justify-between text-[13px]">
        <span className="text-[#8B95A1]">부족: <span className="font-medium text-[#E5503C]">{goal.gap?.toLocaleString() || 0}만원</span></span>
        <span className="text-[#8B95A1]">월 추가: <span className="font-medium text-[#3182F6]">{goal.monthlyNeeded?.toLocaleString() || 0}만원</span></span>
      </div>
      <p className="text-[13px] text-[#6B7684]">{goal.comment}</p>
    </div>
  )
}

// ──────────────────────────────────────
// 메인 결과 페이지
// ──────────────────────────────────────
export default function ResultPage() {
  const router = useRouter()
  const [result, setResult] = useState<any>(null)
  const [diagData, setDiagData] = useState<any>(null)
  const [showContact, setShowContact] = useState(false)
  const [contact, setContact] = useState({ name: '', phone: '', email: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    const savedResult = sessionStorage.getItem('diagnosisResult')
    const savedData = sessionStorage.getItem('diagnosisData')
    if (savedResult && savedData) {
      setResult(JSON.parse(savedResult))
      setDiagData(JSON.parse(savedData))
    } else {
      router.push('/')
    }
  }, [router])

  const handleSendReport = async () => {
    if (!contact.name || !contact.phone) {
      alert('이름과 연락처를 입력해주세요.')
      return
    }
    setSending(true)
    try {
      await fetch('/api/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact, result, diagData }),
      })
      setSent(true)
    } catch {
      alert('전송 중 오류가 발생했습니다.')
    } finally {
      setSending(false)
    }
  }

  if (!result) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-[#3182F6] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[15px] text-[#8B95A1]">결과를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  const gc = gradeColor(result.grade)
  const raw = result.rawData || {}

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 헤더 */}
      <header className="px-6 py-4 flex items-center gap-3 border-b border-[#F2F4F6]">
        <div className="w-9 h-9 bg-[#3182F6] rounded-xl flex items-center justify-center">
          <span className="text-white text-sm font-bold">LP</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[18px] font-bold text-[#1B2A4A] leading-tight">LifePlan</span>
          <span className="text-[11px] text-[#8B95A1] leading-tight">CPA 이흥준 회계사</span>
        </div>
      </header>

      <main className="flex-1 px-6 py-6 space-y-8">

        {/* ── 등급 카드 ── */}
        <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp} className="text-center py-8">
          <p className="text-[14px] text-[#8B95A1] mb-4">AI 재무설계 진단 결과</p>
          <div className="inline-flex items-center justify-center w-28 h-28 rounded-full mb-4" style={{ backgroundColor: gc + '15' }}>
            <span className="text-[48px] font-bold" style={{ color: gc }}>{result.grade}</span>
          </div>
          <p className="text-[22px] font-bold text-[#1B2A4A]">상위 {result.percentile}%</p>
          <p className="text-[15px] text-[#8B95A1] mt-1">{result.ageGroup} · {gradeEmoji(result.grade)}</p>
          <p className="text-[14px] text-[#6B7684] mt-3 px-4">{result.summary}</p>
        </motion.div>

        {/* ── 세부 점수 ── */}
        <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp} className="bg-[#F9FAFB] rounded-[20px] p-6 space-y-5">
          <h3 className="text-[17px] font-bold text-[#1B2A4A]">세부 진단 점수</h3>
          {result.scores && (
            <>
              <ScoreBar label="순자산" score={result.scores.netAsset?.score || 0} comment={result.scores.netAsset?.comment || ''} color="#3182F6" />
              <ScoreBar label="저축률" score={result.scores.savingsRate?.score || 0} comment={result.scores.savingsRate?.comment || ''} color="#34C759" />
              <ScoreBar label="부채 관리" score={result.scores.debtManagement?.score || 0} comment={result.scores.debtManagement?.comment || ''} color="#FF9500" />
              <ScoreBar label="투자 다양성" score={result.scores.investmentDiversity?.score || 0} comment={result.scores.investmentDiversity?.comment || ''} color="#5856D6" />
              <ScoreBar label="은퇴 준비" score={result.scores.retirementPrep?.score || 0} comment={result.scores.retirementPrep?.comment || ''} color="#FF2D55" />
            </>
          )}
        </motion.div>

        {/* ── 자산 구성 ── */}
        {raw.assetBreakdown && (
          <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp} className="bg-[#F9FAFB] rounded-[20px] p-6">
            <h3 className="text-[17px] font-bold text-[#1B2A4A] mb-4">자산 구성</h3>
            <DonutChart data={[
              { label: '예적금', value: raw.assetBreakdown.savings || 0, color: '#3182F6' },
              { label: '투자', value: raw.assetBreakdown.investments || 0, color: '#5856D6' },
              { label: '부동산', value: raw.assetBreakdown.realEstate || 0, color: '#34C759' },
              { label: '연금', value: raw.assetBreakdown.pension || 0, color: '#FF9500' },
              { label: '기타', value: raw.assetBreakdown.other || 0, color: '#8B95A1' },
            ]} />
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-[14px]">
                <span className="text-[#8B95A1]">총 자산</span>
                <span className="font-bold text-[#3182F6]">{(raw.totalAssets || 0).toLocaleString()}만원</span>
              </div>
              <div className="flex justify-between text-[14px]">
                <span className="text-[#8B95A1]">총 부채</span>
                <span className="font-bold text-[#E5503C]">{(raw.totalDebt || 0).toLocaleString()}만원</span>
              </div>
              <div className="flex justify-between text-[15px] pt-2 border-t border-[#E5E8EB]">
                <span className="font-semibold text-[#1B2A4A]">순자산</span>
                <span className="font-bold" style={{ color: (raw.netAsset || 0) >= 0 ? '#3182F6' : '#E5503C' }}>
                  {(raw.netAsset || 0).toLocaleString()}만원
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── 현금흐름 ── */}
        {result.cashFlowAnalysis && (
          <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp} className="bg-[#F9FAFB] rounded-[20px] p-6 space-y-4">
            <h3 className="text-[17px] font-bold text-[#1B2A4A]">월 현금흐름</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-[12px] p-3 text-center">
                <p className="text-[12px] text-[#8B95A1]">수입</p>
                <p className="text-[16px] font-bold text-[#3182F6]">{(result.cashFlowAnalysis.monthlyIncome || 0).toLocaleString()}만원</p>
              </div>
              <div className="bg-white rounded-[12px] p-3 text-center">
                <p className="text-[12px] text-[#8B95A1]">지출</p>
                <p className="text-[16px] font-bold text-[#E5503C]">{(result.cashFlowAnalysis.monthlyExpense || 0).toLocaleString()}만원</p>
              </div>
              <div className="bg-white rounded-[12px] p-3 text-center">
                <p className="text-[12px] text-[#8B95A1]">저축·투자</p>
                <p className="text-[16px] font-bold text-[#34C759]">{(result.cashFlowAnalysis.monthlySavings || 0).toLocaleString()}만원</p>
              </div>
              <div className="bg-white rounded-[12px] p-3 text-center">
                <p className="text-[12px] text-[#8B95A1]">잉여금</p>
                <p className="text-[16px] font-bold" style={{ color: (result.cashFlowAnalysis.surplus || 0) >= 0 ? '#3182F6' : '#E5503C' }}>
                  {(result.cashFlowAnalysis.surplus || 0).toLocaleString()}만원
                </p>
              </div>
            </div>
            <div className="bg-white rounded-[12px] p-3 flex justify-around">
              <div className="text-center">
                <p className="text-[12px] text-[#8B95A1]">저축률</p>
                <p className="text-[18px] font-bold text-[#34C759]">{result.cashFlowAnalysis.savingsRate || 0}%</p>
              </div>
              <div className="text-center">
                <p className="text-[12px] text-[#8B95A1]">부채비율</p>
                <p className="text-[18px] font-bold" style={{ color: (raw.debtRatio || 0) < 30 ? '#34C759' : (raw.debtRatio || 0) < 60 ? '#FF9500' : '#E5503C' }}>
                  {raw.debtRatio || 0}%
                </p>
              </div>
            </div>
            <p className="text-[13px] text-[#6B7684]">{result.cashFlowAnalysis.comment}</p>
          </motion.div>
        )}

        {/* ── 부채 분석 ── */}
        {result.debtAnalysis && result.debtAnalysis.totalDebt > 0 && (
          <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp} className="bg-[#F9FAFB] rounded-[20px] p-6 space-y-4">
            <h3 className="text-[17px] font-bold text-[#1B2A4A]">부채 분석</h3>
            <div className="bg-white rounded-[12px] p-4 space-y-2">
              <div className="flex justify-between text-[14px]">
                <span className="text-[#8B95A1]">총 부채</span>
                <span className="font-bold text-[#E5503C]">{(result.debtAnalysis.totalDebt || 0).toLocaleString()}만원</span>
              </div>
              <div className="flex justify-between text-[14px]">
                <span className="text-[#8B95A1]">최고 금리 대출</span>
                <span className="font-medium text-[#1B2A4A]">{result.debtAnalysis.highestRateLoan}</span>
              </div>
            </div>
            <p className="text-[13px] text-[#6B7684]">{result.debtAnalysis.comment}</p>
            {result.debtAnalysis.recommendations?.length > 0 && (
              <div className="space-y-2">
                {result.debtAnalysis.recommendations.map((rec: string, i: number) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-[#3182F6] mt-0.5">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    <span className="text-[13px] text-[#4E5968]">{rec}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ── 목표 시뮬레이션 ── */}
        {result.goalSimulations?.length > 0 && (
          <motion.div custom={5} initial="hidden" animate="visible" variants={fadeUp} className="space-y-4">
            <h3 className="text-[17px] font-bold text-[#1B2A4A]">목표 달성 시뮬레이션</h3>
            {result.goalSimulations.map((goal: any, i: number) => (
              <GoalBar key={i} goal={goal} />
            ))}
          </motion.div>
        )}

        {/* ── 맞춤 조언 ── */}
        {result.recommendations && (
          <motion.div custom={6} initial="hidden" animate="visible" variants={fadeUp} className="bg-[#F9FAFB] rounded-[20px] p-6 space-y-5">
            <h3 className="text-[17px] font-bold text-[#1B2A4A]">맞춤 조언</h3>

            {result.recommendations.immediate?.length > 0 && (
              <div>
                <p className="text-[13px] font-semibold text-[#3182F6] mb-2">지금 바로</p>
                <div className="space-y-2">
                  {result.recommendations.immediate.map((r: string, i: number) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-[12px] bg-[#3182F6] text-white rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                      <span className="text-[14px] text-[#4E5968]">{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.recommendations.shortTerm?.length > 0 && (
              <div>
                <p className="text-[13px] font-semibold text-[#FF9500] mb-2">6개월~1년 내</p>
                <div className="space-y-2">
                  {result.recommendations.shortTerm.map((r: string, i: number) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-[12px] bg-[#FF9500] text-white rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                      <span className="text-[14px] text-[#4E5968]">{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.recommendations.longTerm?.length > 0 && (
              <div>
                <p className="text-[13px] font-semibold text-[#5856D6] mb-2">3~5년 장기</p>
                <div className="space-y-2">
                  {result.recommendations.longTerm.map((r: string, i: number) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-[12px] bg-[#5856D6] text-white rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                      <span className="text-[14px] text-[#4E5968]">{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ── 직업별 인사이트 ── */}
        {result.jobSpecific && (
          <motion.div custom={7} initial="hidden" animate="visible" variants={fadeUp} className="bg-[#EBF4FF] rounded-[20px] p-6 space-y-4">
            <h3 className="text-[17px] font-bold text-[#1B2A4A]">
              {result.jobSpecific.type === '개인사업자' || result.jobSpecific.type === '프리랜서' ? '세무·사업 특화 진단' : '절세·보험 특화 진단'}
            </h3>
            {result.jobSpecific.insights?.map((ins: string, i: number) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-[#3182F6] mt-0.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
                  </svg>
                </span>
                <span className="text-[14px] text-[#4E5968]">{ins}</span>
              </div>
            ))}
          </motion.div>
        )}

        {/* ── 상담 CTA ── */}
        <motion.div custom={8} initial="hidden" animate="visible" variants={fadeUp} className="bg-[#1B2A4A] rounded-[20px] p-6 text-center space-y-4">
          <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center mx-auto">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <p className="text-[18px] font-bold text-white">전문가 무료 상담</p>
          <p className="text-[14px] text-white/70">{result.jobSpecific?.ctaMessage || '맞춤 재무 전략을 전문가와 함께 세워보세요'}</p>

          {!showContact && !sent && (
            <button
              onClick={() => setShowContact(true)}
              className="w-full py-3.5 bg-[#3182F6] text-white text-[16px] font-semibold rounded-[14px] hover:bg-[#1B64DA] transition-colors"
            >
              상세 리포트 받기 + 무료 상담 신청
            </button>
          )}

          {showContact && !sent && (
            <div className="space-y-3 text-left">
              <input
                type="text"
                placeholder="이름"
                value={contact.name}
                onChange={(e) => setContact({ ...contact, name: e.target.value })}
                className="w-full px-4 py-3 rounded-[12px] text-[15px] text-[#1B2A4A] outline-none"
              />
              <input
                type="tel"
                placeholder="연락처 (010-0000-0000)"
                value={contact.phone}
                onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-[12px] text-[15px] text-[#1B2A4A] outline-none"
              />
              <input
                type="email"
                placeholder="이메일 (선택)"
                value={contact.email}
                onChange={(e) => setContact({ ...contact, email: e.target.value })}
                className="w-full px-4 py-3 rounded-[12px] text-[15px] text-[#1B2A4A] outline-none"
              />
              <button
                onClick={handleSendReport}
                disabled={sending}
                className="w-full py-3.5 bg-[#3182F6] text-white text-[16px] font-semibold rounded-[14px] hover:bg-[#1B64DA] transition-colors disabled:bg-[#8B95A1]"
              >
                {sending ? '전송 중...' : '리포트 받기'}
              </button>
            </div>
          )}

          {sent && (
            <div className="py-4">
              <div className="w-12 h-12 bg-[#34C759] rounded-full flex items-center justify-center mx-auto mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="text-[16px] font-semibold text-white">신청이 완료되었습니다</p>
              <p className="text-[14px] text-white/70 mt-1">빠른 시일 내에 연락드리겠습니다</p>
            </div>
          )}
        </motion.div>

        {/* ── 하단 안내 ── */}
        <motion.div custom={9} initial="hidden" animate="visible" variants={fadeUp} className="text-center py-4">
          <p className="text-[12px] text-[#B0B8C1]">본 진단은 AI 기반 참고 자료이며, 정확한 재무 전략은 전문가 상담을 권장합니다.</p>
          <p className="text-[12px] text-[#B0B8C1] mt-1">LifePlan by CPA ㅣ 이흥준 회계사</p>
        </motion.div>

        {/* 처음으로 버튼 */}
        <div className="pb-8">
          <button
            onClick={() => router.push('/')}
            className="w-full py-3 text-[15px] font-medium text-[#8B95A1] border border-[#E5E8EB] rounded-[14px] hover:bg-[#F9FAFB] transition-colors"
          >
            처음으로 돌아가기
          </button>
        </div>
      </main>
    </div>
  )
}

