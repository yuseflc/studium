/* Archivo: src\models\Submission.ts
  Descripción: Modelo `Submission` que representa la entrega de un estudiante a una tarea, nota y feedback. */

// Modelo Submission: representa entregas de tareas realizadas por estudiantes
// Incluye metadatos, archivos subidos y calificaciones asociadas
import mongoose from "mongoose";

// Define la interfaz para las entregas de tareas
export interface ISubmission {
  _id?: mongoose.Types.ObjectId;
  taskId: mongoose.Types.ObjectId; // ID de la tarea
  studentId: mongoose.Types.ObjectId; // ID del estudiante
  content: string; // Contenido de la entrega
  files?: string[]; // URLs de los archivos
  grade?: number; // Calificación
  feedback?: string; // Retroalimentación
  submissionStatus: "pending" | "submitted" | "late" | "not-submitted"; // Estado de la entrega
  submittedAt?: Date; // Fecha de entrega
  gradedAt?: Date; // Fecha de calificación
  gradedById?: mongoose.Types.ObjectId; // ID de quien calificó
  createdAt: Date; // Fecha de creación
  updatedAt: Date; // Fecha de actualización
}

// Esquema de entregas de tareas
const SubmissionSchema = new mongoose.Schema<ISubmission>(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task", // Referencia al modelo Task
      required: [true, "El ID de la tarea es requerido"], // ID de tarea requerido
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Referencia al modelo User
      required: [true, "El ID del estudiante es requerido"], // ID de estudiante requerido
    },
    content: {
      type: String,
      required: [true, "El contenido de la entrega es requerido"], // Contenido requerido
    },
    files: [String], // Archivos adjuntos
    grade: {
      type: Number,
      min: [0, "La calificación no puede ser menor que 0"], // Validación de mínimo
    },
    feedback: String, // Retroalimentación
    submissionStatus: {
      type: String,
      enum: ["pending", "submitted", "late", "not-submitted"], // Valores permitidos: pendiente, entregado, tarde, no-entregado
      default: "pending", // Valor por defecto: pendiente
    },
    submittedAt: Date, // Fecha de entrega
    gradedAt: Date, // Fecha de calificación
    gradedById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Referencia al modelo User
    },
  },
  {
    timestamps: true, // Habilita createdAt y updatedAt automáticamente
  }
);

// Virtual: Días desde la entrega
SubmissionSchema.virtual('daysSinceSubmission').get(function () {
  if (!this.submittedAt) return null; // Si no hay fecha de entrega, retorna null
  const days = Math.floor((Date.now() - new Date(this.submittedAt).getTime()) / (1000 * 60 * 60 * 24));
  return days; // Retorna días transcurridos
});

// Virtual: Está calificado
SubmissionSchema.virtual('isGraded').get(function () {
  return this.submissionStatus === 'submitted' && this.grade !== undefined; // Verifica si está entregado y tiene calificación
});

// Configuración para incluir virtuales en JSON
SubmissionSchema.set('toJSON', { virtuals: true });

// Índices para optimizar consultas
SubmissionSchema.index({ taskId: 1 }); // Índice por ID de tarea
SubmissionSchema.index({ studentId: 1 }); // Índice por ID de estudiante
SubmissionSchema.index({ taskId: 1, studentId: 1 }, { unique: true }); // Índice compuesto único por tarea y estudiante
SubmissionSchema.index({ submissionStatus: 1 }); // Índice por estado de entrega
SubmissionSchema.index({ gradedById: 1 }); // Índice por quien calificó
SubmissionSchema.index({ submittedAt: 1 }); // Índice por fecha de entrega
SubmissionSchema.index({ taskId: 1, submissionStatus: 1 }); // Índice compuesto por tarea y estado

// Prevenir que se sobrescriba el modelo si ya existe
export default mongoose.models.Submission ||
  mongoose.model<ISubmission>("Submission", SubmissionSchema); // Exporta el modelo Submission