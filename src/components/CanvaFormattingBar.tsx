import React from 'react';
import { 
  Plus, 
  Layout, 
  Type, 
  Image as ImageIcon, 
  Quote, 
  TrendingUp, 
  Smartphone, 
  Monitor, 
  MessageSquare, 
  Sparkles,
  ChevronDown,
  Layers,
  History
} from 'lucide-react';
import { AspectRatio, Collaborator, SlideComment } from '../types/design';

interface CanvaFormattingBarProps {
  onOpenElementsDrawer: () => void;
  onOpenCommentsDrawer: () => void;
  onOpenVersionHistory: () => void;
  aspectRatio: AspectRatio;
  onToggleDeviceView: () => void;
  fontFamily: 'sans' | 'serif' | 'display' | 'mono';
  onChangeFontFamily: (font: 'sans' | 'serif' | 'display' | 'mono') => void;
  onQuickAddStat: () => void;
  onQuickAddFeature: () => void;
  onQuickAddQuote: () => void;
  commentsCount: number;
  collaborators: Collaborator[];
}

export const CanvaFormattingBar: React.FC<CanvaFormattingBarProps> = ({
  onOpenElementsDrawer,
  onOpenCommentsDrawer,
  onOpenVersionHistory,
  aspectRatio,
  onToggleDeviceView,
  fontFamily,
  onChangeFontFamily,
  onQuickAddStat,
  onQuickAddFeature,
  onQuickAddQuote,
  commentsCount,
  collaborators,
}) => {
  const isMobileView = aspectRatio === '9:16';

  return (
    <div className="w-full max-w-5xl mx-auto mb-4 px-4 py-2 bg-[#12131D]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg flex items-center justify-between text-xs text-neutral-300 gap-3 select-none">
      {/* Left: Canva Elements Dock Trigger & Quick Inserts */}
      <div className="flex items-center gap-2 overflow-x-auto">
        <button
          onClick={onOpenElementsDrawer}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-gamma-glow flex-shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Elements</span>
        </button>

        <div className="h-4 w-px bg-white/10 hidden sm:block" />

        {/* Quick Add Pills */}
        <div className="hidden md:flex items-center gap-1.5">
          <button
            onClick={onQuickAddStat}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
            title="Add Stat Metric Block"
          >
            <TrendingUp className="w-3 h-3 text-purple-400" />
            <span>+ Stat</span>
          </button>
          <button
            onClick={onQuickAddFeature}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
            title="Add Bento Feature Card"
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>+ Feature</span>
          </button>
          <button
            onClick={onQuickAddQuote}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
            title="Add Testimonial Quote"
          >
            <Quote className="w-3 h-3 text-amber-400" />
            <span>+ Quote</span>
          </button>
        </div>

        <div className="h-4 w-px bg-white/10 hidden lg:block" />

        {/* Typography Selector */}
        <div className="hidden lg:flex items-center gap-1">
          <Type className="w-3.5 h-3.5 text-neutral-500 ml-1" />
          <select
            value={fontFamily}
            onChange={(e) => onChangeFontFamily(e.target.value as any)}
            className="bg-[#181926] border border-white/10 rounded-lg px-2 py-1 text-[11px] text-neutral-300 focus:outline-none focus:border-purple-500"
          >
            <option value="display">Outfit (Display)</option>
            <option value="sans">Plus Jakarta (Modern Sans)</option>
            <option value="serif">Playfair (Luxury Serif)</option>
            <option value="mono">JetBrains (Frontier Mono)</option>
          </select>
        </div>
      </div>

      {/* Right: Comments, History & Device Viewport Toggle */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Version History */}
        <button
          onClick={onOpenVersionHistory}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors text-xs"
          title="Version History & Restore"
        >
          <History className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">History</span>
        </button>

        {/* Comments Button with Counter */}
        <button
          onClick={onOpenCommentsDrawer}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors text-xs relative"
          title="Open Slide Feedback & Comments"
        >
          <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
          <span>Comments</span>
          {commentsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-purple-500 text-white font-bold">
              {commentsCount}
            </span>
          )}
        </button>

        {/* Device Switcher (Desktop vs Mobile) */}
        <button
          onClick={onToggleDeviceView}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors text-xs ${
            isMobileView
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white'
          }`}
          title={isMobileView ? 'Switch to Desktop (16:9)' : 'Preview Mobile View (9:16)'}
        >
          {isMobileView ? (
            <>
              <Smartphone className="w-3.5 h-3.5 text-white" />
              <span className="hidden sm:inline font-semibold">Mobile</span>
            </>
          ) : (
            <>
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">16:9</span>
            </>
          )}
        </button>

        {/* Live Collaborators Presence */}
        <div className="flex items-center -space-x-1.5 pl-1 hidden sm:flex">
          {collaborators.slice(0, 3).map((col) => (
            <div
              key={col.id}
              className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] text-white border-2 border-[#12131D] relative shadow-sm"
              style={{ backgroundColor: col.color }}
              title={`${col.name} (${col.role}) - ${col.status}`}
            >
              {col.avatar}
              {col.status === 'active' && (
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-[#12131D]" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
