# AWS IVS Setup Guide

This guide will walk you through setting up Amazon Interactive Video Service (IVS) for your streaming application.

## Step 1: Sign in to AWS Console

1. Go to [https://console.aws.amazon.com/](https://console.aws.amazon.com/)
2. Sign in with your AWS account credentials
3. If you don't have an AWS account, click "Create a new AWS account"

## Step 2: Navigate to Amazon IVS

1. In the AWS Console search bar, type "IVS" or "Interactive Video Service"
2. Click on "Amazon Interactive Video Service" from the results
3. Make sure you're in your desired AWS region (top-right corner)
   - Recommended regions: us-west-2, us-east-1, eu-west-1

## Step 3: Create a Channel

1. Click the **"Create channel"** button
2. Configure your channel:

   **Channel Configuration:**
   - **Name**: Enter a name (e.g., "test-streaming-channel")
   - **Channel type**: Choose **"Standard"**
     - Standard: Good for testing, lower cost
     - Basic: Lower quality but cheaper
   
   **Recording Configuration (Optional):**
   - Leave as "None" for testing
   - You can enable recording to S3 later if needed

   **Advanced Settings (Optional):**
   - Leave defaults for testing
   - Latency mode: Low latency (default)

3. Click **"Create channel"**

## Step 4: Note Your Channel Details

After creation, you'll see the channel details page with three critical pieces of information:

### 1. Ingest Server (Ingest endpoint)
```
Example: rtmps://abc123def456.global-contribute.live-video.net:443/app/
```
- This is where you send your video stream
- Copy this entire URL including `rtmps://` and the trailing `/app/`

### 2. Stream Key
```
Example: sk_us-west-2_AbCdEfGhIjKlMnOpQrStUvWxYz
```
- **KEEP THIS SECRET!** Anyone with your stream key can broadcast to your channel
- This acts as a password for your channel
- You can regenerate it if compromised

### 3. Playback URL
```
Example: https://abc123def456.us-west-2.playback.live-video.net/api/video/v1/us-west-2.123456789012.channel.AbCdEfGhIjKl.m3u8
```
- This is the URL viewers use to watch your stream
- This is safe to share publicly
- Ends with `.m3u8` (HLS format)

## Step 5: Copy Credentials

**Save these three values somewhere safe:**

1. Open Notepad or a text editor
2. Copy and paste:
   ```
   Ingest Server: [paste your ingest server]
   Stream Key: [paste your stream key]
   Playback URL: [paste your playback URL]
   ```
3. Save this file for reference

## Step 6: Test Your Channel

### In the Broadcaster Page:
1. Go to `http://localhost:3000/broadcast`
2. Paste your **Ingest Server** into the "Ingest Endpoint" field
3. Paste your **Stream Key** into the "Stream Key" field
4. Click "Start Streaming"
5. Allow camera and microphone access when prompted

### In the Viewer Page:
1. Open another browser or incognito window
2. Go to `http://localhost:3000/watch`
3. Paste your **Playback URL** into the "Playback URL" field
4. Click "Start Watching"
5. You should see your stream after 3-5 seconds

## Understanding Channel States

In the AWS Console, your channel will show different states:

- **Not Connected**: No broadcast is active
- **Live**: A broadcast is currently active
- **Stopped**: Broadcast was stopped

## Monitoring Your Stream

### In AWS Console:
1. Go to your channel in the IVS console
2. Click on the channel name
3. View the "Stream health" tab for metrics:
   - Viewers
   - Bitrate
   - Frame rate
   - Health status

### Stream Metrics Available:
- Concurrent views
- Average bitrate
- Frame rate
- Video resolution

## Managing Your Channel

### Stop All Broadcasts:
1. In AWS Console, go to your channel
2. Click "Stop stream" button
3. This will disconnect any active broadcaster

### Reset Stream Key:
If your stream key is compromised:
1. Go to your channel in AWS Console
2. Click "Regenerate stream key"
3. Update the new key in your broadcaster app

### Delete Channel:
1. Select your channel in the IVS console
2. Click "Delete"
3. Confirm deletion
4. **Note**: This action cannot be undone

## Cost Considerations

### Free Tier (First 12 Months):
- 5 hours of Basic broadcast input/month
- 5 hours of Standard broadcast input/month

### After Free Tier:
Pricing varies by region and channel type. Example (us-west-2):
- Basic: ~$0.30 per hour of input
- Standard: ~$2.00 per hour of input
- Viewer data transfer: Standard AWS data transfer rates

**Important**: Set up billing alerts to avoid unexpected charges!

### Setting Up Billing Alerts:
1. Go to AWS Console > Billing
2. Set up "Billing alerts" in CloudWatch
3. Create alarm for your budget threshold

## Troubleshooting

### "Channel not found" error:
- Verify you're in the correct AWS region
- Check that the channel exists and wasn't deleted

### Cannot start broadcast:
- Verify stream key is correct
- Check if another stream is already active
- Ensure channel is not stopped

### High costs:
- Remember to stop streams when not testing
- Delete channels you're not using
- Monitor usage in AWS Billing dashboard

## Security Best Practices

1. **Never share your Stream Key publicly**
2. **Regenerate Stream Key if compromised**
3. **Use IAM policies to restrict access** (for production)
4. **Enable CloudTrail logging** (for audit logs)
5. **Set up billing alerts** (to monitor costs)
6. **Delete test channels** when done testing

## Advanced: IAM Permissions

If you're setting this up for a team, create an IAM user with IVS permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ivs:CreateChannel",
        "ivs:GetChannel",
        "ivs:ListChannels",
        "ivs:DeleteChannel",
        "ivs:StopStream"
      ],
      "Resource": "*"
    }
  ]
}
```

## Next Steps

Once your channel is working:

1. **Test different scenarios**:
   - Different browsers
   - Different devices
   - Different network conditions

2. **Explore advanced features**:
   - Recording to S3
   - Timed metadata
   - Multiple quality streams

3. **Consider production setup**:
   - Authentication
   - Multiple channels
   - Analytics integration

## Support Resources

- [AWS IVS Documentation](https://docs.aws.amazon.com/ivs/)
- [AWS IVS Pricing](https://aws.amazon.com/ivs/pricing/)
- [AWS Support Center](https://console.aws.amazon.com/support/)
- [AWS IVS GitHub Samples](https://github.com/aws-samples?q=ivs)

## Quick Reference

**Commands for AWS CLI** (optional):

```bash
# List channels
aws ivs list-channels

# Get channel details
aws ivs get-channel --arn <channel-arn>

# Delete channel
aws ivs delete-channel --arn <channel-arn>

# Stop stream
aws ivs stop-stream --channel-arn <channel-arn>
```

---

**Need Help?** Refer to the main README.md or AWS IVS documentation.

