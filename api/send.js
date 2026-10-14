// Vercel Serverless Function: terima teks/file dari website -> kirim ke WhatsApp kamu via Fonnte
// Token & nomor disimpan di Environment Variables Vercel (TIDAK di kode / browser).

const formidable = require("formidable");
const fs = require("fs");

module.exports.config = { api: { bodyParser: false } };

const MAX_FILE = 4 * 1024 * 1024; // 4 MB (batas body Vercel = 4,5 MB)

function parseForm(req) {
  const form = formidable({ maxFileSize: MAX_FILE, maxFiles: 1, multiples: false });
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => (err ? reject(err) : resolve({ fields, files })));
  });
}

const first = (v) => (Array.isArray(v) ? v[0] : v);

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Metode tidak diizinkan." });

  const TOKEN = process.env.FONNTE_TOKEN;
  const TARGET = process.env.WA_TARGET; // contoh: 6281234567890
  if (!TOKEN || !TARGET) {
    return res.status(500).json({ ok: false, error: "Server belum dikonfigurasi (FONNTE_TOKEN / WA_TARGET)." });
  }

  let fields, files;
  try {
    ({ fields, files } = await parseForm(req));
  } catch (e) {
    const tooBig = String(e && e.message).toLowerCase().includes("maxfilesize");
    return res.status(400).json({ ok: false, error: tooBig ? "File terlalu besar. Maksimal 4 MB." : "Gagal membaca data." });
  }

  // Jebakan bot: kolom tersembunyi harus kosong
  if (first(fields.website)) return res.status(200).json({ ok: true });

  const nama = (first(fields.nama) || "").toString().trim().slice(0, 60);
  const pesan = (first(fields.pesan) || "").toString().trim().slice(0, 3000);
  const file = first(files.file);

  if (!pesan && !file) return res.status(400).json({ ok: false, error: "Isi pesan atau pilih file dulu." });

  const caption =
    `📩 *Kiriman baru dari website*\n` +
    (nama ? `Dari: ${nama}\n` : "") +
    (pesan ? `\n${pesan}` : "");

  const body = new FormData();
  body.append("target", TARGET);
  body.append("message", caption);
  body.append("countryCode", "62");

  if (file) {
    const buf = fs.readFileSync(file.filepath);
    const blob = new Blob([buf], { type: file.mimetype || "application/octet-stream" });
    body.append("file", blob, file.originalFilename || "file");
  }

  try {
    const r = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: { Authorization: TOKEN },
      body,
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok || data.status === false) {
      return res.status(502).json({ ok: false, error: data.reason || "Gagal mengirim ke WhatsApp." });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(502).json({ ok: false, error: "Tidak bisa menghubungi layanan WhatsApp." });
  } finally {
    if (file) fs.unlink(file.filepath, () => {});
  }
};
