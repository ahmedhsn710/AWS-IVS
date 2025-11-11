# Quick Start Guide

Get your AWS IVS streaming app running in 5 minutes!

## Prerequisites Checklist
- ✅ Node.js installed (v18 or higher)
- ✅ AWS account created
- ✅ Browser that supports WebRTC (Chrome, Firefox, Edge, Safari)

## Step 1: Install Dependencies (1 minute)

```bash
npm install
```

## Step 2: Create AWS IVS Channel (2 minutes)

1. Go to [AWS IVS Console](https://console.aws.amazon.com/ivs/)
2. Click **"Create channel"**
3. Enter a name and select **"Standard"** type
4. Click **"Create channel"**
5. Copy these three values:
   - ✏️ **Ingest server** (starts with `rtmps://`)
   - ✏️ **Stream key** (starts with `sk_`)
   - ✏️ **Playback URL** (ends with `.m3u8`)

## Step 3: Start the App (30 seconds)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Step 4: Start Broadcasting (1 minute)

1. Click **"Start Broadcasting"**
2. Allow camera/microphone access
3. Paste your **Ingest server** and **Stream key**
4. Click **"Start Streaming"**
5. Wait for "🔴 Live" status

## Step 5: Watch Your Stream (30 seconds)

1. Open a new browser tab/window
2. Go to [http://localhost:3000/watch](http://localhost:3000/watch)
3. Paste your **Playback URL**
4. Click **"Start Watching"**
5. Stream appears in 3-5 seconds!

## That's It! 🎉

You're now streaming live with AWS IVS!

## Common First-Time Issues

### Camera not working?
- Check browser permissions
- Try refreshing the page
- Make sure no other app is using the camera

### Stream not appearing?
- Wait 5-10 seconds for buffering
- Verify the broadcast shows "🔴 Live"
- Double-check your Playback URL

### Want to test on mobile?
- Use your local IP instead of localhost
- Example: `http://192.168.1.100:3000`
- Make sure devices are on same network

## Next Steps

- Read [README.md](README.md) for detailed documentation
- Check [AWS_SETUP_GUIDE.md](AWS_SETUP_GUIDE.md) for AWS configuration
- Explore the app features and settings

## Need Help?

- 📚 [Full Documentation](README.md)
- 🔧 [AWS Setup Guide](AWS_SETUP_GUIDE.md)
- 🌐 [AWS IVS Docs](https://docs.aws.amazon.com/ivs/)

