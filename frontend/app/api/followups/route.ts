import { NextResponse } from "next/server";
import { getFollowupList } from "@/lib/store";

export async function GET() {
  try {
    const list = getFollowupList();
    const overdue = list.filter((f) => f.followupDue === "overdue").length;
    const dueToday = list.filter((f) => ["day3", "day7", "day14"].includes(f.followupDue)).length;

    return NextResponse.json({
      success: true,
      data: list,
      summary: { total: list.length, overdue, dueToday },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
