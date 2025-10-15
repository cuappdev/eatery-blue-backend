from rest_framework import viewsets
from category.models import Category
from category.serializers import CategorySerializer


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    
    def get_queryset(self):
        # prefetch items and their related fields
        return Category.objects.select_related('event__eatery').all()