/* Archivo: src\app\auth\link\layout.tsx
  Descripción: Layout para páginas relacionadas con el enlace mágico (magic link). */

import Navbar from '@/components/ui/navbars/Navbar';
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