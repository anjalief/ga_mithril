import os
#import sqlite3
import MySQLdb
from flask import Flask, request, session, g, redirect, url_for, abort, \
     render_template, flash, jsonify
import json
import datetime
import copy

application = Flask(__name__) # create the application instance :)
application.config.from_object(__name__) # load config from this file , flaskr.py

#Load default config and override config from an environment variable
app.config.update(dict(
    DATABASE='ga_mithril_test',
    DB_USER='ga_joad_RW',
    DB_PWD='test',
    SECRET_KEY='development key',
    USERNAME='admin',
    DEBUG=True,
    PASSWORD='default'
))


# app.config.update(dict(
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
#    rv = sqlite3.connect(app.config['DATABASE'])
    cnx = MySQLdb.connect(user=application.config['DB_USER'],
#                                  host=app.config['HOST'],
#                                  port=app.config['PORT'],
                                  passwd=application.config['DB_PWD'],
                                  db=application.config['DATABASE'])
#    rv.row_factory = dict_factory
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

    db = get_db()
    cur = db.cursor(MySQLdb.cursors.DictCursor)

    cur.execute("""select id,
                   firstname,
                   lastname,
                    byear,
                    gender
                    from members order by firstname""")
    archer_list = []
    id_to_archer_details = {}
    for row in cur:
        archer_list.append(row)
        id_to_archer_details[row["id"]] = row

def load_member_details_from_db():
    global id_to_archer_details
    global archer_list

    db = get_db()
    cur = db.cursor(MySQLdb.cursors.DictCursor)
    # grab the most recent entry for each archer
    cur.execute("""SELECT a.id,
                          a.date,
                          a.discipline,
                          a.owns_equipment,
                          a.draw_weight,
                          a.draw_length,
                          a.equipment_description,
                          a.distance,
                          a.joad_day
                        FROM member_details a
                    INNER JOIN
                        (SELECT id, MAX(date) as max_date
                         FROM member_details group by id) b
                    ON a.id = b.id AND a.date = b.max_date
                    """)
    for row in cur:
        archer_detail = id_to_archer_details.get(row["id"], None)
        assert archer_detail is not None
        archer_detail.update(row)

@application.route('/')
def home():
    load_members_from_db()
    load_member_details_from_db()
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
    if request.method == 'GET':
        archer_details = id_to_archer_details.get(int(request.args["id"]), None)
        assert archer_details is not None
        return jsonify(archer_details)
    else:
        data = json.loads(request.data)
        query = """insert into member_details (id,
                                               discipline,
                                               owns_equipment,
                                               draw_weight,
                                               draw_length,
                                               equipment_description,
                                               distance,
                                               joad_day)
                   values (%s, %s, %s, %s, %s, %s, %s, %s)"""
        db = get_db()
        cur = db.cursor()
        if "owns_equipment" in data:
            owns_equipment = (1 if data["owns_equipment"] else 0)
        else:
            owns_equipment = 0
        def get_data(key):
            if key in data:
                return data[key]
            else:
                return ""
        assert "id" in data
        cur.execute(query, (get_data("id"),
                           get_data("discipline"),
                           owns_equipment,
                           get_data("draw_weight"),
                           get_data("draw_length"),
                           get_data("equipment_description"),
                           get_data("distance"),
                           get_data("joad_day")
                           ))
        db.commit()
        load_member_details_from_db()
        return ""

@application.route('/add_archer', methods=['POST'])
def add_archer():
    data = json.loads(request.data)

    query = """insert into members (firstname, lastname, gender, byear)
            values (%s, %s, %s, %s)"""
    db = get_db()
    cur = db.cursor()
    cur.execute(query, (data['firstname'],
                       data['lastname'],
                       data['gender'],
                       data['byear']))
    db.commit()
    # reload members from db
    load_members_from_db()
    return ""

def get_reschedules(date_obj):
    absent_ids = []
    present_ids = []
    db = get_db()
    cur = db.cursor(MySQLdb.cursors.DictCursor)
    query = """select id, from_date, to_date from reschedules where
              from_date=%s OR to_date=%s"""
    cur.execute(query, (date_obj.isoformat(), date_obj.isoformat()))
    for row in cur:
        id = row["id"]
        if row["from_date"] == date_obj:
            absent_ids.append(id)
        elif row["to_date"] == date_obj:
            present_ids.append(id)
        else:
            assert False
    return absent_ids, present_ids

