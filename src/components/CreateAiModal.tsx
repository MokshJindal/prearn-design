import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Wand2, 
  RefreshCw, 
  Check, 
  Bot, 
  Layers,
  Crown
} from 'lucide-react';
import { DocumentType, AspectRatio } from '../types/design';
import { THEMES } from '../services/themes';
import { 
  generateFullDesignDocument, 
  AVAILABLE_MODELS, 
  getStoredModel, 
  setStoredModel 
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
  const [themeId, setThemeId] = useState<string>('gamma-cosmic');
  const [selectedModel, setSelectedModel] = useState<string>(getStoredModel());
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusText, setStatusText] = useState('');

  if (!isOpen) return null;

  const handleModelSelect = (id: string) => {
    setSelectedModel(id);
    setStoredModel(id);
  };

  const promptSuggestions = [
    'Autonomous AI supply chain platform raising $4M Seed round. Include friction points, multi-agent architecture, $85B TAM, $1.6M ARR traction with 148% NRR, and ex-DeepMind team.',
    'Luxury enterprise cybersecurity brochure for Zero-Trust cloud workloads with hardware root of trust, encrypted throughput, and SOC-2 compliance.',
    'B2B SaaS treasury management platform offering 5.2% yield on cash balances with multi-bank FDIC insurance.',
    'Frontier AI robotics developer conference flyer in San Francisco with 2,500 attendees and $1M venture pitch contest.',
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    try {
      setIsGenerating(true);
      const activeModelObj = AVAILABLE_MODELS.find(m => m.id === selectedModel);
      setStatusText(`${activeModelObj?.name || 'Claude'} is structuring narrative & design architecture...`);

      const aspectRatio: AspectRatio = docType === 'pitch-deck' ? '16:9' : docType === 'brochure' ? 'trifold' : 'a4-portrait';
      const newDoc = await generateFullDesignDocument(
        prompt,
        docType,
        themeId,
        aspectRatio,
        cardCount
      );

      setStatusText('Applying design tokens & vector layouts...');
      onCreated(newDoc);
      onClose();
    } catch (err: any) {
      alert(`Generation Error: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
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
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Create with Claude AI</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/20 text-purple-300 font-semibold">
                  GAMMA STUDIO
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Generate pitch decks, luxury brochures, or one-pagers with Opus, Sonnet & Fable.
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
          {/* 1. MODEL SELECTOR (Opus, Sonnet, Fable, Haiku) */}
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-2 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-purple-400" />
              <span>1. Choose Claude AI Engine</span>
            </label>
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
                  <div className="text-[11px] text-neutral-300 font-medium">{m.name.split('(')[0]}</div>
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
              2. What would you like to create?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { type: 'pitch-deck' as DocumentType, label: 'Presentation', desc: '16:9 Slides', icon: '📽️' },
                { type: 'brochure' as DocumentType, label: 'Brochure', desc: 'Tri-Fold Spread', icon: '📖' },
                { type: 'one-pager' as DocumentType, label: 'One-Pager', desc: 'Executive Brief', icon: '📄' },
                { type: 'flyer' as DocumentType, label: 'Flyer', desc: 'Launch Poster', icon: '🎨' },
              ].map((item) => (
                <button
                  key={item.type}
                  onClick={() => setDocType(item.type)}
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
                3. Describe what you want to create
              </label>
              <span className="text-[11px] text-neutral-500">Be as specific or brief as you like</span>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                docType === 'brochure'
                  ? 'e.g., A luxury corporate brochure for an elite AI venture studio, covering our philosophy, 3 core innovation pillars, enterprise case studies, and London/SF contact details...'
                  : 'e.g., A pitch deck for an autonomous enterprise AI platform raising $4M Seed round, highlighting friction points, multi-agent architecture, $1.4M ARR traction, and team...'
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

          {/* 4. Theme & Cards Count */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/5">
            {/* Card Count */}
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-2 uppercase tracking-wider font-mono">
                4. {docType === 'brochure' ? 'Brochure Panels' : 'Card Count'}: <span className="text-purple-400 font-bold">{docType === 'brochure' ? '3 Panels' : `${cardCount} Cards`}</span>
              </label>
              {docType === 'brochure' ? (
                <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-medium">
                  📖 Tri-Fold Panoramic Spread (Cover, Inside, Back)
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {[4, 6, 8, 10, 12].map((cnt) => (
                    <button
                      key={cnt}
                      onClick={() => setCardCount(cnt)}
                      className={`flex-1 py-1.5 rounded-xl border text-xs font-mono font-semibold transition-all ${
                        cardCount === cnt
                          ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                          : 'bg-white/[0.02] border-white/10 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {cnt}
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
              <div className="grid grid-cols-2 gap-2">
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
            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-purple-400 animate-spin" />
              <div>
                <div className="text-xs font-bold text-white">Generating with Claude...</div>
                <div className="text-[11px] text-purple-300">{statusText}</div>
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
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Generate with Claude</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
