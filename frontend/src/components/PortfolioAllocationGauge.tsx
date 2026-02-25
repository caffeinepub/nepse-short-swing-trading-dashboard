import { useTradingContext } from '../contexts/TradingContext';
import { calculateCategoryAllocation, getRebalancingWarnings, TARGET_ALLOCATION } from '../utils/allocation';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AlertTriangle } from 'lucide-react';

const COLORS = {
  event: '#F59E0B',
  momentum: '#3B82F6',
  intraday: '#A855F7',
};

export function PortfolioAllocationGauge() {
  const { state } = useTradingContext();
  const current = calculateCategoryAllocation(state.openTrades);
  const warnings = getRebalancingWarnings(current);

  const hasData = state.openTrades.length > 0;

  const currentData = [
    { name: 'Event/Swing', value: hasData ? current.event : 0, color: COLORS.event },
    { name: 'Momentum', value: hasData ? current.momentum : 0, color: COLORS.momentum },
    { name: 'Intraday', value: hasData ? current.intraday : 0, color: COLORS.intraday },
  ];

  const targetData = [
    { name: 'Event/Swing', value: TARGET_ALLOCATION.event, color: COLORS.event },
    { name: 'Momentum', value: TARGET_ALLOCATION.momentum, color: COLORS.momentum },
    { name: 'Intraday', value: TARGET_ALLOCATION.intraday, color: COLORS.intraday },
  ];

  const AllocationBar = ({ label, current: cur, target }: { label: string; current: number; target: number; color: string }) => {
    const diff = cur - target;
    return (
      <div className="space-y-1">
        <div className="flex justify-between text-xs font-mono">
          <span className="text-terminal-muted">{label}</span>
          <span className="flex gap-2">
            <span className="text-terminal-fg font-bold">{cur}%</span>
            <span className="text-terminal-muted">/ target {target}%</span>
            {diff !== 0 && (
              <span className={`font-bold ${diff > 0 ? 'text-orange-400' : 'text-terminal-success'}`}>
                {diff > 0 ? `+${diff}%` : `${diff}%`}
              </span>
            )}
          </span>
        </div>
        <div className="h-1.5 bg-terminal-border rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, cur)}%`, backgroundColor: cur > target + 10 ? '#EF4444' : cur > target ? '#F59E0B' : '#10B981' }}
          />
        </div>
      </div>
    );
  };

  return (
    <section className="space-y-4">
      <h2 className="section-title">🥧 Portfolio Allocation Gauge</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Donut Chart */}
        <div className="terminal-card p-4">
          <h3 className="font-display text-terminal-amber text-xs font-bold uppercase tracking-wider mb-1">Current Allocation</h3>
          {!hasData ? (
            <div className="flex items-center justify-center h-48">
              <p className="text-terminal-muted font-mono text-sm">No open trades to display.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={currentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {currentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #1E293B', borderRadius: '4px', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px' }}
                  formatter={(value: number) => [`${value}%`, '']}
                />
                <Legend
                  formatter={(value) => <span style={{ color: '#6B7280', fontSize: '11px', fontFamily: 'JetBrains Mono, monospace' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Target vs Current */}
        <div className="terminal-card p-4 space-y-4">
          <h3 className="font-display text-terminal-amber text-xs font-bold uppercase tracking-wider">Allocation vs Target</h3>

          <div className="space-y-3">
            <AllocationBar label="Event/Swing" current={hasData ? current.event : 0} target={TARGET_ALLOCATION.event} color={COLORS.event} />
            <AllocationBar label="Momentum" current={hasData ? current.momentum : 0} target={TARGET_ALLOCATION.momentum} color={COLORS.momentum} />
            <AllocationBar label="Intraday" current={hasData ? current.intraday : 0} target={TARGET_ALLOCATION.intraday} color={COLORS.intraday} />
          </div>

          <div className="border-t border-terminal-border/30 pt-3 space-y-1">
            <p className="text-terminal-muted text-xs font-mono uppercase tracking-wider">Target Allocation</p>
            <div className="flex gap-4 text-xs font-mono">
              <span className="text-terminal-amber">Event: {TARGET_ALLOCATION.event}%</span>
              <span className="text-terminal-highlight">Momentum: {TARGET_ALLOCATION.momentum}%</span>
              <span className="text-purple-400">Intraday: {TARGET_ALLOCATION.intraday}%</span>
            </div>
          </div>

          {warnings.length > 0 && (
            <div className="space-y-2">
              {warnings.map((w, i) => (
                <div key={i} className="flex items-start gap-2 p-2 bg-orange-500/10 border border-orange-500/30 rounded">
                  <AlertTriangle size={12} className="text-orange-400 shrink-0 mt-0.5" />
                  <p className="text-orange-400 text-xs font-mono">⚠️ {w}</p>
                </div>
              ))}
            </div>
          )}

          {!hasData && (
            <p className="text-terminal-muted text-xs font-mono">Add open trades to see allocation analysis.</p>
          )}
        </div>
      </div>
    </section>
  );
}
