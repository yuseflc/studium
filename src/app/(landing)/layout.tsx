/* Archivo: src\app\(landing)\layout.tsx
  Descripción: Layout público de la landing: cabecera, hero y footer para la página principal. */

// Layout de la landing pública: incluye la barra de navegación y renderiza el contenido principal
import Navbar from "@/components/ui/Navbars/Navbar";

export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
