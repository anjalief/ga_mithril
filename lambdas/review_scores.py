import os
import boto3
import json
import datetime, time
from boto3.dynamodb.conditions import Key
from utils import get_response

def review_scores(event, context):
    to_date = datetime.datetime.strptime(event['queryStringParameters']['to_date'], "%m/%d/%Y").date()
    to_timestamp = int(time.mktime(to_date.timetuple()))
    from_date = datetime.datetime.strptime(event['queryStringParameters']['from_date'], "%m/%d/%Y").date()
    from_timestamp = int(time.mktime(from_date.timetuple()))
    id = event['queryStringParameters']['id']
    assert id is not None

    db = boto3.resource('dynamodb')
    table = db.Table(os.environ['SCORE_TABLE'])

    response = table.query(
        KeyConditionExpression=Key('ID').eq(id) &
        Key('timestamp').between(from_timestamp, to_timestamp)
    )

    score_rows = {}
    if 'Items' in response:
        for item in response['Items']:
            score_details = item['score_details']
            key = str(score_details['distance']) + " " + score_details['target_size']
            if (score_details['is_inner10']):
                key += "(inner 10)"
            entry = score_rows.get(key, {})
            score_details['date'] = datetime.datetime.fromtimestamp(item['timestamp']).isoformat()

            if (entry == {}):
                entry['tournament'] = []
                entry['practice'] = []
            if (score_details['is_tournament']):
                entry['tournament'].append(score_details)
            else:
                entry['practice'].append(score_details)
            score_rows[key] = entry


    body = {'score_rows' : score_rows}
    return get_response(body)
