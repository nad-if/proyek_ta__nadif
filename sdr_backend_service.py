import os
import sys
import time
import json
import threading
from typing import Dict, List, Optional

import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from rtlsdr import RtlSdr


# --- Konfigurasi Path DLL (sama seperti TA_test_daya.py) ---
SDRSHARP_PATH = r"C:\Users\User\Downloads\sdrsharp-x64"
if sys.platform == "win32" and os.path.exists(SDRSHARP_PATH):
    os.add_dll_directory(SDRSHARP_PATH)

# --- Konstanta Kalibrasi (Dari hasil kalibrasi.py) ---
# Formula: Nilai Sebenarnya (dBm) = M_SDR_X * (Nilai Bacaan SDR) + C_SDR_X
# KALIBRASI AKTIF
# Data dari kalibrasi.py (RX Percobaan 2)
# Dihitung dari regresi linier: SigGen = M * RTLSDR + C
# Data: RTLSDR = [-5.93, -10.36, -18.22, -24.56, -30.39, -35.83, -42.24]
#       SigGen = [0, -5, -10, -15, -20, -25, -30]
# Verifikasi: RTLSDR = -42.24 → SigGen = 0.811706 * (-42.24) + 4.426439 = -29.85 ≈ -30 ✓
# Untuk RTLSDR ≈ -43, hasil ≈ -43 dBm (sesuai ekspektasi)
# Konstanta dari kalibrasi.py (RX Percobaan 2)
# Jika hasil tidak sesuai ekspektasi, mungkin perlu data kalibrasi terbaru
# Verifikasi: RTLSDR = -42.24 → SigGen = 0.811706 * (-42.24) + 4.426439 = -29.85 ≈ -30
# Untuk RTLSDR = -43: SigGen = 0.811706 * (-43) + 4.426439 = -30.47 dBm
# Jika hasil harus ≈ -43 dBm, mungkin perlu konstanta yang berbeda
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
# Atau gunakan persamaan dari grafik: RTLSDR = -4.8022 * SigGen + 2.6308
# Dikonversi: SigGen = (RTLSDR - 2.6308) / -4.8022 = -0.2082 * RTLSDR + 0.5480
# Verifikasi: RTLSDR = -43 → SigGen = -0.2082 * (-43) + 0.5480 = 8.95 + 0.55 = 9.5 dBm (tidak sesuai)
# Menggunakan konstanta dari data tabel langsung:
M_SDR_0 = 1.039760097  # Slope untuk SDR Index 0 (CPL_in) - dari data tabel
C_SDR_0 = -22.76992913   # Intercept untuk SDR Index 0 (CPL_in) - dari data tabel
M_SDR_1 = 1.05777  # Slope untuk SDR Index 1 (CPL_out) - dari data tabel
C_SDR_1 = -21.4164   # Intercept untuk SDR Index 1 (CPL_out) - dari data tabel
# ------------------------------------------------


# ------------------ Utilitas Perhitungan ------------------ #

def calculate_power(samples):
    power = np.abs(samples) ** 2
    avg_power = np.mean(power)
    power_db = 10 * np.log10(avg_power + 1e-9)
    return power_db


def detect_overload(power_db, threshold_db=-10):
    return power_db > threshold_db


