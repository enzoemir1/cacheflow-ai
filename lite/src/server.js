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

function getCacheKey(body) {
  const key = JSON.stringify({
    model: body.model,
    messages: body.messages,
    temperature: body.temperature,
  });
  return crypto.createHash("sha256").update(key).digest("hex");
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
  fs.writeFileSync(file, JSON.stringify(data), "utf8");
}

// ─── Stats Tracker ───────────────────────────────────────
function loadStats() {
  if (fs.existsSync(STATS_FILE)) {
    return JSON.parse(fs.readFileSync(STATS_FILE, "utf8"));
  }
  return { totalRequests: 0, cacheHits: 0, cacheMisses: 0, estimatedSaved: 0 };
}

function saveStats(stats) {
  fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2), "utf8");
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

  // Read request body
  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", async () => {
    const stats = loadStats();
    stats.totalRequests++;

    try {
      const parsed = JSON.parse(body);

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
        stats.cacheHits++;
        stats.estimatedSaved += 0.003; // ~$0.003 per cached gpt-4o-mini call
        saveStats(stats);
        console.log(`[CACHE HIT] ${hash.slice(0, 8)} — $0 (saved ~$0.003)`);
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
support, and prompt compression: automatiabcn.gumroad.com
`);
});
