from django.contrib import admin
from elections.models import Candidate,Election

admin.site.register(Election)
admin.site.register(Candidate)

