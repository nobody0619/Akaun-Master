import React, { useState, useEffect, useRef } from 'react';
import { ScreenState, GameItem, LeaderboardEntry, LevelConfig, DropZoneData, DrillQuestion, DrillSnQuestion, DrillAccrualQuestion, DrillBadDebtQuestion, DrillLoanQuestion } from './types';
import { LEVELS, generatePhrQuestion, generateSnQuestion, ACCRUALS_L1_QUESTIONS, ACCRUALS_L2_QUESTIONS, generateBadDebtQuestion, generateLoanQuestion } from './constants';
import { saveScore, getScores } from './services/leaderboardService';
import { Button } from './components/Button';

// -- Helper --
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

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

  const levels = ['ALL', '1', 'DRILL-PHR', 'DRILL-SN', 'DRILL-ACC-L1', 'DRILL-ACC-L2', 'DRILL-HL', 'DRILL-LOAN'];

  return (
    <div className="min-h-screen bg-slate-50 p-4 flex flex-col items-center">
      <div className="max-w-5xl w-full bg-white rounded-xl shadow-xl overflow-hidden border border-slate-200 flex flex-col h-[85vh]">
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 font-serif mb-4">Leaderboard</h2>
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
                        {l === 'ALL' ? 'All Levels' : l}
                    </button>
                ))}
            </div>
          </div>
          <Button onClick={onBack}>Back to Menu</Button>
        </div>

        <div className="flex-1 overflow-auto bg-slate-50/50">
            {loading ? (
                <div className="flex items-center justify-center h-full text-slate-500">Loading scores...</div>
            ) : displayScores.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-400 italic">No scores recorded for this level yet.</div>
            ) : (
                <table className="w-full text-left border-collapse">
                    <thead className="bg-white sticky top-0 shadow-sm z-10 text-xs uppercase text-slate-500 tracking-wider">
                        <tr>
                            <th className="p-4 border-b">Rank</th>
                            <th className="p-4 border-b">Player</th>
                            <th className="p-4 border-b">Level</th>
                            <th className="p-4 border-b text-right">Score</th>
                            <th className="p-4 border-b text-right">Time</th>
                            <th className="p-4 border-b text-right">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                        {displayScores.map((entry, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 w-16 text-center font-bold text-slate-400">
                                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                                </td>
                                <td className="p-4 font-semibold text-slate-700">{entry.name}</td>
                                <td className="p-4 text-xs font-mono text-slate-500">{entry.levelId}</td>
                                <td className="p-4 text-right font-bold text-indigo-600 text-lg">{entry.score}</td>
                                <td className="p-4 text-right font-mono text-slate-600">{formatTime(entry.time)}</td>
                                <td className="p-4 text-right text-xs text-slate-400">
                                    {new Date(entry.timestamp).toLocaleDateString()}
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
  const [accrualQueue, setAccrualQueue] = useState<DrillAccrualQuestion[]>([]); // New Accrual Queue
  const [badDebtQueue, setBadDebtQueue] = useState<DrillBadDebtQuestion[]>([]); // Bad Debt Queue
  const [loanQueue, setLoanQueue] = useState<DrillLoanQuestion[]>([]); // Loan Queue
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
      // Shuffle questions
      const shuffled = shuffleArray(ACCRUALS_L1_QUESTIONS);
      setAccrualQueue(shuffled);
      resetDrillState(ScreenState.DRILL_ACCRUALS_L1);
  };

  const initializeDrillAccrualsL2 = () => {
      // Shuffle questions
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
    
    setDrillFeedback(null);
    setMistakes(0);
    setScore(0);
    setTimer(0);
    setIsTimerRunning(true);
    setCurrentScreen(screen);
  }

  // --- DRILL LOGIC (PHR) ---
  const handleDrillSubmit = () => {
     const q = drillQueue[currentDrillIndex];
     const inputPhr = parseFloat(drillAnswerPhr);
     const inputAmt = parseFloat(drillAnswerAmt);

     const isPhrCorrect = Math.abs(inputPhr - q.correctNewPhr) < 0.01;
     const isCatCorrect = drillPlacedCategory === q.correctCategory;
     const isAmtCorrect = Math.abs(inputAmt - q.correctAdjustmentAmount) < 0.01;

     if (isPhrCorrect && isCatCorrect && isAmtCorrect) {
         // Correct
         setScore(s => s + (q.isPenalty ? 1 : 2));
         setDrillFeedback({ isCorrect: true, message: "Tahniah! Jawapan anda betul." });
     } else {
         // Incorrect
         setMistakes(m => m + 1);
         setScore(s => s - 1);
         const explanation = `
            Pengiraan: ${q.abt} x ${q.rate}% = ${q.correctNewPhr} (PHR Baru). 
            Pelarasan: ${q.correctNewPhr} - ${q.oldPhr} = ${q.correctNewPhr - q.oldPhr}.
            Oleh kerana ${q.correctNewPhr - q.oldPhr > 0 ? 'Positif' : 'Negatif'}, ia adalah ${q.correctCategory} sebanyak ${q.correctAdjustmentAmount}.
         `;
         setDrillFeedback({ isCorrect: false, message: explanation });
         
         // Penalty
         const penaltyQ1 = { ...generatePhrQuestion(), isPenalty: true };
         const penaltyQ2 = { ...generatePhrQuestion(), isPenalty: true };
         setDrillQueue(prev => [...prev, penaltyQ1, penaltyQ2]);
     }
  };

  // --- DRILL LOGIC (SUSUT NILAI) ---
  const handleSnSubmit = () => {
      const q = snQueue[currentDrillIndex];
      const inputExp = parseFloat(snAnswerExpense);
      const inputSnt = parseFloat(snAnswerSnt);

      const isExpCorrect = Math.abs(inputExp - q.correctSnExpense) < 0.01;
      const isCatCorrect = snPlacedCategory === q.correctCategory;
      const isSntCorrect = Math.abs(inputSnt - q.correctNewAccDep) < 0.01;

      if (isExpCorrect && isCatCorrect && isSntCorrect) {
          setScore(s => s + (q.isPenalty ? 1 : 2));
          setDrillFeedback({ isCorrect: true, message: "Tahniah! Jawapan anda betul." });
      } else {
          setMistakes(m => m + 1);
          setScore(s => s - 1);
          let methodText = "";
          if (q.methodType === 'STRAIGHT_LINE') methodText = `${q.cost} x ${q.rate}%`;
          else if (q.methodType === 'REDUCING_BALANCE') methodText = `(${q.cost} - ${q.oldAccDep}) x ${q.rate}%`;
          else methodText = `(${q.cost} - ${q.scrapValue}) / ${q.usefulLife}`;

          const explanation = `
             Pengiraan: ${methodText} = ${q.correctSnExpense}.
             Kategori sentiasa BELANJA.
             Terkumpul: ${q.oldAccDep} (Lama) + ${q.correctSnExpense} (Baru) = ${q.correctNewAccDep}.
          `;
          setDrillFeedback({ isCorrect: false, message: explanation });
          
          // Penalty
          const penaltyQ1 = { ...generateSnQuestion(), isPenalty: true };
          const penaltyQ2 = { ...generateSnQuestion(), isPenalty: true };
          setSnQueue(prev => [...prev, penaltyQ1, penaltyQ2]);
      }
  };

  // --- DRILL LOGIC (ACCRUALS) ---
  const handleAccrualSubmit = () => {
      const q = accrualQueue[currentDrillIndex];
      const inputPkkAmt = parseFloat(accrualPkkAmount);
      const inputFinalAmt = parseFloat(accrualFinalAmount);

      // 1. Validate Type Selection
      let isTypeCorrect = false;
      if (q.type === 'ACCRUED_EXP' && accrualTypeSelection === 'BELUM_BAYAR') isTypeCorrect = true;
      if (q.type === 'PREPAID_EXP' && accrualTypeSelection === 'PRABAYAR') isTypeCorrect = true;
      if (q.type === 'ACCRUED_REV' && accrualTypeSelection === 'BELUM_TERIMA') isTypeCorrect = true;
      if (q.type === 'UNEARNED_REV' && accrualTypeSelection === 'BELUM_TERPEROLEH') isTypeCorrect = true;

      // 2. Validate Category Selection
      const isCategoryCorrect = accrualCategorySelection === q.correctPkkCategory;

      // 3. Validate Amounts
      const isPkkAmtCorrect = Math.abs(inputPkkAmt - q.correctPkkAmount) < 0.01;
      const isFinalAmtCorrect = Math.abs(inputFinalAmt - q.correctFinalAmount) < 0.01;

      if (isTypeCorrect && isCategoryCorrect && isPkkAmtCorrect && isFinalAmtCorrect) {
          setScore(s => s + (q.isPenalty ? 1 : 2));
          setDrillFeedback({ isCorrect: true, message: "Tahniah! Jawapan anda betul." });
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
          
          // Penalty: Add same question 2 more times to the end
          const retry1 = {...q, id: q.id + '-retry1-' + Date.now(), isPenalty: true};
          const retry2 = {...q, id: q.id + '-retry2-' + Date.now(), isPenalty: true};
          setAccrualQueue(prev => [...prev, retry1, retry2]);
      }
  };

  // --- DRILL LOGIC (BAD DEBTS) ---
  const handleBadDebtSubmit = () => {
    const q = badDebtQueue[currentDrillIndex];
    const inputUrAmt = parseFloat(badDebtUrAmount); // Amount in UR
    
    // Check Inputs based on Type
    const inputAbt = badDebtAbtAmount ? parseFloat(badDebtAbtAmount) : 0; 
    const inputBank = badDebtBankAmount ? parseFloat(badDebtBankAmount) : 0;

    // 1. Check Type
    const isTypeCorrect = badDebtTypeSelection === q.type;

    // 2. Check Category
    const isCatCorrect = badDebtCategorySelection === q.correctCategory;

    // 3. Check UR Amount (This is just q.amount)
    const isUrAmtCorrect = Math.abs(inputUrAmt - q.amount) < 0.01;

    // 4. Check PKK Amounts
    let isPkkCorrect = false;
    if (q.type === 'BAD_DEBT') {
        // Only ABT matters
        isPkkCorrect = Math.abs(inputAbt - q.correctNewAbt) < 0.01;
    } else {
        // RECOVERED: Only Bank matters (ABT input is hidden)
        isPkkCorrect = Math.abs(inputBank - q.correctNewBank) < 0.01;
    }

    if (isTypeCorrect && isCatCorrect && isUrAmtCorrect && isPkkCorrect) {
        setScore(s => s + (q.isPenalty ? 1 : 2));
        setDrillFeedback({ isCorrect: true, message: "Tahniah! Jawapan anda betul." });
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
        
        // Penalty
        const penaltyQ1 = { ...generateBadDebtQuestion(), isPenalty: true };
        const penaltyQ2 = { ...generateBadDebtQuestion(), isPenalty: true };
        setBadDebtQueue(prev => [...prev, penaltyQ1, penaltyQ2]);
    }
  };

  // --- DRILL LOGIC (LOAN) ---
  const handleLoanSubmit = () => {
      const q = loanQueue[currentDrillIndex];
      const inputExp = parseFloat(loanInterestAmount);
      const inputAccrued = parseFloat(loanAccruedAmount);
      const inputLs = parseFloat(loanLsAmount);
      const inputLbs = parseFloat(loanLbsAmount);
      
      const isExpCorrect = Math.abs(inputExp - q.correctInterestExpense) < 0.01;
      
      // Validation for Section 2 (Adjustment Type & Amount)
      const isAdjTypeCorrect = loanAdjustmentType === q.correctAdjustmentType;
      const isAdjAmountCorrect = Math.abs(inputAccrued - q.correctAccruedAmount) < 0.01;
      
      const isLsCorrect = Math.abs(inputLs - q.correctLs) < 0.01;
      const isLbsCorrect = Math.abs(inputLbs - q.correctLbs) < 0.01;
      
      if (isExpCorrect && isAdjTypeCorrect && isAdjAmountCorrect && isLsCorrect && isLbsCorrect) {
          setScore(s => s + (q.isPenalty ? 1 : 2));
          setDrillFeedback({ isCorrect: true, message: "Tahniah! Jawapan anda betul." });
      } else {
          setMistakes(m => m + 1);
          setScore(s => s - 1);
          
          // Determine type name for feedback
          const typeName = q.correctAdjustmentType === 'BELUM_BAYAR' ? "Faedah Belum Bayar" : "Faedah Prabayar";
          const typeReason = q.correctAdjustmentType === 'BELUM_BAYAR' 
              ? `Bayar (${q.tbInterestPaid}) < Belanja (${q.correctInterestExpense})` 
              : `Bayar (${q.tbInterestPaid}) > Belanja (${q.correctInterestExpense})`;

          // Calculation explanation based on New Loan status
          const calculationFormula = q.isNewLoan 
             ? `RM${q.principal} x ${q.rate}% x ${q.monthsHeld}/12` 
             : `RM${q.principal} x ${q.rate}%`;

          const msg = `
            1. Faedah (UR): ${calculationFormula} = RM${q.correctInterestExpense}.
            2. Pelarasan Faedah: ${typeReason} -> ${typeName}.
               Amaun: Beza RM${q.correctInterestExpense} dan RM${q.tbInterestPaid} = RM${q.correctAccruedAmount}.
            3. Liabiliti Semasa: Bayaran balik setahun = RM${q.principal} / ${q.durationYears} thn = RM${q.correctLs}.
            4. Liabiliti Bukan Semasa: Baki Pinjaman (RM${q.tbLoanBalance}) - LS (RM${q.correctLs}) = RM${q.correctLbs}.
          `;
          setDrillFeedback({ isCorrect: false, message: msg });
          
          // Re-queue same TYPE of question for penalty
          const penaltyQ1 = { ...generateLoanQuestion(q.isNewLoan), isPenalty: true };
          const penaltyQ2 = { ...generateLoanQuestion(q.isNewLoan), isPenalty: true };
          setLoanQueue(prev => [...prev, penaltyQ1, penaltyQ2]);
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

    // Update selectedLevelId for the leaderboard logic
    setSelectedLevelId(levelName);

    const entry: LeaderboardEntry = {
        name: userName,
        levelId: levelName,
        score: score, // Saving SCORE now
        time: timer,
        timestamp: Date.now()
    };
    saveScore(entry);
    setCurrentScreen(ScreenState.LEADERBOARD);
  };

  // ... (Drag and Drop logic remains unchanged, skipping for brevity but assuming it is kept) ...
  // --- CORE DROP LOGIC (Shared by Mouse & Touch) ---
  const processDrop = (item: GameItem, source: 'bank' | 'zone', sourceZoneId: string | undefined, targetZoneFullId: string) => {
    const level = LEVELS[selectedLevelId];
    
    // Parse target ID
    let rowId = targetZoneFullId;
    let subZone: 'main' | 'op' | 'col' = 'main';
    let colIdx = -1;

    if (targetZoneFullId.endsWith('-op')) {
      rowId = targetZoneFullId.replace('-op', '');
      subZone = 'op';
    } else if (targetZoneFullId.includes('-col-')) {
       // Extract rowId and column index
       const parts = targetZoneFullId.split('-col-');
       rowId = parts[0];
       colIdx = parseInt(parts[1], 10);
       subZone = 'col';
    } else if (targetZoneFullId.endsWith('-main')) {
      rowId = targetZoneFullId.replace('-main', '');
      subZone = 'main';
    }

    const rowDef = level.rows.find(r => r.id === rowId);
    if (!rowDef) return;

    // Check occupancy
    if (placedItems[targetZoneFullId]?.length > 0) {
        if (placedItems[targetZoneFullId][0].id === item.id) return;
        return; 
    }

    // --- Validation ---
    let isCorrect = false;
    if (subZone === 'op') {
      isCorrect = rowDef.hasOperator === true && rowDef.correctOperator === item.label;
    } else if (subZone === 'col') {
      isCorrect = rowDef.interactiveColumnLabels?.[colIdx as 0|1|2] === item.originalId;
    } else {
      // Main Zone
      const isExactMatch = rowDef.correctLabel === item.originalId;
      const isCategoryMatch = !!rowDef.acceptsCategory && rowDef.acceptsCategory === item.category;
      isCorrect = isExactMatch || isCategoryMatch;
    }

    if (isCorrect) {
        // --- CORRECT ---
        
        // 1. Remove from source immediately
        const currentBank = source === 'bank' ? bankItems.filter(i => i.id !== item.id) : [...bankItems];
        if (source === 'bank') setBankItems(currentBank);
        if (source === 'zone' && sourceZoneId) {
             setPlacedItems(prev => ({ ...prev, [sourceZoneId]: [] }));
        }

        // 2. SURPLUS CHECK
        const remainingInBank = currentBank.filter(i => {
             if (item.category) return i.category === item.category;
             if (subZone === 'op') return i.label === item.label;
             return i.originalId === item.originalId;
        }).length;

        let neededByOthers = 0;
        level.rows.forEach(row => {
            const mZone = row.hasOperator ? `${row.id}-main` : row.id;
            const oZone = `${row.id}-op`;

            // Check Main
            if (mZone !== targetZoneFullId) {
                const isEmpty = !placedItems[mZone] || placedItems[mZone].length === 0;
                if (mZone !== sourceZoneId && isEmpty) {
                     const matches = (row.acceptsCategory && row.acceptsCategory === item.category) ||
                                     (row.correctLabel === item.originalId);
                     if (matches) neededByOthers++;
                }
            }
            // Check Op
            if (row.hasOperator && oZone !== targetZoneFullId) {
                if (oZone !== sourceZoneId && (!placedItems[oZone] || placedItems[oZone].length === 0)) {
                    const matches = row.correctOperator === item.label;
                    if (matches) neededByOthers++;
                }
            }

            // Check Interactive Cols
            if (row.interactiveColumnLabels) {
                 ([0, 1, 2] as const).forEach(cIdx => {
                    if (row.interactiveColumnLabels?.[cIdx]) {
                        const colZoneId = `${row.id}-col-${cIdx}`;
                        if (colZoneId !== targetZoneFullId) {
                             if (colZoneId !== sourceZoneId && (!placedItems[colZoneId] || placedItems[colZoneId].length === 0)) {
                                 if (row.interactiveColumnLabels[cIdx] === item.originalId) {
                                     neededByOthers++;
                                 }
                             }
                        }
                    }
                 });
            }
        });

        if (remainingInBank > neededByOthers) {
            // SURPLUS DETECTED -> "Consume" logic
            setPlacedItems(prev => ({ ...prev, [targetZoneFullId]: [item] }));
            setTimeout(() => {
                setPlacedItems(prev => ({ ...prev, [targetZoneFullId]: [] }));
            }, 1000);

        } else {
            // NORMAL FILL
            setPlacedItems(prev => ({ ...prev, [targetZoneFullId]: [item] }));
        }

    } else {
        // --- INCORRECT ---
        if (source === 'bank') setBankItems(prev => prev.filter(i => i.id !== item.id));
        else if (sourceZoneId) setPlacedItems(prev => ({ ...prev, [sourceZoneId]: [] }));

        setPlacedItems(prev => ({ ...prev, [targetZoneFullId]: [item] }));
        setIncorrectZoneId(targetZoneFullId);
        setMistakes(m => m + 1);

        setTimeout(() => {
            setPlacedItems(prev => ({ ...prev, [targetZoneFullId]: [] }));
            setIncorrectZoneId(null);
            // Add penalty items with special flag
            const copy1: GameItem = { ...item, id: `${item.id}-copy1-${Date.now()}`, isPenalty: true };
            const copy2: GameItem = { ...item, id: `${item.id}-copy2-${Date.now()}`, isPenalty: true };
            setBankItems(prev => [...prev, item, copy1, copy2].sort(() => Math.random() - 0.5));
        }, 3000);
    }
    
    // Clear selection after drop attempt
    setSelectedBankItem(null);
  };
  
  // --- MOUSE EVENTS ---
  const handleDragStart = (e: React.DragEvent, item: GameItem, source: 'bank' | 'zone', sourceZoneId?: string) => {
    setSelectedBankItem(null); // Clear tap selection on drag
    e.dataTransfer.setData('application/json', JSON.stringify({ item, source, sourceZoneId }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetZoneFullId: string) => {
    e.preventDefault();
    const dataStr = e.dataTransfer.getData('application/json');
    if (!dataStr) return;
    const { item, source, sourceZoneId } = JSON.parse(dataStr);
    processDrop(item, source, sourceZoneId, targetZoneFullId);
  };
  
  // --- TOUCH EVENTS (Mobile) ---
  const handleTouchStart = (e: React.TouchEvent, item: GameItem, source: 'bank' | 'zone', sourceZoneId?: string) => {
    const touch = e.touches[0];
    touchStartXRef.current = touch.clientX;
    touchStartYRef.current = touch.clientY;
    
    dragItemRef.current = item;
    dragSourceRef.current = source;
    dragSourceZoneIdRef.current = sourceZoneId;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragItemRef.current) return;
    
    const touch = e.touches[0];
    
    if (!ghostRef.current) {
        const dx = Math.abs(touch.clientX - touchStartXRef.current);
        const dy = Math.abs(touch.clientY - touchStartYRef.current);
        if (dx < 10 && dy < 10) return; 

        const ghost = document.createElement('div');
        ghost.innerText = dragItemRef.current.label;
        ghost.style.position = 'fixed';
        ghost.style.zIndex = '1000';
        ghost.style.backgroundColor = 'white';
        ghost.style.padding = '4px 8px';
        ghost.style.border = '2px solid #3b82f6';
        ghost.style.borderRadius = '4px';
        ghost.style.pointerEvents = 'none'; 
        ghost.style.fontSize = '12px';
        ghost.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
        document.body.appendChild(ghost);
        ghostRef.current = ghost;
        
        setSelectedBankItem(null);
    }

    if (ghostRef.current) {
        ghostRef.current.style.left = `${touch.clientX}px`;
        ghostRef.current.style.top = `${touch.clientY}px`;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent, item?: GameItem) => {
    if (!ghostRef.current) {
        if (item) handleBankClick(item);
    } else {
        const touch = e.changedTouches[0];
        const targetEl = document.elementFromPoint(touch.clientX, touch.clientY);
        const dropZone = targetEl?.closest('[data-zone-id]');
        if (dropZone) {
            const targetZoneId = dropZone.getAttribute('data-zone-id');
            if (targetZoneId && dragItemRef.current) {
                processDrop(dragItemRef.current, dragSourceRef.current!, dragSourceZoneIdRef.current, targetZoneId);
            }
        }
        document.body.removeChild(ghostRef.current);
        ghostRef.current = null;
    }
    
    dragItemRef.current = null;
    dragSourceRef.current = null;
    dragSourceZoneIdRef.current = undefined;
  };
  
  const handleBankClick = (item: GameItem) => {
      if (selectedBankItem?.id === item.id) {
          setSelectedBankItem(null);
      } else {
          setSelectedBankItem(item);
      }
  };

  const handleZoneClick = (targetZoneId: string) => {
      if (selectedBankItem) {
          processDrop(selectedBankItem, 'bank', undefined, targetZoneId);
      }
  };

  // --- RENDER HELPERS ---
  const renderDropZone = (
    zoneId: string, 
    placeholderHint: string, 
    isFilled: boolean, 
    isError: boolean,
    items: GameItem[],
    extraClasses: string = ""
  ) => (
    <div 
        data-zone-id={zoneId} 
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, zoneId)}
        onClick={() => handleZoneClick(zoneId)}
        className={`
            relative rounded flex flex-wrap gap-1 items-center transition-colors duration-300 min-h-[2.2rem] cursor-pointer
            ${!isFilled ? 'bg-stone-100 border border-dashed border-stone-300 hover:bg-stone-200' : ''}
            ${isError ? 'bg-red-100 border-red-400 ring-2 ring-red-400' : ''}
            ${selectedBankItem && !isFilled ? 'ring-2 ring-blue-300 bg-blue-50' : ''} 
            ${isFilled ? '' : 'shadow-inner'}
            ${extraClasses}
        `}
    >
        {items.map(item => (
            <div 
                key={item.id} 
                className={`
                    px-2 py-1 rounded shadow-sm text-sm font-medium w-full
                    ${isError ? 'bg-red-500 text-white' : 'bg-white border-l-4 border-blue-500 text-ink'}
                `}
            >
                {item.label}
            </div>
        ))}
    </div>
  );
  
  const renderTAccountSide = (rows: DropZoneData[]) => {
      return (
          <div className="flex-1 border-r border-stone-400 last:border-r-0">
              <div className="grid grid-cols-6 gap-0 border-b border-black font-bold text-xs md:text-sm bg-stone-200">
                  <div className="col-span-1 border-r border-stone-300 p-1 text-center">Tarikh</div>
                  <div className="col-span-3 border-r border-stone-300 p-1 text-center">Butir</div>
                  <div className="col-span-1 border-r border-stone-300 p-1 text-center">Sarah</div>
                  <div className="col-span-1 p-1 text-center">Helmi</div>
              </div>
              
              {rows.map(row => {
                  const mainZoneId = row.id;
                  const items = placedItems[mainZoneId] || [];
                  const isError = incorrectZoneId === mainZoneId;
                  
                  return (
                      <div key={row.id} className="grid grid-cols-6 gap-0 border-b border-stone-100 text-xs md:text-sm">
                          <div className="col-span-1 border-r border-stone-200 p-1 text-center font-mono text-stone-500">{row.date}</div>
                          <div className="col-span-3 border-r border-stone-200 p-1">
                              {row.isStatic ? 
                                <div className="font-bold pl-1 h-[2.2rem] flex items-center">{row.correctLabel}</div> :
                                renderDropZone(mainZoneId, '', items.length > 0, isError, items, "text-xs")
                              }
                          </div>
                          <div className="col-span-1 border-r border-stone-200 p-1 text-center font-mono flex items-center justify-center">{row.tAccountValues?.sarah}</div>
                          <div className="col-span-1 p-1 text-center font-mono flex items-center justify-center">{row.tAccountValues?.helmi}</div>
                      </div>
                  )
              })}
          </div>
      );
  };
  
  // (Graph Rendering code omitted for brevity but assumed present - restoration of Level 9)
  const renderGraphLevel = (rows: DropZoneData[]) => {
        return (
            <div className="relative w-full h-[500px] bg-stone-50 border border-stone-300 rounded p-4 overflow-hidden">
                <div className="absolute inset-8 pointer-events-none">
                    <div className="absolute w-full h-full opacity-20" style={{ backgroundImage: 'linear-gradient(to right, #ccc 1px, transparent 1px), linear-gradient(to bottom, #ccc 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                    <svg className="absolute inset-0 w-full h-full overflow-visible">
                        <defs>
                            <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                                <path d="M0,0 L0,6 L9,3 z" fill="black" />
                            </marker>
                            <marker id="arrow-red" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                                <path d="M0,0 L0,6 L9,3 z" fill="#ef4444" />
                            </marker>
                        </defs>
                        <line x1="5%" y1="95%" x2="5%" y2="5%" stroke="black" strokeWidth="2" markerEnd="url(#arrow)" />
                        <line x1="5%" y1="95%" x2="95%" y2="95%" stroke="black" strokeWidth="2" markerEnd="url(#arrow)" />
                        <path d="M5%,95% L5%,65% L40%,50% Z" fill="rgba(255,0,0,0.4)" stroke="none" />
                        <path d="M40%,50% L75%,5% L95%,26% Z" fill="rgba(34, 197, 94, 0.5)" stroke="none" />
                        <line x1="5%" y1="65%" x2="95%" y2="65%" stroke="black" strokeWidth="2" />
                        <line x1="5%" y1="65%" x2="95%" y2="26%" stroke="black" strokeWidth="2" />
                        <line x1="5%" y1="95%" x2="75%" y2="5%" stroke="black" strokeWidth="2" />
                        <circle cx="40%" cy="50%" r="4" fill="red" />
                        <line x1="40%" y1="95%" x2="40%" y2="50%" stroke="red" strokeWidth="2" strokeDasharray="5,5" />
                        <line x1="5%" y1="50%" x2="40%" y2="50%" stroke="red" strokeWidth="2" strokeDasharray="5,5" />
                        <line x1="22%" y1="48%" x2="38%" y2="50%" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrow-red)" />
                        <line x1="35%" y1="85%" x2="17%" y2="70%" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrow-red)" />
                        <line x1="55%" y1="8%" x2="70%" y2="24%" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrow-red)" />
                        <line x1="78%" y1="16%" x2="73%" y2="10%" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrow-red)" />
                        <line x1="78%" y1="40%" x2="60%" y2="40%" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrow-red)" />
                        <line x1="78%" y1="76%" x2="75%" y2="67%" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrow-red)" />
                    </svg>
                </div>
                {rows.map(row => {
                    const mainZoneId = row.id;
                    const items = placedItems[mainZoneId] || [];
                    const isError = incorrectZoneId === mainZoneId;
                    return (
                        <div 
                          key={row.id} 
                          className="absolute transform -translate-x-1/2 -translate-y-1/2"
                          style={{ top: row.graphPosition?.top, left: row.graphPosition?.left }}
                        >
                            {renderDropZone(mainZoneId, 'Label', items.length > 0, isError, items, "min-w-[120px] shadow-lg border-2 border-dashed border-indigo-200 bg-white/90 text-center text-xs justify-center")}
                        </div>
                    )
                })}
            </div>
        );
  };

  const getCardClass = (isPenalty?: boolean) => {
      return `bg-white p-8 rounded-lg shadow-xl border relative ${isPenalty ? 'border-red-400 bg-red-50' : 'border-slate-200'}`;
  };

  const getBtnClass = (isSelected: boolean, colorClass: string) => 
    `p-2 rounded border text-sm font-semibold transition-colors ${isSelected ? colorClass : 'bg-white border-slate-300 hover:bg-slate-50'}`;

  // --- SCREENS RENDER ---
  // (Welcome and Menu omitted for brevity, assuming existing structure)
  if (currentScreen === ScreenState.WELCOME) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4">
        <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full border border-slate-200">
          <h1 className="text-3xl font-serif text-center mb-6 text-slate-800 font-bold">Akaun Master</h1>
          <p className="text-center text-slate-500 mb-8">Enter your name.</p>
          <input
            type="text"
            placeholder="Student Name"
            className="w-full p-3 border-2 border-slate-300 rounded-lg mb-6 focus:border-indigo-500 focus:outline-none font-mono"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
          <Button 
            disabled={!userName.trim()}
            className="w-full"
            onClick={() => setCurrentScreen(ScreenState.MENU)}
          >
            Start
          </Button>
        </div>
      </div>
    );
  }

  if (currentScreen === ScreenState.MENU) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-6xl mx-auto">
          <header className="flex justify-between items-center mb-12 border-b border-slate-300 pb-4">
            <div>
              <h1 className="text-2xl font-serif font-bold text-slate-800">Welcome, {userName}</h1>
              <p className="text-xs text-slate-400 mt-1">v1.2.0 (Scoring Update)</p>
            </div>
            <Button variant="secondary" onClick={() => setCurrentScreen(ScreenState.LEADERBOARD)}>Leaderboard</Button>
          </header>

          <div>
             <h2 className="text-xl font-bold mb-4 text-slate-700 border-b-2 border-indigo-200 inline-block pb-1">F4 Bab 8 Maklumat Tambahan</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                 <div onClick={initializeDrillPhr} className="bg-white p-4 rounded-xl shadow border-l-4 border-red-500 cursor-pointer hover:shadow-lg transition-transform hover:-translate-y-1">
                     <div className="flex justify-between items-center mb-2">
                             <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-sm">PHR</div>
                             <span className="text-[10px] uppercase font-bold text-slate-400">Calculation</span>
                        </div>
                     <h3 className="font-bold text-sm text-slate-800">Peruntukan Hutang Ragu</h3>
                     <p className="text-xs text-slate-500">Calculate adjustments & entries</p>
                 </div>
                 
                 <div onClick={initializeDrillSn} className="bg-white p-4 rounded-xl shadow border-l-4 border-orange-500 cursor-pointer hover:shadow-lg transition-transform hover:-translate-y-1">
                     <div className="flex justify-between items-center mb-2">
                             <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-sm">SN</div>
                             <span className="text-[10px] uppercase font-bold text-slate-400">Calculation</span>
                        </div>
                     <h3 className="font-bold text-sm text-slate-800">Susut Nilai</h3>
                     <p className="text-xs text-slate-500">Straight Line, Reducing Balance</p>
                 </div>

                 <div onClick={initializeDrillAccrualsL1} className="bg-white p-4 rounded-xl shadow border-l-4 border-purple-500 cursor-pointer hover:shadow-lg transition-transform hover:-translate-y-1">
                     <div className="flex justify-between items-center mb-2">
                             <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-sm">AP</div>
                             <span className="text-[10px] uppercase font-bold text-slate-400">Calculation</span>
                        </div>
                     <h3 className="font-bold text-sm text-slate-800">Pengiktirafan Hasil & Belanja (Level 1)</h3>
                     <p className="text-xs text-slate-500">Basic / No Date</p>
                 </div>

                 <div onClick={initializeDrillAccrualsL2} className="bg-white p-4 rounded-xl shadow border-l-4 border-purple-800 cursor-pointer hover:shadow-lg transition-transform hover:-translate-y-1">
                     <div className="flex justify-between items-center mb-2">
                             <div className="h-8 w-8 bg-purple-200 rounded-full flex items-center justify-center text-purple-800 font-bold text-sm">AP+</div>
                             <span className="text-[10px] uppercase font-bold text-slate-400">Calculation</span>
                        </div>
                     <h3 className="font-bold text-sm text-slate-800">Pengiktirafan Hasil & Belanja (Level 2)</h3>
                     <p className="text-xs text-slate-500">Complex / With Date</p>
                 </div>

                 <div onClick={initializeDrillBadDebts} className="bg-white p-4 rounded-xl shadow border-l-4 border-emerald-500 cursor-pointer hover:shadow-lg transition-transform hover:-translate-y-1">
                     <div className="flex justify-between items-center mb-2">
                             <div className="h-8 w-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-sm">HL</div>
                             <span className="text-[10px] uppercase font-bold text-slate-400">Calculation</span>
                        </div>
                     <h3 className="font-bold text-sm text-slate-800">Hutang Lapuk & Terpulih</h3>
                     <p className="text-xs text-slate-500">Identify Type & Calculate</p>
                 </div>

                 <div onClick={initializeDrillLoans} className="bg-white p-4 rounded-xl shadow border-l-4 border-cyan-500 cursor-pointer hover:shadow-lg transition-transform hover:-translate-y-1">
                     <div className="flex justify-between items-center mb-2">
                             <div className="h-8 w-8 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600 font-bold text-sm">LOAN</div>
                             <span className="text-[10px] uppercase font-bold text-slate-400">Calculation</span>
                        </div>
                     <h3 className="font-bold text-sm text-slate-800">Pinjaman</h3>
                     <p className="text-xs text-slate-500">Liabiliti Semasa vs Bukan Semasa</p>
                 </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // --- DRILL SCREENS (PHR, SN, Accruals omitted for brevity - structure same as before but Logic updated above)
  // Re-rendering Bad Debts to show new inputs
  if (currentScreen === ScreenState.DRILL_BAD_DEBTS) {
      const q = badDebtQueue[currentDrillIndex];
      const progress = Math.round(((currentDrillIndex) / badDebtQueue.length) * 100);

      const isRecovered = q.type === 'BAD_DEBT_RECOVERED';
      const infoText = isRecovered 
          ? `Seorang pelanggan yang hutangnya telah dihapuskira, kini menjelaskan bayaran sebanyak RM${q.amount}.`
          : `Seorang pelanggan muflis dan hutangnya RM${q.amount} dihapuskira sebagai hutang lapuk.`;

      return (
          <div className="min-h-screen bg-slate-100 flex flex-col items-center p-4">
              <div className="w-full max-w-2xl">
                  {/* Header */}
                  <div className="flex justify-between items-center mb-4">
                      <div className="text-sm font-bold text-slate-600">Question {currentDrillIndex + 1} / {badDebtQueue.length}</div>
                      <div className="flex items-center gap-4">
                           <div className="text-sm font-bold text-indigo-600 bg-indigo-100 px-2 py-1 rounded">Score: {score}</div>
                          {q.isPenalty && (
                              <span className="bg-red-500 text-white text-[10px] uppercase font-bold px-2 py-1 rounded animate-pulse">
                                  ⚠️ Ulangkaji (Penalty)
                              </span>
                          )}
                      </div>
                  </div>
                  <div className="w-full bg-slate-300 h-2 rounded-full mb-6">
                      <div className="bg-emerald-500 h-2 rounded-full transition-all duration-300" style={{width: `${progress}%`}}></div>
                  </div>

                  {/* Question Card */}
                  <div className={getCardClass(q.isPenalty)}>
                        <div className="mb-8 font-serif">
                            <h3 className="text-lg font-bold border-b border-black inline-block mb-4">Pelarasan Hutang Lapuk / Terpulih</h3>
                            <div className="bg-emerald-50 p-4 border border-emerald-200 rounded mb-4 font-mono text-sm">
                                <div className="flex justify-between mb-2">
                                    <span>Akaun Belum Terima</span>
                                    <span className="font-bold">{q.originalAbt}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span>Bank</span>
                                    <span className="font-bold">{q.originalBank}</span>
                                </div>
                            </div>
                            <p className="text-slate-800">
                                Maklumat Tambahan: <br/>
                                {infoText}
                            </p>
                        </div>

                        <div className="space-y-6">
                            {/* Input 1: Type Selection */}
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">1. Pilih Jenis Pelarasan</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button 
                                        onClick={() => setBadDebtTypeSelection('BAD_DEBT')}
                                        className={getBtnClass(badDebtTypeSelection === 'BAD_DEBT', 'bg-blue-100 border-blue-500 text-blue-800 ring-1 ring-blue-500')}
                                    >
                                        Hutang Lapuk
                                    </button>
                                    <button 
                                        onClick={() => setBadDebtTypeSelection('BAD_DEBT_RECOVERED')}
                                        className={getBtnClass(badDebtTypeSelection === 'BAD_DEBT_RECOVERED', 'bg-blue-100 border-blue-500 text-blue-800 ring-1 ring-blue-500')}
                                    >
                                        Hutang Lapuk Terpulih
                                    </button>
                                </div>
                            </div>

                            {/* Input 2: Category (Standardized Colors as requested) */}
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">2. Klasifikasi (Akaun Untung Rugi)</label>
                                <div className="flex gap-4">
                                    <button 
                                        onClick={() => setBadDebtCategorySelection('BELANJA')}
                                        className={getBtnClass(badDebtCategorySelection === 'BELANJA', 'bg-indigo-100 border-indigo-500 text-indigo-800 ring-1 ring-indigo-500')}
                                    >
                                        BELANJA
                                    </button>
                                    <button 
                                        onClick={() => setBadDebtCategorySelection('HASIL')}
                                        className={getBtnClass(badDebtCategorySelection === 'HASIL', 'bg-indigo-100 border-indigo-500 text-indigo-800 ring-1 ring-indigo-500')}
                                    >
                                        HASIL
                                    </button>
                                </div>
                            </div>

                            {/* Input 3 & 4 Amounts */}
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                                        3. Amaun Direkod (Untung Rugi)
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-lg">RM</span>
                                        <input 
                                            type="number" 
                                            onKeyDown={preventArrowKeys}
                                            onWheel={preventWheel}
                                            placeholder="Amaun Pelarasan"
                                            className="border-2 border-slate-300 rounded p-2 font-mono w-full focus:border-indigo-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            value={badDebtUrAmount}
                                            onChange={e => setBadDebtUrAmount(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                                        4. Baki Akhir dalam PKK (Selepas Pelarasan)
                                    </label>
                                    
                                    {/* Only show ABT input if type is BAD_DEBT */}
                                    {badDebtTypeSelection === 'BAD_DEBT' && (
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-mono text-lg w-10">ABT</span>
                                            <input 
                                                type="number" 
                                                onKeyDown={preventArrowKeys}
                                                onWheel={preventWheel}
                                                placeholder="Baki ABT Baru"
                                                className="border-2 border-slate-300 rounded p-2 font-mono w-full focus:border-indigo-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                value={badDebtAbtAmount}
                                                onChange={e => setBadDebtAbtAmount(e.target.value)}
                                            />
                                        </div>
                                    )}

                                    {/* Show ONLY Bank if Recovered (Removed ABT input as requested) */}
                                    {badDebtTypeSelection === 'BAD_DEBT_RECOVERED' && (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-lg w-10">Bank</span>
                                                <input 
                                                    type="number" 
                                                    onKeyDown={preventArrowKeys}
                                                    onWheel={preventWheel}
                                                    placeholder="Baki Bank Baru"
                                                    className="border-2 border-slate-300 rounded p-2 font-mono w-full focus:border-indigo-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    value={badDebtBankAmount}
                                                    onChange={e => setBadDebtBankAmount(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {!badDebtTypeSelection && <div className="text-sm text-slate-400 italic">Sila pilih jenis pelarasan dahulu.</div>}
                                </div>
                            </div>

                            <div className="pt-6 flex flex-col gap-4">
                                <div className="flex justify-end">
                                    <Button 
                                        onClick={handleBadDebtSubmit} 
                                        disabled={
                                            !badDebtTypeSelection || 
                                            !badDebtCategorySelection || 
                                            !badDebtUrAmount || 
                                            ((!badDebtAbtAmount) && badDebtTypeSelection === 'BAD_DEBT') || 
                                            ((!badDebtBankAmount) && badDebtTypeSelection === 'BAD_DEBT_RECOVERED')
                                        }
                                    >
                                        Submit Answer
                                    </Button>
                                </div>
                                {/* INLINE FEEDBACK DISPLAY (Non-blocking) */}
                                {drillFeedback && (
                                    <div className={`mt-4 p-4 rounded-lg border ${drillFeedback.isCorrect ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                                        <div className="font-bold mb-2 flex items-center gap-2">
                                            {drillFeedback.isCorrect ? (
                                                <><span className="text-xl">✓</span> Betul!</>
                                            ) : (
                                                <><span className="text-xl">✗</span> Salah</>
                                            )}
                                        </div>
                                        <div className="text-sm whitespace-pre-line mb-4">{drillFeedback.message}</div>
                                        {/* Button always visible to proceed */}
                                            <Button variant="secondary" onClick={() => {
                                                setDrillFeedback(null);
                                                
                                                if (currentDrillIndex < badDebtQueue.length - 1) {
                                                    setBadDebtTypeSelection(null);
                                                    setBadDebtCategorySelection(null);
                                                    setBadDebtUrAmount('');
                                                    setBadDebtAbtAmount('');
                                                    setBadDebtBankAmount('');
                                                    setCurrentDrillIndex(i => i + 1);
                                                } else {
                                                    handleGameWin(ScreenState.DRILL_BAD_DEBTS);
                                                }
                                            }}>
                                                {currentDrillIndex < badDebtQueue.length - 1 ? "Teruskan" : "Selesai"}
                                            </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                  </div>
                  
                  <div className="mt-8 text-center">
                      <button onClick={() => setCurrentScreen(ScreenState.MENU)} className="text-slate-500 underline text-sm">Exit</button>
                  </div>
              </div>
          </div>
      )
  }

  // --- GENERIC RENDER for PHR/SN/Accruals/Loan needs to show score ---
  if ([ScreenState.DRILL_PHR, ScreenState.DRILL_SN, ScreenState.DRILL_ACCRUALS_L1, ScreenState.DRILL_ACCRUALS_L2, ScreenState.DRILL_LOAN].includes(currentScreen)) {
      const getActiveQueue = () => {
          if (currentScreen === ScreenState.DRILL_PHR) return drillQueue;
          if (currentScreen === ScreenState.DRILL_SN) return snQueue;
          if (currentScreen === ScreenState.DRILL_LOAN) return loanQueue;
          return accrualQueue;
      }
      const queue = getActiveQueue();
      const q = queue[currentDrillIndex] as any; // simplified casting
      const progress = Math.round(((currentDrillIndex) / queue.length) * 100);

      // Helper for render content based on screen...
      return (
          <div className="min-h-screen bg-slate-100 flex flex-col items-center p-4">
              <div className="w-full max-w-2xl">
                  {/* Header */}
                  <div className="flex justify-between items-center mb-4">
                      <div className="text-sm font-bold text-slate-600">Question {currentDrillIndex + 1} / {queue.length}</div>
                      <div className="flex items-center gap-4">
                          <div className="text-sm font-bold text-indigo-600 bg-indigo-100 px-2 py-1 rounded">Score: {score}</div>
                          {q.isPenalty && (
                              <span className="bg-red-500 text-white text-[10px] uppercase font-bold px-2 py-1 rounded animate-pulse">
                                  ⚠️ Ulangkaji (Penalty)
                              </span>
                          )}
                      </div>
                  </div>
                  <div className="w-full bg-slate-300 h-2 rounded-full mb-6">
                      <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{width: `${progress}%`}}></div>
                  </div>

                  {/* Question Card */}
                  <div className={getCardClass(q.isPenalty)}>
                        {/* CONTENT SWITCHER */}
                        {currentScreen === ScreenState.DRILL_PHR && (
                            <>
                                <div className="mb-8 font-serif">
                                    <h3 className="text-lg font-bold border-b border-black inline-block mb-4">Soalan</h3>
                                    <div className="bg-orange-50 p-4 border border-orange-200 rounded mb-4 font-mono text-sm">
                                        <div className="flex justify-between mb-2">
                                            <span>Akaun Belum Terima</span>
                                            <span className="font-bold">{q.abt}</span>
                                        </div>
                                        {q.oldPhr > 0 && (
                                            <div className="flex justify-between text-slate-500">
                                                <span>Peruntukan Hutang Ragu</span>
                                                <span>{q.oldPhr}</span>
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
                                            <input type="number" onKeyDown={preventArrowKeys} onWheel={preventWheel} className="border-2 border-slate-300 rounded p-2 font-mono w-32 focus:border-blue-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={drillAnswerPhr} onChange={e => setDrillAnswerPhr(e.target.value)} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">2. Kesan ke atas Untung Rugi</label>
                                        <div className="flex flex-wrap gap-4 items-center">
                                            <div className="flex gap-2">
                                                <button onClick={() => setDrillPlacedCategory('BELANJA')} className={`px-4 py-2 rounded border font-bold text-sm ${drillPlacedCategory === 'BELANJA' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}>BELANJA</button>
                                                <button onClick={() => setDrillPlacedCategory('HASIL')} className={`px-4 py-2 rounded border font-bold text-sm ${drillPlacedCategory === 'HASIL' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}>HASIL</button>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm">Amaun RM</span>
                                                <input type="number" onKeyDown={preventArrowKeys} onWheel={preventWheel} className="border-2 border-slate-300 rounded p-2 font-mono w-24 focus:border-blue-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={drillAnswerAmt} onChange={e => setDrillAnswerAmt(e.target.value)} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-6 flex justify-end">
                                        <Button onClick={handleDrillSubmit} disabled={!drillAnswerPhr || !drillAnswerAmt || !drillPlacedCategory}>Submit Answer</Button>
                                    </div>
                                </div>
                            </>
                        )}

                        {currentScreen === ScreenState.DRILL_SN && (
                             <>
                                <div className="mb-8 font-serif">
                                    <h3 className="text-lg font-bold border-b border-black inline-block mb-4">Soalan Susut Nilai</h3>
                                    <div className="bg-blue-50 p-4 border border-blue-200 rounded mb-4 font-mono text-sm">
                                        <div className="flex justify-between mb-2">
                                            <span className="font-bold">{q.assetName} (Kos)</span>
                                            <span className="font-bold">{q.cost}</span>
                                        </div>
                                        {q.oldAccDep > 0 && (
                                            <div className="flex justify-between text-slate-500">
                                                <span>Susut Nilai Terkumpul {q.assetName}</span>
                                                <span>{q.oldAccDep}</span>
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
                                                <button onClick={() => setSnPlacedCategory('BELANJA')} className={`px-4 py-2 rounded border font-bold text-sm ${snPlacedCategory === 'BELANJA' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}>BELANJA</button>
                                                <button onClick={() => setSnPlacedCategory('HASIL')} className={`px-4 py-2 rounded border font-bold text-sm ${snPlacedCategory === 'HASIL' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}>HASIL</button>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm">RM</span>
                                                <input type="number" onKeyDown={preventArrowKeys} onWheel={preventWheel} className="border-2 border-slate-300 rounded p-2 font-mono w-32 focus:border-blue-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={snAnswerExpense} onChange={e => setSnAnswerExpense(e.target.value)} />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">2. Susut Nilai Terkumpul (PKK)</label>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-lg">RM</span>
                                            <input type="number" onKeyDown={preventArrowKeys} onWheel={preventWheel} className="border-2 border-slate-300 rounded p-2 font-mono w-32 focus:border-blue-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={snAnswerSnt} onChange={e => setSnAnswerSnt(e.target.value)} />
                                            <span className="text-xs text-slate-400 italic ml-2">(SNT Terkumpul)</span>
                                        </div>
                                    </div>
                                    <div className="pt-6 flex justify-end">
                                        <Button onClick={handleSnSubmit} disabled={!snAnswerExpense || !snAnswerSnt || !snPlacedCategory}>Submit Answer</Button>
                                    </div>
                                </div>
                             </>
                        )}
                        
                        {(currentScreen === ScreenState.DRILL_ACCRUALS_L1 || currentScreen === ScreenState.DRILL_ACCRUALS_L2) && (
                            <>
                                <div className="mb-8 font-serif">
                                    <h3 className="text-lg font-bold border-b border-black inline-block mb-4">{q.title || 'Soalan'} (Level {currentScreen === ScreenState.DRILL_ACCRUALS_L1 ? '1' : '2'})</h3>
                                    <div className="mb-4">
                                        <h4 className="font-bold text-sm underline mb-1">Imbangan Duga {q.yearEndDate ? `pada ${q.yearEndDate}` : ''}</h4>
                                        <div className="border border-black p-4 font-mono text-sm relative">
                                            <div className="flex justify-between font-bold text-base">
                                                <span>{q.itemLabel}</span>
                                                <span>{q.trialBalanceAmount}</span>
                                            </div>
                                            <div className="absolute top-0 bottom-0 left-2/3 border-l border-black border-dashed"></div>
                                        </div>
                                    </div>
                                    <div className="mt-4 text-slate-800">
                                        <span className="font-bold underline">Maklumat Tambahan:</span> <br/>
                                        <span className="text-red-600 font-bold">{q.adjustmentInfo}</span>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-500 mb-2">1. PILIH JENIS PELARASAN</label>
                                        <div className="grid grid-cols-2 gap-2 mb-4">
                                            <button onClick={() => setAccrualTypeSelection('BELUM_BAYAR')} className={getBtnClass(accrualTypeSelection === 'BELUM_BAYAR', 'bg-blue-100 border-blue-500 text-blue-800 ring-1 ring-blue-500')}>Belum Bayar</button>
                                            <button onClick={() => setAccrualTypeSelection('PRABAYAR')} className={getBtnClass(accrualTypeSelection === 'PRABAYAR', 'bg-blue-100 border-blue-500 text-blue-800 ring-1 ring-blue-500')}>Prabayar</button>
                                            <button onClick={() => setAccrualTypeSelection('BELUM_TERIMA')} className={getBtnClass(accrualTypeSelection === 'BELUM_TERIMA', 'bg-blue-100 border-blue-500 text-blue-800 ring-1 ring-blue-500')}>Belum Terima</button>
                                            <button onClick={() => setAccrualTypeSelection('BELUM_TERPEROLEH')} className={getBtnClass(accrualTypeSelection === 'BELUM_TERPEROLEH', 'bg-blue-100 border-blue-500 text-blue-800 ring-1 ring-blue-500')}>Belum Terperoleh</button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-500 mb-2">2. PILIH KLASIFIKASI (PKK)</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button onClick={() => setAccrualCategorySelection('AS')} className={getBtnClass(accrualCategorySelection === 'AS', 'bg-blue-100 border-blue-500 text-blue-800 ring-1 ring-blue-500')}>Aset Semasa</button>
                                            <button onClick={() => setAccrualCategorySelection('LS')} className={getBtnClass(accrualCategorySelection === 'LS', 'bg-blue-100 border-blue-500 text-blue-800 ring-1 ring-blue-500')}>Liabiliti Semasa</button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-500 mb-2">3. KIRA AMAUN</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-400 mb-1">Amaun Akhir (Untung Rugi)</label>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-lg">RM</span>
                                                    <input type="number" onKeyDown={preventArrowKeys} onWheel={preventWheel} className="border-2 border-slate-300 rounded p-2 font-mono w-full focus:border-blue-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={accrualFinalAmount} onChange={e => setAccrualFinalAmount(e.target.value)} />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-400 mb-1">Amaun Pelarasan (PKK)</label>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-lg">RM</span>
                                                    <input type="number" onKeyDown={preventArrowKeys} onWheel={preventWheel} className="border-2 border-slate-300 rounded p-2 font-mono w-full focus:border-blue-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={accrualPkkAmount} onChange={e => setAccrualPkkAmount(e.target.value)} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-6 flex justify-end">
                                        <Button onClick={handleAccrualSubmit} disabled={!accrualTypeSelection || !accrualCategorySelection || !accrualPkkAmount || !accrualFinalAmount}>Submit Answer</Button>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* LOAN DRILL */}
                        {currentScreen === ScreenState.DRILL_LOAN && (
                             <>
                                <div className="mb-6 font-serif">
                                    <h3 className="text-lg font-bold border-b border-black inline-block mb-4">Soalan Pinjaman</h3>
                                    <div className="bg-cyan-50 p-4 border border-cyan-200 rounded mb-4 font-mono text-sm relative">
                                         <h4 className="font-bold text-xs underline mb-1 uppercase text-slate-500">Imbangan Duga pada {q.yearEndStr}</h4>
                                        <div className="flex justify-between mb-1">
                                            <span>Pinjaman Bank ({q.rate}%)</span>
                                            <span className="font-bold">{q.tbLoanBalance}</span>
                                        </div>
                                        <div className="flex justify-between text-slate-600">
                                            <span>Faedah Pinjaman</span>
                                            <span>{q.tbInterestPaid}</span>
                                        </div>
                                    </div>
                                    <p className="text-slate-800 text-sm">
                                        <span className="font-bold">Maklumat Tambahan:</span> <br/>
                                        Pinjaman RM{q.principal} dibuat pada {q.loanDateStr}. Tempoh matang pinjaman ialah pada {q.maturityDateStr}.
                                    </p>
                                </div>
                                <div className="space-y-6">
                                    {/* Section 1: Interest Expense */}
                                    <div className="bg-white p-4 rounded border border-slate-100 shadow-sm">
                                        <h4 className="font-bold text-sm text-slate-700 mb-3 border-b pb-1">1. Akaun Untung Rugi</h4>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-400 mb-1">Faedah atas Pinjaman (Belanja)</label>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-lg">RM</span>
                                                    <input 
                                                        type="number" 
                                                        onKeyDown={preventArrowKeys}
                                                        onWheel={preventWheel}
                                                        className="border-2 border-slate-300 rounded p-2 font-mono w-full focus:border-cyan-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                                                        value={loanInterestAmount} 
                                                        onChange={e => setLoanInterestAmount(e.target.value)} 
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 2: Accrued Interest (NEW - Button Selection) */}
                                    <div className="bg-white p-4 rounded border border-slate-100 shadow-sm">
                                        <h4 className="font-bold text-sm text-slate-700 mb-3 border-b pb-1">2. Penyata Kedudukan Kewangan (Pelarasan Faedah)</h4>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-400 mb-2">Pilih Jenis Pelarasan</label>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <button 
                                                        onClick={() => setLoanAdjustmentType('BELUM_BAYAR')}
                                                        className={getBtnClass(loanAdjustmentType === 'BELUM_BAYAR', 'bg-cyan-100 border-cyan-500 text-cyan-800 ring-1 ring-cyan-500')}
                                                    >
                                                        Belum Bayar (LS)
                                                    </button>
                                                    <button 
                                                        onClick={() => setLoanAdjustmentType('PRABAYAR')}
                                                        className={getBtnClass(loanAdjustmentType === 'PRABAYAR', 'bg-cyan-100 border-cyan-500 text-cyan-800 ring-1 ring-cyan-500')}
                                                    >
                                                        Prabayar (AS)
                                                    </button>
                                                </div>
                                            </div>
                                            {loanAdjustmentType && (
                                                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                                                        Amaun {loanAdjustmentType === 'BELUM_BAYAR' ? 'Faedah Belum Bayar' : 'Faedah Prabayar'}
                                                    </label>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-lg">RM</span>
                                                        <input 
                                                            type="number" 
                                                            onKeyDown={preventArrowKeys}
                                                            onWheel={preventWheel}
                                                            className="border-2 border-slate-300 rounded p-2 font-mono w-full focus:border-cyan-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                                                            value={loanAccruedAmount} 
                                                            onChange={e => setLoanAccruedAmount(e.target.value)} 
                                                            placeholder="Masukkan amaun pelarasan"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Section 3: Liability Split */}
                                    <div className="bg-white p-4 rounded border border-slate-100 shadow-sm">
                                        <h4 className="font-bold text-sm text-slate-700 mb-3 border-b pb-1">3. Pinjaman (PKK)</h4>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-400 mb-1">Pinjaman (Liabiliti Semasa)</label>
                                                <input 
                                                    type="number" 
                                                    onKeyDown={preventArrowKeys}
                                                    onWheel={preventWheel}
                                                    placeholder="Amaun perlu dibayar 12 bulan hadapan"
                                                    className="border-2 border-slate-300 rounded p-2 font-mono w-full focus:border-cyan-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                                                    value={loanLsAmount} 
                                                    onChange={e => setLoanLsAmount(e.target.value)} 
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-400 mb-1">Pinjaman (Liabiliti Bukan Semasa)</label>
                                                <input 
                                                    type="number" 
                                                    onKeyDown={preventArrowKeys}
                                                    onWheel={preventWheel}
                                                    placeholder="Baki selepas Liabiliti Semasa"
                                                    className="border-2 border-slate-300 rounded p-2 font-mono w-full focus:border-cyan-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                                                    value={loanLbsAmount} 
                                                    onChange={e => setLoanLbsAmount(e.target.value)} 
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-2 flex justify-end">
                                        <Button 
                                            onClick={handleLoanSubmit} 
                                            disabled={!loanInterestAmount || !loanAdjustmentType || !loanAccruedAmount || !loanLsAmount || !loanLbsAmount}
                                        >
                                            Submit Answer
                                        </Button>
                                    </div>
                                </div>
                             </>
                        )}
                        
                        {/* INLINE FEEDBACK (Generic for PHR/SN/Accruals/Loan) */}
                        {drillFeedback && (
                            <div className={`mt-6 p-4 rounded-lg border-2 ${drillFeedback.isCorrect ? 'bg-green-50 border-green-200 text-green-900' : 'bg-red-50 border-red-200 text-red-900'} animate-in fade-in slide-in-from-top-2`}>
                                <div className="font-bold text-lg mb-2 flex items-center gap-2">
                                    {drillFeedback.isCorrect ? (
                                        <><span className="text-2xl">✓</span> Betul!</>
                                    ) : (
                                        <><span className="text-2xl">✗</span> Salah</>
                                    )}
                                </div>
                                <div className="whitespace-pre-line mb-4 text-sm font-medium">{drillFeedback.message}</div>
                                <div className="flex justify-end">
                                    <Button variant="secondary" onClick={() => {
                                        setDrillFeedback(null);
                                        
                                        if (currentDrillIndex < queue.length - 1) {
                                            // Reset inputs logic based on screen...
                                            if (currentScreen === ScreenState.DRILL_PHR) { setDrillAnswerPhr(''); setDrillAnswerAmt(''); setDrillPlacedCategory(null); }
                                            else if (currentScreen === ScreenState.DRILL_SN) { setSnAnswerExpense(''); setSnAnswerSnt(''); setSnPlacedCategory(null); }
                                            else if (currentScreen === ScreenState.DRILL_LOAN) { setLoanInterestAmount(''); setLoanAdjustmentType(null); setLoanAccruedAmount(''); setLoanLsAmount(''); setLoanLbsAmount(''); }
                                            else { setAccrualTypeSelection(null); setAccrualCategorySelection(null); setAccrualPkkAmount(''); setAccrualFinalAmount(''); }
                                            setCurrentDrillIndex(i => i + 1);
                                        } else {
                                            handleGameWin(currentScreen);
                                        }
                                    }}>
                                        {currentDrillIndex < queue.length - 1 ? "Teruskan" : "Selesai"}
                                    </Button>
                                </div>
                            </div>
                        )}
                  </div>
                  <div className="mt-8 text-center">
                      <button onClick={() => setCurrentScreen(ScreenState.MENU)} className="text-slate-500 underline text-sm">Exit</button>
                  </div>
              </div>
          </div>
      )
  }

  if (currentScreen === ScreenState.LEADERBOARD) {
    return (
        <LeaderboardView 
            onBack={() => setCurrentScreen(ScreenState.MENU)} 
            currentLevelId={selectedLevelId} 
        />
    );
  }

  return (
      <div className="flex items-center justify-center h-screen bg-red-100 text-red-600 p-8 text-center font-bold">
          Error: Unknown State
      </div>
  );
}