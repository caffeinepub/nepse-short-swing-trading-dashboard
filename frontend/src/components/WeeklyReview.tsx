import { useState } from 'react';
import { useTradingContext } from '../contexts/TradingContext';
import { isSunday, getTodayNSTString } from '../utils/nepalTime';
import { generateRecommendations, WeeklyMetrics } from '../utils/weeklyRecommendations';
import { calculateWinRate, calculateAvgWinLoss, calculateMaxDrawdown } from '../utils/metrics';
import { Printer, ChevronDown, ChevronUp, BarChart2 } from 'lucide-react';

export function WeeklyReview() {
  const { state, setWeeklyReviewVisible } = useTradingContext();
  const [manualOpen, setManualOpen] = useState(false);
  const isVisible = isSunday() || state.weeklyReviewVisible || manualOpen;

  const { closedTrades, manualMetrics, settings } = state;

  // Compute weekly metrics from last 7 days of closed trades
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weekTrades = closedTrades.filter(t => t.exitDate && new Date(t.exitDate) >= weekAgo);

  const hitRate = calculateWinRate(weekTrades);
  const avgWinLoss = calculateAvgWinLoss(weekTrades);
  const maxDrawdown = calculateMaxDrawdown(weekTrades);
  const rValue = state.accountEquity * 0.01;
  const maxDrawdownR = rValue > 0 ? maxDrawdown / rValue : 0;

  // Playbook performance this week
  const playbookMap: Record<string, { pnls: number[]; rVals: number[] }> = {};
  weekTrades.forEach(t => {
    if (!t.exitPrice) return;
    const pnl = (t.exitPrice - t.entryPrice) * t.size;
    if (!playbookMap[t.playbook]) playbookMap[t.playbook] = { pnls: [], rVals: [] };
    playbookMap[t.playbook].pnls.push(pnl);
    playbookMap[t.playbook].rVals.push(t.rValue);
  });

  let bestPlaybook = '—';
  let bestR = -Infinity;
  let worstPlaybook = '—';
  let worstR = Infinity;

  Object.entries(playbookMap).forEach(([name, { pnls, rVals }]) => {
    const avgR = rVals.length > 0 && rVals[0] > 0
      ? pnls.reduce((s, p) => s + p, 0) / pnls.length / rVals[0]
      : 0;
    if (avgR > bestR) { bestR = avgR; bestPlaybook = name; }
    if (avgR < worstR) { worstR = avgR; worstPlaybook = name; }
  });

  const metrics: WeeklyMetrics = {
    hitRate,
    avgWinLoss,
    maxDrawdown,
    maxDrawdownR,
    ruleAdherencePct: manualMetrics.ruleAdherencePct,
    edisErrors: manualMetrics.edisErrorsThisWeek,
    chaseRate: manualMetrics.planAdherenceScore,
    planAdherenceAvg: manualMetrics.planAdherenceScore,
    bestPlaybook: bestPlaybook.split(' ').slice(0, 4).join(' '),
    bestPlaybookR: bestR === -Infinity ? 0 : bestR,
    worstPlaybook: worstPlaybook.split(' ').slice(0, 4).join(' '),
    worstPlaybookR: worstR === Infinity ? 0 : worstR,
  };

  const recommendations = generateRecommendations(metrics);

  const MetricRow = ({ label, value, target, good }: { label: string; value: string; target: string; good: boolean }) => (
    <div className="flex items-center justify-between py-1.5 border-b border-terminal-border/20 last:border-0">
      <span className="text-terminal-muted text-xs font-mono">{label}</span>
      <div className="flex items-center gap-3">
        <span className={`font-mono text-xs font-bold ${good ? 'text-terminal-success' : 'text-terminal-danger'}`}>{value}</span>
        <span className="text-terminal-muted text-xs font-mono">(target: {target})</span>
      </div>
    </div>
  );

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="section-title">📊 Weekly Review Module</h2>
        <button
          onClick={() => { setManualOpen(o => !o); setWeeklyReviewVisible(!manualOpen); }}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-terminal-border rounded text-terminal-muted text-xs font-mono hover:border-terminal-amber hover:text-terminal-amber transition-colors"
        >
          <BarChart2 size={12} />
          {manualOpen ? 'Hide Review' : 'Show Weekly Review'}
          {manualOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {isSunday() && !manualOpen && (
        <div className="p-2 bg-terminal-amber/10 border border-terminal-amber/30 rounded text-terminal-amber text-xs font-mono text-center">
          📅 It's Sunday — Weekly review is automatically displayed.
        </div>
      )}

      {isVisible && (
        <div className="terminal-card p-5 space-y-5 print:shadow-none" id="weekly-review-print">
          <div className="flex items-center justify-between border-b border-terminal-border pb-3">
            <div>
              <h3 className="font-display text-terminal-amber font-bold text-base">📊 WEEKLY REVIEW</h3>
              <p className="text-terminal-muted text-xs font-mono mt-0.5">
                Week of {weekAgo.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-terminal-border rounded text-terminal-muted text-xs font-mono hover:border-terminal-amber hover:text-terminal-amber transition-colors print:hidden"
            >
              <Printer size={12} /> Export PDF
            </button>
          </div>

          {/* Metrics */}
          <div className="space-y-0">
            <MetricRow label="Hit Rate" value={weekTrades.length > 0 ? `${hitRate.toFixed(0)}%` : '—'} target=">50%" good={hitRate >= 50} />
            <MetricRow label="Avg Win / Avg Loss" value={avgWinLoss > 0 ? avgWinLoss.toFixed(2) : '—'} target=">1.5" good={avgWinLoss >= 1.5} />
            <MetricRow
              label="Max Drawdown"
              value={maxDrawdown > 0 ? `NPR ${maxDrawdown.toLocaleString('en-IN', { maximumFractionDigits: 0 })} (${maxDrawdownR.toFixed(2)}R)` : '—'}
              target="<2R"
              good={maxDrawdownR < 2}
            />
            <MetricRow label="Rule Adherence" value={`${manualMetrics.ruleAdherencePct}%`} target=">80%" good={manualMetrics.ruleAdherencePct >= 80} />
            <MetricRow label="EDIS Errors This Week" value={String(manualMetrics.edisErrorsThisWeek)} target="0" good={manualMetrics.edisErrorsThisWeek === 0} />
            <MetricRow label="Chase Rate" value={`${manualMetrics.planAdherenceScore}%`} target="<15%" good={manualMetrics.planAdherenceScore < 15} />
            <MetricRow label="Plan Adherence Avg" value={`${manualMetrics.planAdherenceScore}/5`} target="≥4" good={manualMetrics.planAdherenceScore >= 4} />
          </div>

          {/* Playbook Summary */}
          {weekTrades.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-terminal-success/10 border border-terminal-success/30 rounded p-3">
                <p className="text-terminal-muted text-xs font-mono">Best Playbook This Week</p>
                <p className="text-terminal-success font-mono text-sm font-bold mt-1">{metrics.bestPlaybook}</p>
                <p className="text-terminal-success text-xs font-mono">{bestR !== -Infinity ? `${bestR >= 0 ? '+' : ''}${bestR.toFixed(2)}R avg` : '—'}</p>
              </div>
              <div className="bg-terminal-danger/10 border border-terminal-danger/30 rounded p-3">
                <p className="text-terminal-muted text-xs font-mono">Worst Playbook This Week</p>
                <p className="text-terminal-danger font-mono text-sm font-bold mt-1">{metrics.worstPlaybook}</p>
                <p className="text-terminal-danger text-xs font-mono">{worstR !== Infinity ? `${worstR >= 0 ? '+' : ''}${worstR.toFixed(2)}R avg` : '—'}</p>
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="border-t border-terminal-border pt-4">
            <p className="text-terminal-amber text-xs font-mono font-bold uppercase tracking-wider mb-3">📋 Rule-Based Recommendations</p>
            <div className="space-y-2">
              {recommendations.map((rec, i) => (
                <div key={i} className="flex gap-2 p-2 bg-terminal-bg rounded border border-terminal-border/50">
                  <span className="text-terminal-amber font-mono text-xs shrink-0">→</span>
                  <p className="text-terminal-fg text-xs font-mono leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          </div>

          {weekTrades.length === 0 && (
            <p className="text-terminal-muted text-xs font-mono text-center py-2">
              No closed trades this week. Complete trades to generate performance metrics.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
