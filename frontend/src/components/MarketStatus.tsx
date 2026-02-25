import { useState, useEffect } from 'react';
import { isMarketOpen } from '../utils/nepalTime';

export function MarketStatus() {
  const [open, setOpen] = useState(isMarketOpen());

  useEffect(() => {
    const interval = setInterval(() => setOpen(isMarketOpen()), 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2">
      <span className={`inline-block w-2 h-2 rounded-full ${open ? 'bg-terminal-success animate-pulse' : 'bg-terminal-danger'}`} />
      <span className={`font-mono text-xs font-bold tracking-wider ${open ? 'text-terminal-success' : 'text-terminal-danger'}`}>
        MARKET: {open ? 'OPEN' : 'CLOSED'}
      </span>
    </div>
  );
}
