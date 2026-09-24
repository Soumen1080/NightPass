import type { Metadata } from 'next';
import { Syne, Space_Grotesk } from 'next/font/google';
import './globals.css';

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['400', '600', '700', '800'],
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'NightPass — Private Party on the Blockchain',
  description: 'The ultimate zero-knowledge event ticketing platform. RSVPs stay private until you walk through the door.',
  icons: {
    icon: '/logo.png',
  },
  openGraph: {
    title: 'NightPass',
    description: 'Private events powered by Zero-Knowledge. Your identity stays hidden until you check in.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${spaceGrotesk.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
