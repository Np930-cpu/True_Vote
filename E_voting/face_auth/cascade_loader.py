import os
import cv2

def get_face_cascade():
    """
    Safely load haarcascade_frontalface_default.xml.
    Prefers the bundled XML in face_auth/cascades/,
    falling back to cv2.data.haarcascades if available.
    """
    base_dir = os.path.dirname(os.path.abspath(__file__))
    local_path = os.path.join(base_dir, 'cascades', 'haarcascade_frontalface_default.xml')
    if os.path.exists(local_path):
        cascade = cv2.CascadeClassifier(local_path)
        if not cascade.empty():
            return cascade

    try:
        cv_path = os.path.join(cv2.data.haarcascades, 'haarcascade_frontalface_default.xml')
        if os.path.exists(cv_path):
            cascade = cv2.CascadeClassifier(cv_path)
            if not cascade.empty():
                return cascade
    except Exception:
        pass

    return cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
