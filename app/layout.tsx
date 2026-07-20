import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import FeedbackWidget from "@/components/FeedbackWidget";
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
  title: "All-In Tournament Trail",
  description:
    "Texas team bass tournament trail featuring tournament schedules, results, AOY standings, rules, registration information, and event updates.",
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
  <div className="flex-1">
    {children}
  </div>

  <Footer />
  <FeedbackWidget />
</body>
    </html>
  );
}
