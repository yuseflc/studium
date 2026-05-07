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
  taskIds: mongoose.Types.ObjectId[]; // References to tasks in this subject
}

export interface ICourse {
  _id?: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  ownerId: mongoose.Types.ObjectId; // Teacher or admin who created it
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
      required: [true, "Resource title is required"],
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
      required: [true, "Unit title is required"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Unit content is required"],
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
      required: [true, "Subject title is required"],
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
      required: [true, "Course title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Course owner is required"],
    },
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

// Indexes to optimize queries
CourseSchema.index({ ownerId: 1 });
CourseSchema.index({ status: 1 });
CourseSchema.index({ enrolledStudents: 1 });
CourseSchema.index({ ownerId: 1, status: 1 });

// Prevenir que se sobrescriba el modelo si ya existe
export default mongoose.models.Course ||
  mongoose.model<ICourse>("Course", CourseSchema);
