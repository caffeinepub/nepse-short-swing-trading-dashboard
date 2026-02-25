import { useTradingContext } from '../contexts/TradingContext';
import { getNSTString } from '../utils/nepalTime';
import { ExternalLink, Check } from 'lucide-react';

export function QuickLinksPanel() {
  const { state, updateQuickLink } = useTradingContext();
  const { quickLinks } = state;

  const officialLinks = quickLinks.filter(l => l.group === 'official');
  const aggregatorLinks = quickLinks.filter(l => l.group === 'aggregator');

  const handleCheck = (id: string) => {
    updateQuickLink(id, new Date().toISOString());
  };

  const LinkRow = ({ link }: { link: typeof quickLinks[0] }) => (
    <div className="flex items-center justify-between py-1.5 border-b border-terminal-border/20 last:border-0">
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-terminal-highlight text-xs font-mono hover:text-terminal-amber transition-colors group"
      >
        <ExternalLink size={10} className="shrink-0 group-hover:text-terminal-amber" />
        {link.label}
      </a>
      <div className="flex items-center gap-2 shrink-0 ml-2">
        {link.lastChecked && (
          <span className="text-terminal-muted text-xs font-mono">
            {new Date(link.lastChecked).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
        <button
          onClick={() => handleCheck(link.id)}
          title="Mark as checked"
          className="flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-terminal-border text-terminal-muted hover:border-terminal-success hover:text-terminal-success transition-colors text-xs font-mono"
        >
          <Check size={10} /> ✓
        </button>
      </div>
    </div>
  );

  return (
    <section className="space-y-4">
      <h2 className="section-title">🔗 Quick Links Panel</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Official Sources */}
        <div className="terminal-card p-4">
          <h3 className="font-display text-terminal-amber text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-terminal-amber inline-block" />
            Official Sources
          </h3>
          <div>
            {officialLinks.map(link => <LinkRow key={link.id} link={link} />)}
          </div>
        </div>

        {/* Aggregators */}
        <div className="terminal-card p-4">
          <h3 className="font-display text-terminal-highlight text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-terminal-highlight inline-block" />
            Aggregators
          </h3>
          <div>
            {aggregatorLinks.map(link => <LinkRow key={link.id} link={link} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
