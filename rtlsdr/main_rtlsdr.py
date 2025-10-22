import time
import json
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
while True:
    samples = sdr.read_samples(200000)
    real_part = samples[100000].real # in phase
    imag_part = samples[100000].imag # quadrature
    magnitude = real_part**2 + imag_part**2
    power_db = 10 * np.log10(10*magnitude)
    power_db =
    '''sum += power_db
    if power_db > highest:
        highest = power_db
    if power_db < lowest:
        lowest = power_db'''


    current_time = datetime.now()
    shifted_time = current_time - timedelta(hours=7)


    data_entry = {
            'timestamp': shifted_time.strftime('%Y/%m/%d %H:%M:%S'),
            'power_db' : power_db,
            'frequency' : sdr.center_freq
            }
    data_list.append(data_entry)

    with open('data2.json', mode='w') as file:
        json.dump(data_list, file, indent=4)
    print(data_entry)

    time.sleep(1)
'''print(sum/60)
print(highest)
print(lowest)'''
sdr.close()

            