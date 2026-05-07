import mongoose from "mongoose";

export interface IProfile {
  lastName?: string;
  profilePicture?: string;
  bio?: string;
}

export interface IUser {
  _id?: mongoose.Types.ObjectId;
  email: string;
  firstName: string;
  password: string;
  role: "student" | "teacher" | "admin";
  active: boolean;
  profile: IProfile;
  enrolledCourses: mongoose.Types.ObjectId[]; // Courses where user is enrolled (student)
  createdCourses: mongoose.Types.ObjectId[]; // Courses created by user (teacher/admin)
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters"],
      maxlength: [100, "First name cannot exceed 100 characters"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Does not return password by default
    },
    role: {
      type: String,
      enum: ["student", "teacher", "admin"],
      default: "student",
    },
    active: {
      type: Boolean,
      default: true,
    },
    profile: {
      lastName: {
        type: String,
        trim: true,
        maxlength: [100, "Last name cannot exceed 100 characters"],
      },
      profilePicture: String,
      bio: {
        type: String,
        maxlength: [500, "Bio cannot exceed 500 characters"],
      },
    },
    enrolledCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    createdCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Indexes to optimize queries
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ enrolledCourses: 1 });
UserSchema.index({ createdCourses: 1 });

// Prevenir que se sobrescriba el modelo si ya existe
export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
