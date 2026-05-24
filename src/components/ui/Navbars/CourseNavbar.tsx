import { IconBell, IconMessageCircle, IconX, IconMenu2 } from "@tabler/icons-react";
import { NOTIFICACIONES, MENSAJES } from "@/seed/data";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/config/auth.config";
import { connectDB } from "@/lib/database/database";
import { User } from "@/models/index";
import LogoutButton from "./LogoutButton";
import ProfileImage from "./ProfileImage";
import { LOGGER } from "@/config/logger";

/**
 * server-hoist-static-io: Lista de cursos disponibles hoisted a nivel de módulo.
 * Evita redefinir el array en cada renderizado del servidor.
 * Esta es data estática que no cambia entre requests.
 */
const CURSOS_DISPONIBLES = [
    "Diseño de Interfaces Web",
    "Despliegue de Aplicaciones web",
    "Desarrollo Web en Entorno Cliente",
    "Desarrollo Web en Entorno Servidor",
    "Shell Script",
    "Digitalización"
];

/* 
 * Responsabilidades:
 * 1. Obtener la sesión del usuario autenticado
 * 2. Cargar datos del usuario desde la BD
 * 3. Renderizar navbar con notificaciones, mensajes y perfil
 * 4. Proporcionar menú responsive (desktop y móvil)
 * 
 * Estructura:
 * - Header sticky con desktop navbar
 * - Dropdown de notificaciones (campana)
 * - Dropdown de mensajes (chat)
 * - Menú de usuario (avatar)
 * - Drawer lateral para menú móvil
 */
