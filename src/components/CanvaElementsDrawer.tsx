import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  TrendingUp, 
  Quote, 
  CheckSquare, 
  Image as ImageIcon, 
  Type, 
  Layers, 
  Layout, 
  User, 
  Table, 
  Plus, 
  Search,
  Bot,
  Shield,
  Rocket,
  Globe,
  Database,
  Target,
  BarChart3,
  Cpu,
  Lock,
  Zap
} from 'lucide-react';
import { DesignElement, SlidePage } from '../types/design';

interface CanvaElementsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAddElement: (element: DesignElement) => void;
  onAddSlideLayout: (layoutType: string) => void;
}

export const CanvaElementsDrawer: React.FC<CanvaElementsDrawerProps> = ({
  isOpen,
  onClose,
  onAddElement,
  onAddSlideLayout,
}) => {
  const [activeTab, setActiveTab] = useState<'elements' | 'photos' | 'icons' | 'text' | 'templates'>('elements');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  // Curated Unsplash royalty-free images for executive presentations
  const stockPhotos = [
    {
      id: 'photo-1',
      title: 'Neural AI Architecture',
      category: 'AI',
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'photo-2',
      title: 'Modern Minimalist Architecture',
      category: 'Design',
      url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'photo-3',
      title: 'Abstract Holographic Gradient',
      category: 'Abstract',
      url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'photo-4',
      title: 'Frontier Tech Data Center',
      category: 'Cloud',
      url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'photo-5',
      title: 'Executive Boardroom Strategy',
      category: 'Venture',
      url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'photo-6',
      title: 'Cyberpunk Neon Matrix',
      category: 'Cyber',
      url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    },
  ];

  const visualIcons = [
    { name: 'AI Brain', icon: Bot, tag: 'AGENTIC AI' },
    { name: 'Growth Metric', icon: TrendingUp, tag: 'TRACTION' },
    { name: 'Security Lock', icon: Lock, tag: 'SOC-2' },
    { name: 'Global Network', icon: Globe, tag: 'EXPANSION' },
    { name: 'Rocket Launch', icon: Rocket, tag: 'VELOCITY' },
    { name: 'Cloud Infrastructure', icon: Database, tag: 'ARCHITECTURE' },
    { name: 'TAM Target', icon: Target, tag: 'MARKET OPPORTUNITY' },
    { name: 'Performance Analytics', icon: BarChart3, tag: 'ANALYTICS' },
    { name: 'High Throughput', icon: Zap, tag: 'LATENCY' },
    { name: 'Silicon Core', icon: Cpu, tag: 'HARDWARE' },
  ];

  const handleInsertStat = () => {
    onAddElement({
      id: `el-stat-${Date.now()}`,
      type: 'stat-block',
      statValue: '$12.4M',
      statLabel: 'Annual Recurring Revenue',
      statChange: '+184% YoY Expansion',
      gridSpan: 'col-span-12 md:col-span-4',
    });
  };

  const handleInsertFeature = () => {
    onAddElement({
      id: `el-feat-${Date.now()}`,
      type: 'feature-card',
      title: 'Autonomous Execution Pipeline',
      subtitle: 'Zero Manual Latency',
      content: 'High-frequency decision engine self-heals bottlenecks in under 80 milliseconds.',
      tag: 'CORE ENGINE',
      gridSpan: 'col-span-12 md:col-span-6',
    });
  };

  const handleInsertQuote = () => {
    onAddElement({
      id: `el-quote-${Date.now()}`,
      type: 'quote',
      content: 'This platform fundamentally redefined how our executive committee scales decision-making.',
      author: 'Sarah Chen',
      role: 'General Partner, Horizon Ventures',
      gridSpan: 'col-span-12 md:col-span-6',
    });
  };

  const handleInsertChecklist = () => {
    onAddElement({
      id: `el-check-${Date.now()}`,
      type: 'bullet-list',
      title: 'Institutional Deliverables',
      items: [
        'SOC-2 Type II Certified Data Pipeline',
        'Multi-Region 99.99% Availability SLA',
        'Dedicated Principal Engineering Lead',
      ],
      gridSpan: 'col-span-12 md:col-span-6',
    });
  };

  const handleInsertPhoto = (photo: typeof stockPhotos[0]) => {
    onAddElement({
      id: `el-img-${Date.now()}`,
      type: 'image-card',
      title: photo.title,
      imageUrl: photo.url,
      imageAlt: photo.title,
      tag: photo.category.toUpperCase(),
      content: 'High-resolution editorial media asset.',
      gridSpan: 'col-span-12 md:col-span-6',
    });
  };

  const handleInsertIconCard = (item: typeof visualIcons[0]) => {
    onAddElement({
      id: `el-icon-${Date.now()}`,
      type: 'feature-card',
      title: item.name,
      subtitle: 'Key Strategic Pillar',
      content: 'Engineered for exponential reliability and enterprise compliance.',
      tag: item.tag,
      gridSpan: 'col-span-12 md:col-span-4',
    });
  };

  return (
    <div className="fixed top-14 left-0 bottom-0 w-80 sm:w-88 bg-[#12131D] border-r border-white/10 shadow-2xl z-40 flex flex-col justify-between text-neutral-200 animate-slideRight font-sans">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#151724]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Layout className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Canva Elements Studio</h3>
            <p className="text-[11px] text-neutral-400">Click to insert into active slide</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Canva Left Tab Bar */}
      <div className="flex items-center border-b border-white/10 bg-[#0E0F17] overflow-x-auto text-[11px] font-mono">
        {[
          { id: 'elements', label: '✦ Elements' },
          { id: 'photos', label: '🖼️ Photos' },
          { id: 'icons', label: '✨ Icons' },
          { id: 'templates', label: '📄 Slides' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-2.5 px-3 text-center whitespace-nowrap border-b-2 transition-all font-semibold ${
              activeTab === tab.id
                ? 'border-purple-500 text-white bg-purple-500/10'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* TAB 1: ELEMENTS */}
        {activeTab === 'elements' && (
          <div className="space-y-3">
            <div className="text-[10px] font-mono uppercase text-neutral-400 font-bold">
              Core Presentation Components
            </div>

            {/* Stat Block */}
            <div
              onClick={handleInsertStat}
              className="p-3.5 rounded-2xl bg-[#161726] border border-white/10 hover:border-purple-500/50 hover:bg-white/[0.03] transition-all cursor-pointer group shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold text-base">
                  $
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                    Metric Stat Block
                  </div>
                  <div className="text-[11px] text-neutral-400">Large quantitative stat + growth badge</div>
                </div>
              </div>
              <Plus className="w-4 h-4 text-neutral-500 group-hover:text-white" />
            </div>

            {/* Bento Feature Card */}
            <div
              onClick={handleInsertFeature}
              className="p-3.5 rounded-2xl bg-[#161726] border border-white/10 hover:border-purple-500/50 hover:bg-white/[0.03] transition-all cursor-pointer group shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center font-bold text-base">
                  ✦
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                    Bento Feature Card
                  </div>
                  <div className="text-[11px] text-neutral-400">Pillar with badge, title & description</div>
                </div>
              </div>
              <Plus className="w-4 h-4 text-neutral-500 group-hover:text-white" />
            </div>

            {/* Testimonial Quote */}
            <div
              onClick={handleInsertQuote}
              className="p-3.5 rounded-2xl bg-[#161726] border border-white/10 hover:border-purple-500/50 hover:bg-white/[0.03] transition-all cursor-pointer group shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center">
                  <Quote className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                    Investor / Client Quote
                  </div>
                  <div className="text-[11px] text-neutral-400">Serif italic quote with author & role</div>
                </div>
              </div>
              <Plus className="w-4 h-4 text-neutral-500 group-hover:text-white" />
            </div>

            {/* Checklist */}
            <div
              onClick={handleInsertChecklist}
              className="p-3.5 rounded-2xl bg-[#161726] border border-white/10 hover:border-purple-500/50 hover:bg-white/[0.03] transition-all cursor-pointer group shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                    Checklist & Deliverables
                  </div>
                  <div className="text-[11px] text-neutral-400">Multi-point bulleted breakdown</div>
                </div>
              </div>
              <Plus className="w-4 h-4 text-neutral-500 group-hover:text-white" />
            </div>
          </div>
        )}

        {/* TAB 2: PHOTOS */}
        {activeTab === 'photos' && (
          <div className="space-y-3">
            <div className="text-[10px] font-mono uppercase text-neutral-400 font-bold">
              Unsplash Curated Stock Photography
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {stockPhotos.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => handleInsertPhoto(photo)}
                  className="group relative rounded-2xl overflow-hidden border border-white/10 hover:border-purple-500/50 cursor-pointer transition-all aspect-[4/3] bg-neutral-900"
                >
                  <img
                    src={photo.url}
                    alt={photo.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2">
                    <span className="text-[10px] font-bold text-white leading-tight line-clamp-1">
                      {photo.title}
                    </span>
                    <span className="text-[9px] font-mono text-purple-300 uppercase">
                      {photo.category}
                    </span>
                  </div>
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                    <Plus className="w-3 h-3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: ICONS */}
        {activeTab === 'icons' && (
          <div className="space-y-3">
            <div className="text-[10px] font-mono uppercase text-neutral-400 font-bold">
              Visual Concept Badges
            </div>

            <div className="grid grid-cols-2 gap-2">
              {visualIcons.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={idx}
                    onClick={() => handleInsertIconCard(item)}
                    className="p-3 rounded-2xl bg-[#161726] border border-white/10 hover:border-purple-500/50 hover:bg-white/[0.03] transition-all cursor-pointer group text-left flex flex-col justify-between"
                  >
                    <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center mb-2">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-purple-300 truncate">
                        {item.name}
                      </div>
                      <div className="text-[9px] font-mono text-neutral-500 uppercase mt-0.5">
                        {item.tag}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: TEMPLATES */}
        {activeTab === 'templates' && (
          <div className="space-y-2.5">
            <div className="text-[10px] font-mono uppercase text-neutral-400 font-bold">
              Insert Ready-Made Slide Archetypes
            </div>

            {[
              { type: 'problem', label: 'Problem & Market Pain', desc: 'Friction point breakdown with 3 metrics' },
              { type: 'solution', label: 'Solution Architecture', desc: 'Core 3-pillar product workflow' },
              { type: 'traction', label: 'Traction & Market Opportunity', desc: 'ARR, TAM, and growth velocity' },
              { type: 'team', label: 'Founding Team', desc: 'Leadership bios and executive credentials' },
              { type: 'closing', label: 'The Ask & Round Details', desc: 'Investment terms and milestone roadmaps' },
            ].map((slide) => (
              <div
                key={slide.type}
                onClick={() => onAddSlideLayout(slide.type)}
                className="p-3.5 rounded-2xl bg-[#161726] border border-white/10 hover:border-purple-500/50 hover:bg-white/[0.03] transition-all cursor-pointer group shadow-sm flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                    {slide.label}
                  </div>
                  <div className="text-[11px] text-neutral-400">{slide.desc}</div>
                </div>
                <Plus className="w-4 h-4 text-neutral-500 group-hover:text-white" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
