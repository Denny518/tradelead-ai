import { NextRequest, NextResponse } from "next/server";
import { getProductKnowledge, saveProductKnowledge, ProductKnowledge } from "@/lib/store";

const USER_ID = "demo-user-001";

export async function GET() {
  try {
    const pk = getProductKnowledge(USER_ID);
    return NextResponse.json({ success: true, data: pk });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: ProductKnowledge = await req.json();
    if (!body.productName) {
      return NextResponse.json({ success: false, message: "productName is required" }, { status: 400 });
    }
    const result = saveProductKnowledge(USER_ID, body);
    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
