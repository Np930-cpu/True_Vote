from .utils import validate_blockchain
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Block


@api_view(['GET'])
def view_blockchain(request):
    blocks = Block.objects.all().values()
    return Response(blocks)


@api_view(['GET'])
def check_blockchain(request):
    is_valid, message = validate_blockchain()
    return Response({"valid": is_valid, "message": message})
