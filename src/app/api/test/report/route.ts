import { NextResponse } from "next/server";
import { extractTransactionFromText } from "@/lib/extraction/extractTransaction";
import { buildSpendingReport } from "@/lib/report/buildReport";

export async function GET() {
  const sampleEmails = [
    "Thank you for your payment of $45.20 to AWS",
    "Your invoice total is USD 120",
    "Payment successful: 1,200,000 VND",
  ];

  let transactions = [];

  for (const text of sampleEmails) {
    transactions.push(
      ...extractTransactionFromText(text)
    );
  }

  const report = buildSpendingReport(transactions);

  return NextResponse.json({
    transactions,
    report,
  });
}
