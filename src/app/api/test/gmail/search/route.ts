import { NextResponse } from "next/server";
import { searchInboxEmails } from "@/lib/gmail/search";

/**
 * TEMP TEST ONLY
 * Later replace with DB-stored tokens
 */
export async function GET() {
  const tokens = {
    access_token: process.env.TEST_ACCESS_TOKEN!,
    refresh_token: process.env.TEST_REFRESH_TOKEN!,
  };

  const messages = await searchInboxEmails(
    tokens,
    "in:inbox newer_than:7d",
    5
  );

  return NextResponse.json({ messages });
}
