import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>
              <span className="font-bold text-white">TradeLead<span className="text-blue-400">AI</span></span>
            </div>
            <p className="text-sm leading-relaxed">AI 成交辅助系统<br/>从找客户到签单，全程 AI 辅助</p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-medium text-sm mb-4">产品</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#features" className="hover:text-white transition-colors">核心功能</a></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">免费试用</Link></li>
            </ul>
          </div>

          {/* Use cases */}
          <div>
            <h4 className="text-white font-medium text-sm mb-4">适用场景</h4>
            <ul className="space-y-2 text-sm">
              <li><span className="hover:text-white transition-colors cursor-default">外贸企业获客</span></li>
              <li><span className="hover:text-white transition-colors cursor-default">跨境电商 B2B</span></li>
              <li><span className="hover:text-white transition-colors cursor-default">海外市场拓展</span></li>
              <li><span className="hover:text-white transition-colors cursor-default">销售团队提效</span></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-medium text-sm mb-4">支持</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#faq" className="hover:text-white transition-colors">常见问题</a></li>
              <li><span className="cursor-default">contact@tradelead.ai</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <p>&copy; 2026 TradeLead AI. All rights reserved.</p>
          <p>AI 成交辅助系统 — 帮你成交更多外贸订单</p>
        </div>
      </div>
    </footer>
  );
}
