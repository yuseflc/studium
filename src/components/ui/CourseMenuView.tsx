"use client";

import Link from "next/link";
import { IconDotsVertical, IconArrowUpRight, IconTrash, IconCancel } from "@tabler/icons-react";
import CreateCourseModal from "@/components/ui/CreateCourseModal";
import { ModalDanger, ModalAdvise } from "@/components/ui/modals";
import { useEffect, useState } from "react";
import { fetchCourses, getCurrentUser, deleteCourse, unenrollCourse, type SerializedCourse } from "@/app/actions/courseActions";

export default function CoursesView({ isTeacher }: { isTeacher?: boolean }) {
  const [courses, setCourses] = useState<SerializedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [unenrollingId, setUnenrollingId] = useState<string | null>(null);
  const [unenrollError, setUnenrollError] = useState("");

  useEffect(() => {
    const initializeData = async () => {
      try {
        // Fetch cursos desde BD + seed (ya combinados en Server Actions)
        const allCourses = await fetchCourses();
        setCourses(allCourses);

        // Obtener ID del usuario actual
        const userId = await getCurrentUser();
        if (userId) {
          setCurrentUserId(userId);
        }
      } catch (error) {
        console.error("Error initializing data:", error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  const handleDeleteCourse = async (courseId: string) => {
    setDeletingId(courseId);
    setDeleteError("");
    try {
      const result = await deleteCourse(courseId);

      if (!result.success) {
        setDeleteError(result.error || "Error al eliminar el curso");
        setDeletingId(null);
        return;
      }

      // Eliminar del estado local
      setCourses((prevCourses) => prevCourses.filter((c: SerializedCourse) => c._id !== courseId));
      setDeletingId(null);

      // Cerrar modal de confirmación
      (document.getElementById(`confirm_delete_${courseId}`) as HTMLDialogElement)?.close();
    } catch (error: any) {
      setDeleteError(error.message || "Error al eliminar el curso");
      setDeletingId(null);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    window.location.reload();
  };

  const handleUnenrollCourse = async (courseId: string) => {
    setUnenrollingId(courseId);
    setUnenrollError("");
    try {
      const result = await unenrollCourse(courseId);

      if (!result.success) {
        setUnenrollError(result.error || "Error al cancelar el registro");
        setUnenrollingId(null);
        return;
      }

      // Cerrar modal de confirmación
      (document.getElementById(`confirm_unenroll_${courseId}`) as HTMLDialogElement)?.close();
      setUnenrollingId(null);

      // Mostrar confirmación y recargar
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      setUnenrollError(error.message || "Error al cancelar el registro");
      setUnenrollingId(null);
    }
  };

  return (
    <main className="p-8 bg-base-100 min-h-[calc(100vh-64px)]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Catálogo de cursos</h1>
        {isTeacher && <CreateCourseModal onCourseCreated={handleRefresh} />}
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 relative z-10">
        {loading ? (
          Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="card bg-base-200 border border-base-200 shadow-sm animate-pulse min-h-[300px]">
              <div className="h-40 bg-base-300 rounded-t-xl" />
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
            return (
              <Link key={courseId} href={`/mycourses/${courseId}`} className="card bg-base-100 shadow-xl border border-base-200 hover:shadow-2xl transition-all group relative flex flex-col z-20 hover:z-30 focus-within:z-30">
                <div className="relative">
                  <figure className="aspect-video relative overflow-hidden rounded-t-xl">
                    <img
                      src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=60"
                      alt={c.title}
                      className="w-full h-full object-cover transition-transform"
                    />
                    {/* Overlay para facilitar lectura del nombre */}
                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

                    <div className="absolute top-2 right-2 opacity-0 border border-white group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0 -translate-x-2 group-hover:translate-y-0 translate-y-2 bg-black/50 p-1.5 rounded-full">
                      <IconArrowUpRight size={20} className="text-white" />
                    </div>
                  </figure>

                  <span className="badge absolute -bottom-3 left-20 text-xs min-[1280px]:max-[1300px]:text-[5px] min-[1300px]:max-[1550px]:text-[7px] font-bold uppercase tracking-widest drop-shadow-md z-40">
                    Ignacio Miguel Mateos
                  </span>

                  {/* Avatar movido fuera del figure para evitar recortes y problemas de z-index */}
                  <div className="absolute -bottom-8 left-2 w-16 h-16 rounded-full border-4 border-base-100 overflow-hidden z-30 bg-base-300 shadow-lg">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"
                      alt="Ignacio Miguel Mateos"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="card-body p-4 pt-10 flex flex-col relative">
                  <h2 className="card-title text-lg leading-tight flex-grow">{c.title}</h2>
                  <p className="text-sm text-base-content/70">{c.description}</p>
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
                              onClick={() => (document.getElementById(`confirm_delete_${courseId}`) as HTMLDialogElement)?.showModal()}
                            >
                              <IconTrash size={16} />
                              Eliminar curso
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

      {/* Modales de confirmación de eliminación para cada curso */}
      {courses.map((course) => (
        <ModalDanger
          key={`dialog_${course._id}`}
          id={`confirm_delete_${course._id}`}
          title="Eliminar curso"
          description={
            <p>
              ¿Estás seguro de que deseas eliminar el curso <strong>"{course.title}"</strong>? Esta acción no se puede deshacer.
            </p>
          }
          confirmLabel="Eliminar"
          onConfirm={() => handleDeleteCourse(course._id)}
          isLoading={deletingId === course._id}
          error={deletingId === course._id ? deleteError : null}
        />
      ))}

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
    </main>
  );
}