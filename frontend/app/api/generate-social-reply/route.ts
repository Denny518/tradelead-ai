import { NextRequest, NextResponse } from "next/server";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { post_content, post_platform, product_info } = body;

    if (!post_content) {
      return NextResponse.json({ success: false, message: "post_content is required" }, { status: 400 });
    }

    if (!DEEPSEEK_API_KEY) {
      return NextResponse.json({
        success: true,
        data: {
          reply: `Hi, I specialize in ${product_info || "this product"}. I'd be happy to discuss your requirements. Feel free to DM me for a quote or catalog!`,
        },
      });
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
            content: `You are a helpful B2B sales professional writing a reply on ${post_platform || "social media"}.

## Rules
1. Be GENUINE and HELPFUL, not sales-y
2. Keep it short — 2-4 sentences max
3. Match the platform tone: Reddit=conversational, LinkedIn=professional, Bluesky/X=casual
4. Add value first (answer a question, share insight), then subtly mention your product
5. Include a call to action (DM for details, share catalog, etc.)
6. NEVER sound like a bot — use natural language, occasional imperfection is OK
7. Output ONLY the reply text, no JSON, no quotes around it`,
          },
          {
            role: "user",
            content: `## The Post (on ${post_platform || "social media"})
${post_content}

## My Product
${product_info || "B2B products with competitive pricing"}

Write a natural, helpful reply. Just the reply text, nothing else.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!resp.ok) throw new Error(`DeepSeek error: ${resp.status}`);
    const data = await resp.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || "";

    return NextResponse.json({ success: true, data: { reply } });
  } catch (err: any) {
    console.error("Generate reply error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
