import React, { useState } from 'react';
import { DesignDocument, SlidePage, ThemeColors } from '../types/design';
import { 
  X, 
  FileText, 
  Image, 
  Download, 
  CheckCircle, 
  Loader2, 
  Upload,
  Globe,
  Sparkles,
  Layers,
  Printer
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { GammaCard } from './GammaCard';
import { BrochureRenderer } from './BrochureRenderer';

interface ExportModalProps {
  document: DesignDocument;
  theme: ThemeColors;
  activeSlideIndex: number;
  onClose: () => void;
  onImportDocument: (doc: DesignDocument) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  document,
  theme,
  activeSlideIndex,
  onClose,
  onImportDocument,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');

  // 1. Export Current Slide as Retina PNG
  const handleExportPng = async () => {
    try {
      setIsExporting(true);
      setStatusText('Rendering current slide in high-resolution...');
      setProgress(30);

      // Give browser time to settle
      await new Promise(r => setTimeout(r, 150));

      const target = 
        window.document.getElementById(`export-target-slide-${activeSlideIndex}`) ||
        window.document.getElementById(`slide-viewport-${document.slides[activeSlideIndex]?.id}`);

      if (!target) {
        throw new Error('Slide element could not be located in DOM.');
      }

      setProgress(60);
      const canvas = await html2canvas(target, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: theme.bg,
        logging: false,
      });

      setProgress(90);
      const dataUrl = canvas.toDataURL('image/png');
      const link = window.document.createElement('a');
      const cleanTitle = (document.title || 'prearn-deck').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      link.download = `${cleanTitle}-slide-${activeSlideIndex + 1}.png`;
      link.href = dataUrl;
      link.click();

      setProgress(100);
      setStatusText('PNG downloaded successfully!');
    } catch (err: any) {
      alert(`PNG export error: ${err.message}`);
    } finally {
      setIsExporting(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  // 2. Export ALL Slides as Multi-Page PDF (Guaranteed All Slides Rendered)
  const handleExportPdf = async () => {
    try {
      setIsExporting(true);
      setStatusText('Initializing complete multi-page document export...');
      setProgress(5);

      // Brief delay to ensure offscreen host DOM elements are fully mounted
      await new Promise(resolve => setTimeout(resolve, 250));

      const isBrochure = document.type === 'brochure';

      if (isBrochure) {
        setStatusText('Capturing full panoramic brochure layout...');
        setProgress(35);

        const brochureElem = window.document.getElementById('export-target-brochure');
        if (!brochureElem) throw new Error('Brochure export container not found.');

        const canvas = await html2canvas(brochureElem, {
          scale: 2,
          useCORS: true,
          backgroundColor: theme.bg,
          logging: false,
        });

        setProgress(75);
        setStatusText('Assembling PDF print file...');

        const pdf = new jsPDF({
          orientation: 'l',
          unit: 'pt',
          format: [canvas.width, canvas.height],
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
        
        const cleanTitle = (document.title || 'brochure').toLowerCase().replace(/[^a-z0-9]+/g, '-');
        pdf.save(`${cleanTitle}-brochure.pdf`);
        
        setProgress(100);
        setStatusText('Brochure PDF exported successfully!');
        return;
      }

      // MULTI-PAGE PRESENTATION / DOCUMENT
      const total = document.slides.length;
      let pdf: jsPDF | null = null;
      let pagesExported = 0;

      const isMobile = document.aspectRatio === '9:16';
      const isPortrait = document.aspectRatio === 'a4-portrait';
      const orientation = (isMobile || isPortrait) ? 'p' : 'l';
      const pageWidth = isMobile ? 1080 : isPortrait ? 1240 : 1920;
      const pageHeight = isMobile ? 1920 : isPortrait ? 1754 : 1080;

      for (let i = 0; i < total; i++) {
        const slide = document.slides[i];
        setStatusText(`Rendering Slide ${i + 1} of ${total}: "${slide.title || `Slide ${i + 1}`}"...`);
        setProgress(Math.round(((i + 1) / total) * 90));

        // Locate from guaranteed offscreen container first
        const slideElement = 
          window.document.getElementById(`export-target-slide-${i}`) ||
          window.document.getElementById(`slide-viewport-${slide.id}`);

        if (!slideElement) {
          console.warn(`Slide #${i + 1} (${slide.id}) DOM element not found, skipping.`);
          continue;
        }

        const canvas = await html2canvas(slideElement, {
          scale: 2,
          useCORS: true,
          backgroundColor: theme.bg,
          logging: false,
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);

        if (!pdf) {
          pdf = new jsPDF({
            orientation,
            unit: 'pt',
            format: [pageWidth, pageHeight],
          });
        } else {
          pdf.addPage([pageWidth, pageHeight], orientation);
        }

        pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight);
        pagesExported++;
      }

      if (!pdf || pagesExported === 0) {
        throw new Error('Unable to capture any slides for PDF export.');
      }

      setProgress(98);
      setStatusText(`Compiling ${pagesExported} pages into final PDF...`);
      const cleanTitle = (document.title || 'presentation').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      pdf.save(`${cleanTitle}.pdf`);

      setProgress(100);
      setStatusText(`Export Complete! Generated ${pagesExported}-page PDF.`);
    } catch (err: any) {
      console.error('PDF export error:', err);
      alert(`PDF export error: ${err.message}`);
    } finally {
      setIsExporting(false);
      setTimeout(() => setProgress(0), 3000);
    }
  };

  // 3. Export All Slides as Batch PNG Images
  const handleExportAllPngs = async () => {
    try {
      setIsExporting(true);
      const total = document.slides.length;
      setStatusText(`Preparing ${total} individual slide images...`);
      setProgress(5);

      await new Promise(r => setTimeout(r, 200));
      const cleanTitle = (document.title || 'presentation').toLowerCase().replace(/[^a-z0-9]+/g, '-');

      for (let i = 0; i < total; i++) {
        const slide = document.slides[i];
        setStatusText(`Generating Image ${i + 1} of ${total}...`);
        setProgress(Math.round(((i + 1) / total) * 90));

        const slideElement = 
          window.document.getElementById(`export-target-slide-${i}`) ||
          window.document.getElementById(`slide-viewport-${slide.id}`);

        if (!slideElement) continue;

        const canvas = await html2canvas(slideElement, {
          scale: 2,
          useCORS: true,
          backgroundColor: theme.bg,
          logging: false,
        });

        const dataUrl = canvas.toDataURL('image/png');
        const link = window.document.createElement('a');
        link.download = `${cleanTitle}-slide-${i + 1}.png`;
        link.href = dataUrl;
        link.click();

        // Brief delay between downloads so the browser doesn't throttle
        await new Promise(r => setTimeout(r, 350));
      }

      setProgress(100);
      setStatusText(`Downloaded all ${total} slide images!`);
    } catch (err: any) {
      alert(`Batch PNG export error: ${err.message}`);
    } finally {
      setIsExporting(false);
      setTimeout(() => setProgress(0), 3000);
    }
  };

  // 4. Export Standalone Offline Interactive HTML Presentation
  const handleExportHtml = () => {
    try {
      const slidesJson = JSON.stringify(document.slides, null, 2);
      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${document.title || 'Prearn Presentation'}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body {
      background-color: ${theme.bg};
      color: ${theme.textPrimary || '#FFFFFF'};
      font-family: 'Plus Jakarta Sans', sans-serif;
      margin: 0;
      overflow-x: hidden;
    }
    .slide-page {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 40px 20px;
      page-break-after: always;
    }
    .gamma-card {
      max-width: 1000px;
      width: 100%;
      background: ${theme.cardBg || 'rgba(255,255,255,0.03)'};
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 28px;
      padding: 48px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.5);
    }
  </style>
</head>
<body>
  <div class="fixed top-4 right-4 z-50 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-xs text-neutral-300 flex items-center gap-2">
    <span>✦ ${document.title}</span>
    <span class="text-neutral-500">•</span>
    <span>${document.slides.length} Slides</span>
  </div>

  ${document.slides.map((s, idx) => `
    <section class="slide-page" id="slide-${idx + 1}">
      <div class="gamma-card">
        <div class="flex items-center justify-between mb-4">
          <span class="text-xs font-mono font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
            ${s.badge || s.category || `CARD ${idx + 1}`}
          </span>
          <span class="text-xs font-mono text-neutral-500 font-semibold">
            ${idx + 1} / ${document.slides.length}
          </span>
        </div>

        <h1 class="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-white font-['Outfit']">
          ${s.headline || s.title}
        </h1>
        ${s.subheadline ? `<p class="text-base text-neutral-300 mb-8 leading-relaxed">${s.subheadline}</p>` : ''}

        <div class="grid grid-cols-12 gap-4 mt-6">
          ${s.elements.map(el => `
            <div class="${el.gridSpan || 'col-span-12 md:col-span-6'} p-5 rounded-2xl bg-white/[0.03] border border-white/10">
              ${el.type === 'stat-block' ? `
                <div class="text-4xl font-extrabold font-mono text-white mb-1">${el.statValue || ''}</div>
                <div class="text-xs font-bold text-neutral-300 uppercase tracking-wider">${el.statLabel || ''}</div>
                ${el.statChange ? `<div class="text-[11px] text-purple-400 mt-1 font-mono">${el.statChange}</div>` : ''}
              ` : `
                ${el.tag ? `<div class="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider mb-2">${el.tag}</div>` : ''}
                <div class="text-base font-bold text-white mb-2">${el.title || ''}</div>
                <div class="text-xs text-neutral-300 leading-relaxed">${el.content || ''}</div>
              `}
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `).join('')}
</body>
</html>`;

      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      const cleanTitle = (document.title || 'presentation').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      link.download = `${cleanTitle}.html`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`HTML export error: ${err.message}`);
    }
  };

  // 5. Export JSON
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(document, null, 2));
    const downloadAnchor = window.document.createElement('a');
    const cleanTitle = (document.title || 'prearn-project').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${cleanTitle}.json`);
    downloadAnchor.click();
  };

  // 6. Import JSON
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.slides && Array.isArray(parsed.slides)) {
          onImportDocument(parsed);
          alert('Project imported successfully!');
          onClose();
        } else {
          alert('Invalid project JSON structure.');
        }
      } catch (err: any) {
        alert(`Failed to import JSON: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      {/* Hidden Offscreen Container: Ensures ALL slides are mounted in the DOM for full multi-page export */}
      <div
        id="export-offscreen-host"
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: '-100000px',
          width: document.aspectRatio === '9:16' ? '720px' : '1440px',
          zIndex: -9999,
          pointerEvents: 'none',
          opacity: 0,
        }}
      >
        {document.type === 'brochure' ? (
          <div
            id="export-target-brochure"
            style={{
              width: '1800px',
              backgroundColor: theme.bg,
              padding: '32px',
            }}
          >
            <BrochureRenderer
              slides={document.slides}
              theme={theme}
              onUpdateSlide={() => {}}
              selectedElementId={null}
              onSelectElement={() => {}}
            />
          </div>
        ) : (
          document.slides.map((slide, idx) => (
            <div
              key={slide.id}
              id={`export-target-slide-${idx}`}
              style={{
                width: document.aspectRatio === '9:16' ? '720px' : '1440px',
                minHeight: document.aspectRatio === '9:16' ? '1280px' : '810px',
                backgroundColor: theme.bg,
                padding: '32px',
                boxSizing: 'border-box',
              }}
            >
              <GammaCard
                slide={slide}
                theme={theme}
                aspectRatio={document.aspectRatio}
                onUpdateSlide={() => {}}
                selectedElementId={null}
                onSelectElement={() => {}}
                isPresentationMode={true}
              />
            </div>
          ))
        )}
      </div>

      <div className="w-full max-w-lg bg-[#14151F] border border-white/10 rounded-3xl shadow-2xl p-6 text-neutral-200 animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-purple-400" />
              <span>Export Deliverable Suite</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                {document.slides.length} {document.type === 'brochure' ? 'Panels' : 'Slides'}
              </span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              High-resolution export for clients, investors, and executive presentations
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar if active */}
        {isExporting && (
          <div className="my-4 p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 animate-fadeIn">
            <div className="flex items-center justify-between text-xs text-purple-300 font-medium mb-1.5">
              <span className="flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                <span>{statusText}</span>
              </span>
              <span className="font-mono font-bold">{progress}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-black/40 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
                style={{ width: `${Math.max(progress, 8)}%` }}
              />
            </div>
          </div>
        )}

        {/* Export Options Grid */}
        <div className="space-y-2.5 my-5">
          {/* 1. Multi-page PDF (Guaranteed all slides) */}
          <button
            onClick={handleExportPdf}
            disabled={isExporting}
            className="w-full p-3.5 rounded-2xl border border-purple-500/30 bg-purple-600/15 hover:bg-purple-600/25 transition-all flex items-center justify-between text-left group disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white group-hover:text-purple-300 flex items-center gap-1.5">
                  <span>Complete Multi-Page Document (PDF)</span>
                  <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded">
                    ALL {document.slides.length} PAGES
                  </span>
                </div>
                <div className="text-xs text-neutral-400">
                  Full deck packaging every slide into a print-ready vector PDF
                </div>
              </div>
            </div>
            <Download className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
          </button>

          {/* 2. All Slides as PNG Images */}
          <button
            onClick={handleExportAllPngs}
            disabled={isExporting}
            className="w-full p-3.5 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] transition-all flex items-center justify-between text-left group disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white group-hover:text-emerald-300">
                  All Slides as Images (Batch PNG)
                </div>
                <div className="text-xs text-neutral-400">
                  Downloads all {document.slides.length} individual slide images at 2x resolution
                </div>
              </div>
            </div>
            <Download className="w-4 h-4 text-neutral-500 group-hover:text-white" />
          </button>

          {/* 3. Single Current Slide PNG */}
          <button
            onClick={handleExportPng}
            disabled={isExporting}
            className="w-full p-3 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] transition-all flex items-center justify-between text-left group disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Image className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white group-hover:text-cyan-300">
                  Current Slide Only (PNG)
                </div>
                <div className="text-[11px] text-neutral-400">
                  Retina 2.5x snapshot of active card #{activeSlideIndex + 1}
                </div>
              </div>
            </div>
            <Download className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white" />
          </button>

          {/* 4. Standalone HTML Offline Presentation */}
          <button
            onClick={handleExportHtml}
            disabled={isExporting}
            className="w-full p-3 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] transition-all flex items-center justify-between text-left group disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white group-hover:text-amber-300">
                  Interactive HTML Web Presentation
                </div>
                <div className="text-[11px] text-neutral-400">
                  Offline standalone single-file web package with all {document.slides.length} slides
                </div>
              </div>
            </div>
            <Download className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white" />
          </button>
        </div>

        {/* Footer: JSON Backup & Restore */}
        <div className="pt-3.5 border-t border-white/10 flex items-center justify-between text-xs">
          <button
            onClick={handleExportJson}
            disabled={isExporting}
            className="text-neutral-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save JSON Backup</span>
          </button>

          <label className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors">
            <Upload className="w-3.5 h-3.5 text-purple-400" />
            <span>Upload JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJson}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
