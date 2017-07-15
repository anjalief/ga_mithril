JOAD tracker, written in mithril


REQUIREMENTS:
npm (Node.js)
Python 2.7

DEPLOY INSTRUCTIONS
Back end:
    - cd into ./lambdas
    - run "serverless deploy" to deploy all lambda functions
Front end:
    - if you are deploying from scratch (i.e. deploying lambdas for the first time, you MUST fix the base URL
         - open ./deploy_to_S3/index/html
         - change BASE_URL to the base url provided after the "serverless deploy" run (i.e. adsfasdfasd/ga_joad)
    - recompile the javascript
          - from the home directory (ga_mithril) run "npm build"
    - the files in deploy_to_S3 must be uploaded to the AWS bucket (they are symlinks)


SUMMARY:
    cd ./lambdas
    severless deploy
    cd ..
    emacs deploy_to_S3/index.html (fix URL name)
    npm build
    [deploy deploy_to_S3 files]