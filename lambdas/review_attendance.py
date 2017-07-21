import os
import boto3
import json
import datetime
from boto3.dynamodb.conditions import Key
from utils import get_response
from batch_get import batch_get_items

def review_attendance(event, context):
    from_date = datetime.datetime.strptime(event['queryStringParameters']['from_date'], "%m/%d/%Y").date()
    to_date = datetime.datetime.strptime(event['queryStringParameters']['to_date'], "%m/%d/%Y").date()

    id = event['queryStringParameters']['id']
    joad_day = event['queryStringParameters']['joad_day']
    assert id is not None

    # figure out how many days we expected attendance
    # don't feel like figuring out how to do this in
    # javascript so we're just passing joad_day to this function
    expected_attendance = 0

    regular_joad_dates = []
    extra_practice_dates = []

    day_delta = datetime.timedelta(days=1)
    day = from_date
    batch_keys = []
    while day <= to_date:
        day_of_week = day.strftime("%A")
        if day_of_week == joad_day:
            expected_attendance += 1

        batch_keys.append(
            {
            'date' : {
                    "S" : day.strftime("%m/%d/%Y"),
            }
            }
        )
        day += day_delta

    # TODO : batch
    # we're going to batch get these dates. We define a function
    # of what we want to do with the batch gotten items
    # if id is in regular_joad_list or extra_practice, we
    # append accordingly
    def mark_practices(row):
        if id in row['extra_practice_list']:
            extra_practice_dates.append(row['date'])
        if id in row['regular_joad_list']:
            regular_joad_dates.append(row['date'])
    batch_get_items(os.environ['ATTENDANCE_TABLE'], batch_keys, mark_practices)

    # TODO: reschedules?
    if not joad_day:
        expected_attendance = "Cannot calculate expected attendance. JOAD day not set"

    body = \
    {
        "regular_joad_dates" : regular_joad_dates,
        "extra_practice_dates" : extra_practice_dates,
        "expected_attendance" : expected_attendance
    }

    return get_response(body)
