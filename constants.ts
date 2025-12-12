import { LevelConfig, DropZoneData, DrillQuestion, DrillSnQuestion, DrillAccrualQuestion, DrillBadDebtQuestion, DrillLoanQuestion } from './types';

export const APP_TITLE = "Perniagaan Hakim Berjaya";
export const HAMIZAH_TITLE = "Perniagaan Hamizah";
export const SARAH_HELMI_TITLE = "Perkongsian Sarah dan Helmi";
export const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbydutm_YXccAyjsx3cnauOtKwbxU6uorLyoivAd9VwZxvP0A444v1ECNfQNpHdAa49A/exec"; 

// --- Helper Data Generators ---
const createItem = (label: string, category?: string) => ({ label, category, id: label });
const OP_TAMBAH = createItem('Tambah');
const OP_TOLAK = createItem('Tolak');
const CAT_BELIAN_ADD = 'BELIAN-ADD';

// --- LEVEL 1: Akaun Perdagangan ---
const LEVEL_1_ROWS: DropZoneData[] = [
  { id: 'l1-jualan', correctLabel: 'Jualan', displayValue: 'xx', indent: 0, colIndex: 2 },
  { id: 'l1-pulangan-jualan', hasOperator: true, correctOperator: 'Tolak', correctLabel: 'Pulangan Jualan', displayValue: '(x)', indent: 0, colIndex: 2, underline: 'single' }, 
  { id: 'l1-jualan-bersih', correctLabel: 'Jualan Bersih', displayValue: 'xx', indent: 0, colIndex: 2 },
  { id: 'l1-header-kos', hasOperator: true, correctOperator: 'Tolak', correctLabel: 'Kos Jualan', isHeaderRow: true, displayValue: '', indent: 0, colIndex: 0 }, 
  { id: 'l1-inv-awal', correctLabel: 'Inventori Awal', displayValue: 'x', indent: 0, colIndex: 1 },
  { id: 'l1-belian', correctLabel: 'Belian', displayValue: 'x', indent: 0, colIndex: 0 },
  { id: 'l1-pulangan-belian', hasOperator: true, correctOperator: 'Tolak', correctLabel: 'Pulangan Belian', displayValue: '(x)', indent: 0, colIndex: 0, underline: 'single' },
  { id: 'l1-belian-bersih', correctLabel: 'Belian Bersih', displayValue: 'xx', indent: 0, colIndex: 0 },
  { id: 'l1-angkutan', hasOperator: true, correctOperator: 'Tambah', correctLabel: 'Angkutan Masuk', acceptsCategory: CAT_BELIAN_ADD, displayValue: 'x', indent: 0, colIndex: 0 },
  { id: 'l1-upah', hasOperator: true, correctOperator: 'Tambah', correctLabel: 'Upah atas Belian', acceptsCategory: CAT_BELIAN_ADD, displayValue: 'x', indent: 0, colIndex: 0 },
  { id: 'l1-duti', hasOperator: true, correctOperator: 'Tambah', correctLabel: 'Duti Import', acceptsCategory: CAT_BELIAN_ADD, displayValue: 'x', indent: 0, colIndex: 0 },
  { id: 'l1-insurans', hasOperator: true, correctOperator: 'Tambah', correctLabel: 'Insurans atas Belian', acceptsCategory: CAT_BELIAN_ADD, displayValue: 'x', indent: 0, colIndex: 0, underline: 'single' },
  { id: 'l1-kos-belian', correctLabel: 'Kos Belian', displayValue: 'x', indent: 0, colIndex: 1 },
  { id: 'l1-kos-brg-utk-dijual', correctLabel: 'Kos Barang Untuk Dijual', displayValue: 'x', indent: 0, colIndex: 1 },
  { id: 'l1-inv-akhir', hasOperator: true, correctOperator: 'Tolak', correctLabel: 'Inventori Akhir', displayValue: '(x)', indent: 0, colIndex: 1, underline: 'single' },
  { id: 'l1-kos-jualan-val', correctLabel: 'Kos Jualan', displayValue: '(xx)', indent: 0, colIndex: 2, underline: 'single' },
  { id: 'l1-untung-kasar', correctLabel: 'Untung Kasar', displayValue: 'xx', indent: 0, colIndex: 2, underline: 'double' }
];

