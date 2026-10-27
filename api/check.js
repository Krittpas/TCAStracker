// ดึงหน้าประกาศทางการ แล้วเทียบวันที่ที่เคยบันทึกไว้ (ไม่ต้องใช้ฐานข้อมูล)
const data = require("../data/programs.json");
const norm = s => s.replace(/[\u0e50-\u0e59]/g, c => c.charCodeAt(0) - 0xe50).replace(/[\s\u00a0\u200b]+/g, "").replace(/[–—−]/g, "-");
const strip = h => h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&");
const DATE = /\d{1,2}\s*(?:-\s*\d{1,2}\s*)?(?:มกราคม|กุมภาพันธ์|มีนาคม|เมษายน|พฤษภาคม|มิถุนายน|กรกฎาคม|สิงหาคม|กันยายน|ตุลาคม|พฤศจิกายน|ธันวาคม)\s*25\d{2}/g;

async function check(s) {
  const out = { id: s.id, url: s.url, checkedAt: new Date().toISOString() };
  try {
    const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 9000);
    const r = await fetch(s.url, { signal: ctl.signal, headers: { "user-agent": "Mozilla/5.0 TCAS-Tracker", "accept-language": "th,en" } });
    clearTimeout(t);
    if (!r.ok) return { ...out, status: "error", note: "HTTP " + r.status };
    if ((r.headers.get("content-type") || "").includes("pdf")) return { ...out, status: "pdf", note: "ไฟล์ PDF — เปิดลิงก์อ่านเอง" };
    const text = strip(await r.text());
    if (text.replace(/\s+/g, "").length < 300) return { ...out, status: "js", note: "หน้านี้โหลดด้วย JavaScript อ่านอัตโนมัติไม่ได้ — เปิดลิงก์ตรวจเอง" };
    const n = norm(text), missing = s.expect.filter(e => !n.includes(norm(e)));
    return { ...out, status: !s.expect.length ? "read" : missing.length ? "changed" : "ok", missing, dates: [...new Set(text.match(DATE) || [])].slice(0, 12) };
  } catch (e) {
    return { ...out, status: "error", note: e.name === "AbortError" ? "หมดเวลา" : String(e.message || e) };
  }
}

module.exports = async (req, res) => {
  const results = {};
  (await Promise.all(data.sources.map(check))).forEach(r => (results[r.id] = r));
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
  res.status(200).json({ checkedAt: new Date().toISOString(), results });
};
