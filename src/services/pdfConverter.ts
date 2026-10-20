import * as pdfjsLib from 'pdfjs-dist';
import { DesignDocument, SlidePage, DesignElement, DocumentType, AspectRatio } from '../types/design';
import { getStoredApiKey, getStoredModel, sanitizeModel } from './claude';

// Configure PDF.js worker using CDN fallback or dynamic worker
try {
  if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    // pdfjs-dist 4.x/5.x/6.x worker CDN
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
  }
} catch (e) {
  console.warn('PDF.js worker initialization notice:', e);
}

export interface ExtractedPageData {
  pageNumber: number;
  text: string;
  lines: Array<{
    text: string;
    fontSize: number;
    y: number;
    x: number;
  }>;
}

export interface PdfConversionProgress {
  stage: 'reading' | 'extracting' | 'structuring' | 'complete' | 'error';
  percent: number;
  message: string;
  pageCount?: number;
}

/**
 * Step 1: Extract text and geometric text metrics from an uploaded PDF file
 */
export async function extractPdfContent(
  file: File,
  onProgress?: (progress: PdfConversionProgress) => void
): Promise<ExtractedPageData[]> {
  onProgress?.({
    stage: 'reading',
    percent: 10,
    message: `Reading "${file.name}" into memory...`,
  });

  const arrayBuffer = await file.arrayBuffer();

  onProgress?.({
    stage: 'extracting',
    percent: 25,
    message: 'Loading PDF document structure...',
  });

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    useSystemFonts: true,
  });

  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;
  const extractedPages: ExtractedPageData[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const percent = 25 + Math.round((pageNum / numPages) * 35);
    onProgress?.({
      stage: 'extracting',
      percent,
      message: `Extracting page ${pageNum} of ${numPages}...`,
      pageCount: numPages,
    });

    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();

    // Group items by line based on Y-coordinate clustering
    const rawItems: Array<{ text: string; fontSize: number; x: number; y: number }> = [];

    for (const item of textContent.items as any[]) {
      if (!item.str || !item.str.trim()) continue;
      const tx = item.transform; // [scaleX, skewY, skewX, scaleY, transX, transY]
      const fontSize = Math.abs(tx[0] || tx[3] || 12);
      const x = tx[4] || 0;
      const y = tx[5] || 0;

      rawItems.push({
        text: item.str,
        fontSize: Math.round(fontSize),
        x: Math.round(x),
        y: Math.round(y),
      });
    }

    // Sort items top-to-bottom (higher Y in PDF is top of page), then left-to-right
    rawItems.sort((a, b) => {
      const yDiff = b.y - a.y;
      if (Math.abs(yDiff) > 6) return yDiff;
      return a.x - b.x;
    });

    // Group items into lines
    const clusteredLines: Array<{ text: string; fontSize: number; y: number; x: number }> = [];
    let currentLine: { text: string; fontSize: number; y: number; x: number } | null = null;

    for (const item of rawItems) {
      if (!currentLine) {
        currentLine = { ...item };
      } else if (Math.abs(currentLine.y - item.y) <= 6) {
        currentLine.text += (currentLine.text.endsWith(' ') ? '' : ' ') + item.text;
        currentLine.fontSize = Math.max(currentLine.fontSize, item.fontSize);
      } else {
        clusteredLines.push(currentLine);
        currentLine = { ...item };
      }
    }
    if (currentLine) {
      clusteredLines.push(currentLine);
    }

    const fullPageText = clusteredLines.map((l) => l.text.trim()).filter(Boolean).join('\n');

    extractedPages.push({
      pageNumber: pageNum,
      text: fullPageText,
      lines: clusteredLines,
    });
  }

  return extractedPages;
}

/**
 * Step 2: Algorithmic Heuristic Parser
 * Converts extracted raw lines and text into a structured SlidePage with 100% editable elements
 */
