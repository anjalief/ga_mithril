import os
from flask import Flask, request, session, g, redirect, url_for, abort, \
     render_template, flash, jsonify
import json
import datetime, time
import copy
import uuid
import boto3
from boto3.dynamodb.conditions import Key
import decimal

application = Flask(__name__) # create the application instance :)
application.config.from_object(__name__) # load config from this file , flaskr.py

# Load default config and override config from an environment variable
application.config.update(dict(
    DATABASE='ga_mithril_test',
    DB_USER='ga_joad_RW',
    DB_PWD='test',
    SECRET_KEY='development key',
    USERNAME='admin',
    DEBUG=True,
    PASSWORD='default'
))


# application.config.update(dict(
#     DATABASE=os.environ['RDS_DB_NAME'],
#     DB_USER=os.environ['RDS_USERNAME'],
#     DB_PWD=os.environ['RDS_PASSWORD'],
#     HOST=os.environ['RDS_HOSTNAME'],
#     PORT=os.environ['RDS_PORT'],
#     SECRET_KEY='development key',
#     USERNAME='admin',
#     DEBUG=True,
#     PASSWORD='default'
# ))

application.config.from_envvar('FLASKR_SETTINGS', silent=True)

# Cached VARIABLES
id_to_archer_details = {}
archer_list = []

def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

def connect_db():

    """Connects to the specific database."""
#    cnx = dynamodb = boto3.resource('dynamodb', region_name='us-west-2', endpoint_url="http://localhost:8000")

    cnx = MySQLdb.connect(user=application.config['DB_USER'],
#                                  host=application.config['HOST'],
#                                  port=int(application.config['PORT']),
                                  passwd=application.config['DB_PWD'],
                                  db=application.config['DATABASE'])
    return cnx

def get_db():
    """Opens a new database connection if there is none yet for the
    current application context.
    """
    if not hasattr(g, 'sql_db'):
        g.sql_db = connect_db()
    return g.sql_db

@application.teardown_appcontext
def close_db(error):
    """Closes the database again at the end of the request."""
    if hasattr(g, 'sqlite_db'):
        g.sqlite_db.close()

def load_members_from_db():
    global id_to_archer_details
    global archer_list

    db = dynamodb = boto3.resource('dynamodb', region_name='us-west-2', endpoint_url="http://localhost:8000")

    table = db.Table('members')

    archer_list = []
    id_to_archer_details = {}

    # we need to grab all users from db
    response = table.scan()

    for i in response['Items']:
        obj = i['basic_info']

        # TODO: messy :(
        obj['byear'] = int(obj['byear'])
        id = i["ID"]
        obj['id'] = id
        archer_list.append(obj)
        id_to_archer_details[id] = obj

        while 'LastEvaluatedKey' in response:
            response = table.scan()

            for i in response['Items']:
                obj = i['basic_info']
                int_id = int(i["ID"])
                obj['id'] = int_id
                archer_list.append(obj)
                id_to_archer_details[int_id] = obj

@application.route('/')
def home():
    load_members_from_db()
    return render_template('index.html')


@application.route('/get_archers', methods=['GET'])
def get_archers():
    global archer_list
    if archer_list == []:
        load_members_from_db()
    return jsonify(archer_list)

@application.route('/edit_archer', methods=['GET', 'POST'])
def edit_archer():
    # find existing details for archer and return json
    # TODO : should be able to get rid of this call
    if request.method == 'GET':
        archer_details = id_to_archer_details.get(request.args["id"], None)
        assert archer_details is not None
        return jsonify(archer_details)
    else:
        dynamodb = boto3.resource('dynamodb', region_name='us-west-2', endpoint_url="http://localhost:8000")
        table = dynamodb.Table('members')

        # reformat data
        data = json.loads(request.data)
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
        return ""

@application.route('/add_archer', methods=['POST'])
def add_archer():
    db = dynamodb = boto3.resource('dynamodb', region_name='us-west-2', endpoint_url="http://localhost:8000")
    table = db.Table('members')
    new_id = uuid.uuid4()

    # TODO: so messy but dynamodb doesn't like numbers
    data = json.loads(request.data)
    data['byear'] = int(data['byear'])

    table.put_item(Item={
        'ID' : new_id.hex,
        'basic_info' : data
        })
    return ""

