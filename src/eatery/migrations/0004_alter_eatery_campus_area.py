# Generated by Django 4.0 on 2024-03-10 14:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("eatery", "0003_alter_eatery_image_url"),
    ]

    operations = [
        migrations.AlterField(
            model_name="eatery",
            name="campus_area",
            field=models.CharField(
                blank=True,
                choices=[
                    ("West", "West"),
                    ("North", "North"),
                    ("Central", "Central"),
                    ("Collegetown", "Collegetown"),
                    ("East", "East"),
                    ("", "None"),
                ],
                default="",
                max_length=15,
            ),
        ),
    ]