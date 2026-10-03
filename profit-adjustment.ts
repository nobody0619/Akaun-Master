export type ProfitDirection = 'ADD' | 'SUBTRACT' | 'NONE';
type ProfitEffect = 'OMITTED_EXPENSE' | 'PREPAID_EXPENSE' | 'OMITTED_REVENUE' | 'UNEARNED_REVENUE' | 'APPROPRIATION';

export interface ProfitAdjustmentItem {
  id: string;
  label: string;
  information: string;
  effect: ProfitEffect;
  amount: number;
  calculation?: string;
}

export interface ProfitAdjustmentQuestion {
  id: string;
  partnership: string;
  initialProfit: number;
  items: ProfitAdjustmentItem[];
  isPenalty?: boolean;
}

export interface ProfitAdjustmentAnswer {
  direction?: ProfitDirection;
  amount?: string;
}

const entry = (id: string, label: string, information: string, effect: ProfitEffect, amount: number, calculation?: string): ProfitAdjustmentItem => ({ id, label, information, effect, amount, calculation });
const question = (id: number, partnership: string, initialProfit: number, items: ProfitAdjustmentItem[]): ProfitAdjustmentQuestion => ({ id: `profit-adjustment-${id}`, partnership, initialProfit, items });

// Every item explicitly states what has already been included in net profit.
// This distinguishes an omitted full-year expense from an unpaid adjustment.
export const PROFIT_ADJUSTMENT_QUESTIONS: ProfitAdjustmentQuestion[] = [
  question(1, 'BSK', 91774, [
    entry('loan', 'Faedah atas Pinjaman Pekongsi', 'Pinjaman pekongsi RM30,000 telah wujud sepanjang tahun pada kadar 8% setahun. Tiada faedah telah diambil kira dalam untung bersih.', 'OMITTED_EXPENSE', 2400, 'RM30,000 × 8% = RM2,400'),
    entry('insurance', 'Insurans Prabayar', 'Insurans yang telah ditolak sebagai belanja termasuk RM480 bagi tahun berikutnya.', 'PREPAID_EXPENSE', 480),
    entry('utilities', 'Utiliti Belum Bayar', 'Utiliti RM300 bagi tahun semasa masih belum dibayar dan belum diambil kira sebagai belanja.', 'OMITTED_EXPENSE', 300),
  ]),
  question(2, 'Arfa', 108602, [
    entry('insurance', 'Insurans Prabayar', 'Insurans yang telah direkodkan sebagai belanja termasuk insurans prabayar RM420.', 'PREPAID_EXPENSE', 420),
    entry('commission', 'Komisen Diterima Tertinggal', 'Komisen diterima RM1,000 belum dimasukkan dalam pengiraan untung bersih.', 'OMITTED_REVENUE', 1000),
    entry('bank-loan', 'Faedah Pinjaman Bank Belum Bayar', 'Faedah pinjaman bank RM350 bagi tahun semasa masih belum dibayar dan belum direkodkan sebagai belanja.', 'OMITTED_EXPENSE', 350),
    entry('partner-loan', 'Faedah atas Pinjaman Pekongsi', 'Faedah pinjaman pekongsi bagi setahun ialah RM2,400. Tiada faedah ini telah diambil kira dalam untung bersih.', 'OMITTED_EXPENSE', 2400),
  ]),
  question(3, 'Azaria', 22500, [
    entry('bad-debt', 'Hutang Lapuk', 'Hutang pelanggan RM800 perlu dihapus kira. Belanja hutang lapuk ini belum direkodkan.', 'OMITTED_EXPENSE', 800),
    entry('utilities', 'Utiliti Prabayar', 'Utiliti yang telah ditolak sebagai belanja termasuk utiliti prabayar RM320.', 'PREPAID_EXPENSE', 320),
    entry('partner-loan', 'Faedah atas Pinjaman Pekongsi', 'Pinjaman pekongsi RM6,000 telah wujud sepanjang tahun pada kadar 8%. Tiada faedah telah direkodkan sebagai belanja.', 'OMITTED_EXPENSE', 480, 'RM6,000 × 8% = RM480'),
    entry('bank-loan', 'Faedah Pinjaman Bank Belum Bayar', 'Faedah pinjaman bank RM900 bagi tahun semasa belum dibayar dan belum diambil kira.', 'OMITTED_EXPENSE', 900),
  ]),
  question(4, 'Riz Vroom Ventures', 40000, [
    entry('loan', 'Faedah atas Pinjaman Pekongsi', 'Pinjaman Hariz RM20,000 telah wujud sepanjang tahun pada kadar 8%. Faedah dibayar RM1,000 telah ditolak dalam untung bersih. Baki faedah belum diambil kira.', 'OMITTED_EXPENSE', 600, '(RM20,000 × 8%) - RM1,000 = RM600'),
    entry('insurance', 'Insurans Prabayar', 'Belanja insurans yang telah direkodkan termasuk RM250 bagi tahun berikutnya.', 'PREPAID_EXPENSE', 250),
    entry('rent', 'Sewa Belum Terperoleh', 'Sewa diterima yang telah dimasukkan sebagai hasil termasuk RM2,000 bagi tempoh tahun berikutnya.', 'UNEARNED_REVENUE', 2000),
    entry('commission', 'Komisen Belum Terima', 'Komisen RM500 telah diperoleh bagi tahun semasa tetapi belum diterima dan belum dimasukkan sebagai hasil.', 'OMITTED_REVENUE', 500),
  ]),
  question(5, 'MAROZA', 32800, [
    entry('commission', 'Komisen Belum Terima', 'Komisen RM500 bagi tahun semasa belum diterima dan belum direkodkan sebagai hasil.', 'OMITTED_REVENUE', 500),
    entry('promotion', 'Promosi Prabayar', 'Belanja promosi RM2,440 yang telah ditolak termasuk satu perlima bagi tahun berikutnya.', 'PREPAID_EXPENSE', 488, 'RM2,440 ÷ 5 = RM488'),
    entry('depreciation', 'Susut Nilai Perabot', 'Susut nilai perabot bagi tahun semasa RM1,310 belum diambil kira sebagai belanja.', 'OMITTED_EXPENSE', 1310),
    entry('loan', 'Faedah atas Pinjaman Pekongsi', 'Faedah pinjaman Ronny bagi setahun ialah RM480. Faedah dibayar RM250 telah ditolak dalam untung bersih; baki faedah belum diambil kira.', 'OMITTED_EXPENSE', 230, 'RM480 - RM250 = RM230'),
  ]),
  question(6, 'NoNi', 50000, [
    entry('insurance', 'Insurans Prabayar', 'Belanja insurans yang telah direkodkan termasuk insurans prabayar RM800.', 'PREPAID_EXPENSE', 800),
    entry('salary', 'Gaji Pekongsi', 'Gaji tahunan Normala RM12,000 belum direkodkan. Gaji ini ialah peruntukan di bawah ikatan perjanjian perkongsian.', 'APPROPRIATION', 0),
    entry('utilities', 'Utiliti Belum Bayar', 'Utiliti RM450 bagi tahun semasa belum dibayar dan belum direkodkan sebagai belanja.', 'OMITTED_EXPENSE', 450),
    entry('loan', 'Faedah atas Pinjaman Pekongsi', 'Faedah pinjaman Normala bagi setahun RM640 belum direkodkan dalam pengiraan untung bersih.', 'OMITTED_EXPENSE', 640),
  ]),
  question(7, 'Sinar', 60000, [
    entry('rent', 'Sewa Prabayar', 'Sewa yang telah ditolak sebagai belanja termasuk RM1,200 bagi tahun berikutnya.', 'PREPAID_EXPENSE', 1200),
    entry('wages', 'Gaji Pekerja Belum Bayar', 'Gaji pekerja RM1,800 bagi tahun semasa belum dibayar dan belum direkodkan sebagai belanja.', 'OMITTED_EXPENSE', 1800),
    entry('rent-income', 'Sewa Belum Terperoleh', 'Hasil sewa yang telah direkodkan termasuk RM600 yang belum terperoleh.', 'UNEARNED_REVENUE', 600),
  ]),
  question(8, 'Harmoni', 45000, [
    entry('commission', 'Komisen Belum Terima', 'Komisen RM750 telah diperoleh bagi tahun semasa tetapi belum diterima dan belum dimasukkan sebagai hasil.', 'OMITTED_REVENUE', 750),
    entry('insurance', 'Insurans Belum Bayar', 'Insurans RM450 bagi tahun semasa belum dibayar dan belum direkodkan sebagai belanja.', 'OMITTED_EXPENSE', 450),
    entry('rent', 'Sewa Diterima Tertinggal', 'Sewa diterima RM1,000 bagi tahun semasa tertinggal daripada pengiraan hasil.', 'OMITTED_REVENUE', 1000),
  ]),
  question(9, 'Cahaya', 72000, [
    entry('utilities', 'Utiliti Prabayar', 'Belanja utiliti yang telah ditolak termasuk utiliti prabayar RM240.', 'PREPAID_EXPENSE', 240),
    entry('depreciation', 'Susut Nilai', 'Susut nilai aset RM1,800 bagi tahun semasa belum direkodkan sebagai belanja.', 'OMITTED_EXPENSE', 1800),
    entry('capital-interest', 'Faedah atas Modal', 'Faedah atas modal pekongsi RM2,000 yang diperuntukkan dalam ikatan perkongsian belum direkodkan.', 'APPROPRIATION', 0),
    entry('loan', 'Faedah atas Pinjaman Pekongsi', 'Pinjaman pekongsi RM25,000 telah wujud sepanjang tahun pada kadar 6%. Faedah dibayar RM1,100 telah ditolak dalam untung bersih; baki belum diambil kira.', 'OMITTED_EXPENSE', 400, '(RM25,000 × 6%) - RM1,100 = RM400'),
  ]),
  question(10, 'Maju Bersama', 38000, [
    entry('rent', 'Sewa Belum Terperoleh', 'Sewa diterima RM4,800 yang telah direkodkan sebagai hasil adalah untuk 16 bulan, termasuk 4 bulan tahun berikutnya.', 'UNEARNED_REVENUE', 1200, 'RM4,800 ÷ 16 × 4 = RM1,200'),
    entry('insurance', 'Insurans Prabayar', 'Insurans RM1,200 telah ditolak sebagai belanja untuk tempoh 12 bulan, termasuk 3 bulan tahun berikutnya.', 'PREPAID_EXPENSE', 300, 'RM1,200 ÷ 12 × 3 = RM300'),
    entry('loan', 'Faedah atas Pinjaman Pekongsi', 'Pinjaman pekongsi RM12,000 telah wujud sepanjang tahun pada kadar 8%. Faedah dibayar RM720 telah ditolak dalam untung bersih; baki belum diambil kira.', 'OMITTED_EXPENSE', 240, '(RM12,000 × 8%) - RM720 = RM240'),
    entry('bad-debt', 'Hutang Lapuk', 'Hutang lapuk RM400 belum diambil kira sebagai belanja.', 'OMITTED_EXPENSE', 400),
  ]),
];

