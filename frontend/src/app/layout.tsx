import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../contexts/auth-context";
import { Toaster } from "./components/ui/toaster";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "500", "600", "700", "900"],
});

export const metadata: Metadata = {
  title: "FormCraft - AI Form Builder | Create Forms in Minutes",
  description:
    "Build professional AI-powered forms with drag-drop editor. Real-time analytics, unlimited responses. Try FormCraft today!",
  keywords:
    "AI form builder, survey creator, feedback forms, online forms, form analytics, real-time analytics, artificial intelligence forms",
  authors: [{ name: "Charles Inwald" }],
  robots: "index, follow",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(inter.variable, "bg-background")}>        
      <body
        className="font-inter antialiased min-h-screen"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
