'use client';

import Link from 'next/link';
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
            <div className="flex flex-row gap-3 items-center">
                {/* Theme Selector */}
                <ThemeProvider />

                <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-circle text-base-content">
                        <div className="indicator">
                            <IconBell stroke={2} />
                            <span className="badge badge-sm indicator-item bg-primary text-primary-content">{NOTIFICACIONES.length}</span>
                        </div>
                    </div>
                    <div
                        tabIndex={0}
                        className="card card-compact dropdown-content bg-base-100 z-1 mt-3 w-80 shadow-xl border border-base-300">
                        <div className="card-body p-4">
                            <h3 className="text-lg font-bold text-base-content border-b border-base-300 pb-2">Notificaciones</h3>
                            <div className="flex flex-col gap-2 max-h-96 overflow-y-auto py-2">
                                {NOTIFICACIONES.length === 0 ? (
                                    <p className="text-sm text-base-content/60 text-center py-4">No tienes nuevas notificaciones.</p>
                                ) : (
                                    NOTIFICACIONES.map((notification) => (
                                        <div key={notification.id} className="group relative flex flex-col gap-1 p-3 rounded-lg bg-base-200 transition-colors border border-base-400 hover:bg-base-300">
                                            <div className="flex justify-between items-start">
                                                <span className="text-sm font-semibold text-base-content">{notification.title}</span>
                                                <button className="btn btn-ghost btn-xs btn-square opacity-0 group-hover:opacity-100 transition-opacity text-base-content">
                                                    <IconX size={14} />
                                                </button>
                                            </div>
                                            <p className="text-xs text-base-content/70 leading-relaxed">
                                                {notification.description}
                                            </p>
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
                            <span className="badge badge-sm indicator-item bg-primary text-primary-content">{MENSAJES.length}</span>
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
                                                    <span className="text-[10px] text-base-content/50">{message.time}</span>
                                                </div>
                                                <p className="text-xs text-base-content/70 line-clamp-2 leading-snug">
                                                    {message.content}
                                                </p>
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

                {/* Condición para usuario logueado */}
                {USUARIO ? (
                    
                    <div className="dropdown dropdown-end text-base-content">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                            <div className="w-10 rounded-full">
                                <img alt={`Avatar de ${USUARIO.name}`} src={USUARIO.image} />
                            </div>
                        </div>
                        <ul tabIndex={-1} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
                            <p className="text-center" ><span className="badge m-2">{USUARIO.name}</span></p>
                            
                            <li><a>Perfil</a></li>
                            <li><a>Configuración</a></li>
                            <li><a className="text-red-200 hover:text-red-400">Cerrar sesión</a></li>
                        </ul>
                    </div>
                ) : (
                    <a href="/login" className="btn btn-primary btn-sm">
                        Iniciar sesión
                    </a>
                )}


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
<<<<<<< HEAD
            </div>

            {/* Lista izquierda */}
            <div className="navbar-end">
                <ThemeSwitcher />
            </div>

=======
            </div>

            {/* Lista izquierda */}
            <div className="navbar-end">
                <ThemeSwitcher />
            </div>

>>>>>>> b108355 ([Upgrade] Landing NavBar)
        </div>
    );
}