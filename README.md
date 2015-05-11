# tutorial-using-analytics-in-api-proxy-error-flow
This tutorial provides a method for collecting additional analytics information from errors thrown on Apigee proxies utilizing a Javascript Policy and Statistics collector in the error flow.

This tutorial assumes prior knowledge of Apigee proxy development.

## About the files in this tutorial
This tutorial contains an api proxy which can be deployed on Apigee.  It will exist at path /break-this-api if deployed (relative to your organization and environment).  It contains a Statistics Collector, a basix Proxy policy without a route rule, and two Javascript Policies to throw a Javascript error and to extract error global variables during the Fault flow.

## Why would I want additional statistical information on errors in Apigee Proxy flow?

## Fault and Error Globals

## Extracting Error Properties with Javascript

## Collecting Statistics on Errors

## Creating Reports with Error Statistics
