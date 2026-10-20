import React from 'react';
import { SlidePage, ThemeColors } from '../types/design';
import { 
  Plus, 
  Copy, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Sparkles, 
  PanelLeftClose, 
  PanelLeft,
  Layers,
  FileText
} from 'lucide-react';

interface CardOutlineProps {
  slides: SlidePage[];
  activeSlideIndex: number;
  onSelectSlide: (index: number) => void;
  onAddSlide: (category?: SlidePage['category']) => void;
  onDuplicateSlide: (index: number) => void;
  onDeleteSlide: (index: number) => void;
  onMoveSlide: (fromIndex: number, toIndex: number) => void;
  isOpen: boolean;
  onToggle: () => void;
  theme: ThemeColors;
  onAiAddNextSlide?: () => void;
  isAiAddingNext?: boolean;
}

export const CardOutline: React.FC<CardOutlineProps> = ({
  slides,
  activeSlideIndex,
  onSelectSlide,
  onAddSlide,
  onDuplicateSlide,
  onDeleteSlide,
  onMoveSlide,
  isOpen,
  onToggle,
  theme,
  onAiAddNextSlide,
  isAiAddingNext = false,
}) => {
  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed left-4 top-20 z-30 p-2 rounded-xl gamma-glass hover:bg-white/10 text-neutral-400 hover:text-white transition-all shadow-lg"
        title="Open Cards Outline"
      >
        <PanelLeft className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="w-64 h-full border-r border-white/5 bg-[#0C0D12]/95 backdrop-blur-xl flex flex-col justify-between text-xs text-neutral-300 select-none z-20 flex-shrink-0 animate-fadeIn">
      {/* Top Header */}
      <div className="p-3.5 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-400" />
          <span className="font-bold text-white text-xs tracking-wide">Cards Outline</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-white/5 text-neutral-400 font-semibold">
            {slides.length}
          </span>
        </div>
        <button
          onClick={onToggle}
          className="p-1 rounded-lg hover:bg-white/10 text-neutral-500 hover:text-white transition-colors"
          title="Collapse outline"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* Vertical Card List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
        {slides.map((slide, idx) => {
          const isActive = idx === activeSlideIndex;

          return (
            <div
              key={slide.id}
              onClick={() => onSelectSlide(idx)}
              className={`group relative p-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                isActive
                  ? 'bg-purple-600/15 border border-purple-500/40 text-white shadow-sm'
                  : 'hover:bg-white/[0.04] border border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-1">
                <span className="font-mono text-[10px] font-bold opacity-50 w-4 text-right flex-shrink-0">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div className="truncate">
                  <div className="font-medium text-xs truncate">
                    {slide.headline || 'Untitled Card'}
                  </div>
                  <div className="text-[10px] font-mono opacity-50 uppercase tracking-wider truncate">
                    {slide.category || slide.layout}
                  </div>
                </div>
              </div>

              {/* Hover Quick Actions */}
              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 flex-shrink-0 transition-opacity">
                {idx > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveSlide(idx, idx - 1);
                    }}
                    className="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-white"
                    title="Move Up"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                )}
                {idx < slides.length - 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveSlide(idx, idx + 1);
                    }}
                    className="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-white"
                    title="Move Down"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicateSlide(idx);
                  }}
                  className="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-white"
                  title="Duplicate"
                >
                  <Copy className="w-3 h-3" />
                </button>
                {slides.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSlide(idx);
                    }}
                    className="p-1 rounded hover:bg-red-500/20 text-neutral-400 hover:text-red-400"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom: Add Card Actions */}
      <div className="p-2.5 border-t border-white/5 bg-[#0C0D12] space-y-1.5">
        {onAiAddNextSlide && (
          <button
            onClick={onAiAddNextSlide}
            disabled={isAiAddingNext}
            className="w-full py-2 px-3 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 hover:text-white font-medium text-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            title="Generate the next sequential slide with Claude AI"
          >
            <Sparkles className={`w-3.5 h-3.5 text-purple-400 ${isAiAddingNext ? 'animate-spin' : ''}`} />
            <span>✦ AI Next Card</span>
          </button>
        )}
        <button
          onClick={() => onAddSlide('solution')}
          className="w-full py-2 px-3 rounded-xl border border-dashed border-white/15 hover:border-purple-500/50 hover:bg-purple-500/5 text-neutral-400 hover:text-white font-medium text-xs transition-all flex items-center justify-center gap-2 group"
        >
          <Plus className="w-3.5 h-3.5 text-neutral-400 group-hover:text-purple-400 group-hover:scale-110 transition-transform" />
          <span>Add Blank Card</span>
        </button>
      </div>
    </div>
  );
};
