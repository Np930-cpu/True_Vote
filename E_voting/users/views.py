from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.core.cache import cache
from django.utils import timezone
from datetime import timedelta
import random
from django.conf import settings
from .models import Voters


@api_view(['POST'])
def register_voter(request):
    data = request.data
    voter_id = data.get('voter_id')
    name     = data.get('name')
    age      = data.get('age')
    email_id = data.get('email_id')

    if not name:
        return Response({"error": "Name is required"}, status=400)
    if not age:
        return Response({"error": "Age is required"}, status=400)
    if not voter_id:
        return Response({"error": "Voter ID is required"}, status=400)
    if not email_id:
        return Response({"error": "Email ID is required"}, status=400)
    if Voters.objects.filter(voter_id=voter_id).exists():
        return Response({"error": "Voter ID already registered"}, status=400)
    if Voters.objects.filter(email_id=email_id).exists():
        return Response({"error": "Email already registered"}, status=400)

    # Store in cache â€” NOT in DB yet
    cache.set(f'pending_reg_{voter_id}', {
        'voter_id': voter_id,
        'name': name,
        'age': age,
        'email_id': email_id,
        'otp_verified': False,
    }, timeout=3600)

    return Response({"message": "Details saved. Please verify your email."})


@api_view(['POST'])
def send_otp(request):
    email    = request.data.get('email') or request.data.get('email_id')
    voter_id = request.data.get('voter_id')

    if not email and not voter_id:
        return Response({'error': 'Email or Voter ID required'}, status=400)

    # Check pending registration first
    if voter_id:
        pending = cache.get(f'pending_reg_{voter_id}')
        if pending:
            otp = str(random.randint(100000, 999999))
            pending['otp'] = otp
            pending['otp_created_at'] = timezone.now().isoformat()
            cache.set(f'pending_reg_{voter_id}', pending, timeout=3600)
            send_mail(
                'TrueVote — Email Verification OTP',
                f'Your OTP is {otp}. It expires in 2 minutes.',
                settings.EMAIL_HOST_USER,
                [pending['email_id']],
                fail_silently=False
            )
            return Response({'message': 'OTP sent'})

    # Fallback for existing users
    try:
        if email:
            user = Voters.objects.get(email_id=email)
        else:
            user = Voters.objects.get(voter_id=voter_id)
    except Voters.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)

    otp = str(random.randint(100000, 999999))
    user.otp = otp
    user.otp_created_at = timezone.now()
    user.save()

    send_mail(
        'TrueVote — Email Verification OTP',
        f'Your OTP is {otp}. It expires in 2 minutes.',
        settings.EMAIL_HOST_USER,
        [user.email_id],
        fail_silently=False
    )
    return Response({'message': 'OTP sent'})


@api_view(['POST'])
def verify_otp(request):
    voter_id = request.data.get('voter_id')
    email    = request.data.get('email')
    otp      = request.data.get('otp')

    # Check pending registration
    if voter_id:
        pending = cache.get(f'pending_reg_{voter_id}')
        if pending:
            if pending.get('otp') != str(otp):
                return Response({'error': 'Invalid OTP'}, status=400)

            from datetime import datetime
            otp_created = datetime.fromisoformat(pending['otp_created_at'])
            if timezone.now() > timezone.make_aware(otp_created.replace(tzinfo=None)) + timedelta(minutes=2) if otp_created.tzinfo is None else timezone.now() > otp_created + timedelta(minutes=2):
                cache.delete(f'pending_reg_{voter_id}')
                return Response({'error': 'OTP has expired. Please start registration again.'}, status=400)

            pending['otp_verified'] = True
            pending.pop('otp', None)
            pending.pop('otp_created_at', None)
            cache.set(f'pending_reg_{voter_id}', pending, timeout=3600)
            return Response({'message': 'OTP verified'})

    # Fallback for existing users
    try:
        if voter_id:
            user = Voters.objects.get(voter_id=voter_id)
        elif email:
            user = Voters.objects.get(email_id=email)
        else:
            return Response({'error': 'voter_id or email required'}, status=400)

        if user.otp == str(otp):
            if user.otp_created_at and timezone.now() > user.otp_created_at + timedelta(minutes=2):
                user.otp = None
                user.otp_created_at = None
                user.save()
                return Response({'error': 'OTP has expired.'}, status=400)
            user.otp_verified = True
            user.otp = None
            user.otp_created_at = None
            user.save()
            return Response({'message': 'OTP verified'})
        else:
            return Response({'error': 'Invalid OTP'})

    except Voters.DoesNotExist:
        return Response({'error': 'User not found'})


