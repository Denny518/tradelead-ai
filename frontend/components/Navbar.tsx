"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-200">
              <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <span className="font-bold text-lg text-gray-900">TradeLead<span className="text-blue-600">AI</span></span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">核心功能</a>
            <a href="#scenarios" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">应用场景</a>
            <a href="#how-it-works" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">如何使用</a>
            <a href="#faq" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">常见问题</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/dashboard" className="px-5 py-2.5 text-sm font-medium bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all shadow-sm">
              免费试用
            </Link>
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-gray-600 hover:text-gray-900">
            {open ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/></svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t border-gray-100 py-4 space-y-3">
            <a href="#features" onClick={() => setOpen(false)} className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">核心功能</a>
            <a href="#scenarios" onClick={() => setOpen(false)} className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">应用场景</a>
            <a href="#how-it-works" onClick={() => setOpen(false)} className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">如何使用</a>
            <a href="#faq" onClick={() => setOpen(false)} className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">常见问题</a>
            <Link href="/dashboard" className="block px-3 py-2.5 text-sm font-medium bg-gray-900 text-white rounded-xl text-center">免费试用</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
