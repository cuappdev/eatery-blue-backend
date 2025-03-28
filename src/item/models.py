from django.db import models
from category.models import Category


class Item(models.Model):
    category = models.ForeignKey(
        Category, related_name="items", on_delete=models.DO_NOTHING
    )
    name = models.CharField(max_length=40, default="Item")
    base_price = models.FloatField(null=True, blank=True, default=0.0)

    def __str__(self):
        return f"{self.name} ({self.category.id})"
