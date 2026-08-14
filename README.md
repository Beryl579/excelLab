# ExcelLab 📊

Aplikasi belajar Excel interaktif — dari nol sampai siap kerja. Berjalan 100% di browser, tanpa instalasi, tanpa server.

## Fitur

- **6 Modul Terstruktur** — Dasar Excel, Rumus Dasar, Fungsi Teks, Fungsi Logika, VLOOKUP & Lookup, Analisis Data & Pivot Table
- **Simulator Spreadsheet** — grid yang benar-benar menghitung rumus (SUM, IF, VLOOKUP, LEFT, COUNTIF, 25+ fungsi)
- **Kuis per Modul** — 8 soal per modul dengan pembahasan jawaban
- **Ujian Akhir** — 15 soal campuran, lulus jika ≥ 70%
- **Shortcut Trainer** — game tebak shortcut keyboard Excel
- **Referensi Rumus** — kamus 35 fungsi lengkap dengan contoh, bisa dicari & difilter
- **Progres Tersimpan** — menggunakan localStorage, tidak perlu login

## Cara Pakai

Cukup buka file `index.html` di browser. Tidak perlu koneksi internet setelah halaman dimuat.

```
Klik dua kali index.html  →  belajar langsung
```

Atau akses versi live di: **[GitHub Pages URL]**

## Struktur File

```
.
└── index.html    ← seluruh app (HTML + CSS + JS dalam satu file)
```

## Stack

| Teknologi | Keterangan |
|-----------|-----------|
| HTML5     | Struktur & konten |
| CSS3      | Styling & animasi (tanpa framework) |
| Vanilla JS | Logic simulator, quiz engine, navigator |
| Google Fonts | Sora, IBM Plex Sans, IBM Plex Mono |
| localStorage | Penyimpanan progres lokal |

## Deploy ke GitHub Pages

1. Push repo ke GitHub
2. Buka **Settings → Pages**
3. Source: pilih branch `main`, folder `/ (root)`
4. Save — site aktif di `https://<username>.github.io/<repo-name>`

## Lisensi

MIT — bebas digunakan dan dimodifikasi.
