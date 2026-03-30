"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Trello, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  RefreshCw, 
  ShieldCheck,
  Zap,
  Trash2,
  FileText,
  Copy,
  Check,
  Clock,
  ArrowRight
} from "lucide-react";
import ReactMarkdown from 'react-markdown';

export default function JiraConnectPage() {
  const searchParams = useSearchParams();
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(searchParams.get("error"));
  const [success, setSuccess] = useState<boolean>(searchParams.get("success") === "true");
  
  // Generation state
  const [ticketUrl, setTicketUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [testCases, setTestCases] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const res = await fetch("/api/jira/status");
      const data = await res.json();
      setIsConnected(data.connected);
    } catch (err) {
      console.error("Failed to check Jira status:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = () => {
    window.location.href = "/api/jira/authorize";
  };

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect Jira?")) return;
    setIsLoading(true);
    try {
      await fetch("/api/jira/status", { method: "DELETE" });
      setIsConnected(false);
      setSuccess(false);
      setTestCases(null);
    } catch (err) {
      setError("Failed to disconnect Jira.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketUrl) return;

    setIsGenerating(true);
    setError(null);
    setTestCases(null);

    try {
      const res = await fetch("/api/jira/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketUrl }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate test cases");

      setTestCases(data.testCases);
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

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Trello className="text-blue-400" size={32} />
            Jira Integration
          </h1>
          <p className="text-zinc-400 mt-2">
            Connect your Atlassian account to sync test cases and report bugs directly to your Jira boards.
          </p>
        </div>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 flex items-center gap-3 animate-in slide-in-from-top-2">
          <CheckCircle2 size={20} />
          <p className="text-sm font-medium">Successfully connected to Jira!</p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3 animate-in slide-in-from-top-2">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Connection Card */}
        <div className="p-8 rounded-3xl bg-[#0a0a0a] border border-zinc-800 shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <Trello size={120} />
           </div>

           <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-8 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-zinc-700'}`} />
              Connection Status
           </h2>

           {isLoading ? (
             <div className="flex items-center gap-3 text-zinc-500 animate-pulse">
                <RefreshCw className="animate-spin" size={20} />
                <span className="font-medium">Checking connection...</span>
             </div>
           ) : isConnected ? (
             <div className="space-y-6 relative z-10">
                <div className="flex items-center gap-4 text-white">
                   <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500">
                      <ShieldCheck size={28} />
                   </div>
                   <div>
                      <p className="font-bold text-lg">Account Linked</p>
                      <p className="text-xs text-zinc-500">Ready to export test cases</p>
                   </div>
                </div>
                <button 
                  onClick={handleDisconnect}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-zinc-700 hover:border-red-500/50 hover:bg-red-500/5 text-zinc-400 hover:text-red-400 transition-all text-sm font-bold"
                >
                  <Trash2 size={16} />
                  Disconnect Account
                </button>
             </div>
           ) : (
             <div className="space-y-6 relative z-10">
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Link your Atlassian workspace to enable automated bug reporting and task creation from identified UI discrepancies.
                </p>
                <button 
                  onClick={handleConnect}
                  className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-xl shadow-blue-600/10 active:scale-95"
                >
                  <Trello size={20} />
                  Connect Your Jira
                </button>
             </div>
           )}
        </div>

        {/* Benefits Card */}
        <div className="p-8 rounded-3xl bg-zinc-950/50 border border-zinc-900 border-dashed space-y-6">
           <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Available Features</h3>
           <ul className="space-y-4">
              {[
                { icon: Zap, text: "Instant Issue Creation", desc: "Turn failed tests into Jira tickets" },
                { icon: CheckCircle2, text: "Sync Test Outcomes", desc: "Automated status updates on boards" },
                { icon: ExternalLink, text: "Direct Linkage", desc: "Embed vision analysis in Jira comments" }
              ].map((item, i) => (
                <li key={i} className="flex gap-4">
                   <div className="mt-1 text-blue-400"><item.icon size={18} /></div>
                   <div>
                      <p className="text-xs font-bold text-zinc-200">{item.text}</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">{item.desc}</p>
                   </div>
                </li>
              ))}
           </ul>
        </div>
      </div>

      {isConnected && (
        <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-1000 delay-200">
           <div className="p-8 rounded-3xl bg-[#0a0a0a] border border-zinc-800 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                 <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                    <Zap size={20} />
                 </div>
                 <h2 className="text-xl font-bold text-white">Generate from Ticket</h2>
              </div>

              <form onSubmit={handleGenerate} className="space-y-4">
                 <div className="relative group">
                    <input 
                      type="url"
                      placeholder="Paste Jira ticket link (e.g., https://your-domain.atlassian.net/browse/PROJ-123)"
                      value={ticketUrl}
                      onChange={(e) => setTicketUrl(e.target.value)}
                      className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 rounded-2xl py-4 px-6 text-white placeholder:text-zinc-600 outline-none transition-all pr-32"
                      required
                    />
                    <button 
                      type="submit"
                      disabled={isGenerating || !ticketUrl}
                      className="absolute right-2 top-2 bottom-2 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold text-sm transition-all flex items-center gap-2 group-hover:shadow-lg group-hover:shadow-blue-600/20 active:scale-95"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="animate-spin" size={16} />
                          Generating...
                        </>
                      ) : (
                        <>
                          Generate
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                 </div>
                 <p className="text-xs text-zinc-500 flex items-center gap-2 px-2">
                    <Clock size={12} />
                    LLM will analyze the ticket FRS and generate all possible test scenarios.
                 </p>
              </form>
           </div>

           {testCases && (
             <div className="p-8 rounded-3xl bg-[#0a0a0a] border border-zinc-800 shadow-2xl animate-in zoom-in-95 duration-500">
                <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-500/10 text-green-400">
                         <FileText size={20} />
                      </div>
                      <div>
                         <h3 className="text-lg font-bold text-white">Generated Test Cases</h3>
                         <p className="text-xs text-zinc-500 mt-0.5">Comprehensive scenarios based on ticket description</p>
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

                <div className="prose prose-invert prose-sm max-w-none bg-zinc-950/50 rounded-2xl p-6 border border-zinc-800/50 overflow-auto max-h-[600px] custom-scrollbar">
                   <ReactMarkdown>{testCases}</ReactMarkdown>
                </div>
             </div>
           )}
        </div>
      )}
    </div>
  );
}
