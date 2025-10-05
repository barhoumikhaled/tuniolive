import type { Metadata } from 'next'
import '../styles/globals.css'
import { Toaster } from '@/components/ui/sonner'
import { LanguageProvider } from '@/contexts/language-context'
import AppLayout from '@/components/client-layout'

export const metadata: Metadata = {
  title: 'TuniOlive - Premium Mediterranean Olive Oil',
  description: 'Experience the finest extra virgin olive oil, cold-pressed from centuries-old groves in the heart of the Mediterranean.',
  keywords: 'olive oil, extra virgin, Mediterranean, organic, premium, Tuscan, Greek, Spanish',
  icons: {
    icon: "/tuniolive-favicn-24.png",
    shortcut: "/favicon-32x32.png",
    apple: "/apple-touch-icon.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          { children }
          <Toaster />
        </LanguageProvider>
      </body>
    </html>
  )
}