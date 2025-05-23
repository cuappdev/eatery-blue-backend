# Generated by Django 4.0 on 2025-04-08 17:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('item', '0002_alter_item_id'),
    ]

    operations = [
        migrations.CreateModel(
            name='Allergen',
            fields=[
                ('name', models.CharField(max_length=30, primary_key=True, serialize=False)),
            ],
        ),
        migrations.CreateModel(
            name='DietaryPreference',
            fields=[
                ('name', models.CharField(max_length=30, primary_key=True, serialize=False)),
            ],
        ),
        migrations.AddField(
            model_name='item',
            name='allergens',
            field=models.ManyToManyField(blank=True, related_name='items', to='item.Allergen'),
        ),
        migrations.AddField(
            model_name='item',
            name='dietary_preferences',
            field=models.ManyToManyField(blank=True, related_name='items', to='item.DietaryPreference'),
        ),
    ]
