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

// All available Anthropic models on this user account
export const AVAILABLE_MODELS = [
  { 
    id: 'claude-sonnet-5-5', 
    name: 'Claude Sonnet 5.5 (Flagship Designer)', 
    category: 'Sonnet',
    description: 'Anthropic flagship: elite visual architecture, modern layouts & typography' 
  },
  { 
    id: 'claude-opus-5-5', 
    name: 'Claude Opus 5.5 (Supreme Intelligence)', 
    category: 'Opus',
    description: 'Maximum depth: luxury brand storytelling, executive strategy & precision' 
  },
  { 
    id: 'claude-fable-5-1', 
    name: 'Claude Fable 5.1 (Creative & Narrative)', 
    category: 'Fable',
    description: 'Specialized creative narrative, marketing copy & high-conversion brochures' 
  },
  { 
    id: 'claude-haiku-5-5', 
    name: 'Claude Haiku 5.5 (Ultra-Fast)', 
    category: 'Haiku',
    description: 'Lightning speed: instant rewrites and rapid card ideation' 
  },
  { 
    id: 'claude-sonnet-4-5-20250929', 
    name: 'Claude Sonnet 4.5', 
    category: 'Sonnet',
    description: 'High-speed reliable visual design generator' 
  },
  { 
    id: 'claude-opus-4-5-20251101', 
    name: 'Claude Opus 4.5', 
    category: 'Opus',
    description: 'Deep technical reasoning & enterprise whitepapers' 
  },
];

export const getStoredModel = (): string => {
  const local = localStorage.getItem(MODEL_KEY);
  if (local && AVAILABLE_MODELS.some(m => m.id === local)) return local;
  return 'claude-sonnet-5-5';
};

export const setStoredModel = (model: string) => {
  localStorage.setItem(MODEL_KEY, model);
};

const SYSTEM_DESIGN_PROMPT = `You are "Gamma AI Design Architect" — an elite brand director, luxury print & presentation designer.
Your task is to craft ultra-premium, high-conversion visual deliverables: YC/Sequoia-grade pitch decks, luxury corporate brochures, and executive one-pagers.

DESIGN ARCHETYPES:
1. PITCH DECKS (16:9):
   - Fast, visual, punchy.
   - Use high-impact headlines with real quantitative metrics.
   - Mix layouts: 'hero', 'bento-grid', 'three-column', 'table', 'traction'.

2. CORPORATE BROCHURES (Tri-Fold & Multi-Panel Spread):
   - A brochure must look like a luxury corporate publication or tri-fold brochure, NOT a generic presentation slide!
   - Each card/panel must have rich editorial depth:
     * Panel 1: Cover Masthead (Brand Title, Premium Tagline, Established Badge, Core Mission)
     * Panel 2: Core Capabilities & Philosophy (Detailed offering pillars with icons, methodology 01/02/03)
     * Panel 3: Service Tiers & Solutions (Pricing/tier breakdown, feature checklist, quantifiable ROI metrics)

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
  const model = overrideModel || getStoredModel();

  // Multi-tier endpoint fallback: Edge proxy -> Direct API -> Local proxy
  const endpoints = [
    { url: '/api/claude', useDirect: false },
    { url: 'https://api.anthropic.com/v1/messages', useDirect: true },
    { url: '/api/anthropic/v1/messages', useDirect: false }
  ];

  let lastError: Error | null = null;

  for (const endpoint of endpoints) {
    // Skip direct client-to-Anthropic call if no client key is configured
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
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      };

      // For Claude 5.x series (Sonnet 5.5, Opus 5.5, Fable 5.1), enable adaptive thinking with low effort
      if (model.includes('-5')) {
        requestBody.thinking = { type: 'adaptive' };
        requestBody.output_config = { effort: 'low' };
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // If route returned an HTML page (e.g. 404 rewrite to index.html on misconfigured server), continue to next endpoint
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
        throw new Error('Claude response did not contain text. Please try again.');
      }

      return text;
    } catch (err: any) {
      lastError = err;
      continue;
    }
  }

  throw lastError || new Error('Failed to reach Anthropic Claude API. Please check your network connection.');
}

/**
 * Robust Multi-Stage JSON Repair & Sanitization Parser
 */
function cleanAndParseJSON<T>(rawText: string): T {
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
 * Generates an entire multi-card deck or luxury brochure from a prompt
 */
export async function generateFullDesignDocument(
  userPrompt: string,
  docType: DocumentType = 'pitch-deck',
  themeId: string = 'gamma-cosmic',
  aspectRatio: any = '16:9',
  numCards: number = 5
): Promise<DesignDocument> {
  const isBrochure = docType === 'brochure';
  const effectiveCards = isBrochure ? 3 : Math.min(Math.max(numCards, 3), 7);

  const prompt = isBrochure
    ? `You are an award-winning creative director at Pentagram designing a multi-panel luxury corporate brochure for:
"${userPrompt}"

Deliverable: Luxury Corporate Brochure (Multi-Panel Tri-Fold Spread)
Theme: ${themeId}

Structure the brochure into 3 distinct, high-end editorial panels:
1. Panel 01 - Cover Masthead: Bold Brand Title, luxury tagline, established badge, core executive statement, hero stat.
2. Panel 02 - Core Capabilities & Methodology: 3 numbered pillars (01, 02, 03) with tags, punchy descriptions, and verified impact metrics.
3. Panel 03 - Solutions & Direct Contact: Service breakdown with checklist bullet points, enterprise client testimonial quote, and headquarters contact details.

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
}`
    : `You are an elite Silicon Valley creative director at Gamma AI designing an ultra-premium ${docType} with ${effectiveCards} high-impact presentation cards for:
"${userPrompt}"

Document Type: ${docType}
Preferred Aspect Ratio: ${aspectRatio}
Theme ID: ${themeId}

Instructions:
- Keep all copy sharp, quantitative, and executive (1-2 punchy sentences per element).
- Generate exactly ${effectiveCards} cards covering essential sections:
  Card 1: Executive Hook & Vision (Category, bold headline, thesis subheadline, 2 stat blocks)
  Card 2: Market Problem & Friction (Quantifiable pain points, market losses)
  Card 3: Solution & Core AI Architecture (Pillars, capabilities, differentiators)
  Card 4: Traction, Unit Economics & Metrics ($ ARR, NRR %, pilot counts)
  Card 5: The Ask & Leadership Team (Funding round details, key partners, use of funds)

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
      "badge": "SEED ROUND // 2026",
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

  const raw = await callClaudeApi(prompt);
  const parsed = cleanAndParseJSON<DesignDocument>(raw);
  
  parsed.id = parsed.id || `doc-${Date.now()}`;
  parsed.createdAt = parsed.createdAt || new Date().toISOString();
  parsed.updatedAt = new Date().toISOString();
  parsed.themeId = parsed.themeId || themeId;
  parsed.type = parsed.type || docType;
  parsed.aspectRatio = isBrochure ? 'trifold' : (parsed.aspectRatio || aspectRatio);

  return parsed;
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