@api_view(['POST'])
def complete_registration(request):
    """
    Called after face registration succeeds.
    Creates the actual DB record only now.
    """
    voter_id = request.data.get('voter_id')
    if not voter_id:
        return Response({'error': 'voter_id required'}, status=400)

    pending = cache.get(f'pending_reg_{voter_id}')
    if not pending:
        return Response({'error': 'Registration session expired. Please start again.'}, status=400)

    if not pending.get('otp_verified'):
        return Response({'error': 'Email not verified. Complete OTP verification first.'}, status=403)

    if Voters.objects.filter(voter_id=voter_id).exists():
        cache.delete(f'pending_reg_{voter_id}')
        return Response({'error': 'Voter ID already registered'}, status=400)

    if Voters.objects.filter(email_id=pending['email_id']).exists():
        cache.delete(f'pending_reg_{voter_id}')
        return Response({'error': 'Email already registered'}, status=400)

    Voters.objects.create_user(
        voter_id=pending['voter_id'],
        password=None,
        name=pending['name'],
        age=pending['age'],
        email_id=pending['email_id'],
        otp_verified=True,
        is_verified=True,
    )

    cache.delete(f'pending_reg_{voter_id}')
    return Response({'message': 'Registration complete'})


@api_view(['POST'])
def send_login_otp(request):
    voter_id = request.data.get('voter_id')
    if not voter_id:
        return Response({'error': 'Voter ID is required'}, status=400)

    try:
        user = Voters.objects.get(voter_id=voter_id)
    except Voters.DoesNotExist:
        return Response({'error': 'Voter ID not found'}, status=404)

    if not user.is_active:
        return Response({'error': 'This voter account has been deactivated.'}, status=403)

    import os
    from django.conf import settings
    dataset_path = os.path.join(settings.BASE_DIR, 'face_auth', 'dataset', str(user.voter_id))
    face_registered = os.path.isdir(dataset_path) and len(os.listdir(dataset_path)) > 0

    if not user.otp_verified:
        return Response({'error': 'Email not verified. Please complete registration first.'}, status=403)
    if not face_registered:
        return Response({'error': 'Face not registered. Please complete registration first.'}, status=403)

    otp = str(random.randint(100000, 999999))
    user.otp = otp
    user.otp_created_at = timezone.now()
    user.save()

    send_mail(
        'TrueVote — Login OTP',
        f'Your login OTP is {otp}. It expires in 2 minutes.',
        settings.EMAIL_HOST_USER,
        [user.email_id],
        fail_silently=False
    )
    return Response({'message': f'OTP sent to {user.email_id}'})


@api_view(['POST'])
def verify_login_otp(request):
    voter_id = request.data.get('voter_id')
    otp      = request.data.get('otp')

    if not voter_id or not otp:
        return Response({'error': 'Voter ID and OTP are required'}, status=400)

    try:
        user = Voters.objects.get(voter_id=voter_id)
    except Voters.DoesNotExist:
        return Response({'error': 'Voter ID not found'}, status=404)

    if user.otp != str(otp):
        return Response({'error': 'Invalid OTP'}, status=400)

    if user.otp_created_at and timezone.now() > user.otp_created_at + timedelta(minutes=2):
        user.otp = None
        user.otp_created_at = None
        user.save()
        return Response({'error': 'OTP has expired. Please request a new one.'}, status=400)

    user.otp = None
    user.otp_created_at = None
    user.save()

    refresh = RefreshToken.for_user(user)
    return Response({
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def voter_profile(request):
    user = request.user
    from votes.models import votes as VoteModel
    import os
    from django.conf import settings

    voted_elections = list(VoteModel.objects.filter(voter=user).values_list('election_id', flat=True))
    dataset_path = os.path.join(settings.BASE_DIR, 'face_auth', 'dataset', str(user.voter_id))
    face_registered = os.path.isdir(dataset_path) and len(os.listdir(dataset_path)) > 0

    return Response({
        'voter_id': user.voter_id,
        'name': user.name,
        'age': user.age,
        'email_id': user.email_id,
        'otp_verified': user.otp_verified,
        'face_registered': face_registered,
        'voted_elections': voted_elections,
    })


@api_view(['POST'])
def admin_login(request):
    voter_id = request.data.get('voter_id')
    password = request.data.get('password')
    user = authenticate(username=voter_id, password=password)

    if user and user.is_staff:
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'name': user.name,
            'voter_id': user.voter_id,
        })
    if user and not user.is_staff:
        return Response({'error': 'You do not have admin privileges.'}, status=403)
    return Response({'error': 'Invalid credentials.'}, status=401)
