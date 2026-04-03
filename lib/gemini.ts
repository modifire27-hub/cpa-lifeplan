// lib/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

// ============================================================
// 세후 수익률 상수
// ============================================================
const RATES = {
  bankDeposit:    0.0025 * (1 - 0.154),  // 보통예금 세후 0.21%
  termDeposit:    0.030  * (1 - 0.154),  // 정기예금 세후 2.54%
  savingsAccount: 0.030  * (1 - 0.154),  // 적금 세후 2.54%
  cmaAccount:     0.015  * (1 - 0.154),  // CMA 세후 1.27%
  otherSavings:   0.030  * (1 - 0.154),  // 기타예적금 세후 2.54%
  investment:     0.055  * (1 - 0.154),  // 투자자산 세후 4.65%
  realEstate:     0.030,                 // 부동산 상승률 3.0% (세전)
  rentalYield:    0.040  * (1 - 0.154),  // 임대수익 세후 3.38%
  pension:        0.030,                 // 연금 적립 수익률 3.0%
  pensionTax:     0.055,                 // 연금소득세 5.5%
  inflation:      0.025,                 // 물가상승률 2.5%
  withdrawal:     0.040,                 // 4% 인출룰
  wageGrowth:     0.030,                 // 임금상승률 3.0%
  savingsInvest:  0.055  * (1 - 0.154),  // 투자형 저축 세후 4.65%
  savingsDeposit: 0.030  * (1 - 0.154),  // 예금형 저축 세후 2.54%
}

// ============================================================
// 재무 계산 유틸
// ============================================================
function FV(rate: number, nper: number, pmt: number, pv: number): number {
  if (rate === 0) return pv + pmt * nper
  return pv * Math.pow(1 + rate, nper) + pmt * ((Math.pow(1 + rate, nper) - 1) / rate)
}

function PMT(rate: number, nper: number, pv: number): number {
  if (nper <= 0) return 0
  if (rate === 0) return pv / nper
  return pv * (rate * Math.pow(1 + rate, nper)) / (Math.pow(1 + rate, nper) - 1)
}

// ============================================================
// 대출 잔여 원금 계산
// ============================================================
function getRemainingBalance(loan: {
  balance: number
  interestRate: number
  remainingMonths: number
  monthlyPayment: number
  repayType: string
}, monthsToRetirement: number): number {
  const { balance, interestRate, remainingMonths, monthlyPayment, repayType } = loan
  const monthlyRate = (interestRate / 100) / 12

  if (monthsToRetirement >= remainingMonths) return 0

  if (repayType === 'bullet') {
    // 만기일시: 원금 그대로
    return balance
  } else if (repayType === 'equal_principal_interest') {
    // 원리금균등: 잔여 원금 계산
    let remaining = balance
    const months = Math.min(monthsToRetirement, remainingMonths)
    for (let i = 0; i < months; i++) {
      const interest = remaining * monthlyRate
      const principal = monthlyPayment - interest
      remaining -= principal
      if (remaining < 0) return 0
    }
    return Math.max(0, remaining)
  } else if (repayType === 'equal_principal') {
    // 원금균등: 매월 동일 원금 상환
    const monthlyPrincipal = balance / remainingMonths
    return Math.max(0, balance - monthlyPrincipal * monthsToRetirement)
  }
  return balance
}

// ============================================================
// 대출 은퇴시점 총비용 계산 (원금균등/만기일시)
// ============================================================
function getTotalLoanCostToRetirement(loan: {
  balance: number
  interestRate: number
  remainingMonths: number
  monthlyPayment: number
  repayType: string
}, monthsToRetirement: number): number {
  const { balance, interestRate, remainingMonths, repayType } = loan
  const monthlyRate = (interestRate / 100) / 12
  const months = Math.min(monthsToRetirement, remainingMonths)

  if (repayType === 'bullet') {
    // 만기일시: 원금 + 총 이자
    const totalInterest = balance * monthlyRate * months
    return balance + totalInterest
  } else if (repayType === 'equal_principal') {
    // 원금균등: 총 원금 + 총 이자
    const monthlyPrincipal = balance / remainingMonths
    let totalCost = 0
    let remaining = balance
    for (let i = 0; i < months; i++) {
      totalCost += monthlyPrincipal + remaining * monthlyRate
      remaining -= monthlyPrincipal
    }
    return totalCost
  }
  return 0
}

