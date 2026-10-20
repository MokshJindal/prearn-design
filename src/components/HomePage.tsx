import React, { useState } from 'react';
import { 
  Sparkles, 
  Plus, 
  FileText, 
  Search, 
  Settings, 
  ArrowRight, 
  Clock, 
  Copy, 
  Trash2, 
  ChevronDown,
  Layers,
  Edit2
} from 'lucide-react';
import { DesignDocument, DocumentType } from '../types/design';
import { getTheme } from '../services/themes';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface HomePageProps {
  documents: DesignDocument[];
  onOpenDocument: (doc: DesignDocument) => void;
  onCreateNewWithAi: () => void;
  onCreateBlank: (type: DocumentType) => void;
  onDuplicateDocument: (doc: DesignDocument) => void;
  onDeleteDocument: (id: string) => void;
  onRenameDocument: (id: string, newTitle: string) => void;
  onOpenSettings: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  documents,
  onOpenDocument,
  onCreateNewWithAi,
  onCreateBlank,
  onDuplicateDocument,
  onDeleteDocument,
  onRenameDocument,
  onOpenSettings,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pitch-deck' | 'brochure' | 'one-pager' | 'flyer'>('all');
  
  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<DesignDocument | null>(null);

  // Inline renaming state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const filteredDocuments = documents.filter((doc) => {
    const matchesFilter = selectedFilter === 'all' || doc.type === selectedFilter;
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (doc.subtitle && doc.subtitle.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handleStartRename = (e: React.MouseEvent, doc: DesignDocument) => {
    e.stopPropagation();
    setEditingId(doc.id);
    setEditingTitle(doc.title);
  };

  const handleCommitRename = (id: string) => {
    if (editingTitle.trim()) {
      onRenameDocument(id, editingTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="min-h-screen w-full gamma-mesh-bg text-neutral-100 flex flex-col font-sans select-none overflow-y-auto">
      {/* 1. TOP NAVBAR */}
      <header className="h-16 px-6 border-b border-white/5 bg-[#090A10]/80 backdrop-blur-xl flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-gamma-glow">
              ✦
            </div>
            <span className="font-bold text-white text-base tracking-tight">PREARN</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/15 text-purple-300 font-semibold uppercase">
              STUDIO
            </span>
          </div>

          <div className="h-4 w-px bg-white/10 hidden md:block" />

          <button className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full gamma-glass text-xs text-neutral-300 hover:text-white transition-colors">
            <span>Workspace</span>
            <ChevronDown className="w-3 h-3 text-neutral-400" />
          </button>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-md mx-6 hidden sm:block">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search presentations, pitch decks, brochures..."
              className="w-full bg-[#13141F] border border-white/10 rounded-full pl-9 pr-4 py-1.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onCreateNewWithAi}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs transition-all shadow-gamma-glow hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>New with AI</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-full gamma-glass hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
            title="API Key & Claude Model Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. MAIN DASHBOARD CONTENT */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 space-y-12">
        {/* HERO TITLE SECTION */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white font-display">
            What would you like to create today?
          </h1>
          <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
            Generate executive pitch decks, luxury brochures, and visual presentations powered directly by Claude 3.7 / 3.5 Sonnet.
          </p>
        </div>

        {/* 3 HERO CREATION ACTION CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Generate with AI */}
          <div
            onClick={onCreateNewWithAi}
            className="group relative p-6 rounded-3xl bg-gradient-to-b from-[#1C182E] to-[#12131F] border border-purple-500/30 hover:border-purple-500/60 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-gamma-glow hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-600/30 text-purple-300 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/20 text-purple-300 font-semibold uppercase tracking-wider mb-2">
              RECOMMENDED
            </div>
            <h3 className="text-lg font-bold text-white mb-1.5 flex items-center justify-between">
              <span>Generate with AI</span>
              <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Start with a brief or topic. Claude writes copy, structures slides, and crafts beautiful cards instantly.
            </p>
          </div>

          {/* Card 2: Paste in Text */}
          <div
            onClick={onCreateNewWithAi}
            className="group relative p-6 rounded-3xl bg-[#141522] border border-white/10 hover:border-cyan-500/50 transition-all duration-200 cursor-pointer shadow-lg hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/20 text-cyan-300 font-semibold uppercase tracking-wider mb-2">
              FAST CONVERSION
            </div>
            <h3 className="text-lg font-bold text-white mb-1.5 flex items-center justify-between">
              <span>Paste in Text or Notes</span>
              <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Transform meeting notes, executive summaries, or product briefs into polished presentation cards.
            </p>
          </div>

          {/* Card 3: Blank Deck */}
          <div
            onClick={() => onCreateBlank('pitch-deck')}
            className="group relative p-6 rounded-3xl bg-[#141522] border border-white/10 hover:border-emerald-500/50 transition-all duration-200 cursor-pointer shadow-lg hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6" />
            </div>
            <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 font-semibold uppercase tracking-wider mb-2">
              CUSTOM CANVAS
            </div>
            <h3 className="text-lg font-bold text-white mb-1.5 flex items-center justify-between">
              <span>Blank Canvas</span>
              <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Start with an empty canvas and build your deck card-by-card with our interactive Canva-style tools.
            </p>
          </div>
        </div>

        {/* 4. RECENT DECKS SECTION */}
        <div className="space-y-5 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white">Your Presentations & Decks</h2>
              <p className="text-xs text-neutral-400 mt-0.5">Manage, edit, duplicate, or delete your projects</p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto p-1 rounded-full gamma-glass text-xs">
              {[
                { id: 'all', label: 'All Decks' },
                { id: 'pitch-deck', label: 'Pitch Decks' },
                { id: 'brochure', label: 'Brochures' },
                { id: 'one-pager', label: 'One-Pagers' },
                { id: 'flyer', label: 'Flyers' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFilter(f.id as any)}
                  className={`px-3 py-1 rounded-full transition-all text-xs font-medium whitespace-nowrap ${
                    selectedFilter === f.id
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Empty State */}
          {filteredDocuments.length === 0 && (
            <div className="py-16 text-center space-y-3 p-8 rounded-3xl bg-[#141522] border border-white/10">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">No presentations found</h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                You haven't created any decks matching this filter yet. Start by generating one with Claude AI!
              </p>
              <button
                onClick={onCreateNewWithAi}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow-gamma-glow mt-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Create with AI</span>
              </button>
            </div>
          )}

          {/* Decks Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((doc) => {
              const theme = getTheme(doc.themeId);
              const firstSlide = doc.slides[0];

              return (
                <div
                  key={doc.id}
                  onClick={() => onOpenDocument(doc)}
                  className="group relative rounded-3xl bg-[#141522] border border-white/10 hover:border-purple-500/50 transition-all duration-200 cursor-pointer overflow-hidden shadow-lg hover:shadow-gamma-glow hover:-translate-y-1 flex flex-col justify-between"
                >
                  {/* Card Visual Preview */}
                  <div
                    className="h-44 w-full p-5 relative overflow-hidden flex flex-col justify-between"
                    style={{ backgroundColor: theme.bg }}
                  >
                    <div
                      className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-30 pointer-events-none"
                      style={{ backgroundColor: theme.primary }}
                    />

                    {/* Top pill & Quick Action Buttons */}
                    <div className="flex items-center justify-between text-[10px] relative z-20">
                      <span
                        className="px-2.5 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider"
                        style={{
                          backgroundColor: theme.badgeBg,
                          color: theme.badgeText,
                          border: `1px solid ${theme.surfaceBorder}`,
                        }}
                      >
                        {doc.type.replace('-', ' ')}
                      </span>

                      {/* Direct Duplicate & Delete Buttons (Always visible on card for easy management) */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDuplicateDocument(doc);
                          }}
                          className="p-1.5 rounded-lg bg-black/50 hover:bg-white/20 text-neutral-300 hover:text-white transition-colors"
                          title="Duplicate Presentation"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(doc);
                          }}
                          className="p-1.5 rounded-lg bg-black/50 hover:bg-red-500/30 text-neutral-300 hover:text-red-400 transition-colors"
                          title="Delete Presentation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Miniature Headline */}
                    <div className="relative z-10">
                      <h4
                        className="text-base font-extrabold line-clamp-2 leading-tight mb-1"
                        style={{ color: theme.textPrimary }}
                      >
                        {firstSlide ? firstSlide.headline : doc.title}
                      </h4>
                      <p
                        className="text-[11px] line-clamp-1 opacity-70"
                        style={{ color: theme.textSecondary }}
                      >
                        {firstSlide ? firstSlide.subheadline : doc.subtitle}
                      </p>
                    </div>

                    {/* Open in Editor Hover Pill */}
                    <div className="absolute inset-0 bg-purple-950/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-10">
                      <span className="px-4 py-2 rounded-full bg-white text-black font-bold text-xs shadow-lg flex items-center gap-1.5">
                        <span>Open in Editor</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>

                  {/* Card Footer Metadata with Inline Title Edit */}
                  <div className="p-4 bg-[#11121C] border-t border-white/5 flex items-center justify-between">
                    <div className="flex-1 min-w-0 pr-2">
                      {editingId === doc.id ? (
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onBlur={() => handleCommitRename(doc.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCommitRename(doc.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                          className="w-full bg-black/50 border border-purple-500 rounded px-2 py-0.5 text-xs text-white focus:outline-none"
                        />
                      ) : (
                        <div className="flex items-center gap-1.5 group/title">
                          <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                            {doc.title}
                          </h3>
                          <button
                            onClick={(e) => handleStartRename(e, doc)}
                            className="opacity-0 group-hover/title:opacity-100 p-0.5 hover:text-white text-neutral-400 transition-opacity"
                            title="Rename"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-[11px] text-neutral-500 mt-0.5 font-mono">
                        <Clock className="w-3 h-3" />
                        <span>{doc.slides.length} Cards • Edited recently</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* CONFIRM DELETE MODAL */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        documentTitle={deleteTarget?.title || ''}
        onConfirm={() => {
          if (deleteTarget) {
            onDeleteDocument(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
