const HUNTER_API_KEY = process.env.HUNTER_API_KEY || "";
const HUNTER_URL = "https://api.hunter.io/v2/domain-search";

export interface EmailResult {
  name: string;
  email: string;
  position: string;
}

export async function findEmails(domain: string): Promise<EmailResult[]> {
  if (!HUNTER_API_KEY) return mockFindEmails(domain);

  const params = new URLSearchParams({
    domain,
    api_key: HUNTER_API_KEY,
    limit: "10",
  });

  const resp = await fetch(`${HUNTER_URL}?${params}`);
  if (!resp.ok) throw new Error(`Hunter.io error: ${resp.status}`);
  const data = await resp.json();

  const results: EmailResult[] = [];
  for (const entry of data?.data?.emails || []) {
    results.push({
      name: `${entry.first_name || ""} ${entry.last_name || ""}`.trim(),
      email: entry.value || "",
      position: entry.position || "",
    });
  }
  return results;
}

function mockFindEmails(domain: string): EmailResult[] {
  const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/^www\./, "");
  return [
    {
      name: "John Smith",
      email: `john.smith@${cleanDomain}`,
      position: "Procurement Manager",
    },
    {
      name: "Sarah Johnson",
      email: `s.johnson@${cleanDomain}`,
      position: "CEO",
    },
  ];
}
