"""
Script Kalibrasi Regresi Linier untuk SDR
Menggunakan scikit-learn untuk menghitung konstanta kalibrasi (m dan c)
untuk mengkonversi nilai mentah SDR menjadi nilai sebenarnya (dBm)

Formula: Nilai Sebenarnya (dBm) = m * (Nilai Bacaan SDR) + c
"""

import numpy as np
from sklearn.linear_model import LinearRegression

# Matplotlib opsional (untuk visualisasi)
try:
    import matplotlib.pyplot as plt
    HAS_MATPLOTLIB = True
except ImportError:
    HAS_MATPLOTLIB = False
    print("⚠ Matplotlib tidak terinstall. Grafik tidak akan dibuat.")
    print("   Install dengan: python -m pip install matplotlib\n")

# ============================================================
# INSTRUKSI: GANTI DATA DI BAWAH INI DENGAN DATA HASIL PENGUKURANMU
# ============================================================

# --- Data untuk SDR 0 (CPL_in / Index 0) ---
# Data dari Spreadsheet (RTLSDR 1)
# Format: [nilai bacaan SDR mentah dalam dB]
X_sdr_0 = np.array([
    1.09,    # Nilai bacaan SDR saat Sigen = 0 dBm
    1.09,    # Nilai bacaan SDR saat Sigen = -5 dBm
    1.08,    # Nilai bacaan SDR saat Sigen = -10 dBm
    1.02,    # Nilai bacaan SDR saat Sigen = -15 dBm
    0.81,    # Nilai bacaan SDR saat Sigen = -20 dBm
    -1.77,   # Nilai bacaan SDR saat Sigen = -25 dBm
    -6.76,   # Nilai bacaan SDR saat Sigen = -30 dBm
    -11.76,  # Nilai bacaan SDR saat Sigen = -35 dBm
    -16.74,  # Nilai bacaan SDR saat Sigen = -40 dBm
    -21.73,  # Nilai bacaan SDR saat Sigen = -45 dBm
    -26.66,  # Nilai bacaan SDR saat Sigen = -50 dBm
    -31.47,  # Nilai bacaan SDR saat Sigen = -55 dBm
    -35.97,  # Nilai bacaan SDR saat Sigen = -60 dBm
    -39.56,  # Nilai bacaan SDR saat Sigen = -65 dBm
    -41.85,  # Nilai bacaan SDR saat Sigen = -70 dBm
    -42.85,  # Nilai bacaan SDR saat Sigen = -75 dBm
    -43.23,  # Nilai bacaan SDR saat Sigen = -80 dBm
])

# Format: [nilai sebenarnya dari Signal Generator dalam dBm]
Y_sigen_0 = np.array([
    0,       # Nilai Sigen saat X_sdr_0[0] diukur
    -5,      # Nilai Sigen saat X_sdr_0[1] diukur
    -10,     # Nilai Sigen saat X_sdr_0[2] diukur
    -15,     # Nilai Sigen saat X_sdr_0[3] diukur
    -20,     # Nilai Sigen saat X_sdr_0[4] diukur
    -25,     # Nilai Sigen saat X_sdr_0[5] diukur
    -30,     # Nilai Sigen saat X_sdr_0[6] diukur
    -35,     # Nilai Sigen saat X_sdr_0[7] diukur
    -40,     # Nilai Sigen saat X_sdr_0[8] diukur
    -45,     # Nilai Sigen saat X_sdr_0[9] diukur
    -50,     # Nilai Sigen saat X_sdr_0[10] diukur
    -55,     # Nilai Sigen saat X_sdr_0[11] diukur
    -60,     # Nilai Sigen saat X_sdr_0[12] diukur
    -65,     # Nilai Sigen saat X_sdr_0[13] diukur
    -70,     # Nilai Sigen saat X_sdr_0[14] diukur
    -75,     # Nilai Sigen saat X_sdr_0[15] diukur
    -80,     # Nilai Sigen saat X_sdr_0[16] diukur
])

# --- Data untuk SDR 1 (CPL_out / Index 1) ---
# Data dari Spreadsheet (RTLSDR 2)
# Format: [nilai bacaan SDR mentah dalam dB]
X_sdr_1 = np.array([
    1.09,    # Nilai bacaan SDR saat Sigen = 0 dBm
    1.09,    # Nilai bacaan SDR saat Sigen = -5 dBm
    1.08,    # Nilai bacaan SDR saat Sigen = -10 dBm
    0.99,    # Nilai bacaan SDR saat Sigen = -15 dBm
    0.67,    # Nilai bacaan SDR saat Sigen = -20 dBm
    -3.0,    # Nilai bacaan SDR saat Sigen = -25 dBm
    -7.97,   # Nilai bacaan SDR saat Sigen = -30 dBm
    -12.92,  # Nilai bacaan SDR saat Sigen = -35 dBm
    -17.6,   # Nilai bacaan SDR saat Sigen = -40 dBm
    -22.56,  # Nilai bacaan SDR saat Sigen = -45 dBm
    -27.53,  # Nilai bacaan SDR saat Sigen = -50 dBm
    -32.31,  # Nilai bacaan SDR saat Sigen = -55 dBm
    -36.75,  # Nilai bacaan SDR saat Sigen = -60 dBm
    -40.02,  # Nilai bacaan SDR saat Sigen = -65 dBm
    -42.3,   # Nilai bacaan SDR saat Sigen = -70 dBm
    -43.16,  # Nilai bacaan SDR saat Sigen = -75 dBm
    -43.34,  # Nilai bacaan SDR saat Sigen = -80 dBm
])

