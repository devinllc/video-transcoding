# Video Transcoder with AWS S3, SQS, and ECS Integration

This project is an automated video transcoding pipeline using AWS services, including S3, SQS, and ECS. It allows users to upload videos to an S3 bucket, triggers ECS tasks for video transcoding using `ffmpeg`, and generates HLS streams (including resolutions from 360p to 4K). The project is integrated with SQS for message processing and uses AWS Lambda for triggering actions based on new uploads.

## Features

- Supports multiple resolutions for video transcoding (360p, 480p, 720p, 1080p, 2K, and 4K).
- Fully automated video transcoding using ECS Fargate.
- Uploads transcoded video segments and master playlist to S3.
- Automated HLS playlist generation.
- Integrates with SQS to trigger video transcoding when a new video is uploaded to the S3 bucket.

## Prerequisites

To run this project, you need:

- AWS account with IAM access to S3, SQS, ECS, and Lambda.
- Node.js installed on your machine.
- AWS SDK for JavaScript v3 (`@aws-sdk/client-s3`, `@aws-sdk/client-sqs`, `@aws-sdk/client-ecs`).
- ffmpeg and fluent-ffmpeg library installed.
- Docker installed (for ECS tasks).

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/video-transcoder-aws.git
cd video-transcoder-aws
npm install @aws-sdk/client-s3 @aws-sdk/client-sqs @aws-sdk/client-ecs fluent-ffmpeg
BUCKET_NAME=<your-s3-bucket-name>
KEY=<your-s3-object-key>
AWS_ACCESS_KEY_ID=<your-access-key-id>
AWS_SECRET_ACCESS_KEY=<your-secret-access-key>

4. AWS Setup
S3 Bucket

Create an S3 bucket that will store both the raw video files and the transcoded video segments.

SQS Queue

Create an SQS queue to handle the messages for triggering ECS tasks.

ECS Cluster

Create an ECS cluster with Fargate support. Define an ECS task for video transcoding using ffmpeg.

IAM Roles

Ensure your ECS task, S3, and SQS have appropriate IAM roles and policies to allow access between the services.

5. Running the Application
After uploading a video to the S3 bucket, the application will automatically:

Download the video file from the S3 bucket.
Transcode the video into multiple resolutions using ffmpeg.
Upload the transcoded video segments and playlists to the S3 bucket.
Generate and upload the master playlist with references to all transcoded variants.
Manage the process through SQS and ECS tasks.
Example Workflow

Upload a raw video to your S3 bucket.
The video key is sent to an SQS queue.
The ECS task reads the message and downloads the video from S3.
The ECS task transcodes the video into multiple resolutions using ffmpeg.
The transcoded video is uploaded back to the S3 bucket, along with HLS playlists.
The master playlist is generated and uploaded to S3.
License and Royalty Agreement

This software is provided "as is," without warranty of any kind, express or implied. Any use of this software, including commercial use, resale, or distribution, must adhere to the following royalty clause.

Royalty Clause
If this software or any derivative work is used for commercial purposes, including but not limited to selling, licensing, or integrating into a product or service, the user must pay a royalty fee of 5% of gross revenue generated from the use of the software or derivative works. The fee is due on a quarterly basis and should be paid to the following account:

Account Name: UFDev.LLC
Account Number: XXXXXXXXXXX
Bank Name: [Your Bank Name]
Failure to comply with this royalty agreement will result in legal action.

Disclaimer: This royalty agreement is enforceable under international copyright law. If you wish to modify or remove the royalty clause, please contact the author for licensing options.

Contributing
Feel free to submit issues or pull requests for feature improvements or bug fixes.

Contact

For support or inquiries, please contact us at rameshnda09@gmail.com
