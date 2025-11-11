import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">
              AWS IVS Streaming App
            </h1>
            <p className="text-xl text-slate-300">
              Browser-based live streaming powered by Amazon Interactive Video Service
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
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
                  <p className="text-slate-600">
                    Stream live from your browser using your camera and microphone
                  </p>
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
                  <p className="text-slate-600">
                    View live streams with ultra-low latency playback
                  </p>
                </div>
              </div>
            </Link>
          </div>

          {/* Instructions */}
          <div className="bg-slate-700/50 backdrop-blur rounded-lg p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Getting Started</h3>
            <ol className="space-y-3 text-slate-200">
              <li className="flex items-start">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  Create an AWS IVS channel in the AWS Console and note the{' '}
                  <strong>Ingest Server</strong>, <strong>Stream Key</strong>, and{' '}
                  <strong>Playback URL</strong>
                </span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  Go to the <strong>Broadcast</strong> page and enter your Ingest Server
                  and Stream Key to start streaming
                </span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  Go to the <strong>Watch</strong> page and enter your Playback URL to
                  view the stream
                </span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}

