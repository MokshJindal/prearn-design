import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  Zap, 
  Wand2, 
  RefreshCw, 
  ChevronDown, 
  Layers, 
  Sliders, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  generateFullDesignDocument, 
  generateOrRewriteSlide, 
  AVAILABLE_MODELS, 
  getStoredModel, 
  setStoredModel 
} from '../services/claude';
import { DesignDocument, SlidePage, DocumentType } from '../types/design';

interface SidebarAIProps {
  currentDocument: DesignDocument;
  currentSlide: SlidePage;
  onReplaceDocument: (doc: DesignDocument) => void;
  onUpdateSlide: (slide: SlidePage) => void;
  onAddGeneratedSlide: (slide: SlidePage) => void;
  activeThemeId: string;
}

export const SidebarAI: React.FC<SidebarAIProps> = ({
  currentDocument,
  currentSlide,
  onReplaceDocument,
  onUpdateSlide,
  onAddGeneratedSlide,
  activeThemeId,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'slide' | 'full-doc'>('slide');
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>('pitch-deck');
  const [selectedModel, setSelectedModel] = useState<string>(getStoredModel());
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    setStoredModel(modelId);
  };

  const handleGenerate = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const finalPrompt = customPrompt || prompt;
    if (!finalPrompt.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      if (mode === 'full-doc') {
        setStatusMessage('Claude is architecting complete multi-slide deliverable...');
        const newDoc = await generateFullDesignDocument(
          finalPrompt,
          selectedDocType,
          activeThemeId,
          selectedDocType === 'pitch-deck' ? '16:9' : 'a4-portrait'
        );
        onReplaceDocument(newDoc);
        setStatusMessage('Complete design generated successfully!');
        setPrompt('');
      } else {
        setStatusMessage('Claude is designing and optimizing slide...');
        const updatedSlide = await generateOrRewriteSlide(
          finalPrompt,
          currentSlide,
          currentDocument.title
        );
        onUpdateSlide(updatedSlide);
        setStatusMessage('Slide updated with new layout & copy!');
        setPrompt('');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during Claude generation.');
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatusMessage(''), 4000);
    }
  };

  const quickPrompts = [
    {
      label: 'YC Seed Deck (AI Agents)',
      prompt: 'A seed pitch deck for an Autonomous Enterprise AI Agent platform raising $4M. Include problem of enterprise SaaS fragmentation, multi-agent solution, $90B TAM, $1.8M ARR traction with 150% NRR, competitor matrix, and ex-DeepMind team.',
      mode: 'full-doc' as const,
      docType: 'pitch-deck' as const,
    },
    {
      label: 'Corporate Tri-Fold Brochure',
      prompt: 'A sleek, luxury enterprise security brochure for a zero-trust cybersecurity cloud platform with hardware root-of-trust, zero-latency throughput, and SOC-2 compliance.',
      mode: 'full-doc' as const,
      docType: 'brochure' as const,
    },
    {
      label: 'Add Competitor Matrix',
      prompt: 'Transform this slide into a comprehensive 4-column competitor comparison matrix contrasting us with legacy solutions across security, latency, and cost.',
      mode: 'slide' as const,
    },
    {
      label: 'Rewrite with High-Value Stats',
      prompt: 'Rewrite this slide to be data-heavy and quantitative, featuring 3 massive stat blocks with MoM percentage improvements.',
      mode: 'slide' as const,
    },
    {
      label: 'Bento Grid Architecture',
      prompt: 'Redesign this slide as an asymmetrical Bento Grid showcasing 3 core product pillars with punchy tags.',
      mode: 'slide' as const,
    },
  ];

  return (
    <div className="w-80 sm:w-96 h-full border-l border-white/10 bg-[#141413] flex flex-col justify-between text-neutral-200 select-none">
      {/* Top Header */}
      <div className="p-4 border-b border-white/10 bg-[#161615]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Claude Design Copilot</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-brand-500/20 text-brand-300 font-semibold">
                  3.7
                </span>
              </h2>
              <p className="text-[11px] text-neutral-400">AI Graphic & Presentation Architect</p>
            </div>
          </div>
        </div>

        {/* Model Selector */}
        <div className="mb-3">
          <label className="text-[10px] font-mono uppercase text-neutral-400 font-semibold block mb-1">
            Active Claude Model
          </label>
          <select
            value={selectedModel}
            onChange={(e) => handleModelChange(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-brand-500 font-sans"
          >
            {AVAILABLE_MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* Mode Toggle: Current Slide vs Entire Document */}
        <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-black/40 border border-white/10 text-xs">
          <button
            onClick={() => setMode('slide')}
            className={`py-1.5 rounded font-medium transition-all ${
              mode === 'slide'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Edit Current Slide
          </button>
          <button
            onClick={() => setMode('full-doc')}
            className={`py-1.5 rounded font-medium transition-all ${
              mode === 'full-doc'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            New Full Deliverable
          </button>
        </div>

        {/* Document Type Picker (if Full Doc mode) */}
        {mode === 'full-doc' && (
          <div className="mt-2.5">
            <label className="text-[10px] font-mono uppercase text-neutral-400 font-semibold block mb-1">
              Deliverable Format
            </label>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {(['pitch-deck', 'brochure', 'one-pager', 'flyer'] as DocumentType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedDocType(type)}
                  className={`px-2 py-1.5 rounded-lg border text-left capitalize transition-colors ${
                    selectedDocType === type
                      ? 'bg-brand-500/20 border-brand-500 text-brand-300 font-semibold'
                      : 'bg-white/[0.02] border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  {type.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Middle Scrollable Section: Quick Prompts & Tips */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {statusMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="text-xs">{error}</div>
          </div>
        )}

        {/* Quick Inspiration Prompts */}
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-bold mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>Instant Design Directives</span>
          </div>
          <div className="space-y-2">
            {quickPrompts.map((item, idx) => (
              <button
                key={idx}
                disabled={isLoading}
                onClick={() => {
                  setMode(item.mode);
                  if (item.docType) setSelectedDocType(item.docType);
                  handleGenerate(undefined, item.prompt);
                }}
                className="w-full text-left p-2.5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-brand-500/40 transition-all group disabled:opacity-50"
              >
                <div className="font-semibold text-neutral-200 group-hover:text-brand-300 flex items-center justify-between">
                  <span>{item.label}</span>
                  <span className="text-[10px] font-mono opacity-50 uppercase">
                    {item.mode === 'full-doc' ? 'Full Deck' : 'Slide'}
                  </span>
                </div>
                <div className="text-[11px] text-neutral-400 line-clamp-2 mt-1 leading-normal">
                  {item.prompt}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Pro Tip Card */}
        <div className="p-3 rounded-xl bg-[#1A1917] border border-white/10 text-neutral-400 text-[11px] leading-relaxed">
          <span className="font-bold text-neutral-200 block mb-1">💡 Canva-grade Live Control:</span>
          You don't need to re-prompt Claude for small changes! Click directly on any text, number, or title on the canvas to edit it instantly in real-time.
        </div>
      </div>

      {/* Bottom Prompt Input Area */}
      <div className="p-4 border-t border-white/10 bg-[#161615]">
        <form onSubmit={handleGenerate} className="space-y-2">
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                mode === 'full-doc'
                  ? `Describe the company, product, or brief to generate complete ${selectedDocType}...`
                  : 'Instruct Claude to modify this slide (e.g. "Add a 3-step traction metric block")...'
              }
              rows={3}
              disabled={isLoading}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-brand-500 resize-none font-sans"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleGenerate();
                }
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-xs tracking-wide shadow-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Claude is Designing...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>{mode === 'full-doc' ? 'Generate Full Deliverable' : 'Update Slide with Claude'}</span>
              </>
            )}
          </button>
          <div className="text-[10px] text-center text-neutral-500 font-mono">
            Press Cmd + Enter to generate
          </div>
        </form>
      </div>
    </div>
  );
};
