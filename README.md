# 📊 Airdrop Income Tracker

Aplikasi web sederhana untuk mencatat, melihat, dan menganalisis income dari airdrop secara bulanan dan tahunan. Cocok untuk para crypto hunter yang ingin mengelola hasil airdrop mereka dengan lebih terstruktur.

## 🚀 Fitur

- Tambah dan simpan data airdrop ke dalam file JSON
- Lihat daftar airdrop berdasarkan bulan dan tahun
- Analisis total pendapatan dari airdrop
- UI sederhana dan responsif berbasis HTML/CSS/JS

## 🛠️ Cara Install

Pastikan kamu sudah menginstall [Node.js](https://nodejs.org).

```bash
# Install dependensi
npm install express

# Inisialisasi project (opsional jika belum)
npm init -y

# Jalankan server
node server.js
```

Akses aplikasi di browser melalui:
```bash
http://localhost:3000
```

## 📁 Struktur Folder
```plaintext
pembukuan-airdrop/
├── public/
│   ├── index.html       # Halaman utama
│   ├── style.css        # Gaya tampilan
│   ├── script.js        # Logika interaktif
│   └── logo-footer.png  # Logo footer
├── data/
│   └── airdrops.json    # Data hasil airdrop
├── server.js            # Server Express
├── package.json         # Konfigurasi project Node.js
```
