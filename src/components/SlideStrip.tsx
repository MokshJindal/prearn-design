import React, { useState } from 'react';
import { SlidePage, ThemeColors } from '../types/design';
import { 
  Plus, 
  Copy, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  Layers
} from 'lucide-react';

interface SlideStripProps {
  slides: SlidePage[];
  activeSlideIndex: number;
  onSelectSlide: (index: number) => void;
  onAddSlide: (category?: SlidePage['category']) => void;
  onDuplicateSlide: (index: number) => void;
  onDeleteSlide: (index: number) => void;
  onMoveSlide: (fromIndex: number, toIndex: number) => void;
  theme: ThemeColors;
  onAiAddNextSlide?: () => void;
  isAiAddingNext?: boolean;
}

export const SlideStrip: React.FC<SlideStripProps> = ({
  slides,
  activeSlideIndex,
  onSelectSlide,
  onAddSlide,
  onDuplicateSlide,
  onDeleteSlide,
  onMoveSlide,
  theme,
  onAiAddNextSlide,
  isAiAddingNext = false,
}) => {
  const [showAddMenu, setShowAddMenu] = useState(false);

  const slideTemplates: Array<{ category: SlidePage['category']; label: string }> = [
    { category: 'title', label: 'Title / Cover Hero' },
    { category: 'problem', label: 'The Problem (3 Friction Points)' },
    { category: 'solution', label: 'The Solution (Bento Architecture)' },
    { category: 'market', label: 'Market Opportunity (TAM/SAM/SOM)' },
    { category: 'traction', label: 'Traction & Key Metrics' },
    { category: 'competition', label: 'Competitive Matrix Table' },
    { category: 'team', label: 'Founding Team & Pedigree' },
    { category: 'financials', label: 'The Ask & 18-Month Plan' },
    { category: 'closing', label: 'Closing & Contact CTA' },
  ];

  return (
    <div className="h-28 px-4 py-2 border-t border-white/10 bg-[#121211] flex items-center gap-3 overflow-x-auto select-none">
      {/* Slide Thumbnails */}
      <div className="flex items-center gap-3">
        {slides.map((slide, idx) => {
          const isActive = idx === activeSlideIndex;
          return (
            <div
              key={slide.id}
              onClick={() => onSelectSlide(idx)}
              className={`group relative flex-shrink-0 w-36 h-20 rounded-xl cursor-pointer transition-all duration-150 p-2 flex flex-col justify-between overflow-hidden ${
                isActive
                  ? 'ring-2 ring-brand-500 shadow-glow bg-[#1E1E1C]'
                  : 'border border-white/10 hover:border-white/30 bg-[#161615]'
              }`}
              style={{
                backgroundColor: isActive ? '#1F1E1B' : '#141413',
              }}
            >
              {/* Top thumbnail bar */}
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-mono font-bold text-neutral-400 group-hover:text-white">
                  #{idx + 1}
                </span>
                <span className="font-mono uppercase tracking-wider text-[9px] text-brand-400 truncate max-w-[80px]">
                  {slide.category || slide.layout}
                </span>
              </div>

              {/* Miniature headline preview */}
              <div className="text-[11px] font-semibold text-neutral-200 line-clamp-2 leading-tight">
                {slide.headline}
              </div>

              {/* Miniature element indicators */}
              <div className="flex items-center gap-1 opacity-50">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-400" />
                <span className="text-[9px] text-neutral-400 font-mono">
                  {slide.elements.length} items
                </span>
              </div>

              {/* Hover quick action overlay */}
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                {idx > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveSlide(idx, idx - 1);
                    }}
                    className="p-1 rounded bg-white/10 hover:bg-white/20 text-white"
                    title="Move Left"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicateSlide(idx);
                  }}
                  className="p-1 rounded bg-white/10 hover:bg-white/20 text-white"
                  title="Duplicate Slide"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                {slides.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSlide(idx);
                    }}
                    className="p-1 rounded bg-red-500/20 hover:bg-red-500/40 text-red-400"
                    title="Delete Slide"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                {idx < slides.length - 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveSlide(idx, idx + 1);
                    }}
                    className="p-1 rounded bg-white/10 hover:bg-white/20 text-white"
                    title="Move Right"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Next Slide Button */}
      {onAiAddNextSlide && (
        <button
          onClick={onAiAddNextSlide}
          disabled={isAiAddingNext}
          className="flex-shrink-0 w-32 h-20 rounded-xl bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-purple-500/50 hover:border-purple-400 hover:from-purple-800/50 hover:to-indigo-800/50 transition-all flex flex-col items-center justify-center gap-1.5 text-purple-200 hover:text-white shadow-sm group disabled:opacity-50"
          title="Limitless expansion: Generate the next logical slide with Claude AI"
        >
          {isAiAddingNext ? (
            <Sparkles className="w-4 h-4 text-purple-400 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 text-purple-400 group-hover:scale-110 group-hover:rotate-12 transition-all" />
          )}
          <div className="text-center leading-tight">
            <span className="text-[11px] font-bold block">AI Next Slide</span>
            <span className="text-[9px] text-purple-300 font-mono">Limitless ✦</span>
          </div>
        </button>
      )}

      {/* Add New Slide Button with Template Popover */}
      <div className="relative flex-shrink-0">
        <button
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="w-32 h-20 rounded-xl border-2 border-dashed border-white/15 hover:border-brand-500/60 bg-white/[0.02] hover:bg-brand-500/5 transition-all flex flex-col items-center justify-center gap-1 text-neutral-400 hover:text-white group"
        >
          <Plus className="w-5 h-5 text-neutral-400 group-hover:text-brand-400 group-hover:scale-110 transition-transform" />
          <span className="text-[11px] font-semibold">Add Slide</span>
        </button>

        {showAddMenu && (
          <div className="absolute bottom-full mb-3 left-0 w-64 bg-[#1C1B19] border border-white/15 rounded-xl shadow-2xl p-2 z-50 animate-slideUp">
            <div className="px-2 py-1 text-[10px] font-mono uppercase text-neutral-500 font-bold tracking-wider">
              Choose Slide Archetype
            </div>
            <div className="space-y-1 mt-1 max-h-56 overflow-y-auto">
              {slideTemplates.map((t) => (
                <button
                  key={t.category}
                  onClick={() => {
                    onAddSlide(t.category);
                    setShowAddMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-neutral-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
