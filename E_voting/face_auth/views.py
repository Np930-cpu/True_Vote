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
from .cascade_loader import get_face_cascade

_CACHED_MODEL = None
_CACHED_LABELS = None
_CACHED_MTIME = 0

def get_loaded_face_model():
    """
    Returns (model, label_map) cached in memory.
    Automatically reloads only if the model file on disk has changed.
    """
    global _CACHED_MODEL, _CACHED_LABELS, _CACHED_MTIME
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    model_path  = os.path.join(BASE_DIR, 'face_auth', 'model', 'face_model.yml')
    labels_path = os.path.join(BASE_DIR, 'face_auth', 'model', 'labels.json')

    if not os.path.exists(model_path) or not os.path.exists(labels_path):
        return None, None

    try:
        mtime = os.path.getmtime(model_path)
        if _CACHED_MODEL is not None and _CACHED_MTIME == mtime:
            return _CACHED_MODEL, _CACHED_LABELS

        with open(labels_path, 'r') as f:
            label_map = json.load(f)

        model = cv2.face.LBPHFaceRecognizer_create()
        model.read(model_path)

        _CACHED_MODEL = model
        _CACHED_LABELS = label_map
        _CACHED_MTIME = mtime
        return _CACHED_MODEL, _CACHED_LABELS
    except Exception as e:
        print(f"[FaceAuth] Error loading cached model: {e}")
        return None, None


@api_view(['POST'])
def save_face_frames_batch(request):
    user_id = str(request.data.get('user_id') or '').strip()
    frames = request.data.get('frames', [])

    if not user_id or not frames:
        return Response({'error': 'user_id and frames required'}, status=400)

    # 1. Block if this voter is already fully registered in database
    from users.models import Voters
    if Voters.objects.filter(voter_id__iexact=user_id, is_verified=True).exists():
        return Response({'error': 'Face already registered for this voter ID.'}, status=400)

    # 2. Strict check: Step 1 and Step 2 MUST be completed before capturing face
    from django.core.cache import cache
    pending = cache.get(f'pending_reg_{user_id}')
    if not pending or not pending.get('step1_completed'):
        return Response({'error': 'Registration session expired or not found. Please start from Step 1.'}, status=403)
    if not pending.get('otp_verified'):
        return Response({'error': 'Email OTP not verified. Please complete Step 2 before face capture.'}, status=403)

    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    model_path  = os.path.join(BASE_DIR, 'face_auth', 'model', 'face_model.yml')
    labels_path = os.path.join(BASE_DIR, 'face_auth', 'model', 'labels.json')
    save_path   = os.path.join(BASE_DIR, 'face_auth', 'dataset', str(user_id))

    # Reset any partial dataset from previous incomplete attempts
    if os.path.isdir(save_path):
        shutil.rmtree(save_path, ignore_errors=True)

    face_cascade = get_face_cascade()

    existing_model, label_map = get_loaded_face_model()
    if existing_model is not None and label_map:
        other_users = [v for v in label_map.values() if str(v).lower() != str(user_id).lower()]
        if not other_users:
            existing_model = None

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
            faces = face_cascade.detectMultiScale(gray, 1.1, 3, minSize=(50, 50))
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

    if saved < 3:
        shutil.rmtree(save_path, ignore_errors=True)
        return Response({'error': f'Only {saved} valid face frames captured. Please ensure good lighting and face the camera directly.'}, status=400)

    return Response({'message': f'{saved} frames saved', 'saved': saved})


