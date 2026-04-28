/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Languages, 
  ChevronRight,
  Loader2,
  Copy,
  Check,
  BrainCircuit,
  MessageSquare,
  Search,
  Zap,
  Globe,
  Settings2,
  Terminal,
  Activity
} from 'lucide-react';
import { translateText, detectLanguage } from './services/gemini';
import { ALL_LANGUAGES } from './constants';

export default function App() {
  const [inputText, setInputText] = useState('');
  const [output, setOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [detectedLang, setDetectedLang] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [targetLang, setTargetLang] = useState('Spanish');
  const [langSearch, setLangSearch] = useState('');
  const [isLangOpen, setIsLangOpen] = useState(false);

  const filteredLanguages = useMemo(() => 
    ALL_LANGUAGES.filter(l => l.toLowerCase().includes(langSearch.toLowerCase())),
    [langSearch]
  );

  const handleProcess = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setOutput(null);
    try {
      const result = await translateText(inputText, targetLang);
      // Clean up common LLM artifacts like surrounding quotes
      const cleanResult = result.trim().replace(/^["'](.*)["']$/s, '$1');
      setOutput(cleanResult);
    } catch (error: any) {
      console.error(error);
      let errorMessage = "Translation module encountered an unexpected state.";
      
      if (error?.message?.toLowerCase().includes("api key") || error?.message?.toLowerCase().includes("unauthorized")) {
        errorMessage = "Gemini API key is invalid or not configured. Please ensure it's set in the 'Secrets' tab of settings.";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setOutput(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDetect = async () => {
    if (!inputText.trim()) return;
    setDetecting(true);
    try {
      const lang = await detectLanguage(inputText);
      setDetectedLang(lang);
    } catch (error: any) {
      console.error("Detection Error:", error);
    } finally {
      setDetecting(false);
    }
  };

  const copyToClipboard = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const metrics = {
    chars: inputText.length,
    words: inputText.split(/\s+/).filter(Boolean).length,
    readingTime: Math.ceil(inputText.split(/\s+/).filter(Boolean).length / 225) || 0
  };

  return (
    <div className="min-h-screen bg-studio-bg selection:bg-studio-accent/30 flex flex-col">
      {/* Top Header */}
      <header className="h-20 glass-obsidian border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-studio-accent rounded-xl shadow-lg shadow-studio-accent/30">
            <BrainCircuit className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-display font-bold bg-gradient-to-br from-white to-slate-500 bg-clip-text text-transparent uppercase tracking-tight">
            Translation Studio
          </h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-4 bg-white/5 rounded-full px-4 py-1.5 border border-white/5">
            <div className="text-center">
              <p className="text-[10px] text-slate-500 uppercase leading-none mb-0.5 tracking-tight">Words</p>
              <p className="text-xs font-mono font-bold text-white">{metrics.words}</p>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div className="text-center">
              <p className="text-[10px] text-slate-500 uppercase leading-none mb-0.5 tracking-tight">Read Time</p>
              <p className="text-xs font-mono font-bold text-white leading-none">{metrics.readingTime}m</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workbench */}
      <main className="flex-1 relative flex flex-col overflow-y-auto">
        <div className="p-6 sm:p-10 max-w-7xl mx-auto w-full flex-1 space-y-10 pb-20">
          <div className="grid lg:grid-cols-2 gap-10 h-full">
            <section className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-studio-accent/20 rounded-lg">
                    <MessageSquare className="w-4 h-4 text-studio-accent" />
                  </div>
                  <div>
                    <h3 className="text-lg font-display font-medium text-white tracking-tight leading-none mb-1">Source Material</h3>
                    {detectedLang && (
                      <span className="text-[10px] font-mono text-studio-accent uppercase tracking-widest animate-in fade-in slide-in-from-left-1">
                        Detected: {detectedLang}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDetect}
                    disabled={detecting || !inputText.trim()}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-tighter text-slate-400 hover:text-white hover:bg-studio-accent/20 transition-all disabled:opacity-30"
                  >
                    {detecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
                    Detect Language
                  </button>

                  <div className="relative">
                  <button 
                    onClick={() => setIsLangOpen(!isLangOpen)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-medium hover:bg-white/10 transition-all text-white min-w-[140px] justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Globe className="w-3 h-3 text-cyan-400" />
                      {targetLang}
                    </span>
                    <ChevronRight className={`w-3 h-3 transition-transform ${isLangOpen ? 'rotate-90' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {isLangOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-full mt-2 w-72 h-[380px] bg-[#111827] border border-white/10 rounded-2xl shadow-2xl z-50 flex flex-col p-2 backdrop-blur-2xl"
                      >
                        <div className="relative p-2">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input 
                            value={langSearch}
                            onChange={(e) => setLangSearch(e.target.value)}
                            placeholder="Find target language..."
                            className="w-full bg-slate-900 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-studio-accent/50 text-white"
                          />
                        </div>
                        <div className="flex-1 overflow-y-auto px-1 space-y-0.5 custom-scrollbar">
                          {filteredLanguages.map(lang => (
                            <button
                              key={lang}
                              onClick={() => { setTargetLang(lang); setIsLangOpen(false); }}
                              className={`w-full text-left px-4 py-2 text-sm rounded-xl transition-all ${targetLang === lang ? 'bg-studio-accent text-white' : 'hover:bg-white/5 text-slate-400 hover:text-white'}`}
                            >
                              {lang}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div className="relative flex-1 group">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Insert text for translation..."
                  className="studio-input h-full min-h-[400px] lg:min-h-0 resize-none font-sans"
                />
                <div className="absolute top-4 right-4 text-slate-800 pointer-events-none group-focus-within:opacity-10 transition-opacity">
                  <Zap className="w-12 h-12" />
                </div>
              </div>

              <button
                onClick={handleProcess}
                disabled={loading || !inputText.trim()}
                className="w-full py-5 bg-gradient-to-r from-studio-accent to-indigo-600 hover:brightness-110 disabled:grayscale disabled:opacity-50 text-white font-display font-bold text-lg rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-studio-accent/20 active:scale-[0.98]"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Languages className="w-6 h-6" />}
                {loading ? 'Processing...' : 'TRANSLATE'}
              </button>
            </section>

            <section className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-500/20 rounded-lg">
                    <Activity className="w-4 h-4 text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-display font-medium text-white tracking-tight">Translated Result</h3>
                </div>
                
                {output && (
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg text-[10px] font-bold uppercase tracking-tighter text-slate-500 hover:text-white transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied' : 'Export Result'}
                  </button>
                )}
              </div>

              <div className="flex-1 glass-obsidian rounded-2xl p-8 relative overflow-hidden flex flex-col min-h-[400px]">
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex-1 flex flex-col items-center justify-center text-center rounded-xl bg-slate-900/40 p-4 border border-white/5"
                    >
                      <div className="relative">
                        <div className="w-20 h-20 border-4 border-studio-accent/20 border-t-studio-accent rounded-full animate-spin" />
                        <div className="absolute inset-2 border-2 border-cyan-500/20 border-b-cyan-400 rounded-full animate-spin-reverse" />
                      </div>
                      <p className="mt-8 text-xl font-display font-bold text-white tracking-widest animate-pulse uppercase">Translating Text</p>
                      <p className="text-xs font-mono text-slate-500 mt-2 tracking-tight">Neural stream active for {targetLang}</p>
                    </motion.div>
                  ) : output ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                      className="flex-1 overflow-y-auto custom-scrollbar pr-2"
                    >
                      <div className="text-slate-200 leading-[1.8] text-lg lg:text-xl font-sans font-light selection:bg-studio-accent/50 py-4">
                        {output}
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-10 text-center grayscale opacity-10 pointer-events-none">
                      <Languages className="w-32 h-32 mb-6" />
                      <p className="text-2xl font-display font-bold tracking-[0.2em]">STANDBY</p>
                      <p className="font-mono text-xs mt-2 text-slate-500 uppercase tracking-widest">Awaiting system input for translation</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </section>
          </div>
        </div>

        <footer className="px-8 py-6 border-t border-white/5 glass-obsidian flex justify-between items-center gap-4 mt-auto">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
               <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Global Node Active</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="text-[10px] font-mono text-slate-600">v2.5.0-translate-only</div>
          </div>
          
          <div className="flex items-center gap-4">
            <Settings2 className="w-4 h-4 text-slate-600 hover:text-white cursor-pointer transition-colors" />
            <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Gemini v3 Engine
            </div>
          </div>
        </footer>
      </main>

      <style>{`
        @keyframes spin-reverse {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        .animate-spin-reverse {
          animation: spin-reverse 1.5s linear infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139,92,246,0.3);
        }
      `}</style>
    </div>
  );
}
