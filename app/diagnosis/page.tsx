'use client'

import { useState } from 'react'
import upjongRaw from '../../public/upjong.json'
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
  kind: '아파트(자도세움)' | '아파트(기타)' | '단독/빌라' | '상업시설' | '오피스텔' | '토지' | '기타'
  usage: '본인거주' | '임대중' | '임대중(일부공실예정)' | '거주+임대혼용' | '매도예정'
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
  return usage === '임대중' || usage === '임대중(일부공실예정)' || usage === '거주+임대혼용'
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
  '아파트(자도세움)', '아파트(기타)', '단독/빌라', '상업시설', '오피스텔', '토지', '기타'
]
const REAL_ESTATE_USAGES: RealEstateItem['usage'][] = [
  '본인거주', '임대중', '임대중(일부공실예정)', '거주+임대혼용', '매도예정'
]
const USAGE_LABELS: Record<RealEstateItem['usage'], string> = {
  '본인거주': '본인거주',
  '임대중': '임대중',
  '임대중(일부공실예정)': '임대중(일부 공실예정)',
  '거주+임대혼용': '거주+임대 혼용 (일부 임대)',
  '매도예정': '매도예정',
}
const RE_RATE_LABELS: Record<RealEstateItem['kind'], string> = {
  '아파트(자도세움)': '연3.5%', '아파트(기타)': '연2.5%', '단독/빌라': '연1.5%',
  '상업시설': '연1.5%', '오피스텔': '연2.0%', '토지': '연2.0%', '기타': '연1.0%',
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
        {item.usage === '임대중(일부공실예정)' && (
          <p className="text-[11px] text-[#F59E0B] mt-1">공실예정 기간의 임대수익은 제외하여 입력해주세요. 보고서에 반영됩니다.</p>
        )}
      </div>
      <NumberInput label="현재 시세" value={item.currentValue} onChange={v => onUpdate({ currentValue: v })} unit="만원"
        hint={`기대수익률 ${RE_RATE_LABELS[item.kind]} 적용`} />
      {showRental && (
        <div className="border-t border-[#E2E8F0] pt-3 mt-1">
          <NumberInput label="임대보증금(전세 포함)" value={item.rentalDeposit}
            onChange={v => onUpdate({ rentalDeposit: v })} unit="만원"
            hint="임대로받은 전세 보증금은 부채로 자동 처리됩니다." />
          <NumberInput label="월 임대료" value={item.monthlyRent}
            onChange={v => onUpdate({ monthlyRent: v })} unit="만원"
            hint="임대소득세 15.4% 적용하여 계산됩니다." />
        </div>
      )}
    </div>
  )
}

