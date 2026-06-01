/* Archivo: src\components\ui\tasks\TaskCreationForm.tsx
  Descripción: Formulario reutilizable para crear o editar una tarea (campos y validación). */

"use client";
// Formulario de creación/edición de tareas (cliente)
import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertTriangle, BarChart3, BookOpen, Calendar, Check, ClipboardCheck, FileText, Search, SlidersHorizontal, Users, ChevronDown } from "lucide-react";
import { createTaskFromFormData, updateTaskFromFormData, type TaskCreationFormState } from "@/app/actions/taskActions";
import type { TaskCreationStudent, TaskCreationUnit } from "@/lib/task-assignment";
import DateTimePicker from "@/components/ui/DateTimePicker";

type TaskFormMode = "create" | "edit";

interface TaskCreationFormInitialTask {
  taskId?: string;
  title?: string;
  description?: string;
  instructions?: string;
  dueDate?: string;
  startDate?: string;
  unitId?: string;
  type?: "assignment" | "quiz" | "forum" | "project";
  maxPoints?: number;
  allowLateSubmission?: boolean;
  active?: boolean;
  priority?: "low" | "medium" | "high";
  isOptional?: boolean;
  countsTowardAverage?: boolean;
  assignmentMode?: "all" | "manual" | "filtered";
  assignmentFilterKind?: "failing_average" | "below_threshold" | "failed_task";
  assignmentThreshold?: number;
  assignedStudentIds?: string[];
}
interface TaskCreationFormProps {
  mode?: TaskFormMode;
  backHref?: string;
  backLabel?: string;
  courseId: string;
  courseTitle: string;
  courseDescription?: string;
  units: TaskCreationUnit[];
  students: TaskCreationStudent[];
  initialUnitId: string;
  selectedUnitTitle: string;
  initialTask?: TaskCreationFormInitialTask;
}

const initialState: TaskCreationFormState = {
  success: false,
  message: "",
};

function getAvatarUrl(student: TaskCreationStudent) {
  return student.profilePicture || `https://robohash.org/${student._id}?set=set5`;
}

function toDateTimeLocal(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}

