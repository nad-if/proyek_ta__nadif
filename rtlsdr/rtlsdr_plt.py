from pylab import *
from rtlsdr import *
import numpy as np
import time
import matplotlib.pyplot as plt
import matplotlib.animation as animation

sdr = RtlSdr()

# Configure device
sdr.sample_rate = 2400000
sdr.center_freq = 400e6
N = 256 * 1024
T = N / sdr.sample_rate

while True:
    # Read samples
    samples = sdr.read_samples(N)

    # FFT
    S_f = np.fft.fft(samples)
    frequencies = np.fft.fftfreq(N, 1 / sdr.sample_rate)

    # Correct baseband indexing
    baseband_freq = 400  # Baseband frequency for the center freq
    target_idx = np.where(np.isclose(frequencies, baseband_freq))[0][0]

    # Power calculation
    power_f0 = np.abs(S_f[target_idx])**2 / N
    power_f0 = 10 * np.log10(10*power_f0)

    print(f"Power at baseband (center freq {sdr.center_freq} Hz): {power_f0:.4f}")
    time.sleep(1)
sdr.close()
