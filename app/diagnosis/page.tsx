'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

// ══════════════════════════════════════════════
// Types
// ══════════════════════════════════════════════
interface ChildInfo {
  age: number
}

interface LoanDetail {
  balance: number
  monthlyPayment: number
  remainingMonths: number
  repaymentType: 'principal_interest' | 'interest_only' | 'bullet'
}

interface Goal {
  type: string
  targetAmount: number
  targetYear: number
  priority: number
}

interface FormData {
  // Step 1
  birthYear:            number
  birthMonth:           number
  retirementTargetAge:  number
  maritalStatus:        string
  children:             ChildInfo[]
  // Step 2 – 자산
  bankDeposit:          number
  savingsAccount:       number
  cmaAccount:           number
  otherSavings:         number
  stocks:               number
  fundsEtf:             number
  bonds:                number
  crypto:               number
  otherInvestments:     number
  selfOccupiedHome:     number
  investmentProperty:   number
  otherRealEstate:      number
  nationalPensionPaid:  number
  nationalPensionMonthly: number
  nationalPensionExpected: number
  retirementPensionBalance: number
  retirementPensionMonthly: number
  retirementPensionType:  string
  personalPensionPaid:    number
  personalPensionMonthly: number
  personalPensionExpected: number
  insuranceRefund:      number
  tenantDeposit:        number
  otherAssets:          number
  // Step 3 – 부채
  mortgageLoan:         LoanDetail
  creditLoan:           LoanDetail
  jeonseLoan:           LoanDetail
  businessLoan:         LoanDetail
  otherDebt:            LoanDetail
  rentalDeposit:        number
  // Step 4 – 수입/지출/저축
  salaryIncome:         number
  businessIncome:       number
  financialIncome:      number
  rentalIncome:         number
  otherIncome:          number
  housing:              number
  loanRepayment:        number
  insurance:            number
  communication:        number
  education:            number
  transportation:       number
  living:               number
  leisure:              number
  otherExpense:         number
  depositSavings:       number
  investmentSavings:    number
  pensionSavings:       number
  otherSavingAmount:    number
  // Step 5 – 직업
  jobType:              string
  industry:             string
  annualRevenue:        number
  annualSalary:         number
  taxManagement:        string
  taxConcerns:          string[]
  retirementPlanTypeJob: string
  insuranceTypes:       string[]
  monthlyInsurance:     number
  lastInsuranceReview:  string
  // Step 6 – 은퇴목표
  retirementMonthlyExpense: number
  goals:                Goal[]
  // Step 7 – 연락처
  contactName:          string
  contactPhone:         string
  contactEmail:         string
}

// ══════════════════════════════════════════════
// Utils
// ══════════════════════════════════════════════
function calcAge(birthYear: number, birthMonth: number): number {
  if (!birthYear || !birthMonth) return 0
  const today = new Date()
  let age = today.getFullYear() - birthYear
  if (today.getMonth() + 1 < birthMonth) age -= 1
  return age
}

const initialFormData: FormData = {
  birthYear: 0, birthMonth: 0, retirementTargetAge: 60,
  maritalStatus: '', children: [],
  bankDeposit: 0, savingsAccount: 0, cmaAccount: 0, otherSavings: 0,
  stocks: 0, fundsEtf: 0, bonds: 0, crypto: 0, otherInvestments: 0,
  selfOccupiedHome: 0, investmentProperty: 0, otherRealEstate: 0,
  nationalPensionPaid: 0, nationalPensionMonthly: 0, nationalPensionExpected: 0,
  retirementPensionBalance: 0, retirementPensionMonthly: 0, retirementPensionType: '',
  personalPensionPaid: 0, personalPensionMonthly: 0, personalPensionExpected: 0,
  insuranceRefund: 0, tenantDeposit: 0, otherAssets: 0,
  mortgageLoan:   { balance: 0, monthlyPayment: 0, remainingMonths: 0, repaymentType: 'principal_interest' },
  creditLoan:     { balance: 0, monthlyPayment: 0, remainingMonths: 0, repaymentType: 'principal_interest' },
  jeonseLoan:     { balance: 0, monthlyPayment: 0, remainingMonths: 0, repaymentType: 'bullet' },
  businessLoan:   { balance: 0, monthlyPayment: 0, remainingMonths: 0, repaymentType: 'principal_interest' },
  otherDebt:      { balance: 0, monthlyPayment: 0, remainingMonths: 0, repaymentType: 'principal_interest' },
  rentalDeposit: 0,
  salaryIncome: 0, businessIncome: 0, financialIncome: 0, rentalIncome: 0, otherIncome: 0,
  housing: 0, loanRepayment: 0, insurance: 0, communication: 0,
  education: 0, transportation: 0, living: 0, leisure: 0, otherExpense: 0,
  depositSavings: 0, investmentSavings: 0, pensionSavings: 0, otherSavingAmount: 0,
  jobType: '', industry: '', annualRevenue: 0, annualSalary: 0,
  taxManagement: '', taxConcerns: [], retirementPlanTypeJob: '',
  insuranceTypes: [], monthlyInsurance: 0, lastInsuranceReview: '',
  retirementMonthlyExpense: 0, goals: [],
  contactName: '', contactPhone: '', contactEmail: '',
}

