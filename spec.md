# Specification

## Summary
**Goal:** Build a comprehensive NEPSE short-swing trading dashboard — a fully client-side, localStorage-persisted React app with Bloomberg-style dark terminal UI for Nepalese equity traders.

**Planned changes:**

### Global State & Persistence
- React Context storing accountEquity, dailyPnL, openTrades, closedTrades, signalCards (12), checklistState (7 items), biasAuditAnswers, weeklyReviewData, quickLinksLastChecked, and settings (feePercent 0.6%, riskPercent 0.5%/1.0%)
- All state persists to localStorage on every change and rehydrates on load
- JSON export/import functionality

### Navbar
- Logo "🇳🇵 NEPSE DESK", live Nepal Standard Time clock (UTC+5:45) updating every second
- Market status indicator: OPEN on Sun–Thu 11:00–15:00 NST, CLOSED otherwise
- Account equity (NPR) input field persisted to localStorage
- "Max Loss Today: 2R = NPR ___" badge turning red at -2R daily P&L

### Risk Alert Banner
- Full-width banner with 7 alert pill types: EDIS DUE TODAY (red pulsing), CLOSEOUT RISK (red), LOCK-IN SUPPLY SHOCK (orange), PROMOTER OVERHANG (orange), MARGIN BUFFER LOW (yellow), VOLATILITY REGIME (blue), ALL CLEAR (green)
- CSS pulse animation on red alerts; modal on page load when red alert is active requiring confirmation

### Operational Checklist
- Collapsible card (open by default) with 7 checkboxes and a progress bar (0/7 – 7/7)
- Trade Ideas section blurred with lock overlay until all 7 items are checked

### 12-Signal Catalyst Engine
- SignalCard component for all 12 signals (S1–S12 as specified) with status toggle (ACTIVE/WATCH/CLEAR), last updated timestamp, and inline "Add Data" mini-form (ticker, date, qty, notes)
- Auto-sort: RED first, then YELLOW/ORANGE, then CLEAR
- Signal Summary Bar showing counts by category

### Trade Idea Builder (8 Playbook Cards)
- Gated behind checklist completion (blurred if < 100%)
- 8 PlaybookCards with strategy name, timeframe badge, source badge, rationale, entry/exit rules, and embedded TradeCalculator
- Color-coded: amber = event-driven, blue = momentum, purple = intraday

### Trade Calculator
- Inputs: Ticker, Entry Price, Stop Price, Account Equity (auto-populated), Risk % dropdown (0.5%/1.0%), Avg Daily Turnover 20d
- Exact position sizing logic: positionShares, liquidityCap (10% of avg turnover), effectiveShares = min(positionShares, liquidityCapShares), breakevenPct, rValue, daysToExit
- ⚠️ liquidity warning if daysToExit > 3; error message if effectiveShares = 0
- "💾 Add to Trade Log" button

### Active Trade Log
- CRUD table: Ticker, Playbook, Entry/Stop/Current Price, Size, Entry Date, Current P&L (NPR & R-multiple), Days Held, Status, Actions (Edit, Close Trade, Flag EDIS)
- Green/red row color-coding; sorted by P&L ascending
- Close Trade dialog computes net P&L after configurable fee
- Summary bar: open trades count, today's realized P&L, max daily loss remaining, daily loss limit %
- Lock Trade Ideas with message at -2R daily loss

### Journal Metrics Dashboard
- 12 metric cards (computed + manual-input) from trade log data: Portfolio Turnover, Avg Holding Days, Net P&L/Trade, Chase Rate, Plan Adherence Score, EDIS Delay Days Avg, Win Rate, Avg Win/Loss, Max Drawdown, Closeout Incidents, Mistimed Corporate Actions, Forced Sell Events
- Recharts line chart: cumulative P&L (NPR) with R-multiple secondary Y-axis
- Playbook Performance Table: Name, Trades, Win Rate, Avg R, Best/Worst Trade

### Behavioral Bias Daily Audit
- 5 Yes/No/Unsure toggle questions with rule-based warnings per answer
- BIAS STATUS chip: LOW RISK ✅ or ELEVATED ⚠️
- Plan Adherence Score slider (0–5) auto-saved per calendar day
- Trade Calculator soft-lock until daily audit is completed

### Quick Links Panel
- Sidebar/bottom bar with 10 links in two groups (Official Sources: SEBON, CDSC × 3; Aggregators: Merolagani × 3, Sharesansar × 3) opening in new tabs
- Each link has a ✓ button stamping current Nepal time as "Last Checked", persisted to localStorage

### Weekly Review Module
- Auto-displays on Sundays (NST); manual trigger button available any day
- Computes 7 metrics (Hit Rate, Avg Win/Loss, Max Drawdown, Rule Adherence %, EDIS Errors, Chase Rate %, Plan Adherence Avg) from stored data
- Rule-based text recommendations citing specific metrics (never "feel" or "looks good")
- "📥 Export Weekly Report as PDF" via window.print()

### Portfolio Allocation Gauge
- Recharts donut chart: current allocation by playbook category (Event/Swing 50%, Momentum 30%, IPO/New Listing 20% targets)
- Computed from open trades by playbook type
- Rebalancing warning when a category deviates meaningfully from its target

### Visual Theme
- Dark terminal theme: bg #0A0E1A, surface #111827, borders #1E293B, accent #F59E0B, success #10B981, danger #EF4444, muted #6B7280, highlight #3B82F6
- JetBrains Mono / IBM Plex Mono for headers/data fields; Inter for body text
- Full-width layout: 3-column (≥1280px), 2-column (768–1279px), single column (<768px)
- Thin amber top border, scanline texture background overlay
- Micro-animations: pulse on alerts, slide-in on cards
- Dashboard dims to 70% opacity with "MARKET CLOSED — Planning Mode" banner when NEPSE is closed
- All colors and fonts configured in tailwind.config.js

**User-visible outcome:** A fully functional, single-page NEPSE trading dashboard running entirely in the browser with no backend — traders can manage risk alerts, run the operational checklist, evaluate 12 market signals, size trades across 8 playbooks, log and track trades, review behavioral biases, analyze performance metrics via charts, and conduct weekly reviews, all with data persisting locally and a Bloomberg-style dark terminal interface calibrated to Nepal market hours.
