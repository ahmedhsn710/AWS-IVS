'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

// IVS Broadcast types
interface IVSBroadcastClient {
  addAudioInputDevice: (stream: MediaStream, name: string) => Promise<void>
  addVideoInputDevice: (stream: MediaStream, name: string, config?: any) => Promise<void>
  startBroadcast: (streamKey: string) => Promise<void>
  stopBroadcast: () => Promise<void>
  delete: () => void
}

declare global {
  interface Window {
    IVSBroadcastClient: {
      create: (config: any) => Promise<IVSBroadcastClient>
      BASIC: string
      STANDARD_LANDSCAPE: string
      STANDARD_PORTRAIT: string
    }
  }
}

export default function BroadcastPage() {
  // Load from environment variables if available
  const [ingestEndpoint, setIngestEndpoint] = useState(
    typeof window !== 'undefined' && process.env.NEXT_PUBLIC_IVS_INGEST_ENDPOINT 
      ? process.env.NEXT_PUBLIC_IVS_INGEST_ENDPOINT 
      : ''
  )
  const [streamKey, setStreamKey] = useState(
    typeof window !== 'undefined' && process.env.NEXT_PUBLIC_IVS_STREAM_KEY 
      ? process.env.NEXT_PUBLIC_IVS_STREAM_KEY 
      : ''
  )
  const [isBroadcasting, setIsBroadcasting] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [status, setStatus] = useState('Not connected')
  const [error, setError] = useState('')
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([])
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([])
  const [selectedCamera, setSelectedCamera] = useState<string>('')
  const [selectedMicrophone, setSelectedMicrophone] = useState<string>('')
  const [previewReady, setPreviewReady] = useState(false)
  
  const broadcastClientRef = useRef<IVSBroadcastClient | null>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    // Load IVS Broadcast SDK (using latest version)
    const script = document.createElement('script')
    script.src = 'https://web-broadcast.live-video.net/1.30.0/amazon-ivs-web-broadcast.js'
    script.async = true
    script.onload = () => {
      setIsInitialized(true)
      initializeDevices()
    }
    script.onerror = () => {
      setError('Failed to load AWS IVS SDK')
    }
    document.body.appendChild(script)

    return () => {
      if (broadcastClientRef.current) {
        broadcastClientRef.current.delete()
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const initializeDevices = async () => {
    try {
      // Request permissions and get stream
      // Using 480p (852x480) for low latency as per AWS recommendations
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 852, height: 480 }, 
        audio: true 
      })
      
      streamRef.current = stream
      
      // Get available devices
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === 'videoinput')
      const audioDevices = devices.filter(device => device.kind === 'audioinput')
      
      setCameras(videoDevices)
      setMicrophones(audioDevices)
      
      if (videoDevices.length > 0) setSelectedCamera(videoDevices[0].deviceId)
      if (audioDevices.length > 0) setSelectedMicrophone(audioDevices[0].deviceId)
      
      // Setup native video preview
      setupNativePreview(stream)
      
      setPreviewReady(true)
      setStatus('Preview ready')
    } catch (err) {
      setError('Failed to access camera/microphone. Please grant permissions.')
      console.error(err)
    }
  }

  const setupNativePreview = (stream: MediaStream) => {
    if (previewRef.current) {
      // Create video element for preview
      const video = document.createElement('video')
      video.srcObject = stream
      video.autoplay = true
      video.muted = true
      video.playsInline = true
      video.style.width = '100%'
      video.style.height = '100%'
      video.style.objectFit = 'contain'
      
      previewRef.current.innerHTML = ''
      previewRef.current.appendChild(video)
      
      videoRef.current = video
    }
  }

  const updatePreviewDevice = async () => {
    if (!selectedCamera) return
    
    try {
      // Stop current stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      
      // Get new stream with selected devices
      // Using 480p (852x480) for low latency
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { deviceId: selectedCamera, width: 852, height: 480 }, 
        audio: { deviceId: selectedMicrophone } 
      })
      
      streamRef.current = stream
      
      // Update preview
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      } else {
        setupNativePreview(stream)
      }
    } catch (err) {
      console.error('Failed to update device:', err)
    }
  }

  const startBroadcast = async () => {
    if (!ingestEndpoint || !streamKey) {
      setError('Please enter both Ingest Endpoint and Stream Key')
      return
    }

    try {
      setError('')
      setStatus('Initializing broadcast...')

      // Create IVS broadcast client
      if (!window.IVSBroadcastClient) {
        throw new Error('IVS SDK not loaded')
      }

      // Create client with STANDARD_LANDSCAPE preset
      // We use 480p in getUserMedia below to reduce latency while keeping quality
      const client = await window.IVSBroadcastClient.create({
        streamConfig: window.IVSBroadcastClient.STANDARD_LANDSCAPE,
        ingestEndpoint: ingestEndpoint,
      })

      broadcastClientRef.current = client

      // Get media stream with selected devices (combined video + audio)
      // Using 480p resolution for low latency
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          deviceId: selectedCamera ? { exact: selectedCamera } : undefined,
          width: { ideal: 852 },
          height: { ideal: 480 },
          frameRate: { ideal: 30, max: 30 }
        },
        audio: { 
          deviceId: selectedMicrophone ? { exact: selectedMicrophone } : undefined
        }
      })

      // Add video stream (pass the whole MediaStream)
      if (mediaStream.getVideoTracks().length > 0) {
        await client.addVideoInputDevice(mediaStream, 'camera', {
          index: 0
        })
      }

      // Add audio stream (pass the whole MediaStream)
      if (mediaStream.getAudioTracks().length > 0) {
        await client.addAudioInputDevice(mediaStream, 'microphone')
      }

      // Keep the native preview running - no need to replace it
      // The IVS client will use the media stream for broadcasting

      setStatus('Starting stream...')
      await client.startBroadcast(streamKey)
      
      setIsBroadcasting(true)
      setStatus('🔴 Live')
    } catch (err: any) {
      setError(`Failed to start broadcast: ${err.message}`)
      setStatus('Preview ready')
      console.error(err)
      
      // Clean up client on error
      if (broadcastClientRef.current) {
        broadcastClientRef.current.delete()
        broadcastClientRef.current = null
      }
    }
  }

  const stopBroadcast = async () => {
    try {
      if (broadcastClientRef.current) {
        await broadcastClientRef.current.stopBroadcast()
        broadcastClientRef.current.delete()
        broadcastClientRef.current = null
        setIsBroadcasting(false)
        setStatus('Preview ready')
        
        // Native preview is still running, no need to restart
      }
    } catch (err: any) {
      setError(`Failed to stop broadcast: ${err.message}`)
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-blue-400 hover:text-blue-300 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-white">Start Broadcasting</h1>
          <p className="text-slate-300 mt-2">Stream live from your browser to AWS IVS</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Configuration */}
            <div className="bg-slate-800 rounded-lg p-6 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-4">Configuration</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Ingest Endpoint
                  </label>
                  <input
                    type="text"
                    value={ingestEndpoint}
                    onChange={(e) => setIngestEndpoint(e.target.value)}
                    placeholder="rtmps://abc123.global-contribute.live-video.net:443/app/"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    disabled={isBroadcasting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Stream Key
                  </label>
                  <input
                    type="password"
                    value={streamKey}
                    onChange={(e) => setStreamKey(e.target.value)}
                    placeholder="sk_us-west-2_..."
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    disabled={isBroadcasting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Camera
                  </label>
                  <select
                    value={selectedCamera}
                    onChange={(e) => {
                      setSelectedCamera(e.target.value)
                      if (!isBroadcasting) {
                        setTimeout(() => updatePreviewDevice(), 100)
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                    disabled={isBroadcasting}
                  >
                    {cameras.map((camera) => (
                      <option key={camera.deviceId} value={camera.deviceId}>
                        {camera.label || 'Camera'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Microphone
                  </label>
                  <select
                    value={selectedMicrophone}
                    onChange={(e) => {
                      setSelectedMicrophone(e.target.value)
                      if (!isBroadcasting) {
                        setTimeout(() => updatePreviewDevice(), 100)
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                    disabled={isBroadcasting}
                  >
                    {microphones.map((mic) => (
                      <option key={mic.deviceId} value={mic.deviceId}>
                        {mic.label || 'Microphone'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="bg-slate-800 rounded-lg p-6 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-4">Status</h2>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">SDK:</span>
                  <span className={`font-semibold ${isInitialized ? 'text-green-400' : 'text-yellow-400'}`}>
                    {isInitialized ? 'Ready' : 'Loading...'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Preview:</span>
                  <span className={`font-semibold ${previewReady ? 'text-green-400' : 'text-yellow-400'}`}>
                    {previewReady ? 'Ready' : 'Not Ready'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Broadcast:</span>
                  <span className={`font-semibold ${isBroadcasting ? 'text-red-400' : 'text-slate-400'}`}>
                    {status}
                  </span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="bg-slate-800 rounded-lg p-6 shadow-xl">
              {!isBroadcasting ? (
                <button
                  onClick={startBroadcast}
                  disabled={!previewReady || !ingestEndpoint || !streamKey}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-3 px-4 rounded transition-colors"
                >
                  Start Streaming
                </button>
              ) : (
                <button
                  onClick={stopBroadcast}
                  className="w-full bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded transition-colors"
                >
                  Stop Streaming
                </button>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-900/50 border border-red-500 rounded-lg p-4">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800 rounded-lg p-6 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-4">Preview</h2>
              <div 
                ref={previewRef}
                className="bg-black rounded aspect-video flex items-center justify-center"
              >
                <p className="text-slate-400">Camera preview will appear here</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

