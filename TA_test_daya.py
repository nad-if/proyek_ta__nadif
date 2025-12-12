import os
import sys
import time
import json
import numpy as np
from rtlsdr import RtlSdr

# --- Blok Wajib untuk Lingkungan Kamu (Windows DLL Path) ---
# Path ini harus 100% benar menunjuk ke folder tempat SDRSharp.exe berada
sdrsharp_path = r"C:\Users\User\Downloads\sdrsharp-x64" 
if sys.platform == 'win32' and os.path.exists(sdrsharp_path):
    os.add_dll_directory(sdrsharp_path)
# --- Akhir Blok Wajib ---

# --- Konstanta Kalibrasi (Dari Spreadsheet - Grafik Bawah) ---
# Formula: Nilai Sebenarnya (dBm) = M_SDR_X * (Nilai Bacaan SDR) + C_SDR_X
# KALIBRASI AKTIF
# Data dari Spreadsheet: Grafik Bawah (R² tinggi, 0.9986 dan 0.9983)
# Persamaan: SigGen = -4.8022 * RTLSDR + 2.6308 (RTLSDR 1)
# Persamaan: SigGen = -4.7188 * RTLSDR + 1.2986 (RTLSDR 2)
# Dimana: y = SigGen (nilai sebenarnya), x = RTLSDR (nilai bacaan SDR)
# --- Konstanta Kalibrasi (Dari Spreadsheet - Data Tabel) ---
# Formula: Nilai Sebenarnya (dBm) = M_SDR_X * (Nilai Bacaan SDR) + C_SDR_X
# KALIBRASI AKTIF
# Data dari tabel spreadsheet:
# RTLSDR 1: RTLSDR = -43.23 saat SigGen = -80 dBm
# RTLSDR 1: RTLSDR = -35.97 saat SigGen = -60 dBm
# RTLSDR 2: RTLSDR = -43.34 saat SigGen = -80 dBm
# RTLSDR 2: RTLSDR = -36.75 saat SigGen = -60 dBm
# Dihitung dari dua titik: SigGen = M * RTLSDR + C
# Untuk RTLSDR 1: M = (-60 - (-80)) / (-35.97 - (-43.23)) = 20 / 7.26 = 2.755
#                 C = -80 - 2.755 * (-43.23) = -80 + 119.1 = 39.1
# Untuk RTLSDR 2: M = (-60 - (-80)) / (-36.75 - (-43.34)) = 20 / 6.59 = 3.035
#                 C = -80 - 3.035 * (-43.34) = -80 + 131.5 = 51.5
M_SDR_0 = 2.755  # Slope untuk SDR Index 0 (CPL_in) - dari data tabel
C_SDR_0 = 39.1   # Intercept untuk SDR Index 0 (CPL_in) - dari data tabel
M_SDR_1 = 3.035  # Slope untuk SDR Index 1 (CPL_out) - dari data tabel
C_SDR_1 = 51.5   # Intercept untuk SDR Index 1 (CPL_out) - dari data tabel
# ------------------------------------------------

# Fungsi untuk menghitung daya (power) dalam dB
def calculate_power(samples):
    # 1. Hitung (I^2 + Q^2)
    power = np.abs(samples)**2
    # 2. Rata-ratakan
    avg_power = np.mean(power)
    # 3. Konversi ke dB (tambah 1e-9 untuk hindari error log(0))
    power_db = 10 * np.log10(avg_power + 1e-9)
    return power_db

# Fungsi untuk menulis/menambah data ke file JSON array di folder public
def append_measurement_to_public(file_path, entry, max_items=1000):
    try:
        # Baca isi lama bila ada
        if os.path.exists(file_path):
            with open(file_path, 'r', encoding='utf-8') as f:
                try:
                    data = json.load(f)
                    if not isinstance(data, list):
                        data = []
                except Exception:
                    data = []
        else:
            data = []

        # Tambahkan entry baru dan batasi panjang
        data.append(entry)
        if len(data) > max_items:
            data = data[-max_items:]

        # Tulis kembali
        # Pastikan folder tujuan ada
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
    except Exception:
        # Diamkan error file I/O agar loop utama tetap jalan
        pass

