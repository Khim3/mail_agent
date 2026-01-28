import { Transaction } from "@/types/transaction";

export function extractTransactionFromText(
  text: string
): Transaction[] {
  const results: Transaction[] = [];

  const regex =
    /([0-9]{1,3}(?:[.,][0-9]{3})*(?:[.,][0-9]+)?)\s*(đồng|VND|USD|\$|đ|₫)|(\$|USD|VND|đồng|đ|₫)\s*([0-9]{1,3}(?:[.,][0-9]{3})*(?:[.,][0-9]+)?)/gi;

  let match;

  while ((match = regex.exec(text)) !== null) {
    let rawAmount: string;
    let currencySymbol: string;

    if (match[1] && match[2]) {
      rawAmount = match[1];
      currencySymbol = match[2];
    } else {
      rawAmount = match[4];
      currencySymbol = match[3];
    }

    const amount = Number(
      rawAmount.replace(/\./g, "").replace(/,/g, "")
    );

    if (isNaN(amount)) continue;

    const currency =
      currencySymbol === "$"
        ? "USD"
        : ["đ", "đồng", "₫"].includes(currencySymbol.toLowerCase())
          ? "VND"
          : currencySymbol.toUpperCase();

    results.push({
      amount,
      currency,
      description: `${rawAmount}${currencySymbol}`,
    });
  }

  return results;
}
