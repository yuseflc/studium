import { IconBell, IconMessageCircle, IconX } from "@tabler/icons-react";
import { NOTIFICACIONES, MENSAJES } from "@/seed/data";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB, User } from "@/lib/database";
import LogoutButton from "./LogoutButton";

export default async function CourseNavbar() {
    const session = await getServerSession(authOptions);

    if (session?.user?.email) {
        await connectDB();
        var user = await User.findOne({ email: session.user.email });
        // LOGGER NECESARIO AQUI
        console.log("Usuario de sesión:", user);
    }
    return (
        <div className="navbar bg-base-100 shadow-sm px-4 flex space-between">
            <div className="flex-1">
                <a className="btn btn-ghost text-xl text-base-content" href="/">
                    Studium
                </a>
            </div>
            <div className="flex flex-row gap-3 items-center">
                {/* Theme Selector */}
                <ThemeSwitcher />

                <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-circle text-base-content">
                        <div className="indicator">
                            <IconBell stroke={2} />
                            <span className="absolute top-0.5 right-0.5 grid min-h-[24px] min-w-[24px] translate-x-2/4 -translate-y-2/4 place-items-center rounded-full bg-red-600 py-1 px-1 text-xs text-white">{NOTIFICACIONES.length}</span>
                        </div>
                    </div>
                    <div
                        tabIndex={0}
                        className="card card-compact dropdown-content bg-base-100 z-1 mt-3 w-80 shadow-xl border-base-300">
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
                <div className="dropdown dropdown-end text-base-content">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                        <div className="w-10 rounded-full">
                            <img
                                alt="Tailwind CSS Navbar component"
                                src="https://upload.wikimedia.org/wikipedia/commons/2/2c/Default_pfp.svg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original" />
                        </div>
                    </div>
                    <ul
                        tabIndex={-1}
                        className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
                            <p className="px-4 py-2 text-sm font-medium text-base-content text-center">
                                {user?.firstName}
                            </p>
                            <li>
                                <a className="justify-between">
                                    Profile
                                    <span className="badge">New</span>
                                </a>
                        </li>
                        <li><a>Settings</a></li>
                        <li><LogoutButton /></li>
                    </ul>
                </div>
            </div>
        </div>
    )
}