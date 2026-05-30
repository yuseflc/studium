import mongoose from "mongoose";

export interface IResource {
  _id?: mongoose.Types.ObjectId;
  unitId: mongoose.Types.ObjectId; // Referencia a la unidad
  courseId: mongoose.Types.ObjectId; // Referencia al curso (desnormalización para queries rápidas)
  createdBy?: mongoose.Types.ObjectId; // Profesor que creó/subió el recurso
  title: string;
  type: "link" | "file" | "text";
  url?: string;
  description?: string;
  content?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema = new mongoose.Schema<IResource>(
  {
    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      required: [true, "El ID de la unidad es requerido"],
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "El ID del curso es requerido"],
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    title: {
      type: String,
      required: [true, "El nombre del recurso es requerido"],
      trim: true,
      maxlength: [200, "El título no puede exceder 200 caracteres"],
    },
    type: {
      type: String,
      enum: ["link", "file", "text"],
      required: [true, "El tipo de recurso es requerido"],
    },
    url: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      maxlength: [5000, "El texto del recurso no puede exceder 5000 caracteres"],
    },
    content: {
      type: String,
      maxlength: [5000, "El contenido del recurso no puede exceder 5000 caracteres"],
    },
  },
  {
    timestamps: true,
  }
);

// Índices para optimizar consultas comunes
ResourceSchema.index({ unitId: 1 });
ResourceSchema.index({ courseId: 1 });
ResourceSchema.index({ unitId: 1, createdAt: -1 });

// Prevenir que se sobrescriba el modelo si ya existe
export default mongoose.models.Resource ||
  mongoose.model<IResource>("Resource", ResourceSchema);
