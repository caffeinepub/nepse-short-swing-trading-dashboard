import { useState } from 'react';
import { Signal, SignalStatus } from '../types/trading';
import { useTradingContext } from '../contexts/TradingContext';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  signal: Signal;
}

const STATUS_CONFIG: Record<SignalStatus, { label: string; emoji: string; color: string; border: string }> = {
  ACTIVE: { label: 'ACTIVE', emoji: '🔴', color: 'text-terminal-danger', border: 'border-terminal-danger' },
  WATCH: { label: 'WATCH', emoji: '🟡', color: 'text-yellow-400', border: 'border-yellow-500' },
  CLEAR: { label: 'CLEAR', emoji: '⚫', color: 'text-terminal-muted', border: 'border-terminal-border' },
};

export function SignalCard({ signal }: Props) {
  const { updateSignal } = useTradingContext();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ ticker: '', date: '', qty: '', notes: '' });

  const cfg = STATUS_CONFIG[signal.status];
  const statuses: SignalStatus[] = ['ACTIVE', 'WATCH', 'CLEAR'];

  const cycleStatus = () => {
    const idx = statuses.indexOf(signal.status);
    const next = statuses[(idx + 1) % statuses.length];
    updateSignal(signal.id, { status: next });
  };

  const handleAddData = () => {
    if (!formData.ticker && !formData.notes) return;
    const newEntry = { id: Date.now().toString(), ...formData, updatedAt: new Date().toISOString() };
    updateSignal(signal.id, { data: [...signal.data, newEntry] });
    setFormData({ ticker: '', date: '', qty: '', notes: '' });
    setShowForm(false);
  };

  return (
    <div className={`terminal-card border ${cfg.border} slide-in`}>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-terminal-muted font-mono text-xs">[S{signal.number}]</span>
              <span className="font-display text-terminal-fg text-xs font-bold truncate">{signal.name}</span>
            </div>
            <p className="text-terminal-muted text-xs font-mono mt-0.5 leading-tight">{signal.description}</p>
          </div>
          <button
            onClick={cycleStatus}
            className={`shrink-0 flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-bold border ${cfg.border} ${cfg.color} hover:opacity-80 transition-opacity`}
          >
            {cfg.emoji} {cfg.label}
          </button>
        </div>

        {signal.lastUpdated && (
          <p className="text-terminal-muted text-xs font-mono mt-1">
            Updated: {new Date(signal.lastUpdated).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        )}

        {/* Latest data entries */}
        {signal.data.length > 0 && (
          <div className="mt-2 space-y-1">
            {signal.data.slice(-2).map(d => (
              <div key={d.id} className="bg-terminal-bg rounded px-2 py-1 text-xs font-mono text-terminal-muted">
                {d.ticker && <span className="text-terminal-amber mr-2">{d.ticker}</span>}
                {d.qty && <span className="mr-2">qty:{d.qty}</span>}
                {d.notes && <span>{d.notes}</span>}
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => setShowForm(f => !f)}
          className="mt-2 flex items-center gap-1 text-terminal-highlight text-xs font-mono hover:text-terminal-highlight/80 transition-colors"
        >
          {showForm ? <ChevronUp size={12} /> : <Plus size={12} />}
          {showForm ? 'Cancel' : '+ Add Data'}
        </button>

        {showForm && (
          <div className="mt-2 space-y-2 border-t border-terminal-border/30 pt-2">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Ticker"
                value={formData.ticker}
                onChange={e => setFormData(f => ({ ...f, ticker: e.target.value.toUpperCase() }))}
                className="terminal-input text-xs"
              />
              <input
                type="date"
                value={formData.date}
                onChange={e => setFormData(f => ({ ...f, date: e.target.value }))}
                className="terminal-input text-xs"
              />
            </div>
            <input
              type="text"
              placeholder="Qty / Volume"
              value={formData.qty}
              onChange={e => setFormData(f => ({ ...f, qty: e.target.value }))}
              className="terminal-input text-xs w-full"
            />
            <input
              type="text"
              placeholder="Notes"
              value={formData.notes}
              onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))}
              className="terminal-input text-xs w-full"
            />
            <button
              onClick={handleAddData}
              className="w-full py-1 bg-terminal-highlight/20 border border-terminal-highlight text-terminal-highlight text-xs font-mono rounded hover:bg-terminal-highlight/30 transition-colors"
            >
              Save Entry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
