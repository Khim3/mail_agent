import { getGmailService } from "./getService";
import { extractEmailBody } from "./extractBody";

export async function readEmailById(
  tokens: {
    access_token: string;
    refresh_token?: string;
  },
  messageId: string
) {
  const gmail = getGmailService(tokens);

  const res = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
    format: "full",
  });

  const payload = res.data.payload;
  const headers = payload?.headers || [];

  const getHeader = (name: string) =>
    headers.find(h => h.name?.toLowerCase() === name.toLowerCase())?.value;

  const { text, html } = extractEmailBody(payload);

  return {
    id: messageId,
    threadId: res.data.threadId,
    subject: getHeader("Subject"),
    from: getHeader("From"),
    to: getHeader("To"),
    date: getHeader("Date"),
    snippet: res.data.snippet,
    textBody: text,
    htmlBody: html,
  };
}
