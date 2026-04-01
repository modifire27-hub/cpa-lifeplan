import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

// ==========================================
// 재무 함수 라이브러리
// ==========================================

function FV(rate: number, nper: number, pmt: number, pv: number = 0, type: number = 0): number {
  if (rate === 0) return -(pv + pmt * nper)
  const pow = Math.pow(1 + rate, nper)
  const fv = -pv * pow - pmt * ((pow - 1) / rate) * (1 + rate * type)
  return Math.round(fv)
}

function PV(rate: number, nper: number, pmt: number, fv: number = 0, type: number = 0): number {
  if (rate === 0) return -(fv + pmt * nper)
  const pow = Math.pow(1 + rate, nper)
  const result = -(fv + pmt * ((pow - 1) / rate) * (1 + rate * type)) / pow
  return Math.round(result)
}

function PMT(rate: number, nper: number, pv: number, fv: number = 0, type: number = 0): number {
  if (rate === 0) return -(pv + fv) / nper
  const pow = Math.pow(1 + rate, nper)
  const pmt = -(pv * pow + fv) / (((pow - 1) / rate) * (1 + rate * type))
  return Math.round(pmt)
}

function NPER(rate: number, pmt: number, pv: number, fv: number = 0, type: number = 0): number {
  if (rate === 0) return -(pv + fv) / pmt
  const z = pmt * (1 + rate * type)
  const numerator = -fv * rate + z
  const denominator = pv * rate + z
  if (denominator === 0 || numerator / denominator <= 0) return 9999
  const nper = Math.log(numerator / denominator) / Math.log(1 + rate)
  return Math.ceil(nper)
}

function RATE(nper: number, pmt: number, pv: number, fv: number = 0, type: number = 0, guess: number = 0.1): number {
  let rate = guess
  for (let i = 0; i < 100; i++) {
    if (rate <= -1) rate = -0.5
    const pow = Math.pow(1 + rate, nper)
    const f = pv * pow + pmt * ((pow - 1) / rate) * (1 + rate * type) + fv
    const df = nper * pv * Math.pow(1 + rate, nper - 1)
      + pmt * ((nper * Math.pow(1 + rate, nper - 1) * rate - (pow - 1)) / (rate * rate)) * (1 + rate * type)
      + pmt * ((pow - 1) / rate) * type
    if (df === 0) break
    const newRate = rate - f / df
    if (Math.abs(newRate - rate) < 1e-10) return newRate
    rate = newRate
  }
  return rate
}

function NPV(rate: number, cashflows: number[]): number {
  let npv = 0
  for (let i = 0; i < cashflows.length; i++) {
    npv += cashflows[i] / Math.pow(1 + rate, i + 1)
  }
  return Math.round(npv)
}

function IRR(cashflows: number[], guess: number = 0.1): number {
  let rate = guess
  for (let i = 0; i < 1000; i++) {
    let npv = 0
    let dnpv = 0
    for (let j = 0; j < cashflows.length; j++) {
      npv += cashflows[j] / Math.pow(1 + rate, j)
      dnpv -= j * cashflows[j] / Math.pow(1 + rate, j + 1)
    }
    if (dnpv === 0) break
    const newRate = rate - npv / dnpv
    if (Math.abs(newRate - rate) < 1e-10) return newRate
    rate = newRate
  }
  return rate
}

// ==========================================
// 자산별 성장률 상수
// ==========================================

const GROWTH_RATES = {
  // 예적금
  bankDeposit: 0.025,
  savingsAccount: 0.03,
  cmaAccount: 0.03,
  otherSavings: 0.025,
  // 투자
  stocks: 0.06,
  fundsEtf: 0.05,
  bonds: 0.035,
  crypto: 0.05,
  otherInvestments: 0.04,
  // 부동산
  selfOccupiedHome: 0.03,
  investmentProperty: 0.035,
  otherRealEstate: 0.03,
  // 연금 운용수익률
  nationalPension: 0.04,
  retirementPension: 0.04,
  personalPension: 0.04,
  // 기타
  insuranceRefund: 0.02,
  tenantDeposit: 0.02,  // 임대보증금 (받은 것 = 부채성)
  rentalDeposit: 0.02,  // 임차보증금 (준 것 = 자산)
  otherAssets: 0.02,
  // 물가상승률
  inflation: 0.025,
}

// 은퇴 후 인출 시 자산별 기대수익률
const WITHDRAWAL_RATES = {
  deposit: 0.025,       // 예적금
  investment: 0.045,    // 투자자산 (보수적)
  realEstate: 0.035,    // 부동산 (임대수익률)
  pension: 0.035,       // 연금
}

// ==========================================
// 대출 월 상환액 계산
// ==========================================

interface LoanPaymentDetail {
  loanType: string
  balance: number
  rate: number
  repayType: string
  monthlyPayment: number
  monthlyInterest: number
  monthlyPrincipal: number
  remainingMonths: number
  totalInterest: number
}

