from api.dfg.nodes.DfgNode import DfgNode
from api.datatype.Eatery import Eatery, EateryID

class ClosedSchedule(DfgNode):

    def __init__(self, eatery_id: EateryID, child: DfgNode, cache):
        self.eatery_id = eatery_id
        self.child = child
        self.cache = cache

    def __call__(self, *args, **kwargs) -> list[Eatery]:
        # ClosedEventSchedule.objects.all()
        return self.child(*args, **kwargs)

    def children(self):
        return [self.child]

    def description(self):
        return "ClosedSchedule"