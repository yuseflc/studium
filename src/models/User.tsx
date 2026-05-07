import mongoose from "mongoose";

export interface IUser {
  _id?: mongoose.Types.ObjectId;
  email: string;
  nombre: string;
  pwd: string;
  rol: "estudiante" | "profesor" | "admin";
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "El email es requerido"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Por favor proporciona un email válido",
      ],
    },
    nombre: {
      type: String,
      required: [true, "El nombre es requerido"],
      trim: true,
      minlength: [2, "El nombre debe tener al menos 2 caracteres"],
      maxlength: [100, "El nombre no puede exceder 100 caracteres"],
    },
    pwd: {
      type: String,
      required: [true, "La contraseña es requerida"],
      minlength: [6, "La contraseña debe tener al menos 6 caracteres"],
      select: false, // No retorna la contraseña por defecto
    },
    rol: {
      type: String,
      enum: ["estudiante", "profesor", "admin"],
      default: "estudiante",
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Agrega automáticamente createdAt y updatedAt
  }
);

// Prevenir que se sobrescriba el modelo si ya existe
export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
