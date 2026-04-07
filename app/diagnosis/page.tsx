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
  kind: '?꾪뙆???섎룄沅?' | '?꾪뙆??湲고?)' | '?ㅼ꽭?/鍮뚮씪' | '?ㅽ뵾?ㅽ뀛' | '?⑤룆二쇳깮' | '?좎?' | '?곴?'
  usage: '?먭?嫄곗＜' | '?꾨?以? | '?꾨?以??ν썑?ㅺ굅二쇱삁??' | '嫄곗＜+?꾨?寃몄슜' | '誘몄궗??
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
// ?낆쥌 ?곗씠??
// ============================================================
const BUSINESS_TYPE_CODE_MAP: Record<string, string> = {
  '940100': '?묎?쨌?묎끝媛',
  '940200': '?숈썝 媛뺤궗',
  '940300': '蹂댄뿕紐⑥쭛??,
  '940400': '?뚮즺 諛곕떖??,
  '940500': '湲고? 紐⑥쭛??,
  '940600': '??좉?',
  '940909': '湲고? ?먯쁺??,
  '801101': '?뚯븘怨쇱쓽??,
  '801102': '?닿낵?섏썝',
  '801103': '?멸낵?섏썝',
  '801104': '?쒖쓽??,
  '801200': '移섍낵?섏썝',
  '801300': '?쎄뎅',
  '811001': '?낆꽌??,
  '811002': '?숈썝(?낆떆쨌蹂댁뒿)',
  '811003': '?뚯븙?숈썝',
  '811004': '誘몄닠?숈썝',
  '811005': '?쒓텒?꽷룹껜?〓룄??,
  '721100': 'IT 媛쒕컻쨌?꾨줈洹몃옒諛?,
  '721200': '?쒖뒪???듯빀 ?쒕퉬??,
  '731000': '?붿옄??,
  '741000': '愿묎퀬??,
  '742000': '嫄댁텞?ㅺ퀎쨌?붿??덉뼱留?,
  '749000': '湲고? ?꾨Ц ?쒕퉬??,
  '521000': '?쇰컲 ?뚮ℓ??,
  '522000': '?뚯떇猷뚰뭹 ?뚮ℓ',
  '551000': '?쒖떇 ?뚯떇??,
  '552000': '以묒떇 ?뚯떇??,
  '553000': '?쇱떇 ?뚯떇??,
  '554000': '?쒖뼇???뚯떇??,
  '555000': '移댄럹쨌而ㅽ뵾??,
  '601000': '?숇컯??,
  '701000': '遺?숈궛 以묎컻',
  '702000': '遺?숈궛 ?꾨???,
  '451000': '嫄댁꽕??,
  '452000': '?명뀒由ъ뼱쨌由щえ?몃쭅',
}

