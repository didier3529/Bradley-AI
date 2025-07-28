import { ThemeProvider } from "@/components/theme-provider";
import { RootProvider } from "@/lib/providers/root-provider";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title:
    "MEXMA ($MXM) | Advanced Cryptocurrency Analytics & Portfolio Intelligence",
  description:
    "Blockchain analytics platform for market insights, portfolio management, and smart contract security analysis.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/bradley-logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/bradley-logo.png" />
        <link rel="shortcut icon" href="/bradley-logo.png" type="image/png" />
      </head>
      <body
        className="bg-[#1a1a1a] text-white font-mono antialiased"
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
          storageKey="bradley-theme"
        >
          <RootProvider>{children}</RootProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
