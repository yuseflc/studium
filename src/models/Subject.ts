import mongoose from "mongoose";

export interface ISubject {
  _id?: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId; // Referencia al curso
  title: string;
  description?: string;
  order: number;
  unitIds: mongoose.Types.ObjectId[]; // Referencias a las unidades
  taskIds: mongoose.Types.ObjectId[]; // Referencias a las tareas
  createdAt: Date;
  updatedAt: Date;
}

const SubjectSchema = new mongoose.Schema<ISubject>(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "El ID del curso es requerido"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "El título de la materia es requerido"],
      trim: true,
      maxlength: [200, "El título no puede exceder 200 caracteres"],
    },
    description: {
      type: String,
      maxlength: [1000, "La descripción no puede exceder 1000 caracteres"],
    },
    order: {
      type: Number,
      required: [true, "El orden es requerido"],
      default: 0,
    },
    unitIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Unit",
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
SubjectSchema.index({ courseId: 1, order: 1 });
SubjectSchema.index({ courseId: 1 });

// Prevenir que se sobrescriba el modelo si ya existe
export default mongoose.models.Subject ||
  mongoose.model<ISubject>("Subject", SubjectSchema);
