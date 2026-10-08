from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.db.models import Q
from .serializers import electionserializer, candidateserializer
from .models import Election, Candidate

@api_view(['POST'])
def create_election(request):
    """
    Allows any registered voter (or admin) to create a new election
    for their college, school, club, or local community.
    Supports creating candidates in the same payload.
    """
    data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
    candidates_data = data.pop('candidates', [])

    serializer = electionserializer(data=data)
    if serializer.is_valid():
        creator = request.user if request.user.is_authenticated else None
        election = serializer.save(creator=creator)

        # Create any bundled candidates
        created_candidates = []
        if isinstance(candidates_data, list):
            for c in candidates_data:
                name = c.get('name', '').strip() if isinstance(c, dict) else ''
                if name:
                    cand = Candidate.objects.create(
                        name=name,
                        party=c.get('party', 'Independent').strip() or 'Independent',
                        symbol=c.get('symbol', '🏛️') or '🏛️',
                        manifesto=c.get('manifesto', '').strip(),
                        election=election
                    )
                    created_candidates.append(cand.name)

        return Response({
            'message': 'Election Created Successfully',
            'id': election.id,
            'candidates_count': len(created_candidates),
            'election': electionserializer(election).data
        }, status=201)

    return Response(serializer.errors, status=400)


@api_view(['GET'])
def list_election(request):
    """
    List elections with optional filtering by:
    - category (college, school, club, local, general)
    - search (searches in name, organization, description)
    - my_elections=true (only elections created by the authenticated user)
    """
    elections = Election.objects.all().order_by('-id')

    category = request.GET.get('category')
    if category and category != 'all':
        elections = elections.filter(category=category)

    search = request.GET.get('search')
    if search:
        elections = elections.filter(
            Q(name__icontains=search) |
            Q(organization__icontains=search) |
            Q(description__icontains=search)
        )

    my_elections = request.GET.get('my_elections')
    if my_elections and my_elections.lower() in ('true', '1') and request.user.is_authenticated:
        elections = elections.filter(creator=request.user)

    serializer = electionserializer(elections, many=True)
    return Response(serializer.data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_election(request, election_id):
    """
    Allow the creator of an election (or staff) to delete it.
    """
    try:
        election = Election.objects.get(id=election_id)
    except Election.DoesNotExist:
        return Response({'error': 'Election not found'}, status=404)

    if election.creator != request.user and not request.user.is_staff:
        return Response({'error': 'You do not have permission to delete this election'}, status=403)

    election.delete()
    return Response({'message': 'Election deleted successfully'})


@api_view(['POST'])
def register_candidate(request):
    serializer = candidateserializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Candidate registered Successfully'}, status=201)
    return Response(serializer.errors, status=400)


@api_view(['GET'])
def list_candidate(request):
    election_id = request.GET.get('election')
    if election_id:
        candidate = Candidate.objects.filter(election_id=election_id)
    else:
        candidate = Candidate.objects.all()
    serializer = candidateserializer(candidate, many=True)
    return Response(serializer.data)