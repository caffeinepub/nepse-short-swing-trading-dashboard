import { useState } from 'react';
import { useTradingContext } from '../contexts/TradingContext';
import { ChevronDown, ChevronUp, CheckSquare, Square } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export function OperationalChecklist() {
  const { state, updateChecklist, getChecklistCompletion } = useTradingContext();
  const { checklist } = state;
  const [open, setOpen] = useState(true);
  const completion = getChecklistCompletion();
  const total = 7;
  const pct = Math.round((completion / total) * 100);
  const rValue = state.accountEquity * 0.01 * state.settings.maxDailyLossR;

  const CheckItem = ({ checked, label, onChange, extra }: { checked: boolean; label: string; onChange: () => void; extra?: React.ReactNode }) => (
    <div className="flex items-start gap-2 py-1.5 border-b border-terminal-border/30 last:border-0">
      <button onClick={onChange} className="mt-0.5 shrink-0 text-terminal-amber hover:text-terminal-amber/80 transition-colors">
        {checked ? <CheckSquare size={16} className="text-terminal-success" /> : <Square size={16} />}
      </button>
      <div className="flex-1">
        <span className={`text-sm font-mono ${checked ? 'text-terminal-muted line-through' : 'text-terminal-fg'}`}>{label}</span>
        {extra}
      </div>
    </div>
  );

  return (
    <div className="terminal-card slide-in">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 hover:bg-terminal-border/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="font-display text-terminal-amber text-sm font-bold uppercase tracking-wider">
            📋 Daily Operational Checklist
          </span>
          <span className={`text-xs font-mono px-2 py-0.5 rounded ${pct === 100 ? 'bg-terminal-success/20 text-terminal-success border border-terminal-success' : 'bg-terminal-amber/20 text-terminal-amber border border-terminal-amber/50'}`}>
            {completion}/{total}
          </span>
        </div>
        {open ? <ChevronUp size={16} className="text-terminal-muted" /> : <ChevronDown size={16} className="text-terminal-muted" />}
      </button>

      {open && (
        <div className="px-4 pb-4">
          <div className="mb-3">
            <div className="flex justify-between text-xs font-mono text-terminal-muted mb-1">
              <span>Completion</span>
              <span className={pct === 100 ? 'text-terminal-success font-bold' : 'text-terminal-amber'}>{pct}%</span>
            </div>
            <Progress value={pct} className="h-1.5 bg-terminal-border" />
          </div>

          <div className="space-y-0">
            <CheckItem
              checked={checklist.edisCompleted}
              label="EDIS completed for all T+1 sell trades?"
              onChange={() => updateChecklist({ edisCompleted: !checklist.edisCompleted })}
            />
            <CheckItem
              checked={checklist.noDeliveryCheck}
              label="No-delivery period check done for holdings near book-close?"
              onChange={() => updateChecklist({ noDeliveryCheck: !checklist.noDeliveryCheck })}
            />
            <CheckItem
              checked={checklist.marginBuffer}
              label="Margin buffer > 20%?"
              onChange={() => updateChecklist({ marginBuffer: !checklist.marginBuffer })}
              extra={
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-terminal-muted text-xs font-mono">Buffer:</span>
                  <input
                    type="text"
                    value={checklist.marginBufferPct}
                    onChange={e => updateChecklist({ marginBufferPct: e.target.value })}
                    placeholder="e.g. 35%"
                    className="bg-terminal-bg border border-terminal-border rounded text-terminal-amber font-mono text-xs px-2 py-0.5 w-20 focus:outline-none focus:border-terminal-amber"
                  />
                </div>
              }
            />
            <CheckItem
              checked={checklist.maxLossConfirmed}
              label={`Max daily loss limit confirmed: 2R = NPR ${rValue > 0 ? rValue.toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '____'}`}
              onChange={() => updateChecklist({ maxLossConfirmed: !checklist.maxLossConfirmed })}
            />
            <CheckItem
              checked={checklist.positionCapsReviewed}
              label="Position size caps reviewed (≤10% of avg turnover)?"
              onChange={() => updateChecklist({ positionCapsReviewed: !checklist.positionCapsReviewed })}
            />
            <CheckItem
              checked={checklist.preDefinedPlan}
              label="Pre-defined entry + stop + size for all planned trades?"
              onChange={() => updateChecklist({ preDefinedPlan: !checklist.preDefinedPlan })}
            />
            <CheckItem
              checked={checklist.biasCheckCompleted}
              label="Bias self-check completed (see Behavioral Audit section)?"
              onChange={() => updateChecklist({ biasCheckCompleted: !checklist.biasCheckCompleted })}
            />
          </div>

          {pct === 100 && (
            <div className="mt-3 p-2 bg-terminal-success/10 border border-terminal-success/30 rounded text-terminal-success text-xs font-mono text-center">
              ✓ All checks complete — Trade Ideas unlocked
            </div>
          )}
        </div>
      )}
    </div>
  );
}
