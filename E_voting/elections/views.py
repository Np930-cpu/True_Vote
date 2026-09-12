from rest_framework.decorators import api_view      
from rest_framework.response import Response
from .serializers import electionserializer,candidateserializer
from .models import Election   
from .models import Candidate

@api_view(['POST'])
def create_election(request):
    serializer=electionserializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response({'message':"Election Created Successfully"})
    return Response(serializer.errors)
@api_view(['GET'])
def list_election(request):
    elections=Election.objects.all()
    serializer=electionserializer(elections,many=True)
    return Response(serializer.data)

@api_view(['POST'])
def register_candidate(request):
    serializer=candidateserializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'message':"Candidate registered Successfully"})
    return Response(serializer.errors)

@api_view(['GET'])
def list_candidate(request):
    candidate=Candidate.objects.all()
    serializer=candidateserializer(candidate,many=True)
    return Response(serializer.data)