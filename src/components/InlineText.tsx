import React, { useState, useRef, useEffect } from 'react';

interface InlineTextProps {
  value: string;
  onChange: (newValue: string) => void;
  className?: string;
  placeholder?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
  multiline?: boolean;
  style?: React.CSSProperties;
  onSelect?: () => void;
  readOnly?: boolean;
}

export const InlineText: React.FC<InlineTextProps> = ({
  value,
  onChange,
  className = '',
  placeholder = 'Type here...',
  as = 'span',
  multiline = false,
  style = {},
  onSelect,
  readOnly = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentText, setCurrentText] = useState(value);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentText(value);
  }, [value]);

  const handleBlur = () => {
    if (readOnly) return;
    setIsEditing(false);
    if (currentText !== value) {
      onChange(currentText);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (readOnly) return;
    if (e.key === 'Enter' && !multiline && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    }
    if (e.key === 'Escape') {
      setCurrentText(value);
      setIsEditing(false);
    }
  };

  const Tag = as as any;

  return (
    <Tag
      ref={textRef}
      contentEditable={!readOnly}
      suppressContentEditableWarning
      onFocus={() => {
        if (readOnly) return;
        setIsEditing(true);
        onSelect?.();
      }}
      onBlur={handleBlur}
      onInput={(e: React.FormEvent<HTMLElement>) => {
        if (readOnly) return;
        setCurrentText(e.currentTarget.innerText || '');
      }}
      onKeyDown={handleKeyDown}
      className={`outline-none transition-all duration-150 ${
        readOnly ? 'cursor-default select-text' : 'cursor-text rounded-sm'
      } ${
        isEditing && !readOnly
          ? 'ring-2 ring-brand-500/80 bg-brand-500/10 shadow-sm'
          : !readOnly
          ? 'hover:ring-1 hover:ring-white/20'
          : ''
      } ${className}`}
      style={style}
      title={readOnly ? undefined : "Click to edit text directly"}
    >
      {value || (isEditing ? '' : <span className="opacity-40 italic">{placeholder}</span>)}
    </Tag>
  );
};
