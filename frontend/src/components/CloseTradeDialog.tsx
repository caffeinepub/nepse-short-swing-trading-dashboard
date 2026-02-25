import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTradingContext } from '../contexts/TradingContext';
import { Trade } from '../types/trading';
import { calculateTradePnL } from '../utils/metrics';

interface Props {
  trade: Trade;
  open: boolean;
  onClose: () => void;
}

export function CloseTradeDialog({ trade, open, onClose }: Props) {
  const { closeTrade, state } = useTradingContext();
  const [exitPrice, setExitPrice] = useState('');

  const exit = parseFloat(exitPrice) || 0;
  const previewTrade = exit > 0 ? { ...trade, exitPrice: exit } : null;
  const previewPnL = previewTrade ? calculateTradePnL(previewTrade, state.settings.feePercent) : null;
  const rMultiple = previewPnL !== null && trade.rValue > 0 ? previewPnL / trade.rValue : null;

  const handleClose = () => {
    if (exit > 0) {
      closeTrade(trade.id, exit);
      onClose();
      setExitPrice('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="bg-terminal-surface border-terminal-border text-terminal-fg max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-terminal-amber">Close Trade: {trade.ticker}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <span className="text-terminal-muted">Entry Price:</span>
            <span className="text-terminal-fg">NPR {trade.entryPrice.toLocaleString()}</span>
            <span className="text-terminal-muted">Size:</span>
            <span className="text-terminal-fg">{trade.size.toLocaleString()} shares</span>
            <span className="text-terminal-muted">Stop Price:</span>
            <span className="text-terminal-danger">NPR {trade.stopPrice.toLocaleString()}</span>
          </div>
          <div>
            <Label className="text-terminal-muted text-xs uppercase tracking-wider">Exit Price (NPR)</Label>
            <Input
              type="number"
              value={exitPrice}
              onChange={e => setExitPrice(e.target.value)}
              placeholder="Enter exit price"
              className="bg-terminal-bg border-terminal-border text-terminal-amber font-mono mt-1"
              autoFocus
            />
          </div>
          {previewPnL !== null && (
            <div className={`p-2 rounded border text-xs font-mono ${previewPnL >= 0 ? 'bg-terminal-success/10 border-terminal-success/30' : 'bg-terminal-danger/10 border-terminal-danger/30'}`}>
              <div className="flex justify-between">
                <span className="text-terminal-muted">Net P&L (after {(state.settings.feePercent * 100).toFixed(1)}% fees):</span>
                <span className={`font-bold ${previewPnL >= 0 ? 'text-terminal-success' : 'text-terminal-danger'}`}>
                  {previewPnL >= 0 ? '+' : ''}NPR {previewPnL.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
              </div>
              {rMultiple !== null && (
                <div className="flex justify-between mt-0.5">
                  <span className="text-terminal-muted">R-Multiple:</span>
                  <span className={`font-bold ${rMultiple >= 0 ? 'text-terminal-success' : 'text-terminal-danger'}`}>
                    {rMultiple >= 0 ? '+' : ''}{rMultiple.toFixed(2)}R
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
        <DialogFooter className="mt-4 gap-2">
          <Button variant="outline" onClick={onClose} className="border-terminal-border text-terminal-muted hover:bg-terminal-border/20">Cancel</Button>
          <Button onClick={handleClose} disabled={exit <= 0} className="bg-terminal-amber text-terminal-bg hover:bg-terminal-amber/80 font-mono font-bold">
            Confirm Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
