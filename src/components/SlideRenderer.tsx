import React from 'react';
import { SlidePage, ThemeColors, DesignElement, AspectRatio } from '../types/design';
import { InlineText } from './InlineText';
import { Sparkles, TrendingUp, Quote, Check, ArrowRight } from 'lucide-react';

interface SlideRendererProps {
  slide: SlidePage;
  theme: ThemeColors;
  aspectRatio: AspectRatio;
  onUpdateSlide: (updated: SlidePage) => void;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  scale?: number;
  isPresentationMode?: boolean;
}

export const SlideRenderer: React.FC<SlideRendererProps> = ({
  slide,
  theme,
  aspectRatio,
  onUpdateSlide,
  selectedElementId,
  onSelectElement,
  scale = 1,
  isPresentationMode = false,
}) => {
  const updateElement = (elementId: string, updates: Partial<DesignElement>) => {
    const newElements = slide.elements.map(el => {
      if (el.id === elementId) {
        return { ...el, ...updates };
      }
      return el;
    });
    onUpdateSlide({ ...slide, elements: newElements });
  };

  // Aspect ratio dimensions
  const getContainerStyles = (): { width: string; minHeight: string; aspectRatio: string } => {
    switch (aspectRatio) {
      case '16:9':
        return { width: '100%', minHeight: 'auto', aspectRatio: '16 / 9' };
      case 'a4-portrait':
        return { width: '100%', minHeight: 'auto', aspectRatio: '1 / 1.414' };
      case 'a4-landscape':
        return { width: '100%', minHeight: 'auto', aspectRatio: '1.414 / 1' };
      case 'trifold':
        return { width: '100%', minHeight: 'auto', aspectRatio: '2.1 / 1' };
      default:
        return { width: '100%', minHeight: 'auto', aspectRatio: '16 / 9' };
    }
  };

  const containerStyle = getContainerStyles();

  return (
    <div
      id={`slide-viewport-${slide.id}`}
      className="relative w-full rounded-2xl overflow-hidden shadow-deck transition-all duration-200 select-text flex flex-col justify-between"
      style={{
        ...containerStyle,
        backgroundColor: theme.bg,
        color: theme.textPrimary,
        border: `1px solid ${theme.surfaceBorder}`,
        padding: '5% 6%',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onSelectElement(null);
        }
      }}
    >
      {/* Subtle Ambient Glow */}
      <div
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-[120px] pointer-events-none opacity-20"
        style={{ backgroundColor: theme.primary }}
      />
      <div
        className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full blur-[120px] pointer-events-none opacity-15"
        style={{ backgroundColor: theme.accent }}
      />

      {/* TOP HEADER: Badge, Category, Headline, Subheadline */}
      <div className="relative z-10 w-full mb-6">
        {/* Category Badge & Slide Tag */}
        <div className="flex items-center justify-between mb-3.5">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase font-mono shadow-sm"
            style={{
              backgroundColor: theme.badgeBg,
              color: theme.badgeText,
              border: `1px solid ${theme.surfaceBorder}`,
            }}
          >
            <Sparkles className="w-3 h-3 text-brand-400" />
            <InlineText
              value={slide.badge || 'EXECUTIVE BRIEF'}
              onChange={(val) => onUpdateSlide({ ...slide, badge: val })}
              className="tracking-wider uppercase"
              as="span"
            />
          </div>

          {slide.category && (
            <span
              className="text-[11px] font-mono uppercase tracking-widest opacity-40 font-semibold"
              style={{ color: theme.textSecondary }}
            >
              {slide.category}
            </span>
          )}
        </div>

        {/* Big Display Headline */}
        <h1
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15] mb-3 font-display"
          style={{ color: theme.textPrimary }}
        >
          <InlineText
            value={slide.headline}
            onChange={(val) => onUpdateSlide({ ...slide, headline: val })}
            as="h1"
            className="font-display"
          />
        </h1>

        {/* Subheadline / Context */}
        {slide.subheadline !== undefined && (
          <p
            className="text-sm sm:text-base md:text-lg max-w-4xl font-normal leading-relaxed opacity-85"
            style={{ color: theme.textSecondary }}
          >
            <InlineText
              value={slide.subheadline}
              onChange={(val) => onUpdateSlide({ ...slide, subheadline: val })}
              as="p"
            />
          </p>
        )}

        {/* Optional Secondary Description */}
        {slide.description && (
          <p
            className="text-xs sm:text-sm max-w-3xl font-normal leading-relaxed mt-2 opacity-65"
            style={{ color: theme.textMuted }}
          >
            <InlineText
              value={slide.description}
              onChange={(val) => onUpdateSlide({ ...slide, description: val })}
              as="p"
            />
          </p>
        )}
      </div>

      {/* DYNAMIC ELEMENTS BODY: Grid, Stats, Cards, Tables, Quotes */}
      <div className="relative z-10 w-full flex-1 flex flex-col justify-center my-auto">
        <div className="grid grid-cols-12 gap-3 sm:gap-4 md:gap-5 w-full items-stretch">
          {slide.elements.map((el) => {
            const isSelected = selectedElementId === el.id;
            const spanClass = el.gridSpan || 'col-span-12 md:col-span-4';

            return (
              <div
                key={el.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectElement(el.id);
                }}
                className={`relative rounded-xl transition-all duration-200 group flex flex-col justify-between ${spanClass} ${
                  isSelected
                    ? 'ring-2 ring-brand-500 shadow-glow'
                    : 'hover:border-white/20'
                }`}
                style={{
                  backgroundColor: el.style?.backgroundColor || theme.cardBg,
                  border: `1px solid ${isSelected ? theme.primary : theme.surfaceBorder}`,
                  padding: el.style?.padding || '1.25rem',
                  borderRadius: el.style?.borderRadius || '0.75rem',
                  textAlign: el.style?.textAlign || 'left',
                }}
              >
                {/* Element selection indicator */}
                {isSelected && (
                  <div className="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full bg-brand-500 text-white flex items-center justify-center text-[10px] shadow font-mono">
                    ✦
                  </div>
                )}

                {/* STAT BLOCK */}
                {el.type === 'stat-block' && (
                  <div className="flex flex-col justify-between h-full py-1">
                    <div>
                      <div
                        className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight font-display mb-1.5"
                        style={{ color: theme.primary }}
                      >
                        <InlineText
                          value={el.statValue || '$0'}
                          onChange={(val) => updateElement(el.id, { statValue: val })}
                          as="div"
                        />
                      </div>
                      <div
                        className="text-sm font-semibold tracking-wide"
                        style={{ color: theme.textPrimary }}
                      >
                        <InlineText
                          value={el.statLabel || 'Metric Label'}
                          onChange={(val) => updateElement(el.id, { statLabel: val })}
                          as="div"
                        />
                      </div>
                    </div>
                    {el.statChange && (
                      <div
                        className="mt-3 text-xs flex items-center gap-1 font-medium opacity-80"
                        style={{ color: theme.accent }}
                      >
                        <TrendingUp className="w-3.5 h-3.5" />
                        <InlineText
                          value={el.statChange}
                          onChange={(val) => updateElement(el.id, { statChange: val })}
                          as="span"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* FEATURE CARD */}
                {el.type === 'feature-card' && (
                  <div className="flex flex-col justify-between h-full space-y-3">
                    <div>
                      {el.tag && (
                        <div
                          className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase mb-2"
                          style={{
                            backgroundColor: theme.badgeBg,
                            color: theme.badgeText,
                          }}
                        >
                          <InlineText
                            value={el.tag}
                            onChange={(val) => updateElement(el.id, { tag: val })}
                            as="span"
                          />
                        </div>
                      )}
                      <h3
                        className="text-base sm:text-lg font-bold tracking-tight mb-1"
                        style={{ color: theme.textPrimary }}
                      >
                        <InlineText
                          value={el.title || 'Feature Title'}
                          onChange={(val) => updateElement(el.id, { title: val })}
                          as="h3"
                        />
                      </h3>
                      {el.subtitle && (
                        <h4
                          className="text-xs sm:text-sm font-medium mb-2 opacity-75"
                          style={{ color: theme.textSecondary }}
                        >
                          <InlineText
                            value={el.subtitle}
                            onChange={(val) => updateElement(el.id, { subtitle: val })}
                            as="h4"
                          />
                        </h4>
                      )}
                      {el.content && (
                        <p
                          className="text-xs sm:text-sm leading-relaxed opacity-80"
                          style={{ color: theme.textSecondary }}
                        >
                          <InlineText
                            value={el.content}
                            onChange={(val) => updateElement(el.id, { content: val })}
                            as="p"
                            multiline
                          />
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* COMPARISON TABLE */}
                {el.type === 'comparison-table' && (
                  <div className="w-full overflow-x-auto">
                    {el.title && (
                      <h4
                        className="text-sm font-bold uppercase tracking-wider mb-3 font-mono"
                        style={{ color: theme.primary }}
                      >
                        <InlineText
                          value={el.title}
                          onChange={(val) => updateElement(el.id, { title: val })}
                          as="h4"
                        />
                      </h4>
                    )}
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr
                          style={{
                            borderBottom: `2px solid ${theme.surfaceBorder}`,
                            backgroundColor: theme.badgeBg,
                          }}
                        >
                          {el.columns?.map((col, colIdx) => (
                            <th
                              key={colIdx}
                              className="py-2.5 px-3 font-bold font-mono tracking-wider uppercase"
                              style={{
                                color: colIdx === el.columns!.length - 1 ? theme.primary : theme.textPrimary,
                              }}
                            >
                              <InlineText
                                value={col}
                                onChange={(val) => {
                                  const newCols = [...(el.columns || [])];
                                  newCols[colIdx] = val;
                                  updateElement(el.id, { columns: newCols });
                                }}
                                as="span"
                              />
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {el.rows?.map((row, rowIdx) => (
                          <tr
                            key={rowIdx}
                            className="transition-colors hover:bg-white/[0.02]"
                            style={{ borderBottom: `1px solid ${theme.surfaceBorder}` }}
                          >
                            {row.cells.map((cell, cellIdx) => (
                              <td
                                key={cellIdx}
                                className={`py-2 px-3 ${
                                  cellIdx === row.cells.length - 1
                                    ? 'font-semibold text-brand-300'
                                    : 'opacity-80'
                                }`}
                                style={{
                                  color: cellIdx === row.cells.length - 1 ? theme.textPrimary : theme.textSecondary,
                                }}
                              >
                                <InlineText
                                  value={cell}
                                  onChange={(val) => {
                                    const newRows = [...(el.rows || [])];
                                    newRows[rowIdx].cells[cellIdx] = val;
                                    updateElement(el.id, { rows: newRows });
                                  }}
                                  as="span"
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* TEAM CARD */}
                {el.type === 'team-card' && (
                  <div className="flex flex-col justify-between h-full space-y-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm font-mono shadow-sm"
                        style={{
                          backgroundColor: theme.primary,
                          color: '#FFFFFF',
                        }}
                      >
                        {(el.title || 'F')[0]}
                      </div>
                      <div>
                        <h4
                          className="text-sm sm:text-base font-bold"
                          style={{ color: theme.textPrimary }}
                        >
                          <InlineText
                            value={el.title || 'Founder Name'}
                            onChange={(val) => updateElement(el.id, { title: val })}
                            as="h4"
                          />
                        </h4>
                        <div
                          className="text-xs font-medium"
                          style={{ color: theme.primary }}
                        >
                          <InlineText
                            value={el.subtitle || 'Role & Title'}
                            onChange={(val) => updateElement(el.id, { subtitle: val })}
                            as="span"
                          />
                        </div>
                      </div>
                    </div>
                    {el.tag && (
                      <div
                        className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-semibold tracking-wider uppercase mt-1 w-fit"
                        style={{
                          backgroundColor: theme.badgeBg,
                          color: theme.badgeText,
                        }}
                      >
                        <InlineText
                          value={el.tag}
                          onChange={(val) => updateElement(el.id, { tag: val })}
                          as="span"
                        />
                      </div>
                    )}
                    {el.content && (
                      <p
                        className="text-xs leading-relaxed opacity-75 mt-2"
                        style={{ color: theme.textSecondary }}
                      >
                        <InlineText
                          value={el.content}
                          onChange={(val) => updateElement(el.id, { content: val })}
                          as="p"
                          multiline
                        />
                      </p>
                    )}
                  </div>
                )}

                {/* QUOTE / TESTIMONIAL */}
                {el.type === 'quote' && (
                  <div className="flex flex-col justify-between h-full py-2">
                    <Quote className="w-6 h-6 mb-2 opacity-50" style={{ color: theme.primary }} />
                    <p
                      className="text-base sm:text-lg italic font-serif leading-relaxed mb-3"
                      style={{ color: theme.textPrimary }}
                    >
                      <InlineText
                        value={el.content || 'Testimonial quote text here'}
                        onChange={(val) => updateElement(el.id, { content: val })}
                        as="p"
                        multiline
                      />
                    </p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold" style={{ color: theme.textPrimary }}>
                        <InlineText
                          value={el.author || 'Author Name'}
                          onChange={(val) => updateElement(el.id, { author: val })}
                          as="span"
                        />
                      </span>
                      {el.role && (
                        <>
                          <span className="opacity-40">•</span>
                          <span className="opacity-75" style={{ color: theme.textSecondary }}>
                            <InlineText
                              value={el.role}
                              onChange={(val) => updateElement(el.id, { role: val })}
                              as="span"
                            />
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* CTA BUTTON */}
                {el.type === 'cta-button' && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2">
                    <div>
                      <h4 className="text-base font-bold" style={{ color: theme.textPrimary }}>
                        <InlineText
                          value={el.title || 'Ready to talk?'}
                          onChange={(val) => updateElement(el.id, { title: val })}
                          as="h4"
                        />
                      </h4>
                      <p className="text-xs opacity-75 mt-0.5" style={{ color: theme.textSecondary }}>
                        <InlineText
                          value={el.content || 'Click to schedule or email us directly'}
                          onChange={(val) => updateElement(el.id, { content: val })}
                          as="p"
                        />
                      </p>
                    </div>
                    <div
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs tracking-wide shadow-glow transition-transform hover:scale-105 cursor-pointer"
                      style={{
                        backgroundColor: theme.primary,
                        color: '#FFFFFF',
                      }}
                    >
                      <span>Take Action</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* FOOTER BAR: Confidentiality tag & Page numbering */}
      <div
        className="relative z-10 w-full pt-4 mt-6 flex items-center justify-between text-[11px] font-mono tracking-wider opacity-60"
        style={{
          borderTop: `1px solid ${theme.surfaceBorder}`,
          color: theme.textMuted,
        }}
      >
        <div className="flex items-center gap-2">
          <span>PREARN DESIGN STUDIO</span>
          <span>•</span>
          <span>POWERED BY CLAUDE</span>
        </div>
        <div>
          <span>PROPRIETARY & CONFIDENTIAL</span>
        </div>
      </div>
    </div>
  );
};
