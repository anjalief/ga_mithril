JOAD tracker, written in mithril


REQUIREMENTS:
npm (Node.js)
Python 2.7

DEPLOY INSTRUCTIONS (If you are deploying from scratch):
Back end:
    - Set up user pool
    - cd into ./lambdas
    - run "serverless deploy" to deploy all lambda functions. This also create the API Gateway
    - In the API Gateway, go to "Authorizers" --> Create authorizer using your user pool
    - Add User pool authorizer as an authorizer to all lambdas
Front end:
    - Update ./static/Model/Config file with User Pool ID, URLs, etc from back end deploy
    - recompile the javascript
            - from the home directory (ga_mithril) run "npm build"
    - the files in deploy_to_S3 must be uploaded to the AWS bucket (they are symlinks)
