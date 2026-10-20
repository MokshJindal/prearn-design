import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  documentTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  documentTitle,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div 
        className="w-full max-w-md bg-[#141520] border border-white/10 rounded-3xl shadow-2xl p-6 text-neutral-200 animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Delete Project</h3>
              <p className="text-xs text-neutral-400">Permanently remove this deck</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-xl hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="my-5 space-y-2 text-xs">
          <p className="text-neutral-300 leading-relaxed">
            Are you sure you want to delete <span className="font-bold text-white">"{documentTitle}"</span>?
          </p>
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-[11px] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>This will delete all cards, copy, and layout configurations.</span>
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-2.5">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl hover:bg-white/10 text-neutral-400 hover:text-white text-xs font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Permanently</span>
          </button>
        </div>
      </div>
    </div>
  );
};
