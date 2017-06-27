import os
import sqlite3
from flask import Flask, request, session, g, redirect, url_for, abort, \
     render_template, flash, jsonify
import json
import datetime
import copy

app = Flask(__name__) # create the application instance :)
app.config.from_object(__name__) # load config from this file , flaskr.py

# Load default config and override config from an environment variable
app.config.update(dict(
    DATABASE=os.path.join(app.root_path, 'ga_mithril.db'),
    SECRET_KEY='development key',
    USERNAME='admin',
    DEBUG=True,
    PASSWORD='default'
))
app.config.from_envvar('FLASKR_SETTINGS', silent=True)

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
    rv = sqlite3.connect(app.config['DATABASE'])
    rv.row_factory = dict_factory
    return rv

def get_db():
    """Opens a new database connection if there is none yet for the
    current application context.
    """
    if not hasattr(g, 'sqlite_db'):
        g.sqlite_db = connect_db()
    return g.sqlite_db

@app.teardown_appcontext
def close_db(error):
    """Closes the database again at the end of the request."""
    if hasattr(g, 'sqlite_db'):
        g.sqlite_db.close()

def load_members_from_db():
    global id_to_archer_details
    global archer_list

    db = get_db()
    cur = db.execute("""select id,
                        firstname,
                        lastname,
                        byear,
                        gender
                        from members order by firstname""")
    archer_list = cur.fetchall()
    id_to_archer_details = {}
    for archer in archer_list:
         id_to_archer_details[archer["id"]] = archer

def load_member_details_from_db():
    global id_to_archer_details

    db = get_db()
    # grab the most recent entry for each archer
    cur = db.execute("""select id,
                        MAX(date),
                        discipline,
                        owns_equipment,
                        draw_weight,
                        draw_length,
                        equipment_description,
                        distance,
                        joad_day
                        from member_details group by id""")
    row_details = cur.fetchall()
    for row in row_details:
        archer_detail = id_to_archer_details.get(row["id"], None)
        assert archer_detail is not None
        archer_detail.update(row)

@app.route('/')
def home():
    load_members_from_db()
    load_member_details_from_db()
    return render_template('index.html')


@app.route('/get_archers', methods=['GET'])
def get_archers():
    global archer_list
    if archer_list == []:
        load_members_from_db()
    return jsonify(archer_list)

@app.route('/edit_archer', methods=['GET', 'POST'])
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
                   values (?, ?, ?, ?, ?, ?, ?, ?)"""
        db = get_db()
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
        db.execute(query, (get_data("id"),
                           get_data("discipline"),
                           owns_equipment,
                           get_data("draw_weight"),
                           get_data("draw_length"),
                           get_data("equipment_description"),
                           get_data("distance"),
                           get_data("joad_day")
                           ))
        db.commit()
        return ""

@app.route('/add_archer', methods=['POST'])
def add_archer():
    data = json.loads(request.data)

    query = """insert into members (firstname, lastname, gender, byear)
            values (?, ?, ?, ?)"""
    db = get_db()
    db.execute(query, (data['firstname'],
                       data['lastname'],
                       data['gender'],
                       data['byear']))
    db.commit()
    # reload members from db
    load_members_from_db()
    return ""

def get_reschedules(date_str):
    absent_ids = []
    present_ids = []
    db = get_db()
    query = """select id, from_date, to_date from reschedules where
              from_date=? OR to_date=?"""
    cur = db.execute(query, (date_str, date_str))
    rows = cur.fetchall()
    for row in rows:
        id = row["id"]
        if row["from_date"] == date_str:
            absent_ids.append(id)
        elif row["to_date"] == date_str:
            present_ids.append(id)
        else:
            assert False
    return absent_ids, present_ids

def get_attendance_from_db(date_str):
        # first try to pull from attendence table
        db = get_db()
        query = """select id from attendance where date='""" + date_str + "'"
        cur = db.execute(query)
        rows = cur.fetchall()
        expected_archers = []
        if (len(rows) != 0):
            for archer_id in rows:
                id = archer_id["id"]
                archer = id_to_archer_details.get(id, None)
                assert archer is not None
                expected_archers.append(archer)
        return expected_archers

@app.route('/attendance_list', methods=['GET', 'POST'])
def attendance_list():
    if request.method == "GET":
        date_str = request.args.get('date', None)
        assert date_str is not None

        expected_archers = get_attendance_from_db(date_str)
        if expected_archers != []:
            return jsonify({"rows" : expected_archers,
                            "set_checked" : True,
                            "message" : "NOTE: Attendance was already entered for this day. Any changes will overwrite" })

        date_obj = datetime.datetime.strptime(date_str, "%m/%d/%Y").date()
        day_of_week = date_obj.strftime("%A")

        absent_ids, present_ids = get_reschedules(date_str)
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
        assert selected_date != "", "Error: missing selected date"
        present_list = []  # list of id numbers
        for row in data["rows"]:
            if "id" in row and row.get("checked", False):
                present_list.append(row["id"])

        # first clear out previous entry
        db = get_db()
        delete_query = "delete from attendance where date='" + selected_date + "'"
        db.execute(delete_query)
        if present_list == []:
            db.commit()
            return jsonify({"message" : "Marked no archers as present"})
        query = "insert into attendance (date, id) values "
        for id in present_list:
            query += "('" + selected_date + "'," + str(id) + "), "
        # cut off trailing comma space
        db.execute(query[:-2])
        db.commit()
        return jsonify({"message" : "Attendance table updated"})


