from item.models import Item, DietaryPreference, Allergen
import json
from util.constants import eatery_is_cafe


class PopulateItemController:
    def __init__(self):
        self = self

    def create_item_with_m2m(self, category_id, name, dietary_preferences=None, allergens=None):
        # handle many to many relationships
        item, created = Item.objects.get_or_create(
            category_id=category_id,
            name=name,
            defaults={'base_price': 0.0}
        )
        
        # handle dietary preferences
        if dietary_preferences:
            for pref_name in dietary_preferences:
                if pref_name:
                    pref, _ = DietaryPreference.objects.get_or_create(name=pref_name)
                    item.dietary_preferences.add(pref)
        
        # handle allergens
        if allergens:
            for allergen_name in allergens:
                if allergen_name:
                    allergen, _ = Allergen.objects.get_or_create(name=allergen_name)
                    item.allergens.add(allergen)
        
        return item

    def generate_cafe_items(self, menu, json_eatery):
        for json_item in json_eatery["diningItems"]:
            category_name = json_item["category"].strip()
            try:
                category_id = menu[category_name]
            except KeyError:
                continue

            dietary_preferences = json_item.get("dietaryPreferences", [])
            allergens = json_item.get("allergens", [])
            
            self.create_item_with_m2m(
                category_id=category_id,
                name=json_item["item"],
                dietary_preferences=dietary_preferences,
                allergens=allergens
            )

    def generate_dining_hall_items(self, menu, json_event, json_eatery):
        json_menus = json_event["menu"]
        for json_menu in json_menus:
            category_name = json_menu["category"].strip()
            try:
                category_id = menu[category_name]
            except KeyError:
                continue

            for json_item in json_menu["items"]:
                dietary_preferences = json_item.get("dietaryPreferences", [])
                allergens = json_item.get("allergens", [])
                
                self.create_item_with_m2m(
                    category_id=category_id,
                    name=json_item["item"],
                    dietary_preferences=dietary_preferences,
                    allergens=allergens
                )

    def process(self, categories_dict, json_eateries):
        with open(
            "./static_sources/external_eateries.json", "r"
        ) as external_eateries_file:
            external_eateries_json = json.load(external_eateries_file)
            json_eateries.extend(external_eateries_json["eateries"])

        for json_eatery in json_eateries:
            if (eatery_id := int(json_eatery["id"])) in categories_dict:
                eatery_menus = categories_dict[eatery_id]
            else:
                continue

            iter = list(eatery_menus.keys())
            i = 0

            is_cafe = eatery_is_cafe(json_eatery)

            json_dates = json_eatery["operatingHours"]
            for json_date in json_dates:
                json_events = json_date["events"]
                for json_event in json_events:
                    if i < len(iter):
                        menu_id = iter[i]
                        menu = eatery_menus[menu_id]
                        i += 1

                    if is_cafe:
                        self.generate_cafe_items(menu, json_eatery)
                    else:
                        self.generate_dining_hall_items(menu, json_event, json_eatery)
