"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_sqs_1 = require("@aws-sdk/client-sqs");
const client_ecs_1 = require("@aws-sdk/client-ecs");
const client = new client_sqs_1.SQSClient({
    region: "ap-south-1",
    credentials: {
        accessKeyId: "AKIAYDWHTCBPEHRVH5NE",
        secretAccessKey: "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",
    },
});
const ecsClient = new client_ecs_1.ECSClient({
    region: "ap-south-1",
    credentials: {
        accessKeyId: "AKIAYDWHTCBPEHRVH5NE",
        secretAccessKey: "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",
    },
});
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        const command = new client_sqs_1.ReceiveMessageCommand({
            QueueUrl: "https://sqs.ap-south-1.amazonaws.com/557690589278/TempRawVideoQueus",
            MaxNumberOfMessages: 1,
            WaitTimeSeconds: 20,
        });
        while (true) {
            const { Messages } = yield client.send(command);
            if (!Messages) {
                console.log('no messgae in quesss');
                continue;
            }
            try {
                for (const messgae of Messages) {
                    const { MessageId, Body } = messgae;
                    console.log('mess reciedv', { MessageId, Body });
                    if (!Body)
                        continue;
                    // validate  and parse the event 
                    const event = JSON.parse(Body);
                    // ignore the test events
                    if ("Service" in messgae && "Event" in messgae) {
                        if (messgae.Event === "s3:TestEvent") {
                            // delete the message from queue 
                            yield client.send(new client_sqs_1.DeleteMessageCommand({
                                QueueUrl: 'https://sqs.ap-south-1.amazonaws.com/557690589278/TempRawVideoQueus',
                                ReceiptHandle: messgae.ReceiptHandle,
                            }));
                            continue;
                        }
                    }
                    for (const record of event.Records) {
                        const { s3 } = record;
                        const { bucket, object: { key }, } = s3;
                        // spinup the container 
                        const runTaskCommand = new client_ecs_1.RunTaskCommand({
                            taskDefinition: 'arn:aws:ecs:ap-south-1:557690589278:task-definition/video-transcoder',
                            cluster: 'arn:aws:ecs:ap-south-1:557690589278:cluster/devrs',
                            launchType: 'FARGATE',
                            networkConfiguration: {
                                awsvpcConfiguration: {
                                    assignPublicIp: 'ENABLED',
                                    securityGroups: ['sg-042bf92ecca8a7008'],
                                    subnets: ['subnet-025a09ae77fbd6e45', 'subnet-0f4a124e2b69c3c75', 'subnet-023ed216f0ccdd26a'],
                                },
                            },
                            overrides: {
                                containerOverrides: [{
                                        name: "video-transcoder", environment: [{
                                                name: 'BUCKET_NAME', value: bucket.name
                                            }, { name: 'KEY', value: key }],
                                    }]
                            }
                        });
                        yield ecsClient.send(runTaskCommand);
                    }
                    // delete the message from queue 
                    yield client.send(new client_sqs_1.DeleteMessageCommand({
                        QueueUrl: 'https://sqs.ap-south-1.amazonaws.com/557690589278/TempRawVideoQueus',
                        ReceiptHandle: messgae.ReceiptHandle,
                    }));
                }
            }
            catch (err) {
                console.log(err);
            }
        }
    });
}
init();