const BUSINESS_CATEGORIES: {
  label: string
  items: { code: string; name: string }[]
}[] = [
  {
    label: '?섎즺쨌蹂닿굔',
    items: [
      { code: '801101', name: '?뚯븘怨쇱쓽?? },
      { code: '801102', name: '?닿낵?섏썝' },
      { code: '801103', name: '?멸낵?섏썝' },
      { code: '801104', name: '?쒖쓽?? },
      { code: '801200', name: '移섍낵?섏썝' },
      { code: '801300', name: '?쎄뎅' },
    ],
  },
  {
    label: '援먯쑁쨌?숈썝',
    items: [
      { code: '811001', name: '?낆꽌?? },
      { code: '811002', name: '?숈썝(?낆떆쨌蹂댁뒿)' },
      { code: '811003', name: '?뚯븙?숈썝' },
      { code: '811004', name: '誘몄닠?숈썝' },
      { code: '811005', name: '?쒓텒?꽷룹껜?〓룄?? },
    ],
  },
  {
    label: 'IT쨌?꾨Ц吏?,
    items: [
      { code: '721100', name: 'IT 媛쒕컻쨌?꾨줈洹몃옒諛? },
      { code: '721200', name: '?쒖뒪???듯빀 ?쒕퉬?? },
      { code: '731000', name: '?붿옄?? },
      { code: '741000', name: '愿묎퀬?? },
      { code: '742000', name: '嫄댁텞?ㅺ퀎쨌?붿??덉뼱留? },
      { code: '749000', name: '湲고? ?꾨Ц ?쒕퉬?? },
    ],
  },
  {
    label: '?꾩냼留?,
    items: [
      { code: '521000', name: '?쇰컲 ?뚮ℓ?? },
      { code: '522000', name: '?뚯떇猷뚰뭹 ?뚮ℓ' },
    ],
  },
  {
    label: '?뚯떇쨌?숇컯',
    items: [
      { code: '551000', name: '?쒖떇 ?뚯떇?? },
      { code: '552000', name: '以묒떇 ?뚯떇?? },
      { code: '553000', name: '?쇱떇 ?뚯떇?? },
      { code: '554000', name: '?쒖뼇???뚯떇?? },
      { code: '555000', name: '移댄럹쨌而ㅽ뵾?? },
      { code: '601000', name: '?숇컯?? },
    ],
  },
  {
    label: '遺?숈궛',
    items: [
      { code: '701000', name: '遺?숈궛 以묎컻' },
      { code: '702000', name: '遺?숈궛 ?꾨??? },
    ],
  },
  {
    label: '嫄댁꽕쨌?명뀒由ъ뼱',
    items: [
      { code: '451000', name: '嫄댁꽕?? },
      { code: '452000', name: '?명뀒由ъ뼱쨌由щえ?몃쭅' },
    ],
  },
  {
    label: '湲고? ?쒕퉬??,
    items: [
      { code: '940100', name: '?묎?쨌?묎끝媛' },
      { code: '940200', name: '?숈썝 媛뺤궗' },
      { code: '940300', name: '蹂댄뿕紐⑥쭛?? },
      { code: '940909', name: '湲고? ?먯쁺?? },
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
  return usage === '?꾨?以? || usage === '?꾨?以??ν썑?ㅺ굅二쇱삁??' || usage === '嫄곗＜+?꾨?寃몄슜'
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
      <span className="text-[15px] font-bold text-[#1E3A5F]">{formatNumber(value)} 留뚯썝</span>
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
        { label: '?먮━湲덇퇏??, value: 'equal_principal_interest' },
        { label: '?먭툑洹좊벑',   value: 'equal_principal' },
        { label: '留뚭린?쇱떆',   value: 'bullet' },
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
  '?꾪뙆???섎룄沅?', '?꾪뙆??湲고?)', '?ㅼ꽭?/鍮뚮씪', '?ㅽ뵾?ㅽ뀛', '?⑤룆二쇳깮', '?좎?', '?곴?'
]
const REAL_ESTATE_USAGES: RealEstateItem['usage'][] = [
  '?먭?嫄곗＜', '?꾨?以?, '?꾨?以??ν썑?ㅺ굅二쇱삁??', '嫄곗＜+?꾨?寃몄슜', '誘몄궗??
]
const USAGE_LABELS: Record<RealEstateItem['usage'], string> = {
  '?먭?嫄곗＜': '?먭?嫄곗＜',
  '?꾨?以?: '?꾨?以?,
  '?꾨?以??ν썑?ㅺ굅二쇱삁??': '?꾨?以?(?ν썑 ?ㅺ굅二??덉젙)',
  '嫄곗＜+?꾨?寃몄슜': '嫄곗＜+?꾨? 寃몄슜 (?쇰? ?꾨?)',
  '誘몄궗??: '誘몄궗??怨듭떎',
}
const RE_RATE_LABELS: Record<RealEstateItem['kind'], string> = {
  '?꾪뙆???섎룄沅?': '??3.5%', '?꾪뙆??湲고?)': '??2.5%', '?ㅼ꽭?/鍮뚮씪': '??1.5%',
  '?ㅽ뵾?ㅽ뀛': '??1.5%', '?⑤룆二쇳깮': '??2.0%', '?좎?': '??2.0%', '?곴?': '??1.0%',
}
function RealEstateCard({ item, index, onUpdate, onRemove }: {
  item: RealEstateItem; index: number
  onUpdate: (patch: Partial<RealEstateItem>) => void; onRemove: () => void
}) {
  const showRental = hasRentalIncome(item.usage)
  return (
    <div className="bg-[#F8FAFC] rounded-[12px] p-4 mb-4 border border-[#E2E8F0]">
      <div className="flex justify-between items-center mb-3">
        <span className="text-[13px] font-semibold text-[#374151]">遺?숈궛 {index + 1}</span>
        <button onClick={onRemove} className="text-[#EF4444] text-[12px] px-2 py-1 border border-[#FCA5A5] rounded-[8px]">??젣</button>
      </div>
      <div className="mb-3">
        <FieldLabel>醫낅쪟</FieldLabel>
        <select value={item.kind} onChange={e => onUpdate({ kind: e.target.value as RealEstateItem['kind'] })}
          className="w-full border border-[#CBD5E1] rounded-[10px] px-3 py-2.5 text-[14px] text-[#1E293B] bg-white focus:outline-none focus:border-[#1E3A5F]">
          {REAL_ESTATE_KINDS.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>
      <div className="mb-3">
        <FieldLabel>?⑸룄</FieldLabel>
        <select value={item.usage} onChange={e => {
          const usage = e.target.value as RealEstateItem['usage']
          onUpdate({ usage, rentalDeposit: hasRentalIncome(usage) ? item.rentalDeposit : 0, monthlyRent: hasRentalIncome(usage) ? item.monthlyRent : 0 })
        }} className="w-full border border-[#CBD5E1] rounded-[10px] px-3 py-2.5 text-[14px] text-[#1E293B] bg-white focus:outline-none focus:border-[#1E3A5F]">
          {REAL_ESTATE_USAGES.map(u => <option key={u} value={u}>{USAGE_LABELS[u]}</option>)}
        </select>
        {item.usage === '?꾨?以??ν썑?ㅺ굅二쇱삁??' && (
          <p className="text-[11px] text-[#F59E0B] mt-1">??????ㅺ굅二??꾪솚 ???꾨??뚮뱷??醫낅즺?⑸땲?? 蹂닿퀬?쒖뿉 諛섏쁺?⑸땲??</p>
        )}
      </div>
      <NumberInput label="?꾩옱 ?쒖꽭" value={item.currentValue} onChange={v => onUpdate({ currentValue: v })} unit="留뚯썝"
        hint={`媛寃??곸듅瑜?${RE_RATE_LABELS[item.kind]} ?곸슜`} />
      {showRental && (
        <div className="border-t border-[#E2E8F0] pt-3 mt-1">
          <NumberInput label="?꾨?蹂댁쬆湲?(諛쏆? 湲덉븸)" value={item.rentalDeposit}
            onChange={v => onUpdate({ rentalDeposit: v })} unit="留뚯썝"
            hint="?몄엯?먮줈遺??諛쏆? 蹂댁쬆湲???遺梨꾨줈 泥섎━?⑸땲?? />
          <NumberInput label="???꾨?猷? value={item.monthlyRent}
            onChange={v => onUpdate({ monthlyRent: v })} unit="留뚯썝"
            hint="遺꾨━怨쇱꽭 15.4% ?곸슜?섏뿬 怨꾩궛?⑸땲?? />
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
  const [inputCode, setInputCode] = useState(code || '')
  const [manualName, setManualName] = useState('')
  const [notFound, setNotFound] = useState(false)
  const upjongData = upjongRaw as { code: string; name: string }[]

  const handleCodeChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 6)
    setInputCode(cleaned)
    setNotFound(false)
    if (cleaned.length === 6) {
      const found = upjongData.find(d => d.code === cleaned)
      if (found) {
        setNotFound(false)
        setManualName('')
        onChange(found.code, found.name)
      } else {
        setNotFound(true)
        onChange(cleaned, manualName)
      }
    } else {
      onChange('', '')
    }
  }

  const handleManualName = (val: string) => {
    setManualName(val)
    onChange(inputCode, val)
  }

  const matched = upjongData.find(d => d.code === inputCode)

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
      {inputCode.length === 6 && matched && (
        <div className="bg-blue-50 border border-blue-200 rounded-[10px] px-4 py-2.5 text-[13px] text-blue-800 font-medium">
          {matched.name}
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
      <SectionTitle>湲곕낯 ?뺣낫</SectionTitle>
      <p className="text-[12px] text-[#94A3B8] mb-6">?뺥솗??吏꾨떒???꾪빐 湲곕낯 ?뺣낫瑜??낅젰??二쇱꽭??</p>
      <Notice>遺遺 怨듬룞 ?먯궛(怨듬룞紐낆쓽 遺?숈궛 ?????ы븿?섏뿬 媛援??꾩껜 ?⑹궛 湲곗??쇰줈 ?낅젰??二쇱꽭??</Notice>
      <div className="mb-5">
        <FieldLabel>?앸뀈?붿씪</FieldLabel>
        <div className="flex gap-2">
          <select value={data.birthYear || ''} onChange={e => onChange({ birthYear: Number(e.target.value) })}
            className="flex-1 border border-[#CBD5E1] rounded-[10px] px-3 py-2.5 text-[14px] text-[#1E293B] bg-white focus:outline-none focus:border-[#1E3A5F]">
            <option value="">?꾨룄</option>
            {Array.from({ length: 60 }, (_, i) => new Date().getFullYear() - 18 - i).map(y => (
              <option key={y} value={y}>{y}??/option>
            ))}
          </select>
          <select value={data.birthMonth || ''} onChange={e => onChange({ birthMonth: Number(e.target.value) })}
            className="flex-1 border border-[#CBD5E1] rounded-[10px] px-3 py-2.5 text-[14px] text-[#1E293B] bg-white focus:outline-none focus:border-[#1E3A5F]">
            <option value="">??/option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>{m}??/option>
            ))}
          </select>
        </div>
        {age > 0 && <p className="text-[12px] text-[#3B82F6] mt-1.5 font-medium">?꾩옱 {age}??/p>}
      </div>
      <div className="mb-5">
        <FieldLabel>寃고샎 ?щ?</FieldLabel>
        <div className="flex gap-2">
          <ChipButton label="誘명샎" selected={data.maritalStatus === 'single'} onClick={() => onChange({ maritalStatus: 'single' })} />
          <ChipButton label="湲고샎" selected={data.maritalStatus === 'married'} onClick={() => onChange({ maritalStatus: 'married' })} />
        </div>
      </div>
      <div className="mb-5">
        <FieldLabel>?먮? ??/FieldLabel>
        {data.children.map((c, i) => (
          <div key={i} className="flex gap-2 items-center mb-2">
            <NumberInput label="" value={c.age} onChange={v => {
              const arr = [...data.children]; arr[i] = { age: v }; onChange({ children: arr })
            }} unit="?? placeholder="?먮? ?섏씠" />
            <button onClick={() => {
              const arr = [...data.children]; arr.splice(i, 1); onChange({ children: arr })
            }} className="text-[#EF4444] text-[12px] px-2 py-1 border border-[#FCA5A5] rounded-[8px] whitespace-nowrap mb-4">??젣</button>
          </div>
        ))}
        <button onClick={() => onChange({ children: [...data.children, { age: 0 }] })}
          className="text-[13px] text-[#1E3A5F] border border-[#1E3A5F] px-4 py-2 rounded-[10px] hover:bg-[#EFF6FF] transition-colors">
          + ?먮? 異붽?
        </button>
      </div>
      <Divider />
      <div className="mb-5">
        <FieldLabel>紐⑺몴 ????섏씠</FieldLabel>
        <div className="flex gap-2 flex-wrap mb-2">
          {[55, 60, 65, 70].map(a => (
            <ChipButton key={a} label={`${a}??} selected={data.retirementTargetAge === a} onClick={() => onChange({ retirementTargetAge: a })} />
          ))}
        </div>
        <NumberInput label="" value={data.retirementTargetAge} onChange={v => onChange({ retirementTargetAge: v })} unit="?? placeholder="吏곸젒 ?낅젰" />
      </div>
      <div className="mb-5">
        <FieldLabel>湲곕? ?섎챸</FieldLabel>
        <div className="flex gap-2 flex-wrap mb-2">
          {[80, 85, 90, 95, 100].map(a => (
            <ChipButton key={a} label={`${a}??} selected={data.lifeExpectancy === a} onClick={() => onChange({ lifeExpectancy: a })} />
          ))}
        </div>
        <NumberInput label="" value={data.lifeExpectancy} onChange={v => onChange({ lifeExpectancy: v })} unit="?? placeholder="吏곸젒 ?낅젰" />
        <p className="text-[11px] text-[#94A3B8] mt-1">湲곕낯媛?90?? 媛쒖씤 嫄닿컯 ?곹깭???곕씪 議곗젙?섏꽭??</p>
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
    realEstateItems: [...data.realEstateItems, { id: Date.now(), kind: '?꾪뙆???섎룄沅?', usage: '?먭?嫄곗＜', currentValue: 0, rentalDeposit: 0, monthlyRent: 0 }]
  })
  const removeRealEstate = (id: number) => onChange({ realEstateItems: data.realEstateItems.filter(r => r.id !== id) })
  const updateRealEstate = (id: number, patch: Partial<RealEstateItem>) => onChange({
    realEstateItems: data.realEstateItems.map(r => r.id === id ? { ...r, ...patch } : r)
  })

  return (
    <div>
      <SectionTitle>?먯궛 ?꾪솴</SectionTitle>
      <Notice>紐⑤뱺 湲덉븸? 留뚯썝 ?⑥쐞濡??낅젰??二쇱꽭?? ?녿뒗 ??ぉ? 鍮꾩썙?먯꽭??</Notice>
      <FieldLabel>?꾧툑???먯궛</FieldLabel>
      <p className="text-[11px] text-[#94A3B8] mb-3">?곸슜 湲덈━: 蹂댄넻?덇툑 0.25% / ?뺢린?덇툑쨌?곴툑 3.0% / CMA 1.5%</p>
      <NumberInput label="蹂댄넻?덇툑" value={data.bankDeposit} onChange={v => onChange({ bankDeposit: v })} unit="留뚯썝" />
      <NumberInput label="?뺢린?덇툑" value={data.termDeposit} onChange={v => onChange({ termDeposit: v })} unit="留뚯썝" />
      <NumberInput label="?곴툑" value={data.savingsAccount} onChange={v => onChange({ savingsAccount: v })} unit="留뚯썝" />
      <NumberInput label="CMA/MMF" value={data.cmaAccount} onChange={v => onChange({ cmaAccount: v })} unit="留뚯썝" />
      <NumberInput label="湲고??덉쟻湲? value={data.otherSavings} onChange={v => onChange({ otherSavings: v })} unit="留뚯썝" />
      <NumberInput label="?꾩감蹂댁쬆湲?(?꾩꽭쨌?붿꽭)" value={data.leaseDeposit} onChange={v => onChange({ leaseDeposit: v })} unit="留뚯썝"
        hint="?꾩꽭 ?먮뒗 ?붿꽭 蹂댁쬆湲덉쑝濡??뚮젮諛쏆쓣 湲덉븸 (?섏씡瑜?0% ?곸슜)" />
      <SumBar label="?꾧툑???먯궛 ?⑷퀎" value={totalCash} />
      <Divider />
      <FieldLabel>?ъ옄?먯궛</FieldLabel>
      <p className="text-[11px] text-[#94A3B8] mb-3">?곸슜 ?섏씡瑜? 5.5% (?명썑 4.65%)</p>
      <NumberInput label="二쇱떇/ETF" value={data.stocksEtf} onChange={v => onChange({ stocksEtf: v })} unit="留뚯썝" />
      <NumberInput label="??? value={data.funds} onChange={v => onChange({ funds: v })} unit="留뚯썝" />
      <NumberInput label="梨꾧텒" value={data.bonds} onChange={v => onChange({ bonds: v })} unit="留뚯썝" />
      <NumberInput label="媛?곸옄??肄붿씤)" value={data.crypto} onChange={v => onChange({ crypto: v })} unit="留뚯썝" />
      <NumberInput label="湲고??ъ옄" value={data.otherInvestments} onChange={v => onChange({ otherInvestments: v })} unit="留뚯썝" />
      <SumBar label="?ъ옄?먯궛 ?⑷퀎" value={totalInvestment} />
      <Divider />
      <FieldLabel>遺?숈궛</FieldLabel>
      <p className="text-[11px] text-[#94A3B8] mb-3">?좏삎蹂??곸듅瑜??먮룞 ?곸슜 쨌 ?꾨?蹂댁쬆湲덉? 遺梨꾨줈 ?먮룞 泥섎━?⑸땲??</p>
      {data.realEstateItems.map((item, index) => (
        <RealEstateCard key={item.id} item={item} index={index}
          onUpdate={patch => updateRealEstate(item.id, patch)}
          onRemove={() => removeRealEstate(item.id)} />
      ))}
      <button onClick={addRealEstate}
        className="text-[13px] text-[#1E3A5F] border border-[#1E3A5F] px-4 py-2 rounded-[10px] hover:bg-[#EFF6FF] transition-colors mb-3">
        + 遺?숈궛 異붽?
      </button>
      {data.realEstateItems.length > 0 && (
        <>
          <SumBar label="遺?숈궛 ?쒖꽭 ?⑷퀎" value={totalRealEstate} />
          {totalRentalDeposit > 0 && (
            <div className="bg-[#FFF7ED] rounded-[10px] px-4 py-3 flex justify-between items-center mt-2">
              <span className="text-[13px] text-[#92400E] font-medium">?꾨?蹂댁쬆湲??⑷퀎 (遺梨?</span>
              <span className="text-[15px] font-bold text-[#DC2626]">{formatNumber(totalRentalDeposit)} 留뚯썝</span>
            </div>
          )}
        </>
      )}
      <Divider />
      <FieldLabel>?댁쭅?곌툑</FieldLabel>
      {!hasPension(data.jobType) ? (
        <div className="bg-[#F8FAFC] rounded-[10px] px-4 py-3 mb-4">
          <p className="text-[12px] text-[#94A3B8]">
            媛쒖씤?ъ뾽?먃룻봽由щ옖?쒕뒗 ?댁쭅?곌툑 媛????곸씠 ?꾨떃?덈떎.<br />
            IRP 媛쒖씤 ?⑹엯???덈떎硫??꾨옒 媛쒖씤?곌툑 ?뱀뀡???낅젰??二쇱꽭??
          </p>
        </div>
      ) : (
        <>
          <div className="flex gap-2 flex-wrap mb-3">
            {(['none', 'DB', 'DC', 'IRP'] as const).map(t => (
              <ChipButton key={t} label={t === 'none' ? '?대떦?놁쓬' : t}
                selected={data.pensionType === t} onClick={() => onChange({ pensionType: t })} />
            ))}
          </div>
          {data.pensionType === 'DB' && (
            <div className="bg-[#F8FAFC] rounded-[10px] p-4 mb-4">
              <InfoBox>
                DB??(?뺤젙湲됱뿬?? ???댁쭅 ?쒖젏 ?붽툒 횞 ?꾩껜 洹쇱냽?곗닔濡??댁쭅湲덉씠 寃곗젙?⑸땲??
                ?뚯궗媛 ?댁슜?섎?濡??붿븸? ?낅젰?섏? ?딆븘???⑸땲??
                ?꾧툑?곸듅瑜?2% ?곸슜?섏뿬 ?댁쭅湲됱뿬瑜??먮룞 怨꾩궛?⑸땲??
              </InfoBox>
              <NumberInput label="?꾩옱 洹쇱냽?곗닔" value={data.yearsOfService}
                onChange={v => onChange({ yearsOfService: v })} unit="??
                hint="?꾩옱源뚯? ?ъ쭅???곗닔瑜??낅젰?섏꽭??(?곕큺? 吏곸뾽?뺣낫 Step?먯꽌 ?낅젰)" />
            </div>
          )}
          {data.pensionType === 'DC' && (
            <div className="bg-[#F8FAFC] rounded-[10px] p-4 mb-4">
              <InfoBox>
                DC??(?뺤젙湲곗뿬?? ??留ㅻ뀈 ?곕큺??1/12???먮룞 遺덉엯?⑸땲??
                ?꾩옱 ?곷┰ ?붿븸留??낅젰?섎㈃ ?댁쭅湲됱뿬瑜??먮룞 怨꾩궛?⑸땲??
                ?댁슜?섏씡瑜???3% ?곸슜.
              </InfoBox>
              <NumberInput label="?꾩옱 ?곷┰ ?붿븸" value={data.pensionBalance}
                onChange={v => onChange({ pensionBalance: v })} unit="留뚯썝" />
            </div>
          )}
          {data.pensionType === 'IRP' && (
            <div className="bg-[#F8FAFC] rounded-[10px] p-4 mb-4">
              <InfoBox>
                IRP (媛쒖씤???댁쭅?곌툑) ??蹂몄씤??吏곸젒 ?⑹엯쨌?댁슜?섎뒗 怨꾩쥖?낅땲??
                ??900留뚯썝 ?쒕룄 ?몄븸怨듭젣 ?쒗깮???덉뒿?덈떎.
                ?댁슜?섏씡瑜???3% ?곸슜.
              </InfoBox>
              <NumberInput label="IRP ?붿븸" value={data.pensionBalance}
                onChange={v => onChange({ pensionBalance: v })} unit="留뚯썝" />
              <NumberInput label="???⑹엯?? value={data.pensionMonthlyContrib}
                onChange={v => onChange({ pensionMonthlyContrib: v })} unit="留뚯썝"
                hint="留ㅼ썡 蹂몄씤???⑹엯?섎뒗 湲덉븸" />
            </div>
          )}
        </>
      )}
      <Divider />
      <FieldLabel>媛쒖씤?곌툑</FieldLabel>
      <p className="text-[11px] text-[#94A3B8] mb-3">?곌툑?異뺥??쑣룹뿰湲덉?異뺣낫????쨌 ?댁슜?섏씡瑜???3% ?곸슜</p>
      <NumberInput label="媛쒖씤?곌툑 ?붿븸" value={data.personalPensionBalance}
        onChange={v => onChange({ personalPensionBalance: v })} unit="留뚯썝" />
      <NumberInput label="???⑹엯?? value={data.personalPensionMonthly}
        onChange={v => onChange({ personalPensionMonthly: v })} unit="留뚯썝" />
      <Divider />
      <FieldLabel>援???곌툑</FieldLabel>
      <NumberInput label="?덉긽 ???섎졊?? value={data.nationalPensionExpected}
        onChange={v => onChange({ nationalPensionExpected: v })} unit="留뚯썝"
        placeholder="援???곌툑怨듬떒 議고쉶 湲덉븸"
        hint="援???곌툑 ?덊럹?댁?(nps.or.kr) ?????곌툑 ?뚯븘蹂닿린?먯꽌 議고쉶?섏꽭?? />
      <Divider />
      <FieldLabel>蹂댄뿕 ?댁빟?섍툒湲?/FieldLabel>
      <p className="text-[11px] text-[#94A3B8] mb-3">?곌툑 ?꾪솚?뺤? 媛쒖씤?곌툑 ?뱀뀡???낅젰??二쇱꽭??</p>
      {data.insurancePayouts.map((ins) => (
        <div key={ins.id} className="bg-[#F8FAFC] rounded-[10px] p-4 mb-3">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[13px] font-semibold text-[#374151]">蹂댄뿕 {data.insurancePayouts.indexOf(ins) + 1}</span>
            <button onClick={() => removeInsurance(ins.id)} className="text-[#EF4444] text-[12px] px-2 py-1 border border-[#FCA5A5] rounded-[8px]">??젣</button>
          </div>
          <div className="flex gap-2 mb-3">
            <ChipButton label="?꾩옱 ?댁빟" selected={ins.type === 'surrender'} onClick={() => updateInsurance(ins.id, { type: 'surrender' })} />
            <ChipButton label="留뚭린 ?섎졊" selected={ins.type === 'maturity'} onClick={() => updateInsurance(ins.id, { type: 'maturity' })} />
          </div>
          {ins.type === 'surrender' && (
            <NumberInput label="?꾩옱 ?댁빟?섍툒湲? value={ins.currentAmount}
              onChange={v => updateInsurance(ins.id, { currentAmount: v })} unit="留뚯썝" />
          )}
          {ins.type === 'maturity' && (
            <>
              <NumberInput label="?섎졊 ?덉젙 ?곕룄" value={ins.maturityYear || 0}
                onChange={v => updateInsurance(ins.id, { maturityYear: v })} unit="?? placeholder="?? 2035" />
              <NumberInput label="?덉긽 ?섎졊?? value={ins.maturityAmount || 0}
                onChange={v => updateInsurance(ins.id, { maturityAmount: v })} unit="留뚯썝" />
            </>
          )}
        </div>
      ))}
      <button onClick={addInsurance}
        className="text-[13px] text-[#1E3A5F] border border-[#1E3A5F] px-4 py-2 rounded-[10px] hover:bg-[#EFF6FF] transition-colors mb-4">
        + 蹂댄뿕 異붽?
      </button>
      <Divider />
      <NumberInput label="湲고? ?먯궛" value={data.otherAssets}
        onChange={v => onChange({ otherAssets: v })} unit="留뚯썝" placeholder="誘몄닠?? 怨⑦봽?뚯썝沅??? />
      <SumBar label="珥??먯궛 ?⑷퀎" value={totalAssets} />
    </div>
  )
}

// ============================================================
// Step 3
// ============================================================
function Step3({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  const loanTypes = ['二쇳깮?대낫?異?, '?좎슜?異?, '?꾩꽭?異?, '?ъ뾽?먮?異?, '湲고??異?]
  const totalLoanDebt = data.loans.reduce((s, l) => s + (l.balance || 0), 0)
  const totalRentalDeposit = data.realEstateItems.reduce((s, r) => s + (r.rentalDeposit || 0), 0)
  const totalDebt = totalLoanDebt + totalRentalDeposit
  const totalMonthly = data.loans.reduce((s, l) => s + (l.monthlyPayment || 0), 0)

  const addLoan = () => onChange({
    loans: [...data.loans, { id: Date.now(), type: '二쇳깮?대낫?異?, balance: 0, monthlyPayment: 0, interestRate: 0, remainingMonths: 0, repayType: 'equal_principal_interest' }]
  })
  const removeLoan = (id: number) => onChange({ loans: data.loans.filter(l => l.id !== id) })
  const updateLoan = (id: number, patch: Partial<LoanDetail>) => onChange({
    loans: data.loans.map(l => l.id === id ? { ...l, ...patch } : l)
  })

  return (
    <div>
      <SectionTitle>遺梨??꾪솴</SectionTitle>
      <Notice>紐⑤뱺 ?異쒖쓣 鍮좎쭚?놁씠 ?낅젰??二쇱꽭?? ?뺥솗???꾧툑?먮쫫 怨꾩궛???ъ슜?⑸땲??</Notice>
      {totalRentalDeposit > 0 && (
        <div className="bg-[#FFF7ED] border border-[#FED7AA] rounded-[10px] px-4 py-3 mb-4">
          <p className="text-[12px] text-[#92400E] font-semibold mb-1">?먮룞 諛섏쁺: ?꾨?蹂댁쬆湲?/p>
          {data.realEstateItems.filter(r => r.rentalDeposit > 0).map(r => (
            <p key={r.id} className="text-[12px] text-[#92400E]">
              {r.kind} ({USAGE_LABELS[r.usage]}): {formatNumber(r.rentalDeposit)} 留뚯썝
            </p>
          ))}
          <p className="text-[12px] text-[#92400E] font-semibold mt-1">?⑷퀎: {formatNumber(totalRentalDeposit)} 留뚯썝</p>
        </div>
      )}
      {data.loans.map((loan) => (
        <div key={loan.id} className="bg-[#F8FAFC] rounded-[10px] p-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <FieldLabel>?異??좏삎</FieldLabel>
            <button onClick={() => removeLoan(loan.id)} className="text-[#EF4444] text-[12px] px-2 py-1 border border-[#FCA5A5] rounded-[8px]">??젣</button>
          </div>
          <div className="flex gap-2 flex-wrap mb-3">
            {loanTypes.map(t => (
              <MultiChipButton key={t} label={t} selected={loan.type === t} onClick={() => updateLoan(loan.id, { type: t })} />
            ))}
          </div>
          <NumberInput label="?異??붿븸" value={loan.balance} onChange={v => updateLoan(loan.id, { balance: v })} unit="留뚯썝" />
          <NumberInput label="???댁옄?? value={loan.interestRate} onChange={v => updateLoan(loan.id, { interestRate: v })} unit="%" placeholder="?? 4.5" allowDecimal={true} />
          <NumberInput label="?붿뿬 湲곌컙" value={loan.remainingMonths} onChange={v => updateLoan(loan.id, { remainingMonths: v })} unit="媛쒖썡" />
          <FieldLabel>?곹솚 諛⑹떇</FieldLabel>
          <RepayTypeSelector value={loan.repayType} onChange={v => updateLoan(loan.id, { repayType: v })} />
          {loan.repayType === 'equal_principal_interest' && (
            <NumberInput label="???⑹엯??(?먭툑+?댁옄)" value={loan.monthlyPayment}
              onChange={v => updateLoan(loan.id, { monthlyPayment: v })} unit="留뚯썝"
              hint="?먭툑怨??댁옄媛 ?⑹궛??湲덉븸???낅젰?섏꽭?? />
          )}
          {loan.repayType === 'equal_principal' && (
            <NumberInput label="???⑹엯 ?먭툑" value={loan.monthlyPayment}
              onChange={v => updateLoan(loan.id, { monthlyPayment: v })} unit="留뚯썝"
              hint="?먭툑留??낅젰?섏꽭??(?댁옄???먮룞 怨꾩궛)" />
          )}
          {loan.repayType === 'bullet' && (
            <div className="bg-[#FFF7ED] rounded-[8px] px-3 py-2 text-[12px] text-[#92400E]">
              留뚭린?쇱떆?곹솚: 留ㅼ썡 ?댁옄留??⑸?, 留뚭린 ???먭툑 ?쇱떆 ?곹솚
            </div>
          )}
        </div>
      ))}
      <button onClick={addLoan}
        className="text-[13px] text-[#1E3A5F] border border-[#1E3A5F] px-4 py-2 rounded-[10px] hover:bg-[#EFF6FF] transition-colors mb-4">
        + ?異?異붽?
      </button>
      <SumBar label="?異??⑷퀎" value={totalLoanDebt} />
      {totalRentalDeposit > 0 && <SumBar label="?꾨?蹂댁쬆湲??⑷퀎" value={totalRentalDeposit} />}
      <SumBar label="珥?遺梨??⑷퀎" value={totalDebt} />
      {totalMonthly > 0 && <SumBar label="???異??곹솚?? value={totalMonthly} />}
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
      <SectionTitle>?섏엯 / 吏異?/SectionTitle>
      <Notice>媛援??⑹궛 湲곗??쇰줈 ?낅젰??二쇱꽭?? ?명썑(?ㅼ닔?? 湲덉븸 湲곗??낅땲??</Notice>
      <FieldLabel>???섏엯</FieldLabel>
      <NumberInput label="洹쇰줈?뚮뱷 (?명썑)" value={data.salary} onChange={v => onChange({ salary: v })} unit="留뚯썝" />
      <NumberInput label="?ъ뾽?뚮뱷 (?명썑)" value={data.businessIncome} onChange={v => onChange({ businessIncome: v })} unit="留뚯썝" />
      <div className="mb-4">
        <FieldLabel>?꾨??뚮뱷</FieldLabel>
        <div className="relative">
          <input type="text" readOnly value={formatNumber(totalRentalIncome) || '0'}
            className="w-full border border-[#CBD5E1] rounded-[10px] px-3 py-2.5 text-[14px] text-[#94A3B8] bg-[#F8FAFC]" />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-[#94A3B8]">留뚯썝</span>
        </div>
        <p className="text-[11px] text-[#94A3B8] mt-1">?먯궛 ?낅젰(Step 2)??遺?숈궛 ???꾨?猷??⑷퀎媛 ?먮룞 諛섏쁺?⑸땲??</p>
      </div>
      <NumberInput label="諛곕떦/?댁옄?뚮뱷" value={data.dividendIncome} onChange={v => onChange({ dividendIncome: v })} unit="留뚯썝" />
      <NumberInput label="湲고? ?섏엯" value={data.otherIncome} onChange={v => onChange({ otherIncome: v })} unit="留뚯썝" />
      <SumBar label="???섏엯 ?⑷퀎" value={totalIncome} />
      <Divider />
      <FieldLabel>??吏異?/FieldLabel>
      <p className="text-[11px] text-[#94A3B8] mb-3">媛???ぉ???대떦?섎뒗 吏異쒖쓣 ?⑹궛?섏뿬 ?낅젰??二쇱꽭??</p>
      <NumberInput label="二쇨굅鍮? value={data.housingCost} onChange={v => onChange({ housingCost: v })} unit="留뚯썝" hint="愿由щ퉬, 怨듦낵湲? ?붿꽭 ?ы븿" />
      <NumberInput label="?앸퉬쨌?앺솢?⑺뭹" value={data.foodLife} onChange={v => onChange({ foodLife: v })} unit="留뚯썝" hint="?앸즺?? ?몄떇, ?앺솢?⑺뭹 ?ы븿" />
      <NumberInput label="援먰넻鍮? value={data.transportation} onChange={v => onChange({ transportation: v })} unit="留뚯썝" hint="?以묎탳?? 二쇱쑀鍮? ?먮룞李??좎?鍮??ы븿" />
      <NumberInput label="?듭떊鍮? value={data.communication} onChange={v => onChange({ communication: v })} unit="留뚯썝" hint="?대??? ?명꽣?? 援щ룆?쒕퉬???ы븿" />
      <NumberInput label="蹂댄뿕猷? value={data.insurance} onChange={v => onChange({ insurance: v })} unit="留뚯썝" hint="?앸챸쨌嫄닿컯쨌?먮룞李⑤낫?????꾩껜" />
      <NumberInput label="?섎즺쨌援먯쑁鍮? value={data.medicalEducation} onChange={v => onChange({ medicalEducation: v })} unit="留뚯썝" hint="蹂묒썝鍮? ?쎄컪, ?숈썝鍮? ?먮?援먯쑁鍮??ы븿" />
      <NumberInput label="?ш?쨌臾명솕쨌寃쎌“?? value={data.leisureSocial} onChange={v => onChange({ leisureSocial: v })} unit="留뚯썝" hint="?ы뻾, 痍⑤?, 寃쎌“?? ?뚯떇 ?ы븿" />
      <NumberInput label="湲고? 吏異? value={data.otherExpense} onChange={v => onChange({ otherExpense: v })} unit="留뚯썝" />
      <div className="mb-4">
        <FieldLabel>?異??곹솚??(?먮룞 怨꾩궛)</FieldLabel>
        <div className="relative">
          <input type="text" readOnly value={formatNumber(totalLoanPayment) || '0'}
            className="w-full border border-[#CBD5E1] rounded-[10px] px-3 py-2.5 text-[14px] text-[#94A3B8] bg-[#F8FAFC]" />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-[#94A3B8]">留뚯썝</span>
        </div>
        <p className="text-[11px] text-[#94A3B8] mt-1">Step 3?먯꽌 ?낅젰???異????⑹엯???⑷퀎媛 ?먮룞 諛섏쁺?⑸땲??</p>
      </div>
      <SumBar label="??吏異??⑷퀎" value={totalExpense} />
      <div className={`rounded-[10px] px-4 py-3 flex justify-between items-center mt-2 ${netCashflow >= 0 ? 'bg-[#F0FDF4]' : 'bg-[#FFF1F2]'}`}>
        <span className="text-[13px] font-medium">???쒗쁽湲덊쓲由?/span>
        <span className={`text-[15px] font-bold ${netCashflow >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
          {netCashflow >= 0 ? '+' : ''}{formatNumber(netCashflow)} 留뚯썝
        </span>
      </div>
      {netCashflow < 0 && <p className="text-[11px] text-[#DC2626] mt-1">吏異쒖씠 ?섏엯??珥덇낵?⑸땲?? ????먯궛 怨꾩궛 ??遺議깅텇??諛섏쁺?⑸땲??</p>}
      {netCashflow > 0 && <p className="text-[11px] text-[#16A34A] mt-1">?됱뿬 ?꾧툑?먮쫫? ??3% ?섏씡瑜좊줈 ?ы닾?먮릺??????먯궛??諛섏쁺?⑸땲??</p>}
      <Divider />
      <FieldLabel>蹂댄뿕 媛???꾪솴</FieldLabel>
      <p className="text-[11px] text-[#94A3B8] mb-3">媛?낅맂 蹂댄뿕??紐⑤몢 ?좏깮??二쇱꽭??</p>
      <div className="flex gap-2 flex-wrap mb-3">
        <MultiChipButton label="?ㅼ넀蹂댄뿕" selected={data.hasLossInsurance} onClick={() => onChange({ hasLossInsurance: !data.hasLossInsurance })} />
        <MultiChipButton label="醫낆떊쨌?뺢린蹂댄뿕" selected={data.hasLifeInsurance} onClick={() => onChange({ hasLifeInsurance: !data.hasLifeInsurance })} />
        <MultiChipButton label="?붋텰I蹂댄뿕" selected={data.hasCancerInsurance} onClick={() => onChange({ hasCancerInsurance: !data.hasCancerInsurance })} />
        <MultiChipButton label="?곌툑蹂댄뿕" selected={data.hasAnnuityInsurance} onClick={() => onChange({ hasAnnuityInsurance: !data.hasAnnuityInsurance })} />
      </div>
      <InfoBox>?낅젰?섏떊 ?뺣낫瑜?諛뷀깢?쇰줈 蹂댁옣 怨듬갚 遺꾩꽍 諛?留욎땄 蹂댄뿕 ?ㅺ퀎 ?쒕퉬?ㅻ? ?쒓났諛쏆쑝?????덉뒿?덈떎.</InfoBox>
    </div>
  )
}

// ============================================================
// Step 5 ??吏곸뾽 ?뺣낫 (?낆쥌肄붾뱶 異붽?)
// ============================================================
function Step5({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  const isEmployee  = data.jobType === 'employee'
  const isCorporate = data.jobType === 'corporate'
  const isSelf      = data.jobType === 'self_employed'
  const isFreelance = data.jobType === 'freelancer'

  return (
    <div>
      <SectionTitle>吏곸뾽 ?뺣낫</SectionTitle>
      <p className="text-[12px] text-[#94A3B8] mb-5">吏곸뾽 ?좏삎???곕씪 ?덉꽭 ?꾨왂怨??댁쭅湲됱뿬 怨꾩궛???щ씪吏묐땲??</p>
      <div className="mb-5">
        <FieldLabel>吏곸뾽 ?좏삎</FieldLabel>
        <div className="flex gap-2 flex-wrap">
          {([
            { value: 'employee',      label: '吏곸옣??     },
            { value: 'self_employed', label: '媛쒖씤?ъ뾽?? },
            { value: 'corporate',     label: '踰뺤씤???   },
            { value: 'freelancer',    label: '?꾨━?쒖꽌'   },
          ] as const).map(j => (
            <ChipButton key={j.value} label={j.label}
              selected={data.jobType === j.value}
              onClick={() => onChange({ jobType: j.value })} />
          ))}
        </div>
      </div>

      {isEmployee && (
        <div>
          <InfoBox>吏곸옣?몄? ?곕큺??湲곕컲?쇰줈 DB/DC ?댁쭅湲됱뿬瑜??먮룞 怨꾩궛?⑸땲??</InfoBox>
          <NumberInput label="?곕큺 (?몄쟾)" value={data.annualSalary}
            onChange={v => onChange({ annualSalary: v })} unit="留뚯썝"
            hint="DB???댁쭅湲됱뿬쨌DC???곌컙 遺덉엯??怨꾩궛???ъ슜?⑸땲?? />
        </div>
      )}

      {isCorporate && (
        <div>
          <InfoBox>
            踰뺤씤??쒕뒗 湲됱뿬? 諛곕떦 鍮꾩쑉 ?ㅺ퀎媛 ?듭떖 ?덉꽭 ?꾨왂?낅땲??
            湲됱뿬??洹쇰줈?뚮뱷?? 諛곕떦? 諛곕떦?뚮뱷??15.4%)媛 ?곸슜?⑸땲??
          </InfoBox>
          <NumberInput label="踰뺤씤 湲됱뿬 (?몄쟾 ?곕큺)" value={data.annualSalary}
            onChange={v => onChange({ annualSalary: v })} unit="留뚯썝" />
          <NumberInput label="?곌컙 諛곕떦 ?섎졊?? value={data.annualDividend}
            onChange={v => onChange({ annualDividend: v })} unit="留뚯썝"
            hint="踰뺤씤?쇰줈遺???섎졊??諛곕떦湲?(?곌컙 ?⑷퀎)" />
        </div>
      )}

      {isSelf && (
        <div>
          <InfoBox>
            媛쒖씤?ъ뾽?먮뒗 醫낇빀?뚮뱷???덉꽭媛 ?듭떖?낅땲??
            ?낆쥌肄붾뱶? 留ㅼ텧쨌?쒖씠?듭쓣 湲곕컲?쇰줈 留욎땄 ?덉꽭 ?꾨왂???쒖븞?대뱶由쎈땲??
          </InfoBox>
          <BusinessTypeSelector
            code={data.businessTypeCode}
            name={data.businessTypeName}
            onChange={(code, name) => onChange({ businessTypeCode: code, businessTypeName: name })}
          />
          <NumberInput label="??留ㅼ텧 (?곌컙 珥?留ㅼ텧??" value={data.annualRevenue}
            onChange={v => onChange({ annualRevenue: v })} unit="留뚯썝" />
          <NumberInput label="???쒖씠??(?몄쟾)" value={data.annualNetIncome}
            onChange={v => onChange({ annualNetIncome: v })} unit="留뚯썝"
            hint="留ㅼ텧 - 鍮꾩슜 ???⑥? 湲덉븸 (?몄쟾 湲곗?)" />
          <Divider />
          <FieldLabel>?덉꽭 ??ぉ</FieldLabel>
          <NumberInput label="?몃??곗궛怨듭젣 ???⑹엯?? value={data.yellowUmbrellaContrib}
            onChange={v => onChange({ yellowUmbrellaContrib: v })} unit="留뚯썝"
            hint="?뚭린?끒룹냼?곴났???꾩슜 쨌 ??理쒕? 500留뚯썝 ?뚮뱷怨듭젣" />
          <div className="mb-4">
            <FieldLabel>?λ? ?좏삎</FieldLabel>
            <div className="flex gap-2">
              {([
                { value: 'simple', label: '媛꾪렪?λ?' },
                { value: 'double', label: '蹂듭떇?λ?' },
                { value: 'none',   label: '臾닿린??   },
              ] as const).map(b => (
                <ChipButton key={b.value} label={b.label}
                  selected={data.bookkeepingType === b.value}
                  onClick={() => onChange({ bookkeepingType: b.value })} />
              ))}
            </div>
            <p className="text-[11px] text-[#94A3B8] mt-1">蹂듭떇?λ???寃곗넀湲??댁썡 ??異붽? ?쒗깮???덉뒿?덈떎.</p>
          </div>
        </div>
      )}

      {isFreelance && (
        <div>
          <InfoBox>
            ?꾨━?쒖꽌(3.3% ?먯쿇吏뺤닔)??醫낇빀?뚮뱷???좉퀬瑜??듯빐
            ?⑸????멸툑???섍툒諛쏄굅??異붽? 怨듭젣瑜?諛쏆쓣 ???덉뒿?덈떎.
          </InfoBox>
          <NumberInput label="???섏엯 (?곌컙 珥??섎졊??" value={data.annualRevenue}
            onChange={v => onChange({ annualRevenue: v })} unit="留뚯썝"
            hint="3.3% ?먯쿇吏뺤닔 ??湲덉븸 湲곗?" />
          <NumberInput label="???쒖씠??(寃쎈퉬 ?쒖쇅 ??" value={data.annualNetIncome}
            onChange={v => onChange({ annualNetIncome: v })} unit="留뚯썝"
            hint="?낅Т 愿??寃쎈퉬瑜??쒖쇅???ㅼ쭏 ?뚮뱷" />
          <Divider />
          <FieldLabel>?덉꽭 ??ぉ</FieldLabel>
          <NumberInput label="?몃??곗궛怨듭젣 ???⑹엯?? value={data.yellowUmbrellaContrib}
            onChange={v => onChange({ yellowUmbrellaContrib: v })} unit="留뚯썝"
            hint="?뚭린?끒룹냼?곴났???대떦 ??쨌 ??理쒕? 500留뚯썝 ?뚮뱷怨듭젣" />
        </div>
      )}

      <Divider />
      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[12px] p-4">
        <p className="text-[14px] font-semibold text-[#1E293B] mb-1">?멸툑 ?덉꽭 ?꾨왂 ?곷떞</p>
        <p className="text-[13px] text-[#475569] mb-1">?댄씎以 怨듭씤?뚭퀎???몃Т??/p>
        <p className="text-[12px] text-[#94A3B8] mb-3">
          洹쇰줈?뚮뱷 쨌 ?ъ뾽?뚮뱷 쨌 踰뺤씤 ?덉꽭 쨌 ?댁쭅湲??ㅺ퀎 ?곷떞
        </p>
        <a href="tel:01024981905"
          className="inline-block bg-[#1E3A5F] text-white text-[13px] font-medium px-4 py-2.5 rounded-[10px] hover:bg-[#1E3A5F]/90 transition-colors">
          010-2498-1905 臾대즺 ?곷떞
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
      <SectionTitle>???紐⑺몴</SectionTitle>
      <p className="text-[12px] text-[#94A3B8] mb-6">??????먰븯???앺솢 ?섏????낅젰??二쇱꽭??</p>
      {age > 0 && (
        <div className="bg-[#EFF6FF] rounded-[10px] px-4 py-3 mb-5 text-[13px] text-[#1E40AF]">
          ?꾩옱 {age}??????닿퉴吏 ??<strong>{yearsToRetirement}??/strong> 쨌 ???????<strong>{retirementPeriod}??/strong> ?앹〈 湲곌컙 媛??
        </div>
      )}
      <NumberInput label="????????щ쭩 ?앺솢鍮? value={data.retirementMonthlyExpense}
        onChange={v => onChange({ retirementMonthlyExpense: v })} unit="留뚯썝"
        hint="?꾩옱 臾쇨? 湲곗??쇰줈 ?낅젰?섏꽭?? ????쒖젏源뚯? 臾쇨??곸듅瑜?2.5% ?먮룞 諛섏쁺?⑸땲??" />
    </div>
  )
}

// ============================================================
// Step 7
// ============================================================
function Step7({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  return (
    <div>
      <SectionTitle>?곕씫泥?/SectionTitle>
      <p className="text-[12px] text-[#94A3B8] mb-6">吏꾨떒 蹂닿퀬?쒕? 諛쏆쑝???곕씫泥섎? ?낅젰??二쇱꽭??</p>
      <div className="mb-4">
        <FieldLabel>?대쫫</FieldLabel>
        <input type="text" value={data.name} onChange={e => onChange({ name: e.target.value })}
          placeholder="?ㅻ챸???낅젰??二쇱꽭??
          className="w-full border border-[#CBD5E1] rounded-[10px] px-3 py-2.5 text-[14px] text-[#1E293B] bg-white focus:outline-none focus:border-[#1E3A5F]" />
      </div>
      <div className="mb-4">
        <FieldLabel>?대???踰덊샇</FieldLabel>
        <input type="tel" value={data.phone} onChange={e => onChange({ phone: e.target.value })}
          placeholder="010-0000-0000"
          className="w-full border border-[#CBD5E1] rounded-[10px] px-3 py-2.5 text-[14px] text-[#1E293B] bg-white focus:outline-none focus:border-[#1E3A5F]" />
      </div>
      <div className="mb-4">
        <FieldLabel>?대찓??(?좏깮)</FieldLabel>
        <input type="email" value={data.email} onChange={e => onChange({ email: e.target.value })}
          placeholder="example@email.com"
          className="w-full border border-[#CBD5E1] rounded-[10px] px-3 py-2.5 text-[14px] text-[#1E293B] bg-white focus:outline-none focus:border-[#1E3A5F]" />
      </div>
      <div className="flex items-start gap-3 mt-4 p-4 bg-[#F8FAFC] rounded-[10px]">
        <input type="checkbox" id="privacy" checked={data.privacyAgree}
          onChange={e => onChange({ privacyAgree: e.target.checked })}
          className="mt-0.5 w-4 h-4 accent-[#1E3A5F]" />
        <label htmlFor="privacy" className="text-[12px] text-[#475569] leading-relaxed">
          媛쒖씤?뺣낫 ?섏쭛쨌?댁슜???숈쓽?⑸땲?? ?낅젰?섏떊 ?뺣낫???щТ 吏꾨떒 ?쒕퉬???쒓났 紐⑹쟻?쇰줈留??ъ슜?섎ŉ, ???먯뿉寃??쒓났?섏? ?딆뒿?덈떎.
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
      if (!res.ok) throw new Error('?쒖텧 ?ㅽ뙣')
      setIsDone(true)
    } catch {
      setSubmitError('?쒖텧 以??ㅻ쪟媛 諛쒖깮?덉뒿?덈떎. ?ㅼ떆 ?쒕룄??二쇱꽭??')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isDone) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="bg-white rounded-[20px] p-8 max-w-sm w-full text-center shadow-sm">
          <div className="text-5xl mb-4">??/div>
          <h2 className="text-[20px] font-bold text-[#1E293B] mb-3">?묒닔 ?꾨즺!</h2>
          <p className="text-[14px] text-[#475569] mb-2">?щТ 吏꾨떒 ?좎껌???꾨즺?섏뿀?듬땲??</p>
          <p className="text-[13px] text-[#94A3B8] mb-6">?대떦?먭? 寃?????곕씫?쒕━寃좎뒿?덈떎.</p>
          <button onClick={() => router.push('/')}
            className="w-full bg-[#1E3A5F] text-white py-3 rounded-[12px] text-[14px] font-semibold">
            ?덉쑝濡??뚯븘媛湲?
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-[22px] font-bold text-[#1E293B]">?щТ 吏꾨떒</h1>
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
              ?댁쟾
            </button>
          )}
          {step < TOTAL_STEPS ? (
            <button onClick={() => { if (canProceed) setStep(s => s + 1) }} disabled={!canProceed}
              className={`flex-1 py-3.5 rounded-[12px] text-[14px] font-semibold transition-all ${canProceed ? 'bg-[#1E3A5F] text-white hover:bg-[#1E3A5F]/90' : 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'}`}>
              ?ㅼ쓬
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={isSubmitting || !canProceed}
              className={`flex-1 py-3.5 rounded-[12px] text-[14px] font-semibold transition-all ${isSubmitting || !canProceed ? 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed' : 'bg-[#1E3A5F] text-white hover:bg-[#1E3A5F]/90'}`}>
              {isSubmitting ? '?쒖텧 以?..' : '吏꾨떒 ?쒖텧'}
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
             