function calculateLoanPayments(data: any): LoanPaymentDetail[] {
  const loans: LoanPaymentDetail[] = []

  function addLoan(name: string, balance: number, rate: number, repayType: string, years: number) {
    if (!balance || balance <= 0) return
    const monthlyRate = (rate || 0) / 100 / 12
    const months = (years || 30) * 12
    let monthlyPayment = 0
    let monthlyInterest = balance * monthlyRate
    let monthlyPrincipal = 0
    let totalInterest = 0

    if (repayType === '원리금균등' && monthlyRate > 0) {
      monthlyPayment = Math.abs(PMT(monthlyRate, months, -balance, 0))
      monthlyInterest = balance * monthlyRate
      monthlyPrincipal = monthlyPayment - monthlyInterest
      totalInterest = monthlyPayment * months - balance
    } else if (repayType === '원금균등') {
      monthlyPrincipal = Math.round(balance / months)
      monthlyInterest = balance * monthlyRate
      monthlyPayment = monthlyPrincipal + monthlyInterest
      totalInterest = Math.round(balance * monthlyRate * (months + 1) / 2)
    } else {
      monthlyPayment = Math.round(monthlyInterest)
      monthlyPrincipal = 0
      totalInterest = Math.round(monthlyInterest * months)
    }

    loans.push({
      loanType: name,
      balance,
      rate: rate || 0,
      repayType: repayType || '미입력',
      monthlyPayment: Math.round(monthlyPayment),
      monthlyInterest: Math.round(monthlyInterest),
      monthlyPrincipal: Math.round(monthlyPrincipal),
      remainingMonths: months,
      totalInterest: Math.round(totalInterest)
    })
  }

  addLoan('주택담보대출', data.mortgageBalance, data.mortgageRate, data.mortgageRepayType, data.mortgageYears)
  addLoan('신용대출', data.creditLoanBalance, data.creditLoanRate, data.creditLoanRepayType, 5)
  addLoan('전세대출', data.jeonseeLoanBalance, data.jeonseeLoanRate, data.jeonseeLoanRepayType, 10)
  addLoan('사업자대출', data.businessLoanBalance, data.businessLoanRate, data.businessLoanRepayType, 10)

  return loans
}

// ==========================================
// 은퇴 시뮬레이션
// ==========================================

interface AssetProjection {
  category: string
  currentValue: number
  growthRate: number
  projectedValue: number
}

interface RetirementCashflow {
  source: string
  monthlyAmount: number
  annual: number
  note: string
}

interface WithdrawalPlan {
  assetCategory: string
  currentValue: number
  projectedValue: number
  annualReturn: number
  maxMonthlyWithdrawal: number
  note: string
}

interface RetirementSimulation {
  // 기본 정보
  currentAge: number
  retirementAge: number
  yearsToRetirement: number
  lifeExpectancy: number
  retirementYears: number

  // 은퇴 시점 자산 추정
  assetProjections: AssetProjection[]
  totalProjectedAssets: number
  totalProjectedDebt: number
  netProjectedAssets: number

  // 은퇴 후 월 현금흐름
  monthlyCashflows: RetirementCashflow[]
  totalMonthlyCashflow: number

  // 은퇴 후 필요 생활비
  monthlyLivingExpense: number
  monthlyGap: number

  // 자산 인출 계획
  withdrawalPlans: WithdrawalPlan[]
  totalMaxMonthlyWithdrawal: number
  totalAvailableMonthly: number

  // 자산 수명
  assetLifeYears: number
  isSustainable: boolean

  // 요약
  summary: string
}

