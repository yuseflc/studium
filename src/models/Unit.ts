/* Archivo: src\models\Unit.ts
  Descripción: Definición del modelo `Unit` que representa una unidad/tema dentro de un curso. */

// Modelo Unit: representa una unidad/tema dentro de un curso
// Contiene referencias a recursos y tareas asociadas
import mongoose from "mongoose";

export interface IUnit {
  _id?: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId; // Referencia al curso (desnormalización para queries rápidas)
  title: string;
  content: string;
  order: number;
  resourceIds: mongoose.Types.ObjectId[]; // Referencias a los recursos
  taskIds?: mongoose.Types.ObjectId[]; // Referencias a las tareas asociadas a la unidad
  createdAt: Date;
  updatedAt: Date;
}

const UnitSchema = new mongoose.Schema<IUnit>(
  {
    // `subjectId` removed: units are now directly associated to a course via `courseId`
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "El ID del curso es requerido"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "El título de la unidad es requerido"],
      trim: true,
      maxlength: [200, "El título no puede exceder 200 caracteres"],
    },
    content: {
      type: String,
      required: [true, "El contenido de la unidad es requerido"],
    },
    order: {
      type: Number,
      required: [true, "El orden es requerido"],
      default: 0,
    },
    resourceIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Resource",
      },
    ],
    taskIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Índices para optimizar consultas comunes
UnitSchema.index({ courseId: 1, order: 1 });
UnitSchema.index({ courseId: 1 });

// Prevenir que se sobrescriba el modelo si ya existe
export default mongoose.models.Unit ||
  mongoose.model<IUnit>("Unit", UnitSchema);
