/* Archivo: src\app\(landing)\page.tsx
  Descripción: Página de aterrizaje principal (hero, features y llamada a la acción). */

// Página pública (landing) que compone Hero, Features, Pricing y Footer
import Hero from "@/components/sections/Hero";
import Features from "@/components/sections/Features";
import Pricing from "@/components/sections/Pricing";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <main className="flex-1 bg-base-100 h-full">
      <Hero />
      <Features />
      <Pricing />
      <Footer />
    </main>
  );
}
