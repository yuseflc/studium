"use client";

import { User } from "lucide-react";

interface Participante {
    id: string;
    nombre: string;
    apellidos: string;
    email: string;
    rol: string;
    avatar?: string;
}

interface CourseParticipantsProps {
    participants: Participante[];
}

export default function CourseParticipants({ participants }: CourseParticipantsProps) {
    // Ordenar: Profesor primero, luego estudiantes por el primer apellido (apellidos)
    const sortedParticipants = [...participants].sort((a, b) => {
        // Profesores primero
        if (a.rol === "profesor" && b.rol !== "profesor") return -1;
        if (a.rol !== "profesor" && b.rol === "profesor") return 1;

        // Si ambos tienen el mismo rol (o ninguno es profesor), ordenar por apellidos
        return a.apellidos.localeCompare(b.apellidos, "es", { sensitivity: "base" });
    });

    return (
        <div className="card bg-base-100 border border-base-300 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="table">
                    <thead>
                        <tr className="text-base-content/70">
                            <th>Nombre</th>
                            <th>Rol</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedParticipants.map((p) => (
                            <tr key={p.id} className="hover:bg-primary/5 transition-colors group">
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div className="avatar px-0">
                                            <div className="rounded-full h-10 w-10 bg-slate-200 flex items-center justify-center overflow-hidden border border-slate-300">
                                                {p.avatar ? (
                                                    <img src={p.avatar} alt={`${p.nombre} ${p.apellidos}`} />
                                                ) : (
                                                    <User size={20} className="text-slate-500" />
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="font-bold flex items-center gap-2 group-hover:text-primary transition-colors">
                                                {p.nombre} {p.apellidos}
                                            </div>
                                            <div className="text-sm text-base-content/60 lowercase">{p.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span className="capitalize text-base-content/60">
                                        {p.rol}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {sortedParticipants.length === 0 && (
                <div className="p-8 text-center text-base-content/50">
                    No hay participantes registrados en este curso.
                </div>
            )}
        </div>
    );
}
