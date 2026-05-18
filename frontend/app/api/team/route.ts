import { NextRequest, NextResponse } from "next/server";
import { listTeamMembers, addTeamMember, removeTeamMember } from "@/lib/store";

export async function GET() {
  try {
    const members = listTeamMembers();
    return NextResponse.json({ success: true, data: members });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, role = "member" } = body;
    if (!email) {
      return NextResponse.json({ success: false, message: "email is required" }, { status: 400 });
    }
    const member = addTeamMember(email, role);
    return NextResponse.json({ success: true, data: member });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, message: "id is required" }, { status: 400 });
    }
    const ok = removeTeamMember(id);
    if (!ok) {
      return NextResponse.json({ success: false, message: "Member not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Member removed" });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
