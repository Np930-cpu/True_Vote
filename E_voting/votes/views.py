from ai_detection.utils import detect_fraud
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count
from django.utils import timezone
from django.contrib.auth import get_user_model
from datetime import date

from .models import votes
from elections.models import Candidate
from blockchain.models import Block
from blockchain.utils import calculate_hash

User = get_user_model()


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cast_vote(request):
    user = request.user

    if not user.is_active:
        return Response({'error': 'This voter account has been deactivated.'}, status=403)

    face_verified = request.data.get('face_verified', False)
    if not face_verified:
        return Response({'error': 'Face authentication required.'}, status=400)
    if not user.otp_verified:
        return Response({'error': 'OTP not verified'}, status=400)

    candidate_id = request.data.get('candidate')
    if not candidate_id:
        return Response({'error': 'Candidate ID is required'}, status=400)

    try:
        candidate = Candidate.objects.get(id=candidate_id)
    except Candidate.DoesNotExist:
        return Response({'error': 'Candidate not found'}, status=404)

    today = date.today()
    election = candidate.election
    if today < election.start_date:
        return Response({'error': f'Election has not started yet. Starts on {election.start_date}'}, status=400)
    if today > election.end_date:
        return Response({'error': f'Election has ended on {election.end_date}'}, status=400)

    if votes.objects.filter(voter=user, election=election).exists():
        return Response({'error': 'You have already voted in this election'}, status=400)

    is_fraud, message = detect_fraud(user)
    if is_fraud:
        return Response({'error': f'Fraud detected: {message}'}, status=400)

    votes.objects.create(voter=user, candidate=candidate, election=election)

    last_block = Block.objects.order_by('-index').first()
    index = last_block.index + 1 if last_block else 1
    previous_hash = last_block.hash if last_block else "0"
    timestamp = timezone.now()
    new_hash = calculate_hash(index, str(user.voter_id), candidate.id, str(timestamp), previous_hash)

    Block.objects.create(
        index=index,
        voter_id=user.voter_id,
        candidate_id=candidate.id,
        timestamp=timestamp,
        previous_hash=previous_hash,
        hash=new_hash
    )

    return Response({
        'message': 'Vote Cast Successfully',
        'receipt': {
            'voter_id': str(user.voter_id),
            'candidate': candidate.name,
            'party': candidate.party,
            'symbol': candidate.symbol,
            'election': election.name,
            'timestamp': str(timestamp),
            'block_index': index,
            'block_hash': new_hash,
        }
    })


@api_view(['GET'])
def result(request, election_id):
    results = votes.objects.filter(election_id=election_id) \
        .values('candidate__name') \
        .annotate(total_vote=Count('candidate')) \
        .order_by('-total_vote')

    return Response({
        "results": list(results),
        "winner": results.first()
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def has_voted(request, election_id):
    voted = votes.objects.filter(voter=request.user, election_id=election_id).exists()
    return Response({'has_voted': voted})


@api_view(['GET'])
def dashboard(request):
    total_voters = User.objects.count()
    total_votes = votes.objects.count()

    candidate_votes = votes.objects.values('candidate__name') \
        .annotate(total=Count('candidate')) \
        .order_by('-total')

    return Response({
        "total_voters": total_voters,
        "total_votes": total_votes,
        "candidate_votes": list(candidate_votes),
        "winner": candidate_votes.first()
    })
