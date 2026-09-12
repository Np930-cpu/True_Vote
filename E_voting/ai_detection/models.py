from django.db import models
from django.conf import settings


class FraudLog(models.Model):
    """
    Audit trail for every fraud-detection check.
    Stores the result, reason, and feature values so admins can review
    why a vote was flagged or allowed.
    """
    RESULT_CHOICES = [
        ('allowed', 'Allowed'),
        ('blocked', 'Blocked'),
    ]

    voter        = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, related_name='fraud_logs'
    )
    timestamp    = models.DateTimeField(auto_now_add=True)
    result       = models.CharField(max_length=10, choices=RESULT_CHOICES)
    reason       = models.TextField()

    # raw feature values at time of check
    feat_votes_10m      = models.FloatField(default=0)
    feat_votes_1h       = models.FloatField(default=0)
    feat_hour_of_day    = models.IntegerField(default=0)
    feat_elections_voted= models.IntegerField(default=0)
    feat_global_rate    = models.FloatField(default=0)
    anomaly_score       = models.FloatField(null=True, blank=True)

    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Fraud Log'
        verbose_name_plural = 'Fraud Logs'

    def __str__(self):
        return f"[{self.result.upper()}] {self.voter} @ {self.timestamp:%Y-%m-%d %H:%M}"
