"use client";

import React from "react";
import Link from "next/link";
import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import { Sparkles, Zap, Shield, Globe, ArrowRight, CheckCircle2, Github } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30 font-sans overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/10 blur-[120px] animate-pulse" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-600/10 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/20 backdrop-blur-xl h-20">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-500">
               <Zap size={22} fill="white" className="text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">TestGen</span>
          </div>

          <div className="hidden md:flex items-center gap-10">
            {['Features', 'Enterprise', 'Changelog', 'Pricing'].map((item) => (
              <Link key={item} href={`#${item.toLowerCase()}`} className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors tracking-wide">
                {item}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Show when="signed-out">
              <div className="flex items-center gap-3">
                <SignInButton mode="modal">
                  <button className="px-5 py-2.5 text-sm font-bold text-zinc-400 hover:text-white transition-all">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-6 py-2.5 rounded-full bg-white text-black text-sm font-black hover:bg-zinc-200 transition-all shadow-xl shadow-white/10 active:scale-95">
                    Get Started
                  </button>
                </SignUpButton>
              </div>
            </Show>
            <Show when="signed-in">
              <div className="flex items-center gap-4">
                <Link href="/dashboard" className="px-6 py-2.5 rounded-full bg-zinc-900 border border-zinc-800 text-sm font-bold hover:bg-zinc-800 transition-all">
                  Dashboard
                </Link>
                <UserButton />
              </div>
            </Show>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/50 border border-zinc-800/50 text-xs font-bold text-indigo-400 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
             <Sparkles size={14} className="animate-spin-slow" />
             AI-Powered QA Engineering Orchestrator
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-[ -0.04em] leading-[0.9] mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
            Automate QA at <br />
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent italic">Hyper-Speed</span>
          </h1>

          <p className="max-w-2xl mx-auto text-zinc-500 text-xl md:text-2xl leading-relaxed mb-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
            TestGen analyzes your UI architecture to generate high-fidelity test cases, edge scenarios, and 
            performance benchmarks in seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
            <SignUpButton mode="modal">
              <button className="group relative px-10 py-5 rounded-full bg-indigo-600 text-white font-black text-lg overflow-hidden transition-all hover:pr-14 hover:shadow-2xl hover:shadow-indigo-500/40 active:scale-95">
                <span className="relative z-10">Start Testing Free</span>
                <ArrowRight size={20} className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all" />
              </button>
            </SignUpButton>
            <button className="flex items-center gap-3 px-10 py-5 rounded-full bg-zinc-900 border border-zinc-800 font-bold text-lg hover:bg-zinc-800 transition-all">
               <Github size={20} />
               View on GitHub
            </button>
          </div>
        </div>

        {/* Floating Features Grid */}
        <div className="max-w-7xl mx-auto mt-40 grid md:grid-cols-3 gap-8">
           {[
             { title: 'Vision Parsing', desc: 'Deep UI structure analysis using GPT-4-Vision for pixel-perfect test steps.', icon: Globe, color: 'text-blue-400' },
             { title: 'Auto-Healing', desc: 'Tests that adapt to UI changes automatically using semantic element tracking.', icon: Zap, color: 'text-amber-400' },
             { title: 'Security First', desc: 'Built-in detection for sensitive data leaks and authentication bypass scenarios.', icon: Shield, color: 'text-emerald-400' }
           ].map((feature, i) => (
             <div key={i} className="group p-8 rounded-3xl bg-zinc-900/40 border border-white/5 backdrop-blur-sm hover:border-white/10 transition-all duration-500">
                <div className={`w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center mb-6 border border-white/5 group-hover:scale-110 transition-transform`}>
                   <feature.icon className={feature.color} size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-zinc-500 leading-relaxed italic">{feature.desc}</p>
             </div>
           ))}
        </div>

        {/* Proof Section */}
        <div className="max-w-7xl mx-auto mt-40 p-12 rounded-[3rem] bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-600 relative overflow-hidden group">
            <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
               <div className="text-left max-w-lg">
                  <h2 className="text-4xl font-black tracking-tight mb-6">Trusted by 2,000+ QA Teams globally.</h2>
                  <div className="space-y-4">
                     {['99.9% Logic Accuracy', 'Zero-Config Setup', 'Enterprise Encryption'].map((item) => (
                       <div key={item} className="flex items-center gap-3 text-white/90 font-bold">
                          <CheckCircle2 size={24} className="text-black/30" />
                          {item}
                       </div>
                     ))}
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4 w-full md:w-[400px]">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="h-24 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center font-black text-2xl text-white/20">
                       LOGO
                    </div>
                  ))}
               </div>
            </div>
        </div>
      </main>

      {/* Global CSS for Animations */}
      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}
