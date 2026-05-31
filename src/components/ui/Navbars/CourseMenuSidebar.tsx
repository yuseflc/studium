/* Archivo: src\components\ui\Navbars\CourseMenuSidebar.tsx
  Descripción: Sidebar con el menú de navegación y accesos rápidos del curso. */

"use client";

/**
 * Sidebar del Menú de Cursos
 * 
 * Este componente gestiona la navegación lateral hacia los distintos cursos 
 * vinculados al usuario (como propietario, profesor o alumno).
 * 
 * Cambios recientes:
 * 1. Carga de datos real: Ahora utiliza 'fetchCourses' para traer datos de MongoDB.
 * 2. Estilos unificados: Los elementos de la lista imitan el diseño de las unidades 
 *    del sidebar de contenido (bordes, fondos y efectos hover).
 * 3. Feedback visual: Añadido spinner de carga y mensaje de lista vacía.
 */

import { useState, useEffect } from "react";
import {
  Settings,
  User,
  LogOut,
  CircleArrowRight,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { fetchCourses, SerializedCourse } from "@/app/actions/courseActions";

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [courses, setCourses] = useState<SerializedCourse[]>([]);
  const [loading, setLoading] = useState(true);

  // Efecto para cargar los cursos del usuario al montar el componente
  useEffect(() => {
    async function loadCourses() {
      try {
        const data = await fetchCourses();
        setCourses(data);
      } catch (error) {
        console.error("Error loading courses:", error);
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, []);

  // --- Configuración de Animaciones ---
  const containerVariants = {
    hidden: {
      x: "-100%",
      opacity: 0
    },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.1,
        when: "beforeChildren",
        delayChildren: 0.2,
        staggerChildren: 0.1,
      },
    },
    exit: {
      x: "-100%",
      opacity: 0,
      transition: { duration: 0.3 },
      when: "afterChildren",
    }
  };

  // 3. Definir variantes para cada curso (Hijo)
  const itemVariants = {
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        y: { stiffness: 1000, velocity: -100 },
      },
    },
    hidden: {
      y: -50,
      opacity: 0,
      transition: {
        y: { stiffness: 1000 },
      },
    },
  };
  return (
    <>
      {/* Sidebar principal con animaciones de entrada lateral */}
      <motion.aside
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={`
          fixed top-0 left-0 h-full w-full lg:w-72 bg-base-100 border-r border-base-300 flex flex-col
          z-[60] transform ${open ? "translate-x-0" : "-translate-x-full"}
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:h-full shadow-sm
        `}
      >
        {/* Etiqueta de sección */}
        <div className="p-4 border-b border-base-300 bg-base-100/50">
          <h3 className="font-bold text-sm uppercase tracking-wider text-base-content/50">Cursos Disponibles</h3>
        </div>

        {/* Sección central: Listado dinámico de cursos */}
        <div className="flex-1 overflow-y-auto p-4">
          <nav className="flex flex-col gap-1">
            {loading ? (
              // Estado de carga (Spinner)
              <div className="flex flex-col items-center justify-center py-10 gap-3 text-base-content/30">
                <Loader2 className="animate-spin" size={24} />
                <span className="text-xs font-medium">Cargando cursos...</span>
              </div>
            ) : courses.length > 0 ? (
              // Mapeo de cursos reales obtenidos de la base de datos
              courses.map((curso) => (
                <motion.div
                  key={curso._id}
                  variants={itemVariants}
                >
                  <Link
                    href={`/mycourses/${curso._id}`}
                    // Estilo de tarjeta compacta similar a las unidades de curso
                    className="group relative flex items-center justify-between p-3 rounded-xl border border-base-200 bg-base-100/50 hover:bg-primary/10 hover:text-primary transition-all shadow-sm"
                  >
                    <span className="font-bold text-sm truncate max-w-[200px]">
                      {curso.title}
                    </span>
                    <CircleArrowRight size={18} className="text-base-content/40 group-hover:text-primary transition-colors flex-shrink-0" />
                  </Link>
                </motion.div>
              ))
            ) : (
              // Mensaje cuando no hay datos
              <div className="text-center py-10 px-4">
                <p className="text-xs text-base-content/50 font-medium leading-relaxed">
                  No estás inscrito en ningún curso todavía.
                </p>
              </div>
            )}
          </nav>
        </div>

        {/* Sección inferior: Enlaces de usuario y ajustes */}
        <div className="p-4 border-t border-base-300 bg-base-200/50">
          <nav className="flex flex-col gap-1">
            <Link
              href="/account/profile"
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-base-300 transition-colors text-sm font-semibold"
            >
              <User size={18} />
              <span>Mi cuenta</span>
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-base-300 transition-colors text-sm font-semibold"
            >
              <Settings size={18} />
              <span>Ajustes</span>
            </Link>
            <button
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-error/10 hover:text-error transition-colors text-sm font-semibold mt-2 w-full text-left"
            >
              <LogOut size={18} />
              <span>Cerrar sesión</span>
            </button>
          </nav>
        </div>
      </motion.aside>

    </>
  );
}