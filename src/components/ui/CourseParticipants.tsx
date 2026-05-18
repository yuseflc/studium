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
        <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {sortedParticipants.map((p) => (
                    <div 
                        key={p.id} 
                        className="card bg-base-100 border border-base-200 shadow-sm hover:bg-primary/5 transition-all p-1 group cursor-pointer aspect-square flex items-center justify-center"
                    >
                        <div className="flex flex-col items-center text-center gap-1 w-full p-1">
                            <div className="avatar">
                                <div className="rounded-full h-20 w-20 bg-slate-100 flex items-center justify-center overflow-hidden group-hover:border-primary/20 transition-colors">
                                    {p.avatar ? (
                                        <img src={p.avatar} alt={`${p.nombre} ${p.apellidos}`} className="object-cover" />
                                    ) : (
                                        <User size={24} className="text-slate-400" />
                                    )}
                                </div>
                            </div>
                            
                            <div className="space-y-0 w-full px-1">
                                <div className="font-bold text-md text-base-content/90 leading-tight line-clamp-2 active:overflow-visible group-hover:text-primary transition-colors">
                                    {p.nombre} {p.apellidos}
                                </div>
                                <div className="text-sm text-base-content/50 lowercase truncate mt-0.5">
                                    {p.email}
                                </div>
                                <div className="pt-1 flex justify-center">
                                    <span className={`text-xs uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md ${
                                        p.rol === "profesor" 
                                        ? "bg-primary/10 text-primary" 
                                        : "bg-base-200 text-base-content/60"
                                    }`}>
                                        {p.rol}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {sortedParticipants.length === 0 && (
                <div className="card bg-base-100 border border-base-300 p-12 text-center text-base-content/50 italic">
                    No hay participantes registrados en este curso.
                </div>
            )}
        </div>
    );
}
