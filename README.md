# tutorial-using-analytics-in-api-proxy-error-flow
This tutorial provides a method for collecting additional analytics information from errors thrown on Apigee proxies utilizing a Javascript Policy and Statistics collector in the error flow.

This tutorial assumes prior knowledge of Apigee proxy development.

## About the files in this tutorial
This tutorial contains an api proxy which can be deployed on Apigee.  It will exist at path /break-this-api if deployed (relative to your organization and environment).  It contains a Statistics Collector, a basix Proxy policy without a route rule, and two Javascript Policies to throw a Javascript error and to extract error global variables during the Fault flow.

## Why would I want additional statistical information on errors in Apigee Proxy flow?
While you have no doubt worked very hard developing tests and double-checking the code in your apiproxy, it can be difficult to avoid errors 100% of the time.  Servers fail, clients send bad requests, and code may -- per chance -- fail in unexpected ways.  In some instances, you may receive notice of a failure and be able to react to it.  Often times, your first inkling of an issue may be when you see the following:

            404

If you are able to get more information, it might look like:

            {
                "fault": {
                    "faultstring": "Failed to authenticate API request.",
                    "detail": {
                        "errorcode": "steps.oauth.v2.FailedToAuthenticate"
                    }
                }
            }

This might be more helpful.  But, in the end, fixing the issue will require reacting to reports of an error.  By logging analytics on API error flows, you may be able to identify emerging issues before they become a problem.  

Don't be reactive, be proactive!

## Fault and Error Globals
When entering the error flow, a number of global context variables are set at the proxy level.  These are somewhat accessible to the savvy developer, though interaction may be quirky.

### The `fault` global
Fault cannot be accessed directly in message flow, but when in a fault flow, the following properties can be accessed and recorded.

            # Return the error code/message
            fault.name
            
            # Return the fault type or an empty string
            fault.type
            
            # Return the fault category or an empty string
            fault.category


### The `error` global
The error context is both a string and an object.  If stringified using `JSON.stringify`, we see an object that looks like the following:

            {
                "headers": {
                    "Content-Type": "application/json"
                },
                "content": "{\"fault\":{\"faultstring\":\"Execution of GetVariables failed with error: Exception thrown from JavaScript : ReferenceError: \\\"good\\\" is not defined. (GetVariables_js#5)\",\"detail\":{\"errorcode\":\"steps.javascript.ScriptExecutionFailed\"}}}",
                "status": {
                    "message": "Internal Server Error",
                    "code": "500"
                }
            }
            
If read as a string, it looks something like:

            '500:ScriptExecutionFailed'

## Extracting Error Properties with Javascript
As of this writing, properties of the error global are accessible via Javascript but are not able to be referenced in either ExtractVariables or StatisticsCollector policies with the exception of `error.status.code`. However, they can be referenced and set to a context in a JavaScript policy.  This can be done by treating `error` as an object and using `context.setVariable()` like so:

            context.setVariable("debug.error.content",error.content);
            context.setVariable("debug.error.status.message",error.message);

## Collecting Statistics on Errors
To collect statistics on the errors, we need to perform three actions.

+ First, create a JavaScript policy and file fixating the variables you would like to collect to the context.  In this repo, examples can be found at `/example-proxy/apiproxy/policies/ExtractError.xml` and `/example-proxy/apiproxy/resources/jsc/ExtractError.js`.  This contains the same code as in the section above:

            context.setVariable("debug.error.content",error.content);
            context.setVariable("debug.error.status.message",error.message);

+ Second, create a StatisticsCollector policy like so:

            <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <StatisticsCollector async="false" continueOnError="false" enabled="true" name="__collect-statistics-request__">
                <DisplayName>Collect Statistics Request</DisplayName>
                <Statistics>
                    <Statistic name="FaultName" ref="fault.name" type="String"></Statistic>
                  	<Statistic name="ErrorStatusMessage" ref="debug.error.status.message" type="String"></Statistic>
                  	<Statistic name="ErrorContent" ref="debug.error.content" type="String"></Statistic>
                  	<Statistic name="ErrorStatusCode" ref="error.status.code" type="String"></Statistic>
                </Statistics>
            </StatisticsCollector>

+ Finally, reference those policies in your proxy or target Fault flows:

            <FaultRules>
                <FaultRule name="CustomFaultHandling">
                    <Step>
                        <Name>ExtractError</Name>
                    </Step>
                    <Step>
                        <Name>__collect-statistics-request__</Name>
                    </Step>
                </FaultRule>
            </FaultRules>

## Creating Reports with Error Statistics
These statistics can now be referenced in the `Analytics > Reports` dashboard when creating custom reports.  Depending on the names specified in the StatisticsCollector, each variable can be set as a dimension in the report and be used to display information.

Thus, if we use the proxy in this repo, we can set the following properties as Dimensions in custom reports (based on the names assigned in the above StatisticsCollector):

            faultname
            errorstatusmessage
            errorcontent
            errorstatuscode

## Additional Information
We use the following Apigee policies to accomplish this:

+ [StatisticsCollector](http://apigee.com/docs/api-services/reference/statistics-collector-policy)
+ [Javascript](http://apigee.com/docs/api-services/reference/javascript-policy)
+ [ProxyEndpoint](http://apigee.com/docs/api-services/reference/api-proxy-configuration-reference)
