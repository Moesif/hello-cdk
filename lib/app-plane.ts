import { CoreApplicationPlane, DetailType, EventManager, IEventManager, ProvisioningScriptJob, TenantLifecycleScriptJobProps } from '@cdklabs/sbt-aws';
import * as cdk from 'aws-cdk-lib';
import { PolicyDocument } from 'aws-cdk-lib/aws-iam';

export interface AppPlaneProps extends cdk.StackProps {
  eventManager: IEventManager;
}
export class AppPlaneStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: AppPlaneProps) {
    super(scope, id, props);
    const provisioningJobRunnerProps: TenantLifecycleScriptJobProps  = {
      permissions: PolicyDocument.fromJson(
        JSON.parse(`
{
  "Version":"2012-10-17",
  "Statement":[
      {
        "Action":[
            "cloudformation:CreateStack",
            "cloudformation:DescribeStacks",
            "s3:CreateBucket"
        ],
        "Resource":"*",
        "Effect":"Allow"
      }
  ]
}
`)
      ),
      script: `
echo "starting..."

# note that this template.yaml is being created here, but
# it could just as easily be pulled in from an S3 bucket.
cat > template.json << EndOfMessage
{
  "AWSTemplateFormatVersion": "2010-09-09",
  "Resources": { "MyBucket":{ "Type": "AWS::S3::Bucket" }},
  "Outputs": { "S3Bucket": { "Value": { "Ref": "MyBucket" }}}
}
EndOfMessage

echo "tenantId: $tenantId"
echo "tier: $tier"
echo $tenantS3Bucket

export tenantConfig=$(jq --arg SAAS_APP_USERPOOL_ID "MY_SAAS_APP_USERPOOL_ID" \
--arg SAAS_APP_CLIENT_ID "MY_SAAS_APP_CLIENT_ID" \
--arg API_GATEWAY_URL "MY_API_GATEWAY_URL" \
-n '{"userPoolId":$SAAS_APP_USERPOOL_ID,"appClientId":$SAAS_APP_CLIENT_ID,"apiGatewayUrl":$API_GATEWAY_URL}')

echo $tenantConfig

echo "done!"
`,
      postScript: '',
      environmentStringVariablesFromIncomingEvent: ['tenantId', 'tier'],
      environmentVariablesToOutgoingEvent: {
        tenantData: ['tenantS3Bucket', 'tenantConfig', 'someOtherVariable', 'tenantStatus'],
        tenantRegistrationData: ['registrationStatus'],
      },
      scriptEnvironmentVariables: {
        TEST: 'test',
      },
      eventManager: props.eventManager,
    };

    const provisioningJobScript: ProvisioningScriptJob = new ProvisioningScriptJob(
      this,
      'provisioningJobScript',
      provisioningJobRunnerProps
    );

    new CoreApplicationPlane(this, 'CoreApplicationPlane', {
      eventManager: props.eventManager,
      scriptJobs: [provisioningJobScript],
    });
  }
}
