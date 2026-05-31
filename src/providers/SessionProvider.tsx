/* Archivo: src\providers\SessionProvider.tsx
    Descripción: Proveedor de sesión que envuelve la app, gestiona estado de sesión y auth client-side. */

"use client";
// Proveedor de sesión (next-auth) para envolver la aplicación en cliente
// Asegura que los hooks de sesión funcionen en componentes hijos
import { SessionProvider } from "next-auth/react";

export default function SessionProviderLayout({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            {children}
        </SessionProvider>
    );
}