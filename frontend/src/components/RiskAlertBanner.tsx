import { useState, useEffect } from 'react';
import { useTradingContext } from '../contexts/TradingContext';
import { EdisConfirmationModal } from './EdisConfirmationModal';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';

export function RiskAlertBanner() {
  const { state, updateAlertState } = useTradingContext();
  const { alertState } = state;
  const [showModal, setShowModal] = useState(false);
  const [modalShown, setModalShown] = useState(false);

  const hasRedAlert = alertState.edisDueToday || alertState.closeoutRisk;
  const hasAnyAlert = hasRedAlert || alertState.lockInSupplyShock || alertState.promoterOverhang || alertState.marginBufferLow || alertState.volatilityRegime;

  useEffect(() => {
    if (hasRedAlert && !state.edisModalDismissed && !modalShown) {
      setShowModal(true);
      setModalShown(true);
    }
  }, [hasRedAlert, state.edisModalDismissed, modalShown]);

  const toggleAlert = (key: keyof typeof alertState) => {
    updateAlertState({ [key]: !alertState[key] });
  };

  return (
    <>
      <EdisConfirmationModal open={showModal} onClose={() => setShowModal(false)} />
      <div className={`w-full border-b border-terminal-border px-4 py-2 flex flex-wrap items-center gap-2 ${hasRedAlert ? 'bg-terminal-danger/5 animate-pulse-slow' : 'bg-terminal-surface'}`}>
        <span className="text-terminal-muted text-xs font-mono uppercase tracking-widest shrink-0">Risk Alerts:</span>

        {/* EDIS Due Today */}
        <button
          onClick={() => toggleAlert('edisDueToday')}
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-bold transition-all ${alertState.edisDueToday ? 'bg-terminal-danger/20 border border-terminal-danger text-terminal-danger animate-pulse' : 'bg-terminal-bg border border-terminal-border text-terminal-muted hover:border-terminal-danger/50'}`}
        >
          {alertState.edisDueToday ? '🔴' : '○'} EDIS DUE TODAY
        </button>

        {/* Closeout Risk */}
        <button
          onClick={() => toggleAlert('closeoutRisk')}
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-bold transition-all ${alertState.closeoutRisk ? 'bg-terminal-danger/20 border border-terminal-danger text-terminal-danger' : 'bg-terminal-bg border border-terminal-border text-terminal-muted hover:border-terminal-danger/50'}`}
        >
          {alertState.closeoutRisk ? '🔴' : '○'} CLOSEOUT RISK
        </button>

        {/* Lock-in Supply Shock */}
        <button
          onClick={() => toggleAlert('lockInSupplyShock')}
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-bold transition-all ${alertState.lockInSupplyShock ? 'bg-orange-500/20 border border-orange-500 text-orange-400' : 'bg-terminal-bg border border-terminal-border text-terminal-muted hover:border-orange-500/50'}`}
        >
          {alertState.lockInSupplyShock ? '🟠' : '○'} LOCK-IN SUPPLY SHOCK
        </button>

        {/* Promoter Overhang */}
        <button
          onClick={() => toggleAlert('promoterOverhang')}
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-bold transition-all ${alertState.promoterOverhang ? 'bg-orange-500/20 border border-orange-500 text-orange-400' : 'bg-terminal-bg border border-terminal-border text-terminal-muted hover:border-orange-500/50'}`}
        >
          {alertState.promoterOverhang ? '🟠' : '○'} PROMOTER OVERHANG
        </button>

        {/* Margin Buffer Low */}
        <button
          onClick={() => toggleAlert('marginBufferLow')}
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-bold transition-all ${alertState.marginBufferLow ? 'bg-yellow-500/20 border border-yellow-500 text-yellow-400' : 'bg-terminal-bg border border-terminal-border text-terminal-muted hover:border-yellow-500/50'}`}
        >
          {alertState.marginBufferLow ? '🟡' : '○'} MARGIN BUFFER LOW
        </button>

        {/* Volatility Regime */}
        <button
          onClick={() => toggleAlert('volatilityRegime')}
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-bold transition-all ${alertState.volatilityRegime ? 'bg-terminal-highlight/20 border border-terminal-highlight text-terminal-highlight' : 'bg-terminal-bg border border-terminal-border text-terminal-muted hover:border-terminal-highlight/50'}`}
        >
          {alertState.volatilityRegime ? '🔵' : '○'} VOLATILITY REGIME
        </button>

        {/* All Clear */}
        {!hasAnyAlert && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-bold bg-terminal-success/20 border border-terminal-success text-terminal-success">
            <CheckCircle size={10} /> ALL CLEAR
          </span>
        )}

        <span className="text-terminal-muted text-xs font-mono ml-1">(click to toggle)</span>

        {hasRedAlert && (
          <button onClick={() => setShowModal(true)} className="ml-auto flex items-center gap-1 text-terminal-danger text-xs font-mono hover:underline">
            <AlertTriangle size={12} /> View EDIS Alert
          </button>
        )}
      </div>
    </>
  );
}
