"use client";

import Link from "next/link";
import { CURSOS } from "@/seed/data";
import { IconDotsVertical, IconArrowUpRight, IconTrash } from "@tabler/icons-react";
import CreateCourseModal from "@/components/ui/CreateCourseModal";
import { useEffect, useState } from "react";

interface CourseData {
  id: string;
  nombre: string;
  descripcion: string;
  imagen: string;
  ownerId?: string;
}

export default function CoursesView({ isTeacher }: { isTeacher?: boolean }) {
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [unenrollingId, setUnenrollingId] = useState<string | null>(null);
  const [unenrollError, setUnenrollError] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Fetch cursos de MongoDB
        const response = await fetch("/api/courses?limit=100");
        const data = await response.json();

        if (data.data?.items) {
          // Mapea los cursos de MongoDB al formato esperado
          const dbCourses = data.data.items.map((c: any) => ({
            id: c._id,
            nombre: c.title,
            descripcion: c.description,
            imagen: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=60", // Imagen por defecto
            ownerId: c.ownerId,
          }));

          // Combina con cursos del seed
          const allCourses = [...dbCourses, ...CURSOS];
          setCourses(allCourses);
        } else {
          // Si falla, solo muestra seed
          setCourses(CURSOS);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        // Fallback a seed data
        setCourses(CURSOS);
      } finally {
        setLoading(false);
      }
    };

    // Obtener ID del usuario actual
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch("/api/auth/check-role");
        const data = await response.json();
        if (data.data?.userId) {
          setCurrentUserId(data.data.userId);
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };

    fetchCourses();
    fetchCurrentUser();
  }, []);

  const handleDeleteCourse = async (courseId: string) => {
    setDeletingId(courseId);
    setDeleteError("");
    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        setDeleteError(data.error || data.message || "Error al eliminar el curso");
        setDeletingId(null);
        return;
      }

      // Eliminar del estado local
      setCourses((prevCourses) => prevCourses.filter((c: CourseData) => c.id !== courseId));
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
      const response = await fetch(`/api/courses/${courseId}/unenroll`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        setUnenrollError(data.error || data.message || "Error al cancelar el registro");
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
                    courses.map((c: any) => (
                        <Link key={c.id} href={`/mycourses/${c.id}`} className="card bg-base-100 shadow-xl border border-base-200 hover:shadow-2xl transition-all group relative flex flex-col z-20 hover:z-30 focus-within:z-30">
                            <div className="relative">
                                <figure className="aspect-video relative overflow-hidden rounded-t-xl">
                                    <img
                                        src={c.imagen}
                                        alt={c.nombre}
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
                                <h2 className="card-title text-lg leading-tight flex-grow">{c.nombre}</h2>
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
                                                <button onClick={() => location.href = `/mycourses/${c.id}`} className="flex justify-between">
                                                    Acceder al curso
                                                    <IconArrowUpRight size={16} />
                                                </button>
                                            </li>
                                            <li>
                                                <button 
                                                  className="text-warning hover:bg-warning/10"
                                                  onClick={() => (document.getElementById(`confirm_unenroll_${c.id}`) as HTMLDialogElement)?.showModal()}
                                                >
                                                  Cancelar registro
                                                </button>
                                            </li>
                                            {/* Opción de eliminar solo visible para el propietario */}
                                            {c.ownerId && c.ownerId === currentUserId && (
                                              <li>
                                                <button 
                                                  className="text-error hover:bg-error/10"
                                                  onClick={() => (document.getElementById(`confirm_delete_${c.id}`) as HTMLDialogElement)?.showModal()}
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
                    ))
                )}
            </div>

            {/* Modales de confirmación de eliminación para cada curso */}
            {courses.map((course) => (
              <dialog key={`dialog_${course.id}`} id={`confirm_delete_${course.id}`} className="modal">
                <div className="modal-box border border-error/30 bg-error/5">
                  <h3 className="font-bold text-lg text-error">Eliminar curso</h3>
                  <p className="py-4">
                    ¿Estás seguro de que deseas eliminar el curso <strong>"{course.nombre}"</strong>? Esta acción no se puede deshacer.
                  </p>
                  {deleteError && (
                    <div className="alert alert-error mb-4">
                      <span>{deleteError}</span>
                    </div>
                  )}
                  <div className="modal-action gap-2">
                    <button
                      type="button"
                      onClick={() => (document.getElementById(`confirm_delete_${course.id}`) as HTMLDialogElement)?.close()}
                      className="btn btn-ghost"
                      disabled={deletingId === course.id}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCourse(course.id)}
                      className="btn btn-error"
                      disabled={deletingId === course.id}
                    >
                      {deletingId === course.id ? (
                        <>
                          <span className="loading loading-spinner loading-sm"></span>
                          Eliminando...
                        </>
                      ) : (
                        "Eliminar"
                      )}
                    </button>
                  </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                  <button>cerrar</button>
                </form>
              </dialog>
            ))}

            {/* Modales de confirmación de desincripción para cada curso */}
            {courses.map((course) => (
              <dialog key={`unenroll_dialog_${course.id}`} id={`confirm_unenroll_${course.id}`} className="modal">
                <div className="modal-box border border-warning/30 bg-warning/5 backdrop-blur">
                  <h3 className="font-bold text-lg text-warning">Cancelar registro</h3>
                  <p className="py-4">
                    ¿Estás seguro de que deseas cancelar tu registro en el curso <strong>"{course.nombre}"</strong>? No podrás acceder al contenido hasta que te vuelvas a inscribir.
                  </p>
                  {unenrollError && (
                    <div className="alert alert-error mb-4">
                      <span>{unenrollError}</span>
                    </div>
                  )}
                  <div className="modal-action gap-2">
                    <button
                      type="button"
                      onClick={() => (document.getElementById(`confirm_unenroll_${course.id}`) as HTMLDialogElement)?.close()}
                      className="btn btn-ghost"
                      disabled={unenrollingId === course.id}
                    >
                      Volver
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUnenrollCourse(course.id)}
                      className="btn btn-warning"
                      disabled={unenrollingId === course.id}
                    >
                      {unenrollingId === course.id ? (
                        <>
                          <span className="loading loading-spinner loading-sm"></span>
                          Cancelando...
                        </>
                      ) : (
                        "Sí, cancelar registro"
                      )}
                    </button>
                  </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                  <button>cerrar</button>
                </form>
              </dialog>
            ))}

        </main>
    )
}