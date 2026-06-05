/* Archivo: src/components/ui/Navbars/CourseNavbar.tsx */
import { IconMenu2 } from "@tabler/icons-react";
import ThemeSwitcher from "@/components/ui/ThemeSwitcher";
import CourseNavbarDrawerContent from "@/components/navbars/CourseNavbarDrawerContent";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/config/auth.config";
import { connectDB } from "@/lib/database/database";
import { User } from "@/models/index";
import LogoutButton from "@/components/navbars/LogoutButton";
import ProfileImage from "@/components/navbars/ProfileImage";
import { LOGGER } from "@/config/logger";
import Logo from "@/components/ui/Logo";
import RoleInfoModal from "@/components/navbars/RoleInfoModal";
import { getUserAvatarUrl } from "@/lib/utils/avatar";
import { getAvailableCoursesForNavbar } from "@/app/actions/courseActions";

interface CourseNavbarProps {
  courseId?: string;
  courseSlug?: string;
}

export default async function CourseNavbar({ courseId, courseSlug }: CourseNavbarProps) {
  const session = await getServerSession(authOptions);
  let user = null;

  if (session?.user?.id) {
    await connectDB();
    user = await User.findOne({ _id: session.user.id }).populate<{ organization: { name: string } | null }>("organization", "name");
    LOGGER.info(`👤 Usuario: ${session.user.id}`);
  }

  // Obtener cursos disponibles desde Server Action
  let cursosDisponibles: Array<{ _id: string; name: string; slug: string }> = [];
  try {
    const result = await getAvailableCoursesForNavbar();
    if (result.success && result.data) {
      cursosDisponibles = result.data;
    }
  } catch (error) {
    LOGGER.error({ error }, "Error cargando cursos");
  }

  const userFirstName = user?.firstName || user?.name || "Usuario";
  const userLastNameInitial = user?.lastName ? user.lastName.charAt(0) : "";
  const userProfilePicture = user ? getUserAvatarUrl(user) : "";
  const userRole = user?.role || "student";
  const userOrganizationName = (user?.organization as { name: string } | null)?.name;

  return (
    <header className="sticky top-0 z-[100] w-full">
      <div className="navbar bg-base-100/80 backdrop-blur-md px-2 sm:px-4 h-16 border-b border-base-300">
        {/* Logo */}
        <div className="navbar-start">
          <Link href="/" className="inline-flex items-center justify-center p-0">
            <Logo />
          </Link>
        </div>

        {/* Acciones derecha */}
        <div className="navbar-end flex flex-row gap-1 sm:gap-3 items-center">
          <div className="hidden sm:block">
            <ThemeSwitcher />
          </div>

          {/* Menú usuario Desktop */}
          <div className="hidden sm:block">
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-base-300 overflow-hidden">
                  <ProfileImage
                    src={userProfilePicture}
                    alt={userFirstName}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </div>

              <ul tabIndex={-1} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-44 p-2 shadow border border-base-300">
                <li className="px-2 pb-2 flex flex-col items-center border-b border-base-300 mb-2">
                  <span className="font-semibold text-sm">{userFirstName} {userLastNameInitial}</span>
                  <RoleInfoModal role={userRole} triggerClassName="text-xs opacity-70" organizationName={userOrganizationName} />
                </li>
                <li><Link href="/account/profile">Perfil</Link></li>
                {userRole === "admin" && <li className="hover:bg-primary/10"><Link href="/admin" className="text-primary hover:bg-primary/10 focus:bg-primary/10">Administración</Link></li>}
                <li className="hover:bg-error/10"><LogoutButton /></li>
              </ul>
            </div>
          </div>

          {/* Botón menú móvil */}
          <label htmlFor="mobile-menu-drawer" className="btn btn-ghost btn-circle sm:hidden">
            <IconMenu2 size={20} />
          </label>
        </div>
      </div>

      {/* DRAWER MÓVIL */}
      <div className="drawer drawer-end fixed top-16 left-0 w-full h-[calc(100vh-64px)] pointer-events-none">
        <input id="mobile-menu-drawer" type="checkbox" className="drawer-toggle" />

        {/* sin overflow-hidden para que el overlay cubra bien el área exterior */}
        <div className="drawer-side h-full pointer-events-auto">
          <label htmlFor="mobile-menu-drawer" className="drawer-overlay bg-black/40 backdrop-blur-sm cursor-pointer"></label>

          {/* w-[280px] deja ~95px de overlay visible a la izquierda → cerrar al tocar */}
          <div className="w-[280px] h-full bg-base-100 shadow-2xl border-l border-base-300 flex flex-col overflow-y-auto">
            <div className="flex-1 pb-6 space-y-1">

              {/* Perfil compacto: fila horizontal */}
              <div className="flex items-center gap-3 p-4 border-b border-base-200">
                <div className="avatar flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-base-300 overflow-hidden">
                    <ProfileImage
                      src={userProfilePicture}
                      alt={userFirstName}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm truncate">{userFirstName}</p>
                  <RoleInfoModal role={userRole} triggerClassName="text-[11px] opacity-60" organizationName={userOrganizationName} />
                </div>
              </div>

              {/* Nav links */}
              <ul className="menu menu-sm p-2 gap-0.5">
                <li><Link href="/mycourses" className="py-2 px-3 text-sm text-base-content hover:bg-base-200 active:!bg-base-300">Mis cursos</Link></li>
                <li><Link href="/account/profile" className="py-2 px-3 text-sm text-base-content hover:bg-base-200 active:!bg-base-300">Perfil</Link></li>
                {userRole === "admin" && <li><Link href="/admin" className="py-2 px-3 text-sm text-warning hover:bg-warning/20 active:!bg-warning/30">Administración</Link></li>}
                <li><LogoutButton className="py-2 px-3 text-sm text-error hover:bg-error/10 active:!bg-error/20" /></li>
              </ul>

              <div className="border-t border-base-200 mx-2" />

              {/* CURSOS DISPONIBLES */}
              <div className="collapse collapse-arrow px-2">
                <input type="checkbox" defaultChecked />
                <div className="collapse-title font-bold text-xs uppercase tracking-wider text-base-content/50 px-2 min-h-0 py-3">
                  Cursos ({cursosDisponibles.length})
                </div>
                <div className="collapse-content p-0 text-sm">
                  {cursosDisponibles.length > 0 ? (
                    <ul className="menu menu-sm w-full gap-0.5 p-0">
                      {cursosDisponibles.map((curso) => (
                        <li key={curso._id}>
                          <Link
                            href={`/course/${curso.slug}`}
                            className={`py-2 px-3 text-sm flex justify-between items-center ${curso.slug === courseSlug ? 'bg-primary/10 text-primary font-bold' : ''}`}
                          >
                            <span className="truncate">{curso.name}</span>
                            {curso.slug === courseSlug && (
                              <span className="badge badge-primary badge-xs flex-shrink-0">Actual</span>
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-center text-base-content/50 text-xs py-3">Sin cursos inscritos</p>
                  )}
                </div>
              </div>

              {/* CONTENIDO DEL CURSO ACTUAL */}
              {courseId && (
                <div className="md:hidden border-t border-base-200 mx-2 pt-1">
                  <CourseNavbarDrawerContent />
                </div>
              )}

              {/* Theme Switcher */}
              <div className="border-t border-base-200 mx-2 pt-3 flex items-center justify-between px-3">
                <span className="text-xs opacity-40 uppercase tracking-wider">Tema</span>
                <ThemeSwitcher />
              </div>

            </div>
          </div>
        </div>
      </div>
    </header>
  );
}