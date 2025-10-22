import time
import json
import os
from rtlsdr import *
from pylab import *
import numpy as np
from datetime import datetime, timedelta
import matplotlib.animation as animation
import threading
from http.server import SimpleHTTPRequestHandler
from socketserver import TCPServer

sdr = RtlSdr()

# configure device
sdr.sample_rate = 2.048e6  # Hz
sdr.center_freq = 400e6     # Hz
sdr.freq_correction = 60   # PPM
sdr.gain = 1
fig = plt.figure()
#graph_out = fig.add_subplot(1, 1, 1)
sum = 0

#print(sdr.read_samples(512))

data_list = []

def start_server():
    PORT = 8000
    with TCPServer(("", PORT), SimpleHTTPRequestHandler) as httpd:
        print(f"Serving at http://localhost:{PORT}")
        httpd.serve_forever()

# Start the server in a new thread
server_thread = threading.Thread(target=start_server, daemon=True)
server_thread.start()
highest = -999
lowest = 999

# Pastikan penulisan file ke folder yang sama dengan skrip ini
script_dir = os.path.dirname(os.path.abspath(__file__))
output_path = os.path.join(script_dir, 'data2.json')

try:
    while True:
        samples = sdr.read_samples(200000)
        # Hitung power berbasis rata-rata magnitude kuadrat untuk stabilitas
        magnitude_mean = float(np.mean(np.abs(samples)**2))
        power_db = float(10 * np.log10(max(magnitude_mean, 1e-12)))

        current_time = datetime.now()
        shifted_time = current_time - timedelta(hours=7)

        data_entry = {
            'timestamp': shifted_time.strftime('%Y/%m/%d %H:%M:%S'),
            'power_db': power_db,
            'frequency': float(sdr.center_freq)
        }
        data_list.append(data_entry)

        with open(output_path, mode='w', encoding='utf-8') as file:
            json.dump(data_list, file, indent=4)
        print(data_entry)

        time.sleep(1)
finally:
    sdr.close()

            