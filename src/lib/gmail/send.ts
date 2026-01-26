import { getGmailService } from "./getService";

/**
 * Send plain text email
 */
export async function sendEmail(
  tokens: {
    access_token: string;
    refresh_token?: string;
  },
  to: string,
  subject: string,
  body: string
) {
  const gmail = getGmailService(tokens);

  const message = [
    `To: ${to}`,
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

  return res.data;
}
