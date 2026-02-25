import { useState } from 'react';
import { useTradingContext } from '../contexts/TradingContext';
import { calculatePositionSizing } from '../utils/positionSizing';
import { Trade } from '../types/trading';
import { AlertTriangle, Save } from 'lucide-react';

interface Props {
  playbookName: string;
  playbookCategory: 'event' | 'momentum' | 'intraday';
  defaultRisk?: number;
}

export function TradeCalculator({ playbookName, playbookCategory, defaultRisk = 0.005 }: Props) {
  const { state, addTrade } = useTradingContext();
  const [ticker, setTicker] = useState('');
  const [entryPrice, setEntryPrice] = useState('');
  const [stopPrice, setStopPrice] = useState('');
  const [riskPct, setRiskPct] = useState(String(defaultRisk * 100));
  const [avgTurnover, setAvgTurnover] = useState('');
  const [added, setAdded] = useState(false);

  const equity = state.accountEquity;
  const fee = state.settings.feePercent;

  const entry = parseFloat(entryPrice) || 0;
  const stop = parseFloat(stopPrice) || 0;
  const risk = parseFloat(riskPct) / 100 || 0.005;
  const turnover = parseFloat(avgTurnover.replace(/,/g, '')) || 0;

  const canCalc = equity > 0 && entry > 0 && stop > 0 && entry > stop;

  const result = canCalc ? calculatePositionSizing({
    accountEquity: equity,
    riskPercent: risk,
    entryPrice: entry,
    stopPrice: stop,
    avgDailyTurnover20d: turnover,
    feePercent: fee,
  }) : null;

  const handleAddToLog = () => {
    if (!result || !ticker || result.zeroSharesError) return;
    const trade: Trade = {
      id: Date.now().toString(),
      ticker: ticker.toUpperCase(),
      playbook: playbookName,
      playbookCategory,
      entryPrice: entry,
      stopPrice: stop,
      size: result.effectiveShares,
      entryDate: new Date().toISOString(),
      status: 'OPEN',
      edisFlag: false,
      rValue: result.rValue,
    };
    addTrade(trade);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    setTicker('');
    setEntryPrice('');
    setStopPrice('');
    setAvgTurnover('');
  };

  return (
    <div className="border-t border-terminal-border/30 mt-3 pt-3">
      <p className="text-terminal-amber text-xs font-mono font-bold uppercase tracking-wider mb-2">— Trade Calculator —</p>
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-terminal-muted text-xs font-mono">Ticker</label>
            <input type="text" value={ticker} onChange={e => setTicker(e.target.value.toUpperCase())} placeholder="e.g. NABIL" className="terminal-input w-full mt-0.5 text-xs" />
          </div>
          <div>
            <label className="text-terminal-muted text-xs font-mono">Risk %</label>
            <select value={riskPct} onChange={e => setRiskPct(e.target.value)} className="terminal-input w-full mt-0.5 text-xs">
              <option value="0.5">0.5%</option>
              <option value="1.0">1.0%</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-terminal-muted text-xs font-mono">Entry Price (NPR)</label>
            <input type="number" value={entryPrice} onChange={e => setEntryPrice(e.target.value)} placeholder="0.00" className="terminal-input w-full mt-0.5 text-xs" />
          </div>
          <div>
            <label className="text-terminal-muted text-xs font-mono">Stop Price (NPR)</label>
            <input type="number" value={stopPrice} onChange={e => setStopPrice(e.target.value)} placeholder="0.00" className="terminal-input w-full mt-0.5 text-xs" />
          </div>
        </div>
        <div>
          <label className="text-terminal-muted text-xs font-mono">Avg Daily Turnover 20d (NPR)</label>
          <input type="text" value={avgTurnover} onChange={e => setAvgTurnover(e.target.value)} placeholder="e.g. 5000000" className="terminal-input w-full mt-0.5 text-xs" />
        </div>
        <div>
          <label className="text-terminal-muted text-xs font-mono">Account Equity (NPR)</label>
          <input type="text" value={equity > 0 ? equity.toLocaleString('en-IN') : ''} readOnly placeholder="Set in navbar" className="terminal-input w-full mt-0.5 text-xs opacity-60 cursor-not-allowed" />
        </div>

        {/* Results */}
        {result && (
          <div className="bg-terminal-bg border border-terminal-border rounded p-2 space-y-1 mt-1">
            {result.zeroSharesError ? (
              <p className="text-terminal-danger text-xs font-mono font-bold">⚠ Stop too tight or position too large for account size</p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs font-mono">
                  <span className="text-terminal-muted">Position Size:</span>
                  <span className="text-terminal-amber font-bold">{result.effectiveShares.toLocaleString()} shares</span>
                  <span className="text-terminal-muted">Max Position Value:</span>
                  <span className="text-terminal-fg">NPR {result.maxPositionValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  <span className="text-terminal-muted">Liquidity Cap:</span>
                  <span className="text-terminal-fg">NPR {result.liquidityCapNPR.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  <span className="text-terminal-muted">Effective Size:</span>
                  <span className="text-terminal-success font-bold">{result.effectiveShares.toLocaleString()} shares</span>
                  <span className="text-terminal-muted">Breakeven Move:</span>
                  <span className="text-terminal-fg">{result.breakevenPct.toFixed(2)}%</span>
                  <span className="text-terminal-muted">R Value:</span>
                  <span className="text-terminal-amber">NPR {result.rValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  {turnover > 0 && (
                    <>
                      <span className="text-terminal-muted">Days to Exit:</span>
                      <span className={result.liquidityWarning ? 'text-terminal-danger font-bold' : 'text-terminal-fg'}>
                        {result.daysToExit.toFixed(1)} days {result.liquidityWarning && '⚠'}
                      </span>
                    </>
                  )}
                </div>
                {result.liquidityWarning && (
                  <div className="flex items-center gap-1 mt-1 p-1.5 bg-terminal-danger/10 border border-terminal-danger/30 rounded">
                    <AlertTriangle size={12} className="text-terminal-danger shrink-0" />
                    <p className="text-terminal-danger text-xs font-mono">Liquidity warning: Days to exit ({result.daysToExit.toFixed(1)}) exceeds 3-day threshold. Position may be too large for this stock's liquidity.</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <button
          onClick={handleAddToLog}
          disabled={!result || result.zeroSharesError || !ticker || added}
          className={`w-full py-1.5 rounded text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all ${added ? 'bg-terminal-success/20 border border-terminal-success text-terminal-success' : 'bg-terminal-amber/20 border border-terminal-amber text-terminal-amber hover:bg-terminal-amber/30 disabled:opacity-40 disabled:cursor-not-allowed'}`}
        >
          <Save size={12} />
          {added ? '✓ Added to Trade Log' : '💾 Add to Trade Log'}
        </button>
      </div>
    </div>
  );
}
