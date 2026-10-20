import { DesignDocument } from '../types/design';

export const STARTER_PITCH_DECK: DesignDocument = {
  id: 'deck-aura-seed-2026',
  title: 'Aura AI — Seed Investment Deck',
  subtitle: 'Autonomous Cognitive Workflows for Modern Enterprise Teams',
  type: 'pitch-deck',
  aspectRatio: '16:9',
  themeId: 'silicon-valley',
  fontFamily: 'display',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  slides: [
    {
      id: 'slide-1',
      title: 'Title Slide',
      category: 'title',
      layout: 'hero',
      badge: 'CONFIDENTIAL // SEED FINANCING 2026',
      headline: 'Aura AI',
      subheadline: 'The Autonomous Intelligence Layer for Complex Enterprise Operations',
      description: 'Transforming multi-step workflows into self-executing AI agents with verifiable deterministic guarantees.',
      html: `<div class="relative w-full h-full overflow-hidden bg-[#090A10] text-white p-8 sm:p-12 flex flex-col justify-between rounded-3xl border border-white/10 select-text font-sans" style="font-family:'Plus Jakarta Sans',sans-serif">
  <!-- Ambient Atmospheric Mesh Glow -->
  <div class="absolute -top-32 -left-24 w-96 h-96 rounded-full bg-purple-600/25 blur-[120px] pointer-events-none"></div>
  <div class="absolute -bottom-32 -right-24 w-96 h-96 rounded-full bg-cyan-500/20 blur-[130px] pointer-events-none"></div>

  <!-- Header -->
  <div class="relative z-10">
    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 font-mono text-[10px] font-bold tracking-widest uppercase mb-4 shadow-sm">
      <span class="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
      <span>CONFIDENTIAL // SEED FINANCING 2026</span>
    </div>

    <h1 class="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none mb-3 font-display">
      Aura <span class="bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">Intelligence</span>
    </h1>

    <p class="text-base sm:text-xl text-neutral-300 max-w-3xl leading-relaxed font-normal">
      The Autonomous Multi-Agent Intelligence Layer for Complex Enterprise Operations.
    </p>
  </div>

  <!-- 3 High-Impact Bento Metric Cards -->
  <div class="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 my-auto">
    <div class="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:border-purple-500/40 transition-all shadow-lg">
      <div class="text-3xl sm:text-4xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300 mb-1">
        $3.5M
      </div>
      <div class="text-xs font-bold text-white uppercase tracking-wider mb-1">
        Seed Target
      </div>
      <div class="text-[11px] text-neutral-400">
        Led by Tier-1 Silicon Valley VCs
      </div>
    </div>

    <div class="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:border-cyan-500/40 transition-all shadow-lg">
      <div class="text-3xl sm:text-4xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-1">
        10x
      </div>
      <div class="text-xs font-bold text-white uppercase tracking-wider mb-1">
        Execution Velocity
      </div>
      <div class="text-[11px] text-neutral-400">
        Over traditional robotic process automation
      </div>
    </div>

    <div class="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:border-emerald-500/40 transition-all shadow-lg">
      <div class="text-3xl sm:text-4xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 mb-1">
        99.94%
      </div>
      <div class="text-xs font-bold text-white uppercase tracking-wider mb-1">
        Task Determinism
      </div>
      <div class="text-[11px] text-neutral-400">
        Zero-hallucination cryptographic guardrails
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="relative z-10 flex items-center justify-between pt-4 border-t border-white/10 text-[10px] font-mono text-neutral-500">
    <span>AURA COGNITIVE LABS • SERIES SEED</span>
    <span>PROPRIETARY & CONFIDENTIAL</span>
  </div>
</div>`,
      elements: [
        {
          id: 'el-1-1',
          type: 'stat-block',
          statValue: '$3.5M',
          statLabel: 'Seed Round Target',
          statChange: 'Led by Tier-1 Silicon Valley VCs',
          gridSpan: 'col-span-12 md:col-span-4'
        },
        {
          id: 'el-1-2',
          type: 'stat-block',
          statValue: '10x',
          statLabel: 'Execution Velocity',
          statChange: 'Over traditional robotic process automation',
          gridSpan: 'col-span-12 md:col-span-4'
        },
        {
          id: 'el-1-3',
          type: 'stat-block',
          statValue: '99.94%',
          statLabel: 'Task Accuracy',
          statChange: 'Zero-hallucination guardrail validation',
          gridSpan: 'col-span-12 md:col-span-4'
        }
      ],
      notes: 'Introduce the founders and the high-level hook: enterprise operations are still bound by manual swivel-chair processes.'
    },
    {
      id: 'slide-2',
      title: 'The Problem',
      category: 'problem',
      layout: 'three-column',
      badge: 'MARKET FRICTION',
      headline: 'Enterprise Knowledge Workers Spend 68% of Time on Glue Work',
      subheadline: 'Legacy software systems are disconnected silos requiring high human coordination overhead.',
      html: `<div class="relative w-full h-full overflow-hidden bg-[#0A070B] text-white p-8 sm:p-12 flex flex-col justify-between rounded-3xl border border-red-500/20 select-text font-sans" style="font-family:'Plus Jakarta Sans',sans-serif">
  <!-- Subtle Crimson/Coral Ambient Aura -->
  <div class="absolute -top-32 -left-24 w-96 h-96 rounded-full bg-rose-600/20 blur-[130px] pointer-events-none"></div>
  <div class="absolute -bottom-32 -right-24 w-96 h-96 rounded-full bg-orange-600/15 blur-[140px] pointer-events-none"></div>

  <!-- Header -->
  <div class="relative z-10">
    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 font-mono text-[10px] font-bold tracking-widest uppercase mb-4 shadow-sm">
      <span class="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
      <span>MARKET FRICTION</span>
    </div>

    <h2 class="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight mb-2 font-display">
      Knowledge Workers Spend <span class="bg-gradient-to-r from-rose-400 to-amber-300 bg-clip-text text-transparent">68% of Time</span> on Glue Work
    </h2>

    <p class="text-sm sm:text-base text-neutral-300 max-w-3xl leading-relaxed">
      Legacy software systems are disconnected silos requiring high human coordination overhead.
    </p>
  </div>

  <!-- 3 High-Contrast Friction Bento Cards -->
  <div class="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 my-auto">
    <div class="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:border-rose-500/40 transition-all shadow-lg flex flex-col justify-between">
      <div>
        <div class="inline-block px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold tracking-wider uppercase mb-3">
          FRICTION 01
        </div>
        <h3 class="text-base font-bold text-white mb-1.5">Fragmented SaaS Stacks</h3>
        <p class="text-xs text-neutral-400 leading-relaxed">
          Critical context is locked inside 40+ disparate tools (Slack, Jira, Salesforce, SAP) with zero unified memory.
        </p>
      </div>
      <div class="mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-rose-400 font-semibold">
        40+ Disconnected Apps
      </div>
    </div>

    <div class="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:border-amber-500/40 transition-all shadow-lg flex flex-col justify-between">
      <div>
        <div class="inline-block px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold tracking-wider uppercase mb-3">
          FRICTION 02
        </div>
        <h3 class="text-base font-bold text-white mb-1.5">Hallucination & Risk</h3>
        <p class="text-xs text-neutral-400 leading-relaxed">
          Raw LLMs cannot be trusted with regulatory compliance, financial ledgers, or customer data without continuous human babysitting.
        </p>
      </div>
      <div class="mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-amber-400 font-semibold">
        Zero Deterministic Guarantees
      </div>
    </div>

    <div class="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:border-red-500/40 transition-all shadow-lg flex flex-col justify-between">
      <div>
        <div class="inline-block px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 font-mono text-[10px] font-bold tracking-wider uppercase mb-3">
          FRICTION 03
        </div>
        <h3 class="text-base font-bold text-white mb-1.5">$480B Wasted Payroll</h3>
        <p class="text-xs text-neutral-400 leading-relaxed">
          Fortune 500 enterprises burn hundreds of billions annually on mechanical coordination rather than strategic decision-making.
        </p>
      </div>
      <div class="mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-red-400 font-semibold">
        $480B Annual Operational Loss
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="relative z-10 flex items-center justify-between pt-4 border-t border-white/10 text-[10px] font-mono text-neutral-500">
    <span>THE ENTERPRISE PROBLEM</span>
    <span>AURA COGNITIVE LABS</span>
  </div>
</div>`,
      elements: [
        {
          id: 'el-2-1',
          type: 'feature-card',
          title: 'Fragmented SaaS Stacks',
          subtitle: 'Context Fragmented Across 40+ Tools',
          content: 'Critical institutional memory is locked inside disparate Slack threads, Jira tickets, Salesforce notes, and ERPs with zero unified context.',
          tag: 'FRICTION #1',
          gridSpan: 'col-span-12 md:col-span-4'
        },
        {
          id: 'el-2-2',
          type: 'feature-card',
          title: 'Hallucination & Risk',
          subtitle: 'Raw LLMs Lack Determinism',
          content: 'Standard LLMs cannot be trusted with regulatory compliance, financial ledgers, or customer data without continuous human babysitting.',
          tag: 'FRICTION #2',
          gridSpan: 'col-span-12 md:col-span-4'
        },
        {
          id: 'el-2-3',
          type: 'feature-card',
          title: '$480B Wasted Payroll',
          subtitle: 'Massive Repetitive Operational Overhead',
          content: 'Fortune 500 companies burn billions annually on mechanical coordination rather than high-leverage strategic reasoning.',
          tag: 'FRICTION #3',
          gridSpan: 'col-span-12 md:col-span-4'
        }
      ],
      notes: 'Make investors feel the pain. Every VC has heard their portfolio companies complain about operational bloat.'
    },
    {
      id: 'slide-3',
      title: 'The Solution',
      category: 'solution',
      layout: 'bento-grid',
      badge: 'THE BREAKTHROUGH',
      headline: 'Aura: Multi-Agent Neural Swarms With Cryptographic Proofs',
      subheadline: 'Deploy autonomous agent swarms that observe, plan, execute, and verify complex end-to-end tasks.',
      elements: [
        {
          id: 'el-3-1',
          type: 'feature-card',
          title: 'Universal Connector Hub',
          subtitle: 'Instant bi-directional sync across 200+ enterprise apps with zero custom code.',
          content: 'Native real-time bridges to SAP, Workday, Salesforce, Snowflake, and internal REST/GraphQL APIs.',
          tag: 'ZERO-SETUP',
          gridSpan: 'col-span-12 md:col-span-8'
        },
        {
          id: 'el-3-2',
          type: 'stat-block',
          statValue: '< 150ms',
          statLabel: 'Sub-second Decision Latency',
          statChange: 'Powered by edge-optimized routing',
          gridSpan: 'col-span-12 md:col-span-4'
        },
        {
          id: 'el-3-3',
          type: 'feature-card',
          title: 'Verification Engine',
          subtitle: 'Deterministic AST verification prevents hallucinations before any DB commit.',
          content: 'Every action is previewed in a sandboxed synthetic transaction before live ledger updates.',
          tag: 'SOC-2 & HIPAA',
          gridSpan: 'col-span-12 md:col-span-6'
        },
        {
          id: 'el-3-4',
          type: 'feature-card',
          title: 'Human-in-the-Loop Override',
          subtitle: 'Real-time interactive checkpoints for high-stakes decisions.',
          content: 'Slack and mobile approvals with complete provenance trails and single-click rollbacks.',
          tag: 'CONTROL',
          gridSpan: 'col-span-12 md:col-span-6'
        }
      ],
      notes: 'Highlight why our technical architecture is radically different from naive wrapper apps.'
    },
    {
      id: 'slide-4',
      title: 'Market Opportunity',
      category: 'market',
      layout: 'three-column',
      badge: 'MARKET SIZE',
      headline: 'A $120B Addressable Market Expanding Rapidly',
      subheadline: 'The convergence of Enterprise Automation ($38B) and AI Agent Infrastructure ($82B).',
      elements: [
        {
          id: 'el-4-1',
          type: 'stat-block',
          statValue: '$120B',
          statLabel: 'Total Addressable Market (TAM)',
          statChange: 'Global Enterprise Automation & Knowledge Services',
          gridSpan: 'col-span-12 md:col-span-4'
        },
        {
          id: 'el-4-2',
          type: 'stat-block',
          statValue: '$28B',
          statLabel: 'Serviceable Addressable Market (SAM)',
          statChange: 'Mid-Market & Global Tech SaaS Operations',
          gridSpan: 'col-span-12 md:col-span-4'
        },
        {
          id: 'el-4-3',
          type: 'stat-block',
          statValue: '$3.4B',
          statLabel: 'Serviceable Obtainable Market (SOM)',
          statChange: 'Initial focus: Fintech & Healthcare Ops by 2028',
          gridSpan: 'col-span-12 md:col-span-4'
        }
      ],
      notes: 'Defensible bottom-up market sizing showing that even 1% market capture represents a multi-hundred-million-dollar ARR business.'
    },
    {
      id: 'slide-5',
      title: 'Traction & Momentum',
      category: 'traction',
      layout: 'bento-grid',
      badge: 'HYPER-GROWTH',
      headline: '$1.4M ARR in 7 Months With Zero Outbound Marketing',
      subheadline: 'World-class retention and word-of-mouth expansion across high-value engineering teams.',
      elements: [
        {
          id: 'el-5-1',
          type: 'stat-block',
          statValue: '$1.4M',
          statLabel: 'Annual Recurring Revenue (ARR)',
          statChange: '↑ 24% Month-over-Month',
          gridSpan: 'col-span-12 md:col-span-3'
        },
        {
          id: 'el-5-2',
          type: 'stat-block',
          statValue: '142%',
          statLabel: 'Net Revenue Retention (NRR)',
          statChange: 'Best-in-class SaaS benchmark',
          gridSpan: 'col-span-12 md:col-span-3'
        },
        {
          id: 'el-5-3',
          type: 'stat-block',
          statValue: '84',
          statLabel: 'Enterprise Paid Customers',
          statChange: 'Including 6 Fortune 500 pilots',
          gridSpan: 'col-span-12 md:col-span-3'
        },
        {
          id: 'el-5-4',
          type: 'stat-block',
          statValue: '4.8x',
          statLabel: 'LTV to CAC Ratio',
          statChange: '< 4 month payback period',
          gridSpan: 'col-span-12 md:col-span-3'
        },
        {
          id: 'el-5-5',
          type: 'quote',
          content: '"Aura replaced 4 custom integration contractors within 48 hours of onboarding. It is now our highest-ROI software expenditure this quarter."',
          author: 'Elena Rostova',
          role: 'VP of Engineering, ScaleFin (Series B Fintech)',
          gridSpan: 'col-span-12'
        }
      ],
      notes: 'Traction numbers speak louder than anything else. Point out the 142% NRR.'
    },
    {
      id: 'slide-6',
      title: 'Competitive Moat',
      category: 'competition',
      layout: 'table',
      badge: 'UNFAIR ADVANTAGES',
      headline: 'Built for Determinism, Not Just Conversational Toys',
      subheadline: 'How Aura outperforms legacy RPA and shallow LLM wrappers across every critical dimension.',
      elements: [
        {
          id: 'el-6-1',
          type: 'comparison-table',
          title: 'Capabilities Matrix',
          columns: ['Dimension', 'Legacy RPA (UiPath)', 'Generic LLM Wrappers', 'Aura AI Platform'],
          rows: [
            { cells: ['Self-healing on UI changes', 'Fragile (breaks on DOM shift)', 'Requires re-prompting', 'Autonomous Dynamic Re-planning'] },
            { cells: ['Mathematical Verification', 'Script based only', 'None (High Hallucination)', 'Cryptographic Sandbox Verification'] },
            { cells: ['Deployment Speed', '3 - 6 Months Consulting', 'Hours (Unreliable)', '15 Minutes Self-Serve SDK'] },
            { cells: ['Data Privacy & On-Prem', 'Complex Heavy Enterprise', 'Cloud Only (Exposes PII)', 'Zero-Knowledge Edge Enclaves'] }
          ],
          gridSpan: 'col-span-12'
        }
      ],
      notes: 'Address why incumbents cannot copy this easily: our deterministic verification compiler is proprietary.'
    },
    {
      id: 'slide-7',
      title: 'Business Model',
      category: 'business-model',
      layout: 'three-column',
      badge: 'MONETIZATION',
      headline: 'Consumption-Based Pricing Aligned With Customer Value',
      subheadline: 'Customers only pay when workflows succeed, driving viral bottom-up expansion.',
      elements: [
        {
          id: 'el-7-1',
          type: 'feature-card',
          title: 'Developer Cloud',
          subtitle: '$249 / month base',
          content: 'Up to 50k executed autonomous tasks, 20 connector bridges, community support and webhooks.',
          tag: 'SELF-SERVE TIER',
          gridSpan: 'col-span-12 md:col-span-4'
        },
        {
          id: 'el-7-2',
          type: 'feature-card',
          title: 'Enterprise Core',
          subtitle: '$2,500 / month + usage',
          content: 'Unlimited connectors, custom on-prem agent runners, SOC-2 compliance package, 99.99% SLA.',
          tag: 'FASTEST GROWING',
          gridSpan: 'col-span-12 md:col-span-4'
        },
        {
          id: 'el-7-3',
          type: 'feature-card',
          title: 'Dedicated VPC & GovCloud',
          subtitle: '$80k+ / year ACV',
          content: 'Air-gapped deployment, custom fine-tuned weights on private clusters, 24/7 dedicated solutions engineer.',
          tag: 'ENTERPRISE CONTRACTS',
          gridSpan: 'col-span-12 md:col-span-4'
        }
      ],
      notes: 'Clarify that our usage tier drives massive margin expansion as customers automate more workflows.'
    },
    {
      id: 'slide-8',
      title: 'Team & Pedigree',
      category: 'team',
      layout: 'three-column',
      badge: 'THE BUILDERS',
      headline: 'Deep AI Research Meets High-Scale Infrastructure',
      subheadline: 'Founders have shipped systems supporting hundreds of millions of users.',
      elements: [
        {
          id: 'el-8-1',
          type: 'team-card',
          title: 'Marcus Vance',
          subtitle: 'Co-Founder & CEO',
          content: 'Previously Staff Eng at Stripe, early core team at Datadog. Built distributed systems handling $10B+ in transaction volume.',
          tag: 'EX-STRIPE',
          gridSpan: 'col-span-12 md:col-span-4'
        },
        {
          id: 'el-8-2',
          type: 'team-card',
          title: 'Dr. Priya Sharma',
          subtitle: 'Co-Founder & Chief Scientist',
          content: 'PhD in Reinforcement Learning from Stanford. 6 top-tier NeurIPS papers on agentic reasoning and program synthesis.',
          tag: 'EX-GOOGLE DEEPMIND',
          gridSpan: 'col-span-12 md:col-span-4'
        },
        {
          id: 'el-8-3',
          type: 'team-card',
          title: 'David Chen',
          subtitle: 'Head of Product & Growth',
          content: 'Led GTM at Retool from $5M to $50M ARR. Deep expertise in developer tooling and enterprise sales motions.',
          tag: 'EX-RETOOL',
          gridSpan: 'col-span-12 md:col-span-4'
        }
      ],
      notes: 'Emphasize founder-market fit: combining deep AI research with enterprise scaling experience.'
    },
    {
      id: 'slide-9',
      title: 'The Ask & Milestones',
      category: 'financials',
      layout: 'two-column',
      badge: 'INVESTMENT SUMMARY',
      headline: 'Raising $3.5M Seed to Scale Go-To-Market & Research',
      subheadline: '18 months of runway to reach $8M ARR and expand our enterprise connector network.',
      elements: [
        {
          id: 'el-9-1',
          type: 'feature-card',
          title: 'Capital Allocation Breakdown',
          subtitle: 'Where the $3.5M will be deployed',
          content: '• 55% Core AI & Verification Engineering (hire 5 senior researchers)\n• 30% Enterprise GTM & Solutions Architecture\n• 15% Infrastructure, GPU Compute & Security Certifications',
          tag: 'USE OF FUNDS',
          gridSpan: 'col-span-12 md:col-span-6'
        },
        {
          id: 'el-9-2',
          type: 'feature-card',
          title: '18-Month Target Milestones',
          subtitle: 'Path to Series A metrics',
          content: '• Reach $8.5M ARR with 350+ enterprise accounts\n• Launch open-source verification compiler with 10k+ GitHub stars\n• Expand into EMEA & APAC regulated banking markets',
          tag: 'ROADMAP TARGETS',
          gridSpan: 'col-span-12 md:col-span-6'
        }
      ],
      notes: 'State the round terms clearly, current commitments, and timeline for closing.'
    },
    {
      id: 'slide-10',
      title: 'Closing / Call to Action',
      category: 'closing',
      layout: 'hero',
      badge: 'JOIN THE JOURNEY',
      headline: 'The Future of Enterprise Work is Autonomous',
      subheadline: 'Let us build the next decacorn together.',
      description: 'Contact: founders@aura-intelligence.ai • San Francisco, CA • aura-intelligence.ai',
      elements: [
        {
          id: 'el-10-1',
          type: 'cta-button',
          title: 'Schedule Founder Deep-Dive',
          content: 'cal.com/aura-founders/seed-partner',
          gridSpan: 'col-span-12'
        }
      ],
      notes: 'Thank investors, leave room for Q&A, and provide direct contact links.'
    }
  ]
};