function calculateRetirementSimulation(data: any, monthlyIncome: number, monthlyExpense: number, monthlySavings: number): RetirementSimulation {
  const currentAge = data.age || 30
  const retirementAge = 65
  const lifeExpectancy = 90
  const yearsToRetirement = Math.max(1, retirementAge - currentAge)
  const monthsToRetirement = yearsToRetirement * 12
  const retirementYears = lifeExpectancy - retirementAge

  // ── 1단계: 은퇴 시점 자산별 미래가치 ──

  const assetProjections: AssetProjection[] = []

  function projectAsset(category: string, name: string, value: number, rate: number, monthlyAdd: number = 0) {
    if (value <= 0 && monthlyAdd <= 0) return
    const projected = FV(rate / 12, monthsToRetirement, -monthlyAdd, -value)
    assetProjections.push({
      category,
      currentValue: value,
      growthRate: rate,
      projectedValue: Math.max(0, projected)
    })
  }

  // 예적금 (+ 월 저축 반영)
  const totalDeposit = (data.bankDeposit || 0) + (data.savingsAccount || 0) + (data.cmaAccount || 0) + (data.otherSavings || 0)
  const depositMonthlyAdd = (data.depositSavings || 0)
  projectAsset('예적금', '예적금', totalDeposit, GROWTH_RATES.bankDeposit, depositMonthlyAdd)

  // 투자자산 (+ 월 투자 반영)
  const totalInvestment = (data.stocks || 0) + (data.fundsEtf || 0) + (data.bonds || 0) + (data.crypto || 0) + (data.otherInvestments || 0)
  const investMonthlyAdd = (data.investmentSavings || 0)
  const investRate = totalInvestment > 0
    ? ((data.stocks || 0) * GROWTH_RATES.stocks
      + (data.fundsEtf || 0) * GROWTH_RATES.fundsEtf
      + (data.bonds || 0) * GROWTH_RATES.bonds
      + (data.crypto || 0) * GROWTH_RATES.crypto
      + (data.otherInvestments || 0) * GROWTH_RATES.otherInvestments) / totalInvestment
    : 0.05
  projectAsset('투자', '투자자산', totalInvestment, investRate, investMonthlyAdd)

  // 부동산
  if ((data.selfOccupiedHome || 0) > 0) {
    projectAsset('부동산', '자가거주', data.selfOccupiedHome, GROWTH_RATES.selfOccupiedHome)
  }
  if ((data.investmentProperty || 0) > 0) {
    projectAsset('부동산', '투자부동산', data.investmentProperty, GROWTH_RATES.investmentProperty)
  }
  if ((data.otherRealEstate || 0) > 0) {
    projectAsset('부동산', '기타부동산', data.otherRealEstate, GROWTH_RATES.otherRealEstate)
  }

  // 연금 (+ 월 납입 반영)
  const npMonthly = data.nationalPensionMonthly || 0
  const npPaid = data.nationalPensionPaid || 0
  projectAsset('연금', '국민연금', npPaid, GROWTH_RATES.nationalPension, npMonthly)

  const rpBalance = data.retirementPensionBalance || 0
  projectAsset('연금', '퇴직연금', rpBalance, GROWTH_RATES.retirementPension)

  const ppPaid = data.personalPensionPaid || 0
  const ppMonthly = data.personalPensionMonthly || 0
  projectAsset('연금', '개인연금', ppPaid, GROWTH_RATES.personalPension, ppMonthly)

  // 기타 자산
  const otherAssetTotal = (data.insuranceRefund || 0) + (data.otherAssets || 0)
  if (otherAssetTotal > 0) {
    projectAsset('기타', '기타자산', otherAssetTotal, GROWTH_RATES.otherAssets)
  }

  // 임차보증금 (내가 준 보증금 = 자산)
  if ((data.tenantDeposit || 0) > 0) {
    projectAsset('기타', '임차보증금(자산)', data.tenantDeposit, GROWTH_RATES.rentalDeposit)
  }

  const totalProjectedAssets = assetProjections.reduce((sum, a) => sum + a.projectedValue, 0)

  // 부채 추정 (은퇴 시점에는 대부분 상환 완료 가정)
  let totalProjectedDebt = 0
  // 임대보증금(받은 것)은 은퇴 시점에도 반환 의무
  if ((data.rentalDeposit || 0) > 0) {
    totalProjectedDebt += (data.rentalDeposit || 0)
  }
  // 만기일시 대출 중 은퇴 이후에도 남는 것
  if (data.creditLoanRepayType === '만기일시(이자만)' && (data.creditLoanBalance || 0) > 0) {
    totalProjectedDebt += (data.creditLoanBalance || 0)
  }

  const netProjectedAssets = totalProjectedAssets - totalProjectedDebt

  // ── 2단계: 은퇴 후 월 현금흐름 ──

  const monthlyCashflows: RetirementCashflow[] = []

  // 국민연금
  const npExpected = data.nationalPensionExpected || 0
  if (npExpected > 0) {
    monthlyCashflows.push({
      source: '국민연금',
      monthlyAmount: npExpected,
      annual: npExpected * 12,
      note: '65세부터 수령 (물가 연동)'
    })
  }

  // 개인연금
  const ppExpected = data.personalPensionExpected || 0
  if (ppExpected > 0) {
    monthlyCashflows.push({
      source: '개인연금',
      monthlyAmount: ppExpected,
      annual: ppExpected * 12,
      note: '연금 수령 개시 시'
    })
  }

  // 퇴직연금 (적립금 기반 월 수령 추정: 20년 수령 가정)
  if (rpBalance > 0) {
    const rpProjected = assetProjections.find(a => a.category === '연금' && a.currentValue === rpBalance)
    const rpFV = rpProjected ? rpProjected.projectedValue : rpBalance
    const rpMonthlyPayout = Math.round(rpFV / (20 * 12))
    monthlyCashflows.push({
      source: '퇴직연금',
      monthlyAmount: rpMonthlyPayout,
      annual: rpMonthlyPayout * 12,
      note: `적립금 ${rpFV.toLocaleString()}만원 기준 20년 수령`
    })
  }

  // 임대소득
  const rentalIncome = data.rentalIncome || 0
  if (rentalIncome > 0) {
    // 은퇴 시점에는 물가상승 반영
    const projectedRental = FV(GROWTH_RATES.inflation / 12, monthsToRetirement, 0, -rentalIncome)
    monthlyCashflows.push({
      source: '임대소득',
      monthlyAmount: Math.round(projectedRental),
      annual: Math.round(projectedRental) * 12,
      note: `현재 ${rentalIncome.toLocaleString()}만원 → 물가상승 반영`
    })
  }

  // 금융소득 (이자/배당)
  const financialIncome = data.financialIncome || 0
  if (financialIncome > 0) {
    monthlyCashflows.push({
      source: '금융소득',
      monthlyAmount: financialIncome,
      annual: financialIncome * 12,
      note: '이자/배당 소득'
    })
  }

  const totalMonthlyCashflow = monthlyCashflows.reduce((sum, c) => sum + c.monthlyAmount, 0)

  // ── 3단계: 은퇴 후 필요 생활비 ──

  // 현재 지출에서 대출상환, 교육비 제외 + 물가상승 반영
  const currentLiving = monthlyExpense - (data.loanRepayment || 0) - (data.education || 0)
  const monthlyLivingExpense = Math.round(FV(GROWTH_RATES.inflation / 12, monthsToRetirement, 0, -Math.max(currentLiving, 200)))
  const monthlyGap = monthlyLivingExpense - totalMonthlyCashflow

  // ── 4단계: 자산 인출 계획 (원금 유지 범위) ──

  const withdrawalPlans: WithdrawalPlan[] = []

  // 예적금 → 이자만 인출
  const projectedDeposit = assetProjections.filter(a => a.category === '예적금').reduce((s, a) => s + a.projectedValue, 0)
  if (projectedDeposit > 0) {
    const maxWithdrawal = Math.round(projectedDeposit * WITHDRAWAL_RATES.deposit / 12)
    withdrawalPlans.push({
      assetCategory: '예적금',
      currentValue: totalDeposit,
      projectedValue: projectedDeposit,
      annualReturn: WITHDRAWAL_RATES.deposit,
      maxMonthlyWithdrawal: maxWithdrawal,
      note: `연 ${(WITHDRAWAL_RATES.deposit * 100).toFixed(1)}% 이자 수취`
    })
  }

  // 투자자산 → 배당/수익만 인출
  const projectedInvestment = assetProjections.filter(a => a.category === '투자').reduce((s, a) => s + a.projectedValue, 0)
  if (projectedInvestment > 0) {
    const maxWithdrawal = Math.round(projectedInvestment * WITHDRAWAL_RATES.investment / 12)
    withdrawalPlans.push({
      assetCategory: '투자자산',
      currentValue: totalInvestment,
      projectedValue: projectedInvestment,
      annualReturn: WITHDRAWAL_RATES.investment,
      maxMonthlyWithdrawal: maxWithdrawal,
      note: `연 ${(WITHDRAWAL_RATES.investment * 100).toFixed(1)}% 수익 인출`
    })
  }

  // 투자부동산 → 임대수익
  const projectedInvProp = assetProjections.filter(a => a.category === '부동산' && a.currentValue === (data.investmentProperty || 0)).reduce((s, a) => s + a.projectedValue, 0)
  if (projectedInvProp > 0) {
    const maxWithdrawal = Math.round(projectedInvProp * WITHDRAWAL_RATES.realEstate / 12)
    withdrawalPlans.push({
      assetCategory: '투자부동산',
      currentValue: data.investmentProperty || 0,
      projectedValue: projectedInvProp,
      annualReturn: WITHDRAWAL_RATES.realEstate,
      maxMonthlyWithdrawal: maxWithdrawal,
      note: `연 ${(WITHDRAWAL_RATES.realEstate * 100).toFixed(1)}% 임대수익률`
    })
  }

  const totalMaxMonthlyWithdrawal = withdrawalPlans.reduce((sum, w) => sum + w.maxMonthlyWithdrawal, 0)
  const totalAvailableMonthly = totalMonthlyCashflow + totalMaxMonthlyWithdrawal

  // ── 5단계: 자산 수명 계산 ──

  let assetLifeYears = 999
  if (monthlyGap > 0 && totalMaxMonthlyWithdrawal < monthlyGap) {
    // 수익만으로 부족 → 원금 인출 필요
    const shortfall = monthlyGap - totalMaxMonthlyWithdrawal
    const liquidAssets = projectedDeposit + projectedInvestment
    if (shortfall > 0 && liquidAssets > 0) {
      // 원금을 인출하면서 남은 원금에 수익이 붙는 구조
      const avgRate = 0.03 / 12
      assetLifeYears = Math.round(NPER(avgRate, shortfall, -liquidAssets, 0) / 12)
    }
  }
  const isSustainable = totalAvailableMonthly >= monthlyLivingExpense || assetLifeYears >= retirementYears

  // ── 요약 ──

  let summary = ''
  if (isSustainable) {
    summary = `은퇴 시점(${retirementAge}세) 추정 순자산 ${netProjectedAssets.toLocaleString()}만원. `
      + `월 현금흐름 ${totalMonthlyCashflow.toLocaleString()}만원 + 자산수익 ${totalMaxMonthlyWithdrawal.toLocaleString()}만원 = `
      + `총 ${totalAvailableMonthly.toLocaleString()}만원으로, `
      + `예상 생활비 ${monthlyLivingExpense.toLocaleString()}만원을 자산 감소 없이 충당 가능합니다.`
  } else if (assetLifeYears >= retirementYears) {
    summary = `은퇴 시점 추정 순자산 ${netProjectedAssets.toLocaleString()}만원. `
      + `월 수익만으로는 부족하나, 원금 인출 시 약 ${assetLifeYears}년간 유지 가능하여 ${lifeExpectancy}세까지 커버됩니다.`
  } else {
    summary = `은퇴 시점 추정 순자산 ${netProjectedAssets.toLocaleString()}만원. `
      + `현재 추세로는 은퇴 후 약 ${assetLifeYears}년 후 자산 고갈 위험이 있습니다. `
      + `저축률 증대 또는 자산 수익률 개선이 시급합니다.`
  }

  return {
    currentAge,
    retirementAge,
    yearsToRetirement,
    lifeExpectancy,
    retirementYears,
    assetProjections,
    totalProjectedAssets,
    totalProjectedDebt,
    netProjectedAssets,
    monthlyCashflows,
    totalMonthlyCashflow,
    monthlyLivingExpense,
    monthlyGap,
    withdrawalPlans,
    totalMaxMonthlyWithdrawal,
    totalAvailableMonthly,
    assetLifeYears: Math.min(assetLifeYears, 100),
    isSustainable,
    summary
  }
}

