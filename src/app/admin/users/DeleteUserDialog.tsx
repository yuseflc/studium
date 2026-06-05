/* Archivo: src\app\admin\users\DeleteUserDialog.tsx
   Descripción: Diálogo de confirmación con botón hold-to-delete para eliminar usuarios del sistema. */

"use client";

import { useRef, useState, useEffect } from "react";
import { IconAlertTriangle, IconTrash } from "@tabler/icons-react";
import type { AdminUserRow } from "@/lib/api/admin-helpers";

interface HoldButtonProps {
  onComplete: () => void;
  isPending: boolean;
}

// Botón que requiere mantener pulsado HOLD_DURATION ms para confirmar la acción
function HoldToDeleteButton({ onComplete, isPending }: HoldButtonProps) {
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedRef = useRef(false);
  // Progreso en ref para evitar llamar a onComplete dentro de un updater de estado
  const rawProgressRef = useRef(0);
  const HOLD_DURATION = 2000;
  const INTERVAL = 30;

  function startHold() {
    if (isPending || completedRef.current) return;
    intervalRef.current = setInterval(() => {
      rawProgressRef.current += (INTERVAL / HOLD_DURATION) * 100;
      if (rawProgressRef.current >= 100 && !completedRef.current) {
        completedRef.current = true;
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        setProgress(100);
        onComplete();
      } else {
        setProgress(rawProgressRef.current);
      }
    }, INTERVAL);
  }

  function cancelHold() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (!completedRef.current) {
      rawProgressRef.current = 0;
      setProgress(0);
    }
  }

  // Limpieza del intervalo al desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const label = isPending
    ? "Eliminando..."
    : progress > 0
    ? "Suelta para cancelar..."
    : "Mantén para eliminar";

  return (
    <button
      className="btn btn-error w-full relative overflow-hidden select-none"
      onMouseDown={startHold}
      onMouseUp={cancelHold}
      onMouseLeave={cancelHold}
      onTouchStart={(e) => { e.preventDefault(); startHold(); }}
      onTouchEnd={cancelHold}
      disabled={isPending}
    >
      <div
        className="absolute inset-y-0 left-0 bg-white/25 transition-none pointer-events-none"
        style={{ width: `${progress}%` }}
      />
      <span className="relative z-10 flex items-center gap-2">
        <IconTrash size={15} />
        {label}
      </span>
    </button>
  );
}

interface Props {
  user: AdminUserRow | null; // null = diálogo cerrado
  isPending: boolean;
  onConfirm: (userId: string) => void;
  onClose: () => void;
}

export default function DeleteUserDialog({ user, isPending, onConfirm, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Abre o cierra el modal nativo según si hay un usuario seleccionado
  useEffect(() => {
    if (user) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [user]);

  return (
    <dialog ref={dialogRef} className="modal" onClose={onClose}>
      {user && (
        <div className="modal-box max-w-sm">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-full bg-error/10 flex items-center justify-center">
              <IconAlertTriangle size={28} className="text-error" />
            </div>

            <div>
              <h3 className="font-bold text-lg">¿Eliminar usuario?</h3>
              <p className="text-sm text-base-content/60 mt-1">
                Esta acción es <span className="font-semibold text-error">irreversible</span>. Se eliminarán permanentemente todos los datos de:
              </p>
              <div className="mt-3 rounded-xl bg-base-200 px-4 py-2.5">
                <p className="font-semibold text-sm">{user.firstName}</p>
                <p className="text-xs text-base-content/50">{user.email}</p>
              </div>
            </div>

            <div className="w-full flex flex-col gap-2 mt-1">
              <HoldToDeleteButton onComplete={() => onConfirm(user._id)} isPending={isPending} />
              <button className="btn btn-ghost w-full" onClick={onClose} disabled={isPending}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>cerrar</button>
      </form>
    </dialog>
  );
}
