import os
import boto3
import json
import datetime, time
from boto3.dynamodb.conditions import Key
from utils import get_response
from batch_get import batch_get_items

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

            # this is still kind of wasteful, but we don't have a way to
            # batch queries, and I think we're better off limiting the
            # query than returning all the form notes for someone
            # (i.e. not limiting and skipping the batch gets)
            batch_keys = []
            for id in id_to_data:
                response = form_table.query(
                    KeyConditionExpression=Key('ID').eq(id),
                    ScanIndexForward=False
                )

                if 'Items' in response and response['Items']:
                    newest = response['Items'][0]
                    id_to_data[id]['form_list'] = newest['form_list']
                    id_to_data[id]['most_recent_date'] = \
                        datetime.datetime.fromtimestamp(newest['timestamp']).strftime("%m/%d/%Y")

                # we have to check if we've already entered for this date
                # avoid iterating through id_to_archer again
                batch_keys.append(
                {
                    'ID' : {
                        "S" : id,
                    },
                    'timestamp' : {
                        "N" : str(timestamp)
                    }
                })

            def get_current_list(row):
                if 'form_list' in row:
                    id_to_data[row['ID']]['new_form_list'] = row['form_list']
            batch_get_items(os.environ['FORM_TABLE'], batch_keys, get_current_list)

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
    if event['httpMethod'] == "GET":
        date_str = event['queryStringParameters']['date']
        assert date_str is not None

        expected_archers = get_form_notes_by_attendance(date_str)
        if expected_archers != {}:
            body = {"id_to_archer" : expected_archers,
                    "message" : "" }
            return get_response(body)
        else:
            body = {"id_to_archer" : expected_archers,
                    "message" : "No archers found for date "
                            + date_str + ". Please make sure attendance has been entered"}
            return get_response(body)
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
        return get_response(body)
