"use strict";

/* ================= QUIZ DATA ================= */
const QUIZZES = {
  m1: {
    title: 'Kuis Modul 1 · Dasar Excel',
    qs: [
      { q: 'Sel adalah pertemuan antara…', o: ['Worksheet dan Ribbon', 'Kolom dan baris', 'Range dan sheet', 'File dan folder'], a: 1, x: 'Sel = alamat unik pertemuan kolom (huruf) dan baris (angka), mis. D7.' },
      { q: 'Ekstensi file standar Excel 2007 ke atas adalah…', o: ['.xls', '.csv', '.xlsx', '.xlsm'], a: 2, x: '.xlsx = workbook standar; .xlsm menandakan ada macro.' },
      { q: 'Rumus paling nyaman diketik di…', o: ['Status bar', 'Formula bar', 'Ribbon', 'Name box'], a: 1, x: 'Formula bar menampilkan dan mengedit isi/rumus sel aktif.' },
      { q: 'Alamat sel di kolom D baris 7 ditulis…', o: ['7D', 'D-7', 'D7', 'Baris7'], a: 2, x: 'Kolom dulu (huruf), baru baris (angka).' },
      { q: 'A1:A5 disebut…', o: ['Sel', 'Array', 'Range', 'Sheet'], a: 2, x: 'Range = kumpulan sel berurutan dari A1 sampai A5.' },
      { q: 'Karakter pertama sebuah rumus adalah…', o: ['"', '=', '@', '#'], a: 1, x: 'Tanpa =, Excel menganggap isinya teks biasa.' },
      { q: 'Shortcut menyimpan file…', o: ['Ctrl+P', 'Ctrl+S', 'Ctrl+N', 'Alt+F4'], a: 1, x: 'Ctrl+S = Save. Biasakan tiap beberapa menit!' },
      { q: 'Angka yang diketik di sel otomatis rata…', o: ['Kiri', 'Kanan', 'Tengah', 'Atas'], a: 1, x: 'Angka rata kanan, teks rata kiri — cara cepat cek tipe data.' }
    ]
  },
  m2: {
    title: 'Kuis Modul 2 · Rumus Dasar',
    qs: [
      { q: 'Menjumlahkan sel B2 sampai B10…', o: ['=SUM(B2:B10)', '=TOTAL(B2:B10)', '=ADD(B2:B10)', '=SUM(B2,B10)'], a: 0, x: 'Tanda titik dua (:) artinya "sampai" — seluruh sel di antaranya ikut.' },
      { q: 'Hasil =AVERAGE(10,20,30)…', o: ['20', '30', '60', '10'], a: 0, x: '(10+20+30)/3 = 20.' },
      { q: 'Hasil =MAX(3,9,5)…', o: ['3', '5', '9', '17'], a: 2, x: 'MAX mengembalikan nilai terbesar.' },
      { q: 'Hasil =COUNT(5,"a",10)…', o: ['2', '3', '1', '0'], a: 0, x: 'COUNT hanya menghitung angka; teks "a" tidak dihitung.' },
      { q: '$B$2 artinya…', o: ['Referensi absolut (terkunci)', 'Range dua sel', 'Rumus error', 'Nama sheet'], a: 0, x: 'Tanda $ mengunci kolom B dan baris 2 saat rumus di-copy.' },
      { q: 'Hasil =ROUND(3.456,1)…', o: ['3.4', '3.5', '3.46', '4'], a: 1, x: 'Angka kedua (1) = jumlah desimal yang dipertahankan.' },
      { q: 'Operator pangkat di Excel…', o: ['**', '^', '~', '//'], a: 1, x: '=2^3 menghasilkan 8.' },
      { q: 'Hasil =2+3*2…', o: ['10', '8', '12', '6'], a: 1, x: 'Perkalian lebih dulu: 3*2=6, lalu 2+6=8. Mau 10? Pakai =(2+3)*2.' }
    ]
  },
  m3: {
    title: 'Kuis Modul 3 · Fungsi Teks',
    qs: [
      { q: 'Hasil =LEFT("MEDAN",3)…', o: ['MED', 'DAN', 'MEDA', 'AN'], a: 0, x: 'LEFT mengambil 3 karakter pertama dari kiri.' },
      { q: 'Hasil =RIGHT("EXCEL",2)…', o: ['EL', 'EX', 'CEL', 'CE'], a: 0, x: 'RIGHT mengambil 2 karakter terakhir.' },
      { q: 'Hasil =MID("TEKNIK",2,3)…', o: ['EKN', 'TEK', 'KNI', 'NIK'], a: 0, x: 'Mulai karakter ke-2 ("E"), ambil 3 → E-K-N.' },
      { q: 'Hasil =LEN("HALO")…', o: ['4', '5', '3', 'Error'], a: 0, x: 'LEN menghitung banyaknya karakter.' },
      { q: 'A1="Sari", B1="Utami". Menghasilkan "Sari Utami"…', o: ['=A1&" "&B1', '=A1+B1', '=JOIN(A1,B1)', '=TEXT(A1,B1)'], a: 0, x: '& menggabung teks; " " memberi spasi di tengah.' },
      { q: 'Hasil =PROPER("beryl sinaga")…', o: ['BERYL SINAGA', 'Beryl Sinaga', 'beryl sinaga', 'Beryl sinaga'], a: 1, x: 'PROPER mengkapitalkan huruf pertama tiap kata.' },
      { q: 'Membuang spasi berlebih pakai…', o: ['TRIM', 'CLEAN', 'STRIP', 'SPACE'], a: 0, x: 'TRIM merapikan spasi — penyelamat data hasil copy-paste.' },
      { q: 'Hasil =LEN("TEKNIK ")  (ada 1 spasi di akhir)…', o: ['6', '7', '8', 'Error'], a: 1, x: 'Spasi juga karakter! Ini jebakan umum saat data tidak cocok.' }
    ]
  },
  m4: {
    title: 'Kuis Modul 4 · Fungsi Logika',
    qs: [
      { q: 'Hasil =IF(7>5,"LULUS","GAGAL")…', o: ['LULUS', 'GAGAL', 'TRUE', 'Error'], a: 0, x: '7>5 bernilai benar → nilai_jika_benar yang keluar.' },
      { q: 'Hasil =AND(TRUE,FALSE)…', o: ['TRUE', 'FALSE', 'AND', '1'], a: 1, x: 'AND butuh SEMUA syarat benar.' },
      { q: 'Hasil =OR(FALSE,FALSE)…', o: ['TRUE', 'FALSE', 'OR', 'Error'], a: 1, x: 'OR butuh minimal satu benar; dua-duanya salah → FALSE.' },
      { q: 'Operator "tidak sama dengan"…', o: ['!=', '<>', '≠', '=='], a: 1, x: 'Excel memakai <>, bukan != seperti bahasa pemrograman.' },
      { q: '=IF(B2>=75,"LULUS","REMED"), B2 berisi 70…', o: ['LULUS', 'REMED', '70', 'Error'], a: 1, x: '70 tidak memenuhi >=75 → nilai_jika_salah.' },
      { q: 'Sintaks IF yang benar…', o: ['=IF(jika_benar, kondisi, jika_salah)', '=IF(kondisi, jika_benar, jika_salah)', '=IF(jika_benar; jika_salah)', '=IF(kondisi)'], a: 1, x: 'Urutan: syarat dulu, baru hasil benar, baru hasil salah.' },
      { q: 'Hasil =IF(AND(2>1,3<5),"OK","NO")…', o: ['OK', 'NO', 'TRUE', 'Error'], a: 0, x: 'Dua syarat sama-sama benar → AND = TRUE.' },
      { q: 'Hasil =IF(90>=85,"A",IF(90>=75,"B","C"))…', o: ['A', 'B', 'C', 'Error'], a: 0, x: 'Syarat pertama (90>=85) langsung terpenuhi → "A".' }
    ]
  },
  m5: {
    title: 'Kuis Modul 5 · Lookup',
    qs: [
      { q: 'Argumen ke-3 VLOOKUP adalah…', o: ['Nomor kolom hasil', 'Jumlah baris tabel', 'Tipe data', 'Nama sheet'], a: 0, x: 'col_index_num: urutan kolom hasil dihitung dari kiri range.' },
      { q: 'Agar VLOOKUP mencari hasil persis (exact match), argumen ke-4 diisi…', o: ['TRUE', 'FALSE', '1', 'EXACT'], a: 1, x: 'FALSE (atau 0) = exact match. Hampir selalu ini yang kamu mau.' },
      { q: 'Data tidak ditemukan → muncul error…', o: ['#VALUE!', '#REF!', '#N/A', '#NAME?'], a: 2, x: '#N/A = Not Available. Bungkus dengan IFERROR agar rapi.' },
      { q: 'Fungsi penangkal error…', o: ['IFERROR', 'TRY', 'CATCH', 'NOERROR'], a: 0, x: '=IFERROR(rumus, nilai_pengganti).' },
      { q: 'Bedanya VLOOKUP dan HLOOKUP…', o: ['VLOOKUP vertikal, HLOOKUP horizontal', 'VLOOKup angka, HLOOKUP teks', 'Tidak ada beda', 'HLOOKUP lebih baru'], a: 0, x: 'H untuk Horizontal — kunci berada di baris teratas.' },
      { q: 'Tabel A2:C4 berisi K02|Teh|10000 di barisnya. Hasil =VLOOKUP("K02",A2:C4,3,FALSE)…', o: ['Teh', '10000', 'K02', '#N/A'], a: 1, x: 'Kolom 1=kunci, kolom 2=nama, kolom 3=harga → 10000.' },
      { q: 'Alternatif VLOOKUP yang kuncinya boleh di kolom mana saja…', o: ['INDEX & MATCH', 'SUMIF', 'CONCAT', 'COUNTA'], a: 0, x: 'INDEX mengambil nilai, MATCH mencari posisinya — kombinasi super fleksibel.' },
      { q: 'XLOOKUP tersedia mulai…', o: ['Excel 2007', 'Excel 2010', 'Excel 2013', 'Excel 2021 / 365'], a: 3, x: 'XLOOKUP adalah pengganti modern VLOOKUP di Excel terbaru.' }
    ]
  },
  m6: {
    title: 'Kuis Modul 6 · Analisis Data',
    qs: [
      { q: 'Shortcut menyalakan filter…', o: ['Ctrl+Shift+L', 'Ctrl+F', 'Alt+F4', 'Ctrl+K'], a: 0, x: 'Ctrl+Shift+L toggle filter on/off.' },
      { q: 'Pivot Table dipakai untuk…', o: ['Meringkas data besar dengan cepat', 'Menulis rumus rumit', 'Menggabung file', 'Mewarnai sel'], a: 0, x: 'Inti pivot: grouping + agregasi tanpa satu pun rumus.' },
      { q: '=COUNTIF(A1:A5,">70") melakukan apa?', o: ['Menghitung sel yang isinya >70', 'Menjumlahkan', 'Merata-rata', 'Menghapus data'], a: 0, x: 'COUNTIF menghitung dengan satu syarat.' },
      { q: 'Grafik paling tepat untuk tren waktu…', o: ['Pie', 'Line', 'Doughnut', 'Funnel'], a: 1, x: 'Line chart = perubahan sepanjang waktu.' },
      { q: 'Sort A to Z artinya…', o: ['Ascending (naik)', 'Descending (turun)', 'Acak', 'Filter'], a: 0, x: 'A→Z kecil ke besar; Z→A sebaliknya.' },
      { q: '=SUMIF(A1:A5,">70") melakukan apa?', o: ['Menjumlahkan sel >70', 'Menghitung sel >70', 'Merata-rata', 'Mencari teks'], a: 0, x: 'SUMIF menjumlahkan dengan satu syarat (tanpa argumen ke-3 = syarat sekaligus yang dijumlah).' },
      { q: 'Freeze Panes berfungsi…', o: ['Mengunci baris/kolom judul saat scroll', 'Mengunci rumus', 'Mengunci file', 'Mengunci warna'], a: 0, x: 'Wajib untuk tabel panjang: header selalu terlihat.' },
      { q: 'Bentuk data mentah terbaik untuk dianalisis…', o: ['Tabular rapi (tidy data)', 'Paragraf narasi', 'Penuh merge cells', 'Bebas, apa saja'], a: 0, x: 'Satu baris = satu record, satu kolom = satu variabel, tanpa merge.' }
    ]
  },
  m7: {
    title: 'Kuis Modul 7 · Data & Tanggal',
    qs: [
      { q: 'Hasil =TRIM("  halo   dunia ")…', o: ['halo dunia', '  halo dunia', 'Halo Dunia', 'halo'], a: 0, x: 'TRIM menghapus semua spasi berlebih di awal, tengah, dan akhir.' },
      { q: 'A1="2024-01-15". Hasil =YEAR(A1)…', o: ['2024', '15', '01', '1'], a: 0, x: 'YEAR mengambil komponen tahun dari tanggal.' },
      { q: 'Mengganti semua "-" dengan "/" pada A1…', o: ['=SUBSTITUTE(A1,"-","/")', '=REPLACE(A1,"-","/")', '=CHANGE(A1,"-","/")', '=TRIM(A1,"-","/")'], a: 0, x: 'SUBSTITUTE mengganti teks lama dengan teks baru, semua kemunculannya.' },
      { q: 'Hasil =TEXT(0.25,"0%")…', o: ['25%', '0.25%', '2.5%', '25'], a: 0, x: 'Format "0%" mengalikan nilai dengan 100 dan menambah tanda persen.' },
      { q: '=TODAY() menghasilkan…', o: ['Tanggal hari ini (update otomatis)', 'Tanggal statis saat diketik', 'Jam saat ini', 'Nama hari'], a: 0, x: 'TODAY selalu menampilkan tanggal sistem tanpa perlu argumen.' },
      { q: 'Selisih tahun antara D2 dan hari ini…', o: ['=DATEDIF(D2,TODAY(),"Y")', '=YEARS(D2,TODAY())', '=DIFF(D2,TODAY())', '=DATEDIF(D2,NOW(),"YY")'], a: 0, x: 'DATEDIF dengan unit "Y" menghitung tahun penuh.' },
      { q: 'Mengecek apakah B2 benar-benar kosong…', o: ['=ISBLANK(B2)', '=EMPTY(B2)', '=ISEMPTY(B2)', '=CHECK(B2)'], a: 0, x: 'ISBLANK → TRUE jika sel tidak berisi apa-apa.' },
      { q: 'Membersihkan "  beryl   SINAGA  " jadi "Beryl Sinaga"…', o: ['=PROPER(TRIM(A2))', '=TRIM(PROPER(A2))', '=UPPER(TRIM(A2))', '=CLEAN(A2)'], a: 0, x: 'TRIM buang spasi, lalu PROPER kapitalkan awal tiap kata.' },
      { q: '=NOW() dibanding =TODAY()…', o: ['NOW menyertakan jam penuh', 'TODAY menyertakan jam', 'Sama persis', 'NOW hanya di Excel 365'], a: 0, x: 'NOW = tanggal + jam; TODAY hanya tanggal.' },
      { q: '=IF(ISBLANK(A2),"isi dulu",A2) saat A2 kosong…', o: ['isi dulu', 'kosong', 'TRUE', 'A2'], a: 0, x: 'ISBLANK TRUE → nilai_jika_benar ("isi dulu") yang keluar.' },
      { q: 'A2 berisi "2023-05-20". Hasil =MONTH(A2)…', o: ['5', '05', '20', '2023'], a: 0, x: 'MONTH mengembalikan angka bulan: 5.' },
      { q: 'Hasil =ISNUMBER(42)…', o: ['TRUE', 'FALSE', '42', 'Error'], a: 0, x: 'ISNUMBER mengecek tipe data, bukan nilai.' }
    ]
  },
  exam: {
    title: '🎯 Ujian Akhir · 18 Soal Campuran',
    qs: [
      { q: '=SUM(A1:A3) jika A1=1, A2=2, A3=3 menghasilkan…', o: ['6', '123', '3', '9'], a: 0, x: '1+2+3 = 6.' },
      { q: 'Karakter pertama setiap rumus adalah…', o: ['=', '$', '@', '#'], a: 0, x: 'Rumus selalu diawali tanda sama dengan.' },
      { q: 'Hasil =IF(5>3,"A","B")…', o: ['A', 'B', 'TRUE', 'Error'], a: 0, x: 'Syarat benar → nilai pertama keluar.' },
      { q: 'Argumen ke-4 VLOOKUP untuk exact match…', o: ['TRUE', 'FALSE', 'EXACT', '0,5'], a: 1, x: 'FALSE/0 = pencarian persis.' },
      { q: 'Hasil =LEFT("ELEKTRO",4)…', o: ['ELEK', 'LEKT', 'KTRO', 'ELET'], a: 0, x: 'Empat karakter pertama: E-L-E-K.' },
      { q: 'Hasil =ROUND(7.25,0)…', o: ['7', '8', '7.2', '7.3'], a: 0, x: '0 desimal → bulat ke satuan terdekat; 7.25 → 7.' },
      { q: 'Ctrl+Z digunakan untuk…', o: ['Undo', 'Zoom', 'Paste', 'Save'], a: 0, x: 'Ctrl+Z membatalkan aksi terakhir.' },
      { q: 'Menyisipkan tanggal hari ini (statis)…', o: ['Ctrl+;', 'Ctrl+Shift+:', 'Alt+D', 'Ctrl+T'], a: 0, x: 'Ctrl+; = tanggal; Ctrl+Shift+: = jam.' },
      { q: 'F4 saat mengedit rumus berfungsi…', o: ['Mengunci referensi ($A$1)', 'Menghapus sel', 'Menyimpan file', 'Mencetak'], a: 0, x: 'F4 memutar mode absolut/relatif.' },
      { q: 'Hasil =COUNTA("a","b",1)…', o: ['3', '2', '1', 'Error'], a: 0, x: 'COUNTA menghitung semua sel tidak kosong, termasuk teks.' },
      { q: '#DIV/0! muncul ketika…', o: ['Membagi dengan nol', 'Teks terlalu panjang', 'Sel kosong dihapus', 'Rumus kurang kurung'], a: 0, x: 'Pembagian nol (termasuk sel kosong sebagai pembagi).' },
      { q: 'Hasil =UPPER("medan")…', o: ['MEDAN', 'Medan', 'medan', 'Error'], a: 0, x: 'UPPER mengkapitalkan seluruh teks.' },
      { q: 'Hasil =MID("ELEKTRO",3,3)…', o: ['EKT', 'LEK', 'KTR', 'TRO'], a: 0, x: 'Mulai karakter ke-3 (E), ambil 3 → E-K-T.' },
      { q: 'Grafik komposisi/persentase paling cocok…', o: ['Pie', 'Scatter', 'Histogram', 'Radar'], a: 0, x: 'Pie menunjukkan bagian dari keseluruhan (idealnya ≤6 irisan).' },
      { q: 'Hasil =IF(OR(FALSE,TRUE),"OK","NO")…', o: ['OK', 'NO', 'FALSE', 'Error'], a: 0, x: 'OR butuh minimal satu TRUE — terpenuhi.' },
      { q: 'Hasil =SUBSTITUTE("2024-01-15","-","/")…', o: ['2024/01/15', '2024-01-15', '20240115', '2024/01-15'], a: 0, x: 'Semua tanda - diganti menjadi /.' },
      { q: 'Fungsi menghitung selisih tanggal…', o: ['DATEDIF', 'DIFF', 'DATE', 'TIMEDIFF'], a: 0, x: '=DATEDIF(mulai, akhir, "Y"|"M"|"D").' },
      { q: 'Hasil =TEXT(0.5,"0%")…', o: ['50%', '0.5%', '5%', '500%'], a: 0, x: 'Format "0%" = nilai × 100 + tanda persen.' }
    ]
  },
  m8: {
    title: 'Kuis Modul 8 · Pivot Table',
    qs: [
      { q: 'Pivot Table digunakan untuk…', o: ['Meringkas dan menganalisis data besar dengan cepat', 'Menulis rumus yang kompleks', 'Menggabungkan beberapa file Excel', 'Membuat grafik saja'], a: 0, x: 'Pivot Table = alat agregasi tanpa rumus. Satu drag, ribuan baris terangkum.' },
      { q: 'Data yang ideal untuk Pivot Table adalah…', o: ['Tabular rapi: satu baris satu record, header di baris 1', 'Bebas formatnya, pivot bisa handle', 'Data dengan banyak merge cell', 'Data dalam bentuk narasi paragraf'], a: 0, x: 'Tidy data wajib: tidak ada merge cell, tidak ada baris kosong, header jelas.' },
      { q: 'Cara membuat Pivot Table di Excel…', o: ['Insert → PivotTable', 'Data → PivotTable', 'Home → PivotTable', 'Review → PivotTable'], a: 0, x: 'Tab Insert → PivotTable. Pilih range data lalu tentukan lokasi pivot.' },
      { q: 'Zona "Values" pada Pivot Table berisi…', o: ['Field yang akan dihitung (SUM/COUNT/AVG)', 'Label baris pengelompokan', 'Label kolom pengelompokan', 'Filter keseluruhan pivot'], a: 0, x: 'Values = field angka yang diagregasi. Bisa SUM, COUNT, AVERAGE, MAX, MIN.' },
      { q: 'Untuk menampilkan total penjualan per kota per bulan, field "Kota" diletakkan di zona…', o: ['Rows', 'Values', 'Filters', 'Columns atau Rows'], a: 3, x: 'Kota bisa di Rows (baris) atau Columns (kolom) tergantung orientasi yang diinginkan.' },
      { q: 'Setelah data sumber berubah, cara memperbarui Pivot Table…', o: ['Klik kanan → Refresh', 'Hapus dan buat ulang', 'Otomatis update sendiri', 'Ctrl+S'], a: 0, x: 'Pivot tidak auto-update. Klik kanan → Refresh, atau Alt+F5.' },
      { q: 'Slicer pada Pivot Table berfungsi sebagai…', o: ['Filter visual interaktif satu klik', 'Grafik tambahan', 'Rumus kustom', 'Warna sel otomatis'], a: 0, x: 'Slicer = tombol filter yang lebih visual dan intuitif dari dropdown filter biasa.' },
      { q: 'GETPIVOTDATA digunakan untuk…', o: ['Mengambil nilai dari Pivot Table ke dalam rumus', 'Membuat Pivot Table baru', 'Menghapus field dari pivot', 'Refresh data pivot'], a: 0, x: '=GETPIVOTDATA("field", ref_pivot, "dimensi1", "nilai1") — stabil meski pivot bergeser.' }
    ]
  },
  m9: {
    title: 'Kuis Modul 9 · Validasi & Format',
    qs: [
      { q: 'Dropdown pilihan di Excel dibuat via…', o: ['Data → Data Validation → List', 'Home → Sort', 'Insert → Chart', 'View → Freeze'], a: 0, x: 'Data Validation → List membatasi isi sel ke daftar yang kamu tentukan.' },
      { q: 'Agar kolom Stok hanya menerima angka 0–1000…', o: ['Validation Whole number between 0-1000', 'Filter 0-1000', 'Conditional Formatting', 'Freeze Panes'], a: 0, x: 'Whole number + between = batas numerik + pesan error otomatis.' },
      { q: 'Highlight RESTOCK otomatis memakai…', o: ['Conditional Formatting → Highlight Cell Rules', 'Data Validation', 'Pivot Table', 'Freeze Panes'], a: 0, x: 'CF menilai isi sel dan mewarnai otomatis saat kondisi terpenuhi.' },
      { q: 'Urutan benar CF teks spesifik…', o: ['Home → Conditional Formatting → Highlight → Equal To', 'Data → Validation → Equal', 'Insert → Highlight', 'Review → Equal'], a: 0, x: 'Equal To → ketik RESTOCK → pilih red fill.' },
      { q: 'Agar pesan error muncul saat input salah…', o: ['Centang Show error alert di Validation', 'Kunci file', 'Sembunyikan kolom', 'Matikan filter'], a: 0, x: 'Error Alert Stop/Warning/Information menentukan seberapa ketat penolakan.' },
      { q: 'Data Bars paling cocok untuk…', o: ['Banding cepat angka dalam satu kolom', 'Menggabung teks', 'Mencari VLOOKUP', 'Membuat pivot'], a: 0, x: 'Bar mini di dalam sel = perbandingan visual tanpa chart.' },
      { q: 'Circle Invalid Data berfungsi…', o: ['Menandai sel yang melanggar aturan validation', 'Menghapus data', 'Membuat lingkaran chart', 'Mengunci sel'], a: 0, x: 'Data → Validation → Circle Invalid Data, audit cepat file warisan.' },
      { q: 'Kombinasi gudang yang benar…', o: ['IF tentukan Status + CF warnai RESTOCK', 'SUM saja', 'Pivot saja', 'Print saja'], a: 0, x: 'Rumus menentukan logika, CF menentukan tampilan. Dua lapis pengaman.' }
    ]
  }
};

