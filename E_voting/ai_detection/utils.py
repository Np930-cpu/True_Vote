"""
AI Fraud Detection — Isolation Forest
======================================
Features used per vote attempt:
  1. votes_last_10min   — how many votes this user cast in the last 10 minutes
  2. votes_last_1hr     — how many votes this user cast in the last hour
  3. hour_of_day        — 0-23 (unusual hours are suspicious)
  4. elections_voted    — total distinct elections this user has voted in
  5. global_vote_rate   — votes/min across ALL users in the last 5 minutes
                          (detects coordinated bursts)

The model is trained on-the-fly from existing vote history each call.
When there is not enough data (<10 votes total) it falls back to the
original simple rule so the system works from day one.
"""

import numpy as np
from datetime import timedelta
from django.utils import timezone


# ── feature extraction ────────────────────────────────────────────────────────

def _extract_features(user, at_time):
    """Return a dict of feature values for `user` at `at_time`."""
    from votes.models import votes as VoteModel

    t10 = at_time - timedelta(minutes=10)
    t1h = at_time - timedelta(hours=1)
    t5m = at_time - timedelta(minutes=5)

    return {
        'votes_10m':       VoteModel.objects.filter(voter=user, timestamp__gte=t10, timestamp__lte=at_time).count(),
        'votes_1h':        VoteModel.objects.filter(voter=user, timestamp__gte=t1h, timestamp__lte=at_time).count(),
        'hour_of_day':     at_time.hour,
        'elections_voted': VoteModel.objects.filter(voter=user, timestamp__lte=at_time).values('election').distinct().count(),
        'global_rate':     VoteModel.objects.filter(timestamp__gte=t5m, timestamp__lte=at_time).count() / 5.0,
    }


def _features_to_array(f):
    return np.array([
        f['votes_10m'],
        f['votes_1h'],
        f['hour_of_day'],
        f['elections_voted'],
        f['global_rate'],
    ], dtype=float)


def _build_training_matrix(now, limit=500):
    """
    Build a (N, 5) training matrix from recent vote records.
    Returns None if fewer than 10 records exist.
    """
    from votes.models import votes as VoteModel

    recent = list(VoteModel.objects.select_related('voter').order_by('-timestamp')[:limit])
    if len(recent) < 10:
        return None

    rows = []
    for v in recent:
        f = _extract_features(v.voter, v.timestamp)
        rows.append(_features_to_array(f))

    return np.array(rows, dtype=float)


def _save_log(user, is_fraud, reason, features, anomaly_score=None):
    """Write a FraudLog entry (best-effort — never raises)."""
    try:
        from .models import FraudLog
        FraudLog.objects.create(
            voter=user,
            result='blocked' if is_fraud else 'allowed',
            reason=reason,
            feat_votes_10m=features['votes_10m'],
            feat_votes_1h=features['votes_1h'],
            feat_hour_of_day=features['hour_of_day'],
            feat_elections_voted=features['elections_voted'],
            feat_global_rate=features['global_rate'],
            anomaly_score=anomaly_score,
        )
    except Exception:
        pass


# ── public API ────────────────────────────────────────────────────────────────

def detect_fraud(user):
    """
    Returns (is_fraud: bool, reason: str).

    Pipeline:
      1. Hard rule  — catches obvious rapid-fire attempts instantly.
      2. Isolation Forest — anomaly detection on 5 behavioural features.
      3. Fallback rule — used when not enough training data yet.
    """
    from votes.models import votes as VoteModel

    now      = timezone.now()
    features = _extract_features(user, now)

    # ── 1. Hard rule: ≥2 votes in the last minute
    if features['votes_10m'] >= 2:
        reason = "Multiple votes detected within 10 minutes — automated voting suspected."
        _save_log(user, True, reason, features)
        return True, reason

    # ── 2. Isolation Forest
    X_train = _build_training_matrix(now)

    if X_train is not None:
        try:
            from sklearn.ensemble import IsolationForest
            from sklearn.preprocessing import StandardScaler

            scaler   = StandardScaler()
            X_scaled = scaler.fit_transform(X_train)
            x_new    = scaler.transform(_features_to_array(features).reshape(1, -1))

            clf = IsolationForest(
                n_estimators=100,
                contamination=0.05,   # flag top ~5% most anomalous
                random_state=42,
                n_jobs=-1,
            )
            clf.fit(X_scaled)

            prediction    = clf.predict(x_new)[0]        # 1=normal, -1=anomaly
            anomaly_score = float(clf.decision_function(x_new)[0])

            if prediction == -1:
                reason = (
                    f"Anomalous voting pattern detected by AI model "
                    f"(anomaly score: {anomaly_score:.4f}). "
                    f"Vote blocked for security review."
                )
                _save_log(user, True, reason, features, anomaly_score)
                return True, reason

            reason = f"No fraud detected (AI anomaly score: {anomaly_score:.4f})"
            _save_log(user, False, reason, features, anomaly_score)
            return False, reason

        except Exception:
            # sklearn unavailable or failed — fall through to simple rule
            pass

    # ── 3. Fallback: simple time-window rule (not enough data yet)
    from votes.models import votes as VoteModel
    t10 = now - timedelta(minutes=10)
    if VoteModel.objects.filter(voter=user, timestamp__gte=t10).count() > 1:
        reason = "Multiple votes detected in a short time window (fallback rule)."
        _save_log(user, True, reason, features)
        return True, reason

    reason = "No fraud detected (fallback rule — insufficient training data)."
    _save_log(user, False, reason, features)
    return False, reason
