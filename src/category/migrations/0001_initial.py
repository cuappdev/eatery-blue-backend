# Generated by Django 4.0 on 2022-11-14 23:56

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('menu', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('category', models.CharField(default='General', max_length=40)),
                ('menu', models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, related_name='categories', to='menu.menu')),
            ],
        ),
    ]
