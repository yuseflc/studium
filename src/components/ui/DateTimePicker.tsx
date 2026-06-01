/* Archivo: src\components\ui\DateTimePicker.tsx
  Descripción: Selector de fecha y hora con calendario propio que sigue la estética del proyecto (daisyUI). */

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon } from "lucide-react";

interface DateTimePickerProps {
  value: string; // formato datetime-local: "YYYY-MM-DDTHH:mm"
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"];
const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function parseValue(value: string): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toLocalValue(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function DateTimePicker({ value, onChange, placeholder = "Selecciona fecha y hora", disabled }: DateTimePickerProps) {
  const selected = useMemo(() => parseValue(value), [value]);
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => selected ?? new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  // Cierra el calendario al hacer clic fuera
  useEffect(() => {
    if (!open) return;
    const handleClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Sincroniza el mes visible cuando cambia el valor externo
  useEffect(() => {
    if (selected) setViewDate(selected);
  }, [selected]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // Construye la cuadrícula del mes (semana empieza en lunes)
  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const startOffset = (firstDay.getDay() + 6) % 7; // lunes = 0
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    return cells;
  }, [year, month]);

  const today = new Date();
  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  const handleSelectDay = (day: Date) => {
    const base = selected ?? new Date();
    const next = new Date(day);
    next.setHours(base.getHours(), base.getMinutes(), 0, 0);
    onChange(toLocalValue(next));
  };

  const handleTimeChange = (hours: number, minutes: number) => {
    const base = selected ?? viewDate;
    const next = new Date(base);
    next.setHours(hours, minutes, 0, 0);
    onChange(toLocalValue(next));
  };

  const displayLabel = selected
    ? `${selected.getDate()} de ${MONTHS[selected.getMonth()]} de ${selected.getFullYear()} · ${pad(selected.getHours())}:${pad(selected.getMinutes())}`
    : placeholder;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={`input input-bordered flex w-full items-center justify-between gap-2 border-base-300 bg-base-100 text-left focus:outline-none ${open ? "border-warning" : ""} ${disabled ? "pointer-events-none opacity-50" : "hover:border-warning"} ${selected ? "text-base-content" : "text-base-content/40"}`}
      >
        <span className="flex items-center gap-2 truncate">
          <CalendarIcon size={16} className="shrink-0 text-base-content/40" />
          <span className="truncate text-sm">{displayLabel}</span>
        </span>
        <ChevronRight size={16} className={`shrink-0 text-base-content/30 transition-transform ${open ? "rotate-90" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 z-50 mt-2 w-[16rem] rounded-xl border border-base-300 bg-base-100 p-3 shadow-xl">
          {/* Cabecera con navegación de mes */}
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setViewDate(new Date(year, month - 1, 1))}
              className="btn btn-ghost btn-xs btn-circle"
              aria-label="Mes anterior"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-semibold text-base-content">
              {MONTHS[month]} {year}
            </span>
            <button
              type="button"
              onClick={() => setViewDate(new Date(year, month + 1, 1))}
              className="btn btn-ghost btn-xs btn-circle"
              aria-label="Mes siguiente"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Cabecera de días de la semana */}
          <div className="grid grid-cols-7 gap-0.5">
            {WEEKDAYS.map((day) => (
              <span key={day} className="flex h-7 items-center justify-center text-[11px] font-semibold text-base-content/40">
                {day}
              </span>
            ))}
          </div>

          {/* Cuadrícula de días */}
          <div className="grid grid-cols-7 gap-0.5">
            {days.map((day, index) => {
              if (!day) return <span key={`empty-${index}`} />;
              const isSelected = selected && isSameDay(day, selected);
              const isToday = isSameDay(day, today);
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`flex h-7 w-7 items-center justify-center rounded-md text-[13px] transition-colors ${
                    isSelected
                      ? "bg-primary font-bold text-primary-content shadow-sm"
                      : isToday
                        ? "bg-base-200 font-semibold text-primary"
                        : "text-base-content hover:bg-base-200"
                  }`}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          {/* Selector de hora */}
          <div className="mt-3 flex items-center justify-between gap-2 rounded-lg border border-base-300 bg-base-200/40 px-2.5 py-1.5">
            <span className="flex items-center gap-1.5 text-xs font-medium text-base-content/70">
              <Clock size={14} className="text-base-content/40" />
              Hora
            </span>
            <div className="flex items-center gap-1">
              <select
                value={selected ? selected.getHours() : 0}
                onChange={(event) => handleTimeChange(Number(event.target.value), selected?.getMinutes() ?? 0)}
                className="select select-bordered select-xs border-base-300 bg-base-100"
              >
                {Array.from({ length: 24 }).map((_, h) => (
                  <option key={h} value={h}>{pad(h)}</option>
                ))}
              </select>
              <span className="font-bold text-base-content/50">:</span>
              <select
                value={selected ? selected.getMinutes() : 0}
                onChange={(event) => handleTimeChange(selected?.getHours() ?? 0, Number(event.target.value))}
                className="select select-bordered select-xs border-base-300 bg-base-100"
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <option key={i} value={i * 5}>{pad(i * 5)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Acción de cierre */}
          <button type="button" onClick={() => setOpen(false)} className="btn btn-primary btn-xs mt-2 w-full">
            Listo
          </button>
        </div>
      )}
    </div>
  );
}
