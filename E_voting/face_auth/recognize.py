import cv2
import os
import json

def recognize_face():
    model = cv2.face.LBPHFaceRecognizer_create()

    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    model_path = os.path.join(BASE_DIR, "face_auth", "model", "face_model.yml")
    labels_path = os.path.join(BASE_DIR, "face_auth", "model", "labels.json")

    if not os.path.exists(model_path):
        print(" Model file not found")
        return False

    model.read(model_path)

    if os.path.exists(labels_path):
        with open(labels_path, "r") as f:
            label_map = json.load(f)
    else:
        label_map = {}

    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        print(" Camera not accessible")
        return False

    face_cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
    )

    success_count = 0
    required_success = 3  # Reduced from 5 — faster verification

    while True:
        ret, frame = cap.read()
        if not ret or frame is None:
            print("Frame not captured")
            continue

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        # More sensitive detection params (1.2, 4) vs old (1.3, 5)
        faces = face_cascade.detectMultiScale(gray, 1.2, 4, minSize=(60, 60))

        for (x, y, w, h) in faces:
            face_img = gray[y:y+h, x:x+w]

            if face_img.size == 0:
                continue

            face_img = cv2.resize(face_img, (200, 200))
            face_img = cv2.equalizeHist(face_img)

            label, confidence = model.predict(face_img)

            user = label_map.get(str(label), "Unknown")

            print(f"User: {user}, Confidence: {confidence}")

            cv2.rectangle(frame, (x, y), (x+w, y+h), (0,255,0), 2)
            cv2.putText(frame, f"{user} ({int(confidence)})",
                        (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0,255,0), 2)

            # LBPH confidence is a distance — lower is better. < 100 is a reliable match.
            if confidence < 100:
                success_count += 1
            else:
                success_count = 0

            if success_count >= required_success:
                cap.release()
                cv2.destroyAllWindows()
                print(f" Recognized: {user}")
                return user 

        cv2.imshow("Camera", frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
    return None


if __name__ == "__main__":
    result = recognize_face()

    if result:
        print(f" Face recognized: {result}")
    else:
        print(" Face recognition failed.")