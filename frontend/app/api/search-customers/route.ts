import { NextRequest, NextResponse } from "next/server";
import { searchCustomers } from "@/lib/serpapi";
import { saveSearch } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      product,
      market = "United States",
      industry = "",
      limit = 10,
      role = "",
      companyType = "",
      customQuery = "",
      excludeKeywords = "",
    } = body;

    if (!product) {
      return NextResponse.json({ success: false, message: "Product is required" }, { status: 400 });
    }

    const results = await searchCustomers({
      product,
      market,
      industry,
      limit: Math.min(limit, 50),
      role,
      companyType,
      customQuery,
      excludeKeywords,
    });

    saveSearch({
      query: customQuery || `${product} ${market} ${industry} ${companyType} ${role}`.trim(),
      product,
      market,
      industry,
      results_count: results.length,
    });

    return NextResponse.json({ success: true, data: results, count: results.length });
  } catch (err: any) {
    console.error("Search error:", err);
    return NextResponse.json({ success: false, message: err.message || "Search failed" }, { status: 500 });
  }
}
