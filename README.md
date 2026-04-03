<p align="center">
  <img src="https://img.shields.io/badge/savings-60--85%25-00FF88?style=for-the-badge&labelColor=0a0b0f" alt="Savings">
  <img src="https://img.shields.io/badge/price-$79%20launch-FFD700?style=for-the-badge&labelColor=0a0b0f" alt="Price">
  <img src="https://img.shields.io/badge/platforms-OpenAI%20%7C%20Claude%20%7C%20Gemini%20%7C%20Cursor-00D9FF?style=for-the-badge&labelColor=0a0b0f" alt="Platforms">
</p>

<h1 align="center">CacheFlow AI</h1>
<h3 align="center">Stop Burning Tokens. Start Saving Money.</h3>

<p align="center">
  <strong>CacheFlow AI</strong> is a local proxy that reduces your AI API costs by <strong>60-85%</strong>.<br>
  Smart caching, free API routing, local model support — all running on your machine.
</p>

<p align="center">
  <a href="https://cacheflow-ai.vercel.app"><strong>Website</strong></a> ·
  <a href="https://automatiabcn.gumroad.com/l/cacheflow-ai"><strong>Buy Now — $79 (Launch Price)</strong></a>
</p>

---

## How It Works

```
Your App / SDK / Cursor / Any Tool
         |
         v
  ┌─────────────────────────────────┐
  │       CacheFlow AI Proxy        │
  │       localhost:4747/v1         │
  │                                 │
  │  1. Cache Check ──── Hit? ──→ Return instantly ($0)
  │       │                         │
  │       │ Miss                    │
  │       v                         │
  │  2. Compress Prompt             │
  │       │                         │
  │       v                         │
  │  3. Smart Router                │
  │       ├── Simple → Local/Free   │
  │       ├── Medium → Free APIs    │
  │       └── Hard   → Paid (last)  │
  │                                 │
  │  4. Track Savings → Dashboard   │
  └─────────────────────────────────┘
```

**One line change in your code. That's it.**

```javascript
// Before — full price
const client = new OpenAI({ apiKey: "sk-..." });

// After — 60-85% cheaper
const client = new OpenAI({
  apiKey: "sk-...",
  baseURL: "http://127.0.0.1:4747/v1"
});
```

---

## Features

| Feature | Description |
|---------|-------------|
| **Smart Caching** | Identical requests return instantly from local SQLite cache at $0 |
| **Free API Routing** | Simple tasks auto-route to Groq, Cerebras, OpenRouter (70B models, $0) |
| **Local Model Support** | Ollama integration — auto-detects GPU, Apple Silicon, CPU |
| **Prompt Compression** | 10-30% token reduction on every request |
| **Real-Time Dashboard** | Dark-themed UI with live savings counter, provider charts, request logs |
| **Universal Compatibility** | OpenAI, Claude, Gemini, Cursor, LangChain — any OpenAI-compatible tool |
| **100% Private** | Runs entirely on your machine. No cloud, no telemetry, no tracking |
| **Auto Setup** | `cacheflow init` detects your hardware, API keys, and free providers |

---

## Supported Providers

**Paid (your existing keys):**
OpenAI (GPT-4o, GPT-4.1, o3/o4) · Anthropic (Claude Sonnet/Opus/Haiku) · Google Gemini

**Free (auto-configured, $0):**
Groq · Cerebras · OpenRouter (27+ free models) · Gemini Free Tier

**Local ($0):**
Ollama (Qwen3, Llama, Mistral, Phi4 — any model)

---

## The Numbers

| Without CacheFlow | With CacheFlow |
|-------------------|----------------|
| $200+/month | **$30-60/month** |
| Every request hits paid API | 80% handled for free |
| No visibility into spending | Real-time savings dashboard |
| $2,400+/year | **Save $1,680-2,040/year** |

**CacheFlow pays for itself in the first week.**

---

## Try the Free Lite Version

Want to test the concept before buying? The `lite/` folder contains a free, working caching proxy:

```bash
cd lite
OPENAI_API_KEY=sk-... npm start
# Proxy running at http://127.0.0.1:4747/v1
```

Lite version caches identical OpenAI requests locally at $0. [See lite/README.md for details.](lite/README.md)

| Feature | Lite (Free) | Full ($79) |
|---------|------------|------------|
| Caching | File-based | SQLite + semantic similarity |
| Free APIs | No | Yes — Groq, Cerebras, OpenRouter |
| Local Models | No | Yes — Ollama auto-detection |
| Dashboard | No | Yes — real-time UI |
| Smart Routing | No | Yes — auto-picks cheapest provider |
| Prompt Compression | No | Yes — 10-30% token reduction |

---

## Quick Start (Full Version)

```bash
# 1. Install
npm install

# 2. Auto-detect and configure
npx cacheflow init

# 3. Start proxy + dashboard
npx cacheflow start

# Dashboard: http://127.0.0.1:4748
# Proxy:     http://127.0.0.1:4747/v1
```

---

## What You Get

- **Full Node.js source code** (38 files)
- **8 AI provider integrations** (OpenAI, Anthropic, Groq, Cerebras, OpenRouter, Gemini, Ollama)
- **Real-time dashboard** with WebSocket updates
- **CLI** with init wizard, start/stop/status/stats/demo commands
- **Auto hardware detection** (GPU, Apple Silicon, CPU)
- **SQLite-based** caching + analytics (zero external dependencies)
- **MIT License** — use it however you want
- **Lifetime updates**

---

## Requirements

- Node.js 18+
- Any OS (macOS, Linux, Windows)
- Optional: Ollama (for local models)
- Optional: Free API keys (Groq, Cerebras — 2 min to get)

---

<p align="center">
  <a href="https://automatiabcn.gumroad.com/l/cacheflow-ai">
    <img src="https://img.shields.io/badge/GET%20CACHEFLOW%20AI-$79%20LAUNCH%20PRICE-00FF88?style=for-the-badge&logoColor=white&labelColor=0a0b0f" alt="Buy Now" height="50">
  </a>
</p>

<p align="center">
  <strong>$79 launch price</strong> · No subscriptions · 30-day money-back guarantee · Price increases after 50 sales
</p>

<p align="center">
  <a href="https://cacheflow-ai.vercel.app">View Landing Page</a>
</p>

---

<p align="center">
  <sub>Made by <a href="https://automatiabcn.com">AutomatiaBCN</a></sub>
</p>
