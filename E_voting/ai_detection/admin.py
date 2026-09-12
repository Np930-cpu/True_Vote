from django.contrib import admin
from .models import FraudLog


@admin.register(FraudLog)
class FraudLogAdmin(admin.ModelAdmin):
    list_display  = ('voter', 'result', 'reason_short', 'anomaly_score', 'timestamp')
    list_filter   = ('result',)
    search_fields = ('voter__voter_id', 'reason')
    readonly_fields = (
        'voter', 'timestamp', 'result', 'reason',
        'feat_votes_10m', 'feat_votes_1h', 'feat_hour_of_day',
        'feat_elections_voted', 'feat_global_rate', 'anomaly_score',
    )

    def reason_short(self, obj):
        return obj.reason[:80] + ('…' if len(obj.reason) > 80 else '')
    reason_short.short_description = 'Reason'
