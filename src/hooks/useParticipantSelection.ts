'use client';

import { useState } from 'react';

export function useParticipantSelection(participants: { _id: string }[]) {
  const [selectedParticipants, setSelectedParticipants] = useState<Set<string>>(new Set());

  const toggleParticipant = (id: string) => {
    const newSelected = new Set(selectedParticipants);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedParticipants(newSelected);
  };

  const toggleAllParticipants = () => {
    if (selectedParticipants.size === participants.length) {
      setSelectedParticipants(new Set());
    } else {
      setSelectedParticipants(new Set(participants.map((p) => p._id)));
    }
  };

  return { selectedParticipants, toggleParticipant, toggleAllParticipants };
}
