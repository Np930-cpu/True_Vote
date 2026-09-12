import json
import cv2
import os
import numpy as np

def train_model():
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    dataset_path = os.path.join(BASE_DIR, "face_auth", "dataset")
    model_dir = os.path.join(BASE_DIR, "face_auth", "model")
    os.makedirs(model_dir, exist_ok=True)

    data = []
    labels = []
    label_map = {}

    label_id = 0

    face_cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
    )

    if not os.path.exists(dataset_path):
        print(" Dataset folder not found")
        return

    for user in os.listdir(dataset_path):
        user_path = os.path.join(dataset_path, user)

        if not os.path.isdir(user_path):
            continue

        label_map[label_id] = user

        for img in os.listdir(user_path):
            img_path = os.path.join(user_path, img)

            image = cv2.imread(img_path)
            if image is None:
                continue

            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

            # Dataset images are already cropped faces — use them directly.
            # Only attempt face detection if the image is large (raw frame).
            h_img, w_img = gray.shape[:2]
            if h_img == 200 and w_img == 200:
                # Already a cropped, preprocessed face
                face = cv2.equalizeHist(gray)
                data.append(face)
                labels.append(label_id)
            else:
                # Raw image — detect face first
                faces = face_cascade.detectMultiScale(gray, 1.2, 4, minSize=(60, 60))
                if len(faces) == 0:
                    continue
                for (x, y, w, h) in faces:
                    face = gray[y:y+h, x:x+w]
                    if face.size == 0:
                        continue
                    face = cv2.resize(face, (200, 200))
                    face = cv2.equalizeHist(face)
                    data.append(face)
                    labels.append(label_id)

        label_id += 1

    if len(data) == 0:
        print(" No training data found")
        return

    model = cv2.face.LBPHFaceRecognizer_create()
    model.train(np.array(data), np.array(labels))

    model_path = os.path.join(model_dir, "face_model.yml")
    labels_path = os.path.join(model_dir, "labels.json")

    model.save(model_path)

    with open(labels_path, "w") as f:
        json.dump(label_map, f)

    print(" Training Complete")
    print("Total faces trained:", len(data))
    print("Model saved at:", model_path)


if __name__ == "__main__":
    train_model()