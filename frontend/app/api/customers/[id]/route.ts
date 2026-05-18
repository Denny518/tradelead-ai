import { NextRequest, NextResponse } from "next/server";
import { getCustomer, updateCustomer, deleteCustomer } from "@/lib/store";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const customer = getCustomer(parseInt(id));
    if (!customer) {
      return NextResponse.json({ success: false, message: "Customer not found" }, { status: 404 });
    }
    return NextResponse.json(customer);
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const customer = updateCustomer(parseInt(id), body);
    if (!customer) {
      return NextResponse.json({ success: false, message: "Customer not found" }, { status: 404 });
    }
    return NextResponse.json(customer);
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ok = deleteCustomer(parseInt(id));
    if (!ok) {
      return NextResponse.json({ success: false, message: "Customer not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Customer deleted" });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
