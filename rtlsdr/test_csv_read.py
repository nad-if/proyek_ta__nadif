import csv
import json

data_list = []
path = 'fm_spectrum.csv'
# Open the CSV file
with open(path, newline='') as csvfile:
    reader = csv.reader(csvfile)

    for row in reader:
        # Extracting the first six elements as keys
        date = row[0]
        time = row[1]
        start_freq = int(row[2])
        end_freq = int(row[3])
        bin_size = float(row[4])
        total_bins = int(row[5])

        # Create a dictionary for this row
        row_dict = {
            'date': date,
            'time': time,
            'start_freq': start_freq,
            'end_freq': end_freq,
            'bin_size': bin_size,
            'total_bins': total_bins
        }

        # Calculate frequency for each bin and add it to the dictionary
        freq_range = end_freq - start_freq
        for i, value in enumerate(row[6:], start=1):
            bin_freq = start_freq + (freq_range / (len(row)-7)) * (i-1)
            row_dict[f'bin_{i}'] = {
                'frequency': bin_freq,
                'value': float(value)
            }
            
            data_entry = {
                    'timestamp': (f"{date[0:4]}/{date[5:7]}/{date[8:10]} {time}"),
                    'power_db' : float(value),
                    'frequency' : bin_freq
                    }
            data_list.append(data_entry)

            with open('data2.json', mode='w') as file:
                json.dump(data_list, file, indent=4)
            print(data_entry)
        # For demonstration, print the row_dict
        #print(row_dict)

        # If you want to collect all rows into a larger structure:
        # all_rows.append(row_dict)