// ============================================================
// 인터페이스
// ============================================================
interface InsurancePayout {
  id: number
  type: 'surrender' | 'maturity'
  currentAmount: number
  maturityYear?: number
  maturityAmount?: number
}

interface LoanDetail {
  id: number
  type: string
  balance: number
  monthlyPayment: number
  interestRate: number
  remainingMonths: number
  repayType: 'equal_principal_interest' | 'equal_principal' | 'bullet'
}

interface DiagData {
  // 기본정보
  birthYear: number
  birthMonth: number
  retirementTargetAge: number
  lifeExpectancy: number
  maritalStatus: string
  children: { age: number }[]
  spouseIncome: number
  // 자산
  bankDeposit: number
  termDeposit: number
  savingsAccount: number
  cmaAccount: number
  otherSavings: number
  stocksEtf: number
  funds: number
  bonds: number
  crypto: number
  otherInvestments: number
  ownedHome: number
  investmentProperty: number
  otherRealEstate: number
  rentalIncome: number
  pensionType: string
  pensionBalance: number
  pensionMonthlyContrib: number
  pensionExpectedMonthly: number
  yearsOfService: number
  personalPensionBalance: number
  personalPensionMonthly: number
  personalPensionExpected: number
  nationalPensionExpected: number
  insurancePayouts: InsurancePayout[]
  otherAssets: number
  // 부채
  loans: LoanDetail[]
  // 수입/지출
  salary: number
  businessIncome: number
  rentalIncomeMonthly: number
  dividendIncome: number
  otherIncome: number
  housingCost: number
  food: number
  transportation: number
  communication: number
  insurance: number
  medical: number
  education: number
  childcare: number
  culture: number
  clothing: number
  personalCare: number
  socialExpense: number
  subscriptions: number
  tax: number
  otherExpense: number
  // 보험
  hasLossInsurance: boolean
  hasLifeInsurance: boolean
  hasCancerInsurance: boolean
  hasAnnuityInsurance: boolean
  // 직업
  jobType: string
  annualSalary: number
  yearsAtJob: number
  pensionSavingsContrib: number
  housingSubscriptionContrib: number
  hasMonthlyRentDeduction: boolean
  yellowUmbrellaContrib: number
  bookkeepingType: string
  annualDividend: number
  // 은퇴목표
  retirementMonthlyExpense: number
  // 연락처
  name: string
  phone: string
  email: string
}

interface CashFlowItem {
  label: string
  monthly: number
  annual: number
  note: string
}

interface AssetProjection {
  age: number
  year: number
  totalAssets: number
  liquidAssets: number
  realEstateAssets: number
  pensionAssets: number
  debt: number
  netAssets: number
}

interface PostRetirementYear {
  age: number
  year: number
  cashInflow: number
  livingExpense: number
  netCashflow: number
  liquidAssetBalance: number
  realEstateValue: number
  totalWealth: number
}

interface RetirementSimResult {
  currentAge: number
  retirementAge: number
  lifeExpectancy: number
  yearsToRetirement: number
  postRetirementYears: number
  projectedTotalAssets: number
  projectedLiquidAssets: number
  projectedRealEstate: number
  projectedPensionAssets: number
  projectedDebt: number
  projectedNetAssets: number
  monthlyCashFlows: CashFlowItem[]
  totalMonthlyCashFlow: number
  monthlyWithdrawal: number
  monthlyExpenseRequired: number
  isSustainable: boolean
  assetProjections: AssetProjection[]
  postRetirementProjection: PostRetirementYear[]
  finalWealth: number
  finalLiquidAssets: number
  finalRealEstate: number
  liquidAssetDepletionAge: number | null
  assumptions: Record<string, string>
  summary: string
}

