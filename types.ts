export enum ScreenState {
  WELCOME = 'WELCOME',
  MENU = 'MENU',
  GAME = 'GAME',
  LEADERBOARD = 'LEADERBOARD',
  DRILL_MENU = 'DRILL_MENU',
  DRILL_PHR = 'DRILL_PHR',
  DRILL_SN = 'DRILL_SN',
  DRILL_ACCRUALS_L1 = 'DRILL_ACCRUALS_L1',
  DRILL_ACCRUALS_L2 = 'DRILL_ACCRUALS_L2',
  DRILL_BAD_DEBTS = 'DRILL_BAD_DEBTS',
  DRILL_LOAN = 'DRILL_LOAN'
}

export interface GameItem {
  id: string;
  label: string;
  originalId: string;
  category?: string;
  isPenalty?: boolean;
}

export interface DropZoneData {
  id: string;
  correctLabel?: string;
  acceptsCategory?: string;
  hasOperator?: boolean;
  correctOperator?: string;
  displayValue?: string;
  indent?: number;
  underline?: 'single' | 'double';
  isHeaderRow?: boolean;
  isStatic?: boolean;
  colIndex?: 0 | 1 | 2;
  multiColumnValues?: { [key in 0 | 1 | 2]?: string };
  interactiveColumnLabels?: { [key in 0 | 1 | 2]?: string };
  emptyOperatorSpace?: boolean;
  side?: 'left' | 'right'; 
  date?: string;
  tAccountValues?: { sarah: string; helmi: string };
  
  // New for Graph
  graphPosition?: { top: string; left: string }; 
}

export interface LevelConfig {
  id: string;
  title: string;
  headerDate: string;
  subTitle: string;
  layout?: 'standard' | 't-account' | 'graph'; 
  menuLabel?: string; // New: label for the menu card
  rows: DropZoneData[];
  items: { label: string; category?: string; id: string }[];
}

export interface LeaderboardEntry {
  name: string;
  levelId: string;
  score: number; // Now represents Points, not mistakes
  time: number;
  timestamp: number;
}

export interface DrillQuestion {
  id: string;
  abt: number;
  oldPhr: number;
  rate: number;
  correctNewPhr: number;
  correctCategory: 'BELANJA' | 'HASIL';
  correctAdjustmentAmount: number;
  isPenalty?: boolean; 
}

export interface DrillSnQuestion {
  id: string;
  assetName: string;
  cost: number;
  oldAccDep: number;
  methodType: 'STRAIGHT_LINE' | 'REDUCING_BALANCE' | 'SCRAP_VALUE';
  rate: number;
  scrapValue: number;
  usefulLife: number;
  correctSnExpense: number;
  correctCategory: 'BELANJA' | 'HASIL';
  correctNewAccDep: number;
  isPenalty?: boolean; 
}

export interface DrillAccrualQuestion {
  id: string;
  title?: string;
  yearEndDate?: string; 
  itemLabel: string; 
  trialBalanceAmount: number;
  adjustmentInfo: string;
  type: 'ACCRUED_EXP' | 'PREPAID_EXP' | 'ACCRUED_REV' | 'UNEARNED_REV';
  correctPkkCategory: 'AS' | 'LS';
  correctPkkAmount: number; 
  correctFinalAmount: number; 
  isPenalty?: boolean; 
}

export interface DrillBadDebtQuestion {
  id: string;
  type: 'BAD_DEBT' | 'BAD_DEBT_RECOVERED';
  originalAbt: number;
  originalBank: number;
  amount: number;
  correctNewAbt: number;  // Correct Answer for ABT Input
  correctNewBank: number; // Correct Answer for Bank Input
  correctCategory: 'BELANJA' | 'HASIL';
  isPenalty?: boolean; 
}

export interface DrillLoanQuestion {
  id: string;
  principal: number;
  rate: number;
  durationYears: number;
  loanDateStr: string;
  maturityDateStr: string;
  yearEndStr: string;
  tbLoanBalance: number;
  tbInterestPaid: number; 
  
  correctInterestExpense: number;
  correctAdjustmentType: 'BELUM_BAYAR' | 'PRABAYAR'; 
  correctAccruedAmount: number;
  correctLs: number;
  correctLbs: number;
  
  isNewLoan: boolean; // New Flag
  monthsHeld: number; // New Flag
  
  isPenalty?: boolean;
}