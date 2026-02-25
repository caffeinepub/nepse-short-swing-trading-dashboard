import { useTradingContext } from '../contexts/TradingContext';
import { getPlaybookPerformance } from '../utils/metrics';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function PlaybookPerformanceTable() {
  const { state } = useTradingContext();
  const performance = getPlaybookPerformance(state.closedTrades, state.settings.feePercent);

  if (performance.length === 0) {
    return (
      <div className="terminal-card p-4">
        <h3 className="font-display text-terminal-amber text-sm font-bold uppercase tracking-wider mb-3">Playbook Performance</h3>
        <p className="text-terminal-muted font-mono text-sm text-center py-4">No closed trades yet.</p>
      </div>
    );
  }

  return (
    <div className="terminal-card overflow-hidden">
      <div className="p-4 border-b border-terminal-border">
        <h3 className="font-display text-terminal-amber text-sm font-bold uppercase tracking-wider">Playbook Performance</h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="border-terminal-border hover:bg-transparent">
            {['Playbook', 'Trades', 'Win Rate', 'Avg R', 'Best Trade', 'Worst Trade'].map(h => (
              <TableHead key={h} className="text-terminal-muted font-mono text-xs uppercase tracking-wider">{h}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {performance.map(p => (
            <TableRow key={p.name} className="border-terminal-border/30 hover:bg-terminal-border/10">
              <TableCell className="font-mono text-terminal-fg text-xs max-w-[200px] truncate">{p.name}</TableCell>
              <TableCell className="font-mono text-terminal-amber text-xs">{p.trades}</TableCell>
              <TableCell className={`font-mono font-bold text-xs ${p.winRate >= 50 ? 'text-terminal-success' : 'text-terminal-danger'}`}>
                {p.winRate.toFixed(0)}%
              </TableCell>
              <TableCell className={`font-mono font-bold text-xs ${p.avgR >= 0 ? 'text-terminal-success' : 'text-terminal-danger'}`}>
                {p.avgR >= 0 ? '+' : ''}{p.avgR.toFixed(2)}R
              </TableCell>
              <TableCell className="font-mono text-terminal-success text-xs">
                +NPR {p.best.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </TableCell>
              <TableCell className="font-mono text-terminal-danger text-xs">
                NPR {p.worst.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
