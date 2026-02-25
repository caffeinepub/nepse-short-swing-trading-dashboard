import { TradingProvider } from './contexts/TradingContext';
import { Navbar } from './components/Navbar';
import { RiskAlertBanner } from './components/RiskAlertBanner';
import { OperationalChecklist } from './components/OperationalChecklist';
import { SignalCatalystEngine } from './components/SignalCatalystEngine';
import { TradeIdeaBuilder } from './components/TradeIdeaBuilder';
import { ActiveTradeLog } from './components/ActiveTradeLog';
import { JournalMetrics } from './components/JournalMetrics';
import { BiasAudit } from './components/BiasAudit';
import { QuickLinksPanel } from './components/QuickLinksPanel';
import { WeeklyReview } from './components/WeeklyReview';
import { PortfolioAllocationGauge } from './components/PortfolioAllocationGauge';
import { MarketClosedOverlay } from './components/MarketClosedOverlay';

function Dashboard() {
  return (
    <div className="min-h-screen bg-terminal-bg text-terminal-fg">
      {/* Fixed Navbar */}
      <Navbar />

      {/* Risk Alert Banner - below navbar */}
      <div className="fixed top-14 left-0 right-0 z-40">
        <RiskAlertBanner />
      </div>

      {/* Main content - padded for fixed navbar + banner */}
      <main className="pt-[88px]">
        <MarketClosedOverlay />

        <div className="max-w-[1600px] mx-auto px-4 py-6 space-y-8">
          {/* Section 3: Operational Checklist */}
          <OperationalChecklist />

          {/* Section 8: Behavioral Bias Audit (before trade ideas) */}
          <BiasAudit />

          {/* Section 4: Signal Catalyst Engine */}
          <SignalCatalystEngine />

          {/* Section 5: Trade Idea Builder */}
          <TradeIdeaBuilder />

          {/* Section 6: Active Trade Log */}
          <ActiveTradeLog />

          {/* Section 7: Journal Metrics */}
          <JournalMetrics />

          {/* Section 11: Portfolio Allocation Gauge */}
          <PortfolioAllocationGauge />

          {/* Section 10: Weekly Review */}
          <WeeklyReview />

          {/* Section 9: Quick Links Panel */}
          <QuickLinksPanel />

          {/* Footer */}
          <footer className="border-t border-terminal-border pt-6 pb-4 text-center">
            <p className="text-terminal-muted text-xs font-mono">
              © {new Date().getFullYear()} NEPSE Short-Swing Trading Dashboard — Personal Use Only
            </p>
            <p className="text-terminal-muted text-xs font-mono mt-1">
              Built with{' '}
              <span className="text-terminal-danger">♥</span>{' '}
              using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== 'undefined' ? window.location.hostname : 'nepse-trading-dashboard')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-terminal-amber hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <TradingProvider>
      <Dashboard />
    </TradingProvider>
  );
}
