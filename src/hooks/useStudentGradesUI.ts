'use client';

import { useState } from 'react';

interface Subject {
  _id: string;
}

export function useStudentGradesUI(subjects: Subject[]) {
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>(
    Object.fromEntries(subjects.map(s => [s._id, true]))
  );
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<{ title: string; feedback: string } | null>(null);

  const toggleSubject = (id: string) => {
    setExpandedSubjects(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleShowFeedback = (taskTitle: string, feedback: string) => {
    setSelectedFeedback({ title: taskTitle, feedback });
    setFeedbackModalOpen(true);
  };

  const handleCloseFeedback = () => {
    setFeedbackModalOpen(false);
    setSelectedFeedback(null);
  };

  return {
    expandedSubjects,
    toggleSubject,
    feedbackModalOpen,
    selectedFeedback,
    handleShowFeedback,
    handleCloseFeedback,
  };
}
