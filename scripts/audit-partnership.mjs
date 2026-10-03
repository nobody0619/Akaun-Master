import assert from 'node:assert/strict';
import {
  PARTNERSHIP_INTEREST_QUESTIONS, PARTNERSHIP_SALARY_QUESTIONS,
  getPartnershipFields, gradePartnershipAnswers, getPartnershipExplanation,
} from '../partnership.ts';
import { PROFIT_ADJUSTMENT_QUESTIONS, getAdjustedProfit, getProfitAdjustmentDirection, gradeProfitAdjustmentAnswers } from '../profit-adjustment.ts';

// Independent answer keys for the 20 fixed teaching questions.
const interestAnswers = [
  [640, 0, 640], [1600, 0, 600], [480, 0, 230],
  [4800, 0, 1200], [2400, 0, 2400], [900, 0, 0],
  [800, 0, 300], [400, 0, 300], [1200, 0, 600], [720, 0, 720],
];
const salaryAnswers = [
  [12000, 3000], [18000, 3000], [12000, 2000], [6000, 1000], [6000, 6000],
  [24000, 6000], [35000, 35000], [18000, 4500], [15000, 0], [9600, 9600],
];

const checkTopic = (questions, answerKey) => {
  assert.equal(questions.length, 10);
  for (const [index, q] of questions.entries()) {
    const fields = getPartnershipFields(q);
    assert.deepEqual(fields.map(field => field.expected), answerKey[index], q.id);
    assert(fields.every(field => Number.isInteger(field.expected) && field.expected >= 0), `${q.id}: all answers must be whole ringgit`);
    const correct = Object.fromEntries(fields.map((field, i) => [field.key, String(answerKey[index][i])]));
    assert(gradePartnershipAnswers(q, correct).isCorrect, `${q.id}: correct answers should pass`);
    assert(gradePartnershipAnswers(q, Object.fromEntries(fields.map(field => [field.key, `${correct[field.key]}.00`]))).isCorrect);
    for (const field of fields) {
      assert.equal(gradePartnershipAnswers(q, { ...correct, [field.key]: '' }).isCorrect, field.expected === 0, 'Empty means zero, not a skipped answer');
      assert(!gradePartnershipAnswers(q, { ...correct, [field.key]: 'NaN' }).isCorrect);
      assert(!gradePartnershipAnswers(q, { ...correct, [field.key]: String(field.expected + 1) }).isCorrect);
      assert(!gradePartnershipAnswers(q, { ...correct, [field.key]: '-1' }).isCorrect);
    }
    assert(getPartnershipExplanation(q).includes('中文说明'));
    if (q.paid === 0) assert.equal(fields.find(field => field.key === 'current').expected, q.annualEntitlement);
  }
};
checkTopic(PARTNERSHIP_INTEREST_QUESTIONS, interestAnswers);
checkTopic(PARTNERSHIP_SALARY_QUESTIONS, salaryAnswers);
assert.equal(PARTNERSHIP_INTEREST_QUESTIONS.filter(q => q.loanStart).length, 3);
assert.equal(PARTNERSHIP_INTEREST_QUESTIONS.filter(q => !q.loanStart).length, 7);
for (const q of PARTNERSHIP_INTEREST_QUESTIONS.filter(q => q.loanStart)) {
  const monthNames = ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];
  const startMonth = monthNames.indexOf(q.loanStart.split(' ')[1]);
  assert.equal(q.months, 12 - startMonth);
  assert(getPartnershipExplanation(q).includes(`× ${q.months}/12`));
}

