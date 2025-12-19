import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Clara | Boutique officielle",
  description: "Découvrez les produits Clara et commandez facilement en ligne.",
  icons: {
    icon: [
      { url: "/Carla.png", type: "image/png", sizes: "32x32" },
      { url: "/Carla.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [
      { url: "/Carla.png" }
    ]
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
