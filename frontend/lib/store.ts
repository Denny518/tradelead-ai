import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const DATA_DIR = process.env.VERCEL ? path.join(os.tmpdir(), "tradelead-data") : path.join(process.cwd(), "data");

function dataPath(filename: string): string { return path.join(DATA_DIR, filename); }
function ensureDir(): void { if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true }); }
function readCollection<T>(name: string): T[] {
  ensureDir();
  const file = dataPath(`${name}.json`);
  if (!fs.existsSync(file)) return [];
  try { return JSON.parse(fs.readFileSync(file, "utf-8")); } catch { return []; }
}
function writeCollection<T>(name: string, data: T[]): void {
  ensureDir();
  fs.writeFileSync(dataPath(`${name}.json`), JSON.stringify(data, null, 2));
}

const PLACEHOLDER_USER = "demo-user-001";
let _customerSeq = 0, _emailSeq = 0, _searchSeq = 0;
function nextCustomerId(): number { if (_customerSeq === 0) { const c = readCollection<any>("customers"); _customerSeq = c.reduce((m: number, x: any) => Math.max(m, x.id), 0); } return ++_customerSeq; }
function nextEmailId(): number { if (_emailSeq === 0) { const e = readCollection<any>("emails"); _emailSeq = e.reduce((m: number, x: any) => Math.max(m, x.id), 0); } return ++_emailSeq; }
function now(): string { return new Date().toISOString(); }

// ── Types ──────────────────────────────────────────────────────
export interface CustomerRecord { id: number; user_id: string; company_name: string; website: string; description: string; contact_name: string; email: string; position: string; match_score: number; status: string; note: string; created_at: string; updated_at: string; }
export interface EmailRecord { id: number; customer_id: number; user_id: string; subject: string; content: string; version: number; email_type: string; sent_at: string | null; created_at: string; }
export interface SearchRecord { id: number; user_id: string; query: string; product: string; market: string; industry: string; results_count: number; created_at: string; }

// ── Customer CRUD ──────────────────────────────────────────────
export function listCustomers(f?: { status?: string; limit?: number; offset?: number }): { data: CustomerRecord[]; count: number } {
  let rows = readCollection<CustomerRecord>("customers");
  rows.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  if (f?.status) rows = rows.filter((c) => c.status === f.status);
  const count = rows.length;
  return { data: rows.slice(f?.offset || 0, (f?.offset || 0) + (f?.limit || 50)), count };
}
export function createCustomer(data: Partial<CustomerRecord>): CustomerRecord {
  const c: CustomerRecord = { id: nextCustomerId(), user_id: PLACEHOLDER_USER, company_name: data.company_name || "", website: data.website || "", description: data.description || "", contact_name: data.contact_name || "", email: data.email || "", position: data.position || "", match_score: data.match_score || 0, status: data.status || "new", note: data.note || "", created_at: now(), updated_at: now() };
  const customers = readCollection<CustomerRecord>("customers"); customers.push(c); writeCollection("customers", customers); return c;
}
export function getCustomer(id: number): CustomerRecord | null { return readCollection<CustomerRecord>("customers").find((c) => c.id === id) || null; }
export function updateCustomer(id: number, data: Partial<CustomerRecord>): CustomerRecord | null {
  const customers = readCollection<CustomerRecord>("customers"); const idx = customers.findIndex((c) => c.id === id);
  if (idx === -1) return null; customers[idx] = { ...customers[idx], ...data, id: customers[idx].id, updated_at: now() }; writeCollection("customers", customers); return customers[idx];
}
export function deleteCustomer(id: number): boolean { const c = readCollection<CustomerRecord>("customers").filter((x) => x.id !== id); if (c.length === readCollection<CustomerRecord>("customers").length) return false; writeCollection("customers", c); return true; }

