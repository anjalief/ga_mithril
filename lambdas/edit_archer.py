import json
import boto3
import os

def edit_archer(event, context):
    db = boto3.resource('dynamodb')
    table = db.Table(os.environ['MEMBERS_TABLE'])

    # reformat data
    data = json.loads(event['body'])
    id = data["id"]
    del data["id"]

    if not "owns_equipment" in data:
        data["owns_equipment"] = False

    response = table.update_item(
    Key={
        'ID': id
        },
        UpdateExpression="set basic_info = :d",
        ExpressionAttributeValues={
            ':d': data
        })


    response = \
        {
            "statusCode": 200,
            "headers": {
            "Access-Control-Allow-Origin" : "*", # Required for CORS support to work
            "Access-Control-Allow-Credentials" : True, # Required for cookies, authorization headers with HTTPS
                },
            "body" : json.dumps("Archer details updated")
        }
    return response
