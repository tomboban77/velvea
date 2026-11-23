// Downloads each chosen photo at cover size (1600x900) and writes a preview page and credits.
const fs = require("fs");
const picks = JSON.parse(fs.readFileSync("picks.json", "utf8"));
(async () => {
  let html = `<!doctype html><meta charset="utf-8"><title>Guide covers</title><style>body{font:15px system-ui;margin:24px;background:#faf7f2;color:#222}.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:20px}img{width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:4px;display:block}p{margin:6px 0 0}small{color:#666}</style><h1>Guide covers (${picks.length})</h1><div class="g">`;
  let credits = "slug\tfile\tphotographer\tsource\n";
  for (const [slug, id, by, page, alt] of picks) {
    const file = slug + ".jpg";
    const res = await fetch(`https://images.unsplash.com/photo-${id}?w=1600&h=900&fit=crop&q=80&fm=jpg`);
    if (!res.ok) { console.log("FAILED", slug, res.status); continue; }
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(file, buf);
    console.log(file, Math.round(buf.length / 1024) + " KB");
    html += `<div><img src="${file}" alt="${alt}"><p><b>${slug}</b></p><small>${alt}. Photo: ${by}, Unsplash</small></div>`;
    credits += `${slug}\t${file}\t${by}\thttps://unsplash.com/photos/${page}\n`;
  }
  fs.writeFileSync("index.html", html + "</div>");
  fs.writeFileSync("credits.tsv", credits);
})();
