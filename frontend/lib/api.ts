async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    // Try to extract message from JSON response
    try {
      const body = await res.json();
      throw new Error(body.message || `API error ${res.status}`);
    } catch (e) {
      if (e instanceof Error && e.message && !e.message.includes("Unexpected")) throw e;
      const err = await res.text();
      throw new Error(`API error ${res.status}: ${err}`);
    }
  }
  return res.json();
}

// ── Search ──────────────────────────────────────────────────────
export interface SearchParams {
  product: string;
  market: string;
  industry?: string;
  limit?: number;
  role?: string;
  companyType?: string;
  customQuery?: string;
  excludeKeywords?: string;
}

export interface SearchResultItem {
  company_name: string;
  website: string;
  description: string;
  match_score: number;
  source?: string;        // google, google_maps, google_local, google_shopping, google_news, bing
  phone?: string;
  address?: string;
  rating?: number;
  reviews_count?: number;
  price?: string;
  link?: string;
}

export interface SearchParams {
  product: string;
  market: string;
  industry?: string;
  limit?: number;
  role?: string;
  companyType?: string;
  customQuery?: string;
  excludeKeywords?: string;
  engine?: string;            // google | google_maps | google_local | google_shopping | google_news | bing | all
  mapsLocation?: string;      // Maps/Local: specific city or address
  mapsRadius?: string;        // Maps: search radius
  shoppingPriceRange?: string;// Shopping: "50-200"
  newsTimeframe?: string;     // News: "d","w","m","y"
  bingMarket?: string;        // Bing: market code "en-US"
}

export interface SearchResponse {
  success: boolean;
  data: SearchResultItem[];
  count: number;
  engine?: string;
}

