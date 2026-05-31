/* Archivo: src\app\account\profile\layout.tsx
  Descripción: Layout de la sección de perfil del usuario (navegación y estructura interna). */

// Layout para páginas de perfil del usuario; incluye `CourseNavbar` y el contenido del perfil
import CourseNavbar from "@/components/ui/Navbars/CourseNavbar";

export default function ProfilePageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <CourseNavbar />
      {children}
    </>
  );
}
