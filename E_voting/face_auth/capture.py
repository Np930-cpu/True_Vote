import cv2
import os

def capture_faces(user_id):
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    path = os.path.join(BASE_DIR, "face_auth", "dataset", user_id)

    os.makedirs(path, exist_ok=True)

    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        print(" Camera not accessible")
        return

    face_cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
    )

    count = 0

    while True:
        ret, frame = cap.read()

        if not ret or frame is None:
            print(" Frame not captured")
            continue

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        faces = face_cascade.detectMultiScale(gray, 1.3, 5)

        for (x, y, w, h) in faces:
            face = gray[y:y+h, x:x+w]

            if face.size == 0:
                continue

            face = cv2.resize(face, (200, 200))
            face = cv2.equalizeHist(face)

            cv2.rectangle(frame, (x, y), (x+w, y+h), (0,255,0), 2)

            if cv2.waitKey(1) & 0xFF == ord('c'):
                file_name = os.path.join(path, f"img{count}.jpg")
                cv2.imwrite(file_name, face)
                print(f"Saved {file_name}")
                count += 1

        cv2.imshow("Capture Face (Press C)", frame)

        if count >= 50:
            break

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

    print(" Face Capture Complete")