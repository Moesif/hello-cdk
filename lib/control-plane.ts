#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CognitoAuth, ControlPlane, IEventManager } from '@cdklabs/sbt-aws';
import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {MoesifBilling, BillingProviderSlug} from 'sbt-aws-moesif'

export class ControlPlaneStack extends Stack {
  public readonly regApiGatewayUrl: string;
  public readonly eventManager: IEventManager;

  constructor(scope: Construct, id: string, props: any) {
    super(scope, id, props);

    const cognitoAuth = new CognitoAuth(this, 'CognitoAuth', {
      enableAdvancedSecurityMode: false, // only for testing purposes!
      setAPIGWScopes: false, // only for testing purposes!
    });

    const moesifBilling = new MoesifBilling(stack, 'MoesifBilling', {
      moesifApplicationId: '<<Your Moesif Application Id>>',
      moesifManagementAPIKey: '<<Your Moesif Management API Key>>',
      billingProviderSlug: BillingProviderSlug.STRIPE,
      billingProviderSecretKey: '<<Your Billing Provider\'s Secret Such as for Stripe>>'
    }
   ); 

    const controlPlane = new ControlPlane(this, 'ControlPlane', {
      auth: cognitoAuth,
      billing: moesifBilling,
      systemAdminEmail: 'derric+2@moesif.com',
    });
    this.eventManager = controlPlane.eventManager;
    this.regApiGatewayUrl = controlPlane.controlPlaneAPIGatewayUrl;
  }
}

const app = new cdk.App();
const cp = new ControlPlaneStack(app, 'ControlPlaneStack', {});
