import { Orbitron, Sora } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';
import { ReactNode } from 'react';
import NextTopLoader from 'nextjs-toploader';

const sora = Sora({
  variable: '--font-sora',
  subsets: ['latin'],
});

const orbitron = Orbitron({
  variable: '--font-orbitron',
  subsets: ['latin'],
});

export const metadata = {
  title: 'Paystrata',
  description: 'Paystrata - A modern payment solution built on Starknet',
  keywords: ['Paystrata', 'Starknet', 'crypto payments', 'blockchain payments', 'web3'],
  authors: [{ name: 'Paystrata Team' }],
  creator: 'Paystrata',
  publisher: 'Paystrata',
  metadataBase: new URL('https://usePaystrata.com'),
  openGraph: {
    title: 'Paystrata',
    description: 'Paystrata - A modern payment solution built on StarkNet',
    url: 'https://usePaystrata.com',
    siteName: 'Paystrata',
    images: [
      {
        url: '/img/logo.png',
        width: 1200,
        height: 630,
        alt: 'Paystrata',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Paystrata',
    description: 'Paystrata - A modern payment solution built on StarkNet',
    images: ['/img/logo.png'],
    creator: '@Paystrata',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  // verification: {
  //   google: 'your-google-site-verification',
  // },
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={`${sora.variable} ${orbitron.variable} antialiased`}>
        <NextTopLoader 
          color="#a869f4"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #a869f4,0 0 5px #a869f4"
        />
        <Toaster />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
