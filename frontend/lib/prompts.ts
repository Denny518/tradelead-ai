import { ProductKnowledge } from "./store";

const LANGUAGES: Record<string, string> = {
  en: "English", es: "Spanish", fr: "French", de: "German", ar: "Arabic",
  ru: "Russian", pt: "Portuguese", ja: "Japanese", ko: "Korean",
  it: "Italian", nl: "Dutch", tr: "Turkish", pl: "Polish", th: "Thai", vi: "Vietnamese",
  zh: "Chinese",
};

// ── Build FULL product context string ─────────────────────────
export function buildProductContext(pk: ProductKnowledge | null, selectedProductIndex?: number): string {
  if (!pk) return "No product knowledge configured. Write a professional but generic email.";

  const parts: string[] = [];

  // Company info
  parts.push(`## Company Background
- Company: ${pk.brandName || pk.productName || "Our Company"}
- Founded: ${pk.companyYearFounded || "N/A"}
- Location: ${pk.companyLocation || "N/A"}
- Scale: ${pk.companyScale || "N/A"}
- Annual Revenue: ${pk.annualRevenue || "N/A"}
- Years Exporting: ${pk.countriesExportedTo?.length ? `Exporting to ${pk.countriesExportedTo.length}+ countries` : "N/A"}
- Countries Exported To: ${pk.countriesExportedTo?.join(", ") || "N/A"}
- Annual Export Volume: ${pk.annualExportVolume || "N/A"}
- Total Customers Served: ${pk.totalCustomersServed || "N/A"}
- Key Clients: ${pk.keyClients?.join(", ") || "N/A"}
- Exhibitions Attended: ${pk.exhibitionHistory?.join(", ") || "N/A"}`);

  // Product info
  parts.push(`## Product Information
- Product Name: ${pk.productName}
- Category: ${pk.productCategory || "N/A"}
- Brand: ${pk.brandName || pk.productName}
- HS Code: ${pk.hsCode || "N/A"}
- One-line Summary: ${pk.productSummary || "N/A"}
- Detailed Description: ${pk.detailedDescription || pk.productSummary || "N/A"}
- Core Differentiator (USP): ${pk.uniqueSellingProposition || "N/A"}`);

  // Images & media
  if (pk.productImages?.length || pk.productVideos?.length) {
    parts.push(`## Product Media
${pk.productImages?.length ? `- Images: ${pk.productImages.join(", ")}` : ""}
${pk.productVideos?.length ? `- Videos: ${pk.productVideos.join(", ")}` : ""}
${pk.catalogUrl ? `- Catalog: ${pk.catalogUrl}` : ""}
${pk.websiteUrl ? `- Website: ${pk.websiteUrl}` : ""}`);
  }

  // Applications
  parts.push(`## Target Market
- Application Scenarios: ${pk.basicInfo?.applicationScenarios?.join(", ") || "N/A"}
- Target Customers: ${pk.basicInfo?.targetCustomers?.join(", ") || "N/A"}
- Target Industries: ${pk.targetIndustries?.join(", ") || "N/A"}
- Main Competitors: ${pk.basicInfo?.competitors?.join(", ") || "N/A"}
- Why Choose Us Over Competitors: ${pk.competitorAdvantages || "N/A"}`);

  // Selling points
  parts.push(`## Selling Points
- Price Advantage: ${pk.sellingPoints?.priceAdvantage || "N/A"}
- Quality Advantage: ${pk.sellingPoints?.qualityAdvantage || "N/A"}
- Delivery Advantage: ${pk.sellingPoints?.deliveryAdvantage || "N/A"}
- Service Advantage: ${pk.sellingPoints?.serviceAdvantage || "N/A"}`);

  // Tech specs
  if (pk.techSpecs && Object.keys(pk.techSpecs).length > 0) {
    const specs = Object.entries(pk.techSpecs).map(([k, v]) => `  - ${k}: ${v}`).join("\n");
    parts.push(`## Technical Specifications\n${specs}`);
  }

  // Certifications
  if (pk.certifications?.length) {
    parts.push(`## Certifications & Patents
- Certifications: ${pk.certifications.join(", ")}
${pk.patents?.length ? `- Patents: ${pk.patents.join(", ")}` : ""}`);
  }

  // Trade details
  parts.push(`## Trade & Logistics
- MOQ: ${pk.moq || "N/A"}
- Sample Policy: ${pk.samplePolicy || "N/A"}
- Lead Time: ${pk.leadTime || "N/A"}
- Payment Terms: ${pk.paymentTerms?.join(", ") || "N/A"}
- Accepted Currencies: ${pk.acceptedCurrencies?.join(", ") || "N/A"}
- Incoterms: ${pk.incoterms?.join(", ") || "N/A"}
- Shipping Methods: ${pk.shippingMethods?.join(", ") || "N/A"}
- Packaging: ${pk.packagingInfo || "N/A"}`);

  // Pricing
  parts.push(`## Pricing
- Price Range: ${pk.priceRange || "N/A"}
- Bulk Discount: ${pk.bulkDiscountPolicy || "N/A"}
- OEM/ODM: ${pk.oemOdmPolicy || "N/A"}`);

  // Quality
  parts.push(`## Quality & After-Sales
- QC Process: ${pk.qualityControlProcess || "N/A"}
- After-Sales Service: ${pk.afterSalesService || "N/A"}
- Warranty: ${pk.warrantyPolicy || "N/A"}
- Return Policy: ${pk.returnPolicy || "N/A"}`);

  // Case studies
  if (pk.caseStudies?.length) {
    const cases = pk.caseStudies.map((cs, i) =>
      `Case ${i + 1}: ${cs.customer} (${cs.industry}${cs.country ? `, ${cs.country}` : ""})
  - Pain Point: ${cs.painPoint}
  - Solution: ${cs.solution}
  - Result: ${cs.result}
  ${cs.testimonial ? `- Testimonial: ${cs.testimonial}` : ""}`
    ).join("\n\n");
    parts.push(`## Success Stories / Case Studies\n${cases}`);
  }

  // FAQ
  if (pk.faq?.length) {
    const faqs = pk.faq.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n");
    parts.push(`## FAQ (For reference when handling objections)\n${faqs}`);
  }

  // Custom sections
  if (pk.customSections?.length) {
    const custom = pk.customSections.map((s) => `## ${s.title}\n${s.content}`).join("\n\n");
    parts.push(custom);
  }

  return parts.join("\n\n");
}

