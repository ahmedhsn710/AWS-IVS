/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_IVS_INGEST_ENDPOINT: process.env.NEXT_PUBLIC_IVS_INGEST_ENDPOINT,
    NEXT_PUBLIC_IVS_STREAM_KEY: process.env.NEXT_PUBLIC_IVS_STREAM_KEY,
    NEXT_PUBLIC_IVS_PLAYBACK_URL: process.env.NEXT_PUBLIC_IVS_PLAYBACK_URL,
  },
}

module.exports = nextConfig

