import React from 'react';
import { 
  Bold, 
  Italic, 
  Type, 
  Sparkles, 
  Trash2, 
  Copy, 
  ArrowUp, 
  ArrowDown, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Palette
} from 'lucide-react';
import { DesignElement } from '../types/design';
import { refineTextWithClaude } from '../services/claude';

interface ToolbarProps {
  selectedElement: DesignElement | null;
  onUpdateElement: (updated: DesignElement) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (element: DesignElement) => void;
  onMoveElement: (id: string, direction: 'up' | 'down') => void;
  primaryColor: string;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  selectedElement,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  onMoveElement,
  primaryColor,
}) => {
  const [isPolishing, setIsPolishing] = React.useState(false);

  if (!selectedElement) {
    return (
      <div className="h-11 px-4 border-b border-white/10 bg-[#141413]/90 backdrop-blur-md flex items-center justify-between text-xs text-neutral-400 select-none">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Interactive Canvas Ready — Click any text or card to edit like Canva</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-neutral-500">Shortcuts: Click text to edit • Arrow keys to navigate slides</span>
        </div>
      </div>
    );
  }

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
    <div className="h-11 px-4 border-b border-white/10 bg-[#161615] backdrop-blur-md flex items-center justify-between text-xs text-neutral-300 select-none animate-fadeIn">
      {/* Left: Element Type Badge & Label */}
      <div className="flex items-center gap-2">
        <span className="px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 font-mono text-[11px] font-semibold uppercase tracking-wider">
          {selectedElement.type.replace('-', ' ')}
        </span>
        <span className="text-neutral-500 hidden sm:inline">|</span>
        <span className="text-neutral-400 font-medium truncate max-w-[150px]">
          {selectedElement.title || selectedElement.statValue || 'Element Selected'}
        </span>
      </div>

      {/* Center: Formatting & AI Tools */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* AI Quick Polish Dropdown/Buttons */}
        <div className="flex items-center bg-black/40 rounded-lg p-0.5 border border-white/10">
          <button
            onClick={() => handleAiPolish('punchy')}
            disabled={isPolishing}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-neutral-300 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
            title="Make copy punchy & concise with Claude"
          >
            <Sparkles className={`w-3.5 h-3.5 text-brand-400 ${isPolishing ? 'animate-spin' : ''}`} />
            <span className="font-medium hidden md:inline">Make Punchy</span>
          </button>
          <button
            onClick={() => handleAiPolish('executive')}
            disabled={isPolishing}
            className="px-2 py-1 rounded text-neutral-400 hover:text-white hover:bg-white/10 transition-colors hidden lg:inline"
            title="Elevate tone to Fortune 500 Executive"
          >
            Executive
          </button>
          <button
            onClick={() => handleAiPolish('shorter')}
            disabled={isPolishing}
            className="px-2 py-1 rounded text-neutral-400 hover:text-white hover:bg-white/10 transition-colors hidden lg:inline"
            title="Condense into fewer words"
          >
            Shorter
          </button>
        </div>

        {/* Alignment controls */}
        <div className="flex items-center bg-black/40 rounded-lg p-0.5 border border-white/10">
          <button
            onClick={() => onUpdateElement({
              ...selectedElement,
              style: { ...selectedElement.style, textAlign: 'left' }
            })}
            className={`p-1.5 rounded hover:bg-white/10 transition-colors ${
              selectedElement.style?.textAlign === 'left' ? 'text-brand-400 bg-white/10' : 'text-neutral-400'
            }`}
            title="Align Left"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onUpdateElement({
              ...selectedElement,
              style: { ...selectedElement.style, textAlign: 'center' }
            })}
            className={`p-1.5 rounded hover:bg-white/10 transition-colors ${
              selectedElement.style?.textAlign === 'center' ? 'text-brand-400 bg-white/10' : 'text-neutral-400'
            }`}
            title="Align Center"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onUpdateElement({
              ...selectedElement,
              style: { ...selectedElement.style, textAlign: 'right' }
            })}
            className={`p-1.5 rounded hover:bg-white/10 transition-colors ${
              selectedElement.style?.textAlign === 'right' ? 'text-brand-400 bg-white/10' : 'text-neutral-400'
            }`}
            title="Align Right"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Right: Duplicate, Move, Delete */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onMoveElement(selectedElement.id, 'up')}
          className="p-1.5 rounded hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          title="Move element up"
        >
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onMoveElement(selectedElement.id, 'down')}
          className="p-1.5 rounded hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          title="Move element down"
        >
          <ArrowDown className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDuplicateElement(selectedElement)}
          className="p-1.5 rounded hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          title="Duplicate Element"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDeleteElement(selectedElement.id)}
          className="p-1.5 rounded hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-colors ml-1"
          title="Delete Element"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
