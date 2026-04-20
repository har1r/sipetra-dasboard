import { cookies } from "next/headers";
import type { Metadata } from "next";

import "./globals.css";

import { cn } from "@/lib/utils";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { ActiveThemeProvider } from "@/components/active-theme";
import { AudioProvider } from "@/components/providers/audio-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Sipetra Dashboard",
  description:
    "A fully responsive analytics dashboard featuring dynamic charts, interactive tables, a collapsible sidebar, and a light/dark mode theme switcher. Built with modern web technologies, it ensures seamless performance across devices, offering an intuitive user interface for data visualization and exploration.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const activeThemeValue = cookieStore.get("active_theme")?.value;
  const isScaled = activeThemeValue?.endsWith("-scaled");

  const isDarkMode = activeThemeValue?.includes("dark");

  return (
    <ClerkProvider
      afterSignOutUrl="/sign-in"
      appearance={{
        baseTheme: isDarkMode ? dark : undefined,
      }}
    >
      <html lang="en" suppressHydrationWarning className="h-full">
        <body
          className={cn(
            "bg-background overscroll-none font-sans antialiased",
            activeThemeValue ? `theme-${activeThemeValue}` : "",
            isScaled ? "theme-scaled" : "",
          )}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            enableColorScheme
          >
            <ActiveThemeProvider initialTheme={activeThemeValue}>
              <AudioProvider>{children}</AudioProvider>
            </ActiveThemeProvider>
          </ThemeProvider>
          <Toaster position="top-center" />
        </body>
      </html>
    </ClerkProvider>
  );
}
