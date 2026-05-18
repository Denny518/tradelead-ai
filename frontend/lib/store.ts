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
