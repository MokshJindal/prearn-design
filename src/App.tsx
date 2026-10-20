import React, { useState, useEffect } from 'react';
import { 
  DesignDocument, 
  SlidePage, 
  DocumentType, 
  DesignElement,
  Collaborator,
  SlideComment,
  VersionHistoryItem,
  AspectRatio
} from './types/design';
import { storageService } from './services/storage';
import { STARTER_PITCH_DECK } from './services/templates';
import { getTheme } from './services/themes';
import { generateNextSlideInDeck } from './services/claude';
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
import { ShareModal } from './components/ShareModal';
import { CommentsDrawer } from './components/CommentsDrawer';
import { CanvaElementsDrawer } from './components/CanvaElementsDrawer';
import { CanvaFormattingBar } from './components/CanvaFormattingBar';
import { VersionHistoryModal } from './components/VersionHistoryModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function App() {
  const [currentView, setCurrentView] = useState<'home' | 'editor'>('home');

  // Load from robust storageService
  const [documents, setDocuments] = useState<DesignDocument[]>(() => {
    const all = storageService.loadAll();
    return all && all.length ? all : [STARTER_PITCH_DECK];
  });

  const [currentDoc, setCurrentDoc] = useState<DesignDocument>(() => {
    const all = storageService.loadAll();
    return (all && all[0]) || STARTER_PITCH_DECK;
  });

  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isOutlineOpen, setIsOutlineOpen] = useState<boolean>(true);

  // Modals & Drawers
  const [isCreateAiOpen, setIsCreateAiOpen] = useState(false);
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCommentsDrawerOpen, setIsCommentsDrawerOpen] = useState(false);
  const [isElementsDrawerOpen, setIsElementsDrawerOpen] = useState(false);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [isAiAddingNext, setIsAiAddingNext] = useState(false);

  // Collaboration State
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    {
      id: 'col-1',
      name: 'Moksh Jindal',
      email: 'jindalmoksh2008@gmail.com',
      avatar: 'M',
      role: 'owner',
      color: '#8B5CF6',
      status: 'active',
      lastSeen: 'Now',
    },
    {
      id: 'col-2',
      name: 'Elena Rostova',
      email: 'elena@deepmind.com',
      avatar: 'E',
      role: 'editor',
      color: '#06B6D4',
      status: 'active',
      lastSeen: 'Viewing Slide 2',
    },
    {
      id: 'col-3',
      name: 'Alex Rivera',
      email: 'alex@sequoia.com',
      avatar: 'A',
      role: 'commenter',
      color: '#10B981',
      status: 'idle',
      lastSeen: '8 mins ago',
    },
  ]);

  // Real-time Comments State
  const [comments, setComments] = useState<SlideComment[]>([
    {
      id: 'c-1',
      slideId: currentDoc?.slides?.[0]?.id || 's1',
      slideNumber: 1,
      authorName: 'Alex Rivera',
      authorAvatar: 'A',
      authorColor: '#10B981',
      content: 'The executive hook is magnetic! Can we make the TAM metric $85B instead of $75B?',
      timestamp: '10 mins ago',
      resolved: false,
      replies: [
        {
          id: 'r-1',
          authorName: 'Moksh Jindal',
          authorAvatar: 'M',
          content: 'Updated to $85B based on latest Tier-1 market report!',
          timestamp: '5 mins ago',
        }
      ]
    },
    {
      id: 'c-2',
      slideId: currentDoc?.slides?.[1]?.id || 's2',
      slideNumber: 2,
      authorName: 'Elena Rostova',
      authorAvatar: 'E',
      authorColor: '#06B6D4',
      content: 'Love the Bento grid on problem friction. Typography contrast is pristine.',
      timestamp: '25 mins ago',
      resolved: true,
    }
  ]);

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

  // Safe fallback document
  const safeDoc = currentDoc || STARTER_PITCH_DECK;

  // Undo history for active editor
  const [history, setHistory] = useState<DesignDocument[]>([safeDoc]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const activeTheme = getTheme(safeDoc.themeId || 'gamma-cosmic');
  const currentSlide = (safeDoc.slides && safeDoc.slides[activeSlideIndex]) || safeDoc.slides?.[0] || STARTER_PITCH_DECK.slides[0];
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
      addToast({ title: `Duplicated "${doc.title}"`, type: 'success' });
    }
  };

  const handleDeleteDocument = (id: string) => {
    const deleted = storageService.delete(id);
    if (deleted) {
      const remaining = storageService.loadAll();
      setDocuments(remaining);
      if (currentDoc.id === id) {
        setCurrentDoc(remaining[0] || STARTER_PITCH_DECK);
      }
      addToast({
        title: `Deleted "${deleted.title}"`,
        type: 'info',
        action: {
          label: 'Undo',
          onClick: () => {
            storageService.restore(deleted);
            setDocuments(storageService.loadAll());
            addToast({ title: 'Restored project', type: 'success' });
          }
        }
      });
    }
  };

  const handleRenameDocument = (id: string, newTitle: string) => {
    storageService.rename(id, newTitle);
    const updated = storageService.loadAll();
    setDocuments(updated);
    if (currentDoc.id === id) {
      setCurrentDoc({ ...currentDoc, title: newTitle });
    }
  };

  const handleAiDocumentCreated = (newDoc: DesignDocument) => {
    storageService.save(newDoc);
    setDocuments(storageService.loadAll());
    handleOpenDocument(newDoc);
    addToast({ title: `Generated "${newDoc.title}" with Claude!`, type: 'success' });
  };

  const handleUpdateCurrentSlide = (updatedSlide: SlidePage) => {
    const newSlides = [...currentDoc.slides];
    newSlides[activeSlideIndex] = updatedSlide;
    pushDocState({ ...currentDoc, slides: newSlides });
  };

  const handleAddSlide = (categoryOrIndex?: SlidePage['category'] | number) => {
    const isNum = typeof categoryOrIndex === 'number';
    const targetIdx = isNum ? categoryOrIndex : activeSlideIndex + 1;
    const cat = (!isNum && categoryOrIndex) || 'content';

    const newSlide: SlidePage = {
      id: `slide-${Date.now()}`,
      title: cat.toUpperCase(),
      category: cat,
      layout: 'hero',
      badge: cat.toUpperCase(),
      headline: 'New Topic Headline',
      subheadline: 'Click in-place to edit this subtitle or use the Canva Elements dock.',
      elements: [
        {
          id: `el-${Date.now()}-1`,
          type: 'feature-card',
          title: 'Key Point',
          content: 'Add high-impact descriptions or metrics here.',
          tag: 'HIGHLIGHT',
          gridSpan: 'col-span-12 md:col-span-6',
        },
        {
          id: `el-${Date.now()}-2`,
          type: 'stat-block',
          statValue: '$5.4M',
          statLabel: 'Growth Metric',
          statChange: '+45% YoY',
          gridSpan: 'col-span-12 md:col-span-6',
        }
      ]
    };

    const newSlides = [...currentDoc.slides];
    newSlides.splice(targetIdx, 0, newSlide);

    pushDocState({ ...currentDoc, slides: newSlides });
    setActiveSlideIndex(targetIdx);
    addToast({ title: 'Added new card to deck', type: 'success' });
  };

  const handleAiAddNextSlide = async () => {
    try {
      setIsAiAddingNext(true);
      addToast({ title: 'Claude is designing next sequential card...', type: 'info' });
      const nextSlide = await generateNextSlideInDeck(currentDoc);
      const targetIdx = activeSlideIndex + 1;
      const newSlides = [...currentDoc.slides];
      newSlides.splice(targetIdx, 0, nextSlide);
      pushDocState({ ...currentDoc, slides: newSlides });
      setActiveSlideIndex(targetIdx);
      addToast({ title: `Added "${nextSlide.title}" with Claude!`, type: 'success' });
    } catch (err: any) {
      console.error('Failed to generate next card:', err);
      addToast({ title: `AI error: ${err.message}`, type: 'error' });
    } finally {
      setIsAiAddingNext(false);
    }
  };

  const handleDuplicateSlide = (index: number) => {
    const target = currentDoc.slides[index];
    if (!target) return;

    const clonedSlide: SlidePage = {
      ...JSON.parse(JSON.stringify(target)),
      id: `slide-${Date.now()}`,
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
      addToast({ title: 'A presentation must have at least 1 card.', type: 'info' });
      return;
    }

    const newSlides = currentDoc.slides.filter((_, i) => i !== index);
    pushDocState({ ...currentDoc, slides: newSlides });
    setActiveSlideIndex(Math.max(0, index - 1));
    addToast({ title: 'Card removed', type: 'info' });
  };

  const handleMoveSlide = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
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

  // Canva Insert Element handler
  const handleAddElement = (newEl: DesignElement) => {
    if (!currentSlide) return;
    const updatedElements = [...(currentSlide.elements || []), newEl];
    handleUpdateCurrentSlide({ ...currentSlide, elements: updatedElements });
    addToast({ title: `Added ${newEl.type} to current slide`, type: 'success' });
  };

  // Canva Insert Slide Template handler
  const handleAddSlideLayout = (layoutType: string) => {
    const archetypeMap: Record<string, { badge: string; headline: string; elements: DesignElement[] }> = {
      problem: {
        badge: 'PROBLEM & FRICTION',
        headline: '$42B Burned by Legacy Infrastructure Each Year',
        elements: [
          {
            id: `el-${Date.now()}-1`,
            type: 'stat-block',
            statValue: '$42B',
            statLabel: 'Annual Friction Loss',
            statChange: 'Critical bottleneck',
            gridSpan: 'col-span-12 md:col-span-4',
          },
          {
            id: `el-${Date.now()}-2`,
            type: 'feature-card',
            title: 'Siloed Systems',
            content: 'Legacy enterprise databases fail to coordinate across high-frequency operations.',
            tag: 'BOTTLENECK',
            gridSpan: 'col-span-12 md:col-span-8',
          }
        ]
      },
      solution: {
        badge: 'AUTONOMOUS SOLUTION',
        headline: 'Agentic Intelligence That Self-Heals in Real Time',
        elements: [
          {
            id: `el-${Date.now()}-1`,
            type: 'feature-card',
            title: '01 // Autonomous Routing',
            content: 'Multi-agent orchestration executing in <80ms with cryptographic proof of correctness.',
            tag: 'CORE ENGINE',
            gridSpan: 'col-span-12 md:col-span-6',
          },
          {
            id: `el-${Date.now()}-2`,
            type: 'feature-card',
            title: '02 // SOC-2 Type II',
            content: 'Enterprise auditability with end-to-end telemetry and zero data leakage.',
            tag: 'SECURITY',
            gridSpan: 'col-span-12 md:col-span-6',
          }
        ]
      },
      traction: {
        badge: 'TRACTION & METRICS',
        headline: 'Compounding Revenue With 154% Net Dollar Retention',
        elements: [
          {
            id: `el-${Date.now()}-1`,
            type: 'stat-block',
            statValue: '$1.8M',
            statLabel: 'Current ARR',
            statChange: '+280% YoY',
            gridSpan: 'col-span-12 md:col-span-4',
          },
          {
            id: `el-${Date.now()}-2`,
            type: 'stat-block',
            statValue: '154%',
            statLabel: 'Net Dollar Retention',
            statChange: 'Expansion-led',
            gridSpan: 'col-span-12 md:col-span-4',
          },
          {
            id: `el-${Date.now()}-3`,
            type: 'stat-block',
            statValue: '42',
            statLabel: 'Tier-1 Enterprise Pilots',
            statChange: 'Fortune 500 roster',
            gridSpan: 'col-span-12 md:col-span-4',
          }
        ]
      },
      team: {
        badge: 'FOUNDING LEADERSHIP',
        headline: 'Frontier AI Researchers & Operators From DeepMind and Flexport',
        elements: [
          {
            id: `el-${Date.now()}-1`,
            type: 'team-card',
            title: 'Alex Mercer',
            subtitle: 'CEO & Co-Founder',
            content: 'Ex-DeepMind Research Lead. PhD in Reinforcement Learning from Stanford.',
            tag: 'FOUNDER',
            gridSpan: 'col-span-12 md:col-span-6',
          },
          {
            id: `el-${Date.now()}-2`,
            type: 'team-card',
            title: 'Elena Rostova',
            subtitle: 'CTO & Co-Founder',
            content: 'Former VP Engineering at Flexport. Architected real-time routing handling $6B freight.',
            tag: 'FOUNDER',
            gridSpan: 'col-span-12 md:col-span-6',
          }
        ]
      },
      closing: {
        badge: 'SEED ROUND // 2026',
        headline: 'Raising $4.0M Seed to Accelerate Autonomous Global Deployment',
        elements: [
          {
            id: `el-${Date.now()}-1`,
            type: 'stat-block',
            statValue: '$4.0M',
            statLabel: 'Target Seed Round',
            statChange: '$2.5M committed',
            gridSpan: 'col-span-12 md:col-span-6',
          },
          {
            id: `el-${Date.now()}-2`,
            type: 'bullet-list',
            title: 'Primary Capital Allocation',
            items: [
              'Scale multi-agent inference cluster to 10M events/day',
              'Expand Tier-1 enterprise sales across North America & Europe',
              'Maintain 18-month runway to reach $5M ARR Series A milestone'
            ],
            gridSpan: 'col-span-12 md:col-span-6',
          }
        ]
      }
    };

    const arch = archetypeMap[layoutType] || archetypeMap.problem;
    const newSlide: SlidePage = {
      id: `slide-${Date.now()}`,
      title: layoutType.toUpperCase(),
      category: layoutType as any,
      layout: 'hero',
      badge: arch.badge,
      headline: arch.headline,
      subheadline: 'High-contrast executive layout with verified benchmark typography.',
      elements: arch.elements,
    };

    const targetIdx = activeSlideIndex + 1;
    const newSlides = [...currentDoc.slides];
    newSlides.splice(targetIdx, 0, newSlide);

    pushDocState({ ...currentDoc, slides: newSlides });
    setActiveSlideIndex(targetIdx);
    setIsElementsDrawerOpen(false);
    addToast({ title: `Added "${layoutType}" slide template!`, type: 'success' });
  };

  // Device Toggle
  const handleToggleDeviceView = () => {
    const nextRatio: AspectRatio = currentDoc.aspectRatio === '9:16' ? '16:9' : '9:16';
    pushDocState({ ...currentDoc, aspectRatio: nextRatio });
    addToast({ title: `Switched to ${nextRatio === '9:16' ? 'Mobile View (9:16)' : 'Desktop (16:9)'}`, type: 'info' });
  };

  // Collaborator Handlers
  const handleAddCollaborator = (col: Omit<Collaborator, 'id'>) => {
    const newCol: Collaborator = { ...col, id: `col-${Date.now()}` };
    setCollaborators([...collaborators, newCol]);
  };

  const handleRemoveCollaborator = (id: string) => {
    setCollaborators(collaborators.filter(c => c.id !== id));
    addToast({ title: 'Collaborator access revoked', type: 'info' });
  };

  // Comment Handlers
  const handleAddComment = (content: string, slideId: string, slideNumber: number) => {
    const newComment: SlideComment = {
      id: `comm-${Date.now()}`,
      slideId,
      slideNumber,
      authorName: 'Moksh Jindal',
      authorAvatar: 'M',
      authorColor: '#8B5CF6',
      content,
      timestamp: 'Just now',
      resolved: false,
    };
    setComments([newComment, ...comments]);
    addToast({ title: `Comment posted on Slide ${slideNumber}`, type: 'success' });
  };

  const handleAddReply = (commentId: string, replyContent: string) => {
    const updated = comments.map(c => {
      if (c.id === commentId) {
        const replies = c.replies || [];
        return {
          ...c,
          replies: [
            ...replies,
            {
              id: `rep-${Date.now()}`,
              authorName: 'Moksh Jindal',
              authorAvatar: 'M',
              content: replyContent,
              timestamp: 'Just now',
            }
          ]
        };
      }
      return c;
    });
    setComments(updated);
    addToast({ title: 'Reply sent', type: 'success' });
  };

  const handleToggleResolveComment = (commentId: string) => {
    setComments(comments.map(c => c.id === commentId ? { ...c, resolved: !c.resolved } : c));
  };

  const handleDeleteComment = (commentId: string) => {
    setComments(comments.filter(c => c.id !== commentId));
    addToast({ title: 'Comment deleted', type: 'info' });
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
            onOpenShareModal={() => setIsShareModalOpen(true)}
            onBackToHome={() => setCurrentView('home')}
            collaborators={collaborators}
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
                onAiAddNextSlide={handleAiAddNextSlide}
                isAiAddingNext={isAiAddingNext}
              />
            )}

            {/* Main Center Viewport */}
            <div 
              className="flex-1 flex flex-col items-center justify-between overflow-y-auto px-4 sm:px-8 py-4 relative"
              onClick={() => setSelectedElementId(null)}
            >
              {/* Canva Top Formatting Bar */}
              {!isBrochure && (
                <CanvaFormattingBar
                  onOpenElementsDrawer={() => setIsElementsDrawerOpen(true)}
                  onOpenCommentsDrawer={() => setIsCommentsDrawerOpen(true)}
                  onOpenVersionHistory={() => setIsVersionHistoryOpen(true)}
                  aspectRatio={currentDoc.aspectRatio}
                  onToggleDeviceView={handleToggleDeviceView}
                  fontFamily={currentDoc.fontFamily || 'display'}
                  onChangeFontFamily={(font) => pushDocState({ ...currentDoc, fontFamily: font })}
                  onQuickAddStat={() => handleAddElement({
                    id: `el-stat-${Date.now()}`,
                    type: 'stat-block',
                    statValue: '$18.4M',
                    statLabel: 'Total Addressable Market',
                    statChange: '+34% CAGR',
                    gridSpan: 'col-span-12 md:col-span-4',
                  })}
                  onQuickAddFeature={() => handleAddElement({
                    id: `el-feat-${Date.now()}`,
                    type: 'feature-card',
                    title: 'New Strategic Differentiator',
                    subtitle: 'Architecture Foundation',
                    content: 'Click here to describe the technology moat or core customer benefit.',
                    tag: 'CAPABILITY',
                    gridSpan: 'col-span-12 md:col-span-6',
                  })}
                  onQuickAddQuote={() => handleAddElement({
                    id: `el-quote-${Date.now()}`,
                    type: 'quote',
                    content: 'Prearn standardizes execution with unprecedented precision.',
                    author: 'Elena Rostova',
                    role: 'Managing Director, Apex Capital',
                    gridSpan: 'col-span-12 md:col-span-6',
                  })}
                  onAiAddNextSlide={handleAiAddNextSlide}
                  isAiAddingNext={isAiAddingNext}
                  commentsCount={comments.filter(c => !c.resolved).length}
                  collaborators={collaborators}
                />
              )}

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
                  <div className={`w-full transition-all duration-300 ${currentDoc.aspectRatio === '9:16' ? 'max-w-sm' : 'max-w-4xl'}`}>
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

            {/* Canva Elements Left Drawer */}
            <CanvaElementsDrawer
              isOpen={isElementsDrawerOpen}
              onClose={() => setIsElementsDrawerOpen(false)}
              onAddElement={handleAddElement}
              onAddSlideLayout={handleAddSlideLayout}
            />

            {/* Slide Comments Right Drawer */}
            <CommentsDrawer
              isOpen={isCommentsDrawerOpen}
              onClose={() => setIsCommentsDrawerOpen(false)}
              comments={comments}
              currentSlideIndex={activeSlideIndex}
              currentSlideId={currentSlide?.id || 's1'}
              onAddComment={handleAddComment}
              onAddReply={handleAddReply}
              onToggleResolve={handleToggleResolveComment}
              onDeleteComment={handleDeleteComment}
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

      {/* Share & Collaboration Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        documentTitle={currentDoc.title}
        documentId={currentDoc.id}
        collaborators={collaborators}
        onAddCollaborator={handleAddCollaborator}
        onRemoveCollaborator={handleRemoveCollaborator}
        onShowToast={(msg) => addToast({ title: msg, type: 'success' })}
      />

      {/* Version History Modal */}
      <VersionHistoryModal
        isOpen={isVersionHistoryOpen}
        onClose={() => setIsVersionHistoryOpen(false)}
        versions={currentDoc.versions || []}
        currentDoc={currentDoc}
        onRestoreVersion={(doc) => {
          pushDocState(doc);
          setActiveSlideIndex(0);
          addToast({ title: 'Restored previous version', type: 'success' });
        }}
      />
    </>
  );
}

export default App;
