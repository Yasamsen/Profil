/**
 * ==========================================================
 *  EDIT DATA DIRI KAMU DI SINI SAJA
 *  Semua isi website (nama, skill, kontak, foto) dibaca dari file ini.
 * ==========================================================
 */
const profile = {
  name: "Nama Kamu",
  roles: ["Web Developer", "Backend Enthusiast", "Problem Solver"],
  tagline: "Saya membangun aplikasi web yang cepat, rapi, dan mudah dipakai.",
  about: [
    "Halo! Saya seorang developer yang suka mengubah ide menjadi produk digital yang berfungsi.",
    "Saya terbiasa mengerjakan frontend, backend, hingga database. Ceritakan pengalaman, pendidikan, atau hal yang kamu pelajari saat ini di sini."
  ],

  // GANTI FOTO: taruh file foto di public/assets/ lalu ubah path di bawah.
  // Contoh: "/assets/profile.jpg"  (rasio terbaik 1:1 / persegi)
  photo: "/assets/profile.svg",

  // Persentase skill (0 - 100). Tambah/hapus baris sesuka kamu.
  skills: [
    { name: "JavaScript", level: 85 },
    { name: "Python", level: 80 },
    { name: "HTML & CSS", level: 90 },
    { name: "Node.js", level: 75 },
    { name: "SQL / Database", level: 78 },
    { name: "Git & GitHub", level: 82 }
  ],

  projects: [
    { title: "Aplikasi Kasir", desc: "Sistem kasir web dengan laporan penjualan harian.", tags: ["Node.js", "MySQL"], link: "https://github.com/username/proyek-1" },
    { title: "Bot Telegram", desc: "Bot otomatis untuk pengingat dan notifikasi.", tags: ["Python", "API"], link: "https://github.com/username/proyek-2" },
    { title: "Landing Page UMKM", desc: "Website responsif untuk usaha kecil dengan form pesanan.", tags: ["HTML", "CSS", "JS"], link: "https://github.com/username/proyek-3" }
  ],

  // Isi dengan username/nomor kamu. Kosongkan ("") untuk menyembunyikan.
  contacts: {
    whatsapp: "6281234567890",   // format internasional tanpa + dan 0 di depan
    github: "username",
    instagram: "username",
    tiktok: "username"
  }
};

module.exports = (req, res) => {
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate");
  res.status(200).json(profile);
};
