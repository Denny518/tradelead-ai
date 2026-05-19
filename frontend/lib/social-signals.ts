const SERPAPI_KEY = process.env.SERPAPI_KEY || "";

export interface SocialPost {
  platform: string;       // "reddit" | "bluesky" | "linkedin_post" | "x_post" | "threads"
  title: string;
  content: string;
  author: string;
  url: string;
  posted_at: string;
  subreddit?: string;
  relevance_score: number;
  buying_intent: "strong" | "medium" | "weak";
}

// ── Reddit (public JSON API, free, no key) ────────────────────
async function searchReddit(keyword: string, limit = 10): Promise<SocialPost[]> {
  try {
    const q = encodeURIComponent(keyword);
    const url = `https://www.reddit.com/search.json?q=${q}&sort=relevance&limit=${limit}&t=year`;
    const resp = await fetch(url, { headers: { "User-Agent": "TradeLeadAI/1.0" } });
    if (!resp.ok) return [];
    const data = await resp.json();
    const results: SocialPost[] = [];
    for (const child of (data?.data?.children || []).slice(0, limit)) {
      const d = child.data;
      results.push({
        platform: "reddit",
        title: d.title || "",
        content: d.selftext?.slice(0, 300) || d.title || "",
        author: d.author || "",
        url: `https://reddit.com${d.permalink || ""}`,
        posted_at: d.created_utc ? new Date(d.created_utc * 1000).toISOString() : "",
        subreddit: d.subreddit_name_prefixed || "",
        relevance_score: scoreSocialMatch(d.title + " " + d.selftext, keyword),
        buying_intent: detectBuyingIntent(d.title + " " + d.selftext),
      });
    }
    return results;
  } catch { return []; }
}

// ── Bluesky (AT Protocol public API) ──────────────────────────
async function searchBluesky(keyword: string, limit = 10): Promise<SocialPost[]> {
  try {
    const q = encodeURIComponent(keyword);
    const url = `https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts?q=${q}&limit=${limit}&sort=latest`;
    const resp = await fetch(url);
    if (!resp.ok) return [];
    const data = await resp.json();
    const results: SocialPost[] = [];
    for (const item of (data?.posts || []).slice(0, limit)) {
      results.push({
        platform: "bluesky",
        title: item.record?.text?.slice(0, 100) || "",
        content: item.record?.text?.slice(0, 300) || "",
        author: item.author?.handle || item.author?.displayName || "",
        url: `https://bsky.app/profile/${item.author?.handle || "_"}/post/${item.uri?.split("/").pop() || ""}`,
        posted_at: item.record?.createdAt || "",
        relevance_score: scoreSocialMatch(item.record?.text || "", keyword),
        buying_intent: detectBuyingIntent(item.record?.text || ""),
      });
    }
    return results;
  } catch { return []; }
}

// ── LinkedIn Posts (via Google site: search) ──────────────────
async function searchLinkedInPosts(keyword: string, limit = 10): Promise<SocialPost[]> {
  if (!SERPAPI_KEY) return [];
  try {
    const q = encodeURIComponent(`site:linkedin.com/posts/ ${keyword}`);
    const url = `https://serpapi.com/search.json?engine=google&q=${q}&api_key=${SERPAPI_KEY}&num=${limit}&hl=en`;
    const resp = await fetch(url);
    if (!resp.ok) return [];
    const data = await resp.json();
    const results: SocialPost[] = [];
    for (const item of (data?.organic_results || []).slice(0, limit)) {
      results.push({
        platform: "linkedin_post",
        title: item.title?.slice(0, 100) || "",
        content: item.snippet?.slice(0, 300) || "",
        author: extractLinkedInAuthor(item.title || ""),
        url: item.link || "",
        posted_at: "",
        relevance_score: scoreSocialMatch((item.title || "") + " " + (item.snippet || ""), keyword),
        buying_intent: detectBuyingIntent((item.title || "") + " " + (item.snippet || "")),
      });
    }
    return results;
  } catch { return []; }
}

