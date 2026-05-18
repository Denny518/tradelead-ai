import { NextResponse } from "next/server";
import { getGmailTokens } from "@/lib/store";
import { isGmailConfigured } from "@/lib/gmail";

export async function GET() {
  const tokens = getGmailTokens("demo-user-001");
  const configured = isGmailConfigured();

  return NextResponse.json({
    success: true,
    data: {
      connected: !!(tokens && tokens.accessToken),
      email: tokens?.email || null,
      configured,
    },
  });
}
