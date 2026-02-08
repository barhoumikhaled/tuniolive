import type { Metadata } from 'next'
import '../styles/globals.css'
import ClientLayout from './layout.client'

export const metadata: Metadata = {
  title: 'TuniOlive - Premium Mediterranean Olive Oil From Tunisia',
  description: 'Experience the finest extra virgin olive oil, cold-pressed from centuries-old groves in the heart of the Mediterranean.',
  keywords: 'olive oil, extra virgin, Mediterranean, organic, premium, Tuscan, Greek, Spanish',
  icons: {
    icon: "/TuniOlive-favicon.png",
    shortcut: "/TuniOlive-favicon.png",
    apple: "/TuniOlive-favicon.png",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>
          { children }
        </ClientLayout>
      </body>
    </html>
  );
}
