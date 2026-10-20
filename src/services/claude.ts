import { DesignDocument, SlidePage, DocumentType } from '../types/design';

export interface ClaudeConfig {
  apiKey: string;
  model: string;
  temperature: number;
}

const STORAGE_KEY = 'prearn_claude_api_key';
const MODEL_KEY = 'prearn_claude_model';

export const getStoredApiKey = (): string => {
  const local = localStorage.getItem(STORAGE_KEY);
  if (local && local.trim()) return local.trim();
  const envKey = (import.meta.env.VITE_ANTHROPIC_API_KEY as string);
  if (envKey && envKey.trim()) return envKey.trim();
  return '';
};

export const setStoredApiKey = (key: string) => {
  localStorage.setItem(STORAGE_KEY, key.trim());
};

// Verified Anthropic models available on this account
export const AVAILABLE_MODELS = [
  { 
    id: 'claude-sonnet-5-5', 
    name: 'Claude Sonnet 5.5 (Flagship Designer)', 
    category: 'Sonnet',
    badge: 'FLAGSHIP',
    description: 'Anthropic 5.5 flagship: elite visual architecture, modern layouts, multi-column precision & executive copy' 
  },
  { 
    id: 'claude-opus-5-5', 
    name: 'Claude Opus 5.5 (Supreme Intelligence & Depth)', 
    category: 'Opus',
    badge: 'EXECUTIVE',
    description: 'Maximum narrative depth: luxury corporate brochures, high-conviction strategy & diligence memorandums' 
  },
  { 
    id: 'claude-fable-5-1', 
    name: 'Claude Fable 5.1 (Creative & Narrative)', 
    category: 'Fable',
    badge: 'CREATIVE',
    description: 'Specialized creative narrative, marketing copy, brand voice & high-conversion brochures' 
  },
  { 
    id: 'claude-haiku-5-5', 
    name: 'Claude Haiku 5.5 (Ultra-Fast 0-Latency)', 
    category: 'Haiku',
    badge: 'FAST',
    description: 'Lightning speed: instant card ideation, rapid text refinement & quick slide expansions' 
  },
  { 
    id: 'claude-opus-5', 
    name: 'Claude Opus 5 (Master Strategist)', 
    category: 'Opus',
    badge: 'STRATEGY',
    description: 'Deep institutional reasoning for complex multi-slide whitepapers and technical specs' 
  },
  { 
    id: 'claude-opus-4-6', 
    name: 'Claude Opus 4.6 (Enterprise Reasoning)', 
    category: 'Opus',
    badge: 'ENTERPRISE',
    description: 'Advanced financial projections, unit economics models & competitor matrices' 
  },
  { 
    id: 'claude-sonnet-4-5-20250929', 
    name: 'Claude Sonnet 4.5', 
    category: 'Sonnet',
    badge: 'RELIABLE',
    description: 'High-speed reliable visual design generator' 
  },
  { 
    id: 'claude-opus-4-5-20251101', 
    name: 'Claude Opus 4.5', 
    category: 'Opus',
    badge: 'RELIABLE',
    description: 'Deep technical reasoning & enterprise whitepapers' 
  },
];

const VALID_MODEL_IDS = new Set(AVAILABLE_MODELS.map(m => m.id));

export const sanitizeModel = (rawModel?: string): string => {
  if (!rawModel) return 'claude-sonnet-5-5';
  const m = rawModel.trim().toLowerCase();
  if (VALID_MODEL_IDS.has(m)) return m;

  // Clean fallback mapping for any legacy or third-party model keys
  if (m.includes('opus')) return 'claude-opus-5-5';
  if (m.includes('fable')) return 'claude-fable-5-1';
  if (m.includes('haiku')) return 'claude-haiku-5-5';
  return 'claude-sonnet-5-5';
};

export const getStoredModel = (): string => {
  const local = localStorage.getItem(MODEL_KEY);
  const clean = sanitizeModel(local || undefined);
  if (local !== clean) {
    localStorage.setItem(MODEL_KEY, clean);
  }
  return clean;
};

