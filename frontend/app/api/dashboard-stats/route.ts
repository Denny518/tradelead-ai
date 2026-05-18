import { NextResponse } from "next/server";
import { getDashboardStats, getFollowupList } from "@/lib/store";

export async function GET() {
  try {
    const stats = getDashboardStats();
    const followups = getFollowupList();
    return NextResponse.json({
      success: true,
      data: {
        ...stats,
        followupsDue: followups.filter((f) => f.followupDue !== "none").length,
        overdueFollowups: followups.filter((f) => f.followupDue === "overdue").length,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
