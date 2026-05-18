import { NextRequest, NextResponse } from "next/server";
import { generateReply } from "@/lib/deepseek";
import { getProductKnowledge } from "@/lib/store";

const USER_ID = "demo-user-001";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerEmail, customerStatus = "new inquiry", language = "en" } = body;

    if (!customerEmail) {
      return NextResponse.json({ success: false, message: "customerEmail is required" }, { status: 400 });
    }

    const pk = getProductKnowledge(USER_ID);
    const result = await generateReply(pk, customerEmail, customerStatus, language);
    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    console.error("Generate reply error:", err);
    return NextResponse.json({ success: false, message: err.message || "Failed" }, { status: 500 });
  }
}
