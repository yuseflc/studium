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
import TeacherProfileView from "@/components/ui/profile/TeacherProfileView";
import EditProfileForm from "@/components/ui/profile/EditProfileForm";

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

      {/* SECCIÓN 1: Encabezado del perfil refinado y compacto (Equilibrado) */}
      <div className="card mb-4 bg-base-100 shadow-md border border-base-200 p-4 w-full max-w-3xl">
        <div className="flex items-center gap-5">
          {/* Avatar un poco más pequeño y centrado */}
          <div className="avatar">
            <div className="w-16 h-16 rounded-full ring ring-base-300 ring-offset-base-100 ring-offset-2 shadow-sm">
              <img src={profilePicture} alt={`Avatar de ${fullName}`} />
            </div>
          </div>
          {/* Textos alineados verticalmente sin espacios muertos */}
          <div className="flex flex-col justify-center">
            <h1 className="text-xl font-bold text-base-content leading-tight">{fullName}</h1>
            <p className="text-xs font-semibold text-base-content/60 mt-1 capitalize bg-base-200 px-2.5 py-0.5 rounded-md inline-block w-fit border border-base-300">
              {roleLabel(user.role)}
            </p>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: Detalles del usuario (Editable para el dueño, estático para el resto) */}
      {!isViewingOthers ? (
        <EditProfileForm 
          user={{
            ...user,
            _id: String(user._id)
          }} 
        />
      ) : (
        // Tu código de visualización original adaptado con las mismas clases de tamaño compacto y equilibrado
        <div className="card mb-4 bg-base-100 shadow-md border border-base-200 w-full max-w-3xl">
          <div className="card-body p-5">
            <div className="flex mb-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-[0.2em] bg-yellow-400 text-black border-2 border-base-100 shadow-md">
                Detalles del Usuario
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {/* Campo: Nombre del usuario */}
              <div className="flex items-center gap-3 bg-base-200 border border-base-300 rounded-xl px-4 py-2">
                <IconUser size={22} className="text-base-content/60 shrink-0" />
                <div className="flex flex-col w-full">
                  <span className="text-[11px] text-base-content/50 font-bold uppercase tracking-wider leading-none mb-1">Nombre</span>
                  <input type="text" value={user.firstName} readOnly className="input input-md h-9 w-full text-base p-0 bg-transparent text-base-content border-none" aria-label="Nombre" />
                </div>
              </div>

              {/* Campo: Correo electrónico del usuario */}
              <div className="flex items-center gap-3 bg-base-200 border border-base-300 rounded-xl px-4 py-2">
                <IconMail size={22} className="text-base-content/60 shrink-0" />
                <div className="flex flex-col w-full">
                  <span className="text-[11px] text-base-content/50 font-bold uppercase tracking-wider leading-none mb-1">Email</span>
                  <input type="text" value={user.email} readOnly className="input input-md h-9 w-full text-base p-0 bg-transparent text-base-content border-none" aria-label="Email" />
                </div>
              </div>

              {/* Campo: Apellido del usuario */}
              {user.profile?.lastName && (
                <div className="flex items-center gap-3 bg-base-200 border border-base-300 rounded-xl px-4 py-2">
                  <IconUser size={22} className="text-base-content/60 shrink-0" />
                  <div className="flex flex-col w-full">
                    <span className="text-[11px] text-base-content/50 font-bold uppercase tracking-wider leading-none mb-1">Apellido</span>
                    <input type="text" value={user.profile.lastName} readOnly className="input input-md h-9 w-full text-base p-0 bg-transparent text-base-content border-none" aria-label="Apellido" />
                  </div>
                </div>
              )}

              {/* Campo: Rol del usuario dentro del sistema */}
              <div className="flex items-center gap-3 bg-base-200 border border-base-300 rounded-xl px-4 py-2 opacity-80">
                <IconUserCheck size={22} className="text-base-content/60 shrink-0" />
                <div className="flex flex-col w-full">
                  <span className="text-[11px] text-base-content/50 font-bold uppercase tracking-wider leading-none mb-1">Rol</span>
                  <input type="text" value={roleLabel(user.role)} readOnly className="input input-md h-9 w-full text-base p-0 bg-transparent text-base-content border-none" aria-label="Rol" />
                </div>
              </div>

              {/* Campo: Identificador único de MongoDB del usuario */}
              <div className="flex items-center gap-3 bg-base-200 border border-base-300 rounded-xl px-4 py-2 col-span-1 md:col-span-2 opacity-75">
                <IconKey size={22} className="text-base-content/60 shrink-0" />
                <div className="flex flex-col w-full">
                  <span className="text-[11px] text-base-content/50 font-bold uppercase tracking-wider leading-none mb-1">ID del Usuario</span>
                  <input type="text" value={String(user._id)} readOnly className="input input-sm h-8 w-full text-sm p-0 bg-transparent text-base-content font-mono border-none" aria-label="ID de usuario" />
                </div>
              </div>

              {/* Campo: Fecha en que se creó la cuenta */}
              <div className="flex items-center gap-3 bg-base-200 border border-base-300 rounded-xl px-4 py-2 col-span-1 md:col-span-2 opacity-80">
                <IconCalendar size={22} className="text-base-content/60 shrink-0" />
                <div className="flex flex-col w-full">
                  <span className="text-[11px] text-base-content/50 font-bold uppercase tracking-wider leading-none mb-1">Miembro desde</span>
                  <input type="text" value={new Date(user.createdAt).toLocaleDateString("es-ES")} readOnly className="input input-md h-9 w-full text-base p-0 bg-transparent text-base-content border-none" aria-label="Fecha de registro" />
                </div>
              </div>

              {/* Campo: Biografía personal del usuario */}
              {user.profile?.bio && (
                <div className="bg-base-200 border border-base-300 rounded-xl px-4 py-3 col-span-1 md:col-span-2">
                  <div className="flex flex-col w-full">
                    <span className="text-[11px] text-base-content/50 font-bold uppercase tracking-wider leading-none mb-2">Biografía</span>
                    <textarea value={user.profile.bio} readOnly className="textarea w-full text-base bg-transparent text-base-content border-none p-0 min-h-[80px] resize-none" rows={3} aria-label="Biografía" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECCIÓN 3: Lista de cursos en los que el usuario está inscrito como estudiante */}
      {user.enrolledCourses && user.enrolledCourses.length > 0 && (
        <div className="card mb-5 bg-base-100 shadow-lg border-2 border-base-200 w-full max-w-3xl">
          <div className="card-body p-4">
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
                            <p className="text-sm text-base-content/70">{truncateText(course.description, 140)}</p>
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
      {user.createdCourses && user.createdCourses.length > 0 && (
        <div className="card mb-5 bg-base-100 shadow-lg border-2 border-base-200 w-full max-w-3xl">
          <div className="card-body p-4">
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
                            <p className="text-sm text-base-content/70">{truncateText(course.description, 140)}</p>
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