// ============================================================
// 은퇴 시뮬레이션 메인
// ============================================================
function calculateRetirementSimulation(d: DiagData): RetirementSimResult {
  const currentYear = new Date().getFullYear()
  const currentAge = currentYear - d.birthYear
  const yearsToRetirement = Math.max(0, d.retirementTargetAge - currentAge)
  const postRetirementYears = Math.max(0, d.lifeExpectancy - d.retirementTargetAge)
  const n = yearsToRetirement
  const monthlyRate = RATES.pension / 12

  // ----------------------------------------------------------
  // 1. 현금성 자산 FV (항목별)
  // ----------------------------------------------------------
  const fvBank     = FV(RATES.bankDeposit,    n, 0, d.bankDeposit    || 0)
  const fvTerm     = FV(RATES.termDeposit,    n, 0, d.termDeposit    || 0)
  const fvSavings  = FV(RATES.savingsAccount, n, 0, d.savingsAccount || 0)
  const fvCma      = FV(RATES.cmaAccount,     n, 0, d.cmaAccount     || 0)
  const fvOther    = FV(RATES.otherSavings,   n, 0, d.otherSavings   || 0)
  const projectedCash = fvBank + fvTerm + fvSavings + fvCma + fvOther

  // ----------------------------------------------------------
  // 2. 투자자산 FV
  // ----------------------------------------------------------
  const totalInvestment = (d.stocksEtf || 0) + (d.funds || 0) +
    (d.bonds || 0) + (d.crypto || 0) + (d.otherInvestments || 0)
  const projectedInvestment = FV(RATES.investment, n, 0, totalInvestment)

  // ----------------------------------------------------------
  // 3. 부동산 FV
  // ----------------------------------------------------------
  const totalRealEstate = (d.ownedHome || 0) + (d.investmentProperty || 0) + (d.otherRealEstate || 0)
  const projectedRealEstate = FV(RATES.realEstate, n, 0, totalRealEstate)

  // ----------------------------------------------------------
  // 4. 퇴직연금 FV
  // ----------------------------------------------------------
  let projectedPension = 0
  let monthlyPensionPayout = d.pensionExpectedMonthly || 0

  if (d.pensionType === 'DB') {
    // DB형: 은퇴시점 급여 × 총 근속연수
    const currentMonthly = (d.annualSalary || 0) / 12
    const retirementMonthly = currentMonthly * Math.pow(1 + RATES.wageGrowth, n)
    const totalYears = (d.yearsOfService || 0) + n
    projectedPension = retirementMonthly * totalYears
    if (!monthlyPensionPayout && postRetirementYears > 0) {
      monthlyPensionPayout = PMT(monthlyRate, postRetirementYears * 12, projectedPension) * (1 - RATES.pensionTax)
    }
  } else if (d.pensionType === 'DC') {
    // DC형: 현재 잔액 FV + 매년 연봉 1/12 불입 (임금상승률 반영)
    const currentMonthlyContrib = (d.annualSalary || 0) / 12
    let dcBalance = d.pensionBalance || 0
    for (let y = 0; y < n; y++) {
      const yearlyContrib = currentMonthlyContrib * Math.pow(1 + RATES.wageGrowth, y) * 12
      dcBalance = dcBalance * (1 + RATES.pension) + yearlyContrib
    }
    projectedPension = dcBalance
    if (!monthlyPensionPayout && postRetirementYears > 0) {
      monthlyPensionPayout = PMT(monthlyRate, postRetirementYears * 12, projectedPension) * (1 - RATES.pensionTax)
    }
  } else if (d.pensionType === 'IRP') {
    projectedPension = FV(RATES.pension, n, d.pensionMonthlyContrib || 0, d.pensionBalance || 0)
    if (!monthlyPensionPayout && postRetirementYears > 0) {
      monthlyPensionPayout = PMT(monthlyRate, postRetirementYears * 12, projectedPension) * (1 - RATES.pensionTax)
    }
  }

  // ----------------------------------------------------------
  // 5. 개인연금 FV
  // ----------------------------------------------------------
  const projectedPersonalPension = FV(RATES.pension, n,
    d.personalPensionMonthly || 0, d.personalPensionBalance || 0)
  let monthlyPersonalPension = d.personalPensionExpected || 0
  if (!monthlyPersonalPension && postRetirementYears > 0) {
    monthlyPersonalPension = PMT(monthlyRate, postRetirementYears * 12, projectedPersonalPension) * (1 - RATES.pensionTax)
  }

  // ----------------------------------------------------------
  // 6. 국민연금
  // ----------------------------------------------------------
  const monthlyNationalPension = (d.nationalPensionExpected || 0) * (1 - RATES.pensionTax)

  // ----------------------------------------------------------
  // 7. 보험 만기 수령 (은퇴 시점 이전)
  // ----------------------------------------------------------
  let insuranceLumpsum = 0
  const retirementYear = currentYear + n
  for (const ins of (d.insurancePayouts || [])) {
    if (ins.type === 'surrender') {
      insuranceLumpsum += ins.currentAmount || 0
    } else if (ins.type === 'maturity' && ins.maturityYear) {
      if (ins.maturityYear <= retirementYear) {
        insuranceLumpsum += ins.maturityAmount || 0
      }
    }
  }

  // ----------------------------------------------------------
  // 8. 기타자산 FV
  // ----------------------------------------------------------
  const projectedOther = FV(RATES.termDeposit, n, 0, d.otherAssets || 0)

  // ----------------------------------------------------------
  // 9. 대출 잔여 처리
  // ----------------------------------------------------------
  const monthsToRetirement = n * 12
  let projectedDebt = 0
  let additionalDebtCost = 0

  for (const loan of (d.loans || [])) {
    if (loan.repayType === 'equal_principal_interest') {
      projectedDebt += getRemainingBalance(loan, monthsToRetirement)
    } else if (loan.repayType === 'equal_principal' || loan.repayType === 'bullet') {
      additionalDebtCost += getTotalLoanCostToRetirement(loan, monthsToRetirement)
    }
  }

  // ----------------------------------------------------------
  // 10. 유동자산 합계 (4% 룰 적용 대상)
  // ----------------------------------------------------------
  const projectedLiquidAssets = Math.max(0,
    projectedCash + projectedInvestment + insuranceLumpsum + projectedOther - additionalDebtCost
  )

  // ----------------------------------------------------------
  // 11. 총 자산 합계
  // ----------------------------------------------------------
  const projectedTotalAssets = projectedLiquidAssets + projectedRealEstate +
    projectedPension + projectedPersonalPension
  const projectedNetAssets = projectedTotalAssets - projectedDebt

  // ----------------------------------------------------------
  // 12. 월 현금흐름
  // ----------------------------------------------------------
  const monthlyRental = (d.rentalIncome || 0) * (1 - 0.154)
  const monthlyCashFlows: CashFlowItem[] = []

  if (monthlyNationalPension > 0) {
    monthlyCashFlows.push({
      label: '국민연금',
      monthly: Math.round(monthlyNationalPension),
      annual: Math.round(monthlyNationalPension * 12),
      note: '연금소득세 5.5% 차감 후'
    })
  }
  if (monthlyPensionPayout > 0) {
    monthlyCashFlows.push({
      label: '퇴직연금',
      monthly: Math.round(monthlyPensionPayout),
      annual: Math.round(monthlyPensionPayout * 12),
      note: `${d.pensionType}형 · 연금소득세 5.5% 차감 후`
    })
  }
  if (monthlyPersonalPension > 0) {
    monthlyCashFlows.push({
      label: '개인연금',
      monthly: Math.round(monthlyPersonalPension),
      annual: Math.round(monthlyPersonalPension * 12),
      note: '연금소득세 5.5% 차감 후'
    })
  }
  if (monthlyRental > 0) {
    monthlyCashFlows.push({
      label: '임대소득',
      monthly: Math.round(monthlyRental),
      annual: Math.round(monthlyRental * 12),
      note: '분리과세 15.4% 차감 후'
    })
  }

  const totalMonthlyCashFlow = monthlyCashFlows.reduce((s, c) => s + c.monthly, 0)

  // ----------------------------------------------------------
  // 13. 4% 룰 월 인출 가능액
  // ----------------------------------------------------------
  const monthlyWithdrawal = Math.round((projectedLiquidAssets * RATES.withdrawal) / 12)

  // ----------------------------------------------------------
  // 14. 필요 생활비 (물가 반영)
  // ----------------------------------------------------------
  const monthlyExpenseRequired = Math.round(
    (d.retirementMonthlyExpense || 0) * Math.pow(1 + RATES.inflation, n)
  )

  // ----------------------------------------------------------
  // 15. 지속 가능 여부
  // ----------------------------------------------------------
  const isSustainable = (totalMonthlyCashFlow + monthlyWithdrawal) >= monthlyExpenseRequired

  // ----------------------------------------------------------
  // 16. 연도별 자산 추이 (현재 → 은퇴)
  // ----------------------------------------------------------
  const assetProjections: AssetProjection[] = []
  for (let y = 0; y <= n; y++) {
    const age = currentAge + y
    const yr = currentYear + y
    const cash = FV(RATES.bankDeposit, y, 0, d.bankDeposit || 0) +
      FV(RATES.termDeposit, y, 0, d.termDeposit || 0) +
      FV(RATES.savingsAccount, y, 0, d.savingsAccount || 0) +
      FV(RATES.cmaAccount, y, 0, d.cmaAccount || 0) +
      FV(RATES.otherSavings, y, 0, d.otherSavings || 0)
    const inv = FV(RATES.investment, y, 0, totalInvestment)
    const re = FV(RATES.realEstate, y, 0, totalRealEstate)
    const liq = Math.max(0, cash + inv)
    const total = liq + re + FV(RATES.pension, y, 0, (d.pensionBalance || 0) + (d.personalPensionBalance || 0))
    const debt = (d.loans || []).reduce((s, l) => s + getRemainingBalance(l, y * 12), 0)
    assetProjections.push({
      age, year: yr,
      totalAssets: Math.round(total),
      liquidAssets: Math.round(liq),
      realEstateAssets: Math.round(re),
      pensionAssets: Math.round(FV(RATES.pension, y, 0, (d.pensionBalance || 0) + (d.personalPensionBalance || 0))),
      debt: Math.round(debt),
      netAssets: Math.round(total - debt)
    })
  }

  // ----------------------------------------------------------
  // 17. 은퇴 후 소진 시뮬레이션
  // ----------------------------------------------------------
  const postRetirementProjection: PostRetirementYear[] = []
  let liquidBalance = projectedLiquidAssets
  let realEstateValue = projectedRealEstate
  let liquidDepletionAge: number | null = null

  for (let y = 0; y < postRetirementYears; y++) {
    const age = d.retirementTargetAge + y
    const yr = retirementYear + y
    const livingExpense = Math.round(monthlyExpenseRequired * Math.pow(1 + RATES.inflation, y) * 12)
    const cashInflow = Math.round(totalMonthlyCashFlow * 12)
    const netCashflow = cashInflow - livingExpense

    if (netCashflow >= 0) {
      // 잉여금 → 유동자산에 3% 수익률로 누적
      liquidBalance = liquidBalance * (1 + RATES.termDeposit) + netCashflow
    } else {
      // 부족분 → 유동자산에서 인출
      liquidBalance = liquidBalance * (1 + RATES.termDeposit) + netCashflow
    }

    if (liquidBalance < 0 && liquidDepletionAge === null) {
      liquidDepletionAge = age
      liquidBalance = 0
    }

    // 부동산 가치 상승
    realEstateValue = realEstateValue * (1 + RATES.realEstate)

    const totalWealth = Math.max(0, liquidBalance) + realEstateValue

    postRetirementProjection.push({
      age, year: yr,
      cashInflow: Math.round(cashInflow / 12),
      livingExpense: Math.round(livingExpense / 12),
      netCashflow: Math.round(netCashflow / 12),
      liquidAssetBalance: Math.round(Math.max(0, liquidBalance)),
      realEstateValue: Math.round(realEstateValue),
      totalWealth: Math.round(totalWealth)
    })
  }

  const lastYear = postRetirementProjection[postRetirementProjection.length - 1]
  const finalLiquidAssets = lastYear ? lastYear.liquidAssetBalance : 0
  const finalRealEstate = lastYear ? lastYear.realEstateValue : 0
  const finalWealth = finalLiquidAssets + finalRealEstate

  // ----------------------------------------------------------
  // 18. 요약 문자열
  // ----------------------------------------------------------
  const summary = [
    `[은퇴 시뮬레이션 요약]`,
    `현재 ${currentAge}세 → 목표 은퇴 ${d.retirementTargetAge}세 (${yearsToRetirement}년 후) → 기대수명 ${d.lifeExpectancy}세`,
    `은퇴시점 예상 총자산: ${Math.round(projectedTotalAssets).toLocaleString()}만원`,
    `은퇴시점 예상 부채: ${Math.round(projectedDebt).toLocaleString()}만원`,
    `은퇴시점 예상 순자산: ${Math.round(projectedNetAssets).toLocaleString()}만원`,
    `─`,
    `[월 현금흐름]`,
    ...monthlyCashFlows.map(c => `  ${c.label}: ${c.monthly.toLocaleString()}만원/월 (${c.note})`),
    `  합계: ${totalMonthlyCashFlow.toLocaleString()}만원/월`,
    `─`,
    `[자산 인출]`,
    `  월 인출가능액: ${monthlyWithdrawal.toLocaleString()}만원 (유동자산 × 4% ÷ 12)`,
    `  월 필요생활비: ${monthlyExpenseRequired.toLocaleString()}만원 (물가상승률 2.5% 반영)`,
    `  지속가능 여부: ${isSustainable ? '✅ 가능' : '⚠️ 부족 - 계획 재검토 필요'}`,
    `─`,
    `[사망시점 잔여자산 (${d.lifeExpectancy}세)]`,
    `  유동자산 잔액: ${finalLiquidAssets.toLocaleString()}만원`,
    `  부동산 가치: ${finalRealEstate.toLocaleString()}만원`,
    `  총 상속가능 자산: ${finalWealth.toLocaleString()}만원`,
    liquidDepletionAge ? `  ⚠️ ${liquidDepletionAge}세에 유동자산 소진 예상` : `  ✅ 기대수명까지 유동자산 유지`,
    `─`,
    `[계산 가정]`,
    `  이자/배당/임대소득: 분리과세 15.4% 적용 세후 수익률 기준`,
    `  연금소득세: 5.5% 차감 후 기준`,
    `  부동산 가격 상승률: 연 3.0%`,
    `  물가상승률: 연 2.5%`,
    `  기대수명: ${d.lifeExpectancy}세 가정`,
  ].join('\n')

  return {
    currentAge,
    retirementAge: d.retirementTargetAge,
    lifeExpectancy: d.lifeExpectancy,
    yearsToRetirement,
    postRetirementYears,
    projectedTotalAssets: Math.round(projectedTotalAssets),
    projectedLiquidAssets: Math.round(projectedLiquidAssets),
    projectedRealEstate: Math.round(projectedRealEstate),
    projectedPensionAssets: Math.round(projectedPension + projectedPersonalPension),
    projectedDebt: Math.round(projectedDebt),
    projectedNetAssets: Math.round(projectedNetAssets),
    monthlyCashFlows,
    totalMonthlyCashFlow: Math.round(totalMonthlyCashFlow),
    monthlyWithdrawal,
    monthlyExpenseRequired,
    isSustainable,
    assetProjections,
    postRetirementProjection,
    finalWealth: Math.round(finalWealth),
    finalLiquidAssets: Math.round(finalLiquidAssets),
    finalRealEstate: Math.round(finalRealEstate),
    liquidAssetDepletionAge: liquidDepletionAge,
    assumptions: {
      taxRate: '분리과세 15.4%',
      pensionTax: '연금소득세 5.5%',
      realEstateGrowth: '연 3.0%',
      inflation: '연 2.5%',
      withdrawalRate: '4%',
      lifeExpectancy: `${d.lifeExpectancy}세`,
    },
    summary
  }
}

