import json
import os
import boto3
from boto3.dynamodb.conditions import Key
from utils import get_response

def get_reschedules(date_str):
    absent_ids = []
    present_ids = []

    db = boto3.resource('dynamodb')
    table = db.Table(os.environ['RESCHEDULES_TABLE'])

    # TODO: can't figure out how to do this with a query
    fe = Key('from_date').eq(date_str) | Key('to_date').eq(date_str)

    response = table.scan(
        FilterExpression=fe,
    )

    for i in response['Items']:
        if i['to_date'] == date_str:
            present_ids.extend(i['id_list'])
        else:
            assert i['from_date'] == date_str
            absent_ids.extend(i['id_list'])

    while 'LastEvaluatedKey' in response:
        response = table.scan(
            FilterExpression=fe,
            ExclusiveStartKey=response['LastEvaluatedKey']
        )
        for i in response['Items']:
            if i['to_date'] == date_str:
                present_ids.extend(i['id_list'])
            else:
                assert i['from_date'] == date_str
                absent_ids.extend(i['id_list'])

    return absent_ids, present_ids

def get_attendance_from_db(date_str):
        # first try to pull from attendence table
        db = boto3.resource('dynamodb')
        table = db.Table(os.environ['ATTENDANCE_TABLE'])

        response = table.get_item(
            Key={
            'date': date_str,
            })

        expected_archers = []
        if 'Item' in response and 'regular_joad_list' in response['Item']:
            expected_archers = response['Item']['regular_joad_list']
        return expected_archers

def attendance(event, context):
    if event['httpMethod'] == "GET":
        date_str = event['queryStringParameters']['date']

        expected_archers = get_attendance_from_db(date_str)
        if expected_archers != []:
            body = {"rows" : expected_archers,
                            "set_checked" : True,
                            "message" : "NOTE: Attendance was already entered for this day. Any changes will overwrite" }
            return get_response(body)

        absent_ids, present_ids = get_reschedules(date_str)
        body = {"absent_ids" : absent_ids,
                "present_ids" : present_ids}
        return get_response(body)
    else:
        assert event['httpMethod'] == "POST"
        data = event['body']
        db = boto3.resource('dynamodb')
        table = db.Table(os.environ['ATTENDANCE_TABLE'])
        table.update_item(
        Key={
            'date': data["date"]
            },
            UpdateExpression="set regular_joad_list = :d",
            ExpressionAttributeValues={
                ':d': data["id_list"]
            })
        body = {"message" : "Attendance table updated"}
        return get_response(body)
