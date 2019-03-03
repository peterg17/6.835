import sys
from sklearn.model_selection import train_test_split

from Gesture import GestureSet, Sequence, Frame
from classify_nn import classify_nn
from normalize_frames import normalize_frames
from load_gestures import load_gestures

def test_classify_nn(num_frames, ratio):
    """
    Tests classify_nn function. 
    Splits gesture data into training and testing sets and computes the accuracy of classify_nn()
    :param num_frames: the number of frames to normalize to
    :param ratio: percentage to be used for training
    :return: the accuracy of classify_nn()
    """
    sequences_per_gesture = 30
    gesture_sets = load_gestures()
    norm_gesture_sets = normalize_frames(gesture_sets, num_frames)
    # using ratio we approximate the number of the 30 sequences to use for training
    training_number = ratio*sequences_per_gesture
    test_sequences = []
    training_gesture_sets = []
    for gs in norm_gesture_sets:
        new_gs = GestureSet([], gs.label)
        new_seqs = []
        i = 0
        for seq in gs.sequences:
            new_seq = Sequence(seq.frames, seq.label)
            if (i < training_number):
                new_seqs.append(new_seq)
                i += 1
            else:
                test_sequences.append(new_seq)
        new_gs.sequences = new_seqs
        training_gesture_sets.append(new_gs)
    
    num_correct = 0
    for seq in test_sequences:
        prediction = classify_nn(seq, training_gesture_sets)
        print("actual label: ", seq.label)
        print("prediction: ", prediction)
        print()
        if (prediction == seq.label):
            num_correct += 1
    accuracy = num_correct / len(test_sequences)
    return accuracy


if len(sys.argv) != 3:
    raise ValueError('Error! Give normalized frame number and test/training ratio after filename in command. \n'
                     'e.g. python test_nn.py 20 0.4')

num_frames = int(sys.argv[1])
ratio = float(sys.argv[2])

accuracy = test_classify_nn(num_frames, ratio)
print("Accuracy: ", accuracy)