import json
import boto3
import os
from utils import get_response

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
    return get_response("Archer details updated")