// ==========================================
// 목표 시뮬레이션 계산
// ==========================================

interface GoalSimulationResult {
  goalType: string
  targetAmount: number
  currentSaved: number
  gap: number
  monthlyNeeded: number
  monthlyNeededConservative: number
  achievability: string
  targetYear: number
  remainingMonths: number
  assumedReturn: number
  futureValueOfCurrent: number
  comment: string
}

function getAssumedReturn(remainingYears: number): number {
  if (remainingYears <= 3) return 0.03
  if (remainingYears <= 7) return 0.05
  return 0.07
}

function estimateCurrentSaved(goalType: string, data: any): number {
  const type = goalType || ''
  if (type.indexOf('교육') >= 0) {
    return Math.round((data.bankDeposit || 0) * 0.2 + (data.savingsAccount || 0) * 0.3)
  }
  if (type.indexOf('주택') >= 0 || type.indexOf('내집') >= 0) {
    return Math.round((data.bankDeposit || 0) * 0.3 + (data.savingsAccount || 0) * 0.5
      + (data.stocks || 0) * 0.2 + (data.fundsEtf || 0) * 0.2)
  }
  if (type.indexOf('은퇴') >= 0 || type.indexOf('노후') >= 0) {
    return (data.nationalPensionPaid || 0) + (data.retirementPensionBalance || 0)
      + (data.personalPensionPaid || 0) + Math.round((data.stocks || 0) * 0.3)
  }
  if (type.indexOf('결혼') >= 0) {
    return Math.round((data.bankDeposit || 0) * 0.4 + (data.savingsAccount || 0) * 0.5)
  }
  return Math.round((data.bankDeposit || 0) * 0.1 + (data.savingsAccount || 0) * 0.2)
}

