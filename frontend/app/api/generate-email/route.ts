import { NextRequest, NextResponse } from "next/server";
import { generateEmails } from "@/lib/deepseek";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { product_info, customer_info, email_type = "initial" } = body;

    const result = await generateEmails(product_info, customer_info, email_type);
    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    console.error("Generate email error:", err);
    return NextResponse.json({ success: false, message: err.message || "Generate email failed" }, { status: 500 });
  }
}
