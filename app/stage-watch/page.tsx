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

interface RemoteParticipant {
  userId: string
  isLocal: boolean
  streams: RemoteStageStream[]
}

interface RemoteStageStream {
  streamType: StreamType
  mediaStream: MediaStream
  isMuted: boolean
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

export default function StageWatchPage() {
  const [participantToken, setParticipantToken] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [status, setStatus] = useState('Not connected')
  const [error, setError] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [broadcasterUserId, setBroadcasterUserId] = useState<string>('')
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null)
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null)
  
  const stageRef = useRef<Stage | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    // Load IVS Broadcast SDK
    const script = document.createElement('script')
    script.src = 'https://web-broadcast.live-video.net/1.30.0/amazon-ivs-web-broadcast.js'
    script.async = true
    script.onload = () => {
      setIsInitialized(true)
    }
    script.onerror = () => {
      setError('Failed to load AWS IVS SDK')
    }
    document.body.appendChild(script)

    return () => {
      if (stageRef.current) {
        stageRef.current.leave().catch(console.error)
      }
      setVideoStream(null)
      setAudioStream(null)
    }
  }, [])

  // Update video element when stream changes
  useEffect(() => {
    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream
      videoRef.current.play().catch(err => {
        console.error('Video play failed:', err)
      })
    }
  }, [videoStream])

  // Update audio element when stream changes
  useEffect(() => {
    if (audioRef.current && audioStream) {
      audioRef.current.srcObject = audioStream
      audioRef.current.volume = volume
      audioRef.current.muted = isMuted
      audioRef.current.play().catch(err => {
        console.error('Audio play failed:', err)
      })
    }
  }, [audioStream, volume, isMuted])

  const handleParticipantStreamsAdded = (participant: RemoteParticipant, streams: RemoteStageStream[]) => {
    console.log('Participant streams added:', participant.userId, streams)
    console.log('Participant isLocal:', participant.isLocal)
    
    // Don't render our own streams (we're just a viewer)
    if (participant.isLocal) {
      console.log('Skipping local participant streams')
      return
    }

    setBroadcasterUserId(participant.userId)
    setStatus('Receiving stream...')

    // Find video and audio streams
    const vStream = streams.find(s => {
      const type = (s.streamType as any)
      const typeStr = typeof type === 'string' ? type.toLowerCase() : String(type).toLowerCase()
      return typeStr === 'video'
    })
    const aStream = streams.find(s => {
      const type = (s.streamType as any)
      const typeStr = typeof type === 'string' ? type.toLowerCase() : String(type).toLowerCase()
      return typeStr === 'audio'
    })

    console.log('Found video stream:', !!vStream)
    console.log('Found audio stream:', !!aStream)

    // Get video MediaStream
    if (vStream) {
      const videoTrack = (vStream as any).cachedMediaStreamTrack
      if (videoTrack) {
        const mediaStream = new MediaStream([videoTrack])
        setVideoStream(mediaStream)
        setIsPlaying(true)
        setStatus('🔴 Watching Live')
        console.log('Set video stream')
      }
    }

    // Get audio MediaStream
    if (aStream) {
      const audioTrack = (aStream as any).cachedMediaStreamTrack
      if (audioTrack) {
        const mediaStream = new MediaStream([audioTrack])
        setAudioStream(mediaStream)
        console.log('Set audio stream')
      }
    }
  }

  const handleParticipantStreamsRemoved = (participant: RemoteParticipant) => {
    console.log('Participant streams removed:', participant.userId)
    
    if (!participant.isLocal) {
      setIsPlaying(false)
      setStatus('Stream ended')
      setBroadcasterUserId('')
      setVideoStream(null)
      setAudioStream(null)
    }
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

      // Create stage strategy (subscribe-only)
      const SDK = window.IVSBroadcastClient as any
      const strategy: StageStrategy = {
        stageStreamsToPublish: () => {
          // We don't publish any streams as a viewer
          return []
        },
        shouldPublishParticipant: () => false,
        shouldSubscribeToParticipant: () => SDK.SubscribeType.AUDIO_VIDEO
      }

      // Create and join stage
      const { Stage, StageEvents } = SDK
      const stage = new Stage(participantToken, strategy)
      stageRef.current = stage

      // Set up event listeners
      stage.on(StageEvents.STAGE_CONNECTION_STATE_CHANGED, (state: StageConnectionState) => {
        console.log('Connection state:', state)
        if (state.connected) {
          setIsConnected(true)
          setStatus('Connected - Waiting for stream...')
        } else if (state.reconnecting) {
          setStatus('Reconnecting...')
        } else {
          setIsConnected(false)
          setStatus('Disconnected')
        }
      })

      stage.on(StageEvents.STAGE_PARTICIPANT_JOINED, (participant: StageParticipantInfo) => {
        console.log('Participant joined:', participant.userId)
      })

      stage.on(StageEvents.STAGE_PARTICIPANT_LEFT, (participant: StageParticipantInfo) => {
        console.log('Participant left:', participant.userId)
        if (participant.userId === broadcasterUserId) {
          setIsPlaying(false)
          setStatus('Broadcaster left')
          setBroadcasterUserId('')
        }
      })

      stage.on(StageEvents.STAGE_PARTICIPANT_STREAMS_ADDED, handleParticipantStreamsAdded)
      
      stage.on(StageEvents.STAGE_PARTICIPANT_STREAMS_REMOVED, handleParticipantStreamsRemoved)

      stage.on(StageEvents.STAGE_STREAM_MUTE_CHANGED, (participant: RemoteParticipant, stream: RemoteStageStream) => {
        console.log('Stream mute changed:', participant.userId, stream.streamType, stream.isMuted)
      })

      await stage.join()
      
    } catch (err: any) {
      setError(`Failed to join stage: ${err.message}`)
      setStatus('Not connected')
      console.error(err)
      
      if (stageRef.current) {
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
        setIsPlaying(false)
        setStatus('Not connected')
        setBroadcasterUserId('')
        setVideoStream(null)
        setAudioStream(null)
      }
    } catch (err: any) {
      setError(`Failed to leave stage: ${err.message}`)
      console.error(err)
    }
  }

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  const toggleMute = () => {
    const newMutedState = !isMuted
    setIsMuted(newMutedState)
    if (audioRef.current) {
      audioRef.current.muted = newMutedState
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
          <h1 className="text-4xl font-bold text-white">Watch Stage (Real-Time)</h1>
          <p className="text-slate-300 mt-2">Watch live streams with ultra-low latency (sub-300ms)</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Player Panel */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800 rounded-lg p-6 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-4">Live Stream</h2>
              <div 
                className="bg-black rounded aspect-video flex items-center justify-center overflow-hidden relative"
              >
                {videoStream && (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-contain"
                  />
                )}
                {audioStream && (
                  <audio
                    ref={audioRef}
                    autoPlay
                  />
                )}
                {!isPlaying && (
                  <p className="text-slate-400 absolute">
                    {isConnected ? 'Waiting for broadcaster...' : 'Stream will appear here'}
                  </p>
                )}
              </div>

              {/* Player Controls */}
              {isPlaying && (
                <div className="mt-4 bg-slate-700 rounded p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={leaveStage}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
                      >
                        Stop Watching
                      </button>
                      
                      <button
                        onClick={toggleMute}
                        className="text-white hover:text-blue-400 transition-colors"
                      >
                        {isMuted ? (
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>

                      {broadcasterUserId && (
                        <span className="text-slate-300 text-sm">
                          Broadcasting: <span className="text-blue-400">{broadcasterUserId}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 flex-1 max-w-xs">
                      <span className="text-white text-sm">Volume:</span>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                        className="flex-1"
                      />
                      <span className="text-white text-sm w-12">{Math.round(volume * 100)}%</span>
                    </div>
                  </div>
                </div>
              )}

              {isPlaying && (
                <div className="mt-4 text-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-900/50 text-green-300 border border-green-500">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                    Live • Ultra-Low Latency
                  </span>
                </div>
              )}
            </div>
          </div>

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
                    placeholder="Paste your participant token with SUBSCRIBE capability"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono text-xs"
                    rows={4}
                    disabled={isConnected}
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Get this from AWS Console (Stage → Create Token)
                  </p>
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
                  <span className="text-slate-300">Stage:</span>
                  <span className={`font-semibold ${
                    isPlaying ? 'text-green-400' : 
                    isConnected ? 'text-yellow-400' : 
                    'text-slate-400'
                  }`}>
                    {status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Stream:</span>
                  <span className={`font-semibold ${isPlaying ? 'text-green-400' : 'text-slate-400'}`}>
                    {isPlaying ? 'Playing' : 'Not Playing'}
                  </span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="bg-slate-800 rounded-lg p-6 shadow-xl">
              {!isConnected ? (
                <button
                  onClick={joinStage}
                  disabled={!isInitialized || !participantToken}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-3 px-4 rounded transition-colors"
                >
                  Join Stage
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
                <li>SUBSCRIBE capability (watch only)</li>
                <li>No PUBLISH needed</li>
                <li>Get from AWS IVS Console</li>
              </ul>
            </div>

            {/* Latency Info */}
            <div className="bg-purple-900/30 border border-purple-500 rounded-lg p-4">
              <h3 className="text-purple-300 font-semibold mb-2">Real-Time Streaming:</h3>
              <p className="text-purple-200 text-sm">
                Experience ultra-low latency streaming with delays under 300ms - perfect for interactive experiences!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

