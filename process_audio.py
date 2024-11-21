import numpy as np
import scipy.io.wavfile as wav
import sys

def process_audio(input_file, output_file):
    try:
        # Read the audio file
        sample_rate, audio_data = wav.read(input_file)

        # Convert to frequency domain
        audio_fft = np.fft.fft(audio_data)
        freqs = np.fft.fftfreq(len(audio_fft), d=1/sample_rate)

        # Convert frequencies to mHz (millihertz)
        freqs_mhz = np.abs(freqs) * 1000  # Convert Hz to mHz

        # Save frequencies to a text file
        with open(output_file, 'w') as f:
            f.write("Frequency (mHz)\n")
            for freq in freqs_mhz:
                f.write(f"{freq:.2f}\n")
        
        print(f"Processed audio saved to {output_file}")
    except Exception as e:
        print(f"Error processing audio: {e}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python process_audio.py <input_audio_file> <output_text_file>")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]
    process_audio(input_file, output_file)