// ============================================================
// Gemini 프롬프트 생성
// ============================================================
function buildPrompt(d: DiagData, sim: RetirementSimResult): string {
  const jobLabel = d.jobType === 'employee' ? '직장인'
    : d.jobType === 'self_employed' ? '개인사업자'
    : d.jobType === 'corporate' ? '법인 대표' : '기타'

  const totalIncome = (d.salary || 0) + (d.businessIncome || 0) +
    (d.rentalIncomeMonthly || 0) + (d.dividendIncome || 0) + (d.otherIncome || 0)
  const totalExpense = (d.housingCost || 0) + (d.food || 0) + (d.transportation || 0) +
    (d.communication || 0) + (d.insurance || 0) + (d.medical || 0) +
    (d.education || 0) + (d.childcare || 0) + (d.culture || 0) +
    (d.clothing || 0) + (d.personalCare || 0) + (d.socialExpense || 0) +
    (d.subscriptions || 0) + (d.tax || 0) + (d.otherExpense || 0) +
    (d.loans || []).reduce((s, l) => s + (l.monthlyPayment || 0), 0)
  const totalAssets = (d.bankDeposit || 0) + (d.termDeposit || 0) + (d.savingsAccount || 0) +
    (d.cmaAccount || 0) + (d.otherSavings || 0) + (d.stocksEtf || 0) + (d.funds || 0) +
    (d.bonds || 0) + (d.crypto || 0) + (d.otherInvestments || 0) +
    (d.ownedHome || 0) + (d.investmentProperty || 0) + (d.otherRealEstate || 0) +
    (d.pensionBalance || 0) + (d.personalPensionBalance || 0) + (d.otherAssets || 0)
  const totalDebt = (d.loans || []).reduce((s, l) => s + (l.balance || 0), 0)
  const netAsset = totalAssets - totalDebt
  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0
  const debtRatio = totalAssets > 0 ? Math.round((totalDebt / totalAssets) * 100) : 0

  return `당신은 대한민국 최고의 공인회계사(CPA) 겸 재무설계 전문가입니다.
아래 고객의 재무 데이터를 분석하여 전문적이고 구체적인 재무진단 보고서를 작성해 주세요.

## 고객 기본정보
- 나이: ${sim.currentAge}세 / 직업: ${jobLabel}
- 결혼상태: ${d.maritalStatus} / 자녀: ${d.children?.length || 0}명
- 목표 은퇴나이: ${d.retirementTargetAge}세 / 기대수명: ${d.lifeExpectancy}세

## 현재 재무상태
- 월 총수입: ${totalIncome.toLocaleString()}만원
- 월 총지출: ${totalExpense.toLocaleString()}만원
- 월 순현금흐름: ${(totalIncome - totalExpense).toLocaleString()}만원
- 저축률: ${savingsRate}%
- 총자산: ${totalAssets.toLocaleString()}만원
- 총부채: ${totalDebt.toLocaleString()}만원
- 순자산: ${netAsset.toLocaleString()}만원
- 부채비율: ${debtRatio}%

## 보험 가입 현황
- 실손: ${d.hasLossInsurance ? '가입' : '미가입'}
- 종신/정기: ${d.hasLifeInsurance ? '가입' : '미가입'}
- 암/CI: ${d.hasCancerInsurance ? '가입' : '미가입'}
- 연금보험: ${d.hasAnnuityInsurance ? '가입' : '미가입'}

## 직업별 세금 정보
${d.jobType === 'employee' ? `- 연금저축 납입: ${d.pensionSavingsContrib || 0}만원/년\n- 주택청약 납입: ${d.housingSubscriptionContrib || 0}만원/년\n- 월세공제: ${d.hasMonthlyRentDeduction ? '해당' : '해당없음'}` : ''}
${d.jobType === 'self_employed' ? `- 노란우산공제: ${d.yellowUmbrellaContrib || 0}만원/월\n- 장부유형: ${d.bookkeepingType}` : ''}
${d.jobType === 'corporate' ? `- 연간 배당수령: ${d.annualDividend || 0}만원\n- 연봉: ${d.annualSalary || 0}만원` : ''}

## 은퇴 시뮬레이션 결과
${sim.summary}

## 작성 지침
1. 등급은 S/A/B/C/D 중 하나로 평가 (S: 최우수, D: 위험)
2. 백분위는 동일 연령대 대비 상위 몇 %인지 (예: 상위 15%)
3. 핵심 강점 2~3가지, 개선 필요 사항 2~3가지
4. 은퇴 준비 달성률 계산 (목표 대비 현재 준비 수준 %)
5. 직업 유형(${jobLabel})에 맞는 절세 전략 구체적으로 제시
6. 보험 공백이 있는 경우 가입 권고
7. 실행 가능한 액션플랜 3가지 (우선순위 순)

반드시 아래 JSON 형식으로만 응답하세요:
{
  "grade": "A",
  "percentile": "상위 20%",
  "summary": "전체 요약 (3~4문장)",
  "strengths": ["강점1", "강점2", "강점3"],
  "improvements": ["개선1", "개선2", "개선3"],
  "retirementReadiness": 75,
  "taxStrategy": "절세 전략 상세 내용",
  "insuranceAdvice": "보험 관련 조언",
  "actionPlan": ["액션1", "액션2", "액션3"],
  "detailedAnalysis": "상세 분석 내용 (5~7문장)"
}`
}

