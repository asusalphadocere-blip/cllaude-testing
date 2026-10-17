const KEY = "brecha-di-texts";
const seed = require("../content.json");
const env = process.env;
const useRedis = () => env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN;
const useGit = () => env.GITHUB_TOKEN && env.GITHUB_REPO;
const branch = () => env.GITHUB_BRANCH || "main";

async function redis(cmd) {
  const r = await fetch(env.UPSTASH_REDIS_REST_URL, {
    method: "POST",
    headers: { Authorization: "Bearer " + env.UPSTASH_REDIS_REST_TOKEN },
    body: JSON.stringify(cmd),
  });
  const j = await r.json();
  if (!r.ok || j.error) throw new Error(j.error || "redis");
  return j.result;
}

const gh = (q, opt = {}) =>
  fetch(`https://api.github.com/repos/${env.GITHUB_REPO}/contents/content.json${q}`, {
    ...opt,
    headers: { Authorization: "Bearer " + env.GITHUB_TOKEN, Accept: "application/vnd.github+json", "User-Agent": "brecha-di" },
  });

async function load() {
  if (useRedis()) {
    const v = await redis(["GET", KEY]);
    return v ? JSON.parse(v) : {};
  }
  if (useGit()) {
    const r = await gh("?ref=" + branch());
    if (r.status === 404) return {};
    if (!r.ok) throw new Error("github");
    const j = await r.json();
    return JSON.parse(Buffer.from(j.content, "base64").toString("utf8")).texts || {};
  }
  return seed.texts || {};
}

async function save(texts) {
  if (useRedis()) return void (await redis(["SET", KEY, JSON.stringify(texts)]));
  const g = await gh("?ref=" + branch());
  let sha;
  if (g.ok) sha = (await g.json()).sha;
  else if (g.status !== 404) throw new Error("github");
  const body = {
    message: "content: actualizar textos desde la página",
    content: Buffer.from(JSON.stringify({ texts }, null, 2) + "\n").toString("base64"),
    branch: branch(),
  };
  if (sha) body.sha = sha;
  const p = await gh("", { method: "PUT", body: JSON.stringify(body) });
  if (!p.ok) throw new Error("github");
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  try {
    if (req.method === "GET") return res.status(200).json({ texts: await load() });
    if (req.method === "POST") {
      if (!env.EDIT_PASSWORD || !(useRedis() || useGit())) return res.status(503).json({ error: "not_configured" });
      const b = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
      if (String(b.password || "").trim() !== env.EDIT_PASSWORD) return res.status(401).json({ error: "password" });
      if (b.check) return res.status(200).json({ ok: true });
      const clean = {};
      for (const [k, v] of Object.entries(b.texts || {})) {
        if (/^t\d+$/.test(k) && typeof v === "string") clean[k] = v.slice(0, 600);
      }
      await save(clean);
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: "method" });
  } catch (e) {
    return res.status(500).json({ error: "server" });
  }
};
