# Penjelasan Detail: Kenapa sdr_backend_service.py Tidak Menggunakan File Test

## 📚 Apa Itu Subprocess?

**Subprocess** adalah modul Python yang digunakan untuk menjalankan program eksternal (executable) dari dalam kode Python. Ini seperti menjalankan perintah di Command Prompt/Terminal, tapi dari dalam program Python.

### Contoh Sederhana Subprocess:

```python
import subprocess

# Menjalankan perintah "dir" di Windows (seperti di CMD)
result = subprocess.run("dir", shell=True, capture_output=True, text=True)
print(result.stdout)  # Output dari perintah "dir"
```

## 🔄 Pendekatan File Test (test_baru.py, dll)

### Alur Kerja File Test:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Python menjalankan subprocess untuk memanggil           │
│    rtl_power.exe (program eksternal)                        │
│                                                              │
│    subprocess.run("rtl_power -f 99000000:101000000:...")   │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. rtl_power.exe (program C yang terpisah)                 │
│    - Membaca data dari SDR hardware                        │
│    - Memproses dan menghitung daya                         │
│    - Menulis hasil ke file CSV (fm_spectrum.csv)           │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Python menunggu rtl_power.exe selesai                    │
│    (program eksternal berjalan, Python menunggu)            │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Python membaca file CSV yang sudah ditulis               │
│    oleh rtl_power.exe                                        │
│                                                              │
│    with open("fm_spectrum.csv") as file:                    │
│        data = csv.reader(file)                              │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Python memproses data CSV dan mengkonversi ke JSON       │
│    - Parsing CSV                                             │
│    - Transformasi data                                       │
│    - Menulis ke data.json                                    │
└─────────────────────────────────────────────────────────────┘
```

### Detail Kode File Test:

```python
# test_baru.py - Baris 30-32
def rtlpower(...):
    # Membuat command string untuk menjalankan rtl_power.exe
    command = f"rtl_power -f {LOWER_BAND}:{UPPER_BAND}:{BIN_SIZE} ..."

    # Menjalankan program eksternal rtl_power.exe
    # subprocess.run() akan:
    # 1. Membuka program rtl_power.exe
    # 2. Menunggu program selesai
    # 3. Program rtl_power.exe menulis ke fm_spectrum.csv
    subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
    # Setelah ini, file fm_spectrum.csv sudah berisi data
```

**Kemudian di fungsi `data_json()` (baris 53-113):**

```python
def data_json(file_path="fm_spectrum.csv", json_path="data2.json"):
    while True:
        # Membaca file CSV yang ditulis oleh rtl_power.exe
        with open(file_path, newline='') as csvfile:
            reader = csv.reader(csvfile)
            for row in reader:
                # Memproses setiap baris CSV
                # Mengkonversi ke format JSON
                # Menulis ke data.json
```

### Karakteristik Pendekatan File Test:

1. **Indirect (Tidak Langsung)**: Python tidak langsung berkomunikasi dengan SDR
2. **File-based**: Data ditukar melalui file CSV
3. **External Program**: Menggunakan `rtl_power.exe` (program C yang sudah dikompilasi)
4. **Batch Processing**: `rtl_power.exe` membaca data dalam batch, lalu menulis ke CSV
5. **Polling**: Python harus terus memeriksa file CSV untuk data baru

---

## ⚡ Pendekatan sdr_backend_service.py

### Alur Kerja sdr_backend_service.py:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Python langsung menggunakan library rtlsdr               │
│    (library Python yang berkomunikasi langsung dengan SDR)  │
│                                                              │
│    from rtlsdr import RtlSdr                                │
│    sdr = RtlSdr(device_index=0)                             │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Python langsung membaca sampel dari SDR                  │
│    (tanpa program eksternal, tanpa file CSV)                │
│                                                              │
│    samples = sdr.read_samples(4096)  # Baca 4096 sampel     │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Python langsung menghitung daya di memori                │
│    (tanpa menulis ke file dulu)                              │
│                                                              │
│    power = np.abs(samples) ** 2                              │
│    power_db = 10 * np.log10(np.mean(power))                 │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Python langsung menulis ke JSON                          │
│    (real-time, tanpa file CSV sebagai perantara)            │
│                                                              │
│    append_measurement_to_public("data.json", {...})         │
└─────────────────────────────────────────────────────────────┘
```

### Detail Kode sdr_backend_service.py:

```python
# sdr_backend_service.py - Baris 336-351
def _initialise_device(self, cfg: DeviceConfig) -> Optional[RtlSdr]:
    # Langsung membuat objek SDR dari library Python
    sdr = RtlSdr(device_index=cfg.index)
    sdr.sample_rate = self.sample_rate
    sdr.center_freq = self.frequency_hz
    sdr.gain = self.manual_gain
    return sdr  # Objek SDR langsung bisa digunakan
```

```python
# sdr_backend_service.py - Baris 464-516
# Di dalam loop monitoring:
samples, error = read_samples_with_retry(sdr, self.num_samples, max_retries=2)
# ↑ Langsung membaca dari SDR, tidak perlu program eksternal

# Hitung daya langsung di Python
power_mentah = calculate_power(samples)  # Baris 516
# ↑ Fungsi ini menghitung daya dari sampel yang baru dibaca

# Langsung tulis ke JSON
append_measurement_to_public(file_path, {...})  # Baris 551
# ↑ Tidak perlu membaca file CSV dulu
```

