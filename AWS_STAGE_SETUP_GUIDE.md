# AWS IVS Stage Setup Guide

This guide will walk you through setting up Amazon IVS Real-Time Streaming (Stage) for ultra-low latency video streaming in your application.

## What is IVS Stage?

Amazon IVS Stage is a feature of IVS Real-Time Streaming that enables participants to exchange audio and video in real time with **latency under 300 milliseconds**. A "stage" is a virtual space where participants can join, publish, and subscribe to media streams.

### Key Differences: Stage vs Channel

| Feature | IVS Stage (Real-Time) | IVS Channel (Low-Latency) |
|---------|----------------------|---------------------------|
| **Latency** | Sub-300ms | 3-5 seconds |
| **Use Case** | Interactive, real-time | Broadcasting to large audiences |
| **Authentication** | Participant tokens | Stream keys |
| **Viewing Method** | Join as participant | HLS playback URL |
| **Ideal For** | Live interactions, auctions, Q&A | Webinars, concerts, sports |
| **Max Viewers** | Up to 10,000 (optimized for <1,000) | Unlimited |
| **Cost Model** | Per participant-hour | Per input hour + data transfer |

## Prerequisites

- An AWS account
- Access to the Amazon IVS Console
- AWS CLI (optional, for automation)

## Step 1: Sign in to AWS Console

