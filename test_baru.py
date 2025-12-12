import subprocess, threading, time, csv, os, json
import pandas as pd
from http.server import SimpleHTTPRequestHandler
from socketserver import TCPServer
from datetime import datetime, timedelta

def rtlpower(# Mendefinisikan Parameter yang Digunakan
    LOWER_BAND = '99000000',         # Batas Bawah Frekuensi dengan satuan MHz
    UPPER_BAND = '101000000',        # Batas Atas Frekuensi dengan satuan MHz
    BIN_SIZE = '100000',             # Bin size for frequency resolution
    INTERVAL = '1',                 # Interval 
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

    command = f"rtl_power -f {LOWER_BAND}:{UPPER_BAND}:{BIN_SIZE} -g {GAIN}{DIRECT_SAMPLING}{PEAK_HOLD} -c {CORRECTION} -p 0 -1 -i {INTERVAL} {OUTPUT_FILE}"

    subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)

def real_db(power_db):
    #power_db = 0.0012*float(power_db)**3+0.0336*float(power_db)**2+1.1729*float(power_db)-21.552
    #power_db = 1.195*float(power_db)-20.076
    return float(power_db)

def bin_correction(power_db):
    return float(power_db)

def freq_correction(power_db):
    return float(power_db)

def span_correction(power_db):
    return float(power_db)

def run_rtlpower():                   
    while True:
        rtlpower()
        time.sleep(1)

def data_json(file_path="fm_spectrum.csv", json_path="data2.json"):
    last_size = 0
    temp_value = 0
    while True:
        try:
            current_size = os.path.getsize(file_path)
            new_data_list = []

            with open(file_path, newline='') as csvfile:
                reader = csv.reader(csvfile)
                for row in reader:
                    record_date = row[0] 
                    record_time = row[1] 
                    start_freq = int(row[2])
                    end_freq = int(row[3])
                    bin_size = float(row[4])
                    total_bins = int(row[5])

                    freq_range = end_freq - start_freq
                    for i, value in enumerate(row[6:], start=1):
                        bin_freq = start_freq + (freq_range / (len(row)-7)) * (i-1)
                        date_string = f"{record_date[0:4]}/{record_date[5:7]}/{record_date[8:10]} {record_time}"
                        date_object = datetime.strptime(date_string, "%Y/%m/%d %H:%M:%S")
                        date_object = date_object - timedelta(hours=7)
                        if str(value) != ' nan':
                            temp_value = real_db(value)
                        data_entry = {
                            'timestamp': f"{date_object}",
                            'power_db': float(temp_value),
                            'frequency': bin_freq
                        }
                        new_data_list.append(data_entry)

            # Handle JSON file operations
            if os.path.exists(json_path):
                try:
                    with open(json_path, 'r') as file:
                        existing_data = json.load(file)
                except json.JSONDecodeError:
                    # If JSON file is empty or invalid, we'll start with a new list
                    existing_data = []
            else:
                # JSON file does not exist, create an empty list
                existing_data = []

            # Filter out redundant data
            updated_data = existing_data.copy()
            for new_entry in new_data_list:
                if not any(entry['timestamp'] == new_entry['timestamp'] and entry['frequency'] == new_entry['frequency'] for entry in updated_data):
                    updated_data.append(new_entry)

            # Write updated data back to JSON file
            with open(json_path, 'w') as file:
                json.dump(updated_data, file, indent=4)
            print(f"JSON updated with {len(updated_data) - len(existing_data)} new entries. Total entries: {len(updated_data)}.")
            
        except FileNotFoundError:
            print("CSV file not found, waiting for file creation...")
        except Exception as e:
            print(f"An error occurred while updating JSON: {e}")
        time.sleep(1)  # Wait for some time before checking again
        
def start_server():
    PORT = 8000
    with TCPServer(("", PORT), SimpleHTTPRequestHandler) as httpd:
        print(f"Serving at http://localhost:{PORT}")
        httpd.serve_forever()

if __name__ == "__main__" :

    # Create threads
    thread1 = threading.Thread(target=run_rtlpower, daemon=True)
    thread2 = threading.Thread(target=data_json)

    # Start the server in a new thread
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()

    # Start threads
    thread1.start()
    thread2.start()

    # Wait for both threads to complete
    thread2.join()