import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ZK2048',
  description: 'Powered by Starknet',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
