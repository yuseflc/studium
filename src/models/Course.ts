import mongoose from "mongoose";

export interface IResource {
  _id?: mongoose.Types.ObjectId;
  title: string;
  type: "link" | "file" | "text";
  url?: string;
  description?: string;
}

export interface IUnit {
  _id?: mongoose.Types.ObjectId;
  title: string;
  content: string;
  order: number;
  resources?: IResource[];
}

export interface ISubject {
  _id?: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  order: number;
  units: IUnit[];
  taskIds: mongoose.Types.ObjectId[]; // Referencia a las IDs de las tareas asociadas a esta materia
}

export interface ICourse {
  _id?: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  ownerId: mongoose.Types.ObjectId; // Profesor / admin que lo haya creado (ID del usuario)
  teachers: mongoose.Types.ObjectId[]; // IDs de los profesores asociados al curso (además del owner)
  status: "draft" | "active" | "archived";
  subjects: ISubject[];
  enrolledStudents: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema = new mongoose.Schema<IResource>(
  {
    title: {
      type: String,
      required: [true, "El nombre del recurso es requerido"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["link", "file", "text"],
      required: true,
    },
    url: String,
    description: String,
  },
  { _id: true }
);

const UnitSchema = new mongoose.Schema<IUnit>(
  {
    title: {
      type: String,
      required: [true, "El título de la unidad es requerido"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "El contenido de la unidad es requerido"],
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
    resources: [ResourceSchema],
  },
  { _id: true }
);

const SubjectSchema = new mongoose.Schema<ISubject>(
  {
    title: {
      type: String,
      required: [true, "El título de la materia es requerido"],
      trim: true,
    },
    description: String,
    order: {
      type: Number,
      required: true,
      default: 0,
    },
    units: {
      type: [UnitSchema],
      default: [],
    },
    taskIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
      },
    ],
  },
  { _id: true }
);

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
    subjects: {
      type: [SubjectSchema],
      default: [],
    },
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

// Indices para optimizar consultas comunes
CourseSchema.index({ ownerId: 1 });
CourseSchema.index({ teachers: 1 });
CourseSchema.index({ status: 1 });
CourseSchema.index({ enrolledStudents: 1 });
CourseSchema.index({ ownerId: 1, status: 1 });
CourseSchema.index({ title: 'text', description: 'text' });

// Prevenir que se sobrescriba el modelo si ya existe
export default mongoose.models.Course ||
  mongoose.model<ICourse>("Course", CourseSchema);
