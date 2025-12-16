import { LevelConfig, DropZoneData, DrillQuestion, DrillSnQuestion, DrillAccrualQuestion, DrillBadDebtQuestion, DrillLoanQuestion, DrillDisposalQuestion, DrillTpmQuestion } from './types';

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

export const generateDisposalQuestion = (level: 1 | 2): DrillDisposalQuestion => {
  // Config
  const currentYear = 2024;
  const financialYearEnd = `31 Disember ${currentYear}`;
  const months = ["Januari", "Februari", "Mac", "April", "Mei", "Jun", "Julai", "Ogos", "September", "Oktober", "November", "Disember"];
  
  // 1. Assets
  const assets = ['Perabot', 'Kenderaan', 'Alatan Pejabat', 'Jentera'];
  const assetName = assets[Math.floor(Math.random() * assets.length)];
  
  // 4. Method & Rate (Generate first to ensure clean numbers)
  const method = Math.random() > 0.5 ? 'STRAIGHT_LINE' : 'REDUCING_BALANCE';
  const rate = [10, 15, 20][Math.floor(Math.random() * 3)];

  // Helper: Generate Integer-friendly Cost for Straight Line
  // Cost * Rate% * 1/12 must be an integer.
  // Strategy: Generate Monthly Dep first (int), then Annual Dep, then Cost.
  const generateCleanCost = () => {
      if (method === 'STRAIGHT_LINE') {
          // Monthly Dep = 50, 100, 150... to ensure it's not too small or weird
          const monthlyDep = (Math.floor(Math.random() * 5) + 1) * 100; 
          const annualDep = monthlyDep * 12;
          // Annual = Cost * Rate/100  -> Cost = Annual / (Rate/100)
          return Math.round(annualDep / (rate/100));
      } else {
          // For Reducing Balance, just use standard rounded thousands, we'll round the result later.
          return (Math.floor(Math.random() * 4) + 2) * 10000;
      }
  }

  // 2. Scenario Costs
  const costA = generateCleanCost(); // Sold Asset
  let costB = 0;
  if (level === 2) {
    costB = generateCleanCost(); // Unsold Asset
  }
  const totalCost = costA + costB;

  // 3. Purchase Date for Unit A (Sold)
  // Logic: 
  // Scenario 1: Partial First Year -> Sold on Last Day of Current Year
  // Scenario 2: Full First Year (1 Jan) -> Sold Partial Year (Mid-Year)
  
  const isPurchasePartialYear = Math.random() > 0.5;
  
  let purchaseYearA, purchaseMonthAIndex, purchaseDateA, disposalDate, monthsHeldCurrentYear;
  
  if (isPurchasePartialYear) {
      // Bought mid-year 2-3 years ago. Sold 31 Dec 2024.
      const yearsAgo = Math.floor(Math.random() * 2) + 2; // 2 or 3 years ago
      purchaseYearA = currentYear - yearsAgo;
      // Purchase month 1 (Feb) to 11 (Dec) to ensure partial first year
      purchaseMonthAIndex = Math.floor(Math.random() * 11) + 1; 
      purchaseDateA = `1 ${months[purchaseMonthAIndex]} ${purchaseYearA}`;
      
      disposalDate = `31 Disember ${currentYear}`;
      monthsHeldCurrentYear = 12;
  } else {
      // Bought 1 Jan 2-3 years ago. Sold mid-year 2024.
      const yearsAgo = Math.floor(Math.random() * 2) + 2;
      purchaseYearA = currentYear - yearsAgo;
      purchaseMonthAIndex = 0; // Jan
      purchaseDateA = `1 Januari ${purchaseYearA}`;
      
      const disposalMonthIndex = Math.floor(Math.random() * 10); // Jan - Oct
      const disposalMonthName = months[disposalMonthIndex];
      // Determine Day (28, 30, 31)
      let day = 30;
      if (["Januari", "Mac", "Mei", "Julai", "Ogos", "Oktober", "Disember"].includes(disposalMonthName)) day = 31;
      if (disposalMonthName === "Februari") day = 29; // 2024 is leap year
      disposalDate = `${day} ${disposalMonthName} ${currentYear}`;
      monthsHeldCurrentYear = disposalMonthIndex + 1;
  }

  // 5. Calculate SNT (Opening) for Unit A (Sold)
  // From Purchase Date to 1 Jan 2024 (Start of current year)
  let sntA_Opening = 0;
  const monthsFirstYear = 12 - purchaseMonthAIndex; 
  
  if (method === 'STRAIGHT_LINE') {
      const annualDepA = costA * rate / 100;
      // First Year
      sntA_Opening += annualDepA * (monthsFirstYear / 12);
      // Subsequent full years until 2023
      const fullYears = (currentYear - 1) - purchaseYearA;
      if (fullYears > 0) {
        sntA_Opening += annualDepA * fullYears;
      }
  } else {
      // Reducing Balance
      // Year 1
      let currentBook = costA;
      const dep1 = currentBook * (rate/100) * (monthsFirstYear/12);
      sntA_Opening += dep1;
      currentBook -= dep1;
      
      // Subsequent years
      const fullYears = (currentYear - 1) - purchaseYearA;
      for(let i=0; i<fullYears; i++) {
          const dep = currentBook * (rate/100);
          sntA_Opening += dep;
          currentBook -= dep;
      }
  }
  sntA_Opening = Math.round(sntA_Opening);
  
  // 6. Calculate SNT (Opening) for Unit B (Unsold) - if exists
  let sntB_Opening = 0;
  if (level === 2) {
      // Just simulate 2 years held for B to get some SNT
      if (method === 'STRAIGHT_LINE') {
          sntB_Opening = (costB * rate / 100) * 2;
      } else {
          let bVal = costB;
          let acc = 0;
          for(let k=0; k<2; k++) {
              let d = bVal * rate/100;
              acc += d;
              bVal -= d;
          }
          sntB_Opening = acc;
      }
  }
  sntB_Opening = Math.round(sntB_Opening);

  const totalOpeningSnt = Math.round(sntA_Opening + sntB_Opening);

  // 8. Calculate Current Year Depreciation
  
  // A. Sold Unit (A)
  let snExpenseA = 0;
  let snExpenseAString = "";
  if (method === 'STRAIGHT_LINE') {
      snExpenseA = (costA * rate / 100) * (monthsHeldCurrentYear / 12);
      snExpenseAString = `RM${costA} x ${rate}% x ${monthsHeldCurrentYear}/12`;
  } else {
      // Opening Book Value of A = CostA - sntA_Opening
      const nbA = costA - sntA_Opening;
      snExpenseA = nbA * (rate / 100) * (monthsHeldCurrentYear / 12);
      snExpenseAString = `(RM${costA} - RM${sntA_Opening}) x ${rate}% x ${monthsHeldCurrentYear}/12`;
  }
  snExpenseA = Math.round(snExpenseA); 

  // B. Unsold Unit (B) - Full Year
  let snExpenseB = 0;
  let snExpenseBString = "";
  if (level === 2) {
    if (method === 'STRAIGHT_LINE') {
        snExpenseB = costB * rate / 100;
        snExpenseBString = `RM${costB} x ${rate}%`;
    } else {
        const nbB = costB - sntB_Opening;
        snExpenseB = nbB * (rate / 100);
        snExpenseBString = `(RM${costB} - RM${sntB_Opening}) x ${rate}%`;
    }
  }
  snExpenseB = Math.round(snExpenseB);

  // 9. Total SNT of Sold Unit (Q2 Answer)
  const totalSntA = Math.round(sntA_Opening + snExpenseA);
  
  // SNT of Unsold Unit (Q2 Answer for Level 2)
  const totalSntB = Math.round(sntB_Opening + snExpenseB);

  // 10. Book Value of Sold Unit (Q3 Answer)
  const bookValueA = costA - totalSntA;

  // 11. Disposal Price & Gain/Loss (Q5)
  const isProfit = Math.random() > 0.5;
  let gainLoss = (Math.floor(Math.random() * 20) + 1) * 100;
  let disposalValue = 0;
  
  if (isProfit) {
      disposalValue = bookValueA + gainLoss;
  } else {
      disposalValue = bookValueA - gainLoss;
      if (disposalValue < 100) { // Safety
           disposalValue = 100;
           gainLoss = bookValueA - disposalValue;
      }
  }
  
  const paymentMode = Math.random() > 0.5 ? 'BANK' : 'TUNAI';
  const paymentDescription = paymentMode === 'BANK' ? "Wang dibankkan." : "Diterima secara tunai.";

  // 12. Final PKK Figures (Q6)
  const correctFinalAssetCost = totalCost - costA; 
  const correctFinalAccDep = Math.round(totalSntB);

  // 13. Explanations Generation
  let q1Explanation = "";
  let q2Explanation = "";

  if (level === 1) {
      q1Explanation = `Susut Nilai = ${snExpenseAString} = RM${snExpenseA}`;
      q2Explanation = `SNT = SNT Awal (RM${sntA_Opening}) + SN Semasa (RM${snExpenseA}) = RM${totalSntA}`;
  } else {
      q1Explanation = `1. Dijual: ${snExpenseAString} = RM${snExpenseA}\n2. Tidak Dijual: ${snExpenseBString} = RM${snExpenseB}`;
      q2Explanation = `1. Dijual: ${sntA_Opening} + ${snExpenseA} = RM${totalSntA}\n2. Tidak Dijual: ${sntB_Opening} + ${snExpenseB} = RM${totalSntB}`;
  }

  return {
      id: `disp-${Date.now()}-${Math.random()}`,
      level,
      assetName,
      tbTotalCost: totalCost,
      tbTotalAccDep: totalOpeningSnt,
      soldCost: costA,
      soldPurchaseDate: purchaseDateA,
      method,
      rate,
      financialYearEnd,
      disposalDate,
      monthsHeld: monthsHeldCurrentYear,
      disposalValue: Math.round(disposalValue),
      paymentMode,
      paymentDescription,
      correctSnExpenseSold: snExpenseA,
      correctSnExpenseUnsold: snExpenseB,
      correctSoldTotalSnt: totalSntA,
      correctUnsoldTotalSnt: totalSntB,
      correctBookValue: Math.round(bookValueA),
      correctGainLossType: isProfit ? 'UNTUNG' : 'RUGI',
      correctGainLossAmount: Math.round(gainLoss),
      correctFinalAssetCost,
      correctFinalAccDep,
      q1Explanation,
      q2Explanation
  };
};

