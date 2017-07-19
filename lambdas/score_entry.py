import os
import boto3
import json
import datetime, time
from boto3.dynamodb.conditions import Key
import decimal
from utils import get_response

def score_entry(event, context):
    if event['httpMethod'] == "GET":
        date_str = event['queryStringParameters']['date']
        assert date_str is not None
        date_obj = datetime.datetime.strptime(date_str, "%m/%d/%Y").date()
        timestamp = int(time.mktime(date_obj.timetuple()))

        # TODO: can we avoid the scan?
        db = boto3.resource('dynamodb')
        table = db.Table(os.environ['SCORE_TABLE'])

        rows = []

        # can't figure out how to do this with a query
        fe = Key('timestamp').eq(timestamp)

        scan_response = table.scan(
            FilterExpression=fe,
        )

        for i in scan_response['Items']:
            new_row = i['score_details']
            new_row['id'] = i['ID']
            rows.append(new_row)


        while 'LastEvaluatedKey' in scan_response:
            scan_response = table.scan(
            FilterExpression=fe,
            ExclusiveStartKey=scan_response['LastEvaluatedKey']
        )

            for i in scan_response['Items']:
                new_row = i['score_details']
                new_row['id'] = i['ID']
                rows.append(new_row)

        message = ""
        if (len(rows) != 0):
            message = "NOTE: Scores previously entered for this date. Changes will overwrite"
        body = {"message" : message,
                "rows" : rows}
        return get_response(body)
    else:
        assert event['httpMethod'] == "POST"
        data = event['body']

        selected_date = data["date"]
        date_obj = datetime.datetime.strptime(selected_date , "%m/%d/%Y").date()
        timestamp = int(time.mktime(date_obj.timetuple()))

        rows = data["rows"]
        db = boto3.resource('dynamodb')
        table = db.Table(os.environ['SCORE_TABLE'])

        with table.batch_writer() as batch:
            for row in rows:
                # cache now for later display
                arrow_average = decimal.Decimal(row['total_score']) / (int(row['number_rounds']) * int(row['arrows_per_round']))
                row['arrow_average'] = arrow_average
                if not 'is_tournament' in row:
                    row['is_tournament'] = False
                batch.put_item(
                    Item={
                        'ID': row['id'],
                        'timestamp' : timestamp,
                        'score_details': row
                    }
                )
        body = {"message" : "Score table updated"}
        return get_response(body)
