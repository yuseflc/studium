'use client';

import { useEffect, useState } from 'react';
import { getCourseStructure } from '@/app/actions/courseActions';

interface TaskItem {
  _id: string;
  title: string;
  type?: string;
}

interface ResourceItem {
  _id: string;
  title: string;
  type?: string;
}

interface UnitItem {
  _id: string;
  title: string;
  resources?: ResourceItem[];
  tasks?: TaskItem[];
}

interface CourseStruct {
  units?: UnitItem[];
}

export function useCourseStructure(courseId: string | null) {
  const [structure, setStructure] = useState<CourseStruct | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) {
      setStructure(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    getCourseStructure(courseId)
      .then((result) => {
        if (result.success) {
          setStructure(result.structure || null);
        } else {
          setError(result.error || 'Error cargando curso');
        }
      })
      .catch(() => {
        setError('No se pudo cargar el contenido del curso.');
      })
      .finally(() => setLoading(false));
  }, [courseId]);

  return { structure, loading, error };
}
