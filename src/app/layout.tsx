import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WallpaperEngine } from "@/components/WallpaperEngine";
import { PWA } from "@/components/PWA";
import { LatencyMonitor } from "@/components/LatencyMonitor";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Santa Eufemia - Photo Gallery",
  description: "Festa Photography Collection - Santa Eufemia 2024",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Santa Eufemia",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <LatencyMonitor />
        <WallpaperEngine />
        <PWA />
        {children}
      </body>
    </html>
  );
}
