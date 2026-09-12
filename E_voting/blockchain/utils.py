import hashlib

def calculate_hash(index, voter_id, candidate_id, timestamp, previous_hash):
    value = f"{index}{voter_id}{candidate_id}{timestamp}{previous_hash}"
    return hashlib.sha256(value.encode()).hexdigest()
def validate_blockchain():
    from .models import Block

    blocks = Block.objects.order_by('index')

    for i in range(len(blocks)):
        current = blocks[i]

        recalculated_hash = calculate_hash(
            current.index,
            current.voter_id,
            current.candidate_id,
            str(current.timestamp),
            current.previous_hash
        )

        if current.hash != recalculated_hash:
            return False, f"Block {current.index} hash mismatch"

        if i > 0:
            previous = blocks[i - 1]
            if current.previous_hash != previous.hash:
                return False, f"Block {current.index} chain broken"

    return True, "Blockchain is valid"