// ── Email Prompt (FULL PK injected) ───────────────────────────
export function buildEmailPrompt(
  pk: ProductKnowledge | null,
  customerInfo: { company_name: string; website: string; description: string; contact_name: string },
  emailType: string,
  language: string
): { system: string; user: string } {
  const typeDesc: Record<string, string> = {
    initial: "first cold outreach email",
    followup1: "follow-up (3 days after last contact)",
    followup2: "follow-up (7 days after last contact)",
    followup3: "follow-up (14 days after last contact)",
  };
  const langName = LANGUAGES[language] || "English";

  const productContext = buildProductContext(pk);

  const system = `You are an expert B2B sales copywriter with 10 years of international trade experience.

## WRITING PRINCIPLES
1. **Deep Personalization (30%)**: Reference the customer's specific company, website content, and industry. Show research.
2. **Value Proposition (40%)**: Use the product knowledge provided. Include SPECIFIC numbers, certifications, case studies. Be concrete.
3. **Social Proof (20%)**: Use the case studies from the product knowledge. Reference real results.
4. **CTA (10%)**: Clear, low-friction ask. Make it easy to say yes.

## VERSION STRATEGY
- **Version 1 (Professional)**: Formal, thorough, suitable for traditional companies. Reference certifications and specs.
- **Version 2 (Concise)**: Under 100 words, direct, for busy executives. Lead with strongest USP.
- **Version 3 (Story)**: Open with a case study. Connect the customer's situation to a similar success story.

## LANGUAGE
Write in **${langName}**. Must be NATURAL, not translated. Use local business conventions.

## QUALITY SELF-ASSESSMENT
Rate each email on 1-10 for: personalization, valueClarity, socialProof, ctaClarity, spamRisk (lower=better).

## OUTPUT
Return ONLY valid JSON:
{
  "version1": { "subject": "...", "content": "...", "tone": "professional", "aiScore": { "personalization": N, "valueClarity": N, "socialProof": N, "ctaClarity": N, "spamRisk": N, "overallScore": N, "feedback": "one sentence improvement tip" } },
  "version2": { ... },
  "version3": { ... }
}`;

  const user = `${productContext}

## TARGET CUSTOMER
- Company: ${customerInfo.company_name}
- Website: ${customerInfo.website}
- Business: ${customerInfo.description}
- Contact: ${customerInfo.contact_name || "Decision Maker"}

## TASK
Write a ${typeDesc[emailType] || emailType} in ${langName}.
Use the product knowledge above. Reference specific case studies if applicable.
Return JSON only.`;

  return { system, user };
}

