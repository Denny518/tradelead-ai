// ── Core Prompt Templates ──────────────────────────────────────

export function buildEmailPrompt(
  productKnowledge: ProductKnowledge | null,
  customerInfo: { company_name: string; website: string; description: string; contact_name: string },
  emailType: string,
  language: string
): { system: string; user: string } {
  const typeDesc: Record<string, string> = {
    initial: "first cold outreach email",
    followup1: "first follow-up email (3 days after initial)",
    followup2: "second follow-up email (7 days after initial)",
    followup3: "third follow-up email (14 days after initial)",
  };

  const langNames: Record<string, string> = {
    en: "English", es: "Spanish", fr: "French", de: "German", ar: "Arabic",
    ru: "Russian", pt: "Portuguese", ja: "Japanese", ko: "Korean",
    it: "Italian", nl: "Dutch", tr: "Turkish", pl: "Polish", th: "Thai", vi: "Vietnamese",
    zh: "Chinese",
  };

  const langName = langNames[language] || "English";

  const productSection = productKnowledge
    ? `## Product Knowledge Base
- Product Name: ${productKnowledge.productName}
- Application Scenarios: ${productKnowledge.basicInfo?.applicationScenarios?.join(", ") || ""}
- Selling Points:
  - Price Advantage: ${productKnowledge.sellingPoints?.priceAdvantage || ""}
  - Quality Advantage: ${productKnowledge.sellingPoints?.qualityAdvantage || ""}
  - Delivery Advantage: ${productKnowledge.sellingPoints?.deliveryAdvantage || ""}
  - Service Advantage: ${productKnowledge.sellingPoints?.serviceAdvantage || ""}
- Tech Specs: ${productKnowledge.techSpecs ? JSON.stringify(productKnowledge.techSpecs) : ""}
- Case Studies: ${productKnowledge.caseStudies ? JSON.stringify(productKnowledge.caseStudies) : ""}
- FAQ: ${productKnowledge.faq ? JSON.stringify(productKnowledge.faq) : ""}`
    : `## Product Info
The user hasn't provided detailed product knowledge yet. Write a professional but generic email based on available info.`;

  const system = `You are an expert B2B sales copywriter with 10 years of experience in international trade. You write high-response-rate cold emails that get real results.

## Writing Principles
1. **Personalization (30%)**: Mention something specific about the recipient's company. Show you've done research.
2. **Value Proposition (40%)**: Clearly state how your product helps THEM. Use concrete numbers when possible.
3. **Social Proof (20%)**: Reference a similar customer success story or case study.
4. **CTA (10%)**: Clear, low-friction ask. Make it easy to say yes.

## Version Differences
- **Version 1 (Professional)**: Formal, detailed, suitable for first contact with traditional companies.
- **Version 2 (Concise)**: Direct, under 100 words, suitable for busy executives.
- **Version 3 (Story)**: Opens with a case study or data point, uses storytelling to engage.

## Language
Write the emails in **${langName}**. If ${langName} is not English, write naturally — NOT a translated template.

## Output Format
Return ONLY valid JSON, no other text:
{
  "version1": {
    "subject": "...",
    "content": "...",
    "tone": "professional",
    "aiScore": {
      "personalization": 9,
      "valueClarity": 8,
      "socialProof": 7,
      "ctaClarity": 9,
      "spamRisk": 2,
      "overallScore": 8.2,
      "feedback": "Good personalization. Consider adding more specific numbers."
    }
  },
  "version2": { ... },
  "version3": { ... }
}

## Scoring Guidelines (1-10)
- personalization: Is it truly tailored to this specific company?
- valueClarity: Is the benefit to the customer crystal clear?
- socialProof: Is there a relevant case study or data point?
- ctaClarity: Is the ask specific and low-friction?
- spamRisk: Likelihood of triggering spam filters (Lower = better, 1 = very safe, 10 = definitely spam)
- overallScore: Weighted average (40% personalization + 30% valueClarity + 15% socialProof + 15% ctaClarity)
- feedback: One sentence on how to improve`;

  const user = `${productSection}

## Customer Info
- Company: ${customerInfo.company_name}
- Website: ${customerInfo.website}
- Business: ${customerInfo.description}
- Contact: ${customerInfo.contact_name}

## Task
Generate 3 versions of a ${typeDesc[emailType] || emailType} in ${langName}. Return JSON only.`;

  return { system, user };
}

