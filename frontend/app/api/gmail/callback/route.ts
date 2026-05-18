import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens, getGmailProfile } from "@/lib/gmail";
import { saveGmailTokens } from "@/lib/store";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    // Redirect back to dashboard with error
    return NextResponse.redirect(new URL("/dashboard?gmail_error=" + error, req.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/dashboard?gmail_error=no_code", req.url));
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    const profile = await getGmailProfile(tokens.access_token);

    // Save tokens
    saveGmailTokens("demo-user-001", {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || "",
      email: profile.emailAddress,
      expiresAt: Date.now() + tokens.expires_in * 1000,
    });

    // Redirect back to dashboard with success
    return NextResponse.redirect(new URL("/dashboard?gmail_connected=1&email=" + encodeURIComponent(profile.emailAddress), req.url));
  } catch (err: any) {
    console.error("Gmail callback error:", err);
    return NextResponse.redirect(new URL("/dashboard?gmail_error=" + encodeURIComponent(err.message), req.url));
  }
}
