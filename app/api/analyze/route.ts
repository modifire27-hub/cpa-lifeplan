import { NextRequest, NextResponse } from 'next/server'
import { analyzeFinancial } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const d = body.diagData || body
    const contact = body.contact || {
      name:  d.contactName  || '',
      phone: d.contactPhone || '',
      email: d.contactEmail || '',
    }

    // ── 나이 자동 계산 (출생연월 기반) ──
    const birthYear  = Number(d.birthYear)  || 0
    const birthMonth = Number(d.birthMonth) || 0
    let age = Number(d.age) || 0
    if (birthYear > 0 && birthMonth > 0) {
      const today = new Date()
      age = today.getFullYear() - birthYear
      if (today.getMonth() + 1 < birthMonth) age -= 1
    }

    // ── 필드명 정규화 (구 필드명 → 현재 필드명 양방향 대응) ──
    const data = {
      // 기본 정보
      age,
      birthYear,
      birthMonth,
      maritalStatus:       d.maritalStatus       || '',
      children:            d.children            || [],
      childrenCount:       d.childrenCount        || (d.children ? d.children.length : 0),
      jobType:             d.jobType             || '',
      industry:            d.industry            || '',
      annualRevenue:       Number(d.annualRevenue)       || 0,
      taxManagement:       d.taxManagement        || '',
      taxConcerns:         d.taxConcerns          || [],
      annualSalary:        Number(d.annualSalary)        || 0,
      retirementPlanType:  d.retirementPlanType   || '',
      insuranceTypes:      d.insuranceTypes       || [],
      monthlyInsurance:    Number(d.monthlyInsurance)    || 0,
      lastInsuranceReview: d.lastInsuranceReview  || '',
      retirementTargetAge:      Number(d.retirementTargetAge)      || 60,
      retirementMonthlyExpense: Number(d.retirementMonthlyExpense) || 0,

      // 예적금·현금성
      bankDeposit:    Number(d.bankDeposit)                       || 0,
      savingsAccount: Number(d.savingsAccount  || d.savings)      || 0,
      cmaAccount:     Number(d.cmaAccount      || d.cma)          || 0,
      otherSavings:   Number(d.otherSavings)                      || 0,

      // 투자
      stocks:          Number(d.stocks)                           || 0,
      fundsEtf:        Number(d.fundsEtf        || d.fundETF)     || 0,
      bonds:           Number(d.bonds)                            || 0,
      crypto:          Number(d.crypto)                           || 0,
      otherInvestments:Number(d.otherInvestments|| d.otherInvestment) || 0,

      // 부동산
      selfOccupiedHome:   Number(d.selfOccupiedHome  || d.ownHome)       || 0,
      investmentProperty: Number(d.investmentProperty)                   || 0,
      otherRealEstate:    Number(d.otherRealEstate   || d.otherProperty) || 0,

      // 연금
      nationalPensionPaid:      Number(d.nationalPensionPaid      || d.nationalPensionTotal)  || 0,
      nationalPensionMonthly:   Number(d.nationalPensionMonthly)                              || 0,
      nationalPensionExpected:  Number(d.nationalPensionExpected)                             || 0,
      retirementPensionBalance: Number(d.retirementPensionBalance)                            || 0,
      retirementPensionMonthly: Number(d.retirementPensionMonthly)                            || 0,
      retirementPensionType:    d.retirementPensionType || '',
      personalPensionPaid:      Number(d.personalPensionPaid      || d.personalPensionTotal)  || 0,
      personalPensionMonthly:   Number(d.personalPensionMonthly)                              || 0,
      personalPensionExpected:  Number(d.personalPensionExpected)                             || 0,

      // 기타 자산
      insuranceRefund: Number(d.insuranceRefund || d.insuranceSurrenderValue) || 0,
      tenantDeposit:   Number(d.tenantDeposit)                                || 0,
      otherAssets:     Number(d.otherAssets)                                  || 0,

      // 부채 잔액
      mortgageBalance:    Number(d.mortgageBalance)                         || 0,
      creditLoanBalance:  Number(d.creditLoanBalance)                       || 0,
      jeonseeLoanBalance: Number(d.jeonseeLoanBalance || d.jeonseBalance)   || 0,
      rentalDeposit:      Number(d.rentalDeposit      || d.rentalDepositLiability) || 0,
      businessLoanBalance:Number(d.businessLoanBalance)                     || 0,
      otherDebtBalance:   Number(d.otherDebtBalance   || d.otherDebt)       || 0,

      // 부채 금리·방식 (이메일 보고서용)
      mortgageRate:          Number(d.mortgageRate)         || 0,
      mortgageYears:         Number(d.mortgageYears         || d.mortgageRemaining) || 0,
      mortgageRepayType:     d.mortgageRepayType            || '',
      creditLoanRate:        Number(d.creditLoanRate)       || 0,
      creditLoanRepayType:   d.creditLoanRepayType          || '',
      jeonseeLoanRate:       Number(d.jeonseeLoanRate       || d.jeonseRate)       || 0,
      jeonseeLoanRepayType:  d.jeonseeLoanRepayType         || d.jeonseRepayType   || '',
      businessLoanRate:      Number(d.businessLoanRate)     || 0,
      businessLoanRepayType: d.businessLoanRepayType        || '',
      otherDebtRate:         Number(d.otherDebtRate)        || 0,

      // LoanDetail 구조 (부채 잔액 자동계산용)
      mortgageLoan: d.mortgageLoan || {
        balance:         Number(d.mortgageBalance)    || 0,
        monthlyPayment:  Number(d.mortgageLoan?.monthlyPayment)  || 0,
        remainingMonths: Number(d.mortgageYears || d.mortgageRemaining || 0) * 12,
        repaymentType:   d.mortgageRepayType || 'principal_interest',
      },
      creditLoan: d.creditLoan || {
        balance:         Number(d.creditLoanBalance)  || 0,
        monthlyPayment:  Number(d.creditLoan?.monthlyPayment)    || 0,
        remainingMonths: Number(d.creditLoan?.remainingMonths)   || 0,
        repaymentType:   d.creditLoanRepayType || 'principal_interest',
      },
      jeonseLoan: d.jeonseLoan || {
        balance:         Number(d.jeonseeLoanBalance  || d.jeonseBalance) || 0,
        monthlyPayment:  0,
        remainingMonths: 0,
        repaymentType:   d.jeonseeLoanRepayType || 'bullet',
      },
      businessLoan: d.businessLoan || {
        balance:         Number(d.businessLoanBalance) || 0,
        monthlyPayment:  Number(d.businessLoan?.monthlyPayment)  || 0,
        remainingMonths: Number(d.businessLoan?.remainingMonths) || 0,
        repaymentType:   d.businessLoanRepayType || 'principal_interest',
      },
      otherDebt: d.otherDebt_detail || {
        balance:         Number(d.otherDebtBalance || d.otherDebt) || 0,
        monthlyPayment:  0,
        remainingMonths: 0,
        repaymentType:   'principal_interest',
      },

      // 수입
      salaryIncome:    Number(d.salaryIncome)    || 0,
      businessIncome:  Number(d.businessIncome)  || 0,
      financialIncome: Number(d.financialIncome) || 0,
      rentalIncome:    Number(d.rentalIncome)    || 0,
      otherIncome:     Number(d.otherIncome)     || 0,

      // 지출
      housing:        Number(d.housing)        || 0,
      loanRepayment:  Number(d.loanRepayment)  || 0,
      insurance:      Number(d.insurance)      || 0,
      communication:  Number(d.communication)  || 0,
      education:      Number(d.education)      || 0,
      transportation: Number(d.transportation) || 0,
      living:         Number(d.living)         || 0,
      leisure:        Number(d.leisure)        || 0,
      otherExpense:   Number(d.otherExpense)   || 0,

      // 저축·투자
      depositSavings:    Number(d.depositSavings)    || 0,
      investmentSavings: Number(d.investmentSavings) || 0,
      pensionSavings:    Number(d.pensionSavings)    || 0,
      otherSavingAmount: Number(d.otherSavingAmount) || 0,

      // 목표
      goals: d.goals || [],
    }

    // ── Gemini AI 분석 ──
    const result = await analyzeFinancial(data)

    return NextResponse.json({ status: 'success', ...result })

  } catch (err: any) {
    console.error('[analyze] 오류:', err)
    return NextResponse.json(
      { status: 'error', message: err.message || '서버 오류' },
      { status: 500 }
    )
  }
}
