"use client";

import { COURSE_PATTERNS, getPatternById } from "@/lib/coursePatterns";

interface CoursePatternPickerProps {
  selectedId: string;
  onChange: (id: string) => void;
}

export default function CoursePatternPicker({ selectedId, onChange }: CoursePatternPickerProps) {
  // Resuelve el objeto patrón completo a partir del ID almacenado en el formulario
  const selected = getPatternById(selectedId);

  return (
    <div className="space-y-3">
      <span className="label-text font-medium text-base">Imagen del curso</span>

      {/* Vista previa del patrón actualmente seleccionado */}
      <div
        className="w-full h-20 rounded-xl border border-base-300"
        style={selected.style}
        title={selected.label}
      />

      {/* Rejilla de swatches — hover y selected comparten el mismo estilo visual */}
      <div className="grid grid-cols-6 gap-2">
        {COURSE_PATTERNS.map((pattern) => {
          const isSelected = pattern.id === selectedId;
          return (
            <button
              key={pattern.id}
              type="button"
              title={pattern.label}
              onClick={() => onChange(pattern.id)}
              className={`h-10 rounded-lg border-2 transition-all ${
                isSelected
                  ? "border-primary ring-2 ring-primary/40 scale-105"
                  : "border-transparent hover:border-primary hover:ring-2 hover:ring-primary/40 hover:scale-105"
              }`}
              style={pattern.style}
            />
          );
        })}
      </div>
    </div>
  );
}