1. Go to [https://console.aws.amazon.com/](https://console.aws.amazon.com/)
2. Sign in with your AWS account credentials
3. If you don't have an AWS account, click "Create a new AWS account"

## Step 2: Navigate to Amazon IVS

1. In the AWS Console search bar, type "IVS" or "Interactive Video Service"
2. Click on "Amazon Interactive Video Service" from the results
3. Make sure you're in your desired AWS region (top-right corner)
   - Recommended regions: us-west-2, us-east-1, eu-west-1
   - Note: IVS Stage availability may vary by region

## Step 3: Create a Stage

### Via AWS Console:

1. In the left navigation pane, click **"Stages"**
2. Click the **"Create stage"** button
3. Configure your stage:

   **Stage Configuration:**
   - **Stage name** (optional): Enter a name (e.g., "my-realtime-stage")
     - This is optional but helpful for organizing multiple stages
   - **Tags** (optional): Add tags for organization and cost tracking

4. Click **"Create stage"**
5. Your stage will be created instantly

### Via AWS CLI (Alternative):

```bash
aws ivs-realtime create-stage --name "my-realtime-stage" --region us-west-2
```

This will return JSON with your stage ARN:
```json
{
  "stage": {
    "arn": "arn:aws:ivs:us-west-2:123456789012:stage/abcdEFGhIJkl",
    "name": "my-realtime-stage",
    "activeSessionId": null
  }
}
```

**Save the Stage ARN** - you'll need it to generate participant tokens.

## Step 4: Generate Participant Tokens

Participant tokens authenticate users and define their capabilities (what they can do in the stage).

### Understanding Capabilities:

- **PUBLISH**: Allows the participant to send (publish) their video/audio to the stage
- **SUBSCRIBE**: Allows the participant to receive (watch) video/audio from other participants

### For the Broadcaster (Main User):

The broadcaster needs both **PUBLISH** and **SUBSCRIBE** capabilities.

#### Via AWS Console:

1. Go to your stage's detail page
2. Click **"Create a participant token"**
3. Configure the token:
   - **User ID**: Enter a unique identifier (e.g., "broadcaster-123")
   - **Capabilities**: Select **both** checkboxes:
     - ☑ **Publish**
     - ☑ **Subscribe**
   - **Duration** (optional): Default is 720 minutes (12 hours)
     - Token expires after this duration
     - Range: 1 minute to 720 minutes
   - **Attributes** (optional): Add custom key-value pairs for your application

4. Click **"Create a participant token"**
5. **Copy the token immediately** - it will look like:
   ```
   eyJhbGciOiJFUzM4NCIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MDk4NTY3MjAsIm...
   ```
   
   ⚠️ **Important**: This token will only be shown once! Save it securely.

#### Via AWS CLI:

```bash
aws ivs-realtime create-participant-token \
  --stage-arn "arn:aws:ivs:us-west-2:123456789012:stage/abcdEFGhIJkl" \
  --user-id "broadcaster-123" \
  --capabilities PUBLISH SUBSCRIBE \
  --duration 720 \
  --region us-west-2
```

### For Viewers (Watch-Only Users):

Viewers need only **SUBSCRIBE** capability (they cannot publish).

#### Via AWS Console:

1. Go to your stage's detail page
2. Click **"Create a participant token"**
3. Configure the token:
   - **User ID**: Enter a unique identifier (e.g., "viewer-456")
   - **Capabilities**: Select **only**:
     - ☐ Publish
     - ☑ **Subscribe**
   - **Duration**: Set as needed (default 720 minutes)

4. Click **"Create a participant token"**
5. Copy the token for distribution to the viewer

#### Via AWS CLI:

```bash
aws ivs-realtime create-participant-token \
  --stage-arn "arn:aws:ivs:us-west-2:123456789012:stage/abcdEFGhIJkl" \
  --user-id "viewer-456" \
  --capabilities SUBSCRIBE \
  --duration 720 \
  --region us-west-2
```

### Token Best Practices:

1. **Generate unique tokens per user** - Each participant should have their own token
2. **Use meaningful User IDs** - They help with monitoring and debugging
3. **Set appropriate durations** - Shorter durations are more secure
4. **Regenerate tokens as needed** - Tokens expire and cannot be refreshed
5. **Never share broadcaster tokens** - Keep PUBLISH tokens secure

## Step 5: Use Tokens in Your Application

### For the Broadcaster:

1. Open your application at `http://localhost:3000`
2. Click **"Stage Broadcasting"**
3. Paste the **PUBLISH+SUBSCRIBE token** into the "Participant Token" field
4. Allow camera and microphone access when prompted
5. Select your preferred camera and microphone
6. Click **"Join Stage & Start Publishing"**
7. You should see "🔴 Publishing" status when live

### For Viewers:

1. Open your application (can use multiple browser windows/devices)
2. Click **"Watch Stage"**
3. Paste a **SUBSCRIBE-only token** into the "Participant Token" field
4. Click **"Join Stage"**
5. You should see the broadcaster's video after 1-2 seconds
6. Adjust volume or mute as needed

## Step 6: Monitor Your Stage

### In AWS Console:

1. Go to your stage in the IVS Console
2. Click on the stage name to view details
3. View the **"Active session"** tab for real-time information:
   - Session ID
   - Start time
   - Number of participants
   - Participant list with User IDs

### Metrics Available:

- **Concurrent participants**: Number of users currently in the stage
- **Session duration**: How long the current session has been active
- **Participant events**: Join/leave events with timestamps

### Using CloudWatch:

For advanced monitoring, view metrics in CloudWatch:
1. Go to CloudWatch in AWS Console
2. Navigate to Metrics → IVS
3. View metrics like:
   - `ParticipantConnected`
   - `ParticipantDisconnected`
   - `IngestVideoFrameRate`
   - `IngestAudioLevel`

## Managing Your Stage

### View All Stages:

1. In IVS Console, click **"Stages"** in left navigation
2. See a list of all your stages with:
   - Stage name
   - Stage ARN
   - Active session status
   - Creation date

### Delete a Stage:

1. Select your stage from the list
2. Click **"Delete"**
3. Confirm deletion by typing the stage name
4. Click **"Delete"**

⚠️ **Note**: 
- Deleting a stage is permanent and cannot be undone
- All active participants will be disconnected
- Participant tokens for that stage will become invalid

### End a Session:

You don't need to manually end sessions. They end automatically when:
- All participants leave the stage
- The last participant's token expires

However, you can forcefully disconnect all participants by deleting and recreating the stage.

## Cost Considerations

### Pricing Model:

IVS Real-Time Streaming charges are based on:
1. **Participant hours**: Time each participant is connected
   - Includes both publishers and subscribers
   - Measured per participant
2. **Data transfer**: Standard AWS data transfer rates apply

### Example Pricing (us-west-2, as of 2024):

- **Participant input/output**: ~$0.015 per participant-hour
  - If 1 broadcaster + 10 viewers for 1 hour = 11 participant-hours
  - Cost: 11 × $0.015 = $0.165

### Cost Comparison:

**IVS Stage** (Real-Time):
- Best for: Up to 100 concurrent viewers
- Cost: Linear with viewer count (per participant)

**IVS Channel** (Low-Latency):
- Best for: 100+ concurrent viewers
- Cost: Flat input rate + data transfer (better for large audiences)

### Free Tier:

Check the [AWS Free Tier](https://aws.amazon.com/free/) for current IVS Real-Time offers.

### Cost Optimization Tips:

1. **Set token durations appropriately** - Don't make them longer than needed
2. **Disconnect inactive participants** - Implement idle detection in your app
3. **Use Channels for large audiences** - Switch to IVS Channels if you have 500+ viewers
4. **Set up billing alerts** - Get notified if costs exceed your budget
5. **Monitor participant count** - Track usage in CloudWatch

### Setting Up Billing Alerts:

1. Go to AWS Console → Billing → Budgets
2. Click **"Create budget"**
3. Choose "Cost budget"
4. Set your monthly budget amount
5. Configure alert at 80% and 100%
6. Enter your email for notifications

## Troubleshooting

### "Invalid token" error:

**Possible causes:**
- Token has expired (check duration)
- Token was copied incorrectly (ensure no extra spaces)
- Token is for a different stage
- Stage was deleted

**Solution:**
- Generate a new token from the AWS Console
- Verify the stage ARN matches
- Ensure token hasn't expired

### Cannot join stage:

**Possible causes:**
- Network/firewall blocking WebRTC connections
- Token doesn't have SUBSCRIBE capability
- Browser doesn't support required features

**Solution:**
- Check browser console for errors
- Try a different network
- Use Chrome, Firefox, or Safari (latest versions)
- Verify token capabilities

### No video/audio from broadcaster:

**Possible causes:**
- Broadcaster hasn't started publishing
- Broadcaster token doesn't have PUBLISH capability
- Network issues on broadcaster's side

**Solution:**
- Verify broadcaster shows "Publishing" status
- Check broadcaster's camera/microphone permissions
- Regenerate broadcaster token with PUBLISH capability

### High latency (>1 second):

**Possible causes:**
- Poor network conditions
- High CPU usage on device
- Geographic distance between participants

**Solution:**
- Check internet connection speed
- Close other applications
- Use wired connection instead of WiFi
- Choose AWS region closest to participants

### Token generation fails:

**Possible causes:**
- Insufficient IAM permissions
- Invalid stage ARN
- Region mismatch

**Solution:**
- Verify IAM user has `ivs:CreateParticipantToken` permission
- Double-check stage ARN
- Ensure region matches stage region

## Security Best Practices

### 1. Token Security:

- ✅ **DO**: Generate tokens server-side in production
- ✅ **DO**: Use short token durations (≤ 1 hour)
- ✅ **DO**: Generate unique tokens per user
- ❌ **DON'T**: Hardcode tokens in client code
- ❌ **DON'T**: Share tokens publicly
- ❌ **DON'T**: Reuse tokens across users

### 2. IAM Permissions:

For production, create an IAM role with minimal permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ivs:CreateStage",
        "ivs:GetStage",
        "ivs:ListStages",
        "ivs:CreateParticipantToken",
        "ivs:DeleteStage"
      ],
      "Resource": "arn:aws:ivs:*:*:stage/*"
    }
  ]
}
```

### 3. Backend Token Service:

**Recommended Production Setup:**

Instead of manual token entry, implement a backend API:

```
User → Your Backend API → AWS IVS → Token
     ← Token returned ←
