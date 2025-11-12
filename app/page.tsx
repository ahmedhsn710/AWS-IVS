import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">
              AWS IVS Streaming App
            </h1>
            <p className="text-xl text-slate-300">
              Browser-based live streaming powered by Amazon Interactive Video Service
            </p>
          </div>

          {/* Real-Time Streaming (IVS Stage) - NEW */}
          <div className="mb-16">
            <div className="flex items-center mb-6">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
              <h2 className="text-3xl font-bold text-white px-6">Real-Time Streaming</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
            </div>
            <p className="text-center text-slate-300 mb-8">
              Ultra-low latency streaming with IVS Stage (sub-300ms) - Perfect for real-time interactions
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Stage Broadcaster Card */}
              <Link href="/stage-broadcast">
                <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-lg shadow-xl p-8 hover:shadow-2xl transition-all cursor-pointer border-2 border-purple-600 hover:border-purple-400">
                  <div className="text-center">
                    <div className="bg-purple-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <circle cx="10" cy="10" r="8" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Stage Broadcasting
                    </h2>
                    <p className="text-purple-200 mb-3">
                      Broadcast in real-time with ultra-low latency
                    </p>
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-500 text-white">
                      ⚡ Sub-300ms latency
                    </div>
                  </div>
                </div>
              </Link>

              {/* Stage Viewer Card */}
              <Link href="/stage-watch">
                <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-lg shadow-xl p-8 hover:shadow-2xl transition-all cursor-pointer border-2 border-purple-600 hover:border-purple-400">
                  <div className="text-center">
                    <div className="bg-purple-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M6 4l10 6-10 6V4z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Watch Stage
                    </h2>
                    <p className="text-purple-200 mb-3">
                      Watch real-time streams with minimal delay
                    </p>
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-500 text-white">
                      🚀 Real-time experience
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Traditional Channel Streaming */}
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
              <h2 className="text-3xl font-bold text-white px-6">Channel Streaming</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
            </div>
            <p className="text-center text-slate-300 mb-8">
              Low-latency streaming with IVS Channels (3-5 second latency) - Great for broadcasting to large audiences
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Broadcaster Card */}
              <Link href="/broadcast">
                <div className="bg-white rounded-lg shadow-xl p-8 hover:shadow-2xl transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-500">
                  <div className="text-center">
                    <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-red-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <circle cx="10" cy="10" r="8" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">
                      Start Broadcasting
                    </h2>
                    <p className="text-slate-600 mb-3">
                      Stream live from your browser using your camera and microphone
                    </p>
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                      📡 Traditional streaming
                    </div>
                  </div>
                </div>
              </Link>

              {/* Viewer Card */}
              <Link href="/watch">
                <div className="bg-white rounded-lg shadow-xl p-8 hover:shadow-2xl transition-shadow cursor-pointer border-2 border-transparent hover:border-green-500">
                  <div className="text-center">
                    <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-green-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M6 4l10 6-10 6V4z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">
                      Watch Stream
                    </h2>
                    <p className="text-slate-600 mb-3">
                      View live streams with ultra-low latency playback
                    </p>
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                      🎥 HLS playback
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Comparison */}
          <div className="bg-slate-700/50 backdrop-blur rounded-lg p-8 text-white mb-8">
            <h3 className="text-2xl font-bold mb-6 text-center">Which one should I use?</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-purple-900/30 border border-purple-500 rounded-lg p-6">
                <h4 className="text-xl font-bold text-purple-300 mb-3">Use Real-Time Stage When:</h4>
                <ul className="space-y-2 text-purple-200 text-sm">
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>You need sub-300ms latency</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Interactive experiences are critical</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Real-time feedback is important</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Audience size is moderate (&lt;10k viewers)</span>
                  </li>
                </ul>
              </div>
              <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-6">
                <h4 className="text-xl font-bold text-blue-300 mb-3">Use Channel Streaming When:</h4>
                <ul className="space-y-2 text-blue-200 text-sm">
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>3-5 second latency is acceptable</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Broadcasting to large audiences</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>One-way communication</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Lower cost per viewer</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-slate-700/50 backdrop-blur rounded-lg p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Getting Started</h3>
            
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-purple-300 mb-3">For Real-Time Stage Streaming:</h4>
              <ol className="space-y-3 text-slate-200">
                <li className="flex items-start">
                  <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                    1
                  </span>
                  <span>
                    Create an AWS IVS Stage in the AWS Console
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                    2
                  </span>
                  <span>
                    Generate participant tokens (PUBLISH+SUBSCRIBE for broadcaster, SUBSCRIBE for viewers)
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                    3
                  </span>
                  <span>
                    Use the Stage Broadcasting/Watch pages with your tokens
                  </span>
                </li>
              </ol>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-blue-300 mb-3">For Channel Streaming:</h4>
              <ol className="space-y-3 text-slate-200">
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                    1
                  </span>
                  <span>
                    Create an AWS IVS Channel and note the Ingest Server, Stream Key, and Playback URL
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                    2
                  </span>
                  <span>
                    Go to the Broadcast page and enter your Ingest Server and Stream Key
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                    3
                  </span>
                  <span>
                    Go to the Watch page and enter your Playback URL
                  </span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

