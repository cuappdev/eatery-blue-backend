from rest_framework import serializers
from event.models import Event
from category.serializers import CategorySerializer


class EventSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False, read_only=True)
    event_description = serializers.CharField(
        allow_null=True, allow_blank=True, default=None
    )
    start = serializers.DateTimeField()
    end = serializers.DateTimeField()

    menu = CategorySerializer(many=True, read_only=True)

    def create(self, validated_data):
        event, _ = Event.objects.get_or_create(**validated_data)
        return event

    class Meta:
        model = Event
        fields = ["id", "eatery", "event_description", "start", "end", "menu"]

class EventSerializerSimple(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ["id", "eatery", "event_description", "start", "end"]
