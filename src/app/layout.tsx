import type { Metadata } from "next"
import { Geist, Geist_Mono, EB_Garamond } from "next/font/google"
import { Analytics } from "@vercel/analytics/react"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://albuc.com"
  ),
  title: "Albuc",
  description: "Your Personal Library and Notes, Beautifully Organized",
  openGraph: {
    images: "/og.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${ebGaramond.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  )
}