// ── Quotation Prompt (FULL PK + Scenario) ─────────────────────
export function buildQuotationPrompt(
  pk: ProductKnowledge | null,
  customerInfo: { company_name: string; contact_name: string; email: string },
  products: Array<{ name: string; specs: string; unitPrice: number; quantity: number; total: number; customDesc?: string }>,
  options: {
    currency?: string; validUntil?: string; paymentTerms?: string; deliveryTerms?: string;
    notes?: string; language?: string; incoterm?: string; portOfLoading?: string;
    portOfDestination?: string; insuranceIncluded?: boolean; additionalFees?: string;
    quotationTemplate?: string; customHeader?: string; customFooter?: string;
    discountTerms?: string; sampleIncluded?: boolean; warrantyTerms?: string;
  }
): { system: string; user: string } {
  const langName = LANGUAGES[options.language || "en"] || "English";
  const productContext = buildProductContext(pk);

  const system = `You are a professional B2B quotation document generator. Generate in ${langName}.

## OUTPUT FORMAT
Return ONLY valid JSON:
{
  "quotationTitle": "Official Quotation",
  "quotationNumber": "QT-YYYYMMDD-001",
  "headerNote": "Personalized greeting and thank you note",
  "companyIntro": "1-2 sentences about your company using product knowledge",
  "productTable": [
    { "itemNo": 1, "name": "...", "specs": "...", "description": "AI-written compelling description", "unitPrice": 0, "quantity": 0, "unit": "pcs", "total": 0 }
  ],
  "subtotal": 0,
  "discountInfo": "Discount terms if any",
  "totalAmount": 0,
  "termsSection": { "payment": "...", "delivery": "...", "incoterm": "...", "warranty": "...", "validity": "..." },
  "closingText": "Professional closing with next steps",
  "footerNote": "Company info, contact details, legal note"
}`;

  const productsStr = products.map((p, i) =>
    `Item ${i + 1}: ${p.name} | Specs: ${p.specs} | Unit Price: ${p.unitPrice} | Qty: ${p.quantity} | Total: ${p.total}${p.customDesc ? ` | Customer Note: ${p.customDesc}` : ""}`
  ).join("\n");

  const user = `${productContext}

## CUSTOMER
- Company: ${customerInfo.company_name}
- Contact: ${customerInfo.contact_name}
- Email: ${customerInfo.email}

## PRODUCTS TO QUOTE
${productsStr}

## QUOTATION PARAMETERS
- Incoterm: ${options.incoterm || "FOB"}
- Port of Loading: ${options.portOfLoading || "N/A"}
- Port of Destination: ${options.portOfDestination || "N/A"}
- Currency: ${options.currency || "USD"}
- Payment Terms: ${options.paymentTerms || "T/T 30% deposit, 70% before shipment"}
- Delivery Time: ${options.deliveryTerms || "15-20 days"}
- Valid Until: ${options.validUntil || "30 days"}
${options.discountTerms ? `- Discount: ${options.discountTerms}` : ""}
${options.additionalFees ? `- Additional Fees: ${options.additionalFees}` : ""}
${options.sampleIncluded ? "- Includes free samples" : ""}
${options.warrantyTerms ? `- Warranty: ${options.warrantyTerms}` : ""}
${options.insuranceIncluded ? "- Insurance included" : "- Insurance not included"}
${options.customHeader ? `- Custom Header Text: ${options.customHeader}` : ""}
${options.customFooter ? `- Custom Footer Text: ${options.customFooter}` : ""}
- Notes: ${options.notes || "N/A"}

## TASK
Generate a professional ${options.quotationTemplate || "standard"} quotation in ${langName}.
Use the product knowledge for company intro and product descriptions. Return JSON only.`;

  return { system, user };
}

// ── Reply Prompt (FULL PK injected) ───────────────────────────
export function buildReplyPrompt(
  pk: ProductKnowledge | null,
  customerEmail: string,
  customerStatus: string,
  language: string,
  customInstructions?: string,
): { system: string; user: string } {
  const langName = LANGUAGES[language] || "English";
  const productContext = buildProductContext(pk);

  const system = `You are an expert B2B sales representative. Reply to customer inquiries professionally in ${langName}.

## STRATEGY BY STATUS
- "new inquiry": Be welcoming, answer all questions, build trust. Reference product knowledge for accuracy.
- "negotiating": Be persuasive, use social proof from case studies, push for commitment.
- "ready to order": Confirm details, be efficient, close the deal.
- "objection": Address concerns with facts from product knowledge, use FAQ for reference.

## VERSIONS
- Version 1 (Professional): Detailed, addresses every question
- Version 2 (Concise): Direct, saves time
- Version 3 (Persuasive): Uses social proof to move forward

## OUTPUT
Return ONLY valid JSON:
{
  "version1": { "subject": "...", "content": "...", "tone": "professional" },
  "version2": { "subject": "...", "content": "...", "tone": "concise" },
  "version3": { "subject": "...", "content": "...", "tone": "persuasive" }
}`;

  const user = `${productContext}

## CUSTOMER EMAIL
${customerEmail}

## CONTEXT
- Customer Status: ${customerStatus}
${customInstructions ? `- Special Instructions: ${customInstructions}` : ""}

## TASK
Generate 3 reply versions in ${langName}. Use product knowledge to be accurate. Return JSON only.`;

  return { system, user };
}

export type { ProductKnowledge };
