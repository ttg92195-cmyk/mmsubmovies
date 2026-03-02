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
  title: "HomieTV - Watch Movies & TV Shows Online",
  description: "Stream your favorite movies and TV shows online for free. Watch the latest releases in HD quality.",
  keywords: ["HomieTV", "Movies", "TV Shows", "Streaming", "Watch Online", "Free Movies"],
  authors: [{ name: "HomieTV Team" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "HomieTV - Watch Movies & TV Shows Online",
    description: "Stream your favorite movies and TV shows online for free",
    url: "https://homietv.com",
    siteName: "HomieTV",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HomieTV - Watch Movies & TV Shows Online",
    description: "Stream your favorite movies and TV shows online for free",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
