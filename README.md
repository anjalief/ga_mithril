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
          - NOTE: when creating an app, you MUST UNCHECK "Generate client secret"
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


STEPS TO ADD NEW LOCATION
   - Create new User pool (see DEPLOY INSTRUCTIONS)
   - update Model/Config.js with settings for new region
   - Create new lambdas_deploy directory
      - inside new directory, sym link lambda/*.py files
      - create a new serverless.yml file
          - you can model it off the old ones.
            You MUST change "service", "prefix", and user pool settings
      - run "serverless deploy" to setup new API gateway and lambda functions
  - update Model/Config with the URL for your new API Gateway
  - redeploy front end
