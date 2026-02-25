export interface WeeklyMetrics {
  hitRate: number;
  avgWinLoss: number;
  maxDrawdown: number;
  maxDrawdownR: number;
  ruleAdherencePct: number;
  edisErrors: number;
  chaseRate: number;
  planAdherenceAvg: number;
  bestPlaybook: string;
  bestPlaybookR: number;
  worstPlaybook: string;
  worstPlaybookR: number;
}

export function generateRecommendations(metrics: WeeklyMetrics): string[] {
  const recs: string[] = [];

  if (metrics.hitRate < 40) {
    recs.push('Win rate is below 40% threshold. Reduce to 1 trade/day and focus exclusively on the highest-conviction playbook until win rate recovers above 50%.');
  }
  if (metrics.chaseRate > 20) {
    recs.push(`Chase rate is ${metrics.chaseRate.toFixed(1)}% (target: <15%). Implement a mandatory 24-hour waiting rule before entering any stock that has been up 3+ consecutive days.`);
  }
  if (metrics.edisErrors > 0) {
    recs.push(`${metrics.edisErrors} EDIS error(s) recorded this week (target: 0). Enforce hard rule: no sell order without confirming EDIS slot availability on the same day.`);
  }
  if (metrics.planAdherenceAvg < 3) {
    recs.push(`Plan adherence score is ${metrics.planAdherenceAvg.toFixed(1)}/5 (target: ≥4). Switch to paper trading only next week. Real capital requires rule discipline — no exceptions.`);
  }
  if (metrics.ruleAdherencePct < 80) {
    recs.push(`Rule adherence is ${metrics.ruleAdherencePct.toFixed(0)}% (target: >80%). Review each deviation in the trade journal and identify the specific rule that was broken.`);
  }
  if (metrics.avgWinLoss < 1.5 && metrics.avgWinLoss > 0) {
    recs.push(`Avg Win/Loss ratio is ${metrics.avgWinLoss.toFixed(2)} (target: >1.5). Review exit rules — exits may be too early on winners or too late on losers.`);
  }

  if (recs.length === 0) {
    recs.push(`All key metrics are within target ranges. Maintain current approach. Consider scaling R by 0.1% next week if win rate and plan adherence remain above targets for 2 consecutive weeks.`);
  }

  return recs;
}