def append_measurement_to_public(file_path: str, entry: Dict[str, float], max_items: int = 2000):
    try:
        data = []
        if os.path.exists(file_path):
            try:
                # Baca dengan retry untuk handle file sedang ditulis
                for attempt in range(3):
                    try:
                        with open(file_path, "r", encoding="utf-8") as f:
                            content = f.read().strip()
                            if content:
                                parsed = json.loads(content)
                                if isinstance(parsed, list):
                                    data = parsed
                                break
                    except (json.JSONDecodeError, ValueError) as e:
                        if attempt < 2:
                            time.sleep(0.01)  # Tunggu sebentar, mungkin file sedang ditulis
                            continue
                        # File corrupt, reset ke array kosong
                        data = []
                        break
                    except Exception:
                        data = []
                        break
            except Exception:
                data = []

        data.append(entry)
        if len(data) > max_items:
            data = data[-max_items:]

        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        # Atomic write: tulis ke file temp dulu, lalu rename
        temp_file = file_path + ".tmp"
        try:
            with open(temp_file, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=4)
                # Flush dan sync untuk memastikan data tersimpan sebelum file ditutup
                f.flush()
                if hasattr(os, 'fsync'):
                    try:
                        os.fsync(f.fileno())
                    except (AttributeError, OSError):
                        pass  # fsync mungkin tidak tersedia di semua sistem
            
            # Atomic rename (Windows compatible) dengan retry jika access denied
            rename_success = False
            for rename_attempt in range(5):
                try:
                    if os.path.exists(file_path):
                        # Coba unlock file dulu dengan membuka dalam mode append (tidak lock)
                        try:
                            with open(file_path, "a"):
                                pass
                        except:
                            pass
                        os.replace(temp_file, file_path)
                    else:
                        os.rename(temp_file, file_path)
                    rename_success = True
                    break
                except PermissionError:
                    # File sedang dibaca/digunakan, tunggu sebentar
                    if rename_attempt < 4:
                        time.sleep(0.2 * (rename_attempt + 1))  # 0.2s, 0.4s, 0.6s, 0.8s
                        continue
                    else:
                        # Jika masih gagal setelah retry, tulis langsung tanpa atomic
                        try:
                            with open(file_path, "w", encoding="utf-8") as f:
                                json.dump(data, f, ensure_ascii=False, indent=4)
                            rename_success = True
                            # Hapus temp file
                            try:
                                if os.path.exists(temp_file):
                                    os.remove(temp_file)
                            except:
                                pass
                        except Exception as e2:
                            raise e2
                except OSError as e:
                    if 'Access is denied' in str(e) or e.winerror == 5:
                        # Windows access denied, retry
                        if rename_attempt < 4:
                            time.sleep(0.2 * (rename_attempt + 1))
                            continue
                        else:
                            raise e
                    else:
                        raise e
            
            if not rename_success:
                raise Exception("Failed to rename temp file after retries")
            
            # Delay kecil untuk memastikan file system selesai menulis
            time.sleep(0.01)
        except Exception as e:
            # Cleanup temp file jika error
            try:
                if os.path.exists(temp_file):
                    os.remove(temp_file)
            except:
                pass
            raise e
    except Exception as e:
        # jangan hentikan loop jika ada error file I/O, tapi log dengan detail
        import traceback
        print(f"✗ ERROR: Gagal menulis ke {file_path}: {e}")
        print(f"   Traceback: {traceback.format_exc()}")
        # Return False untuk indikasi gagal
        return False
    
    # Return True jika berhasil
    return True


def safe_close_sdr(sdr: Optional[RtlSdr], device_name: str):
    if sdr is None:
        return
    try:
        time.sleep(0.5)
        sdr.close()
        print(f"  ✓ {device_name} berhasil ditutup")
    except Exception as exc:
        print(f"  ⚠ {device_name} - Error saat menutup (abaikan): {type(exc).__name__}")


def read_samples_with_retry(sdr: RtlSdr, num_samples: int, max_retries: int = 3):
    """
    Membaca sampel dari SDR dengan retry mechanism.
    Error dari driver RTL-SDR (rtlsdr_write_reg, rtlsdr_demod_write_reg, dll) 
    akan ditangani dan tidak perlu retry karena merupakan error hardware level.
    """
    for attempt in range(max_retries):
        try:
            samples = sdr.read_samples(num_samples)
            return samples, None
        except Exception as exc:
            error_str = str(exc).lower()
            # Deteksi access violation atau register error - jangan retry, langsung return
            # Error-error ini termasuk: rtlsdr_write_reg, rtlsdr_demod_write_reg, 
            # rtlsdr_demod_read_reg, r82xx_write, dll
            if any(keyword in error_str for keyword in [
                'access violation', 'write_reg', 'rtlsdr_write', 'rtlsdr_demod',
                'r82xx_write', 'i2c wr failed', 'read_reg'
            ]):
                # Error hardware level, tidak perlu retry
                return None, exc
            if attempt < max_retries - 1:
                time.sleep(0.1 * (attempt + 1))
                continue
            return None, exc
    return None, None


# ------------------ Kelas Monitor SDR ------------------ #


class DeviceConfig(BaseModel):
    index: int
    name: str


class DeviceStatus(BaseModel):
    index: int
    name: str
    available: bool
    power_db: Optional[float]
    overload: bool
    last_timestamp: Optional[str]
    error_count: int


