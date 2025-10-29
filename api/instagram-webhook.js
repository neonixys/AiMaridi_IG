export default async function handler(req, res) {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
  const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL;

  try {
    if (req.method === "GET") {
      const { "hub.mode": mode, "hub.verify_token": token, "hub.challenge": challenge } = req.query;
      if (mode === "subscribe" && token === VERIFY_TOKEN) {
        res.status(200).send(challenge);
      } else {
        res.status(403).send("Forbidden");
      }
      return;
    }

    if (req.method === "POST") {
      const body = typeof req.body === "object" ? req.body : JSON.parse(req.body || "{}");
      await fetch(MAKE_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).send("Method Not Allowed");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.toString() });
  }
}
