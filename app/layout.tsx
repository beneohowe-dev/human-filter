import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "Human Filter - LinkedIn Draft Cleaner",
    template: "%s - Human Filter"
  },
  description: "A simple LinkedIn draft cleaner that turns AI-ish writing into a more human post.",
  applicationName: "Human Filter",
  manifest: "/manifest.json",
  openGraph: {
    title: "Human Filter",
    description: "Make LinkedIn drafts sound human.",
    type: "website"
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Human Filter"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f3f2ef"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