```

Your backend should:
1. Authenticate the user
2. Determine their role (broadcaster or viewer)
3. Call AWS to generate appropriate token
4. Return token to client
5. Log token generation for audit

### 4. Monitoring & Logging:

- Enable CloudTrail for API call logging
- Set up CloudWatch alarms for unusual activity
- Monitor participant count and duration
- Track token generation patterns

### 5. Content Moderation:

Consider implementing:
- User authentication before providing tokens
- Participant limits per stage
- Session recording for review (if needed)
- Ability to remove participants (regenerate stage)

## Advanced Features

### Custom Attributes:

Add custom metadata to participant tokens:

```bash
aws ivs-realtime create-participant-token \
  --stage-arn "arn:aws:ivs:..." \
  --user-id "user-123" \
  --capabilities SUBSCRIBE \
  --attributes displayName="John Doe",role="moderator"
```

These attributes can be accessed in your application to customize the experience.

### Programmatic Token Generation:

Use AWS SDK (JavaScript example):

```javascript
const AWS = require('aws-sdk');
const ivsRealtime = new AWS.IVSRealTime({ region: 'us-west-2' });

const params = {
  stageArn: 'arn:aws:ivs:us-west-2:123456789012:stage/abcd',
  userId: 'user-123',
  capabilities: ['PUBLISH', 'SUBSCRIBE'],
  duration: 60 // 1 hour
};

