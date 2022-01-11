# Generated by Django 4.0 on 2022-01-10 18:25

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('eateries', '0004_dayofweekeventschedule_dateeventschedule'),
    ]

    operations = [
        migrations.AddField(
            model_name='dateeventschedule',
            name='event_description',
            field=models.CharField(choices=[('Breakfast', 'Breakfast'), ('Brunch', 'Brunch'), ('Lunch', 'Lunch'), ('Dinner', 'Dinner'), ('General', 'General')], default='hello', max_length=10),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='dateeventschedule',
            name='menu',
            field=models.ForeignKey(default=None, on_delete=django.db.models.deletion.DO_NOTHING, to='eateries.menustore'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='dayofweekeventschedule',
            name='event_description',
            field=models.CharField(choices=[('Breakfast', 'Breakfast'), ('Brunch', 'Brunch'), ('Lunch', 'Lunch'), ('Dinner', 'Dinner'), ('General', 'General')], default='hello', max_length=10),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='dayofweekeventschedule',
            name='menu',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.DO_NOTHING, to='eateries.menustore'),
            preserve_default=False,
        ),
    ]
