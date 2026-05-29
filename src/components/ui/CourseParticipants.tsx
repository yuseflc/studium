"use client";

import { User } from "lucide-react";
import Link from "next/link";

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
    courseId: string;
}

export default function CourseParticipants({ participants, courseId }: CourseParticipantsProps) {
    const teachers = participants.filter(p => p.rol === "profesor");
    const students = participants
        .filter(p => p.rol !== "profesor")
        .sort((a, b) => a.apellidos.localeCompare(b.apellidos, "es", { sensitivity: "base" }));

    return (
        <div className="space-y-8">
            {/* Profesores */}
            {teachers.length > 0 && (
                <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                        <h3 className="text-md font-bold text-base-content/50 uppercase tracking-wide pl-1">Profesores</h3>
                        {/* Linea separatoria */}
                        <div className="h-0.5 w-full bg-base-200 rounded-full" />
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                        {teachers.map((p) => (
                            <Link 
                                key={p.id} 
                                href={`/account/profile?id=${p.id}&courseId=${courseId}`}
                                className="card bg-base-100 border border-base-200 shadow-sm hover:bg-primary/5 transition-all p-0 group cursor-pointer aspect-square flex items-center justify-center text-current no-underline"
                            >
                                <div className="flex flex-col items-center text-center gap-1 w-full p-0">
                                    <div className="avatar">
                                        <div className="rounded-full h-18 w-18 bg-slate-100 flex items-center justify-center overflow-hidden group-hover:border-primary/20 transition-colors">
                                            {p.avatar ? (
                                                <img src={p.avatar} alt={`${p.nombre} ${p.apellidos}`} className="object-cover" />
                                            ) : (
                                                <User size={24} className="text-slate-400" />
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-0 w-full px-1">
                                        <div className="font-bold text-sm text-base-content/90 leading-tight line-clamp-2 active:overflow-visible group-hover:text-primary transition-colors">
                                            {p.nombre} {p.apellidos}
                                        </div>
                                        <div className="text-xs text-base-content/50 lowercase truncate mt-0.5">
                                            {p.email}
                                        </div>
                                        <div className="pt-1 flex justify-center">
                                            {/* Uso text[10px] ya que xs es el menor en talwnd y queda demasado grande */}
                                            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-base-200 text-base-content/60">
                                                {p.rol}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Estudiantes */}
            {students.length > 0 && (
                <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                        <h3 className="text-md font-bold text-base-content/50 uppercase tracking-wide pl-1">Estudiantes</h3>
                        {/* Linea separatoria */}
                        <div className="h-0.5 w-full bg-base-200 rounded-full" />
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                        {students.map((p) => (
                            <Link 
                                key={p.id} 
                                href={`/account/profile?id=${p.id}&courseId=${courseId}`}
                                className="card bg-base-100 border border-base-200 shadow-sm hover:bg-primary/5 transition-all p-0 group cursor-pointer aspect-square flex items-center justify-center text-current no-underline"
                            >
                                <div className="flex flex-col items-center text-center gap-1 w-full p-0">
                                    <div className="avatar">
                                        <div className="rounded-full h-18 w-18 bg-slate-100 flex items-center justify-center overflow-hidden group-hover:border-primary/20 transition-colors">
                                            {p.avatar ? (
                                                <img src={p.avatar} alt={`${p.nombre} ${p.apellidos}`} className="object-cover" />
                                            ) : (
                                                <User size={24} className="text-slate-400" />
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-0 w-full px-1">
                                        <div className="font-bold text-sm text-base-content/90 leading-tight line-clamp-2 active:overflow-visible group-hover:text-primary transition-colors">
                                            {p.nombre} {p.apellidos}
                                        </div>
                                        <div className="text-xs text-base-content/50 lowercase truncate mt-0.5">
                                            {p.email}
                                        </div>
                                        <div className="pt-1 flex justify-center">
                                            {/* Uso text[10px] ya que xs es el menor en talwnd y queda demasado grande */}
                                            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-base-200 text-base-content/60">
                                                {p.rol}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
            
            {participants.length === 0 && (
                <div className="card bg-base-100 border border-base-300 p-12 text-center text-base-content/50 italic">
                    No hay participantes registrados en este curso.
                </div>
            )}
        </div>
    );
}
