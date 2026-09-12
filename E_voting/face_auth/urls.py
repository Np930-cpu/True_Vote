from django.urls import path
from .views import register_face, face_login, save_face_frame, save_face_frames_batch, recognize_from_frame

urlpatterns = [
    path('register-face/', register_face),
    path('login-face/', face_login),
    path('save-frame/', save_face_frame),
    path('save-frames-batch/', save_face_frames_batch),
    path('recognize-frame/', recognize_from_frame),
]
