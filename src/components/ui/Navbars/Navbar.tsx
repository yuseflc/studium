/* Archivo: src\components\ui\Navbars\Navbar.tsx
    Descripción: Barra de navegación principal con enlaces globales y controles de sesión. */

// Componente: Navbar — barra superior global con navegación y ThemeSwitcher
'use client';

import Link from "next/link";
import { IconList } from "@tabler/icons-react";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import Logo from "../Logo";

export default function Navbar() {

    return (
        <div className="navbar bg-transparent hover:bg-base-100/50 backdrop-blur-sm shadow-sm px-4 top-0 sticky z-50 transition-all h-16">
            {/* Logo */}
            <div className="navbar-start">
                <Link href="/" className="inline-flex items-center justify-center p-0 leading-none">
                    <Logo />
                </Link>
            </div>
            

            {/* Lista central */}
            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-1">
                    
                    <li>
                        <Link href="/#top" className="btn btn-ghost" onClick={(e) => { e.preventDefault(); document.getElementById('top')?.scrollIntoView({ behavior: 'smooth' }); }}>Inicio</Link>
                    </li>
                    <li>
                        <Link href="/#features" className="btn btn-ghost" onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }}>Herramientas</Link>
                    </li>
                    <li>
                        <Link href="/#pricing" className="btn btn-ghost" onClick={(e) => { e.preventDefault(); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); }}>Precios</Link>
                    </li>
                </ul>
            </div>

            {/* Lista izquierda */}
            <div className="navbar-end gap-3">
                <ThemeSwitcher />

                <a
                    href="/mycourses"
                    className="btn btn-primary hidden md:inline-flex py-0.5 h-8"
>
                    Mis cursos
                </a>

                <div className="drawer drawer-end w-auto lg:hidden">
                    <input id="my-drawer-5" type="checkbox" className="drawer-toggle" />
                    <div className="drawer-content">
                        <label htmlFor="my-drawer-5" className="btn btn-ghost btn-circle">
                            <IconList size={24} />
                        </label>
                    </div>
                    <div className="drawer-side">
                        <label htmlFor="my-drawer-5" aria-label="close sidebar" className="drawer-overlay"></label>
                        <div className="menu bg-base-200 min-h-full w-80 p-6 text-base-content">
                            <h2 className="text-xl font-bold mb-4">Menú</h2>
                            <ul className="flex flex-col gap-2">
                                <li><Link href="#top" onClick={(e) => { e.preventDefault(); document.getElementById('top')?.scrollIntoView({ behavior: 'smooth' }); document.getElementById('my-drawer-5')?.click(); }}>Inicio</Link></li>
                                <li><Link href="#features" onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); document.getElementById('my-drawer-5')?.click(); }}>Herramientas</Link></li>
                                <li><Link href="#pricing" onClick={(e) => { e.preventDefault(); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); document.getElementById('my-drawer-5')?.click(); }}>Precios</Link></li>
                                <li><Link href="#about" onClick={() => document.getElementById('my-drawer-5')?.click()}>Acerca de</Link></li>
                                <li aria-hidden="true" className="divider" />
                                <li><Link href="/mycourses" className="btn btn-primary text-white">Mis cursos</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}