import { ToolLoopAgent, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

import { searchInboxEmails } from "@/lib/gmail/search";
import { readEmailById } from "@/lib/gmail/read";
import { cleanEmailText } from "@/lib/gmail/cleanText";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const prompt =
    searchParams.get("q") ||
    "get me 5 latest mails";

  const mailAgent = new ToolLoopAgent({
    model: openai("gpt-4o-mini"),

    tools: {
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

          return await searchInboxEmails(
            tokens,
            query,
            maxResults
          );
        },
      }),

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

          const email = await readEmailById(
            tokens,
            messageId
          );

          return {
            id: messageId,
            subject: email.subject,
            from: email.from,
            to: email.to,
            body: cleanEmailText(email.textBody),
          };
        },
      }),
    },
  });

  const result = await mailAgent.generate({
    prompt: `
You are an email assistant.

Steps:
1) If user asks for emails → call searchEmails
2) If user asks to see content → call readEmail for each id

Examples:

"get me 4 invoice mails from steam last month"
→ call searchEmails

"get me 2 invoice mails from steam last month and show content"
→ call searchEmails
→ then call readEmail on returned ids

User request: ${prompt}
`,
  });

  return Response.json({
    answer: result.text,
  });
}
