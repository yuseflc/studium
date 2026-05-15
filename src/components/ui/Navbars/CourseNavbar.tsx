import { IconBell, IconMessageCircle, IconX, IconMenu2, IconChevronDown } from "@tabler/icons-react";
import { NOTIFICACIONES, MENSAJES } from "@/seed/data";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/config/auth.config";
import { connectDB } from "@/lib/database/database";
import { User } from "@/models/index";
import LogoutButton from "./LogoutButton";
import ProfileImage from "./ProfileImage";
import { LOGGER } from "@/config/logger";

export default async function CourseNavbar() {
    const session = await getServerSession(authOptions);
    let user = null;

    if (session?.user) {
        await connectDB();
        user = await User.findOne({ _id: session.user.id });
    }

    const cursosDisponibles = [
        "Diseño de Interfaces Web", "Despliegue de Aplicaciones web",
        "Desarrollo Web en Entorno Cliente", "Desarrollo Web en Entorno Servidor",
        "Shell Script", "Digitalización"
    ];

    return (
        <header className="sticky top-0 z-[100] w-full">
            {/* --- NAVBAR PRINCIPAL (Siempre arriba) --- */}
            <nav className="navbar bg-base-100/80 backdrop-blur-md shadow-sm px-4 h-16 border-b border-base-300">
                <div className="flex-1">
                    <a className="btn btn-ghost text-xl text-base-content" href="/">Studium</a>
                </div>

                <div className="flex flex-row gap-1 items-center">
                    <div className="hidden md:block mr-2">
                        <ThemeSwitcher />
                    </div>

                    {/* Notificaciones */}
                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle text-base-content">
                            <div className="indicator">
                                <IconBell stroke={2} />
                                <span className="badge badge-error badge-xs indicator-item">{NOTIFICACIONES.length}</span>
                            </div>
                        </div>
                    </div>

                    {/* Mensajes (Entre notificaciones y menú/perfil) */}
                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle text-base-content">
                            <div className="indicator">
                                <IconMessageCircle stroke={2} />
                                <span className="badge badge-error badge-xs indicator-item">{MENSAJES.length}</span>
                            </div>
                        </div>
                    </div>

                    {/* Perfil Desktop */}
                    <div className="hidden md:block ml-2">
                        <div className="dropdown dropdown-end text-base-content">
                            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                                <div className="w-10 rounded-full">
                                    <ProfileImage src={user?.profile.profilePicture} alt={user?.firstName || "Profile"} />
                                </div>
                            </div>
                            <ul tabIndex={-1} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow border border-base-300">
                                <li><a href="/account/profile">Profile</a></li>
                                <li><a>Settings</a></li>
                                <li className="text-error"><LogoutButton /></li>
                            </ul>
                        </div>
                    </div>

                    {/* Botón Menú Móvil (Hamburguesa) */}
                    <label htmlFor="mobile-menu-drawer" className="btn btn-ghost btn-circle md:hidden text-base-content">
                        <IconMenu2 />
                    </label>
                </div>
            </nav>

            {/* --- DRAWER SISTEMA (Debajo del Navbar) --- */}
            <div className="drawer drawer-end absolute top-16 left-0 w-full h-[calc(100vh-64px)]">
                <input id="mobile-menu-drawer" type="checkbox" className="drawer-toggle" />

                <div className="drawer-side h-full overflow-hidden">
                    <label htmlFor="mobile-menu-drawer" aria-label="close sidebar" className="drawer-overlay"></label>

                    <div className="menu p-4 w-80 min-h-full bg-base-100 text-base-content flex flex-col shadow-2xl border-l border-base-300">

                        {/* 1. Perfil del Usuario (Borde eliminado) */}
                        <div className="flex flex-col items-center py-6 border-b border-base-200">
                            <div className="avatar mb-2">
                                {/* He quitado las clases 'ring' para que la foto quede limpia */}
                                <div className="w-14 rounded-full overflow-hidden">
                                    <ProfileImage
                                        src={user?.profile.profilePicture}
                                        alt={user?.firstName || "Profile"}
                                    />
                                </div>
                            </div>
                            <span className="font-bold text-base mb-4">{user?.firstName || "Usuario"}</span>

                            <ul className="w-full menu menu-vertical gap-1 p-0 text-sm">
                                <li><a href="/account/profile" className="justify-start py-3 px-6">Profile</a></li>
                                <li><a className="justify-start py-3 px-6">Settings</a></li>
                                <li className="text-error">
                                    <div className="justify-start py-3 px-6 w-full">
                                        <LogoutButton />
                                    </div>
                                </li>
                            </ul>
                        </div>

                        {/* 2. Acordeón Cursos */}
                        <div className="py-2 border-b border-base-200">
                            <div className="collapse collapse-arrow">
                                <input type="checkbox" />
                                <div className="collapse-title font-bold text-xs opacity-60 tracking-tighter">
                                    CURSOS DISPONIBLES
                                </div>
                                <div className="collapse-content p-0 text-sm">
                                    <ul className="menu menu-sm w-full">
                                        {cursosDisponibles.map((curso, idx) => (
                                            <li key={idx}><a className="py-2">{curso}</a></li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* 3. Switcher Tema */}
                        <div className="mt-auto py-6 flex flex-col items-center gap-3 border-t border-base-200">
                            <span className="text-[10px] opacity-50 uppercase font-bold tracking-widest">Modo de pantalla</span>
                            <ThemeSwitcher />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}