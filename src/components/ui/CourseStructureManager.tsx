"use client";

import { useEffect, useMemo, useRef, useState, useCallback, type Dispatch, type FormEvent, type SetStateAction } from "react";

/** Duración en ms que hay que sostener el botón para confirmar */
const HOLD_DURATION_MS = 3000;

function HoldConfirmButton({ 
  onConfirm, 
  disabled, 
  children,
  className = ""
}: { 
  onConfirm: () => void; 
  disabled?: boolean; 
  children: React.ReactNode;
  className?: string;
}) {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const pressingRef = useRef(false);

  const cancel = useCallback(() => {
    if (!pressingRef.current) return;
    pressingRef.current = false;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    startRef.current = null;
    setProgress(0);
  }, []);

  const tick = useCallback(() => {
    if (!pressingRef.current || startRef.current === null) return;
    const elapsed = Date.now() - startRef.current;
    const p = Math.min(elapsed / HOLD_DURATION_MS, 1);
    setProgress(p);
    if (p >= 1) {
      pressingRef.current = false;
      rafRef.current = null;
      startRef.current = null;
      setProgress(0); // Reiniciar al confirmar
      onConfirm();
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [onConfirm]);

  const start = useCallback(() => {
    if (pressingRef.current || disabled) return;
    pressingRef.current = true;
    startRef.current = Date.now();
    rafRef.current = requestAnimationFrame(tick);
  }, [tick, disabled]);

  useEffect(() => () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
  }, []);

  const isActive = progress > 0;

  return (
    <button
      type="button"
      disabled={disabled}
      className={`relative overflow-hidden select-none touch-none transition-colors ${className}`}
      style={{
        userSelect: "none",
        color: isActive ? "white" : undefined,
      }}
      onMouseDown={(e) => { if (e.button === 0) start(); }}
      onMouseUp={cancel}
      onMouseLeave={cancel}
      onTouchStart={(e) => { e.preventDefault(); start(); }}
      onTouchEnd={cancel}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Capa de relleno rojo */}
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-red-700 origin-left"
        style={{
          transform: `scaleX(${progress})`,
          transition: "none",
        }}
      />
      <span className="relative z-10 flex items-center justify-center gap-2">
        {isActive ? "Suelta para cancelar" : children}
      </span>
    </button>
  );
}
import {
  ArrowDown,
  ArrowUp,
  Calendar,
  ClipboardList,
  BookOpen,
  Download,
  FileText,
  FolderOpen,
  GraduationCap,
  Link2,
  MoreVertical,
  Pencil,
  Plus,
  Type,
  Trash2,
} from "lucide-react";
import { ModalForm } from "./modals";
import {
  createSubject,
  deleteSubject,
  reorderSubjects,
  updateSubject,
} from "@/app/actions/courseActions";
import {
  createUnit,
  deleteUnit,
  reorderUnits,
  updateUnit,
} from "@/app/actions/unitActions";
import {
  createResource,
  deleteResource,
  reorderResources,
  updateResource,
} from "@/app/actions/resourceActions";
import Link from "next/link";
import {
  createTask,
  deleteTask,
  reorderSubjectTasks,
  updateTask,
} from "@/app/actions/taskActions";

