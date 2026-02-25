import { useTradingContext } from '../contexts/TradingContext';
import { getTodayNSTString } from '../utils/nepalTime';
import { BiasAnswer } from '../types/trading';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

const QUESTIONS = [
  {
    key: 'q1' as const,
    text: 'Am I chasing a stock that\'s already up 3+ consecutive days?',
    warningIfYes: '⚠️ HERDING TRAP. Await pullback or skip this trade. Entry after 3 green days has negative expected value in NEPSE thin liquidity.',
    warningColor: 'text-orange-400',
    warnOn: 'YES',
  },
  {
    key: 'q2' as const,
    text: 'Am I holding a loser longer than my pre-defined stop because "it will come back"?',
    warningIfYes: '⚠️ LOSS AVERSION + DISPOSITION EFFECT. Exit at stop. No exceptions. Every day past stop increases expected loss by compounding.',
    warningColor: 'text-terminal-danger',
    warnOn: 'YES',
  },
  {
    key: 'q3' as const,
    text: 'Am I overconfident after 3+ consecutive winning trades?',
    warningIfYes: '⚠️ OVERCONFIDENCE BIAS. Reduce position size by 50% today. Win streaks in NEPSE often precede mean-reversion.',
    warningColor: 'text-orange-400',
    warnOn: 'YES',
  },
  {
    key: 'q4' as const,
    text: 'Did I pre-define entry price, stop price, AND position size for each trade before market open?',
    warningIfYes: '',
    warningIfNo: '🚫 DO NOT TRADE TODAY. No pre-defined plan = no edge. Trading without a plan is speculation, not strategy.',
    warningColor: 'text-terminal-danger',
    warnOn: 'NO',
  },
  {
    key: 'q5' as const,
    text: 'Is my chase rate this month above 15% (too many trades entered after 3 green days)?',
    warningIfYes: '⚠️ Chase rate exceeds 15% threshold. Reduce trade frequency this week. Review each entry for herding bias before executing.',
    warningColor: 'text-yellow-400',
    warnOn: 'YES',
  },
];

function AnswerToggle({ value, onChange }: { value: BiasAnswer; onChange: (v: BiasAnswer) => void }) {
  const options: BiasAnswer[] = ['YES', 'NO', 'UNSURE'];
  return (
    <div className="flex gap-1">
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onChange(value === opt ? null : opt)}
          className={`px-2 py-0.5 rounded text-xs font-mono font-bold border transition-all ${
            value === opt
              ? opt === 'YES'
                ? 'bg-terminal-danger/20 border-terminal-danger text-terminal-danger'
                : opt === 'NO'
                ? 'bg-terminal-success/20 border-terminal-success text-terminal-success'
                : 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
              : 'bg-terminal-bg border-terminal-border text-terminal-muted hover:border-terminal-amber/50'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export function BiasAudit() {
  const { state, updateBiasAudit } = useTradingContext();
  const today = getTodayNSTString();
  const audit = state.biasAudit[today] || {
    date: today,
    q1: null,
    q2: null,
    q3: null,
    q4: null,
    q5: null,
    planAdherenceScore: 3,
    completed: false,
  };

  const handleAnswer = (key: 'q1' | 'q2' | 'q3' | 'q4' | 'q5', value: BiasAnswer) => {
    const updated = { ...audit, [key]: value };
    const allAnswered = updated.q1 !== null && updated.q2 !== null && updated.q3 !== null && updated.q4 !== null && updated.q5 !== null;
    updateBiasAudit(today, { [key]: value, completed: allAnswered });
  };

  const handleSlider = (val: number[]) => {
    updateBiasAudit(today, { planAdherenceScore: val[0] });
  };

  // Determine bias status
  const hasElevatedBias =
    audit.q1 === 'YES' ||
    audit.q2 === 'YES' ||
    audit.q3 === 'YES' ||
    audit.q4 === 'NO' ||
    audit.q5 === 'YES';

  const allAnswered = audit.q1 !== null && audit.q2 !== null && audit.q3 !== null && audit.q4 !== null && audit.q5 !== null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="section-title">🧠 Behavioral Bias Daily Audit</h2>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded border text-xs font-mono font-bold ${
          !allAnswered
            ? 'border-terminal-border text-terminal-muted'
            : hasElevatedBias
            ? 'bg-orange-500/10 border-orange-500 text-orange-400'
            : 'bg-terminal-success/10 border-terminal-success text-terminal-success'
        }`}>
          {!allAnswered ? (
            <><AlertTriangle size={12} /> AUDIT PENDING</>
          ) : hasElevatedBias ? (
            <><AlertTriangle size={12} /> BIAS STATUS: ELEVATED ⚠️</>
          ) : (
            <><CheckCircle size={12} /> BIAS STATUS: LOW RISK ✅</>
          )}
        </div>
      </div>

      <div className="terminal-card p-4 space-y-4">
        {QUESTIONS.map((q, idx) => {
          const answer = audit[q.key];
          const showWarning = q.warnOn === 'YES' ? answer === 'YES' : answer === 'NO';
          const warningText = q.warnOn === 'YES' ? q.warningIfYes : (q as { warningIfNo?: string }).warningIfNo;

          return (
            <div key={q.key} className="border-b border-terminal-border/30 pb-3 last:border-0 last:pb-0">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-terminal-fg text-sm font-mono">
                    <span className="text-terminal-muted mr-2">Q{idx + 1}:</span>
                    {q.text}
                  </p>
                </div>
                <AnswerToggle value={answer} onChange={v => handleAnswer(q.key, v)} />
              </div>
              {showWarning && warningText && (
                <div className={`mt-2 p-2 rounded border border-current/30 bg-current/5 text-xs font-mono font-bold ${q.warningColor}`}>
                  {warningText}
                </div>
              )}
            </div>
          );
        })}

        {/* Plan Adherence Slider */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-terminal-muted text-xs font-mono uppercase tracking-wider">Daily Plan Adherence Score</span>
            <span className={`font-display text-lg font-bold tabular-nums ${
              audit.planAdherenceScore >= 4 ? 'text-terminal-success' :
              audit.planAdherenceScore >= 3 ? 'text-yellow-400' : 'text-terminal-danger'
            }`}>
              {audit.planAdherenceScore}/5
            </span>
          </div>
          <Slider
            value={[audit.planAdherenceScore]}
            onValueChange={handleSlider}
            min={0}
            max={5}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs font-mono text-terminal-muted mt-1">
            <span>0 — No adherence</span>
            <span>5 — Perfect execution</span>
          </div>
          {audit.planAdherenceScore < 3 && audit.planAdherenceScore > 0 && (
            <p className="text-terminal-danger text-xs font-mono mt-1 font-bold">
              🚫 Plan adherence score below 3/5. Consider paper trading until discipline improves.
            </p>
          )}
        </div>

        {allAnswered && !hasElevatedBias && (
          <div className="p-2 bg-terminal-success/10 border border-terminal-success/30 rounded text-terminal-success text-xs font-mono text-center">
            ✓ Bias audit complete — No elevated bias detected. Proceed with discipline.
          </div>
        )}
      </div>
    </section>
  );
}
