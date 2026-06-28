import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./styles.css";
import Script from "next/script";

const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Talent Jar | The Premium Creator Income & SaaS Platform for Africa",
  description: "The premium creator monetization platform for Africa. Accept tips, launch memberships, sell digital products, gate premium content, and manage custom bookings via M-Pesa and Card.",
  keywords: ["creator economy", "kenya", "m-pesa", "africa", "monetization", "support creators", "digital products storefront", "memberships", "commissions", "gated content", "nexora", "chai", "saas creator platform"],
  authors: [{ name: "Nexora Creatives" }],
  metadataBase: new URL('https://chai.nexoracreatives.co.ke'),
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: "Talent Jar | The Premium Creator Income Platform for Africa",
    description: "The premium SaaS monetization platform for African creators. Accept tips, sell digital products, run memberships, and manage bookings instantly via M-Pesa and Card.",
    url: 'https://chai.nexoracreatives.co.ke',
    siteName: 'Talent Jar',
    images: [
      {
        url: '/login-visual.png',
        width: 1200,
        height: 630,
        alt: 'Talent Jar - Premium Creator SaaS Platform',
      },
    ],
    locale: 'en_KE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Talent Jar | The Premium Creator Income Platform for Africa",
    description: "The premium SaaS monetization platform for African creators. Accept tips, sell digital products, run memberships, and manage bookings instantly via M-Pesa and Card.",
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