// ══════════════════════════════════════════════
// UI Components
// ══════════════════════════════════════════════

function NumberInput({
  label, value, onChange, unit = '만원', placeholder = '0', hint,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  unit?: string
  placeholder?: string
  hint?: string
}) {
  const [draft, setDraft] = useState<string>(value > 0 ? String(value) : '')

  useEffect(() => {
    setDraft(prev => {
      const n = Number(prev)
      if (n !== value) return value > 0 ? String(value) : ''
      return prev
    })
  }, [value])

  return (
    <div className="mb-3">
      {label !== '' && (
        <label className="block text-[13px] text-[#4A5568] mb-1 font-medium">{label}</label>
      )}
      {hint && <p className="text-[11px] text-[#A0AEC0] mb-1">{hint}</p>}
      <div className="flex items-center border border-[#E2E8F0] rounded-[12px] px-3 py-2 bg-white focus-within:border-[#1B3A5C]">
        <input
          type="number"
          inputMode="decimal"
          value={draft}
          onChange={e => {
            setDraft(e.target.value)
            const n = parseFloat(e.target.value)
            onChange(isNaN(n) ? 0 : n)
          }}
          onBlur={() => {
            const n = parseFloat(draft)
            const final = isNaN(n) ? 0 : n
            onChange(final)
            setDraft(final > 0 ? String(final) : '')
          }}
          placeholder={placeholder}
          className="flex-1 text-[14px] text-[#1B2A4A] outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <span className="text-[12px] text-[#8B95A1] ml-1">{unit}</span>
      </div>
    </div>
  )
}

function SelectButton({ label, selected, onClick }: {
  label: string; selected: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-[12px] text-[13px] font-medium border transition-all ${
        selected
          ? 'bg-[#1B3A5C] text-white border-[#1B3A5C]'
          : 'bg-white text-[#4A5568] border-[#E2E8F0] hover:border-[#1B3A5C]'
      }`}
    >
      {label}
    </button>
  )
}

function MultiSelectButton({ label, selected, onClick }: {
  label: string; selected: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-[10px] text-[12px] font-medium border transition-all ${
        selected
          ? 'bg-[#EBF4FF] text-[#1B3A5C] border-[#1B3A5C]'
          : 'bg-white text-[#718096] border-[#E2E8F0] hover:border-[#1B3A5C]'
      }`}
    >
      {label}
    </button>
  )
}

