"use client";

import Link from "next/link";
import { CURSOS } from "@/seed/data";
import { IconDotsVertical, IconArrowUpRight } from "@tabler/icons-react";
import CreateCourseModal from "@/components/ui/CreateCourseModal";

export default function CoursesView({ isTeacher }: { isTeacher?: boolean }) {
    return (

        <main className="p-8 bg-base-100 min-h-[calc(100vh-64px)]">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl font-bold">Catálogo de cursos</h1>
                {isTeacher && <CreateCourseModal />}
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                {CURSOS.map((c: any) => (
                    <Link key={c.id} href={`/mycourses/${c.id}`} className="card bg-base-100 shadow-xl border border-base-200 hover:shadow-2xl transition-all group relative flex flex-col">
                        <div className="relative">
                            <figure className="aspect-video relative overflow-hidden rounded-t-xl">
                                <img
                                    src={c.imagen}
                                    alt={c.nombre}
                                    className="w-full h-full object-cover transition-transform"
                                />
                                {/* Overlay para facilitar lectura del nombre */}
                                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

                                <span className="absolute bottom-2 left-4 text-[10px] text-white font-bold uppercase tracking-widest drop-shadow-md">
                                    Ignacio Miguel Mateos
                                </span>

                                <div className="absolute top-2 right-2 opacity-0 border border-white group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0 -translate-x-2 group-hover:translate-y-0 translate-y-2 bg-black/50 p-1.5 rounded-full">
                                    <IconArrowUpRight size={20} className="text-white" />
                                </div>
                            </figure>

                            {/* Avatar movido fuera del figure para evitar recortes y problemas de z-index */}
                            <div className="absolute -bottom-8 right-4 w-16 h-16 rounded-full border-4 border-base-100 overflow-hidden z-30 bg-base-300 shadow-lg">
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"
                                    alt="Ignacio Miguel Mateos"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>

                        <div className="card-body p-4 pt-10 flex flex-col relative z-10">
                            <h2 className="card-title text-lg leading-tight flex-grow">{c.nombre}</h2>
                            <div className="card-actions justify-end mt-auto" onClick={(e) => e.preventDefault()}>
                                <div className="dropdown dropdown-end">
                                    <div
                                        tabIndex={0}
                                        role="button"
                                        className="hover:bg-base-200 rounded-full transition-colors p-2 translate-x-2"
                                    >
                                        <IconDotsVertical size={20} className="text-base-content/50" />
                                    </div>
                                    <ul tabIndex={0} className="dropdown-content z-[20] menu p-2 shadow bg-base-100 rounded-box w-52 border border-base-200">
                                        <li>
                                            <Link href={`/mycourses/${c.id}`} className="flex justify-between">
                                                Acceder al curso
                                                <IconArrowUpRight size={16} />
                                            </Link>
                                        </li>
                                        <li>
                                            <button className="text-error hover:bg-error/10">
                                                Cancelar registro
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </main>
    )
}