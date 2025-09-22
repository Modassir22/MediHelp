import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MediHelp - AI Medicine Recognition',
  description: 'AI-powered medicine recognition system with vector embeddings and voice assistance',
  keywords: ['medicine', 'AI', 'recognition', 'healthcare', 'ML'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full font-roboto">
        {children}
      </body>
    </html>
  )
}