# vfmaudio

[Buka vfmaudio](https://vfmaudio.rezaprama.workers.dev) · [Kitab Audio asli](https://docs.google.com/spreadsheets/d/1KXDCrMErS1ZjjJhxjTYqNax1bjWWl4peXv0eaLMlxVc/edit) · [Jadwal sinkronisasi](https://github.com/rezaprama/vfmaudio/actions/workflows/sync.yml)

Pencari perangkat audio berdasarkan anggaran, jenis perangkat, koneksi, mic, dan kebutuhan mendengarkan. Sumber penilaian adalah **Kitab Audio oleh Fernanda Gunsan**. Proyek ini independen. Penilaian bersifat subjektif; review lengkap dan tautan belanja tetap diarahkan ke sheet asli, sampai ke baris produknya.

Tulis, misalnya:

> Budget 1 juta, IEM atau headphone wireless, USB-C dan 3.5 mm, mic untuk Zoom, buat musik.

Kalimat diterjemahkan menjadi filter yang terlihat dan dapat diedit. Penerjemah memakai aturan bahasa Indonesia, tanpa layanan LLM atau biaya per percakapan. Detail yang belum dikenali tidak dianggap sudah diterapkan. Filter manual tetap menjadi kontrol yang menentukan hasil.

## Perilaku utama

- Katalog 20 tab audio. Jumlah produk mengikuti hasil impor, bukan angka tetap.
- Anggaran mencakup cadangan aksesori yang diisi pengguna. Cadangan adalah estimasi, bukan harga paket atau bukti kompatibilitas.
- Koneksi USB-C untuk charging tidak dihitung sebagai USB audio. Varian konektor tidak otomatis membuktikan kedua konektor bekerja pada unit yang sama. Nilai mic wireless tidak membuktikan mic bekerja saat berkabel.
- Hasil terverifikasi didahulukan. Di antara hasil belum lengkap, harga yang diketahui dan jumlah fakta yang masih kosong didahulukan, lalu tier value sumber, nilai suara dalam kelompok yang sama, dan harga. Urutan alternatif tersedia untuk harga atau suara.
- IEM, TWS, dan kategori lain tidak diperingkat silang. Headphone open-back, closed-back, dan tipe yang belum tercatat dipisahkan.
- Nilai suara turunan hanya muncul jika semua komponen penilaian tersedia dan valid. Label “rata-rata” membedakannya dari total yang dicatat penulis. Nilai kosong bukan nol.
- Ambang mic untuk meeting adalah minimal grade A, atau nilai numerik 7.5/10. Ambang suara untuk musik dapat diubah. Ini aturan penyaringan aplikasi, bukan sertifikasi audiophile atau hasil uji mandiri.
- Bandingkan hingga tiga produk, bagikan filter melalui URL, buka rincian bukti, dan gunakan tema terang/gelap. Tidak perlu login pengunjung.

## Sumber data dan database

Google Sheets adalah sumber editorial. Excel juga dapat menjadi sumber melalui proses impor, tetapi file Excel bukan server database untuk permintaan web. Implementasi ini membaca ekspor CSV publik dari setiap tab Google Sheets, lalu menyimpan snapshot tervalidasi di **Cloudflare D1**. Browser membaca D1 melalui Cloudflare Worker; Google tidak diakses pada setiap pencarian.

Review panjang dan tautan afiliasi tidak disalin ke katalog. Data yang disimpan meliputi nama, harga acuan, penilaian, kolom fitur yang tersedia, serta tab/baris sumber. Sheet sumber tidak pernah diedit.

Sinkronisasi dijadwalkan oleh **GitHub Actions** pada `17 */6 * * *` (UTC), sekitar 01.17, 07.17, 13.17, dan 19.17 WIB. Eksekusi GitHub dapat tertunda. Jadwal Cloudflare tidak dipakai karena kuota lima cron trigger akun sudah terisi; tidak ada job lain atau paket akun yang diubah.

Worker mengambil semua tab sebelum menyimpan hasil. Pemeriksaan header kolom kritis, tab kosong, ukuran data, dan penurunan jumlah produk lebih dari 25% mencegah snapshot rusak menimpa data baik. Penggantian current/previous, status, dan riwayat dilakukan dalam satu batch D1. Kegagalan mempertahankan snapshot terakhir dan dicatat di `sync_state`/`sync_runs`. Riwayat dibatasi 100 entri.

Waktu “pemeriksaan”, “terakhir berhasil”, dan “snapshot berubah” adalah waktu aplikasi. Judul sumber ditampilkan terpisah; tanggal judul tidak dianggap waktu edit yang terverifikasi. Jika API gagal, browser memakai snapshot saat deployment dengan pemberitahuan yang terlihat. Kegagalan lebih dari 24 jam memunculkan penanda data lama.

GitHub menonaktifkan workflow terjadwal di repositori publik setelah 60 hari tanpa aktivitas repositori. Untuk menjaga aktivitas yang bermakna, workflow menyimpan satu catatan pemeriksaan sumber yang benar-benar berhasil setiap bulan di `.github/sync-heartbeat.json`. Catatan berisi waktu dan jumlah produk dari respons importer yang berhasil, bukan aktivitas rekaan. Token job diberi izin tulis hanya untuk repo ini dan hanya selama job berlangsung. Jika sinkronisasi terus gagal, catatan sukses tidak dibuat; pantau Actions dan penanda data lama di UI. [Ketentuan jadwal GitHub](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule).

## Menjalankan proyek

Butuh Node.js 24, npm, dan login Wrangler untuk deployment.

```sh
npm ci
npm run cf:types
npm test
npm run build
npm run dev
```

Vite berjalan pada localhost dan mem-proxy `/api` ke Worker port 8787. Untuk Worker lokal dan D1:

```sh
npm run db:local
npm run sync:seed
npx wrangler d1 execute vfmaudio --local --file=.cache/seed.sql
npm run dev:worker
```

Jika kebijakan Windows memblokir `workerd.exe`, Vite tetap dapat menguji frontend menggunakan snapshot dengan peringatan. Jangan melemahkan kebijakan Windows; verifikasi backend melalui deployment Cloudflare.

Untuk database baru pada akun lain, jalankan `wrangler d1 create vfmaudio`, perbarui ID di `wrangler.jsonc`, lalu jalankan migrasi dan seed dengan `--remote`. Seed SQL memakai staging dan potongan kecil agar setiap pernyataan di bawah batas SQL D1. `python scripts/verify-import.py` memeriksa bahwa impor menghasilkan JSON yang identik dengan snapshot.

## Deployment dan operasi

```sh
npm run build
npx wrangler deploy --dry-run
npx wrangler deploy
```

GitHub Actions `Checks` menjalankan tes, typecheck/build, dan dry run. Deployment kode menggunakan Wrangler; workflow `Sync Kitab Audio` hanya memperbarui katalog D1 dan tidak perlu rebuild frontend.

`SYNC_TOKEN` disimpan sebagai secret Worker, dan pasangan nilainya sebagai GitHub Actions secret `VFMAUDIO_SYNC_TOKEN`. Token tidak ditulis ke file atau dicetak. Untuk rotasi kedua secret sekaligus dan pemeriksaan manual, dengan Wrangler dan GitHub CLI sudah login:

```sh
npm run sync:remote -- https://vfmaudio.rezaprama.workers.dev
```

Script operator khusus repositori ini membuat token baru di memori, menyimpan kedua secret melalui stdin, lalu memanggil importer yang sama dengan workflow terjadwal. Token tidak dipakai oleh browser. Endpoint `POST /api/admin/sync` menolak permintaan tanpa token. Perbandingan token memakai hash dan `timingSafeEqual`. Untuk fork, ubah target repositori/URL workflow dan konfigurasi D1 sebelum memakai script operator.

Endpoint baca publik:

- `/api/catalog`: katalog dan status, ETag, cache lima menit.
- `/api/status`: hasil pemeriksaan terakhir dan sepuluh riwayat terbaru.

Jika struktur sumber berubah, periksa header ekspor CSV dan perbarui pemetaan `src/lib/source.ts`. Jalankan tes dan impor seed sebelum deployment; jangan mematikan validasi agar error terlihat hilang. Snapshot `previous` dipertahankan untuk pemulihan operator.

## Desain dan verifikasi

Arah editorial dipilih pemilik proyek dan dicatat di [DESIGN.md](DESIGN.md). Aturan [anti-slop](https://github.com/miqdadbadjuber/anti-slop) disertakan pada commit upstream yang tercatat di [anti-slop/UPSTREAM.md](anti-slop/UPSTREAM.md), dengan lisensi aslinya. Laporan gate dan bukti uji tersedia di [docs/VERIFICATION.md](docs/VERIFICATION.md).
