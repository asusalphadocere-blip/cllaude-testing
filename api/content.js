const KEY = "brecha-di-texts";

async function redis(cmd) {
  const r = await fetch(process.env.UPSTASH_REDIS_REST_URL, {
    method: "POST",
    headers: { Authorization: "Bearer " + process.env.UPSTASH_REDIS_REST_TOKEN },
    body: JSON.stringify(cmd),
  });
  const j = await r.json();
  if (!r.ok || j.error) throw new Error(j.error || "redis");
  return j.result;
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  try {
    if (req.method === "GET") {
      const v = await redis(["GET", KEY]);
      return res.status(200).json({ texts: v ? JSON.parse(v) : {} });
    }
    if (req.method === "POST") {
      const b = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
      const pw = process.env.EDIT_PASSWORD;
      if (!pw || String(b.password || "").trim() !== pw) return res.status(401).json({ error: "password" });
      if (b.check) return res.status(200).json({ ok: true });
      const clean = {};
      for (const [k, v] of Object.entries(b.texts || {})) {
        if (/^t\d+$/.test(k) && typeof v === "string") clean[k] = v.slice(0, 600);
      }
      await redis(["SET", KEY, JSON.stringify(clean)]);
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: "method" });
  } catch (e) {
    return res.status(500).json({ error: "server" });
  }
};
