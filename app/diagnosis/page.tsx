'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

// ============================================================
// Types
// ============================================================
interface ChildInfo { age: number }
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
interface RealEstateItem {
  id: number
  kind: '아파트(수도권)' | '아파트(기타)' | '다세대/빌라' | '오피스텔' | '단독주택' | '토지' | '상가'
  usage: '자가거주' | '임대중' | '임대중(향후실거주예정)' | '거주+임대겸용' | '미사용'
  currentValue: number
  rentalDeposit: number
  monthlyRent: number
}
interface FormData {
  birthYear: number
  birthMonth: number
  retirementTargetAge: number
  lifeExpectancy: number
  maritalStatus: 'single' | 'married'
  children: ChildInfo[]
  bankDeposit: number
  termDeposit: number
  savingsAccount: number
  cmaAccount: number
  otherSavings: number
  leaseDeposit: number
  stocksEtf: number
  funds: number
  bonds: number
  crypto: number
  otherInvestments: number
  realEstateItems: RealEstateItem[]
  pensionType: 'DB' | 'DC' | 'IRP' | 'none'
  pensionBalance: number
  pensionMonthlyContrib: number
  yearsOfService: number
  personalPensionBalance: number
  personalPensionMonthly: number
  nationalPensionExpected: number
  insurancePayouts: InsurancePayout[]
  otherAssets: number
  loans: LoanDetail[]
  salary: number
  businessIncome: number
  dividendIncome: number
  otherIncome: number
  housingCost: number
  foodLife: number
  transportation: number
  communication: number
  insurance: number
  medicalEducation: number
  leisureSocial: number
  otherExpense: number
  hasLossInsurance: boolean
  hasLifeInsurance: boolean
  hasCancerInsurance: boolean
  hasAnnuityInsurance: boolean
  jobType: 'employee' | 'self_employed' | 'corporate' | 'freelancer'
  annualSalary: number
  annualRevenue: number
  annualNetIncome: number
  yellowUmbrellaContrib: number
  bookkeepingType: 'simple' | 'double' | 'none'
  annualDividend: number
  businessTypeCode: string
  businessTypeName: string
  retirementMonthlyExpense: number
  name: string
  phone: string
  email: string
  privacyAgree: boolean
}

const TOTAL_STEPS = 7

// ============================================================
// 업종 데이터
// ============================================================
const BUSINESS_TYPE_CODE_MAP: Record<string, string> = {
  '940100': '작가·작곡가',
  '940200': '학원 강사',
  '940300': '보험모집인',
  '940400': '음료 배달원',
  '940500': '기타 모집인',
  '940600': '저술가',
  '940909': '기타 자영업',
  '801101': '소아과의원',
  '801102': '내과의원',
  '801103': '외과의원',
  '801104': '한의원',
  '801200': '치과의원',
  '801300': '약국',
  '811001': '독서실',
  '811002': '학원(입시·보습)',
  '811003': '음악학원',
  '811004': '미술학원',
  '811005': '태권도·체육도장',
  '721100': 'IT 개발·프로그래밍',
  '721200': '시스템 통합 서비스',
  '731000': '디자인',
  '741000': '광고업',
  '742000': '건축설계·엔지니어링',
  '749000': '기타 전문 서비스',
  '521000': '일반 소매업',
  '522000': '음식료품 소매',
  '551000': '한식 음식점',
  '552000': '중식 음식점',
  '553000': '일식 음식점',
  '554000': '서양식 음식점',
  '555000': '카페·커피숍',
  '601000': '숙박업',
  '701000': '부동산 중개',
  '702000': '부동산 임대업',
  '451000': '건설업',
  '452000': '인테리어·리모델링',
}

const BUSINESS_CATEGORIES: {
  label: string
  items: { code: string; name: string }[]
}[] = [
  {
    label: '의료·보건',
    items: [
      { code: '801101', name: '소아과의원' },
      { code: '801102', name: '내과의원' },
      { code: '801103', name: '외과의원' },
      { code: '801104', name: '한의원' },
      { code: '801200', name: '치과의원' },
      { code: '801300', name: '약국' },
    ],
  },
  {
    label: '교육·학원',
    items: [
      { code: '811001', name: '독서실' },
      { code: '811002', name: '학원(입시·보습)' },
      { code: '811003', name: '음악학원' },
      { code: '811004', name: '미술학원' },
      { code: '811005', name: '태권도·체육도장' },
    ],
  },
  {
    label: 'IT·전문직',
    items: [
      { code: '721100', name: 'IT 개발·프로그래밍' },
      { code: '721200', name: '시스템 통합 서비스' },
      { code: '731000', name: '디자인' },
      { code: '741000', name: '광고업' },
      { code: '742000', name: '건축설계·엔지니어링' },
      { code: '749000', name: '기타 전문 서비스' },
    ],
  },
  {
    label: '도소매',
    items: [
      { code: '521000', name: '일반 소매업' },
      { code: '522000', name: '음식료품 소매' },
    ],
  },
  {
    label: '음식·숙박',
    items: [
      { code: '551000', name: '한식 음식점' },
      { code: '552000', name: '중식 음식점' },
      { code: '553000', name: '일식 음식점' },
      { code: '554000', name: '서양식 음식점' },
      { code: '555000', name: '카페·커피숍' },
      { code: '601000', name: '숙박업' },
    ],
  },
  {
    label: '부동산',
    items: [
      { code: '701000', name: '부동산 중개' },
      { code: '702000', name: '부동산 임대업' },
    ],
  },
  {
    label: '건설·인테리어',
    items: [
      { code: '451000', name: '건설업' },
      { code: '452000', name: '인테리어·리모델링' },
    ],
  },
  {
    label: '기타 서비스',
    items: [
      { code: '940100', name: '작가·작곡가' },
      { code: '940200', name: '학원 강사' },
      { code: '940300', name: '보험모집인' },
      { code: '940909', name: '기타 자영업' },
    ],
  },
]

// ============================================================
// Utility
// ============================================================
function calcAge(year: number, month: number): number {
  if (!year || !month) return 0
  const now = new Date()
  let age = now.getFullYear() - year
  if (now.getMonth() + 1 < month) age--
  return age
}
function formatNumber(n: number): string {
  if (!n) return ''
  return n.toLocaleString('ko-KR')
}
function calcTotalRentalIncome(items: RealEstateItem[]): number {
  return items.filter(r => hasRentalIncome(r.usage)).reduce((s, r) => s + (r.monthlyRent || 0), 0)
}
function hasRentalIncome(usage: RealEstateItem['usage']): boolean {
  return usage === '임대중' || usage === '임대중(향후실거주예정)' || usage === '거주+임대겸용'
}
function hasPension(jobType: FormData['jobType']): boolean {
  return jobType === 'employee' || jobType === 'corporate'
}