# Format: [nilai sebenarnya dari Signal Generator dalam dBm]
Y_sigen_1 = np.array([
    0,       # Nilai Sigen saat X_sdr_1[0] diukur
    -5,      # Nilai Sigen saat X_sdr_1[1] diukur
    -10,     # Nilai Sigen saat X_sdr_1[2] diukur
    -15,     # Nilai Sigen saat X_sdr_1[3] diukur
    -20,     # Nilai Sigen saat X_sdr_1[4] diukur
    -25,     # Nilai Sigen saat X_sdr_1[5] diukur
    -30,     # Nilai Sigen saat X_sdr_1[6] diukur
    -35,     # Nilai Sigen saat X_sdr_1[7] diukur
    -40,     # Nilai Sigen saat X_sdr_1[8] diukur
    -45,     # Nilai Sigen saat X_sdr_1[9] diukur
    -50,     # Nilai Sigen saat X_sdr_1[10] diukur
    -55,     # Nilai Sigen saat X_sdr_1[11] diukur
    -60,     # Nilai Sigen saat X_sdr_1[12] diukur
    -65,     # Nilai Sigen saat X_sdr_1[13] diukur
    -70,     # Nilai Sigen saat X_sdr_1[14] diukur
    -75,     # Nilai Sigen saat X_sdr_1[15] diukur
    -80,     # Nilai Sigen saat X_sdr_1[16] diukur
])

# ============================================================
# VALIDASI DATA
# ============================================================

if len(X_sdr_0) != len(Y_sigen_0):
    raise ValueError("ERROR: Jumlah data X_sdr_0 dan Y_sigen_0 harus sama!")
if len(X_sdr_1) != len(Y_sigen_1):
    raise ValueError("ERROR: Jumlah data X_sdr_1 dan Y_sigen_1 harus sama!")
if len(X_sdr_0) < 2:
    raise ValueError("ERROR: Minimal butuh 2 titik data untuk regresi linier!")
if len(X_sdr_1) < 2:
    raise ValueError("ERROR: Minimal butuh 2 titik data untuk regresi linier!")

# ============================================================
# KALIBRASI SDR 0 (CPL_in / Index 0)
# ============================================================

print("=" * 60)
print("KALIBRASI SDR 0 (CPL_in / Index 0)")
print("=" * 60)

# Scikit-learn butuh X dalam format 2D, jadi kita reshape
X_sdr_0_2d = X_sdr_0.reshape(-1, 1)

# Latih model regresi linier
model_0 = LinearRegression()
model_0.fit(X_sdr_0_2d, Y_sigen_0)

# Dapatkan konstanta kalibrasi
m_0 = model_0.coef_[0]  # Slope (kemiringan)
c_0 = model_0.intercept_  # Intercept (titik potong)
r2_0 = model_0.score(X_sdr_0_2d, Y_sigen_0)  # R-squared (koefisien determinasi)

print(f"\n📊 Hasil Kalibrasi:")
print(f"   Persamaan: y = {m_0:.6f} * x + {c_0:.6f}")
print(f"   R-squared: {r2_0:.6f}")
print(f"\n   Konstanta untuk kode:")
print(f"   M_SDR_0 = {m_0:.6f}")
print(f"   C_SDR_0 = {c_0:.6f}")

# Prediksi untuk validasi
print(f"\n📈 Validasi (Prediksi vs Aktual):")
for i in range(len(X_sdr_0)):
    predicted = model_0.predict([[X_sdr_0[i]]])[0]
    error = abs(predicted - Y_sigen_0[i])
    print(f"   X={X_sdr_0[i]:6.2f} dB → Prediksi: {predicted:6.2f} dBm, Aktual: {Y_sigen_0[i]:6.2f} dBm, Error: {error:.3f} dB")

# ============================================================
# KALIBRASI SDR 1 (CPL_out / Index 1)
# ============================================================

print("\n" + "=" * 60)
print("KALIBRASI SDR 1 (CPL_out / Index 1)")
print("=" * 60)