@api_view(['POST'])
def save_face_frame(request):
    user_id = str(request.data.get('user_id') or '').strip()
    frame_b64 = request.data.get('frame')
    index = request.data.get('index', 0)

    if not user_id or not frame_b64:
        return Response({'error': 'user_id and frame required'}, status=400)

    from users.models import Voters
    if Voters.objects.filter(voter_id__iexact=user_id, is_verified=True).exists():
        return Response({'error': 'Face already registered for this voter ID.'}, status=400)

    from django.core.cache import cache
    pending = cache.get(f'pending_reg_{user_id}')
    if not pending or not pending.get('step1_completed'):
        return Response({'error': 'Registration session expired or not found. Please start from Step 1.'}, status=403)
    if not pending.get('otp_verified'):
        return Response({'error': 'Email OTP not verified. Please complete Step 2 before face capture.'}, status=403)

    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    model_path  = os.path.join(BASE_DIR, 'face_auth', 'model', 'face_model.yml')
    labels_path = os.path.join(BASE_DIR, 'face_auth', 'model', 'labels.json')

    img_data = base64.b64decode(frame_b64.split(',')[-1])
    np_arr = np.frombuffer(img_data, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    if img is None:
        return Response({'error': 'Invalid image data'}, status=400)

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    face_cascade = get_face_cascade()
    faces = face_cascade.detectMultiScale(gray, 1.1, 3, minSize=(50, 50))

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

    model, label_map = get_loaded_face_model()
    if model is None or label_map is None:
        return Response({'error': 'Face model not found. No faces registered yet.'}, status=400)

    img_data = base64.b64decode(frame_b64.split(',')[-1])
    np_arr = np.frombuffer(img_data, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    if img is None:
        return Response({'error': 'Invalid image data'}, status=400)

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    face_cascade = get_face_cascade()
    faces = face_cascade.detectMultiScale(gray, 1.1, 3, minSize=(50, 50))

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
    if confidence < 100 and user_id:
        from users.models import Voters
        try:
            matched_voter = Voters.objects.get(voter_id__iexact=user_id)
            if not matched_voter.is_active:
                return Response({'error': 'This voter account has been deactivated.'}, status=403)
            if not matched_voter.is_verified:
                return Response({'error': 'Voter registration is incomplete.'}, status=403)
            return Response({'message': 'Authenticated', 'user_id': user_id, 'confidence': confidence})
        except Voters.DoesNotExist:
            return Response({'error': 'Recognized voter ID not found in database.'}, status=404)

    return Response({'error': 'Face not recognized'}, status=400)


@api_view(['POST'])
def register_face(request):
    user_id = str(request.data.get('user_id') or '').strip()
    if not user_id:
        return Response({'error': 'user_id is required'}, status=400)

    # 1. Block if user is already verified in DB
    from users.models import Voters
    if Voters.objects.filter(voter_id__iexact=user_id, is_verified=True).exists():
        return Response({'error': 'Voter is already fully registered and verified.'}, status=400)

    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    dataset_path = os.path.join(BASE_DIR, 'face_auth', 'dataset', str(user_id))

    # 2. Strict check: Step 1 & Step 2 MUST be completed in cache
    from django.core.cache import cache
    pending = cache.get(f'pending_reg_{user_id}')
    if not pending or not pending.get('step1_completed'):
        shutil.rmtree(dataset_path, ignore_errors=True)
        return Response({'error': 'Registration session expired or not found. Please start from Step 1.'}, status=400)

    if not pending.get('otp_verified'):
        shutil.rmtree(dataset_path, ignore_errors=True)
        return Response({'error': 'Email OTP not verified. Please complete Step 2 before face registration.'}, status=403)

    # 3. Strict check: Step 3 face frames MUST be captured (minimum 3 valid frames)
    if not os.path.isdir(dataset_path) or len(os.listdir(dataset_path)) < 3:
        return Response({'error': 'Insufficient face frames captured (minimum 3 required). Please capture your face again.'}, status=400)

    # 4. Train model with the new dataset
    train_model()
    global _CACHED_MTIME
    _CACHED_MTIME = 0

    # 5. Final duplicate check: ensure face does not match another registered voter
    is_duplicate, matched_user = check_face_duplicate(user_id)
    if is_duplicate:
        shutil.rmtree(dataset_path, ignore_errors=True)
        train_model()
        _CACHED_MTIME = 0
        return Response(
            {'error': f'Face is already registered to another voter ({matched_user}). Duplicate registration denied.'},
            status=400
        )

    # 6. ATOMIC CREATION: All 3 steps are complete and verified.
    # ONLY now is the voter record created in the database.
    try:
        if Voters.objects.filter(voter_id__iexact=pending['voter_id']).exists():
            shutil.rmtree(dataset_path, ignore_errors=True)
            train_model()
            _CACHED_MTIME = 0
            cache.delete(f'pending_reg_{user_id}')
            return Response({'error': 'Voter ID is already registered.'}, status=400)

        if Voters.objects.filter(email_id__iexact=pending['email_id']).exists():
            shutil.rmtree(dataset_path, ignore_errors=True)
            train_model()
            _CACHED_MTIME = 0
            cache.delete(f'pending_reg_{user_id}')
            return Response({'error': 'Email is already registered.'}, status=400)

        voter = Voters.objects.create_user(
            voter_id=pending['voter_id'],
            password=None,
            name=pending['name'],
            age=pending['age'],
            email_id=pending['email_id'],
            otp_verified=True,
            is_verified=True,
            is_active=True,
        )
        cache.delete(f'pending_reg_{user_id}')
    except Exception as e:
        shutil.rmtree(dataset_path, ignore_errors=True)
        train_model()
        _CACHED_MTIME = 0
        return Response({'error': f'Failed to create voter record: {str(e)}'}, status=500)

    return Response({'message': 'Registration completed successfully! All steps verified.'})


@api_view(['GET'])
def face_login(request):
    user = recognize_face()
    if user is not None:
        from users.models import Voters
        try:
            matched_voter = Voters.objects.get(voter_id__iexact=user)
            if not matched_voter.is_active:
                return Response({'error': 'This voter account has been deactivated.'}, status=403)
            if not matched_voter.is_verified:
                return Response({'error': 'Voter registration is incomplete.'}, status=403)
            return Response({'message': 'Authenticated', 'user_id': user})
        except Voters.DoesNotExist:
            return Response({'error': 'Recognized voter not found in database.'}, status=404)
    return Response({'error': 'Face not recognized'}, status=400)