### Karakteristik Pendekatan sdr_backend_service.py:

1. **Direct (Langsung)**: Python langsung berkomunikasi dengan SDR hardware
2. **Memory-based**: Data diproses di memori, tidak perlu file CSV
3. **Python Library**: Menggunakan `rtlsdr` (library Python)
4. **Real-time Processing**: Data diproses segera setelah dibaca
5. **Event-driven**: Tidak perlu polling file, langsung dapat data

---

## 🔍 Perbandingan Detail

| Aspek                     | File Test (test_baru.py)                                    | sdr_backend_service.py               |
| ------------------------- | ----------------------------------------------------------- | ------------------------------------ |
| **Komunikasi dengan SDR** | Melalui `rtl_power.exe` (program eksternal)                 | Langsung melalui library `rtlsdr`    |
| **Format Data**           | CSV file sebagai perantara                                  | Langsung ke JSON (di memori)         |
| **Kecepatan**             | Lebih lambat (harus menunggu program eksternal + baca file) | Lebih cepat (langsung di memori)     |
| **Real-time**             | Tidak real-time (batch processing)                          | Real-time (setiap detik)             |
| **Kontrol**               | Terbatas (tergantung `rtl_power.exe`)                       | Penuh (bisa kontrol semua parameter) |
| **Error Handling**        | Sulit (harus cek file CSV)                                  | Mudah (langsung dari exception)      |
| **Multiple Devices**      | Sulit (harus jalankan banyak `rtl_power.exe`)               | Mudah (bisa handle banyak device)    |
| **API Integration**       | Tidak cocok untuk API                                       | Cocok untuk FastAPI                  |

---

## 💡 Kenapa sdr_backend_service.py Tidak Menggunakan File Test?

### 1. **Arsitektur yang Berbeda**

**File Test** dirancang untuk:

- Eksperimen/testing
- Analisis spektrum frekuensi (scanning)
- Batch processing

**sdr_backend_service.py** dirancang untuk:

- Monitoring real-time
- API backend (FastAPI)
- Multiple device management
- Web application integration

### 2. **Kebutuhan Real-time**

File test menggunakan `rtl_power.exe` yang:

- Membaca data dalam interval tertentu (misalnya 1 detik)
- Menulis ke CSV setelah selesai
- Python harus menunggu dan membaca file

sdr_backend_service.py:

- Membaca data langsung setiap detik
- Langsung memproses dan mengirim ke API
- Tidak ada delay dari file I/O

### 3. **Kontrol yang Lebih Baik**

Dengan library `rtlsdr`:

```python
# Bisa kontrol langsung
sdr.gain = 20
sdr.center_freq = 145.750e6
samples = sdr.read_samples(4096)
```

Dengan `rtl_power.exe`:

```python
# Harus lewat command line parameter
command = f"rtl_power -g {GAIN} -f {FREQ} ..."
# Tidak bisa kontrol real-time
```

### 4. **Error Handling**

**File Test:**

```python
# Harus cek apakah file CSV ada
# Harus cek apakah file CSV valid
# Sulit handle error dari rtl_power.exe
try:
    with open("fm_spectrum.csv") as f:
        # ...
except FileNotFoundError:
    # File belum dibuat oleh rtl_power.exe
```

**sdr_backend_service.py:**

```python
# Langsung dapat exception
try:
    samples = sdr.read_samples(4096)
except Exception as e:
    # Langsung tahu error-nya apa
    # Bisa handle dengan tepat
```

### 5. **Multiple Device Support**

**File Test:**

- Harus jalankan banyak `rtl_power.exe` untuk banyak device
- Sulit sinkronisasi
- Resource intensive

**sdr_backend_service.py:**

```python
# Bisa handle banyak device dalam satu program
devices = [
    DeviceConfig(index=0, name="SDR Index 0"),
    DeviceConfig(index=1, name="SDR Index 1"),
]
# Semua device di-monitor dalam satu loop
```

---

## 📊 Contoh Perbandingan Waktu

### File Test Approach:

```
Time: 0.0s  → Python memanggil rtl_power.exe
Time: 0.1s  → rtl_power.exe mulai membaca dari SDR
Time: 1.0s  → rtl_power.exe selesai, menulis ke CSV
Time: 1.1s  → Python membaca file CSV
Time: 1.2s  → Python memproses dan menulis ke JSON
Total: ~1.2 detik per cycle
```

### sdr_backend_service.py Approach:

```
Time: 0.0s  → Python langsung membaca dari SDR
Time: 0.01s → Python menghitung daya
Time: 0.02s → Python menulis ke JSON
Total: ~0.02 detik per cycle (60x lebih cepat!)
```

---

## 🎯 Kesimpulan

**File Test (`test_baru.py`, dll)** menggunakan pendekatan **indirect**:

- Python → subprocess → `rtl_power.exe` → SDR → CSV → Python → JSON
- Cocok untuk: Testing, eksperimen, batch processing
- Tidak cocok untuk: Real-time monitoring, API, multiple devices

**sdr_backend_service.py** menggunakan pendekatan **direct**:

- Python → library `rtlsdr` → SDR → Python (memori) → JSON
- Cocok untuk: Real-time monitoring, API backend, production
- Lebih efisien, lebih cepat, lebih mudah dikontrol

Kedua pendekatan valid, tapi untuk kebutuhan aplikasi web real-time dengan API, pendekatan `sdr_backend_service.py` lebih sesuai! 🚀
