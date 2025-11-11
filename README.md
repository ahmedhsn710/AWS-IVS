# AWS IVS Streaming App

A Next.js application that enables browser-based live streaming using Amazon Interactive Video Service (IVS). This app allows users to broadcast live video directly from their browser and view streams with ultra-low latency.

## Features

- 🎥 **Browser-based Broadcasting**: Stream directly from your webcam and microphone without additional software
- 📺 **Low-Latency Playback**: Watch live streams with minimal delay
- 🎛️ **Device Selection**: Choose from available cameras and microphones
- 🎨 **Modern UI**: Clean, responsive interface built with Tailwind CSS
- ⚡ **Real-time Status**: Monitor broadcast and playback status
- 🔧 **Easy Configuration**: Simple setup with AWS IVS credentials

## Prerequisites

- Node.js 18+ installed
- An AWS account
- An AWS IVS channel (instructions below)

## Getting Started

### 1. Installation

Clone this repository and install dependencies:

```bash
npm install
```

### 2. Set Up AWS IVS Channel

Before using the app, you need to create an AWS IVS channel:

1. **Sign in to AWS Console**
   - Go to [AWS Console](https://console.aws.amazon.com/)
   - Navigate to Amazon IVS service

2. **Create a Channel**
   - Click "Create channel"
   - Enter a name for your channel (e.g., "test-stream")
   - Choose channel type: **Standard** (recommended for testing)
   - Click "Create channel"

3. **Note Your Channel Details**
   
   After creation, you'll see three important values:
   
   - **Ingest server**: Something like `rtmps://abc123def456.global-contribute.live-video.net:443/app/`
   - **Stream key**: Something like `sk_us-west-2_AbCdEfGhIjKl`
   - **Playback URL**: Something like `https://abc123def456.us-west-2.playback.live-video.net/api/video/v1/us-west-2.123456789012.channel.AbCdEfGhIjKl.m3u8`
   
   **Important**: Keep your stream key secure! It's like a password for broadcasting to your channel.

### 3. Run the Application

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Use

### Broadcasting (Streaming)

1. Navigate to the **Start Broadcasting** page
2. Grant camera and microphone permissions when prompted
3. Enter your **Ingest Endpoint** and **Stream Key** from AWS Console
4. Select your preferred camera and microphone
5. Click **Start Streaming**
6. You should see "🔴 Live" status when broadcasting successfully

### Watching (Viewing)

1. Navigate to the **Watch Stream** page
2. Enter your **Playback URL** from AWS Console
3. Click **Start Watching**
4. The stream will appear after a few seconds
5. Use volume controls and mute/unmute as needed

## Application Structure

```
aws-ivs-streaming-app/
├── app/
│   ├── broadcast/           # Broadcaster page
│   │   └── page.tsx
│   ├── watch/              # Viewer page
│   │   └── page.tsx
│   ├── page.tsx            # Home page
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Global styles
├── public/                 # Static assets
├── package.json            # Dependencies
└── README.md              # This file
```

## Technologies Used

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **AWS IVS Web Broadcast SDK**: Browser-based streaming
- **AWS IVS Player SDK**: Low-latency video playback

## Troubleshooting

### Camera/Microphone Access Issues

**Problem**: Browser doesn't show permission prompt or denies access.

**Solution**:
- Make sure you're using HTTPS or localhost
- Check browser settings to ensure camera/microphone aren't blocked
- Try a different browser (Chrome and Firefox work best)

### Broadcast Fails to Start

**Problem**: Error when clicking "Start Streaming"

**Solutions**:
- Verify your Ingest Endpoint is correct (should start with `rtmps://`)
- Verify your Stream Key is correct
- Check that you're not already streaming to this channel from another source
- Ensure your AWS IVS channel is in "Active" state

### Stream Not Playing

**Problem**: Video player shows error or doesn't play

**Solutions**:
- Verify the Playback URL is correct
- Make sure a broadcast is currently active on that channel
- Check that the broadcast started successfully
- Wait 5-10 seconds for the stream to buffer

### "IVS SDK not loaded" Error

**Problem**: SDK fails to initialize

**Solutions**:
- Check your internet connection
- Disable browser extensions that might block CDN scripts
- Try clearing browser cache and reloading

## AWS IVS Limits

### Free Tier (First 12 months)
- Basic input: 5 hours/month
- Standard input: 5 hours/month

### Pricing (After free tier)
- Varies by region and quality
- Refer to [AWS IVS Pricing](https://aws.amazon.com/ivs/pricing/) for details

**Note**: Always monitor your AWS usage to avoid unexpected charges.

## Security Considerations

⚠️ **Important Security Notes**:

1. **Never commit Stream Keys**: Don't include credentials in version control
2. **Use Environment Variables**: For production, use `.env.local` file
3. **Implement Authentication**: This demo uses open access - add auth for production
4. **Secure Your Channel**: Consider using AWS IAM policies to restrict access
5. **Monitor Usage**: Set up AWS CloudWatch alarms for usage monitoring

## Production Deployment

For production deployment:

1. **Add Environment Variables**:
   Create a `.env.local` file:
   ```
   NEXT_PUBLIC_IVS_INGEST_ENDPOINT=your-ingest-endpoint
   NEXT_PUBLIC_IVS_STREAM_KEY=your-stream-key
   NEXT_PUBLIC_IVS_PLAYBACK_URL=your-playback-url
   ```

2. **Add Authentication**:
   - Implement user authentication (NextAuth.js, Auth0, etc.)
   - Restrict who can broadcast
   - Control access to streams

3. **Deploy**:
   - Vercel (recommended for Next.js)
   - AWS Amplify
   - Other hosting platforms

4. **Use HTTPS**:
   - Required for camera/microphone access
   - Most hosting platforms provide this automatically

## Common Issues & Solutions

### Issue: High Latency
- AWS IVS is designed for low latency but some delay is normal
- Typical latency: 3-5 seconds
- Factors: internet speed, geographic distance

### Issue: Poor Video Quality
- Check your internet upload speed (broadcaster)
- Ensure good lighting for better camera quality
- The SDK automatically adjusts quality based on connection

### Issue: Browser Compatibility
Supported browsers:
- ✅ Chrome/Edge 80+
- ✅ Firefox 75+
- ✅ Safari 14+
- ❌ Internet Explorer (not supported)

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

- [AWS IVS Documentation](https://docs.aws.amazon.com/ivs/)
- [AWS IVS Web Broadcast SDK](https://aws.github.io/amazon-ivs-web-broadcast/)
- [AWS IVS Player SDK](https://docs.aws.amazon.com/ivs/latest/userguide/player.html)
- [Next.js Documentation](https://nextjs.org/docs)

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
- Next.js
- React
- Tailwind CSS

