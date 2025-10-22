import subprocess, threading, time, csv, os, json
import pandas as pd
from http.server import SimpleHTTPRequestHandler
from socketserver import TCPServer
from datetime import datetime, timedelta

def rtlpower(# Mendefinisikan Parameter yang Digunakan
    LOWER_BAND = '99000000',         # Batas Bawah Frekuensi dengan satuan MHz
    UPPER_BAND = '101000000',        # Batas Atas Frekuensi dengan satuan MHz
    BIN_SIZE = '100000',             # Bin size for frequency resolution
    INTERVAL = '10',                 # Interval 
    GAIN = '0',                      # Besar Gain
    OUTPUT_FILE = 'fm_spectrum.csv', # Path File Output
    CORRECTION = '0%',               # 
    DIRECT = 'NO',                   # Mengaktifkan Direct Sampling
    PEAK = 'NO'                     # Mengaktifkan Peak Hold
    ):                   

    DIRECT_SAMPLING = ""
    PEAK_HOLD = ""

    if DIRECT == "YES":
        DIRECT_SAMPLING = " -D"
    if PEAK == "YES":
        PEAK_HOLD = " -P"


    # Construct the command for rtl_power'

    command = f"rtl_power -f {LOWER_BAND}:{UPPER_BAND}:{BIN_SIZE} -g {GAIN}{DIRECT_SAMPLING}{PEAK_HOLD} -c {CORRECTION} -p 0 -i {INTERVAL} {OUTPUT_FILE}"

    subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)

def run_rtlpower():
    while True:
        rtlpower()
        time.sleep(1)


def data_json(file_path="fm_spectrum.csv", json_path="data2.json"):
    
    last_size = 0
    while True:
        try:
            current_size = os.path.getsize(file_path)
            if current_size != last_size:
                last_size = current_size
                data_list = []
                
                with open(file_path, newline='') as csvfile:
                    reader = csv.reader(csvfile)
                    for row in reader:
                        record_date = row[0] 
                        record_time = row[1] 
                        start_freq = int(row[2])
                        end_freq = int(row[3])
                        bin_size = float(row[4])
                        total_bins = int(row[5])
                        temp_value = 0

                        freq_range = end_freq - start_freq
                        for i, value in enumerate(row[6:], start=1):
                            bin_freq = start_freq + (freq_range / (len(row)-7)) * (i-1)
                            date_string = f"{record_date[0:4]}/{record_date[5:7]}/{record_date[8:10]} {record_time}"
                            date_object = datetime.strptime(date_string, "%Y/%m/%d %H:%M:%S")
                            date_object = date_object - timedelta(hours=7)
                            if str(value) != ' nan':
                                temp_value = float(value)
                                #temp_value = temp_value + 12.3
                                #temp_value = 0.1837*temp_value**3 + 9.2539*temp_value**2 + 157.02*temp_value + 888
                            data_entry = {
                                'timestamp': f"{date_object}",
                                'power_db': float(temp_value),
                                'frequency': bin_freq
                            }
                            data_list.append(data_entry)

                # Write to JSON file
                with open(json_path, mode='w') as file:
                    json.dump(data_list, file, indent=4)
                print(f"JSON updated with {len(data_list)} entries.")
            else:
                print("No changes detected in CSV for JSON update.")
        except FileNotFoundError:
            print("CSV file not found, waiting for file creation...")
        except Exception as e:
            print(f"An error occurred while updating JSON: {e}")
        time.sleep(10)  # Wait for some time before checking again


def start_server():
    PORT = 8000
    with TCPServer(("", PORT), SimpleHTTPRequestHandler) as httpd:
        print(f"Serving at http://localhost:{PORT}")
        httpd.serve_forever()

if __name__ == "__main__" :

    # Create threads
    thread1 = threading.Thread(target=rtlpower, daemon=True)
    thread2 = threading.Thread(target=data_json)

    # Start the server in a new thread
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()

    # Start threads
    thread1.start()
    thread2.start()

    # Wait for both threads to complete
    thread2.join()
 
    print("Both functions have completed.")