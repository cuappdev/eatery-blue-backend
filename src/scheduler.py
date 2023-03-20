import os
import django
from django.core import management
import schedule
import time

try:
    os.environ["DJANGO_SETTINGS_MODULE"]
except:
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "eatery_blue_backend.settings")
    django.setup()

print("Scheduler started")
def populate_models():
    management.call_command('populate_models')

schedule.every(12).hours.do(populate_models)

populate_models()
while True:
    schedule.run_pending()
    time.sleep(1)