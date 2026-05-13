import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./styles.css";
import Script from "next/script";

const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nexora Chai | The Ultimate Creator Support Platform for Africa",
  description: "Frictionless creator payments for Africa. Support your favorite developers, designers, and writers via M-Pesa and Card. Start your creator journey today.",
  keywords: ["creator economy", "kenya", "m-pesa", "africa", "monetization", "support creators", "nexora", "chai"],
  authors: [{ name: "Nexora Creatives" }],
  metadataBase: new URL('https://chai.nexoracreatives.co.ke'),
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: "Nexora Chai | Support African Creators",
    description: "Frictionless creator payments for Africa. Receive tips via M-Pesa instantly.",
    url: 'https://chai.nexoracreatives.co.ke',
    siteName: 'Nexora Chai',
    images: [
      {
        url: '/login-visual.png',
        width: 1200,
        height: 630,
        alt: 'Nexora Chai - Supporting African Creativity',
      },
    ],
    locale: 'en_KE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Nexora Chai | Support African Creators",
    description: "Frictionless creator payments for Africa. Receive tips via M-Pesa instantly.",
    images: ['/login-visual.png'],
  },
};

import Toaster from "@/components/Toaster";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={outfit.className}>
      <head>
        <Script
          src="https://js.paystack.co/v1/inline.js"
          strategy="beforeInteractive"
        />
        <link rel="canonical" href="https://chai.nexoracreatives.co.ke" />
      </head>
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
