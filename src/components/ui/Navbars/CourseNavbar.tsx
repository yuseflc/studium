import { IconBell, IconMessageCircle, IconX, IconMenu2 } from "@tabler/icons-react";
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
        LOGGER.info(`Usuario de sesión: ${session.user.id} - ${session.user.email} - ${session.user.name}`);
    }

    const cursosDisponibles = [
        "Diseño de Interfaces Web", "Despliegue de Aplicaciones web",
        "Desarrollo Web en Entorno Cliente", "Desarrollo Web en Entorno Servidor",
        "Shell Script", "Digitalización"
    ];

    return (
        <header className="sticky top-0 z-[100] w-full">
            <div className="navbar bg-base-100/80 backdrop-blur-md px-4 h-16 border-b border-base-300 transition-all">
                <div className="flex-1">
                    <a className="btn btn-ghost text-xl text-base-content" href="/">
                        Studium
                    </a>
                </div>
                <div className="flex flex-row gap-3 items-center">
                    <div className="hidden md:block">
                        <ThemeSwitcher />
                    </div>

                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle text-base-content">
                            <div className="indicator">
                                <IconBell stroke={2} />
                                <span className="absolute top-0.5 right-0.5 grid min-h-[24px] min-w-[24px] translate-x-2/4 -translate-y-2/4 place-items-center rounded-full bg-red-600 py-1 px-1 text-xs text-white">{NOTIFICACIONES.length}</span>
                            </div>
                        </div>
                        <div
                            tabIndex={0}
                            className="card card-compact dropdown-content bg-base-100 z-1 mt-3 w-80 shadow-xl border border-base-300">
                            <div className="card-body p-4">
                                <h3 className="text-lg font-bold text-base-content border-b border-base-300 pb-2">Notificaciones</h3>
                                <div className="flex flex-col max-h-96 overflow-y-auto py-2">
                                    {NOTIFICACIONES.length === 0 ? (
                                        <p className="text-sm text-base-content/60 text-center py-4">No tienes nuevas notificaciones.</p>
                                    ) : (
                                        NOTIFICACIONES.map((notification) => (
                                            <div key={notification.id} className="group relative flex flex-col gap-1 p-1 rounded-lg transition-colors hover:bg-base-200">
                                                <div className="flex justify-between items-start">
                                                    <span className="text-sm font-semibold text-base-content">{notification.title}</span>
                                                    <button className="btn btn-ghost btn-xs btn-square opacity-0 group-hover:opacity-100 transition-opacity text-base-content">
                                                        <IconX size={14} />
                                                    </button>
                                                </div>
                                                <p className="text-xs text-base-content/70 leading-relaxed">
                                                    {notification.description}
                                                </p>
                                                <div className="flex justify-end mt-2">
                                                    <span className="text-[10px] text-base-content/50">{notification.time}</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="card-actions pt-2 border-t border-base-300">
                                    <a className="btn btn-primary btn-sm btn-block" href="/account/notifications">
                                        Ver todas
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle text-base-content">
                            <div className="indicator">
                                <IconMessageCircle stroke={2} />
                                <span className="absolute top-0.5 right-0.5 grid min-h-[24px] min-w-[24px] translate-x-2/4 -translate-y-2/4 place-items-center rounded-full bg-red-600 py-1 px-1 text-xs text-white">{MENSAJES.length}</span>
                            </div>
                        </div>
                        <div
                            tabIndex={0}
                            className="card card-compact dropdown-content bg-base-100 z-1 mt-3 w-80 shadow-xl border border-base-300">
                            <div className="card-body p-4">
                                <h3 className="text-lg font-bold text-base-content border-b border-base-300 pb-2">Mensajes</h3>
                                <div className="flex flex-col gap-1 max-h-96 overflow-y-auto py-2">
                                    {MENSAJES.length === 0 ? (
                                        <p className="text-sm text-base-content/60 text-center py-4">No tienes nuevos mensajes.</p>
                                    ) : (
                                        MENSAJES.map((message) => (
                                            <div key={message.id} className="group relative flex gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors cursor-pointer">
                                                <div className="avatar">
                                                    <div className="w-10 h-10 rounded-full">
                                                        <img src={message.avatar} alt={message.sender} />
                                                    </div>
                                                </div>
                                                <div className="flex flex-col flex-1 gap-0.5">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm font-semibold text-base-content">{message.sender}</span>
                                                    </div>
                                                    <p className="text-xs text-base-content/70 line-clamp-2 leading-snug">
                                                        {message.content}
                                                    </p>
                                                    <div className="flex justify-end mt-1">
                                                        <span className="text-[10px] text-base-content/50">{message.time}</span>
                                                    </div>
                                                </div>
                                                <button className="btn btn-ghost btn-xs btn-square opacity-0 group-hover:opacity-100 transition-opacity absolute right-1 top-1">
                                                    <IconX size={12} />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="card-actions pt-2 border-t border-base-300">
                                    <a className="btn btn-primary btn-sm btn-block" href="/messages">
                                        Ir a mensajes
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="hidden md:block">
                        <div className="dropdown dropdown-end text-base-content">
                            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                                <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-base-300">
                                    <ProfileImage
                                        src={user?.profile.profilePicture}
                                        alt={user?.firstName || "Profile"}
                                        className="w-full h-full object-cover rounded-full"
                                    />
                                </div>
                            </div>
                            <ul
                                tabIndex={-1}
                                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow border border-base-300">
                                <p className="px-4 py-2 text-sm font-medium text-base-content text-center">
                                    {user?.firstName}
                                </p>
                                <li>
                                    <a href="/account/profile" className="justify-between">
                                        Profile
                                    </a>
                                </li>
                                <li><a>Settings</a></li>
                                <li className="hover:bg-error/10 hover:text-error transition-colors"><LogoutButton /></li>
                            </ul>
                        </div>
                    </div>

                    <label htmlFor="mobile-menu-drawer" className="btn btn-ghost btn-circle md:hidden text-base-content">
                        <IconMenu2 />
                    </label>
                </div>
            </div>

            {/* --- DRAWER SISTEMA (Mobile Menu) --- */}
            <div className="drawer drawer-end fixed top-16 left-0 w-full h-[calc(100vh-64px)] pointer-events-none">
                <input id="mobile-menu-drawer" type="checkbox" className="drawer-toggle" />
                <div className="drawer-side h-full overflow-hidden pointer-events-auto">
                    <label htmlFor="mobile-menu-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
                    
                    {/* Contenedor con altura fija y scroll */}
                    <div className="w-80 h-full bg-base-100 text-base-content shadow-2xl border-l border-base-300 flex flex-col overflow-y-auto overflow-x-hidden">
                        
                        {/* Contenido interno con padding y margen inferior para asegurar scroll */}
                        <div className="flex-1 p-4 pb-20">
                            {/* 1. Usuario */}
                            <div className="flex flex-col items-center py-8 border-b border-base-200">
                                <div className="avatar mb-4">
                                    <div className="w-28 h-28 rounded-full overflow-hidden flex items-center justify-center bg-base-300">
                                        <ProfileImage
                                            src={user?.profile.profilePicture}
                                            alt={user?.firstName || "Profile"}
                                            className="w-full h-full object-cover rounded-full"
                                        />
                                    </div>
                                </div>
                                <span className="font-bold text-xl mb-6">{user?.firstName || "Usuario"}</span>
                                <ul className="w-full menu menu-vertical gap-1 p-0 text-base">
                                    <li><a href="/account/profile" className="justify-start py-3 px-6 font-semibold active:bg-base-300 rounded-xl transition-colors">Profile</a></li>
                                    <li><a className="justify-start py-3 px-6 font-semibold active:bg-base-300 rounded-xl transition-colors">Settings</a></li>
                                    <li>
                                        <div className="justify-start py-3 px-6 w-full text-error font-bold active:bg-error/10 rounded-xl transition-colors cursor-pointer">
                                            <LogoutButton />
                                        </div>
                                    </li>
                                </ul>
                            </div>

                            {/* 2. Cursos Acordeón */}
                            <div className="py-4 border-b border-base-200">
                                <div className="collapse collapse-arrow">
                                    <input type="checkbox" />
                                    <div className="collapse-title font-extrabold text-base text-base-content tracking-tight uppercase">
                                        CURSOS DISPONIBLES
                                    </div>
                                    <div className="collapse-content p-0 text-base">
                                        <ul className="menu menu-md w-full gap-1">
                                            {cursosDisponibles.map((curso, idx) => (
                                                <li key={idx}>
                                                    <a className="py-2.5 px-4 text-base-content/80 font-medium active:bg-base-300 rounded-lg transition-all">
                                                        {curso}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* 3. Theme Switcher - Siempre debajo de los cursos */}
                            <div className="py-6 flex flex-col items-center gap-3 mt-4">
                                <span className="text-sm opacity-50 uppercase font-bold tracking-widest">Modo de pantalla</span>
                                <ThemeSwitcher />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}