import { buildEmailPrompt, buildQuotationPrompt, buildReplyPrompt, ProductKnowledge } from "./prompts";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "";
const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";

// ── Generic Call ──────────────────────────────────────────────

async function callDeepSeek(systemPrompt: string, userPrompt: string): Promise<any> {
  const resp = await fetch(DEEPSEEK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 3000,
    }),
  });

  if (!resp.ok) throw new Error(`DeepSeek error: ${resp.status}`);
  const data = await resp.json();
  const content = data.choices?.[0]?.message?.content?.trim() || "";
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) return JSON.parse(jsonMatch[0]);
  throw new Error("Failed to parse AI response as JSON");
}

// ── Types ─────────────────────────────────────────────────────

export interface AIScore {
  personalization: number;
  valueClarity: number;
  socialProof: number;
  ctaClarity: number;
  spamRisk: number;
  overallScore: number;
  feedback: string;
}

export interface EmailVersion {
  subject: string;
  content: string;
  tone?: string;
  aiScore?: AIScore;
}

export interface GeneratedEmails {
  version1: EmailVersion;
  version2: EmailVersion;
  version3: EmailVersion;
}

// ── Generate Email (Enhanced) ─────────────────────────────────

export async function generateEmails(
  productKnowledge: ProductKnowledge | null,
  customerInfo: {
    company_name: string;
    website: string;
    description: string;
    contact_name: string;
  },
  emailType = "initial",
  language = "en"
): Promise<GeneratedEmails> {
  if (!DEEPSEEK_API_KEY) {
    return mockGenerate(productKnowledge, customerInfo, emailType);
  }

  const { system, user } = buildEmailPrompt(productKnowledge, customerInfo, emailType, language);
  return callDeepSeek(system, user);
}

// ── Generate Quotation (P1) ───────────────────────────────────

export interface QuotationResult {
  quotationTitle: string;
  headerNote: string;
  productTable: Array<{
    name: string;
    specs: string;
    unitPrice: number;
    quantity: number;
    total: number;
    description: string;
  }>;
  summaryText: string;
  closingText: string;
  footerNote: string;
}

export async function generateQuotation(
  productKnowledge: ProductKnowledge | null,
  customerInfo: { company_name: string; contact_name: string; email: string },
  products: Array<{ name: string; specs: string; unitPrice: number; quantity: number; total: number }>,
  options: { currency?: string; validUntil?: string; paymentTerms?: string; deliveryTerms?: string; notes?: string; language?: string }
): Promise<QuotationResult> {
  if (!DEEPSEEK_API_KEY) {
    return mockQuotation(customerInfo, products, options);
  }

  const { system, user } = buildQuotationPrompt(productKnowledge, customerInfo, products, options);
  return callDeepSeek(system, user);
}

// ── Generate Reply (P1) ───────────────────────────────────────

export interface ReplyVersion {
  subject: string;
  content: string;
  tone: string;
}

export interface GeneratedReplies {
  version1: ReplyVersion;
  version2: ReplyVersion;
  version3: ReplyVersion;
}

export async function generateReply(
  productKnowledge: ProductKnowledge | null,
  customerEmail: string,
  customerStatus: string,
  language = "en"
): Promise<GeneratedReplies> {
  if (!DEEPSEEK_API_KEY) {
    return mockReply(customerEmail);
  }

  const { system, user } = buildReplyPrompt(productKnowledge, customerEmail, customerStatus, language);
  return callDeepSeek(system, user);
}

// ── Mock Functions ────────────────────────────────────────────

