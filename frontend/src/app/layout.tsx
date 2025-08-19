import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "500", "600", "700", "900"],
})

export const metadata: Metadata = {
  title: "FormCraft - Professional Form Builder",
  description: "Create, manage, and analyze feedback forms with real-time analytics",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-inter antialiased">{children}</body>
    </html>
  )
}
