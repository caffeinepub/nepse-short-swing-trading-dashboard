import { Trade } from '../types/trading';

export interface AllocationData {
  event: number;
  momentum: number;
  intraday: number;
}

export const TARGET_ALLOCATION: AllocationData = {
  event: 50,
  momentum: 30,
  intraday: 20,
};

export function calculateCategoryAllocation(openTrades: Trade[]): AllocationData {
  const total = openTrades.reduce((sum, t) => sum + t.entryPrice * t.size, 0);
  if (total === 0) return { event: 0, momentum: 0, intraday: 0 };

  const event = openTrades.filter(t => t.playbookCategory === 'event').reduce((s, t) => s + t.entryPrice * t.size, 0);
  const momentum = openTrades.filter(t => t.playbookCategory === 'momentum').reduce((s, t) => s + t.entryPrice * t.size, 0);
  const intraday = openTrades.filter(t => t.playbookCategory === 'intraday').reduce((s, t) => s + t.entryPrice * t.size, 0);

  return {
    event: Math.round((event / total) * 100),
    momentum: Math.round((momentum / total) * 100),
    intraday: Math.round((intraday / total) * 100),
  };
}

export function getRebalancingWarnings(current: AllocationData): string[] {
  const warnings: string[] = [];
  const threshold = 10;

  if (current.event > TARGET_ALLOCATION.event + threshold) {
    warnings.push(`Overweight Event/Swing (${current.event}%). Reduce event-driven trades until momentum setup appears.`);
  }
  if (current.momentum > TARGET_ALLOCATION.momentum + threshold) {
    warnings.push(`Overweight Momentum (${current.momentum}%). Reduce momentum trades until next event-driven setup.`);
  }
  if (current.intraday > TARGET_ALLOCATION.intraday + threshold) {
    warnings.push(`Overweight Intraday (${current.intraday}%). Reduce intraday trades; target allocation is ${TARGET_ALLOCATION.intraday}%.`);
  }
  return warnings;
}
