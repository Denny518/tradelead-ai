import fs from "node:fs";
import path from "node:path";
import os from "node:os";

// Vercel serverless only allows writes to /tmp
const DATA_DIR = process.env.VERCEL ? path.join(os.tmpdir(), "tradelead-data") : path.join(process.cwd(), "data");

function dataPath(filename: string): string {
  return path.join(DATA_DIR, filename);
}

function ensureDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readCollection<T>(name: string): T[] {
  ensureDir();
  const file = dataPath(`${name}.json`);
  if (!fs.existsSync(file)) return [];
  try {
    return JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch {
    return [];
  }
}

function writeCollection<T>(name: string, data: T[]): void {
  ensureDir();
  fs.writeFileSync(dataPath(`${name}.json`), JSON.stringify(data, null, 2));
}

// ── Types ──────────────────────────────────────────────────────

export interface CustomerRecord {
  id: number;
  user_id: string;
  company_name: string;
  website: string;
  description: string;
  contact_name: string;
  email: string;
  position: string;
  match_score: number;
  status: string;
  note: string;
  created_at: string;
  updated_at: string;
}

export interface EmailRecord {
  id: number;
  customer_id: number;
  user_id: string;
  subject: string;
  content: string;
  version: number;
  email_type: string;
  sent_at: string | null;
  created_at: string;
}

export interface SearchRecord {
  id: number;
  user_id: string;
  query: string;
  product: string;
  market: string;
  industry: string;
  results_count: number;
  created_at: string;
}

const PLACEHOLDER_USER = "demo-user-001";

// ── Helpers ────────────────────────────────────────────────────

let _customerSeq = 0;
let _emailSeq = 0;
let _searchSeq = 0;

function nextCustomerId(): number {
  if (_customerSeq === 0) {
    const customers = readCollection<CustomerRecord>("customers");
    _customerSeq = customers.reduce((max, c) => Math.max(max, c.id), 0);
  }
  return ++_customerSeq;
}

function nextEmailId(): number {
  if (_emailSeq === 0) {
    const emails = readCollection<EmailRecord>("emails");
    _emailSeq = emails.reduce((max, e) => Math.max(max, e.id), 0);
  }
  return ++_emailSeq;
}

function now(): string {
  return new Date().toISOString();
}

// ── Customer CRUD ──────────────────────────────────────────────

export function listCustomers(filters?: {
  status?: string;
  limit?: number;
  offset?: number;
}): { data: CustomerRecord[]; count: number } {
  let rows = readCollection<CustomerRecord>("customers");
  rows.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

  if (filters?.status) {
    rows = rows.filter((c) => c.status === filters.status);
  }

  const count = rows.length;
  const offset = filters?.offset || 0;
  const limit = filters?.limit || 50;
  return { data: rows.slice(offset, offset + limit), count };
}

export function createCustomer(data: Partial<CustomerRecord>): CustomerRecord {
  const customer: CustomerRecord = {
    id: nextCustomerId(),
    user_id: PLACEHOLDER_USER,
    company_name: data.company_name || "",
    website: data.website || "",
    description: data.description || "",
    contact_name: data.contact_name || "",
    email: data.email || "",
    position: data.position || "",
    match_score: data.match_score || 0,
    status: data.status || "new",
    note: data.note || "",
    created_at: now(),
    updated_at: now(),
  };

  const customers = readCollection<CustomerRecord>("customers");
  customers.push(customer);
  writeCollection("customers", customers);
  return customer;
}

export function getCustomer(id: number): CustomerRecord | null {
  const customers = readCollection<CustomerRecord>("customers");
  return customers.find((c) => c.id === id) || null;
}

export function updateCustomer(id: number, data: Partial<CustomerRecord>): CustomerRecord | null {
  const customers = readCollection<CustomerRecord>("customers");
  const idx = customers.findIndex((c) => c.id === id);
  if (idx === -1) return null;

  customers[idx] = { ...customers[idx], ...data, id: customers[idx].id, updated_at: now() };
  writeCollection("customers", customers);
  return customers[idx];
}

export function deleteCustomer(id: number): boolean {
  const customers = readCollection<CustomerRecord>("customers");
  const filtered = customers.filter((c) => c.id !== id);
  if (filtered.length === customers.length) return false;
  writeCollection("customers", filtered);
  return true;
}

// ── Email ──────────────────────────────────────────────────────

export function saveEmail(data: {
  customer_id: number;
  subject: string;
  content: string;
  version?: number;
  email_type?: string;
}): EmailRecord {
  const email: EmailRecord = {
    id: nextEmailId(),
    customer_id: data.customer_id,
    user_id: PLACEHOLDER_USER,
    subject: data.subject,
    content: data.content,
    version: data.version || 1,
    email_type: data.email_type || "initial",
    sent_at: now(),
    created_at: now(),
  };

  const emails = readCollection<EmailRecord>("emails");
  emails.push(email);
  writeCollection("emails", emails);
  return email;
}

export function listEmailsForCustomer(customerId: number): EmailRecord[] {
  const emails = readCollection<EmailRecord>("emails");
  return emails
    .filter((e) => e.customer_id === customerId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

// ── Search History ─────────────────────────────────────────────

export function saveSearch(data: {
  query: string;
  product: string;
  market: string;
  industry: string;
  results_count: number;
}): void {
  const searches = readCollection<SearchRecord>("searches");
  searches.push({
    id: ++_searchSeq,
    user_id: PLACEHOLDER_USER,
    ...data,
    created_at: now(),
  });
  writeCollection("searches", searches);
}

// ── Product Knowledge ──────────────────────────────────────────

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

export function getProductKnowledge(userId: string): ProductKnowledge | null {
  const items = readCollection<any>("product_knowledge");
  return items.find((p: any) => p.userId === userId) || null;
}

export function saveProductKnowledge(userId: string, data: ProductKnowledge): ProductKnowledge {
  const items = readCollection<any>("product_knowledge");
  const idx = items.findIndex((p: any) => p.userId === userId);
  const record = { ...data, id: data.id || `pk_${Date.now()}`, userId, updatedAt: now() };

  if (idx === -1) {
    items.push({ ...record, createdAt: now() });
  } else {
    items[idx] = { ...items[idx], ...record, createdAt: items[idx].createdAt };
  }
  writeCollection("product_knowledge", items);
  return record;
}

// ── Follow-up Tracking ────────────────────────────────────────

export interface FollowupStatus {
  customerId: number;
  customerName: string;
  email: string;
  lastEmailDate: string;
  lastEmailType: string;
  daysSinceLastContact: number;
  followupDue: "day3" | "day7" | "day14" | "overdue" | "none";
  suggestedAction: string;
}

export function getFollowupList(): FollowupStatus[] {
  const customers = readCollection<CustomerRecord>("customers");
  const emails = readCollection<EmailRecord>("emails");

  // Get the latest email for each customer
  const latestEmails = new Map<number, EmailRecord>();
  for (const e of emails) {
    const existing = latestEmails.get(e.customer_id);
    if (!existing || new Date(e.created_at) > new Date(existing.created_at)) {
      latestEmails.set(e.customer_id, e);
    }
  }

  const results: FollowupStatus[] = [];
  const now = new Date();

  for (const c of customers) {
    if (c.status === "won" || c.status === "lost") continue;

    const lastEmail = latestEmails.get(c.id);
    if (!lastEmail) continue;

    const lastDate = new Date(lastEmail.created_at);
    const daysDiff = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    let followupDue: FollowupStatus["followupDue"] = "none";
    if (daysDiff >= 14) followupDue = "overdue";
    else if (daysDiff >= 10) followupDue = "day14";
    else if (daysDiff >= 5) followupDue = "day7";
    else if (daysDiff >= 2) followupDue = "day3";

    const typeMap: Record<string, string> = { day3: "followup1", day7: "followup2", day14: "followup3", overdue: "followup3", none: "initial" };
    const actionMap: Record<string, string> = {
      day3: "轻触式跟进：检查是否收到上一封邮件",
      day7: "提供价值：发送案例研究或行业洞察",
      day14: "最后尝试：如果无兴趣不再打扰",
      overdue: "已超过常规跟进周期，建议电话联系",
      none: "无需跟进",
    };

    if (followupDue !== "none" || daysDiff >= 1) {
      results.push({
        customerId: c.id,
        customerName: c.company_name,
        email: c.email || "",
        lastEmailDate: lastEmail.created_at,
        lastEmailType: typeMap[followupDue],
        daysSinceLastContact: daysDiff,
        followupDue: followupDue === "none" ? "none" : followupDue,
        suggestedAction: actionMap[followupDue],
      });
    }
  }

  results.sort((a, b) => {
    const priority: Record<string, number> = { overdue: 0, day3: 1, day7: 2, day14: 3, none: 4 };
    return (priority[a.followupDue] ?? 4) - (priority[b.followupDue] ?? 4);
  });

  return results;
}

// ── Deal Score ─────────────────────────────────────────────────

export interface DealScoreRecord {
  customerId: number;
  companyName: string;
  probability: number;
  factors: Array<{ factor: string; impact: string }>;
  recommendation: string;
  analyzedAt: string;
}

export function getDealScore(customerId: number): DealScoreRecord | null {
  const scores = readCollection<any>("deal_scores");
  return scores.find((s: any) => s.customerId === customerId) || null;
}

export function saveDealScore(score: DealScoreRecord): void {
  const scores = readCollection<any>("deal_scores");
  const idx = scores.findIndex((s: any) => s.customerId === score.customerId);
  if (idx === -1) scores.push(score);
  else scores[idx] = score;
  writeCollection("deal_scores", scores);
}

export function getAllDealScores(): DealScoreRecord[] {
  return readCollection("deal_scores");
}

// ── Market Intelligence ───────────────────────────────────────

export interface MarketIntelRecord {
  id: string;
  market: string;
  industry: string;
  trend: string;
  growthRate: number | null;
  competitorData: any;
  recommendation: string;
  createdAt: string;
}

export function saveMarketIntel(data: MarketIntelRecord): void {
  const items = readCollection<MarketIntelRecord>("market_intel");
  items.push(data);
  writeCollection("market_intel", items);
}

export function getMarketIntel(): MarketIntelRecord[] {
  return readCollection<MarketIntelRecord>("market_intel");
}

// ── Team Members ──────────────────────────────────────────────

export interface TeamMemberRecord {
  id: string;
  ownerId: string;
  memberEmail: string;
  role: string;
  createdAt: string;
}

export function listTeamMembers(): TeamMemberRecord[] {
  return readCollection<TeamMemberRecord>("team_members");
}

export function addTeamMember(email: string, role = "member"): TeamMemberRecord {
  const members = readCollection<TeamMemberRecord>("team_members");
  const record: TeamMemberRecord = {
    id: `tm_${Date.now()}`,
    ownerId: "demo-user-001",
    memberEmail: email,
    role,
    createdAt: now(),
  };
  members.push(record);
  writeCollection("team_members", members);
  return record;
}

export function removeTeamMember(id: string): boolean {
  const members = readCollection<TeamMemberRecord>("team_members");
  const filtered = members.filter((m) => m.id !== id);
  if (filtered.length === members.length) return false;
  writeCollection("team_members", filtered);
  return true;
}

// ── Dashboard Stats ───────────────────────────────────────────

export function getDashboardStats(): {
  totalCustomers: number;
  totalEmails: number;
  wonDeals: number;
  avgResponseTime: number;
  statusBreakdown: Record<string, number>;
  recentActivity: Array<{ type: string; message: string; time: string }>;
} {
  const customers = readCollection<CustomerRecord>("customers");
  const emails = readCollection<EmailRecord>("emails");

  const statusBreakdown: Record<string, number> = {};
  for (const c of customers) {
    statusBreakdown[c.status] = (statusBreakdown[c.status] || 0) + 1;
  }

  const recentActivity = [
    ...emails.slice(-5).map((e) => ({
      type: "email",
      message: `发送邮件给客户 #${e.customer_id}`,
      time: e.created_at,
    })),
    ...customers.slice(-5).map((c) => ({
      type: "customer",
      message: `${c.status === "won" ? "成交" : c.status === "new" ? "新增" : "更新"}客户 ${c.company_name}`,
      time: c.updated_at,
    })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10);

  return {
    totalCustomers: customers.length,
    totalEmails: emails.length,
    wonDeals: customers.filter((c) => c.status === "won").length,
    avgResponseTime: 0,
    statusBreakdown,
    recentActivity,
  };
}

// ── Export CSV ─────────────────────────────────────────────────

export function exportCustomersCSV(status?: string): string {
  let rows = readCollection<CustomerRecord>("customers");
  if (status) rows = rows.filter((c) => c.status === status);

  const headers = [
    "ID", "Company Name", "Website", "Description", "Contact Name",
    "Email", "Position", "Match Score", "Status", "Note", "Created At", "Updated At",
  ];

  const lines = [headers.join(",")];
  for (const c of rows) {
    lines.push(
      [c.id, c.company_name, c.website, c.description, c.contact_name,
        c.email, c.position, c.match_score, c.status, c.note,
        c.created_at, c.updated_at,
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
    );
  }
  return lines.join("\n");
}
