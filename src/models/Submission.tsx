import mongoose from "mongoose";

export interface ISubmission {
  _id?: mongoose.Types.ObjectId;
  taskId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  content: string;
  files?: string[]; // File URLs
  grade?: number;
  feedback?: string;
  submissionStatus: "pending" | "submitted" | "late" | "not-submitted";
  submittedAt?: Date;
  gradedAt?: Date;
  gradedById?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SubmissionSchema = new mongoose.Schema<ISubmission>(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: [true, "Task ID is required"],
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student ID is required"],
    },
    content: {
      type: String,
      required: [true, "Submission content is required"],
    },
    files: [String],
    grade: {
      type: Number,
      min: [0, "Grade cannot be less than 0"],
    },
    feedback: String,
    submissionStatus: {
      type: String,
      enum: ["pending", "submitted", "late", "not-submitted"],
      default: "pending",
    },
    submittedAt: Date,
    gradedAt: Date,
    gradedById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes to optimize queries
SubmissionSchema.index({ taskId: 1 });
SubmissionSchema.index({ studentId: 1 });
SubmissionSchema.index({ taskId: 1, studentId: 1 }, { unique: true });
SubmissionSchema.index({ submissionStatus: 1 });
SubmissionSchema.index({ gradedById: 1 });

// Prevenir que se sobrescriba el modelo si ya existe
export default mongoose.models.Submission ||
  mongoose.model<ISubmission>("Submission", SubmissionSchema);
