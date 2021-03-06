import json
import decimal

class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            if o % 1 > 0:
                return float(o)
            else:
                return int(o)
        return super(DecimalEncoder, self).default(o)

# We don't really need these headers anymore since we're not going through
# an API Gateway, but leave them for now just in case
def get_response(body):
    response = \
        {
            "statusCode": 200,
            "headers": {
            "Access-Control-Allow-Origin" : "*", # Required for CORS support to work
            "Access-Control-Allow-Credentials" : True, # Required for cookies, authorization headers with HTTPS
             }
        }
    response["body"] = json.dumps(body, cls=DecimalEncoder)
    return response