export function buildSlideFromExtractedPage(
  pageData: ExtractedPageData,
  totalDeckPages: number
): SlidePage {
  const lines = pageData.lines.map((l) => l.text.trim()).filter((t) => t.length > 0);
  const slideId = `slide-pdf-${pageData.pageNumber}-${Date.now()}`;

  if (lines.length === 0) {
    return {
      id: slideId,
      title: `Page ${pageData.pageNumber}`,
      category: 'content',
      layout: 'hero',
      badge: `PAGE ${pageData.pageNumber}`,
      headline: `Page ${pageData.pageNumber}`,
      subheadline: 'Scanned document page with minimal extractable text.',
      elements: [
        {
          id: `el-${Date.now()}-1`,
          type: 'paragraph',
          content: 'This page had no text layers or consists primarily of graphical imagery.',
          gridSpan: 'col-span-12',
        },
      ],
    };
  }

  // 1. Identify Headline & Subheadline
  let headline = lines[0] || `Page ${pageData.pageNumber}`;
  let subheadline: string | undefined = undefined;
  let remainingLines = lines.slice(1);

  // If headline is short and second line exists, check if second line is a subtitle
  if (remainingLines.length > 0 && remainingLines[0].length < 160 && !isStatOrMetric(remainingLines[0])) {
    subheadline = remainingLines[0];
    remainingLines = remainingLines.slice(1);
  }

  // Determine slide category
  let category: SlidePage['category'] = 'content';
  const lowerHeadline = headline.toLowerCase();
  if (pageData.pageNumber === 1 || lowerHeadline.includes('welcome') || lowerHeadline.includes('pitch')) {
    category = 'title';
  } else if (lowerHeadline.includes('problem') || lowerHeadline.includes('challenge') || lowerHeadline.includes('pain')) {
    category = 'problem';
  } else if (lowerHeadline.includes('solution') || lowerHeadline.includes('product') || lowerHeadline.includes('platform')) {
    category = 'solution';
  } else if (lowerHeadline.includes('market') || lowerHeadline.includes('tam') || lowerHeadline.includes('industry')) {
    category = 'market';
  } else if (lowerHeadline.includes('traction') || lowerHeadline.includes('metric') || lowerHeadline.includes('growth')) {
    category = 'traction';
  } else if (lowerHeadline.includes('team') || lowerHeadline.includes('founder') || lowerHeadline.includes('advisors')) {
    category = 'team';
  } else if (lowerHeadline.includes('financial') || lowerHeadline.includes('revenue') || lowerHeadline.includes('projection')) {
    category = 'financials';
  } else if (pageData.pageNumber === totalDeckPages || lowerHeadline.includes('thank') || lowerHeadline.includes('contact')) {
    category = 'closing';
  }

  const elements: DesignElement[] = [];

  // 2. Extract Metrics / Stat Blocks
  const statIndices: number[] = [];
  remainingLines.forEach((line, idx) => {
    const metricMatch = extractMetric(line);
    if (metricMatch) {
      statIndices.push(idx);
      elements.push({
        id: `el-stat-${pageData.pageNumber}-${elements.length + 1}`,
        type: 'stat-block',
        statValue: metricMatch.value,
        statLabel: metricMatch.label || 'Key Performance Metric',
        statChange: metricMatch.change || 'Document Metric',
        gridSpan: 'col-span-12 md:col-span-4',
      });
    }
  });

  // Filter out lines consumed by stat blocks
  const nonStatLines = remainingLines.filter((_, idx) => !statIndices.includes(idx));

  // 3. Extract Bullet Lists
  const bulletItems: string[] = [];
  const narrativeLines: string[] = [];

  nonStatLines.forEach((line) => {
    const isBullet = /^([•\-\*■]|\d+[\.\)])\s+/.test(line);
    if (isBullet) {
      bulletItems.push(line.replace(/^([•\-\*■]|\d+[\.\)])\s+/, ''));
    } else {
      narrativeLines.push(line);
    }
  });

  if (bulletItems.length > 0) {
    elements.push({
      id: `el-bullet-${pageData.pageNumber}-${elements.length + 1}`,
      type: 'bullet-list',
      title: 'Key Takeaways & Points',
      items: bulletItems,
      gridSpan: elements.length > 0 ? 'col-span-12 md:col-span-6' : 'col-span-12',
    });
  }

  // 4. Group Narrative Lines into Feature Cards or Paragraphs
  if (narrativeLines.length > 0) {
    // If lines look like paragraphs or blocks
    const chunks: string[] = [];
    let currentChunk = '';

    for (const line of narrativeLines) {
      if (currentChunk.length + line.length > 250) {
        chunks.push(currentChunk);
        currentChunk = line;
      } else {
        currentChunk = currentChunk ? `${currentChunk} ${line}` : line;
      }
    }
    if (currentChunk) chunks.push(currentChunk);

    chunks.forEach((chunk, idx) => {
      const isFeature = chunk.length < 180 && idx < 4;
      if (isFeature) {
        const words = chunk.split(' ');
        const cardTitle = words.slice(0, 4).join(' ');
        const cardBody = words.slice(4).join(' ') || chunk;
        elements.push({
          id: `el-card-${pageData.pageNumber}-${elements.length + 1}`,
          type: 'feature-card',
          title: cardTitle,
          content: cardBody,
          tag: `POINT 0${idx + 1}`,
          gridSpan: chunks.length === 1 ? 'col-span-12' : chunks.length === 2 ? 'col-span-12 md:col-span-6' : 'col-span-12 md:col-span-4',
        });
      } else {
        elements.push({
          id: `el-para-${pageData.pageNumber}-${elements.length + 1}`,
          type: 'paragraph',
          content: chunk,
          gridSpan: 'col-span-12',
        });
      }
    });
  }

  // Ensure at least 1 element exists
  if (elements.length === 0) {
    elements.push({
      id: `el-default-${pageData.pageNumber}`,
      type: 'feature-card',
      title: headline,
      content: subheadline || 'Click here to edit and refine this section in Prearn.',
      gridSpan: 'col-span-12',
    });
  }

  // Layout assignment based on elements
  let layout: SlidePage['layout'] = 'hero';
  if (elements.filter((e) => e.type === 'stat-block').length >= 2) {
    layout = 'split-stat';
  } else if (elements.length >= 3) {
    layout = 'three-column';
  } else if (elements.length === 2) {
    layout = 'two-column';
  }

  return {
    id: slideId,
    title: headline.slice(0, 40) || `Page ${pageData.pageNumber}`,
    category,
    layout,
    badge: category.toUpperCase(),
    headline,
    subheadline,
    elements,
  };
}

