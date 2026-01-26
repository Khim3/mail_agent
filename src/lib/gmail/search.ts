import { getGmailService } from "./getService";

export async function searchInboxEmails(
  tokens: {
    access_token: string;
    refresh_token?: string;
  },
  query: string,
  maxResults = 10
) {
  const gmail = getGmailService(tokens);

  const res = await gmail.users.messages.list({
    userId: "me",
    q: query,
    maxResults,
  });

  return res.data.messages || [];
}