// ============================================================
// 메인 분석 함수
// ============================================================
export async function analyzeFinancial(diagData: DiagData) {
  const sim = calculateRetirementSimulation(diagData)

  const totalIncome = (diagData.salary || 0) + (diagData.businessIncome || 0) +
    (diagData.rentalIncomeMonthly || 0) + (diagData.dividendIncome || 0) + (diagData.otherIncome || 0)
  const totalExpense = (diagData.housingCost || 0) + (diagData.food || 0) + (diagData.transportation || 0) +
    (diagData.communication || 0) + (diagData.insurance || 0) + (diagData.medical || 0) +
    (diagData.education || 0) + (diagData.childcare || 0) + (diagData.culture || 0) +
    (diagData.clothing || 0) + (diagData.personalCare || 0) + (diagData.socialExpense || 0) +
    (diagData.subscriptions || 0) + (diagData.tax || 0) + (diagData.otherExpense || 0) +
    (diagData.loans || []).reduce((s: number, l: LoanDetail) => s + (l.monthlyPayment || 0), 0)
  const monthlySavings = totalIncome - totalExpense
  const totalInvestment = (diagData.stocksEtf || 0) + (diagData.funds || 0) +
    (diagData.bonds || 0) + (diagData.crypto || 0) + (diagData.otherInvestments || 0)
  const totalRealEstate = (diagData.ownedHome || 0) + (diagData.investmentProperty || 0) + (diagData.otherRealEstate || 0)
  const totalPension = (diagData.pensionBalance || 0) + (diagData.personalPensionBalance || 0)
  const totalOther = diagData.otherAssets || 0
  const totalAssets = (diagData.bankDeposit || 0) + (diagData.termDeposit || 0) +
    (diagData.savingsAccount || 0) + (diagData.cmaAccount || 0) + (diagData.otherSavings || 0) +
    totalInvestment + totalRealEstate + totalPension + totalOther
  const totalDebt = (diagData.loans || []).reduce((s: number, l: LoanDetail) => s + (l.balance || 0), 0)
  const netAsset = totalAssets - totalDebt
  const savingsRate = totalIncome > 0 ? Math.round(((monthlySavings) / totalIncome) * 100) : 0
  const debtRatio = totalAssets > 0 ? Math.round((totalDebt / totalAssets) * 100) : 0

  const prompt = buildPrompt(diagData, sim)

  try {
    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('JSON 파싱 실패')
    const parsed = JSON.parse(jsonMatch[0])

    return {
      ...parsed,
      rawData: {
        monthlyIncome: totalIncome,
        monthlyExpense: totalExpense,
        monthlySavings,
        savingsRate,
        totalAssets,
        totalDebt,
        netAsset,
        debtRatio,
        retirementSimulation: sim,
      }
    }
  } catch (e) {
    // Fallback
    const grade = sim.isSustainable ? 'B' : 'C'
    return {
      grade,
      percentile: '상위 40%',
      summary: `현재 재무 상태를 분석한 결과, 은퇴 준비 ${sim.isSustainable ? '가능' : '점검 필요'} 상태입니다.`,
      strengths: ['재무 진단을 통한 현황 파악', '체계적 자산 관리 시작'],
      improvements: ['은퇴 준비 강화 필요', '지출 최적화 검토'],
      retirementReadiness: sim.isSustainable ? 70 : 45,
      taxStrategy: '전문가 상담을 통한 절세 전략 수립을 권고드립니다.',
      insuranceAdvice: '보장 공백 여부를 전문가와 확인하세요.',
      actionPlan: ['월 저축률 증가', '투자 포트폴리오 다각화', '연금 납입 한도 활용'],
      detailedAnalysis: sim.summary,
      rawData: {
        monthlyIncome: totalIncome,
        monthlyExpense: totalExpense,
        monthlySavings,
        savingsRate,
        totalAssets,
        totalDebt,
        netAsset,
        debtRatio,
        retirementSimulation: sim,
      }
    }
  }
}
