import React, { useEffect, useState } from 'react';
import { Button } from './Button';
import {
  PARTNERSHIP_INTEREST_QUESTIONS, PARTNERSHIP_SALARY_QUESTIONS,
  getPartnershipFields, gradePartnershipAnswers, getPartnershipExplanation,
} from '../partnership';
import type { PartnershipTopic, PartnershipAnswerKey, PartnershipQuestion } from '../partnership';

interface Props {
  topic: PartnershipTopic;
  onBack: () => void;
  onComplete: (score: number, time: number) => void;
}

const money = (amount: number) => new Intl.NumberFormat('ms-MY').format(amount);

export const PartnershipDrill: React.FC<Props> = ({ topic, onBack, onComplete }) => {
  const [queue, setQueue] = useState<PartnershipQuestion[]>(() => [...(topic === 'INTEREST' ? PARTNERSHIP_INTEREST_QUESTIONS : PARTNERSHIP_SALARY_QUESTIONS)]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [answers, setAnswers] = useState<Partial<Record<PartnershipAnswerKey, string>>>({});
  const [feedback, setFeedback] = useState<ReturnType<typeof gradePartnershipAnswers> | null>(null);
  const q = queue[index];
  const fields = getPartnershipFields(q);
  const title = topic === 'INTEREST' ? 'Faedah atas Pinjaman' : 'Gaji Pekongsi';
  const progress = Math.round((index + 1) / queue.length * 100);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const timer = window.setInterval(() => setElapsed(value => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (feedback || fields.some(field => !answers[field.key]?.trim())) return;
    const result = gradePartnershipAnswers(q, answers);
    setFeedback(result);
    setScore(value => value + (result.isCorrect ? (q.isPenalty ? 1 : 2) : -1));
    if (!result.isCorrect) {
      setQueue(value => [...value,
        { ...q, id: `${q.id}-retry-${value.length}`, isPenalty: true },
        { ...q, id: `${q.id}-retry-${value.length + 1}`, isPenalty: true },
      ]);
    }
  };

  const next = () => {
    if (index === queue.length - 1) { onComplete(score, elapsed); return; }
    setIndex(value => value + 1);
    setAnswers({});
    setFeedback(null);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <div className="app-background">
      <main className="drill-shell">
        <div className="drill-topbar">
          <div className="brand-lockup" aria-label="Akaun Master">
            <span className="brand-symbol">A</span>
            <span><span className="brand-name block">Akaun Master</span><span className="brand-caption block">Latihan Perakaunan</span></span>
          </div>
          <div className="drill-nav-actions">
            <button className="icon-button" onClick={onBack} aria-label="返回主页">←</button>
            <div className="score-pill">得分 {score}</div>
          </div>
        </div>
        <div className="drill-meta">
          <div><span className="eyebrow">Perkongsian</span><h1>{title}</h1></div>
          <div className="flex flex-wrap gap-2 items-center">
            <div className="drill-counter">第 {index + 1} 题 / 共 {queue.length} 题</div>
            {q.isPenalty && <span className="text-xs text-rose-600 font-bold">复习题</span>}
          </div>
        </div>
        <div className="progress-track" aria-label={`练习进度 ${progress}%`}><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
        <article className={`drill-card ${q.isPenalty ? 'is-penalty' : ''}`}>
          <h2 className="text-xl font-bold text-[#0f2942] mb-3">Perkongsian {q.partnership}</h2>
          <p className="text-sm text-slate-600 mb-4">Maklumat berikut adalah bagi tahun berakhir {q.yearEnd}.</p>
          <div className="question-ledger ledger-purple mb-5">
            <h3 className="text-lg mb-3">Petikan Imbangan Duga pada {q.yearEnd}</h3>
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-200"><th scope="col" className="text-left pb-2">Butiran</th><th scope="col" className="text-right pb-2">Debit (RM)</th><th scope="col" className="text-right pb-2">Kredit (RM)</th></tr></thead>
              <tbody>
                {topic === 'INTEREST' && <tr><td className="py-2">Pinjaman {q.partner}</td><td className="text-right">—</td><td className="text-right font-mono">{money(q.principal!)}</td></tr>}
                {q.paid > 0 && <tr><td className="py-2">{topic === 'INTEREST' ? 'Faedah atas Pinjaman' : 'Gaji'} {q.partner}</td><td className="text-right font-mono">{money(q.paid)}</td><td className="text-right">—</td></tr>}
                {topic === 'SALARY' && q.paid === 0 && <>
                  <tr><td className="py-2">Bank</td><td className="text-right font-mono">12,500</td><td className="text-right">—</td></tr>
                  <tr><td className="py-2">Modal {q.partner}</td><td className="text-right">—</td><td className="text-right font-mono">40,000</td></tr>
                </>}
              </tbody>
            </table>
          </div>
          <section className="mb-6 text-sm leading-relaxed text-slate-700">
            <h3 className="text-lg mb-2">Maklumat Tambahan</h3>
            {topic === 'INTEREST' ? <>
              <p>Ikatan perjanjian perkongsian menetapkan faedah atas pinjaman {q.partner} pada kadar {q.rate}% setahun. Pinjaman RM{money(q.principal!)} telah wujud sepanjang tahun dan amaunnya tidak berubah.</p>
              <p className="mt-2">{q.paid === 0 ? 'Tiada faedah atas pinjaman pekongsi telah dibayar atau direkodkan dalam Imbangan Duga.' : 'Faedah dalam Imbangan Duga ialah faedah yang telah dibayar.'} Baki faedah yang belum dibayar hendaklah dikreditkan ke Akaun Semasa {q.partner}.</p>
            </> : <>
              <p>Ikatan perjanjian perkongsian memperuntukkan gaji {q.partner} sebanyak RM{money(q.annualEntitlement)} bagi setahun penuh.</p>
              <p className="mt-2">{q.paid === 0 ? `Tiada gaji ${q.partner} telah dibayar atau direkodkan dalam Imbangan Duga.` : 'Gaji dalam Imbangan Duga ialah gaji pekongsi yang telah dibayar.'} Baki gaji yang belum dibayar hendaklah dikreditkan ke Akaun Semasa {q.partner}.</p>
            </>}
          </section>
          <form onSubmit={submit}>
            <h3 className="text-lg mb-2">Anda Dikehendaki</h3>
            <p className="text-sm text-slate-600 mb-4">Nyatakan amaun bagi tahun semasa. Bagi Akaun Semasa, nyatakan pelarasan bersih belum bayar sahaja, bukan baki akhir akaun. Jika tiada catatan, masukkan 0.</p>
            <div className="space-y-4">
              {fields.map((field, number) => <div key={field.key}>
                <label className="block text-sm font-bold text-slate-700 mb-2" htmlFor={`partnership-${field.key}`}>{number + 1}. {field.label}</label>
                <div className="flex items-center gap-3"><span className="text-sm text-slate-500">RM</span>
                  <input id={`partnership-${field.key}`} type="number" min="0" step="0.01" inputMode="decimal" required
                    className="w-full p-3 text-sm font-mono" value={answers[field.key] ?? ''} disabled={!!feedback}
                    onWheel={event => event.currentTarget.blur()}
                    onKeyDown={event => { if (['ArrowUp', 'ArrowDown'].includes(event.key)) event.preventDefault(); }}
                    onChange={event => setAnswers(value => ({ ...value, [field.key]: event.target.value }))} />
                </div>
              </div>)}
            </div>
            {!feedback && <div className="mt-5 flex justify-end"><Button type="submit" disabled={fields.some(field => !answers[field.key]?.trim())}>提交答案</Button></div>}
          </form>
          {feedback && <section className={`feedback-card ${feedback.isCorrect ? 'correct' : 'incorrect'}`} aria-live="polite">
            <h3 className="text-xl mb-3">{feedback.isCorrect ? 'Jawapan Tepat!' : 'Jawapan Salah'}</h3>
            <div className="space-y-3 mb-5">
              {feedback.fields.map(field => <div key={field.key} className="border-b border-slate-200 pb-2 text-sm">
                <p className={`font-bold ${field.correct ? 'text-green-700' : 'text-rose-700'}`}>{field.correct ? '✓' : '✗'} {field.label}</p>
                <p className="text-slate-600 mt-1">你的答案：RM{field.submitted} · 正确答案：RM{money(field.expected)}</p>
              </div>)}
            </div>
            <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{getPartnershipExplanation(q)}</p>
            {!feedback.isCorrect && <p className="text-sm text-rose-700 mt-3">这道题会在后面再练习两次，巩固正确的入账方式。</p>}
            <Button className="w-full mt-5" onClick={next}>{index < queue.length - 1 ? '下一题' : '完成练习'}</Button>
          </section>}
        </article>
        <div className="mt-6 text-center"><button className="text-xs font-bold text-slate-500" onClick={onBack}>退出练习</button></div>
      </main>
    </div>
  );
};

