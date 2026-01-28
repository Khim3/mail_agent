import { ToolLoopAgent, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

import { searchInboxEmails } from "@/lib/gmail/search";
import { readEmailById } from "@/lib/gmail/read";
import { cleanEmailText } from "@/lib/gmail/cleanText";
import { extractTransactionFromText } from "@/lib/extraction/extractTransaction";
import { sendEmail } from "@/lib/gmail/send";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const prompt =
    searchParams.get("q") ||
    "get me 5 latest mails";

  const mailAgent = new ToolLoopAgent({
    model: openai("gpt-4o-mini"),

    tools: {

      // 🔎 SEARCH
      searchEmails: tool({
        description: "Search Gmail inbox",
        inputSchema: z.object({
          query: z.string(),
          maxResults: z.number().default(5),
        }),

        execute: async ({ query, maxResults }) => {
          const tokens = {
            access_token: process.env.TEST_ACCESS_TOKEN!,
            refresh_token: process.env.TEST_REFRESH_TOKEN!,
          };

          return searchInboxEmails(tokens, query, maxResults);
        },
      }),

      // 📩 READ
      readEmail: tool({
        description: "Read full email content by message id",
        inputSchema: z.object({
          messageId: z.string(),
        }),

        execute: async ({ messageId }) => {
          const tokens = {
            access_token: process.env.TEST_ACCESS_TOKEN!,
            refresh_token: process.env.TEST_REFRESH_TOKEN!,
          };

          const email = await readEmailById(tokens, messageId);

          return {
            id: messageId,
            subject: email.subject,
            from: email.from,
            body: cleanEmailText(email.textBody),
          };
        },
      }),

      // 💰 EXTRACT
      extractTransaction: tool({
        description: "Extract monetary transactions from text",
        inputSchema: z.object({
          text: z.string(),
        }),

        execute: async ({ text }) => {
          return extractTransactionFromText(text);
        },
      }),

      // ✉️ SEND
      sendMail: tool({
        description: "Send email with extracted transactions",
        inputSchema: z.object({
          to: z.string(),
          transactions: z.array(
            z.object({
              amount: z.number(),
              currency: z.string(),
            })
          ),
        }),

        execute: async ({ to, transactions }) => {
          const tokens = {
            access_token: process.env.TEST_ACCESS_TOKEN!,
            refresh_token: process.env.TEST_REFRESH_TOKEN!,
          };

          const body =
            "Extracted Transactions:\n\n" +
            transactions
              .map(
                (t) => `- ${t.amount} ${t.currency}`
              )
              .join("\n");

          await sendEmail(
            tokens,
            to,
            "Extracted Spending",
            body
          );

          return { success: true };
        },
      }),
    },
  });

  const result = await mailAgent.generate({
    prompt: `
You are an accounting email assistant.

Rules:
1) If user asks for emails → call searchEmails
2) If user asks to view content → call readEmail
3) If user asks to extract spending → call extractTransaction
4) If user asks to send results → call sendMail

Examples:

"get me 3 invoice mails from steam last month and extract spending"
→ searchEmails → readEmail → extractTransaction

"get me 3 invoice mails from steam last month and extract spending and send to nhatkhiem003@gmail.com"
→ searchEmails → readEmail → extractTransaction → sendMail

User request: ${prompt}
`,
  });

  return Response.json({
    answer: cleanEmailText(result.text),

  });
}
