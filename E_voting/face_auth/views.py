import shutil
import os
import base64
import json
import numpy as np
import cv2
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .train import train_model
from .recognize import recognize_face
from .duplicate_check import check_face_duplicate


@api_view(['POST'])
def save_face_frames_batch(request):
    user_id = request.data.get('user_id')
    frames = request.data.get('frames', [])

    if not user_id or not frames:
        return Response({'error': 'user_id and frames required'}, status=400)

    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    model_path  = os.path.join(BASE_DIR, 'face_auth', 'model', 'face_model.yml')
    labels_path = os.path.join(BASE_DIR, 'face_auth', 'model', 'labels.json')
    save_path   = os.path.join(BASE_DIR, 'face_auth', 'dataset', str(user_id))

    # Block if this voter already has a registered face dataset
    if os.path.isdir(save_path) and len(os.listdir(save_path)) > 0:
        return Response({'error': 'Face already registered for this voter ID.'}, status=400)

    face_cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
    )

    existing_model = None
    label_map = {}
    if os.path.exists(model_path) and os.path.exists(labels_path):
        with open(labels_path, 'r') as f:
            label_map = json.load(f)
        other_users = [v for v in label_map.values() if str(v).lower() != str(user_id).lower()]
        if other_users:
            existing_model = cv2.face.LBPHFaceRecognizer_create()
            existing_model.read(model_path)

    os.makedirs(save_path, exist_ok=True)

    saved = 0
    duplicate_votes = 0

    for i, frame_b64 in enumerate(frames):
        try:
            img_data = base64.b64decode(frame_b64.split(',')[-1])
            np_arr = np.frombuffer(img_data, np.uint8)
            img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
            if img is None:
                continue

            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            faces = face_cascade.detectMultiScale(gray, 1.2, 4, minSize=(80, 80))
            if len(faces) == 0:
                continue

            (x, y, w, h) = max(faces, key=lambda f: f[2] * f[3])
            face = gray[y:y+h, x:x+w]
            if face.size == 0:
                continue
            face = cv2.resize(face, (200, 200))
            face = cv2.equalizeHist(face)

            if existing_model is not None:
                label, confidence = existing_model.predict(face)
                matched_user = label_map.get(str(label))
                if confidence < 60 and str(matched_user).lower() != str(user_id).lower():
                    duplicate_votes += 1
                    # If 3 or more frames match another user — definite duplicate
                    if duplicate_votes >= 3:
                        shutil.rmtree(save_path, ignore_errors=True)
                        return Response(
                            {'error': 'This face is already registered to another voter. Registration denied.'},
                            status=400
                        )
                    continue

            cv2.imwrite(os.path.join(save_path, f'img{saved}.jpg'), face)
            saved += 1
        except Exception:
            continue

    if saved < 5:
        shutil.rmtree(save_path, ignore_errors=True)
        return Response({'error': f'Only {saved} valid face frames captured. Please ensure good lighting and face the camera directly.'}, status=400)

    return Response({'message': f'{saved} frames saved', 'saved': saved})


@api_view(['POST'])
def save_face_frame(request):
    user_id = request.data.get('user_id')
    frame_b64 = request.data.get('frame')
    index = request.data.get('index', 0)

    if not user_id or not frame_b64:
        return Response({'error': 'user_id and frame required'}, status=400)

    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    model_path  = os.path.join(BASE_DIR, 'face_auth', 'model', 'face_model.yml')
    labels_path = os.path.join(BASE_DIR, 'face_auth', 'model', 'labels.json')

    img_data = base64.b64decode(frame_b64.split(',')[-1])
    np_arr = np.frombuffer(img_data, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    if img is None:
        return Response({'error': 'Invalid image data'}, status=400)

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    face_cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
    )
    faces = face_cascade.detectMultiScale(gray, 1.2, 4, minSize=(80, 80))

    if len(faces) == 0:
        return Response({'error': 'No face detected in frame'}, status=400)

    (x, y, w, h) = max(faces, key=lambda f: f[2] * f[3])
    face = gray[y:y+h, x:x+w]
    face = cv2.resize(face, (200, 200))
    face = cv2.equalizeHist(face)

    if os.path.exists(model_path) and os.path.exists(labels_path):
        with open(labels_path, 'r') as f:
            label_map = json.load(f)
        other_users = [v for v in label_map.values() if str(v).lower() != str(user_id).lower()]
        if other_users:
            model = cv2.face.LBPHFaceRecognizer_create()
            model.read(model_path)
            label, confidence = model.predict(face)
            matched_user = label_map.get(str(label))
            if confidence < 50 and str(matched_user).lower() != str(user_id).lower():
                return Response(
                    {'error': 'This face is already registered to another voter. Registration denied.'},
                    status=400
                )

    save_path = os.path.join(BASE_DIR, 'face_auth', 'dataset', str(user_id))
    os.makedirs(save_path, exist_ok=True)
    cv2.imwrite(os.path.join(save_path, f'img{index}.jpg'), face)

    return Response({'message': 'Frame saved', 'index': index})


