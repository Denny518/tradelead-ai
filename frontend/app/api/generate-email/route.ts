import { NextRequest, NextResponse } from "next/server";
import { generateEmails } from "@/lib/deepseek";
import { getProductKnowledge } from "@/lib/store";

const USER_ID = "demo-user-001";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { product_info, customer_info, email_type = "initial", language = "en" } = body;

    // Use product knowledge from store if available
    const pk = getProductKnowledge(USER_ID);

    const result = await generateEmails(pk, customer_info, email_type, language);
    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    console.error("Generate email error:", err);
    return NextResponse.json({ success: false, message: err.message || "Failed" }, { status: 500 });
  }
}
