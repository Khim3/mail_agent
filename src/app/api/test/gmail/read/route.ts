import { NextResponse } from "next/server";
import { readEmailById } from "@/lib/gmail/read";
import { cleanEmailText } from "@/lib/gmail/cleanText";

export async function GET() {
  const tokens = {
    access_token: process.env.TEST_ACCESS_TOKEN!,
    refresh_token: process.env.TEST_REFRESH_TOKEN!,
  };

  const messageId = "19bf45f68e4046e7";

  const email = await readEmailById(tokens, messageId);

  const cleanText = cleanEmailText(email.textBody);

  return NextResponse.json({
    subject: email.subject,
    from: email.from,
    bodyPreview: cleanText.slice(0, 800),
  });
}