export const STARTER_BROCHURE: DesignDocument = {
  id: 'brochure-lumina-cloud',
  title: 'Lumina Cloud — Enterprise Capability Brochure',
  subtitle: 'Next-Generation Zero-Trust Cloud Infrastructure',
  type: 'brochure',
  aspectRatio: 'a4-portrait',
  themeId: 'emerald-luxe',
  fontFamily: 'sans',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  slides: [
    {
      id: 'brochure-p1',
      title: 'Cover & Executive Summary',
      category: 'title',
      layout: 'hero',
      badge: 'ENTERPRISE SOLUTION OVERVIEW',
      headline: 'Next-Gen Cloud Without Attack Surfaces',
      subheadline: 'Micro-segmented isolation for mission-critical Kubernetes and serverless deployments.',
      description: 'Engineered for financial institutions, defense grade workloads, and Fortune 100 enterprises.',
      elements: [
        {
          id: 'br-1',
          type: 'stat-block',
          statValue: '0.00%',
          statLabel: 'Lateral Attack Surface',
          statChange: 'Verified micro-enclaves',
          gridSpan: 'col-span-12 md:col-span-4'
        },
        {
          id: 'br-2',
          type: 'stat-block',
          statValue: '100 Gbps',
          statLabel: 'Encrypted Throughput',
          statChange: 'Hardware line-rate speed',
          gridSpan: 'col-span-12 md:col-span-4'
        },
        {
          id: 'br-3',
          type: 'stat-block',
          statValue: '99.999%',
          statLabel: 'Guaranteed Availability',
          statChange: 'Multi-region active-active',
          gridSpan: 'col-span-12 md:col-span-4'
        }
      ]
    },
    {
      id: 'brochure-p2',
      title: 'Core Architecture Pillars',
      category: 'solution',
      layout: 'bento-grid',
      badge: 'ARCHITECTURAL CAPABILITIES',
      headline: 'Built From The Silicon Up For Total Resilience',
      subheadline: 'Four foundational innovations powering the Lumina Cloud mesh.',
      elements: [
        {
          id: 'br-4',
          type: 'feature-card',
          title: 'Hardware Root of Trust',
          subtitle: 'Cryptographic attestation on every boot cycle.',
          content: 'TPM 2.0 and Secure Enclave chips guarantee that no firmware has been compromised prior to execution.',
          tag: 'HARDWARE SECURITY',
          gridSpan: 'col-span-12 md:col-span-6'
        },
        {
          id: 'br-4-2',
          type: 'feature-card',
          title: 'Quantum-Resistant Ciphers',
          subtitle: 'Kyber & Dilithium post-quantum algorithms.',
          content: 'Future-proof all customer payload transmissions against Harvest Now, Decrypt Later threats.',
          tag: 'NIST APPROVED',
          gridSpan: 'col-span-12 md:col-span-6'
        },
        {
          id: 'br-4-3',
          type: 'feature-card',
          title: 'Automated Regulatory Compliance',
          subtitle: 'Continuous auditing for SOC-2, HIPAA, FedRAMP High.',
          content: 'Live evidence collection exports one-click audit bundles for external compliance regulators.',
          tag: 'GOVERNANCE',
          gridSpan: 'col-span-12 md:col-span-12'
        }
      ]
    }
  ]
};

