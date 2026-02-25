import { useTradingContext } from '../contexts/TradingContext';
import { NepalClock } from './NepalClock';
import { MarketStatus } from './MarketStatus';
import { useState } from 'react';
import { Settings, Download, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const { state, setAccountEquity, getDailyPnL, exportData, importData, updateSettings } = useTradingContext();
  const [equityInput, setEquityInput] = useState(state.accountEquity > 0 ? String(state.accountEquity) : '');
  const [importText, setImportText] = useState('');

  const dailyPnL = getDailyPnL();
  const rValue = state.accountEquity * 0.01;
  const maxLossNPR = rValue * state.settings.maxDailyLossR;
  const dailyLossHit = rValue > 0 && dailyPnL <= -maxLossNPR;

  const handleEquityBlur = () => {
    const val = parseFloat(equityInput.replace(/,/g, ''));
    if (!isNaN(val) && val > 0) setAccountEquity(val);
  };

  const handleImport = () => {
    if (importText.trim()) {
      importData(importText.trim());
      setImportText('');
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      if (text) importData(text);
    };
    reader.readAsText(file);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 bg-terminal-surface border-b border-terminal-border flex items-center px-4 gap-4 overflow-x-auto">
      {/* Logo */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-lg">🇳🇵</span>
        <span className="font-display text-terminal-amber font-bold text-sm tracking-widest uppercase">NEPSE DESK</span>
      </div>

      <div className="w-px h-6 bg-terminal-border shrink-0" />

      <MarketStatus />

      <div className="w-px h-6 bg-terminal-border shrink-0" />

      <NepalClock />

      <div className="w-px h-6 bg-terminal-border shrink-0" />

      {/* Account Equity */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-terminal-muted text-xs uppercase tracking-widest font-mono">Account R:</span>
        <div className="relative">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-terminal-muted text-xs font-mono">NPR</span>
          <input
            type="text"
            value={equityInput}
            onChange={e => setEquityInput(e.target.value)}
            onBlur={handleEquityBlur}
            onKeyDown={e => e.key === 'Enter' && handleEquityBlur()}
            placeholder="0"
            className="bg-terminal-bg border border-terminal-border rounded text-terminal-amber font-mono text-xs pl-9 pr-2 py-1 w-32 focus:outline-none focus:border-terminal-amber"
          />
        </div>
      </div>

      <div className="w-px h-6 bg-terminal-border shrink-0" />

      {/* Max Loss Badge */}
      <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono shrink-0 ${dailyLossHit ? 'bg-terminal-danger/20 border border-terminal-danger text-terminal-danger animate-pulse' : 'bg-terminal-bg border border-terminal-border text-terminal-muted'}`}>
        <span>Max Loss: 2R =</span>
        <span className="font-bold text-terminal-amber">NPR {maxLossNPR.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
        {dailyLossHit && <span className="text-terminal-danger font-bold">⚠ HIT</span>}
      </div>

      <div className="flex-1" />

      {/* Settings */}
      <Dialog>
        <DialogTrigger asChild>
          <button className="p-1.5 rounded hover:bg-terminal-border transition-colors text-terminal-muted hover:text-terminal-amber">
            <Settings size={14} />
          </button>
        </DialogTrigger>
        <DialogContent className="bg-terminal-surface border-terminal-border text-terminal-fg max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-terminal-amber">Settings & Data</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label className="text-terminal-muted text-xs uppercase tracking-wider">Trading Fee % (round-trip)</Label>
              <Input
                type="number"
                step="0.001"
                value={state.settings.feePercent * 100}
                onChange={e => updateSettings({ feePercent: parseFloat(e.target.value) / 100 || 0.006 })}
                className="bg-terminal-bg border-terminal-border text-terminal-amber font-mono mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={exportData} variant="outline" size="sm" className="border-terminal-amber text-terminal-amber hover:bg-terminal-amber/10 gap-1">
                <Download size={12} /> Export JSON
              </Button>
              <label className="cursor-pointer">
                <Button variant="outline" size="sm" className="border-terminal-highlight text-terminal-highlight hover:bg-terminal-highlight/10 gap-1" asChild>
                  <span><Upload size={12} /> Import JSON</span>
                </Button>
                <input type="file" accept=".json" className="hidden" onChange={handleFileImport} />
              </label>
            </div>
            <div>
              <Label className="text-terminal-muted text-xs uppercase tracking-wider">Or paste JSON to import</Label>
              <textarea
                value={importText}
                onChange={e => setImportText(e.target.value)}
                rows={3}
                className="w-full bg-terminal-bg border border-terminal-border rounded text-terminal-fg font-mono text-xs p-2 mt-1 focus:outline-none focus:border-terminal-amber"
                placeholder='{"accountEquity": ...}'
              />
              <Button onClick={handleImport} size="sm" className="mt-1 bg-terminal-amber text-terminal-bg hover:bg-terminal-amber/80">
                Import
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </nav>
  );
}