export default async function CourseNavbar() {
    // Obtener sesión del usuario actual usando next-auth
    const session = await getServerSession(authOptions);
    let user = null;

    if (session?.user?.id) {
        await connectDB();
        user = await User.findOne({ _id: session.user.id });
        LOGGER.info(`Usuario de sesión: ${session.user.id} - ${session.user.email} - ${session.user.name}`);
    }

    const cursosDisponibles = [
        "Diseño de Interfaces Web",
        "Despliegue de Aplicaciones web",
        "Desarrollo Web en Entorno Cliente",
        "Desarrollo Web en Entorno Servidor",
        "Shell Script",
        "Digitalización"
    ];

    const userFirstName = user?.firstName || user?.name || "Usuario";
    const userProfilePicture = user?.profile?.profilePicture || user?.profilePicture || "";

    const cursoRoutes: Record<string, string> = {
        "Diseño de Interfaces Web": "/course/diseno-interfaces-web",
        "Despliegue de Aplicaciones web": "/course/despliegue-aplicaciones-web",
        "Desarrollo Web en Entorno Cliente": "/course/dwec",
        "Desarrollo Web en Entorno Servidor": "/course/dwes",
        "Shell Script": "/course/shell-script",
        "Digitalización": "/course/digitalizacion"
    };

    return (
        <header className="sticky top-0 z-[100] w-full">
            {/* 
              rendering-hoist-jsx: Navbar principal con estructura daisyUI.
              Sticky positioning mantiene el navbar visible al hacer scroll.
              Backdrop-blur y bg-base-100/80 crean efecto glass-morphism.
            */}
            <div className="navbar bg-base-100/80 backdrop-blur-md px-4 h-16 border-b border-base-300 transition-all">
                {/* Logo/Branding - Lado izquierdo del navbar */}
                <div className="navbar-start">
                    <Link href="/" className="inline-flex items-center justify-center p-0 leading-none">
                        <img
                            src="/img/logo_small_blur.svg"
                            alt="Studium"
                            className="block h-4 w-auto"
                        />
                    </Link>
                </div>

                <div className="navbar-end flex flex-row gap-3 items-center">
                    {/* Theme Switcher - Visible solo en desktop (md:) */}
                    <div className="hidden md:block">
                        <ThemeSwitcher />
                    </div>

                    {/* Notificaciones */}
                    <div className="dropdown dropdown-end">
                        <div 
                            tabIndex={0} 
                            role="button" 
                            aria-label="Abrir notificaciones"
                            className="btn btn-ghost btn-circle text-base-content"
                        >
                            <div className="indicator">
                                <IconBell stroke={2} />
                                <span className="absolute top-0.5 right-0.5 grid min-h-[24px] min-w-[24px] translate-x-2/4 -translate-y-2/4 place-items-center rounded-full bg-red-600 py-1 px-1 text-xs text-white">
                                    {NOTIFICACIONES.length}
                                </span>
                            </div>
                        </div>
                        <div tabIndex={0} className="card card-compact dropdown-content bg-base-100 z-1 mt-3 w-80 shadow-xl border border-base-300">
                            <div className="card-body p-4">
                                <h3 className="text-lg font-bold text-base-content border-b border-base-300 pb-2">
                                    Notificaciones
                                </h3>
                                {/* 
                                  rendering-conditional-render: Usar ternario en lugar de && para mejor claridad.
                                  Si no hay notificaciones, mostrar mensaje. Si hay, mapear el array.
                                */}
                                <div className="flex flex-col max-h-96 overflow-y-auto py-2">
                                    {NOTIFICACIONES.length === 0 ? (
                                        <p className="text-sm text-base-content/60 text-center py-4">
                                            No tienes nuevas notificaciones.
                                        </p>
                                    ) : (
                                        /* js-index-maps: Usar key={notification.id} para identificación eficiente en listas */
                                        NOTIFICACIONES.map((notification) => (
                                            <div 
                                                key={notification.id}
                                                className="group relative flex flex-col gap-1 p-1 rounded-lg transition-colors hover:bg-base-200"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <span className="text-sm font-semibold text-base-content">
                                                        {notification.title}
                                                    </span>
                                                    {/* Botón para cerrar notificación - Aparece al hacer hover */}
                                                    <button 
                                                        aria-label="Cerrar notificación"
                                                        className="btn btn-ghost btn-xs btn-square opacity-0 group-hover:opacity-100 transition-opacity text-base-content"
                                                    >
                                                        <IconX size={14} />
                                                    </button>
                                                </div>
                                                <p className="text-xs text-base-content/70 leading-relaxed">
                                                    {notification.description}
                                                </p>
                                                <div className="flex justify-end mt-2">
                                                    <span className="text-[10px] text-base-content/50">
                                                        {notification.time}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="card-actions pt-2 border-t border-base-300">
                                    <a 
                                        className="btn btn-primary btn-sm btn-block"
                                        href="/account/notifications"
                                    >
                                        Ver todas
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mensajes */}
                    <div className="dropdown dropdown-end">
                        <div 
                            tabIndex={0}
                            role="button"
                            aria-label="Abrir mensajes"
                            className="btn btn-ghost btn-circle text-base-content"
                        >
                            <div className="indicator">
                                <IconMessageCircle stroke={2} />
                                {/* Badge rojo con contador de mensajes sin leer */}
                                <span className="absolute top-0.5 right-0.5 grid min-h-[24px] min-w-[24px] translate-x-2/4 -translate-y-2/4 place-items-center rounded-full bg-red-600 py-1 px-1 text-xs text-white">
                                    {MENSAJES.length}
                                </span>
                            </div>
                        </div>
                        <div tabIndex={0} className="card card-compact dropdown-content bg-base-100 z-1 mt-3 w-80 shadow-xl border border-base-300">
                            <div className="card-body p-4">
                                <h3 className="text-lg font-bold text-base-content border-b border-base-300 pb-2">
                                    Mensajes
                                </h3>
                                {/* 
                                  rendering-conditional-render: Mostrar estado vacío o lista de mensajes.
                                  Cada mensaje incluye avatar, nombre, contenido truncado, timestamp.
                                */}
                                <div className="flex flex-col gap-1 max-h-96 overflow-y-auto py-2">
                                    {MENSAJES.length === 0 ? (
                                        <p className="text-sm text-base-content/60 text-center py-4">
                                            No tienes nuevos mensajes.
                                        </p>
                                    ) : (
                                        MENSAJES.map((message) => (
                                            <div 
                                                key={message.id}
                                                className="group relative flex gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors cursor-pointer"
                                            >
                                                {/* Avatar del remitente */}
                                                <div className="avatar">
                                                    <div className="w-10 h-10 rounded-full">
                                                        <img 
                                                            src={message.avatar}
                                                            alt={message.sender}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Contenido del mensaje */}
                                                <div className="flex flex-col flex-1 gap-0.5">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm font-semibold text-base-content">
                                                            {message.sender}
                                                        </span>
                                                    </div>
                                                    {/* 
                                                      line-clamp-2: Limita el contenido a 2 líneas.
                                                      Evita que mensajes largos desborden el dropdown.
                                                    */}
                                                    <p className="text-xs text-base-content/70 line-clamp-2 leading-snug">
                                                        {message.content}
                                                    </p>
                                                    <div className="flex justify-end mt-1">
                                                        <span className="text-[10px] text-base-content/50">
                                                            {message.time}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Botón para cerrar/descartar mensaje */}
                                                <button 
                                                    aria-label="Cerrar mensaje"
                                                    className="btn btn-ghost btn-xs btn-square opacity-0 group-hover:opacity-100 transition-opacity absolute right-1 top-1"
                                                >
                                                    <IconX size={12} />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="card-actions pt-2 border-t border-base-300">
                                    <a 
                                        className="btn btn-primary btn-sm btn-block"
                                        href="/messages"
                                    >
                                        Ir a mensajes
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 
                      MENÚ DE USUARIO (Desktop)
                      - Visible solo en pantallas medianas (md:)
                      - Avatar clicable que abre dropdown con opciones
                      - Opciones: Perfil, Configuración, Logout
                    */}
                    <div className="hidden md:block">
                        <div className="dropdown dropdown-end text-base-content">
                            <div 
                                tabIndex={0}
                                role="button"
                                aria-label={`Menú de usuario - ${userFirstName}`}
                                className="btn btn-ghost btn-circle avatar"
                            >
                                <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-base-300">
                                    {/* 
                                      ProfileImage: Componente que maneja carga y errores de imagen.
                                      userProfilePicture es una propiedad cacheada para evitar acceso repetido.
                                    */}
                                    <ProfileImage
                                        src={userProfilePicture}
                                        alt={userFirstName}
                                        className="w-full h-full object-cover rounded-full"
                                    />
                                </div>
                            </div>
                            <ul tabIndex={-1} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow border border-base-300">
                                <li className="px-4 py-2 text-sm font-medium text-base-content text-center">
                                    {user?.firstName}
                                </li>
                                <li>
                                    <a href="/account/profile" className="justify-between">
                                        Profile
                                    </a>
                                </li>
                                {/* Opción de Configuración */}
                                <li>
                                    <a>Settings</a>
                                </li>
                                {/* Opción de Logout - Estilizada en rojo */}
                                <li className="hover:bg-error/10 hover:text-error transition-colors">
                                    <LogoutButton />
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* 
                      BOTÓN DE MENÚ MÓVIL
                      - Solo visible en pantallas pequeñas (hidden md:)
                      - Abre el drawer sidebar en mobile
                      - Usa checkbox para toggle sin JavaScript
                    */}
                    <label 
                        htmlFor="mobile-menu-drawer"
                        className="btn btn-ghost btn-circle md:hidden text-base-content"
                        aria-label="Abrir menú móvil"
                    >
                        <IconMenu2 />
                    </label>
                </div>
            </div>

            {/* DRAWER SISTEMA */}
            <div className="drawer drawer-end fixed top-16 left-0 w-full h-[calc(100vh-64px)] pointer-events-none">
                <input id="mobile-menu-drawer" type="checkbox" className="drawer-toggle" />

                <div className="drawer-side h-full overflow-hidden pointer-events-auto">
                    {/* Overlay con fade suave */}
                    <label
                        htmlFor="mobile-menu-drawer"
                        aria-label="close sidebar"
                        className="drawer-overlay bg-black/30 backdrop-blur-sm transition-opacity duration-300"
                    ></label>

                    {/* Panel lateral: DaisyUI ya gestiona translate-x, solo añadimos transición */}
                    <div className="w-80 h-full bg-base-100 text-base-content shadow-2xl border-l border-base-300 flex flex-col overflow-y-auto overflow-x-hidden transition-transform duration-300 ease-out">
                        <div className="flex-1 p-4 pb-20 space-y-8">
                            {/* 1. Usuario (ligero slide/fade al montar) */}
                            <div className="animate-[fadeInUp_0.35s_ease-out]">
                                <div className="flex flex-col items-center py-8 border-b border-base-200">
                                    <div className="avatar mb-4">
                                        <div className="w-28 h-28 rounded-full overflow-hidden flex items-center justify-center bg-base-300">
                                            <ProfileImage
                                                src={user?.profile.profilePicture}
                                                alt={user?.firstName || 'Profile'}
                                                className="w-full h-full object-cover rounded-full"
                                            />
                                        </div>
                                    </div>
                                    <span className="font-bold text-xl mb-6">{user?.firstName || "Usuario"}</span>

                                    <ul className="w-full menu menu-vertical gap-1 p-0 text-base">
                                        <li>
                                            <a
                                                href="/account/profile"
                                                className="justify-start py-3 px-6 font-semibold active:bg-base-300 rounded-xl transition-colors"
                                            >
                                                Profile
                                            </a>
                                        </li>
                                        <li>
                                            <a className="justify-start py-3 px-6 font-semibold active:bg-base-300 rounded-xl transition-colors">
                                                Settings
                                            </a>
                                        </li>
                                        <li>
                                            <div className="justify-start py-3 px-6 w-full text-error font-bold active:bg-error/10 rounded-xl transition-colors cursor-pointer">
                                                <LogoutButton />
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* 2. Cursos */}
                            <div className="animate-[fadeInUp_0.35s_ease-out_0.08s_both]">
                                <div className="py-4 border-b border-base-200">
                                    <div className="collapse collapse-arrow">
                                        <input type="checkbox" aria-label="Expandir cursos disponibles" />
                                        <div className="collapse-title font-extrabold text-base text-base-content tracking-tight uppercase">
                                            CURSOS DISPONIBLES
                                        </div>

                                        <div className="collapse-content p-0 text-base">
                                            <ul className="menu menu-md w-full gap-1">
                                                {cursosDisponibles.map((curso, idx) => (
                                                    <li key={idx}>
                                                        <a
                                                            href={cursoRoutes[curso]}
                                                            className="py-2.5 px-4 text-base-content/80 font-medium active:bg-base-300 rounded-lg transition-all"
                                                        >
                                                            {curso}
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 3. Theme Switcher */}
                            <div className="animate-[fadeInUp_0.35s_ease-out_0.16s_both]">
                                <div className="py-6 flex flex-col items-center gap-3 mt-4">
                                    <span className="text-sm opacity-50 uppercase font-bold tracking-widest">Modo de pantalla</span>
                                    <ThemeSwitcher />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </header>
    );
}
