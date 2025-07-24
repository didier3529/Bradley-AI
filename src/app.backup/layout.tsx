import MatrixRain from "@/components/effects/matrix-rain"
import { ThemeProvider } from "@/components/theme-provider"
import { RootProvider } from "@/lib/providers/root-provider"
import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Bradley AI</title>
        <meta
          name="description"
          content="AI-powered blockchain analytics platform for market insights, portfolio management, and smart contract security analysis."
        />
        <link rel="icon" href="/bradley-logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/bradley-logo.png" />
        <link rel="shortcut icon" href="/bradley-logo.png" type="image/png" />
      </head>
      <body className="min-h-screen bg-black font-sans antialiased" suppressHydrationWarning>
        {/* Matrix Digital Rain Background */}
        <MatrixRain
          intensity="medium"
          speed="medium"
          enableGlow={true}
          enableFlicker={true}
        />

        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
          storageKey="bradley-ai-theme"
        >
          <RootProvider>
            {children}
          </RootProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
