import { NextRequest, NextResponse } from "next/server";
import { listCustomers, createCustomer } from "@/lib/store";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get("status") || "";
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const offset = parseInt(url.searchParams.get("offset") || "0");

    const result = listCustomers({ status: status || undefined, limit, offset });
    return NextResponse.json({ success: true, data: result.data, count: result.count });
  } catch (err: any) {
    console.error("List customers error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const customer = createCustomer(body);
    return NextResponse.json(customer, { status: 201 });
  } catch (err: any) {
    console.error("Create customer error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