def get_reschedules(date_str):
    absent_ids = []
    present_ids = []

    db = dynamodb = boto3.resource('dynamodb', region_name='us-west-2', endpoint_url="http://localhost:8000")
    table = db.Table("reschedules")

    # can't figure out how to do this with a query
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
                present_ids.append(i['id_list'])
            else:
                assert i['from_date'] == date_str
                absent_ids.append(i['id_list'])

    return absent_ids, present_ids

def sql_format_date(date_str):
    date_obj = datetime.datetime.strptime(date_str, "%m/%d/%Y").date()
    return date_obj.isoformat()

def get_attendance_from_db(date_str):
        # first try to pull from attendence table
        db = dynamodb = boto3.resource('dynamodb', region_name='us-west-2', endpoint_url="http://localhost:8000")
        table = db.Table("attendance")

        response = table.get_item(
            Key={
            'date': date_str,
            })

        expected_archers = []
        if 'Item' in response and 'regular_joad_list' in response['Item']:
            for archer_id in response['Item']['regular_joad_list']:
                archer = id_to_archer_details.get(archer_id, None)
                assert archer is not None
                expected_archers.append(archer)
        return expected_archers

@application.route('/attendance_list', methods=['GET', 'POST'])
def attendance_list():
    if request.method == "GET":
        date_str = request.args.get('date', None)

        expected_archers = get_attendance_from_db(date_str)
        if expected_archers != []:
            return jsonify({"rows" : expected_archers,
                            "set_checked" : True,
                            "message" : "NOTE: Attendance was already entered for this day. Any changes will overwrite" })

        absent_ids, present_ids = get_reschedules(date_str)
        expected_archers = []

        date_obj = datetime.datetime.strptime(date_str, "%m/%d/%Y").date()
        day_of_week = date_obj.strftime("%A")

        for archer_id in id_to_archer_details:
            if archer_id in absent_ids:
                continue
            archer = id_to_archer_details[archer_id]
            joad_day = archer.get("joad_day", None)
            if joad_day == day_of_week or archer_id in present_ids:
                expected_archers.append(archer)
        return jsonify({"rows" : expected_archers, "show_warning" : False})
    else:
        assert request.method == "POST"
        data = json.loads(request.data)
        db = dynamodb = boto3.resource('dynamodb', region_name='us-west-2', endpoint_url="http://localhost:8000")
        table = db.Table("attendance")
        response = table.update_item(
        Key={
            'date': data["date"]
            },
            UpdateExpression="set regular_joad_list = :d",
            ExpressionAttributeValues={
                ':d': data["id_list"]
            })
        return jsonify({"message" : "Attendance table updated"})

def get_date_or_null(date_str):
    try:
        date = datetime.datetime.strptime(date_str, "%m/%d/%Y")
        return date_str
    except:
        return "NULL"

@application.route('/reschedule', methods=['POST'])
def reschedule():
    data = json.loads(request.data)
    id = data["id"]

    from_date_str = data["from_date"]
    to_date_str = data["to_date"]

    from_date_str = get_date_or_null(from_date_str)
    to_date_str = get_date_or_null(to_date_str)

     # TODO: add error checking on client side
    assert to_date_str != "NULL" or from_date_str != "NULL"

    # TODO: we might be making too many NULLs. Also should clear out super old stuff
    db = boto3.resource('dynamodb', region_name='us-west-2', endpoint_url="http://localhost:8000")
    table = db.Table("reschedules")

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
    return jsonify({})

