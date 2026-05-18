// Gmail API integration
// Requires: Google Cloud Console OAuth 2.0 Client ID with Gmail API enabled
// Scopes: https://www.googleapis.com/auth/gmail.send (send only, least privilege)

const GMAIL_CLIENT_ID = process.env.GMAIL_CLIENT_ID || "";
const GMAIL_CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET || "";
const GMAIL_REDIRECT_URI = process.env.GMAIL_REDIRECT_URI || "http://localhost:3000/api/gmail/callback";

// ── OAuth ──────────────────────────────────────────────────────

export function getGmailAuthUrl(state?: string): string {
  const params = new URLSearchParams({
    client_id: GMAIL_CLIENT_ID,
    redirect_uri: GMAIL_REDIRECT_URI,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/gmail.send",
    access_type: "offline", // get refresh token
    prompt: "consent",      // always show consent screen to get refresh token
    state: state || "gmail_auth",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string): Promise<{
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}> {
  const resp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: GMAIL_CLIENT_ID,
      client_secret: GMAIL_CLIENT_SECRET,
      redirect_uri: GMAIL_REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`OAuth token exchange failed: ${err}`);
  }

  return resp.json();
}

export async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string;
  expires_in: number;
}> {
  const resp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GMAIL_CLIENT_ID,
      client_secret: GMAIL_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!resp.ok) {
    throw new Error("Failed to refresh access token");
  }

  return resp.json();
}

// ── Gmail API ──────────────────────────────────────────────────

export async function getGmailProfile(accessToken: string): Promise<{ emailAddress: string }> {
  const resp = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/profile", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!resp.ok) throw new Error("Failed to get Gmail profile");
  return resp.json();
}

export async function sendGmailEmail(
  accessToken: string,
  params: {
    to: string;
    subject: string;
    body: string;
    cc?: string;
    bcc?: string;
  }
): Promise<{ id: string; threadId: string }> {
  // Build RFC 2822 email
  const headers: string[] = [
    `From: me`,
    `To: ${params.to}`,
    `Subject: =?UTF-8?B?${Buffer.from(params.subject).toString("base64")}?=`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
  ];
  if (params.cc) headers.push(`Cc: ${params.cc}`);

  const rawEmail = [...headers, "", params.body].join("\r\n");
  const rawBase64 = Buffer.from(rawEmail).toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  // Use upload endpoint for reliability
  const resp = await fetch("https://gmail.googleapis.com/upload/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw: rawBase64 }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Gmail send failed: ${err}`);
  }

  return resp.json();
}

// ── Rate Limiting ─────────────────────────────────────────────

const sendTimestamps: number[] = [];
const MAX_EMAILS_PER_HOUR = 20; // Conservative: well below Gmail's 500/day limit for regular accounts
const MAX_EMAILS_PER_MINUTE = 5;

export function checkRateLimit(): { allowed: boolean; waitSeconds: number; reason?: string } {
  const now = Date.now();

  // Clean old entries
  while (sendTimestamps.length > 0 && sendTimestamps[0] < now - 3600000) {
    sendTimestamps.shift();
  }

  // Check hourly limit
  if (sendTimestamps.length >= MAX_EMAILS_PER_HOUR) {
    const waitMs = sendTimestamps[0] + 3600000 - now;
    return { allowed: false, waitSeconds: Math.ceil(waitMs / 1000), reason: `已达到每小时发送上限 (${MAX_EMAILS_PER_HOUR}封/小时)` };
  }

  // Check per-minute limit
  const recentMinute = sendTimestamps.filter((t) => t > now - 60000);
  if (recentMinute.length >= MAX_EMAILS_PER_MINUTE) {
    const waitMs = recentMinute[0] + 60000 - now;
    return { allowed: false, waitSeconds: Math.ceil(waitMs / 1000), reason: `发送太频繁，请${Math.ceil(waitMs / 1000)}秒后再试` };
  }

  return { allowed: true, waitSeconds: 0 };
}

export function recordSend(): void {
  sendTimestamps.push(Date.now());
}

// ── Config check ──────────────────────────────────────────────

export function isGmailConfigured(): boolean {
  return !!(GMAIL_CLIENT_ID && GMAIL_CLIENT_SECRET);
}
