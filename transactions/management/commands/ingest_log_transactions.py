# Transaction Histories used to be stored in a giant log file. Ingest that log file into the db

import json
from datetime import datetime
from django.core.management.base import BaseCommand

from transactions.controllers.update_transactions_controller import UpdateTransactionsController
from transactions.models import TransactionHistory

class Command(BaseCommand):
    help = 'Transfers log data from the old storage format (log.txt file) into the TransactionHistory table'

    def handle(self, *args, **options):
        num_deleted = TransactionHistory.objects.all().delete()[0]
        counter = 0
        num_inserted = 0
        with open("static_sources/data.log", "r") as log:
            for line in log:
                try:
                    data = json.loads(line)
                    timestamp = datetime.strptime(data['TIMESTAMP'], '%Y-%m-%d %I:%M:%S %p')
                    if counter % 100 == 1:
                        print(timestamp)
                    if timestamp.year == 2021 and timestamp.month > 7:
                        counter += 1
                        res = UpdateTransactionsController(data).process()
                        if res["success"]:
                            num_inserted += res["result"]["num_inserted"]
                except Exception as e:
                    pass
        print("{} Entries Deleted".format(num_deleted))
        print("{} Entries Inserted".format(num_inserted))