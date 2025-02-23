import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import '@livekit/components-styles';
import '@livekit/components-styles/prefabs';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TherapyAI - Your Mental Health Journey",
  description: "A personalized AI-powered therapy platform that helps you track progress, manage sessions, and achieve better mental well-being.",
  keywords: "therapy, mental health, AI therapy, online counseling, mental wellness",
  authors: [{ name: "TherapyAI Team" }],
  openGraph: {
    title: "TherapyAI - Your Mental Health Journey",
    description: "Experience personalized therapy support with AI-powered insights and progress tracking.",
    images: [
      {
        url: "/og-image.png", // Make sure to add this image to your public folder
        width: 1200,
        height: 630,
        alt: "TherapyAI Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TherapyAI - Your Mental Health Journey",
    description: "Experience personalized therapy support with AI-powered insights and progress tracking.",
  },
  manifest: "/manifest.json", // You'll need to create this for PWA support
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta name="apple-mobile-web-app-title" content="TherapyAI" />
        <meta name="application-name" content="TherapyAI" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#146C94" />
        <meta name="msapplication-tap-highlight" content="no" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-full bg-gray-50`}
      >
        <main className="min-h-full">
          {children}
        </main>
      </body>
    </html>
  );
}