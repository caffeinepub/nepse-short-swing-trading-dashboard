import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { TradingState, Signal, Trade, ChecklistState, BiasAuditDay, AlertState, ManualMetrics, Settings } from '../types/trading';
import { getTodayNSTString } from '../utils/nepalTime';

const DEFAULT_SIGNALS: Signal[] = [
  { id: 's1', number: 1, name: 'SEBON Approval', description: 'New IPO/Right/Debenture PDF posted in 24h', status: 'CLEAR', category: 'opportunity', data: [], lastUpdated: '' },
  { id: 's2', number: 2, name: 'IPO Pipeline Update', description: 'Pipeline PDF changed', status: 'CLEAR', category: 'opportunity', data: [], lastUpdated: '' },
  { id: 's3', number: 3, name: 'New Listing', description: 'Share Listed event on Sharesansar', status: 'CLEAR', category: 'opportunity', data: [], lastUpdated: '' },
  { id: 's4', number: 4, name: 'Book-Close ≤7 Days', description: 'Book closure or record date approaching', status: 'CLEAR', category: 'opportunity', data: [], lastUpdated: '' },
  { id: 's5', number: 5, name: 'Price Adjustment', description: 'Bonus/Rights price adjusted', status: 'CLEAR', category: 'opportunity', data: [], lastUpdated: '' },
  { id: 's6', number: 6, name: 'Lock-in Supply Shock', description: 'Expiry ≤14 days + qty ≥ 5× avg volume', status: 'CLEAR', category: 'risk', data: [], lastUpdated: '' },
  { id: 's7', number: 7, name: 'Promoter Overhang', description: 'Sale ≥ 500,000 shares or 0.5% of listed', status: 'CLEAR', category: 'risk', data: [], lastUpdated: '' },
  { id: 's8', number: 8, name: 'Auction/Tender ≤7d', description: 'Bid deadline approaching', status: 'CLEAR', category: 'opportunity', data: [], lastUpdated: '' },
  { id: 's9', number: 9, name: 'Earnings Surprise', description: 'Net profit change ≥ 50% vs prior period', status: 'CLEAR', category: 'opportunity', data: [], lastUpdated: '' },
  { id: 's10', number: 10, name: 'EDIS Reminder', description: 'Always-on: T+1 sell trades need EDIS', status: 'WATCH', category: 'risk', data: [], lastUpdated: '' },
  { id: 's11', number: 11, name: 'Momentum/Liquidity', description: 'Ticker in top-10 turnover AND top-10 gainers', status: 'CLEAR', category: 'opportunity', data: [], lastUpdated: '' },
  { id: 's12', number: 12, name: 'Volatility Regime', description: 'Index move ≥2% or recent circuit halt', status: 'CLEAR', category: 'risk', data: [], lastUpdated: '' },
];

const DEFAULT_QUICK_LINKS = [
  { id: 'ql1', label: 'SEBON IPO Approved', url: 'https://www.sebon.gov.np/approved-issues', group: 'official' as const, lastChecked: undefined },
  { id: 'ql2', label: 'CDSC Lock-in Notices', url: 'https://www.cdsc.com.np/notices', group: 'official' as const, lastChecked: undefined },
  { id: 'ql3', label: 'CDSC Settlement Procedure', url: 'https://www.cdsc.com.np/settlement', group: 'official' as const, lastChecked: undefined },
  { id: 'ql4', label: 'CDSC EDIS Directive', url: 'https://www.cdsc.com.np/edis', group: 'official' as const, lastChecked: undefined },
  { id: 'ql5', label: 'Merolagani Announcements', url: 'https://merolagani.com/Announcements.aspx', group: 'aggregator' as const, lastChecked: undefined },
  { id: 'ql6', label: 'Merolagani Quarterly Reports', url: 'https://merolagani.com/FinancialAnalysis.aspx', group: 'aggregator' as const, lastChecked: undefined },
  { id: 'ql7', label: 'Merolagani Top Turnovers', url: 'https://merolagani.com/StockQuote.aspx', group: 'aggregator' as const, lastChecked: undefined },
  { id: 'ql8', label: 'Sharesansar Share Listed', url: 'https://www.sharesansar.com/category/share-listed', group: 'aggregator' as const, lastChecked: undefined },
  { id: 'ql9', label: 'Sharesansar Dividend/Bonus/Rights', url: 'https://www.sharesansar.com/category/dividend', group: 'aggregator' as const, lastChecked: undefined },
  { id: 'ql10', label: 'Sharesansar Top Turnovers', url: 'https://www.sharesansar.com/top-turnover', group: 'aggregator' as const, lastChecked: undefined },
];

