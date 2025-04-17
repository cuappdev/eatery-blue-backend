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


def dining_id_to_internal_id(id: int):
    if id == 31:
        return EateryID.ONE_ZERO_FOUR_WEST
    elif id == 7:
        return EateryID.LIBE_CAFE
    elif id == 8:
        return EateryID.ATRIUM_CAFE
    elif id == 1:
        return EateryID.BEAR_NECESSITIES
    elif id == 25:
        return EateryID.BECKER_HOUSE
    elif id == 10:
        return EateryID.BIG_RED_BARN
    elif id == 11:
        return EateryID.BUS_STOP_BAGELS
    elif id == 12:
        return EateryID.CAFE_JENNIE
    elif id == 26:
        return EateryID.COOK_HOUSE
    elif id == 14:
        return EateryID.DAIRY_BAR
    elif id == 41:
        return EateryID.CROSSINGS_CAFE
    elif id == 32:
        return EateryID.FRANNYS
    elif id == 16:
        return EateryID.GOLDIES_CAFE
    elif id == 15:
        return EateryID.GREEN_DRAGON
    elif id == 24:
        return EateryID.HOT_DOG_CART
    elif id == 34:
        return EateryID.ICE_CREAM_BIKE
    elif id == 27:
        return EateryID.BETHE_HOUSE
    elif id == 28:
        return EateryID.JANSENS_MARKET
    elif id == 29:
        return EateryID.KEETON_HOUSE
    elif id == 42:
        return EateryID.MANN_CAFE
    elif id == 18:
        return EateryID.MARTHAS_CAFE
    elif id == 19:
        return EateryID.MATTINS_CAFE
    elif id == 33:
        return EateryID.MCCORMICKS
    elif id == 3:
        return EateryID.NORTH_STAR_DINING
    elif id == 20:
        return EateryID.OKENSHIELDS
    elif id == 4:
        return EateryID.RISLEY
    elif id == 5:
        return EateryID.RPCC
    elif id == 30:
        return EateryID.ROSE_HOUSE
    elif id == 21:
        return EateryID.RUSTYS
    elif id == 13:
        return EateryID.STRAIGHT_FROM_THE_MARKET
    elif id == 23:
        return EateryID.TRILLIUM
    elif id == 43:
        return EateryID.MORRISON_DINING
    elif id == 44:
        return EateryID.NOVICKS_CAFE
    elif id == 45:
        return EateryID.VET_CAFE
    else:
        print(f"Missing eatery_id {id}")
        return None


# Our transactions vendor
def vendor_name_to_internal_id(vendor_eatery_name):
    vendor_eatery_name = "".join(c.lower() for c in vendor_eatery_name if c.isalpha())
    if vendor_eatery_name == "bearnecessities":
        return EateryID.BEAR_NECESSITIES
    elif vendor_eatery_name == "northstarmarketplace":
        return EateryID.NORTH_STAR_DINING
    elif vendor_eatery_name == "jansensmarket":
        return EateryID.JANSENS_MARKET
    elif (
        vendor_eatery_name == "stockinghallcafe" or vendor_eatery_name == "stockinghall"
    ):
        return EateryID.DAIRY_BAR
    elif vendor_eatery_name == "marthas":
        return EateryID.MARTHAS_CAFE
    elif vendor_eatery_name == "cafejennie":
        return EateryID.CAFE_JENNIE
    elif vendor_eatery_name == "goldiescafe":
        return EateryID.GOLDIES_CAFE
    elif vendor_eatery_name == "alicecookhouse":
        return EateryID.COOK_HOUSE
    elif vendor_eatery_name == "carlbeckerhouse":
        return EateryID.BECKER_HOUSE
    elif vendor_eatery_name == "duffield":
        return EateryID.MATTINS_CAFE
    elif vendor_eatery_name == "greendragon":
        return EateryID.GREEN_DRAGON
    elif vendor_eatery_name == "trillium":
        return EateryID.TRILLIUM
    elif vendor_eatery_name == "olinlibecafe":
        return EateryID.LIBE_CAFE
    elif vendor_eatery_name == "carolscafe":
        return EateryID.CAROLS_CAFE
    elif vendor_eatery_name == "statlerterrace":
        return EateryID.TERRACE
    elif vendor_eatery_name == "busstopbagels":
        return EateryID.BUS_STOP_BAGELS
    elif vendor_eatery_name == "kosher":
        return EateryID.ONE_ZERO_FOUR_WEST
    elif vendor_eatery_name == "jansensatbethehouse":
        return EateryID.BETHE_HOUSE
    elif vendor_eatery_name == "keetonhouse":
        return EateryID.KEETON_HOUSE
    elif vendor_eatery_name == "rpme":
        return EateryID.RPCC
    elif vendor_eatery_name == "rosehouse":
        return EateryID.ROSE_HOUSE
    elif vendor_eatery_name == "risley":
        return EateryID.RISLEY
    elif vendor_eatery_name == "frannysft":
        return EateryID.FRANNYS
    elif vendor_eatery_name == "mccormicks":
        return EateryID.MCCORMICKS
    elif vendor_eatery_name == "sage":
        return EateryID.ATRIUM_CAFE
    elif vendor_eatery_name == "straightmarket":
        return EateryID.STRAIGHT_FROM_THE_MARKET
    elif vendor_eatery_name == "crossingscafe":
        return EateryID.CROSSINGS_CAFE
    elif vendor_eatery_name == "okenshields":
        return EateryID.OKENSHIELDS
    elif vendor_eatery_name == "bigredbarn":
        return EateryID.BIG_RED_BARN
    elif vendor_eatery_name == "rustys":
        return EateryID.RUSTYS
    elif vendor_eatery_name == "manncafe":
        return EateryID.MANN_CAFE
    elif vendor_eatery_name == "statlermacs":
        return EateryID.MACS_CAFE
    elif vendor_eatery_name == "morrisondining" or vendor_eatery_name == "morrison":
        return EateryID.MORRISON_DINING
    elif vendor_eatery_name == "novickscafe":
        return EateryID.NOVICKS_CAFE
    elif vendor_eatery_name == "Vet College Cafe":
        return EateryID.VET_CAFE
    else:
        # TODO: Add a slack notif / flag that a wait time location was not recognized
        return None

