# 📊 Panduan Kalibrasi Regresi Linier untuk SDR

## Tujuan
Mengkalibrasi pembacaan daya mentah dari RTL-SDR menjadi nilai daya sebenarnya (dBm) menggunakan regresi linier.

## Formula Kalibrasi
```
Nilai Sebenarnya (dBm) = m × (Nilai Bacaan SDR) + c
```

Dimana:
- `m` = slope (kemiringan) - didapat dari regresi linier
- `c` = intercept (titik potong) - didapat dari regresi linier

## Langkah-langkah

### 1. Kumpulkan Data Kalibrasi
Lakukan pengukuran di laboratorium dengan Signal Generator:
- Set Signal Generator ke berbagai nilai (misal: 0 dBm, -5 dBm, -10 dBm, -15 dBm, dst)
- Catat nilai yang dibaca oleh SDR Index 0 (CPL_in)
- Catat nilai yang dibaca oleh SDR Index 1 (CPL_out)

### 2. Jalankan Script Kalibrasi
```bash
python kalibrasi.py
```

**PENTING:** Edit file `kalibrasi.py` terlebih dahulu dan ganti data contoh dengan data hasil pengukuranmu:
- `X_sdr_0` = nilai bacaan mentah dari SDR Index 0 (dalam dB)
- `Y_sigen_0` = nilai sebenarnya dari Signal Generator saat mengukur SDR 0 (dalam dBm)
- `X_sdr_1` = nilai bacaan mentah dari SDR Index 1 (dalam dB)
- `Y_sigen_1` = nilai sebenarnya dari Signal Generator saat mengukur SDR 1 (dalam dBm)

### 3. Copy Konstanta ke Kode
Setelah menjalankan `kalibrasi.py`, script akan menampilkan konstanta seperti:
```
M_SDR_0 = 1.023456
C_SDR_0 = 0.456789
M_SDR_1 = 1.012345
C_SDR_1 = 0.567890
```

Copy konstanta ini ke:
- `TA_test_daya.py` (baris 18-21)
- `sdr_backend_service.py` (baris 23-26)

### 4. Verifikasi
- Nilai R-squared harus mendekati 1.0 (semakin dekat 1.0, semakin akurat)
- Grafik scatter plot akan tersimpan sebagai `kalibrasi_regresi.png`
- Cek error prediksi di output script

## File yang Telah Diupdate

### ✅ `kalibrasi.py` (BARU)
Script untuk menghitung konstanta kalibrasi menggunakan scikit-learn.

### ✅ `TA_test_daya.py`
- Menambahkan konstanta kalibrasi di bagian atas
- Menerapkan formula kalibrasi pada perhitungan power
- Output sekarang dalam dBm (sudah terkalibrasi)

### ✅ `sdr_backend_service.py`
- Menambahkan konstanta kalibrasi di bagian atas
- Menerapkan formula kalibrasi pada perhitungan power di backend service

## Catatan Penting

1. **Data Minimal:** Butuh minimal 2 titik data untuk regresi linier, tapi lebih banyak data = lebih akurat
2. **Default Values:** Jika belum dikalibrasi, konstanta default (m=1.0, c=0.0) akan digunakan = tidak ada kalibrasi
3. **Dua SDR Terpisah:** Setiap SDR (Index 0 dan Index 1) memiliki konstanta kalibrasi sendiri karena karakteristiknya berbeda
4. **R-squared:** Nilai mendekati 1.0 menunjukkan hubungan linier yang kuat antara bacaan SDR dan nilai sebenarnya

## Troubleshooting

**Error: "pip tidak dikenali"**
```bash
python -m pip install scikit-learn matplotlib
```

**Error: "matplotlib tidak terinstall"**
- Script tetap bisa berjalan, hanya grafik yang tidak akan dibuat
- Install dengan: `python -m pip install matplotlib`

**Data tidak linier?**
- Cek apakah ada kesalahan dalam pengukuran
- Pastikan kondisi pengukuran konsisten (frekuensi, gain, dll)
- Jika R-squared < 0.95, pertimbangkan untuk mengulang pengukuran



