import fs from "node:fs";
import path from "node:path";

const SENT_RECIPIENTS_LOG_PATH = path.join(
  process.cwd(),
  "trial-results",
  "sent-recipients.json"
);

function extractRecipients(rawTo: string): string[] {
  const matches =
    rawTo.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || [];
  return Array.from(new Set(matches.map((m) => m.toLowerCase())));
}

function appendRecipientsLog(entry: { recipientMailAddress: string[] }) {
  fs.mkdirSync(path.dirname(SENT_RECIPIENTS_LOG_PATH), {
    recursive: true,
  });

  let current: Array<{ recipientMailAddress: string[] }> = [];

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
  const recipients = extractRecipients(
    [toHeader, ccHeader].filter(Boolean).join(", ")
  );

  appendRecipientsLog({
    recipientMailAddress: recipients,
  });

  console.log(
    JSON.stringify(
      {
        recipientMailAddress: recipients,
      },
      null,
      2
    )
  );

  console.log(
    `Mock email prepared. To: ${toHeader}${ccHeader ? ` | cc: ${ccHeader}` : ""} | Subject: ${subject} | Body length: ${body.length}`
  );

  void tokens;

  return {
    id: `mock-${Date.now()}`,
  };
}
