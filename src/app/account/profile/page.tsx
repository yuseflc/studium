/* Archivo: src\app\account\profile\page.tsx
  Descripción: Página de perfil del usuario: visualiza y edita información personal y settings. */

/**
 * account/profile/page.tsx
 *
 * Página SSR de perfil de usuario.
 *
 * Comportamiento:
 * - Sin parámetros:   muestra el perfil del usuario autenticado.
 * - ?id=XXX:          muestra el perfil de otro usuario (solo profesores/admins).
 * - ?courseId=XXX:    si se proporciona junto con ?id, habilita el panel de gestión
 * de calificaciones y eliminación para profesores/admins.
 *
 * Seguridad:
 * - Usuarios no autenticados → redirect /auth/login
 * - Estudiantes que intenten ver perfiles ajenos → redirect /account/profile (propio)
 * - Perfil no existente → 404
 */

// Página SSR de perfil de usuario: control de acceso, carga de datos y renderizado del perfil
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth.config";
import { connectDB } from "@/lib/database/database";
import User from "@/models/User";
import Link from "next/link";
import { truncateText } from "@/lib/utils";
import {
  IconUser,
  IconMail,
  IconCalendar,
  IconKey,
  IconUserCheck,
  IconBook,
  IconSchool,
} from "@tabler/icons-react";
import { redirect, notFound } from "next/navigation";
import mongoose from "mongoose";
import TeacherProfileView from "@/components/profile/TeacherProfileView";
import EditProfileForm from "@/components/profile/EditProfileForm";
import { getUserAvatarUrl } from "@/lib/utils/avatar";

// Definición de interfaces y tipos de datos utilizados en esta página

/**
 * Interface para representar un curso poblado desde la base de datos.
 * Contiene solo los campos esenciales: identificador, título y descripción.
 * Se utiliza en las relaciones enrolledCourses y createdCourses del usuario.
 */
interface PopulatedCourse {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
}

/**
 * Interface para representar un usuario completo recuperado de la base de datos.
 * Incluye todos los campos del perfil, relaciones pobladas (cursos) y metadatos.
 * Se obtiene mediante .lean() para optimizar performance sin perder datos tipificados.
 */
interface PopulatedUser {
  _id: mongoose.Types.ObjectId;
  email: string;
  firstName: string;
  role: "student" | "teacher" | "admin";
  active: boolean;
  profile?: {
    lastName?: string;
    profilePicture?: string;
    bio?: string;
  };
  organization?: { _id: mongoose.Types.ObjectId; name: string } | null;
  enrolledCourses?: PopulatedCourse[];
  createdCourses?: PopulatedCourse[];
  createdAt: Date;
  updatedAt: Date;
}

// Funciones auxiliares para procesamiento de datos

/**
 * Convierte el rol del usuario (en inglés) a su etiqueta en español.
 * Utilizado para mostrar el rol en la interfaz de usuario.
 * Parámetros: role - valor del rol ('teacher', 'admin', 'student')
 * Retorna: etiqueta del rol traducida al español
 */
function roleLabel(role: string): string {
  if (role === "teacher") return "Profesor";
  if (role === "admin") return "Administrador";
  return "Estudiante";
}

// Componente principal de la página de perfil de usuario

