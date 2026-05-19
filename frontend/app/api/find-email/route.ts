import { NextRequest, NextResponse } from "next/server";
import { findEmails } from "@/lib/hunter";
import { findCompanyWebsite } from "@/lib/search-engines";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { company_domain } = body;
    const { company_name, address, source } = body;

    // For LinkedIn results: use possible company name from address field, not person name
    const searchCompanyName = source === "linkedin" && address ? address : company_name;

    // If no domain but we have a company name, try to find their website
    if ((!company_domain || company_domain.trim() === "") && (searchCompanyName || company_name)) {
      const nameToSearch = searchCompanyName || company_name;
      const found = await findCompanyWebsite(nameToSearch, source !== "linkedin" ? address : "");
      if (!found) {
        return NextResponse.json({
          success: false,
          message: source === "linkedin"
            ? `无法自动找到 ${nameToSearch} 的公司官网。请手动输入公司域名重试。`
            : `无法自动找到 ${nameToSearch} 的官网。请手动输入域名重试。`,
          needsManualDomain: true,
        }, { status: 404 });
      }
      company_domain = found;
    }

    if (!company_domain || company_domain.trim() === "") {
      return NextResponse.json({ success: false, message: "company_domain is required" }, { status: 400 });
    }

    // Clean the domain
    company_domain = company_domain.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0].trim();

    const results = await findEmails(company_domain);

    if (!results || results.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        note: `Hunter.io 在 ${company_domain} 未找到公开邮箱。建议访问该公司网站的 Contact 页面手动查找。`,
      });
    }

    return NextResponse.json({ success: true, data: results });
  } catch (err: any) {
    console.error("Find email error:", err);
    return NextResponse.json({ success: false, message: err.message || "Find email failed" }, { status: 500 });
  }
}