@api_view(['POST'])
def recognize_from_frame(request):
    frame_b64 = request.data.get('frame')
    if not frame_b64:
        return Response({'error': 'frame required'}, status=400)

    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    model_path  = os.path.join(BASE_DIR, 'face_auth', 'model', 'face_model.yml')
    labels_path = os.path.join(BASE_DIR, 'face_auth', 'model', 'labels.json')

    if not os.path.exists(model_path):
        return Response({'error': 'Face model not found. No faces registered yet.'}, status=400)

    with open(labels_path, 'r') as f:
        label_map = json.load(f)

    model = cv2.face.LBPHFaceRecognizer_create()
    model.read(model_path)

    img_data = base64.b64decode(frame_b64.split(',')[-1])
    np_arr = np.frombuffer(img_data, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    if img is None:
        return Response({'error': 'Invalid image data'}, status=400)

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    face_cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
    )
    faces = face_cascade.detectMultiScale(gray, 1.2, 4, minSize=(60, 60))

    if len(faces) == 0:
        return Response({'error': 'No face detected'}, status=400)

    # Use the largest detected face
    (x, y, w, h) = max(faces, key=lambda f: f[2] * f[3])
    face = gray[y:y+h, x:x+w]
    if face.size == 0:
        return Response({'error': 'No face detected'}, status=400)

    face = cv2.resize(face, (200, 200))
    face = cv2.equalizeHist(face)

    label, confidence = model.predict(face)
    user_id = label_map.get(str(label))

    # LBPH confidence is a distance — lower is better. < 100 is a reliable match.
    if confidence < 100:
        return Response({'message': 'Authenticated', 'user_id': user_id, 'confidence': confidence})

    return Response({'error': 'Face not recognized'}, status=400)


@api_view(['POST'])
def register_face(request):
    user_id = request.data.get('user_id')
    if not user_id:
        return Response({'error': 'user_id is required'}, status=400)

    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    dataset_path = os.path.join(BASE_DIR, 'face_auth', 'dataset', str(user_id))

    if not os.path.isdir(dataset_path) or len(os.listdir(dataset_path)) == 0:
        return Response({'error': 'No face frames found. Please capture your face first.'}, status=400)

    train_model()

    # Final duplicate check after training with the new data included
    is_duplicate, matched_user = check_face_duplicate(user_id)
    if is_duplicate:
        shutil.rmtree(dataset_path, ignore_errors=True)
        train_model()
        return Response(
            {'error': 'Face already registered to another voter. Registration denied.'},
            status=400
        )

    try:
        from users.models import Voters
        voter = Voters.objects.get(voter_id=user_id)
        if not voter.otp_verified:
            return Response({'error': 'OTP not verified. Complete email verification first.'}, status=403)
        voter.is_verified = True
        voter.save()
    except Voters.DoesNotExist:
        # Voter not in DB yet — complete registration now
        from django.core.cache import cache
        pending = cache.get(f'pending_reg_{user_id}')
        if not pending:
            shutil.rmtree(dataset_path, ignore_errors=True)
            return Response({'error': 'Registration session expired. Please start again.'}, status=400)
        if not pending.get('otp_verified'):
            shutil.rmtree(dataset_path, ignore_errors=True)
            return Response({'error': 'Email not verified. Complete OTP verification first.'}, status=403)
        from users.models import Voters
        Voters.objects.create_user(
            voter_id=pending['voter_id'],
            password=None,
            name=pending['name'],
            age=pending['age'],
            email_id=pending['email_id'],
            otp_verified=True,
            is_verified=True,
        )
        cache.delete(f'pending_reg_{user_id}')
    except Exception:
        pass

    return Response({'message': 'Face Registered'})


@api_view(['GET'])
def face_login(request):
    user = recognize_face()
    if user is not None:
        return Response({'message': 'Authenticated', 'user_id': user})
    return Response({'error': 'Face not recognized'})
