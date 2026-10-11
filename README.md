# Web2APK Studio — Vercel + GitHub Actions

Proyek starter: frontend responsif di Vercel, API tipis di Vercel Functions, dan Android SDK/Gradle berjalan di GitHub Actions. Tidak perlu menyewa server build terpisah.

## Yang tersedia

- UI modern gelap dengan aksen biru-hijau dan pratinjau responsif.
- Package name otomatis dari nama aplikasi, dan bisa diedit.
- API `/api/build` memvalidasi input lalu memicu `workflow_dispatch`.
- API `/api/status` memeriksa status run.
- API `/api/download` mengambil artifact GitHub Actions, mengekstrak APK, dan mengirimkannya ke browser.
- GitHub Actions membangun **debug APK** menggunakan Android SDK + Gradle.

## Prasyarat

- Akun GitHub dan Vercel.
- Repositori GitHub untuk proyek ini.
- Personal Access Token (classic) atau fine-grained token yang bisa membaca repositori dan Actions serta menjalankan workflow. Gunakan akses minimum yang diperlukan. Untuk private repo, fine-grained token umumnya perlu `Actions: read/write`, `Contents: read`, dan akses ke repositori ini; periksa kebutuhan API GitHub yang berlaku untuk akunmu.
- Node.js lokal hanya jika ingin menjalankan tes lokal.

## 1. Buat repositori GitHub

1. Buat repositori baru di GitHub (private disarankan).
2. Upload/push seluruh isi folder proyek ini ke branch `main`.
3. Pastikan workflow muncul di tab **Actions**. Aktifkan Actions bila diminta.
4. Jangan menambahkan token ke file proyek atau frontend. Token hanya disimpan sebagai environment variable di Vercel.

## 2. Buat token GitHub

Buat token dengan akses hanya ke repositori ini. API Vercel perlu memicu workflow dan membaca status/artifact. Untuk fine-grained PAT, mulai dengan:
- **Actions**: Read and write (untuk dispatch workflow), Read (runs/artifacts; jika API menolak, sesuaikan izin minimum yang diminta).
- **Contents**: Read-only.
- Pilih hanya repositori proyek ini.

GitHub mengubah izin token dari waktu ke waktu; bila API mengembalikan 403, periksa dokumentasi/izin token GitHub untuk endpoint workflow dispatch, workflow runs, dan artifacts. Jangan gunakan token dengan akses akun penuh bila tidak diperlukan.

## 3. Deploy ke Vercel

1. Import repositori GitHub di Vercel.
2. Framework preset: **Other**. Root directory: root proyek.
3. Tambahkan environment variables di **Project Settings → Environment Variables**:
   - `GITHUB_OWNER` = username atau organisasi GitHub pemilik repo.
   - `GITHUB_REPO` = nama repositori.
   - `GITHUB_TOKEN` = token GitHub (secret; jangan pernah pakai prefix `NEXT_PUBLIC_`).
   - `GITHUB_WORKFLOW_FILE` = `build-apk.yml` (opsional; nilai default ini).
   - `GITHUB_REF` = `main` (opsional; branch tempat workflow tersedia).
4. Deploy ulang setelah mengatur variables.
5. Buka URL deployment Vercel, isi form, dan tekan **Buat APK sekarang**.

## 4. Cara kerja

1. Browser mengirim URL, nama aplikasi, package name, warna, dan permission pilihan ke `/api/build`.
2. Vercel API memicu workflow `Build Web2APK` di GitHub Actions.
3. GitHub runner memasang Java 17 dan Android SDK, lalu membuat APK debug.
4. Browser memeriksa status melalui `/api/status`.
5. Saat selesai, tautan unduhan memanggil `/api/download`, yang mengambil artifact ZIP dengan token server-side dan mengembalikan file `.apk`.

Artifact disimpan selama 3 hari. Unduh APK segera setelah build selesai. API download memproses artifact di memori Vercel, sehingga APK yang sangat besar mungkin mencapai batas memori/waktu fungsi. Untuk trafik tinggi, pindahkan artifact ke object storage dengan URL bertanda tangan.

## Batasan penting

- Hasilnya **debug APK**, bukan release APK yang siap dipublikasikan ke Google Play. Release build memerlukan keystore privat, signing config, dan pengelolaan secret yang benar.
- Starter ini membungkus website dengan Android WebView; website sumber harus milikmu atau kamu berhak membungkusnya.
- Opsi kamera/lokasi/media menambahkan permission ke Android manifest, tetapi **belum** mengimplementasikan prompt izin runtime native atau meneruskan permintaan permission WebView. Jangan anggap fitur itu aktif tanpa pengembangan native lanjutan.
- Ikon dan splash screen custom belum disertakan.
- Build bisa gagal jika website memblokir WebView, memakai autentikasi/fitur browser yang tidak kompatibel, atau Android/Gradle dependency berubah.
- URL pengguna masuk ke workflow GitHub. Jangan gunakan layanan ini untuk URL yang tidak tepercaya dalam lingkungan organisasi tanpa menambahkan autentikasi, rate limiting, batas build per pengguna, dan kebijakan penggunaan.
- Endpoint `/api/build` starter ini belum memiliki login/rate limiting. Sebelum membuat layanan publik, tambahkan autentikasi dan pembatasan penggunaan untuk mencegah penyalahgunaan runner/kuota GitHub.
- Karena browser dapat memicu build, gunakan repositori privat, token berhak minimum, dan jangan pernah mengirim token GitHub ke browser.
- GitHub Actions memiliki batas penggunaan/kuota sesuai paket dan kebijakan GitHub; ini bukan layanan tanpa batas atau jaminan sepenuhnya gratis.

## Pengujian cepat

- `/api/build` hanya menerima POST.
- `/api/status?runId=...` memerlukan run ID yang valid.
- Jalankan workflow manual dari tab Actions dengan input dummy untuk memastikan toolchain Android berfungsi.
- Jika build API mengembalikan 404, periksa nama workflow dan branch.
- Jika API mengembalikan 401/403, periksa token, izin, dan akses repositori.
- Jika status otomatis belum mendapatkan run ID, buka tautan Actions dari UI dan pantau workflow.

## Keamanan dan produksi

Sebelum dibuka ke publik: tambahkan autentikasi, rate limiting, validasi allowlist bila sesuai, audit logging yang tidak menyimpan token, perlindungan terhadap spam build, serta kebijakan retensi artifact. Pertimbangkan pembatasan URL/egress di sisi build untuk mengurangi risiko penggunaan runner sebagai alat mengakses endpoint internal. Periksa juga aturan dan batas terbaru Vercel/GitHub sebelum dipakai untuk beban produksi.

Lisensi: tambahkan lisensi yang sesuai sebelum mendistribusikan proyek ini.
