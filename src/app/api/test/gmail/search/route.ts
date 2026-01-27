import { NextResponse } from "next/server";
import { searchInboxEmails } from "@/lib/gmail/search";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get("q") || "in:inbox";

  const tokens = {
    access_token: process.env.TEST_ACCESS_TOKEN!,
    refresh_token: process.env.TEST_REFRESH_TOKEN!,
  };

  const messages = await searchInboxEmails(
    tokens,
    `in:inbox ${keyword}`,
    5
  );

  return NextResponse.json({ messages });
}
