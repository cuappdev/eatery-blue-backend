from rest_framework import serializers
from item.models import Item, DietaryPreference, Allergen


class ItemSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    name = serializers.CharField(default="Item")
    dietary_preferences = serializers.SerializerMethodField()
    allergens = serializers.SerializerMethodField()

    def get_dietary_preferences(self, obj):
        """Get list of dietary preference names"""
        return [pref.name for pref in obj.dietary_preferences.all()]
    
    def get_allergens(self, obj):
        """Get list of allergen names"""
        return [allergen.name for allergen in obj.allergens.all()]

    def create(self, validated_data):
        dietary_prefs = validated_data.pop('dietary_preferences', [])
        allergens = validated_data.pop('allergens', [])
        item, _ = Item.objects.get_or_create(**validated_data)

        dietary_prefs_objects = []
        for pref_name in dietary_prefs:
            pref, _ = DietaryPreference.objects.get_or_create(name=pref_name)
            dietary_prefs_objects.append(pref)
        
        if dietary_prefs_objects:
            item.dietary_preferences.add(*dietary_prefs_objects)

        allergens_objects = []
        for allergen_name in allergens:
            allergen, _ = Allergen.objects.get_or_create(name=allergen_name)
            allergens_objects.append(allergen)

        if allergens_objects:
            item.allergens.add(*allergens_objects)

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
