'use client';

import { useEffect, useRef, useState } from 'react';
import { saveStudentTaskGrade } from '@/app/actions/participantActions';

type Task = { _id?: string; id?: string; title: string };
type Subject = { _id: string; title: string; tasks?: Task[] };
type Submission = { _id?: string; taskId: string; grade?: number | null; feedback?: string | null };

interface GradeEntry {
  grade: string;
  feedback: string;
  taskId: string;
}

interface StudentInfo {
  id: string;
  nombre: string;
  apellidos: string;
  avatar: string;
}

export function useStudentGrading(
  student: StudentInfo,
  subjects: Subject[],
  initialSubmissions: Submission[],
  onGradesSaved?: () => Promise<void>
) {
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>(
    Object.fromEntries(subjects.map(s => [s._id, true]))
  );
  const [gradesState, setGradesState] = useState<Record<string, GradeEntry>>({});
  const [originalGrades, setOriginalGrades] = useState<Record<string, GradeEntry>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedTaskForFeedback, setSelectedTaskForFeedback] = useState<{ stateKey: string; title: string } | null>(null);
  const feedbackModalRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const state: Record<string, GradeEntry> = {};
    const taskIdMap = new Map<string, string>();

    subjects.forEach((subj, subjIndex) => {
      (subj.tasks || []).forEach((task: Task, taskIndex: number) => {
        const uniqueKey = `${subjIndex}-${taskIndex}`;
        const taskId = String(task._id || '').trim();
        if (taskId) {
          state[uniqueKey] = { grade: '', feedback: '', taskId };
          taskIdMap.set(taskId, uniqueKey);
        }
      });
    });

    initialSubmissions.forEach((sub: any) => {
      const subTaskId = String(sub.taskId || '').trim();
      if (!subTaskId) return;
      const foundKey = taskIdMap.get(subTaskId);
      if (foundKey && state[foundKey]) {
        state[foundKey] = {
          ...state[foundKey],
          grade: sub.grade !== undefined && sub.grade !== null ? String(sub.grade) : '',
          feedback: sub.feedback ? String(sub.feedback).trim() : '',
        };
      }
    });

    setGradesState(state);
    setOriginalGrades(JSON.parse(JSON.stringify(state)));
  }, [initialSubmissions, subjects]);

  const toggleSubject = (id: string) => {
    setExpandedSubjects(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleFieldChange = (stateKey: string, field: 'grade' | 'feedback', value: string) => {
    if (field === 'grade') {
      if (value === '') {
        setGradesState(prev => ({
          ...prev,
          [stateKey]: { ...(prev[stateKey] || { grade: '', feedback: '', taskId: '' }), grade: '' },
        }));
        return;
      }
      if (!/^\d*\.?\d{0,2}$/.test(value)) return;
      const num = parseFloat(value);
      if (!isNaN(num) && (num < 0 || num > 10)) return;
    }

    setGradesState(prev => {
      const currentTask = prev[stateKey] || { grade: '', feedback: '', taskId: '' };
      return { ...prev, [stateKey]: { ...currentTask, [field]: value } };
    });
  };

  const handleOpenFeedbackModal = (stateKey: string, taskTitle: string) => {
    setSelectedTaskForFeedback({ stateKey, title: taskTitle });
    setFeedbackModalOpen(true);
  };

  const handleSaveFeedback = async (newGrade: string, newFeedback: string): Promise<boolean> => {
    if (!selectedTaskForFeedback) return false;
    try {
      if (newGrade !== '') {
        if (!/^\d*\.?\d{0,2}$/.test(newGrade)) return false;
        const num = parseFloat(newGrade);
        if (isNaN(num) || num < 0 || num > 10) return false;
      }
      setGradesState(prev => {
        const currentTask = prev[selectedTaskForFeedback.stateKey] || { grade: '', feedback: '', taskId: '' };
        return { ...prev, [selectedTaskForFeedback.stateKey]: { ...currentTask, grade: newGrade, feedback: newFeedback } };
      });
      setFeedbackModalOpen(false);
      setSelectedTaskForFeedback(null);
      return true;
    } catch {
      return false;
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    setSaveStatus('saving');
    try {
      const tasksToSave = Object.keys(gradesState).filter(stateKey => {
        const current = gradesState[stateKey];
        const original = originalGrades[stateKey] || { grade: '', feedback: '', taskId: '' };
        return current.grade !== original.grade || current.feedback !== original.feedback;
      });

      if (tasksToSave.length === 0) {
        setSaveStatus('idle');
        setIsSaving(false);
        return;
      }

      const promises = tasksToSave.map(async (stateKey) => {
        const current = gradesState[stateKey];
        const taskId = String(current.taskId || '').trim();
        if (!taskId) return { success: false, message: 'Error: taskId no encontrado' };

        let gradeVal = 0;
        if (current.grade) {
          gradeVal = parseFloat(current.grade);
          if (isNaN(gradeVal)) return { success: false, message: 'Calificación inválida' };
        }

        const feedback = (current.feedback || '').trim();
        return saveStudentTaskGrade(taskId, student.id, gradeVal, feedback);
      });

      const results = await Promise.all(promises);
      const hasError = results.some(r => !r.success);

      if (hasError) {
        setSaveStatus('error');
      } else {
        setOriginalGrades(JSON.parse(JSON.stringify(gradesState)));
        setSaveStatus('success');
        if (onGradesSaved) await onGradesSaved();
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    expandedSubjects,
    toggleSubject,
    gradesState,
    handleFieldChange,
    isSaving,
    saveStatus,
    feedbackModalOpen,
    setFeedbackModalOpen,
    selectedTaskForFeedback,
    feedbackModalRef,
    handleOpenFeedbackModal,
    handleSaveFeedback,
    handleSaveAll,
  };
}
