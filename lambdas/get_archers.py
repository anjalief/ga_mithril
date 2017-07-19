import json
import boto3
import os
from utils import get_response

def get_archers(event, context):
    db = boto3.resource('dynamodb')
    table = db.Table(os.environ['MEMBERS_TABLE'])

    id_to_archer_details = {}

    # we need to grab all users from db
    response = table.scan()

    for i in response['Items']:
        obj = i['basic_info']

        # TODO: messy :(
        obj['byear'] = int(obj['byear'])
        id = i["ID"]
        obj['id'] = id
        id_to_archer_details[id] = obj

        while 'LastEvaluatedKey' in response:
            response = table.scan()

            for i in response['Items']:
                obj = i['basic_info']

                # TODO: messy :(
                obj['byear'] = int(obj['byear'])
                id = i["ID"]
                obj['id'] = id
                id_to_archer_details[id] = obj
    return get_response(id_to_archer_details)