/* ================= SCENARIOS DATA ================= */
const SCENARIOS = {
  kosong: {},
  siswa: {
    A1: 'Nama', B1: 'Nilai', C1: 'Status',
    A2: 'Andi', B2: '80', C2: '=IF(B2>=75,"LULUS","REMED")',
    A3: 'Beryl', B3: '92', C3: '=IF(B3>=75,"LULUS","REMED")',
    A4: 'Citra', B4: '68', C4: '=IF(B4>=75,"LULUS","REMED")',
    A5: 'Dimas', B5: '75', C5: '=IF(B5>=75,"LULUS","REMED")',
    A7: 'Total', B7: '=SUM(B2:B5)',
    A8: 'Rata-rata', B8: '=ROUND(AVERAGE(B2:B5),1)',
    A9: 'Tertinggi', B9: '=MAX(B2:B5)',
    A10: 'Lulus', B10: '=COUNTIF(C2:C5,"LULUS")'
  },
  kasir: {
    A1: 'Kode', B1: 'Barang', C1: 'Harga',
    A2: 'K01', B2: 'Kopi', C2: '15000',
    A3: 'K02', B3: 'Teh', C3: '10000',
    A4: 'K03', B4: 'Susu', C4: '20000',
    E1: 'Input kode:', F1: 'K02',
    E2: 'Barang', F2: '=VLOOKUP(F1,A2:C4,2,FALSE)',
    E3: 'Harga', F3: '=VLOOKUP(F1,A2:C4,3,FALSE)',
    E4: 'Jumlah', F4: '3',
    E5: 'TOTAL', F5: '=F3*F4'
  },
  kode: {
    A1: 'Kode Barang', B1: 'Kategori =LEFT', C1: 'No Seri =RIGHT', D1: 'Gabungan',
    A2: 'ELT-2024-007', B2: '=LEFT(A2,3)', C2: '=RIGHT(A2,3)', D2: '=B2&"/"&C2',
    A3: 'MCH-2025-041', B3: '=LEFT(A3,3)', C3: '=RIGHT(A3,3)', D3: '=B3&"/"&C3',
    A4: 'PWR-2023-115', B4: '=LEFT(A4,3)', C4: '=RIGHT(A4,3)', D4: '=B4&"/"&C4'
  },
  logika: {
    A1: 'Nama', B1: 'Nilai', C1: 'Grade',
    A2: 'Andi', B2: '88', C2: '=IF(B2>=85,"A",IF(B2>=75,"B",IF(B2>=60,"C","D")))',
    A3: 'Beryl', B3: '95', C3: '=IF(B3>=85,"A",IF(B3>=75,"B",IF(B3>=60,"C","D")))',
    A4: 'Citra', B4: '72', C4: '=IF(B4>=85,"A",IF(B4>=75,"B",IF(B4>=60,"C","D")))',
    A5: 'Dimas', B5: '58', C5: '=IF(B5>=85,"A",IF(B5>=75,"B",IF(B5>=60,"C","D")))'
  },
  analisis: {
    A1: 'Kota', B1: 'Produk', C1: 'Penjualan',
    A2: 'Medan', B2: 'Laptop', C2: '4500000',
    A3: 'Jakarta', B3: 'Printer', C3: '1800000',
    A4: 'Medan', B4: 'Printer', C4: '2100000',
    A5: 'Surabaya', B5: 'Laptop', C5: '3900000',
    A6: 'Jakarta', B6: 'Laptop', C6: '5200000',
    A7: 'Medan', B7: 'Monitor', C7: '3200000',
    A8: 'Surabaya', B8: 'Printer', C8: '1600000',
    A9: 'Jakarta', B9: 'Monitor', C9: '2800000',
    A11: 'Analisis:',
    A12: 'Jml transaksi Medan', B12: '=COUNTIF(A2:A9,"Medan")',
    A13: 'Total penjualan Medan', B13: '=SUMIF(A2:A9,"Medan",C2:C9)',
    A14: 'Total penjualan Laptop', B14: '=SUMIF(B2:B9,"Laptop",C2:C9)',
    A15: 'Transaksi > 3jt', B15: '=COUNTIF(C2:C9,">3000000")',
    A16: 'Rata2 penjualan', B16: '=AVERAGE(C2:C9)',
    A17: 'Terbesar', B17: '=MAX(C2:C9)',
    A18: 'Terkecil', B18: '=MIN(C2:C9)'
  },
  gudang: {
    A1: 'Kode', B1: 'Barang', C1: 'Awal', D1: 'Keluar', E1: 'Sisa', F1: 'Status',
    A2: 'WH-PK-001', B2: 'Kardus', C2: '150', D2: '120', E2: '=C2-D2', F2: '=IF(E2<=$B$8,"RESTOCK","AMAN")',
    A3: 'WH-PK-002', B3: 'Lakban', C3: '200', D3: '80', E3: '=C3-D3', F3: '=IF(E3<=$B$8,"RESTOCK","AMAN")',
    A4: 'WH-EL-003', B4: 'Kabel', C4: '60', D4: '45', E4: '=C4-D4', F4: '=IF(E4<=$B$8,"RESTOCK","AMAN")',
    A5: 'WH-EL-004', B5: 'Lampu', C5: '90', D5: '70', E5: '=C5-D5', F5: '=IF(E5<=$B$8,"RESTOCK","AMAN")',
    A6: 'WH-AT-005', B6: 'Kertas A4', C6: '300', D6: '50', E6: '=C6-D6', F6: '=IF(E6<=$B$8,"RESTOCK","AMAN")',
    A7: 'TOTAL', C7: '=SUM(C2:C6)', D7: '=SUM(D2:D6)', E7: '=SUM(E2:E6)',
    A8: 'Min stok', B8: '30', D8: 'Cari kode:', E8: 'WH-EL-003', F8: '=VLOOKUP(E8,A2:B6,2,FALSE)',
    A9: 'Jml restock', B9: '=COUNTIF(F2:F6,"RESTOCK")', D9: 'Sisa+status:', E9: '=VLOOKUP(E8,A2:E6,5,FALSE)', F9: '=VLOOKUP(E8,A2:F6,6,FALSE)',
    A10: 'Total sisa', B10: '=SUM(E2:E6)', D10: 'Kategori:', E10: '=MID(E8,4,2)',
    A11: 'Rata2 sisa', B11: '=ROUND(AVERAGE(E2:E6),1)',
    A12: 'Stok max', B12: '=MAX(E2:E6)'
  },
  absensi: {
    A1: 'Nama', B1: 'Hadir', C1: 'Telat', D1: 'Lembur', E1: 'Skor', F1: 'Status',
    A2: 'Andi', B2: '20', C2: '1', D2: '5', E2: '=B2*10-C2*5+D2*2', F2: '=IF(E2>=180,"BAIK","BINA")',
    A3: 'Beryl', B3: '22', C3: '0', D3: '8', E3: '=B3*10-C3*5+D3*2', F3: '=IF(E3>=180,"BAIK","BINA")',
    A4: 'Citra', B4: '18', C4: '3', D4: '2', E4: '=B4*10-C4*5+D4*2', F4: '=IF(E4>=180,"BAIK","BINA")',
    A5: 'Dimas', B5: '15', C5: '5', D5: '0', E5: '=B5*10-C5*5+D5*2', F5: '=IF(E5>=180,"BAIK","BINA")',
    A6: 'Sinta', B6: '21', C6: '2', D6: '4', E6: '=B6*10-C6*5+D6*2', F6: '=IF(E6>=180,"BAIK","BINA")',
    A7: 'TOTAL', B7: '=SUM(B2:B6)', C7: '=SUM(C2:C6)', D7: '=SUM(D2:D6)', E7: '=SUM(E2:E6)',
    A8: 'Rata hadir', B8: '=ROUND(AVERAGE(B2:B6),1)',
    A9: 'Jml BAIK', B9: '=COUNTIF(F2:F6,"BAIK")',
    A10: 'Telat>2', B10: '=COUNTIF(C2:C6,">2")',
    A11: 'Skor max', B11: '=MAX(E2:E6)',
    A12: 'Skor min', B12: '=MIN(E2:E6)'
  },
  warung: {
    A1: 'Produk', B1: 'Modal', C1: 'Jual', D1: 'Laku', E1: 'Laba', F1: 'Total',
    A2: 'Kopi', B2: '3000', C2: '5000', D2: '120', E2: '=C2-B2', F2: '=E2*D2',
    A3: 'Teh', B3: '2500', C3: '4000', D3: '90', E3: '=C3-B3', F3: '=E3*D3',
    A4: 'Gorengan', B4: '1500', C4: '2500', D4: '200', E4: '=C4-B4', F4: '=E4*D4',
    A5: 'Nasi', B5: '8000', C5: '12000', D5: '60', E5: '=C5-B5', F5: '=E5*D5',
    A6: 'Mie', B6: '5000', C6: '8000', D6: '85', E6: '=C6-B6', F6: '=E6*D6',
    A7: 'TOTAL', D7: '=SUM(D2:D6)', F7: '=SUM(F2:F6)',
    A8: 'Total laba', B8: '=SUM(F2:F6)',
    A9: 'Rata laba', B9: '=ROUND(AVERAGE(F2:F6),0)',
    A10: 'Terlaris pcs', B10: '=MAX(D2:D6)',
    A11: 'Nama terlaris', B11: '=INDEX(A2:A6,MATCH(MAX(D2:D6),D2:D6,0))',
    A12: 'Laku>100', B12: '=COUNTIF(D2:D6,">100")'
  },
  bersih: {
    A1: 'Nama (kotor)', B1: 'Nama Bersih', C1: 'Email', D1: 'Tgl Gabung', E1: 'Lama Kerja (thn)',
    A2: '  beryl   nathaniel  ', B2: '=PROPER(TRIM(A2))', C2: '=LOWER(SUBSTITUTE(TRIM(A2)," ","."))&"@company.com"', D2: '2021-03-15', E2: '=DATEDIF(D2,TODAY(),"Y")',
    A3: '  CITRA   DEWI  ', B3: '=PROPER(TRIM(A3))', C3: '=LOWER(SUBSTITUTE(TRIM(A3)," ","."))&"@company.com"', D3: '2019-08-02', E3: '=DATEDIF(D3,TODAY(),"Y")',
    A4: 'andi  prasetyo', B4: '=PROPER(TRIM(A4))', C4: '=LOWER(SUBSTITUTE(TRIM(A4)," ","."))&"@company.com"', D4: '2023-01-10', E4: '=DATEDIF(D4,TODAY(),"Y")',
    A6: 'Hari ini', B6: '=TODAY()',
    A7: 'Jumlah pegawai', B7: '=COUNTA(B2:B4)',
    A8: 'Format persen', B8: '=TEXT(0.85,"0%")'
  }
};

