import mongoose from "mongoose";

export interface IUnit {
  _id?: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId; // Referencia a la materia
  courseId: mongoose.Types.ObjectId; // Referencia al curso (desnormalización para queries rápidas)
  title: string;
  content: string;
  order: number;
  resourceIds: mongoose.Types.ObjectId[]; // Referencias a los recursos
  createdAt: Date;
  updatedAt: Date;
}

const UnitSchema = new mongoose.Schema<IUnit>(
  {
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: [true, "El ID de la materia es requerido"],
      index: true,
    },
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
  },
  {
    timestamps: true,
  }
);

// Índices para optimizar consultas comunes
UnitSchema.index({ subjectId: 1, order: 1 });
UnitSchema.index({ courseId: 1 });
UnitSchema.index({ subjectId: 1 });

// Prevenir que se sobrescriba el modelo si ya existe
export default mongoose.models.Unit ||
  mongoose.model<IUnit>("Unit", UnitSchema);
