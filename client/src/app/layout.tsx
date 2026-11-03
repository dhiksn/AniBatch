import type { Metadata, Viewport } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "AniBatch — Anime Batch Sub Indo",
  description: "AniBatch - Nonton dan download anime batch subtitle indonesia",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon0.svg", type: "image/svg+xml" },
      { url: "/icon1.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AniBatch",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0c1118",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Momo+Trust+Display&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Geologica:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-dvh flex flex-col overflow-x-clip" style={{background: 'var(--color-paper)', color: 'var(--color-ink)'}}>
        <Navbar />
        <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-4 sm:pt-8 pb-[calc(2rem+env(safe-area-inset-bottom))]">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
