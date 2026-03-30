"use client";

import Link from "next/link";
import { 
  Globe, 
  Github, 
  Layers, 
  Zap, 
  Activity, 
  ArrowUpRight, 
  ShieldCheck, 
  Clock,
  ChevronRight,
  TrendingUp,
  Box,
  Smartphone
} from "lucide-react";

export default function DashboardOverview() {
  const QUICK_ACTIONS = [
    {
      title: "Website Clone Generator",
      description: "Generate test cases from any public URL using AI vision analysis.",
      icon: Globe,
      href: "/dashboard/website-gen",
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      border: "border-blue-400/20"
    },
    {
      title: "GitHub Repo Analysis",
      description: "Deep-scan repositories to map features and generate unit/E2E tests.",
      icon: Github,
      href: "/dashboard/github-gen",
      color: "text-purple-400",
      bg: "bg-purple-400/10",
      border: "border-purple-400/20"
    },
    {
      title: "UI Comparator",
      description: "Pixel-perfect visual regression testing with AI discrepancy analysis.",
      icon: Layers,
      href: "/dashboard/compare-ui",
      color: "text-indigo-400",
      bg: "bg-indigo-400/10",
      border: "border-indigo-400/20"
    },
    {
      title: "APK Test Generator",
      description: "Extract features from Android APKs and generate requirements-based test plans.",
      icon: Smartphone,
      href: "/dashboard/app-apk",
      color: "text-green-400",
      bg: "bg-green-400/10",
      border: "border-green-400/20"
    }
  ];

  const STATS = [
    { label: "Total Tests Generated", value: "1,284", icon: Zap, trend: "+12%" },
    { label: "Critical Bugs Caught", value: "42", icon: ShieldCheck, trend: "+5%" },
    { label: "Avg. Generation Time", value: "45s", icon: Clock, trend: "-8%" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Welcome Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a0a0a] to-[#111] border border-zinc-800 p-10">
        <div className="absolute top-0 right-0 p-10 opacity-10 blur-2xl">
           <TrendingUp size={200} className="text-indigo-500" />
        </div>
        
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
            <Activity size={12} />
            System Status: Optimal
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight leading-tight">
            Welcome back to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">TestGen</span>
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed">
            Your AI-powered QA command center is ready. Start a new generation or review your recent visual regression tests.
          </p>
          <div className="flex items-center gap-4 pt-4">
             <Link href="/dashboard/website-gen" className="px-6 py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-colors flex items-center gap-2">
               New Generation <ArrowUpRight size={16} />
             </Link>
             <button className="px-6 py-3 rounded-xl bg-zinc-900 text-white font-bold text-sm border border-zinc-800 hover:bg-zinc-800 transition-colors">
               View All Tests
             </button>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid md:grid-cols-3 gap-6">
        {STATS.map((stat, i) => (
          <div key={i} className="p-6 rounded-2xl bg-[#0a0a0a] border border-zinc-800 hover:border-zinc-700 transition-all group">
            <div className="flex items-center justify-between mb-4">
               <div className="p-3 rounded-xl bg-zinc-900 text-zinc-400 group-hover:text-indigo-400 transition-colors">
                  <stat.icon size={24} />
               </div>
               <span className={`text-xs font-bold px-2 py-1 rounded-lg ${stat.trend.startsWith('+') ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'}`}>
                 {stat.trend}
               </span>
            </div>
            <p className="text-zinc-500 text-sm font-medium">{stat.label}</p>
            <h3 className="text-3xl font-bold text-white mt-1">{stat.value}</h3>
          </div>
        ))}
      </section>

      {/* Quick Access */}
      <section className="space-y-6">
        <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-3">
          <Box size={16} className="text-indigo-500" />
          Intelligence Modules
        </h2>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {QUICK_ACTIONS.map((action, i) => (
            <Link 
              key={i} 
              href={action.href}
              className="group relative p-8 rounded-3xl bg-[#0a0a0a] border border-zinc-800 hover:border-zinc-600 transition-all overflow-hidden flex flex-col h-full"
            >
              <div className={`w-14 h-14 rounded-2xl ${action.bg} ${action.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <action.icon size={28} />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors">{action.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed flex-1">
                {action.description}
              </p>
              
              <div className="mt-8 pt-6 border-t border-zinc-900 flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-600 group-hover:text-white transition-colors">Launch Module</span>
                <ChevronRight size={16} className="text-zinc-700 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
              
              {/* Background gradient on hover */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-gradient-to-tr ${action.bg.replace('/10', '/5')} to-transparent`} />
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Activity (Mocked) */}
      <section className="p-8 rounded-3xl bg-[#0a0a0a] border border-zinc-800">
         <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-white">Recent Activity Stream</h2>
            <button className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">View All Logs</button>
         </div>
         
         <div className="space-y-6">
            {[
              { type: 'Generation', target: 'login.test.ts', status: 'Completed', time: '2m ago', color: 'bg-green-500' },
              { type: 'Visual Diff', target: 'Header Component', status: '3 issues', time: '15m ago', color: 'bg-amber-500' },
              { type: 'GitHub Sync', target: 'QAForge/frontend', status: 'Success', time: '1h ago', color: 'bg-blue-500' },
            ].map((activity, i) => (
              <div key={i} className="flex items-center justify-between py-4 border-b border-zinc-900 last:border-0 hover:px-2 transition-all rounded-lg hover:bg-zinc-900/40">
                <div className="flex items-center gap-4">
                   <div className={`w-2 h-2 rounded-full ${activity.color}`} />
                   <div>
                      <p className="text-sm font-bold text-white">{activity.type}: <span className="text-zinc-500 font-normal">{activity.target}</span></p>
                      <p className="text-[10px] text-zinc-600 mt-1 uppercase tracking-widest">{activity.time} • Status: {activity.status}</p>
                   </div>
                </div>
                <button className="p-2 text-zinc-600 hover:text-white transition-colors">
                  <ArrowUpRight size={16} />
                </button>
              </div>
            ))}
         </div>
      </section>
    </div>
  );
}
