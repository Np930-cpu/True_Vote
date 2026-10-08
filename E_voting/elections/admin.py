from django.contrib import admin
from elections.models import Candidate, Election


class CandidateInline(admin.TabularInline):
    model = Candidate
    extra = 1
    fields = ('name', 'party', 'symbol', 'manifesto')


@admin.register(Election)
class ElectionAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'category', 'organization', 'start_date', 'end_date', 'creator', 'created_at')
    list_filter = ('category', 'start_date', 'end_date')
    search_fields = ('name', 'organization', 'description')
    inlines = [CandidateInline]
    ordering = ('-id',)


@admin.register(Candidate)
class CandidateAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'party', 'symbol', 'election')
    list_filter = ('election', 'party')
    search_fields = ('name', 'party', 'manifesto')
    ordering = ('-id',)