export const setStoredModel = (model: string) => {
  const clean = sanitizeModel(model);
  localStorage.setItem(MODEL_KEY, clean);
};

const SYSTEM_DESIGN_PROMPT = `You are "Gamma AI Design Architect" — an elite brand director, luxury print & presentation designer.
Your task is to craft ultra-premium, high-conversion visual deliverables: YC/Sequoia-grade pitch decks, luxury corporate brochures, and executive one-pagers.

DESIGN ARCHETYPES:
1. PITCH DECKS (16:9 & Responsive):
   - Fast, visual, punchy.
   - Use high-impact headlines with real quantitative metrics ($ ARR, % growth, TAM).
   - Mix layouts: 'hero', 'bento-grid', 'three-column', 'table', 'traction', 'split-view'.

2. CORPORATE BROCHURES (Tri-Fold & Multi-Panel Spread):
   - A brochure must look like a luxury corporate publication or tri-fold brochure, NOT a generic presentation slide!
   - Each card/panel must have rich editorial depth:
     * Panel 1: Cover Masthead (Brand Title, Premium Tagline, Established Badge, Core Mission)
     * Panel 2: Core Capabilities & Philosophy (Detailed offering pillars with icons, methodology 01/02/03)
     * Panel 3: Service Tiers & Solutions (Pricing/tier breakdown, feature checklist, quantifiable ROI metrics)
     * Panel 4+: Deep-dive specifications, client case studies, contact & global offices.

3. STRICT CONSTRAINTS:
   - Keep descriptions sharp, editorial, and punchy (1-2 sentences max per element).
   - Return ONLY a single valid JSON object adhering strictly to the requested schema.
   - Never output markdown commentary before or after the JSON block.`;

export async function callClaudeApi(
  prompt: string,
  systemPrompt: string = SYSTEM_DESIGN_PROMPT,
  overrideKey?: string,
  overrideModel?: string
): Promise<string> {
  const apiKey = (overrideKey || getStoredApiKey()).trim();
  const model = sanitizeModel(overrideModel || getStoredModel());

  // Multi-tier endpoint fallback: Edge proxy -> Direct API
  const endpoints = [
    { url: '/api/claude', useDirect: false },
    { url: 'https://api.anthropic.com/v1/messages', useDirect: true }
  ];

  let lastError: Error | null = null;

  for (const endpoint of endpoints) {
    if (!apiKey && endpoint.useDirect) {
      continue;
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      };

      if (apiKey) {
        headers['x-api-key'] = apiKey;
      }

      if (endpoint.useDirect) {
        headers['anthropic-dangerous-direct-browser-access'] = 'true';
      }

      const requestBody: any = {
        model,
        max_tokens: 8192, // Maximum token output window for limitless decks
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000); // 90s timeout for large decks

      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/html')) {
        continue;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData?.error?.message || `API error (${response.status}): ${response.statusText}`;
        throw new Error(message);
      }

      const data = await response.json();
      
      // Extract text content (filter out thinking blocks)
      const textBlocks = (data.content || [])
        .filter((block: any) => block.type === 'text' && typeof block.text === 'string')
        .map((block: any) => block.text);

      const text = textBlocks.join('\n').trim();
      
      if (!text) {
        const fallbackText = data.content?.[0]?.text;
        if (fallbackText) {
          return fallbackText;
        }
        throw new Error('Empty response received from Claude API. Please verify your API key or prompt.');
      }

      return text;
    } catch (err: any) {
      lastError = err;
      continue;
    }
  }

  throw lastError || new Error('Failed to reach Anthropic Claude API. Please check your network connection or API key.');
}

/**
 * Robust Multi-Stage JSON Repair & Sanitization Parser
 */