# Scikit-learn butuh X dalam format 2D, jadi kita reshape
X_sdr_1_2d = X_sdr_1.reshape(-1, 1)

# Latih model regresi linier
model_1 = LinearRegression()
model_1.fit(X_sdr_1_2d, Y_sigen_1)

# Dapatkan konstanta kalibrasi
m_1 = model_1.coef_[0]  # Slope (kemiringan)
c_1 = model_1.intercept_  # Intercept (titik potong)
r2_1 = model_1.score(X_sdr_1_2d, Y_sigen_1)  # R-squared (koefisien determinasi)

print(f"\n📊 Hasil Kalibrasi:")
print(f"   Persamaan: y = {m_1:.6f} * x + {c_1:.6f}")
print(f"   R-squared: {r2_1:.6f}")
print(f"\n   Konstanta untuk kode:")
print(f"   M_SDR_1 = {m_1:.6f}")
print(f"   C_SDR_1 = {c_1:.6f}")

# Prediksi untuk validasi
print(f"\n📈 Validasi (Prediksi vs Aktual):")
for i in range(len(X_sdr_1)):
    predicted = model_1.predict([[X_sdr_1[i]]])[0]
    error = abs(predicted - Y_sigen_1[i])
    print(f"   X={X_sdr_1[i]:6.2f} dB → Prediksi: {predicted:6.2f} dBm, Aktual: {Y_sigen_1[i]:6.2f} dBm, Error: {error:.3f} dB")

# ============================================================
# VISUALISASI (OPSIONAL)
# ============================================================

if HAS_MATPLOTLIB:
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))
    
    # Plot SDR 0
    ax1.scatter(X_sdr_0, Y_sigen_0, color='blue', s=50, label='Data Pengukuran')
    X_line_0 = np.linspace(X_sdr_0.min() - 2, X_sdr_0.max() + 2, 100)
    Y_line_0 = model_0.predict(X_line_0.reshape(-1, 1))
    ax1.plot(X_line_0, Y_line_0, 'r-', linewidth=2, label=f'Regresi: y = {m_0:.4f}x + {c_0:.4f}')
    ax1.set_xlabel('Nilai Bacaan SDR (dB)', fontsize=10)
    ax1.set_ylabel('Nilai Sebenarnya Sigen (dBm)', fontsize=10)
    ax1.set_title(f'SDR 0 (CPL_in) - R² = {r2_0:.4f}', fontsize=12, fontweight='bold')
    ax1.grid(True, alpha=0.3)
    ax1.legend()
    
    # Plot SDR 1
    ax2.scatter(X_sdr_1, Y_sigen_1, color='green', s=50, label='Data Pengukuran')
    X_line_1 = np.linspace(X_sdr_1.min() - 2, X_sdr_1.max() + 2, 100)
    Y_line_1 = model_1.predict(X_line_1.reshape(-1, 1))
    ax2.plot(X_line_1, Y_line_1, 'r-', linewidth=2, label=f'Regresi: y = {m_1:.4f}x + {c_1:.4f}')
    ax2.set_xlabel('Nilai Bacaan SDR (dB)', fontsize=10)
    ax2.set_ylabel('Nilai Sebenarnya Sigen (dBm)', fontsize=10)
    ax2.set_title(f'SDR 1 (CPL_out) - R² = {r2_1:.4f}', fontsize=12, fontweight='bold')
    ax2.grid(True, alpha=0.3)
    ax2.legend()
    
    plt.tight_layout()
    plt.savefig('kalibrasi_regresi.png', dpi=150, bbox_inches='tight')
    print("\n✅ Grafik disimpan sebagai 'kalibrasi_regresi.png'")
    plt.show()
else:
    print("\n⚠ Grafik tidak dibuat karena matplotlib tidak terinstall.")

# ============================================================
# OUTPUT KONSTANTA UNTUK KODE
# ============================================================

print("\n" + "=" * 60)
print("KONSTANTA UNTUK DIPAKAI DI KODE:")
print("=" * 60)
print(f"""
# --- Konstanta Kalibrasi (Dari hasil kalibrasi.py) ---
M_SDR_0 = {m_0:.6f}  # Slope untuk SDR Index 0 (CPL_in)
C_SDR_0 = {c_0:.6f}  # Intercept untuk SDR Index 0 (CPL_in)
M_SDR_1 = {m_1:.6f}  # Slope untuk SDR Index 1 (CPL_out)
C_SDR_1 = {c_1:.6f}  # Intercept untuk SDR Index 1 (CPL_out)
# R-squared SDR 0: {r2_0:.6f}
# R-squared SDR 1: {r2_1:.6f}
""")

print("✅ Kalibrasi selesai! Copy konstanta di atas ke file TA_test_daya.py dan sdr_backend_service.py")

