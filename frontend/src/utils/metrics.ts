import { Trade } from '../types/trading';

export function calculateWinRate(trades: Trade[]): number {
  const closed = trades.filter(t => t.status === 'CLOSED' || t.status === 'STOPPED_OUT' || t.status === 'TARGET_HIT');
  if (closed.length === 0) return 0;
  const wins = closed.filter(t => {
    const pnl = t.exitPrice ? (t.exitPrice - t.entryPrice) * t.size : 0;
    return pnl > 0;
  });
  return (wins.length / closed.length) * 100;
}

export function calculateAvgHoldingDays(trades: Trade[]): number {
  const closed = trades.filter(t => t.exitDate);
  if (closed.length === 0) return 0;
  const totalDays = closed.reduce((sum, t) => {
    const entry = new Date(t.entryDate).getTime();
    const exit = new Date(t.exitDate!).getTime();
    return sum + Math.max(0, Math.round((exit - entry) / (1000 * 60 * 60 * 24)));
  }, 0);
  return totalDays / closed.length;
}

export function calculateNetPnLPerTrade(trades: Trade[], feePercent: number): number {
  const closed = trades.filter(t => t.exitPrice !== undefined);
  if (closed.length === 0) return 0;
  const totalPnL = closed.reduce((sum, t) => {
    const gross = (t.exitPrice! - t.entryPrice) * t.size;
    const fees = (t.entryPrice + t.exitPrice!) * t.size * (feePercent / 2);
    return sum + gross - fees;
  }, 0);
  return totalPnL / closed.length;
}

export function calculateAvgWinLoss(trades: Trade[]): number {
  const closed = trades.filter(t => t.exitPrice !== undefined);
  const wins = closed.filter(t => (t.exitPrice! - t.entryPrice) * t.size > 0);
  const losses = closed.filter(t => (t.exitPrice! - t.entryPrice) * t.size < 0);
  if (wins.length === 0 || losses.length === 0) return 0;
  const avgWin = wins.reduce((s, t) => s + (t.exitPrice! - t.entryPrice) * t.size, 0) / wins.length;
  const avgLoss = Math.abs(losses.reduce((s, t) => s + (t.exitPrice! - t.entryPrice) * t.size, 0) / losses.length);
  return avgLoss > 0 ? avgWin / avgLoss : 0;
}

export function calculateMaxDrawdown(trades: Trade[]): number {
  const closed = trades.filter(t => t.exitDate && t.exitPrice !== undefined);
  if (closed.length === 0) return 0;
  const sorted = [...closed].sort((a, b) => new Date(a.exitDate!).getTime() - new Date(b.exitDate!).getTime());
  let peak = 0;
  let cumPnL = 0;
  let maxDD = 0;
  for (const t of sorted) {
    const pnl = (t.exitPrice! - t.entryPrice) * t.size;
    cumPnL += pnl;
    if (cumPnL > peak) peak = cumPnL;
    const dd = peak - cumPnL;
    if (dd > maxDD) maxDD = dd;
  }
  return maxDD;
}

export function calculatePortfolioTurnover(trades: Trade[]): number {
  return trades.reduce((sum, t) => sum + t.entryPrice * t.size, 0);
}

export function calculateTradePnL(trade: Trade, feePercent: number): number {
  if (!trade.exitPrice) return 0;
  const gross = (trade.exitPrice - trade.entryPrice) * trade.size;
  const fees = (trade.entryPrice + trade.exitPrice) * trade.size * (feePercent / 2);
  return gross - fees;
}

export function calculateCurrentPnL(trade: Trade): number {
  if (!trade.currentPrice) return 0;
  return (trade.currentPrice - trade.entryPrice) * trade.size;
}

export function calculateDaysHeld(entryDate: string): number {
  const entry = new Date(entryDate).getTime();
  const now = Date.now();
  return Math.max(0, Math.floor((now - entry) / (1000 * 60 * 60 * 24)));
}

export function calculateRMultiple(pnl: number, rValue: number): number {
  if (rValue === 0) return 0;
  return pnl / rValue;
}

export function getPlaybookPerformance(trades: Trade[], feePercent: number) {
  const playbookMap: Record<string, Trade[]> = {};
  trades.forEach(t => {
    if (!playbookMap[t.playbook]) playbookMap[t.playbook] = [];
    playbookMap[t.playbook].push(t);
  });

  return Object.entries(playbookMap).map(([name, pbTrades]) => {
    const closed = pbTrades.filter(t => t.exitPrice !== undefined);
    const wins = closed.filter(t => calculateTradePnL(t, feePercent) > 0);
    const winRate = closed.length > 0 ? (wins.length / closed.length) * 100 : 0;
    const pnls = closed.map(t => calculateTradePnL(t, feePercent));
    const avgR = closed.length > 0 && closed[0].rValue > 0
      ? pnls.reduce((s, p) => s + p, 0) / closed.length / closed[0].rValue
      : 0;
    const best = pnls.length > 0 ? Math.max(...pnls) : 0;
    const worst = pnls.length > 0 ? Math.min(...pnls) : 0;
    return { name, trades: closed.length, winRate, avgR, best, worst };
  });
}

export function getEquityCurve(trades: Trade[], feePercent: number, accountEquity: number) {
  const closed = trades
    .filter(t => t.exitDate && t.exitPrice !== undefined)
    .sort((a, b) => new Date(a.exitDate!).getTime() - new Date(b.exitDate!).getTime());

  let cumPnL = 0;
  return closed.map(t => {
    const pnl = calculateTradePnL(t, feePercent);
    cumPnL += pnl;
    const rVal = t.rValue > 0 ? t.rValue : accountEquity * 0.005;
    return {
      date: t.exitDate!,
      pnl: cumPnL,
      rMultiple: rVal > 0 ? cumPnL / rVal : 0,
    };
  });
}
