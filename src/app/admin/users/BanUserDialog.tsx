/* Archivo: src\app\admin\users\BanUserDialog.tsx
   Descripción: Diálogo de confirmación para banear o desbanear usuarios del sistema. */

"use client";

import { useRef, useEffect } from "react";
import { IconBan, IconCheck } from "@tabler/icons-react";
import type { AdminUserRow } from "@/lib/api/admin-helpers";

interface Props {
  user: AdminUserRow | null; // null = diálogo cerrado
  isPending: boolean;
  onConfirm: (userId: string) => void;
  onClose: () => void;
}

export default function BanUserDialog({ user, isPending, onConfirm, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const isBanning = !user?.banned;

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
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isBanning ? "bg-warning/10" : "bg-success/10"}`}>
              {isBanning
                ? <IconBan size={28} className="text-warning" />
                : <IconCheck size={28} className="text-success" />
              }
            </div>

            <div>
              <h3 className="font-bold text-lg">
                {isBanning ? "¿Banear usuario?" : "¿Desbanear usuario?"}
              </h3>
              <p className="text-sm text-base-content/60 mt-1">
                {isBanning
                  ? "El usuario no podrá iniciar sesión hasta que sea desbaneado."
                  : "El usuario recuperará el acceso a su cuenta."}
              </p>
              <div className="mt-3 rounded-xl bg-base-200 px-4 py-2.5">
                <p className="font-semibold text-sm">{user.firstName}</p>
                <p className="text-xs text-base-content/50">{user.email}</p>
              </div>
            </div>

            <div className="w-full flex flex-col gap-2 mt-1">
              <button
                className={`btn w-full ${isBanning ? "btn-warning" : "btn-success"}`}
                disabled={isPending}
                onClick={() => onConfirm(user._id)}
              >
                {isPending
                  ? (isBanning ? "Baneando..." : "Desbaneando...")
                  : (isBanning ? "Sí, banear" : "Sí, desbanear")
                }
              </button>
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
