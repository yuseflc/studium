import mongoose, { CallbackWithoutResultAndOptionalError } from "mongoose";

// Interfaz para los criterios de evaluación
export interface ICriteria {
  description: string; // Descripción del criterio
  weight: number; // Porcentaje de la puntuación
}

// Interfaz para las tareas
export interface ITask {
  _id?: mongoose.Types.ObjectId;
  title: string; // Título de la tarea
  description: string; // Descripción de la tarea
  type: "assignment" | "quiz" | "forum" | "project"; // Tipo: tarea, cuestionario, foro, proyecto
  courseId: mongoose.Types.ObjectId; // ID del curso
  unitId?: mongoose.Types.ObjectId; // ID de la unidad (opcional durante migración)
  createdById: mongoose.Types.ObjectId; // ID del profesor o administrador que creó la tarea
  maxPoints: number; // Puntuación máxima
  criteria?: ICriteria[]; // Criterios de evaluación
  startDate: Date; // Fecha de inicio
  dueDate?: Date; // Fecha de entrega opcional
  allowLateSubmission: boolean; // Permite entregas tardías
  active: boolean; // Activa
  image?: string; // URL o base64 de la imagen
  priority?: "low" | "medium" | "high"; // Prioridad de la tarea
  createdAt: Date; // Fecha de creación
  updatedAt: Date; // Fecha de actualización
}

// Esquema de criterios de evaluación
const CriteriaSchema = new mongoose.Schema<ICriteria>(
  {
    description: {
      type: String,
      required: [true, "La descripción del criterio es requerida"], // Descripción requerida
      trim: true, // Elimina espacios al inicio y final
    },
    weight: {
      type: Number,
      required: true, // Requerido
      min: [0, "El peso no puede ser menor que 0"], // Validación de mínimo
      max: [100, "El peso no puede exceder 100"], // Validación de máximo
    },
  },
  { _id: false } // No genera _id para subdocumentos
);

// Esquema de tareas
const TaskSchema = new mongoose.Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, "El título de la tarea es requerido"], // Título requerido
      trim: true, // Elimina espacios al inicio y final
      maxlength: [200, "El título no puede exceder 200 caracteres"], // Límite de caracteres
    },
    description: {
      type: String,
      required: [true, "La descripción de la tarea es requerida"], // Descripción requerida
    },
    type: {
      type: String,
      enum: ["assignment", "quiz", "forum", "project"], // Valores permitidos: tarea, cuestionario, foro, proyecto
      required: true, // Requerido
      default: "assignment", // Valor por defecto: tarea
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course", // Referencia al modelo Course
      required: [true, "El ID del curso es requerido"], // ID de curso requerido
    },
    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      required: false, // durante la migración puede ser opcional; acciones validarán presencia
      index: true,
    },
    createdById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Referencia al modelo User
      required: [true, "El creador de la tarea es requerido"], // Creador requerido
    },
    maxPoints: {
      type: Number,
      required: true, // Requerido
      default: 100, // Valor por defecto: 100
      min: [0, "Los puntos no pueden ser negativos"], // Validación de mínimo
    },
    criteria: [CriteriaSchema], // Array de criterios
    startDate: {
      type: Date,
      required: true, // Requerido
      default: Date.now, // Valor por defecto: fecha actual
    },
    dueDate: {
      type: Date,
      required: false,
    },
    allowLateSubmission: {
      type: Boolean,
      default: false, // Valor por defecto: false
    },
    active: {
      type: Boolean,
      default: true, // Valor por defecto: true
    },
    image: {
      type: String,
      required: false,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
  },
  {
    timestamps: true, // Habilita createdAt y updatedAt automáticamente
  }
);

// Middleware pre-guardado: Validar fechas
TaskSchema.pre('save', function () {
  if (this.dueDate && this.startDate && this.dueDate <= this.startDate) {
    throw new Error('La fecha de entrega debe ser posterior a la fecha de inicio');
  }
});

// Middleware pre-búsqueda: Filtrar tareas inactivas
TaskSchema.pre(/^find/, function (this: mongoose.Query<ITask[], ITask>) {
  this.find({ active: { $ne: false } }); // Excluye tareas inactivas
});

// Virtual: Está vencida
TaskSchema.virtual('isOverdue').get(function () {
  if (!this.dueDate) {
    return false;
  }

  return new Date() > this.dueDate && !this.allowLateSubmission; // True si fecha actual supera fecha de entrega y no permite entregas tardías
});

// Habilitar virtuales en toJSON
TaskSchema.set('toJSON', { virtuals: true });

// Índices para optimizar consultas
TaskSchema.index({ courseId: 1 }); // Índice por ID de curso
TaskSchema.index({ createdById: 1 }); // Índice por creador
TaskSchema.index({ unitId: 1 }); // Índice por unidad
TaskSchema.index({ courseId: 1, unitId: 1 }); // Índice compuesto por curso y unidad
TaskSchema.index({ active: 1 }); // Índice por estado activo
TaskSchema.index({ dueDate: 1 }); // Índice por fecha de entrega
TaskSchema.index({ courseId: 1, dueDate: 1 }); // Índice compuesto por curso y fecha de entrega
TaskSchema.index({ title: 'text', description: 'text' }); // Índice de texto para búsqueda por título y descripción

// Prevenir que se sobrescriba el modelo si ya existe
if (mongoose.models.Task) {
  delete mongoose.models.Task;
}

export default mongoose.model<ITask>("Task", TaskSchema); // Exporta el modelo Task