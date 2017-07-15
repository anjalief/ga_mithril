import os
import boto3
import json
import datetime, time
from boto3.dynamodb.conditions import Key
from utils import get_response

def review_form(event, context):
    to_date = datetime.datetime.strptime(event['queryStringParameters']['to_date'], "%m/%d/%Y").date()
    to_timestamp = int(time.mktime(to_date.timetuple()))
    from_date = datetime.datetime.strptime(event['queryStringParameters']['from_date'], "%m/%d/%Y").date()
    from_timestamp = int(time.mktime(from_date.timetuple()))
    id = event['queryStringParameters']['id']
    assert id is not None

    db = boto3.resource('dynamodb')
    table = db.Table(os.environ['FORM_TABLE'])

    response = table.query(
        KeyConditionExpression=Key('ID').eq(id) &
        Key('timestamp').between(from_timestamp, to_timestamp)
    )

    date_to_notes = {}
    if 'Items' in response:
        for item in response['Items']:
            date = datetime.datetime.fromtimestamp(item['timestamp']).strftime("%m/%d/%Y")
            date_to_notes[date] = item['form_list']

    return get_response({"date_to_notes" : date_to_notes})