const SCEN_HINT = {
  siswa: '📚 Coba ubah angka di B2:B5 — Total, Rata-rata, dan Status LULUS/REMED ikut berubah otomatis. COUNTIF di B10 menghitung banyaknya yang lulus.',
  kasir: '🛒 Ketik K01 / K02 / K03 di sel F1 lalu Enter — VLOOKUP mengambil nama barang & harga otomatis, TOTAL langsung terhitung.',
  kode: '🔤 LEFT mengambil 3 karakter pertama, RIGHT mengambil 3 karakter terakhir, operator & menggabung dengan garis miring.',
  logika: '🧠 IF bertingkat mengubah angka menjadi grade A/B/C/D. Mulai dari syarat paling ketat (≥85). Ubah angkanya dan lihat!',
  analisis: '📊 Data penjualan 8 transaksi dari 3 kota. B12:B18 berisi COUNTIF, SUMIF, AVERAGE, MAX, MIN. Coba ubah nilai di kolom C atau ganti nama kota — semua analisis langsung update!',
  kosong: '⬜ Kanvas kosong. Klik sel mana pun, ketik angka atau rumus (awali dengan =), lalu Enter.',
  bersih: '🧹 Nama di kolom A sengaja kotor (spasi dobel, huruf campur). TRIM membersihkan, PROPER mengkapitalkan, SUBSTITUTE+LOWER membuat email, DATEDIF menghitung lama kerja dari tgl gabung sampai hari ini.',
  gudang: '🏭 Simulasi gudang: ubah angka Keluar di D2:D6 — Sisa (E) dan Status (F) update otomatis via IF + $B$8. Ganti kode di E8 — VLOOKUP cari nama/sisa/status. COUNTIF hitung restock, MID bongkar kategori dari kode.',
  absensi: '🧑‍💼 Simulasi HR: ubah Hadir/Telat/Lembur — Skor (E) =B*10-C*5+D*2 dan Status (F) IF update otomatis. COUNTIF hitung BAIK dan Telat>2.',
  warung: '🍜 Simulasi warung: Laba (E) =Jual-Modal, Total (F) =Laba*Laku. INDEX+MATCH cari produk terlaris otomatis, COUNTIF hitung laku>100.',
  pivot: '📊 Data transaksi 8 baris. Coba COUNTIF dan SUMIF untuk merangkum per kota: =COUNTIF(A2:A9,"Medan") dan =SUMIF(A2:A9,"Medan",C2:C9). Ini simulasi manual dari apa yang Pivot Table lakukan otomatis!'
};

