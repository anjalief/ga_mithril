import boto3

dynamodb = boto3.resource('dynamodb', region_name='us-west-2', endpoint_url="http://localhost:8000")

# table = dynamodb.Table('attendance')
# table.delete()

# table = dynamodb.Table('form_notes')
# table.delete()

# table = dynamodb.create_table(
#     TableName='members',
#     KeySchema=[
#         {
#             'AttributeName': 'ID',
#             'KeyType': 'HASH'  #Partition key
#         }
#     ],
#     AttributeDefinitions=[
#         {
#             'AttributeName': 'ID',
#             'AttributeType': 'S'
#         }
#     ],
#     ProvisionedThroughput={
#         'ReadCapacityUnits': 1,
#         'WriteCapacityUnits': 1
#     }
# )
#
# print "Table status:", table.table_status


# table = dynamodb.create_table(
#     TableName='attendance',
#     KeySchema=[
#         {
#             'AttributeName': 'date',
#             'KeyType': 'HASH'  #Partition key
#         }
#     ],
#     AttributeDefinitions=[
#         {
#             'AttributeName': 'date',
#             'AttributeType': 'S'
#         }
#     ],
#     ProvisionedThroughput={
#         'ReadCapacityUnits': 1,
#         'WriteCapacityUnits': 1
#     }
# )

# table = dynamodb.create_table(
#     TableName='reschedules',
#     KeySchema=[
#         {
#             'AttributeName': 'from_date',
#             'KeyType': 'HASH'  #Partition key
#         },
#         {
#             'AttributeName': 'to_date',
#             'KeyType': 'RANGE'  #Partition key
#         },
#     ],
#     AttributeDefinitions=[
#         {
#             'AttributeName': 'from_date',
#             'AttributeType': 'S'
#         },
#         {
#             'AttributeName': 'to_date',
#             'AttributeType': 'S'
#         }
#     ],
#     ProvisionedThroughput={
#         'ReadCapacityUnits': 1,
#         'WriteCapacityUnits': 1
#     }
# )
#
# print "Table status:", table.table_status

# table = dynamodb.create_table(
#     TableName='form_notes',
#     KeySchema=[
#         {
#             'AttributeName': 'ID',
#             'KeyType': 'HASH'  #Partition key
#         },
#         {
#             'AttributeName': 'timestamp',
#             'KeyType': 'RANGE'  #Partition key
#         },
#     ],
#     AttributeDefinitions=[
#         {
#             'AttributeName': 'ID',
#             'AttributeType': 'S'
#         },
#         {
#             'AttributeName': 'timestamp',
#             'AttributeType': 'N'
#         }
#     ],
#     ProvisionedThroughput={
#         'ReadCapacityUnits': 1,
#         'WriteCapacityUnits': 1
#     }
# )

table = dynamodb.create_table(
    TableName='scores',
    KeySchema=[
        {
            'AttributeName': 'ID',
            'KeyType': 'HASH'  #Partition key
        },
        {
            'AttributeName': 'timestamp',
            'KeyType': 'RANGE'  #Partition key
        },
    ],
    AttributeDefinitions=[
        {
            'AttributeName': 'ID',
            'AttributeType': 'S'
        },
        {
            'AttributeName': 'timestamp',
            'AttributeType': 'N'
        }
    ],
    ProvisionedThroughput={
        'ReadCapacityUnits': 1,
        'WriteCapacityUnits': 1
    }
)

print "Table status:", table.table_status
