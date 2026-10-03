export type PartnershipTopic = 'INTEREST' | 'SALARY';
export type PartnershipAnswerKey = 'ur' | 'appropriation' | 'current';

export interface PartnershipQuestion {
  id: string;
  topic: PartnershipTopic;
  partnership: string;
  partner: string;
  yearEnd: string;
  paid: number;
  annualEntitlement: number;
  principal?: number;
  rate?: number;
  loanStart?: string;
  months?: number;
  isPenalty?: boolean;
}

export interface PartnershipField {
  key: PartnershipAnswerKey;
  label: string;
  expected: number;
}

const interest = (id: number, partnership: string, partner: string, principal: number, rate: number, paid: number, loanStart?: string, months = 12): PartnershipQuestion => ({
  id: `partnership-interest-${id}`, topic: 'INTEREST', partnership, partner,
  yearEnd: '31 Disember 2024', principal, rate, paid,
  loanStart, months, annualEntitlement: principal * rate / 100 * months / 12,
});

const salary = (id: number, partnership: string, partner: string, annualEntitlement: number, paid: number): PartnershipQuestion => ({
  id: `partnership-salary-${id}`, topic: 'SALARY', partnership, partner,
  yearEnd: '31 Disember 2024', annualEntitlement, paid,
});

// Fixed teaching questions adapted from the supplied examples. Every agreement
// Seven full-year loans and three date-based loans, all with whole-ringgit answers.
export const PARTNERSHIP_INTEREST_QUESTIONS: PartnershipQuestion[] = [
  interest(1, 'NoNi', 'Normala', 8000, 8, 0),
  interest(2, 'Riz Vroom Ventures', 'Hariz', 20000, 8, 1000),
  interest(3, 'MAROZA', 'Ronny', 6000, 8, 250),
  interest(4, 'BSK', 'Basrah', 60000, 8, 3600),
  interest(5, 'Arfa', 'Arif', 30000, 8, 0),
  interest(6, 'Azaria', 'Azhar', 15000, 6, 900),
  interest(7, 'Maju Bersama', 'Nisa', 10000, 8, 500),
  interest(8, 'Cahaya', 'Mukhriz', 20000, 8, 100, '1 Oktober 2024', 3),
  interest(9, 'Sinar', 'Zaki', 40000, 6, 600, '1 Julai 2024', 6),
  interest(10, 'Harmoni', 'Maria', 12000, 8, 0, '1 April 2024', 9),
];

export const PARTNERSHIP_SALARY_QUESTIONS: PartnershipQuestion[] = [
  salary(1, 'NoNi', 'Normala', 12000, 9000),
  salary(2, 'Riz Vroom Ventures', 'Hariz', 18000, 15000),
  salary(3, 'Riz Vroom Ventures', 'Mukhriz', 12000, 10000),
  salary(4, 'MAROZA', 'Zaki', 6000, 5000),
  salary(5, 'Azaria', 'Maria', 6000, 0),
  salary(6, 'BSK', 'Syafiq', 24000, 18000),
  salary(7, 'Arfa', 'Arif', 35000, 0),
  salary(8, 'Azaria', 'Azhar', 18000, 13500),
  salary(9, 'BSK', 'Basrah', 15000, 15000),
  salary(10, 'MAROZA', 'Ronny', 9600, 0),
];

export const getPartnershipFields = (q: PartnershipQuestion): PartnershipField[] => {
  const current: PartnershipField = {
    key: 'current',
    label: `Akaun Semasa ${q.partner} — pelarasan bersih (Kredit)`,
    expected: q.annualEntitlement - q.paid,
  };
  if (q.topic === 'INTEREST') {
    return [
      { key: 'ur', label: 'Akaun Untung Rugi — jumlah belanja faedah', expected: q.annualEntitlement },
      { key: 'appropriation', label: 'Akaun Pengasingan Untung Rugi', expected: 0 },
      current,
    ];
  }
  return [
    { key: 'appropriation', label: 'Akaun Pengasingan Untung Rugi — Gaji Pekongsi', expected: q.annualEntitlement },
    current,
  ];
};