// ── X/Twitter Posts (via Google site:) ────────────────────────
async function searchXPosts(keyword: string, limit = 10): Promise<SocialPost[]> {
  if (!SERPAPI_KEY) return [];
  try {
    const q = encodeURIComponent(`site:x.com ${keyword} -"from:"`);
    const url = `https://serpapi.com/search.json?engine=google&q=${q}&api_key=SERPAPI_KEY&num=${limit}&hl=en`;
    const resp = await fetch(url);
    if (!resp.ok) return [];
    const data = await resp.json();
    const results: SocialPost[] = [];
    for (const item of (data?.organic_results || []).slice(0, limit)) {
      results.push({
        platform: "x_post",
        title: item.title?.slice(0, 100) || "",
        content: item.snippet?.slice(0, 300) || "",
        author: "",
        url: item.link || "",
        posted_at: "",
        relevance_score: scoreSocialMatch((item.title || "") + " " + (item.snippet || ""), keyword),
        buying_intent: detectBuyingIntent((item.title || "") + " " + (item.snippet || "")),
      });
    }
    return results;
  } catch { return []; }
}

// ── Threads (via Google site:) ────────────────────────────────
async function searchThreads(keyword: string, limit = 10): Promise<SocialPost[]> {
  if (!SERPAPI_KEY) return [];
  try {
    const q = encodeURIComponent(`site:threads.net ${keyword}`);
    const url = `https://serpapi.com/search.json?engine=google&q=${q}&api_key=${SERPAPI_KEY}&num=${limit}&hl=en`;
    const resp = await fetch(url);
    if (!resp.ok) return [];
    const data = await resp.json();
    const results: SocialPost[] = [];
    for (const item of (data?.organic_results || []).slice(0, limit)) {
      results.push({
        platform: "threads",
        title: item.title?.slice(0, 100) || "",
        content: item.snippet?.slice(0, 300) || "",
        author: "",
        url: item.link || "",
        posted_at: "",
        relevance_score: scoreSocialMatch((item.title || "") + " " + (item.snippet || ""), keyword),
        buying_intent: detectBuyingIntent((item.title || "") + " " + (item.snippet || "")),
      });
    }
    return results;
  } catch { return []; }
}

// ── Helpers ────────────────────────────────────────────────────

function extractLinkedInAuthor(title: string): string {
  // "Post by John Smith on LinkedIn" → "John Smith"
  const m = title.match(/by (.+?) on LinkedIn/);
  return m ? m[1] : "";
}

function scoreSocialMatch(text: string, keyword: string): number {
  if (!text) return 0;
  let score = 30;
  for (const kw of keyword.toLowerCase().split(/\s+/)) {
    if (text.toLowerCase().includes(kw)) score += 15;
  }
  if (/looking for|seeking|need supplier|recommend|anyone know|where to buy|sourcing/i.test(text)) score += 25;
  return Math.min(score, 99);
}

function detectBuyingIntent(text: string): "strong" | "medium" | "weak" {
  if (!text) return "weak";
  const strong = /looking for|need supplier|where can i (buy|find|source)|seeking manufacturer|urgent.*order|any supplier/i;
  const medium = /recommend|suggest|anyone (use|tried|know)|compare|alternative|who makes/i;
  if (strong.test(text)) return "strong";
  if (medium.test(text)) return "medium";
  return "weak";
}

// ── Main Search ────────────────────────────────────────────────

export async function searchSocialSignals(
  keyword: string,
  channels: string[],
  limit = 10
): Promise<SocialPost[]> {
  const all: SocialPost[] = [];

  const tasks: Promise<SocialPost[]>[] = [];
  if (channels.includes("reddit")) tasks.push(searchReddit(keyword, limit));
  if (channels.includes("bluesky")) tasks.push(searchBluesky(keyword, limit));
  if (channels.includes("linkedin_post")) tasks.push(searchLinkedInPosts(keyword, limit));
  if (channels.includes("x_post")) tasks.push(searchXPosts(keyword, limit));
  if (channels.includes("threads")) tasks.push(searchThreads(keyword, limit));

  const results = await Promise.all(tasks.map((p) => p.catch(() => [] as SocialPost[])));
  for (const batch of results) all.push(...batch);

  // Sort: buying_intent priority, then relevance
  const intentOrder: Record<string, number> = { strong: 0, medium: 1, weak: 2 };
  all.sort((a, b) =>
    (intentOrder[a.buying_intent] || 2) - (intentOrder[b.buying_intent] || 2) ||
    b.relevance_score - a.relevance_score
  );

  return all;
}
