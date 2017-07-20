JOAD tracker, written in mithril


REQUIREMENTS:
npm (Node.js)
Python 2.7

DEPLOY INSTRUCTIONS
Back end:
    - cd into ./lambdas
    - run "serverless deploy" to deploy all lambda functions
Front end:
    - if you are deploying from scratch:
        - Set up user pool
        - set up id pool
        - add to id pool IAM cfg:
{
    "Effect": "Allow",
    "Action": [
        "lambda:invokefunction"
    ],
    "Resource": [
        "arn:aws:lambda:us-east-1:134985952780:function:lambdas*"
    ]
}
      (this allows users in the id pool to access lambda functions with the prefix "lambda")
         - open ./static/Model/Config.js and set the USER_POOL id and the ID_POOL id
         - recompile the javascript
            - from the home directory (ga_mithril) run "npm build"
    - the files in deploy_to_S3 must be uploaded to the AWS bucket (they are symlinks)
