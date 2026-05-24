"use client";

import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  BookOpen,
  Users,
  GraduationCap,
  Settings,
  AlertTriangle,
  Archive,
  Trash2,
  Send,
  Copy,
  RefreshCw,
  Eye,
  UserPlus,
  Check,
  X,
} from "lucide-react";
import CourseSidebar from "./Navbars/CourseSidebar";
import CourseStructureManager, { type CourseSubjectItem } from "./CourseStructureManager";
import CourseParticipants from "./CourseParticipants";
import GradesView from "./grades/GradesView";
import CourseFAB from "./CourseFAB";
import { PARTICIPANTES } from "@/seed/data";
import { ICourse } from "@/models/Course";
import { CourseStructureGeneric } from "@/lib/api/types";
import { deleteTask } from "@/app/actions/taskActions";
import {
  deleteCourse as deleteCourseAction,
  inviteStudentByEmail,
  transferCourseOwnership,
  updateCourse,
} from "@/app/actions/courseActions";

interface CourseViewProps {
  courseData: ICourse | null;
  courseStructure: CourseStructureGeneric | null;
  isTeacher: boolean;
}

type CourseStatus = "draft" | "active" | "archived";

export default function CourseView({ courseData, courseStructure, isTeacher }: CourseViewProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const [activeTab, setActiveTab] = useState<"content" | "participants" | "grades" | "settings">("content");
  const [deletedItems, setDeletedItems] = useState<string[]>([]);

  const initialSubjects = useMemo(
    () => courseStructure?.subjects || courseData?.subjects || [],
    [courseStructure?.subjects, courseData?.subjects]
  );
  const [subjects, setSubjects] = useState<any[]>(initialSubjects as any[]);

  const [title, setTitle] = useState(courseData?.title || "");
  const [description, setDescription] = useState(courseData?.description || "");
  const [status, setStatus] = useState<CourseStatus>(courseData?.status || "draft");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [showParticipants, setShowParticipants] = useState(true);
  const [allowComments, setAllowComments] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteCode, setInviteCode] = useState("COURSE-2024-ABC123");
  const [isInviting, setIsInviting] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showVisibilityModal, setShowVisibilityModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferEmail, setTransferEmail] = useState("");
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");

  const courseId = String(courseData?._id || "");

  useEffect(() => {
    setSubjects(initialSubjects as any[]);
  }, [initialSubjects]);

  useEffect(() => {
    setTitle(courseData?.title || "");
    setDescription(courseData?.description || "");
    setStatus(courseData?.status || "draft");
  }, [courseData?.title, courseData?.description, courseData?.status]);

  const handleAddTask = (task: any) => {
    if (!task?.subjectId) return;

    setSubjects((prev) =>
      prev.map((subject: any) => {
        const subjectId = String(subject?._id || subject?.id || "");
        if (subjectId !== String(task.subjectId)) return subject;

        const existingTasks = Array.isArray(subject.tasks) ? subject.tasks : [];
        return {
          ...subject,
          tasks: [task, ...existingTasks],
        };
      })
    );
  };

  const handleAddSubject = (subject: any) => {
    if (!subject?._id) return;

    setSubjects((prev) => {
      const alreadyExists = prev.some((s: any) => String(s?._id || s?.id || "") === String(subject._id));
      if (alreadyExists) return prev;

      return [
        ...prev,
        {
          ...subject,
          units: Array.isArray(subject.units) ? subject.units : [],
          tasks: Array.isArray(subject.tasks) ? subject.tasks : [],
        },
      ];
    });
  };

  const handleAddResource = (resource: any) => {
    if (!resource?.unitId) return;

    setSubjects((prev) =>
      prev.map((subject: any) => {
        const units = Array.isArray(subject.units) ? subject.units : [];
        const nextUnits = units.map((unit: any) => {
          const unitId = String(unit?._id || unit?.id || "");
          if (unitId !== String(resource.unitId)) return unit;

          const existingResources = Array.isArray(unit.resources) ? unit.resources : [];
          return {
            ...unit,
            resources: [resource, ...existingResources],
          };
        });

        return {
          ...subject,
          units: nextUnits,
        };
      })
    );
  };

  const handleDeleteItem = async (id: string) => {
    setDeletedItems((prev) => [...prev, id]);

    try {
      const result = await deleteTask(id);
      if (!result.success) {
        throw new Error(result.error || "Error deleting task");
      }

      setSubjects((prev) =>
        prev.map((subject: any) => ({
          ...subject,
          tasks: Array.isArray(subject.tasks)
            ? subject.tasks.filter((task: any) => String(task?._id || task?.id || "") !== id)
            : subject.tasks,
        }))
      );
    } catch (error) {
      console.error("Error deleting task:", error);
      setDeletedItems((prev) => prev.filter((itemId) => itemId !== id));
    }
  };

  const handleSaveGeneralInfo = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!courseId) {
      setSaveMessage({ type: "error", text: "Curso inválido" });
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const result = await updateCourse(courseId, { title, description, status });
      if (!result.success) {
        throw new Error(result.error || "Error al guardar");
      }

      setSaveMessage({ type: "success", text: "Cambios guardados correctamente" });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al guardar los cambios";
      setSaveMessage({ type: "error", text: message });
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInviteByEmail = async () => {
    if (!inviteEmail || !courseId) return;
    setIsInviting(true);

    try {
      const result = await inviteStudentByEmail(courseId, inviteEmail);
      if (!result.success) {
        throw new Error(result.error || "Error al enviar invitación");
      }

      alert(`Invitacion enviada a ${inviteEmail}`);
      setInviteEmail("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al enviar la invitacion";
      alert(message);
    } finally {
      setIsInviting(false);
    }
  };

  const handleCopyInviteCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (error) {
      console.error("Error al copiar:", error);
    }
  };

  const handleRegenerateCode = () => {
    const newCode = `COURSE-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setInviteCode(newCode);
    alert("Codigo regenerado correctamente");
  };

  const handleChangeVisibility = async () => {
    if (!courseId) return;

    const newStatus: CourseStatus = status === "active" ? "draft" : "active";

    try {
      const result = await updateCourse(courseId, { status: newStatus });
      if (!result.success) {
        throw new Error(result.error || "Error al cambiar visibilidad");
      }

      setStatus(newStatus);
      setShowVisibilityModal(false);
      alert(`Curso ${newStatus === "active" ? "publicado" : "guardado como borrador"} correctamente`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al cambiar la visibilidad";
      alert(message);
    }
  };

  const handleArchiveCourse = async () => {
    if (!courseId) return;

    try {
      const result = await updateCourse(courseId, { status: "archived" });
      if (!result.success) {
        throw new Error(result.error || "Error al archivar el curso");
      }

      setStatus("archived");
      setShowArchiveModal(false);
      alert("Curso archivado correctamente");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al archivar el curso";
      alert(message);
    }
  };

  const handleTransferOwnership = async () => {
    if (!transferEmail || !courseId) return;

    try {
      const result = await transferCourseOwnership(courseId, transferEmail);
      if (!result.success) {
        throw new Error(result.error || "Error al transferir");
      }

      setShowTransferModal(false);
      alert(`Curso transferido a ${transferEmail}`);
      setTransferEmail("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al transferir el curso";
      alert(message);
    }
  };

  const handleDeleteCourse = async () => {
    if (!courseId) return;

    try {
      const result = await deleteCourseAction(courseId);
      if (!result.success) {
        throw new Error(result.error || "Error al eliminar");
      }

      router.push("/mycourses");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al eliminar el curso";
      alert(message);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row">
      <CourseSidebar isTeacher={isTeacher} subjects={subjects} />

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="w-full mx-auto">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 break-words">
              {title || "Cargando curso..."}
              {status === "draft" && (
                <span className="badge bg-secondary text-base-content ml-2 align-middle">BORRADOR</span>
              )}
              {status === "active" && (
                <span className="badge bg-success text-white ml-2 align-middle">PUBLICADO</span>
              )}
              {status === "archived" && (
                <span className="badge bg-warning text-base-content ml-2 align-middle">ARCHIVADO</span>
              )}
            </h1>
          </div>

          <div className="flex border-b border-base-300 mb-6 overflow-x-auto relative z-10">
            <button
              type="button"
              onClick={() => setActiveTab("content")}
              className={`pb-3 px-3 sm:px-4 flex items-center gap-1.5 sm:gap-2 border-b-2 transition-colors shrink-0 whitespace-nowrap ${
                activeTab === "content"
                  ? "border-primary text-primary font-semibold"
                  : "border-transparent text-base-content/60 hover:text-base-content"
              }`}
            >
              <BookOpen size={18} />
              <span className="text-sm sm:text-base">Curso</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("participants")}
              className={`pb-3 px-3 sm:px-4 flex items-center gap-1.5 sm:gap-2 border-b-2 transition-colors shrink-0 whitespace-nowrap ${
                activeTab === "participants"
                  ? "border-primary text-primary font-semibold"
                  : "border-transparent text-base-content/60 hover:text-base-content"
              }`}
            >
              <Users size={18} />
              <span className="text-sm sm:text-base">Participantes</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("grades")}
              className={`pb-3 px-3 sm:px-4 flex items-center gap-1.5 sm:gap-2 border-b-2 transition-colors shrink-0 whitespace-nowrap ${
                activeTab === "grades"
                  ? "border-primary text-primary font-semibold"
                  : "border-transparent text-base-content/60 hover:text-base-content"
              }`}
            >
              <GraduationCap size={18} />
              <span className="text-sm sm:text-base">Calificaciones</span>
            </button>
            {isTeacher && (
              <button
                type="button"
                onClick={() => setActiveTab("settings")}
                className={`pb-3 px-3 sm:px-4 flex items-center gap-1.5 sm:gap-2 border-b-2 transition-colors shrink-0 whitespace-nowrap ${
                  activeTab === "settings"
                    ? "border-primary text-primary font-semibold"
                    : "border-transparent text-base-content/60 hover:text-base-content"
                }`}
              >
                <Settings size={18} />
                <span className="text-sm sm:text-base">Ajustes</span>
              </button>
            )}
          </div>

          <div className="space-y-6">
            {activeTab === "content" && (
              <CourseStructureManager
                courseId={courseId}
                subjects={subjects as CourseSubjectItem[]}
                setSubjects={setSubjects as Dispatch<SetStateAction<CourseSubjectItem[]>>}
                canEdit={isTeacher}
              />
            )}

            {activeTab === "participants" && <CourseParticipants participants={PARTICIPANTES} />}

            {activeTab === "grades" && (
              <GradesView
                participants={PARTICIPANTES}
                subjects={subjects}
                isTeacher={isTeacher}
                currentUserEmail={session?.user?.email || ""}
              />
            )}

            {activeTab === "settings" && isTeacher && (
              <div className="space-y-6 w-full">
                <div className="max-w-3xl mx-auto px-4 sm:px-0">
                  <div className="card bg-base-100 border border-base-300 mb-6">
                    <div className="card-body p-4 sm:p-6">
                      <h2 className="card-title text-lg sm:text-xl mb-4 sm:mb-6">Informacion General</h2>
                      <form onSubmit={handleSaveGeneralInfo} className="space-y-4 sm:space-y-6">
                        <div className="form-control flex flex-col items-start">
                          <label htmlFor="course-title" className="label p-0">
                            <span className="label-text font-medium mb-2">Titulo del Curso</span>
                          </label>
                          <input
                            id="course-title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="input input-bordered mt-2 w-full"
                            placeholder="Ej: Desarrollo Web Avanzado"
                            required
                          />
                        </div>

                        <div className="form-control flex flex-col items-start">
                          <label htmlFor="course-description" className="label p-0">
                            <span className="label-text font-medium mb-2">Descripcion</span>
                          </label>
                          <textarea
                            id="course-description"
                            className="textarea textarea-bordered h-24 mt-2 w-full"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe el contenido y objetivos del curso..."
                          />
                        </div>

                        <div className="form-control flex flex-col items-start">
                          <label className="label p-0">
                            <span className="label-text font-medium mb-2">Estado del Curso</span>
                          </label>
                          <div className="flex flex-col sm:flex-row gap-4 mt-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="course-status"
                                value="draft"
                                checked={status === "draft"}
                                onChange={(e) => setStatus(e.target.value as CourseStatus)}
                                className="radio radio-primary"
                              />
                              <span className="label-text">Borrador</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="course-status"
                                value="active"
                                checked={status === "active"}
                                onChange={(e) => setStatus(e.target.value as CourseStatus)}
                                className="radio radio-primary"
                              />
                              <span className="label-text">Publicado</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="course-status"
                                value="archived"
                                checked={status === "archived"}
                                onChange={(e) => setStatus(e.target.value as CourseStatus)}
                                className="radio radio-primary"
                              />
                              <span className="label-text">Archivado</span>
                            </label>
                          </div>
                        </div>

                        {saveMessage && (
                          <div className={`alert ${saveMessage.type === "success" ? "alert-success" : "alert-error"} text-sm`}>
                            {saveMessage.type === "success" ? <Check size={16} /> : <X size={16} />}
                            <span>{saveMessage.text}</span>
                          </div>
                        )}

                        <div className="card-actions justify-end">
                          <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={isSaving}>
                            {isSaving ? "Guardando..." : "Guardar Cambios"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>

                  <div className="card bg-base-100 border border-base-300 mb-6">
                    <div className="card-body p-4 sm:p-6">
                      <h2 className="card-title text-lg sm:text-xl mb-4 sm:mb-6">Configuracion de Visualizacion</h2>
                      <div className="space-y-4">
                        <div className="form-control">
                          <label className="cursor-pointer label flex-row items-center justify-between gap-3">
                            <div className="flex-1">
                              <span className="label-text font-medium block">Mostrar participantes en la barra horizontal</span>
                              <p className="text-sm text-base-content/60 mt-0.5 break-words pr-2">
                                Muestra la lista de participantes en la barra de navegacion superior
                              </p>
                            </div>
                            <input
                              type="checkbox"
                              className="toggle toggle-primary flex-shrink-0 ml-7"
                              checked={showParticipants}
                              onChange={(e) => setShowParticipants(e.target.checked)}
                            />
                          </label>
                        </div>
                        <div className="form-control">
                          <label className="cursor-pointer label flex-row items-center justify-between gap-3">
                            <div className="flex-1">
                              <span className="label-text font-medium block">Permitir comentarios en el contenido</span>
                              <p className="text-sm text-base-content/60 mt-0.5 break-words pr-2">
                                Los estudiantes pueden comentar en las lecciones y tareas
                              </p>
                            </div>
                            <input
                              type="checkbox"
                              className="toggle toggle-primary flex-shrink-0 ml-19"
                              checked={allowComments}
                              onChange={(e) => setAllowComments(e.target.checked)}
                            />
                          </label>
                        </div>
                        <div className="form-control">
                          <label className="cursor-pointer label flex-row items-center justify-between gap-3">
                            <div className="flex-1">
                              <span className="label-text font-medium block">Notificar nuevas tareas por email</span>
                              <p className="text-sm text-base-content/60 mt-0.5 break-words pr-2">
                                Envia notificaciones por correo cuando se crean nuevas tareas
                              </p>
                            </div>
                            <input
                              type="checkbox"
                              className="toggle toggle-primary flex-shrink-0 ml-13"
                              checked={emailNotifications}
                              onChange={(e) => setEmailNotifications(e.target.checked)}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card bg-base-100 border border-base-300 mb-6">
                    <div className="card-body p-4 sm:p-6">
                      <h2 className="card-title text-lg sm:text-xl mb-4 sm:mb-6">Gestion de Participantes</h2>
                      <div className="space-y-6">
                        <div className="form-control">
                          <label htmlFor="invite-email" className="label">
                            <span className="label-text font-medium mb-2">Invitar por email</span>
                          </label>
                          <div className="flex flex-col sm:flex-row gap-2 mt-2">
                            <input
                              id="invite-email"
                              type="email"
                              placeholder="email@ejemplo.com"
                              value={inviteEmail}
                              onChange={(e) => setInviteEmail(e.target.value)}
                              className="input input-bordered flex-1"
                            />
                            <button
                              onClick={handleInviteByEmail}
                              className="btn btn-outline btn-primary w-full sm:w-auto gap-2"
                              disabled={isInviting || !inviteEmail}
                              type="button"
                            >
                              <Send size={16} />
                              {isInviting ? "Enviando..." : "Invitar"}
                            </button>
                          </div>
                        </div>

                        <div className="divider">O</div>

                        <div className="form-control">
                          <label htmlFor="invite-code" className="label">
                            <span className="label-text font-medium mb-2">Codigo de invitacion</span>
                          </label>
                          <div className="flex flex-col sm:flex-row gap-2 mt-2">
                            <input
                              id="invite-code"
                              type="text"
                              value={inviteCode}
                              readOnly
                              className="input input-bordered flex-1 bg-base-200 text-sm sm:text-base font-mono"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={handleCopyInviteCode}
                                className="btn btn-outline flex-1 sm:flex-none gap-2"
                                type="button"
                              >
                                {showCopied ? <Check size={16} /> : <Copy size={16} />}
                                {showCopied ? "Copiado" : "Copiar"}
                              </button>
                              <button
                                onClick={handleRegenerateCode}
                                className="btn btn-outline btn-secondary flex-1 sm:flex-none gap-2"
                                type="button"
                              >
                                <RefreshCw size={16} />
                                Regenerar
                              </button>
                            </div>
                          </div>
                          <div className="mt-3">
                            <p className="text-xs sm:text-sm text-base-content/60 break-words">
                              Comparte este codigo con tus estudiantes para que se unan al curso
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-2 border-red-200 dark:border-red-800/50 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-950/20 dark:to-red-950/10 px-6 py-4 border-b-2 border-red-200 dark:border-red-800/30">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        <h2 className="font-bold text-red-700 dark:text-red-400 text-lg">Zona de Peligro</h2>
                      </div>
                      <p className="text-sm text-red-600/70 dark:text-red-400/70 mt-1">
                        Las siguientes acciones son irreversibles o pueden afectar significativamente el curso
                      </p>
                    </div>

                    <div className="divide-y divide-red-100 dark:divide-red-800/20">
                      <div className="px-6 py-5 hover:bg-red-50/30 dark:hover:bg-red-950/5 transition-colors">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-3">
                              <Eye className="w-5 h-5 text-base-content/40 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-semibold text-base-content">Cambiar visibilidad del curso</p>
                                <p className="text-sm text-base-content/60 mt-1">
                                  Este curso esta actualmente <span className="font-medium text-base-content/80">{status === "active" ? "publico" : "en borrador"}</span>.
                                  {status === "active"
                                    ? " Los estudiantes pueden ver y acceder al contenido."
                                    : " Solo los profesores pueden ver el curso."}
                                </p>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => setShowVisibilityModal(true)}
                            className="btn btn-md btn-outline w-full lg:w-44 gap-2"
                            type="button"
                          >
                            <Eye size={16} />
                            Cambiar visibilidad
                          </button>
                        </div>
                      </div>

                      <div className="px-6 py-5 hover:bg-red-50/30 dark:hover:bg-red-950/5 transition-colors">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-3">
                              <UserPlus className="w-5 h-5 text-base-content/40 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-semibold text-base-content">Transferir propiedad</p>
                                <p className="text-sm text-base-content/60 mt-1">
                                  Transferir este curso a otro usuario u organizacion donde tengas permisos para crear cursos.
                                  Esta accion notificara al nuevo propietario.
                                </p>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => setShowTransferModal(true)}
                            className="btn btn-md btn-outline w-full lg:w-44 gap-2"
                            type="button"
                          >
                            <UserPlus size={16} />
                            Transferir
                          </button>
                        </div>
                      </div>

                      <div className="px-6 py-5 hover:bg-red-50/30 dark:hover:bg-red-950/5 transition-colors">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-3">
                              <Archive className="w-5 h-5 text-amber-500 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-semibold text-amber-700 dark:text-amber-400">Archivar este curso</p>
                                <p className="text-sm text-base-content/60 mt-1">
                                  Marcar este curso como archivado y de solo lectura. Los estudiantes ya no podran acceder,
                                  pero podras restaurarlo mas tarde.
                                </p>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => setShowArchiveModal(true)}
                            className="btn btn-md btn-outline btn-warning w-full lg:w-44 gap-2"
                            disabled={status === "archived"}
                            type="button"
                          >
                            <Archive size={16} />
                            Archivar curso
                          </button>
                        </div>
                      </div>

                      <div className="px-6 py-5 hover:bg-red-50/50 dark:hover:bg-red-950/10 transition-colors">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-3">
                              <Trash2 className="w-5 h-5 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-semibold text-red-600 dark:text-red-400">Eliminar este curso</p>
                                <p className="text-sm text-base-content/60 mt-1">
                                  <span className="font-medium text-red-600 dark:text-red-400">Advertencia:</span> Una vez que eliminas un curso,
                                  no hay vuelta atras. Se perdera todo el contenido, tareas, calificaciones y datos de participantes.
                                </p>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => setShowDeleteModal(true)}
                            className="btn btn-md btn-error w-full lg:w-44 gap-2"
                            type="button"
                          >
                            <Trash2 size={16} />
                            Eliminar curso
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {isTeacher && (
        <CourseFAB
          onAddTask={handleAddTask}
          onAddSubject={handleAddSubject}
          onAddResource={handleAddResource}
          courseId={courseId}
          defaultSubjectId={subjects[0] ? String(subjects[0]._id) : undefined}
          subjects={subjects}
        />
      )}

      {showVisibilityModal && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Cambiar visibilidad del curso</h3>
            <p className="py-4">
              Estas seguro de que quieres {status === "active" ? "cambiar el curso a borrador" : "publicar el curso"}?
              {status === "active"
                ? " Los estudiantes ya no podran acceder al curso."
                : " Los estudiantes podran ver y acceder al contenido."}
            </p>
            <div className="modal-action">
              <button className="btn" onClick={() => setShowVisibilityModal(false)} type="button">
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleChangeVisibility} type="button">
                {status === "active" ? "Cambiar a Borrador" : "Publicar curso"}
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setShowVisibilityModal(false)} type="button">
              close
            </button>
          </form>
        </dialog>
      )}

      {showTransferModal && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Transferir propiedad</h3>
            <p className="py-2">Ingresa el email del nuevo propietario:</p>
            <input
              type="email"
              placeholder="email@ejemplo.com"
              value={transferEmail}
              onChange={(e) => setTransferEmail(e.target.value)}
              className="input input-bordered w-full mt-2"
            />
            <p className="text-sm text-base-content/60 mt-2">
              Esta accion es irreversible. El nuevo propietario recibira una notificacion.
            </p>
            <div className="modal-action">
              <button className="btn" onClick={() => setShowTransferModal(false)} type="button">
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleTransferOwnership} disabled={!transferEmail} type="button">
                Transferir
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setShowTransferModal(false)} type="button">
              close
            </button>
          </form>
        </dialog>
      )}

      {showArchiveModal && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Archivar curso</h3>
            <p className="py-4">
              Estas seguro de que quieres archivar este curso? Los estudiantes ya no podran acceder al contenido,
              pero podras restaurarlo mas tarde.
            </p>
            <div className="modal-action">
              <button className="btn" onClick={() => setShowArchiveModal(false)} type="button">
                Cancelar
              </button>
              <button className="btn btn-warning" onClick={handleArchiveCourse} type="button">
                Archivar curso
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setShowArchiveModal(false)} type="button">
              close
            </button>
          </form>
        </dialog>
      )}

      {showDeleteModal && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-error">Eliminar curso</h3>
            <p className="py-4">
              Esta accion es irreversible. Estas absolutamente seguro?
              Se perdera todo el contenido, tareas, calificaciones y datos de participantes.
            </p>
            <p className="text-sm font-semibold">Escribe "ELIMINAR" para confirmar:</p>
            <input
              type="text"
              className="input input-bordered w-full mt-2"
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
            />
            <div className="modal-action">
              <button
                className="btn"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmationText("");
                }}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="btn btn-error"
                onClick={handleDeleteCourse}
                disabled={deleteConfirmationText !== "ELIMINAR"}
                type="button"
              >
                Eliminar permanentemente
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteConfirmationText("");
              }}
              type="button"
            >
              close
            </button>
          </form>
        </dialog>
      )}
    </div>
  );
}
