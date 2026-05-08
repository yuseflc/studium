"use client";
import { useState } from "react";
import { CURSOS } from "@/seed/data";
import {
  BookOpen,
  Settings,
  User,
  LogOut,
  ChevronRight
} from "lucide-react";
import Link from "next/link";

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-72 bg-base-100 border-r border-base-300 flex flex-col
          z-40 transform ${open ? "translate-x-0" : "-translate-x-full"}
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:h-full shadow-sm
        `}
      >
        {/* Header */}
        <div className="p-3 border-b border-base-300 shadow-sm/10">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BookOpen className="text-primary" />
            <span>Mis Cursos</span>
          </h2>
        </div>

        {/* Cursos */}
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-4 px-2">
            Cursos Disponibles
          </p>
          <nav className="flex flex-col gap-1">
            {CURSOS.map((curso) => (
              <Link
                key={curso.id}
                href={`/mycourses/${curso.id}`}
                className="group flex items-center justify-between p-2 rounded-s hover:bg-base-200 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium max-w-[180px]">
                    {curso.nombre}
                  </span>
                </div>
                <ChevronRight size={14} className="text-base-content/30 group-hover:text-base-content transition-colors" />
              </Link>
            ))}
          </nav>
        </div>

        {/* Footer Links */}
        <div className="p-4 border-t border-base-300 bg-base-200/50 shadow-[0_-1px_3px_0_rgba(0,0,0,0.05)]">
          <nav className="flex flex-col gap-1">
            <Link
              href="/account/profile"
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-base-300 transition-colors text-sm font-medium"
            >
              <User size={18} />
              <span>Mi cuenta</span>
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-base-300 transition-colors text-sm font-medium"
            >
              <Settings size={18} />
              <span>Ajustes</span>
            </Link>
            <button
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-error/10 hover:text-error transition-colors text-sm font-medium mt-2 w-full text-left"
            >
              <LogOut size={18} />
              <span>Cerrar sesión</span>
            </button>
          </nav>
        </div>
      </aside>

    </>
  );
}