def sql_format_date(date_str):
    date_obj = datetime.datetime.strptime(date_str, "%m/%d/%Y").date()
    return date_obj.isoformat()

def get_attendance_from_db(date_str):
        # first try to pull from attendence table
        db = get_db()
        cur = db.cursor(MySQLdb.cursors.DictCursor)
        query = """select id from attendance where date='""" + date_str + "'"
        cur.execute(query)
        expected_archers = []
        if (cur.rowcount != 0):
            for archer_id in cur:
                id = archer_id["id"]
                archer = id_to_archer_details.get(id, None)
                assert archer is not None
                expected_archers.append(archer)
        return expected_archers

@application.route('/attendance_list', methods=['GET', 'POST'])
def attendance_list():
    if request.method == "GET":
        date_str = request.args.get('date', None)
        assert date_str is not None
        date_str = sql_format_date(date_str)

        expected_archers = get_attendance_from_db(date_str)
        if expected_archers != []:
            return jsonify({"rows" : expected_archers,
                            "set_checked" : True,
                            "message" : "NOTE: Attendance was already entered for this day. Any changes will overwrite" })

        date_obj = datetime.datetime.strptime(date_str, "%Y-%m-%d").date()
        day_of_week = date_obj.strftime("%A")

        absent_ids, present_ids = get_reschedules(date_obj)
        expected_archers = []
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
        selected_date = data["date"]
        formatted_date = sql_format_date(selected_date)

        assert selected_date != "", "Error: missing selected date"
        present_list = []  # list of id numbers
        for row in data["rows"]:
            if "id" in row and row.get("checked", False):
                present_list.append(row["id"])

        # first clear out previous entry
        db = get_db()
        cur = db.cursor()
        delete_query = "delete from attendance where date='" + formatted_date + "'"
        cur.execute(delete_query)
        if present_list == []:
            db.commit()
            return jsonify({"message" : "Marked no archers as present"})
        query = "insert into attendance (date, id) values "
        for id in present_list:
            query += "('" + formatted_date + "'," + str(id) + "), "
        # cut off trailing comma space
        cur.execute(query[:-2])
        db.commit()
        return jsonify({"message" : "Attendance table updated"})


def get_date_or_null(date_str):
    try:
        date = datetime.datetime.strptime(date_str, "%m/%d/%Y")
        return date.isoformat()
    except:
        return None

@application.route('/reschedule', methods=['POST'])
def reschedule():
    data = json.loads(request.data)
    id = data["id"]

    from_date_str = data["from_date"]
    to_date_str = data["to_date"]

    from_date_sql = get_date_or_null(from_date_str)
    to_date_sql = get_date_or_null(to_date_str)

     # TODO: add error checking on client side
    assert to_date_sql is not None or from_date_sql is not None

    db = get_db()
    cur = db.cursor()
    # need to clear out any old reschedules
    if (not from_date_sql is None):
        delete_query = """DELETE FROM reschedules where id=%s and to_date=%s"""
        cur.execute(delete_query, (id, from_date_sql))

    insert_query = """INSERT INTO reschedules (id, from_date, to_date, note)
                            VALUES (%s, %s, %s, %s)"""
    cur.execute(insert_query, (id, from_date_sql, to_date_sql, "\'\'"))
    db.commit()
    return jsonify({})

