import tkinter
import matplotlib.pyplot as plt
from load_gestures import load_gestures
from visualization_gui import VisualizationGUI
from normalize_frames import normalize_frames

def sequenceLengthGenerator(gesture_sets):
    for gs in gesture_sets:
        for seq in gs.sequences:
            yield len(seq.frames)

gesture_sets = load_gestures()
frames_generator = sequenceLengthGenerator(gesture_sets)
num_frames = min(frames_generator)

gesture_sets = normalize_frames(gesture_sets, num_frames) #UNCOMMENT to visualize normalized frames
frames_generator_after = sequenceLengthGenerator(gesture_sets)

def on_closing():
    plt.close()

root = tkinter.Tk()
app = VisualizationGUI(root, gesture_sets)
root.protocol("WM_DELETE_WINDOW", on_closing)

root.mainloop()

