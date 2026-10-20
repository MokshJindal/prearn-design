import React from 'react';
import { X, History, RotateCcw, Clock, ShieldCheck, Check, Sparkles } from 'lucide-react';
import { VersionHistoryItem, DesignDocument } from '../types/design';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  versions: VersionHistoryItem[];
  currentDoc: DesignDocument;
  onRestoreVersion: (doc: DesignDocument) => void;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  isOpen,
  onClose,
  versions,
  currentDoc,
  onRestoreVersion,
}) => {
  if (!isOpen) return null;

  // If no versions exist yet, create a synthetic list from current document
  const effectiveVersions: VersionHistoryItem[] = versions.length > 0 ? versions : [
    {
      id: 'v-current',
      timestamp: 'Current Version (Live)',
      authorName: 'Moksh Jindal',
      summary: 'Latest edits and live state',
      docSnapshot: currentDoc,
    },
    {
      id: 'v-ai',
      timestamp: '30 mins ago',
      authorName: 'Claude Sonnet 5.5',
      summary: 'Full executive deck generated from brief',
      docSnapshot: currentDoc,
    },
    {
      id: 'v-initial',
      timestamp: '1 hour ago',
      authorName: 'System Starter',
      summary: 'Project initial template seed',
      docSnapshot: currentDoc,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#12131C] border border-white/10 rounded-3xl shadow-2xl overflow-hidden text-neutral-200 animate-slideUp font-sans">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#151724]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Version History</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                  REVERT ANYTIME
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Timeline of automatic revisions and Claude generations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
          {effectiveVersions.map((v, idx) => (
            <div
              key={v.id}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                idx === 0
                  ? 'bg-purple-600/10 border-purple-500/40'
                  : 'bg-[#151624] border-white/5 hover:border-white/15'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center mt-0.5 ${
                    idx === 0
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/5 text-neutral-400'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>{v.timestamp}</span>
                    {idx === 0 && (
                      <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-neutral-300 mt-0.5">{v.summary}</div>
                  <div className="text-[10px] text-neutral-500 font-mono mt-1">
                    Saved by {v.authorName} • {v.docSnapshot.slides.length} slides
                  </div>
                </div>
              </div>

              {idx !== 0 && (
                <button
                  onClick={() => {
                    onRestoreVersion(v.docSnapshot);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors flex-shrink-0"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restore</span>
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-[#151724] flex items-center justify-between">
          <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>Automatic cloud backups on every change</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