export const generateTpmQuestion = (): DrillTpmQuestion => {
    // Determine Scenario Type (Balanced mix is good, or pure random)
    const types = ['TABLE_ZERO', 'LIST', 'TABLE_HIGH_LOW'] as const;
    const type = types[Math.floor(Math.random() * types.length)];
    
    // Core Numbers
    // Margin Caruman should be simple: 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0
    const margin = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0][Math.floor(Math.random() * 8)];
    
    // Variable Cost (clean)
    const vc = [1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0][Math.floor(Math.random() * 7)];
    
    // Selling Price
    const sp = vc + margin;
    
    // Fixed Cost - Should ensure TPM Unit is Integer
    // FC = Margin * RandomInteger
    const tpmUnitTarget = (Math.floor(Math.random() * 40) + 10) * 100; // 1000 to 5000 approx
    const fc = Math.round(tpmUnitTarget * margin);
    
    // Question F: Target Profit Logic
    const qfType = Math.random() > 0.5 ? 'FIND_UNIT' : 'FIND_PROFIT';
    let qfTargetValue = 0;
    let ansQf = 0;
    
    if (qfType === 'FIND_UNIT') {
        // We give Target Profit RM, ask for Units
        // Unit = (FC + Profit) / Margin
        // We want Unit to be Integer. So (FC + Profit) must be divisible by Margin.
        // Since FC is divisible by Margin, Profit must also be divisible by Margin.
        const extraUnits = (Math.floor(Math.random() * 20) + 5) * 100;
        const targetProfit = Math.round(extraUnits * margin);
        
        qfTargetValue = targetProfit;
        ansQf = tpmUnitTarget + extraUnits;
    } else {
        // We give Target Units, ask for Profit RM
        // Profit = (Units * Margin) - FC
        const targetUnits = tpmUnitTarget + (Math.floor(Math.random() * 10) + 5) * 100;
        qfTargetValue = targetUnits;
        ansQf = (targetUnits * margin) - fc;
    }

    // --- Scenario Generation ---
    let title = "";
    let description = "";
    let data: any = null;
    
    const businesses = ["Kilang Kasut Ayra", "Rosmah Bakery", "Perniagaan Teratak Deco", "Perniagaan Titisan Segar", "Marissa Belacan"];
    const businessName = businesses[Math.floor(Math.random() * businesses.length)];
    title = businessName;

    if (type === 'TABLE_ZERO') {
        description = "Jadual berikut menunjukkan anggaran jumlah kos dan jumlah hasil pada pelbagai peringkat keluaran.";
        // Create 3 rows
        data = [
            { unit: 0, cost: fc, revenue: 0 },
            { unit: 1000, cost: fc + (vc * 1000), revenue: sp * 1000 },
            { unit: 2000, cost: fc + (vc * 2000), revenue: sp * 2000 },
            { unit: 3000, cost: fc + (vc * 3000), revenue: sp * 3000 }
        ];
    } else if (type === 'LIST') {
        description = "Anggaran kos pengeluaran produk berkenaan adalah seperti berikut:";
        // Split FC and VC into sub-items
        const fc1 = Math.round(fc * 0.6);
        const fc2 = fc - fc1;
        const vc1 = Number((vc * 0.6).toFixed(2));
        const vc2 = Number((vc - vc1).toFixed(2));
        
        data = [
            { label: "Sewa Kilang", val: fc1, isUnit: false },
            { label: "Gaji Pengurus", val: fc2, isUnit: false },
            { label: "Bahan Mentah", val: vc1, isUnit: true },
            { label: "Upah Langsung", val: vc2, isUnit: true },
            { label: "Harga Jualan", val: sp, isUnit: true, isPrice: true }
        ];
    } else if (type === 'TABLE_HIGH_LOW') {
        description = "Jadual berikut menunjukkan jumlah kos dan jumlah hasil perniagaannya pada pelbagai paras keluaran.";
        // Create 2 rows sufficiently apart
        const u1 = 2000;
        const u2 = 4000;
        data = [
            { unit: u1, cost: fc + (vc * u1), revenue: sp * u1 },
            { unit: u2, cost: fc + (vc * u2), revenue: sp * u2 },
        ];
    }

    // Explanation
    let expScenario = "";
    if (type === 'TABLE_ZERO') {
        expScenario = `
        a) Kos Tetap = Kos pada 0 unit = RM${fc}.
        b) Kos Berubah seunit = (Kos pada 1000 unit - Kos Tetap) / 1000
           = (RM${fc + vc*1000} - RM${fc}) / 1000 = RM${vc.toFixed(2)}.
        `;
    } else if (type === 'LIST') {
        expScenario = `
        a) Kos Tetap = Jumlahkan kos tetap (bukan seunit) = RM${fc}.
        b) Kos Berubah seunit = Jumlahkan kos berubah seunit = RM${vc.toFixed(2)}.
        `;
    } else {
        expScenario = `
        b) Kos Berubah seunit (Kaedah Tinggi-Rendah):
           = (Perubahan Kos) / (Perubahan Unit)
           = (RM${fc + vc*4000} - RM${fc + vc*2000}) / (4000 - 2000)
           = RM${vc.toFixed(2)}.
        a) Kos Tetap = Jumlah Kos - (Kos Berubah seunit x Unit)
           = RM${fc + vc*2000} - (RM${vc.toFixed(2)} x 2000) = RM${fc}.
        `;
    }

    const qfExplanation = qfType === 'FIND_UNIT' 
        ? `f) Unit Sasaran = (Kos Tetap + Untung Sasaran) / Margin Caruman
           = (RM${fc} + RM${qfTargetValue}) / RM${margin.toFixed(2)}
           = ${ansQf} unit.`
        : `f) Untung Sasaran = (Unit Sasaran x Margin Caruman) - Kos Tetap
           = (${qfTargetValue} x RM${margin.toFixed(2)}) - RM${fc}
           = RM${ansQf}.`;

    const explanation = `
    ${expScenario}
    c) Margin Caruman = Harga Jualan - Kos Berubah
       = RM${sp.toFixed(2)} - RM${vc.toFixed(2)} = RM${margin.toFixed(2)}.
    d) TPM (Unit) = Kos Tetap / Margin Caruman
       = RM${fc} / RM${margin.toFixed(2)} = ${Math.round(fc/margin)} unit.
    e) TPM (RM) = TPM Unit x Harga Jualan
       = ${Math.round(fc/margin)} x RM${sp.toFixed(2)} = RM${(Math.round(fc/margin)*sp).toFixed(2)}.
    ${qfExplanation}
    `;

    return {
        id: `tpm-${Date.now()}-${Math.random()}`,
        scenarioType: type,
        title,
        description,
        data,
        ansKosTetap: fc,
        ansKosBerubahSeunit: vc,
        ansMarginCaruman: margin,
        ansTpmUnit: Math.round(fc/margin),
        ansTpmRm: Math.round(fc/margin) * sp,
        qfType,
        qfTargetValue,
        ansQf,
        explanation
    };
};