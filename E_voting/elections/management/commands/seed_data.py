import os
import shutil
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from django.conf import settings

from users.models import Voters
from elections.models import Election, Candidate
from votes.models import votes
from blockchain.models import Block
from blockchain.utils import calculate_hash, validate_blockchain
from ai_detection.models import FraudLog


class Command(BaseCommand):
    help = "Clear database except superusers and insert fresh realistic seed data."

    def add_arguments(self, parser):
        parser.add_argument(
            '--clean-faces',
            action='store_true',
            default=True,
            help='Clean up face datasets and trained models for non-existent users.',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Starting database reset and reseeding..."))

        with transaction.atomic():
            # 1. Identify superusers to preserve
            superusers = list(Voters.objects.filter(is_superuser=True))
            superuser_ids = [u.voter_id for u in superusers]
            self.stdout.write(
                self.style.SUCCESS(f"Preserving {len(superusers)} superuser(s): {', '.join(superuser_ids)}")
            )

            # Reset flags on superusers so they are in a clean state
            for su in superusers:
                su.has_vote = False
                su.otp = None
                su.otp_verified = True
                su.otp_created_at = None
                su.save()

            # 2. Clear old data
            v_deleted, _ = votes.objects.all().delete()
            b_deleted, _ = Block.objects.all().delete()
            f_deleted, _ = FraudLog.objects.all().delete()
            c_deleted, _ = Candidate.objects.all().delete()
            e_deleted, _ = Election.objects.all().delete()
            u_deleted, _ = Voters.objects.filter(is_superuser=False).delete()

            self.stdout.write(
                f"Cleared: {v_deleted} votes, {b_deleted} blocks, {f_deleted} fraud logs, "
                f"{c_deleted} candidates, {e_deleted} elections, {u_deleted} non-superuser voters."
            )

            # 3. Create Fresh Elections
            today = date.today()

            # Election 1: Active Election (Ready for live voting)
            election_active = Election.objects.create(
                name="General Parliamentary Election 2026",
                description=(
                    "National election to elect members of parliament and executive administration. "
                    "Voters cast encrypted ballots secured by biometric verification and immutable blockchain records."
                ),
                start_date=today - timedelta(days=5),
                end_date=today + timedelta(days=25),
            )

            candidates_active = [
                Candidate.objects.create(
                    election=election_active,
                    name="Aarav Sharma",
                    party="Democratic Progressive Front",
                    symbol="🏛️",
                    manifesto="Focusing on digital governance transparency, education technology reform, and sustainable economic growth.",
                ),
                Candidate.objects.create(
                    election=election_active,
                    name="Meera Nambiar",
                    party="National Innovation Party",
                    symbol="⚡",
                    manifesto="Championing artificial intelligence ethics, universal broadband access, economic youth empowerment, and modern infrastructure.",
                ),
                Candidate.objects.create(
                    election=election_active,
                    name="Vikramaditya Roy",
                    party="United People's Coalition",
                    symbol="🦁",
                    manifesto="Prioritizing healthcare accessibility, agricultural revitalization, worker rights, and community welfare funds.",
                ),
                Candidate.objects.create(
                    election=election_active,
                    name="Ananya Deshmukh",
                    party="Eco-Harmony Alliance",
                    symbol="🌿",
                    manifesto="Committed to net-zero carbon targets, public transit modernization, ecological preservation, and clean rivers.",
                ),
            ]

            # Election 2: Upcoming Election
            election_upcoming = Election.objects.create(
                name="Metropolitan Municipal Corporation Election 2026",
                description=(
                    "Civic council election for mayoral and ward representatives overseeing urban infrastructure, "
                    "sanitation, and citizen services."
                ),
                start_date=today + timedelta(days=15),
                end_date=today + timedelta(days=30),
            )

            candidates_upcoming = [
                Candidate.objects.create(
                    election=election_upcoming,
                    name="Rohit Verma",
                    party="Urban Forward Alliance",
                    symbol="🚀",
                    manifesto="Pothole-free smart roads, 24/7 clean water supply, and smart waste management systems.",
                ),
                Candidate.objects.create(
                    election=election_upcoming,
                    name="Kavita Sen",
                    party="Citizens First Forum",
                    symbol="🕊️",
                    manifesto="Transparent ward budget allocations, expanded community health centers, and neighborhood green spaces.",
                ),
                Candidate.objects.create(
                    election=election_upcoming,
                    name="Devendra Patil",
                    party="Labor & Commerce Guild",
                    symbol="⚖️",
                    manifesto="Tax relief for local commerce, vendor zone protections, and upgraded public transport corridors.",
                ),
            ]

            # Election 3: Completed / Ended Election (With vote history & blockchain blocks)
            election_ended = Election.objects.create(
                name="Campus Student Council Election 2026",
                description=(
                    "Annual university student council leadership election deciding student welfare, clubs, and campus governance."
                ),
                start_date=today - timedelta(days=30),
                end_date=today - timedelta(days=10),
            )

            candidate_ended_1 = Candidate.objects.create(
                election=election_ended,
                name="Siddharth Gupta",
                party="Campus Voice Union",
                symbol="📚",
                manifesto="24/7 library access, subsidized student canteen meals, and campus mental wellness facilities.",
            )
            candidate_ended_2 = Candidate.objects.create(
                election=election_ended,
                name="Pooja Sundaram",
                party="Future Scholars Movement",
                symbol="💡",
                manifesto="Industry internship tie-ups, research grant sponsorships, and upgraded sports facilities.",
            )

            self.stdout.write(self.style.SUCCESS("Created 3 elections with 9 candidates."))

            # 4. Create fresh verified sample voters
            sample_voters_data = [
                {"voter_id": "V1010", "name": "Rahul Sharma", "email_id": "rahul.sharma@example.com", "age": 24},
                {"voter_id": "V1020", "name": "Priya Patel", "email_id": "priya.patel@example.com", "age": 29},
                {"voter_id": "V1030", "name": "Arjun Nair", "email_id": "arjun.nair@example.com", "age": 22},
                {"voter_id": "V1040", "name": "Neha Kapoor", "email_id": "neha.kapoor@example.com", "age": 26},
            ]

            created_voters = []
            for v_info in sample_voters_data:
                voter = Voters.objects.create_user(
                    voter_id=v_info["voter_id"],
                    name=v_info["name"],
                    email_id=v_info["email_id"],
                    age=v_info["age"],
                    otp_verified=True,
                    is_verified=True,
                    has_vote=False,
                )
                created_voters.append(voter)

            self.stdout.write(self.style.SUCCESS(f"Created {len(created_voters)} fresh sample voters."))

            # 5. Seed Votes, Blockchain Blocks, and FraudLogs for the ended election
            vote_assignments = [
                (created_voters[0], candidate_ended_1),
                (created_voters[1], candidate_ended_1),
                (created_voters[2], candidate_ended_2),
                (created_voters[3], candidate_ended_1),
            ]

            prev_hash = "0"
            block_index = 1
            base_time = timezone.now() - timedelta(days=12)

            for voter, candidate in vote_assignments:
                vote_time = base_time + timedelta(hours=block_index * 2)

                # Record vote
                vote_obj = votes.objects.create(
                    voter=voter,
                    election=election_ended,
                    candidate=candidate,
                )
                # Overwrite auto_now_add timestamp so it reflects past election dates
                votes.objects.filter(pk=vote_obj.pk).update(timestamp=vote_time)

                # Create blockchain block
                block = Block.objects.create(
                    index=block_index,
                    voter_id=str(voter.voter_id),
                    candidate_id=candidate.id,
                    timestamp=vote_time,
                    previous_hash=prev_hash,
                    hash="",
                )
                block.refresh_from_db()
                block_hash = calculate_hash(
                    block.index,
                    block.voter_id,
                    block.candidate_id,
                    str(block.timestamp),
                    block.previous_hash,
                )
                block.hash = block_hash
                block.save()

                prev_hash = block_hash
                block_index += 1

                # Create FraudLog entry
                fraud_log = FraudLog.objects.create(
                    voter=voter,
                    result='allowed',
                    reason='Normal voting pattern observed. Face authentication verified.',
                    feat_votes_10m=0.0,
                    feat_votes_1h=0.0,
                    feat_hour_of_day=vote_time.hour,
                    feat_elections_voted=1,
                    feat_global_rate=1.2,
                    anomaly_score=-0.42,
                )
                FraudLog.objects.filter(pk=fraud_log.pk).update(timestamp=vote_time)

            self.stdout.write(
                self.style.SUCCESS(f"Seeded {len(vote_assignments)} votes and blockchain blocks for ended election.")
            )

        # 6. Verify Blockchain Integrity
        is_valid, msg = validate_blockchain()
        if is_valid:
            self.stdout.write(self.style.SUCCESS(f"Blockchain validation passed: {msg}"))
        else:
            self.stdout.write(self.style.ERROR(f"Blockchain validation failed: {msg}"))

        # 7. Clean up face dataset and model if requested
        if options.get('clean_faces'):
            dataset_dir = os.path.join(settings.BASE_DIR, 'face_auth', 'dataset')
            model_dir = os.path.join(settings.BASE_DIR, 'face_auth', 'model')

            cleaned_faces = 0
            if os.path.exists(dataset_dir):
                for item in os.listdir(dataset_dir):
                    item_path = os.path.join(dataset_dir, item)
                    if os.path.isdir(item_path) and item not in superuser_ids:
                        shutil.rmtree(item_path, ignore_errors=True)
                        cleaned_faces += 1

            # Reset trained model files so fresh registrations aren't blocked by old face weights
            face_model_file = os.path.join(model_dir, 'face_model.yml')
            labels_file = os.path.join(model_dir, 'labels.json')
            if os.path.exists(face_model_file):
                os.remove(face_model_file)
            if os.path.exists(labels_file):
                os.remove(labels_file)

            self.stdout.write(
                self.style.SUCCESS(f"Cleaned {cleaned_faces} stale face dataset folder(s) and reset face model files.")
            )

        self.stdout.write(self.style.SUCCESS("Database reset and reseeding completed successfully!"))
