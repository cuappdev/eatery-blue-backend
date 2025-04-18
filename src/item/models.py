from django.db import models
from category.models import Category

class DietaryPreference(models.Model):
    name = models.CharField(max_length=30, primary_key=True)
    
    def __str__(self):
        return self.name
    
class Allergen(models.Model):
    name = models.CharField(max_length=30, primary_key=True)
    
    def __str__(self):
        return self.name


class Item(models.Model):
    category = models.ForeignKey(
        Category, related_name="items", on_delete=models.DO_NOTHING
    )
    name = models.CharField(max_length=40, default="Item")
    base_price = models.FloatField(null=True, blank=True, default=0.0)
    dietary_preferences = models.ManyToManyField(
        DietaryPreference, blank=True, related_name="items"
    )
    allergens = models.ManyToManyField(
        Allergen, blank=True, related_name="items"
    )

    def __str__(self):
        return f"{self.name} ({self.category.id})"