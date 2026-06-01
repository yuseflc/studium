"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type UserRole = "student" | "teacher" | "admin";

interface RoleInfoModalProps {
  role: UserRole;
  triggerClassName?: string;
  organizationName?: string;
}

const roleLabels: Record<UserRole, string> = {
  student: "Estudiante",
  teacher: "Profesor",
  admin: "Administrador",
};

const roleDescriptions: Record<
  UserRole,
  {
    title: string;
    intro: string;
    highlight: string;
    details: string;
  }
> = {
  student: {
    title: "Rol de estudiante",
    intro: "Tu cuenta está configurada como estudiante.",
    highlight:
      "Para crear cursos necesitas un plan de usuario de pago. El plan gratuito corresponde al rol de estudiante y no permite crear cursos.",
    details:
      "Con este rol puedes inscribirte en cursos y seguir su contenido. La creación de cursos está reservada a cuentas con plan Básico, Premium o Education.",
  },
  teacher: {
    title: "Rol de profesor",
    intro: "Tu cuenta está configurada como profesor.",
    highlight:
      "Puedes crear cursos con un plan Básico o Premium. El plan Education también habilita creación ilimitada de cursos.",
    details:
      "El plan Education solo puede asignarlo un administrador del equipo de Studium. Si ya dispones de Premium o Education, tendrás acceso a la creación y gestión de cursos.",
  },
  admin: {
    title: "Rol de administrador",
    intro: "Tu cuenta pertenece a la administración del equipo de Studium.",
    highlight:
      "Puedes gestionar usuarios y asignar el plan Education a profesores cuando sea necesario.",
    details:
      "Además de las capacidades de profesor, este rol permite supervisar y administrar el acceso a planes dentro del equipo.",
  },
};

export default function RoleInfoModal({ role, triggerClassName, organizationName }: RoleInfoModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const roleLabel = roleLabels[role];
  const content = roleDescriptions[role];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const openModal = () => {
    dialogRef.current?.showModal();
  };

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className={triggerClassName}
        aria-label={`Ver información del rol ${roleLabel}`}
      >
        {roleLabel}
      </button>

      {isMounted &&
        createPortal(
          <dialog ref={dialogRef} className="modal modal-middle">
            <div className="modal-box max-w-2xl border border-base-300 bg-base-100 text-base-content shadow-2xl">
              <div className="flex items-start justify-between gap-4 border-b border-base-300 pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-base-content/50">
                    Información de acceso
                  </p>
                  <h3 className="mt-2 text-2xl font-bold">{content.title}</h3>
                  <p className="mt-2 text-sm text-base-content/70">{content.intro}</p>
                </div>
                <form method="dialog">
                  <button
                    type="submit"
                    className="btn btn-ghost btn-sm btn-circle"
                    aria-label="Cerrar información del rol"
                  >
                    ✕
                  </button>
                </form>
              </div>

              <div className="space-y-4 py-5 text-sm leading-relaxed text-base-content/80">
                {organizationName && (
                  <div className="rounded-2xl bg-primary/10 border border-primary/20 p-4 flex items-center gap-3">
                    <span className="text-xs font-bold uppercase tracking-widest text-primary">Organización</span>
                    <span className="font-semibold text-base-content">{organizationName}</span>
                  </div>
                )}
                <div className="rounded-2xl bg-base-200/60 p-4">
                  <p className="font-semibold text-base-content">{content.highlight}</p>
                </div>

                <p>{content.details}</p>
              </div>

              <div className="modal-action justify-between">
                <a href="/pricing" className="btn btn-primary">
                  Ver planes y precios
                </a>
                <form method="dialog">
                  <button type="submit" className="btn btn-ghost">
                    Cerrar
                  </button>
                </form>
              </div>
            </div>
          </dialog>,
          document.body
        )}
    </>
  );
}