function calculateGoalSimulations(data: any, monthlySavings: number): GoalSimulationResult[] {
  const goals = data.goals || []
  if (goals.length === 0) return []
  const currentYear = new Date().getFullYear()

  return goals.map((goal: any) => {
    const targetYear = goal.targetYear || (currentYear + 10)
    const targetAmount = goal.amount || 0
    const remainingYears = Math.max(1, targetYear - currentYear)
    const remainingMonths = remainingYears * 12
    const annualReturn = getAssumedReturn(remainingYears)
    const monthlyReturn = annualReturn / 12
    const currentSaved = estimateCurrentSaved(goal.type, data)
    const fvCurrent = FV(monthlyReturn, remainingMonths, 0, -currentSaved)
    const gapFV = Math.max(0, targetAmount - fvCurrent)

    let monthlyNeeded = 0
    if (gapFV > 0 && remainingMonths > 0) {
      monthlyNeeded = Math.abs(PMT(monthlyReturn, remainingMonths, 0, gapFV))
    }

    const nominalGap = Math.max(0, targetAmount - currentSaved)
    const monthlyNeededConservative = nominalGap > 0 ? Math.round(nominalGap / remainingMonths) : 0

    let achievability = '달성가능'
    const ratio = monthlySavings > 0 ? monthlyNeeded / monthlySavings : 999
    if (ratio > 1.5) achievability = '재검토필요'
    else if (ratio > 0.5) achievability = '노력필요'

    let comment = ''
    if (achievability === '달성가능') {
      comment = `현재 저축 여력으로 충분히 달성 가능합니다. 연 ${(annualReturn * 100).toFixed(0)}% 수익률 가정 시 월 ${monthlyNeeded.toLocaleString()}만원 적립으로 목표 도달 가능합니다.`
    } else if (achievability === '노력필요') {
      comment = `월 저축액 대비 ${Math.round(ratio * 100)}% 배분이 필요합니다. 연 ${(annualReturn * 100).toFixed(0)}% 수익률 가정 기준이며, 저축 증액 또는 투자 수익률 제고를 병행하세요.`
      if (monthlyNeededConservative > monthlyNeeded) {
        comment += ` (수익률 0% 시 월 ${monthlyNeededConservative.toLocaleString()}만원 필요)`
      }
    } else {
      let adjustedYears = remainingYears + 10
      if (monthlySavings > 0) {
        const availableMonthly = Math.round(monthlySavings * 0.7)
        if (availableMonthly > 0) {
          const nperNeeded = NPER(monthlyReturn, -availableMonthly, -currentSaved, targetAmount)
          if (nperNeeded < 9999) adjustedYears = Math.ceil(nperNeeded / 12)
        }
      }
      comment = `현재 월 저축액(${monthlySavings.toLocaleString()}만원) 대비 목표가 높습니다. 목표 시기를 ${currentYear + adjustedYears}년으로 조정하거나, 목표 금액 하향 또는 추가 수입원 확보를 검토하세요.`
    }

    return {
      goalType: goal.type || '기타',
      targetAmount,
      currentSaved,
      gap: nominalGap,
      monthlyNeeded,
      monthlyNeededConservative,
      achievability,
      targetYear,
      remainingMonths,
      assumedReturn: annualReturn,
      futureValueOfCurrent: fvCurrent,
      comment
    }
  })
}

// ==========================================
// 연금 수령액 시뮬레이션
// ==========================================

interface PensionProjection {
  nationalPension: { currentPaid: number; monthlyContribution: number; expectedMonthly: number; projectedTotal: number }
  retirementPension: { currentBalance: number; type: string; projectedBalance: number }
  personalPension: { currentPaid: number; monthlyContribution: number; expectedMonthly: number; projectedTotal: number }
  totalMonthlyAtRetirement: number
  replacementRate: number
}

function calculatePensionProjection(data: any, monthlyIncome: number): PensionProjection {
  const retirementAge = 65
  const currentAge = data.age || 30
  const yearsToRetirement = Math.max(1, retirementAge - currentAge)
  const monthsToRetirement = yearsToRetirement * 12

  const npPaid = data.nationalPensionPaid || 0
  const npMonthly = data.nationalPensionMonthly || 0
  const npExpected = data.nationalPensionExpected || 0
  const npProjected = npExpected > 0 ? npExpected : (npMonthly > 0 ? Math.round(npMonthly * 0.4 * yearsToRetirement / 10) : 0)

  const rpBalance = data.retirementPensionBalance || 0
  const rpType = data.retirementPensionType || ''
  const rpReturn = rpType === 'DC형' ? 0.04 : 0.03
  const rpProjected = FV(rpReturn / 12, monthsToRetirement, 0, -rpBalance)

  const ppPaid = data.personalPensionPaid || 0
  const ppMonthly = data.personalPensionMonthly || 0
  const ppExpected = data.personalPensionExpected || 0
  const ppProjected = ppExpected > 0 ? ppExpected * 12 : (ppMonthly > 0 ? FV(0.04 / 12, monthsToRetirement, -ppMonthly, -ppPaid) : ppPaid)

  const totalMonthly = npProjected + Math.round(rpProjected / (20 * 12)) + (ppExpected || Math.round(ppProjected / (20 * 12)))
  const replacementRate = monthlyIncome > 0 ? Math.round((totalMonthly / monthlyIncome) * 100) : 0

  return {
    nationalPension: { currentPaid: npPaid, monthlyContribution: npMonthly, expectedMonthly: npProjected, projectedTotal: npProjected * 20 * 12 },
    retirementPension: { currentBalance: rpBalance, type: rpType, projectedBalance: rpProjected },
    personalPension: { currentPaid: ppPaid, monthlyContribution: ppMonthly, expectedMonthly: ppExpected || Math.round(ppProjected / (20 * 12)), projectedTotal: ppProjected },
    totalMonthlyAtRetirement: totalMonthly,
    replacementRate
  }
}

