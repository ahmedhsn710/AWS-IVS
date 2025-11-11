import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AWS IVS Streaming App',
  description: 'Browser-based live streaming with AWS IVS',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

