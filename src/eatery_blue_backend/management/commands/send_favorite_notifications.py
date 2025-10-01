from django.core.management.base import BaseCommand
from user.models import User
from event.models import Event
from util.firebase_service import firebase_service
from datetime import datetime
from zoneinfo import ZoneInfo
import json

class Command(BaseCommand):
    help = 'Sends ONE notification per user about all their favorite items being served.'

    def add_arguments(self, parser):
        parser.add_argument('--user_id', type=int, help='ID of the user to send a notification to for testing')

    # U = Number of users, T = all items today,
    # K = eateries, F = avg favorites/user, I = avg unique items/eatery
    # time complexity is O(T + U * K * F)
    def handle(self, *args, **options):
        user_id = options.get('user_id')

        if user_id:
            users = User.objects.filter(id=user_id)
        else:
            users = User.objects.filter(
                favorite_items__len__gt=0, 
                fcm_token__isnull=False
            ).exclude(fcm_token='')

        tz = ZoneInfo("America/New_York")
        now = datetime.now(tz)
        start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_day = now.replace(hour=23, minute=59, second=59, microsecond=999999)
        
        start_unix = int(start_of_day.timestamp())
        end_unix = int(end_of_day.timestamp())
        
        # map of all items available today, grouped by eatery
        todays_events = Event.objects.filter(
            start__lt=end_unix, end__gt=start_unix
        ).prefetch_related('eatery', 'menu__items')
        
        eatery_menus = {}
        for event in todays_events:
            eatery_name = event.eatery.name
            if eatery_name not in eatery_menus:
                eatery_menus[eatery_name] = set()
            
            for category in event.menu.all():
                for item in category.items.all():
                    eatery_menus[eatery_name].add(item.name)
        
        # aggregate all matches
        for user in users:
            if not user.fcm_token:
                continue

            user_favorites = set(user.favorite_items)
            
            all_matches_by_eatery = {}

            for eatery_name, items in eatery_menus.items():
                matched_items = sorted(list(user_favorites.intersection(items)))
                
                if matched_items:
                    all_matches_by_eatery[eatery_name] = matched_items
            
            # send a notification if any matches were found
            if all_matches_by_eatery:
                self.send_aggregated_notification(user, all_matches_by_eatery)
                
                if user_id:
                    print(f"Test notification sent to user {user_id}. Matches: {all_matches_by_eatery}")

    def send_aggregated_notification(self, user, all_matches_by_eatery):
        title = "Some of your favorites are being served today!"
        eatery_names = list(all_matches_by_eatery.keys())
        
        try:
            if len(eatery_names) == 1:
                eatery_name = eatery_names[0]
                items = all_matches_by_eatery[eatery_name]
                
                if len(items) == 1:
                    body = f"{items[0]} is being served at {eatery_name} today."
                elif len(items) == 2:
                    body = f"{items[0]} and {items[1]} are at {eatery_name} today."
                else:
                    body = f"Several favorites are at {eatery_name} today."

            else:
                eatery_list_str = ", ".join(eatery_names)
                body = f"Favorites found at {eatery_list_str} today. Check the app for details!"

            firebase_service.send_notification_to_token(
                token=user.fcm_token,
                title=title,
                body=body,
                data={"matches": json.dumps(all_matches_by_eatery)} 
            )
        except Exception as e:
            print(f'Error sending aggregated notification to user {user.id}: {str(e)}')