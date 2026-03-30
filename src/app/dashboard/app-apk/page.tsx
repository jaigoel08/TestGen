"use client";

import { useState, useRef } from "react";
import { 
  Upload, 
  Smartphone, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  History, 
  Zap, 
  FileText,
  Copy,
  Check,
  RefreshCw,
  Search,
  Cpu,
  ShieldAlert
} from "lucide-react";
import ReactMarkdown from 'react-markdown';

interface ApkMetadata {
  packageName: string;
  versionName: string;
  versionCode: number;
  features: string[];
}

export default function ApkGenPage() {
  const [step, setStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [metadata, setMetadata] = useState<ApkMetadata | null>(null);
  const [selectedFeature, setSelectedFeature] = useState("");
  const [frs, setFrs] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [testCases, setTestCases] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.apk')) {
      setError("Please upload an APK file.");
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/apk/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload APK");

      setMetadata(data.metadata);
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeature || !frs) return;

    setIsGenerating(true);
    setError(null);
    setTestCases(null);

    try {
      const res = await fetch("/api/apk/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          metadata, 
          feature: selectedFeature, 
          frs 
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate test cases");

      setTestCases(data.testCases);
      setStep(4);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!testCases) return;
    navigator.clipboard.writeText(testCases);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetFlow = () => {
    setStep(1);
    setMetadata(null);
    setSelectedFeature("");
    setFrs("");
    setTestCases(null);
    setError(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Smartphone className="text-green-400" size={32} />
            APK Test Generator
          </h1>
          <p className="text-zinc-400 mt-2">
            Upload your Android app to extract features and generate comprehensive test plans based on FRS.
          </p>
        </div>
        <button 
          onClick={resetFlow}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-all text-sm"
        >
          <History size={16} />
          Start New
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3 animate-in shake duration-500">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Progress Steps */}
      <div className="flex items-center gap-4 px-2 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { icon: Upload, label: "Upload APK" },
          { icon: Search, label: "Select Feature" },
          { icon: Zap, label: "Requirements" },
          { icon: FileText, label: "Results" }
        ].map((s, i) => {
          const num = i + 1;
          const isActive = step === num;
          const isCompleted = step > num;
          return (
            <div key={i} className="flex items-center gap-4 flex-shrink-0">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                isActive ? 'bg-green-500/10 border-green-500/50 text-green-400 shadow-lg shadow-green-500/10' : 
                isCompleted ? 'bg-zinc-800/50 border-zinc-700 text-zinc-400' : 'bg-zinc-950/20 border-zinc-900 text-zinc-600'
              }`}>
                {isCompleted ? <CheckCircle2 size={16} className="text-green-500" /> : <s.icon size={16} />}
                <span className="text-xs font-bold whitespace-nowrap">{s.label}</span>
              </div>
              {i < 3 && <ChevronRight size={14} className="text-zinc-800" />}
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Step 1: Upload */}
          {step === 1 && (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`group relative p-12 rounded-[2.5rem] border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-6 overflow-hidden ${
                isUploading ? 'border-green-500/50 bg-green-500/5' : 'border-zinc-800 hover:border-green-500/30 hover:bg-green-500/5 bg-[#0a0a0a]'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept=".apk"
              />
              
              <div className={`p-6 rounded-3xl transition-all ${isUploading ? 'bg-green-500/20 text-green-400 animate-pulse' : 'bg-zinc-900 text-zinc-500 group-hover:bg-green-500/20 group-hover:text-green-400 group-hover:scale-110'}`}>
                {isUploading ? <RefreshCw className="animate-spin" size={48} /> : <Upload size={48} />}
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-white">
                  {isUploading ? "Uploading & Analyzing..." : "Select or Drop APK File"}
                </h3>
                <p className="text-sm text-zinc-500">
                  Android Application Package (.apk) only
                </p>
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}

          {/* Step 2: Select Feature */}
          {step === 2 && metadata && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
               <div className="p-8 rounded-3xl bg-[#0a0a0a] border border-zinc-800">
                 <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Search className="text-green-400" size={24} />
                    Select Feature to Test
                 </h2>
                 <div className="grid sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {metadata.features.map((feature, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedFeature(feature)}
                        className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3 ${
                          selectedFeature === feature 
                          ? 'bg-green-500/10 border-green-500/50 text-white shadow-lg shadow-green-500/5' 
                          : 'bg-zinc-900/30 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full ${selectedFeature === feature ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-zinc-700'}`} />
                        <span className="text-sm font-medium truncate">{feature}</span>
                      </button>
                    ))}
                 </div>
                 <div className="mt-8 flex justify-end">
                    <button 
                      onClick={() => setStep(3)}
                      disabled={!selectedFeature}
                      className="px-8 py-3 rounded-xl bg-green-600 hover:bg-green-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold transition-all flex items-center gap-2 shadow-xl shadow-green-600/10 active:scale-95"
                    >
                      Continue
                      <ChevronRight size={18} />
                    </button>
                 </div>
               </div>
            </div>
          )}

          {/* Step 3: FRS Input */}
          {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
               <div className="p-8 rounded-3xl bg-[#0a0a0a] border border-zinc-800 relative overflow-hidden">
                 <div className="relative z-10 flex flex-col h-full">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Zap className="text-yellow-400" size={24} />
                        Functional Requirements
                    </h2>
                    <p className="text-xs text-zinc-500 mb-4 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50">
                        Feature: <span className="text-green-400 font-bold">{selectedFeature}</span>
                    </p>
                    <form onSubmit={handleGenerate} className="flex-1 flex flex-col gap-6">
                        <textarea
                          placeholder="Paste the Functional Requirement Specification (FRS) here... e.g., 'User should see a login button that opens a Gmail OAuth dialog...'"
                          value={frs}
                          onChange={(e) => setFrs(e.target.value)}
                          className="w-full h-64 bg-zinc-900/30 border border-zinc-800 focus:border-green-500/50 focus:ring-2 focus:ring-green-500/10 rounded-2xl p-6 text-white placeholder:text-zinc-700 outline-none transition-all resize-none font-mono text-sm"
                          required
                        />
                        <div className="flex justify-between items-center bg-[#050505] p-2 rounded-2xl border border-zinc-900">
                           <button 
                             type="button"
                             onClick={() => setStep(2)}
                             className="px-6 py-2 text-sm text-zinc-500 hover:text-white transition-all font-medium"
                           >
                             Back
                           </button>
                           <button 
                             type="submit"
                             disabled={isGenerating || !frs}
                             className="px-8 py-3 rounded-xl bg-green-600 hover:bg-green-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold transition-all flex items-center gap-3 shadow-xl shadow-green-600/10 active:scale-95"
                           >
                             {isGenerating ? (
                               <>
                                 <RefreshCw className="animate-spin" size={20} />
                                 Generating Test Cases...
                               </>
                             ) : (
                               <>
                                 <Zap size={20} />
                                 Generate
                               </>
                             )}
                           </button>
                        </div>
                    </form>
                 </div>
               </div>
            </div>
          )}

          {/* Step 4: Results */}
          {step === 4 && testCases && (
            <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-700">
               <div className="p-8 rounded-3xl bg-[#0a0a0a] border border-zinc-800 shadow-2xl">
                  <div className="flex items-center justify-between mb-8">
                     <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-500/10 text-green-400">
                           <FileText size={20} />
                        </div>
                        <div>
                           <h3 className="text-lg font-bold text-white">Generated Test Cases</h3>
                           <p className="text-xs text-zinc-500 mt-0.5">Mobile-first scenarios for {selectedFeature}</p>
                        </div>
                     </div>
                     <button 
                       onClick={copyToClipboard}
                       className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-all text-xs font-bold"
                     >
                       {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                       {copied ? "Copied!" : "Copy Markdown"}
                     </button>
                  </div>

                  <div className="prose prose-invert prose-sm max-w-none bg-zinc-950/50 rounded-2xl p-8 border border-zinc-800/50 overflow-auto max-h-[800px] custom-scrollbar shadow-inner">
                     <ReactMarkdown>{testCases}</ReactMarkdown>
                  </div>
                  
                  <div className="mt-8 flex justify-center">
                      <button 
                        onClick={resetFlow}
                        className="px-8 py-3 rounded-xl border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-all text-sm font-bold flex items-center gap-2"
                      >
                        <RefreshCw size={16} />
                        Test Another Feature
                      </button>
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          {metadata ? (
            <div className="p-8 rounded-3xl bg-[#0a0a0a] border border-zinc-800 space-y-6 animate-in fade-in duration-1000">
               <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 border border-green-500/20">
                     <Smartphone size={20} />
                  </div>
                  <h3 className="font-bold text-white">App Metadata</h3>
               </div>
               
               <div className="space-y-4">
                  {[
                    { label: "Package", value: metadata.packageName, icon: Cpu },
                    { label: "Version Name", value: metadata.versionName, icon: History },
                    { label: "Version Code", value: metadata.versionCode, icon: Zap },
                    { label: "Extracted Features", value: metadata.features.length, icon: Search }
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col gap-1 p-3 rounded-xl bg-zinc-900/30 border border-zinc-800/50">
                       <span className="text-[10px] uppercase tracking-wider text-zinc-600 font-bold flex items-center gap-1.5">
                          <item.icon size={10} />
                          {item.label}
                       </span>
                       <span className="text-xs text-zinc-300 font-mono truncate">{item.value}</span>
                    </div>
                  ))}
               </div>

               <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 space-y-2">
                  <div className="flex items-center gap-2 text-blue-400 mb-2">
                     <ShieldAlert size={14} />
                     <span className="text-[10px] font-bold uppercase tracking-wider">Device Features</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                     {metadata.features.filter(f => f.startsWith('Permission')).slice(0, 5).map((p, i) => (
                       <span key={i} className="text-[9px] px-2 py-1 rounded-md bg-zinc-800 text-zinc-500 border border-zinc-700/50">
                          {p.split(':').pop()?.trim()}
                       </span>
                     ))}
                     {metadata.features.filter(f => f.startsWith('Permission')).length > 5 && (
                       <span className="text-[9px] text-zinc-600">+{metadata.features.filter(f => f.startsWith('Permission')).length - 5} more</span>
                     )}
                  </div>
               </div>
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-zinc-950/50 border border-zinc-900 border-dashed space-y-6">
              <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Mobile QA Engine</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Connect your Android package directly to our vision-trained LLM for context-aware test generation.
              </p>
              <ul className="space-y-4">
                {[
                  { icon: CheckCircle2, text: "Activity Mapping", desc: "Automated screen identification" },
                  { icon: CheckCircle2, text: "Sensor Testing", desc: "GPS, Camera, and Biometrics" },
                  { icon: CheckCircle2, text: "Offline Scenarios", desc: "Network resiliency patterns" }
                ].map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="mt-1 text-green-400"><item.icon size={14} /></div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-200">{item.text}</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
