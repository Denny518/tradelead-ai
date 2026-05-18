const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BACKEND_URL}${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API error ${res.status}: ${err}`);
  }
  return res.json();
}

// ── Search ──────────────────────────────────────────────────────
export interface SearchParams {
  product: string;
  market: string;
  industry?: string;
  limit?: number;
}

export interface SearchResultItem {
  company_name: string;
  website: string;
  description: string;
  match_score: number;
}

export interface SearchResponse {
  success: boolean;
  data: SearchResultItem[];
  count: number;
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
}

export async function findEmail(companyDomain: string): Promise<FindEmailResponse> {
  return request("/api/find-email", {
    method: "POST",
    body: JSON.stringify({ company_domain: companyDomain }),
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
}

export interface EmailVersion {
  subject: string;
  content: string;
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
  return `${BACKEND_URL}/api/customers/export-csv?${params.toString()}`;
}
