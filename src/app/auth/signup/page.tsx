/* Archivo: src\app\auth\signup\page.tsx
  Descripción: Página de registro que renderiza el formulario de signup y navegación relacionada. */

import { Suspense } from 'react';
import SignUpForm from "@/components/auth/SignUpForm";

export const metadata = {
  title: "Registro | Studium",
  description: "Crea tu cuenta en la plataforma educativa Studium",
};


export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <SignUpForm />
    </Suspense>
  );
}