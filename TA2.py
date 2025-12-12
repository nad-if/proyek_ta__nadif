from rtlsdr import RtlSdr

# (kode impor 'os' dan 'sys' kamu...)

try:
    # Inisialisasi perangkat berdasarkan INDEKS-nya, BUKAN serial number
    sdr_in = RtlSdr(device_index=0)
    sdr_out = RtlSdr(device_index=1)

    print("Berhasil terhubung ke KEDUA perangkat (indeks 0 dan 1).")

    # Sekarang kamu bisa mengkonfigurasi masing-masing secara terpisah
    # Contoh konfigurasi sdr_in (untuk CPL IN)
    sdr_in.sample_rate = 2.4e6
    sdr_in.center_freq = 145.750e6
    try:
        sdr_in.set_agc_mode(False)
    except Exception:
        pass
    sdr_in.gain = 0
    
    # Contoh konfigurasi sdr_out (untuk CPL OUT)
    sdr_out.sample_rate = 2.4e6
    sdr_out.center_freq = 145.750e6
    try:
        sdr_out.set_agc_mode(False)
    except Exception:
        pass
    sdr_out.gain = 0

    print("Kedua perangkat siap dikonfigurasi.")

    # ...sisa kode kamu untuk membaca data...

    # Jangan lupa tutup kedua koneksi
    sdr_in.close()
    sdr_out.close()

except Exception as e:
    print(f"Gagal menginisialisasi perangkat berdasarkan indeks: {e}")
