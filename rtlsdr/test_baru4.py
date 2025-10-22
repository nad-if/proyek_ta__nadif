import subprocess
import threading
import time
import csv
import os
import json
import asyncio
import websockets
import logging
from queue import Queue
from datetime import datetime, timedelta
from http.server import SimpleHTTPRequestHandler
from socketserver import TCPServer

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Shared queues for data processing
data_queues = {}
websocket_clients = set()
websocket_loop = None  # Global reference to the WebSocket event loop

def rtlpower(output_file='fm_spectrum.csv', device_id=0):
    command = (
        f"rtl_power -f 99000000:101000000:100000 -g 0 -p 0 -1 -i 1 "
        f"-d {device_id} {output_file}"
    )
    while True:
        try:
            subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL,
                         check=True, shell=True)
        except subprocess.CalledProcessError as e:
            logger.error(f"rtl_power (device {device_id}) failed: {e}")
            time.sleep(1)

def process_data(file_path, queue, device_id):
    last_mtime = 0
    buffer = []
    batch_size = 100  # Smaller batch for real-time
    
    global websocket_loop
    while True:
        try:
            current_mtime = os.path.getmtime(file_path)
            if current_mtime <= last_mtime and queue.empty():
                time.sleep(0.01)  # Very short sleep for real-time
                continue
                
            last_mtime = current_mtime
            temp_value = 0
            
            with open(file_path, newline='') as csvfile:
                reader = csv.reader(csvfile)
                for row in reader:
                    try:
                        timestamp = datetime.strptime(
                            f"{row[0][0:4]}/{row[0][5:7]}/{row[0][8:10]} {row[1]}",
                            "%Y/%m/%d %H:%M:%S"
                        ) - timedelta(hours=7)
                        
                        start_freq, end_freq = int(row[2]), int(row[3])
                        freq_range = end_freq - start_freq
                        num_bins = len(row) - 6
                        
                        for i, value in enumerate(row[6:], start=1):
                            if value != ' nan':
                                temp_value = float(value)  # Simplified real_db
                            bin_freq = start_freq + (freq_range / num_bins) * (i-1)
                            
                            data = {
                                'timestamp': str(timestamp),
                                'power_db': temp_value,
                                'frequency': bin_freq,
                                'device_id': device_id
                            }
                            buffer.append(data)
                            
                            if len(buffer) >= batch_size:
                                queue.put(buffer[:])
                                # Schedule broadcast_update in the WebSocket event loop
                                if websocket_loop:
                                    websocket_loop.call_soon_threadsafe(
                                        lambda: asyncio.ensure_future(broadcast_update(data))
                                    )
                                buffer.clear()
                    
                    except (IndexError, ValueError) as e:
                        logger.warning(f"Data parsing error: {e}")
                        continue
            
            if buffer:
                queue.put(buffer[:])
                if websocket_loop:
                    websocket_loop.call_soon_threadsafe(
                        lambda: asyncio.ensure_future(broadcast_update(buffer[-1]))
                    )
                buffer.clear()
                
        except FileNotFoundError:
            logger.info(f"Waiting for {file_path}...")
            time.sleep(1)
        except Exception as e:
            logger.error(f"Processing error: {e}")
            time.sleep(0.1)

def write_json(queue, json_path):
    while True:
        try:
            batch = queue.get(timeout=1)
            if not batch:
                continue
                
            existing_data = []
            if os.path.exists(json_path):
                try:
                    with open(json_path, 'r') as file:
                        existing_data = json.load(file)
                except json.JSONDecodeError:
                    logger.warning(f"Resetting invalid JSON: {json_path}")
            
            existing_keys = {(d['timestamp'], d['frequency']) for d in existing_data}
            new_entries = [entry for entry in batch 
                         if (entry['timestamp'], entry['frequency']) not in existing_keys]
            
            if new_entries:
                existing_data.extend(new_entries)
                with open(json_path, 'w') as file:
                    json.dump(existing_data, file, indent=4)
                logger.info(f"Added {len(new_entries)} entries to {json_path}")
                
            queue.task_done()
            
        except Queue.Empty:
            continue
        except Exception as e:
            logger.error(f"JSON write error: {e}")

async def websocket_handler(websocket, path):
    websocket_clients.add(websocket)
    try:
        await websocket.wait_closed()
    finally:
        websocket_clients.remove(websocket)

async def broadcast_update(data):
    if websocket_clients:
        message = json.dumps(data)
        await asyncio.gather(
            *[client.send(message) for client in websocket_clients],
            return_exceptions=True
        )

def start_websocket_server():
    global websocket_loop
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    websocket_loop = loop  # Store the loop for use in other threads
    server = websockets.serve(websocket_handler, "localhost", 8765)
    logger.info("WebSocket server running at ws://localhost:8765")
    loop.run_until_complete(server)
    loop.run_forever()

def start_http_server():
    PORT = 8000
    with TCPServer(("", PORT), SimpleHTTPRequestHandler) as httpd:
        logger.info(f"HTTP server running at http://localhost:{PORT}")
        httpd.serve_forever()

def main():
    config = {
        'rtl1': {
            'output_file': 'fm_spectrum.csv',
            'json_path': 'data.json',
            'device_id': 0
        },
        'rtl2': {
            'output_file': 'fm_spectrum2.csv',
            'json_path': 'data2.json',
            'device_id': 1
        }
    }
    
    # Initialize queues
    for device in config.values():
        data_queues[device['device_id']] = Queue()
    
    # Start RTL processes
    threads = []
    for device in config.values():
        t1 = threading.Thread(
            target=rtlpower,
            kwargs={'output_file': device['output_file'], 'device_id': device['device_id']},
            daemon=True
        )
        t2 = threading.Thread(
            target=process_data,
            args=(device['output_file'], data_queues[device['device_id']], device['device_id'])
        )
        t3 = threading.Thread(
            target=write_json,
            args=(data_queues[device['device_id']], device['json_path']),
            daemon=True
        )
        threads.extend([t1, t2, t3])
    
    # Start servers
    ws_thread = threading.Thread(target=start_websocket_server, daemon=True)
    http_thread = threading.Thread(target=start_http_server, daemon=True)
    threads.extend([ws_thread, http_thread])
    
    # Start all threads
    for thread in threads:
        thread.start()
    
    # Keep main thread alive
    try:
        threads[-1].join()  # Join HTTP server thread
    except KeyboardInterrupt:
        logger.info("Shutting down...")

if __name__ == "__main__":
    main()