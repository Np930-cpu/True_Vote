from django.contrib import admin
from .models import Block


@admin.register(Block)
class BlockAdmin(admin.ModelAdmin):
    list_display = ('index', 'voter_id', 'candidate_id', 'timestamp')
    readonly_fields = ('index', 'voter_id', 'candidate_id', 'timestamp', 'previous_hash', 'hash')

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
