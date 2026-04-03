'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// =============================================================================
// Types
// =============================================================================
export type RealEstateKind =
  | '아파트(수도권)'
  | '아파트(기타)'
  | '오피스텔'
  | '다세대/빌라'
  | '단독주택'
  | '토지'
  | '상가';

export type RealEstateUsage =
  | '자가거주'
  | '임대중'
  | '임대중(향후실거주예정)'
  | '겸용'
  | '미사용';

export interface RealEstateItem {
  id: number;
  kind: RealEstateKind;
  usage: RealEstateUsage;
  currentValue: number;
  rentalDeposit: number;
  monthlyRent: number;
}

export interface ChildInfo {
  age: number;
  educationLevel: '고등학교' | '대학교' | '대학원';
}

export interface InsurancePayout {
  name: string;
  amount: number;
  age: number;
}

export interface LoanDetail {
  name: string;
  balance: number;
  monthlyPayment: number;
  rate: number;
  remainMonths: number;
  repayType: 'equal' | 'principal' | 'bullet';
}

export interface FormData {
  // Step 1
  name: string;
  birthYear: number;
  gender: '남' | '여' | '';
  maritalStatus: '기혼' | '미혼' | '기타' | '';
  spouseBirthYear: number;
  hasChildren: boolean;
  children: ChildInfo[];

  // Step 2 - Assets
  cash: number;
  deposit: number;
  cma: number;
  stocks: number;
  funds: number;
  crypto: number;
  pension: number;
  irp: number;
  monthlyPension: number;
  realEstateItems: RealEstateItem[];
  rentalDeposit: number; // 임차보증금(내가 낸 것)

  // Step 3 - Liabilities
  loans: LoanDetail[];

  // Step 4 - Income/Expenses
  monthlyIncome: number;
  spouseIncome: number;
  otherIncome: number;
  monthlyExpense: number;
  childEducationCost: number;

  // Step 5 - Job
  job: '직장인' | '자영업' | '프리랜서' | '전업주부' | '기타' | '';
  workYears: number;
  expectedRetireAge: number;
  hasSeverance: boolean;
  severanceEstimate: number;
  hasNationalPension: boolean;
  nationalPensionMonthly: number;
  hasPrivatePension: boolean;
  privatePensionMonthly: number;

  // Step 6 - Retirement Goal
  retireAge: number;
  lifeExpectancy: number;
  monthlyRetireExpense: number;
  riskTolerance: '안정형' | '중립형' | '적극형' | '';

  // Step 7 - Contact
  phone: string;
  email: string;
  consultMethod: '방문' | '화상' | '전화' | '';
  agreePrivacy: boolean;
}

// =============================================================================
// Constants
// =============================================================================
const TOTAL_STEPS = 7;

export const REAL_ESTATE_KINDS: RealEstateKind[] = [
  '아파트(수도권)', '아파트(기타)', '오피스텔', '다세대/빌라', '단독주택', '토지', '상가',
];

export const REAL_ESTATE_USAGES: RealEstateUsage[] = [
  '자가거주', '임대중', '임대중(향후실거주예정)', '겸용', '미사용',
];

export const USAGE_LABELS: Record<RealEstateUsage, string> = {
  '자가거주': '자가거주',
  '임대중': '임대중',
  '임대중(향후실거주예정)': '임대중(향후 실거주예정)',
  '겸용': '겸용',
  '미사용': '미사용/공실',
};

// =============================================================================
// Utilities
// =============================================================================
function calcAge(birthYear: number): number {
  return new Date().getFullYear() - birthYear + 1;
}

function formatNumber(n: number): string {
  if (!n) return '';
  return n.toLocaleString('ko-KR');
}

function calcTotalRentalIncome(items: RealEstateItem[]): number {
  return items
    .filter(i => i.usage === '임대중' || i.usage === '임대중(향후실거주예정)' || i.usage === '겸용')
    .reduce((sum, i) => sum + (i.monthlyRent || 0), 0);
}

function hasRentalIncome(usage: RealEstateUsage): boolean {
  return usage === '임대중' || usage === '임대중(향후실거주예정)' || usage === '겸용';
}

// =============================================================================
// UI Primitives
// =============================================================================
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-bold text-blue-700 mb-4 mt-6 border-b-2 border-blue-200 pb-2">{children}</h2>;
}

function FieldLabel({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="mb-1">
      <label className="text-sm font-semibold text-gray-700">{children}</label>
      {sub && <span className="text-xs text-gray-400 ml-2">{sub}</span>}
    </div>
  );
}

function NumberInput({
  value, onChange, placeholder, unit, min, max,
}: {
  value: number; onChange: (v: number) => void; placeholder?: string; unit?: string; min?: number; max?: number;
}) {
  return (
    <div className="flex items-center gap-1">
      <input
        type="text"
        inputMode="numeric"
        className="border border-gray-300 rounded-lg px-3 py-2 text-right w-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
        value={value ? formatNumber(value) : ''}
        placeholder={placeholder ?? '0'}
        onChange={e => {
          const raw = e.target.value.replace(/,/g, '');
          const n = parseInt(raw, 10);
          onChange(isNaN(n) ? 0 : Math.max(min ?? 0, Math.min(max ?? 999999, n)));
        }}
      />
      {unit && <span className="text-sm text-gray-500 whitespace-nowrap">{unit}</span>}
    </div>
  );
}

function ChipButton({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
        selected ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
      }`}
    >
      {label}
    </button>
  );
}

function MultiChipButton({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
        selected ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-300 hover:border-green-400'
      }`}
    >
      {label}
    </button>
  );
}

function Divider() {
  return <hr className="my-4 border-gray-200" />;
}

function SumBar({ label, value, unit = '만원', color = 'blue' }: { label: string; value: number; unit?: string; color?: string }) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    gray: 'bg-gray-50 border-gray-200 text-gray-700',
  };
  return (
    <div className={`flex justify-between items-center px-4 py-2 rounded-lg border mt-3 ${colorMap[color] ?? colorMap.blue}`}>
      <span className="text-sm font-semibold">{label}</span>
      <span className="text-base font-bold">{formatNumber(value)} {unit}</span>
    </div>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-xs text-yellow-800 mt-3">
      {children}
    </div>
  );
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-xs text-blue-800 mt-3">
      {children}
    </div>
  );
}

function RepayTypeSelector({
  value, onChange,
}: {
  value: 'equal' | 'principal' | 'bullet';
  onChange: (v: 'equal' | 'principal' | 'bullet') => void;
}) {
  const options: { v: 'equal' | 'principal' | 'bullet'; label: string }[] = [
    { v: 'equal', label: '원리금균등' },
    { v: 'principal', label: '원금균등' },
    { v: 'bullet', label: '만기일시' },
  ];
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map(o => (
        <ChipButton key={o.v} label={o.label} selected={value === o.v} onClick={() => onChange(o.v)} />
      ))}
    </div>
  );
}

