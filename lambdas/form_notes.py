import os
import boto3
import json
import datetime, time
from boto3.dynamodb.conditions import Key

def create_new_form_list(old_form_list):
    new_form_list = []
    for row in old_form_list:
        if row["status"] == "Completed" or row["status"] == "Dropped":
            continue
        new_row = {}
        new_row["status"] = row["status"]
        new_row["category"] = row["category"]
        new_row["must_enter"] = True
        new_form_list.append(new_row);
    return new_form_list

def get_form_notes_by_attendance(date_str):
        # first try to pull from attendence table
        db = boto3.resource('dynamodb')
        table = db.Table(os.environ['ATTENDANCE_TABLE'])

        response = table.get_item(
            Key={
            'date': date_str,
            })

        id_to_data = {}
        if 'Item' in response:
            if 'regular_joad_list' in response['Item']:
                for archer_id in response['Item']['regular_joad_list']:
                    id_to_data[archer_id] = {}
            if 'extra_practice_list' in response['Item']:
                for archer_id in response['Item']['extra_practice_list']:
                    id_to_data[archer_id] = {}
        # no attendance was entered
        # TODO : msg if JOAD attendance was not entered?
        if id_to_data == {}:
            return id_to_data

        else:
            form_table = db.Table(os.environ['FORM_TABLE'])

            # use timestamps instead of dates so that dyanmo db sorts them
            date_obj = datetime.datetime.strptime(date_str, "%m/%d/%Y").date()
            timestamp = int(time.mktime(date_obj.timetuple()))

            for id in id_to_data:
                response = form_table.query(
                    KeyConditionExpression=Key('ID').eq(id),
                    Limit=1,
                    ScanIndexForward=False
                )

                if 'Items' in response and response['Items']:
                    item = response['Items'][0]
                    id_to_data[id]['form_list'] = item['form_list']
                    id_to_data[id]['most_recent_date'] = \
                        datetime.datetime.fromtimestamp(item['timestamp']).strftime("%m/%d/%Y")

            # check if we've already entered for this date
            # TODO: batch this
            for id in id_to_data:
                response = form_table.get_item(
                    Key={
                        'ID' : id,
                        'timestamp' : timestamp
                        }
                )
                if 'Item' in response and 'form_list' in response['Item']:
                    id_to_data[id]['new_form_list'] = response['Item']['form_list']


            # batch_keys = []
            # for id in id_to_data:
            #     batch_keys.append(
            #     {
            #         'ID' : {
            #             "S" : id,
            #         },
            #         "timestamp" : {
            #         "N" : timestamp
            #         }
            #      }
            # )
            #
            # response = db.batch_get_item(
            # RequestItems=
            #     { "form_notes" :
            #         { "Keys" : batch_keys }
            #     }
            # )
            #
            # if 'Items' in response:
            #     for i in response['Items']:
            #         id = i['ID']
            #         id_to_data[id]['new_form_list'] = i['form_list']
            #         #id_to_data[id]['new_form_list_found'] = True
            #
            # while 'UnprocessedKeys' in response:
            #     response = db.batch_get_item(
            #     RequestItems=
            #         { "form_notes" :
            #             { "Keys": response['UnprocessedKeys'] }
            #         }
            #     )
            #     if 'Items' in response:
            #         for i in response['Items']:
            #             id = i['ID']
            #             id_to_data[id]['new_form_list'] = i['form_list']
            #             #id_to_data[id]['new_form_list_found'] = True

            # now, prepopulate new_form_list from old form list if we haven't
            # entered notes for this date
            for id in id_to_data:
                archer_data = id_to_data[id]
                if not "new_form_list" in archer_data:
                    form_list = archer_data.get("form_list", None)
                    if form_list == None:
                        continue  # client side takes care of this
                    archer_data["new_form_list"] = create_new_form_list(form_list)
                id_to_data[id] = archer_data
        return id_to_data

def form_notes(event, context):
    response = \
        {
            "statusCode": 200,
            "headers": {
            "Access-Control-Allow-Origin" : "*", # Required for CORS support to work
            "Access-Control-Allow-Credentials" : True, # Required for cookies, authorization headers with HTTPS
             }
        }
    if event['httpMethod'] == "GET":
        date_str = event['queryStringParameters']['date']
        assert date_str is not None

        expected_archers = get_form_notes_by_attendance(date_str)
        if expected_archers != {}:
            body = {"id_to_archer" : expected_archers,
                    "message" : "" }
            response["body"] = json.dumps(body)
            return response
        else:
            body = {"id_to_archer" : expected_archers,
                    "message" : "No archers found for date "
                            + date_str + ". Please make sure attendance has been entered"}
            response["body"] = json.dumps(body)
            return response
    else:
        assert event['httpMethod'] == "POST"
        data = json.loads(event['body'])

        selected_date = data["date"]
        date_obj = datetime.datetime.strptime(selected_date, "%m/%d/%Y").date()
        timestamp = int(time.mktime(date_obj.timetuple()))

        id_to_form_list = data["id_to_form_list"]

        db = boto3.resource('dynamodb')
        table = db.Table(os.environ['FORM_TABLE'])

        with table.batch_writer() as batch:
            for id in id_to_form_list:
                if (id_to_form_list[id]):
                    batch.put_item(
                    Item={
                        'ID': id,
                        'timestamp' : timestamp,
                        'form_list': id_to_form_list[id]
                        }
                        )
        body = {"message" : "Form table updated"}
        response["body"] = json.dumps(body)
        return response
