import { Suspense } from 'react';
import SignUpForm from "@/components/auth/SignUpForm";

export const metadata = {
  title: "Registro | Studium",
  description: "Crea tu cuenta en la plataforma educativa Studium",
};

function SignUpFormContent() {
  return <SignUpForm />;
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <SignUpFormContent />
    </Suspense>
  );
}