@application.route('/extra_practice', methods=['POST'])
def extra_practice():
    data = json.loads(request.data)
    id = data["id"]

    date_str = data["date"]
    date_sql = get_date_or_null(date_str)
    # TODO: client side checking
    if date_sql is None:
        return jsonify({})
    else:
        db = get_db()
        cur = db.cursor()
        query = "INSERT INTO attendance (date, id, is_joad_practice) VALUES (%s, %s, %s)"
        cur.execute(query, (date_sql, id, 0))
        db.commit()
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
        db = get_db()
        cur = db.cursor(MySQLdb.cursors.DictCursor)
        query = """select id from attendance where date='""" + date_str + "'"
        cur.execute(query)
        expected_archers = {}
        if (cur.rowcount == 0):
            return expected_archers
        else:
            for archer_id in cur:
                id = archer_id["id"]
                archer = id_to_archer_details.get(id, None)
                assert archer is not None
                expected_archers[id] = copy.deepcopy(archer)

            # pull form for all from db, then filter by attendance
            form_query = """SELECT a.id, a.date, a.category, a.status, a.note, a.instructor FROM form_notes a
                            JOIN (SELECT MAX(date) as max_date, id
                                  FROM form_notes GROUP BY id) f
                            ON (a.date = max_date and a.id = f.id);"""
            cur.execute(form_query)
            for row in cur:
                archer_data = expected_archers.get(row["id"], None)
                if archer_data is None:
                    continue
                row["date"] = row["date"].strftime("%m/%d/%Y")  # for better display
                form_list = archer_data.get("form_list", [])
                form_list.append(row)
                archer_data["form_list"] = form_list

            # first check if we've already entered for this date
            new_form_query = """SELECT id, date, category, status, note, instructor FROM form_notes
                                WHERE date='""" + date_str + """'"""
            cur.execute(new_form_query)
            for row in cur:
                archer_data = expected_archers.get(row["id"], None)
                if archer_data is None:
                    continue
                new_form_list = archer_data.get("new_form_list", [])
                new_form_list.append(row)
                archer_data["new_form_list"] = new_form_list

            # now, prepopulate new_form_list from old form list if we haven't
            # entered notes for this date
            for id in expected_archers:
                archer_data = expected_archers[id]
                if not "new_form_list" in archer_data:
                    form_list = archer_data.get("form_list", None)
                    if form_list == None:
                        continue  # client side takes care of this
                    archer_data["new_form_list"] = create_new_form_list(form_list)
                expected_archers[id] = archer_data
        return expected_archers


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
        date_str = sql_format_date(date_str)

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

        selected_date = sql_format_date(data["date"])
        id_to_form_list = data["id_to_form_list"]
        db = get_db()
        cur = db.cursor()
        delete_query = "delete from form_notes where date='" + selected_date + "'"
        cur.execute(delete_query)

        query = """insert into form_notes
                   (id, date, category, status, note, instructor) values """
        for id in id_to_form_list:
            form_list = id_to_form_list[id]
            if not form_list:  # if empty
                continue
            for data in form_list:
                query += ("('" + str(id) + "', "
                          + "'" + selected_date + "', "
                          + get_data_or_null("category", data) + ", "
                          + get_data_or_null("status", data) + ", "
                          + get_data_or_null("note", data) + ", "
                          + get_data_or_null("instructor", data) + "), ")
        # cut off trailing comma space
        cur.execute(query[:-2])
        db.commit()
        return jsonify({"message" : "Form table updated"})

@application.route('/score_entry', methods=['GET', 'POST'])
def score_entry():
    if request.method == "GET":
        date_str = request.args.get('date', None)
        assert date_str is not None
        date_str = sql_format_date(date_str)
        query = """select
                   date, id, distance, target_size, is_tournament, number_rounds,
                   arrows_per_round, score, total_score, note from scores
                   WHERE date='""" + date_str + """'"""
        db = get_db()
        cur = db.cursor(MySQLdb.cursors.DictCursor)
        cur.execute(query)
        rows = []
        for row in cur:
            new_row = {}
            new_row.update(row)
            new_row['score'] = new_row['score'].split(';')
            archer_detail = id_to_archer_details.get(row["id"], None)
            assert archer_detail is not None
            # TODO: cleaner way to do this?
            for key in archer_detail:
                new_row[key] = archer_detail[key]
            rows.append(new_row);
        message = ""
        if (len(rows) != 0):
            message = "NOTE: Scores previously entered for this date. Changes will overwrite"
        return jsonify({"rows" : rows,
                        "message" : message})
    else:
        data = json.loads(request.data)

        selected_date = sql_format_date(data["date"])
        rows = data["rows"]

        query = """insert into scores
                   (date, id, distance, target_size, is_tournament, number_rounds,
                    arrows_per_round, score, total_score, note) values """
        for row in rows:
            assert 'id' in row
            id = row['id']

            score_per_round = "'" + ";".join(row['score']) + "'"
            query += ("('" + selected_date + "', " +
                      "'" + str(id) + "', " +
                      str(row['distance']) + ", " +
                      get_data_or_null("target_size", row) + ", " +
                      get_sql_bool("is_tournament", row) + ", " +
                      str(row['number_rounds']) + ", " +
                      str(row['arrows_per_round']) + ", " +
                      score_per_round + ", " +
                      str(row['total_score']) + ", " +
                      get_data_or_null("note", row) + "), ")
        db = get_db()
        cur = db.cursor()
        delete_query = "delete from scores where date='" + selected_date + "'"
        cur.execute(delete_query)

        # cut off trailing comma space
        cur.execute(query[:-2])
        db.commit()

        return jsonify({"message" : "Score table updated"})


if __name__ == "__main__":
    application.run()
