import http from "node:http";
import { verifySignature } from "../src/domain/crypto/signatures";

const PORT = 4000;

console.log("🎣 Starting Relay Mock Webhook Receiver on port", PORT);

const server = http.createServer((req, res) => {
  if (req.method !== "POST") {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  const chunks: Buffer[] = [];
  req.on("data", (chunk) => chunks.push(chunk));
  req.on("end", () => {
    const rawBody = Buffer.concat(chunks).toString("utf-8");
    const signatureHeader = req.headers["relay-signature"] as string;
    const deliveryId = req.headers["relay-delivery-id"] as string;
    const eventId = req.headers["relay-event-id"] as string;
    const attemptNumber = req.headers["relay-attempt-number"] as string;

    console.log("\n---------------------------------------------------------");
    console.log(`📥 [${new Date().toLocaleTimeString()}] Received Webhook Request`);
    console.log(`   Delivery ID:     ${deliveryId}`);
    console.log(`   Event ID:        ${eventId}`);
    console.log(`   Attempt Number:  ${attemptNumber}`);
    console.log(`   Relay-Signature: ${signatureHeader || "(none)"}`);

    try {
      const parsed = JSON.parse(rawBody);
      console.log("   Payload Preview:", JSON.stringify(parsed, null, 2));
    } catch {
      console.log("   Raw Body:", rawBody);
    }

    // Support testing failures via query params or header: e.g. /webhook?fail=1
    const url = new URL(req.url || "", `http://localhost:${PORT}`);
    if (url.searchParams.get("fail") === "1" || url.searchParams.get("status") === "500") {
      console.log("   ⚠️ Simulating HTTP 500 Server Error to test Relay retry engine...");
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Simulated internal server error" }));
      return;
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ received: true, timestamp: Date.now() }));
    console.log("   ✅ Responded HTTP 200 OK");
  });
});

server.listen(PORT, () => {
  console.log(`\n✅ Mock Webhook Destination is ready!`);
  console.log(`👉 Target URL for Relay: http://localhost:${PORT}/webhook`);
  console.log(`👉 To simulate failures/retries: http://localhost:${PORT}/webhook?fail=1\n`);
});
