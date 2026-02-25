import { useState } from 'react';

interface Props {
  label: string;
  value: string | number;
  unit?: string;
  isManual?: boolean;
  onManualChange?: (v: number) => void;
  manualValue?: number;
  manualMin?: number;
  manualMax?: number;
  highlight?: 'success' | 'danger' | 'warning' | 'neutral';
  description?: string;
}

const HIGHLIGHT_STYLES = {
  success: 'text-terminal-success',
  danger: 'text-terminal-danger',
  warning: 'text-yellow-400',
  neutral: 'text-terminal-amber',
};

export function MetricCard({ label, value, unit, isManual, onManualChange, manualValue, manualMin = 0, manualMax = 100, highlight = 'neutral', description }: Props) {
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState(String(manualValue ?? 0));

  const handleSave = () => {
    const v = parseFloat(inputVal);
    if (!isNaN(v) && onManualChange) onManualChange(v);
    setEditing(false);
  };

  return (
    <div className="terminal-card p-4 flex flex-col gap-1">
      <span className="text-terminal-muted text-xs font-mono uppercase tracking-wider leading-tight">{label}</span>
      {isManual && editing ? (
        <div className="flex items-center gap-1 mt-1">
          <input
            type="number"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onBlur={handleSave}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            min={manualMin}
            max={manualMax}
            className="terminal-input text-sm w-20"
            autoFocus
          />
          {unit && <span className="text-terminal-muted text-xs font-mono">{unit}</span>}
        </div>
      ) : (
        <div className="flex items-end gap-1 mt-1">
          <span className={`font-display text-xl font-bold tabular-nums ${HIGHLIGHT_STYLES[highlight]}`}>
            {typeof value === 'number' ? value.toLocaleString('en-IN', { maximumFractionDigits: 1 }) : value}
          </span>
          {unit && <span className="text-terminal-muted text-xs font-mono mb-0.5">{unit}</span>}
        </div>
      )}
      {description && <p className="text-terminal-muted text-xs font-mono leading-tight">{description}</p>}
      {isManual && (
        <button
          onClick={() => { setEditing(true); setInputVal(String(manualValue ?? 0)); }}
          className="text-terminal-highlight text-xs font-mono hover:underline mt-1 text-left"
        >
          {editing ? '' : '✏ Edit'}
        </button>
      )}
    </div>
  );
}
