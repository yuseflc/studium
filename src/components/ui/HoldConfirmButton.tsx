"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/** Duración en ms que hay que sostener el botón para confirmar */
const HOLD_DURATION_MS = 3000;

interface HoldConfirmButtonProps {
  onConfirm: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  holdText?: string;
}

/**
 * COMPONENTE: Botón de confirmación con "hold to confirm"
 * 
 * Lo usamos para acciones peligrosas como eliminar un curso o materia.
 * El usuario debe mantener presionado 3 segundos para ejecutar la acción.
 * Si suelta antes, se cancela. Muestra una barra de progreso roja.
 */
export default function HoldConfirmButton({
  onConfirm,
  disabled,
  children,
  className = "",
  holdText = "Suelta para cancelar"
}: HoldConfirmButtonProps) {
  // progress: 0 = sin presionar, 1 = completamente presionado (acción ejecutada)
  const [progress, setProgress] = useState(0);

  // Referencias para no perder valores entre renders y no causar re-renders innecesarios
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const pressingRef = useRef(false);

  /**
   * Cancela el progreso actual.
   * Se llama cuando el usuario suelta el botón, sale del área o se cancela la acción.
   */
  const cancel = useCallback(() => {
    if (!pressingRef.current) return; // si no está presionado, no hago nada

    pressingRef.current = false;

    // Detengo la animación si existe
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    // Reseteo timestamps y progreso visual
    startRef.current = null;
    setProgress(0);
  }, []);

  /**
   * Actualiza el progreso mientras se mantiene presionado.
   * Se llama recursivamente con requestAnimationFrame para una animación suave.
   */
  const tick = useCallback(() => {
    // Si ya no está presionado o no tengo timestamp de inicio, salgo
    if (!pressingRef.current || startRef.current === null) return;

    // Calculo cuánto tiempo ha pasado desde que empezó a presionar
    const elapsed = Date.now() - startRef.current;
    // Calculo el progreso (0 a 1), no puede pasar de 1
    const p = Math.min(elapsed / HOLD_DURATION_MS, 1);
    setProgress(p);

    // Si llegó a 1 (completó los 3 segundos)
    if (p >= 1) {
      // Reseteo el estado interno
      pressingRef.current = false;
      rafRef.current = null;
      startRef.current = null;
      setProgress(0); // reinicio visual antes de ejecutar la acción
      onConfirm(); // EJECUTO LA ACCIÓN PELIGROSA
      return;
    }

    // Si no completó, sigo animando en el próximo frame
    rafRef.current = requestAnimationFrame(tick);
  }, [onConfirm]);

  /**
   * Inicia el contador de presión.
   * Se llama cuando el usuario hace click/touch sobre el botón.
   */
  const start = useCallback(() => {
    // Si ya está presionado o el botón está deshabilitado, ignoro
    if (pressingRef.current || disabled) return;

    pressingRef.current = true;
    startRef.current = Date.now(); // guardo el momento exacto en que empezó a presionar
    rafRef.current = requestAnimationFrame(tick); // arranco la animación
  }, [tick, disabled]);

  /**
   * Limpieza al desmontar el componente.
   * Muy importante para evitar memory leaks con animaciones.
   */
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const isActive = progress > 0; // si hay progreso activo, cambio el texto del botón

  return (
    <button
      type="button"
      disabled={disabled}
      className={`relative overflow-hidden select-none touch-none transition-colors ${className}`}
      style={{
        userSelect: "none", // evito que se seleccione texto accidentalmente
        color: isActive ? "white" : undefined, // cuando está activo, texto blanco
      }}
      // Eventos para mouse
      onMouseDown={(e) => { if (e.button === 0) start(); }} // solo botón izquierdo
      onMouseUp={cancel}
      onMouseLeave={cancel} // si el mouse sale del botón mientras presiona, cancelo
      // Eventos para touch (móvil)
      onTouchStart={(e) => { e.preventDefault(); start(); }} // evito scroll mientras presiona
      onTouchEnd={cancel}
      // Evito menú contextual al hacer click derecho
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Capa de relleno rojo que crece horizontalmente según el progreso */}
      <span
        aria-hidden="true" // solo decorativo, no lo leen lectores de pantalla
        className="absolute inset-0 bg-red-700 origin-left"
        style={{
          transform: `scaleX(${progress})`, // escala de 0 a 1 en el eje X
          transition: "none", // sin transición porque yo controlo la animación con RAF
        }}
      />
      {/* Contenido real del botón, por encima de la capa roja */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {isActive ? holdText : children}
      </span>
    </button>
  );
}
