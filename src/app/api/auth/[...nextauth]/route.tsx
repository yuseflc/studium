/* Archivo: src\app\api\auth\[...nextauth]\route.tsx
   Descripción: Ruta de NextAuth que expone los endpoints de autenticación. */

import NextAuth from 'next-auth'
import { authOptions } from '@/config/auth.config'

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };