import { NextRequest, NextResponse } from "next/server";
import { searchSocialSignals } from "@/lib/social-signals";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { keyword, channels = ["reddit"], limit = 10 } = body;

    if (!keyword) {
      return NextResponse.json({ success: false, message: "keyword is required" }, { status: 400 });
    }

    const results = await searchSocialSignals(keyword, channels, limit);
    return NextResponse.json({ success: true, data: results, count: results.length });
  } catch (err: any) {
    console.error("Social signals error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
