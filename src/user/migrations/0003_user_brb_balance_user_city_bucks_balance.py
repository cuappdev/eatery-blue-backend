# Generated by Django 4.0 on 2025-03-04 22:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0002_remove_user_email_remove_user_family_name_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='brb_balance',
            field=models.FloatField(default=0),
        ),
        migrations.AddField(
            model_name='user',
            name='city_bucks_balance',
            field=models.FloatField(default=0),
        ),
    ]