export default async function ProfilePage({
  searchParams,
}: {
  searchParams?: Promise<{ id?: string; courseId?: string }>;
}) {
  // PASO 1: Validar autenticación del usuario
  // Obtiene la sesión actual desde NextAuth. Si no existe, redirige al login.
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/auth/login");
  }

  // PASO 2: Extraer parámetros opcionales de la URL
  // id: identificador del usuario a visualizar (si es diferente al autenticado)
  // courseId: contexto del curso (utilizado en caso de que sea necesario)
  const { id: targetUserId, courseId } = searchParams
    ? await searchParams
    : { id: undefined, courseId: undefined };

  // PASO 3: Establecer conexión con la base de datos MongoDB
  await connectDB();

  // PASO 4: Obtener datos del usuario autenticado actual
  // Se obtiene solo los campos necesarios (select) para validar su rol y permisos.
  // .lean() convierte el documento a objeto POJO para mejor performance.
  const currentUser = (await User.findOne({ email: session.user.email })
    .select("_id role firstName email")
    .lean()) as Pick<PopulatedUser, "_id" | "role" | "firstName" | "email"> | null;

  if (!currentUser) {
    redirect("/auth/login");
  }

  // PASO 5: Determinar si el usuario está intentando ver el perfil de otra persona
  // isViewingOthers será verdadero si se proporciona un id diferente al del usuario actual.
  const isViewingOthers =
    !!targetUserId && targetUserId !== String(currentUser._id);

  // PASO 6: Control de acceso basado en rol (RBAC)
  // Solo profesores y administradores pueden visualizar perfiles de otros usuarios.
  // Si un estudiante intenta ver otro perfil, es redirigido a su propio perfil.
  if (isViewingOthers) {
    if (currentUser.role !== "teacher" && currentUser.role !== "admin") {
      redirect("/account/profile");
    }
  }

  // PASO 7: Obtener los datos completos del usuario a visualizar
  // Se utiliza populate() para traer los cursos inscritos y creados desde la base de datos.
  // El usuario puede ser el autenticado o el especificado en el parámetro id.
  // Se utiliza tipos genéricos para mantener seguridad de tipos con populate().
  // notFound() es llamada fuera de try/catch para que Next.js la maneje correctamente.
  const user = isViewingOthers
    ? ((await User.findById(targetUserId)
        .populate<{ enrolledCourses: PopulatedCourse[] }>("enrolledCourses", "title description")
        .populate<{ createdCourses: PopulatedCourse[] }>("createdCourses", "title description")
        .populate<{ organization: { _id: mongoose.Types.ObjectId; name: string } | null }>("organization", "name")
        .lean()) as PopulatedUser | null)
    : ((await User.findOne({ email: session.user.email })
        .populate<{ enrolledCourses: PopulatedCourse[] }>("enrolledCourses", "title description")
        .populate<{ createdCourses: PopulatedCourse[] }>("createdCourses", "title description")
        .populate<{ organization: { _id: mongoose.Types.ObjectId; name: string } | null }>("organization", "name")
        .lean()) as PopulatedUser | null);

  // PASO 8: Validar que el usuario existe en la base de datos
  // Si el usuario no existe, Next.js muestra una página 404.
  if (!user) {
    notFound();
  }

  // PASO 9: Preparar datos derivados para renderizar en la interfaz
  // Nombre completo: combina firstName con lastName si existe.
  const fullName = user.profile?.lastName
    ? `${user.firstName} ${user.profile.lastName}`
    : user.firstName;

  // Imagen de perfil: utiliza la URL personalizada o genera un avatar genérico desde Gravatar.
  const profilePicture = getUserAvatarUrl(user);

  // Determinar si se debe mostrar el panel de gestión
  // Solo aparece cuando un profesor o administrador visualiza el perfil de otro usuario.
  // Esto permite gestionar calificaciones, tareas y otras funciones.
  const canManage =
    isViewingOthers &&
    (currentUser.role === "teacher" || currentUser.role === "admin");

  // RENDERIZADO: Genera la interfaz de usuario

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 px-4 py-8">

      {/* SECCIÓN 1: Encabezado del perfil */}
      <section className="card border border-base-200 bg-base-100 shadow-sm">
        <div className="card-body flex-col items-center gap-5 p-6 text-center sm:flex-row sm:text-left">
          <div className="avatar">
            <div className="h-20 w-20 rounded-full ring-2 ring-primary ring-offset-2 ring-offset-base-100">
              <img src={profilePicture} alt={`Avatar de ${fullName}`} />
            </div>
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <h1 className="truncate text-2xl font-bold text-base-content">{fullName}</h1>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span className="badge badge-warning font-semibold">{roleLabel(user.role)}</span>
              {user.organization && (
                <span className="badge badge-ghost gap-1.5 font-medium">
                  <IconSchool size={13} />
                  {user.organization.name}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 2: Detalles del usuario (Editable para el dueño, estático para el resto) */}
      {!isViewingOthers ? (
        <EditProfileForm
          user={{
            ...user,
            _id: String(user._id)
          }}
        />
      ) : (
        <section className="card border border-base-200 bg-base-100 shadow-sm">
          <div className="card-body gap-5 p-6">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <IconUser size={18} />
              </span>
              <h2 className="text-lg font-bold text-base-content">Detalles del usuario</h2>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {/* Campo: Nombre del usuario */}
              <div className="rounded-xl border border-base-200 bg-base-200/40 px-4 py-3">
                <div className="mb-1 flex items-center gap-2 text-xs font-medium text-base-content/50">
                  <IconUser size={14} /> Nombre
                </div>
                <p className="break-words text-base text-base-content">{user.firstName}</p>
              </div>

              {/* Campo: Correo electrónico del usuario */}
              <div className="rounded-xl border border-base-200 bg-base-200/40 px-4 py-3">
                <div className="mb-1 flex items-center gap-2 text-xs font-medium text-base-content/50">
                  <IconMail size={14} /> Email
                </div>
                <p className="break-words text-base text-base-content">{user.email}</p>
              </div>

              {/* Campo: Apellido del usuario */}
              {user.profile?.lastName && (
                <div className="rounded-xl border border-base-200 bg-base-200/40 px-4 py-3">
                  <div className="mb-1 flex items-center gap-2 text-xs font-medium text-base-content/50">
                    <IconUser size={14} /> Apellido
                  </div>
                  <p className="break-words text-base text-base-content">{user.profile.lastName}</p>
                </div>
              )}

              {/* Campo: Rol del usuario dentro del sistema */}
              <div className="rounded-xl border border-base-200 bg-base-200/40 px-4 py-3">
                <div className="mb-1 flex items-center gap-2 text-xs font-medium text-base-content/50">
                  <IconUserCheck size={14} /> Rol
                </div>
                <p className="break-words text-base text-base-content">{roleLabel(user.role)}</p>
              </div>

              {/* Campo: Organización del usuario */}
              {user.organization && (
                <div className="rounded-xl border border-base-200 bg-base-200/40 px-4 py-3 md:col-span-2">
                  <div className="mb-1 flex items-center gap-2 text-xs font-medium text-base-content/50">
                    <IconSchool size={14} className="text-primary" /> Organización
                  </div>
                  <p className="break-words text-base text-base-content">{user.organization.name}</p>
                </div>
              )}

              {/* Campo: Identificador único de MongoDB del usuario */}
              <div className="rounded-xl border border-base-200 bg-base-200/40 px-4 py-3 md:col-span-2">
                <div className="mb-1 flex items-center gap-2 text-xs font-medium text-base-content/50">
                  <IconKey size={14} /> ID del usuario
                </div>
                <p className="break-all font-mono text-sm text-base-content/80">{String(user._id)}</p>
              </div>

              {/* Campo: Fecha en que se creó la cuenta */}
              <div className="rounded-xl border border-base-200 bg-base-200/40 px-4 py-3 md:col-span-2">
                <div className="mb-1 flex items-center gap-2 text-xs font-medium text-base-content/50">
                  <IconCalendar size={14} /> Miembro desde
                </div>
                <p className="text-base text-base-content">{new Date(user.createdAt).toLocaleDateString("es-ES")}</p>
              </div>

              {/* Campo: Biografía personal del usuario */}
              {user.profile?.bio && (
                <div className="rounded-xl border border-base-200 bg-base-200/40 px-4 py-3 md:col-span-2">
                  <div className="mb-1 text-xs font-medium text-base-content/50">Biografía</div>
                  <p className="whitespace-pre-line break-words text-base leading-relaxed text-base-content">{user.profile.bio}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* SECCIÓN 3: Lista de cursos en los que el usuario está inscrito como estudiante */}
      {user.enrolledCourses && user.enrolledCourses.length > 0 && (
        <section className="card border border-base-200 bg-base-100 shadow-sm">
          <div className="card-body gap-4 p-6">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-info/10 text-info">
                <IconBook size={18} />
              </span>
              <h2 className="text-lg font-bold text-base-content">Cursos inscritos</h2>
              <span className="badge badge-neutral badge-sm">{user.enrolledCourses.length}</span>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {user.enrolledCourses.map((course) => {
                const cId = String(course._id);
                return (
                  <div
                    key={cId}
                    className="flex items-center justify-between gap-4 rounded-xl border border-base-200 bg-base-200/40 p-4 transition-colors hover:border-base-300"
                  >
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-base font-semibold text-base-content">{course.title}</h3>
                      {course.description && (
                        <p className="text-sm text-base-content/60">{truncateText(course.description, 120)}</p>
                      )}
                    </div>
                    <Link href={`/mycourses/${cId}`} className="btn btn-warning btn-sm shrink-0">
                      Entrar
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* SECCIÓN 4: Lista de cursos que ha creado el profesor o administrador */}
      {user.createdCourses && user.createdCourses.length > 0 && (
        <section className="card border border-base-200 bg-base-100 shadow-sm">
          <div className="card-body gap-4 p-6">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10 text-success">
                <IconSchool size={18} />
              </span>
              <h2 className="text-lg font-bold text-base-content">Cursos creados</h2>
              <span className="badge badge-neutral badge-sm">{user.createdCourses.length}</span>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {user.createdCourses.map((course) => {
                const cId = String(course._id);
                return (
                  <div
                    key={cId}
                    className="flex items-center justify-between gap-4 rounded-xl border border-base-200 bg-base-200/40 p-4 transition-colors hover:border-base-300"
                  >
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-base font-semibold text-base-content">{course.title}</h3>
                      {course.description && (
                        <p className="text-sm text-base-content/60">{truncateText(course.description, 120)}</p>
                      )}
                    </div>
                    <Link href={`/mycourses/${cId}`} className="btn btn-info btn-sm shrink-0">
                      Gestionar
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* SECCIÓN 5: Panel de gestión para profesores y administradores */}
      {canManage && (
        <TeacherProfileView
          student={{
            _id: String(user._id),
            firstName: user.firstName,
            email: user.email,
            profile: user.profile
              ? {
                  lastName: user.profile.lastName,
                  profilePicture: user.profile.profilePicture,
                  bio: user.profile.bio,
                }
              : undefined,
          }}
          courseId={courseId}
        />
      )}
    </div>
  );
}