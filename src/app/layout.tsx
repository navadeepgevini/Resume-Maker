import type { Metadata } from 'next';
import { Inter, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import { ResumeProvider } from '@/context/ResumeContext';
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const plexSans = IBM_Plex_Sans({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-plex-sans',
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Resume Maker — Build a Polished, ATS-Friendly Resume',
  description:
    'Create a professional, single-page resume with our guided step-by-step builder. Download as Word (.docx) or PDF.',
  openGraph: {
    title: 'Resume Maker — Build a Polished, ATS-Friendly Resume',
    description: 'Create a professional, single-page resume with our guided step-by-step builder. Download as Word (.docx) or PDF.',
    url: 'https://resumemaker.example.com',
    siteName: 'Resume Maker',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Resume Maker Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Resume Maker — Build a Polished, ATS-Friendly Resume',
    description: 'Create a professional, single-page resume with our guided step-by-step builder. Download as Word (.docx) or PDF.',
    images: ['/og-image.jpg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plexSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#FAFAF9] text-[#1C1C1A]">
        <AuthProvider>
          <ResumeProvider>{children}</ResumeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