class SDRMonitor:
    def __init__(
        self,
        devices: List[DeviceConfig],
        frequency_hz: float,
        sample_rate: float = 2.048e6,
        manual_gain: int = 0,
        num_samples: int = 4096,
        overload_threshold: float = -5.0,
        public_dir: str = "public",
    ) -> None:
        self.devices_config = devices
        self.frequency_hz = frequency_hz
        self.sample_rate = sample_rate
        self.manual_gain = manual_gain
        self.num_samples = int(num_samples)
        self.overload_threshold = overload_threshold
        self.public_dir = public_dir

        self._thread: Optional[threading.Thread] = None
        self._stop_event = threading.Event()
        self._lock = threading.Lock()

        self._devices: Dict[int, Optional[RtlSdr]] = {cfg.index: None for cfg in devices}
        self._statuses: Dict[int, DeviceStatus] = {
            cfg.index: DeviceStatus(
                index=cfg.index,
                name=cfg.name,
                available=False,
                power_db=None,
                overload=False,
                last_timestamp=None,
                error_count=0,
            )
            for cfg in devices
        }

    # ------ Lifecycle ------ #

    def start(self) -> None:
        if self._thread and self._thread.is_alive():
            return
        self._stop_event.clear()
        self._thread = threading.Thread(target=self._run, name="SDRMonitorThread", daemon=True)
        self._thread.start()

    def stop(self) -> None:
        self._stop_event.set()
        if self._thread and self._thread.is_alive():
            self._thread.join(timeout=5.0)
        for cfg in self.devices_config:
            safe_close_sdr(self._devices.get(cfg.index), cfg.name)

    # ------ Public API ------ #

    def get_statuses(self) -> List[DeviceStatus]:
        with self._lock:
            # Buat copy untuk thread safety dan serialization
            return [
                DeviceStatus(
                    index=status.index,
                    name=status.name,
                    available=status.available,
                    power_db=status.power_db,
                    overload=status.overload,
                    last_timestamp=status.last_timestamp,
                    error_count=status.error_count,
                )
                for cfg in self.devices_config
                for status in [self._statuses[cfg.index]]
            ]

    def get_status(self, index: int) -> DeviceStatus:
        with self._lock:
            status = self._statuses.get(index)
            if not status:
                raise KeyError(index)
            # Buat copy untuk serialization
            return DeviceStatus(
                index=status.index,
                name=status.name,
                available=status.available,
                power_db=status.power_db,
                overload=status.overload,
                last_timestamp=status.last_timestamp,
                error_count=status.error_count,
            )

    # ------ Internal Helpers ------ #

    def _initialise_device(self, cfg: DeviceConfig) -> Optional[RtlSdr]:
        try:
            print(f"Menginisialisasi perangkat (Index {cfg.index})...")
            sdr = RtlSdr(device_index=cfg.index)
            sdr.sample_rate = self.sample_rate
            sdr.center_freq = self.frequency_hz
            try:
                sdr.set_agc_mode(False)
            except Exception:
                pass
            sdr.gain = self.manual_gain
            print(f"  ✓ {cfg.name} berhasil diinisialisasi")
            return sdr
        except Exception as exc:
            print(f"  ✗ Gagal inisialisasi {cfg.name}: {exc}")
            return None

    def _update_status(
        self,
        cfg: DeviceConfig,
        available: bool,
        power_db: Optional[float],
        overload: bool,
        error_increment: int = 0,
    ) -> None:
        with self._lock:
            status = self._statuses[cfg.index]
            status.available = available
            status.power_db = power_db
            status.overload = overload
            if power_db is not None:
                status.last_timestamp = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
            if error_increment:
                status.error_count += error_increment
            elif power_db is not None:
                status.error_count = 0

    def _run(self) -> None:
        try:
            # Inisialisasi perangkat
            print("\n=== Inisialisasi Perangkat SDR ===")
            for cfg in self.devices_config:
                self._devices[cfg.index] = self._initialise_device(cfg)
                status = "✓ Berhasil" if self._devices[cfg.index] is not None else "✗ Gagal"
                print(f"  {cfg.name}: {status}")
                self._update_status(cfg, self._devices[cfg.index] is not None, None, False)

            if not any(self._devices.values()):
                print("\n✗ Tidak ada perangkat SDR yang berhasil diinisialisasi.")
                return

            # Tampilkan ringkasan device yang aktif
            active_devices = [cfg.name for cfg in self.devices_config if self._devices.get(cfg.index) is not None]
            print(f"\n✓ Konfigurasi selesai. Device aktif: {', '.join(active_devices)}")
            
            # Pastikan direktori public ada
            public_path = os.path.abspath(self.public_dir)
            os.makedirs(self.public_dir, exist_ok=True)
            print(f"✓ Direktori output: {public_path}")
            print(f"  - data.json: {os.path.join(public_path, 'data.json')}")
            print(f"  - data2.json: {os.path.join(public_path, 'data2.json')}")
            
            print("Memulai pembacaan daya (FastAPI backend)...\n")
            
            # Tampilkan status device yang aktif
            active_count = sum(1 for cfg in self.devices_config if self._devices.get(cfg.index) is not None)
            print(f"📊 Device aktif: {active_count}/{len(self.devices_config)}")
            for cfg in self.devices_config:
                if self._devices.get(cfg.index) is not None:
                    print(f"  ✓ {cfg.name} siap")
                else:
                    print(f"  ✗ {cfg.name} tidak tersedia")
            print()

            # Track error count per device untuk recovery
            device_error_count = {cfg.index: 0 for cfg in self.devices_config}
            device_overload_cooldown = {cfg.index: 0.0 for cfg in self.devices_config}
            device_last_error_reduction = {cfg.index: 0.0 for cfg in self.devices_config}  # Track kapan terakhir kurangi error count
            
            loop_count = 0
            while not self._stop_event.is_set():
                loop_count += 1
                # Log setiap 10 loop (sekitar setiap 10 detik dengan sleep 1.0)
                if loop_count % 10 == 0:
                    print(f"[Loop {loop_count}] Memproses {len(self.devices_config)} device...")
                elif loop_count == 1:
                    # Log di loop pertama untuk konfirmasi loop berjalan
                    print(f"[Loop {loop_count}] Memulai loop pembacaan...")
                
                for cfg in self.devices_config:
                    sdr = self._devices.get(cfg.index)
                    if sdr is None:
                        # Log setiap 10 loop untuk menghindari spam
                        if loop_count % 10 == 0:
                            print(f"⚠ {cfg.name}: Device tidak tersedia (None), skip pembacaan")
                        elif loop_count == 1:
                            # Log di loop pertama untuk debugging
                            print(f"⚠ {cfg.name}: Device tidak tersedia (None), skip pembacaan")
                        continue

                    # Skip pembacaan jika masih dalam cooldown setelah overload
                    current_time = time.time()
                    if current_time < device_overload_cooldown[cfg.index]:
                        # Saat dalam cooldown, kurangi error count sedikit setiap 2 detik untuk recovery bertahap
                        # Ini mencegah stuck di cooldown panjang jika PTT sudah selesai
                        if device_error_count[cfg.index] > 0 and (current_time - device_last_error_reduction[cfg.index]) >= 2.0:
                            device_error_count[cfg.index] = max(0, device_error_count[cfg.index] - 1)
                            device_last_error_reduction[cfg.index] = current_time
                        # Log cooldown setiap 10 detik atau di loop pertama
                        remaining_cooldown = device_overload_cooldown[cfg.index] - current_time
                        if int(current_time) % 10 == 0 or loop_count == 1:
                            print(f"⏳ {cfg.name}: Masih dalam cooldown ({remaining_cooldown:.1f}s tersisa)")
                        continue
                    
                    # Setelah cooldown selesai, kurangi error count untuk recovery bertahap
                    # Ini mencegah stuck di cooldown panjang jika PTT sudah selesai
                    if device_error_count[cfg.index] > 0:
                        # Kurangi error count lebih agresif setelah cooldown panjang (PTT mungkin sudah selesai)
                        reduction = 5 if device_error_count[cfg.index] >= 10 else 3
                        device_error_count[cfg.index] = max(0, device_error_count[cfg.index] - reduction)
                        if device_error_count[cfg.index] == 0:
                            print(f"✓ {cfg.name}: Cooldown selesai, mencoba recovery...")
                        else:
                            # Jangan log setiap kali, hanya setiap 5 kali untuk mengurangi spam
                            if device_error_count[cfg.index] % 5 == 0:
                                print(f"✓ {cfg.name}: Cooldown selesai, error count: {device_error_count[cfg.index]}, mencoba recovery...")

                    try:
                        samples, error = read_samples_with_retry(sdr, self.num_samples, max_retries=2)
                        if error:
                            error_str = str(error).lower()
                            # Deteksi access violation atau register write error
                            # Error-error ini termasuk: rtlsdr_write_reg, rtlsdr_demod_write_reg,
                            # rtlsdr_demod_read_reg, r82xx_write, i2c wr failed, dll
                            if any(keyword in error_str for keyword in [
                                'access violation', 'write_reg', 'rtlsdr', 'rtlsdr_demod',
                                'r82xx_write', 'i2c wr failed', 'read_reg'
                            ]):
                                # Pesan error dari driver sudah muncul di stderr, cukup log sekali
                                if device_error_count[cfg.index] == 0 or device_error_count[cfg.index] % 5 == 0:
                                    print(f"⚠ {cfg.name}: Overload/access violation terdeteksi (PTT aktif?), skip pembacaan...")
                                device_error_count[cfg.index] += 1
                                
                                # Saat PTT aktif, device mengalami overload dan perlu waktu lebih lama untuk recover
                                # Set cooldown lebih panjang untuk menghindari spam error
                                if device_error_count[cfg.index] >= 15:
                                    # Setelah 15 error berulang, kemungkinan PTT masih aktif - cooldown 30 detik
                                    device_overload_cooldown[cfg.index] = current_time + 30.0
                                    if device_error_count[cfg.index] == 15:
                                        print(f"⚠ {cfg.name}: PTT masih aktif? Cooldown diperpanjang ke 30 detik...")
                                elif device_error_count[cfg.index] >= 10:
                                    # Setelah 10 error, cooldown 20 detik
                                    device_overload_cooldown[cfg.index] = current_time + 20.0
                                    if device_error_count[cfg.index] == 10:
                                        print(f"⚠ {cfg.name}: Banyak error berulang, cooldown diperpanjang ke 20 detik...")
                                elif device_error_count[cfg.index] >= 5:
                                    # Setelah 5 error, cooldown 15 detik
                                    device_overload_cooldown[cfg.index] = current_time + 15.0
                                else:
                                    # Cooldown awal: 10 detik (lebih lama dari sebelumnya)
                                    device_overload_cooldown[cfg.index] = current_time + 10.0
                                
                                self._update_status(cfg, False, None, True, error_increment=1)
                                # Tidak perlu sleep tambahan, sudah di-skip dengan cooldown
                                continue
                            else:
                                # Error biasa, reset counter
                                device_error_count[cfg.index] = 0
                                print(f"⚠ Error baca {cfg.name}: {error}")
                                self._update_status(cfg, False, None, False, error_increment=1)
                                time.sleep(1.0)
                                continue

                        # Reset error count penuh jika berhasil membaca (recovery berhasil)
                        was_in_cooldown = device_error_count[cfg.index] > 0
                        device_error_count[cfg.index] = 0
                        device_overload_cooldown[cfg.index] = 0.0  # Reset cooldown juga
                        device_last_error_reduction[cfg.index] = 0.0  # Reset juga

                        # Hitung daya mentah (raw) dari SDR
                        power_mentah = calculate_power(samples)
                        
                        # --- IMPLEMENTASI KALIBRASI REGRESI LINIER ---
                        # KALIBRASI DINONAKTIFKAN - menggunakan nilai mentah
                        # # Terapkan formula kalibrasi berdasarkan index device
                        # if cfg.index == 0:
                        #     power_db = (M_SDR_0 * power_mentah) + C_SDR_0
                        # elif cfg.index == 1:
                        #     power_db = (M_SDR_1 * power_mentah) + C_SDR_1
                        # else:
                        #     # Fallback untuk device index lain (tidak dikalibrasi)
                        #     power_db = power_mentah
                        
                        # Gunakan nilai mentah tanpa kalibrasi
                        power_db = power_mentah
                        
                        overload = detect_overload(power_db, self.overload_threshold)
                        
                        # Jika overload terdeteksi dari power (bukan error), set cooldown singkat
                        if overload:
                            device_overload_cooldown[cfg.index] = current_time + 0.5  # Skip 0.5 detik saat overload
                            print(f"⚠ {cfg.name}: Overload terdeteksi ({power_db:.2f} dB), skip pembacaan sementara")
                        else:
                            # Reset cooldown jika tidak overload
                            device_overload_cooldown[cfg.index] = 0.0
                            # Log recovery jika sebelumnya dalam cooldown
                            if was_in_cooldown:
                                print(f"✓ {cfg.name}: Recovery berhasil, pembacaan normal ({power_db:.2f} dB)")
                        
                        self._update_status(cfg, True, power_db, overload)

                        # Pastikan data selalu ditulis setelah berhasil membaca (untuk real-time update)
                        ts = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
                        file_name = "data.json" if cfg.index == 0 else "data2.json"
                        file_path = os.path.join(self.public_dir, file_name)
                        write_success = append_measurement_to_public(
                            file_path,
                            {
                                "timestamp": ts,
                                "power_db": float(power_db),
                                "frequency": float(self.frequency_hz),
                            },
                            max_items=2000,
                        )
                        
                        if write_success:
                            # Tampilkan pembacaan daya setiap kali data berhasil ditulis
                            print(f"✓ {cfg.name}: Data ditulis ke {file_name} ({power_db:.2f} dBm)")
                        else:
                            print(f"✗ {cfg.name}: GAGAL menulis ke {file_name} - cek error di atas")
                    except Exception as e:
                        # Catch semua exception yang tidak terduga
                        error_str = str(e).lower()
                        if 'access violation' in error_str or 'write_reg' in error_str or 'rtlsdr' in error_str:
                            print(f"⚠ {cfg.name}: Exception overload terdeteksi: {e}")
                            device_error_count[cfg.index] += 1
                            # Cooldown progresif seperti di error handler
                            if device_error_count[cfg.index] >= 10:
                                device_overload_cooldown[cfg.index] = current_time + 10.0
                            else:
                                cooldown_duration = 3.0 + (device_error_count[cfg.index] * 2.0)
                                device_overload_cooldown[cfg.index] = current_time + cooldown_duration
                            self._update_status(cfg, False, None, True, error_increment=1)
                        else:
                            # Error lain, reset counter dan cooldown lebih pendek
                            device_error_count[cfg.index] = 0
                            print(f"⚠ {cfg.name}: Unexpected error: {e}")
                            self._update_status(cfg, False, None, False, error_increment=1)
                            time.sleep(1.0)

                time.sleep(1.0)  # Update setiap 1 detik

        finally:
            for cfg in self.devices_config:
                safe_close_sdr(self._devices.get(cfg.index), cfg.name)


