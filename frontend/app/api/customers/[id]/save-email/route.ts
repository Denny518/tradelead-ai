import { NextRequest, NextResponse } from "next/server";
import { getCustomer, updateCustomer, saveEmail } from "@/lib/store";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const customerId = parseInt(id);
    const body = await req.json();
    const { subject, content, version = 1, email_type = "initial" } = body;

    const customer = getCustomer(customerId);
    if (!customer) {
      return NextResponse.json({ success: false, message: "Customer not found" }, { status: 404 });
    }

    saveEmail({ customer_id: customerId, subject, content, version, email_type });

    if (customer.status === "new") {
      updateCustomer(customerId, { status: "sent" });
    }

    return NextResponse.json({ success: true, message: "Email saved and status updated" });
  } catch (err: any) {
    console.error("Save email error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
