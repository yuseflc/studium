/* Archivo: src\components\ui\CreateCourseModalWrapper.tsx
  Descripción: Wrapper que gestiona el estado y apertura del modal de crear curso. */

'use client';
// Wrapper sencillo para `CreateCourseModal` (preserva compatibilidad con el layout)
import CreateCourseModal from "@/components/ui/CreateCourseModal";

export default function CreateCourseModalWrapper() {
  return <CreateCourseModal onCourseCreated={() => {}} />;
}