export const STARTER_ONE_PAGER: DesignDocument = {
  id: 'onepager-apex',
  title: 'Apex Financial — Product Brief',
  subtitle: 'Automated Treasury Management for High-Growth Startups',
  type: 'one-pager',
  aspectRatio: 'a4-portrait',
  themeId: 'cashmere-ivory',
  fontFamily: 'serif',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  slides: [
    {
      id: 'onepager-p1',
      title: 'Executive Brief',
      category: 'title',
      layout: 'bento-grid',
      badge: 'EXECUTIVE OVERVIEW // 2026',
      headline: 'Apex Yield: Maximizing Startup Treasury Safety & Returns',
      subheadline: 'Automated diversification into short-duration US Treasuries with up to $25M in FDIC insurance.',
      elements: [
        {
          id: 'op-1',
          type: 'stat-block',
          statValue: '5.18%',
          statLabel: 'Current Annual Yield',
          statChange: 'Direct T-Bill backed liquidity',
          gridSpan: 'col-span-12 md:col-span-4'
        },
        {
          id: 'op-2',
          type: 'stat-block',
          statValue: '$25M',
          statLabel: 'FDIC Extended Insurance',
          statChange: 'Spread across 100+ program banks',
          gridSpan: 'col-span-12 md:col-span-4'
        },
        {
          id: 'op-3',
          type: 'stat-block',
          statValue: 'Same-Day',
          statLabel: 'Liquid Access',
          statChange: 'Instant wire sweeps for payroll',
          gridSpan: 'col-span-12 md:col-span-4'
        },
        {
          id: 'op-4',
          type: 'feature-card',
          title: 'Automated Payroll Reserves',
          subtitle: 'Never worry about liquidity crunches',
          content: 'Algorithms calculate your 90-day cash outflow variance and automatically maintain zero-penalty liquidity buffers.',
          tag: 'SAFETY FIRST',
          gridSpan: 'col-span-12 md:col-span-6'
        },
        {
          id: 'op-5',
          type: 'feature-card',
          title: 'Direct ERP & Bank Feeds',
          subtitle: 'Syncs with QuickBooks, NetSuite, and Brex',
          content: 'Real-time ledger updates with automated reconciliation so finance teams never perform manual balance matching.',
          tag: 'ZERO OVERHEAD',
          gridSpan: 'col-span-12 md:col-span-6'
        }
      ]
    }
  ]
};

