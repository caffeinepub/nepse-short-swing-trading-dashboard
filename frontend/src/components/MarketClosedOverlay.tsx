import { useState, useEffect } from 'react';
import { isMarketOpen } from '../utils/nepalTime';

export function MarketClosedOverlay() {
  const [open, setOpen] = useState(isMarketOpen());

  useEffect(() => {
    const interval = setInterval(() => setOpen(isMarketOpen()), 10000);
    return () => clearInterval(interval);
  }, []);

  if (open) return null;

  return (
    <div className="fixed top-[88px] left-0 right-0 z-30 pointer-events-none">
      <div className="bg-terminal-surface/90 border-b border-terminal-border px-4 py-1.5 flex items-center justify-center gap-3">
        <span className="inline-block w-2 h-2 rounded-full bg-terminal-muted" />
        <span className="font-mono text-xs text-terminal-muted tracking-widest uppercase">
          MARKET CLOSED — Planning Mode Active
        </span>
        <span className="inline-block w-2 h-2 rounded-full bg-terminal-muted" />
      </div>
    </div>
  );
}
