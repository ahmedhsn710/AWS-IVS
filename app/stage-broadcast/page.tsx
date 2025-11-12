'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

// IVS Stage types
interface StageStrategy {
  stageStreamsToPublish: () => LocalStageStream[]
  shouldPublishParticipant: (participant: StageParticipantInfo) => boolean
  shouldSubscribeToParticipant: (participant: StageParticipantInfo) => SubscribeType
}

interface StageParticipantInfo {
  userId: string
  attributes?: { [key: string]: string }
}

interface LocalStageStream {
  device: MediaStream
  streamType: StreamType
}

interface StageConnectionState {
  connected: boolean
  reconnecting: boolean
}

enum SubscribeType {
  NONE = 'NONE',
  AUDIO_ONLY = 'AUDIO_ONLY',
  AUDIO_VIDEO = 'AUDIO_VIDEO'
}

enum StreamType {
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO'
}

interface Stage {
  join: () => Promise<void>
  leave: () => Promise<void>
  refreshStrategy: () => void
  on: (event: string, callback: (...args: any[]) => void) => void
  off: (event: string, callback: (...args: any[]) => void) => void
}

export default function StageBroadcastPage() {
  const [participantToken, setParticipantToken] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [status, setStatus] = useState('Not connected')
  const [error, setError] = useState('')
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([])
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([])
  const [selectedCamera, setSelectedCamera] = useState<string>('')
  const [selectedMicrophone, setSelectedMicrophone] = useState<string>('')
  const [previewReady, setPreviewReady] = useState(false)
  const [participants, setParticipants] = useState<string[]>([])
  
  const stageRef = useRef<Stage | null>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const localStreamsRef = useRef<LocalStageStream[]>([])

  useEffect(() => {
    // Load IVS Broadcast SDK
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
      if (stageRef.current) {
        stageRef.current.leave().catch(console.error)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const initializeDevices = async () => {
    try {
      // Request permissions and get stream
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 }, 
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
      
      // Setup video preview
      setupPreview(stream)
      
      setPreviewReady(true)
      setStatus('Preview ready')
    } catch (err) {
      setError('Failed to access camera/microphone. Please grant permissions.')
      console.error(err)
    }
  }

  const setupPreview = (stream: MediaStream) => {
    if (previewRef.current) {
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
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { deviceId: selectedCamera, width: 1280, height: 720 }, 
        audio: { deviceId: selectedMicrophone } 
      })
      
      streamRef.current = stream
      
      // Update preview
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      } else {
        setupPreview(stream)
      }

      // If already connected to stage, update streams
      if (isConnected && stageRef.current) {
        await createLocalStreams()
        stageRef.current.refreshStrategy()
      }
    } catch (err) {
      console.error('Failed to update device:', err)
      setError('Failed to update device')
    }
  }

  const createLocalStreams = async () => {
    if (!streamRef.current || !window.IVSBroadcastClient) return []

    const SDK = window.IVSBroadcastClient as any
    const { LocalStageStream } = SDK

    const streams: LocalStageStream[] = []

    // Get video track - LocalStageStream takes MediaStreamTrack, not MediaStream
    const videoTrack = streamRef.current.getVideoTracks()[0]
    if (videoTrack) {
      // Video config with updated property names
      const videoConfig = {
        maxVideoBitrateKbps: 2500, // 2.5 Mbps = 2500 Kbps
        maxFramerate: 30
      }
      streams.push(new LocalStageStream(videoTrack, videoConfig))
    }

    // Get audio track
    const audioTrack = streamRef.current.getAudioTracks()[0]
    if (audioTrack) {
      // Audio streams don't need special config
      streams.push(new LocalStageStream(audioTrack))
    }

    localStreamsRef.current = streams
    return streams
  }

  const joinStage = async () => {
    if (!participantToken) {
      setError('Please enter a Participant Token')
      return
    }

    if (!window.IVSBroadcastClient) {
      setError('IVS SDK not loaded')
      return
    }

    try {
      setError('')
      setStatus('Joining stage...')

      console.log('Starting to join stage...')

      // Create local streams
      const streams = await createLocalStreams()
      console.log('Created local streams:', streams.length)

      if (streams.length === 0) {
        throw new Error('No media streams available. Please check camera/microphone permissions.')
      }

      // Create stage strategy
      const SDK = window.IVSBroadcastClient as any
      const strategy: StageStrategy = {
        stageStreamsToPublish: () => {
          console.log('stageStreamsToPublish called, returning', localStreamsRef.current.length, 'streams')
          return localStreamsRef.current
        },
        shouldPublishParticipant: (participant) => {
          console.log('shouldPublishParticipant called for:', participant.userId)
          return true
        },
        shouldSubscribeToParticipant: (participant) => {
          console.log('shouldSubscribeToParticipant called for:', participant.userId)
          return SDK.SubscribeType.AUDIO_VIDEO
        }
      }

      // Create and join stage
      const { Stage, StageEvents } = SDK
      console.log('Creating stage with token...')
      const stage = new Stage(participantToken, strategy)
      stageRef.current = stage

      // Set up event listeners BEFORE joining
      stage.on(StageEvents.STAGE_CONNECTION_STATE_CHANGED, (state: any) => {
        console.log('Connection state changed:', state)
        
        // Handle both object format and string format
        const stateValue = typeof state === 'string' ? state : state.state || state
        
        if (stateValue === 'connected' || state.connected === true) {
          setIsConnected(true)
          setStatus('🔴 Broadcasting')
        } else if (stateValue === 'connecting') {
          setStatus('Connecting...')
        } else if (stateValue === 'reconnecting' || state.reconnecting === true) {
          setStatus('Reconnecting...')
        } else {
          setIsConnected(false)
          setStatus('Disconnected')
        }
      })

      stage.on(StageEvents.STAGE_PARTICIPANT_JOINED, (participant: any) => {
        console.log('Participant joined:', participant.userId, 'isLocal:', participant.isLocal)
        // Don't add ourselves to the viewers list
        if (!participant.isLocal) {
          setParticipants(prev => [...prev, participant.userId])
        }
      })

      stage.on(StageEvents.STAGE_PARTICIPANT_LEFT, (participant: any) => {
        console.log('Participant left:', participant.userId, 'isLocal:', participant.isLocal)
        if (!participant.isLocal) {
          setParticipants(prev => prev.filter(p => p !== participant.userId))
        }
      })

      // Add error event listener
      stage.on('error', (error: any) => {
        console.error('Stage error:', error)
        setError(`Stage error: ${error.message || 'Unknown error'}`)
      })

      console.log('Calling stage.join()...')
      await stage.join()
      console.log('stage.join() completed successfully')
      
    } catch (err: any) {
      console.error('Failed to join stage:', err)
      setError(`Failed to join stage: ${err.message || err.toString()}`)
      setStatus('Preview ready')
      
      if (stageRef.current) {
        try {
          await stageRef.current.leave()
        } catch (e) {
          console.error('Error leaving stage after failure:', e)
        }
        stageRef.current = null
      }
    }
  }

  const leaveStage = async () => {
    try {
      if (stageRef.current) {
        await stageRef.current.leave()
        stageRef.current = null
        setIsConnected(false)
        setStatus('Preview ready')
        setParticipants([])
      }
    } catch (err: any) {
      setError(`Failed to leave stage: ${err.message}`)
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
          <h1 className="text-4xl font-bold text-white">Stage Broadcasting (Real-Time)</h1>
          <p className="text-slate-300 mt-2">Broadcast in real-time with ultra-low latency (sub-300ms)</p>
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
                    Participant Token
                  </label>
                  <textarea
                    value={participantToken}
                    onChange={(e) => setParticipantToken(e.target.value)}
                    placeholder="Paste your participant token with PUBLISH+SUBSCRIBE capabilities"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono text-xs"
                    rows={4}
                    disabled={isConnected}
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Get this from AWS Console (Stage → Create Token)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Camera
                  </label>
                  <select
                    value={selectedCamera}
                    onChange={(e) => {
                      setSelectedCamera(e.target.value)
                      if (!isConnected) {
                        setTimeout(() => updatePreviewDevice(), 100)
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                    disabled={isConnected}
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
                      if (!isConnected) {
                        setTimeout(() => updatePreviewDevice(), 100)
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                    disabled={isConnected}
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
                  <span className="text-slate-300">Stage:</span>
                  <span className={`font-semibold ${isConnected ? 'text-red-400' : 'text-slate-400'}`}>
                    {status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Viewers:</span>
                  <span className="font-semibold text-blue-400">
                    {participants.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Participants */}
            {participants.length > 0 && (
              <div className="bg-slate-800 rounded-lg p-6 shadow-xl">
                <h2 className="text-xl font-bold text-white mb-4">Connected Viewers</h2>
                <div className="space-y-2">
                  {participants.map((userId, index) => (
                    <div key={index} className="flex items-center text-slate-300">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      {userId}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="bg-slate-800 rounded-lg p-6 shadow-xl">
              {!isConnected ? (
                <button
                  onClick={joinStage}
                  disabled={!previewReady || !participantToken}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-3 px-4 rounded transition-colors"
                >
                  Join Stage & Start Broadcasting
                </button>
              ) : (
                <button
                  onClick={leaveStage}
                  className="w-full bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded transition-colors"
                >
                  Leave Stage
                </button>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-900/50 border border-red-500 rounded-lg p-4">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            {/* Info */}
            <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-4">
              <h3 className="text-blue-300 font-semibold mb-2">Token Requirements:</h3>
              <ul className="text-blue-200 text-sm space-y-1 list-disc list-inside">
                <li>PUBLISH capability (to share video)</li>
                <li>SUBSCRIBE capability (to see viewers)</li>
                <li>Get from AWS IVS Console</li>
              </ul>
            </div>
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
              <div className="mt-4 text-center text-slate-400 text-sm">
                {isConnected ? (
                  <span className="text-green-400">🔴 You are live! Viewers can see this stream in real-time.</span>
                ) : (
                  <span>Your camera preview (not broadcasting yet)</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

