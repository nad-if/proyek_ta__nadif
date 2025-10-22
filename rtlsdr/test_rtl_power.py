import subprocess

def rtlpower(# Define the frequency range and other parameters
    LOWER_BAND = '99M',  # Lower frequency in MHz
    UPPER_BAND = '101M',  # Upper frequency in MHz
    BIN_SIZE = '100k',   # Bin size for frequency resolution
    INTERVAL = '10',    # Integration interval in seconds
    OUTPUT_FILE = 'fm_spectrum.csv'):

    # Construct the command for rtl_power
    command = f"rtl_power -f {LOWER_BAND}:{UPPER_BAND}:{BIN_SIZE} -i {INTERVAL} {OUTPUT_FILE}"

    subprocess.run(command, shell=True, check=True)

if __name__ == "__main__":
    rtlpower()