const rules: Record<ProfitEffect, { direction: ProfitDirection; malay: string; chinese: string }> = {
  OMITTED_EXPENSE: { direction: 'SUBTRACT', malay: 'Belanja bertambah → untung bersih berkurang.', chinese: '本期费用尚未计入，需要补记：BELANJA 增加 → 净利润减少，所以放 Tolak（−）。' },
  PREPAID_EXPENSE: { direction: 'ADD', malay: 'Belanja berkurang → untung bersih bertambah.', chinese: '预付部分属于下期，已作为本期费用扣除，需要加回：BELANJA 减少 → 净利润增加，所以放 Tambah（+）。' },
  OMITTED_REVENUE: { direction: 'ADD', malay: 'Hasil bertambah → untung bersih bertambah.', chinese: '本期收入尚未计入，需要补记：HASIL 增加 → 净利润增加，所以放 Tambah（+）。' },
  UNEARNED_REVENUE: { direction: 'SUBTRACT', malay: 'Hasil berkurang → untung bersih berkurang.', chinese: '未赚取部分不属于本期收入，应从已计入的收入中扣除：HASIL 减少 → 净利润减少，所以放 Tolak（−）。' },
  APPROPRIATION: { direction: 'NONE', malay: 'Pengasingan untung; bukan pelarasan untung bersih.', chinese: 'Gaji Pekongsi 和 Faedah atas Modal 属于利润分配，列在 Akaun Pengasingan Untung Rugi；本题它们未被误计入净利润，因此净利润无需调整，选 Tiada Pelarasan 并填 0。不要和 Faedah atas Pinjaman 混淆。' },
};

export const getProfitAdjustmentDirection = (item: ProfitAdjustmentItem) => rules[item.effect].direction;
export const getAdjustedProfit = (q: ProfitAdjustmentQuestion) => q.items.reduce((profit, item) => profit + (rules[item.effect].direction === 'ADD' ? item.amount : rules[item.effect].direction === 'SUBTRACT' ? -item.amount : 0), q.initialProfit);

export const gradeProfitAdjustmentAnswers = (q: ProfitAdjustmentQuestion, answers: Record<string, ProfitAdjustmentAnswer>) => {
  const fields = q.items.map(item => {
    const answer = answers[item.id] ?? {};
    const amount = answer.amount?.trim() ?? '';
    const value = Number(amount || '0');
    return { ...item, direction: rules[item.effect].direction, correct: answer.direction === rules[item.effect].direction && Number.isFinite(value) && value >= 0 && Math.abs(value - item.amount) < 0.005 };
  });
  const expectedProfit = getAdjustedProfit(q);
  return { fields, expectedProfit, isCorrect: fields.every(field => field.correct) };
};

export const getProfitAdjustmentReason = (item: ProfitAdjustmentItem) => rules[item.effect];

