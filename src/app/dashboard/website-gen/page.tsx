"use client";

import { useState } from "react";
import { Sparkles, Terminal, Shield, Workflow, Copy, Check, AlertCircle, ChevronRight, Play } from "lucide-react";

interface TestCase {
  id: string;
  title: string;
  steps: string[];
  expectedResult: string;
  priority: string;
}

interface GenerationResult {
  success: boolean;
  url: string;
  featureName: string;
  loginType: string;
  testCases: string; 
  screenshotUrl?: string;
  metadata: {
    contextId: string;
    retrievedCount: number;
  };
}

export default function WebsiteGenPage() {
  const [url, setUrl] = useState("");
  const [feature, setFeature] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!url || !feature) return;

    setIsGenerating(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/generate-tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, featureName: feature }),
      });

      const data = await response.json();
      if (data.success) {
        if (data.testCases.trim().startsWith("Error:")) {
          setError(data.testCases.trim());
          setResult(null);
        } else {
          setResult(data);
        }
      } else {
        setError(data.error || "Failed to generate test cases.");
      }
    } catch (err) {
      console.error("Error generating test cases:", err);
      setError("An unexpected error occurred. Please check your connection and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const parseTestCases = (raw: string): TestCase[] => {
    const cases: TestCase[] = [];
    const blocks = raw.split(/Test Case ID:/i).filter(b => b.trim());

    blocks.forEach((block, index) => {
      const lines = block.split("\n");
      const testCase: TestCase = {
        id: `TC-${index + 1}`,
        title: "",
        steps: [],
        expectedResult: "",
        priority: "Medium"
      };

      lines.forEach(line => {
        const lower = line.toLowerCase();
        if (lower.startsWith("title:")) testCase.title = line.split(":")[1]?.trim();
        if (lower.startsWith("expected result:")) testCase.expectedResult = line.split(":")[1]?.trim();
        if (lower.startsWith("priority:")) testCase.priority = line.split(":")[1]?.trim();
        if (lower.startsWith("steps:")) {
          testCase.steps = line.split(":")[1]?.trim().split(";").map(s => s.trim()).filter(Boolean);
        }
      });

      if (!testCase.title) {
        const firstLine = lines[0]?.trim();
        testCase.title = firstLine || `Test Case ${index + 1}`;
      }
      cases.push(testCase);
    });

    return cases;
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result.testCases);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero Section */}
      <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Sparkles className="text-indigo-400" size={28} />
            Website Clone Generator
          </h1>
          <p className="text-zinc-400 mt-2 max-w-xl">
            Automate your QA lifecycle. Generate high-fidelity test scenarios using state-of-the-art vision models and UI analysis.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-zinc-950 bg-zinc-800 flex items-center justify-center overflow-hidden">
                <img src={`https://i.pravatar.cc/150?u=${i}`} alt="user" className="w-full h-full object-cover opacity-60" />
              </div>
            ))}
          </div>
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest pl-2">Active now</span>
        </div>
      </section>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Configuration Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-zinc-800 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <Shield size={120} />
            </div>
            
            <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              Target Configuration
            </h2>

            <div className="space-y-5 relative z-10">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 px-1">Source URL</label>
                <input
                  type="url"
                  placeholder="https://app.example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-mono text-sm leading-relaxed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 px-1">Feature Scope</label>
                <input
                  type="text"
                  placeholder="e.g. Checkout Pipeline"
                  value={feature}
                  onChange={(e) => setFeature(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-sm leading-relaxed"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !url || !feature}
                className={`
                  w-full mt-4 flex items-center justify-center gap-3 py-4 rounded-xl font-bold transition-all shadow-xl shadow-indigo-600/10 active:scale-[0.98]
                  ${isGenerating 
                    ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" 
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white"}
                `}
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing UI...</span>
                  </>
                ) : (
                  <>
                    <Play size={18} fill="currentColor" />
                    <span>Run Generator</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <p className="leading-relaxed">{error}</p>
            </div>
          )}

          <div className="p-5 rounded-2xl bg-zinc-950/50 border border-zinc-800/50 flex items-center gap-4 group cursor-help transition-colors hover:bg-zinc-900/50">
             <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-600 group-hover:text-amber-500 transition-colors">
               <Terminal size={18} />
             </div>
             <div>
               <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Engine Log</p>
               <p className="text-[10px] text-zinc-600 font-mono mt-0.5">Scraping: {url || "waiting..."}</p>
             </div>
          </div>
        </div>

        {/* Execution Results */}
        <div className="lg:col-span-8">
          <div className="min-h-[600px] flex flex-col p-8 rounded-2xl bg-[#0a0a0a] border border-zinc-800 shadow-2xl relative">
            <div className="flex items-center justify-between mb-8 border-b border-zinc-900 pb-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <Workflow size={20} />
                </div>
                <div>
                   <h2 className="text-lg font-bold text-white">Execution Stream</h2>
                   <p className="text-xs text-zinc-500">Real-time AI reasoning and output</p>
                </div>
              </div>

              {result && (
                <button 
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold transition-all hover:scale-105 active:scale-95"
                >
                  {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  <span>{copied ? "Copied!" : "Export Markdown"}</span>
                </button>
              )}
            </div>

            {!result && !isGenerating ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-6">
                <div className="relative">
                   <div className="w-24 h-24 rounded-3xl bg-zinc-900/50 flex items-center justify-center text-zinc-700 animate-pulse">
                      <Terminal size={40} />
                   </div>
                   <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center animate-bounce">
                      <PlusIcon size={14} className="text-white" />
                   </div>
                </div>
                <div className="max-w-xs">
                  <h3 className="text-white font-bold text-lg">Initialize Engine</h3>
                  <p className="text-zinc-500 text-sm mt-2 leading-relaxed">
                    Enter a URL and Feature name on the left to start the AI generation pipeline.
                  </p>
                </div>
              </div>
            ) : isGenerating ? (
              <div className="flex-1 space-y-10 animate-in fade-in duration-500">
                <div className="grid grid-cols-2 gap-6">
                  <div className="h-32 rounded-2xl bg-zinc-900/30 border border-zinc-800/50 animate-pulse flex items-center justify-center">
                     <div className="w-12 h-1 bg-zinc-800 rounded-full" />
                  </div>
                  <div className="h-32 rounded-2xl bg-zinc-900/30 border border-zinc-800/50 animate-pulse flex items-center justify-center">
                     <div className="w-12 h-1 bg-zinc-800 rounded-full" />
                  </div>
                </div>
                <div className="space-y-6">
                   {[1, 2, 3, 4].map((i) => (
                     <div key={i} className="flex gap-4 items-center">
                        <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 animate-pulse" />
                        <div className="flex-1 h-12 rounded-xl bg-zinc-900/30 border border-zinc-800/50 animate-pulse" />
                     </div>
                   ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-auto pr-2 space-y-10 custom-scrollbar pb-8">
                 {/* Visual Summary */}
                 <section className="space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">
                       <ChevronRight size={12} />
                       AI Vision Context
                    </div>
                    {result?.screenshotUrl ? (
                      <div className="relative group overflow-hidden rounded-2xl border border-zinc-800 bg-[#050505]">
                         <img 
                           src={result.screenshotUrl} 
                           alt="Page Context" 
                           className="w-full h-auto max-h-[450px] object-cover object-top opacity-80 group-hover:opacity-100 transition-all duration-700"
                         />
                         <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black to-transparent">
                            <span className="px-3 py-1 rounded bg-indigo-600/20 border border-indigo-500/30 text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                                Semantic Capture Active
                            </span>
                         </div>
                      </div>
                    ) : (
                      <div className="h-48 rounded-2xl border-2 border-dashed border-zinc-800 flex items-center justify-center text-zinc-700 font-mono text-xs">
                         Screenshot parsing failed
                      </div>
                    )}
                 </section>

                 {/* Insights */}
                 <section className="grid sm:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-900 group hover:border-indigo-500/30 transition-colors">
                       <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-2 group-hover:text-zinc-500">Identity Mode</p>
                       <p className="text-xl font-bold text-indigo-400 capitalize flex items-center gap-2">
                         {result?.loginType}
                         <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                       </p>
                    </div>
                    <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-900 group hover:border-purple-500/30 transition-colors">
                       <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-2 group-hover:text-zinc-500">Chroma Knowledge</p>
                       <p className="text-xl font-bold text-purple-400">{result?.metadata.retrievedCount} Reference Chunks</p>
                    </div>
                 </section>

                 {/* The Goods */}
                 <section className="space-y-6">
                    <div className="flex items-center justify-between">
                       <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Test Scenarios ({parseTestCases(result?.testCases || "").length})</h3>
                    </div>

                    <div className="grid gap-6">
                       {parseTestCases(result?.testCases || "").map((tc, idx) => (
                         <div key={idx} className="group p-8 rounded-2xl bg-zinc-950/50 border border-zinc-900 hover:border-zinc-800 hover:bg-zinc-900/30 transition-all duration-300">
                            <div className="flex items-start justify-between mb-6">
                               <div className="space-y-1">
                                  <span className="text-[10px] font-black text-indigo-500/60 uppercase tracking-[0.2em]">{tc.id}</span>
                                  <h4 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">{tc.title}</h4>
                               </div>
                               <div className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-tighter ${
                                 tc.priority.toLowerCase().includes('high') ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 
                                 tc.priority.toLowerCase().includes('low') ? 'bg-zinc-800 text-zinc-500 border border-zinc-700' : 
                                 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                               }`}>
                                 {tc.priority}
                               </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-10">
                               <div className="space-y-4">
                                  <div className="flex items-center gap-2 text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                                     <Play size={10} className="text-indigo-500" />
                                     Procedures
                                  </div>
                                  <ul className="space-y-3">
                                     {tc.steps.map((s, i) => (
                                       <li key={i} className="flex gap-3 text-sm text-zinc-400 group/item">
                                          <span className="w-5 h-5 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] text-zinc-600 group-hover/item:border-indigo-500/50 transition-colors">{i+1}</span>
                                          <span className="flex-1 leading-relaxed">{s}</span>
                                       </li>
                                     ))}
                                  </ul>
                               </div>
                               <div className="space-y-4">
                                  <div className="flex items-center gap-2 text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                                     <Shield size={10} className="text-green-500" />
                                     Expected State
                                  </div>
                                  <p className="text-sm text-zinc-300 leading-relaxed font-medium italic p-5 rounded-2xl bg-zinc-900/50 border-l-4 border-indigo-600">
                                     {tc.expectedResult}
                                  </p>
                                </div>
                            </div>
                         </div>
                       ))}
                    </div>
                 </section>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PlusIcon({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
