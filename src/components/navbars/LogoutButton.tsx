/* Archivo: src\components\ui\Navbars\LogoutButton.tsx
  Descripción: Botón para cerrar sesión e invocar el flujo de signout. */

// Componente: LogoutButton — botón para cerrar sesión usando next-auth
'use client';

import { signOut } from 'next-auth/react';

interface LogoutButtonProps {
  className?: string;
}

export default function LogoutButton({ className = "" }: LogoutButtonProps) {
  return (
    <a onClick={() => signOut({ redirect: true })} className={`cursor-pointer ${className}`}>
      Cerrar sesión
    </a>
  );
}