# ------------------ FastAPI Setup ------------------ #

app = FastAPI(title="SDR Power Monitor", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"]
    ,
    allow_headers=["*"],
)


devices_default = [
    DeviceConfig(index=0, name="SDR Index 0"),
    DeviceConfig(index=1, name="SDR Index 1"),
]

monitor = SDRMonitor(
    devices=devices_default,
    frequency_hz=145.750e6,
    sample_rate=2.048e6,
    manual_gain=0,
    num_samples=4096,
    overload_threshold=-5.0,
    public_dir="public",
)


@app.on_event("startup")
def on_startup():
    monitor.start()


@app.on_event("shutdown")
def on_shutdown():
    monitor.stop()


@app.get("/")
def root():
    return {"message": "SDR Power Monitor API", "version": "1.0.0"}


@app.get("/health")
def health():
    return {"status": "ok", "monitor_running": monitor._thread is not None and monitor._thread.is_alive()}


@app.get("/status", response_model=List[DeviceStatus])
def get_all_status():
    try:
        statuses = monitor.get_statuses()
        return statuses
    except Exception as e:
        print(f"Error in get_all_status: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@app.get("/status/{device_index}", response_model=DeviceStatus)
def get_status(device_index: int):
    try:
        return monitor.get_status(device_index)
    except KeyError:
        raise HTTPException(status_code=404, detail="Device not found")
    except Exception as e:
        print(f"Error in get_status: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


class ControlRequest(BaseModel):
    action: str


@app.post("/control")
def control_backend(request: ControlRequest):
    action = request.action.lower()
    if action == "start":
        monitor.start()
        return {"message": "monitor started"}
    if action == "stop":
        monitor.stop()
        return {"message": "monitor stopped"}
    raise HTTPException(status_code=400, detail="Unknown action")


def run():
    import uvicorn

    uvicorn.run(
        "sdr_backend_service:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info",
    )


if __name__ == "__main__":
    run()


