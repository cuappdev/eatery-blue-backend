# Generated by Django 4.0 on 2023-04-05 06:20

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('event', '0004_alter_event_event_description'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='event',
            name='end',
        ),
        migrations.RemoveField(
            model_name='event',
            name='start',
        ),
    ]