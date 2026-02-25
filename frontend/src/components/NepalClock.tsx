import { useState, useEffect } from 'react';
import { getNSTString } from '../utils/nepalTime';

export function NepalClock() {
  const [time, setTime] = useState(getNSTString());

  useEffect(() => {
    const interval = setInterval(() => setTime(getNSTString()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-terminal-muted text-xs uppercase tracking-widest">NST</span>
      <span className="font-mono text-terminal-amber text-sm font-semibold tabular-nums">{time}</span>
    </div>
  );
}
