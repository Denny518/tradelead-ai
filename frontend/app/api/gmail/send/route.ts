import { NextRequest, NextResponse } from "next/server";
import { sendGmailEmail, checkRateLimit, recordSend, refreshAccessToken } from "@/lib/gmail";
import { getGmailTokens, saveGmailTokens, saveEmail, getCustomer, updateCustomer } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, subject, content, customerId } = body;

    if (!to || !subject || !content) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    // Check rate limit
    const rateCheck = checkRateLimit();
    if (!rateCheck.allowed) {
      return NextResponse.json({
        success: false,
        message: rateCheck.reason || "发送频率超限",
        waitSeconds: rateCheck.waitSeconds,
      }, { status: 429 });
    }

    // Get stored tokens
    let tokens = getGmailTokens("demo-user-001");
    if (!tokens?.accessToken) {
      return NextResponse.json({ success: false, message: "Gmail 未连接，请先授权" }, { status: 401 });
    }

    // Check if token expired, refresh if needed
    if (tokens.expiresAt && Date.now() > tokens.expiresAt - 60000) {
      if (!tokens.refreshToken) {
        return NextResponse.json({ success: false, message: "Token 已过期，请重新授权" }, { status: 401 });
      }
      try {
        const newTokens = await refreshAccessToken(tokens.refreshToken);
        tokens.accessToken = newTokens.access_token;
        tokens.expiresAt = Date.now() + newTokens.expires_in * 1000;
        // Save updated tokens
        saveGmailTokens("demo-user-001", {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          email: tokens.email || "",
          expiresAt: tokens.expiresAt,
        });
      } catch {
        return NextResponse.json({ success: false, message: "Token 刷新失败，请重新授权" }, { status: 401 });
      }
    }

    // Send via Gmail API
    const result = await sendGmailEmail(tokens.accessToken, { to, subject, body: content });

    // Record the send for rate limiting
    recordSend();

    // Save to CRM and update customer status
    if (customerId) {
      const customer = getCustomer(customerId);
      if (customer) {
        saveEmail({ customer_id: customerId, subject, content, version: 1, email_type: "sent_via_gmail" });
        if (customer.status === "new") {
          updateCustomer(customerId, { status: "sent" });
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        messageId: result.id,
        threadId: result.threadId,
        sentAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error("Gmail send error:", err);
    return NextResponse.json({ success: false, message: err.message || "发送失败" }, { status: 500 });
  }
}