function mockGenerate(
  pk: ProductKnowledge | null,
  customerInfo: { company_name: string; contact_name: string },
  _emailType: string
): GeneratedEmails {
  const company = customerInfo.company_name || "your company";
  const contact = customerInfo.contact_name || "there";
  const product = pk?.productName || "our product";
  const desc = pk?.basicInfo?.applicationScenarios?.[0] || "high-quality products";

  return {
    version1: {
      subject: `Partnership opportunity: ${product} for ${company}`,
      content: `Dear ${contact},\n\nI came across ${company} and was impressed by your market presence.\n\nWe specialize in ${desc}. Our ${product} offers ${pk?.sellingPoints?.priceAdvantage || "competitive pricing"} and ${pk?.sellingPoints?.qualityAdvantage || "superior quality"}.\n\nWould you be open to a brief 15-minute call next week?\n\nBest regards,\n[Your name]`,
      tone: "professional",
      aiScore: { personalization: 7, valueClarity: 7, socialProof: 5, ctaClarity: 8, spamRisk: 3, overallScore: 7.1, feedback: "Add a specific case study to increase social proof." },
    },
    version2: {
      subject: `Quick question about ${company}`,
      content: `Hi ${contact},\n\nI noticed ${company} is a key player. Our ${product} delivers ${pk?.sellingPoints?.deliveryAdvantage || "fast delivery"}.\n\nCan I send over a 1-page comparison?\n\nThanks,\n[Your name]`,
      tone: "casual",
      aiScore: { personalization: 6, valueClarity: 7, socialProof: 4, ctaClarity: 8, spamRisk: 2, overallScore: 6.5, feedback: "Good brevity. Could reference a competitor win." },
    },
    version3: {
      subject: `How a ${pk?.caseStudies?.[0]?.industry || "similar"} company achieved better results`,
      content: `Hi ${contact},\n\nLast quarter, we helped a ${pk?.caseStudies?.[0]?.industry || "similar"} company switch to ${product}. Result? ${pk?.caseStudies?.[0]?.result || "Significant improvement in their metrics"}.\n\nCould ${company} benefit from similar results?\n\nBest,\n[Your name]`,
      tone: "story",
      aiScore: { personalization: 8, valueClarity: 7, socialProof: 8, ctaClarity: 7, spamRisk: 3, overallScore: 7.5, feedback: "Good storytelling. Make the CTA more specific." },
    },
  };
}

function mockQuotation(
  customerInfo: { company_name: string; contact_name: string },
  products: Array<{ name: string; specs: string; unitPrice: number; quantity: number; total: number }>,
  options: { currency?: string; validUntil?: string; paymentTerms?: string; deliveryTerms?: string }
): QuotationResult {
  return {
    quotationTitle: `Official Quotation — ${customerInfo.company_name}`,
    headerNote: `Dear ${customerInfo.contact_name},\n\nThank you for your inquiry. We are pleased to provide the following quotation for your consideration:`,
    productTable: products.map((p) => ({
      name: p.name,
      specs: p.specs,
      unitPrice: p.unitPrice,
      quantity: p.quantity,
      total: p.total,
      description: `High-quality ${p.name} with ${p.specs}`,
    })),
    summaryText: `Total: ${options.currency || "USD"} ${products.reduce((s, p) => s + p.total, 0).toFixed(2)}. ${options.paymentTerms || ""}`,
    closingText: "We look forward to the opportunity to work with you. Please feel free to contact us with any questions.",
    footerNote: `This quotation is valid until ${options.validUntil || "30 days from issue date"}.`,
  };
}

function mockReply(customerEmail: string): GeneratedReplies {
  const snippet = customerEmail.slice(0, 100);
  return {
    version1: {
      subject: "Re: Your inquiry",
      content: `Dear Sir/Madam,\n\nThank you for reaching out. Regarding your inquiry about "${snippet}...", I'd be happy to provide more details.\n\nCould you let me know your specific requirements so I can give you the most accurate information?\n\nBest regards,\n[Your name]`,
      tone: "professional",
    },
    version2: {
      subject: "Re: Your inquiry",
      content: `Hi,\n\nThanks for the message. To answer your question — yes, we can help with that.\n\nLet me know a convenient time for a quick call, or I can send over our catalog.\n\nBest,\n[Your name]`,
      tone: "concise",
    },
    version3: {
      subject: "Re: Your inquiry — here's how we can help",
      content: `Dear Sir/Madam,\n\nGreat question. We recently helped a similar client achieve excellent results with the same requirements you mentioned.\n\nI'd love to share that case study with you. Would you be open to a 10-minute call this week?\n\nBest regards,\n[Your name]`,
      tone: "persuasive",
    },
  };
}
