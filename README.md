# Website Portofolio

Portofolio pribadi dengan frontend statis (HTML, CSS, JS terpisah) dan backend serverless di Vercel (`/api`).

## Fitur
- Loader dengan delay, animasi muncul bertahap, dan efek ketik pada peran
- Bar keahlian dengan persentase yang beranimasi
- Kontak WhatsApp, GitHub, Instagram, TikTok, plus form pesan
- Responsif (desktop, tablet, HP) dan menghormati pengaturan "reduce motion"
- Backend: `/api/profile` (data diri) dan `/api/contact` (form kontak)

## Struktur
```
├── api/
│   ├── profile.js      # DATA DIRI: edit di sini
│   └── contact.js      # backend form kontak
├── public/
│   ├── index.html
│   ├── css/style.css
│   ├── js/main.js
│   └── assets/         # taruh foto profil di sini
├── package.json
└── README.md
```

## Cara mengubah isi
Buka `api/profile.js`, lalu ubah nama, deskripsi, skill (angka `level` 0-100), proyek, dan kontak.

### Mengganti foto profil
1. Salin foto kamu ke `public/assets/`, misalnya `profile.jpg` (disarankan persegi 1:1).
2. Di `api/profile.js`, ubah `photo: "/assets/profile.svg"` menjadi `photo: "/assets/profile.jpg"`.

## Menjalankan lokal
```bash
npm i -g vercel
vercel dev
```
Buka http://localhost:3000. Jangan buka `index.html` langsung, karena data dimuat dari `/api`.

## Deploy ke Vercel
1. Upload folder ini ke GitHub.
2. Di [vercel.com](https://vercel.com), pilih **Add New > Project**, lalu impor repo.
3. Framework Preset: **Other**. Klik **Deploy**. Folder `public` dan `api` terdeteksi otomatis.

## (Opsional) Form kontak masuk ke Telegram
1. Buat bot lewat @BotFather dan ambil token-nya. Cari chat ID kamu lewat @userinfobot.
2. Di Vercel: **Settings > Environment Variables**, tambahkan `TELEGRAM_BOT_TOKEN` dan `TELEGRAM_CHAT_ID`.
3. Redeploy. Tanpa variabel ini, pesan hanya tercatat di Vercel Logs.

## Lisensi
Bebas dipakai dan dimodifikasi.