export function cleanAndParseJSON<T>(rawText: string): T {
  let cleaned = rawText.trim();
  
  // Extract JSON from markdown fences if present
  const markdownMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (markdownMatch && markdownMatch[1]) {
    cleaned = markdownMatch[1].trim();
  } else {
    // Truncated fence opening
    const openFence = cleaned.match(/```(?:json)?\s*([\s\S]*)/);
    if (openFence && openFence[1]) {
      cleaned = openFence[1].trim();
    }
  }

  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');
  
  let startIdx = 0;
  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIdx = firstBrace;
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
  }

  cleaned = cleaned.substring(startIdx);

  // LEVEL 1: Direct JSON.parse
  try {
    return JSON.parse(cleaned) as T;
  } catch (e1) {}

  // LEVEL 2: Strip trailing commas before } or ]
  let s = cleaned.replace(/,\s*([}\]])/g, '$1');
  try {
    return JSON.parse(s) as T;
  } catch (e2) {}

  // LEVEL 3: Slide boundary auto-truncation recovery
  const lastSlideBoundary = s.lastIndexOf('},');
  if (lastSlideBoundary !== -1) {
    const candidate = s.substring(0, lastSlideBoundary + 1) + '\n  ]\n}';
    const cleanedCandidate = candidate.replace(/,\s*([}\]])/g, '$1');
    try {
      return JSON.parse(cleanedCandidate) as T;
    } catch (e3) {}
  }

  // LEVEL 4: Character-stream tokenizer with bracket/quote auto-balancing
  try {
    let inString = false;
    let escaped = false;
    let stack: string[] = [];
    let out = '';

    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (inString) {
        if (c === '\\' && !escaped) {
          escaped = true;
          out += c;
        } else if (c === '"' && !escaped) {
          inString = false;
          out += c;
        } else {
          escaped = false;
          if (c === '\n') out += '\\n';
          else if (c === '\r') out += '\\r';
          else if (c === '\t') out += '\\t';
          else out += c;
        }
      } else {
        if (c === '"') {
          inString = true;
          out += c;
        } else if (c === '{' || c === '[') {
          stack.push(c);
          out += c;
        } else if (c === '}') {
          if (stack.length && stack[stack.length - 1] === '{') stack.pop();
          out += c;
        } else if (c === ']') {
          if (stack.length && stack[stack.length - 1] === '[') stack.pop();
          out += c;
        } else {
          out += c;
        }
      }
    }

    if (inString) out += '"';
    out = out.replace(/,\s*([}\]])/g, '$1');
    out = out.replace(/,\s*$/, '');
    out = out.replace(/:\s*$/, ': null');

    while (stack.length > 0) {
      const open = stack.pop();
      if (open === '{') out += '}';
      else if (open === '[') out += ']';
    }

    return JSON.parse(out) as T;
  } catch (err: any) {
    console.error('Failed to parse repaired JSON:', cleaned);
    throw new Error(`Could not parse Claude's generated design JSON: ${err.message}`);
  }
}

/**
 * LIMITLESS MULTI-BATCH GENERATION ENGINE
 * Supports arbitrary number of slides (5, 10, 15, 20, 30+) without token clipping
 */
export async function generateFullDesignDocument(
  userPrompt: string,
  docType: DocumentType = 'pitch-deck',
  themeId: string = 'gamma-cosmic',
  aspectRatio: any = '16:9',
  numCards: number = 6,
  onProgress?: (status: string, percent?: number) => void
): Promise<DesignDocument> {
  const isBrochure = docType === 'brochure';
  const totalTargetCards = Math.max(numCards, 1);

  // BROCHURE GENERATION PIPELINE
  if (isBrochure) {
    const panelCount = Math.max(totalTargetCards, 3);
    onProgress?.(`Architecting ${panelCount}-Panel Editorial Corporate Brochure...`, 20);

    const brochurePrompt = `You are an award-winning creative director at Pentagram designing a multi-panel luxury corporate brochure for:
"${userPrompt}"

Deliverable: Luxury Corporate Brochure (${panelCount} Editorial Panels)
Theme: ${themeId}

Structure the brochure into ${panelCount} distinct, high-end editorial panels:
- Panel 01 - Cover Masthead: Bold Brand Title, luxury tagline, established badge, core executive statement, hero stat.
- Panel 02 - Core Capabilities & Methodology: 3 numbered pillars (01, 02, 03) with tags, punchy descriptions, and verified impact metrics.
- Panel 03 - Solutions & Direct Contact: Service breakdown with checklist bullet points, enterprise client testimonial quote, and headquarters contact details.
${panelCount > 3 ? `- Panels 04 to ${panelCount}: Deep-dive architectural blueprints, enterprise case studies, tier comparison pricing, and leadership team credentials.` : ''}

Return ONLY a single valid JSON object adhering strictly to this schema:
{
  "id": "brochure-${Date.now()}",
  "title": "Short Brochure Title",
  "subtitle": "Luxury Tagline",
  "type": "brochure",
  "aspectRatio": "trifold",
  "themeId": "${themeId}",
  "fontFamily": "serif",
  "slides": [
    {
      "id": "panel-1",
      "title": "Cover Panel",
      "category": "MASTHEAD",
      "layout": "hero",
      "badge": "LUXURY BROCHURE // 2026",
      "headline": "Bold Editorial Masthead",
      "subheadline": "Compelling value proposition (1-2 sentences)",
      "elements": [
        {
          "id": "el-1",
          "type": "stat-block",
          "statValue": "99.98%",
          "statLabel": "Client Success Rate",
          "statChange": "Industry benchmark",
          "gridSpan": "col-span-12 md:col-span-6"
        },
        {
          "id": "el-2",
          "type": "feature-card",
          "title": "Core Specialization",
          "subtitle": "Pillar Subhead",
          "content": "Crisp editorial copy describing the capability.",
          "tag": "CAPABILITY",
          "gridSpan": "col-span-12 md:col-span-6"
        }
      ]
    },
    {
      "id": "panel-2",
      "title": "Capabilities & Architecture",
      "category": "PILLARS",
      "layout": "three-column",
      "badge": "METHODOLOGY",
      "headline": "Engineered for Exponential Performance",
      "subheadline": "Three core foundations driving verified enterprise outcomes.",
      "elements": [
        {
          "id": "el-2-1",
          "type": "feature-card",
          "title": "01 // Autonomous Precision",
          "content": "Real-time decision pipelines optimizing throughput with zero manual friction.",
          "tag": "CORE ARCHITECTURE",
          "gridSpan": "col-span-12 md:col-span-4"
        },
        {
          "id": "el-2-2",
          "type": "feature-card",
          "title": "02 // Institutional Governance",
          "content": "Full SOC-2 Type II audit trail and cryptographic tamper resistance.",
          "tag": "SECURITY",
          "gridSpan": "col-span-12 md:col-span-4"
        },
        {
          "id": "el-2-3",
          "type": "stat-block",
          "statValue": "10x",
          "statLabel": "Speed-to-Execution",
          "statChange": "Across all Tier-1 deployments",
          "gridSpan": "col-span-12 md:col-span-4"
        }
      ]
    },
    {
      "id": "panel-3",
      "title": "Client Proof & Contact",
      "category": "ACTION",
      "layout": "bento-grid",
      "badge": "PARTNERSHIP",
      "headline": "Begin Your Transformation",
      "subheadline": "Direct private client advisory and white-glove onboarding.",
      "elements": [
        {
          "id": "el-3-1",
          "type": "quote",
          "quoteText": "Prearn redefined how our board views automated execution — truly standard-setting.",
          "quoteAuthor": "Elena Rostova",
          "quoteRole": "Managing Director, Apex Capital",
          "gridSpan": "col-span-12 md:col-span-6"
        },
        {
          "id": "el-3-2",
          "type": "checklist",
          "title": "Advisory Deliverables",
          "checklistItems": [
            "Complete Architecture Blueprint",
            "Dedicated Principal Partner",
            "24/7 Priority SLA & Escalation"
          ],
          "gridSpan": "col-span-12 md:col-span-6"
        }
      ]
    }
  ]
}`;

    const raw = await callClaudeApi(brochurePrompt);
    const parsed = cleanAndParseJSON<DesignDocument>(raw);
    parsed.id = parsed.id || `brochure-${Date.now()}`;
    parsed.createdAt = parsed.createdAt || new Date().toISOString();
    parsed.updatedAt = new Date().toISOString();
    parsed.themeId = parsed.themeId || themeId;
    parsed.type = 'brochure';
    parsed.aspectRatio = 'trifold';
    return parsed;
  }

  // PRESENTATION / PITCH DECK / ONE-PAGER PIPELINE
  // For decks <= 8 slides: Single optimized generation pass
  // For decks > 8 slides: Multi-batch pipeline for limitless capacity
  const batchSize = 7;
  const initialCardsCount = Math.min(totalTargetCards, batchSize);

  onProgress?.(`Synthesizing executive narrative & cards 1 to ${initialCardsCount}...`, 25);

  const initialPrompt = `You are an elite Silicon Valley creative director at Gamma AI designing an ultra-premium ${docType} with ${initialCardsCount} high-impact presentation cards for:
"${userPrompt}"

Document Type: ${docType}
Preferred Aspect Ratio: ${aspectRatio}
Theme ID: ${themeId}
Total Planned Cards in Deck: ${totalTargetCards}

Instructions:
- Keep all copy sharp, quantitative, and executive (1-2 punchy sentences per element).
- Generate exactly ${initialCardsCount} cards covering foundational chapters:
  Card 1: Executive Hook & Vision (Category, bold headline, thesis subheadline, 2 stat blocks)
  Card 2: Market Problem & Friction (Quantifiable pain points, market losses)
  Card 3: Solution & Core AI Architecture (Pillars, capabilities, differentiators)
  Card 4: Traction, Unit Economics & Metrics ($ ARR, NRR %, pilot counts)
  Card 5: Business Model & Pricing Tiers
  Card 6: Go-to-Market & Competitive Moat
  Card 7: The Ask & Leadership Team

Return ONLY valid JSON adhering strictly to this schema:
{
  "id": "deck-${Date.now()}",
  "title": "Short Deck Title",
  "subtitle": "High-impact subtitle thesis",
  "type": "${docType}",
  "aspectRatio": "${aspectRatio}",
  "themeId": "${themeId}",
  "fontFamily": "display",
  "slides": [
    {
      "id": "slide-1",
      "title": "Executive Vision",
      "category": "VISION",
      "layout": "hero",
      "badge": "SERIES A // 2026",
      "headline": "Bold Punchy Headline",
      "subheadline": "Compelling single-sentence executive thesis.",
      "elements": [
        {
          "id": "el-1",
          "type": "stat-block",
          "statValue": "$85B",
          "statLabel": "Market Addressable",
          "statChange": "+24% YoY growth",
          "gridSpan": "col-span-12 md:col-span-4"
        },
        {
          "id": "el-2",
          "type": "feature-card",
          "title": "Autonomous Predictive Routing",
          "subtitle": "Agentic Optimization",
          "content": "Self-healing logistics networks reroute shipments in real-time before delays manifest.",
          "tag": "CORE AI ENGINE",
          "gridSpan": "col-span-12 md:col-span-8"
        }
      ],
      "notes": "Speaker notes"
    }
  ]
}`;

  const rawInitial = await callClaudeApi(initialPrompt);
  const parsedDoc = cleanAndParseJSON<DesignDocument>(rawInitial);
  
  parsedDoc.id = parsedDoc.id || `deck-${Date.now()}`;
  parsedDoc.createdAt = parsedDoc.createdAt || new Date().toISOString();
  parsedDoc.updatedAt = new Date().toISOString();
  parsedDoc.themeId = parsedDoc.themeId || themeId;
  parsedDoc.type = parsedDoc.type || docType;
  parsedDoc.aspectRatio = parsedDoc.aspectRatio || aspectRatio;

  // CONTINUATION BATCHING (If user requested more than initial batch)
  let currentCardIndex = parsedDoc.slides.length;

  while (currentCardIndex < totalTargetCards) {
    const remainingNeeded = totalTargetCards - currentCardIndex;
    const currentChunkSize = Math.min(remainingNeeded, batchSize);
    const startNum = currentCardIndex + 1;
    const endNum = currentCardIndex + currentChunkSize;
    const progressPercent = Math.round((currentCardIndex / totalTargetCards) * 100);

    onProgress?.(`Generating continuation batch: Cards ${startNum} to ${endNum} of ${totalTargetCards}...`, progressPercent);

    const existingSlideTitles = parsedDoc.slides.map(s => `Card: "${s.title}" (${s.headline})`).join('\n');

    const continuationPrompt = `You are continuing the high-impact ${docType} titled "${parsedDoc.title}": "${parsedDoc.subtitle}".
Original prompt: "${userPrompt}"

The following ${currentCardIndex} cards have ALREADY been designed:
${existingSlideTitles}

Now, generate the NEXT ${currentChunkSize} cards (Cards #${startNum} through #${endNum}) to complete the deck.
Focus on advanced deep-dive topics:
- Technical Architecture & Deep Dives
- Detailed Case Studies & Customer Proof
- Unit Economics, Cohort Retention & Financial Forecasts
- Competitive Landscape & Feature Comparison Matrix
- Go-To-Market Channels & Enterprise Sales Motion
- Global Expansion Roadmap & Strategic Milestones
- Risk Analysis & Mitigation Framework
- Closing Call to Action & Investor Contact

Return ONLY a valid JSON object containing the new slides array:
{
  "slides": [
    {
      "id": "slide-${Date.now()}-${startNum}",
      "title": "Section Title",
      "category": "STRATEGY",
      "layout": "bento-grid",
      "badge": "EXPANSION",
      "headline": "Actionable Strategic Headline",
      "subheadline": "Quantitative supporting argument (1-2 sentences)",
      "elements": [
        {
          "id": "el-${Date.now()}-1",
          "type": "stat-block",
          "statValue": "142%",
          "statLabel": "Net Dollar Retention",
          "statChange": "Top decile benchmark",
          "gridSpan": "col-span-12 md:col-span-4"
        },
        {
          "id": "el-${Date.now()}-2",
          "type": "feature-card",
          "title": "Strategic Pillar",
          "content": "Rigorous execution strategy delivering consistent gross margins.",
          "tag": "MOAT",
          "gridSpan": "col-span-12 md:col-span-8"
        }
      ]
    }
  ]
}`;

    try {
      const continuationRaw = await callClaudeApi(continuationPrompt);
      const continuationParsed = cleanAndParseJSON<{ slides: SlidePage[] }>(continuationRaw);

      if (continuationParsed?.slides && Array.isArray(continuationParsed.slides)) {
        continuationParsed.slides.forEach((newSlide, i) => {
          newSlide.id = newSlide.id || `slide-${Date.now()}-${currentCardIndex + i + 1}`;
          parsedDoc.slides.push(newSlide);
        });
        currentCardIndex = parsedDoc.slides.length;
      } else {
        // Fallback: Break if structure unexpected
        break;
      }
    } catch (batchErr) {
      console.warn('Batch continuation warning:', batchErr);
      // Gracefully continue with slides generated so far
      break;
    }
  }

  onProgress?.('Finalizing deck polish & typography...', 95);

  return parsedDoc;
}

/**
 * AI ADD NEXT SLIDE
 * Intelligently analyzes existing deck and generates the next logical card
 */
export async function generateNextSlideInDeck(
  document: DesignDocument,
  optionalInstruction?: string
): Promise<SlidePage> {
  const currentSlideCount = document.slides.length;
  const existingSummary = document.slides
    .map((s, idx) => `Card #${idx + 1}: [${s.category || 'GENERAL'}] ${s.title} - ${s.headline}`)
    .join('\n');

  const prompt = `You are an elite Silicon Valley presentation director designing the NEXT sequential card (Card #${currentSlideCount + 1}) for a deck titled "${document.title}".
Context / Theme: ${document.themeId}
Deck Subtitle: "${document.subtitle}"

Existing cards in deck:
${existingSummary}

${optionalInstruction ? `Specific user instruction for this next card: "${optionalInstruction}"` : 'Determine the most logical, high-impact next chapter (e.g. Unit Economics, Customer Case Study, Technical Moat, or The Ask).'}

Return ONLY a single valid JSON object adhering to the SlidePage schema:
{
  "id": "slide-${Date.now()}",
  "title": "Next Chapter Title",
  "category": "TRACTION",
  "layout": "bento-grid",
  "badge": "CHAPTER // ${currentSlideCount + 1}",
  "headline": "Bold Punchy Headline",
  "subheadline": "Clear supporting thesis (1-2 sentences)",
  "elements": [
    {
      "id": "el-${Date.now()}-1",
      "type": "stat-block",
      "statValue": "$12.4M",
      "statLabel": "Projected ARR",
      "statChange": "Validated forecast",
      "gridSpan": "col-span-12 md:col-span-4"
    },
    {
      "id": "el-${Date.now()}-2",
      "type": "feature-card",
      "title": "Key Catalyst",
      "content": "Proprietary data flywheel accelerating client conversion by 4.2x.",
      "tag": "CATALYST",
      "gridSpan": "col-span-12 md:col-span-8"
    }
  ]
}`;

  const raw = await callClaudeApi(prompt);
  const parsed = cleanAndParseJSON<SlidePage>(raw);
  parsed.id = `slide-${Date.now()}`;
  return parsed;
}

/**
 * AI EXPAND DECK
 * Appends N complementary deep-dive cards to an existing document
 */
export async function expandDeckWithAI(
  document: DesignDocument,
  additionalCount: number = 3,
  onProgress?: (status: string) => void
): Promise<SlidePage[]> {
  onProgress?.(`Expanding deck with ${additionalCount} deep-dive cards...`);

  const existingSummary = document.slides
    .map((s, idx) => `Card #${idx + 1}: ${s.title} (${s.headline})`)
    .join('\n');

  const prompt = `You are an elite Silicon Valley presentation director expanding a deck titled "${document.title}": "${document.subtitle}".
The deck already contains ${document.slides.length} cards:
${existingSummary}

Generate ${additionalCount} NEW, complementary deep-dive cards to make this presentation extraordinarily comprehensive.
Suggested chapters to add:
- Deep-Dive Product Architecture & API Workflow
- Customer Case Study with Before/After ROI metrics
- 5-Year Financial Forecast & Unit Economics Model

Return ONLY a single valid JSON object:
{
  "slides": [
    {
      "id": "slide-expand-1",
      "title": "Deep Dive Architecture",
      "category": "ARCHITECTURE",
      "layout": "bento-grid",
      "badge": "DEEP DIVE",
      "headline": "High-Throughput Autonomous Execution",
      "subheadline": "Scalable cloud-native infrastructure with sub-millisecond failover.",
      "elements": [
        {
          "id": "el-ex-1",
          "type": "stat-block",
          "statValue": "99.999%",
          "statLabel": "Uptime SLA",
          "statChange": "Zero-maintenance cluster",
          "gridSpan": "col-span-12 md:col-span-6"
        },
        {
          "id": "el-ex-2",
          "type": "feature-card",
          "title": "Self-Healing Clusters",
          "content": "Automated node rebalancing eliminates single points of failure.",
          "tag": "INFRASTRUCTURE",
          "gridSpan": "col-span-12 md:col-span-6"
        }
      ]
    }
  ]
}`;

  const raw = await callClaudeApi(prompt);
  const parsed = cleanAndParseJSON<{ slides: SlidePage[] }>(raw);
  if (parsed?.slides && Array.isArray(parsed.slides)) {
    return parsed.slides.map((s, i) => ({
      ...s,
      id: `slide-${Date.now()}-${i + 1}`
    }));
  }
  return [];
}

/**
 * Generates a new single slide or rewrites an existing slide
 */
export async function generateOrRewriteSlide(
  userInstruction: string,
  currentSlide?: SlidePage,
  contextDeckTitle?: string
): Promise<SlidePage> {
  const isRewrite = !!currentSlide;
  const prompt = isRewrite
    ? `You are an elite Silicon Valley visual designer updating and improving an existing slide in a presentation titled "${contextDeckTitle || 'Executive Presentation'}".
User Instruction: "${userInstruction}"

Current Slide Data:
${JSON.stringify(currentSlide, null, 2)}

Instructions:
- Fully implement the user's requested changes.
- Provide structured metadata: title, category, layout, badge, headline, subheadline, elements (stat-blocks, feature-cards, quotes, checklists).
- Keep descriptions punchy and quantitative.
Return ONLY the updated SlidePage as a single valid JSON object adhering to the schema.`
    : `Create a single brand-new, ultra-premium slide for a deck titled "${contextDeckTitle || 'Executive Presentation'}".
User Instruction: "${userInstruction}"

Instructions:
- Provide structured metadata: title, category, layout, badge, headline, subheadline, elements.
Return ONLY a single valid JSON object adhering to the SlidePage schema:
{
  "id": "slide-${Date.now()}",
  "title": "Slide Title",
  "category": "PROBLEM",
  "layout": "bento-grid",
  "badge": "MARKET FRICTION",
  "headline": "Bold Punchy Headline",
  "subheadline": "Secondary supporting context",
  "elements": [
    {
      "id": "el-1",
      "type": "stat-block",
      "statValue": "$5.2M",
      "statLabel": "Annual Friction",
      "statChange": "Critical risk point",
      "gridSpan": "col-span-12 md:col-span-4"
    },
    {
      "id": "el-2",
      "type": "feature-card",
      "title": "Legacy Architecture Bottleneck",
      "content": "Outdated systems fail to scale under high-frequency workload demands.",
      "tag": "BOTTLENECK",
      "gridSpan": "col-span-12 md:col-span-8"
    }
  ],
  "notes": "Speaker notes"
}`;

  const raw = await callClaudeApi(prompt);
  const parsed = cleanAndParseJSON<SlidePage>(raw);
  parsed.id = currentSlide?.id || `slide-${Date.now()}`;
  return parsed;
}

/**
 * Quick AI helper for refining text tone or phrasing
 */
export async function refineTextWithClaude(
  text: string,
  action: 'punchy' | 'executive' | 'shorter' | 'expand' | 'fix' | 'data-heavy'
): Promise<string> {
  const actionPrompts = {
    punchy: 'Rewrite this text to be ultra-punchy, magnetic, and high-impact for an investor pitch deck:',
    executive: 'Rewrite this text in an authoritative, Fortune-500 executive tone:',
    shorter: 'Condense this text down to its essential high-impact core (1 concise sentence):',
    expand: 'Expand this with 1 supporting quantitative detail or strategic insight:',
    fix: 'Fix grammar, improve rhythm and elevate typography polish while preserving exact meaning:',
    'data-heavy': 'Inject concrete metrics, percentages, dollar values, or ROI numbers into this text:',
  };

  const prompt = `${actionPrompts[action]}
"${text}"

Return ONLY the refined text. No quotes, no markdown fences, no explanatory preamble.`;

  return await callClaudeApi(prompt, 'You are an elite editorial copywriter at Pentagram.');
}
