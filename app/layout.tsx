import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Kanglei AI - Powered by Rakesh Irom',
  description: 'Kanglei AI - A powerful AI assistant with capabilities like ChatGPT, Gemini, Claude, and Perplexity. Founded by Rakesh Irom.',
  generator: 'v0.app',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'Kanglei AI',
    description: 'Advanced AI Assistant founded by Rakesh Irom',
    images: ['/logo.png'],
  },
  verification: {
    google: 'iLWebto6sxDCoc54ur6bgvQUcbYG3K1Gp0lQ9gD5Xbk',
  },
  robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#00FF88',
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  'name': 'Kanglei AI',
  'description': 'Advanced AI Chat Assistant with ChatGPT, Gemini, Claude, and Perplexity capabilities',
  'url': 'https://kangleiai.in',
  'author': {
    '@type': 'Person',
    'name': 'Rakesh Irom'
  },
  'applicationCategory': 'AI Assistant',
  'offers': {
    '@type': 'Offer',
    'price': '0',
    'priceCurrency': 'USD'
  },
  'aggregateRating': {
    '@type': 'AggregateRating',
    'ratingValue': '4.8',
    'ratingCount': '100'
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} bg-slate-950`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased bg-slate-950 text-white">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
