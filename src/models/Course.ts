import mongoose from "mongoose";

export interface ICourse {
  _id?: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  ownerId: mongoose.Types.ObjectId; // Profesor / admin que lo haya creado
  teachers: mongoose.Types.ObjectId[]; // IDs de otros profesores asociados al curso
  status: "draft" | "active" | "archived";
  subjectIds: mongoose.Types.ObjectId[]; // Referencias a las materias del curso
  enrolledStudents: mongoose.Types.ObjectId[];
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
    subjectIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
      },
    ],
    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
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

// Prevenir que se sobrescriba el modelo si ya existe
export default mongoose.models.Course ||
  mongoose.model<ICourse>("Course", CourseSchema);
