# 🚀 Panduan Menjalankan Program Tugas Akhir

## 📋 Prasyarat

Pastikan sudah terinstall:
- ✅ Python 3.x (dengan virtual environment `venv`)
- ✅ Node.js dan npm
- ✅ RTL-SDR hardware terhubung ke komputer
- ✅ Driver RTL-SDR sudah terinstall

## 🔧 Setup Awal (Hanya Sekali)

### 1. Install Dependencies Python
```powershell
# Aktifkan virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies (jika belum)
python -m pip install -r requirements.txt
python -m pip install scikit-learn
```

### 2. Install Dependencies Node.js
```powershell
npm install
```

## 🎯 Cara Menjalankan Program

### **CARA 1: Menggunakan File Batch (PALING MUDAH)** ⭐⭐⭐

Double-click file `start_all.bat` di folder proyek.

Ini akan membuka 2 window terpisah:
- Window "Backend" → Backend Service
- Window "Frontend" → Frontend Next.js

**Keuntungan:** Paling mudah, tidak perlu install tambahan

**Alternatif:**
- `start_backend.bat` → Hanya backend
- `start_frontend.bat` → Hanya frontend

---

### **CARA 2: Menjalankan Semua Sekaligus dengan npm** ⭐

**Catatan:** Butuh `concurrently` terinstall. Jika error, gunakan Cara 1 atau Cara 3.

```powershell
npm run dev:all
```

Ini akan menjalankan:
- Frontend Next.js di `http://localhost:3000`
- Backend FastAPI di `http://localhost:8000`

**Jika error "concurrently not found":**
```powershell
npm install
npm run dev:all
```

---

### **CARA 3: Menjalankan Secara Terpisah (Manual)**

#### Terminal 1: Backend Service
```powershell
# Aktifkan virtual environment
.\venv\Scripts\Activate.ps1

# Jalankan backend
python sdr_backend_service.py
```

Backend akan berjalan di: `http://localhost:8000`

#### Terminal 2: Frontend
```powershell
npm run dev
```

Frontend akan berjalan di: `http://localhost:3000`

**Keuntungan:** Bisa melihat log masing-masing dengan jelas

---

### **CARA 3: Menggunakan TA_test_daya.py (Alternatif)**

Jika ingin menggunakan script standalone tanpa FastAPI:

```powershell
# Aktifkan virtual environment
.\venv\Scripts\Activate.ps1

# Jalankan script
python TA_test_daya.py
```

**Catatan:** Cara ini hanya untuk testing, tidak ada dashboard web

---

## 📊 Akses Aplikasi

Setelah semua berjalan:

1. **Dashboard Monitoring**: Buka browser ke `http://localhost:3000/dashboard`
2. **Backend API**: `http://localhost:8000` (untuk testing API)
3. **Health Check**: `http://localhost:8000/health`
4. **Status SDR**: `http://localhost:8000/status`

## 🔍 Verifikasi Program Berjalan

### Cek Backend:
- Terminal menampilkan: `✓ SDR Index 0 berhasil diinisialisasi`
- Terminal menampilkan: `✓ SDR Index 1 berhasil diinisialisasi`
- File `public/data.json` dan `public/data2.json` terupdate setiap 1 detik

### Cek Frontend:
- Browser menampilkan dashboard dengan grafik
- Grafik power, PTT, dan SWR terupdate setiap 2 detik

## ⚠️ Troubleshooting

### Error: "pip tidak dikenali"
```powershell
# Gunakan python -m pip
python -m pip install <package>
```

### Error: "Execution Policy" di PowerShell
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Error: "Device tidak terdeteksi"
- Pastikan RTL-SDR terhubung via USB
- Cek driver sudah terinstall
- Coba jalankan `rtl_test.exe` untuk verifikasi

### Error: "Port 3000 atau 8000 sudah digunakan"
```powershell
# Cek proses yang menggunakan port
netstat -ano | findstr :3000
netstat -ano | findstr :8000

# Kill process jika perlu (ganti PID dengan nomor yang muncul)
taskkill /PID <PID> /F
```

### Frontend tidak menampilkan data
- Pastikan backend sudah jalan
- Cek file `public/data.json` dan `public/data2.json` ada isinya
- Buka browser console (F12) untuk cek error

## 📝 Catatan Penting

1. **Kalibrasi**: Pastikan konstanta kalibrasi sudah diupdate di:
   - `TA_test_daya.py` (baris 18-21)
   - `sdr_backend_service.py` (baris 23-26)

2. **Interval Update**:
   - Backend: 1 detik
   - Frontend: 2 detik

3. **File Output**:
   - `public/data.json` → Data SDR Index 0 (CPL_in)
   - `public/data2.json` → Data SDR Index 1 (CPL_out)

## 🛑 Menghentikan Program

- Tekan `Ctrl+C` di terminal untuk menghentikan
- Jika menggunakan `npm run dev:all`, tekan `Ctrl+C` sekali akan menghentikan semua

---

**Selamat menggunakan program Tugas Akhir! 🎉**

