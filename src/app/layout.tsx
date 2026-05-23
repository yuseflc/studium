import type { Metadata } from "next";
import { manrope, googleSans } from "@/config/fonts";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

import SessionProviderLayout from "@/providers/SessionProvider";

export const metadata: Metadata = {
  title: "Studium",
  description: "Plataforma de aprendizaje educativo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${manrope.variable} ${googleSans.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <SessionProviderLayout>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </SessionProviderLayout>
      </body>
    </html>
  );
}
