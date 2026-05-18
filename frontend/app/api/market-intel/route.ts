import { NextRequest, NextResponse } from "next/server";
import { getMarketIntel, saveMarketIntel, getProductKnowledge } from "@/lib/store";

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
    const { market, industry } = body;

    if (!market || !industry) {
      return NextResponse.json({ success: false, message: "market and industry are required" }, { status: 400 });
    }

    if (!DEEPSEEK_API_KEY) {
      const mock = generateMockIntel(market, industry);
      saveMarketIntel(mock);
      return NextResponse.json({ success: true, data: mock });
    }

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
            content: `You are a market intelligence analyst specializing in international trade.

## Output Format
Return ONLY valid JSON:
{
  "trend": "growing",
  "growthRate": 15.5,
  "competitorData": {
    "majorCompetitors": ["Company A", "Company B"],
    "averagePriceRange": "$50-100/unit",
    "marketSaturation": "medium"
  },
  "recommendation": "Detailed recommendation for entering this market in 2-3 sentences",
  "opportunities": ["Opportunity 1", "Opportunity 2"],
  "risks": ["Risk 1", "Risk 2"]
}`,
          },
          {
            role: "user",
            content: `Analyze the market for "${industry}" products in "${market}".

Provide:
1. Market trend (growing/stable/declining) with estimated growth rate
2. Key competitors and market saturation level
3. Opportunities and risks for a new entrant
4. Strategic recommendation

Return JSON only.`,
          },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!resp.ok) throw new Error(`DeepSeek error: ${resp.status}`);
    const data = await resp.json();
    const content = data.choices?.[0]?.message?.content?.trim() || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : generateMockIntel(market, industry);

    const record = {
      id: `mi_${Date.now()}`,
      market,
      industry,
      ...result,
      createdAt: new Date().toISOString(),
    };
    saveMarketIntel(record);
    return NextResponse.json({ success: true, data: record });
  } catch (err: any) {
    console.error("Market intel error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

function generateMockIntel(market: string, industry: string) {
  const growingMarkets = ["Southeast Asia", "Middle East", "Latin America", "India"];
  const stableMarkets = ["United States", "Germany", "United Kingdom", "Japan"];
  const isGrowing = growingMarkets.some((m) => market.includes(m));
  const isStable = stableMarkets.some((m) => market.includes(m));

  return {
    id: `mi_${Date.now()}`,
    market,
    industry,
    trend: isGrowing ? "growing" : isStable ? "stable" : "declining",
    growthRate: isGrowing ? 12 + Math.random() * 20 : isStable ? 2 + Math.random() * 5 : -(Math.random() * 10),
    competitorData: {
      majorCompetitors: ["Local Market Leader", "International Brand A", "Regional Supplier B"],
      averagePriceRange: `$${Math.floor(Math.random() * 100)}-${Math.floor(Math.random() * 200 + 100)}/unit`,
      marketSaturation: isGrowing ? "low" : isStable ? "medium" : "high",
    },
    recommendation: isGrowing
      ? `The ${industry} market in ${market} is growing. Recommend prioritizing this market with competitive pricing and local partnerships.`
      : isStable
        ? `The ${industry} market in ${market} is mature but stable. Focus on differentiation and service quality.`
        : `The ${industry} market in ${market} is challenging. Consider niche segments or alternative markets.`,
    opportunities: isGrowing
      ? ["Growing demand", "Less competition", "Price premium potential"]
      : ["Established demand", "Reliable payment", "Quality-conscious buyers"],
    risks: isGrowing
      ? ["Currency fluctuation", "Logistics complexity", "Cultural barriers"]
      : ["Price competition", "Entry barriers", "Slow growth"],
    createdAt: new Date().toISOString(),
  };
}
