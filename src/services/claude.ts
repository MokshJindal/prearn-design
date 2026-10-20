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
  return (import.meta.env.VITE_ANTHROPIC_API_KEY as string) || '';
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
     * Panel 4: Client Proof & Case Studies (Enterprise testimonial quote, verified impact stats)
     * Panel 5: Contact & Action Panel (Direct contact details, headquarters location, website, guarantee)

3. STRICT CONSTRAINTS:
   - Keep descriptions sharp, editorial, and punchy.
   - Return ONLY a single valid JSON object.
   - Terminate all brackets and strings.
   - Do NOT include markdown commentary outside the JSON block.`;

export async function callClaudeApi(
  prompt: string,
  systemPrompt: string = SYSTEM_DESIGN_PROMPT,
  overrideKey?: string,
  overrideModel?: string
): Promise<string> {
  const apiKey = (overrideKey || getStoredApiKey()).trim();
  const model = overrideModel || getStoredModel();

  if (!apiKey) {
    throw new Error('Claude API Key is missing. Please set your Anthropic API Key in Settings.');
  }

  const endpoints = [
    { url: 'https://api.anthropic.com/v1/messages', useDirect: true },
    { url: '/api/anthropic/v1/messages', useDirect: false }
  ];

  let lastError: Error | null = null;

  for (const endpoint of endpoints) {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      };

      if (endpoint.useDirect) {
        headers['anthropic-dangerous-direct-browser-access'] = 'true';
      }

      const requestBody: any = {
        model,
        max_tokens: 8192,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      };

      // For Claude 5.x series (Sonnet 5.5, Opus 5.5, Fable 5.1), enable adaptive thinking with low effort to prevent burning tokens on thinking
      if (model.includes('-5')) {
        requestBody.thinking = { type: 'adaptive' };
        requestBody.output_config = { effort: 'low' };
      }

      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData?.error?.message || `API error (${response.status}): ${response.statusText}`;
        throw new Error(message);
      }

      const data = await response.json();
      
      // Robust text extraction from content blocks (filters out thinking blocks)
      const textBlocks = (data.content || [])
        .filter((block: any) => block.type === 'text' && typeof block.text === 'string')
        .map((block: any) => block.text);

      const text = textBlocks.join('\n').trim();
      
      if (!text) {
        // Fallback: check if content[0].text exists
        const fallbackText = data.content?.[0]?.text;
        if (fallbackText) {
          return fallbackText;
        }
        throw new Error('Claude was still reasoning and did not output text. Please try again or switch to Claude Sonnet 5.5.');
      }

      return text;
    } catch (err: any) {
      lastError = err;
      continue;
    }
  }

  throw lastError || new Error('Failed to reach Anthropic Claude API.');
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
  const lastSlideEnd = s.lastIndexOf('},');
  if (lastSlideEnd !== -1) {
    const candidate = s.substring(0, lastSlideEnd + 1) + '\n  ]\n}';
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
  numCards: number = 8
): Promise<DesignDocument> {
  const isBrochure = docType === 'brochure';

  const prompt = isBrochure
    ? `You are an award-winning creative director at Pentagram designing a multi-panel luxury corporate brochure for:
"${userPrompt}"

Deliverable: Luxury Corporate Brochure (Multi-Panel Spread)
Theme: ${themeId}

Structure the brochure into 3 to 5 distinct, high-end editorial panels:
1. Cover Panel: Bold Brand Title, luxury tagline, established badge, core executive statement.
2. Inside Left - Capabilities & Value Proposition: 3 numbered pillars (01, 02, 03) with tags and punchy descriptions.
3. Inside Center - Solutions & Deliverables: Service breakdown with checklist bullet points and stat counters.
4. Inside Right - Client Proof & Track Record: High-impact quote/testimonial + 3 verified ROI metrics.
5. Back Panel - Action & Direct Contact: Booking CTA button, headquarters address, email, phone, and guarantee badge.

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
      "title": "Panel Title",
      "category": "title",
      "layout": "hero",
      "badge": "LUXURY BROCHURE // 2026",
      "headline": "Bold Editorial Masthead",
      "subheadline": "Compelling value proposition (1-2 sentences)",
      "elements": [
        {
          "id": "el-1",
          "type": "feature-card",
          "title": "Core Specialization",
          "subtitle": "Pillar Subhead",
          "content": "Crisp editorial copy describing the capability.",
          "tag": "CAPABILITY",
          "gridSpan": "col-span-12 md:col-span-6"
        },
        {
          "id": "el-2",
          "type": "stat-block",
          "statValue": "99.98%",
          "statLabel": "Client Success Rate",
          "statChange": "Industry benchmark",
          "gridSpan": "col-span-12 md:col-span-6"
        }
      ]
    }
  ]
}`
    : `Generate a complete, production-grade, ultra-premium ${docType} design document with ${numCards} slides based on this brief:
