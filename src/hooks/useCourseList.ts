'use client';

import { useEffect, useState } from 'react';
import { fetchCourses, getCurrentUser, deleteCourse, unenrollCourse, type SerializedCourse } from '@/app/actions/courseActions';

export function useCourseList() {
  const [courses, setCourses] = useState<SerializedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const [unenrollingId, setUnenrollingId] = useState<string | null>(null);
  const [unenrollError, setUnenrollError] = useState('');

  useEffect(() => {
    const initializeData = async () => {
      try {
        const allCourses = await fetchCourses();
        setCourses(allCourses);
        const userId = await getCurrentUser();
        if (userId) setCurrentUserId(userId);
      } catch (error) {
        console.error('Error initializing data:', error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    initializeData();
  }, []);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const allCourses = await fetchCourses();
      setCourses(allCourses);
    } catch (error) {
      console.error('Error refreshing courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    setDeletingId(courseId);
    setDeleteError('');
    try {
      const result = await deleteCourse(courseId);
      if (!result.success) {
        setDeleteError(result.error || 'Error al eliminar el curso');
        setDeletingId(null);
        return;
      }
      setCourses(prev => prev.filter(c => c._id !== courseId));
      setDeletingId(null);
      setCourseToDelete(null);
      (document.getElementById(`confirm_delete_${courseId}`) as HTMLDialogElement)?.close();
    } catch (error: any) {
      setDeleteError(error.message || 'Error al eliminar el curso');
      setDeletingId(null);
    }
  };

  const handleUnenrollCourse = async (courseId: string) => {
    setUnenrollingId(courseId);
    setUnenrollError('');
    try {
      const result = await unenrollCourse(courseId);
      if (!result.success) {
        setUnenrollError(result.error || 'Error al cancelar el registro');
        setUnenrollingId(null);
        return;
      }
      (document.getElementById(`confirm_unenroll_${courseId}`) as HTMLDialogElement)?.close();
      setUnenrollingId(null);
      setTimeout(() => window.location.reload(), 1000);
    } catch (error: any) {
      setUnenrollError(error.message || 'Error al cancelar el registro');
      setUnenrollingId(null);
    }
  };

  return {
    courses,
    setCourses,
    loading,
    currentUserId,
    deletingId,
    deleteError,
    courseToDelete,
    setCourseToDelete,
    unenrollingId,
    unenrollError,
    handleRefresh,
    handleDeleteCourse,
    handleUnenrollCourse,
  };
}
