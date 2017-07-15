import json
import boto3
import os

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

        response = \
        {
            "statusCode": 200,
            "headers": {
            "Access-Control-Allow-Origin" : "*", # Required for CORS support to work
            "Access-Control-Allow-Credentials" : True, # Required for cookies, authorization headers with HTTPS
             },
            "body" : json.dumps(id_to_archer_details)
        }
    return response