const DEFAULT_STATE: TradingState = {
  accountEquity: 0,
  signals: DEFAULT_SIGNALS,
  checklist: {
    edisCompleted: false,
    noDeliveryCheck: false,
    marginBuffer: false,
    marginBufferPct: '',
    maxLossConfirmed: false,
    positionCapsReviewed: false,
    preDefinedPlan: false,
    biasCheckCompleted: false,
  },
  openTrades: [],
  closedTrades: [],
  alertState: {
    edisDueToday: false,
    closeoutRisk: false,
    lockInSupplyShock: false,
    promoterOverhang: false,
    marginBufferLow: false,
    volatilityRegime: false,
  },
  biasAudit: {},
  quickLinks: DEFAULT_QUICK_LINKS,
  manualMetrics: {
    planAdherenceScore: 0,
    edisDelayDaysAvg: 0,
    closeoutIncidents: 0,
    mistimedCorpActionTrades: 0,
    forcedSellEvents: 0,
    ruleAdherencePct: 0,
    edisErrorsThisWeek: 0,
  },
  settings: {
    feePercent: 0.006,
    maxDailyLossR: 2,
  },
  edisModalDismissed: false,
  weeklyReviewVisible: false,
};

const STORAGE_KEY = 'nepse_trading_dashboard_v1';

function loadFromStorage(): TradingState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    // Merge with defaults to handle new fields
    return {
      ...DEFAULT_STATE,
      ...parsed,
      signals: parsed.signals || DEFAULT_SIGNALS,
      quickLinks: parsed.quickLinks || DEFAULT_QUICK_LINKS,
      settings: { ...DEFAULT_STATE.settings, ...parsed.settings },
      manualMetrics: { ...DEFAULT_STATE.manualMetrics, ...parsed.manualMetrics },
      checklist: { ...DEFAULT_STATE.checklist, ...parsed.checklist },
      alertState: { ...DEFAULT_STATE.alertState, ...parsed.alertState },
    };
  } catch {
    return DEFAULT_STATE;
  }
}

interface TradingContextValue {
  state: TradingState;
  setAccountEquity: (v: number) => void;
  updateSignal: (id: string, updates: Partial<Signal>) => void;
  updateChecklist: (updates: Partial<ChecklistState>) => void;
  addTrade: (trade: Trade) => void;
  updateTrade: (id: string, updates: Partial<Trade>) => void;
  closeTrade: (id: string, exitPrice: number) => void;
  deleteTrade: (id: string) => void;
  updateAlertState: (updates: Partial<AlertState>) => void;
  updateBiasAudit: (date: string, updates: Partial<BiasAuditDay>) => void;
  updateQuickLink: (id: string, lastChecked: string) => void;
  updateManualMetrics: (updates: Partial<ManualMetrics>) => void;
  updateSettings: (updates: Partial<Settings>) => void;
  dismissEdisModal: () => void;
  setWeeklyReviewVisible: (v: boolean) => void;
  exportData: () => void;
  importData: (json: string) => void;
  getTodayBiasAudit: () => BiasAuditDay | null;
  getChecklistCompletion: () => number;
  getDailyPnL: () => number;
  isTradeIdeasLocked: () => boolean;
}

const TradingContext = createContext<TradingContextValue | null>(null);