const LEVEL_1_ITEMS = [
  createItem('Jualan'), createItem('Pulangan Jualan'), createItem('Kos Jualan'), createItem('Jualan Bersih'),
  createItem('Inventori Awal'), createItem('Belian'), createItem('Pulangan Belian'), createItem('Belian Bersih'),
  createItem('Angkutan Masuk', CAT_BELIAN_ADD), createItem('Upah atas Belian', CAT_BELIAN_ADD),
  createItem('Duti Import', CAT_BELIAN_ADD), createItem('Insurans atas Belian', CAT_BELIAN_ADD),
  createItem('Kos Belian'), createItem('Kos Barang Untuk Dijual'), createItem('Inventori Akhir'), createItem('Untung Kasar'),
  OP_TAMBAH, OP_TOLAK
];

export const LEVELS: Record<string, LevelConfig> = {
  '1': {
    id: '1',
    title: APP_TITLE,
    headerDate: "Bagi Tahun Berakhir 31 Disember 2024",
    subTitle: "Akaun Perdagangan",
    rows: LEVEL_1_ROWS,
    items: LEVEL_1_ITEMS
  }
};

// --- DRILL GENERATORS ---

export const generatePhrQuestion = (): DrillQuestion => {
    const abt = (Math.floor(Math.random() * 50) + 10) * 1000; // 10k - 60k
    const rate = [2, 3, 4, 5][Math.floor(Math.random() * 4)];
    const newPhr = abt * (rate / 100);
    
    // Scenario: Increase or Decrease
    const isIncrease = Math.random() > 0.5;
    let oldPhr;
    
    if (isIncrease) {
        // Old PHR is smaller
        oldPhr = newPhr - (Math.floor(Math.random() * 5) + 1) * 100;
        if (oldPhr < 0) oldPhr = 0;
    } else {
        // Old PHR is larger
        oldPhr = newPhr + (Math.floor(Math.random() * 5) + 1) * 100;
    }

    const adjustment = newPhr - oldPhr;
    
    return {
        id: `phr-${Date.now()}-${Math.random()}`,
        abt,
        oldPhr,
        rate,
        correctNewPhr: newPhr,
        correctCategory: adjustment > 0 ? 'BELANJA' : 'HASIL',
        correctAdjustmentAmount: Math.abs(adjustment)
    };
};

export const generateSnQuestion = (): DrillSnQuestion => {
    const assets = ['Kenderaan', 'Lengkapan', 'Alatan Pejabat', 'Jentera'];
    const assetName = assets[Math.floor(Math.random() * assets.length)];
    const cost = (Math.floor(Math.random() * 8) + 2) * 10000; // 20k - 100k
    
    const methodType = Math.random() > 0.5 ? 'STRAIGHT_LINE' : 'REDUCING_BALANCE';
    const rate = [10, 15, 20][Math.floor(Math.random() * 3)];
    
    let oldAccDep = 0;
    // If reducing balance, ensure oldAccDep exists and is reasonable
    if (methodType === 'REDUCING_BALANCE') {
        oldAccDep = cost * (Math.floor(Math.random() * 30) + 10) / 100; // 10-40% accumulated
    } else {
        oldAccDep = cost * (Math.floor(Math.random() * 30) + 10) / 100;
    }
    
    let expense = 0;
    if (methodType === 'STRAIGHT_LINE') {
        expense = cost * (rate / 100);
    } else {
        expense = (cost - oldAccDep) * (rate / 100);
    }
    
    return {
        id: `sn-${Date.now()}-${Math.random()}`,
        assetName,
        cost,
        oldAccDep,
        methodType,
        rate,
        scrapValue: 0,
        usefulLife: 0,
        correctSnExpense: expense,
        correctCategory: 'BELANJA',
        correctNewAccDep: oldAccDep + expense
    };
};

