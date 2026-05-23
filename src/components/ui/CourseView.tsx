"use client";

import { useState } from "react";
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
    X
} from "lucide-react";
import CourseSidebar from "./Navbars/CourseSidebar";
import CourseContent from "./CourseContent";
import CourseParticipants from "./CourseParticipants";
import GradesView from "./grades/GradesView";
import CourseFAB from "./CourseFAB";
import { PARTICIPANTES } from "@/seed/data";
import { ICourse } from "@/models/Course";
import { CourseStructureGeneric } from "@/lib/api/types";

interface CourseViewProps {
    courseData: ICourse | null;
    courseStructure: CourseStructureGeneric | null;
    isTeacher: boolean;
}

export default function CourseView({ courseData, isTeacher }: CourseViewProps) {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState<"content" | "participants" | "grades" | "settings">("content");
    const [deletedItems, setDeletedItems] = useState<string[]>([]);

    // Estados para Información General
    const [title, setTitle] = useState(courseData?.title || "");
    const [description, setDescription] = useState(courseData?.description || "");
    const [status, setStatus] = useState(courseData?.status || "draft");
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Estados para Configuración de Visualización
    const [showParticipants, setShowParticipants] = useState(true);
    const [allowComments, setAllowComments] = useState(true);
    const [emailNotifications, setEmailNotifications] = useState(false);

    // Estados para Gestión de Participantes
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteCode, setInviteCode] = useState("COURSE-2024-ABC123");
    const [isInviting, setIsInviting] = useState(false);
    const [showCopied, setShowCopied] = useState(false);

    // Estados para modales de confirmación
    const [showArchiveModal, setShowArchiveModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showVisibilityModal, setShowVisibilityModal] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [transferEmail, setTransferEmail] = useState("");

    const subjects = courseData?.subjects || [];

    const handleAddTask = (task: any) => {
        window.location.reload();
    };

    const handleDeleteItem = async (id: string) => {
        setDeletedItems((prev) => [...prev, id]);
        try {
            await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };

    // Guardar cambios de Información General
    const handleSaveGeneralInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setSaveMessage(null);

        try {
            const response = await fetch(`/api/courses/${courseData?._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description, status })
            });

            if (response.ok) {
                setSaveMessage({ type: 'success', text: 'Cambios guardados correctamente' });
                setTimeout(() => setSaveMessage(null), 3000);
            } else {
                throw new Error('Error al guardar');
            }
        } catch (error) {
            setSaveMessage({ type: 'error', text: 'Error al guardar los cambios' });
            setTimeout(() => setSaveMessage(null), 3000);
        } finally {
            setIsSaving(false);
        }
    };

    // Invitar por email
    const handleInviteByEmail = async () => {
        if (!inviteEmail) return;
        setIsInviting(true);

        try {
            const response = await fetch(`/api/courses/${courseData?._id}/invite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: inviteEmail })
            });

            if (response.ok) {
                alert(`Invitación enviada a ${inviteEmail}`);
                setInviteEmail("");
            } else {
                throw new Error('Error al enviar invitación');
            }
        } catch (error) {
            alert('Error al enviar la invitación');
        } finally {
            setIsInviting(false);
        }
    };

    // Copiar código de invitación
    const handleCopyInviteCode = async () => {
        try {
            await navigator.clipboard.writeText(inviteCode);
            setShowCopied(true);
            setTimeout(() => setShowCopied(false), 2000);
        } catch (error) {
            console.error('Error al copiar:', error);
        }
    };

    // Regenerar código de invitación
    const handleRegenerateCode = () => {
        const newCode = `COURSE-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        setInviteCode(newCode);
        alert('Código regenerado correctamente');
    };

    // Cambiar visibilidad
    const handleChangeVisibility = async () => {
        const newStatus = status === "active" ? "draft" : "active";
        try {
            const response = await fetch(`/api/courses/${courseData?._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                setStatus(newStatus);
                setShowVisibilityModal(false);
                alert(`Curso ${newStatus === "active" ? "publicado" : "guardado como borrador"} correctamente`);
            }
        } catch (error) {
            alert('Error al cambiar la visibilidad');
        }
    };

    // Archivar curso
    const handleArchiveCourse = async () => {
        try {
            const response = await fetch(`/api/courses/${courseData?._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: "archived" })
            });

            if (response.ok) {
                setStatus("archived");
                setShowArchiveModal(false);
                alert('Curso archivado correctamente');
            }
        } catch (error) {
            alert('Error al archivar el curso');
        }
    };

    // Transferir propiedad
    const handleTransferOwnership = async () => {
        if (!transferEmail) return;

        try {
            const response = await fetch(`/api/courses/${courseData?._id}/transfer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newOwnerEmail: transferEmail })
            });

            if (response.ok) {
                setShowTransferModal(false);
                setTransferEmail("");
                alert(`Curso transferido a ${transferEmail}`);
            } else {
                throw new Error('Error al transferir');
            }
        } catch (error) {
            alert('Error al transferir el curso');
        }
    };

    // Eliminar curso
    const handleDeleteCourse = async () => {
        try {
            const response = await fetch(`/api/courses/${courseData?._id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                window.location.href = '/dashboard/courses';
            } else {
                throw new Error('Error al eliminar');
            }
        } catch (error) {
            alert('Error al eliminar el curso');
        }
    };

    return (
        <div className="flex flex-col lg:flex-row">
            <CourseSidebar isTeacher={isTeacher} subjects={subjects} />

            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                <div className="w-full mx-auto">
                    {/* Header */}
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
                            className={`pb-3 px-3 sm:px-4 flex items-center gap-1.5 sm:gap-2 border-b-2 transition-colors shrink-0 whitespace-nowrap ${activeTab === "content"
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
                            className={`pb-3 px-3 sm:px-4 flex items-center gap-1.5 sm:gap-2 border-b-2 transition-colors shrink-0 whitespace-nowrap ${activeTab === "participants"
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
                            className={`pb-3 px-3 sm:px-4 flex items-center gap-1.5 sm:gap-2 border-b-2 transition-colors shrink-0 whitespace-nowrap ${activeTab === "grades"
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

                    {/* Vistas Renderizadas */}
                    <div className="space-y-6">
                        {activeTab === "content" && (
                            <CourseContent
                                subjects={subjects}
                                deletedItems={deletedItems}
                                onDeleteItem={handleDeleteItem}
                                isTeacher={isTeacher}
                            />
                        )}

                        {activeTab === "participants" && (
                            <CourseParticipants participants={PARTICIPANTES} />
                        )}

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
                                    {/* Información General */}
                                    <div className="card bg-base-100 border border-base-300 mb-6">
                                        <div className="card-body p-4 sm:p-6">
                                            <h2 className="card-title text-lg sm:text-xl mb-4 sm:mb-6">Información General</h2>
                                            <form onSubmit={handleSaveGeneralInfo} className="space-y-4 sm:space-y-6">
                                                <div className="form-control flex flex-col items-start">
                                                    <label htmlFor="course-title" className="label p-0">
                                                        <span className="label-text font-medium mb-2">Título del Curso</span>
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
                                                        <span className="label-text font-medium mb-2">Descripción</span>
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
                                                                onChange={(e) => setStatus(e.target.value as "draft" | "active" | "archived")}
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
                                                                onChange={(e) => setStatus(e.target.value as "draft" | "active" | "archived")}
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
                                                                onChange={(e) => setStatus(e.target.value as "draft" | "active" | "archived")}
                                                                className="radio radio-primary"
                                                            />
                                                            <span className="label-text">Archivado</span>
                                                        </label>
                                                    </div>
                                                </div>

                                                {saveMessage && (
                                                    <div className={`alert ${saveMessage.type === 'success' ? 'alert-success' : 'alert-error'} text-sm`}>
                                                        {saveMessage.type === 'success' ? <Check size={16} /> : <X size={16} />}
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

                                    {/* Configuración de Visualización */}
                                    <div className="card bg-base-100 border border-base-300 mb-6">
                                        <div className="card-body p-4 sm:p-6">
                                            <h2 className="card-title text-lg sm:text-xl mb-4 sm:mb-6">Configuración de Visualización</h2>
                                            <div className="space-y-4">
                                                <div className="form-control">
                                                    <label className="cursor-pointer label flex-row items-center justify-between gap-3">
                                                        <div className="flex-1">
                                                            <span className="label-text font-medium block">Mostrar participantes en la barra horizontal</span>
                                                            <p className="text-sm text-base-content/60 mt-0.5 break-words pr-2">Muestra la lista de participantes en la barra de navegación superior</p>
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
                                                            <p className="text-sm text-base-content/60 mt-0.5 break-words pr-2">Los estudiantes pueden comentar en las lecciones y tareas</p>
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
                                                            <p className="text-sm text-base-content/60 mt-0.5 break-words pr-2">Envía notificaciones por correo cuando se crean nuevas tareas</p>
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

                                    {/* Gestión de Participantes */}
                                    <div className="card bg-base-100 border border-base-300 mb-6">
                                        <div className="card-body p-4 sm:p-6">
                                            <h2 className="card-title text-lg sm:text-xl mb-4 sm:mb-6">Gestión de Participantes</h2>
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
                                                        >
                                                            <Send size={16} />
                                                            {isInviting ? "Enviando..." : "Invitar"}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="divider">O</div>

                                                <div className="form-control">
                                                    <label htmlFor="invite-code" className="label">
                                                        <span className="label-text font-medium mb-2">Código de invitación</span>
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
                                                            <button onClick={handleCopyInviteCode} className="btn btn-outline flex-1 sm:flex-none gap-2">
                                                                {showCopied ? <Check size={16} /> : <Copy size={16} />}
                                                                {showCopied ? "Copiado" : "Copiar"}
                                                            </button>
                                                            <button onClick={handleRegenerateCode} className="btn btn-outline btn-secondary flex-1 sm:flex-none gap-2">
                                                                <RefreshCw size={16} />
                                                                Regenerar
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="mt-3">
                                                        <p className="text-xs sm:text-sm text-base-content/60 break-words">
                                                            Comparte este código con tus estudiantes para que se unan al curso
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Danger Zone */}
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
                                            {/* Cambiar visibilidad del curso */}
                                            <div className="px-6 py-5 hover:bg-red-50/30 dark:hover:bg-red-950/5 transition-colors">
                                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-start gap-3">
                                                            <Eye className="w-5 h-5 text-base-content/40 mt-0.5 flex-shrink-0" />
                                                            <div>
                                                                <p className="font-semibold text-base-content">
                                                                    Cambiar visibilidad del curso
                                                                </p>
                                                                <p className="text-sm text-base-content/60 mt-1">
                                                                    Este curso está actualmente <span className="font-medium text-base-content/80">
                                                                        {status === "active" ? "público" : "en borrador"}
                                                                    </span>.
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
                                                    >
                                                        <Eye size={16} />
                                                        Cambiar visibilidad
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Transferir propiedad */}
                                            <div className="px-6 py-5 hover:bg-red-50/30 dark:hover:bg-red-950/5 transition-colors">
                                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-start gap-3">
                                                            <UserPlus className="w-5 h-5 text-base-content/40 mt-0.5 flex-shrink-0" />
                                                            <div>
                                                                <p className="font-semibold text-base-content">
                                                                    Transferir propiedad
                                                                </p>
                                                                <p className="text-sm text-base-content/60 mt-1">
                                                                    Transferir este curso a otro usuario u organización donde tengas permisos para crear cursos.
                                                                    Esta acción notificará al nuevo propietario.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => setShowTransferModal(true)}
                                                        className="btn btn-md btn-outline w-full lg:w-44 gap-2"
                                                    >
                                                        <UserPlus size={16} />
                                                        Transferir
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Archivar este curso */}
                                            <div className="px-6 py-5 hover:bg-red-50/30 dark:hover:bg-red-950/5 transition-colors">
                                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-start gap-3">
                                                            <Archive className="w-5 h-5 text-amber-500 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                                                            <div>
                                                                <p className="font-semibold text-amber-700 dark:text-amber-400">
                                                                    Archivar este curso
                                                                </p>
                                                                <p className="text-sm text-base-content/60 mt-1">
                                                                    Marcar este curso como archivado y de solo lectura. Los estudiantes ya no podrán acceder,
                                                                    pero podrás restaurarlo más tarde.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => setShowArchiveModal(true)}
                                                        className="btn btn-md btn-outline btn-warning w-full lg:w-44 gap-2"
                                                        disabled={status === "archived"}
                                                    >
                                                        <Archive size={16} />
                                                        Archivar curso
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Eliminar este curso */}
                                            <div className="px-6 py-5 hover:bg-red-50/50 dark:hover:bg-red-950/10 transition-colors">
                                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-start gap-3">
                                                            <Trash2 className="w-5 h-5 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
                                                            <div>
                                                                <p className="font-semibold text-red-600 dark:text-red-400">
                                                                    Eliminar este curso
                                                                </p>
                                                                <p className="text-sm text-base-content/60 mt-1">
                                                                    <span className="font-medium text-red-600 dark:text-red-400">¡Advertencia!</span> Una vez que eliminas un curso,
                                                                    no hay vuelta atrás. Se perderá todo el contenido, tareas, calificaciones y datos de participantes.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => setShowDeleteModal(true)}
                                                        className="btn btn-md btn-error w-full lg:w-44 gap-2"
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

            {/* FAB Button */}
            {isTeacher && (
                <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
                    <CourseFAB
                        onAddTask={handleAddTask}
                        courseId={String(courseData?._id)}
                        defaultSubjectId={subjects[0] ? String(subjects[0]._id) : undefined}
                        subjects={subjects}
                    />
                </div>
            )}

            {/* Modal de confirmación - Cambiar visibilidad */}
            {showVisibilityModal && (
                <dialog className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">Cambiar visibilidad del curso</h3>
                        <p className="py-4">
                            ¿Estás seguro de que quieres {status === "active" ? "cambiar el curso a borrador" : "publicar el curso"}?
                            {status === "active"
                                ? " Los estudiantes ya no podrán acceder al curso."
                                : " Los estudiantes podrán ver y acceder al contenido."}
                        </p>
                        <div className="modal-action">
                            <button className="btn" onClick={() => setShowVisibilityModal(false)}>Cancelar</button>
                            <button className="btn btn-primary" onClick={handleChangeVisibility}>
                                {status === "active" ? "Cambiar a Borrador" : "Publicar curso"}
                            </button>
                        </div>
                    </div>
                    <form method="dialog" className="modal-backdrop">
                        <button onClick={() => setShowVisibilityModal(false)}>close</button>
                    </form>
                </dialog>
            )}

            {/* Modal de confirmación - Transferir propiedad */}
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
                            Esta acción es irreversible. El nuevo propietario recibirá una notificación.
                        </p>
                        <div className="modal-action">
                            <button className="btn" onClick={() => setShowTransferModal(false)}>Cancelar</button>
                            <button className="btn btn-primary" onClick={handleTransferOwnership} disabled={!transferEmail}>
                                Transferir
                            </button>
                        </div>
                    </div>
                    <form method="dialog" className="modal-backdrop">
                        <button onClick={() => setShowTransferModal(false)}>close</button>
                    </form>
                </dialog>
            )}

            {/* Modal de confirmación - Archivar curso */}
            {showArchiveModal && (
                <dialog className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">Archivar curso</h3>
                        <p className="py-4">
                            ¿Estás seguro de que quieres archivar este curso?
                            Los estudiantes ya no podrán acceder al contenido, pero podrás restaurarlo más tarde.
                        </p>
                        <div className="modal-action">
                            <button className="btn" onClick={() => setShowArchiveModal(false)}>Cancelar</button>
                            <button className="btn btn-warning" onClick={handleArchiveCourse}>Archivar curso</button>
                        </div>
                    </div>
                    <form method="dialog" className="modal-backdrop">
                        <button onClick={() => setShowArchiveModal(false)}>close</button>
                    </form>
                </dialog>
            )}

            {/* Modal de confirmación - Eliminar curso */}
            {showDeleteModal && (
                <dialog className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg text-error">Eliminar curso</h3>
                        <p className="py-4">
                            Esta acción es irreversible. ¿Estás absolutamente seguro?
                            Se perderá todo el contenido, tareas, calificaciones y datos de participantes.
                        </p>
                        <p className="text-sm font-semibold">Escribe "ELIMINAR" para confirmar:</p>
                        <input
                            type="text"
                            id="confirm-delete"
                            className="input input-bordered w-full mt-2"
                            onKeyUp={(e) => {
                                const confirmBtn = document.getElementById('confirm-delete-btn') as HTMLButtonElement;
                                if (confirmBtn) {
                                    confirmBtn.disabled = (e.target as HTMLInputElement).value !== "ELIMINAR";
                                }
                            }}
                        />
                        <div className="modal-action">
                            <button className="btn" onClick={() => setShowDeleteModal(false)}>Cancelar</button>
                            <button id="confirm-delete-btn" className="btn btn-error" onClick={handleDeleteCourse} disabled>
                                Eliminar permanentemente
                            </button>
                        </div>
                    </div>
                    <form method="dialog" className="modal-backdrop">
                        <button onClick={() => setShowDeleteModal(false)}>close</button>
                    </form>
                </dialog>
            )}
        </div>
    );
}