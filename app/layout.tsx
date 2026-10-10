import type { Metadata, Viewport } from "next";
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
  title: "Skill Setu — Labor Market Intelligence",
  description:
    "Real-time Labor Market Intelligence for India. Calibrate your skills, benchmark them against live SerpApi job market data, and export verifiable Open Badges 3.0 credentials.",
  applicationName: "Skill Setu",
  authors: [{ name: "Skill Setu" }],
  keywords: [
    "labor market intelligence",
    "skill gap analysis",
    "Open Badges 3.0",
    "SerpApi",
    "India",
  ],
  openGraph: {
    title: "Skill Setu — Labor Market Intelligence",
    description:
      "Benchmark your skills against the live Indian job market and export verifiable credentials.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#020617",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-black font-sans text-zinc-100 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