function RepayTypeSelector({ value, onChange }: {
  value: LoanDetail['repaymentType']
  onChange: (v: LoanDetail['repaymentType']) => void
}) {
  const options: { label: string; value: LoanDetail['repaymentType'] }[] = [
    { label: '원리금균등', value: 'principal_interest' },
    { label: '이자만납부', value: 'interest_only' },
    { label: '만기일시상환', value: 'bullet' },
  ]
  return (
    <div className="flex gap-2 mt-1 mb-3">
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`flex-1 py-1.5 rounded-[10px] text-[12px] font-medium border transition-all ${
            value === o.value
              ? 'bg-[#1B3A5C] text-white border-[#1B3A5C]'
              : 'bg-white text-[#718096] border-[#E2E8F0]'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

// ══════════════════════════════════════════════
// Step Components
// ══════════════════════════════════════════════

function Step1({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  const age = calcAge(data.birthYear, data.birthMonth)

  const addChild = () => onChange({ children: [...data.children, { age: 0 }] })
  const removeChild = (i: number) => {
    const c = [...data.children]; c.splice(i, 1); onChange({ children: c })
  }
  const updateChildAge = (i: number, v: number) => {
    const c = [...data.children]; c[i] = { age: v }; onChange({ children: c })
  }

  return (
    <div className="space-y-5">
      <h2 className="text-[18px] font-bold text-[#1B2A4A]">기본 정보</h2>

      {/* 출생연월 */}
      <div>
        <label className="block text-[13px] text-[#4A5568] mb-2 font-medium">출생연월</label>
        <div className="flex gap-2">
          <select
            value={data.birthYear || ''}
            onChange={e => onChange({ birthYear: Number(e.target.value) })}
            className="flex-1 border border-[#E2E8F0] rounded-[12px] px-3 py-2 text-[14px] text-[#1B2A4A] bg-white"
          >
            <option value="">년도</option>
            {Array.from({ length: 60 }, (_, i) => new Date().getFullYear() - 18 - i).map(y => (
              <option key={y} value={y}>{y}년</option>
            ))}
          </select>
          <select
            value={data.birthMonth || ''}
            onChange={e => onChange({ birthMonth: Number(e.target.value) })}
            className="flex-1 border border-[#E2E8F0] rounded-[12px] px-3 py-2 text-[14px] text-[#1B2A4A] bg-white"
          >
            <option value="">월</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>{m}월</option>
            ))}
          </select>
        </div>
        {age > 0 && (
          <p className="text-[12px] text-[#3182CE] mt-1">현재 나이: {age}세</p>
        )}
      </div>

      {/* 은퇴 목표 나이 */}
      <div>
        <label className="block text-[13px] text-[#4A5568] mb-2 font-medium">은퇴 목표 나이</label>
        <div className="flex gap-2 flex-wrap">
          {[55, 60, 65, 70].map(a => (
            <SelectButton key={a} label={`${a}세`} selected={data.retirementTargetAge === a}
              onClick={() => onChange({ retirementTargetAge: a })} />
          ))}
        </div>
        <div className="mt-2">
          <NumberInput
            label=""
            value={data.retirementTargetAge}
            onChange={v => onChange({ retirementTargetAge: v })}
            unit="세"
            placeholder="직접 입력"
          />
        </div>
      </div>

      {/* 결혼 여부 */}
      <div>
        <label className="block text-[13px] text-[#4A5568] mb-2 font-medium">결혼 여부</label>
        <div className="flex gap-2 flex-wrap">
          {['미혼', '기혼', '이혼/별거', '사별'].map(s => (
            <SelectButton key={s} label={s} selected={data.maritalStatus === s}
              onClick={() => onChange({ maritalStatus: s })} />
          ))}
        </div>
      </div>

      {/* 자녀 */}
      <div>
        <label className="block text-[13px] text-[#4A5568] mb-2 font-medium">자녀</label>
        {data.children.map((c, i) => (
          <div key={i} className="flex items-center gap-2 mb-2">
            <div className="flex-1">
              <NumberInput
                label={`자녀 ${i + 1} 나이`}
                value={c.age}
                onChange={v => updateChildAge(i, v)}
                unit="세"
              />
            </div>
            <button
              onClick={() => removeChild(i)}
              className="text-[12px] text-red-400 hover:text-red-600 pb-1"
            >
              삭제
            </button>
          </div>
        ))}
        <button
          onClick={addChild}
          className="text-[13px] text-[#3182CE] border border-[#3182CE] rounded-[10px] px-3 py-1.5 hover:bg-[#EBF4FF]"
        >
          + 자녀 추가
        </button>
      </div>
    </div>
  )
}

function Step2({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  const sections = [
    {
      title: '💰 예적금 · 현금성 자산',
      fields: [
        { label: '은행 예금', key: 'bankDeposit' },
        { label: '저축성 예금 / 청약', key: 'savingsAccount' },
        { label: 'CMA / MMF', key: 'cmaAccount' },
        { label: '기타 저축', key: 'otherSavings' },
      ],
    },
    {
      title: '📈 투자 자산',
      fields: [
        { label: '주식', key: 'stocks' },
        { label: '펀드 · ETF', key: 'fundsEtf' },
        { label: '채권', key: 'bonds' },
        { label: '가상화폐', key: 'crypto' },
        { label: '기타 투자', key: 'otherInvestments' },
      ],
    },
    {
      title: '🏠 부동산',
      fields: [
        { label: '실거주 주택', key: 'selfOccupiedHome' },
        { label: '투자용 부동산', key: 'investmentProperty' },
        { label: '기타 부동산', key: 'otherRealEstate' },
      ],
    },
    {
      title: '🏦 연금',
      fields: [
        { label: '국민연금 납입 총액', key: 'nationalPensionPaid' },
        { label: '국민연금 월 납입액', key: 'nationalPensionMonthly' },
        { label: '국민연금 예상 수령액 (월)', key: 'nationalPensionExpected' },
        { label: '퇴직연금 잔액', key: 'retirementPensionBalance' },
        { label: '퇴직연금 월 납입액', key: 'retirementPensionMonthly' },
        { label: '개인연금 납입 총액', key: 'personalPensionPaid' },
        { label: '개인연금 월 납입액', key: 'personalPensionMonthly' },
        { label: '개인연금 예상 수령액 (월)', key: 'personalPensionExpected' },
      ],
    },
    {
      title: '🔒 기타 자산',
      fields: [
        { label: '보험 해지환급금', key: 'insuranceRefund' },
        { label: '임차 보증금 (전세·월세)', key: 'tenantDeposit' },
        { label: '기타 자산', key: 'otherAssets' },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-[18px] font-bold text-[#1B2A4A]">자산 현황</h2>
      {sections.map(sec => (
        <div key={sec.title} className="bg-[#F7FAFC] rounded-[16px] p-4">
          <p className="text-[14px] font-semibold text-[#2D3748] mb-3">{sec.title}</p>
          {sec.fields.map(f => (
            <NumberInput
              key={f.key}
              label={f.label}
              value={(data as any)[f.key]}
              onChange={v => onChange({ [f.key]: v })}
            />
          ))}
        </div>
      ))}
      <div>
        <label className="block text-[13px] text-[#4A5568] mb-2 font-medium">퇴직연금 유형</label>
        <div className="flex gap-2 flex-wrap">
          {['DB형', 'DC형', 'IRP', '없음'].map(t => (
            <SelectButton key={t} label={t} selected={data.retirementPensionType === t}
              onClick={() => onChange({ retirementPensionType: t })} />
          ))}
        </div>
      </div>
    </div>
  )
}

function Step3({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  const updateLoan = (key: keyof FormData, field: keyof LoanDetail, value: any) => {
    const current = (data[key] as LoanDetail)
    onChange({ [key]: { ...current, [field]: value } })
  }

  const loanSections: { label: string; key: keyof FormData }[] = [
    { label: '주택담보대출', key: 'mortgageLoan' },
    { label: '신용대출',     key: 'creditLoan'   },
    { label: '전세자금대출', key: 'jeonseLoan'   },
    { label: '사업자대출',   key: 'businessLoan' },
    { label: '기타 부채',    key: 'otherDebt'    },
  ]

  return (
    <div className="space-y-5">
      <h2 className="text-[18px] font-bold text-[#1B2A4A]">부채 현황</h2>
      {loanSections.map(sec => {
        const loan = data[sec.key] as LoanDetail
        return (
          <div key={sec.key} className="bg-[#F7FAFC] rounded-[16px] p-4">
            <p className="text-[14px] font-semibold text-[#2D3748] mb-3">{sec.label}</p>
            <NumberInput label="잔액" value={loan.balance}
              onChange={v => updateLoan(sec.key, 'balance', v)} />
            <NumberInput label="월 상환액" value={loan.monthlyPayment}
              onChange={v => updateLoan(sec.key, 'monthlyPayment', v)} />
            <NumberInput label="남은 기간" value={loan.remainingMonths}
              onChange={v => updateLoan(sec.key, 'remainingMonths', v)} unit="개월" />
            <p className="text-[12px] text-[#718096] mb-1">상환 방식</p>
            <RepayTypeSelector value={loan.repaymentType}
              onChange={v => updateLoan(sec.key, 'repaymentType', v)} />
          </div>
        )
      })}
      <div className="bg-[#F7FAFC] rounded-[16px] p-4">
        <p className="text-[14px] font-semibold text-[#2D3748] mb-3">임대보증금 (반환 의무)</p>
        <NumberInput label="임대보증금 합계" value={data.rentalDeposit}
          onChange={v => onChange({ rentalDeposit: v })} />
      </div>
    </div>
  )
}

function Step4({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {

  const totalIncome = useMemo(() =>
    data.salaryIncome + data.businessIncome + data.financialIncome +
    data.rentalIncome + data.otherIncome,
  [data.salaryIncome, data.businessIncome, data.financialIncome, data.rentalIncome, data.otherIncome])

  const totalExpense = useMemo(() =>
    data.housing + data.loanRepayment + data.insurance + data.communication +
    data.education + data.transportation + data.living + data.leisure + data.otherExpense,
  [data.housing, data.loanRepayment, data.insurance, data.communication,
   data.education, data.transportation, data.living, data.leisure, data.otherExpense])

  const totalSavings = useMemo(() =>
    data.depositSavings + data.investmentSavings + data.pensionSavings + data.otherSavingAmount,
  [data.depositSavings, data.investmentSavings, data.pensionSavings, data.otherSavingAmount])

  const disposable = totalIncome - totalExpense - totalSavings

  return (
    <div className="space-y-6">
      <h2 className="text-[18px] font-bold text-[#1B2A4A]">월 수입 · 지출 · 저축</h2>

      {/* 수입 */}
      <div className="bg-[#F7FAFC] rounded-[16px] p-4">
        <p className="text-[14px] font-semibold text-[#2D3748] mb-3">💵 월 수입</p>
        <NumberInput label="근로소득 (세후)" value={data.salaryIncome}
          onChange={v => onChange({ salaryIncome: v })} />
        <NumberInput label="사업소득" value={data.businessIncome}
          onChange={v => onChange({ businessIncome: v })} />
        <NumberInput label="금융소득 (배당·이자)" value={data.financialIncome}
          onChange={v => onChange({ financialIncome: v })} />
        <NumberInput label="임대소득" value={data.rentalIncome}
          onChange={v => onChange({ rentalIncome: v })} />
        <NumberInput label="기타 소득" value={data.otherIncome}
          onChange={v => onChange({ otherIncome: v })} />
        <div className="mt-2 p-2 bg-[#EBF4FF] rounded-[10px] text-[13px] font-semibold text-[#1B3A5C]">
          월 수입 합계: {totalIncome.toLocaleString()}만원
        </div>
      </div>

      {/* 지출 */}
      <div className="bg-[#FFF5F5] rounded-[16px] p-4">
        <p className="text-[14px] font-semibold text-[#2D3748] mb-3">💸 월 지출</p>
        <NumberInput label="주거비 (월세·관리비 등)" value={data.housing}
          onChange={v => onChange({ housing: v })}
          hint="자가이면 0, 월세·관리비 있으면 입력" />
        <NumberInput label="대출 원리금 상환" value={data.loanRepayment}
          onChange={v => onChange({ loanRepayment: v })} />
        <NumberInput label="보험료 합계" value={data.insurance}
          onChange={v => onChange({ insurance: v })} />
        <NumberInput label="통신비" value={data.communication}
          onChange={v => onChange({ communication: v })} />
        <NumberInput label="교육비 (자녀 학원·학비 포함)" value={data.education}
          onChange={v => onChange({ education: v })}
          hint="자녀 학원비, 학비 등 전체 교육 관련 지출" />
        <NumberInput label="교통비" value={data.transportation}
          onChange={v => onChange({ transportation: v })} />
        <NumberInput label="생활비 (식비·의류·생필품)" value={data.living}
          onChange={v => onChange({ living: v })}
          hint="식비, 의류, 생필품 등 일상 지출 전체" />
        <NumberInput label="여가·문화비" value={data.leisure}
          onChange={v => onChange({ leisure: v })} />
        <NumberInput label="기타 지출" value={data.otherExpense}
          onChange={v => onChange({ otherExpense: v })} />
        <div className="mt-2 p-2 bg-[#FFF0F0] rounded-[10px] text-[13px] font-semibold text-[#C53030]">
          월 지출 합계: {totalExpense.toLocaleString()}만원
        </div>
      </div>

      {/* 저축·투자 */}
      <div className="bg-[#F0FFF4] rounded-[16px] p-4">
        <p className="text-[14px] font-semibold text-[#2D3748] mb-3">🏦 월 저축 · 투자</p>
        <NumberInput label="예적금 저축" value={data.depositSavings}
          onChange={v => onChange({ depositSavings: v })} />
        <NumberInput label="투자 (주식·ETF 등)" value={data.investmentSavings}
          onChange={v => onChange({ investmentSavings: v })} />
        <NumberInput label="연금저축 · IRP" value={data.pensionSavings}
          onChange={v => onChange({ pensionSavings: v })} />
        <NumberInput label="기타 저축" value={data.otherSavingAmount}
          onChange={v => onChange({ otherSavingAmount: v })} />
        <div className="mt-2 p-2 bg-[#E6FFED] rounded-[10px] text-[13px] font-semibold text-[#276749]">
          월 저축 합계: {totalSavings.toLocaleString()}만원
        </div>
      </div>

      {/* 현금흐름 요약 */}
      <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-4">
        <p className="text-[14px] font-semibold text-[#2D3748] mb-3">📊 월 현금흐름 요약</p>
        <div className="space-y-2 text-[13px]">
          <div className="flex justify-between">
            <span>월 수입</span>
            <span className="font-semibold text-[#3182CE]">{totalIncome.toLocaleString()}만원</span>
          </div>
          <div className="flex justify-between">
            <span>월 지출</span>
            <span className="font-semibold text-[#C53030]">{totalExpense.toLocaleString()}만원</span>
          </div>
          <div className="flex justify-between">
            <span>월 저축</span>
            <span className="font-semibold text-[#276749]">{totalSavings.toLocaleString()}만원</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span>여유자금</span>
            <span className={`font-bold ${disposable >= 0 ? 'text-[#1B3A5C]' : 'text-red-500'}`}>
              {disposable.toLocaleString()}만원
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function Step5({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  const toggleTaxConcern = (v: string) => {
    const arr = data.taxConcerns.includes(v)
      ? data.taxConcerns.filter(x => x !== v)
      : [...data.taxConcerns, v]
    onChange({ taxConcerns: arr })
  }
  const toggleInsurance = (v: string) => {
    const arr = data.insuranceTypes.includes(v)
      ? data.insuranceTypes.filter(x => x !== v)
      : [...data.insuranceTypes, v]
    onChange({ insuranceTypes: arr })
  }

  return (
    <div className="space-y-5">
      <h2 className="text-[18px] font-bold text-[#1B2A4A]">직업 · 보험 정보</h2>

      <div>
        <label className="block text-[13px] text-[#4A5568] mb-2 font-medium">직업 유형</label>
        <div className="flex gap-2 flex-wrap">
          {['직장인', '개인사업자', '법인대표', '프리랜서', '전업주부', '기타'].map(t => (
            <SelectButton key={t} label={t} selected={data.jobType === t}
              onClick={() => onChange({ jobType: t })} />
          ))}
        </div>
      </div>

      {(data.jobType === '개인사업자' || data.jobType === '법인대표') && (
        <>
          <NumberInput label="연 매출 (또는 연 수입)" value={data.annualRevenue}
            onChange={v => onChange({ annualRevenue: v })} />
          <div>
            <label className="block text-[13px] text-[#4A5568] mb-2 font-medium">세무 관리 방법</label>
            <div className="flex gap-2 flex-wrap">
              {['간편장부', '복식부기', '세무사 위임'].map(t => (
                <SelectButton key={t} label={t} selected={data.taxManagement === t}
                  onClick={() => onChange({ taxManagement: t })} />
              ))}
            </div>
          </div>
        </>
      )}

      {data.jobType === '직장인' && (
        <NumberInput label="연봉 (세전)" value={data.annualSalary}
          onChange={v => onChange({ annualSalary: v })} />
      )}

      <div>
        <label className="block text-[13px] text-[#4A5568] mb-2 font-medium">업종</label>
        <input
          type="text"
          value={data.industry}
          onChange={e => onChange({ industry: e.target.value })}
          placeholder="예: 회계, IT, 음식점 등"
          className="w-full border border-[#E2E8F0] rounded-[12px] px-3 py-2 text-[14px] text-[#1B2A4A] outline-none focus:border-[#1B3A5C]"
        />
      </div>

      <div>
        <label className="block text-[13px] text-[#4A5568] mb-2 font-medium">절세 관심 분야 (복수 선택)</label>
        <div className="flex gap-2 flex-wrap">
          {['종합소득세', '부동산 양도세', '상속·증여세', '법인세', '기타'].map(t => (
            <MultiSelectButton key={t} label={t} selected={data.taxConcerns.includes(t)}
              onClick={() => toggleTaxConcern(t)} />
          ))}
        </div>
      </div>

      <div>
        <label className="block text-[13px] text-[#4A5568] mb-2 font-medium">퇴직연금 유형</label>
        <div className="flex gap-2 flex-wrap">
          {['DB형', 'DC형', 'IRP', '없음'].map(t => (
            <SelectButton key={t} label={t} selected={data.retirementPlanTypeJob === t}
              onClick={() => onChange({ retirementPlanTypeJob: t })} />
          ))}
        </div>
      </div>

      <div>
        <label className="block text-[13px] text-[#4A5568] mb-2 font-medium">가입 보험 종류 (복수 선택)</label>
        <div className="flex gap-2 flex-wrap">
          {['종신보험', '정기보험', '실손보험', '암보험', '연금보험', '기타'].map(t => (
            <MultiSelectButton key={t} label={t} selected={data.insuranceTypes.includes(t)}
              onClick={() => toggleInsurance(t)} />
          ))}
        </div>
      </div>

      <NumberInput label="월 보험료 합계" value={data.monthlyInsurance}
        onChange={v => onChange({ monthlyInsurance: v })} />

      <div>
        <label className="block text-[13px] text-[#4A5568] mb-2 font-medium">마지막 보험 점검 시기</label>
        <div className="flex gap-2 flex-wrap">
          {['6개월 이내', '1년 이내', '3년 이내', '3년 이상'].map(t => (
            <SelectButton key={t} label={t} selected={data.lastInsuranceReview === t}
              onClick={() => onChange({ lastInsuranceReview: t })} />
          ))}
        </div>
      </div>
    </div>
  )
}

function Step6({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  const addGoal = () => {
    onChange({
      goals: [
        ...data.goals,
        { type: '', targetAmount: 0, targetYear: new Date().getFullYear() + 5, priority: data.goals.length + 1 },
      ],
    })
  }
  const removeGoal = (i: number) => {
    const g = [...data.goals]; g.splice(i, 1); onChange({ goals: g })
  }
  const updateGoal = (i: number, field: keyof Goal, value: any) => {
    const g = [...data.goals]; g[i] = { ...g[i], [field]: value }; onChange({ goals: g })
  }

  return (
    <div className="space-y-5">
      <h2 className="text-[18px] font-bold text-[#1B2A4A]">은퇴 · 재무 목표</h2>

      <NumberInput
        label="은퇴 후 희망 월 생활비"
        value={data.retirementMonthlyExpense}
        onChange={v => onChange({ retirementMonthlyExpense: v })}
        hint="현재 물가 기준으로 입력하세요 (예: 300만원)"
      />

      <div>
        <div className="flex justify-between items-center mb-3">
          <p className="text-[14px] font-semibold text-[#2D3748]">재무 목표</p>
          <button
            onClick={addGoal}
            className="text-[12px] text-[#3182CE] border border-[#3182CE] rounded-[10px] px-3 py-1 hover:bg-[#EBF4FF]"
          >
            + 목표 추가
          </button>
        </div>
        {data.goals.map((g, i) => (
          <div key={i} className="bg-[#F7FAFC] rounded-[16px] p-3 mb-3">
            <div className="flex justify-between items-center mb-2">
              <p className="text-[13px] font-medium text-[#4A5568]">목표 {i + 1}</p>
              <button onClick={() => removeGoal(i)} className="text-[12px] text-red-400">삭제</button>
            </div>
            <div className="flex gap-2 flex-wrap mb-2">
              {['주택구입', '자녀교육', '창업', '여행', '노후대비', '기타'].map(t => (
                <SelectButton key={t} label={t} selected={g.type === t}
                  onClick={() => updateGoal(i, 'type', t)} />
              ))}
            </div>
            <NumberInput label="목표 금액" value={g.targetAmount}
              onChange={v => updateGoal(i, 'targetAmount', v)} />
            <NumberInput label="목표 연도" value={g.targetYear}
              onChange={v => updateGoal(i, 'targetYear', v)} unit="년" />
          </div>
        ))}
      </div>
    </div>
  )
}

function Step7({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  return (
    <div className="space-y-5">
      <h2 className="text-[18px] font-bold text-[#1B2A4A]">연락처 정보</h2>
      <p className="text-[13px] text-[#718096]">진단 리포트 발송 및 상담 예약에 사용됩니다.</p>

      <div>
        <label className="block text-[13px] text-[#4A5568] mb-1 font-medium">성함</label>
        <input
          type="text"
          value={data.contactName}
          onChange={e => onChange({ contactName: e.target.value })}
          placeholder="홍길동"
          className="w-full border border-[#E2E8F0] rounded-[12px] px-3 py-2 text-[14px] text-[#1B2A4A] outline-none focus:border-[#1B3A5C]"
        />
      </div>

      <div>
        <label className="block text-[13px] text-[#4A5568] mb-1 font-medium">연락처</label>
        <input
          type="tel"
          value={data.contactPhone}
          onChange={e => onChange({ contactPhone: e.target.value })}
          placeholder="010-0000-0000"
          className="w-full border border-[#E2E8F0] rounded-[12px] px-3 py-2 text-[14px] text-[#1B2A4A] outline-none focus:border-[#1B3A5C]"
        />
      </div>

      <div>
        <label className="block text-[13px] text-[#4A5568] mb-1 font-medium">이메일</label>
        <input
          type="email"
          value={data.contactEmail}
          onChange={e => onChange({ contactEmail: e.target.value })}
          placeholder="example@email.com"
          className="w-full border border-[#E2E8F0] rounded-[12px] px-3 py-2 text-[14px] text-[#1B2A4A] outline-none focus:border-[#1B3A5C]"
        />
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════
// Main Page
// ══════════════════════════════════════════════
export default function DiagnosisPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const TOTAL_STEPS = 7

  const updateForm = (partial: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...partial }))
  }

  // ✅ data를 canProceed useMemo보다 먼저 선언
  const data = formData

  // ── 진행 가능 여부 검증 ──
  const canProceed = useMemo(() => {
    switch (step) {
      case 1: return data.birthYear > 0 && data.birthMonth > 0 && data.maritalStatus !== ''
      case 2: return true
      case 3: return true
      case 4: return true
      case 5: return data.jobType !== ''
      case 6: return true
      case 7: return data.contactName.trim() !== '' && data.contactPhone.trim() !== ''
      default: return true
    }
  }, [step, data])

  // ── 최종 제출 ──
  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError(null)

    const diagData = { ...formData }
    const contact = {
      name:  formData.contactName,
      phone: formData.contactPhone,
      email: formData.contactEmail,
    }

    try {
      // 1) 데이터 저장
      const saveRes = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diagData, contact }),
      })
      if (!saveRes.ok) throw new Error('데이터 저장 실패')

      // 2) AI 분석 + 이메일 발송
      const analyzeRes = await fetch('/api/analyze-and-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diagData, contact }),
      })
      if (!analyzeRes.ok) throw new Error('AI 분석 실패')

      setIsDone(true)
    } catch (err: any) {
      setSubmitError(err.message || '오류가 발생했습니다. 다시 시도해 주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── 완료 화면 ──
  if (isDone) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1B3A5C] to-[#2D6A9F] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[24px] p-8 max-w-sm w-full text-center shadow-xl"
        >
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-[20px] font-bold text-[#1B2A4A] mb-2">진단 완료!</h2>
          <p className="text-[14px] text-[#718096] mb-6">
            재무 진단 리포트가 곧 이메일로 전송됩니다.<br />
            전문 세무사가 검토 후 연락드리겠습니다.
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-[#1B3A5C] text-white py-3 rounded-[14px] text-[15px] font-semibold"
          >
            홈으로 돌아가기
          </button>
        </motion.div>
      </div>
    )
  }

  // ── 메인 렌더 ──
  return (
    <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* 진행바 */}
        <div className="mb-4">
          <div className="flex justify-between text-[12px] text-[#718096] mb-1">
            <span>Step {step} / {TOTAL_STEPS}</span>
            <span>{Math.round((step / TOTAL_STEPS) * 100)}%</span>
          </div>
          <div className="w-full bg-[#E2E8F0] rounded-full h-2">
            <motion.div
              className="bg-[#1B3A5C] h-2 rounded-full"
              animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* 카드 */}
        <div className="bg-white rounded-[24px] shadow-lg p-6 mb-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              {step === 1 && <Step1 data={data} onChange={updateForm} />}
              {step === 2 && <Step2 data={data} onChange={updateForm} />}
              {step === 3 && <Step3 data={data} onChange={updateForm} />}
              {step === 4 && <Step4 data={data} onChange={updateForm} />}
              {step === 5 && <Step5 data={data} onChange={updateForm} />}
              {step === 6 && <Step6 data={data} onChange={updateForm} />}
              {step === 7 && <Step7 data={data} onChange={updateForm} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex-1 bg-white border border-[#E2E8F0] text-[#4A5568] py-3 rounded-[14px] text-[15px] font-semibold"
            >
              이전
            </button>
          )}
          {step < TOTAL_STEPS ? (
            <button
              onClick={() => { if (canProceed) setStep(s => s + 1) }}
              disabled={!canProceed}
              className={`flex-1 py-3 rounded-[14px] text-[15px] font-semibold transition-all ${
                canProceed
                  ? 'bg-[#1B3A5C] text-white hover:bg-[#2D6A9F]'
                  : 'bg-[#E2E8F0] text-[#A0AEC0] cursor-not-allowed'
              }`}
            >
              다음
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !canProceed}
              className={`flex-1 py-3 rounded-[14px] text-[15px] font-semibold transition-all ${
                isSubmitting || !canProceed
                  ? 'bg-[#E2E8F0] text-[#A0AEC0] cursor-not-allowed'
                  : 'bg-[#1B3A5C] text-white hover:bg-[#2D6A9F]'
              }`}
            >
              {isSubmitting ? '분석 중...' : '진단 완료'}
            </button>
          )}
        </div>

        {/* 오류 메시지 */}
        {submitError && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-[12px] text-[13px] text-red-600">
            {submitError}
          </div>
        )}

      </div>
    </div>
  )
}
