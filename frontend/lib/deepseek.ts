const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "";
const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";

const SYSTEM_PROMPT = `You are a professional B2B cold email copywriter specializing in high-response-rate personalized outreach emails for international trade.

## Task
Generate 3 versions of a personalized cold email based on the product info and customer info provided.

## Requirements
1. Each version MUST be personalized — mention the recipient's company by name and reference their specific business
2. Subject lines must be compelling to increase open rates (avoid spam trigger words)
3. Content must be concise, under 150 words
4. Each version must have a clear CTA (call to action), e.g.:
   - "Reply to this email and I'll send you our product catalog"
   - "Do you have 15 minutes for a quick call this week?"
   - "Can I send you a case study?"
5. Tone: professional but not stiff, friendly but not overly familiar

## Output Format
Return ONLY valid JSON, no other text:
{
  "version1": {
    "subject": "subject line (formal version)",
    "content": "email body (formal version)"
  },
  "version2": {
    "subject": "subject line (concise version)",
    "content": "email body (concise version, suitable for busy executives)"
  },
  "version3": {
    "subject": "subject line (story-based version)",
    "content": "email body (story-based version, use case study or data to engage)"
  }
}`;

export interface EmailVersion {
  subject: string;
  content: string;
}

export interface GeneratedEmails {
  version1: EmailVersion;
  version2: EmailVersion;
  version3: EmailVersion;
}

export async function generateEmails(
  productInfo: {
    name: string;
    description: string;
    advantages: string[];
  },
  customerInfo: {
    company_name: string;
    website: string;
    description: string;
    contact_name: string;
  },
  emailType = "initial"
): Promise<GeneratedEmails> {
  if (!DEEPSEEK_API_KEY) return mockGenerate(productInfo, customerInfo, emailType);

  const typeDesc: Record<string, string> = {
    initial: "first cold outreach email",
    followup1: "first follow-up email (3 days after initial)",
    followup2: "second follow-up email (7 days after initial)",
    followup3: "third follow-up email (14 days after initial)",
  };

  const advList = productInfo.advantages.map((a) => `  - ${a}`).join("\n");
  const productStr = `- Product Name: ${productInfo.name}
- Description: ${productInfo.description}
- Advantages:
${advList}`;

  const customerStr = `- Company: ${customerInfo.company_name}
- Website: ${customerInfo.website}
- Business: ${customerInfo.description}
- Contact: ${customerInfo.contact_name}`;

  const userPrompt = `## Product Info
${productStr}

## Customer Info
${customerStr}

## Email Type
${typeDesc[emailType] || emailType}

Generate 3 versions of a personalized ${typeDesc[emailType] || emailType}. Return JSON only.`;

  const resp = await fetch(DEEPSEEK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 2000,
    }),
  });

  if (!resp.ok) throw new Error(`DeepSeek error: ${resp.status}`);
  const data = await resp.json();
  const content = data.choices?.[0]?.message?.content?.trim() || "";

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) return JSON.parse(jsonMatch[0]);

  return mockGenerate(productInfo, customerInfo, emailType);
}

function mockGenerate(
  productInfo: { name: string; description: string },
  customerInfo: { company_name: string; contact_name: string },
  _emailType: string
): GeneratedEmails {
  const company = customerInfo.company_name || "your company";
  const contact = customerInfo.contact_name || "there";
  const product = productInfo.name || "our product";
  const desc = productInfo.description || "high-quality products";

  return {
    version1: {
      subject: `Partnership opportunity: ${product} for ${company}`,
      content: `Dear ${contact},\n\nI hope this email finds you well. I came across ${company} while researching top companies in the industry, and I was impressed by your market presence.\n\nWe specialize in ${desc}. Our ${product} offers significant advantages including competitive pricing, 2-year warranty, and fast shipping.\n\nI'd love to explore how ${product} could add value to ${company}'s product lineup. Would you be open to a brief 15-minute call next week?\n\nBest regards,\n[Your name]\n[Your company]`,
    },
    version2: {
      subject: `Quick question about ${company}'s product sourcing`,
      content: `Hi ${contact},\n\nI'm with a company that provides ${desc}.\n\nI noticed ${company} is a key player in the market, and I thought you might be interested in our ${product} — it delivers better margins while reducing energy costs by 30%.\n\nCan I send over a 1-page comparison sheet?\n\nThanks,\n[Your name]`,
    },
    version3: {
      subject: `How we helped a distributor increase margins by 25%`,
      content: `Hi ${contact},\n\nLast quarter, we helped a distributor similar to ${company} switch to our ${product}. The result? Their margins improved by 25% and their customers reported higher satisfaction with the energy savings.\n\nI'm wondering if ${company} might be looking for similar improvements in your product lineup.\n\nOur ${product} could help you achieve comparable results. Would you be open to seeing a brief case study?\n\nBest,\n[Your name]\n[Your company]`,
    },
  };
}
