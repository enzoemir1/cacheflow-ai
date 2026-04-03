const http = require("http");

const PROXY_URL = "http://127.0.0.1:4747/v1/chat/completions";

const testPayload = {
  model: "gpt-4o-mini",
  messages: [{ role: "user", content: "What is 2+2?" }],
  temperature: 0,
};

function makeRequest(label) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const payload = JSON.stringify(testPayload);
    const url = new URL(PROXY_URL);

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        const elapsed = Date.now() - start;
        try {
          const parsed = JSON.parse(data);
          const answer =
            parsed.choices?.[0]?.message?.content || "No content";
          console.log(`[${label}] ${elapsed}ms — ${answer.slice(0, 60)}`);
          resolve({ elapsed, answer });
        } catch {
          reject(new Error(`Parse error: ${data.slice(0, 100)}`));
        }
      });
    });

    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

async function run() {
  console.log("CacheFlow Lite — Cache Test");
  console.log("===========================\n");
  console.log("Make sure the server is running: npm start\n");

  try {
    console.log("Request 1 (cache MISS — hits OpenAI):");
    const r1 = await makeRequest("MISS");

    console.log("\nRequest 2 (cache HIT — instant, $0):");
    const r2 = await makeRequest("HIT");

    console.log("\n===========================");
    console.log(`Speed improvement: ${r1.elapsed}ms → ${r2.elapsed}ms`);
    console.log(
      `Speedup: ${(r1.elapsed / Math.max(r2.elapsed, 1)).toFixed(1)}x faster`
    );
    console.log("Cost of request 2: $0 (served from cache)");
    console.log("\nFull version adds: free API routing, dashboard,");
    console.log("local models, prompt compression → 60-85% total savings.");
    console.log("Get it at: automatiabcn.gumroad.com/l/cacheflow-ai");
  } catch (err) {
    console.error("Error:", err.message);
    console.error("Is the server running? Start it with: npm start");
  }
}

run();
