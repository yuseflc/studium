/* Archivo: src\config\fonts.ts
    Descripción: Declaración y configuración de las fuentes tipográficas usadas por la aplicación. */

// Configuración de fuentes Next.js (Manrope y Google Sans) para uso global
import { Manrope, Google_Sans } from "next/font/google";
const manrope = Manrope({
    variable: "--font-manrope",
    subsets: ["latin"],
});

const googleSans = Google_Sans({
    variable: "--font-google-sans",
    subsets: ["latin"],
});

export { manrope, googleSans };