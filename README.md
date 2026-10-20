# Prearn Design ✦
> **Ultra-Premium Claude Design & Gamma AI Clone**
> The state-of-the-art AI design studio for creating venture pitch decks, luxury corporate brochures, and multi-format collateral using Anthropic Claude models.

[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel)](https://vercel.com)
[![GitHub](https://img.shields.io/badge/GitHub-MokshJindal%2Fprearn--design-blue?logo=github)](https://github.com/MokshJindal/prearn-design)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS%203.4-38bdf8?logo=tailwind-css)](https://tailwindcss.com)
[![React](https://img.shields.io/badge/React-18-61dafb?logo=react)](https://react.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6?logo=typescript)](https://www.typescriptlang.org)

---

## ✨ Features

- **✦ Multi-Model Anthropic Intelligence**:
  - **Claude Sonnet 5.5**: Flagship visual architect, elite layouts, typography, and Bento grids.
  - **Claude Opus 5.5**: Supreme strategic storytelling, executive whitepapers, and market sizing.
  - **Claude Fable 5.1**: Creative narrative, high-conversion copy, and luxury branding.
  - **Claude Haiku 5.5**: Ultra-fast single-card rewrites and rapid card ideation.
  - **Claude Sonnet 4.5 & Opus 4.5**: Battle-tested production models.

- **✦ Gamma AI-Inspired Card Engine**:
  - Cosmic dark canvas with ambient gradients, glassmorphism cards, and glow accents.
  - Generates bespoke responsive Tailwind CSS + inline SVGs for every slide.
  - Real-time `contentEditable` in-place text editing for instant copy tweaks without burning API tokens.

- **✦ Authentic 3-Panel Luxury Tri-Fold Brochure**:
  - Panoramic physical spread with real 3-panel editorial fold lines.
  - Cover hero panel, numbered capabilities (01, 02, 03), service deliverables checklist, social proof metrics, and executive contact panel.

- **✦ Full Dashboard & Project Management**:
  - Modern dashboard with "Generate with AI", "Paste Text", and "Blank Canvas" cards.
  - Format filters (Pitch Decks, Brochures, One-Pagers, Flyers), search bar, and live thumbnails.
  - In-place project renaming, 1-click project duplication, and deletion with confirmation modal.
  - Multi-stage JSON auto-repair parser recovering truncated or streaming responses.

- **✦ Presentation & Export Suite**:
  - **Fullscreen Presentation Mode**: Investor pitch mode with arrow key navigation and interactive laser pointer (`L`).
  - **PDF & Retina PNG Export**: High-res multi-page export.
  - **Full Project JSON Import/Export**: Backup and migration.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Anthropic Claude API Key (`sk-ant-...`)

### Installation

```bash
git clone https://github.com/MokshJindal/prearn-design.git
cd prearn-design
npm install
```

### Configuration

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
And add your Anthropic Claude API key:
```env
VITE_ANTHROPIC_API_KEY=sk-ant-your-key-here
```
*(Alternatively, enter your key directly inside the app's Settings modal — it is stored securely in your browser's `localStorage`)*.

### Development

```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
npm run build
npm run preview
```

---

## 🌐 Deployment

### Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

Configure `VITE_ANTHROPIC_API_KEY` in Vercel's Project Settings > Environment Variables.

---

## 🔒 Security

API keys entered in the application interface are stored only in your browser's `localStorage` and sent directly to Anthropic's secure endpoints with `anthropic-dangerous-direct-browser-access: true`. No keys are ever stored on any third-party database.

---

## 📄 License

MIT © [Moksh Jindal](https://github.com/MokshJindal)
