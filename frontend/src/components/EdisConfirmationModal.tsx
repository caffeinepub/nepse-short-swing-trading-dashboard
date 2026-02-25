import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { useTradingContext } from '../contexts/TradingContext';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function EdisConfirmationModal({ open, onClose }: Props) {
  const { dismissEdisModal } = useTradingContext();

  const handleConfirm = () => {
    dismissEdisModal();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="bg-terminal-surface border-2 border-terminal-danger text-terminal-fg max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-terminal-danger font-display">
            <AlertTriangle size={20} className="animate-pulse" />
            🔴 EDIS ACTION REQUIRED
          </DialogTitle>
          <DialogDescription className="text-terminal-muted">
            You have active RED risk alerts that require immediate attention.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <div className="bg-terminal-danger/10 border border-terminal-danger/30 rounded p-3">
            <p className="text-terminal-fg text-sm font-mono">
              EDIS (Electronic Delivery Instruction Slip) is due for sell trades from yesterday (T+1 settlement).
            </p>
            <p className="text-terminal-danger text-xs mt-2 font-mono font-bold">
              Failure to submit EDIS results in forced closeout and penalty charges.
            </p>
          </div>
          <div className="text-xs text-terminal-muted font-mono space-y-1">
            <p>• Log in to your broker's EDIS portal</p>
            <p>• Submit delivery instructions for all T+1 sell trades</p>
            <p>• Confirm submission before market opens</p>
          </div>
          <Button
            onClick={handleConfirm}
            className="w-full bg-terminal-danger hover:bg-terminal-danger/80 text-white font-mono font-bold"
          >
            ✓ I HAVE HANDLED EDIS — PROCEED
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