export const gradePartnershipAnswers = (q: PartnershipQuestion, answers: Partial<Record<PartnershipAnswerKey, string>>) => {
  const fields = getPartnershipFields(q).map(field => {
    const raw = answers[field.key]?.trim() ?? '';
    const value = Number(raw || '0');
    return { ...field, submitted: raw, correct: Number.isFinite(value) && value >= 0 && Math.abs(value - field.expected) < 0.005 };
  });
  return { fields, isCorrect: fields.every(field => field.correct) };
};

const money = (value: number) => new Intl.NumberFormat('ms-MY', { maximumFractionDigits: 2 }).format(value);

export const getPartnershipExplanation = (q: PartnershipQuestion): string => {
  const annual = money(q.annualEntitlement);
  const paid = money(q.paid);
  const unpaid = money(q.annualEntitlement - q.paid);
  const settlement = q.paid === q.annualEntitlement
    ? 'Semua amaun telah dibayar; tiada pelarasan belum bayar.'
    : `Amaun belum bayar RM${unpaid} dikreditkan ke Akaun Semasa ${q.partner}.`;
  if (q.topic === 'INTEREST') {
    const period = q.loanStart ? `${q.months}个月` : '全年';
    const calculation = `RM${money(q.principal!)} × ${q.rate}%${q.loanStart ? ` × ${q.months}/12` : ''} = RM${annual}`;
    return `计算与入账
${q.loanStart ? `借款从 ${q.loanStart} 到 ${q.yearEnd}，共 ${q.months} 个月。\n` : ''}1. Faedah bagi tempoh perakaunan = ${calculation}.
2. Akaun Untung Rugi: belanja faedah penuh RM${annual}, termasuk amaun yang telah dibayar dan belum dibayar.
3. Akaun Pengasingan Untung Rugi: RM0. Faedah atas pinjaman pekongsi ialah belanja, bukan pengasingan untung.
4. Akaun Semasa: RM${annual} - RM${paid} = RM${unpaid} (Kredit). ${settlement}

中文说明：
${period}贷款利息 = ${calculation}。${q.paid === 0 ? 'Imbangan Duga 没有列出已付利息，本题应计利息都未付。' : `Imbangan Duga 中的 RM${paid} 是已支付金额，不等于本期费用。`}
Akaun Untung Rugi 要记录本期利息 RM${annual}，包括已付与未付部分。
Akaun Pengasingan Untung Rugi 填 0：合伙人借款利息是 BELANJA，不是利润分配，也不要和 Faedah atas Modal 混淆。
Akaun Semasa 填期末未付的净调整额：RM${annual} - RM${paid} = RM${unpaid}，记在 Kredit。${q.paid === q.annualEntitlement ? '利息已全部支付，所以这里填 0。' : '未付利息转入合伙人的往来账户；不要把已付部分重复记入。'}`;
  }
  return `计算与入账
1. Gaji pekongsi bagi setahun = RM${annual}.
2. Akaun Pengasingan Untung Rugi: gaji penuh RM${annual}; gaji pekongsi ialah pengasingan untung, bukan belanja pekerja.
3. Akaun Semasa: RM${annual} - RM${paid} = RM${unpaid} (Kredit). ${settlement}

中文说明：
全年应得的 Gaji Pekongsi 为 RM${annual}。${q.paid === 0 ? 'Imbangan Duga 没有列出已付薪金，本题全年薪金都未付；Pengasingan 与 Akaun Semasa 都填全年金额。' : `Imbangan Duga 中的 RM${paid} 是已支付的合伙人薪金。`}
Akaun Pengasingan Untung Rugi 要放全年薪金 RM${annual}，不是只放未付差额；合伙人薪金属于利润分配，不是普通员工的工资费用。
Akaun Semasa 的本题答案是未付净调整额：RM${annual} - RM${paid} = RM${unpaid}，记在 Kredit。
完整往来账户中，全年应得薪金记 Kredit，已领取薪金记 Debit，两者相抵得到这项净调整额；它不是 Akaun Semasa 的期末总余额。${q.paid === q.annualEntitlement ? '薪金已全部支付，所以净调整额为 0。' : ''}`;
};

