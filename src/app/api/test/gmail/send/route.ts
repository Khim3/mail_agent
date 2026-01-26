import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/gmail/send";

export async function GET() {
  const tokens = {
    access_token: process.env.TEST_ACCESS_TOKEN!,
    refresh_token: process.env.TEST_REFRESH_TOKEN!,
  };

  const result = await sendEmail(
    tokens,
    "nhatkhiem003@gmail.com", // send to yourself
    "Test from Agentic Mail System",
    "Hello 👋\n\nThis is a test email sent from my Next.js Gmail agent."
  );

  return NextResponse.json({
    success: true,
    id: result.id,
  });
}
