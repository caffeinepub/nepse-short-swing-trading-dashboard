import { useState } from 'react';
import { useTradingContext } from '../contexts/TradingContext';
import { Trade } from '../types/trading';
import { CloseTradeDialog } from './CloseTradeDialog';
import { calculateDaysHeld, calculateCurrentPnL } from '../utils/metrics';
import { X, Flag, TrendingUp, TrendingDown } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

export function ActiveTradeLog() {
  const { state, updateTrade, deleteTrade, getDailyPnL } = useTradingContext();
  const [closingTrade, setClosingTrade] = useState<Trade | null>(null);
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [priceInput, setPriceInput] = useState('');

  const { openTrades, accountEquity, settings } = state;
  const rValue = accountEquity * 0.01;
  const dailyPnL = getDailyPnL();
  const dailyPnLR = rValue > 0 ? dailyPnL / rValue : 0;
  const maxLossR = settings.maxDailyLossR;
  const remainingR = maxLossR + dailyPnLR;
  const usagePct = rValue > 0 ? Math.min(100, Math.abs(dailyPnL) / (maxLossR * rValue) * 100) : 0;

  const sortedTrades = [...openTrades].sort((a, b) => {
    const pnlA = calculateCurrentPnL(a);
    const pnlB = calculateCurrentPnL(b);
    return pnlA - pnlB;
  });

  const handlePriceUpdate = (tradeId: string) => {
    const val = parseFloat(priceInput);
    if (!isNaN(val) && val > 0) {
      updateTrade(tradeId, { currentPrice: val });
    }
    setEditingPrice(null);
    setPriceInput('');
  };

  return (
    <section className="space-y-4">
      <h2 className="section-title">📊 Active Trade Log</h2>

      {closingTrade && (
        <CloseTradeDialog trade={closingTrade} open={true} onClose={() => setClosingTrade(null)} />
      )}

      <div className="terminal-card overflow-hidden">
        <ScrollArea className="w-full">
          <Table>
            <TableHeader>
              <TableRow className="border-terminal-border hover:bg-transparent">
                {['Ticker', 'Playbook', 'Entry', 'Stop', 'Size', 'Curr. Price', 'P&L (NPR)', 'P&L (R)', 'Days', 'Status', 'Actions'].map(h => (
                  <TableHead key={h} className="text-terminal-muted font-mono text-xs uppercase tracking-wider whitespace-nowrap">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTrades.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center text-terminal-muted font-mono text-sm py-8">
                    No open trades. Use the Trade Idea Builder to add trades.
                  </TableCell>
                </TableRow>
              ) : (
                sortedTrades.map(trade => {
                  const pnl = calculateCurrentPnL(trade);
                  const rMult = rValue > 0 ? pnl / rValue : 0;
                  const days = calculateDaysHeld(trade.entryDate);
                  const isProfit = pnl > 0;
                  const isLoss = pnl < 0;

                  return (
                    <TableRow
                      key={trade.id}
                      className={`border-terminal-border/30 ${isProfit ? 'bg-terminal-success/5 hover:bg-terminal-success/10' : isLoss ? 'bg-terminal-danger/5 hover:bg-terminal-danger/10' : 'hover:bg-terminal-border/10'}`}
                    >
                      <TableCell className="font-mono text-terminal-amber font-bold text-xs">{trade.ticker}</TableCell>
                      <TableCell className="font-mono text-terminal-muted text-xs max-w-[120px] truncate">{trade.playbook.split(' ').slice(0, 3).join(' ')}...</TableCell>
                      <TableCell className="font-mono text-terminal-fg text-xs">{trade.entryPrice.toLocaleString()}</TableCell>
                      <TableCell className="font-mono text-terminal-danger text-xs">{trade.stopPrice.toLocaleString()}</TableCell>
                      <TableCell className="font-mono text-terminal-fg text-xs">{trade.size.toLocaleString()}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {editingPrice === trade.id ? (
                          <input
                            type="number"
                            value={priceInput}
                            onChange={e => setPriceInput(e.target.value)}
                            onBlur={() => handlePriceUpdate(trade.id)}
                            onKeyDown={e => e.key === 'Enter' && handlePriceUpdate(trade.id)}
                            className="terminal-input w-20 text-xs"
                            autoFocus
                          />
                        ) : (
                          <button
                            onClick={() => { setEditingPrice(trade.id); setPriceInput(String(trade.currentPrice || '')); }}
                            className="text-terminal-fg hover:text-terminal-amber transition-colors"
                          >
                            {trade.currentPrice ? trade.currentPrice.toLocaleString() : <span className="text-terminal-muted">click to set</span>}
                          </button>
                        )}
                      </TableCell>
                      <TableCell className={`font-mono font-bold text-xs ${isProfit ? 'text-terminal-success' : isLoss ? 'text-terminal-danger' : 'text-terminal-muted'}`}>
                        <span className="flex items-center gap-1">
                          {isProfit ? <TrendingUp size={10} /> : isLoss ? <TrendingDown size={10} /> : null}
                          {pnl !== 0 ? `${pnl >= 0 ? '+' : ''}${pnl.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '—'}
                        </span>
                      </TableCell>
                      <TableCell className={`font-mono font-bold text-xs ${isProfit ? 'text-terminal-success' : isLoss ? 'text-terminal-danger' : 'text-terminal-muted'}`}>
                        {pnl !== 0 ? `${rMult >= 0 ? '+' : ''}${rMult.toFixed(2)}R` : '—'}
                      </TableCell>
                      <TableCell className="font-mono text-terminal-muted text-xs">{days}d</TableCell>
                      <TableCell>
                        <span className={`text-xs font-mono px-1.5 py-0.5 rounded border ${trade.status === 'OPEN' ? 'border-terminal-success/50 text-terminal-success' : 'border-terminal-muted/50 text-terminal-muted'}`}>
                          {trade.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setClosingTrade(trade)}
                            className="text-terminal-amber hover:text-terminal-amber/80 text-xs font-mono px-1.5 py-0.5 border border-terminal-amber/30 rounded hover:bg-terminal-amber/10 transition-colors"
                          >
                            Close
                          </button>
                          <button
                            onClick={() => updateTrade(trade.id, { edisFlag: !trade.edisFlag })}
                            className={`p-1 rounded transition-colors ${trade.edisFlag ? 'text-terminal-danger' : 'text-terminal-muted hover:text-terminal-danger'}`}
                            title="Flag EDIS"
                          >
                            <Flag size={12} />
                          </button>
                          <button
                            onClick={() => deleteTrade(trade.id)}
                            className="p-1 text-terminal-muted hover:text-terminal-danger transition-colors rounded"
                            title="Delete"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      {/* Summary Bar */}
      <div className="flex flex-wrap gap-4 px-4 py-2 bg-terminal-surface border border-terminal-border rounded text-xs font-mono">
        <span className="text-terminal-muted">Open Trades: <span className="text-terminal-amber font-bold">{openTrades.length}</span></span>
        <span className="text-terminal-border">|</span>
        <span className="text-terminal-muted">Today&apos;s P&amp;L:
          <span className={`font-bold ml-1 ${dailyPnL >= 0 ? 'text-terminal-success' : 'text-terminal-danger'}`}>
            {dailyPnL >= 0 ? '+' : ''}NPR {dailyPnL.toLocaleString('en-IN', { maximumFractionDigits: 0 })} ({dailyPnLR >= 0 ? '+' : ''}{dailyPnLR.toFixed(2)}R)
          </span>
        </span>
        <span className="text-terminal-border">|</span>
        <span className="text-terminal-muted">Max Loss Remaining:
          <span className={`font-bold ml-1 ${remainingR < 0.5 ? 'text-terminal-danger' : 'text-terminal-amber'}`}>
            {remainingR.toFixed(2)}R
          </span>
        </span>
        <span className="text-terminal-border">|</span>
        <span className="text-terminal-muted">Daily Limit:
          <span className={`font-bold ml-1 ${usagePct > 80 ? 'text-terminal-danger' : usagePct > 50 ? 'text-yellow-400' : 'text-terminal-muted'}`}>
            {usagePct > 0 ? `⚠️ ${usagePct.toFixed(0)}% Used` : '0% Used'}
          </span>
        </span>
      </div>
    </section>
  );
}
