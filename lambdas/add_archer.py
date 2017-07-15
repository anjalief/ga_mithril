import json
import boto3
import os
import uuid

def add_archer(event, context):
    print event
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

    response = \
    {
        "statusCode": 200,
        "headers": {
        "Access-Control-Allow-Origin" : "*", # Required for CORS support to work
        "Access-Control-Allow-Credentials" : True, # Required for cookies, authorization headers with HTTPS
         },
        "body" : json.dumps(response_body)
    }
    return response