ivsRealtime.createParticipantToken(params, (err, data) => {
  if (err) console.error(err);
  else console.log(data.participantToken.token);
});
```

### Multiple Broadcasters:

IVS Stage supports up to 12 participants with PUBLISH capability:
- Create separate tokens for each broadcaster
- Each with PUBLISH + SUBSCRIBE capabilities
- Viewers can watch all broadcasters simultaneously

## Next Steps

Once your stage is working:

1. **Test with multiple devices**:
   - Different browsers
   - Mobile devices
   - Various network conditions

2. **Implement error handling**:
   - Token expiration detection
   - Reconnection logic
   - Network quality indicators

3. **Add features**:
   - Chat functionality
   - Participant list
   - Recording (if needed)
   - Screen sharing

4. **Prepare for production**:
   - Implement backend token service
   - Add user authentication
   - Set up monitoring and alerts
   - Load testing

## Support Resources

- [AWS IVS Real-Time Streaming Documentation](https://docs.aws.amazon.com/ivs/latest/RealTimeUserGuide/)
- [AWS IVS Pricing](https://aws.amazon.com/ivs/pricing/)
- [AWS IVS Real-Time Web Demo (GitHub)](https://github.com/aws-samples/amazon-ivs-real-time-web-demo)
- [AWS Support Center](https://console.aws.amazon.com/support/)
- [AWS IVS API Reference](https://docs.aws.amazon.com/ivs/latest/RealTimeAPIReference/)

## Quick Reference Commands

### Create a Stage:
```bash
aws ivs-realtime create-stage --name "my-stage" --region us-west-2
```

### List All Stages:
```bash
aws ivs-realtime list-stages --region us-west-2
```

### Get Stage Details:
```bash
aws ivs-realtime get-stage --arn "arn:aws:ivs:..." --region us-west-2
```

### Create Broadcaster Token:
```bash
aws ivs-realtime create-participant-token \
  --stage-arn "arn:aws:ivs:..." \
  --user-id "broadcaster" \
  --capabilities PUBLISH SUBSCRIBE \
  --region us-west-2
```

### Create Viewer Token:
```bash
aws ivs-realtime create-participant-token \
  --stage-arn "arn:aws:ivs:..." \
  --user-id "viewer" \
  --capabilities SUBSCRIBE \
  --region us-west-2
```

### Delete a Stage:
```bash
aws ivs-realtime delete-stage --arn "arn:aws:ivs:..." --region us-west-2
```

---

**Need Help?** Refer to the main README.md or AWS IVS Real-Time Streaming documentation.

