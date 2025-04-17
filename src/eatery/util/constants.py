from enum import Enum

from eatery.datatype.Eatery import EateryID

CORNELL_DINING_URL = "https://now.dining.cornell.edu/api/1.0/dining/eateries.json"
CORNELL_VENDOR_URL = (
    "https://vendor-api-extra.scl.cornell.edu/api/external/location-count"
)

DAY_OF_WEEK_LIST = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
]

DEFAULT_IMAGE_URL = "https://images-prod.healthline.com/hlcmsresource/images/AN_images/health-benefits-of-apples-1296x728-feature.jpg"


class SnapshotFileName(Enum):
    EATERY_STORE = "eatery_store.txt"
    ALERT_STORE = "alert_store.txt"
    CATEGORY_STORE = "category_store.txt"
    MENU_STORE = "menu_store.txt"
    ITEM_STORE = "item_store.txt"
    SUBITEM_STORE = "subitem_store.txt"
    CATEGORY_ITEM_ASSOCIATION = "category_item_association.txt"
    EVENT_SCHEDULE = "event_schedule.txt"
    DAY_OF_WEEK_EVENT_SCHEDULE = "day_of_week_event_schedule.txt"
    DATE_EVENT_SCHEDULE = "date_event_schedule.txt"
    CLOSED_EVENT_SCHEDULE = "closed_event_schedule.txt"
    TRANSACTION_HISTORY = "transaction_history.txt"
    SCHEDULE_EXCEPTION = "schedule_exception.txt"


# Dictionary mapping dining IDs to internal IDs
DINING_ID_TO_INTERNAL = {
    31: EateryID.ONE_ZERO_FOUR_WEST,
    7: EateryID.LIBE_CAFE,
    8: EateryID.ATRIUM_CAFE,
    1: EateryID.BEAR_NECESSITIES,
    25: EateryID.BECKER_HOUSE,
    10: EateryID.BIG_RED_BARN,
    11: EateryID.BUS_STOP_BAGELS,
    12: EateryID.CAFE_JENNIE,
    26: EateryID.COOK_HOUSE,
    14: EateryID.DAIRY_BAR,
    41: EateryID.CROSSINGS_CAFE,
    32: EateryID.FRANNYS,
    16: EateryID.GOLDIES_CAFE,
    15: EateryID.GREEN_DRAGON,
    24: EateryID.HOT_DOG_CART,
    34: EateryID.ICE_CREAM_BIKE,
    27: EateryID.BETHE_HOUSE,
    28: EateryID.JANSENS_MARKET,
    29: EateryID.KEETON_HOUSE,
    42: EateryID.MANN_CAFE,
    18: EateryID.MARTHAS_CAFE,
    19: EateryID.MATTINS_CAFE,
    33: EateryID.MCCORMICKS,
    3: EateryID.NORTH_STAR_DINING,
    20: EateryID.OKENSHIELDS,
    4: EateryID.RISLEY,
    5: EateryID.RPCC,
    30: EateryID.ROSE_HOUSE,
    21: EateryID.RUSTYS,
    13: EateryID.STRAIGHT_FROM_THE_MARKET,
    23: EateryID.TRILLIUM,
    43: EateryID.MORRISON_DINING,
    44: EateryID.NOVICKS_CAFE,
    45: EateryID.VET_CAFE,
}

# Dictionary mapping vendor names to internal IDs
VENDOR_NAME_TO_INTERNAL = {
    "bearnecessities": EateryID.BEAR_NECESSITIES,
    "northstarmarketplace": EateryID.NORTH_STAR_DINING,
    "jansensmarket": EateryID.JANSENS_MARKET,
    "stockinghallcafe": EateryID.DAIRY_BAR,
    "stockinghall": EateryID.DAIRY_BAR,
    "marthas": EateryID.MARTHAS_CAFE,
    "cafejennie": EateryID.CAFE_JENNIE,
    "goldiescafe": EateryID.GOLDIES_CAFE,
    "alicecookhouse": EateryID.COOK_HOUSE,
    "carlbeckerhouse": EateryID.BECKER_HOUSE,
    "duffield": EateryID.MATTINS_CAFE,
    "greendragon": EateryID.GREEN_DRAGON,
    "trillium": EateryID.TRILLIUM,
    "olinlibecafe": EateryID.LIBE_CAFE,
    "statlerterrace": EateryID.TERRACE,
    "busstopbagels": EateryID.BUS_STOP_BAGELS,
    "kosher": EateryID.ONE_ZERO_FOUR_WEST,
    "jansensatbethehouse": EateryID.BETHE_HOUSE,
    "keetonhouse": EateryID.KEETON_HOUSE,
    "rpme": EateryID.RPCC,
    "rosehouse": EateryID.ROSE_HOUSE,
    "risley": EateryID.RISLEY,
    "frannysft": EateryID.FRANNYS,
    "mccormicks": EateryID.MCCORMICKS,
    "sage": EateryID.ATRIUM_CAFE,
    "straightmarket": EateryID.STRAIGHT_FROM_THE_MARKET,
    "crossingscafe": EateryID.CROSSINGS_CAFE,
    "okenshields": EateryID.OKENSHIELDS,
    "bigredbarn": EateryID.BIG_RED_BARN,
    "rustys": EateryID.RUSTYS,
    "manncafe": EateryID.MANN_CAFE,
    "statlermacs": EateryID.MACS_CAFE,
    "morrisondining": EateryID.MORRISON_DINING,
    "morrison": EateryID.MORRISON_DINING,
    "novickscafe": EateryID.NOVICKS_CAFE,
    "Vet College Cafe": EateryID.VET_CAFE,
}

