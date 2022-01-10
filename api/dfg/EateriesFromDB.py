import datetime
import json
import re

import pytz

from api.datatype.Eatery import Eatery, EateryID
from api.datatype.EateryException import EateryException
from api.datatype.Event import Event
from api.datatype.Menu import Menu
from api.datatype.MenuCategory import MenuCategory
from api.datatype.MenuItem import MenuItem
from api.dfg.DfgNode import DfgNode

from eateries.models import EateryStore, ExceptionStore
from eateries.serializers import EateryStoreSerializer, ExceptionStoreSerializer

from datetime import datetime

# eventually need to deprecate this for a custom DB backend storing all of the overrides

class EateriesFromDB(DfgNode):

    def __call__(self, *args, **kwargs) -> list[Eatery]:
        eateries = EateryStore.objects.all()
        serialized_eateries = EateryStoreSerializer(data=eateries, many=True)
        serialized_eateries.is_valid()
        exceptions = ExceptionStore.objects.filter(end_timestamp__gte=datetime.now().timestamp(), start_timestamp__lte=datetime.now().timestamp())
        serialized_exceptions = ExceptionStoreSerializer(data=exceptions, many=True)
        serialized_exceptions.is_valid()
        return list(map(lambda x: EateriesFromDB.eatery_from_serialized(x, serialized_exceptions.data), serialized_eateries.data))

    @staticmethod
    def none_repr(str):
        return None if str == None or len(str) == 0 else str

    @staticmethod
    def eatery_from_serialized(serialized_eatery: dict, serialized_exceptions: list[dict]) -> Eatery:
        return Eatery(
            id=EateryID(serialized_eatery["id"]),
            name=EateriesFromDB.none_repr(serialized_eatery["name"]),
            image_url=EateriesFromDB.none_repr(serialized_eatery["image_url"]),
            menu_summary=EateriesFromDB.none_repr(serialized_eatery["menu_summary"]),
            campus_area=EateriesFromDB.none_repr(serialized_eatery["campus_area"]),
            events=None,
            latitude=serialized_eatery["latitude"],
            longitude=serialized_eatery["longitude"],
            payment_methods=EateriesFromDB.payment_methods(serialized_eatery),
            location=EateriesFromDB.none_repr(serialized_eatery["location"]),
            online_order=serialized_eatery["online_order"],
            online_order_url=EateriesFromDB.none_repr(serialized_eatery["online_order_url"]),
            exceptions = EateriesFromDB.exceptions(serialized_eatery["id"], serialized_exceptions)
        )
    
    @staticmethod
    def payment_methods(serialized_eatery:dict):
        pay_methods = []
        if serialized_eatery["payment_accepts_cash"]:
            pay_methods.append("cash")
        if serialized_eatery["payment_accepts_brbs"]:
            pay_methods.append("brbs")
        if serialized_eatery["payment_accepts_meal_swipes"]:
            pay_methods.append("swipes")
        return pay_methods

    @staticmethod
    def exceptions(eatery_id: int, serialized_exceptions: list[dict]):
        return [EateriesFromDB.exception_from_serialized(exception) for exception in serialized_exceptions if exception["eatery"] == eatery_id]

    @staticmethod
    def exception_from_serialized(serialized_exception: dict):
        return EateryException(
            id=serialized_exception["id"],
            description=serialized_exception["description"],
            start_timestamp=serialized_exception["start_timestamp"],
            end_timestamp=serialized_exception["end_timestamp"]
        )


