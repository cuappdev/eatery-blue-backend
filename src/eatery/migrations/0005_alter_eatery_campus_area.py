# Generated by Django 4.0 on 2024-03-10 15:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("eatery", "0004_alter_eatery_campus_area"),
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
                    ("", "None"),
                ],
                default="",
                max_length=15,
            ),
        ),
    ]