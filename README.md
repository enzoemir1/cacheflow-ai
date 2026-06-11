<p align="center">
  <img src="https://img.shields.io/badge/savings-60--85%25-00FF88?style=for-the-badge&labelColor=0a0b0f" alt="Savings">
  <img src="https://img.shields.io/badge/lite-free%20%26%20open%20source-00D9FF?style=for-the-badge&labelColor=0a0b0f" alt="Lite is free">
  <img src="https://img.shields.io/badge/platforms-OpenAI%20%7C%20Claude%20%7C%20Gemini%20%7C%20Cursor-00D9FF?style=for-the-badge&labelColor=0a0b0f" alt="Platforms">
</p>

<h1 align="center">CacheFlow AI</h1>
<h3 align="center">Stop Burning Tokens. Start Saving Money.</h3>

<p align="center">
  <strong>CacheFlow AI</strong> is a local proxy that reduces your AI API costs by <strong>60-85%</strong>.<br>
  Smart caching, free API routing, local model support — all running on your machine.
</p>

<p align="center">
  <a href="https://cacheflow-ai.vercel.app"><strong>Website</strong></a>
</p>

---

## Quick Start — Free Lite Version

The `lite/` folder in this repo is a **free, open-source, working** caching proxy. It sits between your app and OpenAI and serves identical requests from local cache at $0. No build step, zero dependencies — just Node.js 18+.

```bash
# 1. Clone and enter the lite folder
git clone https://github.com/enzoemir1/cacheflow-ai.git
cd cacheflow-ai/lite

# 2. Start the proxy (runs lite/src/server.js)
OPENAI_API_KEY=sk-... npm start
# Proxy:  http://127.0.0.1:4747/v1
# Health: http://127.0.0.1:4747/health
# Stats:  http://127.0.0.1:4747/stats
```

Then point any OpenAI-compatible client at the proxy — **one line change**:

```javascript
// Before — full price
const client = new OpenAI({ apiKey: "sk-..." });

// After — identical requests cached at $0
const client = new OpenAI({
  apiKey: "sk-...",
  baseURL: "http://127.0.0.1:4747/v1"
});
```

Want to see it in action? Run the included test (sends the same request twice — first hits OpenAI, second returns from cache at $0):

```bash
# In another terminal, with the proxy running:
npm test
```

Full details: **[lite/README.md](lite/README.md)**

### What the Lite version does

- Caches identical OpenAI requests locally (file-based)
- Returns cached responses instantly at $0
- Tracks cache hit rate and estimated savings
- Zero dependencies — just Node.js

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

> Cache check is available in the free Lite version. Prompt compression, smart routing, and the dashboard are part of the full version (see below).

---

## Lite vs Full

| Feature | Lite (Free, this repo) | Full (paid) |
|---------|------------------------|-------------|
| Caching | File-based | SQLite + semantic similarity |
| Free API Routing | No | Yes — Groq, Cerebras, OpenRouter ($0) |
| Local Models | No | Yes — Ollama auto-detection |
| Prompt Compression | No | Yes — 10-30% token reduction |
| Dashboard | No | Yes — real-time UI with charts |
| Smart Routing | No | Yes — auto-picks cheapest provider |
| Providers | OpenAI only | 8 providers |
| CLI | No | Yes — init, start, stop, stats, demo |

---

## Supported Providers (Full Version)

**Paid (your existing keys):**
OpenAI (GPT-4o, GPT-4.1, o3/o4) · Anthropic (Claude Sonnet/Opus/Haiku) · Google Gemini

**Free (auto-configured, $0):**
Groq · Cerebras · OpenRouter (27+ free models) · Gemini Free Tier

**Local ($0):**
Ollama (Qwen3, Llama, Mistral, Phi4 — any model)

---

## Requirements

- Node.js 18+
- Any OS (macOS, Linux, Windows)
- Optional: Ollama (for local models)
- Optional: Free API keys (Groq, Cerebras — 2 min to get)

---

## Full Version (Paid Product)

The full version adds free API routing across 8 providers, local model support, prompt compression, smart routing, and a real-time dashboard — for **60-85% total savings**.

| Without CacheFlow | With CacheFlow (Full) |
|-------------------|------------------------|
| $200+/month | **$30-60/month** |
| Every request hits paid API | 80% handled for free |
| No visibility into spending | Real-time savings dashboard |
| $2,400+/year | **Save $1,680-2,040/year** |

**What you get:** full Node.js source, 8 provider integrations, real-time dashboard with WebSocket updates, CLI (init/start/stop/status/stats/demo), auto hardware detection, SQLite caching + analytics, MIT License, lifetime updates.

<p align="center">
  <a href="https://automatiabcn.com"><strong>Get the full version → automatiabcn.com</strong></a>
</p>

---

<p align="center">
  <sub>Made by <a href="https://automatiabcn.com">Automatia BCN</a></sub>
</p>