@application.route('/extra_practice', methods=['POST'])
def extra_practice():
    data = json.loads(request.data)
    id = data["id"]

    date_str = data["date"]
    assert date_str != ""
    db = boto3.resource('dynamodb', region_name='us-west-2', endpoint_url="http://localhost:8000")
    table = db.Table('attendance')

    table.update_item(
        Key={
            'date' : date_str
            },
        UpdateExpression="ADD extra_practice_list :i",
        ExpressionAttributeValues={
                            ':i': {id}
                            }
        )
    return jsonify({})

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
        db = dynamodb = boto3.resource('dynamodb', region_name='us-west-2', endpoint_url="http://localhost:8000")
        table = db.Table("attendance")

        response = table.get_item(
            Key={
            'date': date_str,
            })

        id_to_data = {}
        if 'Item' in response:
            if 'regular_joad_list' in response['Item']:
                for archer_id in response['Item']['regular_joad_list']:
                    archer = id_to_archer_details.get(archer_id, None)
                    assert archer is not None
                    id_to_data[archer_id] = copy.deepcopy(archer)
            if 'extra_practice_list' in response['Item']:
                for archer_id in response['Item']['regular_joad_list']:
                    archer = id_to_archer_details.get(archer_id, None)
                    assert archer is not None
                    id_to_data[archer_id] = copy.deepcopy(archer)
        # no attendance was entered
        # TODO : msg if JOAD attendance was not entered?
        if id_to_data == {}:
            return id_to_data

        else:
            form_table = db.Table("form_notes")

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
            #         {
            #             "ID" : id,
            #             "timestamp" : timestamp
            #             }
            #     )
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
            #         id_to_data[id]['new_form_list_found'] = True
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
            #             id_to_data[id]['new_form_list_found'] = True

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


def get_data_or_null(key, data):
    if key in data and data[key] is not None:
        return "'" + data[key] + "'"
    else:
        return "NULL"

def get_sql_bool(key, data):
    if key in data:
            return ("1" if data[key] else "0")
    else:
        return "0"

@application.route('/form_notes', methods=['GET', 'POST'])
def form_notes():
    if request.method == "GET":
        date_str = request.args.get('date', None)
        assert date_str is not None

        expected_archers = get_form_notes_by_attendance(date_str)
        if expected_archers != {}:
            return jsonify({"id_to_archer" : expected_archers,
                            "message" : "" })
        else:
            return jsonify({"id_to_archer" : expected_archers,
                            "message" : "No archers found for date "
                            + date_str + ". Please make sure attendance has been entered"})
    # POST
    else:
        data = json.loads(request.data)

        selected_date = data["date"]
        date_obj = datetime.datetime.strptime(selected_date, "%m/%d/%Y").date()
        timestamp = int(time.mktime(date_obj.timetuple()))

        id_to_form_list = data["id_to_form_list"]

        db = boto3.resource('dynamodb', region_name='us-west-2', endpoint_url="http://localhost:8000")
        table = db.Table("form_notes")

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
        return jsonify({"message" : "Form table updated"})

# Helper class to convert a DynamoDB item to JSON.
class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            if o % 1 > 0:
                return float(o)
            else:
                return int(o)
        return super(DecimalEncoder, self).default(o)

@application.route('/score_entry', methods=['GET', 'POST'])
def score_entry():
    if request.method == "GET":
        date_str = request.args.get('date', None)
        assert date_str is not None
        date_obj = datetime.datetime.strptime(date_str, "%m/%d/%Y").date()
        timestamp = int(time.mktime(date_obj.timetuple()))

        # TODO: batch this
        db = boto3.resource('dynamodb', region_name='us-west-2', endpoint_url="http://localhost:8000")
        table = db.Table("scores")

        rows = []
        for id in id_to_archer_details:
            response = table.get_item(
                    Key={
                        'ID' : id,
                        'timestamp' : timestamp
                        }
                )
            if 'Item' in response:
                new_row = response['Item']['score_details']
                new_row.update(id_to_archer_details[id])
                rows.append(new_row)

        message = ""
        if (len(rows) != 0):
            message = "NOTE: Scores previously entered for this date. Changes will overwrite"
        return json.dumps({"rows" : rows,
                        "message" : message},
                        cls=DecimalEncoder)
    else:
        data = json.loads(request.data)

        selected_date = data["date"]
        date_obj = datetime.datetime.strptime(selected_date , "%m/%d/%Y").date()
        timestamp = int(time.mktime(date_obj.timetuple()))

        rows = data["rows"]
        db = boto3.resource('dynamodb', region_name='us-west-2', endpoint_url="http://localhost:8000")
        table = db.Table("scores")

        with table.batch_writer() as batch:
            for row in rows:
                # cache now for later display
                arrow_average = decimal.Decimal(row['total_score']) / (int(row['number_rounds']) * int(row['arrows_per_round']))
                row['arrow_average'] = arrow_average
                batch.put_item(
                    Item={
                        'ID': row['id'],
                        'timestamp' : timestamp,
                        'score_details': row
                    }
                )
        return jsonify({"message" : "Score table updated"})

