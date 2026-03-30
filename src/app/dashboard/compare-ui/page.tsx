"use client";

import { useState, useRef } from "react";
import { 
  Plus, 
  Upload, 
  Zap, 
  Scan, 
  Layers, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  Split,
  Maximize2
} from "lucide-react";

export default function CompareUIPage() {
  const [imageA, setImageA] = useState<File | null>(null);
  const [imageB, setImageB] = useState<File | null>(null);
  const [previewA, setPreviewA] = useState<string | null>(null);
  const [previewB, setPreviewB] = useState<string | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [result, setResult] = useState<{ diffImage: string | null; numDiffPixels: number; explanation: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputARef = useRef<HTMLInputElement>(null);
  const fileInputBRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: 'A' | 'B') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (side === 'A') {
          setImageA(file);
          setPreviewA(reader.result as string);
        } else {
          setImageB(file);
          setPreviewB(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCompare = async () => {
    if (!imageA || !imageB) return;

    setIsComparing(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('imageA', imageA);
    formData.append('imageB', imageB);

    try {
      const response = await fetch('/api/compare-ui', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Comparison failed.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please check your connection.');
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Scan className="text-indigo-400" size={32} />
              Visual Regression Analysis
           </h1>
           <p className="text-zinc-500 mt-2 font-medium">Compare Figma designs against live builds with pixel-perfect accuracy and AI reasoning.</p>
        </div>
        <button 
          onClick={handleCompare}
          disabled={isComparing || !imageA || !imageB}
          className={`
            px-8 py-4 rounded-2xl font-black text-sm transition-all shadow-xl active:scale-95 flex items-center gap-3
            ${isComparing ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20"}
          `}
        >
          {isComparing ? (
            <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          ) : <Zap size={18} fill="currentColor" />}
          <span>Run Comparison</span>
        </button>
      </section>

      {/* Upload Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Figma Side */}
        <div 
          onClick={() => fileInputARef.current?.click()}
          className={`
            group relative h-[400px] rounded-[2.5rem] border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden
            ${previewA ? "border-indigo-500/30 bg-[#0a0a0a]" : "border-zinc-800 bg-zinc-950/50 hover:bg-zinc-900/50 hover:border-zinc-700"}
          `}
        >
          <input type="file" ref={fileInputARef} className="hidden" onChange={(e) => handleFileChange(e, 'A')} />
          {previewA ? (
            <div className="w-full h-full relative">
               <img src={previewA} alt="Figma" className="w-full h-full object-contain p-4 opacity-80 group-hover:opacity-100 transition-all" />
               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="px-4 py-2 rounded-xl bg-white text-black text-xs font-bold shadow-xl">Replace Figma File</span>
               </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-zinc-900 flex items-center justify-center text-zinc-500 group-hover:bg-indigo-600/10 group-hover:text-indigo-400 transition-all border border-zinc-800">
                <Plus size={32} />
              </div>
              <div>
                <p className="text-sm font-bold text-white uppercase tracking-widest">Add Figma Placeholder</p>
                <p className="text-xs text-zinc-500 mt-1">Upload the intended design file (PNG/JPG)</p>
              </div>
            </div>
          )}
          <div className="absolute top-6 left-6 px-3 py-1 rounded-full bg-zinc-900/80 border border-white/5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest backdrop-blur-md">
             Source: Figma
          </div>
        </div>

        {/* Build Side */}
        <div 
          onClick={() => fileInputBRef.current?.click()}
          className={`
            group relative h-[400px] rounded-[2.5rem] border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden
            ${previewB ? "border-emerald-500/30 bg-[#0a0a0a]" : "border-zinc-800 bg-zinc-950/50 hover:bg-zinc-900/50 hover:border-zinc-700"}
          `}
        >
          <input type="file" ref={fileInputBRef} className="hidden" onChange={(e) => handleFileChange(e, 'B')} />
          {previewB ? (
            <div className="w-full h-full relative">
               <img src={previewB} alt="Build" className="w-full h-full object-contain p-4 opacity-80 group-hover:opacity-100 transition-all" />
               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="px-4 py-2 rounded-xl bg-white text-black text-xs font-bold shadow-xl">Replace Build Image</span>
               </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-zinc-900 flex items-center justify-center text-zinc-500 group-hover:bg-emerald-600/10 group-hover:text-emerald-400 transition-all border border-zinc-800">
                <Upload size={32} />
              </div>
              <div>
                <p className="text-sm font-bold text-white uppercase tracking-widest">Upload Build Image</p>
                <p className="text-xs text-zinc-500 mt-1">Capture the actual live build implementation</p>
              </div>
            </div>
          )}
          <div className="absolute top-6 left-6 px-3 py-1 rounded-full bg-zinc-900/80 border border-white/5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest backdrop-blur-md">
             Actual: Build
          </div>
        </div>
      </div>

      {error && (
        <div className="p-6 rounded-[2rem] bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-4 animate-in slide-in-from-top-4">
           <AlertCircle size={24} />
           <div>
              <p className="text-sm font-bold uppercase tracking-widest">Analysis Pipeline Failed</p>
              <p className="text-xs opacity-80">{error}</p>
           </div>
        </div>
      )}

      {/* Results Section */}
      {result && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
           <div className="grid lg:grid-cols-12 gap-8">
              {/* Diff Image */}
              <div className="lg:col-span-12 xl:col-span-7 bg-[#0a0a0a] rounded-[2.5rem] border border-zinc-900 p-8 shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Layers size={140} />
                 </div>
                 <div className="flex items-center justify-between mb-8 relative z-10">
                    <div>
                       <h3 className="text-xl font-bold text-white flex items-center gap-3">
                          <Split className="text-indigo-400" size={24} />
                          Pixel Diff Overlay
                       </h3>
                       <p className="text-xs text-zinc-500">Visualizing {result.numDiffPixels.toLocaleString()} discrepant pixels</p>
                    </div>
                    <button className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 transition-all">
                       <Maximize2 size={16} />
                    </button>
                 </div>
                 <div className="relative rounded-3xl overflow-hidden border border-zinc-900 bg-black min-h-[400px] flex items-center justify-center group-hover:border-indigo-500/30 transition-all">
                    {result.diffImage ? (
                      <img src={`data:image/png;base64,${result.diffImage}`} alt="Pixel Diff" className="w-full h-auto object-contain max-h-[600px]" />
                    ) : (
                      <div className="text-center space-y-4">
                         <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mx-auto">
                            <ShieldCheck size={32} />
                         </div>
                         <p className="text-sm font-bold text-zinc-400 tracking-widest uppercase">No Regressions Found</p>
                      </div>
                    )}
                 </div>
              </div>

              {/* Gemini Explanation */}
              <div className="lg:col-span-12 xl:col-span-5 bg-[#0a0a0a] rounded-[2.5rem] border border-zinc-900 p-8 shadow-2xl relative overflow-hidden group">
                 <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                       <Zap size={24} />
                    </div>
                    <div>
                       <h3 className="text-xl font-bold text-white uppercase tracking-tighter">AI Reasoning</h3>
                       <p className="text-[10px] text-zinc-600 font-mono">Gemini-1.5-Flash Logic Stream</p>
                    </div>
                 </div>
                 <div className="space-y-6">
                    <div className="prose prose-invert prose-sm">
                       <p className="text-zinc-400 font-medium leading-[1.8] italic whitespace-pre-wrap">
                          {result.explanation}
                       </p>
                    </div>
                    <div className="pt-8 border-t border-zinc-900">
                       <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                          <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-3">Key Discrepancies</h4>
                          <div className="space-y-3">
                             {[
                               "Semantic Element Alignment",
                               "Color Palette Deviation",
                               "Layout Spacing Conflict"
                             ].map((item, i) => (
                               <div key={i} className="flex items-center gap-3 text-xs text-zinc-500 font-bold">
                                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                  {item}
                               </div>
                             ))}
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
