import { useState } from 'react';
import { TradeCalculator } from './TradeCalculator';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface PlaybookDef {
  name: string;
  timeframe: string;
  source: string;
  rationale: string;
  entryRule: string;
  exitRule: string;
  category: 'event' | 'momentum' | 'intraday';
}

interface Props {
  playbook: PlaybookDef;
}

const CATEGORY_STYLES = {
  event: { border: 'border-terminal-amber/40', badge: 'bg-terminal-amber/20 text-terminal-amber border-terminal-amber/50', label: 'EVENT-DRIVEN' },
  momentum: { border: 'border-terminal-highlight/40', badge: 'bg-terminal-highlight/20 text-terminal-highlight border-terminal-highlight/50', label: 'MOMENTUM' },
  intraday: { border: 'border-purple-500/40', badge: 'bg-purple-500/20 text-purple-400 border-purple-500/50', label: 'INTRADAY' },
};

export function PlaybookCard({ playbook }: Props) {
  const [expanded, setExpanded] = useState(false);
  const style = CATEGORY_STYLES[playbook.category];

  return (
    <div className={`terminal-card border ${style.border} slide-in`}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-terminal-fg text-sm font-bold leading-tight">{playbook.name}</h3>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              <span className={`text-xs font-mono px-1.5 py-0.5 rounded border ${style.badge}`}>{style.label}</span>
              <span className="text-xs font-mono px-1.5 py-0.5 rounded border border-terminal-border text-terminal-muted">{playbook.timeframe}</span>
            </div>
          </div>
          <button onClick={() => setExpanded(e => !e)} className="text-terminal-muted hover:text-terminal-amber transition-colors shrink-0 mt-1">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        <p className="text-terminal-muted text-xs font-mono italic mb-2">{playbook.rationale}</p>

        <div className="space-y-1.5 text-xs font-mono">
          <div>
            <span className="text-terminal-success font-bold">ENTRY: </span>
            <span className="text-terminal-fg">{playbook.entryRule}</span>
          </div>
          <div>
            <span className="text-terminal-danger font-bold">EXIT: </span>
            <span className="text-terminal-fg">{playbook.exitRule}</span>
          </div>
          <div className="text-terminal-muted text-xs">
            <span className="font-bold">SOURCE: </span>{playbook.source}
          </div>
        </div>

        {expanded && (
          <TradeCalculator playbookName={playbook.name} playbookCategory={playbook.category} />
        )}

        {!expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="mt-3 w-full py-1 border border-dashed border-terminal-border text-terminal-muted text-xs font-mono rounded hover:border-terminal-amber hover:text-terminal-amber transition-colors"
          >
            Open Trade Calculator ▼
          </button>
        )}
      </div>
    </div>
  );
}
