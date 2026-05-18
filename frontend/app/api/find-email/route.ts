import { NextRequest, NextResponse } from "next/server";
import { findEmails } from "@/lib/hunter";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { company_domain } = body;

    if (!company_domain) {
      return NextResponse.json({ success: false, message: "company_domain is required" }, { status: 400 });
    }

    const results = await findEmails(company_domain);
    return NextResponse.json({ success: true, data: results });
  } catch (err: any) {
    console.error("Find email error:", err);
    return NextResponse.json({ success: false, message: err.message || "Find email failed" }, { status: 500 });
  }
}
