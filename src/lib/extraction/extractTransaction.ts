import { Transaction } from "@/types/transaction";

export function extractTransactionFromText(
  text: string
): Transaction[] {
  const results: Transaction[] = [];

 
  const regex =
    /(\$|USD|VND|đ)\s?([0-9,.]+)/gi;

  let match;

  while ((match = regex.exec(text)) !== null) {
    const currencySymbol = match[1];
    const rawAmount = match[2].replace(/,/g, "");

    const amount = Number(rawAmount);
    if (isNaN(amount)) continue;

    const currency =
      currencySymbol === "$"
        ? "USD"
        : currencySymbol.toUpperCase();

    results.push({
      amount,
      currency,
      description: match[0],
    });
  }

  return results;
}
