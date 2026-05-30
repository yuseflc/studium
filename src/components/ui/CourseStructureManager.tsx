"use client";

import { useEffect, useMemo, useRef, useState, useCallback, type Dispatch, type FormEvent, type SetStateAction } from "react";
import HoldConfirmButton from "@/components/ui/HoldConfirmButton";

import {
  ArrowDown, 
  ArrowUp,
  Calendar,
  CheckCircle2,
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
import { 
  CourseSubjectModal, 
  CourseUnitModal, 
  CourseResourceModal, 
  CourseTaskModal, 
  ModalForm,
  CourseStructureDeleteModal
} from "./modals";
import {
  // Subjects removed — use Units actions instead
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
import { truncateText } from '@/lib/utils';
import {
  createTask,
  deleteTask,
  reorderUnitTasks,
  updateTask,
} from "@/app/actions/taskActions";
import { useRouter } from "next/navigation";

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
  unitId?: string;
  title: string;
  description: string;
  type: "assignment" | "quiz" | "forum" | "project";
  maxPoints?: number;
  startDate?: string;
  dueDate?: string;
  allowLateSubmission?: boolean;
  active?: boolean;
  isSubmitted?: boolean;
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
      unitId?: string;
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
  const router = useRouter();
  const editorDialogRef = useRef<HTMLDialogElement>(null);
  const pendingUnitScrollRef = useRef<string | null>(null);
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

  useEffect(() => {
    const unitId = pendingUnitScrollRef.current;
    if (!unitId) return;

    pendingUnitScrollRef.current = null;
    const element = document.getElementById(`unit-${unitId}`);
    if (!element) return;

    requestAnimationFrame(() => {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [subjects]);

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
    // Create a unit directly (subjects are deprecated)
    setEditor({ kind: "unit", mode: "create", subjectId: subjects?.[0]?._id || "" });
  };

  const openEditSubject = (subject: CourseSubjectItem) => {
    if (!canEdit) return;
    resetForm();
    // Edit the first mapped unit if present, otherwise open unit create for this subject
    const mappedUnit = subject.units && subject.units.length === 1 ? subject.units[0] : undefined;
    if (mappedUnit) {
      setTitle(mappedUnit.title);
      setContent(mappedUnit.content);
      setEditor({ kind: "unit", mode: "edit", subjectId: subject._id, unitId: mappedUnit._id });
    } else {
      setEditor({ kind: "unit", mode: "create", subjectId: subject._id });
    }
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

  const openCreateTask = (subject: CourseSubjectItem, taskType: TaskDraftType, unitId?: string) => {
    if (!canEdit) return;
    resetForm();
    setResourceType("file");
    setEditor({ kind: "task", mode: "create", subjectId: subject._id, taskType, unitId });
  };

  const goToTaskCreationPage = (unitId?: string) => {
    if (!canEdit) return;
    const query = unitId ? `?unitId=${unitId}` : "";
    router.push(`/mycourses/${courseId}/tasks/new${query}`);
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
      unitId: (task as any).unitId,
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
    // Delegate to mapped-unit reordering which maps subjects->units
    await handleMoveMappedUnit(subjectId, direction);
  };

  const handleMoveMappedUnit = async (subjectId: string, direction: -1 | 1) => {
    if (!canEdit) return;

    const orderedSubjects = [...subjects].sort((left, right) => left.order - right.order);
    const currentIndex = orderedSubjects.findIndex((subject) => subject._id === subjectId);
    const nextIndex = currentIndex + direction;

    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= orderedSubjects.length) {
      return;
    }

    const nextSubjects = refreshSubjectOrder(swapItems(orderedSubjects, currentIndex, nextIndex));
    const unitIds = nextSubjects
      .map((subject) => subject.units?.[0]?._id || subject._id)
      .filter((unitId): unitId is string => Boolean(unitId));

    const result = await reorderUnits(courseId, unitIds);

    if (!result.success) {
      setErrorMessage(result.error || "No se pudo reordenar la unidad");
      return;
    }

    pendingUnitScrollRef.current = nextSubjects[nextIndex]?.units?.[0]?._id || nextSubjects[nextIndex]?._id || null;
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
    const result = await reorderUnits(courseId, nextUnits.map((unit) => unit._id));

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
    // Resolve unitId for compatibility: prefer explicit unitIds, then first unit, then subject id
    const unitId = subject?.unitIds?.[0] ?? subject?.units?.[0]?._id ?? subject?._id;
    if (!unitId) {
      setErrorMessage("Unidad no encontrada para reordenar tareas");
      return;
    }
    const result = await reorderUnitTasks(unitId, nextTasks.map((task) => task._id));

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
      // Subjects removed: creation/editing of course structure now operates on Units.

      if (editor.kind === "unit") {
          if (editor.mode === "create") {
          const result = await createUnit({
            courseId,
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
                subjectId: editor.subjectId,
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
            const subject = subjects.find((s) => s._id === editor.subjectId);
            const fallbackUnitId = editor.unitId || (subject?.unitIds?.[0] ?? subject?.units?.[0]?._id);
            const result = await createTask({
              courseId,
              unitId: fallbackUnitId || "",
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
                unitId: createdTask.unitId,
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
        // Treat deleting a subject as deleting its mapped unit (subjects deprecated)
        const result = await deleteUnit(deleteTarget.id);
        if (!result.success) throw new Error(result.error || "No se pudo eliminar la unidad");
        setSubjects((previous) => refreshSubjectOrder(previous.filter((subject) => subject._id !== deleteTarget.id)));
      }

      if (deleteTarget.kind === "unit") {
        const result = await deleteUnit(deleteTarget.id);
        if (!result.success) throw new Error(result.error || "No se pudo eliminar la unidad");
        const currentSubject = subjects.find((subject) => subject._id === deleteTarget.subjectId);
        const isMappedUnitSubject =
          currentSubject?.units &&
          currentSubject.units.length === 1 &&
          String(currentSubject._id) === String(currentSubject.units[0]._id);

        if (isMappedUnitSubject) {
          setSubjects((previous) => refreshSubjectOrder(previous.filter((subject) => subject._id !== deleteTarget.subjectId)));
        } else {
          updateSubjectCollection(deleteTarget.subjectId || "", (currentSubject) => ({
            ...currentSubject,
            units: refreshUnitOrder((currentSubject.units || []).filter((unit) => unit._id !== deleteTarget.id)),
          }));
        }
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
              <p className="text-sm text-base-content/60">Gestiona unidades, recursos, tareas y exámenes desde aquí.</p>
            </div>
            {canEdit && (
              <button type="button" className="btn btn-primary gap-2" onClick={openCreateSubject}>
                <Plus size={16} />
                Nueva unidad
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
                  <h3 className="text-xl font-semibold">No hay unidades todavía</h3>
                  <p className="text-base-content/60 max-w-xl">Crea la primera unidad para empezar a añadir recursos, tareas y exámenes.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedSubjects.map((subject) => {
            const sortedUnits = [...(subject.units || [])].sort((left, right) => left.order - right.order);
            const sortedTasks = [...(subject.tasks || [])];
            const isMappedUnitSubject =
              subject.units &&
              subject.units.length === 1 &&
              String(subject._id) === String(subject.units[0]._id);

            if (isMappedUnitSubject) {
              const unit = subject.units?.[0];

              if (!unit) {
                return null;
              }

              const resources = [...(unit.resources || [])];

              return (
                <div key={subject._id} id={`unit-${unit._id}`} className="card scroll-mt-24 bg-base-100 border border-base-300 shadow-sm">
                  <div className="card-body gap-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <BookOpen size={20} className="text-primary" />
                          <h3 className="text-2xl font-bold">{unit.title}</h3>
                        </div>
                        {unit.content && <p className="text-sm text-base-content/60 max-w-3xl whitespace-pre-wrap">{truncateText(unit.content, 240)}</p>}
                      </div>

                      {canEdit && (
                        <div className="dropdown dropdown-end">
                          {renderMenuButton()}
                          <ul tabIndex={0} className="dropdown-content z-[10] menu p-2 shadow bg-base-100 rounded-box w-56 border border-base-200">
                            <li><button type="button" onClick={() => openEditUnit(subject._id, unit)}><Pencil size={14} />Editar unidad</button></li>
                            <li><button type="button" onClick={() => openCreateResource(subject._id, unit)}><Plus size={14} />Añadir recurso</button></li>
                            <li><button type="button" onClick={() => goToTaskCreationPage(unit._id)}><ClipboardTaskIcon />Nueva tarea</button></li>
                            <li><button type="button" onClick={() => openCreateTask(subject, "quiz", unit._id)}><GraduationCap size={14} />Nuevo examen</button></li>
                            <li className="menu-title"><span>Reordenar</span></li>
                            <li><button type="button" disabled={subject.order === 0} onClick={() => handleMoveMappedUnit(subject._id, -1)}><ArrowUp size={14} />Subir</button></li>
                            <li><button type="button" disabled={subject.order >= sortedSubjects.length - 1} onClick={() => handleMoveMappedUnit(subject._id, 1)}><ArrowDown size={14} />Bajar</button></li>
                            <li className="mt-1"><button type="button" className="text-error" onClick={() => requestDelete({ kind: "unit", id: unit._id, title: unit.title, subjectId: subject._id })}><Trash2 size={14} />Eliminar unidad</button></li>
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="space-y-5">
                      <div className="space-y-3">
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
                                  <div className="p-2.5 rounded-full flex-shrink-0 bg-primary/10 text-primary border border-primary/20 shadow-sm">
                                    {getResourceTypeIcon(resource.type)}
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-base-200 text-base-content/70 border border-base-300 shadow-sm">{getResourceTypeLabel(resource.type)}</span>
                                      <p className="font-bold text-base text-base-content/90 truncate">{resource.title}</p>
                                    </div>
                                    {resource.description && <p className="text-sm text-base-content/55 mt-1 break-words break-all max-w-full">{truncateText(resource.description, 140)}</p>}
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

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-base-content/40">
                          <GraduationCap size={16} />
                          Tareas y exámenes
                        </div>

                        {sortedTasks.length > 0 ? (
                          <div className="space-y-2">
                            {sortedTasks.map((task, taskIndex) => (
                              <div key={task._id} className="flex items-stretch gap-3 rounded-2xl border border-base-200 bg-base-100 shadow-sm transition-all hover:shadow-md">
                                <Link
                                  href={`/mycourses/${courseId}/tasks/${task._id}`}
                                  className="flex min-w-0 flex-1 items-center gap-4 px-4 py-3"
                                  aria-label={`Ver ${task.type === "quiz" ? "examen" : "tarea"}: ${task.title}`}
                                >
                                  <div className="p-2.5 rounded-full flex-shrink-0 bg-primary/10 text-primary border border-primary/20 shadow-sm">
                                    {task.type === "quiz" ? <GraduationCap size={18} aria-hidden="true" /> : <ClipboardList size={18} aria-hidden="true" />}
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-base-200 text-base-content/70 border border-base-300 shadow-sm">{task.type === "quiz" ? "Examen" : "Tarea"}</span>
                                      <p className="font-bold text-base text-base-content/90 truncate">{task.title}</p>
                                    </div>
                                    {task.description && <p className="text-sm text-base-content/55 mt-1 break-words break-all max-w-full">{truncateText(task.description, 140)}</p>}
                                  </div>
                                </Link>

                                {canEdit && (
                                  <div className="flex items-center gap-1 pr-2 self-center">
                                    <div className="dropdown dropdown-end">
                                      {renderMenuButton()}
                                      <ul tabIndex={0} className="dropdown-content z-[10] menu p-2 shadow bg-base-100 rounded-box w-52 border border-base-200">
                                        <li><button type="button" onClick={() => router.push(`/mycourses/${courseId}/tasks/${task._id}/edit`)}><Pencil size={14} />Editar tarea</button></li>
                                        <li className="menu-title"><span>Reordenar</span></li>
                                        <li><button type="button" disabled={taskIndex === 0} onClick={() => handleMoveTask(subject._id, task._id, -1)}><ArrowUp size={14} />Subir</button></li>
                                        <li><button type="button" disabled={taskIndex === sortedTasks.length - 1} onClick={() => handleMoveTask(subject._id, task._id, 1)}><ArrowDown size={14} />Bajar</button></li>
                                        <li className="mt-1"><button type="button" className="text-error" onClick={() => requestDelete({ kind: "task", id: task._id, title: task.title, subjectId: subject._id })}><Trash2 size={14} />Eliminar tarea</button></li>
                                      </ul>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="rounded-xl border border-dashed border-base-200 px-3 py-2 text-sm text-base-content/45">Todavía no hay tareas en esta unidad.</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div key={subject._id} id={`subject-${subject._id}`} className="card scroll-mt-24 bg-base-100 border border-base-300 shadow-sm">
                <div className="card-body gap-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <BookOpen size={20} className="text-primary" />
                        <h3 className="text-2xl font-bold">{subject.title}</h3>
                      </div>
                      {subject.description && <p className="text-sm text-base-content/60 max-w-3xl break-words">{truncateText(subject.description, 200)}</p>}
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
                            <li><button type="button" onClick={() => goToTaskCreationPage()}><ClipboardTaskIcon />Nueva tarea</button></li>
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
                    {/* Detectar si este `subject` proviene de un mapeo de `unit` (compatibilidad)
                        En ese caso `subject.units` contendrá exactamente la misma unidad con el mismo _id.
                        Queremos renderizar directamente la unidad mostrando Recursos - Tareas - Exámenes
                        en lugar de una sección separada "Unidades" que provoca duplicado visual. */}
                    {subject.units && subject.units.length === 1 && String(subject._id) === String(subject.units[0]._id) ? (
                      (() => {
                        const unit = subject.units[0];
                        const resources = [...(unit.resources || [])];

                        return (
                          <div className="space-y-3">
                            <div key={unit._id} id={`unit-${unit._id}`} className="scroll-mt-24 rounded-2xl border border-base-200 bg-base-100/60 p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 shadow-sm">Unidad {unit.order ?? 1}</span>
                                    <h4 className="text-lg font-semibold">{unit.title}</h4>
                                  </div>
                                  <p className="text-sm text-base-content/60 whitespace-pre-wrap">{truncateText(unit.content, 240)}</p>
                                </div>

                                {canEdit && (
                                  <div className="dropdown dropdown-end">
                                    {renderMenuButton()}
                                    <ul tabIndex={0} className="dropdown-content z-[10] menu p-2 shadow bg-base-100 rounded-box w-56 border border-base-200">
                                      <li><button type="button" onClick={() => openEditUnit(subject._id, unit)}><Pencil size={14} />Editar unidad</button></li>
                                      <li><button type="button" onClick={() => openCreateResource(subject._id, unit)}><Plus size={14} />Añadir recurso</button></li>
                                      <li className="menu-title"><span>Reordenar</span></li>
                                      <li><button type="button" disabled={unit.order === 0} onClick={() => handleMoveUnit(subject._id, unit._id, -1)}><ArrowUp size={14} />Subir</button></li>
                                      <li><button type="button" disabled={unit.order >= sortedUnits.length - 1} onClick={() => handleMoveUnit(subject._id, unit._id, 1)}><ArrowDown size={14} />Bajar</button></li>
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
                                          <div className="p-2.5 rounded-full flex-shrink-0 bg-primary/10 text-primary border border-primary/20 shadow-sm">
                                            {getResourceTypeIcon(resource.type)}
                                          </div>

                                          <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-base-200 text-base-content/70 border border-base-300 shadow-sm">{getResourceTypeLabel(resource.type)}</span>
                                              <p className="font-bold text-base text-base-content/90 truncate">{resource.title}</p>
                                            </div>
                                            {resource.description && <p className="text-sm text-base-content/55 mt-1 break-words break-all max-w-full">{truncateText(resource.description, 140)}</p>}
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

                            {/* Renderizar aquí las tareas/exámenes asociadas a la materia/unidad en una sola sección */}
                            {((subject.tasks || []).length > 0) ? (
                              <div>
                                <div className="flex items-center justify-between gap-3 mb-3">
                                  <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-base-content/50">
                                    <GraduationCap size={16} />
                                    Tareas y exámenes
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  {(subject.tasks || []).map((task, taskIndex) => (
                                    <div key={task._id} className="flex items-stretch gap-3 rounded-2xl border border-base-200 bg-base-100 shadow-sm transition-all hover:shadow-md">
                                      <Link
                                        href={`/mycourses/${courseId}/tasks/${task._id}`}
                                        className="flex min-w-0 flex-1 items-center gap-4 px-4 py-3"
                                        aria-label={`Ver ${task.type === "quiz" ? "examen" : "tarea"}: ${task.title}`}
                                      >
                                        <div className="p-2.5 rounded-full flex-shrink-0 bg-primary/10 text-primary border border-primary/20 shadow-sm">
                                          <ClipboardList size={18} aria-hidden="true" />
                                        </div>

                                        <div className="flex min-w-0 flex-1 flex-col">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-base-200 text-base-content/70 border border-base-300 shadow-sm">{task.type === "quiz" ? "Examen" : "Tarea"}</span>
                                            <p className="font-bold text-base text-base-content/90 truncate">{task.title}</p>
                                          </div>
                                          <p className="text-sm text-base-content/55 mt-1 break-words break-all max-w-full">{truncateText(task.description, 140)}</p>
                                        </div>
                                      </Link>

                                      {canEdit && (
                                        <div className="flex items-center gap-2 pr-2 self-center">
                                          {task.isSubmitted && (
                                            <div className="flex items-center justify-center mr-1">
                                              <CheckCircle2 size={18} className="text-success flex-shrink-0" />
                                            </div>
                                          )}

                                          {task.dueDate && !task.isSubmitted && (
                                            <div className="flex items-center gap-1.5 text-xs text-base-content/60 mr-1 whitespace-nowrap">
                                              <Calendar size={14} className="text-primary" aria-hidden="true" />
                                              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                                            </div>
                                          )}

                                          <div className="dropdown dropdown-end">
                                            {renderMenuButton()}
                                            <ul tabIndex={0} className="dropdown-content z-[10] menu p-2 shadow bg-base-100 rounded-box w-56 border border-base-200">
                                              <li><button type="button" onClick={() => router.push(`/mycourses/${courseId}/tasks/${task._id}/edit`)}><Pencil size={14} />Editar {task.type === "quiz" ? "examen" : "tarea"}</button></li>
                                              <li className="menu-title"><span>Reordenar</span></li>
                                              <li><button type="button" disabled={taskIndex === 0} onClick={() => handleMoveTask(subject._id, task._id, -1)}><ArrowUp size={14} />Subir</button></li>
                                              <li><button type="button" disabled={taskIndex === (subject.tasks || []).length - 1} onClick={() => handleMoveTask(subject._id, task._id, 1)}><ArrowDown size={14} />Bajar</button></li>
                                              <li className="mt-1"><button type="button" className="text-error" onClick={() => requestDelete({ kind: "task", id: task._id, title: task.title, subjectId: subject._id })}><Trash2 size={14} />Eliminar {task.type === "quiz" ? "examen" : "tarea"}</button></li>
                                            </ul>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="rounded-2xl border border-dashed border-base-300 p-4 text-sm text-base-content/50">Todavía no hay tareas en esta materia.</div>
                            )}
                          </div>
                        );
                      })()
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {canEdit && editor && (
        <>
          {editor.kind === "subject" && (
            <CourseSubjectModal
              id="course-structure-editor"
              dialogRef={editorDialogRef}
              mode={editor.mode}
              titleValue={title}
              setTitleValue={setTitle}
              descriptionValue={description}
              setDescriptionValue={setDescription}
              onClose={closeEditor}
              onConfirm={handleEditorSubmit}
              isLoading={isSubmitting}
              error={errorMessage}
            />
          )}

          {editor.kind === "unit" && (
            <CourseUnitModal
              id="course-structure-editor"
              dialogRef={editorDialogRef}
              mode={editor.mode}
              titleValue={title}
              setTitleValue={setTitle}
              contentValue={content}
              setContentValue={setContent}
              onClose={closeEditor}
              onConfirm={handleEditorSubmit}
              isLoading={isSubmitting}
              error={errorMessage}
            />
          )}

          {editor.kind === "resource" && (
            <CourseResourceModal
              id="course-structure-editor"
              dialogRef={editorDialogRef}
              mode={editor.mode}
              titleValue={title}
              setTitleValue={setTitle}
              resourceType={resourceType as 'link' | 'file' | 'text'}
              setResourceType={setResourceType}
              resourceUrl={resourceUrl}
              setResourceUrl={setResourceUrl}
              descriptionValue={description}
              setDescriptionValue={setDescription}
              onClose={closeEditor}
              onConfirm={handleEditorSubmit}
              isLoading={isSubmitting}
              error={errorMessage}
            />
          )}

          {editor.kind === "task" && (
            <CourseTaskModal
              id="course-structure-editor"
              dialogRef={editorDialogRef}
              mode={editor.mode}
              taskType={editor.taskType || 'assignment'}
              titleValue={title}
              setTitleValue={setTitle}
              descriptionValue={description}
              setDescriptionValue={setDescription}
              maxPoints={maxPoints}
              setMaxPoints={setMaxPoints}
              dueDate={dueDate}
              setDueDate={setDueDate}
              active={active}
              setActive={setActive}
              onClose={closeEditor}
              onConfirm={handleEditorSubmit}
              isLoading={isSubmitting}
              error={errorMessage}
            />
          )}
        </>
      )}

      {canEdit && deleteTarget && (
        <CourseStructureDeleteModal
          title={deleteTarget.title}
          kind={deleteTarget.kind}
          onClose={() => {
            setDeleteTarget(null);
            setErrorMessage(null);
          }}
          onConfirm={confirmDelete}
          isLoading={isSubmitting}
          error={errorMessage}
        />
      )}
    </div>
  );
}

function ClipboardTaskIcon() {
  return <GraduationCap size={14} />;
}
