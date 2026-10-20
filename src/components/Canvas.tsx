import React, { useState } from 'react';
import { SlidePage, ThemeColors, AspectRatio } from '../types/design';
import { SlideRenderer } from './SlideRenderer';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Layout, 
  Sparkles,
  Layers
} from 'lucide-react';

interface CanvasProps {
  currentSlide: SlidePage;
  theme: ThemeColors;
  aspectRatio: AspectRatio;
  currentIndex: number;
  totalSlides: number;
  onUpdateSlide: (updated: SlidePage) => void;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onOpenNotes?: () => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  currentSlide,
  theme,
  aspectRatio,
  currentIndex,
  totalSlides,
  onUpdateSlide,
  onPrevSlide,
  onNextSlide,
  selectedElementId,
  onSelectElement,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [showNotes, setShowNotes] = useState<boolean>(false);
  const [showLayoutMenu, setShowLayoutMenu] = useState<boolean>(false);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.15, 1.6));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.15, 0.55));
  const handleZoomReset = () => setZoom(1);

  const layoutOptions: Array<{ id: SlidePage['layout']; label: string; icon: string }> = [
    { id: 'hero', label: 'Hero Display', icon: '★' },
    { id: 'bento-grid', label: 'Bento Grid', icon: '▦' },
    { id: 'three-column', label: '3-Column Pillars', icon: '▥' },
    { id: 'two-column', label: '2-Column Split', icon: '◫' },
    { id: 'table', label: 'Matrix Table', icon: '▤' },
  ];

  return (
    <div className="relative flex-1 flex flex-col h-full bg-[#0E0E0D] overflow-hidden select-none">
      {/* Background Dot Matrix (Canva / Figma style) */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-15"
        style={{
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Top Floating Controls Bar */}
      <div className="relative z-20 h-12 px-6 flex items-center justify-between border-b border-white/5 bg-[#121211]/80 backdrop-blur-md">
        {/* Slide navigation counter */}
        <div className="flex items-center gap-2">
          <button
            onClick={onPrevSlide}
            disabled={currentIndex === 0}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-neutral-300 hover:text-white transition-colors"
            title="Previous Slide (Left Arrow)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="text-xs font-mono font-medium text-neutral-300 px-2 py-1 rounded bg-black/40 border border-white/5">
            Slide {currentIndex + 1} of {totalSlides}
          </span>

          <button
            onClick={onNextSlide}
            disabled={currentIndex === totalSlides - 1}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-neutral-300 hover:text-white transition-colors"
            title="Next Slide (Right Arrow)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Layout Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowLayoutMenu(!showLayoutMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-neutral-300 hover:text-white transition-colors"
          >
            <Layout className="w-3.5 h-3.5 text-brand-400" />
            <span className="capitalize">{currentSlide.layout.replace('-', ' ')}</span>
          </button>

          {showLayoutMenu && (
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-48 bg-[#1B1B1A] border border-white/10 rounded-xl shadow-2xl p-1 z-50">
              <div className="px-2 py-1 text-[10px] font-mono uppercase text-neutral-500 font-bold tracking-wider">
                Change Layout Archetype
              </div>
              {layoutOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    onUpdateSlide({ ...currentSlide, layout: opt.id });
                    setShowLayoutMenu(false);
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-left transition-colors ${
                    currentSlide.layout === opt.id
                      ? 'bg-brand-500 text-white font-semibold'
                      : 'text-neutral-300 hover:bg-white/5'
                  }`}
                >
                  <span className="font-mono">{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Zoom controls & Speaker notes toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              showNotes 
                ? 'bg-brand-500/20 border-brand-500/50 text-brand-300' 
                : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
            }`}
            title="Toggle Speaker Presentation Notes"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Notes</span>
          </button>

          <div className="flex items-center bg-black/40 rounded-lg p-0.5 border border-white/10">
            <button
              onClick={handleZoomOut}
              className="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span 
              onClick={handleZoomReset} 
              className="px-2 text-[11px] font-mono text-neutral-400 cursor-pointer hover:text-white"
              title="Click to reset zoom"
            >
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Viewport Workspace */}
      <div 
        className="flex-1 overflow-auto p-4 sm:p-8 md:p-12 flex items-center justify-center"
        onClick={() => onSelectElement(null)}
      >
        <div 
          className="transition-transform duration-150 origin-center max-w-5xl w-full"
          style={{ transform: `scale(${zoom})` }}
        >
          <SlideRenderer
            slide={currentSlide}
            theme={theme}
            aspectRatio={aspectRatio}
            onUpdateSlide={onUpdateSlide}
            selectedElementId={selectedElementId}
            onSelectElement={onSelectElement}
            scale={zoom}
          />
        </div>
      </div>

      {/* Speaker Notes Drawer (Expandable at Bottom) */}
      {showNotes && (
        <div className="relative z-20 border-t border-white/10 bg-[#161615] p-4 text-xs animate-slideUp">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 font-mono uppercase text-brand-400 font-bold tracking-wider">
              <FileText className="w-3.5 h-3.5" />
              <span>Speaker Notes & Investor Talking Points</span>
            </div>
            <button
              onClick={() => setShowNotes(false)}
              className="text-neutral-500 hover:text-white font-mono"
            >
              ✕ Close
            </button>
          </div>
          <textarea
            value={currentSlide.notes || ''}
            onChange={(e) => onUpdateSlide({ ...currentSlide, notes: e.target.value })}
            placeholder="Write speaker talking points, key answers to VC questions, or pitch cues here..."
            className="w-full h-20 bg-black/40 border border-white/10 rounded-lg p-2.5 text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-brand-500 font-sans text-xs resize-none"
          />
        </div>
      )}
    </div>
  );
};
