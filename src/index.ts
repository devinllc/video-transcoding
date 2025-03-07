import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from "@aws-sdk/client-sqs";
import { ECSClient, RunTaskCommand } from "@aws-sdk/client-ecs";
import type { S3Event } from 'aws-lambda';


const client = new SQSClient({
    region: "ap-south-1",
    credentials: {
        accessKeyId: "AKIAYDWHTCBPEHRVH5NE",
        secretAccessKey: "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",
    },
});

const ecsClient = new ECSClient({
    region: "ap-south-1",
    credentials: {
        accessKeyId: "AKIAYDWHTCBPEHRVH5NE",
        secretAccessKey: "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",
    },
});

async function init() {
    const command = new ReceiveMessageCommand({
        QueueUrl: "https://sqs.ap-south-1.amazonaws.com/557690589278/TempRawVideoQueus",
        MaxNumberOfMessages: 1,
        WaitTimeSeconds: 20,

    });
    while (true) {
        const { Messages } = await client.send(command);
        if (!Messages) {
            console.log('no messgae in quesss');
            continue;
        }

        try {
            for (const messgae of Messages) {
                const { MessageId, Body } = messgae;
                console.log('mess reciedv', { MessageId, Body });

                if (!Body) continue;
                // validate  and parse the event 
                const event = JSON.parse(Body) as S3Event;
                // ignore the test events
                if ("Service" in messgae && "Event" in messgae) {
                    if (messgae.Event === "s3:TestEvent") {
                        // delete the message from queue 

                        await client.send(new DeleteMessageCommand({
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
                    const runTaskCommand = new RunTaskCommand({
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
                    await ecsClient.send(runTaskCommand);
                }


                // delete the message from queue 

                await client.send(new DeleteMessageCommand({
                    QueueUrl: 'https://sqs.ap-south-1.amazonaws.com/557690589278/TempRawVideoQueus',
                    ReceiptHandle: messgae.ReceiptHandle,
                }));
            }
        } catch (err) {
            console.log(err);

        }
    }
}
init();