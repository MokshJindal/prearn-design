import React, { useState, useEffect } from 'react';
import { SlidePage, ThemeColors, AspectRatio } from '../types/design';
import { SlideRenderer } from './SlideRenderer';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Maximize, 
  Disc, 
  HelpCircle,
  FileText
} from 'lucide-react';

interface PresentationModalProps {
  slides: SlidePage[];
  initialIndex: number;
  theme: ThemeColors;
  aspectRatio: AspectRatio;
  onClose: () => void;
}

export const PresentationModal: React.FC<PresentationModalProps> = ({
  slides,
  initialIndex,
  theme,
  aspectRatio,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [laserActive, setLaserActive] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showNotes, setShowNotes] = useState(false);

  const currentSlide = slides[currentIndex];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        setCurrentIndex(prev => Math.min(prev + 1, slides.length - 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        setCurrentIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'l' || e.key === 'L') {
        setLaserActive(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length, onClose]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (laserActive) {
      setMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-50 bg-[#0A0A09] flex flex-col items-center justify-between p-4 sm:p-8 select-none ${
        laserActive ? 'cursor-none' : ''
      }`}
      onMouseMove={handleMouseMove}
    >
      {/* Laser Pointer Dot */}
      {laserActive && (
        <div 
          className="fixed pointer-events-none z-[100] w-5 h-5 rounded-full bg-red-500 shadow-[0_0_15px_4px_rgba(239,68,68,0.8)] -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 ease-out"
          style={{ left: mousePos.x, top: mousePos.y }}
        />
      )}

      {/* Top Presentation Bar */}
      <div className="w-full flex items-center justify-between text-neutral-400 text-xs px-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-white font-semibold">
            {currentIndex + 1} / {slides.length}
          </span>
          <span className="hidden sm:inline opacity-50">•</span>
          <span className="hidden sm:inline text-neutral-300 font-medium">
            {currentSlide.headline}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Laser Pointer Toggle */}
          <button
            onClick={() => setLaserActive(!laserActive)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-colors ${
              laserActive
                ? 'bg-red-500/20 border-red-500 text-red-300'
                : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
            }`}
            title="Toggle Laser Pointer (Key: L)"
          >
            <Disc className="w-3.5 h-3.5 fill-current text-red-500" />
            <span className="hidden md:inline">Laser Pointer</span>
          </button>

          {/* Toggle Notes */}
          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-colors ${
              showNotes
                ? 'bg-brand-500/20 border-brand-500 text-brand-300'
                : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Presenter Notes</span>
          </button>

          {/* Exit */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors ml-2"
            title="Exit Presentation (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Slide View */}
      <div className="flex-1 w-full max-w-6xl flex items-center justify-center my-auto p-2">
        <div className="w-full">
          <SlideRenderer
            slide={currentSlide}
            theme={theme}
            aspectRatio={aspectRatio}
            onUpdateSlide={() => {}}
            selectedElementId={null}
            onSelectElement={() => {}}
            isPresentationMode={true}
          />
        </div>
      </div>

      {/* Speaker Notes Overlay if enabled */}
      {showNotes && currentSlide.notes && (
        <div className="w-full max-w-4xl p-3 bg-black/80 border border-white/15 rounded-xl text-neutral-300 text-xs mb-2">
          <span className="font-bold text-brand-400 font-mono block mb-1">Speaker Notes:</span>
          {currentSlide.notes}
        </div>
      )}

      {/* Bottom Floating Navigation Dots */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setCurrentIndex(prev => Math.max(prev - 1, 0))}
          disabled={currentIndex === 0}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-20 text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentIndex
                  ? 'w-6 bg-brand-500'
                  : 'w-2 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrentIndex(prev => Math.min(prev + 1, slides.length - 1))}
          disabled={currentIndex === slides.length - 1}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-20 text-white transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
