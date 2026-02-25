import { useTradingContext } from '../contexts/TradingContext';
import { PlaybookCard } from './PlaybookCard';
import { Lock } from 'lucide-react';

const PLAYBOOKS = [
  {
    name: 'IPO First-Trade / Newly Listed Momentum Scalp',
    timeframe: '1–5 sessions',
    source: 'Sharesansar "Share Listed" + NEPSE notice',
    rationale: 'First-day price discovery creates momentum as retail demand absorbs IPO allotment sellers.',
    entryRule: 'Enter at market open on listing day if price is above IPO price; size at 0.5R.',
    exitRule: 'Exit at 3–5% gain or at end of session 5, whichever comes first. Hard stop at IPO price.',
    category: 'event' as const,
  },
  {
    name: 'Post Price-Adjustment Momentum (Bonus/Rights)',
    timeframe: '3–15 sessions',
    source: 'Sharesansar Dividend/Bonus/Rights + NEPSE price adjustment notice',
    rationale: 'Price adjustment creates a perceived discount that attracts retail buyers, driving short-term momentum.',
    entryRule: 'Enter on the first green candle after price adjustment day; confirm volume > 1.5× 20d avg.',
    exitRule: 'Exit at 5–8% gain from adjusted price or stop at 2% below entry.',
    category: 'event' as const,
  },
  {
    name: 'Book-Close Last Trading Day',
    timeframe: '2–7 sessions',
    source: 'Merolagani Announcements + NEPSE book-close calendar',
    rationale: 'Dividend/bonus eligibility deadline creates buying pressure in the final sessions before book-close.',
    entryRule: 'Enter 3–5 sessions before book-close date if stock is in top-20 turnover; size at 0.5R.',
    exitRule: 'Exit on book-close day before 14:30 NST. Stop at 1.5% below entry.',
    category: 'event' as const,
  },
  {
    name: 'Lock-in Expiry Absorption Trade',
    timeframe: '3–20 sessions',
    source: 'CDSC Lock-in Notices + SEBON IPO data',
    rationale: 'Lock-in expiry creates supply overhang; price often dips then recovers as absorption completes.',
    entryRule: 'Enter only after 3 sessions post-expiry if price holds above 10-day low; volume must normalize.',
    exitRule: 'Exit at 5% gain or after 20 sessions. Stop at 10-day low.',
    category: 'event' as const,
  },
  {
    name: 'Promoter Overhang Fade',
    timeframe: '5–30 sessions',
    source: 'SEBON promoter sale disclosures + Merolagani Announcements',
    rationale: 'Promoter sale announcements create selling pressure; fade the overreaction after supply is absorbed.',
    entryRule: 'Enter short (or avoid long) on promoter sale announcement. Re-enter long after 5 sessions of stabilization.',
    exitRule: 'Exit long at 8% gain or after 30 sessions. Stop at announcement-day low.',
    category: 'event' as const,
  },
  {
    name: 'Earnings Surprise Trade',
    timeframe: '2–20 sessions',
    source: 'Merolagani Quarterly Reports + NEPSE financial disclosures',
    rationale: 'Net profit change ≥50% vs prior period creates re-rating momentum as analysts and retail adjust positions.',
    entryRule: 'Enter within 2 sessions of earnings release if profit change ≥50% and price breaks prior resistance.',
    exitRule: 'Exit at 10% gain or after 20 sessions. Stop at earnings-day low.',
    category: 'event' as const,
  },
  {
    name: 'Liquidity Breakout in Top-Turnover Names',
    timeframe: '1–10 sessions',
    source: 'Merolagani/Sharesansar Top Turnovers',
    rationale: 'Stocks in top-10 turnover AND top-10 gainers simultaneously signal institutional accumulation.',
    entryRule: 'Enter on breakout above 5-day high if stock appears in both top-10 turnover and top-10 gainers lists.',
    exitRule: 'Exit at 5% gain or when stock drops out of top-10 turnover. Stop at breakout level.',
    category: 'momentum' as const,
  },
  {
    name: 'VWAP Mean-Reversion on Liquid Names',
    timeframe: 'Intraday only',
    source: 'Real-time NEPSE data + top-turnover list',
    rationale: 'Liquid stocks revert to VWAP intraday; oversold deviations offer high-probability mean-reversion entries.',
    entryRule: 'Enter when price is >2% below VWAP on a top-10 turnover stock; confirm with volume spike.',
    exitRule: 'Exit at VWAP or end of session (14:45 NST). Hard stop at 1.5% below entry. No overnight holds.',
    category: 'intraday' as const,
  },
];

export function TradeIdeaBuilder() {
  const { isTradeIdeasLocked, getChecklistCompletion, getDailyPnL, state } = useTradingContext();
  const locked = isTradeIdeasLocked();
  const checklistDone = getChecklistCompletion() >= 7;
  const dailyPnL = getDailyPnL();
  const rValue = state.accountEquity * 0.01;
  const dailyLossHit = rValue > 0 && dailyPnL <= -(state.settings.maxDailyLossR * rValue);

  const lockMessage = dailyLossHit
    ? 'Daily loss limit reached. Market is closed for you today. Review journal.'
    : 'Complete your operational checklist first';

  return (
    <section className="space-y-4">
      <h2 className="section-title">🎯 Trade Idea Builder</h2>
      <div className="relative">
        {locked && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-terminal-bg/80 backdrop-blur-sm rounded-lg border border-terminal-border">
            <Lock size={32} className={`mb-3 ${dailyLossHit ? 'text-terminal-danger' : 'text-terminal-amber'}`} />
            <p className={`font-mono text-sm font-bold text-center px-4 ${dailyLossHit ? 'text-terminal-danger' : 'text-terminal-amber'}`}>
              {lockMessage}
            </p>
            {!checklistDone && (
              <p className="text-terminal-muted text-xs font-mono mt-2">
                Checklist: {getChecklistCompletion()}/7 complete
              </p>
            )}
          </div>
        )}
        <div className={locked ? 'blur-sm pointer-events-none select-none' : ''}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PLAYBOOKS.map((pb, i) => (
              <PlaybookCard key={i} playbook={pb} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