// Accruals Data - Level 1 (Simple / No Date)
export const ACCRUALS_L1_QUESTIONS: DrillAccrualQuestion[] = [
    // Kumpulan A: Belanja Prabayar (Aset Semasa)
    {
        id: 'acc-l1-1',
        itemLabel: 'Insurans',
        trialBalanceAmount: 2000,
        adjustmentInfo: 'Insurans prabayar berjumlah RM 400.',
        type: 'PREPAID_EXP',
        correctPkkCategory: 'AS',
        correctPkkAmount: 400,
        correctFinalAmount: 1600
    },
    {
        id: 'acc-l1-2',
        itemLabel: 'Sewa',
        trialBalanceAmount: 5000,
        adjustmentInfo: 'Sewa prabayar adalah sebanyak RM 1,000.',
        type: 'PREPAID_EXP',
        correctPkkCategory: 'AS',
        correctPkkAmount: 1000,
        correctFinalAmount: 4000
    },
    // Kumpulan B: Belanja Belum Bayar (Liabiliti Semasa)
    {
        id: 'acc-l1-3',
        itemLabel: 'Gaji',
        trialBalanceAmount: 15000,
        adjustmentInfo: 'Gaji belum bayar berjumlah RM 2,000.',
        type: 'ACCRUED_EXP',
        correctPkkCategory: 'LS',
        correctPkkAmount: 2000,
        correctFinalAmount: 17000
    },
    {
        id: 'acc-l1-4',
        itemLabel: 'Kadar Bayaran',
        trialBalanceAmount: 3500,
        adjustmentInfo: 'Kadar bayaran belum bayar adalah sebanyak RM 300.',
        type: 'ACCRUED_EXP',
        correctPkkCategory: 'LS',
        correctPkkAmount: 300,
        correctFinalAmount: 3800
    },
    // Kumpulan C: Hasil Belum Terperoleh (Liabiliti Semasa)
    {
        id: 'acc-l1-5',
        itemLabel: 'Sewa Diterima',
        trialBalanceAmount: 8000,
        adjustmentInfo: 'Sewa belum terperoleh berjumlah RM 1,200.',
        type: 'UNEARNED_REV',
        correctPkkCategory: 'LS',
        correctPkkAmount: 1200,
        correctFinalAmount: 6800
    },
    {
        id: 'acc-l1-6',
        itemLabel: 'Komisen Diterima',
        trialBalanceAmount: 4500,
        adjustmentInfo: 'Komisen belum terperoleh adalah sebanyak RM 500.',
        type: 'UNEARNED_REV',
        correctPkkCategory: 'LS',
        correctPkkAmount: 500,
        correctFinalAmount: 4000
    },
    // Kumpulan D: Hasil Belum Terima (Aset Semasa)
    {
        id: 'acc-l1-7',
        itemLabel: 'Faedah Simpanan',
        trialBalanceAmount: 900,
        adjustmentInfo: 'Faedah simpanan belum terima berjumlah RM 300.',
        type: 'ACCRUED_REV',
        correctPkkCategory: 'AS',
        correctPkkAmount: 300,
        correctFinalAmount: 1200
    },
    {
        id: 'acc-l1-8',
        itemLabel: 'Sewa Diterima',
        trialBalanceAmount: 10000,
        adjustmentInfo: 'Sewa belum terima adalah sebanyak RM 2,000.',
        type: 'ACCRUED_REV',
        correctPkkCategory: 'AS',
        correctPkkAmount: 2000,
        correctFinalAmount: 12000
    }
];

