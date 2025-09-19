import secrets
from django.views.decorators.cache import cache_page


def cache_page_with_jitter(timeout, *, jitter, **kwargs):
    """
    A custom cache_page decorator that adds a random jitter to the timeout.
    This helps prevent the "thundering herd" problem.
    """

    def decorator(func):
        jittered_timeout = timeout + secrets.randbelow(jitter + 1)
        return cache_page(jittered_timeout, **kwargs)(func)

    return decorator
