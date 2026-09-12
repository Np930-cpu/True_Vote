from django.contrib import admin
from .models import votes


@admin.register(votes)
class VotesAdmin(admin.ModelAdmin):
    list_display = ('voter', 'candidate', 'election', 'timestamp')
    readonly_fields = ('voter', 'candidate', 'election', 'timestamp')
    list_filter = ('election',)
    search_fields = ('voter__voter_id', 'candidate__name')

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
