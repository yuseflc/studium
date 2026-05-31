/* Archivo: src\components\ui\Navbars\LogoutButton.tsx
  Descripción: Botón para cerrar sesión e invocar el flujo de signout. */

// Componente: LogoutButton — botón para cerrar sesión usando next-auth
'use client';

import { signOut } from 'next-auth/react';

export default function LogoutButton() {
  return (
    <a onClick={() => signOut({ redirect: true })} className="cursor-pointer">
      Cerrar sesión
    </a>
  );
}
