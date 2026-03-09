import { getGmailService } from "./getService";
import fs from "node:fs";
import path from "node:path";

const SENT_RECIPIENTS_LOG_PATH = path.join(
  process.cwd(),
  "trial-results",
  "sent-recipients-lv1.json"
);

function extractRecipients(rawTo: string): string[] {
  const matches =
    rawTo.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || [];
  return Array.from(new Set(matches.map((m) => m.toLowerCase())));
}

function appendRecipientsLog(entry: {
  recipientMailAddress: string[];
}) {
  fs.mkdirSync(path.dirname(SENT_RECIPIENTS_LOG_PATH), {
    recursive: true,
  });

  let current: Array<{
    recipientMailAddress: string[];
  }> = [];

  if (fs.existsSync(SENT_RECIPIENTS_LOG_PATH)) {
    try {
      const parsed = JSON.parse(
        fs.readFileSync(SENT_RECIPIENTS_LOG_PATH, "utf-8")
      );
      if (Array.isArray(parsed)) {
        current = parsed;
      }
    } catch {
      current = [];
    }
  }

  current.push(entry);
  fs.writeFileSync(
    SENT_RECIPIENTS_LOG_PATH,
    JSON.stringify(current, null, 2),
    "utf-8"
  );
}

/**
 * Send plain text email
 */
export async function sendEmail(
  tokens: {
    access_token: string;
    refresh_token?: string;
  },
  to: string | string[],
  subject: string,
  body: string,
  cc?: string | string[]
) {
  const toHeader = Array.isArray(to) ? to.join(", ") : to;
  const ccHeader = Array.isArray(cc) ? cc.join(", ") : cc || "";
  const recipients = extractRecipients([toHeader, ccHeader].filter(Boolean).join(", "));
  appendRecipientsLog({
    recipientMailAddress: recipients,
  });

  const disableGmailSend =
    process.env.DISABLE_GMAIL_SEND?.toLowerCase() !== "false";

  if (disableGmailSend) {
    console.log(
      JSON.stringify(
        {
          recipientMailAddress: recipients,
        },
        null,
        2
      )
    );

    return {
      id: `mock-${Date.now()}`,
    };
  }

  const gmail = getGmailService(tokens);

  const message = [
    `To: ${toHeader}`,
    ...(ccHeader ? [`Cc: ${ccHeader}`] : []),
    "Content-Type: text/plain; charset=utf-8",
    "MIME-Version: 1.0",
    `Subject: ${subject}`,
    "",
    body,
  ].join("\n");

  const encodedMessage = Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const res = await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: encodedMessage,
    },
  });
  console.log(`Email sent to: ${toHeader}${ccHeader ? ` | cc: ${ccHeader}` : ""}`);
  return res.data;
}
