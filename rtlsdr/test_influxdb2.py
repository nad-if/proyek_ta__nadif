import csv
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS
import datetime

# InfluxDB connection details (adjust as needed)
url = "http://localhost:8086"
token = "kNbiZ21C64-SRVrcJ44eGnqKsd67tbGuhWyo6qyFrQZmDC7KtcHxNVROwDV9LbKOGjGPsW9-0JwgUg5l5KKOEA=="
org = "organization"
bucket = "Test_csv2"

# Create a client
client = InfluxDBClient(url=url, token=token, org=org)

# Create write API
write_api = client.write_api(write_options=SYNCHRONOUS)

path = 'fm_spectrum.csv'
# Open the CSV file
with open(path, newline='') as csvfile:
    reader = csv.reader(csvfile)

    for row in reader:
        if not row:  # Skip empty rows if any
            continue

        # Extracting the first six elements as keys
        date = row[0]
        time = row[1].strip()  # Remove leading/trailing whitespaces
        start_freq = int(row[2])
        end_freq = int(row[3])
        bin_size = float(row[4])
        total_bins = int(row[5])

        # Combine date and time for the point's timestamp
        dt = datetime.datetime.strptime(f"{date} {time}", '%Y-%m-%d %H:%M:%S')
        # Set the timestamp directly from the datetime object
        point = Point("frequency_spectrum") \
            .tag("date", date) \
            .tag("record_time", time) \
            .field("start_freq", start_freq) \
            .field("end_freq", end_freq) \
            .field("bin_size", bin_size) \
            .field("total_bins", total_bins) \
            .time(dt)  # Here we set the time directly from the datetime object

        # Calculate frequency for each bin and add it to the point
        freq_range = end_freq - start_freq
        for i, value in enumerate(row[6:], start=1):
            bin_freq = start_freq + (freq_range / (len(row)-7)) * (i-1)
            point.field(f"bin_{i}_freq", bin_freq)
            point.field(f"bin_{i}_value", float(value))

        # Write the point to InfluxDB
        write_api.write(bucket=bucket, record=point)

print("CSV data has been written to InfluxDB.")

# Close the client
client.close()