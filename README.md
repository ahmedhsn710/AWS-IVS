# AWS IVS Streaming App

A Next.js application that enables browser-based live streaming using Amazon Interactive Video Service (IVS). This app supports both **Real-Time Streaming (Stage)** with sub-300ms latency and **Low-Latency Streaming (Channel)** for large-scale broadcasting.

## Features

### 🚀 Real-Time Streaming (IVS Stage)
- ⚡ **Ultra-Low Latency**: Sub-300ms latency for real-time interactions
- 🎭 **Interactive Broadcasting**: One broadcaster, multiple viewers in real-time
- 🎫 **Token-Based Authentication**: Secure participant tokens with role-based capabilities
- 🔄 **WebRTC-Based**: Direct peer-to-peer style streaming

### 📺 Low-Latency Streaming (IVS Channel)
- 🎥 **Browser-based Broadcasting**: Stream directly from your webcam and microphone
- 📡 **HLS Playback**: Watch live streams with 3-5 second latency
- 🎛️ **Device Selection**: Choose from available cameras and microphones
- 📊 **Scalable**: Broadcast to unlimited viewers

### 🎨 Common Features
- 🎨 **Modern UI**: Clean, responsive interface built with Tailwind CSS
- ⚡ **Real-time Status**: Monitor broadcast and playback status
- 🔧 **Easy Configuration**: Simple setup with AWS IVS credentials
- 📱 **Cross-Platform**: Works on desktop and mobile browsers

## When to Use Which?

| Feature | IVS Stage (Real-Time) | IVS Channel (Low-Latency) |
|---------|----------------------|---------------------------|
| **Latency** | Sub-300ms | 3-5 seconds |
| **Best For** | Interactive experiences, Q&A, live auctions | Webinars, concerts, large broadcasts |
| **Max Viewers** | Up to 10,000 (optimal <1,000) | Unlimited |
| **Cost Model** | Per participant-hour | Per input hour + data transfer |
| **Use When** | Real-time interaction is critical | Broadcasting to large audiences |

## Prerequisites

- Node.js 18+ installed
- An AWS account
- Depending on your use case:
  - **For Stage**: An AWS IVS Stage with participant tokens
  - **For Channel**: An AWS IVS Channel with credentials

## Getting Started

### 1. Installation

Clone this repository and install dependencies:

```bash
npm install
```

### 2. Choose Your Streaming Method

#### Option A: Real-Time Streaming (IVS Stage)

**Setup Steps:**
1. Create an AWS IVS Stage in the AWS Console
2. Generate participant tokens:
   - **Broadcaster token**: PUBLISH + SUBSCRIBE capabilities
   - **Viewer tokens**: SUBSCRIBE-only capability
3. See detailed instructions: [AWS Stage Setup Guide](./AWS_STAGE_SETUP_GUIDE.md)

**Use Cases:**
- Live auctions with real-time bidding
- Interactive Q&A sessions
- Live coaching or tutoring
- Real-time collaboration
- Gaming livestreams with instant feedback

#### Option B: Low-Latency Streaming (IVS Channel)

**Setup Steps:**
1. Create an AWS IVS Channel in the AWS Console
2. Note your:
   - Ingest server (e.g., `rtmps://...`)
   - Stream key (e.g., `sk_us-west-2_...`)
   - Playback URL (e.g., `https://...m3u8`)
3. See detailed instructions: [AWS Channel Setup Guide](./AWS_SETUP_GUIDE.md)

**Use Cases:**
- Webinars and conferences
- Concert livestreams
- Sports broadcasting
- Large-scale events
- One-to-many presentations

### 3. Run the Application

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Use

### Real-Time Streaming (Stage)

#### Broadcasting with Stage:

1. Navigate to the **Stage Broadcasting** page
2. Grant camera and microphone permissions when prompted
3. Enter your **Participant Token** (with PUBLISH + SUBSCRIBE capabilities)
4. Select your preferred camera and microphone
5. Click **Join Stage & Start Publishing**
6. You should see "🔴 Publishing" status when live

#### Watching a Stage:

1. Navigate to the **Watch Stage** page
2. Enter your **Participant Token** (with SUBSCRIBE capability)
3. Click **Join Stage**
4. The broadcaster's stream will appear almost instantly (sub-300ms)
5. Use volume controls and mute/unmute as needed

### Low-Latency Streaming (Channel)