// =============================================================================
// RealEstateCard
// =============================================================================
function RealEstateCard({
  item, index, onChange, onDelete,
}: {
  item: RealEstateItem;
  index: number;
  onChange: (updated: RealEstateItem) => void;
  onDelete: () => void;
}) {
  const showRental = hasRentalIncome(item.usage);

  return (
    <div className="border border-gray-200 rounded-xl p-4 mb-3 bg-white shadow-sm relative">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-bold text-blue-700">부동산 {index + 1}</span>
        <button
          type="button"
          onClick={onDelete}
          className="text-red-400 hover:text-red-600 text-xs px-2 py-1 border border-red-200 rounded-lg"
        >
          삭제
        </button>
      </div>

      {/* 종류 */}
      <div className="mb-3">
        <FieldLabel>종류</FieldLabel>
        <select
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={item.kind}
          onChange={e => onChange({ ...item, kind: e.target.value as RealEstateKind })}
        >
          {REAL_ESTATE_KINDS.map(k => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
      </div>

      {/* 용도 */}
      <div className="mb-3">
        <FieldLabel>용도</FieldLabel>
        <select
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={item.usage}
          onChange={e => onChange({ ...item, usage: e.target.value as RealEstateUsage })}
        >
          {REAL_ESTATE_USAGES.map(u => (
            <option key={u} value={u}>{USAGE_LABELS[u]}</option>
          ))}
        </select>
      </div>

      {/* 시세 */}
      <div className="mb-3">
        <FieldLabel>현재 시세</FieldLabel>
        <NumberInput
          value={item.currentValue}
          onChange={v => onChange({ ...item, currentValue: v })}
          placeholder="시세 입력"
          unit="만원"
        />
      </div>

      {/* 임대 정보 */}
      {showRental && (
        <>
          <div className="mb-3">
            <FieldLabel>임대보증금 (받은 것)</FieldLabel>
            <NumberInput
              value={item.rentalDeposit}
              onChange={v => onChange({ ...item, rentalDeposit: v })}
              placeholder="0"
              unit="만원"
            />
          </div>
          <div className="mb-1">
            <FieldLabel>월 임대료</FieldLabel>
            <NumberInput
              value={item.monthlyRent}
              onChange={v => onChange({ ...item, monthlyRent: v })}
              placeholder="0"
              unit="만원/월"
            />
          </div>
          {item.usage === '임대중(향후실거주예정)' && (
            <Notice>향후 실거주 시 임대소득이 종료되며, 해당 시점부터 임대소득은 계산에서 제외됩니다.</Notice>
          )}
        </>
      )}
    </div>
  );
}

// =============================================================================
// Initial Data
// =============================================================================
const initialFormData: FormData = {
  name: '', birthYear: 1980, gender: '', maritalStatus: '', spouseBirthYear: 0,
  hasChildren: false, children: [],
  cash: 0, deposit: 0, cma: 0, stocks: 0, funds: 0, crypto: 0,
  pension: 0, irp: 0, monthlyPension: 0,
  realEstateItems: [],
  rentalDeposit: 0,
  loans: [],
  monthlyIncome: 0, spouseIncome: 0, otherIncome: 0,
  monthlyExpense: 0, childEducationCost: 0,
  job: '', workYears: 0, expectedRetireAge: 60,
  hasSeverance: false, severanceEstimate: 0,
  hasNationalPension: false, nationalPensionMonthly: 0,
  hasPrivatePension: false, privatePensionMonthly: 0,
  retireAge: 60, lifeExpectancy: 90, monthlyRetireExpense: 300,
  riskTolerance: '',
  phone: '', email: '', consultMethod: '', agreePrivacy: false,
};

// =============================================================================
// Step 1 — 기본 정보
// =============================================================================
function Step1({ data, update }: { data: FormData; update: (d: Partial<FormData>) => void }) {
  return (
    <div>
      <SectionTitle>기본 정보</SectionTitle>

      <div className="mb-4">
        <FieldLabel>성함</FieldLabel>
        <input
          className="border border-gray-300 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={data.name}
          onChange={e => update({ name: e.target.value })}
          placeholder="홍길동"
        />
      </div>

      <div className="mb-4">
        <FieldLabel>출생연도</FieldLabel>
        <NumberInput value={data.birthYear} onChange={v => update({ birthYear: v })} placeholder="1980" unit="년생" min={1940} max={2005} />
        {data.birthYear > 1940 && (
          <p className="text-xs text-gray-400 mt-1">현재 나이: {calcAge(data.birthYear)}세</p>
        )}
      </div>

      <div className="mb-4">
        <FieldLabel>성별</FieldLabel>
        <div className="flex gap-2">
          {(['남', '여'] as const).map(g => (
            <ChipButton key={g} label={g} selected={data.gender === g} onClick={() => update({ gender: g })} />
          ))}
        </div>
      </div>

      <div className="mb-4">
        <FieldLabel>결혼 여부</FieldLabel>
        <div className="flex gap-2 flex-wrap">
          {(['기혼', '미혼', '기타'] as const).map(m => (
            <ChipButton key={m} label={m} selected={data.maritalStatus === m} onClick={() => update({ maritalStatus: m })} />
          ))}
        </div>
      </div>

      {data.maritalStatus === '기혼' && (
        <div className="mb-4">
          <FieldLabel>배우자 출생연도</FieldLabel>
          <NumberInput value={data.spouseBirthYear} onChange={v => update({ spouseBirthYear: v })} placeholder="1982" unit="년생" min={1940} max={2005} />
        </div>
      )}

      <Divider />

      <div className="mb-4">
        <FieldLabel>자녀 유무</FieldLabel>
        <div className="flex gap-2">
          <ChipButton label="있음" selected={data.hasChildren} onClick={() => update({ hasChildren: true })} />
          <ChipButton label="없음" selected={!data.hasChildren} onClick={() => update({ hasChildren: false, children: [] })} />
        </div>
      </div>

      {data.hasChildren && (
        <>
          {data.children.map((child, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-4 mb-3 bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-blue-700">자녀 {i + 1}</span>
                <button
                  type="button"
                  onClick={() => update({ children: data.children.filter((_, j) => j !== i) })}
                  className="text-red-400 text-xs hover:text-red-600"
                >
                  삭제
                </button>
              </div>
              <div className="mb-2">
                <FieldLabel>나이</FieldLabel>
                <NumberInput value={child.age} onChange={v => {
                  const c = [...data.children]; c[i] = { ...c[i], age: v }; update({ children: c });
                }} unit="세" min={1} max={40} />
              </div>
              <div>
                <FieldLabel>목표 학력</FieldLabel>
                <div className="flex gap-2 flex-wrap">
                  {(['고등학교', '대학교', '대학원'] as const).map(l => (
                    <ChipButton key={l} label={l} selected={child.educationLevel === l} onClick={() => {
                      const c = [...data.children]; c[i] = { ...c[i], educationLevel: l }; update({ children: c });
                    }} />
                  ))}
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => update({ children: [...data.children, { age: 10, educationLevel: '대학교' }] })}
            className="w-full py-2 border-2 border-dashed border-blue-300 rounded-xl text-blue-500 text-sm hover:bg-blue-50 mt-2"
          >
            + 자녀 추가
          </button>
        </>
      )}
    </div>
  );
}

// =============================================================================
// Step 2 — 자산 현황
// =============================================================================
function Step2({ data, update }: { data: FormData; update: (d: Partial<FormData>) => void }) {
  const totalCash = data.cash + data.deposit + data.cma;
  const totalInvest = data.stocks + data.funds + data.crypto;
  const totalRE = data.realEstateItems.reduce((s, i) => s + i.currentValue, 0);
  const totalReceived = data.realEstateItems
    .filter(i => hasRentalIncome(i.usage))
    .reduce((s, i) => s + i.rentalDeposit, 0);
  const totalRental = calcTotalRentalIncome(data.realEstateItems);
  const totalAsset = totalCash + totalInvest + data.pension + data.irp + totalRE + data.rentalDeposit;

  const addRE = () => {
    const newItem: RealEstateItem = {
      id: Date.now(), kind: '아파트(수도권)', usage: '자가거주',
      currentValue: 0, rentalDeposit: 0, monthlyRent: 0,
    };
    update({ realEstateItems: [...data.realEstateItems, newItem] });
  };

  const updateRE = (id: number, updated: RealEstateItem) => {
    update({ realEstateItems: data.realEstateItems.map(i => i.id === id ? updated : i) });
  };

  const deleteRE = (id: number) => {
    update({ realEstateItems: data.realEstateItems.filter(i => i.id !== id) });
  };

  return (
    <div>
      <SectionTitle>자산 현황</SectionTitle>

      {/* 현금성 자산 */}
      <div className="mb-2">
        <FieldLabel>현금 / 통장 잔액</FieldLabel>
        <NumberInput value={data.cash} onChange={v => update({ cash: v })} unit="만원" />
      </div>
      <div className="mb-2">
        <FieldLabel>예·적금</FieldLabel>
        <NumberInput value={data.deposit} onChange={v => update({ deposit: v })} unit="만원" />
      </div>
      <div className="mb-2">
        <FieldLabel>CMA / MMF</FieldLabel>
        <NumberInput value={data.cma} onChange={v => update({ cma: v })} unit="만원" />
      </div>
      <div className="mb-2">
        <FieldLabel>임차보증금 (내가 낸 것)</FieldLabel>
        <NumberInput value={data.rentalDeposit} onChange={v => update({ rentalDeposit: v })} unit="만원" />
      </div>
      <SumBar label="현금성 자산 합계" value={totalCash} />

      <Divider />

      {/* 투자 자산 */}
      <div className="mb-2">
        <FieldLabel>주식</FieldLabel>
        <NumberInput value={data.stocks} onChange={v => update({ stocks: v })} unit="만원" />
      </div>
      <div className="mb-2">
        <FieldLabel>펀드 / ETF</FieldLabel>
        <NumberInput value={data.funds} onChange={v => update({ funds: v })} unit="만원" />
      </div>
      <div className="mb-2">
        <FieldLabel>가상자산</FieldLabel>
        <NumberInput value={data.crypto} onChange={v => update({ crypto: v })} unit="만원" />
      </div>
      <SumBar label="투자 자산 합계" value={totalInvest} />

      <Divider />

      {/* 연금 */}
      <div className="mb-2">
        <FieldLabel>개인연금 적립액</FieldLabel>
        <NumberInput value={data.pension} onChange={v => update({ pension: v })} unit="만원" />
      </div>
      <div className="mb-2">
        <FieldLabel>IRP / 퇴직연금 적립액</FieldLabel>
        <NumberInput value={data.irp} onChange={v => update({ irp: v })} unit="만원" />
      </div>

      <Divider />

      {/* 부동산 */}
      <FieldLabel>부동산</FieldLabel>
      {data.realEstateItems.map((item, index) => (
        <RealEstateCard
          key={item.id}
          item={item}
          index={index}
          onChange={updated => updateRE(item.id, updated)}
          onDelete={() => deleteRE(item.id)}
        />
      ))}
      <button
        type="button"
        onClick={addRE}
        className="w-full py-2 border-2 border-dashed border-blue-300 rounded-xl text-blue-500 text-sm hover:bg-blue-50 mt-2 mb-3"
      >
        + 부동산 추가
      </button>

      {data.realEstateItems.length > 0 && (
        <>
          <SumBar label="부동산 시세 합계" value={totalRE} />
          {totalReceived > 0 && (
            <SumBar label="임대보증금 수취 합계 (부채)" value={totalReceived} color="red" />
          )}
          {totalRental > 0 && (
            <SumBar label="월 임대소득 합계" value={totalRental} unit="만원/월" color="green" />
          )}
        </>
      )}

      <Divider />
      <SumBar label="총 자산 합계" value={totalAsset} color="green" />
      <Notice>임차보증금은 원금 반환 예정 자산으로 포함되며, 임대보증금(받은 것)은 부채로 처리됩니다.</Notice>
    </div>
  );
}

// =============================================================================
// Step 3 — 부채
// =============================================================================
function Step3({ data, update }: { data: FormData; update: (d: Partial<FormData>) => void }) {
  const totalRentalDebt = data.realEstateItems
    .filter(i => hasRentalIncome(i.usage))
    .reduce((s, i) => s + i.rentalDeposit, 0);

  const totalLoan = data.loans.reduce((s, l) => s + l.balance, 0);
  const totalDebt = totalLoan + totalRentalDebt;

  const addLoan = () => {
    const newLoan: LoanDetail = {
      name: '', balance: 0, monthlyPayment: 0, rate: 0, remainMonths: 0, repayType: 'equal',
    };
    update({ loans: [...data.loans, newLoan] });
  };

  const updateLoan = (i: number, updated: LoanDetail) => {
    const loans = [...data.loans]; loans[i] = updated; update({ loans });
  };

  const deleteLoan = (i: number) => {
    update({ loans: data.loans.filter((_, j) => j !== i) });
  };

  return (
    <div>
      <SectionTitle>부채 현황</SectionTitle>

      {totalRentalDebt > 0 && (
        <InfoBox>
          임대보증금(받은 것) {formatNumber(totalRentalDebt)}만원이 부채에 자동 반영됩니다.
        </InfoBox>
      )}

      {data.loans.map((loan, i) => (
        <div key={i} className="border border-gray-200 rounded-xl p-4 mb-3 bg-white shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-bold text-blue-700">대출 {i + 1}</span>
            <button
              type="button"
              onClick={() => deleteLoan(i)}
              className="text-red-400 hover:text-red-600 text-xs px-2 py-1 border border-red-200 rounded-lg"
            >
              삭제
            </button>
          </div>
          <div className="mb-2">
            <FieldLabel>대출명</FieldLabel>
            <input
              className="border border-gray-300 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={loan.name}
              onChange={e => updateLoan(i, { ...loan, name: e.target.value })}
              placeholder="주택담보대출 등"
            />
          </div>
          <div className="mb-2">
            <FieldLabel>잔액</FieldLabel>
            <NumberInput value={loan.balance} onChange={v => updateLoan(i, { ...loan, balance: v })} unit="만원" />
          </div>
          <div className="mb-2">
            <FieldLabel>월 납입액</FieldLabel>
            <NumberInput value={loan.monthlyPayment} onChange={v => updateLoan(i, { ...loan, monthlyPayment: v })} unit="만원/월" />
          </div>
          <div className="mb-2">
            <FieldLabel>금리</FieldLabel>
            <NumberInput value={loan.rate} onChange={v => updateLoan(i, { ...loan, rate: v })} unit="%" min={0} max={30} />
          </div>
          <div className="mb-2">
            <FieldLabel>남은 기간</FieldLabel>
            <NumberInput value={loan.remainMonths} onChange={v => updateLoan(i, { ...loan, remainMonths: v })} unit="개월" min={0} max={600} />
          </div>
          <div>
            <FieldLabel>상환 방식</FieldLabel>
            <RepayTypeSelector value={loan.repayType} onChange={v => updateLoan(i, { ...loan, repayType: v })} />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addLoan}
        className="w-full py-2 border-2 border-dashed border-blue-300 rounded-xl text-blue-500 text-sm hover:bg-blue-50 mt-2 mb-3"
      >
        + 대출 추가
      </button>

      {totalRentalDebt > 0 && <SumBar label="임대보증금 (부채)" value={totalRentalDebt} color="red" />}
      {totalLoan > 0 && <SumBar label="대출 합계" value={totalLoan} color="red" />}
      <SumBar label="총 부채 합계" value={totalDebt} color="red" />
    </div>
  );
}

// =============================================================================
// Step 4 — 수입 / 지출
// =============================================================================
function Step4({ data, update }: { data: FormData; update: (d: Partial<FormData>) => void }) {
  const totalIncome = data.monthlyIncome + data.spouseIncome + data.otherIncome
    + calcTotalRentalIncome(data.realEstateItems);
  const totalExpense = data.monthlyExpense + data.childEducationCost;
  const cashFlow = totalIncome - totalExpense;

  return (
    <div>
      <SectionTitle>월 수입 / 지출</SectionTitle>

      <div className="mb-2">
        <FieldLabel>본인 월 소득</FieldLabel>
        <NumberInput value={data.monthlyIncome} onChange={v => update({ monthlyIncome: v })} unit="만원/월" />
      </div>
      <div className="mb-2">
        <FieldLabel>배우자 월 소득</FieldLabel>
        <NumberInput value={data.spouseIncome} onChange={v => update({ spouseIncome: v })} unit="만원/월" />
      </div>
      <div className="mb-2">
        <FieldLabel>기타 소득</FieldLabel>
        <NumberInput value={data.otherIncome} onChange={v => update({ otherIncome: v })} unit="만원/월" />
      </div>

      {calcTotalRentalIncome(data.realEstateItems) > 0 && (
        <SumBar
          label={`임대소득 (자동 합산)`}
          value={calcTotalRentalIncome(data.realEstateItems)}
          unit="만원/월"
          color="green"
        />
      )}
      <SumBar label="월 총 수입" value={totalIncome} color="green" />

      <Divider />

      <div className="mb-2">
        <FieldLabel>월 생활비 (고정)</FieldLabel>
        <NumberInput value={data.monthlyExpense} onChange={v => update({ monthlyExpense: v })} unit="만원/월" />
      </div>
      <div className="mb-2">
        <FieldLabel>자녀 교육비</FieldLabel>
        <NumberInput value={data.childEducationCost} onChange={v => update({ childEducationCost: v })} unit="만원/월" />
      </div>
      <SumBar label="월 총 지출" value={totalExpense} color="red" />

      <Divider />

      <div className={`flex justify-between items-center px-4 py-3 rounded-xl border-2 mt-2 ${
        cashFlow >= 0 ? 'bg-green-50 border-green-300 text-green-700' : 'bg-red-50 border-red-300 text-red-700'
      }`}>
        <span className="font-bold text-sm">월 잉여 현금흐름</span>
        <span className="font-bold text-base">{cashFlow >= 0 ? '+' : ''}{formatNumber(cashFlow)} 만원/월</span>
      </div>

      {cashFlow < 0 && (
        <Notice>월 지출이 수입을 초과하고 있습니다. 은퇴 자산 계산 시 부족분이 반영됩니다.</Notice>
      )}
      {cashFlow > 0 && (
        <InfoBox>잉여 현금흐름은 연 3% 수익률로 재투자되어 은퇴 자산에 반영됩니다.</InfoBox>
      )}
    </div>
  );
}

// =============================================================================
// Step 5 — 직업 정보
// =============================================================================
function Step5({ data, update }: { data: FormData; update: (d: Partial<FormData>) => void }) {
  return (
    <div>
      <SectionTitle>직업 정보</SectionTitle>

      <div className="mb-4">
        <FieldLabel>직업 유형</FieldLabel>
        <div className="flex gap-2 flex-wrap">
          {(['직장인', '자영업', '프리랜서', '전업주부', '기타'] as const).map(j => (
            <ChipButton key={j} label={j} selected={data.job === j} onClick={() => update({ job: j })} />
          ))}
        </div>
      </div>

      <div className="mb-4">
        <FieldLabel>총 근무 연수</FieldLabel>
        <NumberInput value={data.workYears} onChange={v => update({ workYears: v })} unit="년" min={0} max={50} />
      </div>

      <div className="mb-4">
        <FieldLabel>예상 퇴직 나이</FieldLabel>
        <NumberInput value={data.expectedRetireAge} onChange={v => update({ expectedRetireAge: v })} unit="세" min={40} max={80} />
      </div>

      <Divider />

      <div className="mb-3">
        <FieldLabel>퇴직금 수령 예정</FieldLabel>
        <div className="flex gap-2">
          <ChipButton label="있음" selected={data.hasSeverance} onClick={() => update({ hasSeverance: true })} />
          <ChipButton label="없음" selected={!data.hasSeverance} onClick={() => update({ hasSeverance: false, severanceEstimate: 0 })} />
        </div>
      </div>
      {data.hasSeverance && (
        <div className="mb-4">
          <FieldLabel>퇴직금 예상액</FieldLabel>
          <NumberInput value={data.severanceEstimate} onChange={v => update({ severanceEstimate: v })} unit="만원" />
        </div>
      )}

      <Divider />

      <div className="mb-3">
        <FieldLabel>국민연금 가입 여부</FieldLabel>
        <div className="flex gap-2">
          <ChipButton label="가입" selected={data.hasNationalPension} onClick={() => update({ hasNationalPension: true })} />
          <ChipButton label="미가입" selected={!data.hasNationalPension} onClick={() => update({ hasNationalPension: false, nationalPensionMonthly: 0 })} />
        </div>
      </div>
      {data.hasNationalPension && (
        <div className="mb-4">
          <FieldLabel>예상 수령액</FieldLabel>
          <NumberInput value={data.nationalPensionMonthly} onChange={v => update({ nationalPensionMonthly: v })} unit="만원/월" />
        </div>
      )}

      <div className="mb-3">
        <FieldLabel>개인연금 / IRP 수령 예상</FieldLabel>
        <div className="flex gap-2">
          <ChipButton label="있음" selected={data.hasPrivatePension} onClick={() => update({ hasPrivatePension: true })} />
          <ChipButton label="없음" selected={!data.hasPrivatePension} onClick={() => update({ hasPrivatePension: false, privatePensionMonthly: 0 })} />
        </div>
      </div>
      {data.hasPrivatePension && (
        <div className="mb-4">
          <FieldLabel>예상 수령액</FieldLabel>
          <NumberInput value={data.privatePensionMonthly} onChange={v => update({ privatePensionMonthly: v })} unit="만원/월" />
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Step 6 — 은퇴 목표
// =============================================================================
function Step6({ data, update }: { data: FormData; update: (d: Partial<FormData>) => void }) {
  const currentAge = calcAge(data.birthYear);
  const yearsToRetire = data.retireAge - currentAge;

  return (
    <div>
      <SectionTitle>은퇴 목표 설정</SectionTitle>

      <div className="mb-4">
        <FieldLabel>목표 은퇴 나이</FieldLabel>
        <NumberInput value={data.retireAge} onChange={v => update({ retireAge: v })} unit="세" min={40} max={80} />
        {yearsToRetire > 0 && (
          <p className="text-xs text-gray-400 mt-1">현재 기준 {yearsToRetire}년 후</p>
        )}
      </div>

      <div className="mb-4">
        <FieldLabel>기대 수명</FieldLabel>
        <NumberInput value={data.lifeExpectancy} onChange={v => update({ lifeExpectancy: v })} unit="세" min={60} max={110} />
      </div>

      <div className="mb-4">
        <FieldLabel>은퇴 후 월 생활비 (현재 가치)</FieldLabel>
        <NumberInput value={data.monthlyRetireExpense} onChange={v => update({ monthlyRetireExpense: v })} unit="만원/월" />
      </div>

      <Divider />

      <div className="mb-4">
        <FieldLabel>투자 성향</FieldLabel>
        <div className="flex gap-2 flex-wrap">
          {(['안정형', '중립형', '적극형'] as const).map(r => (
            <ChipButton key={r} label={r} selected={data.riskTolerance === r} onClick={() => update({ riskTolerance: r })} />
          ))}
        </div>
      </div>

      <InfoBox>
        안정형: 예·적금 중심 / 중립형: 균형 투자 / 적극형: 주식·펀드 중심으로 시뮬레이션이 달라집니다.
      </InfoBox>
    </div>
  );
}

// =============================================================================
// Step 7 — 연락처
// =============================================================================
function Step7({ data, update }: { data: FormData; update: (d: Partial<FormData>) => void }) {
  return (
    <div>
      <SectionTitle>연락처 및 상담 신청</SectionTitle>

      <div className="mb-4">
        <FieldLabel>휴대폰 번호</FieldLabel>
        <input
          className="border border-gray-300 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={data.phone}
          onChange={e => update({ phone: e.target.value })}
          placeholder="010-0000-0000"
          inputMode="tel"
        />
      </div>

      <div className="mb-4">
        <FieldLabel>이메일</FieldLabel>
        <input
          className="border border-gray-300 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={data.email}
          onChange={e => update({ email: e.target.value })}
          placeholder="example@email.com"
          inputMode="email"
        />
      </div>

      <div className="mb-4">
        <FieldLabel>상담 방식</FieldLabel>
        <div className="flex gap-2 flex-wrap">
          {(['방문', '화상', '전화'] as const).map(m => (
            <ChipButton key={m} label={m} selected={data.consultMethod === m} onClick={() => update({ consultMethod: m })} />
          ))}
        </div>
      </div>

      <Divider />

      <div className="flex items-start gap-2 mt-2">
        <input
          type="checkbox"
          id="privacy"
          checked={data.agreePrivacy}
          onChange={e => update({ agreePrivacy: e.target.checked })}
          className="mt-1 accent-blue-600"
        />
        <label htmlFor="privacy" className="text-xs text-gray-600">
          개인정보 수집 및 이용에 동의합니다. 수집된 정보는 재무 진단 목적으로만 사용되며, 상담 완료 후 즉시 파기됩니다.
        </label>
      </div>
    </div>
  );
}

// =============================================================================
// Main DiagnosisPage
// =============================================================================
export default function DiagnosisPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const update = (partial: Partial<FormData>) => setForm(prev => ({ ...prev, ...partial }));

  const validate = (): string => {
    if (step === 1) {
      if (!form.name.trim()) return '성함을 입력해주세요.';
      if (!form.birthYear) return '출생연도를 입력해주세요.';
      if (!form.gender) return '성별을 선택해주세요.';
      if (!form.maritalStatus) return '결혼 여부를 선택해주세요.';
    }
    if (step === 7) {
      if (!form.phone.trim()) return '휴대폰 번호를 입력해주세요.';
      if (!form.consultMethod) return '상담 방식을 선택해주세요.';
      if (!form.agreePrivacy) return '개인정보 수집에 동의해주세요.';
    }
    return '';
  };

  const next = () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setStep(s => Math.min(s + 1, TOTAL_STEPS));
  };

  const prev = () => { setError(''); setStep(s => Math.max(s - 1, 1)); };

  const submit = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setSubmitting(true);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) setSubmitted(true);
      else setError(json.error ?? '제출 중 오류가 발생했습니다.');
    } catch {
      setError('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-blue-700 mb-2">진단 신청 완료!</h2>
          <p className="text-sm text-gray-600 mb-2">AI 분석 후 이메일로 결과를 보내드립니다.</p>
          <p className="text-xs text-gray-400">보통 5~10분 내 발송됩니다.</p>
        </div>
      </div>
    );
  }

  const stepComponents: Record<number, React.ReactElement> = {
    1: <Step1 data={form} update={update} />,
    2: <Step2 data={form} update={update} />,
    3: <Step3 data={form} update={update} />,
    4: <Step4 data={form} update={update} />,
    5: <Step5 data={form} update={update} />,
    6: <Step6 data={form} update={update} />,
    7: <Step7 data={form} update={update} />,
  };

  const stepTitles: Record<number, string> = {
    1: '기본 정보', 2: '자산 현황', 3: '부채 현황',
    4: '수입/지출', 5: '직업 정보', 6: '은퇴 목표', 7: '상담 신청',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-blue-800">재무진단</h1>
          <p className="text-sm text-gray-500 mt-1">AI 기반 은퇴 시뮬레이션</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between mb-2 px-1">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map(s => (
            <div key={s} className="flex items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                s < step ? 'bg-blue-600 text-white' : s === step ? 'bg-blue-700 text-white ring-2 ring-blue-300' : 'bg-gray-200 text-gray-500'
              }`}>
                {s < step ? '✓' : s}
              </div>
              {s < TOTAL_STEPS && (
                <div className={`h-1 w-full mx-1 rounded transition-all ${s < step ? 'bg-blue-400' : 'bg-gray-200'}`} style={{ minWidth: 20 }} />
              )}
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-gray-400 mb-4">
          Step {step} / {TOTAL_STEPS} — {stepTitles[step]}
        </p>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
            >
              {stepComponents[step]}
            </motion.div>
          </AnimatePresence>

          {error && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={prev}
              className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-600 font-semibold hover:bg-gray-50 transition-all"
            >
              이전
            </button>
          )}
          {step < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={next}
              className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all"
            >
              다음
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="flex-1 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-all disabled:opacity-60"
            >
              {submitting ? '제출 중...' : '진단 신청하기'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
