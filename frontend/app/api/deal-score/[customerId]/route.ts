import { NextRequest, NextResponse } from "next/server";
import { getCustomer, listEmailsForCustomer, getDealScore, saveDealScore, listCustomers } from "@/lib/store";
import { getProductKnowledge } from "@/lib/store";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "";

// ── GET existing score ─────────────────────────────────────
export async function GET(_req: NextRequest, { params }: { params: Promise<{ customerId: string }> }) {
  try {
    const { customerId } = await params;
    const score = getDealScore(parseInt(customerId));
    if (!score) {
      return NextResponse.json({ success: true, data: null });
    }
    return NextResponse.json({ success: true, data: score });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// ── POST refresh score ─────────────────────────────────────
export async function POST(_req: NextRequest, { params }: { params: Promise<{ customerId: string }> }) {
  try {
    const { customerId } = await params;
    const cid = parseInt(customerId);
    const customer = getCustomer(cid);
    if (!customer) {
      return NextResponse.json({ success: false, message: "Customer not found" }, { status: 404 });
    }

    const emails = listEmailsForCustomer(cid);
    const allCustomers = listCustomers({}).data;
    const wonDeals = allCustomers.filter((c) => c.status === "won").length;

    if (!DEEPSEEK_API_KEY) {
      // Mock score
      const score = mockDealScore(customer, emails.length);
      saveDealScore(score);
      return NextResponse.json({ success: true, data: score });
    }

    const emailSummary = emails.map((e) => ({
      subject: e.subject,
      type: e.email_type,
      date: e.created_at,
    }));

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
            content: `You are an expert B2B sales analyst. Analyze the probability of closing a deal.

## Output Format
Return ONLY valid JSON:
{
  "probability": 75,
  "factors": [
    {"factor": "Communication frequency", "impact": "positive"},
    {"factor": "Customer responsiveness", "impact": "neutral"}
  ],
  "recommendation": "Specific actionable advice in 1-2 sentences"
}

## Scoring Guidelines
- Multiple email exchanges = higher probability
- Customer replied = much higher probability
- Long time since last contact = lower probability
- Consider industry benchmarks: average B2B cold email reply rate is 5-10%`,
          },
          {
            role: "user",
            content: `## Customer
- Company: ${customer.company_name}
- Status: ${customer.status}
- Match Score: ${customer.match_score}
- Days since first contact: estimated

## Communication History (${emails.length} emails)
${JSON.stringify(emailSummary, null, 2)}

## Context
- Total customers in CRM: ${allCustomers.length}
- Won deals: ${wonDeals}

Analyze the deal probability. Return JSON only.`,
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
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : mockDealScore(customer, emails.length);

    const dealScore = {
      customerId: cid,
      companyName: customer.company_name,
      ...result,
      analyzedAt: new Date().toISOString(),
    };

    saveDealScore(dealScore);
    return NextResponse.json({ success: true, data: dealScore });
  } catch (err: any) {
    console.error("Deal score error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

function mockDealScore(customer: any, emailCount: number) {
  let probability = 30;
  if (customer.status === "replied") probability = 55;
  if (customer.status === "quoted") probability = 65;
  if (customer.status === "won") probability = 100;
  if (emailCount >= 3) probability += 10;
  if (customer.match_score >= 80) probability += 10;

  return {
    customerId: customer.id,
    companyName: customer.company_name,
    probability: Math.min(probability, 99),
    factors: [
      { factor: "沟通频率", impact: emailCount >= 3 ? "positive" : "negative" },
      { factor: "客户匹配度", impact: customer.match_score >= 80 ? "positive" : "neutral" },
      { factor: "当前状态", impact: customer.status === "replied" ? "positive" : "neutral" },
      { factor: "邮件往来次数", impact: emailCount >= 2 ? "positive" : "neutral" },
    ],
    recommendation: probability >= 70
      ? "高概率成交客户，建议本周内跟进并提供限时优惠"
      : probability >= 40
        ? "中等概率，建议发送案例研究或产品演示来推进"
        : "低概率，建议批量跟进或重新评估客户匹配度",
    analyzedAt: new Date().toISOString(),
  };
}