# Dictionary mapping internal IDs to image URLs
INTERNAL_ID_TO_IMAGE_URL = {
    EateryID.ONE_ZERO_FOUR_WEST: "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/104-West.jpg",
    EateryID.LIBE_CAFE: "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/Amit-Bhatia-Libe-Cafe.jpg",
    EateryID.ATRIUM_CAFE: "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/Atrium-Cafe.jpg",
    EateryID.BEAR_NECESSITIES: "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/Bear-Necessities.jpg",
    EateryID.BECKER_HOUSE: "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/Becker-House-Dining.jpg",
    EateryID.BIG_RED_BARN: "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/Big-Red-Barn.jpg",
    EateryID.BUS_STOP_BAGELS: "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/Bug-Stop-Bagels.jpg",
    EateryID.CAFE_JENNIE: "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/Cafe-Jennie.jpg",
    EateryID.COOK_HOUSE: "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/Cook-House-Dining.jpg",
    EateryID.DAIRY_BAR: "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/Cornell-Dairy-Bar.jpg",
    EateryID.CROSSINGS_CAFE: "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/Crossings-Cafe.jpg",
    EateryID.FRANNYS: "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/frannys.jpg",
    EateryID.GOLDIES_CAFE: "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/Goldies-Cafe.jpg",
    EateryID.GREEN_DRAGON: "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/Green-Dragon.jpg",
    EateryID.HOT_DOG_CART: "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/Hot-Dog-Cart.jpg",
    EateryID.ICE_CREAM_BIKE: "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/icecreamcart.jpg",
    EateryID.BETHE_HOUSE: "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/Jansens-Dining.jpg",
    EateryID.JANSENS_MARKET: "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/Jansens-Market.jpg",
    EateryID.KEETON_HOUSE: "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/Keeton-House-Dining.jpg",
    EateryID.MANN_CAFE: "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/Mann-Cafe.jpg",
    EateryID.MARTHAS_CAFE: "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/Marthas-Cafe.jpg",
    EateryID.MATTINS_CAFE: "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/Mattins-Cafe.jpg",
    EateryID.MCCORMICKS: "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/mccormicks.jpg",
    EateryID.NORTH_STAR_DINING: "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/North-Star.jpg",
    EateryID.OKENSHIELDS: "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/Okenshields.jpg",
    EateryID.RISLEY: "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/Risley-Dining.jpg",
    EateryID.ROSE_HOUSE: "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/Rose-House-Dining.jpg",
    EateryID.RUSTYS: "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/Rustys.jpg",
    EateryID.STRAIGHT_FROM_THE_MARKET: "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/StraightMarket.jpg",
    EateryID.TRILLIUM: "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/Trillium.jpg",
    EateryID.MORRISON_DINING: "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/Morrison-Dining.jpg",
    EateryID.NOVICKS_CAFE: "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/novicks-cafe.jpg",
    EateryID.VET_CAFE: "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/vets-cafe.jpg",
    EateryID.MACS_CAFE: "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/Macs-Cafe.jpg",
    EateryID.TERRACE: "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/Terrace.jpg",
}


def dining_id_to_internal_id(id: int):
    """Convert dining ID to internal eatery ID"""
    if id in DINING_ID_TO_INTERNAL:
        return DINING_ID_TO_INTERNAL[id]
    print(f"Missing eatery_id {id}")
    return None


def vendor_name_to_internal_id(vendor_eatery_name):
    """Convert vendor eatery name to internal eatery ID"""
    # Normalize vendor name: lowercase and remove non-alphabetic characters
    vendor_eatery_name = "".join(c.lower() for c in vendor_eatery_name if c.isalpha())
    
    if vendor_eatery_name in VENDOR_NAME_TO_INTERNAL:
        return VENDOR_NAME_TO_INTERNAL[vendor_eatery_name]
    
    # TODO: Add a slack notif / flag that a wait time location was not recognized
    return None


def internal_id_to_image_url(id: EateryID):
    """Convert internal eatery ID to image URL"""
    if id in INTERNAL_ID_TO_IMAGE_URL:
        return INTERNAL_ID_TO_IMAGE_URL[id]
    
    print(f"Missing image url for eatery_id {id}")
    return DEFAULT_IMAGE_URL