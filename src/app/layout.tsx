import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BookYourService - Find & Book Professional Services",
  description: "Connect with trusted professionals for all your service needs. Quality services, verified providers, and seamless booking experience.",
  keywords: ["services", "bookings", "professionals", "service marketplace"],
  authors: [{ name: "BookYourService Team" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "BookYourService - Find & Book Professional Services",
    description: "Connect with trusted professionals for all your service needs",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BookYourService - Find & Book Professional Services",
    description: "Connect with trusted professionals for all your service needs",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
