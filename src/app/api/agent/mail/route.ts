import { ToolLoopAgent, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

import {
  saveMemory,
  loadMemory,
  clearMemory,
} from "@/lib/memory/fileStore";

import { searchInboxEmails } from "@/lib/gmail/search";
import { readEmailById } from "@/lib/gmail/read";
import { cleanEmailText } from "@/lib/gmail/cleanText";
import { sendEmail } from "@/lib/gmail/send";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const prompt =
    searchParams.get("q") ||
    "get me 5 latest mails";

  // Clear memory at start of each run
  if (
  prompt.toLowerCase().includes("get") &&
  prompt.toLowerCase().includes("mail")
) {
  clearMemory();
}

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

          return await searchInboxEmails(
            tokens,
            query,
            maxResults
          );
        },
      }),

      // 📩 READ + SAVE
      readEmail: tool({
        description:
          "Read full email and store content into JSON memory",

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

          const cleanBody = cleanEmailText(
            email.textBody
          );

          const memory = loadMemory();
          memory.emails.push({
            id: messageId,
            subject: email.subject,
            from: email.from,
            body: cleanBody,
          });

          saveMemory(memory);

          return {
            id: messageId,
            subject: email.subject,
            from: email.from,
          };
        },
      }),

      // 🧠 LOAD MEMORY
      getStoredEmails: tool({
        description:
          "Load stored email contents from JSON memory",

        inputSchema: z.object({}),

        execute: async () => {
          const memory = loadMemory();
          return memory.emails || [];
        },
      }),

      // ✉️ SEND
      sendMail: tool({
        description:
          "Send email using stored email context",

        inputSchema: z.object({
          to: z.string(),
        }),

        execute: async ({ to }) => {
          const tokens = {
            access_token: process.env.TEST_ACCESS_TOKEN!,
            refresh_token: process.env.TEST_REFRESH_TOKEN!,
          };

          const memory = loadMemory();

          const content = memory.emails
            .map(
              (e, i) =>
                `Email ${i + 1}\nSubject: ${e.subject}\nFrom: ${e.from}\n\n${e.body}`
            )
            .join(
              "\n\n----------------\n\n"
            );

          await sendEmail(
            tokens,
            to,
            "Forwarded Emails",
            content
          );

          return { success: true };
        },
      }),
    },
  });

  const result = await mailAgent.generate({
    prompt: `
You are an email assistant.

Rules:
1) If user asks to get emails → call searchEmails
2) After search → call readEmail for each id
3) Email bodies are saved into JSON memory
4) If user says "send them" → call sendMail

Examples:

"get me 5 mails yesterday"
→ searchEmails → readEmail

"send them to nhatkhiem003@gmail.com"
→ sendMail

User request: ${prompt}
`,
  });
  return Response.json({
    answer: result.text,
  });
}
