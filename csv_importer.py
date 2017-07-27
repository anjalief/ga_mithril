import csv
import sys
import argparse
import boto3
import uuid
import datetime, time
import calendar


weekday_map = {
"MON" : "Monday",
"TUES" : "Tuesday",
"WED" : "Wednesday",
"THURS" : "Thursday",
"FRI" : "Friday",
"SAT" : "Saturday",
"SUN" : "Sunday"
};

old_id_to_new_id = {}

def get_byear(date_str):
    try:
        return datetime.datetime.strptime(date_str, "%m/%d/%y").date().year
    except:
        return "0000"

def process_name_file(file_name):
    db = boto3.resource('dynamodb', region_name='us-east-1')
    table = db.Table('ga_joad_members')

    with open(file_name) as csvfile:
        reader = csv.DictReader(csvfile)

        with table.batch_writer() as batch:
            for row in reader:
                basic_info = {}
                new_id = uuid.uuid4()

                old_id_to_new_id[row['StudentID']] = new_id.hex

                basic_info['firstname'] = row['StudentFirstName']
                basic_info['lastname'] = row['StudentLastName']
                basic_info['byear'] = get_byear(row['StudentBirthday'])
                basic_info['joad_day'] = weekday_map[row['Day'].strip()]
                basic_info['hand'] = row['Lefty/Righty']
                basic_info['discipline'] = row['Type']
                if (basic_info['discipline'] == "BasicCompound"):
                    basic_info['discipline'] = "Compound"
                basic_info['owns_equipment'] = (row['Own?'] == "YES")
                if (row['RentalBowName'] != ""):
                    basic_info['equipment_description'] = row['RentalBowName']
                if (row['RentalArrowType'] != ""):
                    if ('equipment_description' in basic_info):
                        basic_info['equipment_description'] += " " + row['RentalArrowType']
                    else:
                        basic_info['equipment_description'] = row['RentalArrowType']
                if (row['RentalBowWeight'] != ""):
                    if ('lb' in row['RentalBowWeight']):
                        basic_info['draw_weight'] = row['RentalBowWeight'].replace('lb', '').replace('s', '')
                    else:
                        if ('equipment_description' in basic_info):
                            basic_info['equipment_description'] += " " + row['RentalBowWeight']
                        else:
                            basic_info['equipment_description'] = row['RentalBowWeight']
                batch.put_item(
                    Item={
                        'ID': new_id.hex,
                        'basic_info' : basic_info,
                        }
                )

def process_score_file(file_name):
    db = boto3.resource('dynamodb', region_name='us-east-1')
    table = db.Table('ga_joad_scores')

    with open(file_name) as csvfile:
        reader = csv.DictReader(csvfile)
        with table.batch_writer() as batch:
            for row in reader:
                id = row['StudentID']
                # some kids have dropped the program
                if not id in old_id_to_new_id:
                    continue
                new_id = old_id_to_new_id[id]
                date_obj = datetime.datetime.strptime(row['Date'], "%m/%d/%y").date()
                # for some reason we have to do this to get utc time
                # NOTE: BE CAREFUL WITH TIMESTAMPS! Might be different if we run this in AWS
                timestamp = calendar.timegm(date_obj.timetuple())
                score_info = {}
                score_info['note'] = row['Description']
                score_info['distance'] = row['Distance'].replace('M', '')
                if (score_info['distance']) == "18":
                    score_info['distance'] = "20"
                if (score_info['distance']) == "9":
                    score_info['distance'] = "10"
                score_info['target_size'] = row['Target Face']
                score_info['is_inner10'] = row['10Ring'] == "Inner"
                score_info['total_score'] = row['Sum']
                score_info['arrow_average'] = row['SingleArrowAverage']
                score_info['is_tournament'] = row['Description'] == "Tournament"
                score_info['number_rounds'] = 10
                score_info['arrows_per_round'] = 3
                score_info['score'] = []
                for i in range(0, 30, 3):
                    round = int(row[str(i+1)]) + int(row[str(i+2)]) + int(row[str(i+3)])
                    score_info['score'].append(round)
                batch.put_item(
                    Item={
                        'ID': new_id,
                        'timestamp' : timestamp,
                        'score_details' : score_info,
                        }
                )


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('-n', '--name_file',
                        help='JOAD old file name sheet')
    parser.add_argument('-s', '--score_file',
                        help='JOAD old file score sheet')

    args = parser.parse_args()

    if args.name_file is None:
        print "ERROR: Must specify name file (-n)"
        return

    process_name_file(args.name_file)

    if args.score_file is not None:
        process_score_file(args.score_file)

if __name__ == "__main__":
    main()
