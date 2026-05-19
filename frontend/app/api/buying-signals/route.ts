import { NextRequest, NextResponse } from "next/server";
import { searchBuyingSignals } from "@/lib/search-engines";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { product, market, industry = "" } = body;

    if (!product || !market) {
      return NextResponse.json({ success: false, message: "product and market are required" }, { status: 400 });
    }

    const signals = await searchBuyingSignals({ product, market, industry });
    return NextResponse.json({ success: true, data: signals, count: signals.length });
  } catch (err: any) {
    console.error("Buying signals error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
