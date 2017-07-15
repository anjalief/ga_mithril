import os
import boto3
import json
import datetime
from boto3.dynamodb.conditions import Key
from utils import get_response

def review_attendance(event, context):
    from_date = datetime.datetime.strptime(event['queryStringParameters']['from_date'], "%m/%d/%Y").date()
    to_date = datetime.datetime.strptime(event['queryStringParameters']['to_date'], "%m/%d/%Y").date()

    db = boto3.resource('dynamodb')
    table = db.Table(os.environ['ATTENDANCE_TABLE'])

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
    while day <= to_date:
        day_of_week = day.strftime("%A")
        if day_of_week == joad_day:
            expected_attendance += 1

        # TODO : batch
        response = table.get_item(
            Key={
            'date': day.strftime("%m/%d/%Y"),
            })

        if 'Item' in response:
            if 'regular_joad_list' in response['Item'] and \
                id in response['Item']['regular_joad_list']:
                    regular_joad_dates.append(response['Item']['date'])

            if 'extra_practice_list' in response['Item'] and \
                id in response['Item']['extra_practice_list']:
                    extra_practice_dates.append(response['Item']['date'])

        day += day_delta

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