// ==========================================
// Gemini AI 분석
// ==========================================

export async function analyzeFinancial(data: any) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  // ── 자산 계산 ──
  const totalSavings = (data.bankDeposit || 0) + (data.savingsAccount || 0) + (data.cmaAccount || 0) + (data.otherSavings || 0)
  const totalInvestments = (data.stocks || 0) + (data.fundsEtf || 0) + (data.bonds || 0) + (data.crypto || 0) + (data.otherInvestments || 0)
  const totalRealEstate = (data.selfOccupiedHome || 0) + (data.investmentProperty || 0) + (data.otherRealEstate || 0)
  const totalPension = (data.nationalPensionPaid || 0) + (data.retirementPensionBalance || 0) + (data.personalPensionPaid || 0)
  const totalOtherAssets = (data.insuranceRefund || 0) + (data.tenantDeposit || 0) + (data.otherAssets || 0)
  const totalAssets = totalSavings + totalInvestments + totalRealEstate + totalPension + totalOtherAssets

  // ── 부채 계산 (임대보증금 = 부채) ──
  const totalDebt = (data.mortgageBalance || 0) + (data.creditLoanBalance || 0)
    + (data.rentalDeposit || 0)  // 임대보증금 (받은 것 = 반환 의무 = 부채)
    + (data.jeonseeLoanBalance || 0) + (data.businessLoanBalance || 0) + (data.otherDebtBalance || 0)
  const netAsset = totalAssets - totalDebt

  // ── 현금흐름 ──
  const monthlyIncome = (data.salaryIncome || 0) + (data.businessIncome || 0) + (data.financialIncome || 0) + (data.rentalIncome || 0) + (data.otherIncome || 0)
  const monthlyExpense = (data.housing || 0) + (data.loanRepayment || 0) + (data.insurance || 0) + (data.communication || 0) + (data.education || 0) + (data.transportation || 0) + (data.living || 0) + (data.leisure || 0) + (data.otherExpense || 0)
  const monthlySavings = (data.depositSavings || 0) + (data.investmentSavings || 0) + (data.pensionSavings || 0) + (data.otherSavingAmount || 0)
  const surplus = monthlyIncome - monthlyExpense - monthlySavings
  const savingsRate = monthlyIncome > 0 ? Math.round((monthlySavings / monthlyIncome) * 100) : 0
  const debtRatio = totalAssets > 0 ? Math.round((totalDebt / totalAssets) * 100) : 0

  // ── 재무함수 기반 계산 ──
  const loanDetails = calculateLoanPayments(data)
  const goalSimulations = calculateGoalSimulations(data, monthlySavings)
  const pensionProjection = calculatePensionProjection(data, monthlyIncome)
  const retirementSim = calculateRetirementSimulation(data, monthlyIncome, monthlyExpense, monthlySavings)

  // ── 대출 정보 문자열 ──
  const loanContext = loanDetails.length > 0
    ? loanDetails.map(l =>
      `${l.loanType}: 잔액 ${l.balance.toLocaleString()}만원, 금리 ${l.rate}%, `
      + `상환방식 ${l.repayType}, 월상환 ${l.monthlyPayment.toLocaleString()}만원 `
      + `(이자 ${l.monthlyInterest.toLocaleString()} + 원금 ${l.monthlyPrincipal.toLocaleString()}), `
      + `총이자 ${l.totalInterest.toLocaleString()}만원`
    ).join('\n')
    : '대출 없음'

  // ── 목표 시뮬레이션 문자열 ──
  const goalContext = goalSimulations.length > 0
    ? goalSimulations.map(g =>
      `${g.goalType}: 목표 ${g.targetAmount.toLocaleString()}만원(${g.targetYear}년), `
      + `현재 ${g.currentSaved.toLocaleString()}만원, `
      + `연 ${(g.assumedReturn * 100).toFixed(0)}% 가정 시 월 ${g.monthlyNeeded.toLocaleString()}만원 필요, `
      + `판정: ${g.achievability}`
    ).join('\n')
    : '설정된 목표 없음'

  // ── 은퇴 시뮬레이션 문자열 ──
  const retirementContext = `은퇴 시점(${retirementSim.retirementAge}세, ${retirementSim.yearsToRetirement}년 후):
- 추정 총자산: ${retirementSim.totalProjectedAssets.toLocaleString()}만원
- 추정 부채: ${retirementSim.totalProjectedDebt.toLocaleString()}만원
- 추정 순자산: ${retirementSim.netProjectedAssets.toLocaleString()}만원
- 은퇴 후 월 현금흐름: ${retirementSim.totalMonthlyCashflow.toLocaleString()}만원 (${retirementSim.monthlyCashflows.map(c => c.source + ' ' + c.monthlyAmount.toLocaleString() + '만원').join(', ')})
- 자산수익 기반 월 인출 가능액: ${retirementSim.totalMaxMonthlyWithdrawal.toLocaleString()}만원 (원금 유지)
- 총 가용 월액: ${retirementSim.totalAvailableMonthly.toLocaleString()}만원
- 예상 월 생활비: ${retirementSim.monthlyLivingExpense.toLocaleString()}만원
- 월 과부족: ${retirementSim.monthlyGap > 0 ? '-' : '+'}${Math.abs(retirementSim.monthlyGap).toLocaleString()}만원
- 자산 수명: ${retirementSim.assetLifeYears >= 100 ? '무기한' : retirementSim.assetLifeYears + '년'}
- 지속 가능: ${retirementSim.isSustainable ? '예' : '아니오'}`

  // ── 자산 구성 비율 ──
  const assetBreakdown = totalAssets > 0
    ? `예적금 ${Math.round(totalSavings / totalAssets * 100)}%, 투자 ${Math.round(totalInvestments / totalAssets * 100)}%, 부동산 ${Math.round(totalRealEstate / totalAssets * 100)}%, 연금 ${Math.round(totalPension / totalAssets * 100)}%, 기타 ${Math.round(totalOtherAssets / totalAssets * 100)}%`
    : '자산 없음'

  // ── 임대보증금 상세 ──
  const rentalDepositContext = (data.rentalDeposit || 0) > 0
    ? `임대보증금(받은 것): ${(data.rentalDeposit || 0).toLocaleString()}만원 — 이는 세입자에게 반환해야 하는 부채성 항목입니다.`
    : '임대보증금 없음'

  const prompt = `당신은 대한민국 최고의 재무설계 전문가(CPA/CFP)입니다.
아래 고객 데이터와 시스템이 계산한 시뮬레이션 결과를 분석하여 JSON 형식으로 결과를 반환하세요.

[고객 기본 정보]
- 나이: ${data.age}세
- 결혼: ${data.maritalStatus}
- 자녀: ${(data.children || []).length}명
- 직업: ${data.jobType}
${data.jobType === '개인사업자' || data.jobType === '프리랜서' ? `- 업종: ${data.industry || '미입력'}\n- 연매출: ${(data.annualRevenue || 0).toLocaleString()}만원\n- 세무관리: ${data.taxManagement || '미입력'}\n- 절세관심: ${(data.taxConcerns || []).join(', ') || '없음'}` : `- 연봉: ${(data.annualSalary || 0).toLocaleString()}만원\n- 퇴직준비: ${data.retirementPlanType || '미입력'}\n- 가입보험: ${(data.insuranceTypes || []).join(', ') || '없음'}\n- 월보험료: ${data.monthlyInsurance || 0}만원\n- 보험점검: ${data.lastInsuranceReview || '미입력'}`}

[자산 현황] 총 ${totalAssets.toLocaleString()}만원
- 구성: ${assetBreakdown}
- 예적금: 은행 ${data.bankDeposit || 0}, 적금 ${data.savingsAccount || 0}, CMA ${data.cmaAccount || 0}
- 투자: 주식 ${data.stocks || 0}, 펀드/ETF ${data.fundsEtf || 0}, 채권 ${data.bonds || 0}, 코인 ${data.crypto || 0}
- 부동산: 자가 ${data.selfOccupiedHome || 0}, 투자용 ${data.investmentProperty || 0}, 기타 ${data.otherRealEstate || 0}
- 연금: 국민연금납입 ${data.nationalPensionPaid || 0}, 퇴직연금 ${data.retirementPensionBalance || 0}, 개인연금 ${data.personalPensionPaid || 0}
- 임차보증금(자산): ${data.tenantDeposit || 0}만원

[부채 현황] 총 ${totalDebt.toLocaleString()}만원
${loanContext}
${rentalDepositContext}

[현금흐름]
- 월수입: ${monthlyIncome.toLocaleString()}만원
- 월지출: ${monthlyExpense.toLocaleString()}만원
- 월저축: ${monthlySavings.toLocaleString()}만원
- 저축률: ${savingsRate}%, 부채비율: ${debtRatio}%

[은퇴 시뮬레이션 (시스템 재무함수 기반 계산 결과)]
${retirementContext}
※ 위 수치는 시스템이 재무함수(FV/PMT/NPER)로 정확히 계산한 값입니다.

[목표 시뮬레이션 (시스템 재무함수 기반 계산 결과)]
${goalContext}
※ 위 수치는 시스템이 재무함수로 정확히 계산한 값입니다.

다음 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{
  "grade": "A+/A/B+/B/C+/C/D 중 하나",
  "percentile": 상위 몇 % (숫자만),
  "summary": "2~3문장의 핵심 진단 요약. 은퇴 시뮬레이션 결과를 반영할 것.",
  "scores": {
    "netAsset": {"score": 0-100, "comment": "한줄 평가"},
    "savingsRate": {"score": 0-100, "comment": "한줄 평가"},
    "debtManagement": {"score": 0-100, "comment": "한줄 평가. 임대보증금은 부채성 항목임을 반영"},
    "investmentDiversity": {"score": 0-100, "comment": "한줄 평가"},
    "retirementPrep": {"score": 0-100, "comment": "은퇴 시뮬레이션 결과 기반 평가"}
  },
  "debtAnalysis": {
    "totalDebt": ${totalDebt},
    "highestRateLoan": "가장 높은 금리 대출명 및 금리",
    "comment": "부채 상황 종합 평가. 임대보증금 반환 의무 포함",
    "recommendations": ["구체적 부채 관리 조언 1", "조언 2", "조언 3"]
  },
  "retirementAnalysis": {
    "summary": "은퇴 시뮬레이션 결과 요약 (추정 자산, 월 현금흐름, 자산 수명 등)",
    "monthlyBreakdown": "은퇴 후 월 수입원별 금액 설명",
    "withdrawalStrategy": "자산별 인출 전략 설명 (원금 유지 범위)",
    "recommendations": ["은퇴 준비 구체적 조언 1", "조언 2", "조언 3"]
  },
  "recommendations": {
    "immediate": ["지금 즉시 실행할 조언 1", "조언 2", "조언 3"],
    "shortTerm": ["6개월~1년 내 실행할 조언 1", "조언 2", "조언 3"],
    "longTerm": ["3~5년 장기 전략 1", "전략 2", "전략 3"]
  },
  "jobSpecific": {
    "insights": ["직업 특화 인사이트 1", "인사이트 2", "인사이트 3", "인사이트 4"]
  }
}`

  try {
    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('JSON 파싱 실패')

    const parsed = JSON.parse(jsonMatch[0])

    // 시스템 계산 결과로 덮어쓰기
    parsed.goalSimulations = goalSimulations
    parsed.rawData = {
      totalAssets, totalDebt, netAsset,
      monthlyIncome, monthlyExpense, monthlySavings, surplus, savingsRate, debtRatio,
      assetBreakdown: { savings: totalSavings, investments: totalInvestments, realEstate: totalRealEstate, pension: totalPension, other: totalOtherAssets },
      loanDetails, pensionProjection, retirementSimulation: retirementSim
    }

    return parsed
  } catch (error) {
    console.error('Gemini API 오류:', error)
    return generateFallbackResult(data, {
      totalAssets, totalDebt, netAsset,
      monthlyIncome, monthlyExpense, monthlySavings, surplus, savingsRate, debtRatio,
      totalSavings, totalInvestments, totalRealEstate, totalPension, totalOtherAssets,
      loanDetails, goalSimulations, pensionProjection, retirementSim
    })
  }
}

