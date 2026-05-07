'use client';

import { IconBell, IconMessageCircle, IconX } from "@tabler/icons-react";
import { NOTIFICACIONES, MENSAJES, USUARIO } from "@/seed/data";
import { useTheme } from "@/components/providers/ThemeProvider";

export default function Navbar() {
    const { theme, setTheme } = useTheme();

    return (
        <div className="navbar bg-base-100 shadow-sm px-4">
            <div className="flex-1">
                <a className="btn btn-ghost text-xl text-base-content" href="/">
                    Studium
                </a>
            </div>
            <div className="flex flex-row gap-3 items-center">
                {/* Theme Selector */}
                <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-ghost text-base-content">
                        Tema
                        <svg
                            width="12px"
                            height="12px"
                            className="inline-block h-2 w-2 fill-current opacity-60"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 2048 2048">
                            <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path>
                        </svg>
                    </div>
                    <ul tabIndex={0} className="dropdown-content bg-base-300 rounded-box z-[1] w-52 p-2 shadow-2xl">
                        <li>
                            <input
                                type="radio"
                                name="theme-dropdown"
                                className="theme-controller btn btn-sm btn-block btn-ghost justify-start text-base-content"
                                aria-label="Por defecto"
                                value="default"
                                checked={theme === 'default'}
                                onChange={() => setTheme('default')} />
                        </li>
                        <div className="m-2">
                            <hr className="hr hr-primary m-auto w-25 text-base-content" />
                        </div>

                        <li>
                            <input
                                type="radio"
                                name="theme-dropdown"
                                className="theme-controller btn btn-sm btn-block btn-ghost justify-start text-base-content"
                                aria-label="Light"
                                value="light"
                                checked={theme === 'light'}
                                onChange={() => setTheme('light')} />
                        </li>

                        <li>
                            <input
                                type="radio"
                                name="theme-dropdown"
                                className="theme-controller btn btn-sm btn-block btn-ghost justify-start text-base-content"
                                aria-label="Dark"
                                value="dark"
                                checked={theme === 'dark'}
                                onChange={() => setTheme('dark')} />
                        </li>
                        <li>
                            <input
                                type="radio"
                                name="theme-dropdown"
                                className="theme-controller btn btn-sm btn-block btn-ghost justify-start text-base-content"
                                aria-label="Bumblebee"
                                value="bumblebee"
                                checked={theme === 'bumblebee'}
                                onChange={() => setTheme('bumblebee')} />
                        </li>
                    </ul>
                </div>

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
                            <p><span className="badge">{USUARIO.name}</span></p>
                            
                            <li><a>Perfil</a></li>
                            <li><a>Configuración</a></li>
                            <li><a>Cerrar sesión</a></li>
                        </ul>
                    </div>
                ) : (
                    <a href="/login" className="btn btn-primary btn-sm">
                        Iniciar sesión
                    </a>
                )}

            </div>
        </div>
    )
}