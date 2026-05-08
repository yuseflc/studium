'use client';

import { IconBell, IconMessageCircle, IconX } from "@tabler/icons-react";
import { NOTIFICACIONES, MENSAJES, USUARIO } from "@/seed/data";
import { useTheme } from "@/components/providers/ThemeProvider";
import ThemeSwitcher from "@/components/ThemeSwitcher";
export default function Navbar() {

    return (
        <div className="navbar bg-transparent hover:bg-base-100/50 backdrop-blur-sm shadow-sm px-4 top-0 sticky z-50 transition-all">
            {/* Logo */}
            <div className="navbar-start">
                <Link href="/" className="btn btn-ghost text-xl text-base-content">
                    Studium
                </Link>
            </div>

            {/* Lista central */}
            <div className="navbar-center">
                <ul className="menu menu-horizontal px-1">
                    <li>
                        <Link href="/" className="btn btn-ghost">Inicio</Link>
                    </li>
                    <li>
                        <Link href="#features" className="btn btn-ghost">Herramientas</Link>
                    </li>
                    <li>
                        <Link href="#pricing" className="btn btn-ghost">Precios</Link>
                    </li>
                    <li>
                        <Link href="#contact" className="btn btn-ghost">Contacto</Link>
                    </li>
                </ul>
            </div>

            {/* Lista izquierda */}
            <div className="navbar-end">
                <ThemeSwitcher />
            </div>

        </div>
    );
}