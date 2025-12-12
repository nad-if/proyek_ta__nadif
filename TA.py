import os
import sys # Path ini harus 100% benar menunjuk ke folder tempat SDRSharp.exe berada

sdrsharp_path = r"C:\Users\User\Downloads\sdrsharp-x64" 
if sys.platform == 'win32':
    os.add_dll_directory(sdrsharp_path)

print("Memulai script...")

try:
    from rtlsdr import RtlSdr
    print("Import rtlsdr berhasil!")
except ImportError as e:
    print(f"Error import: {e}")
    exit(1)

try:
    print("Mencoba mendapatkan daftar perangkat...")
    # Panggil fungsi statis untuk mendapatkan daftar serial number
    serial_numbers = RtlSdr.get_device_serial_addresses()

    print(f"Berhasil menemukan {len(serial_numbers)} perangkat RTL-SDR:")

    # Cetak setiap serial number
    for i, sn in enumerate(serial_numbers):
        print(f"  Perangkat {i+1}: Serial Number = {sn}")

except Exception as e:
    print(f"Terjadi error: {e}")
    print("Pastikan driver Zadig (WinUSB) sudah terinstal untuk SEMUA perangkat.")

