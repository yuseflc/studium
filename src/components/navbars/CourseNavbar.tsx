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
    LOGGER.error("❌ Error cargando cursos:", error);
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
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-base-300">
                  <ProfileImage src={userProfilePicture} alt={userFirstName} />
                </div>
              </div>

              <ul tabIndex={-1} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-44 p-2 shadow border border-base-300">
                <li className="px-2 pb-2 flex flex-col items-center border-b border-base-300 mb-2">
                  <span className="font-semibold text-sm">{userFirstName} {userLastNameInitial}</span>
                  <RoleInfoModal role={userRole} triggerClassName="text-xs opacity-70" organizationName={userOrganizationName} />
                </li>
                <li><Link href="/account/profile">Perfil</Link></li>
                {userRole === "admin" && <li><Link href="/admin" className="text-primary">Administración</Link></li>}
                <li><Link href="/account/settings">Configuración</Link></li>
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

        <div className="drawer-side h-full overflow-hidden pointer-events-auto">
          <label htmlFor="mobile-menu-drawer" className="drawer-overlay bg-black/30 backdrop-blur-sm"></label>

          <div className="w-full max-w-sm h-full bg-base-100 shadow-2xl border-l border-base-300 flex flex-col overflow-y-auto">
            <div className="flex-1 p-4 pb-20 space-y-6">
              {/* Perfil Usuario */}
              <div className="flex flex-col items-center py-6 border-b border-base-200">
                <div className="avatar mb-3">
                  <div className="w-24 h-24 rounded-full bg-base-300">
                    <ProfileImage src={userProfilePicture} alt={userFirstName} />
                  </div>
                </div>
                <span className="font-bold text-lg mb-4">{userFirstName}</span>
                <RoleInfoModal role={userRole} triggerClassName="text-xs" organizationName={userOrganizationName} />

                <ul className="w-full menu menu-vertical gap-1 p-0 text-base mt-4">
                  <li><Link href="/account/profile" className="justify-start py-2 px-4">Perfil</Link></li>
                  {userRole === "admin" && <li><Link href="/admin" className="justify-start py-2 px-4 text-primary">Administración</Link></li>}
                  <li><Link href="/account/settings" className="justify-start py-2 px-4">Configuración</Link></li>
                  <li><div className="justify-start py-2 px-4 text-error"><LogoutButton /></div></li>
                </ul>
              </div>

              {/* CURSOS DISPONIBLES */}
              <div className="py-3 border-b border-base-200">
                <div className="collapse collapse-arrow">
                  <input type="checkbox" defaultChecked />
                  <div className="collapse-title font-extrabold text-sm uppercase">
                    CURSOS DISPONIBLES ({cursosDisponibles.length})
                  </div>
                  <div className="collapse-content p-0 text-sm">
                    {cursosDisponibles.length > 0 ? (
                      <ul className="menu menu-md w-full gap-1">
                        {cursosDisponibles.map((curso) => (
                          <li key={curso._id}>
                            <Link
                              href={`/course/${curso.slug}`}
                              className={`py-2 px-3 flex justify-between items-center ${curso.slug === courseSlug ? 'bg-primary/10 text-primary font-bold' : ''}`}
                            >
                              {curso.name}
                              {curso.slug === courseSlug && (
                                <span className="badge badge-primary badge-sm">Actual</span>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-center text-base-content/60 py-4">No estás inscrito en ningún curso</p>
                    )}
                  </div>
                </div>
              </div>

              {/* CONTENIDO DEL CURSO ACTUAL - Solo visible cuando hay un curso seleccionado */}
              {courseId && (
                <div className="md:hidden">
                  <CourseNavbarDrawerContent />
                </div>
              )}

              {/* Theme Switcher móvil */}
              <div className="py-4 flex flex-col items-center gap-2">
                <span className="text-xs opacity-50 uppercase">Modo de pantalla</span>
                <ThemeSwitcher />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}