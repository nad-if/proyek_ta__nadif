from influxdb_client import InfluxDBClient
import pandas as pd

# Your connection details
url = "http://localhost:8086"
token = "kNbiZ21C64-SRVrcJ44eGnqKsd67tbGuhWyo6qyFrQZmDC7KtcHxNVROwDV9LbKOGjGPsW9-0JwgUg5l5KKOEA=="
org = "organization"
bucket = "Test_csv2"

# Create a client
client = InfluxDBClient(url=url, token=token, org=org)

# Define your query (Flux query language)
query_api = client.query_api()

# Query for all data in the bucket
query = f'''
from(bucket: "{bucket}")
  |> range(start: 0)
  |> filter(fn: (r) => r._measurement == "frequency_spectrum")
'''

# Execute the query
result = query_api.query(org=org, query=query)

# Convert the result to a pandas DataFrame for easier viewing (optional)
data_frames = []
for table in result:
    data_frames.append(pd.DataFrame(data=[row.values for row in table.records], columns=table.columns))

if data_frames:
    df = pd.concat(data_frames, ignore_index=True)
    print(df)
else:
    print("No data found.")

# Close client
client.close()