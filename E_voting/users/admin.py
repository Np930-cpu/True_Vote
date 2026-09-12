from django.contrib import admin
from django.utils.html import format_html
from .models import Voters


@admin.register(Voters)
class VotersAdmin(admin.ModelAdmin):
    list_display = ('voter_id', 'name', 'email_id', 'age', 'otp_verified', 'is_verified', 'status_badge', 'is_active')
    list_filter = ('is_active', 'otp_verified', 'is_verified')
    search_fields = ('voter_id', 'name', 'email_id')
    readonly_fields = ('voter_id', 'name', 'email_id', 'age', 'otp_verified', 'is_verified', 'otp', 'otp_created_at')
    actions = ['deactivate_voters', 'reactivate_voters']

    fieldsets = (
        ('Voter Info', {
            'fields': ('voter_id', 'name', 'email_id', 'age')
        }),
        ('Verification Status', {
            'fields': ('otp_verified', 'is_verified')
        }),
        ('Account Status', {
            'fields': ('is_active',),
            'description': 'Uncheck "Is active" to deactivate this voter. They will not be able to log in.'
        }),
    )

    def status_badge(self, obj):
        if obj.is_active:
            return format_html('<span style="color:green;font-weight:600;">Active</span>')
        return format_html('<span style="color:red;font-weight:600;">Deactivated</span>')
    status_badge.short_description = 'Status'

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        return True

    def get_readonly_fields(self, request, obj=None):
        if obj:
            return self.readonly_fields
        return self.readonly_fields

    @admin.action(description='Deactivate selected voters')
    def deactivate_voters(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} voter(s) deactivated.')

    @admin.action(description='Reactivate selected voters')
    def reactivate_voters(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} voter(s) reactivated.')
