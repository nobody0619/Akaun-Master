import React, { useState, useEffect, useRef } from 'react';
import { ScreenState, GameItem, LeaderboardEntry, LevelConfig, DropZoneData, DrillQuestion, DrillSnQuestion, DrillAccrualQuestion, DrillBadDebtQuestion, DrillLoanQuestion, DrillDisposalQuestion, DrillTpmQuestion } from './types';
import { LEVELS, generatePhrQuestion, generateSnQuestion, ACCRUALS_L1_QUESTIONS, ACCRUALS_L2_QUESTIONS, generateBadDebtQuestion, generateLoanQuestion, generateDisposalQuestion, generateTpmQuestion } from './constants';
import { saveScore, getScores } from './services/leaderboardService';
import { Button } from './components/Button';

// -- Helper --
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatMoney = (value: number) => new Intl.NumberFormat('ms-MY', {
  minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
  maximumFractionDigits: 2,
}).format(value);

const BrandLockup = () => (
  <div className="brand-lockup" aria-label="Akaun Master">
    <span className="brand-symbol">A</span>
    <span>
      <span className="brand-name block">Akaun Master</span>
      <span className="brand-caption block">Latihan Perakaunan</span>
    </span>
  </div>
);

const shuffleArray = <T,>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
};

const preventArrowKeys = (e: React.KeyboardEvent) => {
    if (["ArrowUp", "ArrowDown"].includes(e.key)) {
        e.preventDefault();
    }
};

const preventWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    e.currentTarget.blur();
};

const getCardClass = (isPenalty?: boolean) => {
    return `drill-card ${isPenalty ? 'is-penalty' : ''}`;
};

