import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/components/providers/convex-client-provider";
import { OnlineStatusTracker } from "@/components/providers/online-status-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Taras Chat App",
  description: "Real-time chat application for Taras Coding Challenge",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    /** * suppressHydrationWarning is required for next-themes 
     * because it modifies the html class before hydration.
     */
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ConvexClientProvider>
            {/* OnlineStatusTracker must be inside ConvexClientProvider 
              to access useMutation 
            */}
            <OnlineStatusTracker>
              {children}
            </OnlineStatusTracker>
          </ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}