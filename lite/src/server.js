const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// ─── Config ──────────────────────────────────────────────
const PORT = process.env.CACHEFLOW_PORT || 4747;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const CACHE_DIR = path.join(__dirname, "..", ".cache");
const STATS_FILE = path.join(__dirname, "..", ".stats.json");

if (!OPENAI_API_KEY) {
  console.error("Error: OPENAI_API_KEY environment variable is required.");
  console.error("Usage: OPENAI_API_KEY=sk-... npm start");
  process.exit(1);
}

// ─── Cache Layer ─────────────────────────────────────────
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

// Hash the WHOLE request (minus `stream`, which is handled separately and never
// cached) so that any parameter affecting the output — max_tokens, top_p, stop,
// frequency_penalty, response_format, tools, … — produces a distinct key. The
// previous version keyed only on model+messages+temperature, so two requests
// that differed solely in max_tokens collided and the second got the first
// request's (wrong) response served from cache.
function getCacheKey(body) {
  const { stream, ...rest } = body;
  return crypto.createHash("sha256").update(JSON.stringify(rest)).digest("hex");
}

// USD price per 1M tokens [input, output]. Used to report HONEST savings from
// the cached response's own usage block instead of a flat guess.
const MODEL_PRICES = {
  "gpt-4o-mini": [0.15, 0.6],
  "gpt-4o": [2.5, 10.0],
  "gpt-4.1": [2.0, 8.0],
  "gpt-4.1-mini": [0.4, 1.6],
  "gpt-4-turbo": [10.0, 30.0],
  "gpt-3.5-turbo": [0.5, 1.5],
};

function estimateSavedCost(model, usage) {
  if (!usage) return 0;
  const [pIn, pOut] = MODEL_PRICES[model] || MODEL_PRICES["gpt-4o-mini"];
  const inTok = usage.prompt_tokens || 0;
  const outTok = usage.completion_tokens || 0;
  return (inTok * pIn + outTok * pOut) / 1_000_000;
}

function getFromCache(hash) {
  const file = path.join(CACHE_DIR, `${hash}.json`);
  if (fs.existsSync(file)) {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  }
  return null;
}

function saveToCache(hash, data) {
  const file = path.join(CACHE_DIR, `${hash}.json`);
  // Atomic write so a concurrent reader never sees a half-written cache entry.
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data), "utf8");
  fs.renameSync(tmp, file);
}

// ─── Stats Tracker ───────────────────────────────────────
function loadStats() {
  if (fs.existsSync(STATS_FILE)) {
    return JSON.parse(fs.readFileSync(STATS_FILE, "utf8"));
  }
  return { totalRequests: 0, cacheHits: 0, cacheMisses: 0, estimatedSaved: 0 };
}

function saveStats(stats) {
  const tmp = `${STATS_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(stats, null, 2), "utf8");
  fs.renameSync(tmp, STATS_FILE);
}

// ─── Proxy to OpenAI ─────────────────────────────────────
function proxyToOpenAI(body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const options = {
      hostname: "api.openai.com",
      path: "/v1/chat/completions",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Length": Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          reject(new Error(`OpenAI response parse error: ${data.slice(0, 200)}`));
        }
      });
    });

    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

// ─── HTTP Server ─────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  // Health check
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    const stats = loadStats();
    res.end(JSON.stringify({ status: "ok", ...stats }));
    return;
  }

  // Stats endpoint
  if (req.method === "GET" && req.url === "/stats") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(loadStats(), null, 2));
    return;
  }

  // Only handle POST /v1/chat/completions
  if (req.method !== "POST" || !req.url.startsWith("/v1/chat/completions")) {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found. Use POST /v1/chat/completions" }));
    return;
  }

  // Read request body (capped to guard against runaway / malicious payloads)
  const MAX_BODY_BYTES = 5 * 1024 * 1024; // 5 MiB — generous for chat payloads
  let body = "";
  let aborted = false;
  req.on("data", (chunk) => {
    if (aborted) return;
    body += chunk;
    if (Buffer.byteLength(body) > MAX_BODY_BYTES) {
      aborted = true;
      res.writeHead(413, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Request body too large (max 5 MiB)" }));
      req.destroy();
    }
  });
  req.on("end", async () => {
    if (aborted) return;
    const stats = loadStats();
    stats.totalRequests++;

    try {
      const parsed = JSON.parse(body);

      // Basic shape validation — a malformed request should fail fast here
      // rather than producing a junk cache key and a confusing OpenAI error.
      if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.messages)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid request: 'messages' array is required" }));
        return;
      }

      // Skip cache for streaming requests
      if (parsed.stream) {
        const result = await proxyToOpenAI(parsed);
        stats.cacheMisses++;
        saveStats(stats);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result));
        return;
      }

      // Check cache
      const hash = getCacheKey(parsed);
      const cached = getFromCache(hash);

      if (cached) {
        const saved = estimateSavedCost(parsed.model, cached.usage);
        stats.cacheHits++;
        stats.estimatedSaved += saved;
        saveStats(stats);
        console.log(`[CACHE HIT] ${hash.slice(0, 8)} — $0 (saved ~$${saved.toFixed(5)})`);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(cached));
        return;
      }

      // Cache miss — proxy to OpenAI
      const result = await proxyToOpenAI(parsed);
      saveToCache(hash, result);
      stats.cacheMisses++;
      saveStats(stats);
      console.log(`[CACHE MISS] ${hash.slice(0, 8)} — forwarded to OpenAI`);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      console.error(`[ERROR] ${err.message}`);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════╗
║         CacheFlow AI Lite — Running          ║
╠══════════════════════════════════════════════╣
║  Proxy:   http://127.0.0.1:${PORT}/v1          ║
║  Health:  http://127.0.0.1:${PORT}/health       ║
║  Stats:   http://127.0.0.1:${PORT}/stats        ║
╚══════════════════════════════════════════════╝

Point your OpenAI client to http://127.0.0.1:${PORT}/v1
Identical requests will be served from cache at $0.

Full version with free API routing, dashboard, local model
support, and prompt compression: automatiabcn.com
`);
});
