import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Wand2, 
  RefreshCw, 
  Check, 
  Bot, 
  Crown,
  AlertCircle,
  CheckCircle2,
  Infinity,
  Plus,
  Minus,
  Sliders
} from 'lucide-react';
import { DocumentType, AspectRatio } from '../types/design';
import { THEMES } from '../services/themes';
import { 
  generateFullDesignDocument, 
  AVAILABLE_MODELS, 
  getStoredModel, 
  setStoredModel,
  getStoredApiKey
} from '../services/claude';
import { DesignDocument } from '../types/design';

interface CreateAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (doc: DesignDocument) => void;
}

export const CreateAiModal: React.FC<CreateAiModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [docType, setDocType] = useState<DocumentType>('pitch-deck');
  const [prompt, setPrompt] = useState('');
  const [cardCount, setCardCount] = useState<number>(8);
  const [isCustomCount, setIsCustomCount] = useState<boolean>(false);
  const [themeId, setThemeId] = useState<string>('gamma-cosmic');
  const [selectedModel, setSelectedModel] = useState<string>(getStoredModel());
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [errorText, setErrorText] = useState<string | null>(null);

  const hasApiKey = Boolean(getStoredApiKey());

  if (!isOpen) return null;

  const handleModelSelect = (id: string) => {
    setSelectedModel(id);
    setStoredModel(id);
  };

  const promptSuggestions = [
    'Autonomous enterprise AI agent orchestrator raising $6M Series A: $90B TAM, $2.4M ARR, 160% NRR, Fortune 500 pilots, and ex-DeepMind team.',
    'Ultra-luxury corporate wealth management brochure detailing family office advisory, private equity allocations, global tax alpha, and Zurich/Mayfair offices.',
    'Decentralized GPU compute network pitch deck showing 80% cost savings vs AWS, proof of physical work, tokenomics, and 12,000 active nodes.',
    'AI Healthcare diagnostics platform detecting cardiac anomalies 3 years before clinical onset, FDA breakthrough status, and Johns Hopkins clinical trials.',
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    try {
      setIsGenerating(true);
      setErrorText(null);
      setProgressPercent(10);
      const activeModelObj = AVAILABLE_MODELS.find(m => m.id === selectedModel);
      setStatusText(`Initializing ${activeModelObj?.name?.split('(')[0] || 'Claude AI'}...`);

      const targetSlides = docType === 'brochure' ? cardCount : cardCount;
      const aspectRatio: AspectRatio = docType === 'pitch-deck' ? '16:9' : docType === 'brochure' ? 'trifold' : 'a4-portrait';

      const newDoc = await generateFullDesignDocument(
        prompt,
        docType,
        themeId,
        aspectRatio,
        targetSlides,
        (status, percent) => {
          setStatusText(status);
          if (percent !== undefined) setProgressPercent(percent);
        }
      );

      setProgressPercent(100);
      setStatusText('Complete! Opening canvas...');
      onCreated(newDoc);
      onClose();
    } catch (err: any) {
      console.error('Generation Error:', err);
      setErrorText(err.message || 'Generation failed. Please check your API key or model selection.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAdjustCardCount = (delta: number) => {
    setCardCount(prev => Math.max(1, Math.min(prev + delta, 60)));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#12131C] border border-white/10 rounded-3xl shadow-2xl overflow-hidden text-neutral-200 animate-slideUp">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#151724]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-gamma-glow">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Create with Claude AI</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30 flex items-center gap-1">
                  <Infinity className="w-3 h-3 text-purple-400" />
                  <span>LIMITLESS SUITE</span>
                </span>
                {hasApiKey && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>API Connected</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400">
                Architect presentations, luxury brochures, or whitepapers with no arbitrary slide limits.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Error Banner */}
          {errorText && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-200 text-xs flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-bold text-white mb-0.5">Generation Error</div>
                <div>{errorText}</div>
                <div className="mt-2 text-[11px] text-red-300">
                  Tip: Ensure your Claude API key is active. You can verify or update your key anytime in Settings (⚙️).
                </div>
              </div>
            </div>
          )}

          {/* 1. MODEL SELECTOR */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-purple-400" />
                <span>1. Choose Claude AI Engine</span>
              </label>
              <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                8192 Token Buffer
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {AVAILABLE_MODELS.slice(0, 3).map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleModelSelect(m.id)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    selectedModel === m.id
                      ? 'bg-purple-600/20 border-purple-500 text-white shadow-sm ring-1 ring-purple-500'
                      : 'bg-white/[0.02] border-white/10 text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-white flex items-center gap-1">
                      {m.category === 'Opus' && <Crown className="w-3 h-3 text-amber-400" />}
                      {m.category === 'Sonnet' && <Sparkles className="w-3 h-3 text-purple-400" />}
                      {m.category === 'Fable' && <Wand2 className="w-3 h-3 text-cyan-400" />}
                      <span>{m.category}</span>
                    </span>
                    {selectedModel === m.id && <Check className="w-3.5 h-3.5 text-purple-400" />}
                  </div>
                  <div className="text-[11px] text-neutral-300 font-medium truncate">{m.name.split('(')[0]}</div>
                  <div className="text-[10px] text-neutral-400 mt-1 line-clamp-2 leading-tight">
                    {m.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Deliverable Format */}
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-2 uppercase tracking-wider font-mono">
              2. Deliverable Format
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { type: 'pitch-deck' as DocumentType, label: 'Presentation', desc: '16:9 Pitch Deck', icon: '📽️' },
                { type: 'brochure' as DocumentType, label: 'Brochure', desc: 'Tri-Fold Spread', icon: '📖' },
                { type: 'one-pager' as DocumentType, label: 'One-Pager', desc: 'Executive Brief', icon: '📄' },
                { type: 'flyer' as DocumentType, label: 'Flyer', desc: 'Launch Poster', icon: '🎨' },
              ].map((item) => (
                <button
                  key={item.type}
                  onClick={() => {
                    setDocType(item.type);
                    if (item.type === 'brochure') {
                      setCardCount(3);
                    } else if (cardCount < 5) {
                      setCardCount(8);
                    }
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    docType === item.type
                      ? 'bg-purple-600/20 border-purple-500 text-white shadow-sm ring-1 ring-purple-500'
                      : 'bg-white/[0.02] border-white/10 text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="text-xl block mb-1">{item.icon}</span>
                  <div className="font-bold text-xs text-white">{item.label}</div>
                  <div className="text-[10px] text-neutral-400">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Prompt Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider font-mono">
                3. Describe Your Vision
              </label>
              <span className="text-[11px] text-neutral-500">Provide prompt or paste outline</span>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                docType === 'brochure'
                  ? 'e.g., A luxury corporate brochure for an elite AI venture studio, covering our philosophy, 3 core innovation pillars, enterprise case studies, and London/SF contact details...'
                  : 'e.g., A comprehensive pitch deck for an autonomous enterprise AI platform raising $4M Seed round, highlighting friction points, multi-agent architecture, $1.8M ARR traction, competitor matrix, and team...'
              }
              rows={4}
              className="w-full bg-[#0E0F17] border border-white/10 rounded-2xl p-4 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-purple-500 transition-colors resize-none font-sans"
            />

            {/* Quick Inspiration Pills */}
            <div className="mt-2.5">
              <div className="text-[10px] uppercase font-mono text-neutral-500 font-semibold mb-1.5">
                Quick inspiration ideas:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {promptSuggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPrompt(sug)}
                    className="text-left px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/10 border border-white/5 text-[11px] text-neutral-300 hover:text-white transition-colors truncate max-w-md"
                  >
                    💡 {sug.slice(0, 50)}...
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Limitless Slide / Panel Count & Theme */}
          <div className="pt-3 border-t border-white/10 space-y-4">
            {/* Card Count Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Infinity className="w-3.5 h-3.5 text-purple-400" />
                  <span>4. {docType === 'brochure' ? 'Brochure Panels' : 'Deck Slide Count'}:</span>
                  <span className="text-purple-400 font-bold font-mono">
                    {cardCount} {docType === 'brochure' ? 'Panels' : 'Cards'}
                  </span>
                </label>
                <button
                  onClick={() => setIsCustomCount(!isCustomCount)}
                  className="text-[11px] text-purple-300 hover:text-purple-200 underline font-mono flex items-center gap-1"
                >
                  <Sliders className="w-3 h-3" />
                  <span>{isCustomCount ? 'Use Presets' : 'Custom Number'}</span>
                </button>
              </div>

              {docType === 'brochure' ? (
                /* Brochure Panel Options */
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { cnt: 3, label: '3-Panel', desc: 'Tri-Fold Spread' },
                    { cnt: 4, label: '4-Panel', desc: 'Gate Fold' },
                    { cnt: 6, label: '6-Panel', desc: 'Corporate Spread' },
                    { cnt: 8, label: '8-Panel', desc: 'Magazine Booklet' },
                  ].map(({ cnt, label, desc }) => (
                    <button
                      key={cnt}
                      onClick={() => setCardCount(cnt)}
                      className={`p-2.5 rounded-2xl border text-center transition-all ${
                        cardCount === cnt
                          ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                          : 'bg-white/[0.02] border-white/10 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <div className="font-bold text-xs">{label}</div>
                      <div className="text-[9px] opacity-70 mt-0.5">{desc}</div>
                    </button>
                  ))}
                </div>
              ) : isCustomCount ? (
                /* Custom Unlimited Number Stepper */
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>Limitless Slide Generator</span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        Zero Cap
                      </span>
                    </div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">
                      Decks with &gt;8 slides are automatically multi-batch processed without token clipping.
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAdjustCardCount(-1)}
                      className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={cardCount}
                      onChange={(e) => setCardCount(Math.max(1, Math.min(parseInt(e.target.value) || 1, 60)))}
                      className="w-16 text-center py-1.5 rounded-xl bg-black/50 border border-purple-500/50 text-white font-mono font-bold text-sm focus:outline-none"
                    />
                    <button
                      onClick={() => handleAdjustCardCount(1)}
                      className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Standard Limitless Presets */
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { cnt: 5, label: '5 Cards', desc: 'Pitch Teaser' },
                    { cnt: 8, label: '8 Cards', desc: 'Standard Deck' },
                    { cnt: 12, label: '12 Cards', desc: 'Full Narrative' },
                    { cnt: 16, label: '16 Cards', desc: 'Deep Dive' },
                    { cnt: 20, label: '20+ Cards', desc: 'Master Deck' },
                  ].map(({ cnt, label, desc }) => (
                    <button
                      key={cnt}
                      onClick={() => setCardCount(cnt)}
                      className={`p-2 rounded-2xl border text-center transition-all ${
                        cardCount === cnt
                          ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                          : 'bg-white/[0.02] border-white/10 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <div className="font-bold text-xs">{label}</div>
                      <div className="text-[9px] opacity-70 mt-0.5">{desc}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Picker */}
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-2 uppercase tracking-wider font-mono">
                5. Visual Theme
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {THEMES.slice(0, 4).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setThemeId(t.id)}
                    className={`p-2 rounded-xl border flex items-center justify-between text-left transition-all ${
                      themeId === t.id
                        ? 'bg-purple-600/20 border-purple-500 text-white'
                        : 'bg-white/[0.02] border-white/10 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: t.primary }}
                      />
                      <span className="text-xs truncate">{t.name.split('(')[0]}</span>
                    </div>
                    {themeId === t.id && <Check className="w-3 h-3 text-purple-400" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Progress / Status indicator */}
          {isGenerating && (
            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-purple-400 animate-spin" />
                  <span className="text-xs font-bold text-white">{statusText}</span>
                </div>
                {progressPercent > 0 && (
                  <span className="text-xs font-mono font-bold text-purple-300">{progressPercent}%</span>
                )}
              </div>
              <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300 rounded-full"
                  style={{ width: `${Math.max(progressPercent, 12)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-[#151724] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl hover:bg-white/10 text-neutral-400 hover:text-white text-xs font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-gamma-glow transition-all flex items-center gap-2 disabled:opacity-40 disabled:pointer-events-none"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generating {cardCount} Cards...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Generate {cardCount} {docType === 'brochure' ? 'Panels' : 'Cards'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
