from django.db import connection, reset_queries
from django.conf import settings
settings.DEBUG = True

# Test each endpoint
endpoints = [
    '/eatery/',
    '/eatery/1/',
    '/event/',
    '/category/',
    '/item/',
    '/user/',
    '/user/1/',
    '/eatery/day/0/'
]

from django.test import Client
client = Client()

for endpoint in endpoints:
    reset_queries()
    try:
        response = client.get(endpoint)
        print(f"{endpoint}: {len(connection.queries)} queries, Status: {response.status_code}")
    except Exception as e:
        print(f"{endpoint}: Error - {e}")