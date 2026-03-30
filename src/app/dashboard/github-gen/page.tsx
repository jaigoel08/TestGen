"use client";

import { useState } from "react";
import {
  Github,
  Search,
  Workflow,
  Zap,
  Terminal,
  CheckCircle2,
  AlertCircle,
  Play,
  FileCode,
  ShieldAlert,
  ArrowRight,
  Loader2,
  Copy,
  Check,
  Layers,
  ChevronRight,
} from "lucide-react";

interface ExecutionResult {
  success: boolean;
  output: string;
  passed: number;
  failed: number;
  reportUrl: string;
}

interface GenerationData {
  success: boolean;
  repoUrl: string;
  featureName: string;
  testCases: string;
  playwrightScript: string;
  executionResult: ExecutionResult;
  bugs: string[];
}

export default function GithubGenPage() {
  const [repoUrl, setRepoUrl] = useState("");
  const [featureName, setFeatureName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<GenerationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [detectedFeatures, setDetectedFeatures] = useState<string[]>([]);

  const steps = [
    "Cloning Repository",
    "Reading Source Files",
    "Embedding with Gemini",
    "Retrieving Context",
    "Generating Test Cases",
    "Packaging Results",
  ];

  // ── Detect Features ─────────────────────────────────────────────────────────
  const handleDetectFeatures = async () => {
    if (!repoUrl) return;
    setIsDetecting(true);
    setError(null);
    setDetectedFeatures([]);

    try {
      const response = await fetch("/api/github-gen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl, mode: "listFeatures" }),
      });
      const data = await response.json();
      if (data.success && Array.isArray(data.features)) {
        setDetectedFeatures(data.features);
      } else {
        setError(data.error || "Could not detect features from this repository.");
      }
    } catch {
      setError("Failed to connect to the server. Please check your network.");
    } finally {
      setIsDetecting(false);
    }
  };

  // ── Generate Test Cases ─────────────────────────────────────────────────────
  const handleProcess = async () => {
    if (!repoUrl || !featureName) return;

    setIsProcessing(true);
    setError(null);
    setResult(null);
    setStep(0);

    const progressInterval = setInterval(() => {
      setStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 5000);

    try {
      const response = await fetch("/api/github-gen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl, featureName, mode: "generateTests" }),
      });

      const data = await response.json();
      if (data.success) {
        setResult(data);
        setStep(steps.length);
      } else {
        setError(data.error || "Generation failed. Check the server logs.");
      }
    } catch {
      setError("An unexpected error occurred. Please check your connection.");
    } finally {
      clearInterval(progressInterval);
      setIsProcessing(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* ── Hero / Input Section ── */}
      <section className="relative overflow-hidden p-12 rounded-[2.5rem] bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 shadow-2xl group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
          <Github size={180} />
        </div>

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-400 uppercase tracking-widest">
            <Zap size={14} className="animate-pulse" />
            Deep Code Analysis Engine
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white max-w-2xl leading-[1.1]">
            Transform your GitHub repository into{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent italic">
              Verified Test Scripts
            </span>
          </h1>
          <p className="text-zinc-500 text-lg max-w-xl font-medium">
            Uses Gemini embeddings and RAG to understand your codebase as a
            human QA engineer would — then auto-generates test cases.
          </p>
        </div>

        {/* ── Repo URL + Detect ── */}
        <div className="mt-10 relative z-10 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 p-2 rounded-3xl bg-black/40 border border-white/5 backdrop-blur-md">
            <div className="flex-1 relative">
              <Github
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                size={20}
              />
              <input
                type="text"
                placeholder="GitHub Repository URL (e.g. https://github.com/user/repo)"
                value={repoUrl}
                onChange={(e) => {
                  setRepoUrl(e.target.value);
                  setDetectedFeatures([]);
                }}
                className="w-full pl-12 pr-4 py-5 rounded-2xl bg-transparent text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm font-medium"
              />
            </div>
            <button
              onClick={handleDetectFeatures}
              disabled={isDetecting || !repoUrl || isProcessing}
              className="px-8 py-5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm transition-all border border-zinc-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
            >
              {isDetecting ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Layers size={16} />
              )}
              {isDetecting ? "Detecting..." : "Detect Features"}
            </button>
          </div>

          {/* ── Detected Features List ── */}
          {detectedFeatures.length > 0 && (
            <div className="p-6 rounded-[1.5rem] bg-zinc-900 border border-zinc-800 animate-in fade-in slide-in-from-top-3 duration-500">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Layers size={12} />
                Detected Features — click to select
              </p>
              <div className="flex flex-wrap gap-2">
                {detectedFeatures.map((f, i) => (
                  <button
                    key={i}
                    onClick={() => setFeatureName(f)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      featureName === f
                        ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20"
                        : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-indigo-500/50 hover:text-white"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Feature Input + Generate ── */}
          <div className="flex flex-col md:flex-row gap-4 p-2 rounded-3xl bg-black/40 border border-white/5 backdrop-blur-md">
            <div className="flex-1 relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                size={20}
              />
              <input
                type="text"
                placeholder="Target Feature (e.g. Authentication Flow)"
                value={featureName}
                onChange={(e) => setFeatureName(e.target.value)}
                className="w-full pl-12 pr-4 py-5 rounded-2xl bg-transparent text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm font-medium"
              />
            </div>
            <button
              onClick={handleProcess}
              disabled={isProcessing || !repoUrl || !featureName}
              className="px-10 py-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm transition-all shadow-xl shadow-indigo-600/20 active:scale-95 disabled:bg-zinc-800 disabled:text-zinc-600 flex items-center gap-2 whitespace-nowrap"
            >
              {isProcessing ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Generate Tests <ChevronRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* ── Processing Pipeline Steps ── */}
      {isProcessing && (
        <section className="space-y-6 animate-in fade-in duration-500">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-[0.3em]">
              Processing Pipeline
            </h3>
            <span className="text-[10px] font-mono text-zinc-600">
              Phase {step + 1} of {steps.length}
            </span>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {steps.map((s, i) => (
              <div
                key={i}
                className={`relative p-5 rounded-2xl border transition-all duration-500 ${
                  i < step
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    : i === step
                    ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400 shadow-lg shadow-indigo-500/5"
                    : "bg-zinc-900 border-zinc-800 text-zinc-700"
                }`}
              >
                <div className="flex flex-col gap-3">
                  {i < step ? (
                    <CheckCircle2 size={18} />
                  ) : i === step ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <div className="w-[18px] h-[18px] border-2 border-zinc-800 rounded-full" />
                  )}
                  <span className="text-[10px] font-bold uppercase leading-tight">
                    {s}
                  </span>
                </div>
                {i === step && (
                  <div className="absolute bottom-0 left-0 h-1 bg-indigo-500 animate-progress w-full rounded-b-2xl" />
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="p-6 rounded-[2rem] bg-red-500/10 border border-red-500/20 flex items-center gap-4 text-red-400 animate-in slide-in-from-top-4">
          <AlertCircle size={24} />
          <div>
            <p className="text-sm font-bold">Pipeline Error Detected</p>
            <p className="text-xs opacity-80">{error}</p>
          </div>
        </div>
      )}

      {/* ── Results ── */}
      {result && (
        <div className="grid lg:grid-cols-12 gap-8 animate-in slide-in-from-bottom-8 duration-700">
          {/* Left Column */}
          <div className="lg:col-span-12 xl:col-span-8 space-y-8">
            {/* Test Cases */}
            <div className="p-10 rounded-[2.5rem] bg-[#0a0a0a] border border-zinc-900 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <Workflow size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Generated Test Scenarios
                    </h2>
                    <p className="text-xs text-zinc-500">
                      Feature: <span className="text-indigo-400 font-semibold">{result.featureName}</span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="prose prose-invert max-w-none prose-sm font-medium text-zinc-400 leading-relaxed whitespace-pre-wrap">
                {result.testCases}
              </div>
            </div>

            {/* Execution Output */}
            <div className="p-10 rounded-[2.5rem] bg-black border border-zinc-900 shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Terminal size={120} />
              </div>
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <Play size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Execution Stream
                    </h2>
                    <p className="text-xs text-zinc-500">Playwright Test Runner</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/30">
                    {result.executionResult.passed} PASSED
                  </span>
                </div>
              </div>
              <div className="bg-zinc-950 rounded-2xl p-6 font-mono text-[11px] text-zinc-500 border border-zinc-900 relative z-10 overflow-auto max-h-[300px]">
                <div className="space-y-1">
                  {result.executionResult.output.split("\n").map((line, i) => (
                    <div key={i} className="flex gap-4">
                      <span className="text-zinc-800 w-8 select-none">{i + 1}</span>
                      <span>{line}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-12 xl:col-span-4 space-y-8">
            {/* Generated Script */}
            <div className="p-8 rounded-[2rem] bg-[#0a0a0a] border border-zinc-900 shadow-2xl relative">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <FileCode size={16} className="text-amber-500" />
                  Playwright Script
                </h3>
                <button
                  onClick={() => handleCopy(result.playwrightScript)}
                  className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-500 hover:text-white transition-all"
                >
                  {copied ? (
                    <Check size={16} className="text-green-500" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>
              <div className="bg-black rounded-xl p-5 font-mono text-[10px] leading-relaxed overflow-auto max-h-[500px] border border-zinc-900 text-zinc-400 custom-scrollbar">
                {result.playwrightScript}
              </div>
            </div>

            {/* Bug Reports */}
            <div className="p-8 rounded-[2rem] bg-amber-500/5 border border-amber-500/20 shadow-2xl">
              <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2 mb-6">
                <ShieldAlert size={16} />
                Verified Deficiencies
              </h3>
              <div className="space-y-4">
                {result.bugs.length > 0 ? (
                  result.bugs.map((bug, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-start gap-3 group hover:border-amber-500/30 transition-all cursor-pointer"
                    >
                      <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors leading-relaxed">
                        {bug}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mx-auto mb-4 border border-emerald-500/20">
                      <CheckCircle2 size={20} />
                    </div>
                    <p className="text-xs font-bold text-zinc-500">
                      No bugs identified in current run
                    </p>
                  </div>
                )}
              </div>
              <button className="w-full mt-6 py-4 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all flex items-center justify-center gap-2">
                Export Bug Log <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-progress {
          animation: progress 5s linear infinite;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3f3f46; }
      `}</style>
    </div>
  );
}
