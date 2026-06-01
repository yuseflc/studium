/* Archivo: src\components\ui\CourseView.tsx
  Descripción: Componente principal de la vista de curso: muestra contenido, recursos, tareas y navegación del curso. */

"use client"; 
// Vista principal de curso: carga estructura, navegación y permisos del usuario
import { useEffect, useMemo, useState, useRef, useCallback, type Dispatch, type SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

// Importación de íconos de lucide-react
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

// Componentes internos del curso
import CourseSidebar from "@/components/navbars/CourseSidebar"; 
import CourseStructureManager, { type CourseSubjectItem } from "./CourseStructureManager"; 
import CourseParticipants from "@/components/participants/CourseParticipants"; 
import CourseInviteCodesManager from "./CourseInviteCodesManager";
import GradesView from "@/components/grades/GradesView";
import CourseFAB from "./CourseFAB";
import { ICourse } from "@/models/Course";
import { CourseStructureGeneric } from "@/lib/api/types";
import { getUserAvatarUrl } from "@/lib/utils/avatar";

// SERVER ACTIONS: funciones que se ejecutan en el servidor (Next.js App Router)
import { deleteTask } from "@/app/actions/taskActions";
import {
  deleteCourse as deleteCourseAction,
  inviteStudentByEmail,
  transferCourseOwnership,
  updateCourse,
} from "@/app/actions/courseActions";

// Modales reutilizables con efecto blur
import {
  ModalAdvise,
  CourseVisibilityModal,
  CourseTransferModal,
  CourseArchiveModal,
  CourseDeleteModal
} from "@/components/modals";
import CoursePatternPicker from "@/components/courses/CoursePatternPicker";

/**
 * PROPS DEL COMPONENTE PRINCIPAL
 */
interface CourseViewProps {
  courseData: ICourse | null;
  courseStructure: CourseStructureGeneric | null;
  isTeacher: boolean;
}

// Tipos posibles para el estado del curso
type CourseStatus = "draft" | "active" | "archived";

/**
 * COMPONENTE PRINCIPAL: CourseView
 * 
 * Vista principal de un curso. Muestra:
 * - Sidebar con materias
 * - Tabs: Contenido, Participantes, Calificaciones, Ajustes (solo profesor)
 * - Gestión completa del curso (editar info, invitar, archivar, eliminar, etc.)
 */
export default function CourseView({ courseData, courseStructure, isTeacher }: CourseViewProps) {
  // HOOKS de Next.js / NextAuth
  const router = useRouter();            // para redireccionar después de eliminar curso
  const { data: session } = useSession(); // sesión del usuario actual (para obtener su email)


  // Compilar lista de participantes reales desde la base de datos poblada
  const realParticipants = useMemo(() => {
    if (!courseData) return [];
    const list: any[] = [];
    const seenIds = new Set<string>();

    const addParticipant = (user: any, defaultRole: string) => {
      if (!user || !user._id) return;
      const idStr = String(user._id);
      if (seenIds.has(idStr)) return;
      seenIds.add(idStr);
      
      const finalRole = user.role === 'admin' ? 'admin' : defaultRole;
      
      list.push({
        id: idStr,
        nombre: user.firstName || "Usuario",
        apellidos: user.profile?.lastName || "",
        email: user.email || "",
        rol: finalRole,
        avatar: getUserAvatarUrl(user)
      });
    };

    // Owner (Propietario)
    if (courseData.ownerId) {
      addParticipant(courseData.ownerId, "profesor");
    }

    // Profesores
    if (Array.isArray(courseData.teachers)) {
      courseData.teachers.forEach((t: any) => addParticipant(t, "profesor"));
    }

    // Estudiantes
    if (Array.isArray(courseData.enrolledStudents)) {
      courseData.enrolledStudents.forEach((s: any) => addParticipant(s, "estudiante"));
    }

    return list;
  }, [courseData]);

  // ========== ESTADOS DE NAVEGACIÓN ==========
  // Pestaña activa: "content" | "participants" | "grades" | "settings"
  const [activeTab, setActiveTab] = useState<"content" | "participants" | "grades" | "settings">("content");

  // Lista de IDs de tareas eliminadas (para feedback visual mientras se elimina)
  const [deletedItems, setDeletedItems] = useState<string[]>([]);

  // ========== ESTADOS DE CONTENIDO ==========
  // Inicializo las materias desde courseStructure o courseData (priorizo structure)
  // Compatibilidad: si la estructura tiene `units` (nuevo modelo), la mapeo
  // a la forma legacy de `subjects` donde cada unit actúa como un "subject" contenedor.
  const initialSubjects = useMemo(() => {
    if (courseStructure?.subjects && Array.isArray(courseStructure.subjects)) return courseStructure.subjects;
    if (courseStructure?.units && Array.isArray(courseStructure.units)) {
      return courseStructure.units.map((u: any) => ({
        _id: u._id,
        title: u.title,
        description: u.content || '',
        order: u.order,
        units: [u],
        tasks: u.tasks || [],
      }));
    }
    return courseData?.subjects || [];
  }, [courseStructure?.subjects, courseStructure?.units, courseData?.subjects]);
  const [subjects, setSubjects] = useState<any[]>(initialSubjects as any[]);

  // ========== ESTADOS DEL FORMULARIO DE INFORMACIÓN GENERAL ==========
  const [title, setTitle] = useState(courseData?.title || "");
  const [description, setDescription] = useState(courseData?.description || "");
  const [status, setStatus] = useState<CourseStatus>(courseData?.status || "draft");
  // cast a `any` porque ICourse no expone coverImage directamente en su tipo base
  const [coverImage, setCoverImage] = useState((courseData as any)?.coverImage || "circles-yellow");
  const [isSaving, setIsSaving] = useState(false); // para deshabilitar botón mientras guarda
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // ========== CONFIGURACIÓN DE VISUALIZACIÓN (LOCAL, AÚN SIN PERSISTIR) ==========
  const [showParticipants, setShowParticipants] = useState(true);   // mostrar participantes en navbar horizontal
  const [allowComments, setAllowComments] = useState(true);         // permitir comentarios en contenido
  const [emailNotifications, setEmailNotifications] = useState(false); // notificaciones por email

  // ========== GESTIÓN DE INVITACIONES ==========
  const [inviteEmail, setInviteEmail] = useState("");               // email a invitar
  const [inviteCode, setInviteCode] = useState("COURSE-2024-ABC123"); // código de invitación (mock)
  const [isInviting, setIsInviting] = useState(false);              // estado de carga al invitar
  const [showCopied, setShowCopied] = useState(false);              // feedback visual de "copiado"

  // ========== MODALES DE CONFIRMACIÓN (acciones peligrosas) ==========
  const [showArchiveModal, setShowArchiveModal] = useState(false);   // modal de archivar
  const [showDeleteModal, setShowDeleteModal] = useState(false);     // modal de eliminar
  const [showVisibilityModal, setShowVisibilityModal] = useState(false); // modal de cambiar visibilidad
  const [showTransferModal, setShowTransferModal] = useState(false); // modal de transferir propiedad
  const [transferEmail, setTransferEmail] = useState("");            // email destino para transferencia
  const [deleteConfirmationText, setDeleteConfirmationText] = useState(""); // texto de confirmación para eliminar (debe ser "ELIMINAR")

  // ========== MODALES DE RESULTADO ==========
  // Cada uno tiene su propio modal para mostrar éxito/error sin bloquear la UI
  const [inviteModal, setInviteModal] = useState<{
    isOpen: boolean;
    success: boolean;
    message: string;
    email?: string
  }>({
    isOpen: false,
    success: false,
    message: "",
  });

  const [regenerateModal, setRegenerateModal] = useState<{
    isOpen: boolean;
    newCode: string
  }>({
    isOpen: false,
    newCode: "",
  });

  const [visibilityResultModal, setVisibilityResultModal] = useState<{
    isOpen: boolean;
    success: boolean;
    message: string
  }>({
    isOpen: false,
    success: false,
    message: "",
  });

  const [archiveResultModal, setArchiveResultModal] = useState<{
    isOpen: boolean;
    success: boolean;
    message: string
  }>({
    isOpen: false,
    success: false,
    message: "",
  });

  const [transferResultModal, setTransferResultModal] = useState<{
    isOpen: boolean;
    success: boolean;
    message: string;
    email?: string
  }>({
    isOpen: false,
    success: false,
    message: "",
  });

  // ID del curso como string (para pasarlo a las server actions)
  const courseId = String(courseData?._id || "");

  // ========== EFECTOS PARA SINCRONIZAR ESTADO CON PROPS ==========

  // Cuando cambian los subjects iniciales (por ejemplo, después de guardar cambios), actualizo el estado local
  useEffect(() => {
    setSubjects(initialSubjects as any[]);
  }, [initialSubjects]);

  // Cuando cambian título, descripción o estado desde courseData (por ejemplo, después de actualizar), sincronizo
  useEffect(() => {
    setTitle(courseData?.title || "");
    setDescription(courseData?.description || "");
    setStatus(courseData?.status || "draft");
  }, [courseData?.title, courseData?.description, courseData?.status]);

  /**
   * Agrega un nuevo subject (materia) al curso.
   * También optimista: lo pusheo localmente, el servidor ya lo guardó porque viene del FAB.
   */
  const handleAddSubject = (subject: any) => {
    if (!subject?._id) return; // necesito que tenga ID para identificar

    setSubjects((prev) => {
      // Evito duplicados (por si el callback se llama múltiples veces)
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

  /**
   * Agrega un recurso a una unidad específica.
   * Busca el subject que contiene la unidad y actualiza esa unidad.
   */
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

  /**
   * Agrega una unidad nueva al estado local como subject mapeado (compatibilidad).
   */
  const handleAddUnit = (unit: any) => {
    if (!unit?._id) return;

    setSubjects((prev) => {
      const already = prev.some((s: any) => String(s?._id || s?.id || '') === String(unit._id));
      if (already) return prev;

      // Ensure new units are appended at the end: compute next order as max(existing orders)+1
      const maxOrder = prev.reduce((max: number, s: any) => {
        const o = Number.isFinite(s?.order) ? Number(s.order) : -1;
        return Math.max(max, o);
      }, -1);
      const nextOrder = maxOrder >= 0 ? maxOrder + 1 : prev.length;

      return [
        ...prev,
        {
          _id: unit._id,
          courseId: unit.courseId,
          title: unit.title,
          description: '',
          order: nextOrder,
          units: [unit],
          tasks: [],
          unitIds: [unit._id],
          taskIds: [],
        },
      ];
    });

    // Scroll to the newly added unit when it appears in the DOM.
    const scrollToUnit = (attempt = 0) => {
      const el = document.getElementById(`unit-${unit._id}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        el.classList.add("ring", "ring-primary/20");
        setTimeout(() => el.classList.remove("ring", "ring-primary/20"), 2200);
        return;
      }

      if (attempt < 10) {
        // Retry a few times while the UI updates
        setTimeout(() => scrollToUnit(attempt + 1), 120);
      }
    };

    // Defer initial attempt to allow React to commit DOM updates
    setTimeout(() => scrollToUnit(0), 50);
  };

  // ========== HANDLER PARA ELIMINAR TAREA ==========

  /**
   * Elimina una tarea usando la server action deleteTask.
   * Actualización optimista: la marco como "deleting" visualmente con deletedItems,
   * luego la elimino del estado local si la acción del servidor fue exitosa.
   */
  const handleDeleteItem = async (id: string) => {
    setDeletedItems((prev) => [...prev, id]); // marco como "en proceso de eliminación"

    try {
      const result = await deleteTask(id);
      if (!result.success) {
        throw new Error(result.error || "Error deleting task");
      }

      // Si llegó acá, la eliminación fue exitosa: la remuevo del estado local
      setSubjects((prev) =>
        prev.map((subject: any) => ({
          ...subject,
          tasks: Array.isArray(subject.tasks)
            ? subject.tasks.filter((task: any) => String(task?._id || "") !== id)
            : subject.tasks,
        }))
      );
    } catch (error) {
      console.error("Error deleting task:", error);
      // Si hubo error, la saco de deletedItems para que reaparezca visualmente
      setDeletedItems((prev) => prev.filter((itemId) => itemId !== id));
    }
  };

  // ========== HANDLER PARA GUARDAR INFORMACIÓN GENERAL ==========

  /**
   * Guarda título, descripción y estado del curso usando updateCourse server action.
   * Muestra mensaje de éxito o error temporal.
   */
  const handleSaveGeneralInfo = async (e: React.FormEvent) => {
    e.preventDefault(); // evito que recargue la página

    if (!courseId) {
      setSaveMessage({ type: "error", text: "Curso inválido" });
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const result = await updateCourse(courseId, { title, description, status, coverImage });
      if (!result.success) {
        throw new Error(result.error || "Error al guardar");
      }

      setSaveMessage({ type: "success", text: "Cambios guardados correctamente" });
      setTimeout(() => setSaveMessage(null), 3000); // el mensaje desaparece a los 3 segundos
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al guardar los cambios";
      setSaveMessage({ type: "error", text: message });
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // ========== HANDLERS PARA INVITACIONES ==========

  /**
   * Invita a un estudiante por email usando la server action.
   * Muestra un modal de Studium con el resultado (éxito o error).
   */
  const handleInviteByEmail = async () => {
    if (!inviteEmail || !courseId) return;
    setIsInviting(true);

    try {
      const result = await inviteStudentByEmail(courseId, inviteEmail);
      if (!result.success) {
        throw new Error(result.error || "Error al enviar invitación");
      }

      // Modal de éxito
      setInviteModal({
        isOpen: true,
        success: true,
        message: `Invitación enviada correctamente a ${inviteEmail}`,
        email: inviteEmail,
      });
      setInviteEmail(""); // limpio el input
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al enviar la invitación";
      // Modal de error
      setInviteModal({
        isOpen: true,
        success: false,
        message,
      });
    } finally {
      setIsInviting(false);
    }
  };

  /**
   * Copia el código de invitación al portapapeles.
   * Muestra feedback visual "Copiado" por 2 segundos.
   */
  const handleCopyInviteCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (error) {
      console.error("Error al copiar:", error);
    }
  };

  /**
   * Genera un nuevo código de invitación y muestra modal de confirmación.
   * (Por ahora solo es visual, no persiste en BD)
   */
  const handleRegenerateCode = () => {
    const newCode = `COURSE-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setRegenerateModal({ isOpen: true, newCode });
  };

  /**
   * Confirma el nuevo código generado y actualiza el estado.
   */
  const confirmRegenerateCode = () => {
    setInviteCode(regenerateModal.newCode);
    setRegenerateModal({ isOpen: false, newCode: "" });
  };

  // ========== HANDLERS PARA ACCIONES DE LA ZONA DE PELIGRO ==========

  /**
   * Cambia la visibilidad del curso (borrador <-> publicado).
   * Usa updateCourse server action.
   * Si se publica un curso en borrador, auto-genera un código de invitación.
   */
  const handleChangeVisibility = async () => {
    if (!courseId) return;

    const newStatus: CourseStatus = status === "active" ? "draft" : "active";

    try {
      const result = await updateCourse(courseId, { status: newStatus });
      if (!result.success) {
        throw new Error(result.error || "Error al cambiar visibilidad");
      }

      setStatus(newStatus);                 // actualizo estado local
      setShowVisibilityModal(false);        // cierro modal de confirmación

      // Si se publica el curso desde borrador, generar automáticamente un código
      if (newStatus === "active" && status === "draft") {
        try {
          const { generateInviteCode } = await import("@/app/actions/courseActions");
          const inviteResult = await generateInviteCode(courseId);

          // Muestro modal de resultado con el mensaje especial sobre la auto-generación
          setVisibilityResultModal({
            isOpen: true,
            success: true,
            message: `Curso publicado correctamente.\nAl convertir el curso de borrador a activo se autogeneró un código de invitación${inviteResult.success ? ` (${inviteResult.code})` : ""}`,
          });
        } catch (inviteError) {
          // Si la generación automática falla, solo mostrar que se publicó
          setVisibilityResultModal({
            isOpen: true,
            success: true,
            message: `Curso ${newStatus === "active" ? "publicado" : "guardado como borrador"} correctamente`,
          });
        }
      } else {
        // Para otros cambios de estado, mostrar mensaje normal
        setVisibilityResultModal({
          isOpen: true,
          success: true,
          message: `Curso ${newStatus === "active" ? "publicado" : "guardado como borrador"} correctamente`,
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al cambiar la visibilidad";
      setVisibilityResultModal({
        isOpen: true,
        success: false,
        message,
      });
    }
  };

  /**
   * Archiva el curso (cambia status a "archived").
   */
  const handleArchiveCourse = async () => {
    if (!courseId) return;

    try {
      const result = await updateCourse(courseId, { status: "archived" });
      if (!result.success) {
        throw new Error(result.error || "Error al archivar el curso");
      }

      setStatus("archived");
      setShowArchiveModal(false);

      setArchiveResultModal({
        isOpen: true,
        success: true,
        message: "Curso archivado correctamente",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al archivar el curso";
      setArchiveResultModal({
        isOpen: true,
        success: false,
        message,
      });
    }
  };

  /**
   * Transfiere la propiedad del curso a otro usuario por email.
   * Usa transferCourseOwnership server action.
   */
  const handleTransferOwnership = async () => {
    if (!transferEmail || !courseId) return;

    try {
      const result = await transferCourseOwnership(courseId, transferEmail);
      if (!result.success) {
        throw new Error(result.error || "Error al transferir");
      }

      setShowTransferModal(false);

      setTransferResultModal({
        isOpen: true,
        success: true,
        message: `Curso transferido correctamente a ${transferEmail}`,
        email: transferEmail,
      });
      setTransferEmail(""); // limpio el campo
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al transferir el curso";
      setTransferResultModal({
        isOpen: true,
        success: false,
        message,
      });
    }
  };

  /**
   * Elimina el curso permanentemente.
   * Usa deleteCourseAction y redirige a "/mycourses".
   * Esta acción requiere confirmación con texto "ELIMINAR" y mantener presionado el botón.
   */
  const handleDeleteCourse = async () => {
    if (!courseId) return;

    try {
      const result = await deleteCourseAction(courseId);
      if (!result.success) {
        throw new Error(result.error || "Error al eliminar");
      }

      router.push("/mycourses"); // redirijo a la lista de cursos del usuario
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al eliminar el curso";
      console.error(message);
      // Acá podría mostrar un modal de error, pero por ahora solo logueo
    }
  };

  // ========== RENDERIZADO PRINCIPAL ==========

  return (
    <div className="flex flex-col lg:flex-row">
      {/* SIDEBAR: muestra la lista de materias para navegación rápida */}
      <div className="hidden lg:block">
        <CourseSidebar isTeacher={isTeacher} subjects={subjects} />
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="w-full mx-auto">

          {/* ENCABEZADO: título del curso + badges de estado */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 break-words">
              {title || "Cargando curso..."}

              {/* Badge BORRADOR: solo visible cuando status === "draft" */}
              {status === "draft" && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 ml-2 align-middle shadow-sm">
                  BORRADOR
                </span>
              )}

              {/* Badge PUBLICADO */}
              {status === "active" && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-success/10 text-success border border-success/20 ml-2 align-middle shadow-sm">
                  PUBLICADO
                </span>
              )}

              {/* Badge ARCHIVADO */}
              {status === "archived" && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-base-200 text-base-content/70 border border-base-300 ml-2 align-middle shadow-sm">
                  ARCHIVADO
                </span>
              )}
            </h1>
          </div>

          {/* TABS DE NAVEGACIÓN */}
          <div className="flex border-b border-base-300 mb-6 overflow-x-auto relative z-10">
            {/* Tab: Contenido del curso */}
            <button
              type="button"
              onClick={() => setActiveTab("content")}
              className={`pb-3 px-3 sm:px-4 flex items-center gap-1.5 sm:gap-2 border-b-2 transition-colors shrink-0 whitespace-nowrap ${activeTab === "content"
                  ? "border-primary text-primary font-semibold"
                  : "border-transparent text-base-content/60 hover:text-base-content"
                }`}
            >
              <BookOpen size={18} />
              <span className="text-sm sm:text-base">Curso</span>
            </button>

            {/* Tab: Participantes */}
            <button
              type="button"
              onClick={() => setActiveTab("participants")}
              className={`pb-3 px-3 sm:px-4 flex items-center gap-1.5 sm:gap-2 border-b-2 transition-colors shrink-0 whitespace-nowrap ${activeTab === "participants"
                  ? "border-primary text-primary font-semibold"
                  : "border-transparent text-base-content/60 hover:text-base-content"
                }`}
            >
              <Users size={18} />
              <span className="text-sm sm:text-base">Participantes</span>
            </button>

            {/* Tab: Calificaciones */}
            <button
              type="button"
              onClick={() => setActiveTab("grades")}
              className={`pb-3 px-3 sm:px-4 flex items-center gap-1.5 sm:gap-2 border-b-2 transition-colors shrink-0 whitespace-nowrap ${activeTab === "grades"
                  ? "border-primary text-primary font-semibold"
                  : "border-transparent text-base-content/60 hover:text-base-content"
                }`}
            >
              <GraduationCap size={18} />
              <span className="text-sm sm:text-base">Calificaciones</span>
            </button>

            {/* Tab: Ajustes (solo visible para profesores) */}
            {isTeacher && (
              <button
                type="button"
                onClick={() => setActiveTab("settings")}
                className={`pb-3 px-3 sm:px-4 flex items-center gap-1.5 sm:gap-2 border-b-2 transition-colors shrink-0 whitespace-nowrap ${activeTab === "settings"
                    ? "border-primary text-primary font-semibold"
                    : "border-transparent text-base-content/60 hover:text-base-content"
                  }`}
              >
                <Settings size={18} />
                <span className="text-sm sm:text-base">Ajustes</span>
              </button>
            )}
          </div>

          {/* CONTENIDO DE CADA TAB */}
          <div className="space-y-6">

            {/* TAB CONTENIDO: administrador de estructura del curso */}
            {activeTab === "content" && (
              <CourseStructureManager
                courseId={courseId}
                subjects={subjects as CourseSubjectItem[]}
                setSubjects={setSubjects as Dispatch<SetStateAction<CourseSubjectItem[]>>}
                canEdit={isTeacher}
              />
            )}

            {/* TAB PARTICIPANTES: lista de alumnos y profesores (usando datos reales) */}
            {activeTab === "participants" && <CourseParticipants participants={realParticipants} courseId={courseId} />}

            {/* TAB CALIFICACIONES: vista de notas por estudiante/materia */}
            {activeTab === "grades" && (
              <GradesView
                participants={realParticipants}
                subjects={subjects}
                isTeacher={isTeacher}
                currentUserEmail={session?.user?.email || ""}
                courseId={courseId}
              />
            )}

            {/* TAB AJUSTES: panel completo para profesores */}
            {activeTab === "settings" && isTeacher && (
              <div className="space-y-6 w-full">
                <div className="max-w-3xl mx-auto px-4 sm:px-0">

                  {/* SECCIÓN 1: INFORMACIÓN GENERAL */}
                  <div className="card bg-base-100 border border-base-300 mb-6">
                    <div className="card-body p-4 sm:p-6">
                      <h2 className="card-title text-lg sm:text-xl mb-4 sm:mb-6">Información General</h2>
                      <form onSubmit={handleSaveGeneralInfo} className="space-y-4 sm:space-y-6">

                        {/* Campo: Título del curso */}
                        <div className="form-control flex flex-col items-start">
                          <label htmlFor="course-title" className="label p-0">
                            <span className="label-text font-medium mb-2">Título del Curso</span>
                          </label>
                          <input
                            id="course-title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="input input-bordered mt-2 w-full focus:border-warning focus:outline-none transition-all"
                            placeholder="Ej: Desarrollo Web Avanzado"
                            required
                          />
                        </div>

                        {/* Campo: Descripción */}
                        <div className="form-control flex flex-col items-start">
                          <label htmlFor="course-description" className="label p-0">
                            <span className="label-text font-medium mb-2">Descripción</span>
                          </label>
                          <textarea
                            id="course-description"
                            className="textarea textarea-bordered h-36 mt-2 w-full resize-none focus:border-warning focus:outline-none transition-all"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe el contenido y objetivos del curso..."
                          />
                        </div>

                        {/* Campo: Estado (radio buttons) */}
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

                        {/* Imagen de portada */}
                        <CoursePatternPicker
                          selectedId={coverImage}
                          onChange={setCoverImage}
                        />

                        {/* Mensaje temporal de guardado (éxito o error) */}
                        {saveMessage && (
                          <div className={`alert ${saveMessage.type === "success" ? "alert-success" : "alert-error"} text-sm backdrop-blur-sm`}>
                            {saveMessage.type === "success" ? <Check size={16} /> : <X size={16} />}
                            <span>{saveMessage.text}</span>
                          </div>
                        )}

                        {/* Botón de guardar */}
                        <div className="card-actions justify-end">
                          <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={isSaving}>
                            {isSaving ? "Guardando..." : "Guardar Cambios"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>

                  {/* SECCIÓN 2: CONFIGURACIÓN DE VISUALIZACIÓN (preferencias locales) */}
                  <div className="card bg-base-100 border border-base-300 mb-6">
                    <div className="card-body p-4 sm:p-6">
                      <h2 className="card-title text-lg sm:text-xl mb-4 sm:mb-6">Configuración de Visualización</h2>
                      <div className="space-y-4">

                        {/* Toggle: Mostrar participantes */}
<div className="form-control w-full">
  <label className="cursor-pointer label flex-row items-center justify-between gap-3 w-full">
    <div className="flex-1">
      <span className="label-text font-medium block">Mostrar participantes en la barra horizontal</span>
      <p className="text-sm text-base-content/60 mt-0.5 break-words pr-2">
        Muestra la lista de participantes en la barra de navegación superior
      </p>
    </div>
    <input
      type="checkbox"
      className="toggle toggle-primary flex-shrink-0"
      checked={showParticipants}
      onChange={(e) => setShowParticipants(e.target.checked)}
    />
  </label>
</div>

                        {/* Toggle: Permitir comentarios */}
<div className="form-control w-full">
  <label className="cursor-pointer label flex-row items-center justify-between gap-3 w-full">
    <div className="flex-1">
      <span className="label-text font-medium block">Permitir comentarios en el contenido</span>
      <p className="text-sm text-base-content/60 mt-0.5 break-words pr-2">
        Los estudiantes pueden comentar en las lecciones y tareas
      </p>
    </div>
    <input
      type="checkbox"
      className="toggle toggle-primary flex-shrink-0"
      checked={allowComments}
      onChange={(e) => setAllowComments(e.target.checked)}
    />
  </label>
</div>

                       {/* Toggle: Notificaciones por email */}
<div className="form-control w-full">
  <label className="cursor-pointer label flex-row items-center justify-between gap-3 w-full">
    <div className="flex-1">
      <span className="label-text font-medium block">Notificar nuevas tareas por email</span>
      <p className="text-sm text-base-content/60 mt-0.5 break-words pr-2">
        Envía notificaciones por correo cuando se crean nuevas tareas
      </p>
    </div>
    <input
      type="checkbox"
      className="toggle toggle-primary flex-shrink-0"
      checked={emailNotifications}
      onChange={(e) => setEmailNotifications(e.target.checked)}
    />
  </label>
</div>
                      </div>
                    </div>
                  </div>

                  {/* SECCIÓN 3: GESTIÓN DE PARTICIPANTES (invitaciones) */}
                  <div className="card bg-base-100 border border-base-300 mb-6">
                    <div className="card-body p-4 sm:p-6">
                      <h2 className="card-title text-lg sm:text-xl mb-4 sm:mb-6">Gestión de Participantes</h2>
                      <div className="space-y-6">

                        {/* Invitar por email */}
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

                        {/* COMPONENTE: Gestor de códigos de invitación */}
                        <CourseInviteCodesManager courseId={courseId} courseStatus={status} />
                      </div>
                    </div>
                  </div>

                  {/* SECCIÓN 4: ZONA DE PELIGRO (acciones críticas) */}
                 <div className="border-2 border-red-300 rounded-xl overflow-hidden shadow-sm">
  {/* Eliminados los 'dark:' del fondo para obligar a que sea rojo claro siempre */}
  <div className="bg-red-200 px-6 py-4 border-b-2 border-red-300">
    <div className="flex items-center gap-2">
      <AlertTriangle className="w-5 h-5 text-red-700" />
      <h2 className="font-bold text-black text-lg">Zona de Peligro</h2>
    </div>
    <p className="text-sm text-black mt-1">
      Las siguientes acciones son irreversibles o pueden afectar significativamente el curso
    </p>
  </div>


                    <div className="divide-y divide-red-100 dark:divide-red-800/20">

                      {/* Acción 1: Cambiar visibilidad */}
                      <div className="px-6 py-5 hover:bg-red-50/30 dark:hover:bg-red-950/5 transition-colors">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-3">
                              <Eye className="w-5 h-5 text-base-content/40 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-semibold text-base-content">Cambiar visibilidad del curso</p>
                                <p className="text-sm text-base-content/60 mt-1">
                                  Este curso está actualmente <span className="font-medium text-base-content/80">{status === "active" ? "público" : "en borrador"}</span>.
                                  {status === "active"
                                    ? " Los estudiantes pueden ver y acceder al contenido."
                                    : " Solo los profesores pueden ver el curso."}
                                </p>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => setShowVisibilityModal(true)}
                            className="btn btn-md btn-outline w-full lg:w-48 gap-2"
                            type="button"
                          >
                            <Eye size={16} />
                            Cambiar visibilidad
                          </button>
                        </div>
                      </div>

                      {/* Acción 2: Transferir propiedad */}
                      <div className="px-6 py-5 hover:bg-red-50/30 dark:hover:bg-red-950/5 transition-colors">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-3">
                              <UserPlus className="w-5 h-5 text-base-content/40 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-semibold text-base-content">Transferir propiedad</p>
                                <p className="text-sm text-base-content/60 mt-1">
                                  Transferir este curso a otro usuario u organización donde tengas permisos para crear cursos.
                                  Esta acción notificará al nuevo propietario.
                                </p>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => setShowTransferModal(true)}
                            className="btn btn-md btn-outline w-full lg:w-48 gap-2"
                            type="button"
                          >
                            <UserPlus size={16} />
                            Transferir
                          </button>
                        </div>
                      </div>

                      {/* Acción 3: Archivar curso */}
                      <div className="px-6 py-5 hover:bg-red-50/30 dark:hover:bg-red-950/5 transition-colors">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-3">
                              <Archive className="w-5 h-5 text-amber-500 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-semibold text-amber-700 dark:text-amber-400">Archivar este curso</p>
                                <p className="text-sm text-base-content/60 mt-1">
                                  Marcar este curso como archivado y de solo lectura. Los estudiantes ya no podrán acceder,
                                  pero podrás restaurarlo más tarde.
                                </p>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => setShowArchiveModal(true)}
                            className="btn btn-md btn-outline btn-warning w-full lg:w-48 gap-2"
                            disabled={status === "archived"}
                            type="button"
                          >
                            <Archive size={16} />
                            Archivar curso
                          </button>
                        </div>
                      </div>

                      {/* Acción 4: Eliminar curso (la más peligrosa) */}
                      <div className="px-6 py-5 hover:bg-red-50/50 dark:hover:bg-red-950/10 transition-colors">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-3">
                              <Trash2 className="w-5 h-5 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-semibold text-red-600 dark:text-red-400">Eliminar este curso</p>
                                <p className="text-sm text-base-content/60 mt-1">
                                  <span className="font-medium text-red-600 dark:text-red-400">Advertencia:</span> Una vez que eliminas un curso,
                                  no hay vuelta atrás. Se perderá todo el contenido, tareas, calificaciones y datos de participantes.
                                </p>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => setShowDeleteModal(true)}
                            className="btn btn-md btn-error w-full lg:w-48 gap-2"
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

      {/* BOTÓN FLOTANTE (FAB): solo visible en pestaña "content" y para profesores */}
      {isTeacher && activeTab === "content" && (
        <CourseFAB
          onAddResource={handleAddResource}
          onAddUnit={handleAddUnit}
          courseId={courseId}
          defaultUnitId={
            courseStructure?.units && courseStructure.units.length > 0
              ? String(courseStructure.units[0]._id)
              : subjects[0]
                ? String((subjects[0].units && subjects[0].units[0]?._id) || subjects[0]._id)
                : undefined
          }
          units={courseStructure?.units || subjects.flatMap((s: any) => s.units || [])}
        />
      )}

      {/* ========== MODALES DE CONFIRMACIÓN (utilizando componentes centralizados) ========== */}

      {/* Modal: Confirmar cambio de visibilidad */}
      {showVisibilityModal && (
        <CourseVisibilityModal
          status={status}
          onClose={() => setShowVisibilityModal(false)}
          onConfirm={handleChangeVisibility}
        />
      )}

      {/* Modal: Transferir propiedad */}
      {showTransferModal && (
        <CourseTransferModal
          transferEmail={transferEmail}
          setTransferEmail={setTransferEmail}
          onClose={() => setShowTransferModal(false)}
          onConfirm={handleTransferOwnership}
        />
      )}

      {/* Modal: Confirmar archivado */}
      {showArchiveModal && (
        <CourseArchiveModal
          onClose={() => setShowArchiveModal(false)}
          onConfirm={handleArchiveCourse}
        />
      )}

      {/* Modal: Eliminar curso */}
      {showDeleteModal && (
        <CourseDeleteModal
          deleteConfirmationText={deleteConfirmationText}
          setDeleteConfirmationText={setDeleteConfirmationText}
          onClose={() => {
            setShowDeleteModal(false);
            setDeleteConfirmationText("");
          }}
          onConfirm={handleDeleteCourse}
        />
      )}

      {/* ========== MODALES DE RESULTADO (reemplazan alerts nativos) ========== */}

      {/* Modal: Resultado de invitación (éxito o error) */}
      {inviteModal.isOpen && (
        <ModalAdvise
          id="invite-modal"
          title={inviteModal.success ? "Invitación Enviada" : "Error al Invitar"}
          description={
            inviteModal.success ? (
              <p>Se ha enviado la invitación a <strong>{inviteModal.email}</strong> correctamente.</p>
            ) : (
              <p className="text-error">{inviteModal.message}</p>
            )
          }
          confirmLabel="Aceptar"
          onConfirm={() => setInviteModal({ isOpen: false, success: false, message: "" })}
        />
      )}

      {/* Modal: Confirmación para regenerar código */}
      {regenerateModal.isOpen && (
        <ModalAdvise
          id="regenerate-modal"
          title="Regenerar Código"
          description={
            <div>
              <p>¿Estás seguro de que quieres regenerar el código de invitación?</p>
              <p className="text-sm text-base-content/60 mt-2">
                El código actual <strong>{inviteCode}</strong> será reemplazado por:
              </p>
              <p className="font-mono text-sm bg-base-200 p-2 rounded mt-2">{regenerateModal.newCode}</p>
            </div>
          }
          confirmLabel="Regenerar"
          cancelLabel="Cancelar"
          onConfirm={confirmRegenerateCode}
        />
      )}

      {/* Modal: Resultado de cambio de visibilidad */}
      {visibilityResultModal.isOpen && (
        <ModalAdvise
          id="visibility-result-modal"
          title={visibilityResultModal.success ? "Visibilidad Actualizada" : "Error"}
          description={
            visibilityResultModal.success ? (
              <p>{visibilityResultModal.message}</p>
            ) : (
              <p className="text-error">{visibilityResultModal.message}</p>
            )
          }
          confirmLabel="Aceptar"
          onConfirm={() => setVisibilityResultModal({ isOpen: false, success: false, message: "" })}
        />
      )}

      {/* Modal: Resultado de archivado */}
      {archiveResultModal.isOpen && (
        <ModalAdvise
          id="archive-result-modal"
          title={archiveResultModal.success ? "Curso Archivado" : "Error al Archivar"}
          description={
            archiveResultModal.success ? (
              <p>{archiveResultModal.message}</p>
            ) : (
              <p className="text-error">{archiveResultModal.message}</p>
            )
          }
          confirmLabel="Aceptar"
          onConfirm={() => setArchiveResultModal({ isOpen: false, success: false, message: "" })}
        />
      )}

      {/* Modal: Resultado de transferencia */}
      {transferResultModal.isOpen && (
        <ModalAdvise
          id="transfer-result-modal"
          title={transferResultModal.success ? "Propiedad Transferida" : "Error al Transferir"}
          description={
            transferResultModal.success ? (
              <p>El curso ha sido transferido a <strong>{transferResultModal.email}</strong> correctamente.</p>
            ) : (
              <p className="text-error">{transferResultModal.message}</p>
            )
          }
          confirmLabel="Aceptar"
          onConfirm={() => setTransferResultModal({ isOpen: false, success: false, message: "" })}
        />
      )}
    </div>
  );
}