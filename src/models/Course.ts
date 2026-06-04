/* Archivo: src\models\Course.ts
  Descripción: Modelo `Course` que define metadatos, unidades, tareas y participantes asociados a un curso. */

// Modelo Course: define cursos, códigos de invitación y metadatos del curso
import mongoose from "mongoose";

export interface IInviteCode {
  code: string; // Alfanumérico único (6 caracteres)
  createdAt: Date;
  lastUsedAt?: Date;
  active: boolean;
}

export interface ICourse {
  _id?: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  coverImage?: string; // ID de patrón de portada (ver coursePatterns.ts)
  ownerId: mongoose.Types.ObjectId; // Profesor / admin que lo haya creado
  teachers: mongoose.Types.ObjectId[]; // IDs de otros profesores asociados al curso
  status: "draft" | "active" | "archived";
  unitIds: mongoose.Types.ObjectId[]; // Referencias a las unidades del curso
  units?: any[]; // Campo virtual o poblado para la UI
  // Compatibilidad: el modelo anterior usaba Subject como agrupación principal del curso
  subjectIds?: mongoose.Types.ObjectId[];
  subjects?: any[];
  enrolledStudents: mongoose.Types.ObjectId[];
  invitationCodes: IInviteCode[]; // Array máx 10 códigos (FIFO rotation)
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new mongoose.Schema<ICourse>(
  {
    title: {
      type: String,
      required: [true, "El título del curso es requerido"],
      trim: true,
      maxlength: [200, "El título no puede exceder 200 caracteres"],
    },
    description: {
      type: String,
      maxlength: [1000, "La descripción no puede exceder 1000 caracteres"],
    },
    coverImage: {
      type: String,
      default: "circles-yellow", // ID del patrón; ver coursePatterns.ts
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "El propietario del curso es requerido"],
    },
    teachers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    status: {
      type: String,
      enum: ["draft", "active", "archived"],
      default: "draft",
    },
    unitIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Unit",
      },
    ],
    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    invitationCodes: [
      {
        code: {
          type: String,
          required: true,
          maxlength: [6, "El código debe tener 6 caracteres"],
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        lastUsedAt: {
          type: Date,
        },
        active: {
          type: Boolean,
          default: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Virtual: Enrollment count -> Número de estudiantes inscritos
CourseSchema.virtual('enrollmentCount').get(function () {
  return this.enrolledStudents?.length || 0;
});

// Habilita la inclusión de campos virtuales al convertir a JSON
CourseSchema.set('toJSON', { virtuals: true });

// Índices para optimizar consultas comunes
CourseSchema.index({ ownerId: 1 });
CourseSchema.index({ teachers: 1 });
CourseSchema.index({ status: 1 });
CourseSchema.index({ enrolledStudents: 1 });
CourseSchema.index({ ownerId: 1, status: 1 });
CourseSchema.index({ title: 'text', description: 'text' });
CourseSchema.index({ "invitationCodes.code": 1 }); // Para búsquedas rápidas por código

// Prevenir que se sobrescriba el modelo si ya existe
export default mongoose.models.Course ||
  mongoose.model<ICourse>("Course", CourseSchema);
