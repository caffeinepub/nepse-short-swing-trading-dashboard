import { useTradingContext } from '../contexts/TradingContext';
import { MetricCard } from './MetricCard';
import { PLEquityCurve } from './PLEquityCurve';
import { PlaybookPerformanceTable } from './PlaybookPerformanceTable';
import {
  calculateWinRate,
  calculateAvgHoldingDays,
  calculateNetPnLPerTrade,
  calculateAvgWinLoss,
  calculateMaxDrawdown,
  calculatePortfolioTurnover,
} from '../utils/metrics';

export function JournalMetrics() {
  const { state, updateManualMetrics } = useTradingContext();
  const { closedTrades, manualMetrics, settings } = state;

  const winRate = calculateWinRate(closedTrades);
  const avgHoldingDays = calculateAvgHoldingDays(closedTrades);
  const netPnLPerTrade = calculateNetPnLPerTrade(closedTrades, settings.feePercent);
  const avgWinLoss = calculateAvgWinLoss(closedTrades);
  const maxDrawdown = calculateMaxDrawdown(closedTrades);
  const portfolioTurnover = calculatePortfolioTurnover(closedTrades);

  return (
    <section className="space-y-4">
      <h2 className="section-title">📈 Journal Metrics Dashboard</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
        <MetricCard
          label="Portfolio Turnover"
          value={portfolioTurnover > 0 ? `${(portfolioTurnover / 1000).toFixed(0)}k` : '—'}
          unit="NPR"
          highlight="neutral"
          description="Total value of all closed trades"
        />
        <MetricCard
          label="Avg Holding Days"
          value={avgHoldingDays > 0 ? avgHoldingDays.toFixed(1) : '—'}
          unit="days"
          highlight="neutral"
          description="Average sessions per trade"
        />
        <MetricCard
          label="Net P&L / Trade"
          value={netPnLPerTrade !== 0 ? `${netPnLPerTrade >= 0 ? '+' : ''}${netPnLPerTrade.toFixed(0)}` : '—'}
          unit="NPR"
          highlight={netPnLPerTrade >= 0 ? 'success' : 'danger'}
          description="After fees deducted"
        />
        <MetricCard
          label="Chase Rate"
          value={manualMetrics.planAdherenceScore > 0 ? `${manualMetrics.planAdherenceScore}` : '—'}
          unit="%"
          isManual
          manualValue={manualMetrics.planAdherenceScore}
          onManualChange={v => updateManualMetrics({ planAdherenceScore: v })}
          highlight={manualMetrics.planAdherenceScore > 15 ? 'danger' : 'neutral'}
          description="% trades after 3 green days"
        />
        <MetricCard
          label="Plan Adherence Score"
          value={manualMetrics.planAdherenceScore}
          unit="/5"
          isManual
          manualValue={manualMetrics.planAdherenceScore}
          manualMin={0}
          manualMax={5}
          onManualChange={v => updateManualMetrics({ planAdherenceScore: Math.min(5, Math.max(0, v)) })}
          highlight={manualMetrics.planAdherenceScore >= 4 ? 'success' : manualMetrics.planAdherenceScore < 3 ? 'danger' : 'warning'}
          description="Self-assessed rule adherence"
        />
        <MetricCard
          label="EDIS Delay Days Avg"
          value={manualMetrics.edisDelayDaysAvg}
          unit="days"
          isManual
          manualValue={manualMetrics.edisDelayDaysAvg}
          manualMin={0}
          manualMax={30}
          onManualChange={v => updateManualMetrics({ edisDelayDaysAvg: v })}
          highlight={manualMetrics.edisDelayDaysAvg > 0 ? 'danger' : 'success'}
          description="Avg days to submit EDIS"
        />
        <MetricCard
          label="Win Rate"
          value={closedTrades.length > 0 ? `${winRate.toFixed(0)}` : '—'}
          unit="%"
          highlight={winRate >= 50 ? 'success' : winRate > 0 ? 'danger' : 'neutral'}
          description="Target: >50%"
        />
        <MetricCard
          label="Avg Win / Avg Loss"
          value={avgWinLoss > 0 ? avgWinLoss.toFixed(2) : '—'}
          unit="ratio"
          highlight={avgWinLoss >= 1.5 ? 'success' : avgWinLoss > 0 ? 'warning' : 'neutral'}
          description="Target: >1.5"
        />
        <MetricCard
          label="Max Drawdown"
          value={maxDrawdown > 0 ? `${(maxDrawdown / 1000).toFixed(1)}k` : '—'}
          unit="NPR"
          highlight={maxDrawdown > 0 ? 'danger' : 'neutral'}
          description="This month's peak-to-trough"
        />
        <MetricCard
          label="Closeout Incidents"
          value={manualMetrics.closeoutIncidents}
          unit="/month"
          isManual
          manualValue={manualMetrics.closeoutIncidents}
          manualMin={0}
          manualMax={50}
          onManualChange={v => updateManualMetrics({ closeoutIncidents: v })}
          highlight={manualMetrics.closeoutIncidents > 0 ? 'danger' : 'success'}
          description="Forced closeout events"
        />
        <MetricCard
          label="Mistimed Corp Actions"
          value={manualMetrics.mistimedCorpActionTrades}
          isManual
          manualValue={manualMetrics.mistimedCorpActionTrades}
          manualMin={0}
          manualMax={50}
          onManualChange={v => updateManualMetrics({ mistimedCorpActionTrades: v })}
          highlight={manualMetrics.mistimedCorpActionTrades > 0 ? 'warning' : 'neutral'}
          description="Trades near book-close errors"
        />
        <MetricCard
          label="Forced Sell Events"
          value={manualMetrics.forcedSellEvents}
          isManual
          manualValue={manualMetrics.forcedSellEvents}
          manualMin={0}
          manualMax={50}
          onManualChange={v => updateManualMetrics({ forcedSellEvents: v })}
          highlight={manualMetrics.forcedSellEvents > 0 ? 'danger' : 'success'}
          description="Involuntary position exits"
        />
      </div>

      <PLEquityCurve />
      <PlaybookPerformanceTable />
    </section>
  );
}