/* ================= VIDEOS DATA ================= */
const VIDEOS = [
  { id: '6WgvzCU3TI8', t: 'Belajar Excel dari Nol — Ep 1', ch: 'Ignasius Ryan', lang: '🇮🇩', mod: 'Modul 1 · Dasar' },
  { id: 'dirL25HSunk', t: 'Tutorial Excel untuk Pemula', ch: 'Pusat Cara Cara', lang: '🇮🇩', mod: 'Modul 1 & 2 · Dasar & Rumus' },
  { id: 'TkHpDNiyQGQ', t: 'SUM, AVERAGE, COUNT — Rumus Paling Sering Dipakai', ch: 'Ignasius Ryan', lang: '🇮🇩', mod: 'Modul 2 · Rumus Dasar' },
  { id: 'MXf6OgOxVo8', t: 'Belajar Rumus IF Excel — Lengkap', ch: 'Hendra Jaisan', lang: '🇮🇩', mod: 'Modul 4 · Fungsi Logika' },
  { id: '0t6Put8uRyE', t: 'Kolom Status Dinamis dengan IF & Tanggal', ch: 'Teis', lang: '🇬🇧', mod: 'Modul 4 & 7 · Logika & Tanggal' },
  { id: 'K3MicvRMYkM', t: 'VLOOKUP Tutorial Lengkap', ch: 'Ignasius Ryan', lang: '🇮🇩', mod: 'Modul 5 · Lookup' },
  { id: '4c0CLUER6nw', t: 'XLOOKUP (5 Contoh Lengkap)', ch: 'Leila Gharani', lang: '🇬🇧', mod: 'Modul 5 · Lookup' },
  { id: 'Qsj5gDEQ088', t: 'Cara Membuat Pivot Table', ch: 'Budi Tutorials', lang: '🇮🇩', mod: 'Modul 6 & 8 · Analisis & Pivot' },
  { id: 'g530cnFfn8Y', t: 'Pivot Table Lengkap dari Nol', ch: 'Ignasius Ryan', lang: '🇮🇩', mod: 'Modul 8 · Pivot Table' },
  { id: 'UBX2QQR-ixs', t: 'Membersihkan Data di Excel (TRIM, SUBSTITUTE, dll)', ch: 'ExcelJet', lang: '🇬🇧', mod: 'Modul 7 · Data Bersih' },
];

