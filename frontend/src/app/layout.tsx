import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "../contexts/auth-context"
import { cn } from "@/lib/utils"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "500", "600", "700", "900"],
})

export const metadata: Metadata = {
  title: "FormCraft - Professional Form Builder",
  description: "Create, manage, and analyze feedback forms with real-time analytics",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={cn(inter.variable, "bg-background")}>
      <body className="font-inter antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
