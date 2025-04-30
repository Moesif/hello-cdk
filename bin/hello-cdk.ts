#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ControlPlaneStack } from '../lib/control-plane';
import { AppPlaneStack } from '../lib/app-plane';

const app = new cdk.App();
const cp = new ControlPlaneStack(app, 'ControlPlaneStack', {});
const ap = new AppPlaneStack(app, 'AppPlaneStack', {
  eventManager: cp.eventManager,
});