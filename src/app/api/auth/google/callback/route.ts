import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET(req: NextRequest) {
  const code = new URL(req.url).searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  const { tokens } = await oauth2Client.getToken(code);

  /**
   * 🚨 STORE THIS SECURELY
   * DB / encrypted KV / secret manager
   */
  console.log("Tokens received:", {
    hasAccessToken: !!tokens.access_token,
    hasRefreshToken: !!tokens.refresh_token,
    expiry: tokens.expiry_date,
  });
  console.log("===== GOOGLE TOKENS =====");
console.log(tokens);
console.log("=========================");

  return NextResponse.json({ success: true });
}
