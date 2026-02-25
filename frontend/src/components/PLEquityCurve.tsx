import { useTradingContext } from '../contexts/TradingContext';
import { getEquityCurve } from '../utils/metrics';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export function PLEquityCurve() {
  const { state } = useTradingContext();
  const data = getEquityCurve(state.closedTrades, state.settings.feePercent, state.accountEquity);

  if (data.length === 0) {
    return (
      <div className="terminal-card p-6 flex items-center justify-center">
        <p className="text-terminal-muted font-mono text-sm">No closed trades yet. P&L equity curve will appear here.</p>
      </div>
    );
  }

  const chartData = data.map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    pnl: Math.round(d.pnl),
    r: parseFloat(d.rMultiple.toFixed(2)),
  }));

  return (
    <div className="terminal-card p-4">
      <h3 className="font-display text-terminal-amber text-sm font-bold uppercase tracking-wider mb-4">P&L Equity Curve</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
          <XAxis dataKey="date" tick={{ fill: '#6B7280', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }} />
          <YAxis yAxisId="left" tick={{ fill: '#6B7280', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }} tickFormatter={v => `${v >= 0 ? '+' : ''}${(v / 1000).toFixed(0)}k`} />
          <YAxis yAxisId="right" orientation="right" tick={{ fill: '#3B82F6', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }} tickFormatter={v => `${v}R`} />
          <Tooltip
            contentStyle={{ backgroundColor: '#111827', border: '1px solid #1E293B', borderRadius: '4px', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px' }}
            labelStyle={{ color: '#F59E0B' }}
            formatter={(value: number, name: string) => [
              name === 'pnl' ? `NPR ${value.toLocaleString('en-IN')}` : `${value}R`,
              name === 'pnl' ? 'Cumulative P&L' : 'R-Multiple'
            ]}
          />
          <ReferenceLine yAxisId="left" y={0} stroke="#EF4444" strokeDasharray="4 4" />
          <Line yAxisId="left" type="monotone" dataKey="pnl" stroke="#F59E0B" strokeWidth={2} dot={false} name="pnl" />
          <Line yAxisId="right" type="monotone" dataKey="r" stroke="#3B82F6" strokeWidth={1.5} dot={false} strokeDasharray="4 4" name="r" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