// ── Quotation Prompt ──────────────────────────────────────────

export function buildQuotationPrompt(
  productKnowledge: ProductKnowledge | null,
  customerInfo: { company_name: string; contact_name: string; email: string },
  products: Array<{ name: string; specs: string; unitPrice: number; quantity: number; total: number }>,
  options: { currency?: string; validUntil?: string; paymentTerms?: string; deliveryTerms?: string; notes?: string; language?: string },
): { system: string; user: string } {
  const langNames: Record<string, string> = {
    en: "English", es: "Spanish", fr: "French", de: "German", ar: "Arabic",
    ru: "Russian", pt: "Portuguese", ja: "Japanese", ko: "Korean", zh: "Chinese",
  };
  const langName = langNames[options.language || "en"] || "English";

  const system = `You are a professional B2B quotation document generator. Generate clean, professional quotation content in ${langName}.

## Output Format
Return ONLY valid JSON:
{
  "quotationTitle": "Official Quotation",
  "headerNote": "Thank you for your inquiry. We are pleased to quote the following:",
  "productTable": [
    { "name": "...", "specs": "...", "unitPrice": 0, "quantity": 0, "total": 0, "description": "AI-written product description" }
  ],
  "summaryText": "Brief summary highlighting value proposition...",
  "closingText": "Professional closing with next steps...",
  "footerNote": "This quotation is valid until {date}. Prices are subject to change after this date."
}`;

  const user = `## Customer
- Company: ${customerInfo.company_name}
- Contact: ${customerInfo.contact_name}

## Products
${JSON.stringify(products, null, 2)}

## Terms
- Currency: ${options.currency || "USD"}
- Valid Until: ${options.validUntil || "30 days"}
- Payment: ${options.paymentTerms || "T/T 30% deposit, 70% before shipment"}
- Delivery: ${options.deliveryTerms || "15-20 days after deposit"}
- Notes: ${options.notes || ""}

Generate a professional quotation in ${langName}. Return JSON only.`;

  return { system, user };
}

// ── Inquiry Reply Prompt ──────────────────────────────────────

export function buildReplyPrompt(
  productKnowledge: ProductKnowledge | null,
  customerEmail: string,
  customerStatus: string,
  language: string,
): { system: string; user: string } {
  const langNames: Record<string, string> = {
    en: "English", es: "Spanish", fr: "French", de: "German", ar: "Arabic",
    ru: "Russian", pt: "Portuguese", ja: "Japanese", ko: "Korean", zh: "Chinese",
  };
  const langName = langNames[language] || "English";

  const system = `You are an expert B2B sales representative responding to a customer inquiry. Write professional, helpful replies in ${langName}.

## Version Differences
- **Version 1 (Professional)**: Detailed, addresses all questions, builds trust.
- **Version 2 (Concise)**: Direct answers, saves customer's time.
- **Version 3 (Persuasive)**: Uses social proof and urgency to move toward closing.

## Output Format
Return ONLY valid JSON:
{
  "version1": { "subject": "...", "content": "...", "tone": "professional" },
  "version2": { "subject": "...", "content": "...", "tone": "concise" },
  "version3": { "subject": "...", "content": "...", "tone": "persuasive" }
}`;

  const productSection = productKnowledge
    ? `## Product Knowledge\n${JSON.stringify(productKnowledge, null, 2)}`
    : "";

  const user = `## Customer Email
${customerEmail}

## Customer Status: ${customerStatus}

${productSection}

Generate 3 versions of a reply in ${langName}. Return JSON only.`;

  return { system, user };
}

// ── Types ─────────────────────────────────────────────────────

export interface ProductKnowledge {
  id?: string;
  userId?: string;
  productName: string;
  basicInfo?: {
    applicationScenarios: string[];
    targetCustomers: string[];
    competitors: string[];
  };
  sellingPoints?: {
    priceAdvantage: string;
    qualityAdvantage: string;
    deliveryAdvantage: string;
    serviceAdvantage: string;
  };
  techSpecs?: Record<string, string>;
  caseStudies?: Array<{
    customer: string;
    industry: string;
    painPoint: string;
    solution: string;
    result: string;
  }>;
  faq?: Array<{
    question: string;
    answer: string;
  }>;
  emailStyle?: string;
}
