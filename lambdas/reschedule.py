import boto3
import datetime
import json
import os
from boto3.dynamodb.conditions import Key
from utils import get_response

def get_date_or_null(date_str):
    try:
        date = datetime.datetime.strptime(date_str, "%m/%d/%Y")
        return date_str
    except:
        return "NULL"

def reschedule(event, context):
    data = json.loads(event['body'])
    id = data["id"]

    from_date_str = data["from_date"]
    to_date_str = data["to_date"]

    from_date_str = get_date_or_null(from_date_str)
    to_date_str = get_date_or_null(to_date_str)

     # TODO: add error checking on client side
    assert to_date_str != "NULL" or from_date_str != "NULL"

    # TODO: we might be making too many NULLs. Also should clear out super old stuff
    db = boto3.resource('dynamodb')
    table = db.Table(os.environ['RESCHEDULES_TABLE'])

    # need to clear out any old reschedules
    if from_date_str != "NULL":
        response = table.query(
        KeyConditionExpression=Key('from_date').eq(from_date_str)
        )
        for i in response['Items']:
            if id in i['id_list']:
                new_id_list = i['id_list']
                new_id_list.remove(id)
                # dynodb doesn't like empty sets
                if (new_id_list):
                    table.update_item(
                        Key={
                            'from_date' : i['from_date'],
                            'to_date' : i['to_date']
                            },
                            UpdateExpression="set id_list = :d",
                            ExpressionAttributeValues={
                            ':d': new_id_list
                            }
                            )
                else:
                    table.delete_item(
                        Key={
                            'from_date' : i['from_date'],
                            'to_date' : i['to_date']
                        })

    # now we can add reschedule
    table.update_item(
        Key={
            'from_date' : from_date_str,
            'to_date' : to_date_str
            },
        UpdateExpression="ADD id_list :i",
        ExpressionAttributeValues={
                            ':i': {id}
                            }
        )
    body = {"message" : "Reschedule Added"}
    return get_response(body)