/* ================= SHORTCUTS DATA ================= */
const SHORTCUTS = [
  { k: 'Ctrl + C', d: 'Menyalin (Copy)' },
  { k: 'Ctrl + X', d: 'Memotong (Cut)' },
  { k: 'Ctrl + V', d: 'Menempel (Paste)' },
  { k: 'Ctrl + Z', d: 'Membatalkan aksi (Undo)' },
  { k: 'Ctrl + Y', d: 'Mengulang aksi (Redo)' },
  { k: 'Ctrl + S', d: 'Menyimpan file' },
  { k: 'Ctrl + B', d: 'Menebalkan teks (Bold)' },
  { k: 'Ctrl + 1', d: 'Membuka Format Cells' },
  { k: 'Ctrl + ;', d: 'Menyisipkan tanggal hari ini' },
  { k: 'Ctrl + Shift + :', d: 'Menyisipkan jam saat ini' },
  { k: 'F2', d: 'Mengedit sel aktif' },
  { k: 'F4', d: 'Mengunci referensi $ / mengulang aksi terakhir' },
  { k: 'Alt + =', d: 'AutoSUM otomatis' },
  { k: 'Ctrl + Shift + L', d: 'Menyalakan/mematikan Filter' },
  { k: 'Ctrl + Home', d: 'Lompat ke sel A1' },
  { k: 'Ctrl + End', d: 'Lompat ke sel data terakhir' },
  { k: 'Ctrl + Panah', d: 'Lompat ke tepi area data' },
  { k: 'Ctrl + Shift + Panah', d: 'Blok sampai tepi data' },
  { k: 'Ctrl + PgDn / PgUp', d: 'Pindah antar sheet' },
  { k: 'Ctrl + D', d: 'Fill Down (isi ke bawah)' },
  { k: 'Ctrl + R', d: 'Fill Right (isi ke kanan)' },
  { k: 'Alt + Enter', d: 'Baris baru di dalam satu sel' },
  { k: 'Ctrl + F', d: 'Mencari (Find)' },
  { k: 'Ctrl + H', d: 'Cari & ganti (Replace)' },
  { k: 'Ctrl + T', d: 'Membuat Table resmi' }
];

