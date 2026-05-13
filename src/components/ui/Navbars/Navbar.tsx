'use client';

import Link from 'next/link';
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { IconList } from "@tabler/icons-react";
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
            <div className="navbar-center hidden lg:flex ">
                <ul className="menu menu-horizontal px-1">
                    <li>
                        <Link href="#top" className="btn btn-ghost">Inicio</Link>
                    </li>
                    <li>
                        <Link href="#features" className="btn btn-ghost">Herramientas</Link>
                    </li>
                    <li>
                        <Link href="#pricing" className="btn btn-ghost">Precios</Link>
                    </li>
                    <li>
                        <Link href="#about" className="btn btn-ghost">Acerca de</Link>
                    </li>
                </ul>
            </div>


            <div className="navbar-end gap-2">
                <ThemeSwitcher />

                <a
                    href="/mycourses"
                    className="btn btn-primary hidden md:inline-flex">
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
                                <li><Link href="#top" onClick={() => document.getElementById('my-drawer-5')?.click()}>Inicio</Link></li>
                                <li><Link href="#features" onClick={() => document.getElementById('my-drawer-5')?.click()}>Herramientas</Link></li>
                                <li><Link href="#pricing" onClick={() => document.getElementById('my-drawer-5')?.click()}>Precios</Link></li>
                                <li><Link href="#about" onClick={() => document.getElementById('my-drawer-5')?.click()}>Acerca de</Link></li>
                                <div className="divider"></div>
                                <li><Link href="/mycourses" className="btn btn-primary text-white">Mis cursos</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}