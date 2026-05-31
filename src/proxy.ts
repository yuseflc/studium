/* Archivo: src\proxy.ts
    Descripción: Proxy utilizado en desarrollo para redirigir peticiones a servicios externos o al backend. */

// Middleware de proxy que aplica autenticación mediante next-auth
// Controla rutas protegidas y permite extender reglas por rol
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(request) {
        const token = request.nextauth.token;
        const { pathname } = request.nextUrl;

        // Lógica personalizada si la necesitas en el futuro
        // Ejemplo: control por roles
        // if (pathname.startsWith("/admin") && token?.role !== "admin") {
        //     return NextResponse.redirect(new URL("/unauthorized", request.url));
        // }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
        pages: {
            signIn: "/auth/login",
        },
    }
);

export const config = {
    matcher: [
        "/account/:path*",
        "/mycourses/:path*",
        "/course/:path*",
        "/api/courses/:path*",
        "/api/units/:path*",
        "/api/resources/:path*",
        "/api/tasks/:path*",
    ],
};