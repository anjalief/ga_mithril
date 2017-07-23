import json
import boto3
import os
import uuid
from utils import get_response

def add_archer(event, context):
    db = boto3.resource('dynamodb')
    table = db.Table(os.environ['MEMBERS_TABLE'])
    new_id = uuid.uuid4()

    # TODO: so messy but dynamodb doesn't like numbers
    data = json.loads(event['body'])
    data['byear'] = int(data['byear'])

    table.put_item(Item={
        'ID' : new_id.hex,
        'basic_info' : data
        })
    response_body = {"message" : "New archer added"}
    return get_response(response_body)
