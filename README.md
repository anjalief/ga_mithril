JOAD tracker, written in mithril


REQUIREMENTS FOR DEPLOY:
npm (Node.js)
serverless
awscli ("brew install awscli")

REQUIREMENTS FOR RUN:
Python 2.7

DEPLOY INSTRUCTIONS (If you are deploying from scratch):
Back end:
    - Set up user pool
    - cd into ./lambdas
    - set user_pool_id in serverless.yml
    - run "serverless deploy" to deploy all lambda functions. This also create the API Gateway
Front end:
    - Update ./static/Model/Config file with User Pool ID and URLS from back end deploy
    - recompile the javascript
            - from the home directory (ga_mithril) run "npm build"
    - create S3 bucket and enable static web hosting
    - cd into "deploy_to_S3"
           - run "aws s3 sync . s3://mybucket --acl public-read" to upload files to S3 bucket

TO RE-DEPLOY:
   - all the lambdas can be reployed with "serverless deploy"
   - deploy a single function with "serverless deploy function --function myfunction"
   - reploy front end with "aws s3 sync . s3://mybucket --acl public-read"