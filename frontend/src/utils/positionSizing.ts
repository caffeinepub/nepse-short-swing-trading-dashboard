export interface PositionSizingInput {
  accountEquity: number;
  riskPercent: number; // e.g. 0.005 for 0.5%
  entryPrice: number;
  stopPrice: number;
  avgDailyTurnover20d: number;
  feePercent?: number; // default 0.006
}

export interface PositionSizingOutput {
  positionShares: number;
  maxPositionValue: number;
  liquidityCapNPR: number;
  liquidityCapShares: number;
  effectiveShares: number;
  effectiveValue: number;
  breakevenPct: number;
  rValue: number;
  daysToExit: number;
  liquidityWarning: boolean;
  zeroSharesError: boolean;
}

export function calculatePositionSizing(input: PositionSizingInput): PositionSizingOutput {
  const { accountEquity, riskPercent, entryPrice, stopPrice, avgDailyTurnover20d, feePercent = 0.006 } = input;

  const rValue = accountEquity * riskPercent;
  const priceDiff = entryPrice - stopPrice;

  let positionShares = 0;
  if (priceDiff > 0) {
    positionShares = Math.floor(rValue / priceDiff);
  }

  const liquidityCapNPR = avgDailyTurnover20d * 0.10;
  const liquidityCapShares = avgDailyTurnover20d > 0 ? Math.floor(liquidityCapNPR / entryPrice) : 0;

  const effectiveShares = avgDailyTurnover20d > 0
    ? Math.min(positionShares, liquidityCapShares)
    : positionShares;

  const effectiveValue = effectiveShares * entryPrice;
  const maxPositionValue = positionShares * entryPrice;

  const breakevenPct = feePercent * 100;

  const daysToExit = avgDailyTurnover20d > 0 ? effectiveValue / avgDailyTurnover20d : 0;

  return {
    positionShares,
    maxPositionValue,
    liquidityCapNPR,
    liquidityCapShares,
    effectiveShares,
    effectiveValue,
    breakevenPct,
    rValue,
    daysToExit,
    liquidityWarning: daysToExit > 3,
    zeroSharesError: effectiveShares === 0,
  };
}
