from rest_framework import viewsets
from category.models import Category
from category.serializers import CategorySerializer


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    
    def get_queryset(self):
        # prefetch items and their related fields
        return Category.objects.select_related('event__eatery').prefetch_related(
            'items__dietary_preferences',
            'items__allergens'
        ).all()