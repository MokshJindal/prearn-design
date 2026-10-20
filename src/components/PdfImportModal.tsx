import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { DesignDocument } from '../types/design';
import { convertPdfToPresentation, PdfConversionProgress } from '../services/pdfConverter';

interface PdfImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (document: DesignDocument) => void;
  onShowToast: (msg: string) => void;
}

export const PdfImportModal: React.FC<PdfImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
  onShowToast,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<PdfConversionProgress | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processSelectedFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processSelectedFile(files[0]);
    }
  };

  const processSelectedFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Please select a valid .pdf file.');
      return;
    }

    setSelectedFile(file);
    setErrorMessage(null);
    setIsProcessing(true);

    try {
      const generatedDoc = await convertPdfToPresentation(file, (prog) => {
        setProgress(prog);
      });

      onShowToast(`Successfully converted "${file.name}" into ${generatedDoc.slides.length} editable cards!`);
      setTimeout(() => {
        setIsProcessing(false);
        onClose();
        onImportComplete(generatedDoc);
      }, 700);
    } catch (err: any) {
      console.error('PDF Conversion error:', err);
      setIsProcessing(false);
      setErrorMessage(err.message || 'Failed to parse and convert PDF. Please try another file.');
    }
  };

  const resetState = () => {
    setSelectedFile(null);
    setIsProcessing(false);
    setProgress(null);
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-[#12131C] border border-white/10 rounded-3xl shadow-2xl overflow-hidden text-neutral-200 animate-slideUp">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#151724]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 flex items-center justify-center text-white shadow-gamma-glow">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Import & Edit Any PDF</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-pink-500/20 text-pink-300 font-semibold border border-pink-500/30">
                  CANVA PARSER
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Upload any pitch deck, brochure, or document. Every element becomes 100% editable.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              resetState();
              onClose();
            }}
            disabled={isProcessing}
            className="p-1.5 rounded-xl hover:bg-white/10 text-neutral-400 hover:text-white transition-colors disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {!isProcessing ? (
            <>
              {/* Dropzone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-purple-500 bg-purple-500/10 scale-[1.01]'
                    : 'border-white/15 hover:border-purple-500/50 bg-[#090A10]/60 hover:bg-[#090A10]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />

                <div className="w-14 h-14 rounded-3xl bg-purple-600/15 border border-purple-500/30 text-purple-300 flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <Upload className="w-6 h-6 animate-pulse" />
                </div>

                <h3 className="text-sm sm:text-base font-bold text-white mb-1.5">
                  Drag and drop your PDF here, or <span className="text-purple-400 underline">browse</span>
                </h3>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto mb-4">
                  Supports pitch decks, pitch books, company reports, and brochures up to 100+ pages.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-neutral-400 font-mono">
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
                    ✨ Headings & Body
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
                    📊 Stat & Metric Blocks
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
                    📑 Bullet Points & Cards
                  </span>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-200 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </>
          ) : (
            /* Conversion Progress State */
            <div className="p-6 rounded-3xl bg-[#090A10] border border-white/10 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white truncate max-w-xs">
                      {selectedFile?.name}
                    </h4>
                    <p className="text-xs text-neutral-400">
                      {progress?.message || 'Processing PDF structure...'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-mono font-bold text-purple-400">
                    {progress?.percent || 20}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 transition-all duration-300"
                  style={{ width: `${progress?.percent || 20}%` }}
                />
              </div>

              {/* Multi-Stage Checkpoints */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] font-mono">
                <div className={`p-2 rounded-xl border ${
                  (progress?.percent || 0) >= 25 
                    ? 'bg-purple-600/10 border-purple-500/30 text-purple-200' 
                    : 'bg-white/5 border-white/5 text-neutral-500'
                }`}>
                  <div className="font-bold">1. Extract</div>
                  <div className="text-[10px] opacity-75">Text & coordinates</div>
                </div>
                <div className={`p-2 rounded-xl border ${
                  (progress?.percent || 0) >= 65 
                    ? 'bg-purple-600/10 border-purple-500/30 text-purple-200' 
                    : 'bg-white/5 border-white/5 text-neutral-500'
                }`}>
                  <div className="font-bold">2. Structure</div>
                  <div className="text-[10px] opacity-75">Bento & stat blocks</div>
                </div>
                <div className={`p-2 rounded-xl border ${
                  (progress?.percent || 0) >= 100 
                    ? 'bg-emerald-600/10 border-emerald-500/30 text-emerald-200' 
                    : 'bg-white/5 border-white/5 text-neutral-500'
                }`}>
                  <div className="font-bold">3. Editable</div>
                  <div className="text-[10px] opacity-75">Ready to design</div>
                </div>
              </div>
            </div>
          )}

          {/* Feature Highlights */}
          <div className="border-t border-white/10 pt-4 flex items-center justify-between text-xs text-neutral-400">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Full in-place editing for every element</span>
            </div>
            <button
              onClick={() => {
                resetState();
                onClose();
              }}
              className="px-4 py-1.5 rounded-xl hover:bg-white/10 text-neutral-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
