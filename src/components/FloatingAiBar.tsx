import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Wand2, 
  RefreshCw, 
  ChevronUp, 
  ChevronDown, 
  Layers, 
  Maximize2,
  X,
  Bot
} from 'lucide-react';
import { 
  generateFullDesignDocument, 
  generateOrRewriteSlide, 
  refineTextWithClaude,
  AVAILABLE_MODELS, 
  getStoredModel, 
  setStoredModel 
} from '../services/claude';
import { DesignDocument, SlidePage, DocumentType } from '../types/design';

interface FloatingAiBarProps {
  currentDocument: DesignDocument;
  currentSlide: SlidePage;
  onReplaceDocument: (doc: DesignDocument) => void;
  onUpdateSlide: (slide: SlidePage) => void;
  onAddGeneratedSlide: (slide: SlidePage) => void;
  activeThemeId: string;
}

export const FloatingAiBar: React.FC<FloatingAiBarProps> = ({
  currentDocument,
  currentSlide,
  onReplaceDocument,
  onUpdateSlide,
  onAddGeneratedSlide,
  activeThemeId,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mode, setMode] = useState<'slide' | 'full-doc'>('slide');
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>('pitch-deck');
  const [selectedModel, setSelectedModel] = useState(getStoredModel());
  const [statusMessage, setStatusMessage] = useState('');

  const quickPills = [
    { label: '🪄 Rewrite Punchier', prompt: 'Rewrite this card to be executive, ultra-punchy, and concise.' },
    { label: '📊 Add Stat Counters', prompt: 'Convert this card to feature 3 massive high-impact quantitative stat counters.' },
    { label: '▦ Bento Grid', prompt: 'Redesign this card into a modern asymmetrical Bento Grid.' },
    { label: '⚖️ Competitor Matrix', prompt: 'Transform this card into a 4-column competitor comparison matrix.' },
  ];

  const handleGenerate = async (customPrompt?: string) => {
    const finalPrompt = customPrompt || prompt;
    if (!finalPrompt.trim()) return;

    setIsLoading(true);
    setStatusMessage('Claude 3.7 Sonnet is designing...');

    try {
      if (mode === 'full-doc') {
        setStatusMessage('Architecting full pitch deck...');
        const newDoc = await generateFullDesignDocument(
          finalPrompt,
          selectedDocType,
          activeThemeId,
          selectedDocType === 'pitch-deck' ? '16:9' : 'a4-portrait'
        );
        onReplaceDocument(newDoc);
        setStatusMessage('✨ Complete deliverable created!');
        setPrompt('');
        setIsExpanded(false);
      } else {
        setStatusMessage('Refining and restructuring card...');
        const updatedSlide = await generateOrRewriteSlide(
          finalPrompt,
          currentSlide,
          currentDocument.title
        );
        onUpdateSlide(updatedSlide);
        setStatusMessage('✨ Card updated successfully!');
        setPrompt('');
      }
    } catch (err: any) {
      alert(`Claude Error: ${err.message}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4 flex flex-col items-center">
      {/* Quick Suggestion Pills (Gamma Style Floating Chips) */}
      {!isExpanded && (
        <div className="flex items-center gap-1.5 mb-2 overflow-x-auto max-w-full py-1 px-2 no-scrollbar animate-fadeIn">
          {quickPills.map((pill, idx) => (
            <button
              key={idx}
              onClick={() => handleGenerate(pill.prompt)}
              disabled={isLoading}
              className="flex-shrink-0 px-3 py-1 rounded-full gamma-glass hover:bg-white/10 border border-white/10 text-[11px] font-medium text-neutral-300 hover:text-white transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {pill.label}
            </button>
          ))}
          <button
            onClick={() => {
              setMode('full-doc');
              setIsExpanded(true);
            }}
            className="flex-shrink-0 px-3 py-1 rounded-full bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-[11px] font-semibold text-purple-200 transition-all shadow-sm"
          >
            ✦ Generate Full Deck
          </button>
        </div>
      )}

      {/* Main Floating Glass Bar */}
      <div className="w-full gamma-glass-floating rounded-2xl p-2 transition-all duration-300">
        {statusMessage && (
          <div className="px-3 py-1.5 mb-1.5 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-medium flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>{statusMessage}</span>
            </span>
          </div>
        )}

        {isExpanded ? (
          /* Expanded Modal View (Full Deck / Advanced Prompting) */
          <div className="p-3 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-white text-xs">Claude Design Co-Pilot</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex bg-black/40 rounded-lg p-0.5 border border-white/10 text-[11px]">
                  <button
                    onClick={() => setMode('slide')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      mode === 'slide' ? 'bg-purple-600 text-white' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Current Card
                  </button>
                  <button
                    onClick={() => setMode('full-doc')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      mode === 'full-doc' ? 'bg-purple-600 text-white' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    New Full Deck
                  </button>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {mode === 'full-doc' && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-neutral-400 font-mono text-[11px]">Format:</span>
                {(['pitch-deck', 'brochure', 'one-pager', 'flyer'] as DocumentType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedDocType(type)}
                    className={`px-2.5 py-1 rounded-lg text-xs capitalize transition-colors ${
                      selectedDocType === type
                        ? 'bg-purple-600/30 border border-purple-500 text-purple-200 font-semibold'
                        : 'border border-white/10 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {type.replace('-', ' ')}
                  </button>
                ))}
              </div>
            )}

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                mode === 'full-doc'
                  ? 'Describe your startup, company, or brief (e.g. "AI agents for supply chain raising $4M Seed, 10 slides")...'
                  : 'Instruct Claude to modify this card (e.g. "Add a 3-step traction metric block and darker tone")...'
              }
              rows={3}
              className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-purple-500 resize-none font-sans"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleGenerate();
                }
              }}
            />

            <div className="flex items-center justify-between pt-1">
              <div className="text-[10px] text-neutral-500 font-mono">
                Powered by Claude 3.7 Sonnet • Press Cmd + Enter
              </div>
              <button
                onClick={() => handleGenerate()}
                disabled={isLoading || !prompt.trim()}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-gamma-glow transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>{mode === 'full-doc' ? 'Create Full Deck' : 'Update Card'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Collapsed Floating Pill (Signature Gamma Bar) */
          <div className="flex items-center gap-2 px-2 py-1">
            <div className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>

            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask Claude AI to edit card, add content, or redesign..."
              className="flex-1 bg-transparent border-none text-xs text-white placeholder:text-neutral-400 focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleGenerate();
                }
              }}
            />

            <button
              onClick={() => setIsExpanded(true)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
              title="Expand to Full Prompt Studio"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => handleGenerate()}
              disabled={isLoading || !prompt.trim()}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-40"
            >
              {isLoading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <Send className="w-3 h-3" />
                  <span className="hidden sm:inline">Send</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
