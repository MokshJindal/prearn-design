import React, { useState } from 'react';
import { SlidePage, ThemeColors, DesignElement } from '../types/design';
import { InlineText } from './InlineText';
import { 
  Sparkles, 
  TrendingUp, 
  Star, 
  MapPin, 
  Mail, 
  Phone, 
  Globe, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck,
  Award
} from 'lucide-react';

interface BrochureRendererProps {
  slides: SlidePage[];
  theme: ThemeColors;
  onUpdateSlide: (index: number, updated: SlidePage) => void;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
}

export const BrochureRenderer: React.FC<BrochureRendererProps> = ({
  slides,
  theme,
  onUpdateSlide,
  selectedElementId,
  onSelectElement,
}) => {
  const [spreadMode, setSpreadMode] = useState<'all' | 'inside' | 'outside'>('all');

  return (
    <div className="w-full flex flex-col items-center">
      {/* Spread Switcher Pill */}
      <div className="mb-4 flex items-center gap-1.5 p-1 rounded-full gamma-glass text-xs">
        <button
          onClick={() => setSpreadMode('all')}
          className={`px-3 py-1 rounded-full transition-all font-medium ${
            spreadMode === 'all' ? 'bg-purple-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
          }`}
        >
          All Panels (Panoramic View)
        </button>
        <button
          onClick={() => setSpreadMode('inside')}
          className={`px-3 py-1 rounded-full transition-all font-medium ${
            spreadMode === 'inside' ? 'bg-purple-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Inside Spread
        </button>
        <button
          onClick={() => setSpreadMode('outside')}
          className={`px-3 py-1 rounded-full transition-all font-medium ${
            spreadMode === 'outside' ? 'bg-purple-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Cover & Flaps
        </button>
      </div>

      {/* Brochure Fold Container (Tri-Fold / Multi-Panel Spread) */}
      <div 
        className="w-full max-w-6xl rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 relative border border-white/10"
        style={{
          backgroundColor: theme.bg,
          color: theme.textPrimary,
        }}
        onClick={() => onSelectElement(null)}
      >
        {/* Subtle Paper Texture & Lighting */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-white/[0.02] to-black/10 pointer-events-none" />

        {/* Multi-Panel Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10 relative z-10">
          {slides.slice(0, 3).map((panel, panelIdx) => (
            <div
              key={panel.id}
              className="p-6 sm:p-8 flex flex-col justify-between relative group transition-colors hover:bg-white/[0.01] min-h-[580px]"
            >
              {/* Fold Seam Indicator (Left & Right Folds) */}
              <div className="absolute top-2 right-2 text-[9px] font-mono uppercase tracking-widest opacity-30">
                Panel 0{panelIdx + 1}
              </div>

              {/* Panel Header */}
              <div>
                {/* Badge Tag */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase mb-3"
                  style={{
                    backgroundColor: theme.badgeBg,
                    color: theme.badgeText,
                    border: `1px solid ${theme.surfaceBorder}`,
                  }}
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  <InlineText
                    value={panel.badge || 'CAPABILITY'}
                    onChange={(val) => onUpdateSlide(panelIdx, { ...panel, badge: val })}
                    as="span"
                  />
                </div>

                {/* Headline */}
                <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight leading-tight mb-2 font-display"
                  style={{ color: theme.textPrimary }}
                >
                  <InlineText
                    value={panel.headline}
                    onChange={(val) => onUpdateSlide(panelIdx, { ...panel, headline: val })}
                    as="h3"
                  />
                </h3>

                {/* Subheadline */}
                {panel.subheadline && (
                  <p className="text-xs sm:text-sm leading-relaxed opacity-80 mb-6"
                    style={{ color: theme.textSecondary }}
                  >
                    <InlineText
                      value={panel.subheadline}
                      onChange={(val) => onUpdateSlide(panelIdx, { ...panel, subheadline: val })}
                      as="p"
                    />
                  </p>
                )}

                {/* Trust Rating on Panel 1 */}
                {panelIdx === 0 && (
                  <div className="flex items-center gap-1.5 mb-6 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <span className="text-[11px] font-semibold text-neutral-300">
                      4.9 / 5.0 Enterprise Trust Rating
                    </span>
                  </div>
                )}

                {/* Panel Elements Stack */}
                <div className="space-y-3.5">
                  {panel.elements.map((el, elIdx) => {
                    const isSelected = selectedElementId === el.id;

                    return (
                      <div
                        key={el.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectElement(el.id);
                        }}
                        className={`p-3.5 rounded-xl transition-all ${
                          isSelected ? 'ring-2 ring-purple-500 shadow-md' : 'hover:border-white/20'
                        }`}
                        style={{
                          backgroundColor: el.style?.backgroundColor || theme.cardBg,
                          border: `1px solid ${isSelected ? theme.primary : theme.surfaceBorder}`,
                        }}
                      >
                        {el.type === 'stat-block' ? (
                          <div>
                            <div className="text-2xl sm:text-3xl font-black font-display tracking-tight"
                              style={{ color: theme.primary }}
                            >
                              <InlineText
                                value={el.statValue || '$0'}
                                onChange={(val) => {
                                  const updated = [...panel.elements];
                                  updated[elIdx] = { ...el, statValue: val };
                                  onUpdateSlide(panelIdx, { ...panel, elements: updated });
                                }}
                                as="div"
                              />
                            </div>
                            <div className="text-xs font-semibold mt-0.5" style={{ color: theme.textPrimary }}>
                              <InlineText
                                value={el.statLabel || 'Metric'}
                                onChange={(val) => {
                                  const updated = [...panel.elements];
                                  updated[elIdx] = { ...el, statLabel: val };
                                  onUpdateSlide(panelIdx, { ...panel, elements: updated });
                                }}
                                as="div"
                              />
                            </div>
                          </div>
                        ) : (
                          <div>
                            {el.tag && (
                              <span className="text-[9px] font-mono font-bold uppercase tracking-wider block mb-1 opacity-70"
                                style={{ color: theme.accent }}
                              >
                                {el.tag}
                              </span>
                            )}
                            <h4 className="text-xs font-bold mb-1" style={{ color: theme.textPrimary }}>
                              <InlineText
                                value={el.title || 'Feature'}
                                onChange={(val) => {
                                  const updated = [...panel.elements];
                                  updated[elIdx] = { ...el, title: val };
                                  onUpdateSlide(panelIdx, { ...panel, elements: updated });
                                }}
                                as="h4"
                              />
                            </h4>
                            {el.content && (
                              <p className="text-[11px] leading-relaxed opacity-75" style={{ color: theme.textSecondary }}>
                                <InlineText
                                  value={el.content}
                                  onChange={(val) => {
                                    const updated = [...panel.elements];
                                    updated[elIdx] = { ...el, content: val };
                                    onUpdateSlide(panelIdx, { ...panel, elements: updated });
                                  }}
                                  as="p"
                                />
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Panel Footer / Back Cover Contact details if Panel 3 */}
              {panelIdx === 2 ? (
                <div className="pt-6 mt-6 border-t border-white/10 space-y-2 text-[11px] opacity-80">
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-purple-400" />
                    <span>www.auracloud.ai</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-purple-400" />
                    <span>contact@auracloud.ai</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-purple-400" />
                    <span>San Francisco, CA • London • Singapore</span>
                  </div>
                </div>
              ) : (
                <div className="pt-6 mt-6 border-t border-white/5 flex items-center justify-between text-[10px] font-mono opacity-40">
                  <span>PREARN LUXURY BROCHURE</span>
                  <span>•</span>
                  <span>PAGE 0{panelIdx + 1}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
