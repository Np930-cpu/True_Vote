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

    with open(labels_path, "r") as f:
        label_map = json.load(f)

    reverse_map = {v: k for k, v in label_map.items()}

    other_users = [v for v in label_map.values() if str(v).lower() != str(new_user_id).lower()]
    if not other_users:
        return False, None

    if str(new_user_id) not in reverse_map:
        return False, None

    model = cv2.face.LBPHFaceRecognizer_create()
    model.read(model_path)

    new_user_path = os.path.join(dataset_path, str(new_user_id))
    if not os.path.isdir(new_user_path):
        return False, None

    face_cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
    )

    for img_file in os.listdir(new_user_path):
        img_path = os.path.join(new_user_path, img_file)
        image = cv2.imread(img_path)
        if image is None:
            continue

        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.3, 5)

        for (x, y, w, h) in faces:
            face = gray[y:y+h, x:x+w]
            if face.size == 0:
                continue
            face = cv2.resize(face, (200, 200))
            face = cv2.equalizeHist(face)

            label, confidence = model.predict(face)
            matched_user = label_map.get(str(label))

            if confidence < threshold and matched_user != str(new_user_id):
                return True, matched_user

    return False, None