export interface CourseResourceItem {
  _id: string;
  unitId?: string;
  courseId?: string;
  title: string;
  type: "link" | "file" | "text";
  url?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CourseUnitItem {
  _id: string;
  subjectId?: string;
  courseId?: string;
  title: string;
  content: string;
  order: number;
  resources?: CourseResourceItem[];
  resourceIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CourseTaskItem {
  _id: string;
  title: string;
  description: string;
  type: "assignment" | "quiz" | "forum" | "project";
  maxPoints?: number;
  startDate?: string;
  dueDate?: string;
  allowLateSubmission?: boolean;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CourseSubjectItem {
  _id: string;
  courseId: string;
  title: string;
  description?: string;
  order: number;
  units?: CourseUnitItem[];
  tasks?: CourseTaskItem[];
  unitIds?: string[];
  taskIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}

type EditorKind = "subject" | "unit" | "resource" | "task";
type EditorMode = "create" | "edit";
type TaskDraftType = "assignment" | "quiz";

type EditorState =
  | {
      kind: "subject";
      mode: EditorMode;
      subjectId?: string;
    }
  | {
      kind: "unit";
      mode: EditorMode;
      subjectId: string;
      unitId?: string;
    }
  | {
      kind: "resource";
      mode: EditorMode;
      subjectId: string;
      unitId: string;
      resourceId?: string;
    }
  | {
      kind: "task";
      mode: EditorMode;
      subjectId: string;
      taskId?: string;
      taskType: TaskDraftType;
    };

interface DeleteTarget {
  kind: EditorKind;
  id: string;
  title: string;
  subjectId?: string;
  unitId?: string;
}

interface CourseStructureManagerProps {
  courseId: string;
  subjects: CourseSubjectItem[];
  setSubjects: Dispatch<SetStateAction<CourseSubjectItem[]>>;
  canEdit?: boolean;
}

function toDateTimeLocal(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}

function swapItems<T>(items: T[], fromIndex: number, toIndex: number) {
  const nextItems = [...items];
  const [movedItem] = nextItems.splice(fromIndex, 1);
  nextItems.splice(toIndex, 0, movedItem);
  return nextItems;
}

// El badge muestra nombres localizados para que la estructura tenga la misma
// lectura visual en profesor y estudiante.
function getResourceTypeLabel(type: CourseResourceItem["type"]) {
  if (type === "file") return "Archivo";
  if (type === "link") return "Enlace";
  return "Texto";
}

function getResourceTypeIcon(type: CourseResourceItem["type"]) {
  if (type === "file") return <FileText size={18} aria-hidden="true" />;
  if (type === "link") return <Link2 size={18} aria-hidden="true" />;
  return <Type size={18} aria-hidden="true" />;
}

function isResourceDownloadable(resource: CourseResourceItem) {
  return resource.type === "file";
}

export default function CourseStructureManager({ courseId, subjects, setSubjects, canEdit = true }: CourseStructureManagerProps) {
  const editorDialogRef = useRef<HTMLDialogElement>(null);
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Estado compartido del editor: un único modal sirve para crear y editar
  // materias, unidades, recursos y tareas.
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [resourceType, setResourceType] = useState<"link" | "file" | "text">("file");
  const [resourceUrl, setResourceUrl] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [maxPoints, setMaxPoints] = useState("100");
  const [active, setActive] = useState(true);

  const sortedSubjects = useMemo(
    () => [...subjects].sort((a, b) => a.order - b.order),
    [subjects]
  );

  const closeEditor = () => {
    setEditor(null);
    setErrorMessage(null);
    setIsSubmitting(false);
  };

  useEffect(() => {
    const dialog = editorDialogRef.current;
    if (!dialog) return;

    if (editor && !dialog.open) {
      dialog.showModal();
      return;
    }

    if (!editor && dialog.open) {
      dialog.close();
    }
  }, [editor]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setContent("");
    setResourceType("file");
    setResourceUrl("");
    setDueDate("");
    setMaxPoints("100");
    setActive(true);
    setErrorMessage(null);
  };

  const openCreateSubject = () => {
    if (!canEdit) return;
    resetForm();
    setEditor({ kind: "subject", mode: "create" });
  };

  const openEditSubject = (subject: CourseSubjectItem) => {
    if (!canEdit) return;
    resetForm();
    setTitle(subject.title);
    setDescription(subject.description || "");
    setEditor({ kind: "subject", mode: "edit", subjectId: subject._id });
  };

  const openCreateUnit = (subject: CourseSubjectItem) => {
    if (!canEdit) return;
    resetForm();
    setEditor({ kind: "unit", mode: "create", subjectId: subject._id });
  };

  const openEditUnit = (subjectId: string, unit: CourseUnitItem) => {
    if (!canEdit) return;
    resetForm();
    setTitle(unit.title);
    setContent(unit.content);
    setEditor({ kind: "unit", mode: "edit", subjectId, unitId: unit._id });
  };

  const openCreateResource = (subjectId: string, unit: CourseUnitItem) => {
    if (!canEdit) return;
    resetForm();
    setEditor({ kind: "resource", mode: "create", subjectId, unitId: unit._id });
  };

  const openEditResource = (subjectId: string, unitId: string, resource: CourseResourceItem) => {
    if (!canEdit) return;
    resetForm();
    setTitle(resource.title);
    setDescription(resource.description || "");
    setResourceType(resource.type);
    setResourceUrl(resource.url || "");
    setEditor({ kind: "resource", mode: "edit", subjectId, unitId, resourceId: resource._id });
  };

  const openCreateTask = (subject: CourseSubjectItem, taskType: TaskDraftType) => {
    if (!canEdit) return;
    resetForm();
    setResourceType("file");
    setEditor({ kind: "task", mode: "create", subjectId: subject._id, taskType });
  };

  const openEditTask = (subjectId: string, task: CourseTaskItem) => {
    if (!canEdit) return;
    resetForm();
    setTitle(task.title);
    setDescription(task.description);
    setDueDate(toDateTimeLocal(task.dueDate));
    setMaxPoints(String(task.maxPoints ?? 100));
    setActive(task.active ?? true);
    setEditor({
      kind: "task",
      mode: "edit",
      subjectId,
      taskId: task._id,
      taskType: task.type === "quiz" ? "quiz" : "assignment",
    });
  };

  const requestDelete = (target: DeleteTarget) => {
    if (!canEdit) return;
    setDeleteTarget(target);
  };

  const refreshSubjectOrder = (nextSubjects: CourseSubjectItem[]) =>
    nextSubjects.map((subject, index) => ({ ...subject, order: index }));

  const refreshUnitOrder = (nextUnits: CourseUnitItem[]) =>
    nextUnits.map((unit, index) => ({ ...unit, order: index }));

  const updateSubjectCollection = (subjectId: string, updater: (subject: CourseSubjectItem) => CourseSubjectItem) => {
    setSubjects((previous) => previous.map((subject) => (subject._id === subjectId ? updater(subject) : subject)));
  };

  const updateUnitCollection = (
    subjectId: string,
    unitId: string,
    updater: (unit: CourseUnitItem) => CourseUnitItem
  ) => {
    setSubjects((previous) =>
      previous.map((subject) => {
        if (subject._id !== subjectId) return subject;
        const units = subject.units || [];
        return {
          ...subject,
          units: units.map((unit) => (unit._id === unitId ? updater(unit) : unit)),
        };
      })
    );
  };

  const updateResourceCollection = (
    subjectId: string,
    unitId: string,
    resourceId: string,
    updater: (resource: CourseResourceItem) => CourseResourceItem
  ) => {
    setSubjects((previous) =>
      previous.map((subject) => {
        if (subject._id !== subjectId) return subject;
        return {
          ...subject,
          units: (subject.units || []).map((unit) => {
            if (unit._id !== unitId) return unit;
            return {
              ...unit,
              resources: (unit.resources || []).map((resource) =>
                resource._id === resourceId ? updater(resource) : resource
              ),
            };
          }),
        };
      })
    );
  };

  const updateTaskCollection = (
    subjectId: string,
    taskId: string,
    updater: (task: CourseTaskItem) => CourseTaskItem
  ) => {
    setSubjects((previous) =>
      previous.map((subject) => {
        if (subject._id !== subjectId) return subject;
        return {
          ...subject,
          tasks: (subject.tasks || []).map((task) => (task._id === taskId ? updater(task) : task)),
        };
      })
    );
  };
    // Las acciones de reordenación se resuelven en el backend y luego se reflejan
    // en el estado local para mantener la vista sincronizada sin recargar.

  const handleMoveSubject = async (subjectId: string, direction: -1 | 1) => {
    if (!canEdit) return;
    const orderedSubjects = [...subjects].sort((left, right) => left.order - right.order);
    const currentIndex = orderedSubjects.findIndex((subject) => subject._id === subjectId);
    const nextIndex = currentIndex + direction;

    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= orderedSubjects.length) {
      return;
    }

    const nextSubjects = refreshSubjectOrder(swapItems(orderedSubjects, currentIndex, nextIndex));
    const result = await reorderSubjects(courseId, nextSubjects.map((subject) => subject._id));

    if (!result.success) {
      setErrorMessage(result.error || "No se pudo reordenar la materia");
      return;
    }

    setSubjects(nextSubjects);
  };

  const handleMoveUnit = async (subjectId: string, unitId: string, direction: -1 | 1) => {
    if (!canEdit) return;
    const subject = subjects.find((item) => item._id === subjectId);
    const units = [...(subject?.units || [])].sort((left, right) => left.order - right.order);
    const currentIndex = units.findIndex((unit) => unit._id === unitId);
    const nextIndex = currentIndex + direction;

    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= units.length) {
      return;
    }

    const nextUnits = refreshUnitOrder(swapItems(units, currentIndex, nextIndex));
    const result = await reorderUnits(subjectId, nextUnits.map((unit) => unit._id));

    if (!result.success) {
      setErrorMessage(result.error || "No se pudo reordenar la unidad");
      return;
    }

    updateSubjectCollection(subjectId, (currentSubject) => ({
      ...currentSubject,
      units: nextUnits,
    }));
  };

  const handleMoveResource = async (subjectId: string, unitId: string, resourceId: string, direction: -1 | 1) => {
    if (!canEdit) return;
    const subject = subjects.find((item) => item._id === subjectId);
    const unit = subject?.units?.find((item) => item._id === unitId);
    const resources = [...(unit?.resources || [])];
    const currentIndex = resources.findIndex((resource) => resource._id === resourceId);
    const nextIndex = currentIndex + direction;

    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= resources.length) {
      return;
    }

    const nextResources = swapItems(resources, currentIndex, nextIndex);
    const result = await reorderResources(unitId, nextResources.map((resource) => resource._id));

    if (!result.success) {
      setErrorMessage(result.error || "No se pudo reordenar el recurso");
      return;
    }

    updateUnitCollection(subjectId, unitId, (currentUnit) => ({
      ...currentUnit,
      resources: nextResources,
    }));
  };