export function TradingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TradingState>(loadFromStorage);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch { /* ignore */ }
  }, [state]);

  const setAccountEquity = useCallback((v: number) => {
    setState(s => ({ ...s, accountEquity: v }));
  }, []);

  const updateSignal = useCallback((id: string, updates: Partial<Signal>) => {
    setState(s => ({
      ...s,
      signals: s.signals.map(sig => sig.id === id ? { ...sig, ...updates, lastUpdated: new Date().toISOString() } : sig),
    }));
  }, []);

  const updateChecklist = useCallback((updates: Partial<ChecklistState>) => {
    setState(s => ({ ...s, checklist: { ...s.checklist, ...updates } }));
  }, []);

  const addTrade = useCallback((trade: Trade) => {
    setState(s => ({ ...s, openTrades: [...s.openTrades, trade] }));
  }, []);

  const updateTrade = useCallback((id: string, updates: Partial<Trade>) => {
    setState(s => ({
      ...s,
      openTrades: s.openTrades.map(t => t.id === id ? { ...t, ...updates } : t),
    }));
  }, []);

  const closeTrade = useCallback((id: string, exitPrice: number) => {
    setState(s => {
      const trade = s.openTrades.find(t => t.id === id);
      if (!trade) return s;
      const closed: Trade = {
        ...trade,
        exitPrice,
        exitDate: new Date().toISOString(),
        status: 'CLOSED',
      };
      return {
        ...s,
        openTrades: s.openTrades.filter(t => t.id !== id),
        closedTrades: [...s.closedTrades, closed],
      };
    });
  }, []);

  const deleteTrade = useCallback((id: string) => {
    setState(s => ({
      ...s,
      openTrades: s.openTrades.filter(t => t.id !== id),
    }));
  }, []);

  const updateAlertState = useCallback((updates: Partial<AlertState>) => {
    setState(s => ({ ...s, alertState: { ...s.alertState, ...updates } }));
  }, []);

  const updateBiasAudit = useCallback((date: string, updates: Partial<BiasAuditDay>) => {
    setState(s => ({
      ...s,
      biasAudit: {
        ...s.biasAudit,
        [date]: { ...(s.biasAudit[date] || { date, q1: null, q2: null, q3: null, q4: null, q5: null, planAdherenceScore: 3, completed: false }), ...updates },
      },
    }));
  }, []);

  const updateQuickLink = useCallback((id: string, lastChecked: string) => {
    setState(s => ({
      ...s,
      quickLinks: s.quickLinks.map(l => l.id === id ? { ...l, lastChecked } : l),
    }));
  }, []);

  const updateManualMetrics = useCallback((updates: Partial<ManualMetrics>) => {
    setState(s => ({ ...s, manualMetrics: { ...s.manualMetrics, ...updates } }));
  }, []);

  const updateSettings = useCallback((updates: Partial<Settings>) => {
    setState(s => ({ ...s, settings: { ...s.settings, ...updates } }));
  }, []);

  const dismissEdisModal = useCallback(() => {
    setState(s => ({ ...s, edisModalDismissed: true }));
  }, []);

  const setWeeklyReviewVisible = useCallback((v: boolean) => {
    setState(s => ({ ...s, weeklyReviewVisible: v }));
  }, []);

  const exportData = useCallback(() => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nepse-dashboard-${getTodayNSTString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [state]);

  const importData = useCallback((json: string) => {
    try {
      const parsed = JSON.parse(json);
      setState({ ...DEFAULT_STATE, ...parsed });
    } catch { /* ignore */ }
  }, []);

  const getTodayBiasAudit = useCallback((): BiasAuditDay | null => {
    const today = getTodayNSTString();
    return state.biasAudit[today] || null;
  }, [state.biasAudit]);

  const getChecklistCompletion = useCallback((): number => {
    const c = state.checklist;
    const items = [c.edisCompleted, c.noDeliveryCheck, c.marginBuffer, c.maxLossConfirmed, c.positionCapsReviewed, c.preDefinedPlan, c.biasCheckCompleted];
    return items.filter(Boolean).length;
  }, [state.checklist]);

  const getDailyPnL = useCallback((): number => {
    const today = getTodayNSTString();
    return state.closedTrades
      .filter(t => t.exitDate && t.exitDate.startsWith(today))
      .reduce((sum, t) => {
        if (!t.exitPrice) return sum;
        const gross = (t.exitPrice - t.entryPrice) * t.size;
        const fees = (t.entryPrice + t.exitPrice) * t.size * (state.settings.feePercent / 2);
        return sum + gross - fees;
      }, 0);
  }, [state.closedTrades, state.settings.feePercent]);

  const isTradeIdeasLocked = useCallback((): boolean => {
    const checklistDone = getChecklistCompletion() < 7;
    const dailyPnL = getDailyPnL();
    const rValue = state.accountEquity * 0.01;
    const dailyLossHit = rValue > 0 && dailyPnL <= -(state.settings.maxDailyLossR * rValue);
    return checklistDone || dailyLossHit;
  }, [getChecklistCompletion, getDailyPnL, state.accountEquity, state.settings.maxDailyLossR]);

  const value: TradingContextValue = {
    state,
    setAccountEquity,
    updateSignal,
    updateChecklist,
    addTrade,
    updateTrade,
    closeTrade,
    deleteTrade,
    updateAlertState,
    updateBiasAudit,
    updateQuickLink,
    updateManualMetrics,
    updateSettings,
    dismissEdisModal,
    setWeeklyReviewVisible,
    exportData,
    importData,
    getTodayBiasAudit,
    getChecklistCompletion,
    getDailyPnL,
    isTradeIdeasLocked,
  };

  return <TradingContext.Provider value={value}>{children}</TradingContext.Provider>;
}

export function useTradingContext(): TradingContextValue {
  const ctx = useContext(TradingContext);
  if (!ctx) throw new Error('useTradingContext must be used within TradingProvider');
  return ctx;
}
