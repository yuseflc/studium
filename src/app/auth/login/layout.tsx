/* Archivo: src\app\auth\login\layout.tsx
  Descripción: Layout para la sección de login, aporta estructura y estilos comunes. */

import Navbar from '@/components/ui/Navbars/Navbar';
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-base-300">
      <Navbar />
      {children}
    </div>
  );
}