'use client';

import { useState, useEffect } from 'react';
import { generateInviteCode, deactivateInviteCode, listInviteCodes } from '@/app/actions/courseActions';

interface InviteCode {
  code: string;
  createdAt: string;
  lastUsedAt?: string;
  active: boolean;
}

export function useInviteCodes(courseId: string) {
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const fetchCodes = async () => {
      try {
        setIsLoading(true);
        const result = await listInviteCodes(courseId);
        if (!result.success) throw new Error(result.error || 'Error al cargar los códigos');
        setCodes(result.codes || []);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCodes();
  }, [courseId]);

  const handleGenerateCode = async () => {
    try {
      setIsGenerating(true);
      const result = await generateInviteCode(courseId);
      if (!result.success || !result.code) throw new Error(result.error || 'Error al generar código');
      setCodes(prev => [...prev, { code: result.code!, createdAt: new Date().toISOString(), active: true }]);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setError('No se pudo copiar el código');
    }
  };

  const handleDeactivateCode = async (code: string) => {
    try {
      const result = await deactivateInviteCode(courseId, code);
      if (!result.success) throw new Error(result.error || 'Error al desactivar código');
      setCodes(prev => prev.map(c => c.code === code ? { ...c, active: false } : c));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const activeCodes = codes.filter(c => c.active).length;

  return {
    codes,
    isLoading,
    isGenerating,
    error,
    copied,
    activeCodes,
    handleGenerateCode,
    handleCopyCode,
    handleDeactivateCode,
  };
}
