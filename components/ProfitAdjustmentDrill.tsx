import React, { useEffect, useState } from 'react';
import { Button } from './Button';
import { PROFIT_ADJUSTMENT_QUESTIONS, gradeProfitAdjustmentAnswers, getProfitAdjustmentReason } from '../profit-adjustment';
import type { ProfitAdjustmentQuestion, ProfitAdjustmentAnswer, ProfitDirection } from '../profit-adjustment';

interface Props {
  onBack: () => void;
  onComplete: (score: number, time: number) => void;
}

const money = (amount: number) => new Intl.NumberFormat('ms-MY').format(amount);
const directionLabels: Record<ProfitDirection, string> = { ADD: 'Tambah (+)', SUBTRACT: 'Tolak (−)', NONE: 'Tiada Pelarasan' };

export const ProfitAdjustmentDrill: React.FC<Props> = ({ onBack, onComplete }) => {
  const [queue, setQueue] = useState<ProfitAdjustmentQuestion[]>(() => [...PROFIT_ADJUSTMENT_QUESTIONS]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [answers, setAnswers] = useState<Record<string, ProfitAdjustmentAnswer>>({});
  const [finalAnswer, setFinalAnswer] = useState('');
  const [feedback, setFeedback] = useState<ReturnType<typeof gradeProfitAdjustmentAnswers> | null>(null);
  const q = queue[index];
  const progress = Math.round((index + 1) / queue.length * 100);
  const incomplete = q.items.some(item => !answers[item.id]?.direction);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const timer = window.setInterval(() => setElapsed(value => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (feedback || incomplete) return;
    const result = gradeProfitAdjustmentAnswers(q, answers, finalAnswer);
    setFeedback(result);
    setScore(value => value + (result.isCorrect ? (q.isPenalty ? 1 : 2) : -1));
    if (!result.isCorrect) setQueue(value => [...value,
      { ...q, id: `${q.id}-retry-${value.length}`, isPenalty: true },
      { ...q, id: `${q.id}-retry-${value.length + 1}`, isPenalty: true },
    ]);
  };

  const next = () => {
    if (index === queue.length - 1) { onComplete(score, elapsed); return; }
    setIndex(value => value + 1);
    setAnswers({}); setFinalAnswer(''); setFeedback(null);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  const additions = feedback?.fields.filter(item => item.direction === 'ADD').reduce((sum, item) => sum + item.amount, 0) ?? 0;
  const deductions = feedback?.fields.filter(item => item.direction === 'SUBTRACT').reduce((sum, item) => sum + item.amount, 0) ?? 0;

  return <div className="app-background"><main className="drill-shell">
    <div className="drill-topbar">
      <div className="brand-lockup" aria-label="Akaun Master"><span className="brand-symbol">A</span><span><span className="brand-name block">Akaun Master</span><span className="brand-caption block">会计练习平台</span></span></div>
      <div className="drill-nav-actions"><button className="icon-button" onClick={onBack} aria-label="返回主页">←</button><div className="score-pill">得分 {score}</div></div>
    </div>
    <div className="drill-meta">
      <div><span className="eyebrow">Perkongsian</span><h1>Penyata Pelarasan Untung Rugi</h1></div>
      <div className="flex flex-wrap gap-2 items-center"><div className="drill-counter">第 {index + 1} 题 / 共 {queue.length} 题</div>{q.isPenalty && <span className="text-xs text-rose-600 font-bold">复习题</span>}</div>
    </div>
    <div className="progress-track" aria-label={`练习进度 ${progress}%`}><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
    <article className={`drill-card ${q.isPenalty ? 'is-penalty' : ''}`}>
      <h2 className="text-xl font-bold text-[#0f2942] mb-3">Perkongsian {q.partnership}</h2>
      <div className="question-ledger ledger-amber mb-5 text-sm">
        <p>Untung bersih bagi tahun berakhir 31 Disember 2024 sebelum pelarasan:</p>
        <p className="font-mono text-2xl font-bold text-[#0f2942] mt-2">RM{money(q.initialProfit)}</p>
      </div>
      <h3 className="text-lg mb-2">附加资料与调整</h3>
      <p className="text-sm text-slate-600 mb-5">选择加减方向，填写金额与调整后净利润；金额留空按 0 计算。</p>
      <form onSubmit={submit}>
        <div className="space-y-5">
          {q.items.map((item, number) => <section key={item.id} className="border border-slate-200 rounded-xl p-4">
            <h4 className="font-bold text-sm text-slate-700">{number + 1}. {item.label}</h4>
            <p className="text-sm leading-relaxed text-slate-600 mt-2 mb-4">{item.information}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><label className="block text-xs font-bold text-slate-600 mb-2" htmlFor={`direction-${item.id}`}>对净利润的调整方向</label>
                <select id={`direction-${item.id}`} required disabled={!!feedback} value={answers[item.id]?.direction ?? ''}
                  className="w-full border border-slate-300 rounded-xl bg-white px-3 py-3 text-sm"
                  onChange={event => setAnswers(value => ({ ...value, [item.id]: { ...value[item.id], direction: event.target.value as ProfitDirection } }))}>
                  <option value="">请选择调整方向</option><option value="ADD">Tambah (+)</option><option value="SUBTRACT">Tolak (−)</option><option value="NONE">Tiada Pelarasan</option>
                </select>
              </div>
              <div><label className="block text-xs font-bold text-slate-600 mb-2" htmlFor={`amount-${item.id}`}>Amaun Pelarasan (RM)</label>
                <input id={`amount-${item.id}`} type="number" min="0" step="0.01" inputMode="decimal" disabled={!!feedback}
                  value={answers[item.id]?.amount ?? ''} className="w-full p-3 text-sm font-mono"
                  onWheel={event => event.currentTarget.blur()}
                  onKeyDown={event => { if (['ArrowUp', 'ArrowDown'].includes(event.key)) event.preventDefault(); }}
                  onChange={event => setAnswers(value => ({ ...value, [item.id]: { ...value[item.id], amount: event.target.value } }))} />
              </div>
            </div>
          </section>)}
        </div>
        <div className="mt-5"><label htmlFor="adjusted-profit" className="block font-bold text-sm text-slate-700 mb-2">Untung Bersih Terselaras (RM)</label>
          <input id="adjusted-profit" type="number" min="0" step="0.01" inputMode="decimal" disabled={!!feedback} value={finalAnswer}
            className="w-full p-3 font-mono" onWheel={event => event.currentTarget.blur()}
            onKeyDown={event => { if (['ArrowUp', 'ArrowDown'].includes(event.key)) event.preventDefault(); }}
            onChange={event => setFinalAnswer(event.target.value)} />
        </div>
        {!feedback && <div className="flex justify-end mt-5"><Button type="submit" disabled={incomplete}>提交答案</Button></div>}
      </form>
      {feedback && <section className={`feedback-card ${feedback.isCorrect ? 'correct' : 'incorrect'}`} aria-live="polite">
        <h3 className="text-xl mb-3">{feedback.isCorrect ? '回答正确！' : '回答错误'}</h3>
        <div className="space-y-4">
          {feedback.fields.map(item => <div key={item.id} className="border-b border-slate-200 pb-3 text-sm leading-relaxed">
            <h4 className={`font-bold ${item.correct ? 'text-green-700' : 'text-rose-700'}`}>{item.correct ? '✓' : '✗'} {item.label}</h4>
            <p className="text-slate-600">你的答案：{answers[item.id]?.direction ? directionLabels[answers[item.id].direction!] : '—'} RM{answers[item.id]?.amount || '0'}</p>
            <p className="font-bold text-slate-700">正确答案：{directionLabels[item.direction]} RM{money(item.amount)}</p>
            {item.calculation && <p className="font-mono mt-1">{item.calculation}</p>}
            <p className="text-slate-700 mt-1">{getProfitAdjustmentReason(item).malay}</p>
            <p className="text-slate-700 mt-1">中文说明：{getProfitAdjustmentReason(item).chinese}</p>
            {item.id === 'loan' && item.calculation?.includes(' - ') && <p className="text-slate-700 mt-1">已付利息已计入费用，只扣尚未计入的差额，避免重复扣除。</p>}
          </div>)}
        </div>
        <div className="question-ledger mt-4 text-sm space-y-2">
          <h3 className="text-lg">Penyata Pelarasan Untung Rugi</h3>
          <div className="flex justify-between gap-3"><span>Untung Bersih Sebelum Pelarasan</span><span className="font-mono">RM{money(q.initialProfit)}</span></div>
          <div className="flex justify-between gap-3"><span>Tambah (+)</span><span className="font-mono">RM{money(additions)}</span></div>
          <div className="flex justify-between gap-3"><span>Tolak (−)</span><span className="font-mono">RM{money(deductions)}</span></div>
          <div className="flex justify-between gap-3 border-t border-slate-300 pt-2 font-bold"><span>{feedback.finalCorrect ? '✓' : '✗'} Untung Bersih Terselaras</span><span className="font-mono">RM{money(feedback.expectedProfit)}</span></div>
        </div>
        <p className="text-sm text-slate-700 mt-3">中文说明：调整后净利润 = 原净利润 + 加回金额 - 扣除金额 = RM{money(q.initialProfit)} + RM{money(additions)} - RM{money(deductions)} = RM{money(feedback.expectedProfit)}。</p>
        {!feedback.isCorrect && <p className="text-sm text-rose-700 mt-3">这道题会在后面再练习两次，巩固加减方向。</p>}
        <Button className="w-full mt-5" onClick={next}>{index < queue.length - 1 ? '下一题' : '完成练习'}</Button>
      </section>}
    </article>
    <div className="mt-6 text-center"><button className="text-xs font-bold text-slate-500" onClick={onBack}>退出练习</button></div>
  </main></div>;
};