@application.route('/review_attendance', methods=['GET'])
def review_attendance():
    assert request.method == "GET"
    from_date = datetime.datetime.strptime(request.args['from_date'], "%m/%d/%Y").date()
    to_date = datetime.datetime.strptime(request.args['to_date'], "%m/%d/%Y").date()

    db = dynamodb = boto3.resource('dynamodb', region_name='us-west-2', endpoint_url="http://localhost:8000")
    table = db.Table('attendance')

    id = request.args.get('id', None)
    assert id is not None

    # figure out how many days we expected attendance
    archer = id_to_archer_details.get(id, None)
    assert archer is not None
    joad_day = archer.get("joad_day", None)
    expected_attendance = 0

    regular_joad_dates = []
    extra_practice_dates = []

    day_delta = datetime.timedelta(days=1)
    day = from_date
    while day <= to_date:
        day_of_week = day.strftime("%A")
        if day_of_week == joad_day:
            expected_attendance += 1

        # TODO : batch
        response = table.get_item(
            Key={
            'date': day.strftime("%m/%d/%Y"),
            })

        if 'Item' in response:
            if 'regular_joad_list' in response['Item'] and \
                id in response['Item']['regular_joad_list']:
                    regular_joad_dates.append(response['Item']['date'])

            if 'extra_practice_list' in response['Item'] and \
                id in response['Item']['extra_practice_list']:
                    extra_practice_dates.append(response['Item']['date'])

        day += day_delta

    # TODO: reschedules?

    return jsonify({"regular_joad_dates" : regular_joad_dates,
                    "extra_practice_dates" : extra_practice_dates,
                    "expected_attendance" : expected_attendance})

@application.route('/review_score', methods=['GET'])
def review_scores():
    assert request.method == "GET"
    to_date = datetime.datetime.strptime(request.args['to_date'], "%m/%d/%Y").date()
    to_timestamp = int(time.mktime(to_date.timetuple()))
    from_date = datetime.datetime.strptime(request.args['from_date'], "%m/%d/%Y").date()
    from_timestamp = int(time.mktime(from_date.timetuple()))
    id = request.args.get('id', None)
    assert id is not None

    db = dynamodb = boto3.resource('dynamodb', region_name='us-west-2', endpoint_url="http://localhost:8000")
    table = db.Table('scores')

    response = table.query(
        KeyConditionExpression=Key('ID').eq(id) &
        Key('timestamp').between(from_timestamp, to_timestamp)
    )

    score_rows = {}
    if 'Items' in response:
        for item in response['Items']:
            score_details = item['score_details']
            key = str(score_details['distance']) + " " + score_details['target_size']
            entry = score_rows.get(key, {})
            score_details['date'] = datetime.datetime.fromtimestamp(item['timestamp']).isoformat()

            if (entry == {}):
                entry['tournament'] = []
                entry['practice'] = []
            if (score_details['is_tournament']):
                entry['tournament'].append(score_details)
            else:
                entry['practice'].append(score_details)
            score_rows[key] = entry
    return json.dumps({'score_rows' : score_rows}, cls=DecimalEncoder)

@application.route('/review_form', methods=['GET'])
def review_form():

    assert request.method == "GET"
    to_date = datetime.datetime.strptime(request.args['to_date'], "%m/%d/%Y").date()
    to_timestamp = int(time.mktime(to_date.timetuple()))
    from_date = datetime.datetime.strptime(request.args['from_date'], "%m/%d/%Y").date()
    from_timestamp = int(time.mktime(from_date.timetuple()))
    id = request.args.get('id', None)
    assert id is not None

    db = dynamodb = boto3.resource('dynamodb', region_name='us-west-2', endpoint_url="http://localhost:8000")
    table = db.Table('form_notes')


    response = table.query(
        KeyConditionExpression=Key('ID').eq(id) &
        Key('timestamp').between(from_timestamp, to_timestamp)
    )

    date_to_notes = {}
    if 'Items' in response:
        for item in response['Items']:
            date = datetime.datetime.fromtimestamp(item['timestamp']).strftime("%m/%d/%Y")
            date_to_notes[date] = item['form_list']

    return jsonify({"date_to_notes" : date_to_notes})


if __name__ == "__main__":
    application.run()
