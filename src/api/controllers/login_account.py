#from api.datatype.Eatery import get_password
from datetime import datetime, timedelta
from rsa import verify
from api.models import EateryStore
import os
import hashlib
from django.utils import timezone

def get_user_by_email(email):
    return EateryStore.objects.filter(email=email).first()

def get_user_by_session_token(session_token):
    return EateryStore.objects.filter(session_token=session_token).first()

def extract_token(request):
    auth_header = request.headers.get("Authorization")
    if auth_header is None:
        raise Exception("Malformed Request: missing auth header")

    bearer_token = auth_header.replace("Bearer ", "").strip()
    if bearer_token is None or not bearer_token:
        raise Exception("Malformed Request: missing bearer header")

    return bearer_token

class UpdatePasswordController:
    """
    Given an email, the current (old) password, 
    change user's password to something new.
    """
    def __init__(self, email: str, old_password: str, new_password: str):
        self.email = email
        self.old_password = old_password
        self.new_password = new_password 

    def verify_password(self, password):
        return password == self.old_password

    def process(self):
        user = get_user_by_email(self.email)
        if user is None:
            raise Exception("user not found")

        user_password = getattr(user, "password")
        if not self.verify_password(user_password):
            raise Exception("invalid password")

        user.password = self.new_password
        user.save()

    
class LoginController:
    """
    Given an email and password, verify the user's credentials.
    If email and password are correct, return new session token.
    """
    def __init__(self, email: str, password: str):
        self.email = email
        self.password = password 

    def _urlsafe_base_64(self):
        return hashlib.sha1(os.urandom(64)).hexdigest()

    def renew_session(self):
        self.session_token = self._urlsafe_base_64()
        self.session_expiration = datetime.now() + timedelta(days=1)

    def verify_password(self, password):
        return password == self.password
        
    def process(self):
        user =  get_user_by_email(self.email)
        if user is None:
            raise Exception("Invalid email or password.")

        user_password = getattr(user, "password")
        if not self.verify_password(user_password):
            raise Exception("Invalid email or password")

        self.renew_session()
        user.session_token = self.session_token
        user.session_expiration = self.session_expiration
        user.save()

        return self.session_token


class VerificationController:
    """
    Check if given session token is still valid.
    If not, prompt user to login again.
    """
    def __init__(self, session_token):
        self.session_token = session_token

    def verify_session_token(self, session_token, session_expiration):
        dt = timezone.make_aware(datetime.now(), timezone.get_default_timezone())
        return self.session_token == session_token and dt < session_expiration
        
    def process(self):
        user = get_user_by_session_token(self.session_token)
        if user is None:
            raise Exception("user not found")

        user_session_token = getattr(user, "session_token")
        user_session_expiration = getattr(user, "session_expiration")
        if user_session_token is None or not self.verify_session_token(user_session_token, user_session_expiration):
            raise Exception("Invalid session token. Please log in again.")
        

        

        

        