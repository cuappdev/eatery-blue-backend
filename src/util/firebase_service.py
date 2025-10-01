import firebase_admin
from firebase_admin import credentials, messaging
import os
import json
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)


class FirebaseService:
    _instance = None
    _initialized = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(FirebaseService, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if not self._initialized:
            self._init_firebase()
            self.__class__._initialized = True

    def _init_firebase(self):
        """Initialize Firebase Admin SDK"""
        try:
            # Check if Firebase is already initialized
            firebase_admin.get_app()
            logger.info("Firebase already initialized")
        except ValueError:
            # Firebase not initialized yet
            # Try to use environment variable with JSON content
            firebase_config_json = os.getenv('FIREBASE_CONFIG_JSON')
            if firebase_config_json:
                try:
                    config_dict = json.loads(firebase_config_json)
                    cred = credentials.Certificate(config_dict)
                    firebase_admin.initialize_app(cred)
                    logger.info("Firebase initialized with JSON from environment variable")
                except json.JSONDecodeError as e:
                    logger.error(f"Invalid Firebase config JSON: {e}")
                    raise
            else:
                logger.error("No Firebase configuration found. Set FIREBASE_CONFIG_PATH or FIREBASE_CONFIG_JSON")
                raise ValueError("Firebase configuration not found")

    def send_notification_to_token(
        self, 
        token: str, 
        title: str, 
        body: str, 
        data: Optional[dict] = None
    ) -> bool:
        """
        Send a notification to a specific FCM token
        
        Args:
            token: FCM token of the device
            title: Notification title
            body: Notification body
            data: Optional data payload
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            message = messaging.Message(
                notification=messaging.Notification(
                    title=title,
                    body=body,
                ),
                token=token,
                data=data or {},
                android=messaging.AndroidConfig(
                    notification=messaging.AndroidNotification(
                        sound='default',
                        click_action='FLUTTER_NOTIFICATION_CLICK'
                    )
                ),
                apns=messaging.APNSConfig(
                    payload=messaging.APNSPayload(
                        aps=messaging.Aps(
                            sound='default'
                        )
                    )
                )
            )

            response = messaging.send(message)
            logger.info(f"Successfully sent message: {response}")
            return True

        except messaging.UnregisteredError:
            logger.warning(f"Token is unregistered: {token}")
            return False
        except messaging.SenderIdMismatchError:
            logger.error(f"Sender ID mismatch for token: {token}")
            return False
        except Exception as e:
            logger.error(f"Error sending notification: {e}")
            return False

    def send_notification_to_multiple_tokens(
        self, 
        tokens: List[str], 
        title: str, 
        body: str, 
        data: Optional[dict] = None
    ) -> dict:
        """
        Send notifications to multiple FCM tokens
        
        Args:
            tokens: List of FCM tokens
            title: Notification title
            body: Notification body
            data: Optional data payload
            
        Returns:
            dict: Results with success count and failed tokens
        """
        if not tokens:
            return {"success_count": 0, "failed_tokens": []}

        try:
            message = messaging.MulticastMessage(
                notification=messaging.Notification(
                    title=title,
                    body=body,
                ),
                tokens=tokens,
                data=data or {},
                android=messaging.AndroidConfig(
                    notification=messaging.AndroidNotification(
                        sound='default',
                        click_action='FLUTTER_NOTIFICATION_CLICK'
                    )
                ),
                apns=messaging.APNSConfig(
                    payload=messaging.APNSPayload(
                        aps=messaging.Aps(
                            sound='default'
                        )
                    )
                )
            )

            response = messaging.send_multicast(message)
            
            # Collect failed tokens for cleanup
            failed_tokens = []
            for idx, resp in enumerate(response.responses):
                if not resp.success:
                    failed_tokens.append(tokens[idx])
                    logger.warning(f"Failed to send to token {tokens[idx]}: {resp.exception}")

            logger.info(f"Successfully sent {response.success_count} out of {len(tokens)} messages")
            
            return {
                "success_count": response.success_count,
                "failed_tokens": failed_tokens
            }

        except Exception as e:
            logger.error(f"Error sending multicast notification: {e}")
            return {"success_count": 0, "failed_tokens": tokens}

# Global instance
firebase_service = FirebaseService()