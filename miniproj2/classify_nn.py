import operator
import math
from sklearn import neighbors
import numpy as np

def classify_nn(test_sequence, training_gesture_sets):
    """
    Classify test_sequence using nearest neighbors
    :param test_gesture: Sequence to classify
    :param training_gesture_sets: training set of labeled gestures
    :return: a classification label (an integer between 0 and 8)
    """

    knn = neighbors.KNeighborsClassifier(n_neighbors=1, weights='distance')
    X = [] # the training sequences, flattened
    y = [] # training labels, inferred from X
    for gs in training_gesture_sets:
        for seq in gs.sequences:
            frames = []
            for s in seq.frames:
                for f in s.frame:
                    frames.append(f)
            X.append(frames)
            y.append(seq.label)
    knn.fit(X,y)
    test_frames = [[]]
    for s in test_sequence.frames:
        for f in s.frame:
            test_frames[0].append(f)
    prediction = knn.predict(test_frames)
    return prediction    
