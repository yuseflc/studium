/**
 * profile/page.tsx
 *
 * Página SSR de perfil de usuario.
 *
 * Comportamiento:
 *  - Sin parámetros:   muestra el perfil del usuario autenticado.
 *  - ?id=XXX:          muestra el perfil de otro usuario (solo profesores/admins).
 *  - ?courseId=XXX:    si se proporciona junto con ?id, habilita el panel de gestión
 *                      de calificaciones y eliminación para profesores/admins.
 *
 * Seguridad:
 *  - Usuarios no autenticados → redirect /auth/login
 *  - Estudiantes que intenten ver perfiles ajenos → redirect /account/profile (propio)
 *  - Perfil no existente → 404
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth.config";
import { connectDB } from "@/lib/database/database";
import User from "@/models/User";
import Link from "next/link";
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
import TeacherProfileView from "@/components/ui/profile/TeacherProfileView";

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
        .lean()) as PopulatedUser | null)
    : ((await User.findOne({ email: session.user.email })
        .populate<{ enrolledCourses: PopulatedCourse[] }>("enrolledCourses", "title description")
        .populate<{ createdCourses: PopulatedCourse[] }>("createdCourses", "title description")
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
  const profilePicture =
    user.profile?.profilePicture ??
    `https://i.pravatar.cc/150?u=${user.email}`;

  // Determinar si se debe mostrar el panel de gestión
  // Solo aparece cuando un profesor o administrador visualiza el perfil de otro usuario.
  // Esto permite gestionar calificaciones, tareas y otras funciones.
  const canManage =
    isViewingOthers &&
    (currentUser.role === "teacher" || currentUser.role === "admin");

  // RENDERIZADO: Genera la interfaz de usuario

  return (
    <div className="flex flex-col items-center m-4 p-4">

      {/* SECCIÓN 1: Encabezado del perfil con avatar, nombre completo y rol del usuario */}
      <div className="card mb-5 bg-base-100 shadow-lg border-2 border-base-200 p-3 pb-0 w-full max-w-3xl">
        <div className="avatar flex items-start">
          <div className="w-24 rounded-full mr-7 mt-4">
            <img src={profilePicture} alt={`Avatar de ${fullName}`} />
          </div>
          <div>
            <h1 className="text-2xl font-bold mt-12">{fullName}</h1>
            <p className="text-sm text-base-content/60 mt-2 capitalize">
              {roleLabel(user.role)}
            </p>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: Detalles del usuario en un grid responsivo de dos columnas */}
      <div className="card mb-5 bg-base-100 shadow-lg border-2 border-base-200 w-full max-w-3xl">
        <div className="card-body">
          <div className="flex mb-4">
            <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-black uppercase tracking-[0.2em] bg-yellow-400 text-black border-2 border-base-100 shadow-md">
              Detalles del Usuario
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Campo: Nombre del usuario */}
            <label className="card card-side bg-base-200 border border-base-300 p-4 items-center gap-2">
              <IconUser size={30} />
              <input
                type="text"
                value={user.firstName}
                readOnly
                className="input input-ghost w-full text-base-content"
                aria-label="Nombre"
              />
            </label>

            {/* Campo: Correo electrónico del usuario */}
            <label className="card card-side bg-base-200 border border-base-300 p-4 items-center gap-2">
              <IconMail size={30} />
              <input
                type="text"
                value={user.email}
                readOnly
                className="input input-ghost w-full text-base-content"
                aria-label="Email"
              />
            </label>

            {/* Campo: Apellido del usuario - Se muestra solo si está registrado en el perfil */}
            {user.profile?.lastName && (
              <label className="card card-side bg-base-200 border border-base-300 p-4 items-center gap-2">
                <IconUser size={30} />
                <div className="flex flex-col w-full">
                  <span className="text-xs text-base-content/60">Apellido</span>
                  <input
                    type="text"
                    value={user.profile.lastName}
                    readOnly
                    className="input input-ghost w-full text-base-content"
                    aria-label="Apellido"
                  />
                </div>
              </label>
            )}

            {/* Campo: Rol del usuario dentro del sistema (Profesor, Estudiante o Administrador) */}
            <label className="card card-side bg-base-200 border border-base-300 p-4 items-center gap-2">
              <IconUserCheck size={30} />
              <div className="flex flex-col w-full">
                <span className="text-xs text-base-content/60">Rol</span>
                <input
                  type="text"
                  value={roleLabel(user.role)}
                  readOnly
                  className="input input-ghost w-full text-base-content"
                  aria-label="Rol"
                />
              </div>
            </label>

            {/* Campo: Identificador único de MongoDB del usuario - ocupa dos columnas */}
            <label className="card card-side bg-base-200 border border-base-300 p-4 items-center gap-2 col-span-2 text-xs">
              <IconKey size={30} />
              <div className="flex flex-col w-full">
                <span className="text-xs text-base-content/60">ID del Usuario</span>
                <input
                  type="text"
                  value={String(user._id)}
                  readOnly
                  className="input input-ghost input-sm w-full text-xs text-base-content font-mono"
                  aria-label="ID de usuario"
                />
              </div>
            </label>

            {/* Campo: Fecha en que se creó la cuenta - ocupa dos columnas */}
            <label className="card card-side bg-base-200 border border-base-300 p-4 items-center gap-2 col-span-2">
              <IconCalendar size={30} />
              <div className="flex flex-col w-full">
                <span className="text-xs text-base-content/60">Miembro desde</span>
                <input
                  type="text"
                  value={new Date(user.createdAt).toLocaleDateString("es-ES")}
                  readOnly
                  className="input input-ghost w-full text-base-content"
                  aria-label="Fecha de registro"
                />
              </div>
            </label>

            {/* Campo: Biografía personal del usuario - Se muestra solo si está registrada y ocupa dos columnas */}
            {user.profile?.bio && (
              <label className="card card-side bg-base-200 border border-base-300 p-4 items-center gap-2 col-span-2">
                <div className="flex flex-col w-full">
                  <span className="text-xs text-base-content/60">Biografía</span>
                  <textarea
                    value={user.profile.bio}
                    readOnly
                    className="textarea textarea-ghost w-full text-base-content"
                    rows={3}
                    aria-label="Biografía"
                  />
                </div>
              </label>
            )}
          </div>
        </div>
      </div>

      {/* SECCIÓN 3: Lista de cursos en los que el usuario está inscrito como estudiante */}
      {/* Solo se muestra si existen cursos inscritos */}
      {user.enrolledCourses && user.enrolledCourses.length > 0 && (
        <div className="card mb-5 bg-base-100 shadow-lg border-2 border-base-200 w-full max-w-3xl">
          <div className="card-body">
            <div className="flex mb-4 items-center gap-2">
              <IconBook size={24} />
              <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-black uppercase tracking-[0.2em] bg-blue-400 text-black border-2 border-base-100 shadow-md">
                Cursos Inscritos ({user.enrolledCourses.length})
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {user.enrolledCourses.map((course) => {
                const cId = String(course._id);
                return (
                  <div
                    key={cId}
                    className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="card-body p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <h2 className="card-title text-lg">{course.title}</h2>
                          {course.description && (
                            <p className="text-sm text-base-content/70">{course.description}</p>
                          )}
                        </div>
                        <Link href={`/mycourses/${cId}`} className="btn btn-warning btn-sm">
                          Entrar
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SECCIÓN 4: Lista de cursos que ha creado el profesor o administrador */}
      {/* Solo se muestra si existen cursos creados */}
      {user.createdCourses && user.createdCourses.length > 0 && (
        <div className="card mb-5 bg-base-100 shadow-lg border-2 border-base-200 w-full max-w-3xl">
          <div className="card-body">
            <div className="flex mb-4 items-center gap-2">
              <IconSchool size={24} />
              <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-black uppercase tracking-[0.2em] bg-green-400 text-black border-2 border-base-100 shadow-md">
                Cursos Creados ({user.createdCourses.length})
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {user.createdCourses.map((course) => {
                const cId = String(course._id);
                return (
                  <div
                    key={cId}
                    className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="card-body p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <h2 className="card-title text-lg">{course.title}</h2>
                          {course.description && (
                            <p className="text-sm text-base-content/70">{course.description}</p>
                          )}
                        </div>
                        <Link href={`/mycourses/${cId}`} className="btn btn-info btn-sm">
                          Gestionar
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SECCIÓN 5: Panel de gestión para profesores y administradores */}
      {/* Solo aparece cuando un profesor o administrador está visualizando el perfil de otro usuario */}
      {/* Desde este panel es posible gestionar calificaciones, tareas y otras funciones académicas */}
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