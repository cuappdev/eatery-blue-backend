# Generated by Django 4.0 on 2023-04-08 04:16

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('person', '0002_chef_user_student_favorite_eateries_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='student',
            old_name='netid',
            new_name='net_id',
        ),
    ]