// ============================================================
// UI Primitives
// ============================================================
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-[18px] font-bold text-[#1E293B] mb-1">{children}</h2>
}
function FieldLabel({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="mb-1.5">
      <label className="text-[13px] font-semibold text-[#374151]">{children}</label>
      {sub && <span className="text-[11px] text-[#94A3B8] ml-1.5">{sub}</span>}
    </div>
  )
}
function NumberInput({
  label, value, onChange, unit, placeholder, readOnly, hint, allowDecimal
}: {
  label: string; value: number; onChange: (v: number) => void
  unit?: string; placeholder?: string; readOnly?: boolean; hint?: string; allowDecimal?: boolean
}) {
  const [, setRaw] = useState('')
  return (
    <div className="mb-4">
      {label && <FieldLabel>{label}</FieldLabel>}
      <div className="relative">
        <input
          type="text"
          inputMode={allowDecimal ? 'decimal' : 'numeric'}
          readOnly={readOnly}
          value={readOnly ? (value ? formatNumber(value) : '') : undefined}
          defaultValue={!readOnly ? undefined : undefined}
          onChange={e => {
            if (readOnly) return
            const val = e.target.value
            if (allowDecimal) {
              if (/^\d*\.?\d*$/.test(val)) {
                setRaw(val)
                onChange(val === '' || val === '.' ? 0 : parseFloat(val))
              }
            } else {
              const cleaned = val.replace(/,/g, '')
              if (/^\d*$/.test(cleaned)) {
                setRaw(formatNumber(Number(cleaned)))
                onChange(Number(cleaned))
              }
            }
          }}
          onFocus={e => {
            if (readOnly) return
            if (!allowDecimal) {
              setRaw(value ? String(value) : '')
              e.target.value = value ? String(value) : ''
            }
          }}
          onBlur={() => {
            if (readOnly) return
            if (!allowDecimal) setRaw(value ? formatNumber(value) : '')
          }}
          placeholder={placeholder || '0'}
          className={`w-full border border-[#CBD5E1] rounded-[10px] px-3 py-2.5 pr-12 text-[14px] text-[#1E293B] focus:outline-none focus:border-[#1E3A5F] ${readOnly ? 'bg-[#F8FAFC] text-[#94A3B8]' : 'bg-white'}`}
        />
        {unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-[#94A3B8]">{unit}</span>}
      </div>
      {hint && <p className="text-[11px] text-[#94A3B8] mt-1">{hint}</p>}
    </div>
  )
}
function ChipButton({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={`px-4 py-2 rounded-full text-[13px] font-medium border transition-all ${selected ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]' : 'bg-white text-[#475569] border-[#CBD5E1] hover:border-[#1E3A5F]'}`}>
      {label}
    </button>
  )
}
function MultiChipButton({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={`px-3 py-1.5 rounded-[8px] text-[12px] font-medium border transition-all ${selected ? 'bg-[#EFF6FF] text-[#1E3A5F] border-[#1E3A5F]' : 'bg-white text-[#475569] border-[#CBD5E1]'}`}>
      {label}
    </button>
  )
}
function Divider() { return <div className="border-t border-[#F1F5F9] my-5" /> }
function SumBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-[#F8FAFC] rounded-[10px] px-4 py-3 flex justify-between items-center mt-3">
      <span className="text-[13px] text-[#475569] font-medium">{label}</span>
      <span className="text-[15px] font-bold text-[#1E3A5F]">{formatNumber(value)} 만원</span>
    </div>
  )
}
function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#FFF7ED] border border-[#FED7AA] rounded-[10px] px-4 py-3 text-[12px] text-[#92400E] mb-4">
      {children}
    </div>
  )
}
function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-[10px] px-4 py-3 text-[12px] text-[#1E40AF] mb-4">
      {children}
    </div>
  )
}
function RepayTypeSelector({ value, onChange }: {
  value: LoanDetail['repayType']
  onChange: (v: LoanDetail['repayType']) => void
}) {
  return (
    <div className="flex gap-2 flex-wrap mb-3">
      {([
        { label: '원리금균등', value: 'equal_principal_interest' },
        { label: '원금균등',   value: 'equal_principal' },
        { label: '만기일시',   value: 'bullet' },
      ] as const).map(o => (
        <button key={o.value} type="button" onClick={() => onChange(o.value)}
          className={`px-3 py-1.5 rounded-[8px] text-[12px] font-medium border transition-all ${value === o.value ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]' : 'bg-white text-[#475569] border-[#CBD5E1]'}`}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

// ============================================================
// RealEstateCard
// ============================================================
const REAL_ESTATE_KINDS: RealEstateItem['kind'][] = [
  '아파트(수도권)', '아파트(기타)', '다세대/빌라', '오피스텔', '단독주택', '토지', '상가'
]
const REAL_ESTATE_USAGES: RealEstateItem['usage'][] = [
  '자가거주', '임대중', '임대중(향후실거주예정)', '거주+임대겸용', '미사용'
]
const USAGE_LABELS: Record<RealEstateItem['usage'], string> = {
  '자가거주': '자가거주',
  '임대중': '임대중',
  '임대중(향후실거주예정)': '임대중 (향후 실거주 예정)',
  '거주+임대겸용': '거주+임대 겸용 (일부 임대)',
  '미사용': '미사용/공실',
}
const RE_RATE_LABELS: Record<RealEstateItem['kind'], string> = {
  '아파트(수도권)': '연 3.5%', '아파트(기타)': '연 2.5%', '다세대/빌라': '연 1.5%',
  '오피스텔': '연 1.5%', '단독주택': '연 2.0%', '토지': '연 2.0%', '상가': '연 1.0%',
}
function RealEstateCard({ item, index, onUpdate, onRemove }: {
  item: RealEstateItem; index: number
  onUpdate: (patch: Partial<RealEstateItem>) => void; onRemove: () => void
}) {
  const showRental = hasRentalIncome(item.usage)
  return (
    <div className="bg-[#F8FAFC] rounded-[12px] p-4 mb-4 border border-[#E2E8F0]">
      <div className="flex justify-between items-center mb-3">
        <span className="text-[13px] font-semibold text-[#374151]">부동산 {index + 1}</span>
        <button onClick={onRemove} className="text-[#EF4444] text-[12px] px-2 py-1 border border-[#FCA5A5] rounded-[8px]">삭제</button>
      </div>
      <div className="mb-3">
        <FieldLabel>종류</FieldLabel>
        <select value={item.kind} onChange={e => onUpdate({ kind: e.target.value as RealEstateItem['kind'] })}
          className="w-full border border-[#CBD5E1] rounded-[10px] px-3 py-2.5 text-[14px] text-[#1E293B] bg-white focus:outline-none focus:border-[#1E3A5F]">
          {REAL_ESTATE_KINDS.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>
      <div className="mb-3">
        <FieldLabel>용도</FieldLabel>
        <select value={item.usage} onChange={e => {
          const usage = e.target.value as RealEstateItem['usage']
          onUpdate({ usage, rentalDeposit: hasRentalIncome(usage) ? item.rentalDeposit : 0, monthlyRent: hasRentalIncome(usage) ? item.monthlyRent : 0 })
        }} className="w-full border border-[#CBD5E1] rounded-[10px] px-3 py-2.5 text-[14px] text-[#1E293B] bg-white focus:outline-none focus:border-[#1E3A5F]">
          {REAL_ESTATE_USAGES.map(u => <option key={u} value={u}>{USAGE_LABELS[u]}</option>)}
        </select>
        {item.usage === '임대중(향후실거주예정)' && (
          <p className="text-[11px] text-[#F59E0B] mt-1">은퇴 후 실거주 전환 시 임대소득이 종료됩니다. 보고서에 반영됩니다.</p>
        )}
      </div>
      <NumberInput label="현재 시세" value={item.currentValue} onChange={v => onUpdate({ currentValue: v })} unit="만원"
        hint={`가격 상승률 ${RE_RATE_LABELS[item.kind]} 적용`} />
      {showRental && (
        <div className="border-t border-[#E2E8F0] pt-3 mt-1">
          <NumberInput label="임대보증금 (받은 금액)" value={item.rentalDeposit}
            onChange={v => onUpdate({ rentalDeposit: v })} unit="만원"
            hint="세입자로부터 받은 보증금 — 부채로 처리됩니다" />
          <NumberInput label="월 임대료" value={item.monthlyRent}
            onChange={v => onUpdate({ monthlyRent: v })} unit="만원"
            hint="분리과세 15.4% 적용하여 계산됩니다" />
        </div>
      )}
    </div>
  )
}

// ============================================================
// BusinessTypeSelector — 업종 선택 컴포넌트
// ============================================================
function BusinessTypeSelector({
  code, name, onChange
}: {
  code: string
  name: string
  onChange: (code: string, name: string) => void
}) {
  const [mode, setMode] = useState<'ask' | 'code' | 'category'>('ask')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [codeInput, setCodeInput] = useState(code || '')

  const handleCodeChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 6)
    setCodeInput(cleaned)
    const matched = BUSINESS_TYPE_CODE_MAP[cleaned]
    onChange(cleaned, matched || '')
  }

  const handleCategorySelect = (itemCode: string, itemName: string) => {
    onChange(itemCode, itemName)
  }

  if (mode === 'ask') {
    return (
      <div className="mb-4">
        <FieldLabel>업종코드</FieldLabel>
        <p className="text-[12px] text-[#94A3B8] mb-3">업종코드를 알고 계신가요? (사업자등록증 또는 국세청 홈택스에서 확인 가능)</p>
        <div className="flex gap-2">
          <ChipButton label="알고 있어요" selected={false} onClick={() => setMode('code')} />
          <ChipButton label="모르겠어요" selected={false} onClick={() => setMode('category')} />
        </div>
      </div>
    )
  }

  if (mode === 'code') {
    return (
      <div className="mb-4">
        <FieldLabel>업종코드 입력</FieldLabel>
        <p className="text-[12px] text-[#94A3B8] mb-2">사업자등록증 또는 홈택스에서 확인한 6자리 업종코드를 입력하세요.</p>
        <div className="relative mb-2">
          <input
            type="text"
            value={codeInput}
            onChange={e => handleCodeChange(e.target.value)}
            placeholder="예: 721100"
            maxLength={6}
            className="w-full border border-[#CBD5E1] rounded-[10px] px-3 py-2.5 text-[14px] text-[#1E293B] bg-white focus:outline-none focus:border-[#1E3A5F]"
          />
        </div>
        {name && (
          <div className="bg-[#F0FDF4] border border-[#86EFAC] rounded-[10px] px-3 py-2 mb-2">
            <p className="text-[13px] text-[#16A34A] font-medium">{code} — {name}</p>
          </div>
        )}
        {codeInput.length === 6 && !name && (
          <p className="text-[12px] text-[#F59E0B]">등록되지 않은 업종코드입니다. 직접 업종명을 입력해 주세요.</p>
        )}
        {codeInput.length === 6 && !name && (
          <div className="mt-2">
            <FieldLabel>업종명 직접 입력</FieldLabel>
            <input
              type="text"
              value={name}
              onChange={e => onChange(codeInput, e.target.value)}
              placeholder="예: 소프트웨어 개발업"
              className="w-full border border-[#CBD5E1] rounded-[10px] px-3 py-2.5 text-[14px] text-[#1E293B] bg-white focus:outline-none focus:border-[#1E3A5F]"
            />
          </div>
        )}
        <button onClick={() => { setMode('ask'); setCodeInput(''); onChange('', '') }}
          className="text-[12px] text-[#94A3B8] underline mt-1">
          다시 선택
        </button>
      </div>
    )
  }

  // category mode
  return (
    <div className="mb-4">
      <FieldLabel>업종 선택</FieldLabel>
      <p className="text-[12px] text-[#94A3B8] mb-3">해당하는 업종을 선택해 주세요.</p>

      <div className="flex gap-2 flex-wrap mb-3">
        {BUSINESS_CATEGORIES.map(cat => (
          <MultiChipButton
            key={cat.label}
            label={cat.label}
            selected={selectedCategory === cat.label}
            onClick={() => setSelectedCategory(cat.label)}
          />
        ))}
      </div>

      {selectedCategory && (
        <div className="bg-[#F8FAFC] rounded-[10px] p-3 mb-2">
          <div className="flex gap-2 flex-wrap">
            {BUSINESS_CATEGORIES.find(c => c.label === selectedCategory)?.items.map(item => (
              <button
                key={item.code}
                type="button"
                onClick={() => handleCategorySelect(item.code, item.name)}
                className={`px-3 py-1.5 rounded-[8px] text-[12px] font-medium border transition-all ${
                  code === item.code
                    ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]'
                    : 'bg-white text-[#475569] border-[#CBD5E1] hover:border-[#1E3A5F]'
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {name && (
        <div className="bg-[#F0FDF4] border border-[#86EFAC] rounded-[10px] px-3 py-2 mb-2">
          <p className="text-[13px] text-[#16A34A] font-medium">{code} — {name}</p>
        </div>
      )}

      <button onClick={() => { setMode('ask'); onChange('', '') }}
        className="text-[12px] text-[#94A3B8] underline mt-1">
        다시 선택
      </button>
    </div>
  )
}

// ============================================================
// Initial Data
// ============================================================
const initialFormData: FormData = {
  birthYear: 0, birthMonth: 0,
  retirementTargetAge: 65, lifeExpectancy: 90,
  maritalStatus: 'single', children: [],
  bankDeposit: 0, termDeposit: 0, savingsAccount: 0,
  cmaAccount: 0, otherSavings: 0, leaseDeposit: 0,
  stocksEtf: 0, funds: 0, bonds: 0, crypto: 0, otherInvestments: 0,
  realEstateItems: [],
  pensionType: 'none', pensionBalance: 0, pensionMonthlyContrib: 0,
  yearsOfService: 0,
  personalPensionBalance: 0, personalPensionMonthly: 0,
  nationalPensionExpected: 0,
  insurancePayouts: [],
  otherAssets: 0, loans: [],
  salary: 0, businessIncome: 0, dividendIncome: 0, otherIncome: 0,
  housingCost: 0, foodLife: 0, transportation: 0, communication: 0,
  insurance: 0, medicalEducation: 0, leisureSocial: 0, otherExpense: 0,
  hasLossInsurance: false, hasLifeInsurance: false,
  hasCancerInsurance: false, hasAnnuityInsurance: false,
  jobType: 'employee', annualSalary: 0,
  annualRevenue: 0, annualNetIncome: 0,
  yellowUmbrellaContrib: 0, bookkeepingType: 'none', annualDividend: 0,
  businessTypeCode: '', businessTypeName: '',
  retirementMonthlyExpense: 0,
  name: '', phone: '', email: '', privacyAgree: false,
}

// ============================================================
// Step 1
// ============================================================
function Step1({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  const age = calcAge(data.birthYear, data.birthMonth)
  return (
    <div>
      <SectionTitle>기본 정보</SectionTitle>
      <p className="text-[12px] text-[#94A3B8] mb-6">정확한 진단을 위해 기본 정보를 입력해 주세요.</p>
      <Notice>부부 공동 자산(공동명의 부동산 등)을 포함하여 가구 전체 합산 기준으로 입력해 주세요.</Notice>
      <div className="mb-5">
        <FieldLabel>생년월일</FieldLabel>
        <div className="flex gap-2">
          <select value={data.birthYear || ''} onChange={e => onChange({ birthYear: Number(e.target.value) })}
            className="flex-1 border border-[#CBD5E1] rounded-[10px] px-3 py-2.5 text-[14px] text-[#1E293B] bg-white focus:outline-none focus:border-[#1E3A5F]">
            <option value="">년도</option>
            {Array.from({ length: 60 }, (_, i) => new Date().getFullYear() - 18 - i).map(y => (
              <option key={y} value={y}>{y}년</option>
            ))}
          </select>
          <select value={data.birthMonth || ''} onChange={e => onChange({ birthMonth: Number(e.target.value) })}
            className="flex-1 border border-[#CBD5E1] rounded-[10px] px-3 py-2.5 text-[14px] text-[#1E293B] bg-white focus:outline-none focus:border-[#1E3A5F]">
            <option value="">월</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>{m}월</option>
            ))}
          </select>
        </div>
        {age > 0 && <p className="text-[12px] text-[#3B82F6] mt-1.5 font-medium">현재 {age}세</p>}
      </div>
      <div className="mb-5">
        <FieldLabel>결혼 여부</FieldLabel>
        <div className="flex gap-2">
          <ChipButton label="미혼" selected={data.maritalStatus === 'single'} onClick={() => onChange({ maritalStatus: 'single' })} />
          <ChipButton label="기혼" selected={data.maritalStatus === 'married'} onClick={() => onChange({ maritalStatus: 'married' })} />
        </div>
      </div>
      <div className="mb-5">
        <FieldLabel>자녀 수</FieldLabel>
        {data.children.map((c, i) => (
          <div key={i} className="flex gap-2 items-center mb-2">
            <NumberInput label="" value={c.age} onChange={v => {
              const arr = [...data.children]; arr[i] = { age: v }; onChange({ children: arr })
            }} unit="세" placeholder="자녀 나이" />
            <button onClick={() => {
              const arr = [...data.children]; arr.splice(i, 1); onChange({ children: arr })
            }} className="text-[#EF4444] text-[12px] px-2 py-1 border border-[#FCA5A5] rounded-[8px] whitespace-nowrap mb-4">삭제</button>
          </div>
        ))}
        <button onClick={() => onChange({ children: [...data.children, { age: 0 }] })}
          className="text-[13px] text-[#1E3A5F] border border-[#1E3A5F] px-4 py-2 rounded-[10px] hover:bg-[#EFF6FF] transition-colors">
          + 자녀 추가
        </button>
      </div>
      <Divider />
      <div className="mb-5">
        <FieldLabel>목표 은퇴 나이</FieldLabel>
        <div className="flex gap-2 flex-wrap mb-2">
          {[55, 60, 65, 70].map(a => (
            <ChipButton key={a} label={`${a}세`} selected={data.retirementTargetAge === a} onClick={() => onChange({ retirementTargetAge: a })} />
          ))}
        </div>
        <NumberInput label="" value={data.retirementTargetAge} onChange={v => onChange({ retirementTargetAge: v })} unit="세" placeholder="직접 입력" />
      </div>
      <div className="mb-5">
        <FieldLabel>기대 수명</FieldLabel>
        <div className="flex gap-2 flex-wrap mb-2">
          {[80, 85, 90, 95, 100].map(a => (
            <ChipButton key={a} label={`${a}세`} selected={data.lifeExpectancy === a} onClick={() => onChange({ lifeExpectancy: a })} />
          ))}
        </div>
        <NumberInput label="" value={data.lifeExpectancy} onChange={v => onChange({ lifeExpectancy: v })} unit="세" placeholder="직접 입력" />
        <p className="text-[11px] text-[#94A3B8] mt-1">기본값 90세. 개인 건강 상태에 따라 조정하세요.</p>
      </div>
    </div>
  )
}

// ============================================================
// Step 2
// ============================================================
function Step2({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  const totalCash = (data.bankDeposit || 0) + (data.termDeposit || 0) + (data.savingsAccount || 0) +
    (data.cmaAccount || 0) + (data.otherSavings || 0) + (data.leaseDeposit || 0)
  const totalInvestment = (data.stocksEtf || 0) + (data.funds || 0) + (data.bonds || 0) +
    (data.crypto || 0) + (data.otherInvestments || 0)
  const totalRealEstate = data.realEstateItems.reduce((s, r) => s + (r.currentValue || 0), 0)
  const totalRentalDeposit = data.realEstateItems.reduce((s, r) => s + (r.rentalDeposit || 0), 0)
  const totalAssets = totalCash + totalInvestment + totalRealEstate +
    (data.pensionBalance || 0) + (data.personalPensionBalance || 0) + (data.otherAssets || 0)

  const addInsurance = () => onChange({
    insurancePayouts: [...data.insurancePayouts, { id: Date.now(), type: 'surrender', currentAmount: 0 }]
  })
  const removeInsurance = (id: number) => onChange({ insurancePayouts: data.insurancePayouts.filter(i => i.id !== id) })
  const updateInsurance = (id: number, patch: Partial<InsurancePayout>) => onChange({
    insurancePayouts: data.insurancePayouts.map(i => i.id === id ? { ...i, ...patch } : i)
  })
  const addRealEstate = () => onChange({
    realEstateItems: [...data.realEstateItems, { id: Date.now(), kind: '아파트(수도권)', usage: '자가거주', currentValue: 0, rentalDeposit: 0, monthlyRent: 0 }]
  })
  const removeRealEstate = (id: number) => onChange({ realEstateItems: data.realEstateItems.filter(r => r.id !== id) })
  const updateRealEstate = (id: number, patch: Partial<RealEstateItem>) => onChange({
    realEstateItems: data.realEstateItems.map(r => r.id === id ? { ...r, ...patch } : r)
  })

  return (
    <div>
      <SectionTitle>자산 현황</SectionTitle>
      <Notice>모든 금액은 만원 단위로 입력해 주세요. 없는 항목은 비워두세요.</Notice>
      <FieldLabel>현금성 자산</FieldLabel>
      <p className="text-[11px] text-[#94A3B8] mb-3">적용 금리: 보통예금 0.25% / 정기예금·적금 3.0% / CMA 1.5%</p>
      <NumberInput label="보통예금" value={data.bankDeposit} onChange={v => onChange({ bankDeposit: v })} unit="만원" />
      <NumberInput label="정기예금" value={data.termDeposit} onChange={v => onChange({ termDeposit: v })} unit="만원" />
      <NumberInput label="적금" value={data.savingsAccount} onChange={v => onChange({ savingsAccount: v })} unit="만원" />
      <NumberInput label="CMA/MMF" value={data.cmaAccount} onChange={v => onChange({ cmaAccount: v })} unit="만원" />
      <NumberInput label="기타예적금" value={data.otherSavings} onChange={v => onChange({ otherSavings: v })} unit="만원" />
      <NumberInput label="임차보증금 (전세·월세)" value={data.leaseDeposit} onChange={v => onChange({ leaseDeposit: v })} unit="만원"
        hint="전세 또는 월세 보증금으로 돌려받을 금액 (수익률 0% 적용)" />
      <SumBar label="현금성 자산 합계" value={totalCash} />
      <Divider />
      <FieldLabel>투자자산</FieldLabel>
      <p className="text-[11px] text-[#94A3B8] mb-3">적용 수익률: 5.5% (세후 4.65%)</p>
      <NumberInput label="주식/ETF" value={data.stocksEtf} onChange={v => onChange({ stocksEtf: v })} unit="만원" />
      <NumberInput label="펀드" value={data.funds} onChange={v => onChange({ funds: v })} unit="만원" />
      <NumberInput label="채권" value={data.bonds} onChange={v => onChange({ bonds: v })} unit="만원" />
      <NumberInput label="가상자산(코인)" value={data.crypto} onChange={v => onChange({ crypto: v })} unit="만원" />
      <NumberInput label="기타투자" value={data.otherInvestments} onChange={v => onChange({ otherInvestments: v })} unit="만원" />
      <SumBar label="투자자산 합계" value={totalInvestment} />
      <Divider />
      <FieldLabel>부동산</FieldLabel>
      <p className="text-[11px] text-[#94A3B8] mb-3">유형별 상승률 자동 적용 · 임대보증금은 부채로 자동 처리됩니다.</p>
      {data.realEstateItems.map((item, index) => (
        <RealEstateCard key={item.id} item={item} index={index}
          onUpdate={patch => updateRealEstate(item.id, patch)}
          onRemove={() => removeRealEstate(item.id)} />
      ))}
      <button onClick={addRealEstate}
        className="text-[13px] text-[#1E3A5F] border border-[#1E3A5F] px-4 py-2 rounded-[10px] hover:bg-[#EFF6FF] transition-colors mb-3">
        + 부동산 추가
      </button>
      {data.realEstateItems.length > 0 && (
        <>
          <SumBar label="부동산 시세 합계" value={totalRealEstate} />
          {totalRentalDeposit > 0 && (
            <div className="bg-[#FFF7ED] rounded-[10px] px-4 py-3 flex justify-between items-center mt-2">
              <span className="text-[13px] text-[#92400E] font-medium">임대보증금 합계 (부채)</span>
              <span className="text-[15px] font-bold text-[#DC2626]">{formatNumber(totalRentalDeposit)} 만원</span>
            </div>
          )}
        </>
      )}
      <Divider />
      <FieldLabel>퇴직연금</FieldLabel>
      {!hasPension(data.jobType) ? (
        <div className="bg-[#F8FAFC] rounded-[10px] px-4 py-3 mb-4">
          <p className="text-[12px] text-[#94A3B8]">
            개인사업자·프리랜서는 퇴직연금 가입 대상이 아닙니다.<br />
            IRP 개인 납입이 있다면 아래 개인연금 섹션에 입력해 주세요.
          </p>
        </div>
      ) : (
        <>
          <div className="flex gap-2 flex-wrap mb-3">
            {(['none', 'DB', 'DC', 'IRP'] as const).map(t => (
              <ChipButton key={t} label={t === 'none' ? '해당없음' : t}
                selected={data.pensionType === t} onClick={() => onChange({ pensionType: t })} />
            ))}
          </div>
          {data.pensionType === 'DB' && (
            <div className="bg-[#F8FAFC] rounded-[10px] p-4 mb-4">
              <InfoBox>
                DB형 (확정급여형) — 퇴직 시점 월급 × 전체 근속연수로 퇴직금이 결정됩니다.
                회사가 운용하므로 잔액은 입력하지 않아도 됩니다.
                임금상승률 2% 적용하여 퇴직급여를 자동 계산합니다.
              </InfoBox>
              <NumberInput label="현재 근속연수" value={data.yearsOfService}
                onChange={v => onChange({ yearsOfService: v })} unit="년"
                hint="현재까지 재직한 연수를 입력하세요 (연봉은 직업정보 Step에서 입력)" />
            </div>
          )}
          {data.pensionType === 'DC' && (
            <div className="bg-[#F8FAFC] rounded-[10px] p-4 mb-4">
              <InfoBox>
                DC형 (확정기여형) — 매년 연봉의 1/12이 자동 불입됩니다.
                현재 적립 잔액만 입력하면 퇴직급여를 자동 계산합니다.
                운용수익률 연 3% 적용.
              </InfoBox>
              <NumberInput label="현재 적립 잔액" value={data.pensionBalance}
                onChange={v => onChange({ pensionBalance: v })} unit="만원" />
            </div>
          )}
          {data.pensionType === 'IRP' && (
            <div className="bg-[#F8FAFC] rounded-[10px] p-4 mb-4">
              <InfoBox>
                IRP (개인형 퇴직연금) — 본인이 직접 납입·운용하는 계좌입니다.
                연 900만원 한도 세액공제 혜택이 있습니다.
                운용수익률 연 3% 적용.
              </InfoBox>
              <NumberInput label="IRP 잔액" value={data.pensionBalance}
                onChange={v => onChange({ pensionBalance: v })} unit="만원" />
              <NumberInput label="월 납입액" value={data.pensionMonthlyContrib}
                onChange={v => onChange({ pensionMonthlyContrib: v })} unit="만원"
                hint="매월 본인이 납입하는 금액" />
            </div>
          )}
        </>
      )}
      <Divider />
      <FieldLabel>개인연금</FieldLabel>
      <p className="text-[11px] text-[#94A3B8] mb-3">연금저축펀드·연금저축보험 등 · 운용수익률 연 3% 적용</p>
      <NumberInput label="개인연금 잔액" value={data.personalPensionBalance}
        onChange={v => onChange({ personalPensionBalance: v })} unit="만원" />
      <NumberInput label="월 납입액" value={data.personalPensionMonthly}
        onChange={v => onChange({ personalPensionMonthly: v })} unit="만원" />
      <Divider />
      <FieldLabel>국민연금</FieldLabel>
      <NumberInput label="예상 월 수령액" value={data.nationalPensionExpected}
        onChange={v => onChange({ nationalPensionExpected: v })} unit="만원"
        placeholder="국민연금공단 조회 금액"
        hint="국민연금 홈페이지(nps.or.kr) → 내 연금 알아보기에서 조회하세요" />
      <Divider />
      <FieldLabel>보험 해약환급금</FieldLabel>
      <p className="text-[11px] text-[#94A3B8] mb-3">연금 전환형은 개인연금 섹션에 입력해 주세요.</p>
      {data.insurancePayouts.map((ins) => (
        <div key={ins.id} className="bg-[#F8FAFC] rounded-[10px] p-4 mb-3">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[13px] font-semibold text-[#374151]">보험 {data.insurancePayouts.indexOf(ins) + 1}</span>
            <button onClick={() => removeInsurance(ins.id)} className="text-[#EF4444] text-[12px] px-2 py-1 border border-[#FCA5A5] rounded-[8px]">삭제</button>
          </div>
          <div className="flex gap-2 mb-3">
            <ChipButton label="현재 해약" selected={ins.type === 'surrender'} onClick={() => updateInsurance(ins.id, { type: 'surrender' })} />
            <ChipButton label="만기 수령" selected={ins.type === 'maturity'} onClick={() => updateInsurance(ins.id, { type: 'maturity' })} />
          </div>
          {ins.type === 'surrender' && (
            <NumberInput label="현재 해약환급금" value={ins.currentAmount}
              onChange={v => updateInsurance(ins.id, { currentAmount: v })} unit="만원" />
          )}
          {ins.type === 'maturity' && (
            <>
              <NumberInput label="수령 예정 연도" value={ins.maturityYear || 0}
                onChange={v => updateInsurance(ins.id, { maturityYear: v })} unit="년" placeholder="예: 2035" />
              <NumberInput label="예상 수령액" value={ins.maturityAmount || 0}
                onChange={v => updateInsurance(ins.id, { maturityAmount: v })} unit="만원" />
            </>
          )}
        </div>
      ))}
      <button onClick={addInsurance}
        className="text-[13px] text-[#1E3A5F] border border-[#1E3A5F] px-4 py-2 rounded-[10px] hover:bg-[#EFF6FF] transition-colors mb-4">
        + 보험 추가
      </button>
      <Divider />
      <NumberInput label="기타 자산" value={data.otherAssets}
        onChange={v => onChange({ otherAssets: v })} unit="만원" placeholder="미술품, 골프회원권 등" />
      <SumBar label="총 자산 합계" value={totalAssets} />
    </div>
  )
}

// ============================================================
// Step 3
// ============================================================
function Step3({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  const loanTypes = ['주택담보대출', '신용대출', '전세대출', '사업자대출', '기타대출']
  const totalLoanDebt = data.loans.reduce((s, l) => s + (l.balance || 0), 0)
  const totalRentalDeposit = data.realEstateItems.reduce((s, r) => s + (r.rentalDeposit || 0), 0)
  const totalDebt = totalLoanDebt + totalRentalDeposit
  const totalMonthly = data.loans.reduce((s, l) => s + (l.monthlyPayment || 0), 0)

  const addLoan = () => onChange({
    loans: [...data.loans, { id: Date.now(), type: '주택담보대출', balance: 0, monthlyPayment: 0, interestRate: 0, remainingMonths: 0, repayType: 'equal_principal_interest' }]
  })
  const removeLoan = (id: number) => onChange({ loans: data.loans.filter(l => l.id !== id) })
  const updateLoan = (id: number, patch: Partial<LoanDetail>) => onChange({
    loans: data.loans.map(l => l.id === id ? { ...l, ...patch } : l)
  })

  return (
    <div>
      <SectionTitle>부채 현황</SectionTitle>
      <Notice>모든 대출을 빠짐없이 입력해 주세요. 정확한 현금흐름 계산에 사용됩니다.</Notice>
      {totalRentalDeposit > 0 && (
        <div className="bg-[#FFF7ED] border border-[#FED7AA] rounded-[10px] px-4 py-3 mb-4">
          <p className="text-[12px] text-[#92400E] font-semibold mb-1">자동 반영: 임대보증금</p>
          {data.realEstateItems.filter(r => r.rentalDeposit > 0).map(r => (
            <p key={r.id} className="text-[12px] text-[#92400E]">
              {r.kind} ({USAGE_LABELS[r.usage]}): {formatNumber(r.rentalDeposit)} 만원
            </p>
          ))}
          <p className="text-[12px] text-[#92400E] font-semibold mt-1">합계: {formatNumber(totalRentalDeposit)} 만원</p>
        </div>
      )}
      {data.loans.map((loan) => (
        <div key={loan.id} className="bg-[#F8FAFC] rounded-[10px] p-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <FieldLabel>대출 유형</FieldLabel>
            <button onClick={() => removeLoan(loan.id)} className="text-[#EF4444] text-[12px] px-2 py-1 border border-[#FCA5A5] rounded-[8px]">삭제</button>
          </div>
          <div className="flex gap-2 flex-wrap mb-3">
            {loanTypes.map(t => (
              <MultiChipButton key={t} label={t} selected={loan.type === t} onClick={() => updateLoan(loan.id, { type: t })} />
            ))}
          </div>
          <NumberInput label="대출 잔액" value={loan.balance} onChange={v => updateLoan(loan.id, { balance: v })} unit="만원" />
          <NumberInput label="연 이자율" value={loan.interestRate} onChange={v => updateLoan(loan.id, { interestRate: v })} unit="%" placeholder="예: 4.5" allowDecimal={true} />
          <NumberInput label="잔여 기간" value={loan.remainingMonths} onChange={v => updateLoan(loan.id, { remainingMonths: v })} unit="개월" />
          <FieldLabel>상환 방식</FieldLabel>
          <RepayTypeSelector value={loan.repayType} onChange={v => updateLoan(loan.id, { repayType: v })} />
          {loan.repayType === 'equal_principal_interest' && (
            <NumberInput label="월 납입액 (원금+이자)" value={loan.monthlyPayment}
              onChange={v => updateLoan(loan.id, { monthlyPayment: v })} unit="만원"
              hint="원금과 이자가 합산된 금액을 입력하세요" />
          )}
          {loan.repayType === 'equal_principal' && (
            <NumberInput label="월 납입 원금" value={loan.monthlyPayment}
              onChange={v => updateLoan(loan.id, { monthlyPayment: v })} unit="만원"
              hint="원금만 입력하세요 (이자는 자동 계산)" />
          )}
          {loan.repayType === 'bullet' && (
            <div className="bg-[#FFF7ED] rounded-[8px] px-3 py-2 text-[12px] text-[#92400E]">
              만기일시상환: 매월 이자만 납부, 만기 시 원금 일시 상환
            </div>
          )}
        </div>
      ))}
      <button onClick={addLoan}
        className="text-[13px] text-[#1E3A5F] border border-[#1E3A5F] px-4 py-2 rounded-[10px] hover:bg-[#EFF6FF] transition-colors mb-4">
        + 대출 추가
      </button>
      <SumBar label="대출 합계" value={totalLoanDebt} />
      {totalRentalDeposit > 0 && <SumBar label="임대보증금 합계" value={totalRentalDeposit} />}
      <SumBar label="총 부채 합계" value={totalDebt} />
      {totalMonthly > 0 && <SumBar label="월 대출 상환액" value={totalMonthly} />}
    </div>
  )
}

// ============================================================
// Step 4
// ============================================================
function Step4({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  const totalRentalIncome = calcTotalRentalIncome(data.realEstateItems)
  const totalIncome = (data.salary || 0) + (data.businessIncome || 0) +
    totalRentalIncome + (data.dividendIncome || 0) + (data.otherIncome || 0)
  const totalLoanPayment = data.loans.reduce((s, l) => s + (l.monthlyPayment || 0), 0)
  const totalExpense = (data.housingCost || 0) + (data.foodLife || 0) + (data.transportation || 0) +
    (data.communication || 0) + (data.insurance || 0) + (data.medicalEducation || 0) +
    (data.leisureSocial || 0) + (data.otherExpense || 0) + totalLoanPayment
  const netCashflow = totalIncome - totalExpense

  return (
    <div>
      <SectionTitle>수입 / 지출</SectionTitle>
      <Notice>가구 합산 기준으로 입력해 주세요. 세후(실수령) 금액 기준입니다.</Notice>
      <FieldLabel>월 수입</FieldLabel>
      <NumberInput label="근로소득 (세후)" value={data.salary} onChange={v => onChange({ salary: v })} unit="만원" />
      <NumberInput label="사업소득 (세후)" value={data.businessIncome} onChange={v => onChange({ businessIncome: v })} unit="만원" />
      <div className="mb-4">
        <FieldLabel>임대소득</FieldLabel>
        <div className="relative">
          <input type="text" readOnly value={formatNumber(totalRentalIncome) || '0'}
            className="w-full border border-[#CBD5E1] rounded-[10px] px-3 py-2.5 text-[14px] text-[#94A3B8] bg-[#F8FAFC]" />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-[#94A3B8]">만원</span>
        </div>
        <p className="text-[11px] text-[#94A3B8] mt-1">자산 입력(Step 2)의 부동산 월 임대료 합계가 자동 반영됩니다.</p>
      </div>
      <NumberInput label="배당/이자소득" value={data.dividendIncome} onChange={v => onChange({ dividendIncome: v })} unit="만원" />
      <NumberInput label="기타 수입" value={data.otherIncome} onChange={v => onChange({ otherIncome: v })} unit="만원" />
      <SumBar label="월 수입 합계" value={totalIncome} />
      <Divider />
      <FieldLabel>월 지출</FieldLabel>
      <p className="text-[11px] text-[#94A3B8] mb-3">각 항목에 해당하는 지출을 합산하여 입력해 주세요.</p>
      <NumberInput label="주거비" value={data.housingCost} onChange={v => onChange({ housingCost: v })} unit="만원" hint="관리비, 공과금, 월세 포함" />
      <NumberInput label="식비·생활용품" value={data.foodLife} onChange={v => onChange({ foodLife: v })} unit="만원" hint="식료품, 외식, 생활용품 포함" />
      <NumberInput label="교통비" value={data.transportation} onChange={v => onChange({ transportation: v })} unit="만원" hint="대중교통, 주유비, 자동차 유지비 포함" />
      <NumberInput label="통신비" value={data.communication} onChange={v => onChange({ communication: v })} unit="만원" hint="휴대폰, 인터넷, 구독서비스 포함" />
      <NumberInput label="보험료" value={data.insurance} onChange={v => onChange({ insurance: v })} unit="만원" hint="생명·건강·자동차보험 등 전체" />
      <NumberInput label="의료·교육비" value={data.medicalEducation} onChange={v => onChange({ medicalEducation: v })} unit="만원" hint="병원비, 약값, 학원비, 자녀교육비 포함" />
      <NumberInput label="여가·문화·경조사" value={data.leisureSocial} onChange={v => onChange({ leisureSocial: v })} unit="만원" hint="여행, 취미, 경조사, 회식 포함" />
      <NumberInput label="기타 지출" value={data.otherExpense} onChange={v => onChange({ otherExpense: v })} unit="만원" />
      <div className="mb-4">
        <FieldLabel>대출 상환액 (자동 계산)</FieldLabel>
        <div className="relative">
          <input type="text" readOnly value={formatNumber(totalLoanPayment) || '0'}
            className="w-full border border-[#CBD5E1] rounded-[10px] px-3 py-2.5 text-[14px] text-[#94A3B8] bg-[#F8FAFC]" />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-[#94A3B8]">만원</span>
        </div>
        <p className="text-[11px] text-[#94A3B8] mt-1">Step 3에서 입력한 대출 월 납입액 합계가 자동 반영됩니다.</p>
      </div>
      <SumBar label="월 지출 합계" value={totalExpense} />
      <div className={`rounded-[10px] px-4 py-3 flex justify-between items-center mt-2 ${netCashflow >= 0 ? 'bg-[#F0FDF4]' : 'bg-[#FFF1F2]'}`}>
        <span className="text-[13px] font-medium">월 순현금흐름</span>
        <span className={`text-[15px] font-bold ${netCashflow >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
          {netCashflow >= 0 ? '+' : ''}{formatNumber(netCashflow)} 만원
        </span>
      </div>
      {netCashflow < 0 && <p className="text-[11px] text-[#DC2626] mt-1">지출이 수입을 초과합니다. 은퇴 자산 계산 시 부족분이 반영됩니다.</p>}
      {netCashflow > 0 && <p className="text-[11px] text-[#16A34A] mt-1">잉여 현금흐름은 연 3% 수익률로 재투자되어 은퇴 자산에 반영됩니다.</p>}
      <Divider />
      <FieldLabel>보험 가입 현황</FieldLabel>
      <p className="text-[11px] text-[#94A3B8] mb-3">가입된 보험을 모두 선택해 주세요.</p>
      <div className="flex gap-2 flex-wrap mb-3">
        <MultiChipButton label="실손보험" selected={data.hasLossInsurance} onClick={() => onChange({ hasLossInsurance: !data.hasLossInsurance })} />
        <MultiChipButton label="종신·정기보험" selected={data.hasLifeInsurance} onClick={() => onChange({ hasLifeInsurance: !data.hasLifeInsurance })} />
        <MultiChipButton label="암·CI보험" selected={data.hasCancerInsurance} onClick={() => onChange({ hasCancerInsurance: !data.hasCancerInsurance })} />
        <MultiChipButton label="연금보험" selected={data.hasAnnuityInsurance} onClick={() => onChange({ hasAnnuityInsurance: !data.hasAnnuityInsurance })} />
      </div>
      <InfoBox>입력하신 정보를 바탕으로 보장 공백 분석 및 맞춤 보험 설계 서비스를 제공받으실 수 있습니다.</InfoBox>
    </div>
  )
}

// ============================================================
// Step 5 — 직업 정보 (업종코드 추가)
// ============================================================
function Step5({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  const isEmployee  = data.jobType === 'employee'
  const isCorporate = data.jobType === 'corporate'
  const isSelf      = data.jobType === 'self_employed'
  const isFreelance = data.jobType === 'freelancer'

  return (
    <div>
      <SectionTitle>직업 정보</SectionTitle>
      <p className="text-[12px] text-[#94A3B8] mb-5">직업 유형에 따라 절세 전략과 퇴직급여 계산이 달라집니다.</p>
      <div className="mb-5">
        <FieldLabel>직업 유형</FieldLabel>
        <div className="flex gap-2 flex-wrap">
          {([
            { value: 'employee',      label: '직장인'     },
            { value: 'self_employed', label: '개인사업자' },
            { value: 'corporate',     label: '법인대표'   },
            { value: 'freelancer',    label: '프리랜서'   },
          ] as const).map(j => (
            <ChipButton key={j.value} label={j.label}
              selected={data.jobType === j.value}
              onClick={() => onChange({ jobType: j.value })} />
          ))}
        </div>
      </div>

      {isEmployee && (
        <div>
          <InfoBox>직장인은 연봉을 기반으로 DB/DC 퇴직급여를 자동 계산합니다.</InfoBox>
          <NumberInput label="연봉 (세전)" value={data.annualSalary}
            onChange={v => onChange({ annualSalary: v })} unit="만원"
            hint="DB형 퇴직급여·DC형 연간 불입액 계산에 사용됩니다" />
        </div>
      )}

      {isCorporate && (
        <div>
          <InfoBox>
            법인대표는 급여와 배당 비율 설계가 핵심 절세 전략입니다.
            급여는 근로소득세, 배당은 배당소득세(15.4%)가 적용됩니다.
          </InfoBox>
          <NumberInput label="법인 급여 (세전 연봉)" value={data.annualSalary}
            onChange={v => onChange({ annualSalary: v })} unit="만원" />
          <NumberInput label="연간 배당 수령액" value={data.annualDividend}
            onChange={v => onChange({ annualDividend: v })} unit="만원"
            hint="법인으로부터 수령한 배당금 (연간 합계)" />
        </div>
      )}

      {isSelf && (
        <div>
          <InfoBox>
            개인사업자는 종합소득세 절세가 핵심입니다.
            업종코드와 매출·순이익을 기반으로 맞춤 절세 전략을 제안해드립니다.
          </InfoBox>
          <BusinessTypeSelector
            code={data.businessTypeCode}
            name={data.businessTypeName}
            onChange={(code, name) => onChange({ businessTypeCode: code, businessTypeName: name })}
          />
          <NumberInput label="연 매출 (연간 총 매출액)" value={data.annualRevenue}
            onChange={v => onChange({ annualRevenue: v })} unit="만원" />
          <NumberInput label="연 순이익 (세전)" value={data.annualNetIncome}
            onChange={v => onChange({ annualNetIncome: v })} unit="만원"
            hint="매출 - 비용 후 남은 금액 (세전 기준)" />
          <Divider />
          <FieldLabel>절세 항목</FieldLabel>
          <NumberInput label="노란우산공제 월 납입액" value={data.yellowUmbrellaContrib}
            onChange={v => onChange({ yellowUmbrellaContrib: v })} unit="만원"
            hint="소기업·소상공인 전용 · 연 최대 500만원 소득공제" />
          <div className="mb-4">
            <FieldLabel>장부 유형</FieldLabel>
            <div className="flex gap-2">
              {([
                { value: 'simple', label: '간편장부' },
                { value: 'double', label: '복식장부' },
                { value: 'none',   label: '무기장'   },
              ] as const).map(b => (
                <ChipButton key={b.value} label={b.label}
                  selected={data.bookkeepingType === b.value}
                  onClick={() => onChange({ bookkeepingType: b.value })} />
              ))}
            </div>
            <p className="text-[11px] text-[#94A3B8] mt-1">복식장부는 결손금 이월 등 추가 혜택이 있습니다.</p>
          </div>
        </div>
      )}

      {isFreelance && (
        <div>
          <InfoBox>
            프리랜서(3.3% 원천징수)는 종합소득세 신고를 통해
            납부한 세금을 환급받거나 추가 공제를 받을 수 있습니다.
          </InfoBox>
          <NumberInput label="연 수입 (연간 총 수령액)" value={data.annualRevenue}
            onChange={v => onChange({ annualRevenue: v })} unit="만원"
            hint="3.3% 원천징수 전 금액 기준" />
          <NumberInput label="연 순이익 (경비 제외 후)" value={data.annualNetIncome}
            onChange={v => onChange({ annualNetIncome: v })} unit="만원"
            hint="업무 관련 경비를 제외한 실질 소득" />
          <Divider />
          <FieldLabel>절세 항목</FieldLabel>
          <NumberInput label="노란우산공제 월 납입액" value={data.yellowUmbrellaContrib}
            onChange={v => onChange({ yellowUmbrellaContrib: v })} unit="만원"
            hint="소기업·소상공인 해당 시 · 연 최대 500만원 소득공제" />
        </div>
      )}

      <Divider />
      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[12px] p-4">
        <p className="text-[14px] font-semibold text-[#1E293B] mb-1">세금 절세 전략 상담</p>
        <p className="text-[13px] text-[#475569] mb-1">이흥준 공인회계사/세무사</p>
        <p className="text-[12px] text-[#94A3B8] mb-3">
          근로소득 · 사업소득 · 법인 절세 · 퇴직금 설계 상담
        </p>
        <a href="tel:01024981905"
          className="inline-block bg-[#1E3A5F] text-white text-[13px] font-medium px-4 py-2.5 rounded-[10px] hover:bg-[#1E3A5F]/90 transition-colors">
          010-2498-1905 무료 상담
        </a>
      </div>
    </div>
  )
}

// ============================================================
// Step 6
// ============================================================
function Step6({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  const age = calcAge(data.birthYear, data.birthMonth)
  const yearsToRetirement = data.retirementTargetAge - age
  const retirementPeriod = data.lifeExpectancy - data.retirementTargetAge
  return (
    <div>
      <SectionTitle>은퇴 목표</SectionTitle>
      <p className="text-[12px] text-[#94A3B8] mb-6">은퇴 후 원하는 생활 수준을 입력해 주세요.</p>
      {age > 0 && (
        <div className="bg-[#EFF6FF] rounded-[10px] px-4 py-3 mb-5 text-[13px] text-[#1E40AF]">
          현재 {age}세 → 은퇴까지 약 <strong>{yearsToRetirement}년</strong> · 은퇴 후 약 <strong>{retirementPeriod}년</strong> 생존 기간 가정
        </div>
      )}
      <NumberInput label="은퇴 후 월 희망 생활비" value={data.retirementMonthlyExpense}
        onChange={v => onChange({ retirementMonthlyExpense: v })} unit="만원"
        hint="현재 물가 기준으로 입력하세요. 은퇴 시점까지 물가상승률 2.5% 자동 반영됩니다." />
    </div>
  )
}

// ============================================================
// Step 7
// ============================================================
function Step7({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  return (
    <div>
      <SectionTitle>연락처</SectionTitle>
      <p className="text-[12px] text-[#94A3B8] mb-6">진단 보고서를 받으실 연락처를 입력해 주세요.</p>
      <div className="mb-4">
        <FieldLabel>이름</FieldLabel>
        <input type="text" value={data.name} onChange={e => onChange({ name: e.target.value })}
          placeholder="실명을 입력해 주세요"
          className="w-full border border-[#CBD5E1] rounded-[10px] px-3 py-2.5 text-[14px] text-[#1E293B] bg-white focus:outline-none focus:border-[#1E3A5F]" />
      </div>
      <div className="mb-4">
        <FieldLabel>휴대폰 번호</FieldLabel>
        <input type="tel" value={data.phone} onChange={e => onChange({ phone: e.target.value })}
          placeholder="010-0000-0000"
          className="w-full border border-[#CBD5E1] rounded-[10px] px-3 py-2.5 text-[14px] text-[#1E293B] bg-white focus:outline-none focus:border-[#1E3A5F]" />
      </div>
      <div className="mb-4">
        <FieldLabel>이메일 (선택)</FieldLabel>
        <input type="email" value={data.email} onChange={e => onChange({ email: e.target.value })}
          placeholder="example@email.com"
          className="w-full border border-[#CBD5E1] rounded-[10px] px-3 py-2.5 text-[14px] text-[#1E293B] bg-white focus:outline-none focus:border-[#1E3A5F]" />
      </div>
      <div className="flex items-start gap-3 mt-4 p-4 bg-[#F8FAFC] rounded-[10px]">
        <input type="checkbox" id="privacy" checked={data.privacyAgree}
          onChange={e => onChange({ privacyAgree: e.target.checked })}
          className="mt-0.5 w-4 h-4 accent-[#1E3A5F]" />
        <label htmlFor="privacy" className="text-[12px] text-[#475569] leading-relaxed">
          개인정보 수집·이용에 동의합니다. 입력하신 정보는 재무 진단 서비스 제공 목적으로만 사용되며, 제3자에게 제공되지 않습니다.
        </label>
      </div>
    </div>
  )
}

// ============================================================
// Main Page
// ============================================================
export default function DiagnosisPage() {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<FormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const router = useRouter()

  const updateForm = (patch: Partial<FormData>) => setData(prev => ({ ...prev, ...patch }))

  const canProceed = (() => {
    if (step === 1) return !!(data.birthYear && data.birthMonth && data.retirementTargetAge && data.lifeExpectancy)
    if (step === 5) return !!(data.jobType)
    if (step === 7) return !!(data.name && data.phone && data.privacyAgree)
    return true
  })()

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError('')
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'save_only', ...data }),
      })
      if (!res.ok) throw new Error('제출 실패')
      setIsDone(true)
    } catch {
      setSubmitError('제출 중 오류가 발생했습니다. 다시 시도해 주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isDone) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="bg-white rounded-[20px] p-8 max-w-sm w-full text-center shadow-sm">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-[20px] font-bold text-[#1E293B] mb-3">접수 완료!</h2>
          <p className="text-[14px] text-[#475569] mb-2">재무 진단 신청이 완료되었습니다.</p>
          <p className="text-[13px] text-[#94A3B8] mb-6">담당자가 검토 후 연락드리겠습니다.</p>
          <button onClick={() => router.push('/')}
            className="w-full bg-[#1E3A5F] text-white py-3 rounded-[12px] text-[14px] font-semibold">
            홈으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-[22px] font-bold text-[#1E293B]">재무 진단</h1>
          <p className="text-[13px] text-[#94A3B8] mt-1">Step {step} / {TOTAL_STEPS}</p>
        </div>
        <div className="w-full bg-[#E2E8F0] rounded-full h-1.5 mb-6">
          <div className="bg-[#1E3A5F] h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
        </div>
        <div className="bg-white rounded-[20px] p-6 shadow-sm mb-4">
          <AnimatePresence mode="wait">
            <motion.div key={step}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
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
        <div className="flex gap-3">
          {step > 1 && (
            <button onClick={() => setStep(s => s - 1)}
              className="flex-1 bg-white border border-[#CBD5E1] text-[#475569] py-3.5 rounded-[12px] text-[14px] font-semibold hover:bg-[#F8FAFC] transition-colors">
              이전
            </button>
          )}
          {step < TOTAL_STEPS ? (
            <button onClick={() => { if (canProceed) setStep(s => s + 1) }} disabled={!canProceed}
              className={`flex-1 py-3.5 rounded-[12px] text-[14px] font-semibold transition-all ${canProceed ? 'bg-[#1E3A5F] text-white hover:bg-[#1E3A5F]/90' : 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'}`}>
              다음
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={isSubmitting || !canProceed}
              className={`flex-1 py-3.5 rounded-[12px] text-[14px] font-semibold transition-all ${isSubmitting || !canProceed ? 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed' : 'bg-[#1E3A5F] text-white hover:bg-[#1E3A5F]/90'}`}>
              {isSubmitting ? '제출 중...' : '진단 제출'}
            </button>
          )}
        </div>
        {submitError && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-[10px] text-[12px] text-red-600">
            {submitError}
          </div>
        )}
      </div>
    </div>
  )
}
             