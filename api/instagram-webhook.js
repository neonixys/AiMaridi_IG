mkdir instagram-webhook && cd instagram-webhook
mkdir -p api
cat > api/instagram-webhook.js <<'EOF'
// api/instagram-webhook.js
export default async function handler(req, res) {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
  const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL;

  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      res.status(200).send(challenge);
    } else {
      res.status(403).send("Forbidden");
    }
    return;
  }

  if (req.method === "POST") {
    try {
      const body = typeof req.body === "object" ? req.body : JSON.parse(req.body || "{}");
      const forward = await fetch(MAKE_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const text = await forward.text();
      res.status(200).json({ ok: true, makeStatus: forward.status, makeBody: text });
    } catch (e) {
      res.status(500).json({ ok: false, error: String(e) });
    }
    return;
  }

  res.status(405).send("Method Not Allowed");
}
EOF