// Accruals Data - Level 2 (Complex / With Date)
export const ACCRUALS_L2_QUESTIONS: DrillAccrualQuestion[] = [
    // Kumpulan A: Belanja Prabayar (Aset Semasa)
    {
        id: 'acc-l2-1',
        yearEndDate: '31 Disember 2024',
        itemLabel: 'Insurans',
        trialBalanceAmount: 2400,
        adjustmentInfo: 'Insurans tersebut dibayar untuk tempoh setahun bermula 1 Oktober 2024.',
        type: 'PREPAID_EXP',
        correctPkkCategory: 'AS',
        correctPkkAmount: 1800, // Jan-Sept 2025 (9 months) * 200
        correctFinalAmount: 600
    },
    {
        id: 'acc-l2-2',
        yearEndDate: '30 Jun 2025',
        itemLabel: 'Iklan',
        trialBalanceAmount: 1200,
        adjustmentInfo: 'Iklan telah dibayar untuk setahun berakhir 30 September 2025.',
        type: 'PREPAID_EXP',
        correctPkkCategory: 'AS',
        correctPkkAmount: 300, // Jul-Sept 2025 (3 months) * 100
        correctFinalAmount: 900
    },
    // Kumpulan B: Belanja Belum Bayar (Liabiliti Semasa)
    {
        id: 'acc-l2-3',
        yearEndDate: '31 Disember 2024',
        itemLabel: 'Sewa',
        trialBalanceAmount: 5500,
        adjustmentInfo: 'Sewa bulanan ialah RM 500. Sewa bulan Disember masih belum dibayar.',
        type: 'ACCRUED_EXP',
        correctPkkCategory: 'LS',
        correctPkkAmount: 500, // 1 month
        correctFinalAmount: 6000
    },
    {
        id: 'acc-l2-4',
        yearEndDate: '30 Jun 2025',
        itemLabel: 'Gaji',
        trialBalanceAmount: 33000,
        adjustmentInfo: 'Gaji bulan Jun 2025 masih belum dibayar.',
        type: 'ACCRUED_EXP',
        correctPkkCategory: 'LS',
        correctPkkAmount: 3000, // 33000 for 11 months = 3000/mo.
        correctFinalAmount: 36000
    },
    // Kumpulan C: Hasil Belum Terperoleh (Liabiliti Semasa)
    {
        id: 'acc-l2-5',
        yearEndDate: '31 Disember 2024',
        itemLabel: 'Sewa Diterima',
        trialBalanceAmount: 13000,
        adjustmentInfo: 'Sewa diterima adalah untuk tempoh 13 bulan berakhir 31 Januari 2025.',
        type: 'UNEARNED_REV',
        correctPkkCategory: 'LS',
        correctPkkAmount: 1000, // 1 month (Jan 2025)
        correctFinalAmount: 12000
    },
    {
        id: 'acc-l2-6',
        yearEndDate: '30 Jun 2025',
        itemLabel: 'Komisen Diterima',
        trialBalanceAmount: 4800,
        adjustmentInfo: 'Komisen tersebut termasuk komisen untuk bulan Julai dan Ogos 2025 berjumlah RM 800.',
        type: 'UNEARNED_REV',
        correctPkkCategory: 'LS',
        correctPkkAmount: 800,
        correctFinalAmount: 4000
    },
    // Kumpulan D: Hasil Belum Terima (Aset Semasa)
    {
        id: 'acc-l2-7',
        yearEndDate: '31 Disember 2024',
        itemLabel: 'Faedah Simpanan Tetap',
        trialBalanceAmount: 600,
        adjustmentInfo: 'Faedah simpanan tetap yang sepatutnya diterima adalah RM 800 setahun.',
        type: 'ACCRUED_REV',
        correctPkkCategory: 'AS',
        correctPkkAmount: 200, // 800 - 600
        correctFinalAmount: 800
    },
    {
        id: 'acc-l2-8',
        yearEndDate: '31 Mac 2025',
        itemLabel: 'Komisen Diterima',
        trialBalanceAmount: 4400,
        adjustmentInfo: 'Komisen bulanan ialah RM 400. Komisen bulan Mac 2025 masih belum diterima.',
        type: 'ACCRUED_REV',
        correctPkkCategory: 'AS',
        correctPkkAmount: 400, // 1 month
        correctFinalAmount: 4800
    }
];

