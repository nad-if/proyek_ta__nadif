import os
import sys
import time
import numpy as np
from rtlsdr import RtlSdr

# --- Blok Wajib untuk Lingkungan Kamu (Windows DLL Path) ---
sdrsharp_path = r"C:\Users\User\Downloads\sdrsharp-x64" 
if sys.platform == 'win32' and os.path.exists(sdrsharp_path):
    os.add_dll_directory(sdrsharp_path)
# --- Akhir Blok Wajib ---

# Fungsi untuk menghitung daya (power) dalam dB
def calculate_power(samples):
    power = np.abs(samples)**2
    avg_power = np.mean(power)
    power_db = 10 * np.log10(avg_power + 1e-9)
    return power_db

sdr = None # Variabel untuk SDR kita
try:
    print("MENGUJI PERANGKAT (Index 0) SAJA...")
    sdr = RtlSdr(device_index=0)
    
    # Konfigurasi Perangkat 0
    sdr.sample_rate = 2.4e6
    sdr.center_freq = 145.750e6
    # Nonaktifkan semua penguatan (AGC) dan set gain manual ke 0 dB
    try:
        sdr.set_agc_mode(False)
    except Exception:
        pass
    sdr.gain = 0

    print("Konfigurasi Index 0 selesai. Memulai pembacaan...")
    print("Tekan Ctrl+C untuk berhenti.")
    time.sleep(1)

    while True:
        samples = sdr.read_samples(16384) 
        power_db = calculate_power(samples)
        
        # Cetak ke terminal
        print(f"Index 0: {power_db:7.2f} dB   \r", end="")
        time.sleep(0.1) 

except KeyboardInterrupt:
    print("\nProgram dihentikan oleh pengguna.")
except Exception as e:
    print(f"\nTerjadi error: {e}")
finally:
    if sdr:
        sdr.close()
        print("\nKoneksi Index 0 ditutup. Selesai.")