"${userPrompt}"

Document Type: ${docType}
Preferred Aspect Ratio: ${aspectRatio}
Theme ID: ${themeId}

Instructions:
- Keep all descriptions punchy, quantitative, and executive (1-2 sentences max per element).
- Generate ${numCards} cards covering essential sections: Title Hero, Problem, Solution, Market Opportunity, Product Pillars, Traction & Metrics, Competitor Matrix, and The Ask / Closing.
- For each slide, you MUST include BOTH structured metadata (title, category, headline, subheadline, elements) AND an "html" property containing a complete, visually breathtaking 16:9 card in modern Tailwind CSS + SVG:
  * Use deep ambient glow orbs (e.g., <div class="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-purple-600/20 blur-[100px] pointer-events-none"></div>)
  * High-contrast Bento cards (backdrop-blur-xl bg-white/[0.04] border border-white/10 rounded-2xl p-6 hover:border-purple-500/30)
  * Large, bold stat displays ($1.4M ARR, 142% NRR) with gradient accents (bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent)
  * Clean SVG icons and visual badges
  * High readability and generous breathing room.
- Return ONLY valid JSON adhering strictly to this schema:
{
  "id": "deck-${Date.now()}",
  "title": "Short Deck Title",
  "subtitle": "Subtitle description",
  "type": "${docType}",
  "aspectRatio": "${aspectRatio}",
  "themeId": "${themeId}",
  "fontFamily": "display",
  "slides": [
    {
      "id": "slide-1",
      "title": "Title Card",
      "category": "title",
      "layout": "hero",
      "badge": "CATEGORY BADGE",
      "headline": "Bold Executive Headline",
      "subheadline": "Contextual subheadline (1 sentence)",
      "html": "<div class='relative w-full h-full overflow-hidden bg-[#090A10] text-white p-10 flex flex-col justify-between rounded-3xl border border-white/10 font-sans'>...</div>",
      "elements": [
        {
          "id": "el-1",
          "type": "stat-block",
          "statValue": "$3.5M",
          "statLabel": "Metric Label",
          "statChange": "Growth detail",
          "gridSpan": "col-span-12 md:col-span-4"
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
- Provide BOTH structured metadata AND an "html" property containing a complete, visually breathtaking 16:9 card in modern Tailwind CSS + SVG:
  * Ambient glow background
  * High-contrast Bento cards, stats, tables, or diagrams matching the request
  * Sharp typography hierarchy.
Return ONLY the updated SlidePage as a single valid JSON object adhering to the schema (id, title, category, layout, badge, headline, subheadline, description, html, elements, notes).`
    : `Create a single brand-new, ultra-premium slide for a deck titled "${contextDeckTitle || 'Executive Presentation'}".
User Instruction: "${userInstruction}"

Instructions:
- Provide BOTH structured metadata AND an "html" property containing a complete, visually breathtaking 16:9 card in modern Tailwind CSS + SVG.
Return ONLY a single valid JSON object adhering to the SlidePage schema:
{
  "id": "slide-${Date.now()}",
  "title": "Slide Title",
  "category": "problem",
  "layout": "bento-grid",
  "badge": "CATEGORY BADGE",
  "headline": "Bold Punchy Headline",
  "subheadline": "Secondary supporting context",
  "html": "<div class='relative w-full h-full overflow-hidden bg-[#090A10] text-white p-10 flex flex-col justify-between rounded-3xl border border-white/10 font-sans'>...</div>",
  "elements": [
    {
      "id": "el-1",
      "type": "stat-block",
      "statValue": "$5.2M",
      "statLabel": "Metric",
      "gridSpan": "col-span-12 md:col-span-4"
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
  tone: 'punchy' | 'executive' | 'data-heavy' | 'shorter'
): Promise<string> {
  const prompt = `Rewrite this text for a top-tier presentation or brochure to be ${tone}. Return ONLY the rewritten text with no quotes, commentary or extra formatting:
"${text}"`;

  const raw = await callClaudeApi(
    prompt,
    'You are an executive copywriter. Output only the rewritten string directly.'
  );
  return raw.trim().replace(/^"(.*)"$/, '$1');
}
