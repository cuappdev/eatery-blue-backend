from rest_framework import viewsets
from event.models import Event
from event.serializers import EventSerializer


class EventViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    
    def get_queryset(self):
        # prefetch related menu categories and items
        return Event.objects.select_related('eatery').prefetch_related(
            'menu__items__dietary_preferences',
            'menu__items__allergens'
        ).all()