# Drinkly — Fuzzy Logic System

Drinkly adalah sebuah Sistem Pakar berbasis **Logika Fuzzy (Fuzzy Logic)** untuk mengecek tingkat dehidrasi tubuh dan memberikan rekomendasi target kebutuhan cairan harian berdasarkan jumlah air yang diminum, intensitas aktivitas fisik, suhu lingkungan, dan frekuensi buang air kecil.

Proyek ini dibuat untuk memenuhi **Kebutuhan Responsi Praktikum Kecerdasan Buatan**.

## Live Demo
**[https://drinkly-fuzzy-logic-system.vercel.app/](https://drinkly-fuzzy-logic-system.vercel.app/)**

## Informasi Mahasiswa
- **Nama:** Salsabila Firzah Amanina
- **NIM:** H1D024069
- **Shift Awal:** Shift F
- - **Shift Akhir:** Shift E

## Teknologi yang Digunakan
- **Backend:** Python (Flask)
- **Frontend:** HTML5, Vanilla CSS, JavaScript
- **Deployment:** Vercel

## Parameter Logika Fuzzy
Sistem ini menggunakan algoritma Inferensi Fuzzy dengan metode *Weighted Average* yang mempertimbangkan 4 parameter input utama:
1. **Jumlah Air Diminum** (ml)
2. **Intensitas Aktivitas Fisik** (Skala ringan - berat)
3. **Suhu Lingkungan** (°C)
4. **Frekuensi Buang Air Kecil** (Kali)

Hasil inferensi akan menentukan **Tingkat Dehidrasi** (Terhidrasi Baik, Dehidrasi Ringan, Dehidrasi Sedang, atau Dehidrasi Berat) beserta rekomendasi tambahan asupan air yang dibutuhkan hari ini.

## Cara Menjalankan Secara Lokal
Jika Anda ingin menjalankan proyek ini secara lokal, ikuti langkah-langkah berikut:

1. Clone repositori ini:
   ```bash
   git clone https://github.com/salsabilafirzah/Drinkly-FuzzyLogicSystem.git
   cd Drinkly-FuzzyLogicSystem
   ```
2. Pastikan Python sudah terinstall, lalu install Flask:
   ```bash
   pip install -r requirements.txt
   ```
3. Jalankan aplikasi:
   ```bash
   python drinkly.py
   ```
4. Buka browser dan akses `http://127.0.0.1:5000/`
