export type SignalStatus = 'ACTIVE' | 'WATCH' | 'CLEAR';
export type TradeStatus = 'OPEN' | 'CLOSED' | 'STOPPED_OUT' | 'TARGET_HIT';
export type BiasAnswer = 'YES' | 'NO' | 'UNSURE' | null;
export type AlertType = 'EDIS_DUE' | 'CLOSEOUT_RISK' | 'LOCK_IN_SHOCK' | 'PROMOTER_OVERHANG' | 'MARGIN_BUFFER_LOW' | 'VOLATILITY_REGIME';

export interface SignalData {
  id: string;
  ticker?: string;
  date?: string;
  qty?: string;
  notes?: string;
  updatedAt?: string;
}

export interface Signal {
  id: string;
  number: number;
  name: string;
  description: string;
  status: SignalStatus;
  category: 'risk' | 'opportunity' | 'neutral';
  data: SignalData[];
  lastUpdated: string;
}

export interface Trade {
  id: string;
  ticker: string;
  playbook: string;
  playbookCategory: 'event' | 'momentum' | 'intraday';
  entryPrice: number;
  stopPrice: number;
  size: number;
  entryDate: string;
  currentPrice?: number;
  exitPrice?: number;
  exitDate?: string;
  status: TradeStatus;
  edisFlag: boolean;
  notes?: string;
  rValue: number;
}

export interface ChecklistState {
  edisCompleted: boolean;
  noDeliveryCheck: boolean;
  marginBuffer: boolean;
  marginBufferPct: string;
  maxLossConfirmed: boolean;
  positionCapsReviewed: boolean;
  preDefinedPlan: boolean;
  biasCheckCompleted: boolean;
}

export interface BiasAuditDay {
  date: string;
  q1: BiasAnswer;
  q2: BiasAnswer;
  q3: BiasAnswer;
  q4: BiasAnswer;
  q5: BiasAnswer;
  planAdherenceScore: number;
  completed: boolean;
}

export interface AlertState {
  edisDueToday: boolean;
  closeoutRisk: boolean;
  lockInSupplyShock: boolean;
  promoterOverhang: boolean;
  marginBufferLow: boolean;
  volatilityRegime: boolean;
}

export interface QuickLink {
  id: string;
  label: string;
  url: string;
  group: 'official' | 'aggregator';
  lastChecked?: string;
}

export interface ManualMetrics {
  planAdherenceScore: number;
  edisDelayDaysAvg: number;
  closeoutIncidents: number;
  mistimedCorpActionTrades: number;
  forcedSellEvents: number;
  ruleAdherencePct: number;
  edisErrorsThisWeek: number;
}

export interface Settings {
  feePercent: number;
  maxDailyLossR: number;
}

export interface TradingState {
  accountEquity: number;
  signals: Signal[];
  checklist: ChecklistState;
  openTrades: Trade[];
  closedTrades: Trade[];
  alertState: AlertState;
  biasAudit: Record<string, BiasAuditDay>;
  quickLinks: QuickLink[];
  manualMetrics: ManualMetrics;
  settings: Settings;
  edisModalDismissed: boolean;
  weeklyReviewVisible: boolean;
}
