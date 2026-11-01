/**
 * Backend form kontak (Vercel Serverless Function).
 * Jika env TELEGRAM_BOT_TOKEN & TELEGRAM_CHAT_ID diisi di Vercel,
 * pesan akan dikirim ke Telegram kamu. Jika tidak, pesan hanya tercatat di log.
 */
const clean = (v, max) => String(v || "").trim().slice(0, max);

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, message: "Metode tidak diizinkan." });
  }

  const body = req.body || {};
  if (body.website) return res.status(200).json({ ok: true, message: "Terkirim." }); // honeypot anti-spam

  const name = clean(body.name, 80);
  const email = clean(body.email, 120);
  const message = clean(body.message, 1500);

  if (!name || !message) return res.status(400).json({ ok: false, message: "Nama dan pesan wajib diisi." });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ ok: false, message: "Format email tidak valid." });

  const { TELEGRAM_BOT_TOKEN: token, TELEGRAM_CHAT_ID: chat } = process.env;
  try {
    if (token && chat) {
      const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chat, text: `Pesan portofolio\nNama: ${name}\nEmail: ${email}\n\n${message}` })
      });
      if (!r.ok) throw new Error("Telegram error " + r.status);
    } else {
      console.log("Pesan baru:", { name, email, message });
    }
    return res.status(200).json({ ok: true, message: "Pesan terkirim. Terima kasih!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: "Gagal mengirim pesan. Coba lagi nanti." });
  }
};
