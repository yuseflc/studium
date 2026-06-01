/* Archivo: src\components\ui\CourseMenuView.tsx
  Descripción: Vista del menú de curso con acciones rápidas (navegación y atajos). */

"use client";
// Menú de acciones del curso (editar, eliminar, compartir)
import Link from "next/link";
import { IconDotsVertical, IconArrowUpRight, IconTrash, IconCancel } from "@tabler/icons-react";
import CreateCourseModal from "@/components/courses/CreateCourseModal";
import JoinCourseButton from "@/components/modals/JoinCourseModal";
import { ModalAdvise, CourseMenuDeleteModal } from "@/components/modals";
import { useCourseList } from "@/hooks/useCourseList";
import type { SerializedCourse } from "@/app/actions/courseActions";
import { truncateText } from "@/lib/utils";
import { getPatternById } from "@/lib/coursePatterns";

export default function CoursesView({ isTeacher }: { isTeacher?: boolean }) {
  const {
    courses,
    loading,
    currentUserId,
    deletingId,
    deleteError,
    courseToDelete,
    setCourseToDelete,
    unenrollingId,
    unenrollError,
    handleRefresh,
    handleDeleteCourse,
    handleUnenrollCourse,
  } = useCourseList();

  return (
    <main className="p-8 bg-base-100 min-h-[calc(100vh-64px)]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Catálogo de cursos</h1>
        <div className="flex gap-3">
          <JoinCourseButton onCourseJoined={handleRefresh} />
          {isTeacher && <CreateCourseModal onCourseCreated={handleRefresh} />}
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 relative z-10">
        {loading ? (
          Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="card bg-base-200 border border-base-200 shadow-sm animate-pulse min-h-[300px]">
              <div className="h-28 bg-base-300 rounded-t-xl" />
              <div className="card-body p-4 flex flex-col gap-4">
                <div className="h-6 w-3/4 rounded-md bg-base-300" />
                <div className="h-4 w-1/2 rounded-md bg-base-300" />
                <div className="h-4 w-full rounded-md bg-base-300" />
                <div className="h-4 w-5/6 rounded-md bg-base-300" />
                <div className="mt-auto flex justify-end">
                  <div className="h-10 w-10 rounded-full bg-base-300" />
                </div>
              </div>
            </div>
          ))
        ) : courses.length === 0 ? (
          <div className="col-span-full text-center py-12 text-base-content/60">
            <p>No hay cursos disponibles aún</p>
          </div>
        ) : (
          courses.map((c: SerializedCourse) => {
            const courseId = c._id;
            // Resuelve el patrón CSS a partir del ID guardado en BD; usa el primero como fallback
            const pattern = getPatternById(c.coverImage);
            return (
              <Link key={courseId} href={`/mycourses/${courseId}`} className="card bg-base-100 shadow-xl border border-base-200 hover:shadow-2xl transition-all group relative flex flex-col z-20 hover:z-30 focus-within:z-30">
                <div className="relative">
                  {/* Cabecera de la tarjeta: div en vez de <img> porque el fondo es CSS puro */}
                  <figure className="h-28 relative overflow-hidden rounded-t-xl">
                    <div
                      className="w-full h-full"
                      style={pattern.style}
                    />
                    {/* Overlay para facilitar lectura del nombre */}
                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

                    <div className="absolute top-2 right-2 opacity-0 border border-white group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0 -translate-x-2 group-hover:translate-y-0 translate-y-2 bg-black/50 p-1.5 rounded-full">
                      <IconArrowUpRight size={20} className="text-white" />
                    </div>
                  </figure>

                  <span className="absolute -bottom-3 left-20 inline-flex items-center px-3 py-1 rounded-full text-[10px] min-[1280px]:max-[1300px]:text-[6px] min-[1300px]:max-[1550px]:text-[8px] font-black uppercase tracking-[0.15em] bg-yellow-400 text-black border-2 border-base-100 shadow-lg z-40 transform hover:scale-105 transition-transform duration-200">
                    {c.ownerName ?? "Profesor"}
                  </span>

                  {/* Avatar del propietario: foto de Google (OAuth) o Robohash si no tiene cuenta vinculada */}
                  <div className="absolute -bottom-8 left-2 w-16 h-16 rounded-full border-4 border-base-100 overflow-hidden z-30 bg-base-300 shadow-lg">
                    <img
                      src={c.ownerAvatar ?? `https://robohash.org/${c.ownerId}?set=set5`}
                      alt={c.ownerName ?? "Profesor"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="card-body p-4 pt-10 flex flex-col relative">
                  <h2 className="card-title text-lg leading-tight flex-grow">{c.title}</h2>
                  <p className="text-sm text-base-content/70">{truncateText(c.description, 140)}</p>
                  <div className="card-actions justify-end mt-auto" onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}>
                    <div className="dropdown dropdown-end">
                      <div
                        tabIndex={0}
                        role="button"
                        aria-label="Opciones del curso"
                        className="hover:bg-base-200 rounded-full transition-colors p-2 translate-x-2"
                      >
                        <IconDotsVertical size={20} className="text-base-content/50" />
                      </div>
                      <ul tabIndex={0} className="dropdown-content z-[1000] menu p-2 shadow bg-base-100 rounded-box w-52 border border-base-200">
                        <li>
                          <button onClick={() => location.href = `/mycourses/${courseId}`}>
                            <IconArrowUpRight size={16} />
                            Acceder al curso

                          </button>
                        </li>
                        <li>
                          <button
                            className="text-warning hover:bg-warning/10"
                            onClick={() => (document.getElementById(`confirm_unenroll_${courseId}`) as HTMLDialogElement)?.showModal()}
                          >
                            <IconCancel size={16} /> Cancelar registro
                          </button>
                        </li>
                        {/* Opción de eliminar solo visible para el propietario */}
                        {c.ownerId && c.ownerId === currentUserId && (
                          <li>
                            <button
                              className="text-error hover:bg-error/10"
                              onClick={() => {
                                setCourseToDelete(courseId);
                                if (document.activeElement instanceof HTMLElement) {
                                  document.activeElement.blur();
                                }
                              }}
                            >
                              <IconTrash size={16} /> Eliminar curso
                            </button>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {/* El modal de confirmación fue reemplazado por el HoldDeleteButton — eliminación directa tras 3s */}

      {/* Modales de confirmación de desincripción para cada curso */}
      {courses.map((course) => (
        <ModalAdvise
          key={`unenroll_dialog_${course._id}`}
          id={`confirm_unenroll_${course._id}`}
          title="Cancelar registro"
          description={
            <p>
              ¿Estás seguro de que deseas cancelar tu registro en el curso <strong>"{course.title}"</strong>? No podrás acceder al contenido hasta que te vuelvas a inscribir.
            </p>
          }
          confirmLabel="Sí, cancelar registro"
          onConfirm={() => handleUnenrollCourse(course._id)}
          isLoading={unenrollingId === course._id}
          error={unenrollingId === course._id ? unenrollError : null}
        />
      ))}

      {/* Modal para confirmar eliminación con pulsación de 3s */}
      {courseToDelete && (
        <CourseMenuDeleteModal
          courseTitle={courses.find((c) => c._id === courseToDelete)?.title || ""}
          isDeleting={deletingId === courseToDelete}
          onClose={() => {
            if (deletingId === null) setCourseToDelete(null);
          }}
          onConfirm={() => handleDeleteCourse(courseToDelete)}
          error={deleteError}
        />
      )}
    </main>
  );
}