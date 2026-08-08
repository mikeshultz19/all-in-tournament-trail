import type { Metadata } from "next";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import FeedbackWidget from "@/components/FeedbackWidget";
import Footer from "@/components/Footer";
import WebsiteAnalyticsTracker from "@/components/WebsiteAnalyticsTracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://allintrail.com"),
  title: {
    default: "All-In Tournament Trail",
    template: "%s | All-In Tournament Trail",
  },
  description:
    "Texas team bass tournament trail featuring tournament schedules, results, AOY standings, rules, registration information, and event updates.",
  alternates: {
    canonical: "/",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
  <WebsiteAnalyticsTracker />
  <div className="flex-1">
    {children}
  </div>

  <Footer />
  <FeedbackWidget />
</body>
    </html>
  );
}
