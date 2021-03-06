from django.db import models


class EateryStore(models.Model):
    class CampusArea(models.TextChoices):
        WEST = "West"
        NORTH = "North"
        CENTRAL = "Central"
        COLLEGETOWN = "Collegetown"
        NONE = ""

    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=40, blank=True)
    menu_summary = models.CharField(max_length=60, blank=True)
    image_url = models.URLField(blank=True)
    location = models.CharField(max_length=30, blank=True)
    campus_area = models.CharField(
        max_length=15, choices=CampusArea.choices, default=CampusArea.NONE, blank=True
    )
    online_order_url = models.URLField(blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    payment_accepts_meal_swipes = models.BooleanField(null=True, blank=True)
    payment_accepts_brbs = models.BooleanField(null=True, blank=True)
    payment_accepts_cash = models.BooleanField(null=True, blank=True)