# Fungsi untuk mendeteksi sinyal kuat (overload detection)
def detect_overload(power_db, threshold_db=-10):
    """
    Mendeteksi apakah sinyal terlalu kuat (kemungkinan PTT aktif).
    Threshold default -10 dB adalah nilai yang cukup tinggi untuk normal RF.
    """
    return power_db > threshold_db

# Fungsi untuk menutup perangkat SDR dengan aman
def safe_close_sdr(sdr, device_name):
    """
    Menutup koneksi SDR dengan error handling yang lebih baik.
    Menambahkan delay dan menangani error saat penutupan.
    """
    if sdr is None:
        return
    
    try:
        # Tambahkan delay sebelum menutup untuk memberikan waktu perangkat stabil
        time.sleep(0.5)
        sdr.close()
        print(f"  ✓ {device_name} berhasil ditutup")
    except Exception as e:
        # Abaikan error saat penutupan karena perangkat mungkin sudah terputus
        print(f"  ⚠ {device_name} - Error saat menutup (bisa diabaikan): {type(e).__name__}")

# Fungsi untuk membaca sampel dengan retry mechanism
def read_samples_with_retry(sdr, num_samples, max_retries=3, device_name="Device"):
    """
    Membaca sampel dari SDR dengan mekanisme retry jika terjadi error.
    Retry dengan delay singkat - delay panjang dilakukan di level loop utama.
    """
    for attempt in range(max_retries):
        try:
            samples = sdr.read_samples(num_samples)
            return samples, None  # Return (samples, error)
        except Exception as e:
            if attempt < max_retries - 1:
                # Delay singkat untuk retry (delay panjang ada di loop utama)
                time.sleep(0.1 * (attempt + 1))  # 0.1s, 0.2s
                continue
            else:
                # Semua retry gagal - jangan print error di sini, biar di handle di atas
                return None, e  # Return (None, error)
    return None, None

# Fungsi untuk melakukan recovery pada SDR setelah error
def recover_sdr(sdr, sample_rate, center_freq, manual_gain, device_name="Device"):
    """
    Melakukan recovery pada SDR dengan mengatur ulang konfigurasi.
    Berguna setelah error karena overload dari PTT.
    """
    try:
        # Delay lebih lama agar perangkat stabil dulu setelah error besar
        time.sleep(1.0)  # Delay 1 detik sebelum recovery
        
        # Coba akses perangkat secara bertahap
        try:
            # Test akses dengan membaca sample rate dulu
            _ = sdr.sample_rate
        except:
            # Jika tidak bisa akses, tunggu lagi
            time.sleep(0.5)
            return False
        
        # Jika bisa akses, lakukan recovery
        sdr.sample_rate = sample_rate
        time.sleep(0.1)
        sdr.center_freq = center_freq
        time.sleep(0.1)
        # Paksa AGC off dan gain 0 dB saat recovery
        try:
            sdr.set_agc_mode(False)
        except Exception:
            pass
        sdr.gain = 0
        time.sleep(0.3)  # Delay setelah recovery
        return True
    except Exception as e:
        # Jangan print error detail, biar tidak spam console
        return False

# Fungsi untuk reinitialize SDR (close dan buka ulang) - recovery lebih agresif
def reinitialize_sdr(device_index, sample_rate, center_freq, manual_gain, device_name="Device"):
    """
    Close dan buka ulang SDR untuk recovery yang lebih agresif.
    Digunakan saat recovery normal gagal berulang kali.
    """
    try:
        from rtlsdr import RtlSdr
        # Tunggu lebih lama sebelum reinitialize
        time.sleep(2.0)  # 2 detik delay
        
        # Close SDR yang lama jika masih ada
        # (tidak bisa close dari sini karena butuh referensi SDR)
        
        # Buat SDR baru
        new_sdr = RtlSdr(device_index=device_index)
        time.sleep(0.5)
        
        # Konfigurasi ulang
        new_sdr.sample_rate = sample_rate
        new_sdr.center_freq = center_freq
        # Paksa AGC off dan gain 0 dB setelah reinitialize
        try:
            new_sdr.set_agc_mode(False)
        except Exception:
            pass
        new_sdr.gain = 0
        time.sleep(0.5)
        
        return new_sdr
    except Exception as e:
        return None

