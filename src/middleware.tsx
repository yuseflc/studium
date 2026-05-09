import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { protectedRoutes } from "@/config/protectedRoutes";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Verificar si la ruta está protegida
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    if (isProtectedRoute) {
        const secret = process.env.NEXTAUTH_SECRET;

        if (!secret) {
            console.error("NEXTAUTH_SECRET no está configurado");
            return NextResponse.redirect(new URL("/auth/login", request.url));
        }

        const token = await getToken({ req: request, secret });

        if (!token) {
            const loginUrl = new URL("/auth/login", request.url);
            loginUrl.searchParams.set("callbackUrl", request.url);
            return NextResponse.redirect(loginUrl);
        }
    }
    return NextResponse.next();
}

export const config = {
    matcher: ["/account/:path*", "/mycourses/:path*", "/course/:path*"],
};