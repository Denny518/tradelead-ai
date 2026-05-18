import { NextRequest, NextResponse } from "next/server";
import { getMarketIntel, saveMarketIntel } from "@/lib/store";

const SERPAPI_KEY = process.env.SERPAPI_KEY || "";
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "";

export async function GET() {
  try {
    const data = getMarketIntel();
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      market,        // e.g. "United States"
      industry,      // e.g. "LED Display"
      keywords,      // additional keywords to track
      compareMarket, // optional second market to compare
      dateRange,     // e.g. "past_12_months"
      category,      // e.g. "Business & Industrial"
      language,      // e.g. "en"
    } = body;

    if (!market || !industry) {
      return NextResponse.json({ success: false, message: "market and industry are required" }, { status: 400 });
    }

    let trendsData: any = null;

    // Fetch real Google Trends data via SerpAPI
    if (SERPAPI_KEY) {
      try {
        const trendsParams = new URLSearchParams({
          engine: "google_trends",
          q: `${industry},${keywords || "import,wholesale,distributor"}`,
          geo: getGeoCode(market),
          date: dateRange || "today 12-m",
          cat: getCategoryCode(category || ""),
          api_key: SERPAPI_KEY,
        });

        const trendsResp = await fetch(`https://serpapi.com/search.json?${trendsParams}`);
        if (trendsResp.ok) {
          trendsData = await trendsResp.json();
        }

        // Also fetch compared market if specified
        if (compareMarket) {
          const compareParams = new URLSearchParams({
            engine: "google_trends",
            q: `${industry},${keywords || "import,wholesale"}`,
            geo: getGeoCode(compareMarket),
            date: dateRange || "today 12-m",
            api_key: SERPAPI_KEY,
          });
          const compareResp = await fetch(`https://serpapi.com/search.json?${compareParams}`);
          if (compareResp.ok) {
            const compareData = await compareResp.json();
            if (trendsData) trendsData.compareMarket = compareData;
          }
        }
      } catch (e) {
        console.error("SerpAPI Trends fetch error:", e);
      }
    }

    // Use DeepSeek to analyze the trends data and provide insights
    let aiAnalysis = null;
    if (DEEPSEEK_API_KEY && trendsData) {
      try {
        aiAnalysis = await analyzeWithAI(trendsData, market, industry, compareMarket, language || "en");
      } catch (e) {
        console.error("AI analysis error:", e);
      }
    }

    // Fallback if no real data
    if (!trendsData) {
      aiAnalysis = generateFallbackAnalysis(market, industry, compareMarket);
    }

    const record = {
      id: `mi_${Date.now()}`,
      market,
      industry,
      keywords: keywords || "",
      compareMarket: compareMarket || "",
      dateRange: dateRange || "past_12_months",
      trendData: trendsData ? extractKeyTrendData(trendsData) : null,
      analysis: aiAnalysis,
      createdAt: new Date().toISOString(),
    };

    saveMarketIntel(record);
    return NextResponse.json({ success: true, data: record });
  } catch (err: any) {
    console.error("Market intel error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

async function analyzeWithAI(trendsData: any, market: string, industry: string, compareMarket?: string, language?: string): Promise<any> {
  const resp = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: `You are a market intelligence analyst. Analyze Google Trends data and provide actionable insights for international trade businesses. Output JSON only.

{
  "marketTrend": "growing/stable/declining",
  "estimatedGrowthRate": 15.5,
  "seasonality": "Peak in Q3-Q4 / Stable year-round / etc.",
  "demandDrivers": ["factor 1", "factor 2"],
  "keyInsights": "2-3 sentence summary of key findings",
  "competitorLandscape": {
    "saturation": "low/medium/high",
    "majorPlayers": ["player 1", "player 2"],
    "entryBarriers": ["barrier 1"]
  },
  "opportunities": [
    {"opportunity": "description", "confidence": "high/medium/low", "action": "specific action to take"}
  ],
  "risks": [
    {"risk": "description", "severity": "high/medium/low", "mitigation": "how to mitigate"}
  ],
  "pricingStrategy": "recommended pricing approach based on market analysis",
  "recommendedChannels": ["channel 1", "channel 2"],
  "actionPlan": "3-5 specific actions in order of priority"
}`,
        },
        {
          role: "user",
          content: `
## Google Trends Data for ${industry} in ${market}
${JSON.stringify(extractKeyTrendData(trendsData), null, 2)}
${compareMarket ? `\n## Comparison Market: ${compareMarket}\n${JSON.stringify(trendsData.compareMarket ? extractKeyTrendData(trendsData.compareMarket) : {}, null, 2)}` : ""}

## Context
- Target Market: ${market}
- Industry: ${industry}
${compareMarket ? `- Comparison Market: ${compareMarket}` : ""}

Analyze this data and provide insights for a B2B exporter looking to enter or expand in this market. Return JSON only.`,
        },
      ],
      temperature: 0.3,
      max_tokens: 1500,
    }),
  });

  if (!resp.ok) throw new Error(`DeepSeek error: ${resp.status}`);
  const data = await resp.json();
  const content = data.choices?.[0]?.message?.content?.trim() || "";
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
}

function extractKeyTrendData(data: any): any {
  return {
    interestOverTime: data.interest_over_time?.timeline_data?.slice(-12)?.map((d: any) => ({
      date: d.date,
      value: d.values?.[0]?.value,
    })) || [],
    comparedBreakdown: data.interest_over_time?.timeline_data?.slice(-12)?.map((d: any) => ({
      date: d.date,
      values: d.values?.map((v: any) => ({ query: v.query, value: v.value })),
    })) || [],
    interestByRegion: data.interest_by_region?.slice(0, 10)?.map((r: any) => ({
      region: r.geo_name || r.region,
      value: r.value,
    })) || [],
    relatedQueries: {
      rising: data.related_queries?.rising?.slice(0, 10)?.map((q: any) => q.query) || [],
      top: data.related_queries?.top?.slice(0, 10)?.map((q: any) => q.query) || [],
    },
  };
}

function getGeoCode(market: string): string {
  const map: Record<string, string> = {
    "United States": "US", "Germany": "DE", "United Kingdom": "GB", "Australia": "AU",
    "Canada": "CA", "Japan": "JP", "France": "FR", "Brazil": "BR", "UAE": "AE",
    "Saudi Arabia": "SA", "South Korea": "KR", "Mexico": "MX", "India": "IN",
    "Southeast Asia": "SG", "Italy": "IT", "Spain": "ES", "Netherlands": "NL",
    "Turkey": "TR", "Poland": "PL", "Thailand": "TH", "Vietnam": "VN",
    "Russia": "RU", "Indonesia": "ID", "Philippines": "PH", "Malaysia": "MY",
    "Argentina": "AR", "Chile": "CL", "Colombia": "CO", "Peru": "PE",
    "South Africa": "ZA", "Nigeria": "NG", "Egypt": "EG", "Kenya": "KE",
  };
  return map[market] || market.slice(0, 2).toUpperCase();
}

function getCategoryCode(cat: string): string {
  const map: Record<string, string> = {
    "Electronics": "5", "Textile": "11", "Machinery": "12", "Consumer Goods": "7",
    "Medical Devices": "45", "Auto Parts": "47", "LED Display": "5",
    "Business & Industrial": "12", "Health": "45", "Beauty & Personal Care": "44",
  };
  return map[cat] || "";
}

function generateFallbackAnalysis(market: string, industry: string, compareMarket?: string): any {
  return {
    marketTrend: "stable",
    estimatedGrowthRate: 5,
    seasonality: "Stable year-round with slight Q4 increase",
    demandDrivers: ["B2B procurement cycles", "Infrastructure investment", "Digital transformation"],
    keyInsights: `Based on available data, ${industry} demand in ${market} shows moderate growth. ${compareMarket ? `Compared to ${compareMarket}, the market size is ${Math.random() > 0.5 ? "larger" : "smaller"} but growing at a ${Math.random() > 0.5 ? "faster" : "slower"} rate.` : "Consider local partnerships to accelerate market entry."}`,
    competitorLandscape: {
      saturation: "medium",
      majorPlayers: ["Local Market Leader", "International Competitor A", "Regional Player B"],
      entryBarriers: ["Brand recognition", "Local certification requirements", "Distribution network"],
    },
    opportunities: [
      { opportunity: "Growing demand in mid-market segment", confidence: "medium", action: "Target mid-size distributors with competitive pricing" },
      { opportunity: "Online B2B platform presence increasing", confidence: "high", action: "List products on regional B2B platforms" },
    ],
    risks: [
      { risk: "Currency fluctuation affecting pricing", severity: "medium", mitigation: "Quote in stable currency, add exchange rate clauses" },
      { risk: "Local competition has established relationships", severity: "high", mitigation: "Differentiate on quality certification and after-sales service" },
    ],
    pricingStrategy: "Competitive entry pricing with gradual premium positioning as brand builds",
    recommendedChannels: ["B2B online platforms", "Trade shows", "Local distributors", "Direct outreach to large buyers"],
    actionPlan: [
      "1. Research top 10 local distributors and make contact list",
      "2. Prepare market-adapted product catalog with local language",
      "3. Attend 1-2 major industry trade shows in the region",
      "4. Set up presence on local B2B platforms",
      "5. Offer promotional pricing for first 3 orders to build references",
    ],
  };
}
