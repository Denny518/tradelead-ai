import { NextResponse } from "next/server";
import { getGmailAuthUrl, isGmailConfigured } from "@/lib/gmail";

export async function GET() {
  if (!isGmailConfigured()) {
    return NextResponse.json({
      success: false,
      message: "Gmail API 未配置。请在环境变量中设置 GMAIL_CLIENT_ID 和 GMAIL_CLIENT_SECRET。",
    }, { status: 400 });
  }

  const url = getGmailAuthUrl();
  return NextResponse.json({ success: true, url });
}