/* ================= REFERENCES DATA ================= */
const REFS = [
  ['SUM', '=SUM(range)', 'Menjumlahkan seluruh angka dalam range.', '=SUM(B2:B10)', 'Matematika'],
  ['AVERAGE', '=AVERAGE(range)', 'Rata-rata dari angka dalam range.', '=AVERAGE(B2:B10)', 'Matematika'],
  ['COUNT', '=COUNT(range)', 'Menghitung banyaknya sel berisi angka.', '=COUNT(A1:A20)', 'Matematika'],
  ['COUNTA', '=COUNTA(range)', 'Menghitung banyaknya sel tidak kosong.', '=COUNTA(A1:A20)', 'Matematika'],
  ['MIN / MAX', '=MIN(range) · =MAX(range)', 'Nilai terkecil / terbesar.', '=MAX(C2:C50)', 'Matematika'],
  ['ROUND', '=ROUND(angka, desimal)', 'Membulatkan ke n angka desimal.', '=ROUND(3.456,1) → 3.5', 'Matematika'],
  ['ABS', '=ABS(angka)', 'Nilai mutlak.', '=ABS(-7) → 7', 'Matematika'],
  ['SUMIF', '=SUMIF(range_syarat, syarat, [range_jumlah])', 'Menjumlahkan dengan satu syarat.', '=SUMIF(A2:A50,"Medan",D2:D50)', 'Matematika'],
  ['SUMIFS', '=SUMIFS(sum_range, range1, syarat1, ...)', 'Menjumlahkan dengan banyak syarat.', '=SUMIFS(D2:D50,A2:A50,"Medan",C2:C50,"Laptop")', 'Matematika'],
  ['COUNTIF', '=COUNTIF(range, syarat)', 'Menghitung sel yang memenuhi syarat.', '=COUNTIF(B2:B100,">=75")', 'Matematika'],
  ['COUNTIFS', '=COUNTIFS(range1, syarat1, ...)', 'Menghitung dengan banyak syarat.', '=COUNTIFS(A2:A50,"Medan",C2:C50,">1000000")', 'Matematika'],
  ['LEFT', '=LEFT(teks, n)', 'Mengambil n karakter dari kiri.', '=LEFT("MEDAN",3) → MED', 'Teks'],
  ['RIGHT', '=RIGHT(teks, n)', 'Mengambil n karakter dari kanan.', '=RIGHT("EXCEL",2) → EL', 'Teks'],
  ['MID', '=MID(teks, mulai, n)', 'Mengambil n karakter mulai posisi tertentu.', '=MID("TEKNIK",2,3) → EKN', 'Teks'],
  ['LEN', '=LEN(teks)', 'Jumlah karakter (termasuk spasi).', '=LEN("HALO") → 4', 'Teks'],
  ['UPPER / LOWER', '=UPPER(teks)', 'Kapital semua / kecil semua.', '=UPPER("medan") → MEDAN', 'Teks'],
  ['PROPER', '=PROPER(teks)', 'Kapital di awal setiap kata.', '=PROPER("beryl sinaga")', 'Teks'],
  ['TRIM', '=TRIM(teks)', 'Membuang spasi berlebih.', '=TRIM("  a  b ") → a b', 'Teks'],
  ['CONCATENATE / &', '=CONCATENATE(a,b,...) atau a&b', 'Menggabungkan teks.', '=A1&" "&B1', 'Teks'],
  ['SUBSTITUTE', '=SUBSTITUTE(teks, lama, baru)', 'Mengganti teks tertentu.', '=SUBSTITUTE(A1," ","-")', 'Teks'],
  ['TEXT', '=TEXT(nilai, format)', 'Mengubah angka jadi teks berformat.', '=TEXT(0.5,"0%") → 50%', 'Teks'],
  ['IF', '=IF(syarat, jika_benar, jika_salah)', 'Menghasilkan nilai berdasarkan syarat.', '=IF(B2>=75,"LULUS","REMED")', 'Logika'],
  ['IFS', '=IFS(s1, h1, s2, h2, ...)', 'IF bertingkat yang lebih rapi (Excel 2019+).', '=IFS(B2>=85,"A",B2>=75,"B")', 'Logika'],
  ['AND / OR', '=AND(...) · =OR(...)', 'Semua benar / minimal satu benar.', '=AND(A2>=70,B2>=70)', 'Logika'],
  ['NOT', '=NOT(logika)', 'Membalik nilai TRUE/FALSE.', '=NOT(A2="GAGAL")', 'Logika'],
  ['IFERROR', '=IFERROR(rumus, pengganti)', 'Mengganti error dengan nilai lain.', '=IFERROR(VLOOKUP(...),"N/A")', 'Logika'],
  ['VLOOKUP', '=VLOOKUP(kunci, tabel, kolom, FALSE)', 'Mencari data secara vertikal antar tabel.', '=VLOOKUP(F1,A2:C4,3,FALSE)', 'Lookup'],
  ['HLOOKUP', '=HLOOKUP(kunci, tabel, baris, FALSE)', 'Mencari data secara horizontal.', '=HLOOKUP(F1,A2:E3,2,FALSE)', 'Lookup'],
  ['INDEX', '=INDEX(range, baris, [kolom])', 'Mengambil nilai pada posisi tertentu.', '=INDEX(C2:C10,4)', 'Lookup'],
  ['MATCH', '=MATCH(kunci, range, 0)', 'Mencari posisi kunci dalam range.', '=MATCH("K02",A2:A10,0)', 'Lookup'],
  ['XLOOKUP', '=XLOOKUP(kunci, range_kunci, range_hasil)', 'Lookup modern pengganti VLOOKUP (2021/365).', '=XLOOKUP(F1,A2:A4,C2:C4)', 'Lookup'],
  ['TODAY', '=TODAY()', 'Tanggal hari ini (otomatis update).', '=TODAY()', 'Tanggal'],
  ['NOW', '=NOW()', 'Tanggal + jam saat ini.', '=NOW()', 'Tanggal'],
  ['DATEDIF', '=DATEDIF(mulai, akhir, "Y")', 'Selisih tanggal (tahun/bulan/hari).', '=DATEDIF(A2,TODAY(),"Y")', 'Tanggal'],
  ['YEAR / MONTH / DAY', '=YEAR(tanggal)', 'Mengambil bagian tahun/bulan/hari.', '=YEAR(A2)', 'Tanggal'],
  ['ISNUMBER / ISBLANK', '=ISNUMBER(sel) · =ISBLANK(sel)', 'Cek tipe / sel kosong → TRUE/FALSE.', '=ISBLANK(B2)', 'Info & Error'],
  ['ISERROR', '=ISERROR(sel)', 'Cek apakah nilai adalah error.', '=ISERROR(D2)', 'Info & Error']
];