// ==========================================
// Fallback
// ==========================================

function generateFallbackResult(data: any, calc: any) {
  let score = 50
  if (calc.netAsset > 100000) score += 20
  else if (calc.netAsset > 50000) score += 15
  else if (calc.netAsset > 20000) score += 10
  else if (calc.netAsset > 0) score += 5
  if (calc.savingsRate >= 30) score += 15
  else if (calc.savingsRate >= 20) score += 10
  else if (calc.savingsRate >= 10) score += 5
  if (calc.debtRatio <= 20) score += 10
  else if (calc.debtRatio <= 40) score += 5
  else if (calc.debtRatio > 60) score -= 10

  let grade = 'C'
  if (score >= 90) grade = 'A+'
  else if (score >= 80) grade = 'A'
  else if (score >= 70) grade = 'B+'
  else if (score >= 60) grade = 'B'
  else if (score >= 50) grade = 'C+'
  else if (score >= 40) grade = 'C'
  else grade = 'D'

  const rs = calc.retirementSim

  return {
    grade,
    percentile: Math.max(5, Math.min(95, score)),
    summary: `${data.age}세 ${data.jobType}, 순자산 ${calc.netAsset.toLocaleString()}만원. ${rs.summary}`,
    scores: {
      netAsset: { score: Math.min(100, Math.round(calc.netAsset / 1000)), comment: '순자산 기반 평가' },
      savingsRate: { score: Math.min(100, calc.savingsRate * 3), comment: `저축률 ${calc.savingsRate}%` },
      debtManagement: { score: Math.max(0, 100 - calc.debtRatio), comment: `부채비율 ${calc.debtRatio}%` },
      investmentDiversity: { score: calc.totalInvestments > 0 ? 50 : 10, comment: '전문 상담 필요' },
      retirementPrep: { score: rs.isSustainable ? 70 : 30, comment: rs.isSustainable ? '은퇴 자금 충분' : '은퇴 준비 보강 필요' }
    },
    debtAnalysis: {
      totalDebt: calc.totalDebt,
      highestRateLoan: '전문 상담 필요',
      comment: '부채 최적화를 위한 전문 상담을 권장합니다.',
      recommendations: ['고금리 대출 우선 상환', '대출 금리 재협상', '임대보증금 반환 준비']
    },
    retirementAnalysis: {
      summary: rs.summary,
      monthlyBreakdown: `연금 ${rs.totalMonthlyCashflow.toLocaleString()}만원 + 자산수익 ${rs.totalMaxMonthlyWithdrawal.toLocaleString()}만원`,
      withdrawalStrategy: '전문 상담을 통한 인출 전략 수립 권장',
      recommendations: ['저축률 개선', '투자 포트폴리오 다각화', '연금 추가 납입 검토']
    },
    goalSimulations: calc.goalSimulations,
    recommendations: {
      immediate: ['월 지출 점검', '비상자금 확보', '전문 상담 신청'],
      shortTerm: ['저축률 20% 이상 목표', '투자 포트폴리오 구성', '보험 점검'],
      longTerm: ['연금 최적화', '자산 배분 전략', '세금 최적화']
    },
    jobSpecific: { insights: ['전문가 상담을 통한 맞춤 전략이 필요합니다.'] },
    rawData: {
      totalAssets: calc.totalAssets, totalDebt: calc.totalDebt, netAsset: calc.netAsset,
      monthlyIncome: calc.monthlyIncome, monthlyExpense: calc.monthlyExpense,
      monthlySavings: calc.monthlySavings, surplus: calc.surplus,
      savingsRate: calc.savingsRate, debtRatio: calc.debtRatio,
      assetBreakdown: { savings: calc.totalSavings, investments: calc.totalInvestments, realEstate: calc.totalRealEstate, pension: calc.totalPension, other: calc.totalOtherAssets },
      loanDetails: calc.loanDetails, pensionProjection: calc.pensionProjection,
      retirementSimulation: calc.retirementSim
    }
  }
}