#### Broadcasting with Channel:

1. Navigate to the **Start Broadcasting** page
2. Grant camera and microphone permissions when prompted
3. Enter your **Ingest Endpoint** and **Stream Key** from AWS Console
4. Select your preferred camera and microphone
5. Click **Start Streaming**
6. You should see "🔴 Live" status when broadcasting successfully

#### Watching a Channel:

1. Navigate to the **Watch Stream** page
2. Enter your **Playback URL** from AWS Console
3. Click **Start Watching**
4. The stream will appear after 3-5 seconds
5. Use volume controls and mute/unmute as needed

## Application Structure

```
aws-ivs-streaming-app/
├── app/
│   ├── stage-broadcast/    # Stage broadcaster page
│   │   └── page.tsx
│   ├── stage-watch/        # Stage viewer page
│   │   └── page.tsx
│   ├── broadcast/          # Channel broadcaster page
│   │   └── page.tsx
│   ├── watch/              # Channel viewer page
│   │   └── page.tsx
│   ├── page.tsx            # Home page
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Global styles
├── public/                 # Static assets
├── package.json            # Dependencies
├── AWS_STAGE_SETUP_GUIDE.md    # Stage setup instructions
├── AWS_SETUP_GUIDE.md          # Channel setup instructions
└── README.md              # This file
```

## Technologies Used

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **AWS IVS Web Broadcast SDK**: Browser-based streaming (supports both Stage and Channel)
- **AWS IVS Player SDK**: Low-latency video playback

## Troubleshooting

### Common Issues (Both Methods)

#### Camera/Microphone Access Issues

**Problem**: Browser doesn't show permission prompt or denies access.

**Solution**:
- Make sure you're using HTTPS or localhost
- Check browser settings to ensure camera/microphone aren't blocked
- Try a different browser (Chrome and Firefox work best)

#### "IVS SDK not loaded" Error

**Problem**: SDK fails to initialize

**Solutions**:
- Check your internet connection
- Disable browser extensions that might block CDN scripts
- Try clearing browser cache and reloading

### Stage-Specific Issues

#### "Invalid token" Error

**Problem**: Cannot join stage with provided token

**Solutions**:
- Verify token hasn't expired (default 12 hours)
- Ensure token was copied correctly (no extra spaces)
- Check that the stage still exists
- Generate a new token from AWS Console

#### No Video from Broadcaster

**Problem**: Joined stage but can't see broadcaster

**Solutions**:
- Verify broadcaster has started publishing
- Check broadcaster's token has PUBLISH capability
- Ensure broadcaster's camera/microphone are working

#### High Latency (>1 second)

**Problem**: Stage streaming has more than 1 second delay

**Solutions**:
- Check internet connection speed
- Close other applications using bandwidth
- Use wired connection instead of WiFi
- Choose AWS region closest to participants

### Channel-Specific Issues

#### Broadcast Fails to Start

**Problem**: Error when clicking "Start Streaming"

**Solutions**:
- Verify your Ingest Endpoint is correct (should start with `rtmps://`)
- Verify your Stream Key is correct
- Check that you're not already streaming to this channel
- Ensure your AWS IVS channel is in "Active" state

#### Stream Not Playing

**Problem**: Video player shows error or doesn't play

**Solutions**:
- Verify the Playback URL is correct
- Make sure a broadcast is currently active
- Wait 5-10 seconds for the stream to buffer

## AWS IVS Costs

### IVS Stage (Real-Time Streaming)

**Pricing Model**: Per participant-hour
- Each connected participant is charged (both broadcasters and viewers)
- Example: 1 broadcaster + 10 viewers for 1 hour = 11 participant-hours
- Typical rate: ~$0.015/participant-hour (varies by region)

**Best For**: Up to 100-1,000 concurrent viewers

### IVS Channel (Low-Latency Streaming)

**Pricing Model**: Per input hour + data transfer
- Charged for broadcast time (not viewer count)
- Standard data transfer rates for viewers
- Typical rate: ~$2.00/input hour for Standard (varies by region)

**Best For**: 100+ concurrent viewers

