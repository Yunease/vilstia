# 樟庭徊路 🌙

Sebuah blog pribadi **Astro** berbasis模板 **Fuwari** yang telah dimodifikasi, saat ini menyimpan mimpi, pikiran acak, dan kreasi dari <span style="color: #87CEFA; font-weight: 700;">琴泠</span>.

---

## Daftar Isi

- [Tentang Proyek](#tentang-proyek)
- [Fitur Asli Fuwari](#fitur-asli-fuwari)
- [Konten yang Saya Modifikasi](#konten-yang-saya-modifikasi)
- [Tech Stack](#tech-stack)
- [Jalankan Lokal](#jalankan-lokal)
- [Struktur Konten](#struktur-konten)
- [Lisensi](#lisensi)

---

## Tentang Proyek

Ini adalah situs taman pribadi yang saat ini dalam pemeliharaan. Saya menggunakannya untuk menyimpan hal-hal yang tidak cocok untuk diposting di platform publik:

- Pemikiran yang belum matang tapi jujur
- Pandangan dunia yang terputus-putus
- Prototipe game dan cerita
- Eksperimen kode
- Dan hal-hal yang hanya ingin saya katakan kepada diri sendiri
- Jurnal dan karya pribadi

Anda bisa memahami ini sebagai: **Blog + Pikiran + Repositori Kreasi + Memo Internal**

---

## Fitur Asli Fuwari

Proyek ini dibangun di atas template [saicaca/fuwari](https://github.com/saicaca/fuwari), yang menyediakan fitur inti berikut:

### Fitur Inti
- Built on **Astro** static site framework
- **Tailwind CSS** styling system
- Animasi halus dan transisi halaman (berdasarkan Swup)
- Pergantian tema terang/gelap
- Warna tema & Banner yang dapat disesuaikan
- Desain responsif
- Pencarian di situs (berdasarkan Pagefind)
- Sintaks Markdown yang diperluas
- Daftar Isi (TOC)
- Langganan RSS

### Struktur Halaman Asli
- Beranda (daftar artikel)
- Halaman Arsip
- Halaman Tentang
- Halaman Detail Artikel

---

## Apa yang saya modifikasi:

### Halaman Baru & Jenis Konten

#### 1. 叙梦协定 (`/dream`)
Halaman khusus untuk mencatat mimpi. Tempat mimpi dan kenyataan bersilangan, menyimpan dunia aneh yang muncul dalam tidur.

>Those that are fleeting, if not carefully preserved, will be lost forever.

#### 2. 心灵碎片 (`/rant`)
Tempat untuk menyimpan吐槽 singkat, fragmen emosi, pemikiran langsung. Mengatakan apa saja, tergantung suasana hati. Bagian ini tidak akan menampilkan item artikel dengan title, melainkan menampilkan sepenuhnya mengabaikan informasi title, tetapi Anda masih dapat mengakses halaman artikel melalui URL yang sesuai (item artikel dengan field "mess" tidak akan masuk ke halaman arsip)

#### 3. 回廊画架 (`gallery`)

Bagian fungsi untuk menyimpan karya lukisan pribadi, menggunakan layout seperti pixiv. Image hosting adalah `postimg`, memerlukan file md memiliki title img, jika tidak tidak akan ditampilkan.

#### 4. 截光求影 (`photo`)

Tempat penyimpanan karya fotografi pribadi, masih dalam pengembangan, harap ditunggu.

#### 5. Menu 剪影

Menambahkan menu dropdown "剪影" di bilah navigasi, mengintegrasikan akses ke berbagai halaman khusus. Mungkin akan menambahkan板块 baru di masa depan berdasarkan pemeliharaan. 剪影 telah diadaptasi untuk tata letak seluler, dapat diklik untuk memperluas.

### Perluasan Kategori Konten

Menambahkan field `mood` untuk mencatat suasana hati setiap artikel.

Field `mood` sesuai dengan enam emosi, masing-masing dengan warna heksadesimal:

```
Emosi Positif：
平和 Merah muda
振奋 Oranye
开心 Hijau

Emosi Negatif：
怨恨 Ungu
烦躁 Merah
消沉 Abu -abu
```

Jika Anda ingin menambahkan warna berbeda, periksa bagian kode yang sesuai di .astro (saya sudah menambahkan catatan komentar)

### Organisasi Konten

- **Artikel Blog**: Artikel teknis, konten panjang, konten yang terorganisir

- **Mimpi (dream)**: Mencatat mimpi, diklasifikasikan dengan tag `dream`

- **Pesan (message)**:吐槽 singkat, fragmen emosi, diklasifikasikan dengan tag `mess`, file md dengan field `mess` tidak akan masuk ke arsip. Pesan memiliki field mood dengan warna heksadesimal yang sesuai, tabel warna yang sesuai adalah:

  ```typescript
  焦躁: "#E06C75",
  消沉: "#7F8C8D",
  怨恨: "#C792EA",
  开心: "#3CB371",
  平和: "#FFB6C1",
  振奋: "#F4A460",
  ```

  Jika menambahkan field yang tidak ada, akan menggunakan warna gaya global astro.

  > Sangat disarankan untuk membuat warna heksadesimal baru.

- **Foto (photo)**: Karya fotografi, diklasifikasikan dengan tag `photo`, file md dengan field `photo` tidak akan masuk ke arsip
- **Galeri (gallery)**: Karya lukisan, diklasifikasikan dengan tag `gallery`, file md dengan field `gallery` tidak akan masuk ke arsip

### Tautan Sosial

Integrasi tautan sosial pribadi:
- Bilibili
- Bangumi (menggunakan ikon SVG kustom, telah menggunakan ikon SVG lokal)
- Pixiv
- Sedang mencoba mengembangkan板块友链

---

## Tech Stack

| Teknologi | Penggunaan |
|-----------|------------|
| Astro | Static site framework |
| Tailwind CSS | Sistem styling |
| Svelte | Komponen interaktif |
| Swup | Animasi transisi halaman |
| Pagefind | Pencarian di situs |
| KaTeX | Rendering rumus matematika |
| Expressive Code | Peningkatan blok kode |
| Markdown / MDX | Penulisan konten |

---

## Jalankan Lokal

```bash
# Instal dependensi (membutuhkan pnpm >= 9)
pnpm install
# Mulai server pengembangan
pnpm dev
# Buat artikel baru
pnpm new-post <filename>
# Build versi produksi
pnpm build
# Pratinjau hasil build
pnpm preview
# Periksa kode
pnpm check
# Format kode
pnpm format
```

---

## Struktur Konten

```
src/
├── assets/           # Aset statis
│   ├── images/       # Sumber gambar
│   └── svg/         # Ikon SVG kustom
├── components/       # Komponen
│   ├── DreamPage.astro      # Komponen halaman mimpi (baru)
│   ├── RantPage.astro       # Komponen halaman pesan (baru)
│   └── widget/
│       └── SilhouetteDropdown.astro  # Menu dropdown 剪影 (baru)
├── content/          # File konten
│   ├── posts/        # Artikel
│   │   ├── dream/    # Direktori artikel mimpi (baru)
│   │   └── message/  # Direktori artikel pesan (baru)
│   └── spec/         # Konten halaman khusus
├── layouts/          # Tata letak
├── pages/            # Rute halaman
│   ├── dream/[...page].astro  # Halaman daftar mimpi (baru)
│   └── rant/[...page].astro   # Halaman daftar pesan (baru)
├── styles/           # File gaya
├── utils/            # Fungsi utilitas
│   ├── dream-utils.ts    # Pemrosesan konten mimpi (baru)
│   └── mess-utils.ts     # Pemrosesan konten pesan (baru)
└── config.ts         # Konfigurasi situs
```

### Frontmatter Artikel

```yaml
---
title: Judul artikel
published: 2024-01-01
description: Deskripsi artikel
image: ./cover.jpg
tags: [dream]      # dream: mimpi, mess: pesan
category: Kategori
draft: false
mood: 烦躁          # Suasana hati (field baru), hanya untuk bagian pesan
lang: zh_CN
---
```

---

## Ucapan Terima Kasih

- [Fuwari](https://github.com/saicaca/fuwari) - Template blog yang luar biasa
- [Astro](https://astro.build) - Static site framework yang kuat
- Vilstia - Teman terbaik saya

---

## Lisensi

Konten proyek ini dilisensikan di bawah [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).

Template asli Fuwari menggunakan Lisensi MIT, lihat [Fuwari License](https://github.com/saicaca/fuwari/blob/main/LICENSE) untuk detail.
