from django.core.management.base import BaseCommand
from datetime import datetime
import requests
from eatery.util.constants import CORNELL_DINING_URL
from event.models import Event
from eatery.controllers.populate_eatery import PopulateEateryController
from event.controllers.populate_event import PopulateEventController
from item.controllers.populate_item import PopulateItemController
from category.controllers.populate_category import PopulateCategoryController
from memory_profiler import profile


class Command(BaseCommand):
    help = "Populates all models"

    def handle(self, *args, **kwargs):
        self.stdout.write(f"Populating models at {datetime.now()} UTC")
        start = int(datetime.now().timestamp())
        self.process()
        self.stdout.write(
            f"Finished populating models at {datetime.now()} UTC ({int(datetime.now().timestamp()) - start}s)"
        )

    def get_json(self):
        try:
            response = requests.get(CORNELL_DINING_URL, timeout=10)
        except Exception as e:
            raise e
        if response.status_code <= 400:
            response = response.json()
            json_eateries = response["data"]["eateries"]
        return json_eateries

    def logger_wrapper(self, command_obj, log_title, args):
        pre = int(datetime.now().timestamp())
        print(f"{datetime.now()} UTC: {log_title}")
        output = command_obj.process(*args)
        print(f"Done ({int(datetime.now().timestamp()) - pre}s) ")
        return output

    @profile
    def process(self):
        """
        1. Get JSON from API

        2. create eateries (fron CDN json)

        3. create events (from CDN json)
          return events_dict = { eatery_id : [event, event, event...], eatery_id : ... }

        4. create menus for every eatery's events
          return menus_dict = { eatery_id : [menu, menu, menu...] }

        5. create categories in each menu
          return categories_dict =
            { eatery_id :
              { menu[i] : {"category_name" : id, "category_name" : id...},
                menu[i] : {"category_name" : id...}
              }
            }

        6. create items for each category

        """

        json_eateries = self.get_json()

        Event.truncate()

        self.logger_wrapper(
            PopulateEateryController(), "Populating eateries", [json_eateries]
        )

        events_dict = self.logger_wrapper(
            PopulateEventController(), "Populating events", [json_eateries]
        )

        categories_dict = self.logger_wrapper(
            PopulateCategoryController(),
            "Populating categories",
            [events_dict, json_eateries],
        )

        self.logger_wrapper(
            PopulateItemController(),
            "Populating items",
            [categories_dict, json_eateries],
        )

        print("Done populating")
