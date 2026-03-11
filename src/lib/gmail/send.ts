import fs from "node:fs";
import path from "node:path";

const RECIPIENT_LOG_PATH = path.join(
  process.cwd(),
  "trial-results",
  "sent-recipients.json",
);

function readRecipientLogs() {
  if (!fs.existsSync(RECIPIENT_LOG_PATH)) {
    return [] as string[];
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(RECIPIENT_LOG_PATH, "utf-8"));
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === "string")
      : [];
  } catch {
    return [];
  }
}

function appendRecipientLog(recipient: string) {
  const logs = readRecipientLogs();
  logs.push(recipient);

  fs.mkdirSync(path.dirname(RECIPIENT_LOG_PATH), { recursive: true });
  fs.writeFileSync(RECIPIENT_LOG_PATH, JSON.stringify(logs, null, 2), "utf-8");
}

/**
 * Send plain text email
 */
export async function sendEmail(
  _tokens: {
    access_token: string;
    refresh_token?: string;
  },
  to: string,
  _subject: string,
  _body: string
) {
  appendRecipientLog(to);
  console.log(`Email recipient: ${to}`);

  return {
    id: `logged-only-${Date.now()}`,
  };
}
