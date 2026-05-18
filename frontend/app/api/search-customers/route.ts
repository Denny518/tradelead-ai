import { NextRequest, NextResponse } from "next/server";
import { searchCustomers } from "@/lib/serpapi";
import { multiSearch, SearchResult } from "@/lib/search-engines";
import { saveSearch } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      product, market = "United States", industry = "", limit = 10,
      role = "", companyType = "", customQuery = "", excludeKeywords = "",
      engine = "google",
      // Maps
      mapsLocation = "", mapsRadius = "",
      // Shopping
      shoppingPriceRange = "",
      // News
      newsTimeframe = "",
      // Bing
      bingMarket = "",
    } = body;

    if (!product) {
      return NextResponse.json({ success: false, message: "Product is required" }, { status: 400 });
    }

    const searchOpts = {
      product, market, industry, limit, role, companyType, customQuery, excludeKeywords,
      mapsLocation, mapsRadius, shoppingPriceRange, newsTimeframe, bingMarket,
    };

    let results: SearchResult[];

    if (engine === "google") {
      // Original Google Search
      results = await searchCustomers(searchOpts);
    } else if (engine === "all") {
      // Multi-engine parallel search
      const allResults = await Promise.all([
        searchCustomers(searchOpts).catch(() => [] as SearchResult[]),
        multiSearch({ ...searchOpts, engine: "google_maps" }).catch(() => [] as SearchResult[]),
        multiSearch({ ...searchOpts, engine: "google_local" }).catch(() => [] as SearchResult[]),
        multiSearch({ ...searchOpts, engine: "google_news" }).catch(() => [] as SearchResult[]),
        multiSearch({ ...searchOpts, engine: "bing" }).catch(() => [] as SearchResult[]),
      ]);
      // Merge and deduplicate by website
      const seen = new Set<string>();
      results = [];
      for (const batch of allResults) {
        for (const r of batch) {
          const key = r.website || r.company_name;
          if (!seen.has(key)) { seen.add(key); results.push(r); }
        }
      }
    } else {
      // Specific alternative engine
      results = await multiSearch({ ...searchOpts, engine: engine as any });
    }

    saveSearch({
      query: customQuery || `${product} ${market} ${industry} [${engine}]`.trim(),
      product, market, industry,
      results_count: results.length,
    });

    return NextResponse.json({
      success: true,
      data: results,
      count: results.length,
      engine,
    });
  } catch (err: any) {
    console.error("Search error:", err);
    return NextResponse.json({ success: false, message: err.message || "Search failed" }, { status: 500 });
  }
}
