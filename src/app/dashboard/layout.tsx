"use client";

import React, { useState } from "react";
import { UserButton, useClerk, Show } from "@clerk/nextjs";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Globe, 
  Github, 
  Smartphone, 
  Layers, 
  Table as SheetsIcon, 
  Trello, 
  CreditCard, 
  User, 
  LogOut,
  Menu,
  X,
  ChevronRight
} from "lucide-react";

const SIDEBAR_ITEMS = [
  { icon: Globe, label: "Website Clone Generator", href: "/dashboard/website-gen" },
  { icon: Github, label: "GitHub Clone Generator", href: "/dashboard/github-gen" },
  { icon: Smartphone, label: "App APK Generator", href: "/dashboard/app-apk" },
  { icon: Layers, label: "Compare UI", href: "/dashboard/compare-ui" },
  { icon: SheetsIcon, label: "Sheets Integration", href: "/dashboard/sheets" },
  { icon: Trello, label: "Connect JIRA", href: "/dashboard/jira" },
  { icon: CreditCard, label: "Active Subscriptions", href: "/dashboard/subscriptions" },
  { icon: User, label: "Profile", href: "/dashboard/profile" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { signOut } = useClerk();

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="h-16 border-b border-zinc-800 bg-[#0a0a0a]/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors lg:hidden"
          >
            <Menu size={20} />
          </button>
          <Link href="/dashboard" className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
            TestGen
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/dashboard/plans" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            Plans
          </Link>
          <div className="h-4 w-[1px] bg-zinc-800" />
          <div className="flex items-center gap-3">
            <UserButton />
            <button 
              onClick={() => signOut()}
              className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors group"
            >
              Logout
              <LogOut size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Side Navigation */}
        <aside 
          className={`
            fixed lg:static inset-y-0 left-0 z-40
            w-72 bg-[#0a0a0a] border-r border-zinc-800 transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:hidden"}
          `}
        >
          <nav className="h-full flex flex-col py-6 px-4">
            <div className="space-y-1">
              {SIDEBAR_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center justify-between group px-4 py-3 rounded-xl hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-all text-zinc-400 hover:text-white"
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={18} className="group-hover:text-indigo-400 transition-colors" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-zinc-600" />
                </Link>
              ))}
            </div>

            <div className="mt-auto pt-6 border-t border-zinc-900">
               <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-600/10 to-purple-600/10 border border-indigo-500/20">
                  <h4 className="text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-2">Pro Plan Active</h4>
                  <p className="text-[11px] text-zinc-500 leading-relaxed mb-3">You have 4,200 credits remaining for this month.</p>
                  <button className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold rounded-lg transition-colors">
                    Upgrade Access
                  </button>
               </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-[#050505] relative">
          {/* Glassy Background Ornament */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="p-8 relative z-10">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
