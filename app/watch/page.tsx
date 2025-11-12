'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

// IVS Player types
interface IVSPlayer {
  attachHTMLVideoElement: (videoElement: HTMLVideoElement) => void
  load: (url: string) => void
  play: () => void
  pause: () => void
  setVolume: (volume: number) => void
  getVolume: () => number
  setMuted: (muted: boolean) => void
  getMuted: () => boolean
  delete: () => void
  addEventListener: (event: string, callback: (event: any) => void) => void
  removeEventListener: (event: string, callback: (event: any) => void) => void
  // Low-latency configuration methods
  setLiveLowLatencyEnabled: (enabled: boolean) => void
  setAutoplay: (enabled: boolean) => void
  setRebufferToLive: (enabled: boolean) => void
}

declare global {
  interface Window {
    IVSPlayer: {
      create: () => IVSPlayer
      isPlayerSupported: boolean
      PlayerState: {
        IDLE: string
        READY: string
        PLAYING: string
        BUFFERING: string
        ENDED: string
      }
      PlayerEventType: {
        INITIALIZED: string
        READY: string
        PLAYING: string
        BUFFERING: string
        IDLE: string
        ENDED: string
        ERROR: string
        TEXT_METADATA_CUE: string
        DURATION_CHANGED: string
        QUALITY_CHANGED: string
      }
    }
  }
}

