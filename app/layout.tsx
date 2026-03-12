import type { Metadata } from 'next'
import Script from 'next/script'
import { Analytics } from "@vercel/analytics/next"
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
      <head>
        {/* <!-- Google tag (gtag.js) --> */}
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-1YEHVXTK3D"></Script>
        <Script id="google-analytics" strategy="afterInteractive">
          { `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-1YEHVXTK3D');
          `}
        </Script>
      </head>
      <body>
        <ClientLayout>
          { children }
          <Analytics />
        </ClientLayout>
      </body>
    </html>
  );
}