def get_date_or_null(date_str):
    try:
        date = datetime.datetime.strptime(date_str, "%m/%d/%Y")
        return date_str
    except:
        return "NULL"

@app.route('/reschedule', methods=['POST'])
def reschedule():
    data = json.loads(request.data)
    id = data["id"]

    from_date_str = data["from_date"]
    to_date_str = data["to_date"]

    from_date_sql = get_date_or_null(from_date_str)
    to_date_sql = get_date_or_null(to_date_str)

     # TODO: add error checking on client side
    assert to_date_sql != "NULL" or from_date_sql != "NULL"

    db = get_db()
    # need to clear out any old reschedules
    if (not from_date_sql == "NULL"):
        delete_query = """DELETE FROM reschedules where id=? and to_date=?"""
        db.execute(delete_query, (id, from_date_sql))

    insert_query = """INSERT INTO reschedules (id, from_date, to_date, note)
                            VALUES (?, ?, ?, ?)"""
    db.execute(insert_query, (id, from_date_sql, to_date_sql, "\'\'"))
    db.commit()
    return jsonify({})

@app.route('/extra_practice', methods=['POST'])
def extra_practice():
    data = json.loads(request.data)
    id = data["id"]

    date_str = data["date"]
    date_sql = get_date_or_null(date_str)
    # TODO: client side checking
    if date_sql == "NULL":
        return jsonify({})
    else:
        db = get_db()
        query = "INSERT INTO attendance (date, id, is_joad_practice) VALUES (?, ?, ?)"
        db.execute(query, (date_sql, id, 0))
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
        query = """select id from attendance where date='""" + date_str + "'"
        cur = db.execute(query)
        rows = cur.fetchall()
        expected_archers = {}
        if (len(rows) == 0):
            return expected_archers
        else:
            for archer_id in rows:
                id = archer_id["id"]
                archer = id_to_archer_details.get(id, None)
                assert archer is not None
                expected_archers[id] = copy.deepcopy(archer)

            # pull form for all from db, then filter by attendance
            form_query = """SELECT a.id, a.date, a.category, a.status, a.note, a.instructor FROM form_notes a
                            JOIN (SELECT MAX(date) as max_date, id, category, status, note, instructor
                                  FROM form_notes f GROUP BY f.id)f
                            ON (a.date = max_date and a.id = f.id);"""
            cur = db.execute(form_query)
            rows = cur.fetchall()
            for row in rows:
                archer_data = expected_archers.get(row["id"], None)
                if archer_data is None:
                    continue
                form_list = archer_data.get("form_list", [])
                form_list.append(row)
                archer_data["form_list"] = form_list

            # first check if we've already entered for this date
            new_form_query = """SELECT id, date, category, status, note, instructor FROM form_notes
                                WHERE date='""" + date_str + """'"""
            cur = db.execute(new_form_query)
            rows = cur.fetchall()
            for row in rows:
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

@app.route('/form_notes', methods=['GET', 'POST'])
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
        id_to_form_list = data["id_to_form_list"]
        db = get_db()
        delete_query = "delete from form_notes where date='" + selected_date + "'"
        db.execute(delete_query)

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
        db.execute(query[:-2])
        db.commit()
        return jsonify({"message" : "Form table updated"})

@app.route('/score_entry', methods=['GET', 'POST'])
def score_entry():
    if request.method == "GET":
        date_str = request.args.get('date', None)
        assert date_str is not None
        query = """select
                   date, id, distance, target_size, is_tournament, number_rounds,
                   arrows_per_round, score, total_score, note from scores
                   WHERE date='""" + date_str + """'"""
        db = get_db()
        cur = db.execute(query)
        rows = cur.fetchall()
        for row in rows:
            row['score'] = row['score'].split(';')
            archer_detail = id_to_archer_details.get(row["id"], None)
            assert archer_detail is not None
            # TODO: cleaner way to do this?
            for key in archer_detail:
                row[key] = archer_detail[key]
        message = ""
        if (len(rows) != 0):
            message = "NOTE: Scores previously entered for this date. Changes will overwrite"
        return jsonify({"rows" : rows,
                        "message" : message})
    else:
        data = json.loads(request.data)

        selected_date = data["date"]
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
        delete_query = "delete from scores where date='" + selected_date + "'"
        db.execute(delete_query)

        # cut off trailing comma space
        db.execute(query[:-2])
        db.commit()

        return jsonify({"message" : "Score table updated"})


if __name__ == "__main__":
    app.run()