### Free Tier (First 12 months)
- Basic input: 5 hours/month
- Standard input: 5 hours/month
- Check [AWS IVS Pricing](https://aws.amazon.com/ivs/pricing/) for Stage offers

**Note**: Always monitor your AWS usage to avoid unexpected charges. Set up billing alerts!

## Security Considerations

⚠️ **Important Security Notes**:

### For Stage Streaming:
1. **Never share broadcaster tokens**: PUBLISH tokens should be kept secure
2. **Use short token durations**: Default 12 hours, consider shorter for production
3. **Generate tokens server-side**: Don't hardcode tokens in client code
4. **Implement user authentication**: Control who gets tokens
5. **Monitor token generation**: Track and audit token creation

### For Channel Streaming:
1. **Never commit Stream Keys**: Don't include credentials in version control
2. **Use Environment Variables**: For production, use `.env.local` file
3. **Implement Authentication**: This demo uses open access - add auth for production
4. **Secure Your Channel**: Consider using AWS IAM policies to restrict access

### General:
5. **Monitor Usage**: Set up AWS CloudWatch alarms for usage monitoring
6. **Use HTTPS**: Required for camera/microphone access in production

## Production Deployment

For production deployment:

1. **Backend Token Service** (Recommended for Stage):
   - Create API endpoint to generate participant tokens
   - Authenticate users before providing tokens
   - Set appropriate capabilities (PUBLISH vs SUBSCRIBE)
   - Log token generation for audit

2. **Add Environment Variables**:
   Create a `.env.local` file:
   ```
   # For Channel Streaming (optional)
   NEXT_PUBLIC_IVS_INGEST_ENDPOINT=your-ingest-endpoint
   NEXT_PUBLIC_IVS_STREAM_KEY=your-stream-key
   NEXT_PUBLIC_IVS_PLAYBACK_URL=your-playback-url
   
   # For Stage Streaming (backend only)
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   AWS_REGION=us-west-2
   IVS_STAGE_ARN=your-stage-arn
   ```

3. **Add Authentication**:
   - Implement user authentication (NextAuth.js, Auth0, etc.)
   - Restrict who can broadcast
   - Control access to streams

4. **Deploy**:
   - Vercel (recommended for Next.js)
   - AWS Amplify
   - Other hosting platforms

5. **Use HTTPS**:
   - Required for camera/microphone access
   - Most hosting platforms provide this automatically

## Browser Compatibility

### Supported Browsers:
- ✅ Chrome/Edge 80+
- ✅ Firefox 75+
- ✅ Safari 14+
- ❌ Internet Explorer (not supported)

### Best Performance:
- Chrome/Edge: Excellent support for both Stage and Channel
- Firefox: Good support, may have slight variations
- Safari: Works well, some WebRTC limitations on older iOS versions

## Development

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
npm start
```

### Lint Code
```bash
npm run lint
```

## Learn More

### AWS IVS Documentation
- [AWS IVS Overview](https://docs.aws.amazon.com/ivs/)
- [IVS Real-Time Streaming (Stage)](https://docs.aws.amazon.com/ivs/latest/RealTimeUserGuide/)
- [IVS Low-Latency Streaming (Channel)](https://docs.aws.amazon.com/ivs/latest/LowLatencyUserGuide/)
- [AWS IVS Web Broadcast SDK](https://aws.github.io/amazon-ivs-web-broadcast/)
- [AWS IVS Player SDK](https://docs.aws.amazon.com/ivs/latest/userguide/player.html)

### Other Resources
- [AWS IVS Pricing](https://aws.amazon.com/ivs/pricing/)
- [Next.js Documentation](https://nextjs.org/docs)
- [AWS IVS Real-Time Web Demo (GitHub)](https://github.com/aws-samples/amazon-ivs-real-time-web-demo)

## Support

For issues related to:
- **This app**: Open an issue in this repository
- **AWS IVS**: Check [AWS Support](https://aws.amazon.com/support/)
- **Next.js**: See [Next.js Documentation](https://nextjs.org/docs)

## License

This project is open source and available for testing and educational purposes.

## Credits

Built with:
- Amazon Interactive Video Service (IVS)
  - IVS Real-Time Streaming (Stage)
  - IVS Low-Latency Streaming (Channel)
- Next.js
- React
- Tailwind CSS

---

**Ready to stream?** Choose your method:
- 🚀 **Need real-time interaction?** → Use [Stage Broadcasting](./AWS_STAGE_SETUP_GUIDE.md)
- 📺 **Broadcasting to many viewers?** → Use [Channel Streaming](./AWS_SETUP_GUIDE.md)