export default function WatchPage() {
  // Load from environment variables if available
  const [playbackUrl, setPlaybackUrl] = useState(
    typeof window !== 'undefined' && process.env.NEXT_PUBLIC_IVS_PLAYBACK_URL 
      ? process.env.NEXT_PUBLIC_IVS_PLAYBACK_URL 
      : ''
  )
  const [isPlaying, setIsPlaying] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [playerState, setPlayerState] = useState('IDLE')
  const [error, setError] = useState('')
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)

  const playerRef = useRef<IVSPlayer | null>(null)
  const videoContainerRef = useRef<HTMLDivElement>(null)
  const videoElementRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    // Load IVS Player SDK (using latest version for best low-latency performance)
    const script = document.createElement('script')
    script.src = 'https://player.live-video.net/1.32.0/amazon-ivs-player.min.js'
    script.async = true
    script.onload = () => {
      if (window.IVSPlayer?.isPlayerSupported) {
        setIsInitialized(true)
      } else {
        setError('IVS Player is not supported in this browser')
      }
    }
    script.onerror = () => {
      setError('Failed to load AWS IVS Player SDK')
    }
    document.body.appendChild(script)

    return () => {
      if (playerRef.current) {
        playerRef.current.delete()
      }
    }
  }, [])

  const initializePlayer = () => {
    if (!window.IVSPlayer || playerRef.current) return

    try {
      // Create video element
      const videoElement = document.createElement('video')
      videoElement.setAttribute('playsinline', '')
      videoElement.style.width = '100%'
      videoElement.style.height = '100%'
      videoElement.style.objectFit = 'contain'
      
      // Append video element to container
      if (videoContainerRef.current) {
        videoContainerRef.current.innerHTML = ''
        videoContainerRef.current.appendChild(videoElement)
      }
      
      videoElementRef.current = videoElement
      
      // Create IVS player with low-latency configuration
      const player = window.IVSPlayer.create()
      player.attachHTMLVideoElement(videoElement)
      
      // Enable low-latency mode for minimal delay
      // This is CRITICAL for achieving 2-4 second latency
      player.setLiveLowLatencyEnabled(true)
      
      // Set autoplay with minimal initial buffering for faster startup
      player.setAutoplay(true)
      
      // Set rebuffer to target minimal latency
      // Lower values = lower latency but may increase rebuffering
      player.setRebufferToLive(true)
      
      playerRef.current = player

      // Set up event listeners
      player.addEventListener(window.IVSPlayer.PlayerEventType.INITIALIZED, () => {
        console.log('Player initialized')
      })

      player.addEventListener(window.IVSPlayer.PlayerEventType.READY, () => {
        console.log('Player ready')
        setPlayerState('READY')
      })

      player.addEventListener(window.IVSPlayer.PlayerEventType.PLAYING, () => {
        console.log('Player playing')
        setPlayerState('PLAYING')
        setIsPlaying(true)
        setError('')
      })

      player.addEventListener(window.IVSPlayer.PlayerEventType.BUFFERING, () => {
        console.log('Player buffering')
        setPlayerState('BUFFERING')
      })

      player.addEventListener(window.IVSPlayer.PlayerEventType.IDLE, () => {
        console.log('Player idle')
        setPlayerState('IDLE')
        setIsPlaying(false)
      })

      player.addEventListener(window.IVSPlayer.PlayerEventType.ENDED, () => {
        console.log('Stream ended')
        setPlayerState('ENDED')
        setIsPlaying(false)
      })

      player.addEventListener(window.IVSPlayer.PlayerEventType.ERROR, (err: any) => {
        console.error('Player error:', err)
        setError(`Player error: ${err.message || 'Unknown error'}`)
        setPlayerState('ERROR')
        setIsPlaying(false)
      })

    } catch (err: any) {
      setError(`Failed to initialize player: ${err.message}`)
      console.error(err)
    }
  }

  const startPlayback = () => {
    if (!playbackUrl) {
      setError('Please enter a Playback URL')
      return
    }

    if (!playerRef.current) {
      initializePlayer()
    }

    try {
      setError('')
      if (playerRef.current) {
        playerRef.current.load(playbackUrl)
        playerRef.current.play()
      }
    } catch (err: any) {
      setError(`Failed to start playback: ${err.message}`)
      console.error(err)
    }
  }

  const stopPlayback = () => {
    if (playerRef.current) {
      playerRef.current.pause()
      setIsPlaying(false)
    }
  }

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    if (playerRef.current) {
      playerRef.current.setVolume(newVolume)
    }
  }

  const toggleMute = () => {
    const newMutedState = !isMuted
    setIsMuted(newMutedState)
    if (playerRef.current) {
      playerRef.current.setMuted(newMutedState)
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
          <h1 className="text-4xl font-bold text-white">Watch Stream</h1>
          <p className="text-slate-300 mt-2">View live streams with ultra-low latency</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Player Panel */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800 rounded-lg p-6 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-4">Player</h2>
              <div 
                ref={videoContainerRef}
                className="bg-black rounded aspect-video flex items-center justify-center overflow-hidden"
                style={{ position: 'relative' }}
              >
                {!isPlaying && (
                  <p className="text-slate-400 absolute">Stream will appear here</p>
                )}
              </div>

              {/* Player Controls */}
              {isPlaying && (
                <div className="mt-4 bg-slate-700 rounded p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={stopPlayback}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
                      >
                        Stop
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
                    Playback URL
                  </label>
                  <input
                    type="text"
                    value={playbackUrl}
                    onChange={(e) => setPlaybackUrl(e.target.value)}
                    placeholder="https://abc123.us-west-2.playback.live-video.net/api/..."
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    disabled={isPlaying}
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Get this from your IVS channel in AWS Console
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
                  <span className="text-slate-300">Player:</span>
                  <span className={`font-semibold ${
                    playerState === 'PLAYING' ? 'text-green-400' : 
                    playerState === 'BUFFERING' ? 'text-yellow-400' : 
                    playerState === 'ERROR' ? 'text-red-400' : 
                    'text-slate-400'
                  }`}>
                    {playerState}
                  </span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="bg-slate-800 rounded-lg p-6 shadow-xl">
              {!isPlaying ? (
                <button
                  onClick={startPlayback}
                  disabled={!isInitialized || !playbackUrl}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-3 px-4 rounded transition-colors"
                >
                  Start Watching
                </button>
              ) : (
                <button
                  onClick={stopPlayback}
                  className="w-full bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded transition-colors"
                >
                  Stop Watching
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
              <h3 className="text-blue-300 font-semibold mb-2">How to get Playback URL:</h3>
              <ol className="text-blue-200 text-sm space-y-1 list-decimal list-inside">
                <li>Go to AWS Console</li>
                <li>Navigate to IVS</li>
                <li>Select your channel</li>
                <li>Copy the Playback URL</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

