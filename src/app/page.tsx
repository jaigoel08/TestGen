"use client";

import { useState } from "react";

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
  testCases: string; // The raw string block from AI
  screenshotUrl?: string;
  metadata: {
    contextId: string;
    retrievedCount: number;
  };
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [feature, setFeature] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!url || !feature) return;

    setIsGenerating(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/generate-tests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, featureName: feature }),
      });

      const data = await response.json();
      if (data.success) {
        setResult(data);
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

  // Helper to parse the AI generated string into structured objects if possible
  const parseTestCases = (raw: string): TestCase[] => {
    const cases: TestCase[] = [];
    // Split by "Test Case ID:" (case insensitive)
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
          // Note: This is a simple parser, might need improvement for complex step lists
          testCase.steps = line.split(":")[1]?.trim().split(";").map(s => s.trim()).filter(Boolean);
        }
      });

      if (!testCase.title) {
        // Fallback title if parsing failed
        const firstLine = lines[0]?.trim();
        testCase.title = firstLine || `Test Case ${index + 1}`;
      }

      cases.push(testCase);
    });

    return cases;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-indigo-500/30">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[120px]" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 lg:py-24">
        {/* Header */}
        <header className="mb-12 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-400 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            AI-Powered QA Engineering Orchestrator
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-zinc-500">
            TestGEn Dashboard
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl leading-relaxed">
            Generate comprehensive QA test cases by analyzing website UI structure and authentication patterns in real-time.
          </p>
        </header>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Input Panel */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-xl">
              <div className="space-y-4">
                <div>
                  <label htmlFor="url" className="block text-sm font-medium text-zinc-400 mb-2">
                    Website URL
                  </label>
                  <input
                    id="url"
                    type="url"
                    placeholder="https://example.com/login"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="feature" className="block text-sm font-medium text-zinc-400 mb-2">
                    Feature Name
                  </label>
                  <input
                    id="feature"
                    type="text"
                    placeholder="e.g. User Authentication"
                    value={feature}
                    onChange={(e) => setFeature(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  />
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !url || !feature}
                className="w-full mt-8 flex items-center justify-center gap-2 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed font-semibold text-white transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Orchestrating Workflow...
                  </>
                ) : (
                  "Generate Test Cases"
                )}
              </button>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 flex items-start gap-3">
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <div className="px-6 py-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/50 text-sm text-zinc-500">
              💡 <span className="font-medium text-zinc-400">Pipeline:</span> Scrape → Detect → Embed → Retrieve → Generate.
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-8">
            <div className="min-h-[500px] flex flex-col p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-semibold">Generation Results</h2>
                {result && (
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400 text-xs font-medium border border-indigo-500/20">
                      ID: {result.metadata.contextId.substring(0, 8)}...
                    </span>
                    <button 
                      onClick={() => navigator.clipboard.writeText(result.testCases)}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-300 transition-colors"
                    >
                      Copy Markdown
                    </button>
                  </div>
                )}
              </div>

              {!result && !isGenerating ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center">
                    <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">Ready to Forge</h3>
                    <p className="text-zinc-500 text-sm">Submit the form to begin the AI generation pipeline.</p>
                  </div>
                </div>
              ) : isGenerating ? (
                <div className="flex-1 space-y-8">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="h-24 rounded-2xl bg-zinc-800/50 animate-pulse" />
                        <div className="h-24 rounded-2xl bg-zinc-800/50 animate-pulse" />
                    </div>
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-16 w-full rounded-xl bg-zinc-800/50 animate-pulse" />
                        ))}
                    </div>
                </div>
              ) : (
                <div className="flex-1 space-y-8 overflow-auto pr-2">
                  {/* Visual Context Screenshot */}
                  {result?.screenshotUrl && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Visual Page Context
                      </div>
                      <div className="relative group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
                        <img 
                          src={result.screenshotUrl} 
                          alt="Page Preview" 
                          className="w-full h-auto max-h-[400px] object-cover object-top transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                           <a 
                             href={result.screenshotUrl} 
                             target="_blank" 
                             className="text-white text-xs font-medium bg-zinc-900/80 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-md"
                           >
                             View Full Size
                           </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Meta Cards */ }
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
                      <span className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Detected Login Type</span>
                      <p className="text-lg font-semibold text-indigo-400 capitalize">{result?.loginType}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
                      <span className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Semantic Matches</span>
                      <p className="text-lg font-semibold text-purple-400">{result?.metadata.retrievedCount} similar contexts found</p>
                    </div>
                  </div>

                  {/* Test Cases List */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-zinc-400 px-1">Detailed Test Scenarios</h3>
                    <div className="grid gap-4">
                      {parseTestCases(result?.testCases || "").map((tc, idx) => (
                        <div key={idx} className="group p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all">
                          <div className="flex items-start justify-between mb-4">
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{tc.id}</span>
                              <h4 className="text-lg font-medium text-white group-hover:text-indigo-300 transition-colors">{tc.title}</h4>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              tc.priority.toLowerCase().includes('high') ? 'bg-red-500/10 text-red-500' : 
                              tc.priority.toLowerCase().includes('low') ? 'bg-zinc-500/10 text-zinc-500' : 
                              'bg-amber-500/10 text-amber-500'
                            }`}>
                              {tc.priority}
                            </span>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-6 text-sm">
                            <div>
                              <p className="text-zinc-500 text-xs font-medium mb-2 uppercase">Steps to Reproduce</p>
                              <ul className="space-y-1 text-zinc-300 list-disc list-inside">
                                {tc.steps.length > 0 ? tc.steps.map((s, i) => (
                                  <li key={i}>{s}</li>
                                )) : <li>Execute manual check for this scenario.</li>}
                              </ul>
                            </div>
                            <div>
                              <p className="text-zinc-500 text-xs font-medium mb-2 uppercase">Expected Outcome</p>
                              <p className="text-zinc-300 leading-relaxed italic border-l-2 border-zinc-800 pl-3">
                                {tc.expectedResult || "System should behave according to business requirements."}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Raw Text Toggle (Optional) */}
                  <div className="mt-8">
                    <details className="group">
                        <summary className="text-xs text-zinc-600 cursor-pointer hover:text-zinc-400 transition-colors list-none flex items-center gap-1 uppercase tracking-tighter">
                            View RAW Log Trace
                            <svg className="w-3 h-3 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </summary>
                        <div className="mt-4 p-4 rounded-xl bg-black border border-zinc-800 font-mono text-[10px] text-zinc-500 whitespace-pre-wrap">
                            {result?.testCases}
                        </div>
                    </details>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-8 text-center text-zinc-600 text-xs border-t border-zinc-900 flex flex-col gap-1">
        <div>© {new Date().getFullYear()} TestGEn AI Platform. All Rights Reserved.</div>
        <div className="text-[10px] text-zinc-700">Powered by OpenAI GPT-4o, ChromaDB, and Playwright Scraper Engine.</div>
      </footer>
    </div>
  );
}
