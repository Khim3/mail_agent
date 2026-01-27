import { Transaction } from "@/types/transaction";

export function computeStats(transactions: Transaction[]) {
  const byCurrency: Record<string, number[]> = {};

  for (const t of transactions) {
    if (!byCurrency[t.currency]) {
      byCurrency[t.currency] = [];
    }
    byCurrency[t.currency].push(t.amount);
  }

  const summary = Object.entries(byCurrency).map(
    ([currency, amounts]) => {
      const total = amounts.reduce((a, b) => a + b, 0);
      const avg = total / amounts.length;

      return {
        currency,
        count: amounts.length,
        total,
        average: avg,
      };
    }
  );

  return summary;
}