def internal_id_to_image_url(id: EateryID):
    if id == EateryID.ONE_ZERO_FOUR_WEST:
        return "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/104-West.jpg"
    elif id == EateryID.LIBE_CAFE:
        return "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/Amit-Bhatia-Libe-Cafe.jpg"
    elif id == EateryID.ATRIUM_CAFE:
        return "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/Atrium-Cafe.jpg"
    elif id == EateryID.BEAR_NECESSITIES:
        return "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/Bear-Necessities.jpg"
    elif id == EateryID.BECKER_HOUSE:
        return "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/Becker-House-Dining.jpg"
    elif id == EateryID.BIG_RED_BARN:
        return "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/Big-Red-Barn.jpg"
    elif id == EateryID.BUS_STOP_BAGELS:
        return "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/Bug-Stop-Bagels.jpg"
    elif id == EateryID.CAFE_JENNIE:
        return "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/Cafe-Jennie.jpg"
    elif id == EateryID.COOK_HOUSE:
        return "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/Cook-House-Dining.jpg"
    elif id == EateryID.DAIRY_BAR:
        return "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/Cornell-Dairy-Bar.jpg"
    elif id == EateryID.CROSSINGS_CAFE:
        return "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/Crossings-Cafe.jpg"
    elif id == EateryID.FRANNYS:
        return "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/frannys.jpg"
    elif id == EateryID.GOLDIES_CAFE:
        return "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/Goldies-Cafe.jpg"
    elif id == EateryID.GREEN_DRAGON:
        return "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/Green-Dragon.jpg"
    elif id == EateryID.HOT_DOG_CART:
        return "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/Hot-Dog-Cart.jpg"
    elif id == EateryID.ICE_CREAM_BIKE:
        return "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/icecreamcart.jpg"
    elif id == EateryID.BETHE_HOUSE:
        return "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/Jansens-Dining.jpg"
    elif id == EateryID.JANSENS_MARKET:
        return "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/Jansens-Market.jpg"
    elif id == EateryID.KEETON_HOUSE:
        return "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/Keeton-House-Dining.jpg"
    elif id == EateryID.MANN_CAFE:
        return "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/Mann-Cafe.jpg"
    elif id == EateryID.MARTHAS_CAFE:
        return "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/Marthas-Cafe.jpg"
    elif id == EateryID.MATTINS_CAFE:
        return "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/Mattins-Cafe.jpg"
    elif id == EateryID.MCCORMICKS:
        return "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/mccormicks.jpg"
    elif id == EateryID.NORTH_STAR_DINING:
        return "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/North-Star.jpg"
    elif id == EateryID.OKENSHIELDS:
        return "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/Okenshields.jpg"
    elif id == EateryID.RISLEY:
        return "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/Risley-Dining.jpg"
    elif id == EateryID.ROSE_HOUSE:
        return "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/Rose-House-Dining.jpg"
    elif id == EateryID.RUSTYS:
        return "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/Rustys.jpg"
    elif id == EateryID.STRAIGHT_FROM_THE_MARKET:
        return "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/StraightMarket.jpg"
    elif id == EateryID.TRILLIUM:
        return "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/Trillium.jpg"
    elif id == EateryID.MORRISON_DINING:
        return "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/Morrison-Dining.jpg"
    elif id == EateryID.NOVICKS_CAFE:
        return "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/novicks-cafe.jpg"
    elif id == EateryID.VET_CAFE:
        return "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/vets-cafe.jpg"
    elif id == EateryID.MACS_CAFE:
        return "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/Macs-Cafe.jpg"
    elif id == EateryID.TERRACE:
        return "https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images/Terrace.jpg"
    else:
        print(f"Missing image url for eatery_id {id}")
        return "https://images-prod.healthline.com/hlcmsresource/images/AN_images/health-benefits-of-apples-1296x728-feature.jpg"