import React, { useState } from 'react';
import { DesignDocument, SlidePage, ThemeColors } from '../types/design';
import { X, FileText, Image, Download, CheckCircle, Loader2, Upload } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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

  // Export current slide as PNG
  const handleExportPng = async () => {
    try {
      setIsExporting(true);
      setStatusText('Rendering ultra-resolution PNG...');
      
      const slideElement = window.document.getElementById(`slide-viewport-${document.slides[activeSlideIndex].id}`);
      if (!slideElement) {
        throw new Error('Slide element not found in DOM.');
      }

      const canvas = await html2canvas(slideElement, {
        scale: 2.5, // 2.5x retina clarity
        useCORS: true,
        backgroundColor: theme.bg,
        logging: false,
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = window.document.createElement('a');
      link.download = `${document.title.toLowerCase().replace(/\s+/g, '-')}-slide-${activeSlideIndex + 1}.png`;
      link.href = dataUrl;
      link.click();
      setStatusText('PNG downloaded successfully!');
    } catch (err: any) {
      alert(`Export error: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Export all slides to a multi-page PDF
  const handleExportPdf = async () => {
    try {
      setIsExporting(true);
      setStatusText('Initializing multi-page PDF generator...');
      setProgress(5);

      const orientation = document.aspectRatio === 'a4-portrait' ? 'p' : 'l';
      const pdf = new jsPDF({
        orientation,
        unit: 'pt',
        format: document.aspectRatio === 'a4-portrait' ? 'a4' : [1920, 1080],
      });

      const total = document.slides.length;

      for (let i = 0; i < total; i++) {
        const slide = document.slides[i];
        setStatusText(`Rendering Slide ${i + 1} of ${total}...`);
        setProgress(Math.round(((i + 1) / total) * 90));

        const slideElement = window.document.getElementById(`slide-viewport-${slide.id}`);
        if (!slideElement) continue;

        const canvas = await html2canvas(slideElement, {
          scale: 2,
          useCORS: true,
          backgroundColor: theme.bg,
          logging: false,
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        if (i > 0) {
          pdf.addPage(document.aspectRatio === 'a4-portrait' ? 'a4' : [1920, 1080], orientation);
        }

        pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight);
      }

      setProgress(100);
      setStatusText('Saving PDF document...');
      pdf.save(`${document.title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
      setStatusText('PDF exported successfully!');
    } catch (err: any) {
      alert(`PDF export error: ${err.message}`);
    } finally {
      setIsExporting(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  // Export JSON
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(document, null, 2));
    const downloadAnchor = window.document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${document.title.toLowerCase().replace(/\s+/g, '-')}-project.json`);
    downloadAnchor.click();
  };

  // Import JSON
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
      <div className="w-full max-w-md bg-[#181716] border border-white/10 rounded-2xl shadow-2xl p-6 text-neutral-200 animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-brand-400" />
              <span>Export Design Studio Deliverable</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Vector & Retina Export for Clients & Investors
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar if active */}
        {isExporting && (
          <div className="my-4 p-3 rounded-xl bg-brand-500/10 border border-brand-500/30">
            <div className="flex items-center justify-between text-xs text-brand-300 font-medium mb-1.5">
              <span>{statusText}</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-black/40 overflow-hidden">
              <div
                className="h-full bg-brand-500 transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Export Options List */}
        <div className="space-y-3 my-5">
          {/* Multi-page PDF */}
          <button
            onClick={handleExportPdf}
            disabled={isExporting}
            className="w-full p-3.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-brand-500/40 transition-all flex items-center justify-between text-left group disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white group-hover:text-brand-300">
                  Full Pitch Deck / Document (PDF)
                </div>
                <div className="text-xs text-neutral-400">
                  Multi-page ultra sharp PDF ({document.slides.length} slides)
                </div>
              </div>
            </div>
            <Download className="w-4 h-4 text-neutral-500 group-hover:text-white" />
          </button>

          {/* Single PNG */}
          <button
            onClick={handleExportPng}
            disabled={isExporting}
            className="w-full p-3.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-brand-500/40 transition-all flex items-center justify-between text-left group disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Image className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white group-hover:text-brand-300">
                  Current Slide Image (PNG)
                </div>
                <div className="text-xs text-neutral-400">
                  Retina 2.5x resolution for slide #{activeSlideIndex + 1}
                </div>
              </div>
            </div>
            <Download className="w-4 h-4 text-neutral-500 group-hover:text-white" />
          </button>

          {/* Backup / Export Project JSON */}
          <button
            onClick={handleExportJson}
            disabled={isExporting}
            className="w-full p-3.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-brand-500/40 transition-all flex items-center justify-between text-left group disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white group-hover:text-brand-300">
                  Project JSON File
                </div>
                <div className="text-xs text-neutral-400">
                  Save complete editable project file to disk
                </div>
              </div>
            </div>
            <Download className="w-4 h-4 text-neutral-500 group-hover:text-white" />
          </button>
        </div>

        {/* Import JSON file */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
          <span className="text-neutral-400">Open existing project:</span>
          <label className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-200 transition-colors">
            <Upload className="w-3.5 h-3.5 text-brand-400" />
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
