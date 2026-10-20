import React from 'react';
import { SlidePage, ThemeColors, DesignElement, AspectRatio } from '../types/design';
import { InlineText } from './InlineText';
import { 
  Sparkles, 
  TrendingUp, 
  Quote, 
  ArrowRight, 
  Check, 
  X, 
  Zap, 
  ShieldCheck, 
  Target, 
  Layers,
  Wand2
} from 'lucide-react';

interface RemoteSelectionInfo {
  colId: string;
  colName: string;
  colColor: string;
}

interface GammaCardProps {
  slide: SlidePage;
  theme: ThemeColors;
  aspectRatio: AspectRatio;
  onUpdateSlide: (updated: SlidePage) => void;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  isPresentationMode?: boolean;
  onQuickAiAction?: (action: string) => void;
  remoteSelections?: Record<string, RemoteSelectionInfo>;
  isReadOnly?: boolean;
}

export const GammaCard: React.FC<GammaCardProps> = ({
  slide,
  theme,
  aspectRatio,
  onUpdateSlide,
  selectedElementId,
  onSelectElement,
  isPresentationMode = false,
  onQuickAiAction,
  remoteSelections = {},
  isReadOnly = false,
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

  const isLight = theme.category === 'light';

  // If Claude has generated bespoke ultra-premium Tailwind CSS + SVG HTML, render it directly!
  if (slide.html) {
    return (
      <div
        id={`slide-viewport-${slide.id}`}
        className="relative w-full rounded-3xl overflow-hidden shadow-gamma-card transition-all duration-300 border border-white/10 flex flex-col justify-between"
        style={{
          aspectRatio: aspectRatio === '16:9' ? '16 / 9' : '1 / 1.414',
          minHeight: aspectRatio === '16:9' ? '540px' : '650px',
        }}
      >
        <div
          className="w-full h-full outline-none focus:ring-1 focus:ring-purple-500/50 rounded-3xl select-text"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => {
            const newHtml = e.currentTarget.innerHTML;
            if (newHtml !== slide.html) {
              onUpdateSlide({ ...slide, html: newHtml });
            }
          }}
          dangerouslySetInnerHTML={{ __html: slide.html }}
        />
      </div>
    );
  }

  return (
    <div
      id={`slide-viewport-${slide.id}`}
      className="relative w-full rounded-3xl overflow-hidden transition-all duration-300 shadow-gamma-card flex flex-col justify-between"
      style={{
        backgroundColor: theme.bg,
        color: theme.textPrimary,
        border: `1px solid ${theme.surfaceBorder}`,
        padding: '5% 6%',
        minHeight: aspectRatio === '16:9' ? '540px' : '650px',
        aspectRatio: aspectRatio === '16:9' ? '16 / 9' : '1 / 1.414',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onSelectElement(null);
        }
      }}
    >
      {/* Gamma Ambient Glow Orbs */}
      <div 
        className="absolute -top-32 -right-32 w-80 h-80 rounded-full blur-[130px] pointer-events-none opacity-25 animate-pulse-subtle"
        style={{ backgroundColor: theme.primary }}
      />
      <div 
        className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full blur-[130px] pointer-events-none opacity-20"
        style={{ backgroundColor: theme.accent }}
      />

      {/* TOP HEADER: Clean Gamma Badge & Editorial Headline */}
      <div className="relative z-10 w-full mb-6">
        {/* Subtle pill tag */}
        <div className="flex items-center justify-between mb-4">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase font-mono backdrop-blur-md"
            style={{
              backgroundColor: theme.badgeBg,
              color: theme.badgeText,
              border: `1px solid ${theme.surfaceBorder}`,
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: theme.primary }} />
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

        {/* Large Editorial Headline */}
        <h1
          className="text-2xl sm:text-3xl md:text-4xl lg:text-[44px] font-extrabold tracking-tight leading-[1.18] mb-3 font-display"
          style={{ color: theme.textPrimary }}
        >
          <InlineText
            value={slide.headline}
            onChange={(val) => onUpdateSlide({ ...slide, headline: val })}
            as="h1"
            className="font-display"
          />
        </h1>

        {/* Subtitle */}
        {slide.subheadline !== undefined && (
          <p
            className="text-sm sm:text-base md:text-lg max-w-3xl font-normal leading-relaxed opacity-80"
            style={{ color: theme.textSecondary }}
          >
            <InlineText
              value={slide.subheadline}
              onChange={(val) => onUpdateSlide({ ...slide, subheadline: val })}
              as="p"
            />
          </p>
        )}
      </div>

      {/* DYNAMIC ELEMENTS: Bento Cards, Metrics, Comparison Columns */}
      <div className="relative z-10 w-full flex-1 flex flex-col justify-center my-auto">
        <div className="grid grid-cols-12 gap-3 sm:gap-4 md:gap-5 w-full items-stretch">
          {slide.elements.map((el, elIdx) => {
            const isSelected = selectedElementId === el.id;
            const remote = remoteSelections[el.id];
            const spanClass = el.gridSpan || 'col-span-12 md:col-span-4';

            return (
              <div
                key={el.id}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isReadOnly) {
                    onSelectElement(el.id);
                  }
                }}
                className={`relative rounded-2xl transition-all duration-200 backdrop-blur-md flex flex-col justify-between ${spanClass} ${
                  remote
                    ? 'ring-2'
                    : isSelected
                    ? 'ring-2 shadow-gamma-glow'
                    : 'hover:border-white/20 hover:translate-y-[-1px]'
                }`}
                style={{
                  backgroundColor: el.style?.backgroundColor || theme.cardBg,
                  border: remote 
                    ? `2px solid ${remote.colColor}` 
                    : `1px solid ${isSelected ? theme.primary : theme.surfaceBorder}`,
                  boxShadow: remote ? `0 0 16px ${remote.colColor}40` : undefined,
                  padding: el.style?.padding || '1.35rem',
                  borderRadius: '1.25rem',
                  textAlign: el.style?.textAlign || 'left',
                }}
              >
                {/* Live Remote Collaborator Indicator Badge */}
                {remote && (
                  <div
                    className="absolute -top-3 left-4 px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-lg flex items-center gap-1.5 z-30 pointer-events-none animate-fadeIn"
                    style={{ backgroundColor: remote.colColor }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span>{remote.colName} is editing</span>
                  </div>
                )}
                {/* STAT BLOCK (Gamma Style: Huge number with gradient & subtle glow) */}
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
                      <div className="mt-3.5 pt-2.5 border-t border-white/5 flex items-center justify-between">
                        <div
                          className="text-xs flex items-center gap-1.5 font-medium"
                          style={{ color: theme.accent }}
                        >
                          <TrendingUp className="w-3.5 h-3.5" />
                          <InlineText
                            value={el.statChange}
                            onChange={(val) => updateElement(el.id, { statChange: val })}
                            as="span"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* FEATURE / PILLAR CARD (Gamma Style: Pill tag, bold title, elegant paragraph) */}
                {el.type === 'feature-card' && (
                  <div className="flex flex-col justify-between h-full space-y-3">
                    <div>
                      {el.tag && (
                        <div
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase mb-2.5"
                          style={{
                            backgroundColor: theme.badgeBg,
                            color: theme.badgeText,
                          }}
                        >
                          <Sparkles className="w-2.5 h-2.5" />
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
                          value={el.title || 'Pillar Title'}
                          onChange={(val) => updateElement(el.id, { title: val })}
                          as="h3"
                        />
                      </h3>
                      {el.subtitle && (
                        <h4
                          className="text-xs sm:text-sm font-medium mb-2.5 opacity-70"
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
                          className="text-xs sm:text-sm leading-relaxed opacity-85"
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

                {/* COMPARISON TABLE (Gamma Style: Clean modern columns) */}
                {el.type === 'comparison-table' && (
                  <div className="w-full overflow-x-auto">
                    {el.title && (
                      <h4
                        className="text-xs font-bold uppercase tracking-wider mb-3 font-mono"
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
                            borderBottom: `1px solid ${theme.surfaceBorder}`,
                          }}
                        >
                          {el.columns?.map((col, colIdx) => (
                            <th
                              key={colIdx}
                              className="py-2.5 px-3 font-bold font-mono tracking-wider uppercase text-[11px]"
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
                                className={`py-2.5 px-3 ${
                                  cellIdx === row.cells.length - 1
                                    ? 'font-semibold'
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
                        className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm font-mono shadow-md"
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
                        className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold tracking-wider uppercase mt-1 w-fit"
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

                {/* IMAGE CARD (Canva / Unsplash Stock photo) */}
                {el.type === 'image-card' && (
                  <div className="flex flex-col justify-between h-full space-y-2.5">
                    <div className="relative w-full h-44 rounded-xl overflow-hidden group/img">
                      <img
                        src={el.imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'}
                        alt={el.imageAlt || 'Presentation visual'}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                      {el.tag && (
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-black/70 backdrop-blur-md text-white border border-white/10 uppercase">
                          {el.tag}
                        </span>
                      )}
                    </div>
                    {el.title && (
                      <h4 className="text-sm font-bold text-white tracking-tight">
                        <InlineText
                          value={el.title}
                          onChange={(val) => updateElement(el.id, { title: val })}
                          as="h4"
                        />
                      </h4>
                    )}
                    {el.content && (
                      <p className="text-xs text-neutral-400 leading-relaxed">
                        <InlineText
                          value={el.content}
                          onChange={(val) => updateElement(el.id, { content: val })}
                          as="p"
                        />
                      </p>
                    )}
                  </div>
                )}

                {/* QUOTE / TESTIMONIAL CARD */}
                {el.type === 'quote' && (
                  <div className="flex flex-col justify-between h-full py-2">
                    <Quote className="w-7 h-7 mb-2 opacity-40" style={{ color: theme.primary }} />
                    <p
                      className="text-base sm:text-lg italic font-serif leading-relaxed mb-3.5"
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

                {/* CTA BUTTON / ACTION CARD */}
                {el.type === 'cta-button' && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2">
                    <div>
                      <h4 className="text-base font-bold" style={{ color: theme.textPrimary }}>
                        <InlineText
                          value={el.title || 'Schedule Deep Dive'}
                          onChange={(val) => updateElement(el.id, { title: val })}
                          as="h4"
                        />
                      </h4>
                      <p className="text-xs opacity-75 mt-0.5" style={{ color: theme.textSecondary }}>
                        <InlineText
                          value={el.content || 'founders@aura-intelligence.ai'}
                          onChange={(val) => updateElement(el.id, { content: val })}
                          as="p"
                        />
                      </p>
                    </div>
                    <div
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-xs tracking-wide shadow-gamma-glow transition-transform hover:scale-105 cursor-pointer"
                      style={{
                        backgroundColor: theme.primary,
                        color: '#FFFFFF',
                      }}
                    >
                      <span>Get in Touch</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* FOOTER BAR: Clean minimal Gamma branding */}
      <div
        className="relative z-10 w-full pt-4 mt-6 flex items-center justify-between text-[11px] font-mono tracking-wider opacity-40"
        style={{
          borderTop: `1px solid ${theme.surfaceBorder}`,
          color: theme.textMuted,
        }}
      >
        <div className="flex items-center gap-2">
          <span>PREARN DESIGN</span>
          <span>•</span>
          <span>POWERED BY CLAUDE</span>
        </div>
        <div>
          <span>GAMMA EDITION</span>
        </div>
      </div>
    </div>
  );
};