// -- Leaderboard Component --
const LeaderboardView: React.FC<{ onBack: () => void; currentLevelId: string }> = ({ onBack, currentLevelId }) => {
  const [scores, setScores] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(currentLevelId);

  useEffect(() => {
    getScores().then((data) => {
      setScores(data);
      setLoading(false);
    });
  }, []);

  const displayScores = scores
    .filter((s) => filter === 'ALL' || s.levelId === filter)
    .sort((a, b) => b.score - a.score || a.time - b.time);

  const levels = ['ALL', '1', 'DRILL-PHR', 'DRILL-SN', 'DRILL-ACC-L1', 'DRILL-ACC-L2', 'DRILL-HL', 'DRILL-LOAN', 'DRILL-DISP-L1', 'DRILL-DISP-L2', 'DRILL-TPM'];
  const levelLabels: Record<string, string> = {
    ALL: 'Semua Latihan',
    '1': 'Akaun Perdagangan',
    'DRILL-PHR': 'Peruntukan Hutang Ragu',
    'DRILL-SN': 'Susut Nilai',
    'DRILL-ACC-L1': 'Pelarasan Asas',
    'DRILL-ACC-L2': 'Pelarasan Bertempoh',
    'DRILL-HL': 'Hutang Lapuk',
    'DRILL-LOAN': 'Pinjaman',
    'DRILL-DISP-L1': 'Pelupusan Aset · Asas',
    'DRILL-DISP-L2': 'Pelupusan Aset · Lanjutan',
    'DRILL-TPM': 'Titik Pulang Modal',
  };

  return (
    <div className="app-background min-h-screen p-4 sm:p-8 flex flex-col items-center">
      <div className="max-w-6xl w-full mb-6"><BrandLockup /></div>
      <div className="max-w-6xl w-full bg-white/90 rounded-[1.5rem] shadow-[0_24px_65px_rgba(23,50,77,0.12)] overflow-hidden border border-slate-200/80 flex flex-col min-h-[72vh]">
        <div className="p-5 sm:p-7 border-b border-slate-200 bg-[#f8faf9] flex flex-col sm:flex-row justify-between gap-5 items-start">
          <div>
            <span className="eyebrow">Prestasi Pembelajaran</span>
            <h2 className="text-3xl text-[#0f2942] font-serif font-normal mt-2 mb-4">Papan Kedudukan</h2>
            <div className="flex flex-wrap gap-2">
                {levels.map(l => (
                    <button
                        key={l}
                        onClick={() => setFilter(l)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                            filter === l 
                            ? 'bg-blue-600 text-white shadow-md' 
                            : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                        {levelLabels[l] ?? 'Latihan Lain'}
                    </button>
                ))}
            </div>
          </div>
          <Button onClick={onBack} variant="secondary">返回主页</Button>
        </div>

        <div className="flex-1 overflow-auto bg-slate-50/50">
            {loading ? (
                <div className="flex items-center justify-center h-full text-slate-500">正在加载记录…</div>
            ) : displayScores.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-400 italic">这个练习还没有记录。</div>
            ) : (
                <table className="w-full text-left border-collapse">
                    <thead className="bg-white sticky top-0 shadow-sm z-10 text-xs uppercase text-slate-500 tracking-wider">
                        <tr>
                            <th className="p-4 border-b">Kedudukan</th>
                            <th className="p-4 border-b">Pelajar</th>
                            <th className="p-4 border-b">Latihan</th>
                            <th className="p-4 border-b text-right">Skor</th>
                            <th className="p-4 border-b text-right">Masa</th>
                            <th className="p-4 border-b text-right">Tarikh</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                        {displayScores.map((entry, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 w-16 text-center font-bold text-slate-400">
                                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                                </td>
                                <td className="p-4 font-semibold text-slate-700">{entry.name}</td>
                                <td className="p-4 text-xs font-mono text-slate-500">{levelLabels[entry.levelId] ?? 'Latihan Lain'}</td>
                                <td className="p-4 text-right font-bold text-indigo-600 text-lg">{entry.score}</td>
                                <td className="p-4 text-right font-mono text-slate-600">{formatTime(entry.time)}</td>
                                <td className="p-4 text-right text-xs text-slate-400">
                                    {new Date(entry.timestamp).toLocaleDateString('zh-CN')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>(ScreenState.WELCOME);
  const [userName, setUserName] = useState('');
  const [selectedLevelId, setSelectedLevelId] = useState<string>('1');
  
  // Game State
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [score, setScore] = useState(0); // New Score State
  
  const [bankItems, setBankItems] = useState<GameItem[]>([]);
  const [placedItems, setPlacedItems] = useState<Record<string, GameItem[]>>({}); // Key: zoneId
  const [selectedBankItem, setSelectedBankItem] = useState<GameItem | null>(null);
  
  // Feedback state
  const [incorrectZoneId, setIncorrectZoneId] = useState<string | null>(null);

  // --- DRILL STATE ---
  const [drillQueue, setDrillQueue] = useState<DrillQuestion[]>([]);
  const [snQueue, setSnQueue] = useState<DrillSnQuestion[]>([]);
  const [accrualQueue, setAccrualQueue] = useState<DrillAccrualQuestion[]>([]); 
  const [badDebtQueue, setBadDebtQueue] = useState<DrillBadDebtQuestion[]>([]); 
  const [loanQueue, setLoanQueue] = useState<DrillLoanQuestion[]>([]); 
  const [disposalQueue, setDisposalQueue] = useState<DrillDisposalQuestion[]>([]); 
  const [tpmQueue, setTpmQueue] = useState<DrillTpmQuestion[]>([]); // New TPM Queue

  const [currentDrillIndex, setCurrentDrillIndex] = useState(0);
  
  // PHR Inputs
  const [drillAnswerPhr, setDrillAnswerPhr] = useState<string>('');
  const [drillAnswerAmt, setDrillAnswerAmt] = useState<string>('');
  const [drillPlacedCategory, setDrillPlacedCategory] = useState<'BELANJA' | 'HASIL' | null>(null);
  
  // SN Inputs
  const [snAnswerExpense, setSnAnswerExpense] = useState<string>('');
  const [snAnswerSnt, setSnAnswerSnt] = useState<string>('');
  const [snPlacedCategory, setSnPlacedCategory] = useState<'BELANJA' | 'HASIL' | null>(null);

  // Accrual Inputs
  const [accrualTypeSelection, setAccrualTypeSelection] = useState<string | null>(null); 
  const [accrualCategorySelection, setAccrualCategorySelection] = useState<string | null>(null); // New: AS or LS
  const [accrualPkkAmount, setAccrualPkkAmount] = useState<string>('');
  const [accrualFinalAmount, setAccrualFinalAmount] = useState<string>('');

  // Bad Debt Inputs (NEW STRUCTURE)
  const [badDebtTypeSelection, setBadDebtTypeSelection] = useState<'BAD_DEBT' | 'BAD_DEBT_RECOVERED' | null>(null);
  const [badDebtCategorySelection, setBadDebtCategorySelection] = useState<'BELANJA' | 'HASIL' | null>(null);
  const [badDebtUrAmount, setBadDebtUrAmount] = useState<string>(''); // Amount recorded in Untung Rugi
  const [badDebtAbtAmount, setBadDebtAbtAmount] = useState<string>(''); // New Input for ABT
  const [badDebtBankAmount, setBadDebtBankAmount] = useState<string>(''); // New Input for Bank

  // Loan Inputs
  const [loanInterestAmount, setLoanInterestAmount] = useState<string>('');
  const [loanAdjustmentType, setLoanAdjustmentType] = useState<'BELUM_BAYAR' | 'PRABAYAR' | null>(null); // New State
  const [loanAccruedAmount, setLoanAccruedAmount] = useState<string>(''); // Input for Adjustment Amount
  const [loanLsAmount, setLoanLsAmount] = useState<string>(''); // Current Liability (Principal)
  const [loanLbsAmount, setLoanLbsAmount] = useState<string>(''); // Non-Current Liability (Principal)

  // Disposal Inputs
  const [disposalSnExpense, setDisposalSnExpense] = useState<string>(''); // Q1
  const [disposalSnExpenseUnsold, setDisposalSnExpenseUnsold] = useState<string>(''); // Q1 (L2)
  const [disposalTotalSnt, setDisposalTotalSnt] = useState<string>(''); // Q2
  const [disposalTotalSntUnsold, setDisposalTotalSntUnsold] = useState<string>(''); // Q2 (L2)
  const [disposalBookValue, setDisposalBookValue] = useState<string>(''); // Q3
  const [disposalModeSelection, setDisposalModeSelection] = useState<'BANK' | 'TUNAI' | null>(null); // Q4
  const [disposalGainLossType, setDisposalGainLossType] = useState<'UNTUNG' | 'RUGI' | null>(null); // Q5
  const [disposalGainLossAmount, setDisposalGainLossAmount] = useState<string>(''); // Q5
  const [disposalFinalCost, setDisposalFinalCost] = useState<string>(''); // Q6
  const [disposalFinalSnt, setDisposalFinalSnt] = useState<string>(''); // Q6

  // TPM Inputs
  const [tpmA, setTpmA] = useState<string>('');
  const [tpmB, setTpmB] = useState<string>('');
  const [tpmC, setTpmC] = useState<string>('');
  const [tpmD, setTpmD] = useState<string>('');
  const [tpmE, setTpmE] = useState<string>('');
  const [tpmF, setTpmF] = useState<string>('');

  const [drillFeedback, setDrillFeedback] = useState<{isCorrect: boolean; message: string} | null>(null);


  // Mobile/Touch State
  const dragItemRef = useRef<GameItem | null>(null);
  const dragSourceRef = useRef<'bank' | 'zone' | null>(null);
  const dragSourceZoneIdRef = useRef<string | undefined>(undefined);
  const ghostRef = useRef<HTMLDivElement | null>(null);
  const touchStartXRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);

  // Initialization
  useEffect(() => {
    let interval: any;
    if (isTimerRunning) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const initializeGame = (levelId: string) => {
    setSelectedLevelId(levelId);
    const level = LEVELS[levelId];
    
    // Create game instances from definition
    const items: GameItem[] = level.items.map((def, idx) => ({
      id: `item-${idx}-${def.id}-${Date.now()}`,
      label: def.label,
      originalId: def.id,
      category: def.category
    }))
    .sort(() => Math.random() - 0.5);

    setBankItems(items);
    setPlacedItems({});
    setSelectedBankItem(null);
    setTimer(0);
    setMistakes(0);
    setScore(0);
    setIsTimerRunning(true);
    setCurrentScreen(ScreenState.GAME);
  };

  const initializeDrillPhr = () => {
    const questions: DrillQuestion[] = [];
    for(let i=0; i<10; i++) questions.push(generatePhrQuestion());
    setDrillQueue(questions);
    resetDrillState(ScreenState.DRILL_PHR);
  };

  const initializeDrillSn = () => {
    const questions: DrillSnQuestion[] = [];
    for(let i=0; i<10; i++) questions.push(generateSnQuestion());
    setSnQueue(questions);
    resetDrillState(ScreenState.DRILL_SN);
  };

  const initializeDrillAccrualsL1 = () => {
      const shuffled = shuffleArray(ACCRUALS_L1_QUESTIONS);
      setAccrualQueue(shuffled);
      resetDrillState(ScreenState.DRILL_ACCRUALS_L1);
  };

  const initializeDrillAccrualsL2 = () => {
      const shuffled = shuffleArray(ACCRUALS_L2_QUESTIONS);
      setAccrualQueue(shuffled);
      resetDrillState(ScreenState.DRILL_ACCRUALS_L2);
  };

  const initializeDrillBadDebts = () => {
      const questions: DrillBadDebtQuestion[] = [];
      for(let i=0; i<10; i++) questions.push(generateBadDebtQuestion());
      setBadDebtQueue(questions);
      resetDrillState(ScreenState.DRILL_BAD_DEBTS);
  };

  const initializeDrillLoans = () => {
      const questions: DrillLoanQuestion[] = [];
      // 4 New Loans (< 1 year)
      for(let i=0; i<4; i++) questions.push(generateLoanQuestion(true));
      // 6 Old Loans (> 1 year)
      for(let i=0; i<6; i++) questions.push(generateLoanQuestion(false));
      
      const shuffled = shuffleArray(questions);
      setLoanQueue(shuffled);
      resetDrillState(ScreenState.DRILL_LOAN);
  };

  const initializeDrillDisposal = (level: 1 | 2) => {
      const questions: DrillDisposalQuestion[] = [];
      for(let i=0; i<5; i++) questions.push(generateDisposalQuestion(level));
      setDisposalQueue(questions);
      resetDrillState(level === 1 ? ScreenState.DRILL_DISPOSAL_L1 : ScreenState.DRILL_DISPOSAL_L2);
  };

  const initializeDrillTpm = () => {
      const questions: DrillTpmQuestion[] = [];
      for(let i=0; i<10; i++) questions.push(generateTpmQuestion());
      setTpmQueue(questions);
      resetDrillState(ScreenState.DRILL_TPM);
  };

  const resetDrillState = (screen: ScreenState) => {
    setCurrentDrillIndex(0);
    // PHR
    setDrillAnswerPhr('');
    setDrillAnswerAmt('');
    setDrillPlacedCategory(null);
    // SN
    setSnAnswerExpense('');
    setSnAnswerSnt('');
    setSnPlacedCategory(null);
    // Accruals
    setAccrualTypeSelection(null);
    setAccrualCategorySelection(null);
    setAccrualPkkAmount('');
    setAccrualFinalAmount('');
    // Bad Debt
    setBadDebtTypeSelection(null);
    setBadDebtCategorySelection(null);
    setBadDebtUrAmount('');
    setBadDebtAbtAmount('');
    setBadDebtBankAmount('');
    // Loan
    setLoanInterestAmount('');
    setLoanAccruedAmount('');
    setLoanAdjustmentType(null);
    setLoanLsAmount('');
    setLoanLbsAmount('');
    // Disposal
    setDisposalSnExpense('');
    setDisposalSnExpenseUnsold('');
    setDisposalTotalSnt('');
    setDisposalTotalSntUnsold('');
    setDisposalBookValue('');
    setDisposalModeSelection(null);
    setDisposalGainLossType(null);
    setDisposalGainLossAmount('');
    setDisposalFinalCost('');
    setDisposalFinalSnt('');
    // TPM
    setTpmA('');
    setTpmB('');
    setTpmC('');
    setTpmD('');
    setTpmE('');
    setTpmF('');
    
    setDrillFeedback(null);
    setMistakes(0);
    setScore(0);
    setTimer(0);
    setIsTimerRunning(true);
    setCurrentScreen(screen);
  }

  // --- DRILL SUBMISSION HANDLERS ---

  // --- DRILL LOGIC (TPM) ---
  const handleTpmSubmit = () => {
      const q = tpmQueue[currentDrillIndex];
      const valA = parseFloat(tpmA);
      const valB = parseFloat(tpmB);
      const valC = parseFloat(tpmC);
      const valD = parseFloat(tpmD);
      const valE = parseFloat(tpmE);
      const valF = parseFloat(tpmF);

      // Validation tolerance allowing for standard inputs (e.g. 2.50 vs 2.5)
      // parseFloat automatically handles "2.50" as 2.5
      // 0.05 tolerance is safe for currency inputs to account for floating point noise
      const isACorrect = Math.abs(valA - q.ansKosTetap) < 0.05;
      const isBCorrect = Math.abs(valB - q.ansKosBerubahSeunit) < 0.05;
      const isCCorrect = Math.abs(valC - q.ansMarginCaruman) < 0.05;
      const isDCorrect = Math.abs(valD - q.ansTpmUnit) < 1.0; 
      const isECorrect = Math.abs(valE - q.ansTpmRm) < 1.0;
      const isFCorrect = Math.abs(valF - q.ansQf) < 1.0;

      if (isACorrect && isBCorrect && isCCorrect && isDCorrect && isECorrect && isFCorrect) {
          setScore(s => s + (q.isPenalty ? 1 : 2));
          setDrillFeedback({ isCorrect: true, message: "做得好，全部答案正确。" });
      } else {
          setMistakes(m => m + 1);
          setScore(s => s - 1);
          setDrillFeedback({ isCorrect: false, message: q.explanation });
          
          // Penalty
          const penaltyQ1 = { ...generateTpmQuestion(), isPenalty: true };
          const penaltyQ2 = { ...generateTpmQuestion(), isPenalty: true };
          setTpmQueue(prev => [...prev, penaltyQ1, penaltyQ2]);
      }
  };

  const handleDrillSubmit = () => {
     const q = drillQueue[currentDrillIndex];
     const inputPhr = parseFloat(drillAnswerPhr);
     const inputAmt = parseFloat(drillAnswerAmt);

     const isPhrCorrect = Math.abs(inputPhr - q.correctNewPhr) < 0.01;
     const isCatCorrect = drillPlacedCategory === q.correctCategory;
     const isAmtCorrect = Math.abs(inputAmt - q.correctAdjustmentAmount) < 0.01;

     if (isPhrCorrect && isCatCorrect && isAmtCorrect) {
         setScore(s => s + (q.isPenalty ? 1 : 2));
         setDrillFeedback({ isCorrect: true, message: "做得好，答案正确。" });
     } else {
         setMistakes(m => m + 1);
         setScore(s => s - 1);
         const explanation = `
            1. PHR baharu: RM${formatMoney(q.abt)} × ${q.rate}% = RM${formatMoney(q.correctNewPhr)}.
            2. Pelarasan: RM${formatMoney(q.correctNewPhr)} - RM${formatMoney(q.oldPhr)} = ${q.correctNewPhr - q.oldPhr < 0 ? '-' : ''}RM${formatMoney(Math.abs(q.correctNewPhr - q.oldPhr))}.
            3. PHR ${q.correctNewPhr > q.oldPhr ? 'meningkat, maka peningkatan itu ialah BELANJA' : 'menurun, maka pengurangan itu ialah HASIL'} sebanyak RM${formatMoney(q.correctAdjustmentAmount)}.
         `;
         setDrillFeedback({ isCorrect: false, message: explanation });
         const penaltyQ1 = { ...generatePhrQuestion(), isPenalty: true };
         const penaltyQ2 = { ...generatePhrQuestion(), isPenalty: true };
         setDrillQueue(prev => [...prev, penaltyQ1, penaltyQ2]);
     }
  };

  const handleSnSubmit = () => {
      const q = snQueue[currentDrillIndex];
      const inputExp = parseFloat(snAnswerExpense);
      const inputSnt = parseFloat(snAnswerSnt);

      const isExpCorrect = Math.abs(inputExp - q.correctSnExpense) < 0.01;
      const isCatCorrect = snPlacedCategory === q.correctCategory;
      const isSntCorrect = Math.abs(inputSnt - q.correctNewAccDep) < 0.01;

      if (isExpCorrect && isCatCorrect && isSntCorrect) {
          setScore(s => s + (q.isPenalty ? 1 : 2));
          setDrillFeedback({ isCorrect: true, message: "做得好，答案正确。" });
      } else {
          setMistakes(m => m + 1);
          setScore(s => s - 1);
          let methodText = "";
          if (q.methodType === 'STRAIGHT_LINE') methodText = `${q.cost} x ${q.rate}%`;
          else if (q.methodType === 'REDUCING_BALANCE') methodText = `(${q.cost} - ${q.oldAccDep}) x ${q.rate}%`;
          else methodText = `(${q.cost} - ${q.scrapValue}) / ${q.usefulLife}`;

          const explanation = `
             Pengiraan: ${methodText} = RM${formatMoney(q.correctSnExpense)}.
             Kategori sentiasa BELANJA.
             SNT akhir: RM${formatMoney(q.oldAccDep)} + RM${formatMoney(q.correctSnExpense)} = RM${formatMoney(q.correctNewAccDep)}.
          `;
          setDrillFeedback({ isCorrect: false, message: explanation });
          const penaltyQ1 = { ...generateSnQuestion(), isPenalty: true };
          const penaltyQ2 = { ...generateSnQuestion(), isPenalty: true };
          setSnQueue(prev => [...prev, penaltyQ1, penaltyQ2]);
      }
  };

  const handleAccrualSubmit = () => {
      const q = accrualQueue[currentDrillIndex];
      const inputPkkAmt = parseFloat(accrualPkkAmount);
      const inputFinalAmt = parseFloat(accrualFinalAmount);

      let isTypeCorrect = false;
      if (q.type === 'ACCRUED_EXP' && accrualTypeSelection === 'BELUM_BAYAR') isTypeCorrect = true;
      if (q.type === 'PREPAID_EXP' && accrualTypeSelection === 'PRABAYAR') isTypeCorrect = true;
      if (q.type === 'ACCRUED_REV' && accrualTypeSelection === 'BELUM_TERIMA') isTypeCorrect = true;
      if (q.type === 'UNEARNED_REV' && accrualTypeSelection === 'BELUM_TERPEROLEH') isTypeCorrect = true;

      const isCategoryCorrect = accrualCategorySelection === q.correctPkkCategory;
      const isPkkAmtCorrect = Math.abs(inputPkkAmt - q.correctPkkAmount) < 0.01;
      const isFinalAmtCorrect = Math.abs(inputFinalAmt - q.correctFinalAmount) < 0.01;

      if (isTypeCorrect && isCategoryCorrect && isPkkAmtCorrect && isFinalAmtCorrect) {
          setScore(s => s + (q.isPenalty ? 1 : 2));
          setDrillFeedback({ isCorrect: true, message: "做得好，答案正确。" });
      } else {
          setMistakes(m => m + 1);
          setScore(s => s - 1);
          let typeName = "";
          if (q.type === 'ACCRUED_EXP') typeName = "Belanja Belum Bayar";
          if (q.type === 'PREPAID_EXP') typeName = "Belanja Prabayar";
          if (q.type === 'ACCRUED_REV') typeName = "Hasil Belum Terima";
          if (q.type === 'UNEARNED_REV') typeName = "Hasil Belum Terperoleh";
          let catName = q.correctPkkCategory === 'AS' ? 'Aset Semasa' : 'Liabiliti Semasa';
          setDrillFeedback({ 
              isCorrect: false, 
              message: `Jenis: ${typeName} (${catName})\nAmaun Pelarasan: RM${q.correctPkkAmount}.\nAmaun Akhir: ${q.trialBalanceAmount} ${q.correctFinalAmount > q.trialBalanceAmount ? '+' : '-'} ${q.correctPkkAmount} = RM${q.correctFinalAmount}` 
          });
          const retry1 = {...q, id: q.id + '-retry1-' + Date.now(), isPenalty: true};
          const retry2 = {...q, id: q.id + '-retry2-' + Date.now(), isPenalty: true};
          setAccrualQueue(prev => [...prev, retry1, retry2]);
      }
  };

  const handleBadDebtSubmit = () => {
    const q = badDebtQueue[currentDrillIndex];
    const inputUrAmt = parseFloat(badDebtUrAmount); 
    const inputAbt = badDebtAbtAmount ? parseFloat(badDebtAbtAmount) : 0; 
    const inputBank = badDebtBankAmount ? parseFloat(badDebtBankAmount) : 0;

    const isTypeCorrect = badDebtTypeSelection === q.type;
    const isCatCorrect = badDebtCategorySelection === q.correctCategory;
    const isUrAmtCorrect = Math.abs(inputUrAmt - q.amount) < 0.01;

    let isPkkCorrect = false;
    if (q.type === 'BAD_DEBT') {
        isPkkCorrect = Math.abs(inputAbt - q.correctNewAbt) < 0.01;
    } else {
        isPkkCorrect = Math.abs(inputBank - q.correctNewBank) < 0.01;
    }

    if (isTypeCorrect && isCatCorrect && isUrAmtCorrect && isPkkCorrect) {
        setScore(s => s + (q.isPenalty ? 1 : 2));
        setDrillFeedback({ isCorrect: true, message: "做得好，答案正确。" });
    } else {
        setMistakes(m => m + 1);
        setScore(s => s - 1);
        let msg = "";
        if (q.type === 'BAD_DEBT') {
            msg = `Jenis: Hutang Lapuk (Belanja)\nRekod dalam UR: RM${q.amount}\nBaki ABT Baru (PKK) = RM${q.originalAbt} - RM${q.amount} = RM${q.correctNewAbt}`;
        } else {
            msg = `Jenis: Hutang Lapuk Terpulih (Hasil)\nRekod dalam UR: RM${q.amount}\nBaki Bank Baru (PKK) = RM${q.originalBank} + RM${q.amount} = RM${q.correctNewBank}`;
        }
        setDrillFeedback({ isCorrect: false, message: msg });
        const penaltyQ1 = { ...generateBadDebtQuestion(), isPenalty: true };
        const penaltyQ2 = { ...generateBadDebtQuestion(), isPenalty: true };
        setBadDebtQueue(prev => [...prev, penaltyQ1, penaltyQ2]);
    }
  };

  const handleLoanSubmit = () => {
      const q = loanQueue[currentDrillIndex];
      const inputExp = parseFloat(loanInterestAmount);
      const inputAccrued = parseFloat(loanAccruedAmount);
      const inputLs = parseFloat(loanLsAmount);
      const inputLbs = parseFloat(loanLbsAmount);
      
      const isExpCorrect = Math.abs(inputExp - q.correctInterestExpense) < 0.01;
      const isAdjTypeCorrect = loanAdjustmentType === q.correctAdjustmentType;
      const isAdjAmountCorrect = Math.abs(inputAccrued - q.correctAccruedAmount) < 0.01;
      const isLsCorrect = Math.abs(inputLs - q.correctLs) < 0.01;
      const isLbsCorrect = Math.abs(inputLbs - q.correctLbs) < 0.01;
      
      if (isExpCorrect && isAdjTypeCorrect && isAdjAmountCorrect && isLsCorrect && isLbsCorrect) {
          setScore(s => s + (q.isPenalty ? 1 : 2));
          setDrillFeedback({ isCorrect: true, message: "做得好，答案正确。" });
      } else {
          setMistakes(m => m + 1);
          setScore(s => s - 1);
          const typeName = q.correctAdjustmentType === 'BELUM_BAYAR' ? "Faedah Belum Bayar" : "Faedah Prabayar";
          const typeReason = q.correctAdjustmentType === 'BELUM_BAYAR' 
              ? `Bayar (${q.tbInterestPaid}) < Belanja (${q.correctInterestExpense})` 
              : `Bayar (${q.tbInterestPaid}) > Belanja (${q.correctInterestExpense})`;
          const calculationFormula = q.isNewLoan 
             ? `RM${q.principal} x ${q.rate}% x ${q.monthsHeld}/12` 
             : `RM${q.principal} x ${q.rate}%`;
          const annualRepayment = q.principal / q.durationYears;
          const currentLiabilityReason = q.tbLoanBalance <= annualRepayment
              ? `Baki pinjaman RM${formatMoney(q.tbLoanBalance)} lebih rendah daripada ansuran setahun RM${formatMoney(annualRepayment)}. Oleh itu, seluruh baki ialah Liabiliti Semasa: RM${formatMoney(q.correctLs)}.`
              : `Ansuran setahun = RM${formatMoney(q.principal)} / ${q.durationYears} tahun = RM${formatMoney(q.correctLs)}.`;
          const msg = `
            1. Faedah (UR): ${calculationFormula} = RM${formatMoney(q.correctInterestExpense)}.
            2. Pelarasan Faedah: ${typeReason} -> ${typeName}.
               Amaun: Beza RM${formatMoney(q.correctInterestExpense)} dan RM${formatMoney(q.tbInterestPaid)} = RM${formatMoney(q.correctAccruedAmount)}.
            3. Liabiliti Semasa: ${currentLiabilityReason}
            4. Liabiliti Bukan Semasa: RM${formatMoney(q.tbLoanBalance)} - RM${formatMoney(q.correctLs)} = RM${formatMoney(q.correctLbs)}.
          `;
          setDrillFeedback({ isCorrect: false, message: msg });
          const penaltyQ1 = { ...generateLoanQuestion(q.isNewLoan), isPenalty: true };
          const penaltyQ2 = { ...generateLoanQuestion(q.isNewLoan), isPenalty: true };
          setLoanQueue(prev => [...prev, penaltyQ1, penaltyQ2]);
      }
  };

  const handleDisposalSubmit = () => {
      const q = disposalQueue[currentDrillIndex];
      const inputSnExp = parseFloat(disposalSnExpense);
      const inputSnt = parseFloat(disposalTotalSnt);
      const inputBv = parseFloat(disposalBookValue);
      const inputGainLossAmount = parseFloat(disposalGainLossAmount);
      const inputFinalCost = parseFloat(disposalFinalCost);
      const inputFinalSnt = parseFloat(disposalFinalSnt);

      const isSnCorrect = Math.abs(inputSnExp - q.correctSnExpenseSold) < 0.01;
      const isSntCorrect = Math.abs(inputSnt - q.correctSoldTotalSnt) < 0.01;
      const isBvCorrect = Math.abs(inputBv - q.correctBookValue) < 0.01;
      const isModeCorrect = disposalModeSelection === q.paymentMode;
      const isTypeCorrect = disposalGainLossType === q.correctGainLossType;
      const isAmountCorrect = Math.abs(inputGainLossAmount - q.correctGainLossAmount) < 0.01;
      const isFinalCostCorrect = Math.abs(inputFinalCost - q.correctFinalAssetCost) < 0.01;
      const isFinalSntCorrect = Math.abs(inputFinalSnt - q.correctFinalAccDep) < 0.01;
      
      let isL2Correct = true;
      if (q.level === 2) {
          const inputSnExpUnsold = parseFloat(disposalSnExpenseUnsold);
          const inputSntUnsold = parseFloat(disposalTotalSntUnsold);
          if (Math.abs(inputSnExpUnsold - q.correctSnExpenseUnsold) > 0.01) isL2Correct = false;
          if (Math.abs(inputSntUnsold - q.correctUnsoldTotalSnt) > 0.01) isL2Correct = false;
      }
      
      if (isSnCorrect && isSntCorrect && isBvCorrect && isModeCorrect && isTypeCorrect && isAmountCorrect && isFinalCostCorrect && isFinalSntCorrect && isL2Correct) {
          setScore(s => s + (q.isPenalty ? 1 : 2));
          setDrillFeedback({ isCorrect: true, message: "做得好，答案正确。" });
      } else {
          setMistakes(m => m + 1);
          setScore(s => s - 1);
          const msg = `
            1. Belanja Susut Nilai:
               ${q.q1Explanation}
            2. Jumlah Susut Nilai Terkumpul:
               ${q.q2Explanation}
            3. Nilai Buku: RM${q.soldCost} - RM${q.correctSoldTotalSnt} = RM${q.correctBookValue}.
            4. Kaedah penerimaan: ${q.paymentMode === 'BANK' ? 'Bank — wang dibankkan' : 'Tunai — wang diterima secara tunai'}.
            5. ${q.correctGainLossType}: RM${q.disposalValue} (Harga Jual) vs RM${q.correctBookValue} (Nilai Buku). Beza: RM${q.correctGainLossAmount}.
            6. PKK (Akhir):
               Aset: RM${q.tbTotalCost} - RM${q.soldCost} = RM${q.correctFinalAssetCost}.
               SNT: Baki Unit Belum Dijual (SNT Awal + SN Semasa) = RM${q.correctFinalAccDep}.
          `;
          setDrillFeedback({ isCorrect: false, message: msg });
          const penaltyQ1 = { ...generateDisposalQuestion(q.level), isPenalty: true };
          const penaltyQ2 = { ...generateDisposalQuestion(q.level), isPenalty: true };
          setDisposalQueue(prev => [...prev, penaltyQ1, penaltyQ2]);
      }
  };

  const handleGameWin = (levelIdStr: string) => {
    setIsTimerRunning(false);
    let levelName = levelIdStr;
    if (currentScreen === ScreenState.DRILL_PHR) levelName = 'DRILL-PHR';
    if (currentScreen === ScreenState.DRILL_SN) levelName = 'DRILL-SN';
    if (currentScreen === ScreenState.DRILL_ACCRUALS_L1) levelName = 'DRILL-ACC-L1';
    if (currentScreen === ScreenState.DRILL_ACCRUALS_L2) levelName = 'DRILL-ACC-L2';
    if (currentScreen === ScreenState.DRILL_BAD_DEBTS) levelName = 'DRILL-HL';
    if (currentScreen === ScreenState.DRILL_LOAN) levelName = 'DRILL-LOAN';
    if (currentScreen === ScreenState.DRILL_DISPOSAL_L1) levelName = 'DRILL-DISP-L1';
    if (currentScreen === ScreenState.DRILL_DISPOSAL_L2) levelName = 'DRILL-DISP-L2';
    if (currentScreen === ScreenState.DRILL_TPM) levelName = 'DRILL-TPM';

    setSelectedLevelId(levelName);

    const entry: LeaderboardEntry = {
        name: userName,
        levelId: levelName,
        score: score, 
        time: timer,
        timestamp: Date.now()
    };
    saveScore(entry);
    setCurrentScreen(ScreenState.LEADERBOARD);
  };

  // --- WELCOME SCREEN ---
  if (currentScreen === ScreenState.WELCOME) {
      return (
          <div className="app-background">
              <main className="welcome-layout">
                  <section>
                      <BrandLockup />
                      <div className="mt-12">
                          <span className="eyebrow">Belajar dengan Lebih Teratur</span>
                          <h1 className="hero-title">Kuasai Perakaunan,<br/><em>Selangkah demi Selangkah</em>.</h1>
                          <p className="hero-copy">
                              通过专题练习、即时反馈与清晰解析，逐步建立扎实的会计基础。
                          </p>
                          <div className="feature-strip" aria-label="主要功能">
                              <span className="feature-chip"><span className="feature-dot"/>9 个练习主题</span>
                              <span className="feature-chip"><span className="feature-dot"/>即时答题反馈</span>
                              <span className="feature-chip"><span className="feature-dot"/>练习成绩记录</span>
                          </div>
                      </div>
                  </section>

                  <section className="welcome-panel">
                      <span className="panel-kicker">开始学习</span>
                      <h2 className="panel-title">Selamat Datang</h2>
                      <p className="panel-copy">输入姓名，以便保存练习得分和用时。</p>
                      <label className="field-label" htmlFor="student-name">学生姓名</label>
                      <input
                          id="student-name"
                          type="text"
                          className="premium-input mb-5"
                          placeholder="例如：小明"
                          value={userName}
                          autoComplete="name"
                          autoFocus
                          onChange={(e) => setUserName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && userName.trim() && setCurrentScreen(ScreenState.MENU)}
                      />
                      <Button 
                          onClick={() => setCurrentScreen(ScreenState.MENU)} 
                          disabled={!userName.trim()}
                          className="w-full py-3.5"
                      >
                          进入练习 <span aria-hidden="true">→</span>
                      </Button>
                      <p className="privacy-note"><span aria-hidden="true">●</span> 姓名仅用于显示你的练习记录。</p>
                  </section>
              </main>
          </div>
      );
  }

  // --- GENERIC RENDER for PHR/SN/Accruals/Loan/Disposal/TPM needs to show score ---
  if ([ScreenState.DRILL_PHR, ScreenState.DRILL_SN, ScreenState.DRILL_ACCRUALS_L1, ScreenState.DRILL_ACCRUALS_L2, ScreenState.DRILL_LOAN, ScreenState.DRILL_DISPOSAL_L1, ScreenState.DRILL_DISPOSAL_L2, ScreenState.DRILL_TPM, ScreenState.DRILL_BAD_DEBTS].includes(currentScreen)) {
      const getActiveQueue = () => {
          if (currentScreen === ScreenState.DRILL_PHR) return drillQueue;
          if (currentScreen === ScreenState.DRILL_SN) return snQueue;
          if (currentScreen === ScreenState.DRILL_LOAN) return loanQueue;
          if (currentScreen === ScreenState.DRILL_DISPOSAL_L1 || currentScreen === ScreenState.DRILL_DISPOSAL_L2) return disposalQueue;
          if (currentScreen === ScreenState.DRILL_TPM) return tpmQueue;
          if (currentScreen === ScreenState.DRILL_BAD_DEBTS) return badDebtQueue;
          return accrualQueue;
      }
      const queue = getActiveQueue();
      const q = queue[currentDrillIndex] as any; // simplified casting
      const progress = Math.round(((currentDrillIndex + 1) / queue.length) * 100);
      const drillTitles: Partial<Record<ScreenState, string>> = {
          [ScreenState.DRILL_PHR]: 'Peruntukan Hutang Ragu',
          [ScreenState.DRILL_SN]: 'Susut Nilai',
          [ScreenState.DRILL_ACCRUALS_L1]: 'Pelarasan Asas',
          [ScreenState.DRILL_ACCRUALS_L2]: 'Pelarasan Bertempoh',
          [ScreenState.DRILL_BAD_DEBTS]: 'Hutang Lapuk',
          [ScreenState.DRILL_LOAN]: '借款',
          [ScreenState.DRILL_DISPOSAL_L1]: 'Pelupusan Aset · Asas',
          [ScreenState.DRILL_DISPOSAL_L2]: 'Pelupusan Aset · Lanjutan',
          [ScreenState.DRILL_TPM]: 'Titik Pulang Modal',
      };
      const drillTitle = drillTitles[currentScreen] || 'Latihan Topikal';

      const renderFeedbackInline = () => {
          if (!drillFeedback) return null;
          return (
              <div className={`feedback-card ${drillFeedback.isCorrect ? 'correct' : 'incorrect'} animate-in fade-in slide-in-from-top-2 duration-300`}>
                  <div className="flex items-center gap-2 mb-2">
                      <div className={`text-xl ${drillFeedback.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                          {drillFeedback.isCorrect ? '✓' : '✗'}
                      </div>
                      <h3 className={`font-bold text-lg ${drillFeedback.isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                          {drillFeedback.isCorrect ? 'Jawapan Tepat!' : 'Jawapan Salah'}
                      </h3>
                  </div>
                  <div className="text-slate-700 whitespace-pre-line leading-relaxed mb-4 text-sm font-medium">
                      {drillFeedback.message}
                  </div>
                  <Button 
                      onClick={() => {
                          setDrillFeedback(null);
                          if (currentDrillIndex < queue.length - 1) {
                              setCurrentDrillIndex(i => i + 1);
                              // Reset inputs based on screen
                              if (currentScreen === ScreenState.DRILL_PHR) { setDrillAnswerPhr(''); setDrillAnswerAmt(''); setDrillPlacedCategory(null); }
                              if (currentScreen === ScreenState.DRILL_SN) { setSnAnswerExpense(''); setSnAnswerSnt(''); setSnPlacedCategory(null); }
                              if (currentScreen === ScreenState.DRILL_ACCRUALS_L1 || currentScreen === ScreenState.DRILL_ACCRUALS_L2) { setAccrualTypeSelection(null); setAccrualCategorySelection(null); setAccrualPkkAmount(''); setAccrualFinalAmount(''); }
                              if (currentScreen === ScreenState.DRILL_BAD_DEBTS) { setBadDebtTypeSelection(null); setBadDebtCategorySelection(null); setBadDebtUrAmount(''); setBadDebtAbtAmount(''); setBadDebtBankAmount(''); }
                              if (currentScreen === ScreenState.DRILL_LOAN) { setLoanInterestAmount(''); setLoanAccruedAmount(''); setLoanLsAmount(''); setLoanLbsAmount(''); setLoanAdjustmentType(null); }
                              if (currentScreen === ScreenState.DRILL_DISPOSAL_L1 || currentScreen === ScreenState.DRILL_DISPOSAL_L2) {
                                  setDisposalSnExpense(''); setDisposalSnExpenseUnsold(''); setDisposalTotalSnt(''); setDisposalTotalSntUnsold(''); 
                                  setDisposalBookValue(''); setDisposalModeSelection(null); setDisposalGainLossType(null); setDisposalGainLossAmount(''); 
                                  setDisposalFinalCost(''); setDisposalFinalSnt('');
                              }
                              if (currentScreen === ScreenState.DRILL_TPM) {
                                  setTpmA(''); setTpmB(''); setTpmC(''); setTpmD(''); setTpmE(''); setTpmF('');
                              }
                          } else {
                              handleGameWin(selectedLevelId);
                          }
                      }} 
                      className="w-full"
                  >
                      {currentDrillIndex < queue.length - 1 ? '下一题' : '完成练习'}
                  </Button>
              </div>
          );
      };

      // Helper for render content based on screen...
      return (
          <div className="app-background">
              <div className="drill-shell">
                  <div className="drill-topbar">
                      <BrandLockup />
                      <div className="drill-nav-actions">
                          <button className="icon-button" onClick={() => setCurrentScreen(ScreenState.MENU)} aria-label="返回主页" title="返回主页">←</button>
                          <div className="score-pill">得分&nbsp; {score}</div>
                      </div>
                  </div>
                  <div className="drill-meta">
                      <div>
                          <span className="eyebrow">Latihan Topikal</span>
                          <h1>{drillTitle}</h1>
                      </div>
                      <div className="flex items-center gap-3">
                          <div className="drill-counter">第 {currentDrillIndex + 1} 题 / 共 {queue.length} 题</div>
                          {q.isPenalty && (
                              <span className="bg-red-500 text-white text-[10px] uppercase font-bold px-2 py-1 rounded animate-pulse">
                                  复习题
                              </span>
                          )}
                      </div>
                  </div>
                  <div className="progress-track" aria-label={`练习进度 ${progress}%`}>
                      <div className="progress-fill" style={{width: `${progress}%`}}></div>
                  </div>

                  {/* Question Card */}
                  <div className={getCardClass(q.isPenalty)}>
                        
                        {/* --- CONTENT SWITCHER --- */}
                        
                        {currentScreen === ScreenState.DRILL_TPM && (
                            <>
                                <div className="mb-6">
                                    <h3 className="text-lg font-bold border-b border-black inline-block mb-4">{q.title}</h3>
                                    <p className="text-sm text-slate-600 mb-2">{q.description}</p>
                                    
                                    {/* Data Visualization */}
                                    <div className="question-ledger ledger-amber font-mono text-sm overflow-x-auto">
                                        {q.scenarioType === 'LIST' ? (
                                            <div className="grid grid-cols-2 gap-2 max-w-xs">
                                                {q.data.map((item: any, idx: number) => (
                                                    <React.Fragment key={idx}>
                                                        <span>{item.label}</span>
                                                        <span className="text-right font-bold">
                                                            {item.isPrice ? 'RM ' : ''}{item.val.toFixed(2)}{item.isUnit ? '/unit' : ''}
                                                        </span>
                                                    </React.Fragment>
                                                ))}
                                            </div>
                                        ) : (
                                            <table className="w-full text-left text-xs">
                                                <thead>
                                                    <tr className="border-b border-yellow-300">
                                                        <th className="py-1">Unit Pengeluaran</th>
                                                        <th className="py-1 text-right">Jumlah Kos (RM)</th>
                                                        <th className="py-1 text-right">Jumlah Hasil (RM)</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {q.data.map((row: any, idx: number) => (
                                                        <tr key={idx} className="border-b border-yellow-100 last:border-0">
                                                            <td className="py-1">{row.unit}</td>
                                                            <td className="py-1 text-right">{row.cost}</td>
                                                            <td className="py-1 text-right">{row.revenue}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {/* Inputs a,b,c,d,e */}
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500">a) Kos Tetap (RM)</label>
                                            <input type="number" onKeyDown={preventArrowKeys} onWheel={preventWheel} className="border rounded p-1 w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={tpmA} onChange={e=>setTpmA(e.target.value)} disabled={!!drillFeedback} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500">b) Kos Berubah Seunit (RM)</label>
                                            <input type="number" onKeyDown={preventArrowKeys} onWheel={preventWheel} className="border rounded p-1 w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={tpmB} onChange={e=>setTpmB(e.target.value)} disabled={!!drillFeedback} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500">c) Margin Caruman Seunit (RM)</label>
                                            <input type="number" onKeyDown={preventArrowKeys} onWheel={preventWheel} className="border rounded p-1 w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={tpmC} onChange={e=>setTpmC(e.target.value)} disabled={!!drillFeedback} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500">d) Titik Pulang Modal (Unit)</label>
                                            <input type="number" onKeyDown={preventArrowKeys} onWheel={preventWheel} className="border rounded p-1 w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={tpmD} onChange={e=>setTpmD(e.target.value)} disabled={!!drillFeedback} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500">e) Titik Pulang Modal (RM)</label>
                                            <input type="number" onKeyDown={preventArrowKeys} onWheel={preventWheel} className="border rounded p-1 w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={tpmE} onChange={e=>setTpmE(e.target.value)} disabled={!!drillFeedback} />
                                        </div>
                                    </div>
                                    
                                    {/* Question F - Dynamic Label */}
                                    <div className="bg-blue-50 p-3 rounded border border-blue-200">
                                        <label className="block text-xs font-bold text-blue-800 mb-1">
                                            f) {q.qfType === 'FIND_UNIT' 
                                                ? `Berapakah unit yang perlu dijual untuk mendapat untung sasaran RM ${q.qfTargetValue}?` 
                                                : `Berapakah keuntungan yang diperoleh jika unit yang dikeluarkan ialah ${q.qfTargetValue}?`
                                            }
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-blue-600">答案：</span>
                                            <input type="number" onKeyDown={preventArrowKeys} onWheel={preventWheel} className="border border-blue-300 rounded p-1 w-32 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={tpmF} onChange={e=>setTpmF(e.target.value)} disabled={!!drillFeedback} />
                                            <span className="text-xs text-slate-500">{q.qfType === 'FIND_UNIT' ? 'unit' : 'RM'}</span>
                                        </div>
                                    </div>

                                    {!drillFeedback && (
                                        <div className="pt-2 flex justify-end">
                                            <Button onClick={handleTpmSubmit} disabled={!tpmA || !tpmB || !tpmC || !tpmD || !tpmE || !tpmF}>提交答案</Button>
                                        </div>
                                    )}
                                    {renderFeedbackInline()}
                                </div>
                            </>
                        )}

                        {/* ... Existing drill renders (PHR, SN, etc.) ... */}
                        {currentScreen === ScreenState.DRILL_PHR && (
                            <>
                                {/* Content for PHR */}
                                <div className="mb-8">
                                    <h3 className="text-lg font-bold border-b border-black inline-block mb-4">Soalan Peruntukan Hutang Ragu</h3>
                                    <div className="question-ledger ledger-orange mb-4 font-mono text-sm">
                                        <div className="flex justify-between mb-2">
                                            <span>Akaun Belum Terima</span>
                                            <span className="font-bold">RM {formatMoney(q.abt)}</span>
                                        </div>
                                        {q.oldPhr > 0 && (
                                            <div className="flex justify-between text-slate-500">
                                                <span>Peruntukan Hutang Ragu</span>
                                                <span>RM {formatMoney(q.oldPhr)}</span>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-slate-800">
                                        Maklumat Tambahan: <br/>
                                        Peruntukan hutang ragu diselaraskan <strong>{q.rate}%</strong> atas Akaun Belum Terima bersih.
                                    </p>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">1. Peruntukan Hutang Ragu</label>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-lg">RM</span>
                                            <input type="number" onKeyDown={preventArrowKeys} onWheel={preventWheel} className="border-2 border-slate-300 rounded p-2 font-mono w-32 focus:border-blue-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={drillAnswerPhr} onChange={e => setDrillAnswerPhr(e.target.value)} disabled={!!drillFeedback} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">2. Kesan ke atas Untung Rugi</label>
                                        <div className="flex flex-wrap gap-4 items-center">
                                            <div className="flex gap-2">
                                                <button onClick={() => setDrillPlacedCategory('BELANJA')} className={`px-4 py-2 rounded border font-bold text-sm ${drillPlacedCategory === 'BELANJA' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`} disabled={!!drillFeedback}>BELANJA</button>
                                                <button onClick={() => setDrillPlacedCategory('HASIL')} className={`px-4 py-2 rounded border font-bold text-sm ${drillPlacedCategory === 'HASIL' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`} disabled={!!drillFeedback}>HASIL</button>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm">金额（RM）</span>
                                                <input type="number" onKeyDown={preventArrowKeys} onWheel={preventWheel} className="border-2 border-slate-300 rounded p-2 font-mono w-24 focus:border-blue-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={drillAnswerAmt} onChange={e => setDrillAnswerAmt(e.target.value)} disabled={!!drillFeedback} />
                                            </div>
                                        </div>
                                    </div>
                                    {!drillFeedback && (
                                        <div className="pt-6 flex justify-end">
                                            <Button onClick={handleDrillSubmit} disabled={!drillAnswerPhr || !drillAnswerAmt || !drillPlacedCategory}>提交答案</Button>
                                        </div>
                                    )}
                                    {renderFeedbackInline()}
                                </div>
                            </>
                        )}

                        {currentScreen === ScreenState.DRILL_SN && (
                             <>
                                <div className="mb-8">
                                    <h3 className="text-lg font-bold border-b border-black inline-block mb-4">Soalan Susut Nilai</h3>
                                    <div className="question-ledger ledger-blue mb-4 font-mono text-sm">
                                        <div className="flex justify-between mb-2">
                                            <span className="font-bold">{q.assetName} (Kos)</span>
                                            <span className="font-bold">RM {formatMoney(q.cost)}</span>
                                        </div>
                                        {q.oldAccDep > 0 && (
                                            <div className="flex justify-between text-slate-500">
                                                <span>Susut Nilai Terkumpul {q.assetName}</span>
                                                <span>RM {formatMoney(q.oldAccDep)}</span>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-slate-800">
                                        Maklumat Tambahan: <br/>
                                        {q.assetName} disusutnilaikan menggunakan kaedah <strong>{q.methodType === 'STRAIGHT_LINE' ? `Garis Lurus (${q.rate}%)` : q.methodType === 'REDUCING_BALANCE' ? `Baki Berkurangan (${q.rate}%)` : `Nilai Skrap`}</strong>.
                                    </p>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">1. Rekod dalam Untung Rugi</label>
                                        <div className="flex flex-wrap gap-4 items-center">
                                            <div className="flex gap-2">
                                                <button onClick={() => setSnPlacedCategory('BELANJA')} className={`px-4 py-2 rounded border font-bold text-sm ${snPlacedCategory === 'BELANJA' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`} disabled={!!drillFeedback}>BELANJA</button>
                                                <button onClick={() => setSnPlacedCategory('HASIL')} className={`px-4 py-2 rounded border font-bold text-sm ${snPlacedCategory === 'HASIL' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`} disabled={!!drillFeedback}>HASIL</button>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm">RM</span>
                                                <input type="number" onKeyDown={preventArrowKeys} onWheel={preventWheel} className="border-2 border-slate-300 rounded p-2 font-mono w-32 focus:border-blue-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={snAnswerExpense} onChange={e => setSnAnswerExpense(e.target.value)} disabled={!!drillFeedback} />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">2. Susut Nilai Terkumpul (PKK)</label>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-lg">RM</span>
                                            <input type="number" onKeyDown={preventArrowKeys} onWheel={preventWheel} className="border-2 border-slate-300 rounded p-2 font-mono w-32 focus:border-blue-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={snAnswerSnt} onChange={e => setSnAnswerSnt(e.target.value)} disabled={!!drillFeedback} />
                                            <span className="text-xs text-slate-400 italic ml-2">(SNT Terkumpul)</span>
                                        </div>
                                    </div>
                                    {!drillFeedback && (
                                        <div className="pt-6 flex justify-end">
                                            <Button onClick={handleSnSubmit} disabled={!snAnswerExpense || !snAnswerSnt || !snPlacedCategory}>提交答案</Button>
                                        </div>
                                    )}
                                    {renderFeedbackInline()}
                                </div>
                             </>
                        )}
                        
                        {(currentScreen === ScreenState.DRILL_ACCRUALS_L1 || currentScreen === ScreenState.DRILL_ACCRUALS_L2) && (
                            <>
                                <div className="mb-8">
                                    <h3 className="text-lg font-bold border-b border-black inline-block mb-4">{q.title || 'Soalan'} (Tahap {currentScreen === ScreenState.DRILL_ACCRUALS_L1 ? '1' : '2'})</h3>
                                    <div className="question-ledger ledger-purple mb-4 font-mono text-sm">
                                        <div className="flex justify-between mb-2">
                                            <span>{q.itemLabel} (Imbangan Duga)</span>
                                            <span className="font-bold">RM {q.trialBalanceAmount}</span>
                                        </div>
                                        {q.yearEndDate && <div className="text-xs text-slate-500 mb-2">Tahun berakhir: {q.yearEndDate}</div>}
                                        <p className="text-slate-800 italic mt-2">Maklumat Tambahan: {q.adjustmentInfo}</p>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">1. Jenis Pelarasan</label>
                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                            <button onClick={() => setAccrualTypeSelection('BELUM_BAYAR')} className={`p-2 rounded border text-xs font-bold ${accrualTypeSelection === 'BELUM_BAYAR' ? 'bg-purple-600 text-white' : 'bg-white'}`} disabled={!!drillFeedback}>BELANJA BELUM BAYAR</button>
                                            <button onClick={() => setAccrualTypeSelection('PRABAYAR')} className={`p-2 rounded border text-xs font-bold ${accrualTypeSelection === 'PRABAYAR' ? 'bg-purple-600 text-white' : 'bg-white'}`} disabled={!!drillFeedback}>BELANJA PRABAYAR</button>
                                            <button onClick={() => setAccrualTypeSelection('BELUM_TERIMA')} className={`p-2 rounded border text-xs font-bold ${accrualTypeSelection === 'BELUM_TERIMA' ? 'bg-purple-600 text-white' : 'bg-white'}`} disabled={!!drillFeedback}>HASIL BELUM TERIMA</button>
                                            <button onClick={() => setAccrualTypeSelection('BELUM_TERPEROLEH')} className={`p-2 rounded border text-xs font-bold ${accrualTypeSelection === 'BELUM_TERPEROLEH' ? 'bg-purple-600 text-white' : 'bg-white'}`} disabled={!!drillFeedback}>HASIL BELUM TERPEROLEH</button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">2. Catatan dalam PKK</label>
                                        <div className="flex flex-wrap gap-4 items-center">
                                            <div className="flex gap-2">
                                                <button onClick={() => setAccrualCategorySelection('AS')} className={`px-4 py-2 rounded border font-bold text-sm ${accrualCategorySelection === 'AS' ? 'bg-blue-600 text-white' : 'bg-white'}`} disabled={!!drillFeedback}>Aset Semasa</button>
                                                <button onClick={() => setAccrualCategorySelection('LS')} className={`px-4 py-2 rounded border font-bold text-sm ${accrualCategorySelection === 'LS' ? 'bg-blue-600 text-white' : 'bg-white'}`} disabled={!!drillFeedback}>Liabiliti Semasa</button>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm">金额（RM）</span>
                                                <input type="number" onKeyDown={preventArrowKeys} onWheel={preventWheel} className="border-2 border-slate-300 rounded p-2 w-24 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={accrualPkkAmount} onChange={e => setAccrualPkkAmount(e.target.value)} disabled={!!drillFeedback} />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">3. Amaun Akhir ke Untung Rugi</label>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-lg">RM</span>
                                            <input type="number" onKeyDown={preventArrowKeys} onWheel={preventWheel} className="border-2 border-slate-300 rounded p-2 w-32 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={accrualFinalAmount} onChange={e => setAccrualFinalAmount(e.target.value)} disabled={!!drillFeedback} />
                                        </div>
                                    </div>
                                    {!drillFeedback && (
                                        <div className="pt-2 flex justify-end">
                                            <Button onClick={handleAccrualSubmit} disabled={!accrualTypeSelection || !accrualCategorySelection || !accrualPkkAmount || !accrualFinalAmount}>提交答案</Button>
                                        </div>
                                    )}
                                    {renderFeedbackInline()}
                                </div>
                            </>
                        )}

                        {currentScreen === ScreenState.DRILL_BAD_DEBTS && (
                            <>
                                <div className="mb-8">
                                    <h3 className="text-lg font-bold border-b border-black inline-block mb-4">Hutang Lapuk</h3>
                                    <div className="question-ledger ledger-red mb-4 font-mono text-sm space-y-2">
                                        <div className="flex justify-between">
                                            <span>Akaun Belum Terima (Asal)</span>
                                            <span className="font-bold">RM {formatMoney(q.originalAbt)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Bank (Asal)</span>
                                            <span className="font-bold">RM {formatMoney(q.originalBank)}</span>
                                        </div>
                                    </div>
                                    <p className="text-slate-800">
                                        {q.type === 'BAD_DEBT' 
                                            ? `Seorang pelanggan muflis dan hutangnya RM ${q.amount} dihapuskira sebagai hutang lapuk.`
                                            : `Penerimaan cek RM ${q.amount} daripada pelanggan yang hutangnya telah dihapuskira sebagai hutang lapuk pada tahun lepas.`
                                        }
                                    </p>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">1. Jenis Pelarasan</label>
                                        <div className="flex gap-2 mb-2">
                                            <button onClick={() => setBadDebtTypeSelection('BAD_DEBT')} className={`px-3 py-2 rounded border text-xs font-bold ${badDebtTypeSelection === 'BAD_DEBT' ? 'bg-red-600 text-white' : 'bg-white'}`} disabled={!!drillFeedback}>HUTANG LAPUK</button>
                                            <button onClick={() => setBadDebtTypeSelection('BAD_DEBT_RECOVERED')} className={`px-3 py-2 rounded border text-xs font-bold ${badDebtTypeSelection === 'BAD_DEBT_RECOVERED' ? 'bg-green-600 text-white' : 'bg-white'}`} disabled={!!drillFeedback}>HUTANG LAPUK TERPULIH</button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">2. Kesan ke atas Untung Rugi</label>
                                        <div className="flex flex-wrap gap-4 items-center">
                                            <div className="flex gap-2">
                                                <button onClick={() => setBadDebtCategorySelection('BELANJA')} className={`px-4 py-2 rounded border font-bold text-sm ${badDebtCategorySelection === 'BELANJA' ? 'bg-blue-600 text-white' : 'bg-white'}`} disabled={!!drillFeedback}>BELANJA</button>
                                                <button onClick={() => setBadDebtCategorySelection('HASIL')} className={`px-4 py-2 rounded border font-bold text-sm ${badDebtCategorySelection === 'HASIL' ? 'bg-blue-600 text-white' : 'bg-white'}`} disabled={!!drillFeedback}>HASIL</button>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm">金额（RM）</span>
                                                <input type="number" onKeyDown={preventArrowKeys} onWheel={preventWheel} className="border-2 border-slate-300 rounded p-2 w-24 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={badDebtUrAmount} onChange={e => setBadDebtUrAmount(e.target.value)} disabled={!!drillFeedback} />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">3. Baki Baru dalam PKK</label>
                                        <div className="grid grid-cols-1 gap-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Akaun Belum Terima</span>
                                                <input type="number" onKeyDown={preventArrowKeys} onWheel={preventWheel} className="border-2 border-slate-300 rounded p-2 w-32 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="RM" value={badDebtAbtAmount} onChange={e => setBadDebtAbtAmount(e.target.value)} disabled={badDebtTypeSelection !== 'BAD_DEBT' || !!drillFeedback} />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Bank</span>
                                                <input type="number" onKeyDown={preventArrowKeys} onWheel={preventWheel} className="border-2 border-slate-300 rounded p-2 w-32 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="RM" value={badDebtBankAmount} onChange={e => setBadDebtBankAmount(e.target.value)} disabled={badDebtTypeSelection !== 'BAD_DEBT_RECOVERED' || !!drillFeedback} />
                                            </div>
                                        </div>
                                    </div>
                                    {!drillFeedback && (
                                        <div className="pt-2 flex justify-end">
                                            <Button onClick={handleBadDebtSubmit} disabled={!badDebtTypeSelection || !badDebtCategorySelection || !badDebtUrAmount || (badDebtTypeSelection === 'BAD_DEBT' ? !badDebtAbtAmount : !badDebtBankAmount)}>提交答案</Button>
                                        </div>
                                    )}
                                    {renderFeedbackInline()}
                                </div>
                            </>
                        )}

                        {currentScreen === ScreenState.DRILL_LOAN && (
                            <>
                                <div className="mb-8">
                                    <h3 className="text-lg font-bold border-b border-black inline-block mb-4">Pinjaman</h3>
                                    <div className="question-ledger ledger-green mb-4 font-mono text-sm space-y-1">
                                        <div className="font-bold border-b pb-1 mb-1">Imbangan Duga pada {q.yearEndStr}</div>
                                        <div className="flex justify-between">
                                            <span>Pinjaman {q.rate}%</span>
                                            <span className="font-bold">RM {formatMoney(q.tbLoanBalance)}</span>
                                        </div>
                                        <div className="flex justify-between text-slate-600">
                                            <span>Faedah Pinjaman</span>
                                            <span>RM {formatMoney(q.tbInterestPaid)}</span>
                                        </div>
                                    </div>
                                    <p className="text-slate-800 text-sm">
                                        Maklumat Tambahan: <br/>
                                        Pinjaman RM {formatMoney(q.principal)} telah {q.isNewLoan ? 'dibuat' : 'diperoleh'} pada {q.loanDateStr}. Tempoh pinjaman ialah {q.durationYears} tahun dan tarikh matang ialah {q.maturityDateStr}.
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">1. Belanja Faedah Sebenar (UR)</label>
                                        <input type="number" onKeyDown={preventArrowKeys} onWheel={preventWheel} className="border-2 border-slate-300 rounded p-2 w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={loanInterestAmount} onChange={e => setLoanInterestAmount(e.target.value)} disabled={!!drillFeedback} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">2. Pelarasan Faedah</label>
                                        <div className="flex gap-2 mb-2">
                                            <button onClick={() => setLoanAdjustmentType('BELUM_BAYAR')} className={`px-3 py-1 rounded border text-xs ${loanAdjustmentType === 'BELUM_BAYAR' ? 'bg-blue-600 text-white' : 'bg-white'}`} disabled={!!drillFeedback}>BELUM BAYAR</button>
                                            <button onClick={() => setLoanAdjustmentType('PRABAYAR')} className={`px-3 py-1 rounded border text-xs ${loanAdjustmentType === 'PRABAYAR' ? 'bg-blue-600 text-white' : 'bg-white'}`} disabled={!!drillFeedback}>PRABAYAR</button>
                                        </div>
                                        <input type="number" onKeyDown={preventArrowKeys} onWheel={preventWheel} placeholder="Amaun Pelarasan (RM)" className="border-2 border-slate-300 rounded p-2 w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={loanAccruedAmount} onChange={e => setLoanAccruedAmount(e.target.value)} disabled={!!drillFeedback} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">3. Liabiliti Semasa (PKK)</label>
                                        <input type="number" onKeyDown={preventArrowKeys} onWheel={preventWheel} placeholder="Bahagian Semasa Pinjaman" className="border-2 border-slate-300 rounded p-2 w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={loanLsAmount} onChange={e => setLoanLsAmount(e.target.value)} disabled={!!drillFeedback} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">4. Liabiliti Bukan Semasa (PKK)</label>
                                        <input type="number" onKeyDown={preventArrowKeys} onWheel={preventWheel} placeholder="Baki Pinjaman Selepas LS" className="border-2 border-slate-300 rounded p-2 w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={loanLbsAmount} onChange={e => setLoanLbsAmount(e.target.value)} disabled={!!drillFeedback} />
                                    </div>
                                    {!drillFeedback && (
                                        <div className="pt-2 flex justify-end">
                                            <Button onClick={handleLoanSubmit} disabled={!loanInterestAmount || !loanAdjustmentType || !loanAccruedAmount || !loanLsAmount || !loanLbsAmount}>提交答案</Button>
                                        </div>
                                    )}
                                    {renderFeedbackInline()}
                                </div>
                            </>
                        )}

                        {(currentScreen === ScreenState.DRILL_DISPOSAL_L1 || currentScreen === ScreenState.DRILL_DISPOSAL_L2) && (
                            <>
                                <div className="mb-6">
                                    <h3 className="text-lg font-bold border-b border-black inline-block mb-2">Pelupusan Aset</h3>
                                    <div className="question-ledger ledger-amber mb-3 font-mono text-xs">
                                        <div className="font-bold mb-1">Imbangan Duga ({q.financialYearEnd}):</div>
                                        <div className="flex justify-between"><span>{q.assetName} (Kos)</span> <span>{q.tbTotalCost}</span></div>
                                        <div className="flex justify-between"><span>SNT {q.assetName}</span> <span>{q.tbTotalAccDep}</span></div>
                                    </div>
                                    <p className="text-xs text-slate-800 leading-relaxed">
                                        Pada {q.disposalDate}, sebuah {q.assetName} yang dibeli pada {q.soldPurchaseDate} dengan harga RM {q.soldCost} telah dijual pada harga RM {q.disposalValue}. {q.paymentDescription}
                                        <br/>Dasar susut nilai: {q.rate}% setahun atas {q.method === 'STRAIGHT_LINE' ? 'kos' : 'baki berkurangan'}.
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    {/* Q1: SN Expense */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-slate-500">1. Belanja SN (Aset Dijual)</label>
                                            <input type="number" onKeyDown={preventArrowKeys} onWheel={preventWheel} className="border border-slate-300 rounded p-1 w-full text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={disposalSnExpense} onChange={e => setDisposalSnExpense(e.target.value)} disabled={!!drillFeedback} />
                                        </div>
                                        {currentScreen === ScreenState.DRILL_DISPOSAL_L2 && (
                                            <div>
                                                <label className="block text-[10px] font-bold uppercase text-slate-500">Belanja SN (Baki Aset)</label>
                                                <input type="number" onKeyDown={preventArrowKeys} onWheel={preventWheel} className="border border-slate-300 rounded p-1 w-full text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={disposalSnExpenseUnsold} onChange={e => setDisposalSnExpenseUnsold(e.target.value)} disabled={!!drillFeedback} />
                                            </div>
                                        )}
                                    </div>
                                    {/* Q2: Total SNT */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-slate-500">2. Jum. SNT (Aset Dijual)</label>
                                            <input type="number" onKeyDown={preventArrowKeys} onWheel={preventWheel} className="border border-slate-300 rounded p-1 w-full text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={disposalTotalSnt} onChange={e => setDisposalTotalSnt(e.target.value)} disabled={!!drillFeedback} />
                                        </div>
                                        {currentScreen === ScreenState.DRILL_DISPOSAL_L2 && (
                                            <div>
                                                <label className="block text-[10px] font-bold uppercase text-slate-500">Jum. SNT (Baki Aset)</label>
                                                <input type="number" onKeyDown={preventArrowKeys} onWheel={preventWheel} className="border border-slate-300 rounded p-1 w-full text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={disposalTotalSntUnsold} onChange={e => setDisposalTotalSntUnsold(e.target.value)} disabled={!!drillFeedback} />
                                            </div>
                                        )}
                                    </div>
                                    {/* Q3 & Q4 */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-slate-500">3. Nilai Buku</label>
                                            <input type="number" onKeyDown={preventArrowKeys} onWheel={preventWheel} className="border border-slate-300 rounded p-1 w-full text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={disposalBookValue} onChange={e => setDisposalBookValue(e.target.value)} disabled={!!drillFeedback} />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-slate-500">4. Kaedah Terima</label>
                                            <div className="flex gap-1">
                                                <button onClick={()=>setDisposalModeSelection('BANK')} className={`flex-1 text-[10px] border rounded ${disposalModeSelection === 'BANK' ? 'bg-blue-600 text-white' : 'bg-white'}`} disabled={!!drillFeedback}>Bank</button>
                                                <button onClick={()=>setDisposalModeSelection('TUNAI')} className={`flex-1 text-[10px] border rounded ${disposalModeSelection === 'TUNAI' ? 'bg-blue-600 text-white' : 'bg-white'}`} disabled={!!drillFeedback}>Tunai</button>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Q5: Gain/Loss */}
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase text-slate-500">5. Untung/Rugi Pelupusan</label>
                                        <div className="flex gap-2">
                                            <button onClick={()=>setDisposalGainLossType('UNTUNG')} className={`px-2 py-1 text-xs border rounded ${disposalGainLossType === 'UNTUNG' ? 'bg-green-600 text-white' : 'bg-white'}`} disabled={!!drillFeedback}>Untung</button>
                                            <button onClick={()=>setDisposalGainLossType('RUGI')} className={`px-2 py-1 text-xs border rounded ${disposalGainLossType === 'RUGI' ? 'bg-red-600 text-white' : 'bg-white'}`} disabled={!!drillFeedback}>Rugi</button>
                                            <input type="number" onKeyDown={preventArrowKeys} onWheel={preventWheel} placeholder="金额" className="border border-slate-300 rounded p-1 flex-1 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={disposalGainLossAmount} onChange={e => setDisposalGainLossAmount(e.target.value)} disabled={!!drillFeedback} />
                                        </div>
                                    </div>
                                    {/* Q6: PKK */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-slate-500">6. Kos Aset Akhir (PKK)</label>
                                            <input type="number" onKeyDown={preventArrowKeys} onWheel={preventWheel} className="border border-slate-300 rounded p-1 w-full text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={disposalFinalCost} onChange={e => setDisposalFinalCost(e.target.value)} disabled={!!drillFeedback} />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-slate-500">SNT Aset Akhir (PKK)</label>
                                            <input type="number" onKeyDown={preventArrowKeys} onWheel={preventWheel} className="border border-slate-300 rounded p-1 w-full text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={disposalFinalSnt} onChange={e => setDisposalFinalSnt(e.target.value)} disabled={!!drillFeedback} />
                                        </div>
                                    </div>
                                    {!drillFeedback && (
                                        <div className="pt-2 flex justify-end">
                                            <Button onClick={handleDisposalSubmit} disabled={!disposalSnExpense || !disposalTotalSnt || !disposalBookValue || !disposalModeSelection || !disposalGainLossType || !disposalGainLossAmount || !disposalFinalCost || !disposalFinalSnt || (currentScreen === ScreenState.DRILL_DISPOSAL_L2 && (!disposalSnExpenseUnsold || !disposalTotalSntUnsold))}>提交答案</Button>
                                        </div>
                                    )}
                                    {renderFeedbackInline()}
                                </div>
                            </>
                        )}

                  </div>

                  <div className="mt-6 text-center">
                      <button className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors" onClick={() => setCurrentScreen(ScreenState.MENU)}>退出练习</button>
                  </div>
              </div>
          </div>
      );
  }

  // --- LEADERBOARD ---
  if (currentScreen === ScreenState.LEADERBOARD) {
    return <LeaderboardView onBack={() => setCurrentScreen(ScreenState.MENU)} currentLevelId={selectedLevelId} />;
  }
  
  // --- GAME ---
  if (currentScreen === ScreenState.GAME) {
    return (
        <div className="min-h-screen p-4 flex flex-col items-center justify-center bg-slate-50">
            <h1 className="text-2xl font-bold mb-4">Tahap {selectedLevelId}</h1>
            <p className="mb-8 text-slate-600">拖放练习暂未开放。</p>
            <div className="flex gap-4">
                <Button onClick={() => handleGameWin(selectedLevelId)}>模拟完成</Button>
                <Button onClick={() => setCurrentScreen(ScreenState.MENU)} variant="secondary">返回主页</Button>
            </div>
        </div>
    );
  }

  // --- MENU ---
  const topics = [
      { code: 'PHR', title: 'Peruntukan Hutang Ragu', description: '练习计算 PHR，并判断它对损益的影响。', accent: 'topic-orange', action: initializeDrillPhr },
      { code: 'SN', title: 'Susut Nilai', description: '练习直线法与余额递减法。', accent: 'topic-blue', action: initializeDrillSn },
      { code: 'P1', title: 'Pelarasan Asas', description: '辨认预付、应计项目并计算调整后金额。', accent: 'topic-purple', action: initializeDrillAccrualsL1 },
      { code: 'P2', title: 'Pelarasan Bertempoh', description: '练习涉及月份与会计期间的调整。', accent: 'topic-purple', action: initializeDrillAccrualsL2 },
      { code: 'HL', title: 'Hutang Lapuk', description: '区分坏账与坏账收回。', accent: 'topic-red', action: initializeDrillBadDebts },
      { code: 'PJ', title: 'Pinjaman', description: '练习利息、调整，以及流动负债的划分。', accent: 'topic-green', action: initializeDrillLoans },
      { code: 'A1', title: 'Pelupusan Aset · Asas', description: '从折旧计算到处置损益。', accent: 'topic-gold', action: () => initializeDrillDisposal(1) },
      { code: 'A2', title: 'Pelupusan Aset · Lanjutan', description: '同时处理已出售与仍持有的资产。', accent: 'topic-gold', action: () => initializeDrillDisposal(2) },
      { code: 'TPM', title: 'Titik Pulang Modal', description: '练习固定成本、边际贡献与目标利润。', accent: 'topic-blue', action: initializeDrillTpm },
  ];

  return (
    <div className="app-background">
        <main className="menu-shell">
            <header className="topbar">
                <BrandLockup />
                <div className="user-badge">
                    <span className="hidden sm:block">你好，{userName}</span>
                    <span className="user-avatar">{userName.trim().charAt(0).toUpperCase()}</span>
                </div>
            </header>

            <section className="menu-hero">
                <div className="relative z-10">
                    <span className="text-[.7rem] uppercase tracking-[.18em] font-extrabold text-[#7fd0c2]">Ruang Latihan Anda</span>
                    <h1>Bina Keyakinan<br/>Melalui Latihan.</h1>
                    <p>选择一个主题，按步骤作答，并在每题后查看解析。每次错题，都是巩固知识的机会。</p>
                </div>
                <div className="hero-stat-grid">
                    <div className="hero-stat"><strong>9</strong><span>练习主题</span></div>
                    <div className="hero-stat"><strong>∞</strong><span>动态题组</span></div>
                    <div className="hero-stat"><strong>+2</strong><span>答对得分</span></div>
                    <div className="hero-stat"><strong>−1</strong><span>答错扣分</span></div>
                </div>
            </section>

            <section aria-labelledby="topics-title">
                <div className="section-heading">
                    <div>
                        <span className="eyebrow">Koleksi Latihan</span>
                        <h2 id="topics-title">Pilih Topik untuk Bermula</h2>
                    </div>
                    <p>每次练习都会生成新的题目顺序，并在作答后提供逐步解析。</p>
                </div>
                <div className="topic-grid">
                    {topics.map((topic) => (
                        <button key={topic.title} className={`topic-card ${topic.accent}`} onClick={topic.action}>
                            <span className="topic-icon">{topic.code}</span>
                            <h3>{topic.title}</h3>
                            <p>{topic.description}</p>
                            <span className="topic-link">开始练习 <span aria-hidden="true">→</span></span>
                        </button>
                    ))}
                </div>
            </section>

            <section className="leaderboard-cta">
                <div>
                    <h3>Lihat Perkembangan Pembelajaran</h3>
                    <p>比较各主题的练习得分与用时。</p>
                </div>
                <Button onClick={() => setCurrentScreen(ScreenState.LEADERBOARD)} variant="secondary">查看排行榜</Button>
            </section>
        </main>
    </div>
  );
}

