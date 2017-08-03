import json
import boto3
from boto3.dynamodb.conditions import Key
import os
from utils import get_response

def delete_all_from_table(id, table):
    db = boto3.resource('dynamodb')
    table = db.Table(table)

    response = table.query(
        KeyConditionExpression=Key('ID').eq(id),
    )

    if 'Items' in response and response['Items']:
        with table.batch_writer() as batch:
            for item in response['Items']:
                batch.delete_item(
                    Key={
                        'ID': id,
                        'timestamp' : item['timestamp']
                    }
                )

def remove_archer(event, context):
    id = json.loads(event['body'])

    db = boto3.resource('dynamodb')
    members_table = db.Table(os.environ['MEMBERS_TABLE'])

    members_table.delete_item(Key={
        'ID' : id
        })

    delete_all_from_table(id, os.environ['FORM_TABLE'])
    delete_all_from_table(id, os.environ['SCORE_TABLE'])

    response_body = {"message" : "Archer successfully deleted"}
    return get_response(response_body)
