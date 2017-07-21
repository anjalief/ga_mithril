import boto3
from boto3.dynamodb.types import TypeDeserializer

def batch_get_helper(table, batch_keys, func):
    db = boto3.client('dynamodb')
    response = db.batch_get_item(
        RequestItems=
            { table : {
                "Keys" : batch_keys
              }
            }
        )
    deser = TypeDeserializer()
    if 'Responses' in response and table in response['Responses']:
        for row in response['Responses'][table]:
            deserialized = {key:deser.deserialize(row[key]) for key in row}
            func(deserialized)

    # This is SUPER untested, but I also don't expect us to hit it
    while 'UnprocessedKeys' in response and table in response['UnprocessedKeys']:
            response = db.batch_get_item(
                RequestItems=response['UnprocessedKeys']
                )
            if 'Responses' in response and table in response['Responses']:
                for row in response['Responses'][table]:
                    deserialized = {key:deser.deserialize(row[key]) for key in row}
                    func(deserialized)

# takes in table name, correctly formatted batch_keys,
# a dict of form {key : func}, where if "key" exists
# in a result row, func will be performed on row[key]
# func should take a single argument
def batch_get_items(table, batch_keys, func):
    end = min(100, len(batch_keys))
    batch_get_helper(table, batch_keys[0:end], func)

    # can't handle more than 100 items at a time
    # I really don't expect us to hit this anyway
    while (end < len(batch_keys)):
        start = end
        end += 100
        batch_get_helper(table, batch_keys[start:end], func)
