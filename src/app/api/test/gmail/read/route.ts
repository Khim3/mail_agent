import { NextResponse } from "next/server";
import { readEmailById } from "@/lib/gmail/read";
import { cleanEmailText } from "@/lib/gmail/cleanText";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const messageId = searchParams.get("id");

  if (!messageId) {
    return NextResponse.json(
      { error: "Missing messageId" },
      { status: 400 }
    );
  }

  const tokens = {
    access_token: process.env.TEST_ACCESS_TOKEN!,
    refresh_token: process.env.TEST_REFRESH_TOKEN!,
  };

  const email = await readEmailById(tokens, messageId);

  return NextResponse.json({
    id: messageId,
    subject: email.subject,
    from: email.from,
    to: email.to,
    body: cleanEmailText(email.textBody),
  });
}
