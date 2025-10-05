from rest_framework import serializers
from item.models import Item, DietaryPreference, Allergen


class ItemSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    name = serializers.CharField(default="Item")

    def create(self, validated_data):
        item, _ = Item.objects.get_or_create(**validated_data)
        return item
    
    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.base_price = validated_data.get('base_price', instance.base_price)
        instance.save()
        return instance

    class Meta:
        model = Item
        fields = ["id", "category", "name", "base_price"]
        read_only_fields = ["id"]


class ItemSerializerOptimized(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ["id", "name"]