/**
 * Step 3: AI Synthesis via Claude (Optional High-Fidelity Elevation)
 */
async function elevatePagesWithClaude(
  extractedPages: ExtractedPageData[],
  onProgress?: (progress: PdfConversionProgress) => void
): Promise<SlidePage[] | null> {
  const apiKey = getStoredApiKey();
  if (!apiKey) return null;

  try {
    onProgress?.({
      stage: 'structuring',
      percent: 75,
      message: 'Claude 5.5 is structuring elements and editorial hierarchy...',
      pageCount: extractedPages.length,
    });

    const activeModel = sanitizeModel(getStoredModel());

    const pageSummaries = extractedPages.map((p) => ({
      page: p.pageNumber,
      text: p.text.slice(0, 2000),
    }));

    const systemPrompt = `You are an elite presentation architect. You transform raw extracted text from PDF pages into an ultra-premium, interactive slide deck where EVERY element is editable.
Output ONLY a valid JSON array of SlidePage objects conforming to this TypeScript definition:
interface DesignElement {
  id: string;
  type: 'heading' | 'subheading' | 'paragraph' | 'stat-block' | 'feature-card' | 'bullet-list' | 'cta-button';
  title?: string;
  subtitle?: string;
  content?: string;
  statValue?: string;
  statLabel?: string;
  statChange?: string;
  items?: string[];
  tag?: string;
  gridSpan?: string; // e.g. "col-span-12 md:col-span-4" or "col-span-12 md:col-span-6"
}
interface SlidePage {
  id: string;
  title: string;
  category: 'title' | 'problem' | 'solution' | 'market' | 'product' | 'traction' | 'team' | 'financials' | 'closing' | 'content';
  layout: 'hero' | 'two-column' | 'three-column' | 'bento-grid' | 'split-stat' | 'timeline';
  badge: string;
  headline: string;
  subheadline?: string;
  elements: DesignElement[];
}

Return strictly valid JSON array: [ { ... }, { ... } ]. No markdown fences, no explanatory text.`;

    const userPrompt = `Here is the extracted text from ${extractedPages.length} PDF pages. Convert each page into a structured, editable SlidePage:
${JSON.stringify(pageSummaries, null, 2)}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: activeModel,
        max_tokens: 8192,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!response.ok) {
      console.warn(`Claude PDF synthesis returned status ${response.status}. Using heuristic parser.`);
      return null;
    }

    const data = await response.json();
    const contentText = data.content?.[0]?.text;
    if (!contentText) return null;

    const cleaned = contentText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(cleaned);

    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((slide: any, idx: number) => ({
        ...slide,
        id: slide.id || `slide-pdf-${idx + 1}-${Date.now()}`,
        elements: (slide.elements || []).map((el: any, elIdx: number) => ({
          ...el,
          id: el.id || `el-pdf-${idx + 1}-${elIdx + 1}`,
        })),
      }));
    }
  } catch (err) {
    console.warn('Claude PDF elevation fallback to local heuristic engine:', err);
  }

  return null;
}

/**
 * Main Entry Point: Convert an uploaded PDF file into a complete editable DesignDocument
 */
export async function convertPdfToPresentation(
  file: File,
  onProgress?: (progress: PdfConversionProgress) => void
): Promise<DesignDocument> {
  const extractedPages = await extractPdfContent(file, onProgress);

  if (extractedPages.length === 0) {
    throw new Error('No readable text or pages could be extracted from this PDF.');
  }

  onProgress?.({
    stage: 'structuring',
    percent: 65,
    message: 'Converting pages into editable presentation cards...',
    pageCount: extractedPages.length,
  });

  // Try Claude AI elevation first if key is present
  let slides = await elevatePagesWithClaude(extractedPages, onProgress);

  // Fallback to high-performance local heuristic parser
  if (!slides || slides.length === 0) {
    slides = extractedPages.map((pageData) =>
      buildSlideFromExtractedPage(pageData, extractedPages.length)
    );
  }

  const cleanDocTitle = file.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');

  const doc: DesignDocument = {
    id: `pdf-deck-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: cleanDocTitle.charAt(0).toUpperCase() + cleanDocTitle.slice(1),
    subtitle: `Imported from ${file.name} • ${slides.length} Editable Cards`,
    type: 'pitch-deck',
    aspectRatio: '16:9',
    themeId: 'gamma-cosmic',
    fontFamily: 'sans',
    slides,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  onProgress?.({
    stage: 'complete',
    percent: 100,
    message: `Successfully created ${slides.length} editable cards!`,
    pageCount: slides.length,
  });

  return doc;
}

// Helpers
function isStatOrMetric(text: string): boolean {
  return /^\$?[\d,.]+[kKmMbBtT%xX+]?$/.test(text.trim());
}

function extractMetric(text: string): { value: string; label?: string; change?: string } | null {
  // Matches "$14.2B", "10x", "85%", "+45% YoY", "2.4M active users"
  const match = text.match(/(\+?\$?[\d,.]+[kKmMbBtT%xX+]?)\s*(.*)/);
  if (!match) return null;

  const value = match[1];
  const rest = match[2]?.trim();

  // If value is just a single number like 1 or 2 (could be bullet item), ignore
  if (/^\d{1,2}$/.test(value) && !text.includes('%') && !text.includes('$')) {
    return null;
  }

  return {
    value,
    label: rest || 'Metric',
    change: text.includes('YoY') || text.includes('MoM') ? 'Growth benchmark' : undefined,
  };
}
