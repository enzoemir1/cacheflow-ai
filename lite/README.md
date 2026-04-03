# CacheFlow Lite — Free Caching Proxy for OpenAI

A simple, zero-dependency caching proxy that sits between your app and OpenAI. Identical requests are served from local cache at $0.

## Quick Start

```bash
cd lite
OPENAI_API_KEY=sk-... npm start
```

Then point your OpenAI client to the proxy:

```javascript
const { OpenAI } = require("openai");

const client = new OpenAI({
  apiKey: "sk-...",
  baseURL: "http://127.0.0.1:4747/v1",
});

// Every identical request after the first one is FREE
const response = await client.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{ role: "user", content: "What is 2+2?" }],
  temperature: 0,
});
```

## Test It

```bash
# In one terminal:
OPENAI_API_KEY=sk-... npm start

# In another terminal:
npm test
```

The test sends the same request twice. First call hits OpenAI (~500ms). Second call returns from cache (~1ms). Same answer, $0 cost.

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/chat/completions` | POST | OpenAI-compatible proxy with caching |
| `/health` | GET | Server status + cache stats |
| `/stats` | GET | Detailed statistics |

## What This Lite Version Does

- Caches identical OpenAI requests locally (file-based)
- Returns cached responses instantly at $0
- Tracks cache hit rate and estimated savings
- Zero dependencies — just Node.js

## What the Full Version Adds

| Feature | Lite (Free) | Full ($79) |
|---------|------------|------------|
| Caching | File-based | SQLite + semantic similarity |
| Free APIs | No | Yes — Groq, Cerebras, OpenRouter ($0) |
| Local Models | No | Yes — Ollama auto-detection |
| Prompt Compression | No | Yes — 10-30% token reduction |
| Dashboard | No | Yes — real-time UI with charts |
| Smart Routing | No | Yes — auto-picks cheapest provider |
| Providers | OpenAI only | 8 providers |
| CLI | No | Yes — init, start, stop, stats, demo |

**Full version:** [automatiabcn.gumroad.com/l/cacheflow-ai](https://automatiabcn.gumroad.com/l/cacheflow-ai)
