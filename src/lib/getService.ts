import { google } from "googleapis";

export function getGmailService(tokens: {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
}) {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  auth.setCredentials(tokens);

  return google.gmail({
    version: "v1",
    auth,
  });
}
