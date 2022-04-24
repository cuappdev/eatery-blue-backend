# Generated by Django 4.0 on 2022-03-24 20:28

import django.core.validators
from django.db import migrations, models
import re


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_remove_dayofweekeventschedule_offset_lst'),
    ]

    operations = [
        migrations.AddField(
            model_name='dayofweekeventschedule',
            name='offset_lst',
            field=models.CharField(default='0,2', max_length=100, validators=[django.core.validators.RegexValidator(re.compile('^\\d+(?:,\\d+)*\\Z'), code='invalid', message='Enter only digits separated by commas.')]),
            preserve_default=False,
        ),
    ]