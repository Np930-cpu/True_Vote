import cv2
import os
import json
import numpy as np


def check_face_duplicate(new_user_id, threshold=50):
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    dataset_path = os.path.join(BASE_DIR, "face_auth", "dataset")
    model_path   = os.path.join(BASE_DIR, "face_auth", "model", "face_model.yml")
    labels_path  = os.path.join(BASE_DIR, "face_auth", "model", "labels.json")

    if not os.path.exists(model_path) or not os.path.exists(labels_path):
        return False, None

    try:
        with open(labels_path, "r") as f:
            label_map = json.load(f)
    except Exception:
        return False, None

    other_users = [v for v in label_map.values() if str(v).lower() != str(new_user_id).lower()]
    if not other_users:
        return False, None

    reverse_map = {v: k for k, v in label_map.items()}
    if str(new_user_id) not in reverse_map:
        return False, None

    try:
        model = cv2.face.LBPHFaceRecognizer_create()
        model.read(model_path)
    except Exception:
        return False, None

    new_user_path = os.path.join(dataset_path, str(new_user_id))
    if not os.path.isdir(new_user_path):
        return False, None

    # Check up to 4 images from the dataset directly (they are already 200x200 preprocessed faces)
    checked = 0
    for img_file in os.listdir(new_user_path):
        if checked >= 4:
            break
        img_path = os.path.join(new_user_path, img_file)
        image = cv2.imread(img_path)
        if image is None:
            continue

        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        if gray.shape[:2] == (200, 200):
            face = gray
        else:
            face = cv2.resize(gray, (200, 200))
        face = cv2.equalizeHist(face)

        label, confidence = model.predict(face)
        matched_user = label_map.get(str(label))

        if confidence < threshold and str(matched_user).lower() != str(new_user_id).lower():
            return True, matched_user
        checked += 1

    return False, None
