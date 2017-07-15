import json
import boto3
import os

def extra_practice(event, context):
    data = json.loads(event['body'])
    id = data["id"]

    date_str = data["date"]
    assert date_str != ""
    db = boto3.resource('dynamodb')
    table = db.Table(os.environ['ATTENDANCE_TABLE'])

    # TODO: avoid adding extra practices to the same day multiple times
    table.update_item(
        Key={
            'date' : date_str
            },
        UpdateExpression="ADD extra_practice_list :i",
        ExpressionAttributeValues={
                            ':i': {id}
                            }
        )
    body = {"message" : "Extra practice added"}
    response = \
        {
            "statusCode": 200,
            "headers": {
            "Access-Control-Allow-Origin" : "*", # Required for CORS support to work
            "Access-Control-Allow-Credentials" : True, # Required for cookies, authorization headers with HTTPS
             },
             "body" : json.dumps(body)
        }
    return response
