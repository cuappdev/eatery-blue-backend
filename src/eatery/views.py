from eatery.serializers import (
    EaterySerializer,
    EaterySerializerSimple,
    EaterySerializerByDay,
    EaterySerializerOptimized,
)
from django.db.models import Prefetch
from eatery.util.json import FieldType, error_json, success_json, verify_json_fields
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import viewsets
from .permissions import EateryPermission
from eatery.datatype.Eatery import EateryID
from eatery.models import Eatery
from event.models import Event
from .controllers.update_eatery import UpdateEateryController
from memory_profiler import profile
from datetime import timedelta, datetime
from zoneinfo import ZoneInfo


class EateryViewSet(viewsets.ModelViewSet):
    """
    View and edit eateries (all, or specific)
    """

    queryset = Eatery.objects.all()
    serializer_class = EaterySerializer
    permission_classes = [EateryPermission]

    def get_queryset(self):
        """
        Override to add prefetch_related for optimization
        """
        queryset = super().get_queryset()

        # prefetch all related objects to avoid N+1 query problem
        return queryset.prefetch_related(
            "events__menu__items__dietary_preferences", "events__menu__items__allergens"
        )

    @profile
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = EaterySerializerOptimized(instance)
        return Response(serializer.data)

    @profile
    @method_decorator(cache_page(60 * 60 * 2))  # cache for 2 hours
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = EaterySerializerOptimized(queryset, many=True)
        return Response(serializer.data)

    @profile
    def get_object(self):
        queryset = self.filter_queryset(self.get_queryset())
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field

        # assert lookup_url_kwarg in self.kwargs, (
        #     "Expected view %s to be called with a URL keyword argument "
        #     'named "%s". Fix your URL conf, or set the `.lookup_field` '
        #     "attribute on the view correctly."
        #     % (self.__class__.__name__, lookup_url_kwarg)
        # )
        # Uses the lookup_field attribute, which defaults to `pk`
        filter_kwargs = {self.lookup_field: self.kwargs[lookup_url_kwarg]}
        obj = get_object_or_404(queryset, **filter_kwargs)

        # May raise a permission denied
        self.check_object_permissions(self.request, obj)
        return obj

    def update(self, request, *args, **kwargs):
        text_params = request.POST
        if not verify_json_fields(
            text_params,
            {
                "id": FieldType.STRING,
            },
            [
                "name",
                "menu_summary",
                "location",
                "campus_area",
                "online_order_url",
                "latitude",
                "longitude",
                "payment_accepts_meal_swipes",
                "payment_accepts_brbs",
                "payment_accepts_cash",
                "image",
            ],
        ):
            return JsonResponse(error_json("Malformed Request"))

        id = int(text_params.get("id"))
        try:
            image_param = request.FILES.get("image")
        except Exception:
            image_param = None

        try:
            UpdateEateryController(EateryID(id), text_params, image_param).process()
            return JsonResponse(success_json("Updated"))
        except Exception as e:
            return JsonResponse(error_json(str(e)))


class GetEateriesSimple(APIView):
    """
    View all eateries with less information
    """

    @profile
    def get(self, request):
        eateries_queryset = Eatery.objects.prefetch_related("events").all()
        eateries = EaterySerializerSimple(eateries_queryset, many=True)
        return Response(eateries.data)


class GetEateriesByDay(APIView):
    """
    Get all eatery information by day
    """

    @profile
    @method_decorator(cache_page(60 * 60 * 2))  # cache for 2 hours
    def get(self, request, day):
        now = datetime.now(ZoneInfo("America/New_York"))
        start_date = now.replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(
            days=day
        )
        end_date = start_date + timedelta(days=1)

        start_unix = int(start_date.timestamp())
        end_unix = int(end_date.timestamp())

        filtered_events_prefetch = Prefetch(
            "events",
            queryset=Event.objects.filter(
                start__gte=start_unix, start__lt=end_unix
            ).prefetch_related(
                "menu__items__dietary_preferences", "menu__items__allergens"
            ),
            to_attr="filtered_events",
        )

        eateries_queryset = Eatery.objects.prefetch_related(
            filtered_events_prefetch
        ).exclude(events__event_description="Open")

        eateries = EaterySerializerByDay(
            eateries_queryset,
            many=True,
        )
        return Response(eateries.data)