  const handleMoveTask = async (subjectId: string, taskId: string, direction: -1 | 1) => {
    if (!canEdit) return;
    const subject = subjects.find((item) => item._id === subjectId);
    const tasks = [...(subject?.tasks || [])];
    const currentIndex = tasks.findIndex((task) => task._id === taskId);
    const nextIndex = currentIndex + direction;

    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= tasks.length) {
      return;
    }

    const nextTasks = swapItems(tasks, currentIndex, nextIndex);
    const result = await reorderSubjectTasks(subjectId, nextTasks.map((task) => task._id));

    if (!result.success) {
      setErrorMessage(result.error || "No se pudo reordenar la tarea");
      return;
    }

    updateSubjectCollection(subjectId, (currentSubject) => ({
      ...currentSubject,
      tasks: nextTasks,
    }));
  };

  const handleEditorSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!editor) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (editor.kind === "subject") {
        if (editor.mode === "create") {
          const result = await createSubject({ courseId, title, description });
          if (!result.success || !result.subject) {
            throw new Error(result.error || "No se pudo crear la materia");
          }

          const createdSubject = result.subject;

          setSubjects((previous) =>
            refreshSubjectOrder([
              ...previous,
              {
                _id: createdSubject._id,
                title: createdSubject.title,
                description: createdSubject.description,
                order: createdSubject.order,
                units: [],
                tasks: [],
                unitIds: [],
                taskIds: [],
                courseId,
              },
            ])
          );
        } else {
          if (!editor.subjectId) throw new Error("Materia inválida");
          const result = await updateSubject(editor.subjectId, { title, description });
          if (!result.success || !result.subject) {
            throw new Error(result.error || "No se pudo actualizar la materia");
          }

          updateSubjectCollection(editor.subjectId, (currentSubject) => ({
            ...currentSubject,
            title: result.subject?.title || currentSubject.title,
            description: result.subject?.description,
          }));
        }
      }

      if (editor.kind === "unit") {
        if (editor.mode === "create") {
          const result = await createUnit({
            courseId,
            subjectId: editor.subjectId,
            title,
            content,
          });

          if (!result.success || !result.unit) {
            throw new Error(result.error || "No se pudo crear la unidad");
          }

          const createdUnit = result.unit;

          updateSubjectCollection(editor.subjectId, (currentSubject) => ({
            ...currentSubject,
            units: refreshUnitOrder([
              ...(currentSubject.units || []),
              {
                _id: createdUnit._id,
                subjectId: createdUnit.subjectId,
                courseId: createdUnit.courseId,
                title: createdUnit.title,
                content: createdUnit.content,
                order: createdUnit.order,
                resources: [],
                resourceIds: createdUnit.resourceIds,
                createdAt: createdUnit.createdAt,
                updatedAt: createdUnit.updatedAt,
              },
            ]),
          }));
        } else {
          if (!editor.unitId) throw new Error("Unidad inválida");
          const result = await updateUnit(editor.unitId, { title, content });
          if (!result.success || !result.unit) {
            throw new Error(result.error || "No se pudo actualizar la unidad");
          }

          updateUnitCollection(editor.subjectId, editor.unitId, (currentUnit) => ({
            ...currentUnit,
            title: result.unit?.title || currentUnit.title,
            content: result.unit?.content || currentUnit.content,
          }));
        }
      }

      if (editor.kind === "resource") {
        if (editor.mode === "create") {
          const result = await createResource({
            courseId,
            subjectId: editor.subjectId,
            unitId: editor.unitId,
            title,
            description,
            type: resourceType,
            url: resourceType === "link" ? resourceUrl : undefined,
          });

          if (!result.success || !result.resource) {
            throw new Error(result.error || "No se pudo crear el recurso");
          }

          const createdResource = result.resource;

          updateUnitCollection(editor.subjectId, editor.unitId, (currentUnit) => ({
            ...currentUnit,
            resources: [
              ...(currentUnit.resources || []),
              {
                _id: createdResource._id,
                unitId: createdResource.unitId,
                courseId: createdResource.courseId,
                title: createdResource.title,
                type: createdResource.type,
                url: createdResource.url,
                description: createdResource.description,
                createdAt: createdResource.createdAt,
                updatedAt: createdResource.updatedAt,
              },
            ],
          }));
        } else {
          if (!editor.resourceId) throw new Error("Recurso inválido");
          const result = await updateResource(editor.resourceId, {
            title,
            description,
            type: resourceType,
            url: resourceType === "link" ? resourceUrl : undefined,
          });

          if (!result.success || !result.resource) {
            throw new Error(result.error || "No se pudo actualizar el recurso");
          }

          updateResourceCollection(editor.subjectId, editor.unitId, editor.resourceId, (currentResource) => ({
            ...currentResource,
            title: result.resource?.title || currentResource.title,
            description: result.resource?.description,
            type: result.resource?.type || currentResource.type,
            url: result.resource?.url,
          }));
        }
      }

      if (editor.kind === "task") {
        const selectedType = editor.taskType === "quiz" ? "quiz" : "assignment";
        const parsedMaxPoints = Number(maxPoints);
        const normalizedMaxPoints = Number.isFinite(parsedMaxPoints) ? parsedMaxPoints : 100;
        if (editor.mode === "create") {
          const result = await createTask({
            courseId,
            subjectId: editor.subjectId,
            title,
            description,
            type: selectedType,
            dueDate: dueDate ? new Date(dueDate).toISOString() : new Date().toISOString(),
            startDate: new Date().toISOString(),
            maxPoints: normalizedMaxPoints,
            allowLateSubmission: false,
            active,
          });

          if (!result.success || !result.task) {
            throw new Error(result.error || "No se pudo crear la tarea");
          }

          const createdTask = result.task;

          updateSubjectCollection(editor.subjectId, (currentSubject) => ({
            ...currentSubject,
            tasks: [
              ...(currentSubject.tasks || []),
              {
                _id: createdTask._id,
                title: createdTask.title,
                description: createdTask.description,
                type: createdTask.type,
                maxPoints: createdTask.maxPoints,
                startDate: createdTask.startDate,
                dueDate: createdTask.dueDate,
                allowLateSubmission: createdTask.allowLateSubmission,
                active: createdTask.active,
                createdAt: createdTask.createdAt,
                updatedAt: createdTask.updatedAt,
              },
            ],
          }));
        } else {
          if (!editor.taskId) throw new Error("Tarea inválida");
          const result = await updateTask(editor.taskId, {
            title,
            description,
            type: selectedType,
            dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
            maxPoints: normalizedMaxPoints,
            active,
          });

          if (!result.success || !result.task) {
            throw new Error(result.error || "No se pudo actualizar la tarea");
          }

          updateTaskCollection(editor.subjectId, editor.taskId, (currentTask) => ({
            ...currentTask,
            title: result.task?.title || currentTask.title,
            description: result.task?.description || currentTask.description,
            type: result.task?.type || currentTask.type,
            maxPoints: result.task?.maxPoints ?? currentTask.maxPoints,
            dueDate: result.task?.dueDate || currentTask.dueDate,
            active: result.task?.active ?? currentTask.active,
          }));
        }
      }

      closeEditor();
    } catch (submissionError) {
      const message = submissionError instanceof Error ? submissionError.message : "No se pudo completar la operación";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (deleteTarget.kind === "subject") {
        const result = await deleteSubject(deleteTarget.id);
        if (!result.success) throw new Error(result.error || "No se pudo eliminar la materia");
        setSubjects((previous) => refreshSubjectOrder(previous.filter((subject) => subject._id !== deleteTarget.id)));
      }

      if (deleteTarget.kind === "unit") {
        const result = await deleteUnit(deleteTarget.id);
        if (!result.success) throw new Error(result.error || "No se pudo eliminar la unidad");
        updateSubjectCollection(deleteTarget.subjectId || "", (currentSubject) => ({
          ...currentSubject,
          units: refreshUnitOrder((currentSubject.units || []).filter((unit) => unit._id !== deleteTarget.id)),
        }));
      }

      if (deleteTarget.kind === "resource") {
        const result = await deleteResource(deleteTarget.id);
        if (!result.success) throw new Error(result.error || "No se pudo eliminar el recurso");
        updateUnitCollection(deleteTarget.subjectId || "", deleteTarget.unitId || "", (currentUnit) => ({
          ...currentUnit,
          resources: (currentUnit.resources || []).filter((resource) => resource._id !== deleteTarget.id),
        }));
      }

      if (deleteTarget.kind === "task") {
        const result = await deleteTask(deleteTarget.id);
        if (!result.success) throw new Error(result.error || "No se pudo eliminar la tarea");
        updateSubjectCollection(deleteTarget.subjectId || "", (currentSubject) => ({
          ...currentSubject,
          tasks: (currentSubject.tasks || []).filter((task) => task._id !== deleteTarget.id),
        }));
      }

      setDeleteTarget(null);
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : "No se pudo eliminar el elemento";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderMenuButton = () => (
    <div tabIndex={0} role="button" className="btn btn-ghost btn-xs btn-circle" aria-label="Abrir menú de acciones">
      <MoreVertical size={16} />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="card-title text-xl">Estructura del curso</h2>
              <p className="text-sm text-base-content/60">Gestiona materias, unidades, recursos, tareas y exámenes desde aquí.</p>
            </div>
            {canEdit && (
              <button type="button" className="btn btn-primary gap-2" onClick={openCreateSubject}>
                <Plus size={16} />
                Nueva materia
              </button>
            )}
          </div>

          {errorMessage && <div className="alert alert-error text-sm"><span>{errorMessage}</span></div>}
        </div>
      </div>

      {sortedSubjects.length === 0 ? (
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body items-center text-center py-12">
            <BookOpen size={48} className="text-base-content/20" />
            <h3 className="text-xl font-semibold">No hay materias todavía</h3>
            <p className="text-base-content/60 max-w-xl">Crea la primera materia para empezar a añadir unidades, recursos, tareas y exámenes.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedSubjects.map((subject) => {
            const sortedUnits = [...(subject.units || [])].sort((left, right) => left.order - right.order);
            const sortedTasks = [...(subject.tasks || [])];

            return (
              <div key={subject._id} id={`subject-${subject._id}`} className="card scroll-mt-24 bg-base-100 border border-base-300 shadow-sm">
                <div className="card-body gap-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <BookOpen size={20} className="text-primary" />
                        <h3 className="text-2xl font-bold">{subject.title}</h3>
                      </div>
                      {subject.description && <p className="text-sm text-base-content/60 max-w-3xl">{subject.description}</p>}
                    </div>

                    <div className="dropdown dropdown-end">
                      {/* El menú contextual sólo aparece para profesores; el alumno ve la misma
                          estructura, pero sin controles de edición ni reordenación. */}
                      {canEdit && (
                        <>
                          {renderMenuButton()}
                          <ul tabIndex={0} className="dropdown-content z-[10] menu p-2 shadow bg-base-100 rounded-box w-56 border border-base-200">
                            <li><button type="button" onClick={() => openEditSubject(subject)}><Pencil size={14} />Editar materia</button></li>
                            <li><button type="button" onClick={() => openCreateUnit(subject)}><Plus size={14} />Añadir unidad</button></li>
                            <li><button type="button" onClick={() => openCreateTask(subject, "assignment")}><ClipboardTaskIcon />Nueva tarea</button></li>
                            <li><button type="button" onClick={() => openCreateTask(subject, "quiz")}><GraduationCap size={14} />Nuevo examen</button></li>
                            <li className="menu-title"><span>Reordenar</span></li>
                            <li><button type="button" disabled={subject.order === 0} onClick={() => handleMoveSubject(subject._id, -1)}><ArrowUp size={14} />Subir</button></li>
                            <li><button type="button" disabled={subject.order >= sortedSubjects.length - 1} onClick={() => handleMoveSubject(subject._id, 1)}><ArrowDown size={14} />Bajar</button></li>
                            <li className="mt-1"><button type="button" className="text-error" onClick={() => requestDelete({ kind: "subject", id: subject._id, title: subject.title })}><Trash2 size={14} />Eliminar materia</button></li>
                          </ul>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-base-content/50">
                          <FolderOpen size={16} />
                          Unidades
                        </div>
                      </div>

                      {sortedUnits.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-base-300 p-4 text-sm text-base-content/50">Todavía no hay unidades en esta materia.</div>
                      ) : (
                        <div className="space-y-3">
                          {sortedUnits.map((unit, unitIndex) => {
                            const resources = [...(unit.resources || [])];

                            return (
                              <div key={unit._id} id={`unit-${unit._id}`} className="scroll-mt-24 rounded-2xl border border-base-200 bg-base-100/60 p-4">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="badge badge-primary badge-sm">Unidad {unitIndex + 1}</span>
                                      <h4 className="text-lg font-semibold">{unit.title}</h4>
                                    </div>
                                    <p className="text-sm text-base-content/60 whitespace-pre-wrap">{unit.content}</p>
                                  </div>

                                  {canEdit && (
                                    <div className="dropdown dropdown-end">
                                      {renderMenuButton()}
                                      <ul tabIndex={0} className="dropdown-content z-[10] menu p-2 shadow bg-base-100 rounded-box w-56 border border-base-200">
                                        <li><button type="button" onClick={() => openEditUnit(subject._id, unit)}><Pencil size={14} />Editar unidad</button></li>
                                        <li><button type="button" onClick={() => openCreateResource(subject._id, unit)}><Plus size={14} />Añadir recurso</button></li>
                                        <li className="menu-title"><span>Reordenar</span></li>
                                        <li><button type="button" disabled={unitIndex === 0} onClick={() => handleMoveUnit(subject._id, unit._id, -1)}><ArrowUp size={14} />Subir</button></li>
                                        <li><button type="button" disabled={unitIndex === sortedUnits.length - 1} onClick={() => handleMoveUnit(subject._id, unit._id, 1)}><ArrowDown size={14} />Bajar</button></li>
                                        <li className="mt-1"><button type="button" className="text-error" onClick={() => requestDelete({ kind: "unit", id: unit._id, title: unit.title, subjectId: subject._id })}><Trash2 size={14} />Eliminar unidad</button></li>
                                      </ul>
                                    </div>
                                  )}
                                </div>

                                <div className="mt-4 space-y-2">
                                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-base-content/40">
                                    <FileText size={14} />
                                    Recursos
                                  </div>

                                  {resources.length === 0 ? (
                                    <div className="rounded-xl border border-dashed border-base-200 px-3 py-2 text-sm text-base-content/45">Sin recursos en esta unidad.</div>
                                  ) : (
                                    <div className="space-y-2">
                                      {resources.map((resource, resourceIndex) => (
                                        <div key={resource._id} className="flex items-stretch gap-3 rounded-2xl border border-base-200 bg-base-100 shadow-sm transition-all hover:shadow-md">
                                          <div className="flex min-w-0 flex-1 items-center gap-4 px-4 py-3">
                                            <div className="p-2.5 rounded-full flex-shrink-0 bg-primary/10 text-primary shadow-sm">
                                              {getResourceTypeIcon(resource.type)}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                              <div className="flex items-center gap-2 flex-wrap">
                                                <span className="badge badge-ghost badge-sm">{getResourceTypeLabel(resource.type)}</span>
                                                <p className="font-bold text-base text-base-content/90 truncate">{resource.title}</p>
                                              </div>
                                              {resource.description && <p className="text-sm text-base-content/55 truncate mt-1">{resource.description}</p>}
                                            </div>
                                          </div>

                                          {canEdit && (
                                            <div className="flex items-center gap-1 pr-2 self-center">
                                              {isResourceDownloadable(resource) && (
                                                resource.url ? (
                                                  <a
                                                    href={resource.url}
                                                    download
                                                    className="btn btn-ghost btn-xs btn-circle"
                                                    aria-label={`Descargar ${resource.title}`}
                                                    title="Descargar recurso"
                                                  >
                                                    <Download size={16} aria-hidden="true" />
                                                  </a>
                                                ) : (
                                                  <button
                                                    type="button"
                                                    className="btn btn-ghost btn-xs btn-circle"
                                                    disabled
                                                    aria-label={`Descargar ${resource.title}`}
                                                    title="Este recurso no tiene archivo asociado"
                                                  >
                                                    <Download size={16} aria-hidden="true" />
                                                  </button>
                                                )
                                              )}
                                              <div className="dropdown dropdown-end">
                                                {renderMenuButton()}
                                                <ul tabIndex={0} className="dropdown-content z-[10] menu p-2 shadow bg-base-100 rounded-box w-52 border border-base-200">
                                                  <li><button type="button" onClick={() => openEditResource(subject._id, unit._id, resource)}><Pencil size={14} />Editar recurso</button></li>
                                                  <li className="menu-title"><span>Reordenar</span></li>
                                                  <li><button type="button" disabled={resourceIndex === 0} onClick={() => handleMoveResource(subject._id, unit._id, resource._id, -1)}><ArrowUp size={14} />Subir</button></li>
                                                  <li><button type="button" disabled={resourceIndex === resources.length - 1} onClick={() => handleMoveResource(subject._id, unit._id, resource._id, 1)}><ArrowDown size={14} />Bajar</button></li>
                                                  <li className="mt-1"><button type="button" className="text-error" onClick={() => requestDelete({ kind: "resource", id: resource._id, title: resource.title, subjectId: subject._id, unitId: unit._id })}><Trash2 size={14} />Eliminar recurso</button></li>
                                                </ul>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-base-content/50">
                          <GraduationCap size={16} />
                          Tareas y exámenes
                        </div>
                      </div>

                      {sortedTasks.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-base-300 p-4 text-sm text-base-content/50">Todavía no hay tareas en esta materia.</div>
                      ) : (
                        <div className="space-y-2">
                          {sortedTasks.map((task, taskIndex) => (
                            <div key={task._id} className="flex items-stretch gap-3 rounded-2xl border border-base-200 bg-base-100 shadow-sm transition-all hover:shadow-md">
                              <Link
                                href={`/mycourses/${courseId}/tasks/${task._id}`}
                                className="flex min-w-0 flex-1 items-center gap-4 px-4 py-3"
                                aria-label={`Ver ${task.type === "quiz" ? "examen" : "tarea"}: ${task.title}`}
                              >
                                <div className="p-2.5 rounded-full flex-shrink-0 bg-yellow-100 text-yellow-600 shadow-sm">
                                  <ClipboardList size={18} aria-hidden="true" />
                                </div>

                                <div className="flex min-w-0 flex-1 flex-col">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="badge badge-ghost badge-sm border border-primary">{task.type === "quiz" ? "Examen" : "Tarea"}</span>
                                    <p className="font-bold text-base text-base-content/90 truncate">{task.title}</p>
                                  </div>
                                  <p className="text-sm text-base-content/55 truncate mt-1">{task.description}</p>
                                </div>
                              </Link>

                              {canEdit && (
                                <div className="flex items-center gap-1 pr-2 self-center">
                                  {task.dueDate && (
                                    <div className="flex items-center gap-1.5 text-xs text-base-content/60 mr-1 whitespace-nowrap">
                                      <Calendar size={14} className="text-primary" aria-hidden="true" />
                                      <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                                    </div>
                                  )}

                                  <div className="dropdown dropdown-end">
                                    {renderMenuButton()}
                                    <ul tabIndex={0} className="dropdown-content z-[10] menu p-2 shadow bg-base-100 rounded-box w-56 border border-base-200">
                                      <li><button type="button" onClick={() => openEditTask(subject._id, task)}><Pencil size={14} />Editar {task.type === "quiz" ? "examen" : "tarea"}</button></li>
                                      <li className="menu-title"><span>Reordenar</span></li>
                                      <li><button type="button" disabled={taskIndex === 0} onClick={() => handleMoveTask(subject._id, task._id, -1)}><ArrowUp size={14} />Subir</button></li>
                                      <li><button type="button" disabled={taskIndex === sortedTasks.length - 1} onClick={() => handleMoveTask(subject._id, task._id, 1)}><ArrowDown size={14} />Bajar</button></li>
                                      <li className="mt-1"><button type="button" className="text-error" onClick={() => requestDelete({ kind: "task", id: task._id, title: task.title, subjectId: subject._id })}><Trash2 size={14} />Eliminar {task.type === "quiz" ? "examen" : "tarea"}</button></li>
                                    </ul>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {canEdit && editor && (
        <ModalForm
          id="course-structure-editor"
          dialogRef={editorDialogRef}
          title={
            editor.kind === "subject"
              ? editor.mode === "create"
                ? "Crear materia"
                : "Editar materia"
              : editor.kind === "unit"
                ? editor.mode === "create"
                  ? "Crear unidad"
                  : "Editar unidad"
                : editor.kind === "resource"
                  ? editor.mode === "create"
                    ? "Crear recurso"
                    : "Editar recurso"
                  : editor.mode === "create"
                    ? editor.taskType === "quiz"
                      ? "Crear examen"
                      : "Crear tarea"
                    : editor.taskType === "quiz"
                      ? "Editar examen"
                      : "Editar tarea"
          }
          onClose={closeEditor}
          onConfirm={handleEditorSubmit}
          confirmLabel={editor.kind === "subject" ? "Guardar materia" : editor.kind === "unit" ? "Guardar unidad" : editor.kind === "resource" ? "Guardar recurso" : "Guardar"}
          isLoading={isSubmitting}
          error={errorMessage}
          className="max-w-3xl"
        >
          {editor.kind === "subject" && (
            <>
              <label className="form-control w-full">
                <span className="label-text font-medium mb-2">Título</span>
                <input className="input input-bordered w-full" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ej: Matemáticas" required />
              </label>
              <label className="form-control w-full">
                <span className="label-text font-medium mb-2">Descripción</span>
                <textarea className="textarea textarea-bordered h-28 w-full" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe la materia" />
              </label>
            </>
          )}

          {editor.kind === "unit" && (
            <>
              <label className="form-control w-full">
                <span className="label-text font-medium mb-2">Título</span>
                <input className="input input-bordered w-full" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ej: Unidad 1" required />
              </label>
              <label className="form-control w-full">
                <span className="label-text font-medium mb-2">Contenido</span>
                <textarea className="textarea textarea-bordered h-32 w-full" value={content} onChange={(event) => setContent(event.target.value)} placeholder="Contenido de la unidad" required />
              </label>
            </>
          )}

          {editor.kind === "resource" && (
            <>
              <label className="form-control w-full">
                <span className="label-text font-medium mb-2">Título</span>
                <input className="input input-bordered w-full" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ej: PDF del tema" required />
              </label>
              <label className="form-control w-full">
                <span className="label-text font-medium mb-2">Tipo</span>
                <select className="select select-bordered w-full" value={resourceType} onChange={(event) => setResourceType(event.target.value as "link" | "file" | "text") }>
                  <option value="file">Archivo</option>
                  <option value="link">Enlace</option>
                  <option value="text">Texto</option>
                </select>
              </label>
              {resourceType === "link" && (
                <label className="form-control w-full">
                  <span className="label-text font-medium mb-2">URL</span>
                  <input className="input input-bordered w-full" value={resourceUrl} onChange={(event) => setResourceUrl(event.target.value)} placeholder="https://..." required />
                </label>
              )}
              <label className="form-control w-full">
                <span className="label-text font-medium mb-2">Descripción</span>
                <textarea className="textarea textarea-bordered h-24 w-full" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Descripción opcional" />
              </label>
            </>
          )}

          {editor.kind === "task" && (
            <>
              <label className="form-control w-full">
                <span className="label-text font-medium mb-2">Título</span>
                <input className="input input-bordered w-full" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ej: Entrega tema 1" required />
              </label>
              <label className="form-control w-full">
                <span className="label-text font-medium mb-2">Descripción</span>
                <textarea className="textarea textarea-bordered h-28 w-full" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Explica la actividad" required />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="form-control w-full">
                  <span className="label-text font-medium mb-2">Tipo</span>
                  <select
                    className="select select-bordered w-full"
                    value={editor.taskType}
                    onChange={(event) => setEditor({ ...editor, taskType: event.target.value as TaskDraftType })}
                  >
                    <option value="assignment">Tarea</option>
                    <option value="quiz">Examen</option>
                  </select>
                </label>
                <label className="form-control w-full">
                  <span className="label-text font-medium mb-2">Puntos máximos</span>
                  <input className="input input-bordered w-full" type="number" min="0" value={maxPoints} onChange={(event) => setMaxPoints(event.target.value)} />
                </label>
              </div>
              <label className="form-control w-full">
                <span className="label-text font-medium mb-2">Fecha de entrega</span>
                <input className="input input-bordered w-full" type="datetime-local" value={dueDate} onChange={(event) => setDueDate(event.target.value)} required />
              </label>
              <label className="label cursor-pointer justify-start gap-3">
                <input type="checkbox" className="toggle toggle-primary" checked={active} onChange={(event) => setActive(event.target.checked)} />
                <span className="label-text font-medium">Activa</span>
              </label>
            </>
          )}
        </ModalForm>
      )}

      {canEdit && deleteTarget && (
        <dialog className="modal modal-open">
          <div className="modal-box border border-error/20">
            <h3 className="font-bold text-lg text-error">Eliminar {deleteTarget.kind === "subject" ? "materia" : deleteTarget.kind === "unit" ? "unidad" : deleteTarget.kind === "resource" ? "recurso" : "tarea"}</h3>
            <p className="py-4">
              Vas a eliminar <span className="font-semibold">{deleteTarget.title}</span>. Esta acción no se puede deshacer.
            </p>
            {errorMessage && <div className="alert alert-error mb-4 text-sm"><span>{errorMessage}</span></div>}
            <div className="modal-action">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setDeleteTarget(null);
                  setErrorMessage(null);
                }}
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <HoldConfirmButton
                className="btn btn-error text-white"
                onConfirm={confirmDelete}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Eliminando..." : "Eliminar"}
              </HoldConfirmButton>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button type="button" onClick={() => setDeleteTarget(null)}>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
}

function ClipboardTaskIcon() {
  return <GraduationCap size={14} />;
}
