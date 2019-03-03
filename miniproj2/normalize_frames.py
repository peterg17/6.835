import math
from Gesture import GestureSet, Sequence, Frame

def generate_sequence_lengths(gesture_sets):
    for gs in gesture_sets:
        for seq in gs.sequences:
            yield len(seq.frames)


def normalize_frames(gesture_sets, num_frames):
    """
    Normalizes the number of Frames in each Sequence in each GestureSet
    :param gesture_sets: the list of GesturesSets
    :param num_frames: the number of frames to normalize to
    :return: a list of GestureSets where all Sequences have the same number of Frames
    """
    normalized_gesture_sets = []
    
    #min_seq_length = min([i for i in generate_sequence_lengths(gesture_sets)])
    #min_num_frames = min(num_frames, min_seq_length)

    for gs in gesture_sets:
        # each gs has 30 sequences each of which have their own number of frames
        new_gs = GestureSet([],gs.label)
        new_gs_seqs = []
        for seq in gs.sequences:
            new_seq = Sequence([],seq.label)
            seq_frames = seq.frames
            seq_length = float(len(seq_frames))
            frames = []
            # sample a subset of evenly spaced frames
            for i in range(num_frames):
                # print("sequence length: ", seq_length)
                # print("attempted index: ", int(math.ceil(i * seq_length / num_frames)))
                # if the num_frames is too large, we just fill in the rest with the last frame available
                if (i >= int(seq_length)):
                    sampled_frame = seq_frames[-1]
                else:
                    sampled_frame = seq_frames[int(math.ceil(i * seq_length / num_frames))]
                frames.append(sampled_frame)
            new_seq.frames = frames
            new_gs_seqs.append(new_seq)
        new_gs.sequences = new_gs_seqs
        normalized_gesture_sets.append(new_gs)

    return normalized_gesture_sets