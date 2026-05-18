import { NextRequest, NextResponse } from "next/server";
import { listCustomers, listEmailsForCustomer } from "@/lib/store";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const period = url.searchParams.get("period") || "month"; // today | week | month
    const fromStr = url.searchParams.get("from");
    const toStr = url.searchParams.get("to");

    const now = new Date();
    let startDate: Date;

    if (fromStr && toStr) {
      startDate = new Date(fromStr);
    } else {
      switch (period) {
        case "today":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case "week":
          startDate = new Date(now.getTime() - 7 * 86400000);
          break;
        case "month":
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
      }
    }

    const { data: allCustomers } = listCustomers({ limit: 99999 });
    const endDate = toStr ? new Date(toStr) : now;

    // Filter by period
    const periodCustomers = allCustomers.filter((c) => {
      const d = new Date(c.created_at);
      return d >= startDate && d <= endDate;
    });

    // Aggregate
    const totalCustomers = allCustomers.length;
    const newCustomers = periodCustomers.length;
    const newToday = allCustomers.filter((c) => {
      const d = new Date(c.created_at);
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return d >= todayStart;
    }).length;

    // Status breakdown
    const statusBreakdown: Record<string, number> = {};
    for (const c of allCustomers) {
      statusBreakdown[c.status] = (statusBreakdown[c.status] || 0) + 1;
    }

    const wonTotal = statusBreakdown["won"] || 0;
    const wonPeriod = periodCustomers.filter((c) => c.status === "won").length;
    const repliedTotal = statusBreakdown["replied"] || 0;
    const sentTotal = statusBreakdown["sent"] || 0;

    // Emails
    let totalEmailsSent = 0;
    let periodEmailsSent = 0;
    let todayEmailsSent = 0;
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    for (const c of allCustomers) {
      const emails = listEmailsForCustomer(c.id);
      totalEmailsSent += emails.length;
      for (const e of emails) {
        const ed = new Date(e.created_at);
        if (ed >= startDate && ed <= endDate) periodEmailsSent++;
        if (ed >= todayStart) todayEmailsSent++;
      }
    }

    // Follow-ups due
    const followupsDue = allCustomers.filter((c) => {
      if (c.status === "won" || c.status === "lost") return false;
      const emails = listEmailsForCustomer(c.id);
      if (emails.length === 0) return false;
      const lastEmail = emails.reduce((latest, e) =>
        new Date(e.created_at) > new Date(latest.created_at) ? e : latest
      );
      const days = Math.floor((now.getTime() - new Date(lastEmail.created_at).getTime()) / 86400000);
      return days >= 3;
    }).length;

    // Conversion rate
    const conversionRate = totalCustomers > 0
      ? ((wonTotal / (totalCustomers - (statusBreakdown["lost"] || 0))) * 100).toFixed(1)
      : "0";

    // Daily timeline for chart (last 14 days)
    const dailyTimeline: Array<{ date: string; customers: number; emails: number; won: number }> = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const ds = d.toISOString().slice(0, 10);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(dayStart.getTime() + 86400000);

      const dayCustomers = allCustomers.filter((c) => {
        const cd = new Date(c.created_at);
        return cd >= dayStart && cd < dayEnd;
      }).length;

      let dayEmails = 0;
      let dayWon = 0;
      for (const c of allCustomers) {
        const emails = listEmailsForCustomer(c.id);
        dayEmails += emails.filter((e) => {
          const ed = new Date(e.created_at);
          return ed >= dayStart && ed < dayEnd;
        }).length;
        if (c.status === "won") {
          const cd = new Date(c.updated_at);
          if (cd >= dayStart && cd < dayEnd) dayWon++;
        }
      }

      dailyTimeline.push({ date: ds, customers: dayCustomers, emails: dayEmails, won: dayWon });
    }

    return NextResponse.json({
      success: true,
      data: {
        period,
        totalCustomers,
        newCustomers,
        newToday,
        totalEmailsSent,
        periodEmailsSent,
        todayEmailsSent,
        wonTotal,
        wonPeriod,
        repliedTotal,
        sentTotal,
        followupsDue,
        conversionRate,
        statusBreakdown,
        dailyTimeline,
        quotaUsed: totalEmailsSent, // mock quota
        quotaLimit: 200,           // monthly email quota
        quotaSearchesUsed: allCustomers.length, // mock
        quotaSearchesLimit: 500,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
