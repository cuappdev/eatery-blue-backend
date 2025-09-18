from rest_framework import viewsets
from item.models import Item
from item.serializers import ItemSerializer


class ItemViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    
    def get_queryset(self):
        return Item.objects.select_related(
            'category__event__eatery'
        ).prefetch_related(
            'dietary_preferences',
            'allergens'
        ).all()