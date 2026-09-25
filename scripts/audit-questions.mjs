import {
  ACCRUALS_L1_QUESTIONS,
  ACCRUALS_L2_QUESTIONS,
  generateBadDebtQuestion,
  generateDisposalQuestion,
  generateLoanQuestion,
  generatePhrQuestion,
  generateSnQuestion,
  generateTpmQuestion,
} from '../constants.ts';

const SAMPLE_SIZE = 5_000;
const failures = [];
const stats = {
  phrDecimals: 0,
  loanDecimals: 0,
  snDecimals: 0,
  disposalDecimals: 0,
  tpmDecimals: 0,
};

let seed = 0x5eed1234;
Math.random = () => {
  seed = (1664525 * seed + 1013904223) >>> 0;
  return seed / 0x100000000;
};

const close = (a, b, tolerance = 0.001) => Math.abs(a - b) <= tolerance;
const hasDecimal = (value) => Number.isFinite(value) && !Number.isInteger(value);
const assert = (condition, area, detail) => {
  if (!condition && failures.length < 50) failures.push(area + ': ' + detail);
};

for (const q of [...ACCRUALS_L1_QUESTIONS, ...ACCRUALS_L2_QUESTIONS]) {
  const shouldAdd = q.type === 'ACCRUED_EXP' || q.type === 'ACCRUED_REV';
  const expectedFinal = q.trialBalanceAmount + (shouldAdd ? q.correctPkkAmount : -q.correctPkkAmount);
  assert(q.correctPkkAmount >= 0, 'Pelarasan', q.id + ' has a negative adjustment');
  assert(close(q.correctFinalAmount, expectedFinal), 'Pelarasan', q.id + ' final amount does not match its adjustment');
}

