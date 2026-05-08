// Vercel serverless function — proxies an Instagram handle's public profile picture.
// Caches the result on Vercel's edge for 7 days so we don't hammer Instagram.

export default async function handler(req, res) {
  const handle = (req.query.handle || "").toString().trim();
  if (!handle || !/^[\w.]+$/.test(handle)) {
    return res.status(400).json({ error: "handle required" });
  }

  try {
    // Fetch the public IG profile page
    const igRes = await fetch(`https://www.instagram.com/${handle}/`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!igRes.ok) throw new Error(`IG status ${igRes.status}`);
    const html = await igRes.text();

    // Extract og:image (full-size profile picture URL)
    const m =
      html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
      html.match(/"profile_pic_url_hd"\s*:\s*"([^"]+)"/) ||
      html.match(/"profile_pic_url"\s*:\s*"([^"]+)"/);
    if (!m) throw new Error("no og:image");
    const imgUrl = m[1].replace(/\\u0026/g, "&").replace(/&amp;/g, "&");

    // Fetch the actual image bytes
    const imgRes = await fetch(imgUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    if (!imgRes.ok) throw new Error(`img status ${imgRes.status}`);

    const buf = Buffer.from(await imgRes.arrayBuffer());
    res.setHeader("Content-Type", imgRes.headers.get("content-type") || "image/jpeg");
    res.setHeader("Cache-Control", "public, s-maxage=604800, stale-while-revalidate=86400");
    res.status(200).send(buf);
  } catch (err) {
    res.setHeader("Cache-Control", "public, s-maxage=300");
    res.status(404).json({ error: String(err?.message || err) });
  }
}
