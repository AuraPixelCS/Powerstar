import type { Metadata } from "next";
import { Schibsted_Grotesk, Hanken_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const schibstedGrotesk = Schibsted_Grotesk({
  variable: "--font-schibsted-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Power Star Freight — Total Logistics, Beautifully Moved",
  description:
    "Power Star Freight delivers total logistics — sea, air, road and rail — beautifully moved, end to end.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${schibstedGrotesk.variable} ${hankenGrotesk.variable} ${ibmPlexMono.variable} antialiased`}
      style={{ background: "#05070d" }}
    >
      <body suppressHydrationWarning style={{ margin: 0, background: "#05070d" }}>
        {children}
      </body>
    </html>
  );
}
