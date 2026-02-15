import tkinter as tk
from tkinter import filedialog, messagebox, scrolledtext
import os
import threading
from processor import process_audio_file, check_ffmpeg

class AudioJoinerApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Audio Joiner Tool")
        self.root.geometry("600x500")

        # Variables
        self.input_dir = tk.StringVar()
        self.tail_file = tk.StringVar()

        # UI Setup
        self.create_widgets()

        # Check ffmpeg on startup
        if not check_ffmpeg():
            messagebox.showwarning("FFmpeg Missing", "FFmpeg was not found on your system.\nThis tool requires FFmpeg to process audio files.\nPlease install FFmpeg and add it to your PATH.")

    def create_widgets(self):
        # Input Directory Selection
        tk.Label(self.root, text="Input Directory (Audio Files):").pack(pady=5)
        input_frame = tk.Frame(self.root)
        input_frame.pack(fill=tk.X, padx=10)
        tk.Entry(input_frame, textvariable=self.input_dir).pack(side=tk.LEFT, fill=tk.X, expand=True)
        tk.Button(input_frame, text="Browse", command=self.select_input_dir).pack(side=tk.RIGHT, padx=5)

        # Tail File Selection
        tk.Label(self.root, text="Tail File (Ending Audio):").pack(pady=5)
        tail_frame = tk.Frame(self.root)
        tail_frame.pack(fill=tk.X, padx=10)
        tk.Entry(tail_frame, textvariable=self.tail_file).pack(side=tk.LEFT, fill=tk.X, expand=True)
        tk.Button(tail_frame, text="Browse", command=self.select_tail_file).pack(side=tk.RIGHT, padx=5)

        # Process Button
        tk.Button(self.root, text="Start Processing", command=self.start_processing, bg="#4CAF50", fg="white", font=("Arial", 12, "bold")).pack(pady=20)

        # Log Area
        tk.Label(self.root, text="Log:").pack(pady=5, anchor="w", padx=10)
        self.log_area = scrolledtext.ScrolledText(self.root, height=15)
        self.log_area.pack(fill=tk.BOTH, expand=True, padx=10, pady=5)

    def select_input_dir(self):
        path = filedialog.askdirectory()
        if path:
            self.input_dir.set(path)

    def select_tail_file(self):
        path = filedialog.askopenfilename(filetypes=[("Audio Files", "*.mp3 *.m4a *.wav *.ogg")])
        if path:
            self.tail_file.set(path)

    def log(self, message):
        self.log_area.insert(tk.END, message + "\n")
        self.log_area.see(tk.END)

    def start_processing(self):
        input_path = self.input_dir.get()
        tail_path = self.tail_file.get()

        if not input_path or not os.path.exists(input_path):
            messagebox.showerror("Error", "Please select a valid input directory.")
            return
        if not tail_path or not os.path.exists(tail_path):
            messagebox.showerror("Error", "Please select a valid tail file.")
            return

        # Disable button during processing
        # (Simplified: just running in a thread to keep UI responsive)
        threading.Thread(target=self.run_processing, args=(input_path, tail_path)).start()

    def run_processing(self, input_dir, tail_path):
        self.log("Starting processing...")
        
        # Create output directory
        output_dir = os.path.join(input_dir, "processed_output")
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
            self.log(f"Created output directory: {output_dir}")

        supported_exts = ('.mp3', '.m4a', '.wav', '.ogg')
        files = [f for f in os.listdir(input_dir) if f.lower().endswith(supported_exts)]
        
        if not files:
            self.log("No audio files found in the input directory.")
            return

        success_count = 0
        for filename in files:
            file_path = os.path.join(input_dir, filename)
            self.log(f"Processing: {filename}...")
            
            success, msg = process_audio_file(file_path, tail_path, output_dir)
            self.log(msg)
            if success:
                success_count += 1

        self.log(f"Processing complete. {success_count}/{len(files)} files processed successfully.")
        messagebox.showinfo("Complete", f"Processing complete.\nOutput saved to: {output_dir}")

if __name__ == "__main__":
    root = tk.Tk()
    app = AudioJoinerApp(root)
    root.mainloop()