// ============================================================
// BusinessTypeSelector
// ============================================================
function BusinessTypeSelector({
  code, name, onChange
}: {
  code: string
  name: string
  onChange: (code: string, name: string) => void
}) {
  const upjongData = upjongRaw as { code: string; name: string }[]
  const [inputCode, setInputCode] = useState(code || '')
  const [manualName, setManualName] = useState(name || '')
  const [notFound, setNotFound] = useState(false)

  const matched = inputCode.length === 6
    ? upjongData.find(d => d.code === inputCode) ?? null
    : null

  const handleCodeChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 6)
    setInputCode(cleaned)
    if (cleaned.length === 6) {
      const found = upjongData.find(d => d.code === cleaned)
      if (found) {
        setNotFound(false)
        setManualName('')
        onChange(found.code, found.name)
      } else {
        setNotFound(true)
        onChange(cleaned, '')
      }
    } else {
      setNotFound(false)
      onChange('', '')
    }
  }

  const handleManualName = (val: string) => {
    setManualName(val)
    onChange(inputCode, val)
  }

  return (
    <div className="space-y-3 mb-4">
      <FieldLabel>업종코드 (6자리)</FieldLabel>
      <input
        type="text"
        inputMode="numeric"
        value={inputCode}
        onChange={e => handleCodeChange(e.target.value)}
        placeholder="예) 940909"
        maxLength={6}
        className="w-full border border-[#E2E8F0] rounded-[10px] px-4 py-3 text-[14px] text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30"
      />
      {matched && (
        <div className="bg-blue-50 border border-blue-200 rounded-[10px] px-4 py-2.5 text-[13px] text-blue-800 font-medium">
          ✓ {matched.name}
        </div>
      )}
      {notFound && (
        <div className="space-y-2">
          <div className="text-[12px] text-amber-600 bg-amber-50 border border-amber-200 rounded-[10px] px-4 py-2.5">
            해당 코드를 찾을 수 없어요. 업종명을 직접 입력해 주세요.{' '}
            <a href="https://upjong.co.kr/" target="_blank" rel="noopener noreferrer" className="underline text-amber-700">
              코드 조회
            </a>
          </div>
          <input
            type="text"
            value={manualName}
            onChange={e => handleManualName(e.target.value)}
            placeholder="예) 네일샵, 웹툰작가, 인테리어업"
            className="w-full border border-[#E2E8F0] rounded-[10px] px-4 py-3 text-[14px] text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30"
          />
        </div>
      )}
      {!inputCode && (
        <p className="text-[12px] text-[#94A3B8]">
          업종코드를 모르시면{' '}
          <a href="https://upjong.co.kr/" target="_blank" rel="noopener noreferrer" className="text-[#1E3A5F] underline">
            upjong.co.kr
          </a>
          에서 조회할 수 있어요.
        </p>
      )}
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
      <Notice>모든 금액은 부동산 포함하여 만원 단위의 현재 가치 기준으로 입력해 주세요.</Notice>
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
        <p className="text-[11px] text-[#94A3B8] mt-1">기본값은 90세. 건강 상태에 따라 조정해 주세요.</p>
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
    realEstateItems: [...data.realEstateItems, { id: Date.now(), kind: '아파트(자도세움)', usage: '본인거주', currentValue: 0, rentalDeposit: 0, monthlyRent: 0 }]
  })
  const removeRealEstate = (id: number) => onChange({ realEstateItems: data.realEstateItems.filter(r => r.id !== id) })
  const updateRealEstate = (id: number, patch: Partial<RealEstateItem>) => onChange({
    realEstateItems: data.realEstateItems.map(r => r.id === id ? { ...r, ...patch } : r)
  })

  return (
    <div>
      <SectionTitle>자산 현황</SectionTitle>
      <Notice>모든 금액은 만원 단위로 입력해 주세요. 없는 항목은 비워두세요.</Notice>
      <FieldLabel>유동성자산</FieldLabel>
      <p className="text-[11px] text-[#94A3B8] mb-3">적용 수익률: 보통예금 0.25% / 정기예금·적금 3.0% / CMA 1.5%</p>
      <NumberInput label="보통예금" value={data.bankDeposit} onChange={v => onChange({ bankDeposit: v })} unit="만원" />
      <NumberInput label="정기예금" value={data.termDeposit} onChange={v => onChange({ termDeposit: v })} unit="만원" />
      <NumberInput label="적금" value={data.savingsAccount} onChange={v => onChange({ savingsAccount: v })} unit="만원" />
      <NumberInput label="CMA/MMF" value={data.cmaAccount} onChange={v => onChange({ cmaAccount: v })} unit="만원" />
      <NumberInput label="기타저축성" value={data.otherSavings} onChange={v => onChange({ otherSavings: v })} unit="만원" />
      <NumberInput label="전세보증금(전세·월세)" value={data.leaseDeposit} onChange={v => onChange({ leaseDeposit: v })} unit="만원"
        hint="전세 또는 월세 보증금으로 맡긴 금액 (수익률 0% 적용)" />
      <SumBar label="유동성자산 합계" value={totalCash} />
      <Divider />
      <FieldLabel>투자자산</FieldLabel>
      <p className="text-[11px] text-[#94A3B8] mb-3">적용 수익률: 5.5% (세후 4.65%)</p>
      <NumberInput label="주식/ETF" value={data.stocksEtf} onChange={v => onChange({ stocksEtf: v })} unit="만원" />
      <NumberInput label="펀드" value={data.funds} onChange={v => onChange({ funds: v })} unit="만원" />
      <NumberInput label="채권" value={data.bonds} onChange={v => onChange({ bonds: v })} unit="만원" />
      <NumberInput label="가상자산(투기성)" value={data.crypto} onChange={v => onChange({ crypto: v })} unit="만원" />
      <NumberInput label="기타투자" value={data.otherInvestments} onChange={v => onChange({ otherInvestments: v })} unit="만원" />
      <SumBar label="투자자산 합계" value={totalInvestment} />
      <Divider />
      <FieldLabel>부동산</FieldLabel>
      <p className="text-[11px] text-[#94A3B8] mb-3">종류별 기대수익률 자동 적용 및 임대보증금은 부채로 자동 처리됩니다.</p>
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
            자영업자·프리랜서는 퇴직연금 가입 대상이 아닙니다.<br />
            IRP 개인 납입분이 있다면 아래 개인연금 항목에 입력해 주세요.
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
                DB형(확정급여형): 퇴직 시점 평균임금 × 근속연수로 퇴직금이 결정됩니다.
                회사가 적립하므로 잔액을 입력하지 않아도 됩니다.
                기대수익률 2% 적용하여 퇴직급여를 자동 계산합니다.
              </InfoBox>
              <NumberInput label="현재 근속연수" value={data.yearsOfService}
                onChange={v => onChange({ yearsOfService: v })} unit="년"
                hint="현재까지 재직한 연수를 입력하세요.(정확한 직장정보 Step에서 입력)" />
            </div>
          )}
          {data.pensionType === 'DC' && (
            <div className="bg-[#F8FAFC] rounded-[10px] p-4 mb-4">
              <InfoBox>
                DC형(확정기여형): 매년 연봉의 1/12이 자동 적립됩니다.
                현재 잔액 입력하면 퇴직급여를 자동 계산합니다.
                적용수익률은 연 3% 적용.
              </InfoBox>
              <NumberInput label="현재 잔액" value={data.pensionBalance}
                onChange={v => onChange({ pensionBalance: v })} unit="만원" />
            </div>
          )}
          {data.pensionType === 'IRP' && (
            <div className="bg-[#F8FAFC] rounded-[10px] p-4 mb-4">
              <InfoBox>
                IRP (개인형퇴직연금) - 본인이 직접 납입·운용하는 계좌입니다.
                연 900만원 한도 세액공제 혜택이 있습니다.
                적용수익률은 연 3% 적용.
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
      <p className="text-[11px] text-[#94A3B8] mb-3">연금저축펀드·연금저축보험·IRP 등 개인 납입 및 적용수익률 연 3%</p>
      <NumberInput label="개인연금 잔액" value={data.personalPensionBalance}
        onChange={v => onChange({ personalPensionBalance: v })} unit="만원" />
      <NumberInput label="월 납입액" value={data.personalPensionMonthly}
        onChange={v => onChange({ personalPensionMonthly: v })} unit="만원" />
      <Divider />
      <FieldLabel>국민연금</FieldLabel>
      <NumberInput label="예상 월 수령액" value={data.nationalPensionExpected}
        onChange={v => onChange({ nationalPensionExpected: v })} unit="만원"
        placeholder="국민연금공단 홈페이지 예상액"
        hint="국민연금 내연금(nps.or.kr) → 내연금 알아보기에서 조회하세요." />
      <Divider />
      <FieldLabel>보험 해지/만기환급금</FieldLabel>
      <p className="text-[11px] text-[#94A3B8] mb-3">연금 목적의 보험은 개인연금 항목에 입력해 주세요.</p>
      {data.insurancePayouts.map((ins) => (
        <div key={ins.id} className="bg-[#F8FAFC] rounded-[10px] p-4 mb-3">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[13px] font-semibold text-[#374151]">보험 {data.insurancePayouts.indexOf(ins) + 1}</span>
            <button onClick={() => removeInsurance(ins.id)} className="text-[#EF4444] text-[12px] px-2 py-1 border border-[#FCA5A5] rounded-[8px]">삭제</button>
          </div>
          <div className="flex gap-2 mb-3">
            <ChipButton label="현재 해지" selected={ins.type === 'surrender'} onClick={() => updateInsurance(ins.id, { type: 'surrender' })} />
            <ChipButton label="만기 수령" selected={ins.type === 'maturity'} onClick={() => updateInsurance(ins.id, { type: 'maturity' })} />
          </div>
          {ins.type === 'surrender' && (
            <NumberInput label="현재 해지환급금" value={ins.currentAmount}
              onChange={v => updateInsurance(ins.id, { currentAmount: v })} unit="만원" />
          )}
          {ins.type === 'maturity' && (
            <>
              <NumberInput label="만기 예정 연도" value={ins.maturityYear || 0}
                onChange={v => updateInsurance(ins.id, { maturityYear: v })} unit="년" placeholder="예) 2035" />
              <NumberInput label="예상 만기수령액" value={ins.maturityAmount || 0}
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
        onChange={v => onChange({ otherAssets: v })} unit="만원" placeholder="골동품, 금(Gold) 등" />
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
            <FieldLabel>대출 종류</FieldLabel>
            <button onClick={() => removeLoan(loan.id)} className="text-[#EF4444] text-[12px] px-2 py-1 border border-[#FCA5A5] rounded-[8px]">삭제</button>
          </div>
          <div className="flex gap-2 flex-wrap mb-3">
            {loanTypes.map(t => (
              <MultiChipButton key={t} label={t} selected={loan.type === t} onClick={() => updateLoan(loan.id, { type: t })} />
            ))}
          </div>
          <NumberInput label="대출 잔액" value={loan.balance} onChange={v => updateLoan(loan.id, { balance: v })} unit="만원" />
          <NumberInput label="연 이자율" value={loan.interestRate} onChange={v => updateLoan(loan.id, { interestRate: v })} unit="%" placeholder="예) 4.5" allowDecimal={true} />
          <NumberInput label="남은 기간" value={loan.remainingMonths} onChange={v => updateLoan(loan.id, { remainingMonths: v })} unit="개월" />
          <FieldLabel>상환 방식</FieldLabel>
          <RepayTypeSelector value={loan.repayType} onChange={v => updateLoan(loan.id, { repayType: v })} />
          {loan.repayType === 'equal_principal_interest' && (
            <NumberInput label="월 납입액(원금+이자)" value={loan.monthlyPayment}
              onChange={v => updateLoan(loan.id, { monthlyPayment: v })} unit="만원"
              hint="원금과 이자가 합산된 금액을 입력하세요." />
          )}
          {loan.repayType === 'equal_principal' && (
            <NumberInput label="월 납입 원금" value={loan.monthlyPayment}
              onChange={v => updateLoan(loan.id, { monthlyPayment: v })} unit="만원"
              hint="원금만 입력하세요.(이자는 자동 계산)" />
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
      {totalMonthly > 0 && <SumBar label="월 대출상환액" value={totalMonthly} />}
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
      <Notice>매월 평균 기준으로 입력해 주세요. 세후(실수령) 금액 기준입니다.</Notice>
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
      <NumberInput label="식비·생활용품" value={data.foodLife} onChange={v => onChange({ foodLife: v })} unit="만원" hint="외식비, 장보기, 생활용품 포함" />
      <NumberInput label="교통비" value={data.transportation} onChange={v => onChange({ transportation: v })} unit="만원" hint="대중교통, 유류비, 자동차보험 포함" />
      <NumberInput label="통신비" value={data.communication} onChange={v => onChange({ communication: v })} unit="만원" hint="휴대폰, 인터넷, 구독서비스 포함" />
      <NumberInput label="보험료" value={data.insurance} onChange={v => onChange({ insurance: v })} unit="만원" hint="건강·생명·암보험 등 합계" />
      <NumberInput label="의료·교육비" value={data.medicalEducation} onChange={v => onChange({ medicalEducation: v })} unit="만원" hint="병원비, 학원비, 자기계발비 포함" />
      <NumberInput label="여가·외식·경조사" value={data.leisureSocial} onChange={v => onChange({ leisureSocial: v })} unit="만원" hint="여행, 취미, 경조사, 외식 포함" />
      <NumberInput label="기타 지출" value={data.otherExpense} onChange={v => onChange({ otherExpense: v })} unit="만원" />
      <div className="mb-4">
        <FieldLabel>대출상환액 (자동 계산)</FieldLabel>
        <div className="relative">
          <input type="text" readOnly value={formatNumber(totalLoanPayment) || '0'}
            className="w-full border border-[#CBD5E1] rounded-[10px] px-3 py-2.5 text-[14px] text-[#94A3B8] bg-[#F8FAFC]" />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-[#94A3B8]">만원</span>
        </div>
        <p className="text-[11px] text-[#94A3B8] mt-1">Step 3에서 입력한 대출 월 납입액 합계가 자동 반영됩니다.</p>
      </div>
      <SumBar label="월 지출 합계" value={totalExpense} />
      <div className={`rounded-[10px] px-4 py-3 flex justify-between items-center mt-2 ${netCashflow >= 0 ? 'bg-[#F0FDF4]' : 'bg-[#FFF1F2]'}`}>
        <span className="text-[13px] font-medium">월 잉여현금흐름</span>
        <span className={`text-[15px] font-bold ${netCashflow >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
          {netCashflow >= 0 ? '+' : ''}{formatNumber(netCashflow)} 만원
        </span>
      </div>
      {netCashflow < 0 && <p className="text-[11px] text-[#DC2626] mt-1">지출이 수입을 초과합니다. 보유자산 감소 속도가 반영됩니다.</p>}
      {netCashflow > 0 && <p className="text-[11px] text-[#16A34A] mt-1">여유 자금흐름의 연 3% 수익률로 복리 계산된 추가자산이 반영됩니다.</p>}
      <Divider />
      <FieldLabel>보험 가입 현황</FieldLabel>
      <p className="text-[11px] text-[#94A3B8] mb-3">가입된 보험은 모두 체크해 주세요.</p>
      <div className="flex gap-2 flex-wrap mb-3">
        <MultiChipButton label="실손보험" selected={data.hasLossInsurance} onClick={() => onChange({ hasLossInsurance: !data.hasLossInsurance })} />
        <MultiChipButton label="종신·정기보험" selected={data.hasLifeInsurance} onClick={() => onChange({ hasLifeInsurance: !data.hasLifeInsurance })} />
        <MultiChipButton label="암보험" selected={data.hasCancerInsurance} onClick={() => onChange({ hasCancerInsurance: !data.hasCancerInsurance })} />
        <MultiChipButton label="연금보험" selected={data.hasAnnuityInsurance} onClick={() => onChange({ hasAnnuityInsurance: !data.hasAnnuityInsurance })} />
      </div>
      <InfoBox>입력하신 정보를 바탕으로 보장 공백 분석 및 적정 보험 구조 점검 서비스를 제공합니다.</InfoBox>
    </div>
  )
}

// ============================================================
// Step 5
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
          <InfoBox>직장인은 연봉을 기준으로 DB/DC 퇴직연금을 자동 계산합니다.</InfoBox>
          <NumberInput label="연봉 (세전)" value={data.annualSalary}
            onChange={v => onChange({ annualSalary: v })} unit="만원"
            hint="DB형 퇴직급여·DC형 적립 기간 계산에 사용됩니다." />
        </div>
      )}

      {isCorporate && (
        <div>
          <InfoBox>
            법인대표는 급여와 배당 분산 전략이 중요한 절세 포인트입니다.
            급여로 받는 근로소득과 배당소득(배당소득세 15.4%)이 적용됩니다.
          </InfoBox>
          <NumberInput label="법인 급여 (세전 연봉)" value={data.annualSalary}
            onChange={v => onChange({ annualSalary: v })} unit="만원" />
          <NumberInput label="연간 배당 수령액" value={data.annualDividend}
            onChange={v => onChange({ annualDividend: v })} unit="만원"
            hint="법인으로부터 수령한 배당금(연간 합계)" />
        </div>
      )}

      {isSelf && (
        <div>
          <InfoBox>
            개인사업자는 종합소득세 절세가 핵심입니다.
            업종코드와 매출·이익을 기준으로 맞춤 절세 전략을 제안합니다.
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
          <FieldLabel>절세 현황</FieldLabel>
          <NumberInput label="노란우산공제 월 납입액" value={data.yellowUmbrellaContrib}
            onChange={v => onChange({ yellowUmbrellaContrib: v })} unit="만원"
            hint="소기업·소상공인 전용 및 연 최대 500만원 소득공제" />
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
            <p className="text-[11px] text-[#94A3B8] mt-1">복식장부는 결손금 이월 등 세금 혜택이 추가됩니다.</p>
          </div>
        </div>
      )}

      {isFreelance && (
        <div>
          <InfoBox>
            프리랜서(3.3% 원천징수)는 종합소득세 신고를 통해
            과납된 세금과 각종 공제 항목을 돌려받을 수 있습니다.
          </InfoBox>
          <NumberInput label="연 수입 (연간 총 수령액)" value={data.annualRevenue}
            onChange={v => onChange({ annualRevenue: v })} unit="만원"
            hint="3.3% 원천징수 전 금액 기준" />
          <NumberInput label="연 순이익(경비 차감 후)" value={data.annualNetIncome}
            onChange={v => onChange({ annualNetIncome: v })} unit="만원"
            hint="실제 지출 경비를 차감한 실질 소득" />
          <Divider />
          <FieldLabel>절세 현황</FieldLabel>
          <NumberInput label="노란우산공제 월 납입액" value={data.yellowUmbrellaContrib}
            onChange={v => onChange({ yellowUmbrellaContrib: v })} unit="만원"
            hint="프리랜서도 해당 시 및 연 최대 500만원 소득공제" />
        </div>
      )}

      <Divider />
      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[12px] p-4">
        <p className="text-[14px] font-semibold text-[#1E293B] mb-1">맞춤 절세 전략 상담</p>
        <p className="text-[13px] text-[#475569] mb-1">세무사와 직접상담</p>
        <p className="text-[12px] text-[#94A3B8] mb-3">
          근로소득 · 사업소득 · 법인 절세 · 퇴직금 전략 상담
        </p>
        <a href="tel:01024981905"
          className="inline-block bg-[#1E3A5F] text-white text-[13px] font-medium px-4 py-2.5 rounded-[10px] hover:bg-[#1E3A5F]/90 transition-colors">
          010-2498-1905 전화 상담
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
          현재 {age}세 → 은퇴까지 <strong>{yearsToRetirement}년</strong> · 은퇴 후 <strong>{retirementPeriod}년</strong> 생존 기간 예상
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
          개인정보 수집·이용에 동의합니다. 입력하신 정보는 맞춤 진단 서비스를 위해서만 사용되며, 제3자에게 제공하지 않습니다.
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
          <p className="text-[14px] text-[#475569] mb-2">맞춤 진단 신청이 완료되었습니다.</p>
          <p className="text-[13px] text-[#94A3B8] mb-6">담당자가 연락드리겠습니다.</p>
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
          <h1 className="text-[22px] font-bold text-[#1E293B]">맞춤 진단</h1>
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