export default function TaskCreationForm({
  mode = "create",
  backHref,
  backLabel,
  courseId,
  courseTitle,
  courseDescription,
  units,
  students,
  initialUnitId,
  selectedUnitTitle,
  initialTask,
}: TaskCreationFormProps) {
  const router = useRouter();
  const actionHandler = mode === "edit" ? updateTaskFromFormData : createTaskFromFormData;
  const [state, formAction, isPending] = useActionState(actionHandler, initialState);

  const [title, setTitle] = useState(initialTask?.title || "");
  const [description, setDescription] = useState(initialTask?.description || "");
  const [instructions, setInstructions] = useState(initialTask?.instructions || "");
  const [dueDate, setDueDate] = useState(toDateTimeLocal(initialTask?.dueDate));
  const [unitId, setUnitId] = useState(initialTask?.unitId || initialUnitId);
  const [isOptional, setIsOptional] = useState(initialTask?.isOptional ?? false);
  const [countsTowardAverage, setCountsTowardAverage] = useState(initialTask?.countsTowardAverage ?? true);
  const [allowLateSubmission, setAllowLateSubmission] = useState(initialTask?.allowLateSubmission ?? false);
  const [assignmentMode, setAssignmentMode] = useState<"all" | "manual" | "filtered">(initialTask?.assignmentMode || "manual");
  const [assignmentFilterKind, setAssignmentFilterKind] = useState<"failing_average" | "below_threshold" | "failed_task">(initialTask?.assignmentFilterKind || "failing_average");
  const [assignmentThreshold, setAssignmentThreshold] = useState(initialTask?.assignmentThreshold ?? 5);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(initialTask?.assignedStudentIds || []);
  const [search, setSearch] = useState("");
  const [maxPoints, setMaxPoints] = useState(String(initialTask?.maxPoints ?? 10));
  const [taskType] = useState<"assignment" | "quiz" | "forum" | "project">(initialTask?.type || "assignment");

  const activeUnitTitle = useMemo(() => {
    return units.find((unit) => unit._id === unitId)?.title || selectedUnitTitle || courseTitle;
  }, [courseTitle, selectedUnitTitle, unitId, units]);

  useEffect(() => {
    if (state.success && state.redirectTo) {
      router.push(state.redirectTo);
    }
  }, [state.redirectTo, state.success, router]);

  const visibleStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    const source = query
      ? students.filter((student) => `${student.firstName} ${student.email}`.toLowerCase().includes(query))
      : students;

    if (assignmentMode !== "filtered") {
      return source;
    }

    if (assignmentFilterKind === "failing_average") {
      return source.filter((student) => student.averageGrade !== null && student.averageGrade < 5);
    }

    if (assignmentFilterKind === "below_threshold") {
      return source.filter((student) => student.averageGrade !== null && student.averageGrade < assignmentThreshold);
    }

    return source.filter((student) => student.hasFailedTask);
  }, [assignmentFilterKind, assignmentMode, assignmentThreshold, search, students]);

  const previewCount = assignmentMode === "all"
    ? students.length
    : assignmentMode === "manual"
      ? selectedStudentIds.length
      : visibleStudents.length;

  const toggleStudent = (studentId: string) => {
    setSelectedStudentIds((current) => (
      current.includes(studentId)
        ? current.filter((id) => id !== studentId)
        : [...current, studentId]
    ));
  };

  const selectVisibleStudents = () => setSelectedStudentIds(visibleStudents.map((student) => student._id));
  const clearSelection = () => setSelectedStudentIds([]);

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-base-200/40">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button type="button" onClick={() => router.push(backHref || `/mycourses/${courseId}`)} className="btn btn-ghost btn-sm gap-2">
            <ArrowLeft size={16} />
            {backLabel || "Volver al curso"}
          </button>
        </div>

        <section className="card border border-base-300 bg-base-100 shadow-xl overflow-hidden">
          <div className="px-6 pt-7 pb-8 sm:px-8">
            <div className="space-y-5">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="badge badge-warning gap-1.5 font-semibold">
                    <BookOpen size={12} />
                    Profesor
                  </span>
                  <span className="badge badge-ghost gap-1.5 font-medium">
                    <ClipboardCheck size={12} />
                    {mode === "edit" ? "Edición de tarea" : "Creación de tarea"}
                  </span>
                  <span className="badge badge-outline badge-primary gap-1.5 font-medium">
                    <BookOpen size={12} />
                    {selectedUnitTitle || "Sin unidad asignada"}
                  </span>
                </div>

                <h1 className="w-full text-3xl font-bold text-base-content sm:text-4xl">
                  {mode === "edit" ? "Editar tarea en" : "Nueva tarea en"} {activeUnitTitle}
                </h1>
                <p className="w-full text-base-content/70">
                  {mode === "edit"
                    ? "Ajusta el enunciado, la fecha, la asignación y los parámetros de evaluación."
                    : "Define la entrega, el enunciado, los criterios de asignación y los ajustes de evaluación."}
                </p>
                {courseDescription ? <p className="w-full text-sm text-base-content/50">{courseDescription}</p> : null}
              </div>

              <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-3">
                <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-primary/10 p-2 text-primary">
                      <BookOpen size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-base-content/50">Curso</p>
                      <p className="text-sm font-semibold text-base-content">{courseTitle}</p>
                    </div>
                  </div>
                </div>
                <div className={`dropdown w-full ${isPending ? 'pointer-events-none opacity-50' : ''}`}>
                  <div tabIndex={0} role="button" className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm w-full text-left flex items-center justify-between hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-secondary/10 p-2 text-secondary-content">
                        <BookOpen size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-base-content/50">Unidad</p>
                        <p className="text-sm font-semibold text-base-content">{selectedUnitTitle || "Selecciona una unidad"}</p>
                      </div>
                    </div>
                    <ChevronDown size={16} className="text-base-content/40" />
                  </div>
                  <ul tabIndex={0} className="dropdown-content z-[10] menu p-2 shadow-xl bg-base-100 rounded-box w-full mt-2 border border-base-300 max-h-60 overflow-y-auto flex-nowrap">
                    {units.map((unit) => (
                      <li key={unit._id}>
                        <button 
                          type="button" 
                          onClick={(e) => {
                            e.preventDefault();
                            setUnitId(unit._id);
                            if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
                          }} 
                          className={unitId === unit._id ? "active font-bold" : ""}
                        >
                          {unit.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-success/10 p-2 text-success">
                      <Check size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-base-content/50">Estado</p>
                      <p className="text-sm font-semibold text-success">Borrador funcional</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <form action={formAction} className="grid gap-6 px-4 py-6 lg:px-8 lg:py-8">
            <input type="hidden" name="taskId" value={initialTask?.taskId || ""} />
            <input type="hidden" name="courseId" value={courseId} />
            <input type="hidden" name="unitId" value={unitId} />
            <input type="hidden" name="assignmentMode" value={assignmentMode} />
            <input type="hidden" name="assignmentFilterKind" value={assignmentMode === "filtered" ? assignmentFilterKind : ""} />
            <input type="hidden" name="assignmentThreshold" value={assignmentMode === "filtered" ? String(assignmentThreshold) : ""} />
            <input type="hidden" name="assignedStudentIds" value={JSON.stringify(selectedStudentIds)} />
            <input type="hidden" name="startDate" value={initialTask?.startDate || new Date().toISOString()} />
            <input type="hidden" name="type" value={taskType} />
            <input type="hidden" name="maxPoints" value={maxPoints} />
            <input type="hidden" name="allowLateSubmission" value={String(allowLateSubmission)} />
            <input type="hidden" name="priority" value={initialTask?.priority || "medium"} />
            <input type="hidden" name="countsTowardAverage" value={String(countsTowardAverage)} />
            <input type="hidden" name="isOptional" value={String(isOptional)} />

            <section className="card border border-base-300 bg-base-100 shadow-sm">
              <div className="card-body gap-5 p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-base-content">Datos de la tarea</h2>
                    <p className="text-sm text-base-content/60">Título, contexto y descripción breve.</p>
                  </div>
                </div>

                <div className="grid gap-4">
                  <label className="form-control gap-2">
                    <span className="label-text font-semibold text-base-content/80">Título</span>
                    <input name="title" type="text" value={title} onChange={(event) => setTitle(event.target.value)} className="input input-bordered w-full border-base-300 bg-base-100 focus:border-warning focus:outline-none" placeholder="Ej: Informe de diseño accesible" required />
                  </label>

                  <label className="form-control gap-2">
                    <span className="label-text font-semibold text-base-content/80">Descripción</span>
                    <textarea name="description" value={description} onChange={(event) => setDescription(event.target.value)} className="textarea textarea-bordered min-h-32 w-full resize-none border-base-300 bg-base-100 focus:border-warning focus:outline-none" placeholder="Resumen de la actividad, objetivos y contexto general." required />
                  </label>

                  <label className="form-control gap-2">
                    <span className="label-text font-semibold text-base-content/80">Instrucciones de la tarea</span>
                    <textarea name="instructions" value={instructions} onChange={(event) => setInstructions(event.target.value)} className="textarea textarea-bordered min-h-48 w-full resize-none border-base-300 bg-base-100 focus:border-warning focus:outline-none" placeholder="Paso a paso, entregables, criterios y cualquier condición especial." required />
                  </label>
                </div>
              </div>
            </section>

            <section className="card border border-base-300 bg-base-100 shadow-sm">
              <div className="card-body gap-5 p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-secondary/10 p-3 text-secondary-content">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-base-content">Ajustes de entrega</h2>
                    <p className="text-sm text-base-content/60">Fecha límite y visibilidad de la actividad.</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="form-control gap-2">
                    <span className="label-text font-semibold text-base-content/80">Fecha de entrega</span>
                    <input type="hidden" name="dueDate" value={dueDate} />
                    <DateTimePicker value={dueDate} onChange={setDueDate} placeholder="Selecciona fecha y hora de entrega" />
                  </label>

                  <div className="form-control gap-2">
                    <span className="label-text font-semibold text-base-content/80">Disponibilidad</span>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className={`group flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 transition-all ${!isOptional ? "border-primary bg-primary/5" : "border-base-300 bg-base-100 hover:border-base-content/20"}`}>
                        <input type="radio" name="scope" className="sr-only" checked={!isOptional} onChange={() => setIsOptional(false)} />
                        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${!isOptional ? "border-primary" : "border-base-300 group-hover:border-base-content/30"}`}>
                          <span className={`h-2.5 w-2.5 rounded-full bg-primary transition-transform ${!isOptional ? "scale-100" : "scale-0"}`} />
                        </span>
                        <div>
                          <p className="font-semibold text-base-content">Tarea requerida</p>
                          <p className="text-xs text-base-content/60">Visible para todo el grupo.</p>
                        </div>
                      </label>
                      <label className={`group flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 transition-all ${isOptional ? "border-primary bg-primary/5" : "border-base-300 bg-base-100 hover:border-base-content/20"}`}>
                        <input type="radio" name="scope" className="sr-only" checked={isOptional} onChange={() => setIsOptional(true)} />
                        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${isOptional ? "border-primary" : "border-base-300 group-hover:border-base-content/30"}`}>
                          <span className={`h-2.5 w-2.5 rounded-full bg-primary transition-transform ${isOptional ? "scale-100" : "scale-0"}`} />
                        </span>
                        <div>
                          <p className="font-semibold text-base-content">Tarea opcional</p>
                          <p className="text-xs text-base-content/60">Trabajo extra o ampliación.</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className={`group flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-all ${countsTowardAverage ? "border-primary bg-primary/5" : "border-base-300 bg-base-100 hover:border-base-content/20"}`}>
                    <input type="checkbox" className="sr-only" checked={countsTowardAverage} onChange={(event) => setCountsTowardAverage(event.target.checked)} />
                    <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all ${countsTowardAverage ? "border-primary bg-primary" : "border-base-300 group-hover:border-base-content/30"}`}>
                      <Check size={14} strokeWidth={3} className={`text-primary-content transition-transform ${countsTowardAverage ? "scale-100" : "scale-0"}`} />
                    </span>
                    <div>
                      <p className="font-semibold text-base-content">Cuenta para la media</p>
                      <p className="text-sm text-base-content/60">Incluye la tarea en el cálculo final de la evaluación.</p>
                    </div>
                  </label>

                  <label className={`group flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-all ${allowLateSubmission ? "border-primary bg-primary/5" : "border-base-300 bg-base-100 hover:border-base-content/20"}`}>
                    <input type="checkbox" className="sr-only" checked={allowLateSubmission} onChange={(event) => setAllowLateSubmission(event.target.checked)} />
                    <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all ${allowLateSubmission ? "border-primary bg-primary" : "border-base-300 group-hover:border-base-content/30"}`}>
                      <Check size={14} strokeWidth={3} className={`text-primary-content transition-transform ${allowLateSubmission ? "scale-100" : "scale-0"}`} />
                    </span>
                    <div>
                      <p className="font-semibold text-base-content">Permitir entrega tardía</p>
                      <p className="text-sm text-base-content/60">Mantiene visible la tarea aunque cierre el plazo.</p>
                    </div>
                  </label>
                </div>
              </div>
            </section>

            <section className="card border border-base-300 bg-base-100 shadow-sm">
              <div className="card-body gap-5 p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                    <Users size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-base-content">Asignación</h2>
                    <p className="text-sm text-base-content/60">Selecciona a quién se le asigna la tarea y aplica filtros reales del curso.</p>
                  </div>
                </div>

                <div className="grid w-full gap-4">
                  <div className="w-full space-y-4">
                    <div className="grid w-full gap-3 md:grid-cols-3">
                      <label className={`group flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-all ${assignmentMode === "all" ? "border-primary bg-primary/5" : "border-base-300 bg-base-100 hover:border-base-content/20"}`}>
                        <input type="radio" name="assignmentModeView" className="sr-only" checked={assignmentMode === "all"} onChange={() => setAssignmentMode("all")} />
                        <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${assignmentMode === "all" ? "border-primary" : "border-base-300 group-hover:border-base-content/30"}`}>
                          <span className={`h-2.5 w-2.5 rounded-full bg-primary transition-transform ${assignmentMode === "all" ? "scale-100" : "scale-0"}`} />
                        </span>
                        <div>
                          <p className="font-semibold text-base-content">Todo el curso</p>
                          <p className="text-sm text-base-content/60">Asigna la tarea a todos los alumnos matriculados.</p>
                        </div>
                      </label>
                      <label className={`group flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-all ${assignmentMode === "manual" ? "border-primary bg-primary/5" : "border-base-300 bg-base-100 hover:border-base-content/20"}`}>
                        <input type="radio" name="assignmentModeView" className="sr-only" checked={assignmentMode === "manual"} onChange={() => setAssignmentMode("manual")} />
                        <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${assignmentMode === "manual" ? "border-primary" : "border-base-300 group-hover:border-base-content/30"}`}>
                          <span className={`h-2.5 w-2.5 rounded-full bg-primary transition-transform ${assignmentMode === "manual" ? "scale-100" : "scale-0"}`} />
                        </span>
                        <div>
                          <p className="font-semibold text-base-content">Libre elección</p>
                          <p className="text-sm text-base-content/60">Selecciona manualmente a los alumnos.</p>
                        </div>
                      </label>
                      <label className={`group flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-all ${assignmentMode === "filtered" ? "border-primary bg-primary/5" : "border-base-300 bg-base-100 hover:border-base-content/20"}`}>
                        <input type="radio" name="assignmentModeView" className="sr-only" checked={assignmentMode === "filtered"} onChange={() => setAssignmentMode("filtered")} />
                        <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${assignmentMode === "filtered" ? "border-primary" : "border-base-300 group-hover:border-base-content/30"}`}>
                          <span className={`h-2.5 w-2.5 rounded-full bg-primary transition-transform ${assignmentMode === "filtered" ? "scale-100" : "scale-0"}`} />
                        </span>
                        <div>
                          <p className="font-semibold text-base-content">Por filtro</p>
                          <p className="text-sm text-base-content/60">Aplica filtros automáticos de rendimiento.</p>
                        </div>
                      </label>
                    </div>

                    {assignmentMode !== "all" && (
                      <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
                        <label className="input input-bordered flex w-full items-center gap-2 border-base-300 bg-base-100 focus-within:border-warning focus-within:outline-none">
                          <Search size={16} className="text-base-content/40" />
                          <input type="text" className="w-full bg-transparent outline-none" placeholder="Buscar alumno por nombre o email" value={search} onChange={(event) => setSearch(event.target.value)} />
                        </label>
                        {assignmentMode === "manual" ? (
                          <div className="flex w-full gap-2 sm:w-auto sm:flex-none sm:justify-end">
                            <button type="button" className="btn btn-warning flex-1 gap-2 whitespace-nowrap sm:flex-none" onClick={selectVisibleStudents}>
                              <ClipboardCheck size={16} />
                              Seleccionar visibles
                            </button>
                            <button type="button" className="btn btn-error btn-outline flex-1 gap-2 whitespace-nowrap sm:flex-none" onClick={clearSelection}>
                              Limpiar
                            </button>
                          </div>
                        ) : null}
                      </div>
                    )}

                    {assignmentMode === "manual" && (
                      <div className="w-full rounded-2xl border border-base-300 bg-base-200/20 p-3">
                        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-base-content">
                          <Users size={16} className="text-primary" />
                          Alumnos del curso
                        </div>
                        <div className="grid gap-3">
                          {visibleStudents.map((student) => {
                            const isChecked = selectedStudentIds.includes(student._id);
                            return (
                            <label key={student._id} className={`group flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 transition-all ${isChecked ? "border-primary bg-primary/5" : "border-base-300 bg-base-100 hover:border-base-content/20"}`}>
                              <input type="checkbox" className="sr-only" checked={isChecked} onChange={() => toggleStudent(student._id)} />
                              <div className="relative">
                                <div className={`avatar transition-opacity ${isChecked ? "opacity-100" : ""}`}>
                                  <div className={`w-10 rounded-full bg-base-200 ring-2 ring-offset-2 ring-offset-base-100 transition-all ${isChecked ? "ring-primary" : "ring-transparent"}`}>
                                    <img src={getAvatarUrl(student)} alt={`Avatar de ${student.firstName}`} />
                                  </div>
                                </div>
                                {isChecked && (
                                  <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary ring-2 ring-base-100">
                                    <Check size={12} strokeWidth={3} className="text-primary-content" />
                                  </span>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="truncate font-semibold text-base-content">{student.firstName}</p>
                                  <span className="badge badge-ghost badge-sm">{student.averageGrade !== null ? `Media ${student.averageGrade}` : "Sin notas"}</span>
                                </div>
                                <p className="text-xs text-base-content/60">{student.email}</p>
                              </div>
                            </label>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {assignmentMode === "filtered" && (
                      <div className="w-full rounded-2xl border border-base-300 bg-base-200/20 p-4">
                        <div className="mb-3 flex items-center gap-2">
                          <SlidersHorizontal size={16} className="text-secondary-content" />
                          <p className="text-sm font-semibold text-base-content">Filtros básicos</p>
                        </div>

                        <div className="space-y-3">
                          <label className={`group flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-all ${assignmentFilterKind === "failing_average" ? "border-primary bg-primary/5" : "border-base-300 bg-base-100 hover:border-base-content/20"}`}>
                            <input type="radio" name="assignmentFilter" className="sr-only" checked={assignmentFilterKind === "failing_average"} onChange={() => setAssignmentFilterKind("failing_average")} />
                            <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${assignmentFilterKind === "failing_average" ? "border-primary" : "border-base-300 group-hover:border-base-content/30"}`}>
                              <span className={`h-2.5 w-2.5 rounded-full bg-primary transition-transform ${assignmentFilterKind === "failing_average" ? "scale-100" : "scale-0"}`} />
                            </span>
                            <div>
                              <p className="font-semibold text-base-content">Miembros que han suspendido</p>
                              <p className="text-sm text-base-content/60">Promedio inferior a 5 sobre 10.</p>
                            </div>
                          </label>

                          <label className={`group flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-all ${assignmentFilterKind === "below_threshold" ? "border-primary bg-primary/5" : "border-base-300 bg-base-100 hover:border-base-content/20"}`}>
                            <input type="radio" name="assignmentFilter" className="sr-only" checked={assignmentFilterKind === "below_threshold"} onChange={() => setAssignmentFilterKind("below_threshold")} />
                            <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${assignmentFilterKind === "below_threshold" ? "border-primary" : "border-base-300 group-hover:border-base-content/30"}`}>
                              <span className={`h-2.5 w-2.5 rounded-full bg-primary transition-transform ${assignmentFilterKind === "below_threshold" ? "scale-100" : "scale-0"}`} />
                            </span>
                            <div className="space-y-2">
                              <div>
                                <p className="font-semibold text-base-content">Miembros por debajo de X nota</p>
                                <p className="text-sm text-base-content/60">Filtra por umbral de media.</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <input type="number" min="0" max="10" step="0.1" value={assignmentThreshold} onChange={(event) => setAssignmentThreshold(Number(event.target.value))} className="input input-bordered input-sm w-24 border-base-300 bg-base-100 focus:border-warning focus:outline-none" />
                                <span className="text-sm text-base-content/60">nota media</span>
                              </div>
                            </div>
                          </label>

                          <label className={`group flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-all ${assignmentFilterKind === "failed_task" ? "border-primary bg-primary/5" : "border-base-300 bg-base-100 hover:border-base-content/20"}`}>
                            <input type="radio" name="assignmentFilter" className="sr-only" checked={assignmentFilterKind === "failed_task"} onChange={() => setAssignmentFilterKind("failed_task")} />
                            <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${assignmentFilterKind === "failed_task" ? "border-primary" : "border-base-300 group-hover:border-base-content/30"}`}>
                              <span className={`h-2.5 w-2.5 rounded-full bg-primary transition-transform ${assignmentFilterKind === "failed_task" ? "scale-100" : "scale-0"}`} />
                            </span>
                            <div>
                              <p className="font-semibold text-base-content">Miembros con alguna tarea suspensa</p>
                              <p className="text-sm text-base-content/60">Incluye alumnos con alguna entrega calificada por debajo del aprobado.</p>
                            </div>
                          </label>
                        </div>

                        <div className="mt-4 flex items-start gap-3 rounded-2xl bg-base-100 p-4">
                          <BarChart3 size={16} className="mt-0.5 text-success" />
                          <div className="text-sm text-base-content/70">
                            <p className="font-semibold text-base-content">Vista previa real</p>
                            <p>{visibleStudents.length} alumnos cumplen el filtro actual.</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {assignmentMode === "all" && (
                      <div className="w-full rounded-2xl border border-base-300 bg-base-200/20 p-4">
                        <div className="flex items-start gap-3 rounded-2xl bg-base-100 p-4">
                          <AlertTriangle size={16} className="mt-0.5 text-warning" />
                          <p className="text-sm text-base-content/70">
                            La tarea se asignará a todo el alumnado matriculado en el curso: {students.length} estudiantes.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </section>

            <section className="card border border-base-300 bg-base-100 shadow-sm">
              <div className="card-body gap-3 p-5">
                {state.message ? (
                  <div className={`rounded-2xl border p-4 text-sm ${state.success ? "border-success/30 bg-success/10 text-success" : "border-error/30 bg-error/10 text-error"}`}>
                    {state.message}
                  </div>
                ) : null}
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button type="submit" name="active" value="false" className="btn btn-outline flex-1 gap-2" disabled={isPending}>
                    {isPending ? "Guardando..." : mode === "edit" ? "Guardar cambios" : "Guardar borrador"}
                  </button>
                  <button type="submit" name="active" value="true" className="btn btn-primary flex-1 gap-2 shadow-lg" disabled={isPending}>
                    {isPending ? "Publicando..." : mode === "edit" ? "Actualizar y publicar" : "Publicar tarea"}
                  </button>
                </div>
                <p className="text-center text-xs text-base-content/50">
                  {mode === "edit"
                    ? "Los cambios se guardarán conservando la audiencia y la configuración de evaluación actualizada."
                    : "La tarea se creará con la audiencia calculada, las validaciones activas y la configuración de evaluación."}
                </p>
              </div>
            </section>
          </form>
        </section>
      </div>
    </main>
  );
}