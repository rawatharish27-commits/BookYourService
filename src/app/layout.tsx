import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BookYourService - Professional Service Hub",
  description: "Book trusted professional services in your area. Instant booking, verified providers, and secure payments.",
  keywords: ["BookYourService", "services", "booking", "home services", "professional services", "verified providers"],
  authors: [{ name: "BookYourService" }],
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.png", type: "image/png", sizes: "1024x1024" },
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.png",
    apple: "/logo.svg",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "BookYourService - Professional Service Hub",
    description: "Book trusted professional services in your area",
    url: "https://bookyourservice.com",
    siteName: "BookYourService",
    type: "website",
    images: [
      {
        url: "/logo.svg",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BookYourService",
    description: "Book trusted professional services",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
