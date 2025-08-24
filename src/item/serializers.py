from rest_framework import serializers
from item.models import Item, DietaryPreference, Allergen


class ItemSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    name = serializers.CharField(default="Item")
    dietary_preferences = serializers.SerializerMethodField()
    allergens = serializers.SerializerMethodField()

    def get_dietary_preferences(self, obj):
        """Get list of dietary preference names"""
        return list(obj.dietary_preferences.values_list('name', flat=True))
    
    def get_allergens(self, obj):
        """Get list of allergen names"""
        return list(obj.allergens.values_list('name', flat=True))

    def create(self, validated_data):
        # handle m2m fields differently
        item, _ = Item.objects.get_or_create(
            category=validated_data.get('category'),
            name=validated_data.get('name'),
            base_price=validated_data.get('base_price', 0.0)
        )
        return item
    
    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.base_price = validated_data.get('base_price', instance.base_price)
        instance.save()
        return instance

    class Meta:
        model = Item
        fields = ["id", "category", "name", "base_price", "dietary_preferences", "allergens"]
        read_only_fields = ["id"]


class ItemSerializerOptimized(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ["id", "name", "dietary_preferences", "allergens"]
