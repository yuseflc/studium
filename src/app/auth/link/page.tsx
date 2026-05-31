/* Archivo: src\app\auth\link\page.tsx
  Descripción: Página que gestiona la autenticación por enlace mágico (magic link) enviada por email. */

import { Suspense } from 'react';
import LinkForm from '@/components/auth/LinkForm';

function LinkFormContent() {
  return <LinkForm />;
}

export default function LinkPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <LinkFormContent />
    </Suspense>
  );
}