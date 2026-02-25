import { useTradingContext } from '../contexts/TradingContext';
import { SignalCard } from './SignalCard';
import { SignalSummaryBar } from './SignalSummaryBar';
import { Signal } from '../types/trading';

const STATUS_PRIORITY: Record<string, number> = { ACTIVE: 0, WATCH: 1, CLEAR: 2 };

export function SignalCatalystEngine() {
  const { state } = useTradingContext();

  const sortedSignals = [...state.signals].sort((a, b) => {
    const pa = STATUS_PRIORITY[a.status] ?? 3;
    const pb = STATUS_PRIORITY[b.status] ?? 3;
    if (pa !== pb) return pa - pb;
    return a.number - b.number;
  });

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="section-title">⚡ 12-Signal Catalyst Engine</h2>
      </div>
      <SignalSummaryBar />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {sortedSignals.map(signal => (
          <SignalCard key={signal.id} signal={signal} />
        ))}
      </div>
    </section>
  );
}
