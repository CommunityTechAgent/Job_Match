import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { SessionLoader } from "@/components/auth/session-loader"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "JobMatch AI - AI-Powered Job Matching Platform",
  description: "Find your perfect job match with AI-powered recommendations and automated applications.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <SessionLoader>
            {children}
            <Toaster />
          </SessionLoader>
        </AuthProvider>
      </body>
    </html>
  )
}
