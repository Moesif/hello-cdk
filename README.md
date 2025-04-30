# Moesif API Monetization for AWS SBT

This project is an AWS SBT module to enable usage-based billing through Moesif.
Moesif can meter usage such as API transactions, compute resources, payload size, and unique users. 
Then, you can invoice and collect payments automatically through popular tools like Stripe, Zuora, or even a custom invoicing solution. 

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template