export const STARTER_FLYER: DesignDocument = {
  id: 'flyer-synth-summit',
  title: 'SynthAI Summit 2026 — Launch Flyer',
  subtitle: 'The Premier Frontier AI & Robotics Conference',
  type: 'flyer',
  aspectRatio: 'a4-portrait',
  themeId: 'cyber-violet',
  fontFamily: 'display',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  slides: [
    {
      id: 'flyer-p1',
      title: 'Synth Summit Poster',
      category: 'title',
      layout: 'hero',
      badge: 'NOVEMBER 14-16 // SAN FRANCISCO, CA',
      headline: 'SYNTH CON 2026',
      subheadline: 'Where 2,500 Frontier AI Researchers, Roboticists, & Builders Converge',
      description: 'Keynotes by Turing Award winners, hands-on humanoid robotics workshops, and $1M venture pitch contest.',
      elements: [
        {
          id: 'fl-1',
          type: 'stat-block',
          statValue: '2,500+',
          statLabel: 'Global Attendees',
          statChange: 'Engineers, VCs & Researchers',
          gridSpan: 'col-span-12 md:col-span-4'
        },
        {
          id: 'fl-2',
          type: 'stat-block',
          statValue: '85+',
          statLabel: 'Frontier Speakers',
          statChange: 'From OpenAI, Anthropic, Google',
          gridSpan: 'col-span-12 md:col-span-4'
        },
        {
          id: 'fl-3',
          type: 'stat-block',
          statValue: '$1,000,000',
          statLabel: 'Startup Prize Pool',
          statChange: 'Equity-free non-dilutive awards',
          gridSpan: 'col-span-12 md:col-span-4'
        },
        {
          id: 'fl-4',
          type: 'cta-button',
          title: 'Reserve Early Bird Passes Today',
          content: 'synthcon2026.ai/register • Early bird pricing ends soon',
          gridSpan: 'col-span-12'
        }
      ]
    }
  ]
};
