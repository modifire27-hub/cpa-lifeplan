'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

/* ───────────────── 타입 정의 ───────────────── */
interface ChildInfo { age: number }
interface InsurancePayout { company: string; type: string; amount: number }
interface LoanDetail {
  type: string; balance: number; monthlyPayment: number;
  interestRate: number; remainingMonths: number; repayType: string;
}
interface RealEstateItem {
  type: string; region: string; currentValue: number;
  leaseDeposit: number; isRental: boolean; rentalMonthly: number;
}
interface FormData {
  birthYear: number; birthMonth: number;
  retirementTargetAge: number; lifeExpectancy: number;
  maritalStatus: 'single' | 'married'; children: ChildInfo[];
  bankDeposit: number; termDeposit: number; savingsAccount: number;
  cmaAccount: number; otherSavings: number; leaseDeposit: number;
  stocksEtf: number; funds: number; bonds: number;
  crypto: number; otherInvestments: number;
  realEstateItems: RealEstateItem[];
  pensionType: 'DB' | 'DC' | 'IRP' | 'none';
  pensionBalance: number; pensionMonthlyContrib: number;
  yearsOfService: number; estimatedRetireMonthlySalary: number;
  personalPensionBalance: number; personalPensionMonthly: number;
  nationalPensionExpected: number;
  insurancePayouts: InsurancePayout[];
  loans: LoanDetail[];
  salary: number; businessIncome: number;
  rentalIncome: number; dividendIncome: number; otherIncome: number;
  housingCost: number; foodLife: number; transportation: number;
  communication: number; healthMedical: number; educationChild: number;
  leisureCulture: number; otherExpenses: number; insurancePremium: number;
  hasLossInsurance: boolean; hasLifeInsurance: boolean;
  hasCancerInsurance: boolean; hasAnnuityInsurance: boolean;
  jobType: 'employee' | 'self_employed' | 'corporate' | 'freelancer';
  annualSalary: number; workYears: number;
  businessRevenue: number; businessProfit: number;
  dividendAmount: number; yellowUmbrellaAmount: number;
  retirementGoalExpense: number;
  name: string; phone: string; email: string; privacyAgree: boolean;
}

const initialFormData: FormData = {
  birthYear: 0, birthMonth: 1,
  retirementTargetAge: 65, lifeExpectancy: 90,
  maritalStatus: 'single', children: [],
  bankDeposit: 0, termDeposit: 0, savingsAccount: 0,
  cmaAccount: 0, otherSavings: 0, leaseDeposit: 0,
  stocksEtf: 0, funds: 0, bonds: 0, crypto: 0, otherInvestments: 0,
  realEstateItems: [],
  pensionType: 'none', pensionBalance: 0, pensionMonthlyContrib: 0,
  yearsOfService: 0, estimatedRetireMonthlySalary: 0,
  personalPensionBalance: 0, personalPensionMonthly: 0,
  nationalPensionExpected: 0,
  insurancePayouts: [],
  loans: [],
  salary: 0, businessIncome: 0, rentalIncome: 0,
  dividendIncome: 0, otherIncome: 0,
  housingCost: 0, foodLife: 0, transportation: 0,
  communication: 0, healthMedical: 0, educationChild: 0,
  leisureCulture: 0, otherExpenses: 0, insurancePremium: 0,
  hasLossInsurance: false, hasLifeInsurance: false,
  hasCancerInsurance: false, hasAnnuityInsurance: false,
  jobType: 'employee',
  annualSalary: 0, workYears: 0,
  businessRevenue: 0, businessProfit: 0,
  dividendAmount: 0, yellowUmbrellaAmount: 0,
  retirementGoalExpense: 0,
  name: '', phone: '', email: '', privacyAgree: false,
};

const TOTAL_STEPS = 7;
const hasPension = (j: string) => j === 'employee' || j === 'corporate';

/* ───────────────── 공통 UI 컴포넌트 ───────────────── */
const SectionTitle = ({ title, sub }: { title: string; sub?: string }) => (
  <div className="mb-4">
    <h2 className="text-lg font-bold text-gray-800">{title}</h2>
    {sub && <p className="text-sm text-gray-500 mt-1">{sub}</p>}
  </div>
);

const FieldLabel = ({ label, hint }: { label: string; hint?: string }) => (
  <div className="mb-1">
    <span className="text-sm font-medium text-gray-700">{label}</span>
    {hint && <span className="text-xs text-gray-400 ml-2">{hint}</span>}
  </div>
);

const NumberInput = ({
  value, onChange, placeholder = '0', unit = '만원', min = 0
}: {
  value: number; onChange: (v: number) => void;
  placeholder?: string; unit?: string; min?: number;
}) => (
  <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-white">
    <input
      type="number" min={min}
      value={value === 0 ? '' : value}
      onChange={e => onChange(Number(e.target.value) || 0)}
      placeholder={placeholder}
      className="flex-1 outline-none text-right text-gray-800 text-sm bg-transparent"
    />
    <span className="text-xs text-gray-400 shrink-0">{unit}</span>
  </div>
);

