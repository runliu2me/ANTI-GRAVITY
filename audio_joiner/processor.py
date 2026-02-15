import os
from pydub import AudioSegment
from pydub.effects import speedup

def process_audio_file(input_path, tail_path, output_dir):
    """
    Processes a single audio file:
    1. Loads the file.
    2. Speeds it up by 1.1x.
    3. Concatenates: SpedUp + SpedUp + Tail.
    4. Saves to output_dir.
    """
    try:
        # Load audio files
        audio = AudioSegment.from_file(input_path)
        tail = AudioSegment.from_file(tail_path)

        # Speed up by 1.1x
        # pydub.effects.speedup(seg, playback_speed=1.5)
        # Note: speedup might slightly alter the frame rate, so we might need to set it back or handle it.
        # But pydub handles this usually.
        sped_up_audio = speedup(audio, playback_speed=1.1)

        # Concatenate: SpedUp + SpedUp + Tail
        combined = sped_up_audio + sped_up_audio + tail

        # Construct output path
        filename = os.path.basename(input_path)
        name, ext = os.path.splitext(filename)
        output_filename = f"{name}_processed{ext}"
        output_path = os.path.join(output_dir, output_filename)

        # Export
        # Use the original format if possible, or default to mp3 if complex
        format_ext = ext.replace('.', '').lower()
        if format_ext == 'm4a':
            format_ext = 'ipod' # pydub uses 'ipod' for m4a usually, or just 'mp4'
        
        combined.export(output_path, format=format_ext)
        return True, f"Successfully processed: {filename}"

    except Exception as e:
        return False, f"Error processing {os.path.basename(input_path)}: {str(e)}"

def check_ffmpeg():
    """Checks if ffmpeg is available."""
    from pydub.utils import which
    return which("ffmpeg") is not None
