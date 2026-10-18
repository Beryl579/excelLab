# ExcelLab — Belajar Excel dari Nol sampai Siap Kerja

Situs belajar Excel interaktif berbahasa Indonesia: 9 modul materi,
simulator spreadsheet yang benar-benar menjalankan rumus, kuis dengan
pembahasan, ujian akhir, referensi 35+ fungsi, cheat sheet cetak, dan
tutor AI (ExcelMate).

## Struktur file

```
.
├── index.html      # Halaman utama (semua section)
├── style.css       # Styling
├── script.js       # Logika: navigasi, simulator, kuis, pivot, chat
├── data.js         # Data kuis / video / referensi
├── .env            # Rahasia API (TIDAK di-commit)
├── .env.example    # Template variabel lingkungan
└── README.md
```

## Jalankan secara lokal

Cukup buka `index.html` di browser, atau jalankan server sederhana:

```bash
python -m http.server 8000
```

lalu buka <http://localhost:8000>.

## Variabel lingkungan

Salin `.env.example` menjadi `.env` lalu isi dengan key asli:

```bash
cp .env.example .env
```

Variabel yang dipakai (untuk backend tutor AI):

- `GROQ_API_KEY_EXCELLAB` / `GROQ_MODEL_EXCELLAB`
- `XKIRO_API_KEY_EXCELLAB` / `XKIRO_MODEL_EXCELLAB`

> ⚠️ **Jangan pernah commit file `.env`.** File ini sudah masuk `.gitignore`.

## Deploy

### Netlify (disarankan, agar tutor AI berfungsi)

1. Hubungkan repo ini ke Netlify.
2. Set variabel lingkungan di dashboard Netlify (salin dari `.env`).
3. Tambahkan Netlify Function `netlify/functions/excellab-chat.js` yang membaca
   variabel di atas dan mengembalikan respons OpenAI-compatible
   (`choices[0].message.content`). Frontend memanggil `/.netlify/functions/excellab-chat`.

### GitHub Pages (statis)

Cocok untuk materi + simulator (tanpa tutor AI). Aktifkan Pages dari branch `main`
folder `/ (root)`.

## Lisensi

MIT — lihat `LICENSE`.