assert.equal(new Set([...PARTNERSHIP_INTEREST_QUESTIONS, ...PARTNERSHIP_SALARY_QUESTIONS].map(q => q.id)).size, 20);
assert.equal(PARTNERSHIP_SALARY_QUESTIONS.filter(q => q.paid === 0).length, 3);
// Specific student mistakes: interest in appropriation; paid figure as annual
// expense; full entitlement as the current-account net adjustment.
const loan = PARTNERSHIP_INTEREST_QUESTIONS[1];
assert(!gradePartnershipAnswers(loan, { ur: '1600', appropriation: '1600', current: '600' }).isCorrect);
assert(!gradePartnershipAnswers(loan, { ur: '1000', appropriation: '0', current: '600' }).isCorrect);
assert(!gradePartnershipAnswers(loan, { ur: '1600', appropriation: '0', current: '1600' }).isCorrect);
const gaji = PARTNERSHIP_SALARY_QUESTIONS[0];
assert(!gradePartnershipAnswers(gaji, { appropriation: '3000', current: '3000' }).isCorrect);
assert(!gradePartnershipAnswers(gaji, { appropriation: '12000', current: '12000' }).isCorrect);
const profitKeys = [
  { final: 89554, items: [['SUBTRACT', 2400], ['ADD', 480], ['SUBTRACT', 300]] },
  { final: 107272, items: [['ADD', 420], ['ADD', 1000], ['SUBTRACT', 350], ['SUBTRACT', 2400]] },
  { final: 20640, items: [['SUBTRACT', 800], ['ADD', 320], ['SUBTRACT', 480], ['SUBTRACT', 900]] },
  { final: 38150, items: [['SUBTRACT', 600], ['ADD', 250], ['SUBTRACT', 2000], ['ADD', 500]] },
  { final: 32248, items: [['ADD', 500], ['ADD', 488], ['SUBTRACT', 1310], ['SUBTRACT', 230]] },
  { final: 49710, items: [['ADD', 800], ['NONE', 0], ['SUBTRACT', 450], ['SUBTRACT', 640]] },
  { final: 58800, items: [['ADD', 1200], ['SUBTRACT', 1800], ['SUBTRACT', 600]] },
  { final: 46300, items: [['ADD', 750], ['SUBTRACT', 450], ['ADD', 1000]] },
  { final: 70040, items: [['ADD', 240], ['SUBTRACT', 1800], ['NONE', 0], ['SUBTRACT', 400]] },
  { final: 36460, items: [['SUBTRACT', 1200], ['ADD', 300], ['SUBTRACT', 240], ['SUBTRACT', 400]] },
];
assert.equal(PROFIT_ADJUSTMENT_QUESTIONS.length, 10);
for (const [index, q] of PROFIT_ADJUSTMENT_QUESTIONS.entries()) {
  const key = profitKeys[index];
  assert.equal(getAdjustedProfit(q), key.final, q.id);
  assert.deepEqual(q.items.map(item => [getProfitAdjustmentDirection(item), item.amount]), key.items, q.id);
  assert(q.items.every(item => Number.isInteger(item.amount) && item.amount >= 0));
  const answers = Object.fromEntries(q.items.map((item, number) => [item.id, { direction: key.items[number][0], amount: String(key.items[number][1]) }]));
  assert(gradeProfitAdjustmentAnswers(q, answers, String(key.final)).isCorrect);
  assert(!gradeProfitAdjustmentAnswers(q, answers, '').isCorrect);
  assert(!gradeProfitAdjustmentAnswers(q, answers, String(key.final + 1)).isCorrect);
  for (const item of q.items) {
    assert.equal(gradeProfitAdjustmentAnswers(q, { ...answers, [item.id]: { ...answers[item.id], amount: '' } }, String(key.final)).isCorrect, item.amount === 0);
    const wrongDirection = getProfitAdjustmentDirection(item) === 'ADD' ? 'SUBTRACT' : 'ADD';
    assert(!gradeProfitAdjustmentAnswers(q, { ...answers, [item.id]: { ...answers[item.id], direction: wrongDirection } }, String(key.final)).isCorrect);
  }
}
console.log('Perkongsian audit passed: 30 fixed questions; whole-ringgit answers; missing/partly/fully paid cases; account traps; all profit-adjustment signs, amounts and totals; zero/empty input checks.');

