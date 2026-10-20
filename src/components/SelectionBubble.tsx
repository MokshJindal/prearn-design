import React, { useState } from 'react';
import { 
  Sparkles, 
  Copy, 
  Trash2, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  ArrowUp, 
  ArrowDown,
  Wand2
} from 'lucide-react';
import { DesignElement } from '../types/design';
import { refineTextWithClaude } from '../services/claude';

interface SelectionBubbleProps {
  selectedElement: DesignElement;
  onUpdateElement: (updated: DesignElement) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (element: DesignElement) => void;
  onMoveElement: (id: string, direction: 'up' | 'down') => void;
  onClose: () => void;
}

export const SelectionBubble: React.FC<SelectionBubbleProps> = ({
  selectedElement,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  onMoveElement,
  onClose,
}) => {
  const [isPolishing, setIsPolishing] = useState(false);

  const handleAiPolish = async (tone: 'punchy' | 'executive' | 'data-heavy' | 'shorter') => {
    const textToPolish = selectedElement.title || selectedElement.content || selectedElement.statLabel;
    if (!textToPolish) return;

    try {
      setIsPolishing(true);
      const polished = await refineTextWithClaude(textToPolish, tone);
      if (selectedElement.title) {
        onUpdateElement({ ...selectedElement, title: polished });
      } else if (selectedElement.content) {
        onUpdateElement({ ...selectedElement, content: polished });
      } else if (selectedElement.statLabel) {
        onUpdateElement({ ...selectedElement, statLabel: polished });
      }
    } catch (err: any) {
      alert(`AI Polish error: ${err.message}`);
    } finally {
      setIsPolishing(false);
    }
  };

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 gamma-glass rounded-2xl px-3 py-1.5 shadow-xl flex items-center gap-2 text-xs text-neutral-200 border border-white/15 animate-fadeIn">
      {/* Element Type Pill */}
      <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-mono text-[10px] font-bold uppercase tracking-wider">
        {selectedElement.type.replace('-', ' ')}
      </span>

      <span className="w-px h-4 bg-white/10" />

      {/* AI Polish */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleAiPolish('punchy')}
          disabled={isPolishing}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
          title="Make copy punchy with Claude"
        >
          <Sparkles className={`w-3.5 h-3.5 text-purple-400 ${isPolishing ? 'animate-spin' : ''}`} />
          <span className="font-medium text-xs">Punchy</span>
        </button>
        <button
          onClick={() => handleAiPolish('executive')}
          disabled={isPolishing}
          className="px-2 py-1 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          title="Elevate to executive tone"
        >
          Executive
        </button>
        <button
          onClick={() => handleAiPolish('shorter')}
          disabled={isPolishing}
          className="px-2 py-1 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          title="Condense"
        >
          Shorter
        </button>
      </div>

      <span className="w-px h-4 bg-white/10" />

      {/* Alignments */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={() => onUpdateElement({
            ...selectedElement,
            style: { ...selectedElement.style, textAlign: 'left' }
          })}
          className={`p-1.5 rounded-lg hover:bg-white/10 ${
            selectedElement.style?.textAlign === 'left' ? 'text-purple-400 bg-white/10' : 'text-neutral-400'
          }`}
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onUpdateElement({
            ...selectedElement,
            style: { ...selectedElement.style, textAlign: 'center' }
          })}
          className={`p-1.5 rounded-lg hover:bg-white/10 ${
            selectedElement.style?.textAlign === 'center' ? 'text-purple-400 bg-white/10' : 'text-neutral-400'
          }`}
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onUpdateElement({
            ...selectedElement,
            style: { ...selectedElement.style, textAlign: 'right' }
          })}
          className={`p-1.5 rounded-lg hover:bg-white/10 ${
            selectedElement.style?.textAlign === 'right' ? 'text-purple-400 bg-white/10' : 'text-neutral-400'
          }`}
        >
          <AlignRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <span className="w-px h-4 bg-white/10" />

      {/* Reorder, Duplicate, Delete */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onMoveElement(selectedElement.id, 'up')}
          className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white"
          title="Move Earlier"
        >
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onMoveElement(selectedElement.id, 'down')}
          className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white"
          title="Move Later"
        >
          <ArrowDown className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDuplicateElement(selectedElement)}
          className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white"
          title="Duplicate"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDeleteElement(selectedElement.id)}
          className="p-1.5 rounded-lg hover:bg-red-500/20 text-neutral-400 hover:text-red-400"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
