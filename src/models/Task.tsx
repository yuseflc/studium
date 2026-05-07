import mongoose from "mongoose";

export interface ICriteria {
  description: string;
  weight: number; // Percentage of the score
}

export interface ITask {
  _id?: mongoose.Types.ObjectId;
  title: string;
  description: string;
  type: "assignment" | "quiz" | "forum" | "project";
  courseId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  createdById: mongoose.Types.ObjectId; // Teacher or admin who created the task
  maxPoints: number;
  criteria?: ICriteria[];
  startDate: Date;
  dueDate: Date;
  allowLateSubmission: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CriteriaSchema = new mongoose.Schema<ICriteria>(
  {
    description: {
      type: String,
      required: [true, "Criterion description is required"],
      trim: true,
    },
    weight: {
      type: Number,
      required: true,
      min: [0, "Weight cannot be less than 0"],
      max: [100, "Weight cannot exceed 100"],
    },
  },
  { _id: false }
);

const TaskSchema = new mongoose.Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Task description is required"],
    },
    type: {
      type: String,
      enum: ["assignment", "quiz", "forum", "project"],
      required: true,
      default: "assignment",
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course ID is required"],
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Subject ID is required"],
    },
    createdById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Task creator is required"],
    },
    maxPoints: {
      type: Number,
      required: true,
      default: 100,
      min: [0, "Points cannot be negative"],
    },
    criteria: [CriteriaSchema],
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    allowLateSubmission: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes to optimize queries
TaskSchema.index({ courseId: 1 });
TaskSchema.index({ subjectId: 1 });
TaskSchema.index({ createdById: 1 });
TaskSchema.index({ courseId: 1, subjectId: 1 });
TaskSchema.index({ active: 1 });
TaskSchema.index({ dueDate: 1 });

// Prevenir que se sobrescriba el modelo si ya existe
export default mongoose.models.Task ||
  mongoose.model<ITask>("Task", TaskSchema);
