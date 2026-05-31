/* Archivo: src\components\ui\profile\TeacherProfileView.tsx
  Descripción: Vista del perfil docente con información y controles específicos. */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { deleteParticipant, getCourseSubmissions, saveStudentTaskGrade } from '@/app/actions/participantActions';
import { Trash2, GraduationCap, Save, AlertTriangle, Check } from 'lucide-react';

interface Task {
  _id: string;
  title: string;
  maxPoints: number;
}

interface Submission {
  taskId: string;
  grade?: number;
  feedback?: string;
}

interface TeacherProfileViewProps {
  student: {
    _id: string;
    firstName: string;
    email: string;
    profile?: {
      lastName?: string;
      profilePicture?: string;
      bio?: string;
    };
  };
  courseId?: string;
}

export default function TeacherProfileView({ student, courseId }: TeacherProfileViewProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, Submission>>({});
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [gradesState, setGradesState] = useState<Record<string, { grade: string; feedback: string }>>({});

  // Cargar tareas y entregas si hay un curso asociado
  useEffect(() => {
    if (!courseId) return;

    const loadGradesData = async () => {
      setLoading(true);
      try {
        const res = await getCourseSubmissions(courseId);
        if (res.success) {
          setTasks(res.tasks);
          
          // Filtrar entregas del estudiante específico
          const studentSubs: Record<string, Submission> = {};
          const state: Record<string, { grade: string; feedback: string }> = {};
          
          res.submissions.forEach((sub: any) => {
            if (sub.studentId === student._id) {
              studentSubs[sub.taskId] = {
                taskId: sub.taskId,
                grade: sub.grade,
                feedback: sub.feedback,
              };
              state[sub.taskId] = {
                grade: sub.grade !== undefined ? String(sub.grade) : '',
                feedback: sub.feedback || '',
              };
            }
          });

          // Inicializar entradas vacías para tareas que no tengan entregas aún
          res.tasks.forEach((t: Task) => {
            if (!state[t._id]) {
              state[t._id] = { grade: '', feedback: '' };
            }
          });

          setSubmissions(studentSubs);
          setGradesState(state);
        }
      } catch (err) {
        console.error('Error al cargar calificaciones:', err);
      } finally {
        setLoading(false);
      }
    };

    loadGradesData();
  }, [courseId, student._id]);

  const handleGradeChange = (taskId: string, field: 'grade' | 'feedback', value: string) => {
    if (field === 'grade') {
      // Validar formato decimal
      if (value !== '' && !/^\d*\.?\d{0,2}$/.test(value)) return;
      const num = parseFloat(value);
      if (value !== '' && (isNaN(num) || num < 0 || num > 10)) return;
    }

    setGradesState((prev) => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        [field]: value,
      },
    }));
  };

  const handleSaveGrade = async (taskId: string) => {
    const state = gradesState[taskId];
    if (!state) return;

    const gradeVal = state.grade === '' ? 0 : parseFloat(state.grade);
    if (isNaN(gradeVal) || gradeVal < 0 || gradeVal > 10) {
      alert('La calificación debe estar entre 0 y 10');
      return;
    }

    setSavingId(taskId);
    try {
      const res = await saveStudentTaskGrade(taskId, student._id, gradeVal, state.feedback);
      if (res.success) {
        setMessage({ type: 'success', text: 'Calificación guardada correctamente' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: res.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al guardar la calificación' });
    } finally {
      setSavingId(null);
    }
  };

  const handleRemoveFromCourse = async () => {
    if (!courseId) return;
    const confirmed = window.confirm(
      `¿Estás seguro de que deseas eliminar a ${student.firstName} de este curso?`
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await deleteParticipant(courseId, student._id);
      if (res.success) {
        alert('Estudiante eliminado del curso correctamente.');
        router.push(`/mycourses/${courseId}`);
      } else {
        alert(`Error: ${res.message}`);
      }
    } catch (err) {
      alert('Error al intentar eliminar al estudiante.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl space-y-6 mt-6">
      {/* Panel de control del Profesor */}
      <div className="card bg-base-100 border-2 border-primary/20 shadow-md">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <h2 className="card-title text-primary flex items-center gap-2">
              <GraduationCap /> Panel de Gestión del Estudiante
            </h2>
            {courseId && (
              <button
                onClick={handleRemoveFromCourse}
                disabled={loading}
                className="btn btn-error btn-sm gap-2"
              >
                <Trash2 size={16} />
                Quitar del Curso
              </button>
            )}
          </div>
          
          <p className="text-sm text-base-content/70 mt-1">
            Como profesor del curso, puedes gestionar las calificaciones del estudiante de forma directa.
          </p>

          {message && (
            <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'} mt-4`}>
              {message.type === 'success' ? <Check size={18} /> : <AlertTriangle size={18} />}
              <span>{message.text}</span>
            </div>
          )}

          {courseId && tasks.length > 0 && (
            <div className="mt-6 space-y-4">
              <h3 className="font-bold text-base-content/80 text-sm uppercase tracking-wider">
                Calificaciones de Tareas (Reales)
              </h3>
              
              <div className="overflow-x-auto rounded-lg border border-base-300">
                <table className="table w-full text-sm">
                  <thead className="bg-base-200">
                    <tr>
                      <th>Tarea</th>
                      <th className="w-24 text-center">Nota / 10</th>
                      <th>Feedback</th>
                      <th className="w-16 text-center"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task) => {
                      const state = gradesState[task._id] || { grade: '', feedback: '' };
                      return (
                        <tr key={task._id} className="hover:bg-base-200/50">
                          <td className="font-medium">{task.title}</td>
                          <td>
                            <input
                              type="text"
                              value={state.grade}
                              onChange={(e) => handleGradeChange(task._id, 'grade', e.target.value)}
                              className="input input-bordered input-sm w-16 text-center font-mono font-bold"
                              placeholder="—"
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={state.feedback}
                              onChange={(e) => handleGradeChange(task._id, 'feedback', e.target.value)}
                              className="input input-bordered input-sm w-full"
                              placeholder="Añadir feedback..."
                            />
                          </td>
                          <td className="text-center">
                            <button
                              onClick={() => handleSaveGrade(task._id)}
                              disabled={savingId === task._id}
                              className="btn btn-ghost btn-sm btn-circle text-primary"
                              title="Guardar calificación"
                            >
                              <Save size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
