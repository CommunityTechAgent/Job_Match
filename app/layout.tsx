import type React from "react"
import { Inter } from "next/font/google"
import { AuthProvider } from "@/contexts/auth-context"
import { SessionLoader } from "@/components/auth/session-loader"
import ErrorBoundary from "@/components/error-boundary"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "JobMatch AI - AI-Powered Job Discovery",
  description:
    "Transform your job search with AI-powered matching, personalized cover letters, and direct employer connections.",
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
        <ErrorBoundary>
          <AuthProvider>
            <SessionLoader>{children}</SessionLoader>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