for (let index = 0; index < SAMPLE_SIZE; index += 1) {
  const phr = generatePhrQuestion();
  const expectedPhr = phr.abt * phr.rate / 100;
  const expectedAdjustment = phr.correctNewPhr - phr.oldPhr;
  stats.phrDecimals += [phr.correctNewPhr, phr.oldPhr, phr.correctAdjustmentAmount].filter(hasDecimal).length;
  assert(close(phr.correctNewPhr, expectedPhr), 'PHR', `sample ${index} new PHR mismatch`);
  assert(close(phr.correctAdjustmentAmount, Math.abs(expectedAdjustment)), 'PHR', `sample ${index} adjustment mismatch`);
  assert(phr.correctCategory === (expectedAdjustment > 0 ? 'BELANJA' : 'HASIL'), 'PHR', `sample ${index} category mismatch`);

  const sn = generateSnQuestion();
  const expectedSn = sn.methodType === 'STRAIGHT_LINE'
    ? sn.cost * sn.rate / 100
    : (sn.cost - sn.oldAccDep) * sn.rate / 100;
  stats.snDecimals += [sn.correctSnExpense, sn.correctNewAccDep].filter(hasDecimal).length;
  assert(close(sn.correctSnExpense, expectedSn), 'Susut Nilai', `sample ${index} expense mismatch`);
  assert(close(sn.correctNewAccDep, sn.oldAccDep + sn.correctSnExpense), 'Susut Nilai', `sample ${index} accumulated amount mismatch`);

  const badDebt = generateBadDebtQuestion();
  if (badDebt.type === 'BAD_DEBT') {
    assert(badDebt.correctNewAbt === badDebt.originalAbt - badDebt.amount, 'Hutang Lapuk', `sample ${index} ABT mismatch`);
    assert(badDebt.correctNewBank === badDebt.originalBank, 'Hutang Lapuk', `sample ${index} bank should not change`);
  } else {
    assert(badDebt.correctNewBank === badDebt.originalBank + badDebt.amount, 'Hutang Lapuk', `sample ${index} bank mismatch`);
    assert(badDebt.correctNewAbt === badDebt.originalAbt, 'Hutang Lapuk', `sample ${index} ABT should not change`);
  }

  for (const isNewLoan of [true, false]) {
    const loan = generateLoanQuestion(isNewLoan);
    const annualRepayment = loan.principal / loan.durationYears;
    const expectedInterest = loan.principal * loan.rate * loan.monthsHeld / 1200;
    stats.loanDecimals += [loan.tbLoanBalance, loan.tbInterestPaid, loan.correctInterestExpense, loan.correctAccruedAmount, loan.correctLs, loan.correctLbs].filter(hasDecimal).length;
    assert(loan.tbLoanBalance > 0, 'Pinjaman', `sample ${index} has a non-positive balance`);
    assert(close(loan.correctInterestExpense, expectedInterest), 'Pinjaman', `sample ${index} interest mismatch`);
    assert(close(loan.correctAccruedAmount, Math.abs(loan.correctInterestExpense - loan.tbInterestPaid)), 'Pinjaman', `sample ${index} adjustment mismatch`);
    assert(loan.correctAdjustmentType === (loan.tbInterestPaid < loan.correctInterestExpense ? 'BELUM_BAYAR' : 'PRABAYAR'), 'Pinjaman', `sample ${index} adjustment type mismatch`);
    assert(close(loan.correctLs, Math.min(loan.tbLoanBalance, annualRepayment)), 'Pinjaman', `sample ${index} current liability mismatch`);
    assert(close(loan.correctLbs, loan.tbLoanBalance - loan.correctLs), 'Pinjaman', `sample ${index} non-current liability mismatch`);
  }

  for (const level of [1, 2]) {
    const disposal = generateDisposalQuestion(level);
    stats.disposalDecimals += [
      disposal.correctSnExpenseSold,
      disposal.correctSnExpenseUnsold,
      disposal.correctSoldTotalSnt,
      disposal.correctUnsoldTotalSnt,
      disposal.correctBookValue,
      disposal.correctGainLossAmount,
      disposal.correctFinalAssetCost,
      disposal.correctFinalAccDep,
    ].filter(hasDecimal).length;
    assert(close(disposal.correctBookValue, disposal.soldCost - disposal.correctSoldTotalSnt), 'Pelupusan', `sample ${index} level ${level} book value mismatch`);
    assert(close(disposal.correctGainLossAmount, Math.abs(disposal.disposalValue - disposal.correctBookValue)), 'Pelupusan', `sample ${index} level ${level} gain/loss mismatch`);
    assert(disposal.correctGainLossType === (disposal.disposalValue >= disposal.correctBookValue ? 'UNTUNG' : 'RUGI'), 'Pelupusan', `sample ${index} level ${level} gain/loss type mismatch`);
    assert(close(disposal.correctFinalAccDep, level === 1 ? 0 : disposal.correctUnsoldTotalSnt), 'Pelupusan', `sample ${index} level ${level} closing SNT mismatch`);
  }

  const tpm = generateTpmQuestion();
  stats.tpmDecimals += [tpm.ansKosTetap, tpm.ansKosBerubahSeunit, tpm.ansMarginCaruman, tpm.ansTpmUnit, tpm.ansTpmRm, tpm.ansQf].filter(hasDecimal).length;
  assert(close(tpm.ansTpmUnit, tpm.ansKosTetap / tpm.ansMarginCaruman), 'TPM', `sample ${index} break-even units mismatch`);
  if (tpm.qfType === 'FIND_UNIT') {
    assert(close(tpm.ansQf, (tpm.ansKosTetap + tpm.qfTargetValue) / tpm.ansMarginCaruman), 'TPM', `sample ${index} target units mismatch`);
  } else {
    assert(close(tpm.ansQf, tpm.qfTargetValue * tpm.ansMarginCaruman - tpm.ansKosTetap), 'TPM', `sample ${index} target profit mismatch`);
  }
}

if (failures.length) {
  console.error('Question audit failed with ' + failures.length + ' captured issue(s):');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Question audit passed (' + SAMPLE_SIZE.toLocaleString() + ' generated samples per dynamic topic).');
console.log('PHR decimal answers: ' + stats.phrDecimals);
console.log('Other decimal answer fields observed — Susut Nilai: ' + stats.snDecimals + ', Pinjaman: ' + stats.loanDecimals + ', Pelupusan: ' + stats.disposalDecimals + ', TPM: ' + stats.tpmDecimals);

