# Kirim ke WhatsApp (Vercel)

Pengunjung kirim teks / gambar / file lewat website -> masuk ke WhatsApp kamu. Pengunjung tidak perlu akun.

## 1. Siapkan Fonnte (gateway WhatsApp)
1. Daftar di https://fonnte.com (gratis ada paket trial).
2. Tambah device -> scan QR dengan WhatsApp nomor kamu (seperti WhatsApp Web).
3. Salin **Token** device.

## 2. Upload ke Vercel
- Upload folder ini ke GitHub, lalu "Add New Project" di vercel.com dan pilih repo-nya.
- Atau lewat terminal: `npm i -g vercel` lalu `vercel` di dalam folder ini.

## 3. Environment Variables (Project Settings -> Environment Variables)
| Nama | Isi |
|---|---|
| FONNTE_TOKEN | token dari Fonnte |
| WA_TARGET | nomor tujuan, format 628xxxxxxxxxx (tanpa + dan tanpa 0 di depan) |

Setelah mengisi, klik **Redeploy**.

## Catatan
- Batas ukuran file 4 MB (batas Vercel untuk fungsi serverless).
- Token hanya ada di server, tidak terlihat pengunjung.