// ── Emails ─────────────────────────────────────────────────────
export function saveEmail(data: { customer_id: number; subject: string; content: string; version?: number; email_type?: string }): EmailRecord {
  const e: EmailRecord = { id: nextEmailId(), customer_id: data.customer_id, user_id: PLACEHOLDER_USER, subject: data.subject, content: data.content, version: data.version || 1, email_type: data.email_type || "initial", sent_at: now(), created_at: now() };
  const emails = readCollection<EmailRecord>("emails"); emails.push(e); writeCollection("emails", emails); return e;
}
export function listEmailsForCustomer(customerId: number): EmailRecord[] {
  return readCollection<EmailRecord>("emails").filter((e) => e.customer_id === customerId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

// ── Search ─────────────────────────────────────────────────────
export function saveSearch(data: { query: string; product: string; market: string; industry: string; results_count: number }): void {
  const s = readCollection<SearchRecord>("searches"); s.push({ id: ++_searchSeq, user_id: PLACEHOLDER_USER, ...data, created_at: now() }); writeCollection("searches", s);
}

// ── Product Knowledge (EXPANDED) ──────────────────────────────
export interface ProductKnowledge {
  id?: string; userId?: string;
  // Basic
  productName: string;
  productCategory?: string;
  brandName?: string;
  companyYearFounded?: string;
  companyLocation?: string;
  companyScale?: string; // employees count range
  annualRevenue?: string;

  // Rich descriptions
  productSummary?: string; // 1 paragraph overview
  detailedDescription?: string; // multiple paragraphs, rich detail
  uniqueSellingProposition?: string; // Core differentiator

  // Multi-media
  productImages?: string[]; // URLs
  productVideos?: string[]; // YouTube/Vimeo URLs
  catalogUrl?: string;
  websiteUrl?: string;
  linkedinUrl?: string;

  // Structured info
  basicInfo?: { applicationScenarios: string[]; targetCustomers: string[]; competitors: string[]; };
  sellingPoints?: { priceAdvantage: string; qualityAdvantage: string; deliveryAdvantage: string; serviceAdvantage: string; };
  techSpecs?: Record<string, string>;
  certifications?: string[]; // CE, FCC, RoHS, ISO etc
  patents?: string[];

  // Trade specifics
  hsCode?: string;
  moq?: string;
  samplePolicy?: string;
  packagingInfo?: string;
  shippingMethods?: string[];
  leadTime?: string;
  paymentTerms?: string[];
  acceptedCurrencies?: string[];
  incoterms?: string[]; // FOB, CIF, EXW etc

  // Pricing
  priceRange?: string;
  bulkDiscountPolicy?: string;
  oemOdmPolicy?: string;

  // Quality & After-sales
  qualityControlProcess?: string;
  afterSalesService?: string;
  warrantyPolicy?: string;
  returnPolicy?: string;

  // Case studies
  caseStudies?: Array<{ customer: string; industry: string; country?: string; painPoint: string; solution: string; result: string; testimonial?: string; }>;

  // Success metrics
  totalCustomersServed?: string;
  countriesExportedTo?: string[];
  annualExportVolume?: string;
  keyClients?: string[]; // major clients you've worked with
  exhibitionHistory?: string[]; // trade shows attended

  // FAQ
  faq?: Array<{ question: string; answer: string; }>;

  // Preferences
  emailStyle?: string; // professional/casual/story
  targetIndustries?: string[];
  competitorAdvantages?: string; // why choose you over competitors

  // Custom sections (free-form)
  customSections?: Array<{ title: string; content: string; }>;

  updatedAt?: string;
}

export function getProductKnowledge(userId: string): ProductKnowledge | null {
  const items = readCollection<any>("product_knowledge");
  return items.find((p: any) => p.userId === userId) || null;
}
export function saveProductKnowledge(userId: string, data: ProductKnowledge): ProductKnowledge {
  const items = readCollection<any>("product_knowledge");
  const idx = items.findIndex((p: any) => p.userId === userId);
  const record = { ...data, id: data.id || `pk_${Date.now()}`, userId, updatedAt: now() };
  if (idx === -1) items.push({ ...record, createdAt: now() }); else items[idx] = { ...items[idx], ...record, createdAt: items[idx].createdAt };
  writeCollection("product_knowledge", items); return record;
}

// ── Gmail Tokens ───────────────────────────────────────────────

export interface GmailTokenRecord {
  userId: string;
  accessToken: string;
  refreshToken: string;
  email: string;
  expiresAt: number;
  updatedAt: string;
}

export function getGmailTokens(userId: string): GmailTokenRecord | null {
  const items = readCollection<any>("gmail_tokens");
  return items.find((t: any) => t.userId === userId) || null;
}

export function saveGmailTokens(userId: string, data: Omit<GmailTokenRecord, "userId" | "updatedAt">): void {
  const items = readCollection<any>("gmail_tokens");
  const idx = items.findIndex((t: any) => t.userId === userId);
  const record = { ...data, userId, updatedAt: now() };
  if (idx === -1) items.push(record);
  else items[idx] = record;
  writeCollection("gmail_tokens", items);
}

export function removeGmailTokens(userId: string): void {
  const items = readCollection<any>("gmail_tokens").filter((t: any) => t.userId !== userId);
  writeCollection("gmail_tokens", items);
}

// ── Follow-ups ─────────────────────────────────────────────────
export interface FollowupStatus { customerId: number; customerName: string; email: string; lastEmailDate: string; lastEmailType: string; daysSinceLastContact: number; followupDue: string; suggestedAction: string; }
export function getFollowupList(): FollowupStatus[] {
  const customers = readCollection<CustomerRecord>("customers"); const emails = readCollection<EmailRecord>("emails");
  const latestEmails = new Map<number, EmailRecord>();
  for (const e of emails) { const ex = latestEmails.get(e.customer_id); if (!ex || new Date(e.created_at) > new Date(ex.created_at)) latestEmails.set(e.customer_id, e); }
  const results: FollowupStatus[] = []; const nowDate = new Date();
  for (const c of customers) {
    if (c.status === "won" || c.status === "lost") continue;
    const le = latestEmails.get(c.id); if (!le) continue;
    const daysDiff = Math.floor((nowDate.getTime() - new Date(le.created_at).getTime()) / 86400000);
    let fd: string = "none"; if (daysDiff >= 14) fd = "overdue"; else if (daysDiff >= 10) fd = "day14"; else if (daysDiff >= 5) fd = "day7"; else if (daysDiff >= 2) fd = "day3";
    const am: Record<string, string> = { day3: "轻触式跟进", day7: "提供案例或价值内容", day14: "最后尝试", overdue: "建议电话联系", none: "无需跟进" };
    if (fd !== "none" || daysDiff >= 1) results.push({ customerId: c.id, customerName: c.company_name, email: c.email || "", lastEmailDate: le.created_at, lastEmailType: fd === "overdue" ? "followup3" : fd === "none" ? "initial" : `followup${fd.replace("day", "")}`, daysSinceLastContact: daysDiff, followupDue: fd, suggestedAction: am[fd] });
  }
  results.sort((a, b) => { const p: Record<string, number> = { overdue: 0, day3: 1, day7: 2, day14: 3, none: 4 }; return (p[a.followupDue] ?? 4) - (p[b.followupDue] ?? 4); });
  return results;
}

// ── Deal Scores / Market Intel / Team / Stats ──────────────────
export interface DealScoreRecord { customerId: number; companyName: string; probability: number; factors: Array<{ factor: string; impact: string }>; recommendation: string; analyzedAt: string; }
export function getDealScore(customerId: number): DealScoreRecord | null { return readCollection<any>("deal_scores").find((s: any) => s.customerId === customerId) || null; }
export function saveDealScore(score: DealScoreRecord): void { const s = readCollection<any>("deal_scores"); const i = s.findIndex((x: any) => x.customerId === score.customerId); if (i === -1) s.push(score); else s[i] = score; writeCollection("deal_scores", s); }
export function getAllDealScores(): DealScoreRecord[] { return readCollection("deal_scores"); }

export interface MarketIntelRecord { id: string; market: string; industry: string; keywords?: string; compareMarket?: string; dateRange?: string; trend?: string; growthRate?: number | null; competitorData?: any; recommendation?: string; trendData?: any; analysis?: any; createdAt: string; }
export function saveMarketIntel(data: MarketIntelRecord): void { const items = readCollection<MarketIntelRecord>("market_intel"); items.push(data); writeCollection("market_intel", items); }
export function getMarketIntel(): MarketIntelRecord[] { return readCollection<MarketIntelRecord>("market_intel"); }

export interface TeamMemberRecord { id: string; ownerId: string; memberEmail: string; role: string; createdAt: string; }
export function listTeamMembers(): TeamMemberRecord[] { return readCollection<TeamMemberRecord>("team_members"); }
export function addTeamMember(email: string, role = "member"): TeamMemberRecord { const m = readCollection<TeamMemberRecord>("team_members"); const r: TeamMemberRecord = { id: `tm_${Date.now()}`, ownerId: PLACEHOLDER_USER, memberEmail: email, role, createdAt: now() }; m.push(r); writeCollection("team_members", m); return r; }
export function removeTeamMember(id: string): boolean { const m = readCollection<TeamMemberRecord>("team_members"); const f = m.filter((x) => x.id !== id); if (f.length === m.length) return false; writeCollection("team_members", f); return true; }

export function getDashboardStats(): any {
  const customers = readCollection<CustomerRecord>("customers"); const emails = readCollection<EmailRecord>("emails");
  const sb: Record<string, number> = {}; for (const c of customers) sb[c.status] = (sb[c.status] || 0) + 1;
  const ra = [...emails.slice(-5).map((e) => ({ type: "email", message: `发送邮件 #${e.customer_id}`, time: e.created_at })), ...customers.slice(-5).map((c) => ({ type: "customer", message: `${c.company_name}`, time: c.updated_at }))].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10);
  return { totalCustomers: customers.length, totalEmails: emails.length, wonDeals: customers.filter((c) => c.status === "won").length, avgResponseTime: 0, statusBreakdown: sb, recentActivity: ra };
}

export function exportCustomersCSV(status?: string): string {
  let rows = readCollection<CustomerRecord>("customers"); if (status) rows = rows.filter((c) => c.status === status);
  const h = ["ID", "Company Name", "Website", "Description", "Contact Name", "Email", "Position", "Match Score", "Status", "Note", "Created At", "Updated At"];
  const lines = [h.join(",")];
  for (const c of rows) lines.push([c.id, c.company_name, c.website, c.description, c.contact_name, c.email, c.position, c.match_score, c.status, c.note, c.created_at, c.updated_at].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
  return lines.join("\n");
}