const ChipButton = ({ label, selected, onClick }: {
  label: string; selected: boolean; onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
      selected
        ? 'bg-blue-600 text-white shadow-md'
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`}
  >
    {label}
  </button>
);

const Divider = () => <hr className="my-5 border-gray-100" />;

const SumBar = ({ label, value }: { label: string; value: number }) => (
  <div className="flex justify-between items-center bg-blue-50 rounded-xl px-4 py-3 mt-3">
    <span className="text-sm font-medium text-blue-700">{label}</span>
    <span className="text-base font-bold text-blue-800">
      {value.toLocaleString()} 만원
    </span>
  </div>
);

const Notice = ({ text }: { text: string }) => (
  <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mt-3">
    <p className="text-xs text-amber-700">{text}</p>
  </div>
);

const InfoBox = ({ text }: { text: string }) => (
  <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mt-3">
    <p className="text-xs text-blue-600">{text}</p>
  </div>
);

const RepayTypeSelector = ({
  value, onChange
}: { value: string; onChange: (v: string) => void }) => (
  <div className="flex gap-2 mt-1">
    {['원리금균등', '원금균등', '만기일시'].map(t => (
      <ChipButton key={t} label={t} selected={value === t} onClick={() => onChange(t)} />
    ))}
  </div>
);

/* ───────────────── Step 1: 기본 정보 ───────────────── */
const Step1 = ({ data, onChange }: { data: FormData; onChange: (k: keyof FormData, v: any) => void }) => {
  const currentYear = new Date().getFullYear();
  const age = data.birthYear ? currentYear - data.birthYear : 0;

  return (
    <div>
      <SectionTitle title="기본 정보" sub="재무 진단을 위한 기본 정보를 입력해주세요." />

      <FieldLabel label="태어난 연도" />
      <NumberInput value={data.birthYear} onChange={v => onChange('birthYear', v)}
        placeholder="예: 1985" unit="년" />
      {age > 0 && <p className="text-xs text-blue-500 mt-1 text-right">현재 {age}세</p>}

      <div className="mt-3">
        <FieldLabel label="태어난 월" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
            <ChipButton key={m} label={`${m}월`}
              selected={data.birthMonth === m} onClick={() => onChange('birthMonth', m)} />
          ))}
        </div>
      </div>

      <Divider />

      <FieldLabel label="목표 은퇴 나이" />
      <div className="flex flex-wrap gap-2">
        {[55, 60, 65, 70].map(a => (
          <ChipButton key={a} label={`${a}세`}
            selected={data.retirementTargetAge === a} onClick={() => onChange('retirementTargetAge', a)} />
        ))}
      </div>
      <div className="mt-2">
        <NumberInput value={data.retirementTargetAge}
          onChange={v => onChange('retirementTargetAge', v)} unit="세" />
      </div>

      <div className="mt-3">
        <FieldLabel label="기대 수명" />
        <div className="flex flex-wrap gap-2">
          {[80, 85, 90, 95, 100].map(a => (
            <ChipButton key={a} label={`${a}세`}
              selected={data.lifeExpectancy === a} onClick={() => onChange('lifeExpectancy', a)} />
          ))}
        </div>
      </div>

      <Divider />

      <FieldLabel label="결혼 여부" />
      <div className="flex gap-3">
        <ChipButton label="미혼" selected={data.maritalStatus === 'single'}
          onClick={() => onChange('maritalStatus', 'single')} />
        <ChipButton label="기혼" selected={data.maritalStatus === 'married'}
          onClick={() => onChange('maritalStatus', 'married')} />
      </div>

      {data.maritalStatus === 'married' && (
        <div className="mt-4">
          <FieldLabel label="자녀 수" />
          <div className="flex gap-3">
            {[0, 1, 2, 3].map(n => (
              <ChipButton key={n} label={`${n}명`}
                selected={data.children.length === n}
                onClick={() => {
                  const arr: ChildInfo[] = Array.from({ length: n }, (_, i) =>
                    data.children[i] || { age: 0 });
                  onChange('children', arr);
                }} />
            ))}
          </div>
          {data.children.map((c, i) => (
            <div key={i} className="mt-2">
              <FieldLabel label={`${i + 1}번째 자녀 나이`} />
              <NumberInput value={c.age} unit="세"
                onChange={v => {
                  const arr = [...data.children];
                  arr[i] = { age: v };
                  onChange('children', arr);
                }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ───────────────── Step 2: 자산 현황 ───────────────── */
const Step2 = ({ data, onChange }: { data: FormData; onChange: (k: keyof FormData, v: any) => void }) => {
  const cashTotal = data.bankDeposit + data.termDeposit + data.savingsAccount
    + data.cmaAccount + data.otherSavings;
  const investTotal = data.stocksEtf + data.funds + data.bonds
    + data.crypto + data.otherInvestments;
  const reTotal = data.realEstateItems.reduce((s, r) => s + r.currentValue, 0);
  const leaseFromRE = data.realEstateItems.reduce((s, r) => s + (r.leaseDeposit || 0), 0);
  const pensionTotal = (hasPension(data.jobType) ? data.pensionBalance : 0)
    + data.personalPensionBalance;
  const insurTotal = data.insurancePayouts.reduce((s, p) => s + p.amount, 0);
  const grandTotal = cashTotal + investTotal + reTotal + pensionTotal + insurTotal;

  const addRE = () => onChange('realEstateItems', [...data.realEstateItems, {
    type: '아파트', region: '수도권', currentValue: 0,
    leaseDeposit: 0, isRental: false, rentalMonthly: 0
  }]);
  const updateRE = (i: number, key: keyof RealEstateItem, v: any) => {
    const arr = [...data.realEstateItems];
    arr[i] = { ...arr[i], [key]: v };
    onChange('realEstateItems', arr);
  };
  const removeRE = (i: number) => {
    onChange('realEstateItems', data.realEstateItems.filter((_, idx) => idx !== i));
  };

  const addInsurance = () => onChange('insurancePayouts', [...data.insurancePayouts,
    { company: '', type: '', amount: 0 }]);
  const updateInsurance = (i: number, key: keyof InsurancePayout, v: any) => {
    const arr = [...data.insurancePayouts];
    arr[i] = { ...arr[i], [key]: v };
    onChange('insurancePayouts', arr);
  };
  const removeInsurance = (i: number) => {
    onChange('insurancePayouts', data.insurancePayouts.filter((_, idx) => idx !== i));
  };

  return (
    <div>
      <SectionTitle title="자산 현황" sub="보유하신 자산을 항목별로 입력해주세요." />

      {/* 현금성 자산 */}
      <h3 className="font-semibold text-gray-700 mb-2">💰 현금성 자산</h3>
      {[
        ['일반 예금', 'bankDeposit'],
        ['정기 예금', 'termDeposit'],
        ['적금', 'savingsAccount'],
        ['CMA / MMF', 'cmaAccount'],
        ['기타 저축', 'otherSavings'],
      ].map(([label, key]) => (
        <div key={key} className="mt-2">
          <FieldLabel label={label} />
          <NumberInput value={(data as any)[key]}
            onChange={v => onChange(key as keyof FormData, v)} />
        </div>
      ))}
      <SumBar label="현금성 자산 합계" value={cashTotal} />

      <Divider />

      {/* 투자 자산 */}
      <h3 className="font-semibold text-gray-700 mb-2">📈 투자 자산</h3>
      {[
        ['주식 / ETF', 'stocksEtf'],
        ['펀드', 'funds'],
        ['채권', 'bonds'],
        ['가상화폐', 'crypto'],
        ['기타 투자', 'otherInvestments'],
      ].map(([label, key]) => (
        <div key={key} className="mt-2">
          <FieldLabel label={label} />
          <NumberInput value={(data as any)[key]}
            onChange={v => onChange(key as keyof FormData, v)} />
        </div>
      ))}
      <SumBar label="투자 자산 합계" value={investTotal} />

      <Divider />

      {/* 부동산 */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-gray-700">🏠 부동산</h3>
        <button onClick={addRE}
          className="text-sm text-blue-600 border border-blue-300 rounded-lg px-3 py-1 hover:bg-blue-50">
          + 추가
        </button>
      </div>
      {data.realEstateItems.map((re, i) => (
        <div key={i} className="border border-gray-200 rounded-xl p-3 mb-3 bg-gray-50">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">부동산 {i + 1}</span>
            <button onClick={() => removeRE(i)} className="text-xs text-red-400 hover:text-red-600">삭제</button>
          </div>
          <FieldLabel label="유형" />
          <div className="flex flex-wrap gap-2 mb-2">
            {['아파트', '빌라', '오피스텔', '상가', '토지', '기타'].map(t => (
              <ChipButton key={t} label={t} selected={re.type === t}
                onClick={() => updateRE(i, 'type', t)} />
            ))}
          </div>
          <FieldLabel label="지역" />
          <div className="flex flex-wrap gap-2 mb-2">
            {['수도권', '지방광역시', '기타'].map(r => (
              <ChipButton key={r} label={r} selected={re.region === r}
                onClick={() => updateRE(i, 'region', r)} />
            ))}
          </div>
          <FieldLabel label="현재 시세" />
          <NumberInput value={re.currentValue}
            onChange={v => updateRE(i, 'currentValue', v)} />
          <div className="mt-2">
            <FieldLabel label="임대보증금 (있는 경우)" hint="세입자에게 돌려줄 금액" />
            <NumberInput value={re.leaseDeposit}
              onChange={v => updateRE(i, 'leaseDeposit', v)} />
          </div>
          <div className="mt-2 flex items-center gap-3">
            <FieldLabel label="임대 수익 발생 여부" />
            <ChipButton label={re.isRental ? '있음' : '없음'}
              selected={true} onClick={() => updateRE(i, 'isRental', !re.isRental)} />
          </div>
          {re.isRental && (
            <div className="mt-2">
              <FieldLabel label="월 임대 수익" />
              <NumberInput value={re.rentalMonthly}
                onChange={v => updateRE(i, 'rentalMonthly', v)} />
            </div>
          )}
        </div>
      ))}
      {reTotal > 0 && <SumBar label="부동산 합계" value={reTotal} />}
      {leaseFromRE > 0 && (
        <Notice text={`임대보증금 ${leaseFromRE.toLocaleString()}만원은 부채로 자동 반영됩니다.`} />
      )}

      <Divider />

      {/* 퇴직연금 */}
      {hasPension(data.jobType) && (
        <>
          <h3 className="font-semibold text-gray-700 mb-2">🏦 퇴직연금</h3>
          <FieldLabel label="유형" />
          <div className="flex flex-wrap gap-2 mb-3">
            {(['DB', 'DC', 'IRP', 'none'] as const).map(t => (
              <ChipButton key={t}
                label={t === 'none' ? '해당없음' : t}
                selected={data.pensionType === t}
                onClick={() => onChange('pensionType', t)} />
            ))}
          </div>

          {data.pensionType !== 'none' && (
            <>
              <FieldLabel label="현재 적립금" />
              <NumberInput value={data.pensionBalance}
                onChange={v => onChange('pensionBalance', v)} />

              {/* DB형 전용 */}
              {data.pensionType === 'DB' && (
                <>
                  <div className="mt-2">
                    <FieldLabel label="근속연수" />
                    <NumberInput value={data.yearsOfService}
                      onChange={v => onChange('yearsOfService', v)} unit="년" />
                  </div>
                  <div className="mt-2">
                    <FieldLabel label="퇴직시점 예상 월급여 (선택)"
                      hint="미입력 시 현재 연봉 기준 연 2% 자동 계산" />
                    <NumberInput value={data.estimatedRetireMonthlySalary}
                      onChange={v => onChange('estimatedRetireMonthlySalary', v)}
                      placeholder="예: 600" />
                    <p className="text-xs text-gray-400 mt-1">
                      퇴직 시점 실제 예상 급여를 아신다면 입력해 주세요
                    </p>
                  </div>
                </>
              )}

              {/* IRP형 전용 */}
              {data.pensionType === 'IRP' && (
                <div className="mt-2">
                  <FieldLabel label="월 납입액" />
                  <NumberInput value={data.pensionMonthlyContrib}
                    onChange={v => onChange('pensionMonthlyContrib', v)} />
                </div>
              )}

              {/* DC형: 근속연수 불필요, 월 납입액만 */}
              {data.pensionType === 'DC' && (
                <InfoBox text="DC형은 연봉의 1/12이 자동으로 매년 적립됩니다. 별도 근속연수 입력은 필요하지 않습니다." />
              )}
            </>
          )}
          <Divider />
        </>
      )}

      {/* 개인연금 */}
      <h3 className="font-semibold text-gray-700 mb-2">🌱 개인연금 (연금저축/IRP)</h3>
      <FieldLabel label="현재 적립금" />
      <NumberInput value={data.personalPensionBalance}
        onChange={v => onChange('personalPensionBalance', v)} />
      <div className="mt-2">
        <FieldLabel label="월 납입액" />
        <NumberInput value={data.personalPensionMonthly}
          onChange={v => onChange('personalPensionMonthly', v)} />
      </div>

      <Divider />

      {/* 국민연금 */}
      <h3 className="font-semibold text-gray-700 mb-2">🇰🇷 국민연금</h3>
      <FieldLabel label="예상 월 수령액" hint="국민연금공단 예상액" />
      <NumberInput value={data.nationalPensionExpected}
        onChange={v => onChange('nationalPensionExpected', v)} />

      <Divider />

      {/* 보험 해약환급금 */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-gray-700">🛡 보험 해약환급금</h3>
        <button onClick={addInsurance}
          className="text-sm text-blue-600 border border-blue-300 rounded-lg px-3 py-1 hover:bg-blue-50">
          + 추가
        </button>
      </div>
      {data.insurancePayouts.map((ins, i) => (
        <div key={i} className="border border-gray-200 rounded-xl p-3 mb-3 bg-gray-50">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">보험 {i + 1}</span>
            <button onClick={() => removeInsurance(i)} className="text-xs text-red-400">삭제</button>
          </div>
          <FieldLabel label="보험사" />
          <input value={ins.company} onChange={e => updateInsurance(i, 'company', e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-2" placeholder="예: 삼성생명" />
          <FieldLabel label="종류" />
          <input value={ins.type} onChange={e => updateInsurance(i, 'type', e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-2" placeholder="예: 종신보험" />
          <FieldLabel label="해약환급금" />
          <NumberInput value={ins.amount} onChange={v => updateInsurance(i, 'amount', v)} />
        </div>
      ))}

      <Divider />
      <SumBar label="총 자산 합계" value={grandTotal} />
    </div>
  );
};

/* ───────────────── Step 3: 부채 현황 ───────────────── */
const Step3 = ({ data, onChange }: { data: FormData; onChange: (k: keyof FormData, v: any) => void }) => {
  const leaseFromRE = data.realEstateItems.reduce((s, r) => s + (r.leaseDeposit || 0), 0);
  const loanTotal = data.loans.reduce((s, l) => s + l.balance, 0);
  const totalDebt = loanTotal + leaseFromRE;

  const addLoan = () => onChange('loans', [...data.loans, {
    type: '주택담보대출', balance: 0, monthlyPayment: 0,
    interestRate: 0, remainingMonths: 0, repayType: '원리금균등'
  }]);
  const updateLoan = (i: number, key: keyof LoanDetail, v: any) => {
    const arr = [...data.loans];
    arr[i] = { ...arr[i], [key]: v };
    onChange('loans', arr);
  };
  const removeLoan = (i: number) => onChange('loans', data.loans.filter((_, idx) => idx !== i));

  const calcMonthly = (l: LoanDetail) => {
    if (!l.balance || !l.interestRate || !l.remainingMonths) return 0;
    const r = l.interestRate / 100 / 12;
    const n = l.remainingMonths;
    if (l.repayType === '만기일시') return Math.round(l.balance * r);
    if (l.repayType === '원리금균등') return Math.round(l.balance * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1));
    return Math.round(l.balance / n + l.balance * r);
  };

  return (
    <div>
      <SectionTitle title="부채 현황" sub="대출 정보를 입력하시면 월 상환액을 자동 계산해 드립니다." />

      {leaseFromRE > 0 && (
        <Notice text={`부동산 임대보증금 ${leaseFromRE.toLocaleString()}만원이 부채로 반영되었습니다.`} />
      )}

      <div className="flex justify-between items-center mt-4 mb-2">
        <h3 className="font-semibold text-gray-700">대출 목록</h3>
        <button onClick={addLoan}
          className="text-sm text-blue-600 border border-blue-300 rounded-lg px-3 py-1 hover:bg-blue-50">
          + 대출 추가
        </button>
      </div>

      {data.loans.map((loan, i) => {
        const monthly = calcMonthly(loan);
        return (
          <div key={i} className="border border-gray-200 rounded-xl p-3 mb-3 bg-gray-50">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">대출 {i + 1}</span>
              <button onClick={() => removeLoan(i)} className="text-xs text-red-400">삭제</button>
            </div>
            <FieldLabel label="대출 유형" />
            <div className="flex flex-wrap gap-2 mb-2">
              {['주택담보대출', '전세자금대출', '신용대출', '사업자대출', '기타'].map(t => (
                <ChipButton key={t} label={t} selected={loan.type === t}
                  onClick={() => updateLoan(i, 'type', t)} />
              ))}
            </div>
            <FieldLabel label="대출 잔액" />
            <NumberInput value={loan.balance} onChange={v => updateLoan(i, 'balance', v)} />
            <div className="mt-2">
              <FieldLabel label="연 이자율" />
              <NumberInput value={loan.interestRate}
                onChange={v => updateLoan(i, 'interestRate', v)} unit="%" />
            </div>
            <div className="mt-2">
              <FieldLabel label="잔여 개월 수" />
              <NumberInput value={loan.remainingMonths}
                onChange={v => updateLoan(i, 'remainingMonths', v)} unit="개월" />
            </div>
            <div className="mt-2">
              <FieldLabel label="상환 방식" />
              <RepayTypeSelector value={loan.repayType}
                onChange={v => updateLoan(i, 'repayType', v)} />
            </div>
            {monthly > 0 && (
              <div className="mt-3 bg-white rounded-lg px-3 py-2 border border-blue-100">
                <span className="text-xs text-blue-500">월 상환액 (자동계산)</span>
                <p className="text-base font-bold text-blue-700">{monthly.toLocaleString()} 만원</p>
              </div>
            )}
          </div>
        );
      })}

      <SumBar label="총 부채 합계" value={totalDebt} />
    </div>
  );
};

/* ───────────────── Step 4: 수입/지출 ───────────────── */
const Step4 = ({ data, onChange }: { data: FormData; onChange: (k: keyof FormData, v: any) => void }) => {
  const rentalIncome = data.realEstateItems.reduce((s, r) => s + (r.isRental ? r.rentalMonthly : 0), 0);
  const monthlyIncome = Math.round(data.salary / 12) + data.businessIncome
    + rentalIncome + data.dividendIncome + data.otherIncome;
  const monthlyExpense = data.housingCost + data.foodLife + data.transportation
    + data.communication + data.healthMedical + data.educationChild
    + data.leisureCulture + data.otherExpenses + data.insurancePremium;
  const loanMonthly = data.loans.reduce((s, l) => s + (l.monthlyPayment || 0), 0);
  const netCashFlow = monthlyIncome - monthlyExpense - loanMonthly;
  const surplusReinvested = netCashFlow > 0
    ? Math.round(netCashFlow * Math.pow(1 + 0.03 / 12, 120))
    : 0;

  return (
    <div>
      <SectionTitle title="수입 / 지출" sub="월 기준으로 입력해주세요." />

      <h3 className="font-semibold text-gray-700 mb-2">💵 월 수입</h3>
      <FieldLabel label="근로소득 (연봉)" hint="연봉 입력 → 자동으로 ÷12" />
      <NumberInput value={data.salary} onChange={v => onChange('salary', v)} unit="만원/년" />
      <div className="mt-2">
        <FieldLabel label="사업소득 (월)" />
        <NumberInput value={data.businessIncome} onChange={v => onChange('businessIncome', v)} />
      </div>
      <div className="mt-2">
        <FieldLabel label="임대소득 (월)" hint="부동산 임대 입력 기준 자동 반영" />
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-right text-gray-600 text-sm">
          {rentalIncome.toLocaleString()} 만원
        </div>
      </div>
      <div className="mt-2">
        <FieldLabel label="배당소득 (월)" />
        <NumberInput value={data.dividendIncome} onChange={v => onChange('dividendIncome', v)} />
      </div>
      <div className="mt-2">
        <FieldLabel label="기타 소득 (월)" />
        <NumberInput value={data.otherIncome} onChange={v => onChange('otherIncome', v)} />
      </div>
      <SumBar label="월 총 수입" value={monthlyIncome} />

      <Divider />

      <h3 className="font-semibold text-gray-700 mb-2">💸 월 지출</h3>
      {[
        ['주거비 (월세/관리비)', 'housingCost'],
        ['식비/생활비', 'foodLife'],
        ['교통비', 'transportation'],
        ['통신비', 'communication'],
        ['의료/건강', 'healthMedical'],
        ['교육/자녀', 'educationChild'],
        ['여가/문화', 'leisureCulture'],
        ['기타 지출', 'otherExpenses'],
        ['보험료', 'insurancePremium'],
      ].map(([label, key]) => (
        <div key={key} className="mt-2">
          <FieldLabel label={label} />
          <NumberInput value={(data as any)[key]}
            onChange={v => onChange(key as keyof FormData, v)} />
        </div>
      ))}
      <SumBar label="월 총 지출" value={monthlyExpense} />

      <Divider />

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <p className="text-sm text-gray-500 mb-1">월 순현금흐름</p>
        <p className={`text-xl font-bold ${netCashFlow >= 0 ? 'text-blue-600' : 'text-red-500'}`}>
          {netCashFlow >= 0 ? '+' : ''}{netCashFlow.toLocaleString()} 만원
        </p>
        {netCashFlow > 0 && (
          <p className="text-xs text-gray-400 mt-1">
            잉여자금 10년 재투자(연 3%) 가정 시 → 약 {surplusReinvested.toLocaleString()} 만원
          </p>
        )}
      </div>

      <Divider />

      <h3 className="font-semibold text-gray-700 mb-2">🛡 보험 가입 현황</h3>
      {[
        ['실손보험', 'hasLossInsurance'],
        ['종신/정기보험', 'hasLifeInsurance'],
        ['암보험', 'hasCancerInsurance'],
        ['연금보험', 'hasAnnuityInsurance'],
      ].map(([label, key]) => (
        <div key={key} className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="text-sm text-gray-700">{label}</span>
          <div className="flex gap-2">
            <ChipButton label="가입" selected={(data as any)[key] === true}
              onClick={() => onChange(key as keyof FormData, true)} />
            <ChipButton label="미가입" selected={(data as any)[key] === false}
              onClick={() => onChange(key as keyof FormData, false)} />
          </div>
        </div>
      ))}
      <InfoBox text="보험은 보장 공백이 없는지 확인이 중요합니다. 진단 후 맞춤 제안을 드립니다." />
    </div>
  );
};

/* ───────────────── Step 5: 직업 정보 ───────────────── */
const Step5 = ({ data, onChange }: { data: FormData; onChange: (k: keyof FormData, v: any) => void }) => {
  return (
    <div>
      <SectionTitle title="직업 정보" sub="직업 유형에 맞게 입력하시면 더 정확한 절세 전략을 제안드립니다." />

      <FieldLabel label="직업 유형" />
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { value: 'employee', label: '직장인' },
          { value: 'self_employed', label: '개인사업자' },
          { value: 'corporate', label: '법인대표' },
          { value: 'freelancer', label: '프리랜서' },
        ].map(({ value, label }) => (
          <ChipButton key={value} label={label}
            selected={data.jobType === value as any}
            onClick={() => onChange('jobType', value)} />
        ))}
      </div>

      {/* 직장인 */}
      {data.jobType === 'employee' && (
        <>
          <InfoBox text="직장인은 연말정산을 통해 IRP·연금저축 세액공제(최대 900만원)를 활용할 수 있습니다." />
          <div className="mt-3">
            <FieldLabel label="연봉 (세전)" />
            <NumberInput value={data.annualSalary}
              onChange={v => onChange('annualSalary', v)} unit="만원/년" />
          </div>
        </>
      )}

      {/* 개인사업자 */}
      {data.jobType === 'self_employed' && (
        <>
          <InfoBox text="개인사업자는 노란우산공제로 최대 500만원 소득공제가 가능하고, 국민연금 임의가입도 활용 가능합니다." />
          <div className="mt-3">
            <FieldLabel label="연 매출" />
            <NumberInput value={data.businessRevenue}
              onChange={v => onChange('businessRevenue', v)} unit="만원/년" />
          </div>
          <div className="mt-2">
            <FieldLabel label="연 순이익" />
            <NumberInput value={data.businessProfit}
              onChange={v => onChange('businessProfit', v)} unit="만원/년" />
          </div>
          <div className="mt-2">
            <FieldLabel label="노란우산공제 납입액" hint="연간 납입액" />
            <NumberInput value={data.yellowUmbrellaAmount}
              onChange={v => onChange('yellowUmbrellaAmount', v)} unit="만원/년" />
          </div>
        </>
      )}

      {/* 법인대표 */}
      {data.jobType === 'corporate' && (
        <>
          <InfoBox text="법인대표는 임원퇴직금 규정 설정, 법인 명의 보험, 가지급금 정리 등 다양한 절세 전략이 있습니다." />
          <div className="mt-3">
            <FieldLabel label="연봉 (세전)" />
            <NumberInput value={data.annualSalary}
              onChange={v => onChange('annualSalary', v)} unit="만원/년" />
          </div>
          <div className="mt-2">
            <FieldLabel label="배당 수령액" hint="연간" />
            <NumberInput value={data.dividendAmount}
              onChange={v => onChange('dividendAmount', v)} unit="만원/년" />
          </div>
        </>
      )}

      {/* 프리랜서 */}
      {data.jobType === 'freelancer' && (
        <>
          <InfoBox text="프리랜서는 종합소득세 신고를 통해 각종 필요경비를 공제받을 수 있으며, IRP 납입으로 세액공제도 가능합니다." />
          <div className="mt-3">
            <FieldLabel label="연 소득" hint="3.3% 원천징수 전 금액" />
            <NumberInput value={data.businessProfit}
              onChange={v => onChange('businessProfit', v)} unit="만원/년" />
          </div>
        </>
      )}
    </div>
  );
};

/* ───────────────── Step 6: 은퇴 목표 ───────────────── */
const Step6 = ({ data, onChange }: { data: FormData; onChange: (k: keyof FormData, v: any) => void }) => {
  const currentYear = new Date().getFullYear();
  const age = data.birthYear ? currentYear - data.birthYear : 0;
  const yearsToRetire = data.retirementTargetAge - age;
  const inflationAdjusted = data.retirementGoalExpense > 0
    ? Math.round(data.retirementGoalExpense * Math.pow(1.025, yearsToRetire))
    : 0;

  return (
    <div>
      <SectionTitle title="은퇴 목표" sub="원하시는 은퇴 후 생활 수준을 알려주세요." />

      <div className="bg-blue-50 rounded-xl p-4 mb-4">
        <p className="text-sm text-gray-600">현재 나이: <strong>{age}세</strong></p>
        <p className="text-sm text-gray-600">목표 은퇴: <strong>{data.retirementTargetAge}세</strong></p>
        <p className="text-sm text-gray-600">남은 기간: <strong>{yearsToRetire > 0 ? `${yearsToRetire}년` : '이미 은퇴 시점'}</strong></p>
        <p className="text-sm text-gray-600">은퇴 후 기간: <strong>{data.lifeExpectancy - data.retirementTargetAge}년</strong></p>
      </div>

      <FieldLabel label="은퇴 후 월 생활비 목표" hint="현재 물가 기준" />
      <NumberInput value={data.retirementGoalExpense}
        onChange={v => onChange('retirementGoalExpense', v)} />

      {inflationAdjusted > 0 && (
        <InfoBox text={`물가상승률 2.5% 반영 시 은퇴 시점 필요 생활비: 약 ${inflationAdjusted.toLocaleString()}만원/월`} />
      )}
    </div>
  );
};

/* ───────────────── Step 7: 연락처 + CPA 광고 ───────────────── */
const Step7 = ({ data, onChange }: { data: FormData; onChange: (k: keyof FormData, v: any) => void }) => (
  <div>
    <SectionTitle title="연락처" sub="진단 결과를 받으실 정보를 입력해주세요." />

    <FieldLabel label="이름" />
    <input value={data.name}
      onChange={e => onChange('name', e.target.value)}
      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-3"
      placeholder="홍길동" />

    <FieldLabel label="휴대폰 번호" />
    <input value={data.phone}
      onChange={e => onChange('phone', e.target.value.replace(/\D/g, ''))}
      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-3"
      placeholder="01012345678" maxLength={11} inputMode="tel" />

    <FieldLabel label="이메일" />
    <input value={data.email}
      onChange={e => onChange('email', e.target.value)}
      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-3"
      placeholder="example@email.com" type="email" />

    <Divider />

    {/* ✅ CPA 광고 – 전 직업군 표시, 제출 직전 위치 */}
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-4">
      <p className="text-sm font-bold text-blue-800 mb-1">📊 세금 & 절세 전략이 궁금하신가요?</p>
      <p className="text-xs text-blue-600 mb-2">
        공인회계사 이흥준 세무사가 직접 절세 플랜을 도와드립니다.<br />
        근로소득 · 사업소득 · 법인 절세 · 퇴직금 설계 모두 상담 가능합니다.
      </p>
      <a href="tel:01024981905"
        className="inline-block bg-blue-600 text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition">
        📞 010-2498-1905 무료 상담
      </a>
    </div>

    <div className="flex items-start gap-2">
      <input type="checkbox" id="privacy" checked={data.privacyAgree}
        onChange={e => onChange('privacyAgree', e.target.checked)}
        className="mt-1 w-4 h-4 accent-blue-600" />
      <label htmlFor="privacy" className="text-xs text-gray-500">
        개인정보 수집 및 이용에 동의합니다.<br />
        <span className="text-gray-400">(수집항목: 이름, 연락처, 재무정보 / 목적: 재무진단 서비스 제공 / 보유기간: 1년)</span>
      </label>
    </div>
  </div>
);

/* ───────────────── 메인 컴포넌트 ───────────────── */
export default function DiagnosisPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const onChange = (key: keyof FormData, value: any) =>
    setData(prev => ({ ...prev, [key]: value }));

  const canProceed = (): boolean => {
    if (step === 1) return data.birthYear >= 1940 && data.birthYear <= 2005;
    if (step === 7) return !!(data.name && data.phone.length >= 10 && data.email && data.privacyAgree);
    return true;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'save_only', formData: data }),
      });
      if (!res.ok) throw new Error('서버 오류가 발생했습니다.');
      setIsDone(true);
    } catch (e: any) {
      setSubmitError(e.message || '제출 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isDone) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white px-6">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">접수 완료!</h1>
        <p className="text-gray-500 text-center mb-6">
          재무 진단 결과를 이메일로 보내드립니다.<br />
          보통 1~2 영업일 내에 발송됩니다.
        </p>
        <button onClick={() => router.push('/')}
          className="bg-blue-600 text-white px-8 py-3 rounded-full font-medium hover:bg-blue-700 transition">
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  const steps = [Step1, Step2, Step3, Step4, Step5, Step6, Step7];
  const StepComponent = steps[step - 1];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* 진행 바 */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500">Step {step} / {TOTAL_STEPS}</span>
          <span className="text-xs text-blue-500 font-medium">
            {['기본 정보', '자산 현황', '부채 현황', '수입/지출', '직업 정보', '은퇴 목표', '연락처'][step - 1]}
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div
            className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="max-w-lg mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            <StepComponent data={data} onChange={onChange} />
          </motion.div>
        </AnimatePresence>

        {submitError && (
          <div className="mt-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-xs text-red-600">{submitError}</p>
          </div>
        )}

        {/* 네비게이션 버튼 */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <button onClick={() => setStep(s => s - 1)}
              className="flex-1 py-3 border border-gray-200 rounded-2xl text-gray-600 font-medium hover:bg-gray-50 transition">
              이전
            </button>
          )}
          {step < TOTAL_STEPS ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
              className={`flex-1 py-3 rounded-2xl font-medium transition ${
                canProceed()
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              다음
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className={`flex-1 py-3 rounded-2xl font-medium transition ${
                canProceed() && !isSubmitting
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? '제출 중...' : '진단 신청하기'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