export const generateBadDebtQuestion = (): DrillBadDebtQuestion => {
    const type = Math.random() > 0.5 ? 'BAD_DEBT' : 'BAD_DEBT_RECOVERED';
    const amount = (Math.floor(Math.random() * 5) + 2) * 100; // 200 - 600
    const originalAbt = (Math.floor(Math.random() * 50) + 50) * 100; // 5000 - 10000
    const originalBank = (Math.floor(Math.random() * 100) + 50) * 100; // 5000 - 15000

    let correctNewAbt = originalAbt;
    let correctNewBank = originalBank;

    if (type === 'BAD_DEBT') {
        correctNewAbt = originalAbt - amount;
    } else {
        correctNewBank = originalBank + amount;
    }

    return {
        id: `bd-${Date.now()}-${Math.random()}`,
        type,
        amount,
        originalAbt,
        originalBank,
        correctNewAbt,
        correctNewBank,
        correctCategory: type === 'BAD_DEBT' ? 'BELANJA' : 'HASIL'
    };
};

export const generateLoanQuestion = (forceNewLoan: boolean = false): DrillLoanQuestion => {
    // 1. Setup Malay Month Names and Days
    const months = [
        "Januari", "Februari", "Mac", "April", "Mei", "Jun",
        "Julai", "Ogos", "September", "Oktober", "November", "Disember"
    ];
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    
    const currentYear = 2024;
    
    // NEW: Randomize Financial Year End Month
    const fyEndMonthIndex = Math.floor(Math.random() * 12);
    const fyEndDay = daysInMonth[fyEndMonthIndex];
    const fyEndMonthName = months[fyEndMonthIndex];
    const yearEndStr = `${fyEndDay} ${fyEndMonthName} ${currentYear}`;

    // 2. CONFIG: Clean Integer Logic
    const baseMonthlyRepayment = [200, 300, 400, 500, 1000][Math.floor(Math.random() * 5)];
    const yearlyRepayment = baseMonthlyRepayment * 12; // e.g. 2400, 3600...

    // Select Duration (Years): 2 to 10 years (as requested)
    const durationYears = Math.floor(Math.random() * 9) + 2; // Range [2, 10]

    // Calculate Total Principal
    const principal = yearlyRepayment * durationYears; 

    // Select Rate (Int): 3, 4, 5, 6, 8%
    const rate = [3, 4, 5, 6, 8][Math.floor(Math.random() * 5)];

    // 3. Date & Balance Logic
    let startMonthIndex: number;
    let startYear: number;
    let monthsHeld: number; // For interest calc
    let tbLoanBalance: number;

    if (forceNewLoan) {
        // NEW LOAN: Started in current accounting year, held for < 1 year
        // We select monthsHeld (1-11) first, then determine start date relative to FY End.
        
        monthsHeld = Math.floor(Math.random() * 11) + 1; // 1 to 11 months
        
        // Calculate start index working backwards from FY End
        // e.g. FY End March. Held 1 month -> Start 1 March.
        // Index: 2 - 1 + 1 = 2 (March).
        
        let sIdx = fyEndMonthIndex - monthsHeld + 1;
        let sYear = currentYear;
        
        if (sIdx < 0) {
            sIdx += 12;
            sYear -= 1;
        }
        
        startMonthIndex = sIdx;
        startYear = sYear;

        // Balance in TB reflects repayment for months held
        tbLoanBalance = principal - (baseMonthlyRepayment * monthsHeld);
    } else {
        // OLD LOAN: Held for full 12 months of current FY
        monthsHeld = 12;
        
        // Start date must be at least 12 months prior to FY End
        // Randomize years elapsed before current year (at least 1 year gap)
        const maxYearsPrior = Math.max(1, durationYears - 2);
        const yearsPrior = Math.floor(Math.random() * maxYearsPrior) + 1;
        
        startYear = currentYear - yearsPrior;
        
        // Ensure accurate 12-month gap if just 1 year prior
        if (yearsPrior === 1) {
            // Start month must be on or before fyEndMonthIndex to be >= 12 months ago
            startMonthIndex = Math.floor(Math.random() * (fyEndMonthIndex + 1));
        } else {
            startMonthIndex = Math.floor(Math.random() * 12);
        }
        
        // Calculate Total Months Passed for Balance Reduction
        // (Diff Years * 12) + (EndMonth - StartMonth) + 1
        let totalMonthsPassed = ((currentYear - startYear) * 12) + (fyEndMonthIndex - startMonthIndex) + 1;
        
        // SAFETY: Ensure we don't accidentally exceed loan duration (resulting in 0 or negative balance)
        if (totalMonthsPassed >= durationYears * 12) {
            // Adjust startMonthIndex to be later so totalMonthsPassed < durationYears * 12
            // We need to decrease totalMonthsPassed. 
            // Decrease by shifting startMonthIndex forward.
            const excessMonths = totalMonthsPassed - (durationYears * 12) + 1; // leave at least 1 month balance
            startMonthIndex = (startMonthIndex + excessMonths) % 12;
            if (startMonthIndex < excessMonths) startYear += 1; // if wrapped around
            
            // Recalculate
            totalMonthsPassed = ((currentYear - startYear) * 12) + (fyEndMonthIndex - startMonthIndex) + 1;
        }

        tbLoanBalance = principal - (baseMonthlyRepayment * totalMonthsPassed);
    }

    const startDay = 1;
    const loanDateStr = `${startDay} ${months[startMonthIndex]} ${startYear}`;

    // Maturity Date Calculation
    let endMonthIndex = startMonthIndex - 1;
    let endYear = startYear + durationYears;
    
    if (endMonthIndex < 0) {
        endMonthIndex = 11; // Dec
        endYear -= 1; // Pull back year
    }
    
    const endDay = daysInMonth[endMonthIndex]; // Use last day of that month
    const maturityDateStr = `${endDay} ${months[endMonthIndex]} ${endYear}`;

    // 4. Calculations

    // Interest Expense (Untung Rugi)
    // Formula: Principal * Rate% * (Months / 12)
    const correctInterestExpense = (principal * rate * monthsHeld) / 1200;

    // Accrued vs Prepaid Logic
    // Randomize if student faces Accrued (Belum Bayar) or Prepaid (Prabayar)
    const isAccrued = Math.random() > 0.5;
    let monthsPaid = 0;
    
    if (forceNewLoan) {
        if (isAccrued) {
             // Pay less than held
             monthsPaid = Math.max(0, monthsHeld - (Math.floor(Math.random() * 2) + 1));
        } else {
             // Pay more than held
             monthsPaid = monthsHeld + (Math.floor(Math.random() * 2) + 1);
        }
    } else {
        if (isAccrued) {
            monthsPaid = [9, 10, 11][Math.floor(Math.random() * 3)];
        } else {
            monthsPaid = [13, 14, 15][Math.floor(Math.random() * 3)];
        }
    }
    
    // TB Paid Amount based on monthly interest rate
    const monthlyInterest = (principal * rate) / 1200;
    const tbInterestPaid = monthlyInterest * monthsPaid;
    
    // Calculate adjustment amount (Absolute difference)
    const correctAccruedAmount = Math.abs(correctInterestExpense - tbInterestPaid);

    // Liability Split
    let correctLs = yearlyRepayment;
    
    // Logic fix: If remaining balance is less than yearly repayment, 
    // the entire balance is a Current Liability (payable within 12 months).
    // And Non-Current Liability becomes 0.
    if (tbLoanBalance <= yearlyRepayment) {
        correctLs = tbLoanBalance;
    }

    const correctLbs = tbLoanBalance - correctLs;

    return {
        id: `loan-${Date.now()}-${Math.random()}`,
        principal,
        rate,
        durationYears,
        loanDateStr,
        maturityDateStr,
        yearEndStr,
        tbLoanBalance,
        tbInterestPaid,
        correctInterestExpense,
        correctAdjustmentType: isAccrued ? 'BELUM_BAYAR' : 'PRABAYAR',
        correctAccruedAmount,
        correctLs,
        correctLbs,
        isNewLoan: forceNewLoan,
        monthsHeld
    };
};