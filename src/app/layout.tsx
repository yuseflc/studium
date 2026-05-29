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
        {/* 
          Script bloqueante para evitar FOUC (Flash of Unstyled Content).
          
          ¿Por qué es necesario?
          Sin este script, React renderiza el HTML sin data-theme, lo que causa que DaisyUI 
          aplique su tema por defecto (morado antiguo). Luego, cuando React monta, el ThemeProvider 
          cambia al tema correcto del usuario, causando un destello visible muy desagradable.
          
          ¿Qué hace?
          1. Se ejecuta ANTES de que React renderice (en el <head>)
          2. Lee el tema guardado del localStorage del usuario
          3. Si no hay tema guardado, respeta las preferencias del sistema (dark/light)
          4. Aplica inmediatamente el data-theme correcto al <html>
          5. CSS/DaisyUI ya sabe qué tema usar desde el inicio
          6. Resultado: carga sin flash, tema correcto desde el primer momento
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  if (theme) {
                    document.documentElement.setAttribute('data-theme', theme);
                  } else {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'bumblebee');
                  }
                } catch (e) {
                  document.documentElement.setAttribute('data-theme', 'bumblebee');
                }
              })();
            `,
          }}
        />
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
