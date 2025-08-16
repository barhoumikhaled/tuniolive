import type { Metadata } from 'next'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: 'Olive Grove - Premium Mediterranean Olive Oil',
  description: 'Experience the finest extra virgin olive oil, cold-pressed from centuries-old groves in the heart of the Mediterranean.',
  keywords: 'olive oil, extra virgin, Mediterranean, organic, premium, Tuscan, Greek, Spanish',
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