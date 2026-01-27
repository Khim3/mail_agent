import { Transaction } from "@/types/transaction";
import { computeStats } from "@/lib/stats/computeStats";

export function buildSpendingReport(
  transactions: Transaction[]
) {
  const stats = computeStats(transactions);

  let report = `Monthly Spending Report\n`;
  report += `======================\n\n`;

  for (const s of stats) {
    report += `Currency: ${s.currency}\n`;
    report += `Transactions: ${s.count}\n`;
    report += `Total: ${s.total.toFixed(2)}\n`;
    report += `Average: ${s.average.toFixed(2)}\n\n`;
  }

  return report;
}
