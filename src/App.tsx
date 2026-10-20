import React, { useState, useEffect } from 'react';
import { 
  DesignDocument, 
  SlidePage, 
  DocumentType, 
  DesignElement 
} from './types/design';
import { storageService } from './services/storage';
import { getTheme } from './services/themes';
import { HomePage } from './components/HomePage';
import { Navbar } from './components/Navbar';
import { GammaCard } from './components/GammaCard';
import { BrochureRenderer } from './components/BrochureRenderer';
import { CardOutline } from './components/CardOutline';
import { FloatingAiBar } from './components/FloatingAiBar';
import { SelectionBubble } from './components/SelectionBubble';
import { CreateAiModal } from './components/CreateAiModal';
import { PresentationModal } from './components/PresentationModal';
import { ExportModal } from './components/ExportModal';
import { SettingsModal } from './components/SettingsModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function App() {
  const [currentView, setCurrentView] = useState<'home' | 'editor'>('home');

  // Load from robust storageService
  const [documents, setDocuments] = useState<DesignDocument[]>(() => {
    return storageService.loadAll();
  });

  const [currentDoc, setCurrentDoc] = useState<DesignDocument>(() => {
    const all = storageService.loadAll();
    return all[0] || storageService.loadAll()[0];
  });

  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isOutlineOpen, setIsOutlineOpen] = useState<boolean>(true);

  // Modals
  const [isCreateAiOpen, setIsCreateAiOpen] = useState(false);
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}`;
    const newToast: ToastMessage = { ...toast, id };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Undo history for active editor
  const [history, setHistory] = useState<DesignDocument[]>([currentDoc]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const activeTheme = getTheme(currentDoc.themeId);
  const currentSlide = currentDoc.slides[activeSlideIndex] || currentDoc.slides[0];
  const selectedElement = currentSlide?.elements?.find(el => el.id === selectedElementId) || null;

  const pushDocState = (newDoc: DesignDocument) => {
    const newHistory = history.slice(0, historyIndex + 1);
    setHistory([...newHistory, newDoc]);
    setHistoryIndex(newHistory.length);
    setCurrentDoc(newDoc);

    // Save to storage
    storageService.save(newDoc);
    setDocuments(storageService.loadAll());
  };

  const handleOpenDocument = (doc: DesignDocument) => {
    setCurrentDoc(doc);
    setActiveSlideIndex(0);
    setSelectedElementId(null);
    setHistory([doc]);
    setHistoryIndex(0);
    setCurrentView('editor');
  };

  const handleCreateBlank = (type: DocumentType) => {
    const isBrochure = type === 'brochure';
    const blankDoc: DesignDocument = {
      id: `deck-${Date.now()}`,
      title: isBrochure ? 'Luxury Corporate Brochure' : 'Untitled Presentation',
      subtitle: 'Created with Prearn AI',
      type,
      aspectRatio: isBrochure ? 'trifold' : type === 'pitch-deck' ? '16:9' : 'a4-portrait',
      themeId: 'gamma-cosmic',
      fontFamily: isBrochure ? 'serif' : 'display',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      slides: isBrochure ? [
        {
          id: `panel-1`,
          title: 'Cover Panel',
          category: 'title',
          layout: 'hero',
          badge: 'ESTABLISHED 2026',
          headline: 'Luxury Enterprise Advisory',
          subheadline: 'Architecting high-scale intelligence for global organizations.',
          elements: [
            {
              id: `el-1`,
              type: 'feature-card',
              title: 'Strategic Counsel',
              subtitle: 'Institutional Architecture',
              content: 'Advising sovereign funds and enterprise leadership on autonomous AI deployment.',
              tag: 'STRATEGY',
              gridSpan: 'col-span-12 md:col-span-6'
            },
            {
              id: `el-2`,
              type: 'stat-block',
              statValue: '$14.2B',
              statLabel: 'Transaction Volume Advised',
              statChange: 'Verified track record',
              gridSpan: 'col-span-12 md:col-span-6'
            }
          ]
        },
        {
          id: `panel-2`,
          title: 'Capabilities',
          category: 'solution',
          layout: 'three-column',
          badge: 'OUR METHODOLOGY',
          headline: 'Three Pillars of Execution',
          subheadline: 'A disciplined approach combining machine intelligence with fiduciary precision.',
          elements: [
            {
              id: `el-3`,
              type: 'feature-card',
              title: '01. Rapid Synthesis',
              subtitle: 'Multi-agent auditing',
              content: 'Deep intelligence ingesting millions of data points across legacy enterprise silos.',
              tag: 'PHASE 1'
            },
            {
              id: `el-4`,
              type: 'feature-card',
              title: '02. Verifiable Proofs',
              subtitle: 'Cryptographic guarantees',
              content: 'Deterministic sandboxing ensuring zero regulatory or operational risk.',
              tag: 'PHASE 2'
            }
          ]
        },
        {
          id: `panel-3`,
          title: 'Contact & Engagement',
          category: 'closing',
          layout: 'hero',
          badge: 'ENGAGE WITH US',
          headline: 'Begin Your Transformation',
          subheadline: 'Confidential consultations for executive leadership and sovereign partners.',
          elements: [
            {
              id: `el-5`,
              type: 'cta-button',
              title: 'Schedule Private Consultation',
              content: 'advisory@auragroup.com • San Francisco, London, Zurich'
            }
          ]
        }
      ] : [
        {
          id: `slide-${Date.now()}-1`,
          title: 'Title Card',
          category: 'title',
          layout: 'hero',
          badge: 'NEW PRESENTATION',
          headline: 'Click to Add Your Big Idea Headline',
          subheadline: 'Supporting description or subtitle goes here. Click to edit in-place.',
          elements: [
            {
              id: `el-${Date.now()}-1`,
              type: 'feature-card',
              title: 'Strategic Pillar 01',
              subtitle: 'Core Differentiator',
              content: 'Click here to describe the first strategic pillar or value proposition.',
              tag: 'PILLAR 1',
              gridSpan: 'col-span-12 md:col-span-4'
            },
            {
              id: `el-${Date.now()}-2`,
              type: 'stat-block',
              statValue: '10x',
              statLabel: 'Productivity Lift',
              statChange: 'Verified customer benchmark',
              gridSpan: 'col-span-12 md:col-span-4'
            }
          ]
        }
      ]
    };

    storageService.save(blankDoc);
    setDocuments(storageService.loadAll());
    handleOpenDocument(blankDoc);
    addToast({ title: 'New project created', type: 'success' });
  };

  const handleDuplicateDocument = (doc: DesignDocument) => {
    const cloned = storageService.duplicate(doc.id);
    if (cloned) {
      setDocuments(storageService.loadAll());
      addToast({ 
        title: 'Project duplicated', 
        message: `Created "${cloned.title}"`,
        type: 'success' 
      });
    }
  };

  const handleDeleteDocument = (id: string) => {
    const deleted = storageService.delete(id);
    setDocuments(storageService.loadAll());
    if (deleted) {
      addToast({
        title: 'Project deleted',
        message: `"${deleted.title}" was moved to trash`,
        type: 'info',
        action: {
          label: 'Undo',
          onClick: () => {
            storageService.restore(deleted);
            setDocuments(storageService.loadAll());
            addToast({ title: 'Project restored', type: 'success' });
          }
        }
      });
    }
  };

  const handleRenameDocument = (id: string, newTitle: string) => {
    const all = storageService.loadAll();
    const doc = all.find(d => d.id === id);
    if (doc) {
      doc.title = newTitle;
      storageService.save(doc);
      setDocuments(storageService.loadAll());
      addToast({ title: 'Renamed successfully', type: 'success' });
    }
  };

  const handleAiDocumentCreated = (newDoc: DesignDocument) => {
    storageService.save(newDoc);
    setDocuments(storageService.loadAll());
    handleOpenDocument(newDoc);
    addToast({ 
      title: '✦ Deck generated with Claude!', 
      message: `${newDoc.slides.length} cards structured and styled.`,
      type: 'success' 
    });
  };

  const handleUpdateCurrentSlide = (updatedSlide: SlidePage) => {
    const updatedSlides = [...currentDoc.slides];
    updatedSlides[activeSlideIndex] = updatedSlide;
    const newDoc = { ...currentDoc, slides: updatedSlides, updatedAt: new Date().toISOString() };
    pushDocState(newDoc);
  };

  const handleAddSlide = (category: SlidePage['category'] = 'solution') => {
    const newSlide: SlidePage = {
      id: `slide-${Date.now()}`,
      title: 'New Card',
      category,
      layout: category === 'competition' ? 'table' : category === 'traction' ? 'bento-grid' : 'three-column',
      badge: category.toUpperCase(),
      headline: 'Click Here to Edit Your Headline',
      subheadline: 'Enter supporting context and quantitative targets here.',
      elements: [
        {
          id: `el-${Date.now()}-1`,
          type: 'feature-card',
          title: 'Strategic Superpower',
          subtitle: 'Core Differentiator',
          content: 'Autonomous neural workflows designed from the ground up for high-scale enterprise operations.',
          tag: 'ADVANTAGE',
          gridSpan: 'col-span-12 md:col-span-4'
        },
        {
          id: `el-${Date.now()}-2`,
          type: 'stat-block',
          statValue: '10x',
          statLabel: 'Velocity Multiplier',
          statChange: 'Verified customer benchmark',
          gridSpan: 'col-span-12 md:col-span-4'
        }
      ],
      notes: 'Presenter talking points'
    };

    const newSlides = [...currentDoc.slides];
    newSlides.splice(activeSlideIndex + 1, 0, newSlide);
    const newDoc = { ...currentDoc, slides: newSlides };
    pushDocState(newDoc);
    setActiveSlideIndex(activeSlideIndex + 1);
  };

  const handleDuplicateSlide = (index: number) => {
    const target = currentDoc.slides[index];
    const clonedSlide: SlidePage = {
      ...JSON.parse(JSON.stringify(target)),
      id: `slide-copy-${Date.now()}`,
      title: `${target.title} (Copy)`,
    };
    const newSlides = [...currentDoc.slides];
    newSlides.splice(index + 1, 0, clonedSlide);
    pushDocState({ ...currentDoc, slides: newSlides });
    setActiveSlideIndex(index + 1);
    addToast({ title: 'Card duplicated', type: 'success' });
  };

  const handleDeleteSlide = (index: number) => {
    if (currentDoc.slides.length <= 1) {
      addToast({ title: 'Cannot delete', message: 'A deck must contain at least one card.', type: 'error' });
      return;
    }
    const newSlides = currentDoc.slides.filter((_, i) => i !== index);
    const newIndex = Math.max(0, Math.min(index, newSlides.length - 1));
    pushDocState({ ...currentDoc, slides: newSlides });
    setActiveSlideIndex(newIndex);
    addToast({ title: 'Card deleted', type: 'info' });
  };

  const handleMoveSlide = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= currentDoc.slides.length) return;
    const newSlides = [...currentDoc.slides];
    const [moved] = newSlides.splice(fromIndex, 1);
    newSlides.splice(toIndex, 0, moved);
    pushDocState({ ...currentDoc, slides: newSlides });
    setActiveSlideIndex(toIndex);
  };

  const handleUpdateElement = (updatedElement: DesignElement) => {
    if (!currentSlide) return;
    const newElements = currentSlide.elements.map(el => el.id === updatedElement.id ? updatedElement : el);
    handleUpdateCurrentSlide({ ...currentSlide, elements: newElements });
  };

  const handleDeleteElement = (id: string) => {
    if (!currentSlide) return;
    const newElements = currentSlide.elements.filter(el => el.id !== id);
    handleUpdateCurrentSlide({ ...currentSlide, elements: newElements });
    setSelectedElementId(null);
  };

  const handleDuplicateElement = (element: DesignElement) => {
    if (!currentSlide) return;
    const newEl: DesignElement = {
      ...JSON.parse(JSON.stringify(element)),
      id: `el-${Date.now()}`,
    };
    handleUpdateCurrentSlide({ ...currentSlide, elements: [...currentSlide.elements, newEl] });
    setSelectedElementId(newEl.id);
  };

  const handleMoveElement = (id: string, direction: 'up' | 'down') => {
    if (!currentSlide) return;
    const idx = currentSlide.elements.findIndex(el => el.id === id);
    if (idx === -1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= currentSlide.elements.length) return;
    const newElements = [...currentSlide.elements];
    const [moved] = newElements.splice(idx, 1);
    newElements.splice(targetIdx, 0, moved);
    handleUpdateCurrentSlide({ ...currentSlide, elements: newElements });
  };

  // Keyboard navigation
  useEffect(() => {
    if (currentView !== 'editor') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        setActiveSlideIndex(prev => Math.min(prev + 1, currentDoc.slides.length - 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setActiveSlideIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'z' && (e.metaKey || e.ctrlKey)) {
        if (historyIndex > 0) {
          setHistoryIndex(prev => prev - 1);
          setCurrentDoc(history[historyIndex - 1]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView, currentDoc.slides.length, historyIndex, history]);

  const isBrochure = currentDoc.type === 'brochure';

  return (
    <>
      {currentView === 'home' ? (
        <HomePage
          documents={documents}
          onOpenDocument={handleOpenDocument}
          onCreateNewWithAi={() => setIsCreateAiOpen(true)}
          onCreateBlank={handleCreateBlank}
          onDuplicateDocument={handleDuplicateDocument}
          onDeleteDocument={handleDeleteDocument}
          onRenameDocument={handleRenameDocument}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      ) : (
        <div className="h-screen w-screen flex flex-col gamma-mesh-bg text-neutral-100 overflow-hidden font-sans">
          <Navbar
            document={currentDoc}
            onUpdateTitle={(newTitle) => pushDocState({ ...currentDoc, title: newTitle })}
            onSelectTheme={(themeId) => pushDocState({ ...currentDoc, themeId })}
            onSwitchDocumentType={(type) => {
              const updatedDoc = {
                ...currentDoc,
                type,
                aspectRatio: type === 'brochure' ? 'trifold' : type === 'pitch-deck' ? '16:9' : 'a4-portrait'
              };
              pushDocState(updatedDoc as any);
            }}
            onStartPresentation={() => setIsPresentationOpen(true)}
            onOpenExportModal={() => setIsExportOpen(true)}
            onOpenSettingsModal={() => setIsSettingsOpen(true)}
            onBackToHome={() => setCurrentView('home')}
          />

          <div className="flex-1 flex overflow-hidden relative">
            {!isBrochure && (
              <CardOutline
                slides={currentDoc.slides}
                activeSlideIndex={activeSlideIndex}
                onSelectSlide={setActiveSlideIndex}
                onAddSlide={handleAddSlide}
                onDuplicateSlide={handleDuplicateSlide}
                onDeleteSlide={handleDeleteSlide}
                onMoveSlide={handleMoveSlide}
                isOpen={isOutlineOpen}
                onToggle={() => setIsOutlineOpen(!isOutlineOpen)}
                theme={activeTheme}
              />
            )}

            {/* Main Center Viewport */}
            <div 
              className="flex-1 flex flex-col items-center justify-between overflow-y-auto px-4 sm:px-8 py-6 relative"
              onClick={() => setSelectedElementId(null)}
            >
              {!isBrochure && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full gamma-glass text-xs text-neutral-300 shadow-md mb-4 z-20">
                  <button
                    onClick={() => setActiveSlideIndex(prev => Math.max(prev - 1, 0))}
                    disabled={activeSlideIndex === 0}
                    className="p-1 rounded-full hover:bg-white/10 disabled:opacity-30 transition-colors"
                    title="Previous Card (Left Arrow)"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  <span className="font-mono text-neutral-200 px-2 font-semibold">
                    Card {activeSlideIndex + 1} of {currentDoc.slides.length}
                  </span>

                  <button
                    onClick={() => setActiveSlideIndex(prev => Math.min(prev + 1, currentDoc.slides.length - 1))}
                    disabled={activeSlideIndex === currentDoc.slides.length - 1}
                    className="p-1 rounded-full hover:bg-white/10 disabled:opacity-30 transition-colors"
                    title="Next Card (Right Arrow)"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* RENDER BROCHURE SPREAD OR PRESENTATION CARDS */}
              <div className="w-full flex items-center justify-center mb-24">
                {isBrochure ? (
                  <BrochureRenderer
                    slides={currentDoc.slides}
                    theme={activeTheme}
                    onUpdateSlide={(idx, updated) => {
                      const updatedSlides = [...currentDoc.slides];
                      updatedSlides[idx] = updated;
                      pushDocState({ ...currentDoc, slides: updatedSlides });
                    }}
                    selectedElementId={selectedElementId}
                    onSelectElement={setSelectedElementId}
                  />
                ) : (
                  <div className="w-full max-w-4xl">
                    <GammaCard
                      slide={currentSlide}
                      theme={activeTheme}
                      aspectRatio={currentDoc.aspectRatio}
                      onUpdateSlide={handleUpdateCurrentSlide}
                      selectedElementId={selectedElementId}
                      onSelectElement={setSelectedElementId}
                    />
                  </div>
                )}
              </div>
            </div>

            {selectedElement && (
              <SelectionBubble
                selectedElement={selectedElement}
                onUpdateElement={handleUpdateElement}
                onDeleteElement={handleDeleteElement}
                onDuplicateElement={handleDuplicateElement}
                onMoveElement={handleMoveElement}
                onClose={() => setSelectedElementId(null)}
              />
            )}

            <FloatingAiBar
              currentDocument={currentDoc}
              currentSlide={currentSlide}
              onReplaceDocument={(newDoc) => {
                pushDocState(newDoc);
                setActiveSlideIndex(0);
              }}
              onUpdateSlide={handleUpdateCurrentSlide}
              onAddGeneratedSlide={(newSlide) => {
                const newSlides = [...currentDoc.slides, newSlide];
                pushDocState({ ...currentDoc, slides: newSlides });
                setActiveSlideIndex(newSlides.length - 1);
              }}
              activeThemeId={currentDoc.themeId}
            />
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION CONTAINER */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      <CreateAiModal
        isOpen={isCreateAiOpen}
        onClose={() => setIsCreateAiOpen(false)}
        onCreated={handleAiDocumentCreated}
      />

      {isPresentationOpen && (
        <PresentationModal
          slides={currentDoc.slides}
          initialIndex={activeSlideIndex}
          theme={activeTheme}
          aspectRatio={currentDoc.aspectRatio}
          onClose={() => setIsPresentationOpen(false)}
        />
      )}

      {isExportOpen && (
        <ExportModal
          document={currentDoc}
          theme={activeTheme}
          activeSlideIndex={activeSlideIndex}
          onClose={() => setIsExportOpen(false)}
          onImportDocument={(doc) => {
            pushDocState(doc);
            setActiveSlideIndex(0);
          }}
        />
      )}

      {isSettingsOpen && (
        <SettingsModal onClose={() => setIsSettingsOpen(false)} />
      )}
    </>
  );
}

export default App;