const CATS = ['Semua', 'Matematika', 'Teks', 'Logika', 'Lookup', 'Tanggal', 'Info & Error'];

/* ================= MODULES LIST ================= */
const MODULES = [
  ['m1', 'Dasar Excel', 'Istilah, alamat sel, dan cara Excel berpikir.'],
  ['m2', 'Rumus Dasar', 'SUM, AVERAGE, COUNT, MIN/MAX, ROUND, dan tanda $.'],
  ['m3', 'Fungsi Teks', 'LEFT, RIGHT, MID, CONCATENATE — bedah kode & rapikan data.'],
  ['m4', 'Fungsi Logika', 'IF, AND, OR, dan IF bertingkat untuk keputusan otomatis.'],
  ['m5', 'VLOOKUP & Lookup', 'Skill favorit tes kerja: cari data antar tabel + IFERROR.'],
  ['m6', 'Analisis Data', 'Sort, Filter, COUNTIF/SUMIF, Pivot Table, dan grafik.'],
  ['m7', 'Data Bersih & Tanggal', 'TRIM, SUBSTITUTE, TEXT, TODAY, DATEDIF — bersihkan data & hitung tanggal.'],
  ['m8', 'Pivot Table', 'Rangkum ribuan baris jadi insight dalam hitungan detik — tanpa rumus.'],
  ['m9', 'Validasi & Format', 'Dropdown, batas input, dan highlight otomatis RESTOCK/BAIK.'],
];
