from rest_framework import viewsets, status
from event.models import Event
from event.serializers import EventSerializer
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from django.db.models import F


class EventViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    
    def get_queryset(self):
        # prefetch related menu categories and items
        return Event.objects.select_related('eatery').all()
    
    @action(detail=True, methods=["post"], url_path="ratings/upvote")
    def upvote(self, request, pk=None):
        event = get_object_or_404(Event, pk=pk)
        value = request.data.get("value") # can be 1 or -1
        event.upvotes = F('upvotes') + value
        event.save(update_fields=['upvotes'])
        event.refresh_from_db()

        event_data = EventSerializer(event).data
        return Response(event_data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="ratings/downvote")
    def downvote(self, request, pk=None):
        event = get_object_or_404(Event, pk=pk)
        value = request.data.get("value") # can be 1 or -1
        event.downvotes = F('downvotes') + value
        event.save(update_fields=['downvotes'])
        event.refresh_from_db()

        event_data = EventSerializer(event).data
        return Response(event_data, status=status.HTTP_200_OK)