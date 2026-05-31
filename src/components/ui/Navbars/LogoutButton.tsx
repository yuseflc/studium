'use client';

import { signOut } from 'next-auth/react';

export default function LogoutButton() {
  return (
    <a onClick={() => signOut({ redirect: true })} className="cursor-pointer">
      Cerrar sesión
    </a>
  );
}