# Kita siapkan variabelnya dulu
sdr_idx0 = None
sdr_idx1 = None

try:
    # --- 1. Inisialisasi KEDUA perangkat berdasarkan INDEKS ---
    print("Menginisialisasi Perangkat (Index 0)...")
    try:
        sdr_idx0 = RtlSdr(device_index=0)
        print("  ✓ Perangkat Index 0 berhasil diinisialisasi")
    except Exception as e:
        print(f"  ✗ Gagal menginisialisasi perangkat Index 0: {e}")
        sdr_idx0 = None
    
    print("Menginisialisasi Perangkat (Index 1)...")
    try:
        sdr_idx1 = RtlSdr(device_index=1)
        print("  ✓ Perangkat Index 1 berhasil diinisialisasi")
    except Exception as e:
        print(f"  ✗ Gagal menginisialisasi perangkat Index 1: {e}")
        sdr_idx1 = None
    
    # Cek apakah minimal satu perangkat berhasil diinisialisasi
    if sdr_idx0 is None and sdr_idx1 is None:
        raise Exception("Tidak ada perangkat SDR yang berhasil diinisialisasi!")
    
    # Info jumlah perangkat yang terdeteksi
    device_count = (1 if sdr_idx0 else 0) + (1 if sdr_idx1 else 0)
    print(f"\n📡 {device_count} perangkat SDR terdeteksi dan siap digunakan.")
    
    # --- 2. Konfigurasi perangkat yang tersedia ---
    # Atur ke frekuensi HT yang kamu gunakan (contoh: 145.750 MHz)
    freq_to_scan = 145.750e6 
    
    # Gunakan sample rate yang lebih rendah untuk mengurangi beban USB
    # 2.048 MS/s adalah sample rate standar yang stabil untuk RTL-SDR
    sample_rate = 2.048e6  # 2.048 MS/s (lebih stabil dari 2.4 MS/s)
    
    print(f"\nMengatur frekuensi ke {freq_to_scan/1e6} MHz...")
    print(f"Menggunakan sample rate: {sample_rate/1e6} MS/s")
    
    # Nonaktifkan semua bentuk penguatan: AGC off dan gain 0 dB
    manual_gain = 0
    print(f"\n⚠ PENTING: Semua gain dinonaktifkan (AGC OFF, gain {manual_gain} dB)")
    
    # Konfigurasi Perangkat 0
    if sdr_idx0:
        try:
            sdr_idx0.sample_rate = sample_rate
            sdr_idx0.center_freq = freq_to_scan
            try:
                sdr_idx0.set_agc_mode(False)
            except Exception:
                pass
            sdr_idx0.gain = 0
            print("  ✓ Perangkat Index 0 dikonfigurasi")
        except Exception as e:
            print(f"  ✗ Error konfigurasi Index 0: {e}")
            sdr_idx0 = None
    
    # Konfigurasi Perangkat 1
    if sdr_idx1:
        try:
            sdr_idx1.sample_rate = sample_rate
            sdr_idx1.center_freq = freq_to_scan
            try:
                sdr_idx1.set_agc_mode(False)
            except Exception:
                pass
            sdr_idx1.gain = 0
            print("  ✓ Perangkat Index 1 dikonfigurasi")
        except Exception as e:
            print(f"  ✗ Error konfigurasi Index 1: {e}")
            sdr_idx1 = None

    if sdr_idx0 is None and sdr_idx1 is None:
        raise Exception("Tidak ada perangkat yang berhasil dikonfigurasi!")

    print("\nKonfigurasi selesai. Memulai pembacaan daya...")
    print("Tekan Ctrl+C untuk berhenti.\n")
    time.sleep(3) # Jeda lebih lama agar perangkat benar-benar stabil

    # --- 3. Loop Pembacaan Data ---
    error_count_idx0 = 0
    error_count_idx1 = 0
    max_consecutive_errors = 50  # Naikkan threshold karena ada cooldown
    recovery_attempts_idx0 = 0
    recovery_attempts_idx1 = 0
    max_recovery_attempts = 3  # Kurangi karena akan langsung coba reinitialize
    cooldown_end_idx0 = 0  # Timestamp kapan cooldown selesai
    cooldown_end_idx1 = 0
    cooldown_duration = 5.0  # Cooldown 5 detik setelah error besar
    
    # Simpan device index untuk reinitialize
    device_index_0 = 0
    device_index_1 = 1
    
    # Gunakan jumlah sampel yang lebih kecil untuk mengurangi beban USB
    num_samples = 4096  # Kurangi lagi menjadi 4096 untuk mengurangi beban lebih lanjut
    
    # Threshold untuk deteksi overload (disesuaikan dengan gain manual)
    overload_threshold = -5  # dB (sinyal di atas ini dianggap kuat)
    
    while True:
        current_time = time.time()
        
        # Inisialisasi variabel output
        power_str_0 = "---     "
        # Hanya inisialisasi power_str_1 jika perangkat tersedia
        if sdr_idx1 is not None:
            power_str_1 = "---     "
        else:
            power_str_1 = "N/A     "
        overload_warning_0 = ""
        overload_warning_1 = ""
        
        # Baca sampel dengan error handling
        samples_idx0 = None
        samples_idx1 = None
        
        # Baca dari perangkat 0 dengan retry (SEQUENTIAL, bukan parallel)
        if sdr_idx0:
            # Skip pembacaan jika masih dalam cooldown period
            if current_time < cooldown_end_idx0:
                remaining = int(cooldown_end_idx0 - current_time) + 1
                power_str_0 = f"COOLDOWN({remaining}s)"
                time.sleep(0.5)
                # Skip ke perangkat berikutnya
            else:
                samples_idx0, error0 = read_samples_with_retry(sdr_idx0, num_samples, max_retries=2, device_name="Index 0")
                if error0:
                    error_count_idx0 += 1
                    # Pause lebih lama saat error (memberi waktu perangkat stabil)
                    time.sleep(1.0)  # Pause 1 detik setelah error
                    
                    # Jika recovery normal gagal 2 kali, coba reinitialize
                    if error_count_idx0 >= 2 and recovery_attempts_idx0 >= max_recovery_attempts:
                        print(f"\n⚠ Index 0: Recovery gagal, mencoba reinitialize...", end="")
                        # Close SDR lama
                        try:
                            safe_close_sdr(sdr_idx0, "Index 0 (old)")
                        except:
                            pass
                        
                        # Reinitialize
                        sdr_idx0 = reinitialize_sdr(device_index_0, sample_rate, freq_to_scan, manual_gain, "Index 0")
                        if sdr_idx0:
                            print(" ✓")
                            error_count_idx0 = 0
                            recovery_attempts_idx0 = 0
                            # Set cooldown period
                            cooldown_end_idx0 = time.time() + cooldown_duration
                        else:
                            print(" ✗")
                            # Set cooldown period lebih lama jika reinitialize gagal
                            cooldown_end_idx0 = time.time() + cooldown_duration * 2
                    
                    # Coba recovery normal sebelum reinitialize
                    elif error_count_idx0 >= 2 and recovery_attempts_idx0 < max_recovery_attempts:
                        print(f"\n⚠ Index 0 error, recovery... ({recovery_attempts_idx0 + 1}/{max_recovery_attempts})", end="")
                        if recover_sdr(sdr_idx0, sample_rate, freq_to_scan, manual_gain, "Index 0"):
                            print(" ✓")
                            recovery_attempts_idx0 += 1
                            error_count_idx0 = 0  # Reset counter setelah recovery
                            time.sleep(0.5)  # Delay setelah recovery
                        else:
                            print(" ✗")
                            recovery_attempts_idx0 += 1
                            # Set cooldown period setelah recovery gagal
                            cooldown_end_idx0 = time.time() + cooldown_duration
                            time.sleep(0.5)  # Delay jika recovery gagal
                    
                    if error_count_idx0 >= max_consecutive_errors:
                        print(f"\n⚠ Terlalu banyak error dari Index 0. Menghentikan pembacaan Index 0.")
                        sdr_idx0 = None
                else:
                    error_count_idx0 = 0  # Reset counter jika berhasil
                    recovery_attempts_idx0 = 0  # Reset recovery counter juga
                    cooldown_end_idx0 = 0  # Clear cooldown jika berhasil
        
        # Delay antara pembacaan perangkat untuk mengurangi beban USB
        time.sleep(0.1)  # Delay sedikit lebih lama
        
        # Baca dari perangkat 1 dengan retry
        if sdr_idx1:
            # Skip pembacaan jika masih dalam cooldown period
            if current_time < cooldown_end_idx1:
                remaining = int(cooldown_end_idx1 - current_time) + 1
                power_str_1 = f"COOLDOWN({remaining}s)"
                time.sleep(0.1)
                # Skip pembacaan
            else:
                samples_idx1, error1 = read_samples_with_retry(sdr_idx1, num_samples, max_retries=2, device_name="Index 1")
                if error1:
                    error_count_idx1 += 1
                    # Pause lebih lama saat error (memberi waktu perangkat stabil)
                    time.sleep(1.0)  # Pause 1 detik setelah error
                    
                    # Jika recovery normal gagal 2 kali, coba reinitialize
                    if error_count_idx1 >= 2 and recovery_attempts_idx1 >= max_recovery_attempts:
                        print(f"\n⚠ Index 1: Recovery gagal, mencoba reinitialize...", end="")
                        # Close SDR lama
                        try:
                            safe_close_sdr(sdr_idx1, "Index 1 (old)")
                        except:
                            pass
                        
                        # Reinitialize
                        sdr_idx1 = reinitialize_sdr(device_index_1, sample_rate, freq_to_scan, manual_gain, "Index 1")
                        if sdr_idx1:
                            print(" ✓")
                            error_count_idx1 = 0
                            recovery_attempts_idx1 = 0
                            # Set cooldown period
                            cooldown_end_idx1 = time.time() + cooldown_duration
                        else:
                            print(" ✗")
                            # Set cooldown period lebih lama jika reinitialize gagal
                            cooldown_end_idx1 = time.time() + cooldown_duration * 2
                    
                    # Coba recovery normal sebelum reinitialize
                    elif error_count_idx1 >= 2 and recovery_attempts_idx1 < max_recovery_attempts:
                        print(f"\n⚠ Index 1 error, recovery... ({recovery_attempts_idx1 + 1}/{max_recovery_attempts})", end="")
                        if recover_sdr(sdr_idx1, sample_rate, freq_to_scan, manual_gain, "Index 1"):
                            print(" ✓")
                            recovery_attempts_idx1 += 1
                            error_count_idx1 = 0  # Reset counter setelah recovery
                            time.sleep(0.5)  # Delay setelah recovery
                        else:
                            print(" ✗")
                            recovery_attempts_idx1 += 1
                            # Set cooldown period setelah recovery gagal
                            cooldown_end_idx1 = time.time() + cooldown_duration
                            time.sleep(0.5)  # Delay jika recovery gagal
                    
                    if error_count_idx1 >= max_consecutive_errors:
                        print(f"\n⚠ Terlalu banyak error dari Index 1. Menghentikan pembacaan Index 1.")
                        sdr_idx1 = None
                else:
                    error_count_idx1 = 0  # Reset counter jika berhasil
                    recovery_attempts_idx1 = 0  # Reset recovery counter juga
                    cooldown_end_idx1 = 0  # Clear cooldown jika berhasil

        # Jika kedua perangkat sudah tidak bisa dibaca, keluar dari loop
        if sdr_idx0 is None and sdr_idx1 is None:
            print("\n⚠ Semua perangkat mengalami error. Menghentikan program.")
            break

        # Hitung dan tampilkan daya jika berhasil membaca
        if samples_idx0 is not None:
            # Hitung daya mentah (raw) dari SDR
            power_mentah_idx0 = calculate_power(samples_idx0)
            
            # --- IMPLEMENTASI KALIBRASI REGRESI LINIER ---
            # Terapkan formula kalibrasi: Nilai Sebenarnya = m * nilai_mentah + c
            power_idx0_db = (M_SDR_0 * power_mentah_idx0) + C_SDR_0
            
            power_str_0 = f"{power_idx0_db:7.2f} dBm"  # Ubah label menjadi dBm karena sudah terkalibrasi
            # Deteksi overload (sinyal kuat, mungkin PTT aktif)
            if detect_overload(power_idx0_db, overload_threshold):
                overload_warning_0 = " [PTT?]"
            # Tulis ke file publik untuk dashboard (SDR 0 -> data.json)
            try:
                ts = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
                append_measurement_to_public(
                    os.path.join("public", "data.json"),
                    {
                        "timestamp": ts,
                        "power_db": float(power_idx0_db),  # Sudah terkalibrasi
                        "frequency": float(freq_to_scan)
                    },
                    max_items=2000
                )
            except Exception:
                pass
        else:
            power_str_0 = "ERROR   "
        
        # Hanya proses index 1 jika perangkat tersedia
        if sdr_idx1 is not None:
            if samples_idx1 is not None:
                # Hitung daya mentah (raw) dari SDR
                power_mentah_idx1 = calculate_power(samples_idx1)
                
                # --- IMPLEMENTASI KALIBRASI REGRESI LINIER ---
                # Terapkan formula kalibrasi: Nilai Sebenarnya = m * nilai_mentah + c
                power_idx1_db = (M_SDR_1 * power_mentah_idx1) + C_SDR_1
                
                power_str_1 = f"{power_idx1_db:7.2f} dBm"  # Ubah label menjadi dBm karena sudah terkalibrasi
                # Deteksi overload (sinyal kuat, mungkin PTT aktif)
                if detect_overload(power_idx1_db, overload_threshold):
                    overload_warning_1 = " [PTT?]"
                # Tulis ke file publik untuk dashboard (SDR 1 -> data2.json)
                try:
                    ts = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
                    append_measurement_to_public(
                        os.path.join("public", "data2.json"),
                        {
                            "timestamp": ts,
                            "power_db": float(power_idx1_db),  # Sudah terkalibrasi
                            "frequency": float(freq_to_scan)
                        },
                        max_items=2000
                    )
                except Exception:
                    pass
            else:
                power_str_1 = "ERROR   "
        else:
            # Perangkat index 1 tidak ada
            power_str_1 = "N/A     "
            overload_warning_1 = ""
        
        # Cetak ke terminal dengan format sesuai jumlah perangkat
        if sdr_idx1 is not None:
            # Dua perangkat
            print(f"  CPL IN (Idx 0): {power_str_0}{overload_warning_0}   |   CPL OUT (Idx 1): {power_str_1}{overload_warning_1}   \r", end="")
        else:
            # Hanya satu perangkat
            print(f"  CPL IN (Idx 0): {power_str_0}{overload_warning_0}                                     \r", end="")
        
        # Jeda update setiap 1 detik
        time.sleep(1.0) 

except KeyboardInterrupt:
    print("\n\nProgram dihentikan oleh pengguna.")
except Exception as e:
    print(f"\n\nTerjadi error: {e}")
finally:
    # --- 4. Selalu tutup koneksi (WAJIB!) ---
    # Ini akan dijalankan bahkan jika kamu tekan Ctrl+C
    print("\nMenutup koneksi SDR...")
    
    # Tambahkan delay sebelum mulai menutup
    time.sleep(0.5)
    
    # Tutup dengan fungsi safe_close yang sudah menangani error
    safe_close_sdr(sdr_idx0, "Perangkat Index 0")
    safe_close_sdr(sdr_idx1, "Perangkat Index 1")
    
    print("Selesai.")
