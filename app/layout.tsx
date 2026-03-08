import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bullseye",
  description:
    "Lost & Found site for FBLA 2025-2026 Website Coding & Development Event",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <Navbar />
        {children}
        <Toaster />
        <Script
          src="https://cdn.userway.org/widget.js"
          data-account="0o85Fh00uC"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
