from django.core.management.base import BaseCommand
from user.models import User
from util.firebase_service import firebase_service


class Command(BaseCommand):
    help = 'Test Firebase notifications'

    def add_arguments(self, parser):
        parser.add_argument('--token', type=str, help='FCM token to test with')

    def handle(self, *args, **options):
        token = options.get('token')
        
        if not token:
            # Find any user with FCM token
            user = User.objects.filter(fcm_token__isnull=False).exclude(fcm_token='').first()
            if not user:
                self.stdout.write(self.style.ERROR('No users with FCM tokens found'))
                return
            token = user.fcm_token
            self.stdout.write(f"Using token: {token[:20]}...")

        # Send test notification
        try:
            success = firebase_service.send_notification_to_token(
                token=token,
                title="Test Notification",
                body="This is a test notification"
            )
            
            if success:
                self.stdout.write(self.style.SUCCESS('Notification sent'))
            else:
                self.stdout.write(self.style.ERROR('Failed to send'))
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error: {str(e)}'))