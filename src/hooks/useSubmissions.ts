'use client';

import { useEffect, useState } from 'react';
import { getCourseSubmissions } from '@/app/actions/participantActions';

interface Submission {
  _id: string;
  taskId: string;
  studentId: string;
  grade?: number;
  feedback?: string;
  submissionStatus: string;
  gradedAt?: string;
}

export function useSubmissions(courseId: string) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSubmissions = async () => {
      setLoading(true);
      try {
        const res = await getCourseSubmissions(courseId);
        if (res.success) {
          setSubmissions(res.submissions);
        }
      } catch (error) {
        console.error('[useSubmissions] Error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSubmissions();
  }, [courseId]);

  const reload = async () => {
    setLoading(true);
    try {
      const res = await getCourseSubmissions(courseId);
      if (res.success) setSubmissions(res.submissions);
    } catch (error) {
      console.error('[useSubmissions] Error reloading:', error);
    } finally {
      setLoading(false);
    }
  };

  return { submissions, setSubmissions, loading, reload };
}
