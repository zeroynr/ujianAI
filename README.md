﻿# ujianAI
# 📌 Deteksi Kesopanan Teks Berbasis Web

## 📝 Deskripsi Singkat
Proyek ini adalah aplikasi web sederhana untuk mendeteksi apakah suatu teks termasuk **sopan** atau **tidak sopan**. Sistem ini mengimplementasikan **metode learning dengan algoritma Naive Bayes** secara manual menggunakan **JavaScript**, tanpa menggunakan library pembelajaran mesin (machine learning) atau framework eksternal.

## 🎯 Tujuan Proyek
- Menyediakan antarmuka web agar pengguna bisa memasukkan teks.
- Mengklasifikasikan teks sebagai "Sopan" atau "Tidak Sopan".



## 🛠 Teknologi yang Digunakan
- **HTML** → Struktur dan konten halaman web
- **CSS** → Desain tampilan antarmuka pengguna
- **JavaScript (Vanilla)** → Proses tokenisasi, perhitungan probabilitas Naive Bayes, dan klasifikasi
- Tidak menggunakan framework seperti React, Vue, atau library ML seperti TensorFlow, scikit-learn, dsb.

## 🔍 Cara Kerja Aplikasi
1. Pengguna mengetik teks di area input.
2. Sistem melakukan tokenisasi dan menghitung kemunculan kata-kata sopan dan tidak sopan berdasarkan kamus sederhana.
3. Dengan menggunakan rumus **Naive Bayes**, sistem menghitung probabilitas masing-masing kategori.
4. Output hasil klasifikasi ditampilkan di layar secara langsung.

## 🧠 Penjelasan Naive Bayes Manual
- Setiap kategori ("Sopan" dan "Tidak Sopan") memiliki daftar kata yang diasumsikan mewakili kategori tersebut.
- Sistem menghitung probabilitas setiap kata dalam input muncul dalam masing-masing kategori.
- Probabilitas akhir dihitung dengan mengalikan peluang tiap kata, lalu dibandingkan.
- Kategori dengan probabilitas tertinggi akan dipilih sebagai hasil klasifikasi.

