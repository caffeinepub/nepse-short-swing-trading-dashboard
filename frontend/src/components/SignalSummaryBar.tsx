import { useTradingContext } from '../contexts/TradingContext';

export function SignalSummaryBar() {
  const { state } = useTradingContext();
  const { signals } = state;

  const active = signals.filter(s => s.status === 'ACTIVE');
  const watch = signals.filter(s => s.status === 'WATCH');
  const clear = signals.filter(s => s.status === 'CLEAR');

  const riskActive = active.filter(s => s.category === 'risk').length;
  const oppActive = active.filter(s => s.category === 'opportunity').length;
  const neutral = watch.length + clear.length;

  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-2 bg-terminal-bg border border-terminal-border rounded mb-4">
      <span className="text-terminal-muted text-xs font-mono uppercase tracking-widest">Signal Summary:</span>
      <span className="flex items-center gap-1 text-xs font-mono">
        <span className="text-terminal-danger font-bold">Risk: {riskActive}</span>
        <span className="text-terminal-muted">active</span>
      </span>
      <span className="text-terminal-border">|</span>
      <span className="flex items-center gap-1 text-xs font-mono">
        <span className="text-terminal-success font-bold">Opportunity: {oppActive}</span>
        <span className="text-terminal-muted">active</span>
      </span>
      <span className="text-terminal-border">|</span>
      <span className="flex items-center gap-1 text-xs font-mono">
        <span className="text-terminal-muted font-bold">Neutral/Watch: {neutral}</span>
      </span>
      <span className="text-terminal-border">|</span>
      <span className="flex items-center gap-1 text-xs font-mono">
        <span className="text-yellow-400 font-bold">Watch: {watch.length}</span>
      </span>
    </div>
  );
}
