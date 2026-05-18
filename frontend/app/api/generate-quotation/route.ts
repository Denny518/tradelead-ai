import { NextRequest, NextResponse } from "next/server";
import { generateQuotation } from "@/lib/deepseek";
import { getProductKnowledge } from "@/lib/store";

const USER_ID = "demo-user-001";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerInfo, products, options = {} } = body;

    if (!customerInfo || !products?.length) {
      return NextResponse.json({ success: false, message: "customerInfo and products are required" }, { status: 400 });
    }

    const pk = getProductKnowledge(USER_ID);
    const result = await generateQuotation(pk, customerInfo, products, {
      currency: options.currency || "USD",
      validUntil: options.validUntil || "30 days",
      paymentTerms: options.paymentTerms || "",
      deliveryTerms: options.deliveryTerms || "",
      notes: options.notes || "",
      language: options.language || "en",
    });

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    console.error("Generate quotation error:", err);
    return NextResponse.json({ success: false, message: err.message || "Failed" }, { status: 500 });
  }
}
