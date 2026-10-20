import React, { useState } from 'react';
import { 
  Play, 
  Download, 
  Settings, 
  ChevronDown, 
  ArrowLeft,
  Sparkles,
  Bot,
  Crown,
  Wand2,
  Check,
  Users,
  FileText,
  Eye
} from 'lucide-react';
import { DesignDocument, DocumentType, Collaborator } from '../types/design';
import { THEMES } from '../services/themes';
import { AVAILABLE_MODELS, getStoredModel, setStoredModel } from '../services/claude';
import { InlineText } from './InlineText';

interface NavbarProps {
  document: DesignDocument;
  onUpdateTitle: (newTitle: string) => void;
  onSelectTheme: (themeId: string) => void;
  onSwitchDocumentType: (type: DocumentType) => void;
  onStartPresentation: () => void;
  onOpenExportModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenShareModal: () => void;
  onBackToHome: () => void;
  onOpenPdfImport?: () => void;
  collaborators?: Collaborator[];
  role?: Collaborator['role'];
}

export const Navbar: React.FC<NavbarProps> = ({
  document,
  onUpdateTitle,
  onSelectTheme,
  onSwitchDocumentType,
  onStartPresentation,
  onOpenExportModal,
  onOpenSettingsModal,
  onOpenShareModal,
  onBackToHome,
  onOpenPdfImport,
  collaborators = [],
  role = 'editor',
}) => {
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [activeModel, setActiveModel] = useState(getStoredModel());

  const activeTheme = THEMES.find((t) => t.id === document.themeId) || THEMES[0];
  const activeModelObj = AVAILABLE_MODELS.find(m => m.id === activeModel) || AVAILABLE_MODELS[0];

  const handleSelectModel = (id: string) => {
    setActiveModel(id);
    setStoredModel(id);
    setShowModelMenu(false);
  };

  const docTypes: Array<{ type: DocumentType; label: string; icon: string }> = [
    { type: 'pitch-deck', label: 'Pitch Deck (16:9)', icon: '📽️' },
    { type: 'brochure', label: 'Luxury Brochure (Tri-Fold)', icon: '📖' },
    { type: 'one-pager', label: 'Executive One-Pager', icon: '📄' },
    { type: 'flyer', label: 'Product Flyer / Poster', icon: '🎨' },
  ];

  return (
    <nav className="h-14 px-4 sm:px-6 border-b border-white/5 bg-[#090A10]/90 backdrop-blur-xl flex items-center justify-between text-xs text-neutral-300 select-none z-30 relative">
      {/* Left: Back to Home & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full gamma-glass hover:bg-white/10 text-neutral-300 hover:text-white transition-all font-medium text-xs shadow-sm"
          title="Back to All Presentations"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden sm:inline">Home</span>
        </button>

        <span className="text-white/10 hidden sm:inline">/</span>

        {/* Project Title (Inline Editable) */}
        <div className="max-w-xs md:max-w-md truncate">
          <InlineText
            value={document.title}
            onChange={onUpdateTitle}
            as="span"
            className="text-sm font-semibold text-white hover:text-purple-300 truncate px-2 py-1"
          />
        </div>
      </div>

      {/* Center: Model Selector, Format & Theme */}
      <div className="flex items-center gap-2">
        {/* Model Selector Dropdown (Opus, Sonnet, Fable) */}
        <div className="relative">
          <button
            onClick={() => setShowModelMenu(!showModelMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-600/15 border border-purple-500/30 text-purple-200 hover:bg-purple-600/25 transition-all"
            title="Change active Claude Model"
          >
            {activeModelObj.category === 'Opus' && <Crown className="w-3.5 h-3.5 text-amber-400" />}
            {activeModelObj.category === 'Sonnet' && <Sparkles className="w-3.5 h-3.5 text-purple-400" />}
            {activeModelObj.category === 'Fable' && <Wand2 className="w-3.5 h-3.5 text-cyan-400" />}
            <span className="font-semibold text-xs hidden sm:inline">{activeModelObj.category}</span>
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>

          {showModelMenu && (
            <div className="absolute top-full mt-2 left-0 w-64 bg-[#141520] border border-white/10 rounded-2xl shadow-2xl p-2 z-50 animate-fadeIn">
              <div className="px-2 py-1 text-[10px] font-mono uppercase text-neutral-500 font-bold">
                Select Claude Engine
              </div>
              <div className="space-y-1 mt-1">
                {AVAILABLE_MODELS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handleSelectModel(m.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors ${
                      activeModel === m.id
                        ? 'bg-purple-600/20 text-purple-200 border border-purple-500/40'
                        : 'text-neutral-300 hover:bg-white/5'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-xs text-white flex items-center gap-1.5">
                        {m.category === 'Opus' && <Crown className="w-3 h-3 text-amber-400" />}
                        {m.category === 'Sonnet' && <Sparkles className="w-3 h-3 text-purple-400" />}
                        {m.category === 'Fable' && <Wand2 className="w-3 h-3 text-cyan-400" />}
                        <span>{m.name.split('(')[0]}</span>
                      </div>
                      <div className="text-[10px] text-neutral-400 line-clamp-1">{m.description}</div>
                    </div>
                    {activeModel === m.id && <Check className="w-3.5 h-3.5 text-purple-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Document Format Switcher */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setShowTypeMenu(!showTypeMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full gamma-glass hover:bg-white/10 text-neutral-200 transition-colors"
          >
            <span className="capitalize">{document.type.replace('-', ' ')}</span>
            <ChevronDown className="w-3 h-3 text-neutral-400" />
          </button>

          {showTypeMenu && (
            <div className="absolute top-full mt-2 left-0 w-52 bg-[#141520] border border-white/10 rounded-2xl shadow-2xl p-1.5 z-50 animate-fadeIn">
              {docTypes.map((dt) => (
                <button
                  key={dt.type}
                  onClick={() => {
                    onSwitchDocumentType(dt.type);
                    setShowTypeMenu(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-colors ${
                    document.type === dt.type
                      ? 'bg-purple-600 text-white font-medium'
                      : 'text-neutral-300 hover:bg-white/5'
                  }`}
                >
                  <span>{dt.icon}</span>
                  <span>{dt.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full gamma-glass hover:bg-white/10 text-neutral-200 transition-colors"
          >
            <div
              className="w-3 h-3 rounded-full shadow-sm"
              style={{ backgroundColor: activeTheme.primary }}
            />
            <span className="hidden sm:inline text-xs font-medium">
              {activeTheme.name.split('(')[0].trim()}
            </span>
            <ChevronDown className="w-3 h-3 text-neutral-400" />
          </button>

          {showThemeMenu && (
            <div className="absolute top-full mt-2 right-0 w-60 bg-[#141520] border border-white/10 rounded-2xl shadow-2xl p-2 z-50 animate-fadeIn">
              <div className="px-2 py-1 text-[10px] font-mono uppercase text-neutral-500 font-bold">
                Theme Styling
              </div>
              <div className="space-y-1 mt-1">
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => {
                      onSelectTheme(theme.id);
                      setShowThemeMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-colors ${
                      document.themeId === theme.id
                        ? 'bg-purple-600/20 text-purple-200 font-medium border border-purple-500/30'
                        : 'text-neutral-300 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-white/20"
                        style={{ backgroundColor: theme.primary }}
                      />
                      <span className="text-xs truncate">{theme.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Presence, Share, Presentation, Export, Settings */}
      <div className="flex items-center gap-2">
        {/* Role Pill */}
        {role === 'viewer' ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 font-mono text-[11px] font-bold">
            <Eye className="w-3 h-3 text-blue-400" />
            <span>VIEW ONLY</span>
          </div>
        ) : (
          <span className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-[10px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            CAN EDIT
          </span>
        )}

        {/* Collaborators Avatar Stack */}
        {collaborators.length > 0 && (
          <div className="flex items-center -space-x-1.5 mr-1 hidden sm:flex">
            {collaborators.slice(0, 3).map((col) => (
              <div
                key={col.id}
                className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] text-white border-2 border-[#090A10] relative shadow-sm cursor-pointer"
                style={{ backgroundColor: col.color }}
                title={`${col.name} (${col.role}) - ${col.status}`}
                onClick={onOpenShareModal}
              >
                {col.avatar}
                {col.status === 'active' && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-[#090A10]" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Import PDF Button */}
        {onOpenPdfImport && (
          <button
            onClick={onOpenPdfImport}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 text-pink-200 font-medium text-xs transition-all"
            title="Import any PDF and convert into editable presentation"
          >
            <FileText className="w-3.5 h-3.5 text-pink-400" />
            <span className="hidden md:inline">Import PDF</span>
          </button>
        )}

        {/* Canva-Grade Share Button */}
        <button
          onClick={onOpenShareModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs transition-all shadow-gamma-glow hover:scale-[1.02] active:scale-[0.98]"
          title="Share presentation with collaborators"
        >
          <Users className="w-3.5 h-3.5" />
          <span>Share</span>
        </button>

        <button
          onClick={onStartPresentation}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-white font-medium transition-all"
          title="Fullscreen Presentation"
        >
          <Play className="w-3 h-3 fill-current text-purple-400" />
          <span className="hidden sm:inline">Present</span>
        </button>

        <button
          onClick={onOpenExportModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export</span>
        </button>

        <button
          onClick={onOpenSettingsModal}
          className="p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          title="API Key Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
};
