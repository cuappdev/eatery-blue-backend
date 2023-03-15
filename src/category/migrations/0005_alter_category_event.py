# Generated by Django 4.0 on 2023-03-08 22:57

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('event', '0002_alter_event_end_alter_event_start'),
        ('category', '0004_remove_category_menu_category_event'),
    ]

    operations = [
        migrations.AlterField(
            model_name='category',
            name='event',
            field=models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, related_name='menu', to='event.event'),
        ),
    ]