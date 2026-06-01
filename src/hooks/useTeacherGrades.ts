'use client';

import { useState } from 'react';
import { getCourseSubmissions } from '@/app/actions/participantActions';

interface Participant {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  rol: string;
  avatar: string;
}

export function useTeacherGrades(courseId: string, participants: Participant[], initialSubmissions: any[] = []) {
  const [selectedStudent, setSelectedStudent] = useState<Participant | null>(null);
  const [submissions, setSubmissions] = useState<any[]>(initialSubmissions);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const res = await getCourseSubmissions(courseId);
      if (res.success) {
        setSubmissions(res.submissions);
        setTasks(res.tasks);
      }
    } catch (error) {
      console.error('Error loading submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const visibleStudents = participants.filter(p => p.rol === 'estudiante');

  const getStudentAverage = (studentId: string) => {
    const studentSubs = submissions.filter(
      (s: any) => String(s.studentId) === String(studentId) && s.grade !== undefined
    );
    if (studentSubs.length === 0) return '—';
    const sum = studentSubs.reduce((acc: number, curr: any) => acc + curr.grade, 0);
    return (sum / studentSubs.length).toFixed(1);
  };

  return {
    selectedStudent,
    setSelectedStudent,
    submissions,
    tasks,
    loading,
    visibleStudents,
    loadSubmissions,
    getStudentAverage,
  };
}