export async function searchCustomers(params: SearchParams): Promise<SearchResponse> {
  return request("/api/search-customers", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

// ── Find Email ──────────────────────────────────────────────────
export interface FindEmailItem {
  name: string;
  email: string;
  position: string;
}

export interface FindEmailResponse {
  success: boolean;
  data: FindEmailItem[];
  message?: string;
  note?: string;
  needsManualDomain?: boolean;
}

export async function findEmail(companyDomain: string, companyName?: string, address?: string, source?: string): Promise<FindEmailResponse> {
  return request("/api/find-email", {
    method: "POST",
    body: JSON.stringify({ company_domain: companyDomain, company_name: companyName || "", address: address || "", source: source || "" }),
  });
}

// ── Generate Email ──────────────────────────────────────────────
export interface GenerateEmailParams {
  product_info: {
    name: string;
    description: string;
    advantages: string[];
  };
  customer_info: {
    company_name: string;
    website: string;
    description: string;
    contact_name: string;
  };
  email_type: string;
  language?: string;
}

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

export interface GenerateEmailResponse {
  success: boolean;
  data: Record<string, EmailVersion>;
}

export async function generateEmail(params: GenerateEmailParams): Promise<GenerateEmailResponse> {
  return request("/api/generate-email", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

// ── CRM ─────────────────────────────────────────────────────────
export interface Customer {
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
  created_at: string | null;
  updated_at: string | null;
}

export interface CustomerListResponse {
  success: boolean;
  data: Customer[];
  count: number;
}

export async function listCustomers(params?: {
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<CustomerListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set("status", params.status);
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.offset) searchParams.set("offset", String(params.offset));
  return request(`/api/customers?${searchParams.toString()}`);
}

export async function createCustomer(data: Partial<Customer>): Promise<Customer> {
  return request("/api/customers", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateCustomer(
  id: number,
  data: Partial<Customer>
): Promise<Customer> {
  return request(`/api/customers/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteCustomer(id: number): Promise<void> {
  return request(`/api/customers/${id}`, { method: "DELETE" });
}

export async function saveEmailToCustomer(
  customerId: number,
  data: { subject: string; content: string; version: number; email_type: string }
): Promise<void> {
  return request(`/api/customers/${customerId}/save-email`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function exportCustomersCSVUrl(status?: string): string {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  return `/api/customers/export-csv?${params.toString()}`;
}

// ── Product Knowledge ─────────────────────────────────────────

export interface ProductKnowledge {
  id?: string; userId?: string;
  productName: string; productCategory?: string; brandName?: string;
  companyYearFounded?: string; companyLocation?: string; companyScale?: string; annualRevenue?: string;
  productSummary?: string; detailedDescription?: string; uniqueSellingProposition?: string;
  productImages?: string[]; productVideos?: string[]; catalogUrl?: string; websiteUrl?: string; linkedinUrl?: string;
  basicInfo?: { applicationScenarios: string[]; targetCustomers: string[]; competitors: string[]; };
  sellingPoints?: { priceAdvantage: string; qualityAdvantage: string; deliveryAdvantage: string; serviceAdvantage: string; };
  techSpecs?: Record<string, string>; certifications?: string[]; patents?: string[];
  hsCode?: string; moq?: string; samplePolicy?: string; packagingInfo?: string; shippingMethods?: string[]; leadTime?: string; paymentTerms?: string[]; acceptedCurrencies?: string[]; incoterms?: string[];
  priceRange?: string; bulkDiscountPolicy?: string; oemOdmPolicy?: string;
  qualityControlProcess?: string; afterSalesService?: string; warrantyPolicy?: string; returnPolicy?: string;
  caseStudies?: Array<{ customer: string; industry: string; country?: string; painPoint: string; solution: string; result: string; testimonial?: string; }>;
  totalCustomersServed?: string; countriesExportedTo?: string[]; annualExportVolume?: string; keyClients?: string[]; exhibitionHistory?: string[];
  faq?: Array<{ question: string; answer: string; }>;
  emailStyle?: string; targetIndustries?: string[]; competitorAdvantages?: string;
  customSections?: Array<{ title: string; content: string; }>;
}

export async function getProductKnowledge(): Promise<{ success: boolean; data: ProductKnowledge | null }> {
  return request("/api/product-knowledge");
}

export async function saveProductKnowledge(data: ProductKnowledge): Promise<{ success: boolean; data: ProductKnowledge }> {
  return request("/api/product-knowledge", { method: "POST", body: JSON.stringify(data) });
}

// ── Quotation ─────────────────────────────────────────────────

export async function generateQuotation(params: {
  customerInfo: { company_name: string; contact_name: string; email: string };
  products: Array<{ name: string; specs: string; unitPrice: number; quantity: number; total: number }>;
  options?: { currency?: string; validUntil?: string; paymentTerms?: string; deliveryTerms?: string; notes?: string; language?: string };
}): Promise<any> {
  return request("/api/generate-quotation", { method: "POST", body: JSON.stringify(params) });
}

// ── Reply ─────────────────────────────────────────────────────

export async function generateReply(params: {
  customerEmail: string;
  customerStatus?: string;
  language?: string;
}): Promise<any> {
  return request("/api/generate-reply", { method: "POST", body: JSON.stringify(params) });
}

// ── Follow-ups ────────────────────────────────────────────────

export interface FollowupItem {
  customerId: number;
  customerName: string;
  email: string;
  lastEmailDate: string;
  lastEmailType: string;
  daysSinceLastContact: number;
  followupDue: string;
  suggestedAction: string;
}

export async function getFollowups(): Promise<{ success: boolean; data: FollowupItem[]; summary: { total: number; overdue: number; dueToday: number } }> {
  return request("/api/followups");
}

// ── Deal Score ────────────────────────────────────────────────

export async function getDealScore(customerId: number): Promise<any> {
  return request(`/api/deal-score/${customerId}`);
}

export async function refreshDealScore(customerId: number): Promise<any> {
  return request(`/api/deal-score/${customerId}`, { method: "POST" });
}

// ── Market Intel ──────────────────────────────────────────────

export async function getMarketIntel(): Promise<any> {
  return request("/api/market-intel");
}

export async function analyzeMarket(params: {
  market: string;
  industry: string;
  keywords?: string;
  compareMarket?: string;
  dateRange?: string;
  category?: string;
  context?: string;
}): Promise<any> {
  return request("/api/market-intel", { method: "POST", body: JSON.stringify(params) });
}

// ── Team ─────────────────────────────────────────────────────

export async function getTeamMembers(): Promise<any> {
  return request("/api/team");
}

export async function addTeamMember(email: string, role?: string): Promise<any> {
  return request("/api/team", { method: "POST", body: JSON.stringify({ email, role }) });
}

export async function removeTeamMember(id: string): Promise<any> {
  return request(`/api/team?id=${id}`, { method: "DELETE" });
}

// ── Dashboard Stats ──────────────────────────────────────────

export async function getDashboardStats(): Promise<any> {
  return request("/api/dashboard-stats");
}

// ── Gmail ────────────────────────────────────────────────────

export async function getGmailAuthUrl(): Promise<{ success: boolean; url?: string; message?: string }> {
  return request("/api/gmail/auth-url");
}

export async function getGmailStatus(): Promise<{ success: boolean; data: { connected: boolean; email: string | null; configured: boolean } }> {
  return request("/api/gmail/status");
}

export async function sendGmailEmail(params: { to: string; subject: string; content: string; customerId?: number }): Promise<{ success: boolean; data?: any; message?: string; waitSeconds?: number }> {
  return request("/api/gmail/send", { method: "POST", body: JSON.stringify(params) });
}
